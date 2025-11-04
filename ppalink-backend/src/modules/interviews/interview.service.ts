import prisma from '../../config/db';
import { ApplicationStatus, InterviewMode, NotificationType } from '@prisma/client';
import sgMail from '@sendgrid/mail';
import env from '../../config/env';
import { createNotification } from '../notifications/notification.service';
import type { Server } from 'socket.io';
import { onlineUsers } from '../../config/socket';

interface ScheduleInterviewInput {
  applicationId: string;
  agencyId: string; // For security check
  scheduledAt: string; // ISO string from frontend
  mode: InterviewMode;
  location?: string; // URL for REMOTE, address for INPERSON
  details?: string; // Extra notes for the interview
  io: Server;
}

/**
 * Schedules a new interview for an application.
 * Also updates the application status to INTERVIEW.
 */
export async function scheduleInterview(data: ScheduleInterviewInput) {
  const { applicationId, agencyId, scheduledAt, mode, location, details, io } = data;

  const result = await prisma.$transaction(async (tx) => {
    const application = await tx.application.findFirst({
      where: { id: applicationId, position: { agencyId: agencyId } },
      select: { 
        id: true, 
        candidateId: true, 
        position: { select: { id: true, title: true } },
        status: true
      },
    });

    if (!application) {
      throw new Error('Application not found or you do not have permission to modify it.');
    }

    const interview = await tx.interview.create({
      data: { applicationId, scheduledAt: new Date(scheduledAt), mode, location, details },
    });

    const updatedApplication = await tx.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.INTERVIEW },
      select: { id: true, status: true, positionId: true, candidateId: true }
    });
    
    const candidateProfile = await tx.candidateProfile.findUnique({
        where: { id: application.candidateId },
        select: { 
          firstName: true,
          user: { select: { id: true, email: true } } 
        }
    });

    const agency = await tx.agency.findUnique({ where: { id: agencyId }, select: { name: true } });

    if (candidateProfile?.user && agency) {
        const notificationLink = `/dashboard/candidate/applications/${application.id}/status`;
        await createNotification({
            userId: candidateProfile.user.id,
            message: `You have an interview with ${agency.name} for the ${application.position.title} position.`,
            link: notificationLink,
            type: NotificationType.GENERIC,
        }, io);
    }

    const agencyMembers = await tx.agencyMember.findMany({
      where: { agencyId },
      select: { userId: true },
    });
    const onlineMemberSocketIds = agencyMembers
      .map(member => onlineUsers.get(member.userId))
      .filter(Boolean) as string[];
    if (onlineMemberSocketIds.length > 0) {
      io.to(onlineMemberSocketIds).emit('pipeline:application_updated', {
        jobId: application.position.id,
        application: updatedApplication,
      });
    }

    return { interview, candidateProfile, agency, application };
  });

  const { interview, candidateProfile, agency, application } = result;
  if (candidateProfile?.user?.email && agency) {
    const { firstName } = candidateProfile;
    const { title: positionTitle } = application.position;
    const { name: agencyName } = agency;
    const scheduledDateTime = new Date(interview.scheduledAt);
    const formattedDate = scheduledDateTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = scheduledDateTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    const applicationLink = `${env.FRONTEND_URL}/dashboard/candidate/applications/${application.id}/status`;

    let locationInfo = '';
    if (interview.mode === 'REMOTE' && interview.location) {
      locationInfo = `This will be a video call. Please use the following link to join: <a href="${interview.location}">${interview.location}</a>`;
    } else if (interview.mode === 'INPERSON' && interview.location) {
      locationInfo = `The interview will be held at the following address: <strong>${interview.location}</strong>`;
    } else if (interview.mode === 'PHONE') {
      locationInfo = `This will be a phone interview. Please ensure you are available at the scheduled time; we will call you.`;
    }

    const msg = {
      to: candidateProfile.user.email,
      from: env.SMTP_FROM_EMAIL!,
      subject: `Interview Invitation: ${positionTitle} at ${agencyName}`,
      html: `
        <p>Hello ${firstName},</p>
        <p>Following your application for the <strong>${positionTitle}</strong> position, we would like to invite you for an interview.</p>
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${formattedTime}</p>
        <p><strong>Mode:</strong> ${interview.mode}</p>
        <p>${locationInfo}</p>
        ${interview.details ? `<p><strong>Additional Information:</strong><br/>${interview.details.replace(/\n/g, '<br/>')}</p>` : ''}
        <p>Please confirm your availability or request to reschedule by replying to this email.</p>
        <p>You can view your application and interview details here: <a href="${applicationLink}">View Application</a></p>
        <p>We look forward to speaking with you.</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Interview invitation sent to ${candidateProfile.user.email}`);
    } catch (error: any) {
      console.error("Error sending interview invitation email:", error.response?.body);
    }
  }
  
  return result.interview;
}