import prisma from '../../config/db';
import { InterviewMode, NotificationType } from '@prisma/client';
import { createNotification } from '../notifications/notification.service';
import type { Server } from 'socket.io';

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
    const application = await tx.application.findFirst({
      where: {
        id: applicationId,
        position: { agencyId: agencyId },
      },
      select: { id: true, candidateId: true, position: { select: { title: true } } },
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
    await tx.application.update({
      where: { id: applicationId },
      data: { status: 'INTERVIEW' },
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

    return interview;
  });
}