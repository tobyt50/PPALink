import prisma from '../../config/db';
import { ApplicationStatus, InterviewMode, NotificationType } from '@prisma/client';
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
  // 1. Use a transaction to ensure both the interview is created AND the application is updated.
  return prisma.$transaction(async (tx) => {
    // a. Security Check: Ensure the application belongs to the agency scheduling the interview.
    // Updated select to include position.id for socket emit
    const application = await tx.application.findFirst({
      where: {
        id: applicationId,
        position: { agencyId: agencyId },
      },
      select: { 
        id: true, 
        candidateId: true, 
        position: { select: { id: true, title: true } },  // Added id for emit
        status: true  // To compare for logging if needed
      },
    });
    if (!application) {
      throw new Error('Application not found or you do not have permission to modify it.');
    }
    // b. Create the new Interview record.
    const interview = await tx.interview.create({
      data: {
        applicationId,
        scheduledAt: new Date(scheduledAt),
        mode,
        location,
        details,
      },
    });
    // c. Update the parent application's status to 'INTERVIEW'.
    const updatedApplication = await tx.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.INTERVIEW },
      select: {  // Select updated app for emit
        id: true,
        status: true,
        positionId: true,
        candidateId: true
      }
    });
    // d. Create a notification for the candidate
    const candidateProfile = await tx.candidateProfile.findUnique({
        where: { id: application.candidateId },
        include: { user: { select: { id: true } } }
    });
    const agency = await tx.agency.findUnique({ where: { id: agencyId }, select: { name: true } });
    if (candidateProfile && agency) {
      const notificationLink = `/dashboard/candidate/applications/${application.id}/status`;
        await createNotification({
            userId: candidateProfile.user.id,
            message: `You have an interview with ${agency.name} for the ${application.position.title} position.`,
            link: notificationLink,
            type: NotificationType.GENERIC,
        }, io);
    }

    // NEW: Emit socket update to agency members (mirroring application.service.ts)
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
        application: updatedApplication,  // Partial updated app
      });
    }

    return interview;
  });
}