import { ApplicationStatus, NotificationType } from '@prisma/client';
import type { Server } from 'socket.io';
import prisma from '../../config/db';
import { logActivity } from '../activity/activity.service';
import { createNotification } from '../notifications/notification.service';

interface CreateApplicationInput {
  positionId: string;
  candidateId: string;
  agencyId: string;
}

export async function createApplication(data: CreateApplicationInput) {
  const { positionId, candidateId, agencyId } = data;

  const position = await prisma.position.findFirst({
    where: { id: positionId, agencyId: agencyId },
  });

  if (!position) {
    throw new Error('Position not found or does not belong to this agency.');
  }

  const existingApplication = await prisma.application.findFirst({
    where: { positionId, candidateId },
  });

  if (existingApplication) {
    throw new Error('This candidate has already been added to this job pipeline.');
  }

  const application = await prisma.application.create({
    data: {
      positionId,
      candidateId,
      status: ApplicationStatus.REVIEWING,
    },

  });
  
  // --- Detailed Logging ---
  const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { ownerUserId: true } });
  if (agency) {
    await logActivity(agency.ownerUserId, 'application.add_candidate', {
      applicationId: application.id,
      candidateId: candidateId,
      positionId: positionId,
      source: 'manual_add',
    });
  }
  // --- End of Logging ---

  return application;
}

export async function updateApplication(
  applicationId: string,
  agencyId: string,
  data: { status?: ApplicationStatus; notes?: string },
  io: Server
) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, position: { agencyId: agencyId } },
    include: {
      candidate: { select: { userId: true, id: true } }, // Include candidateId
      position: { select: { title: true, id: true } }, // Include positionId
    }
  });

  if (!application) {
    throw new Error('Application not found or you do not have permission to update it.');
  }

  const updatedApplication = await prisma.application.update({
    where: { id: applicationId },
    data: { status: data.status, notes: data.notes },
  });

  // --- Detailed Logging ---
  const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { ownerUserId: true } });
  if (agency) {
    if (data.status && data.status !== application.status) {
      await logActivity(agency.ownerUserId, 'application.pipeline_move', {
        applicationId: updatedApplication.id,
        candidateId: application.candidate.id,
        positionId: application.position.id,
        fromStatus: application.status,
        toStatus: updatedApplication.status,
      });
    }
    if (data.notes && data.notes !== application.notes) {
       await logActivity(agency.ownerUserId, 'application.update_notes', {
        applicationId: updatedApplication.id,
      });
    }
  }
  // --- End of Logging ---

  if (data.status && data.status !== application.status) {
    await createNotification({
      userId: application.candidate.userId,
      message: `Your application for "${application.position.title}" was updated to ${data.status}.`,
      link: '/dashboard/candidate/applications',
      type: NotificationType.GENERIC,
    }, io);
  }

  return updatedApplication;
}
  
export async function createCandidateApplication(positionId: string, userId: string) {
  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!candidateProfile) {
    throw new Error('Candidate profile not found for the current user.');
  }

  const existingApplication = await prisma.application.findFirst({
    where: { positionId, candidateId: candidateProfile.id },
  });

  if (existingApplication) {
    throw new Error('You have already applied for this position.');
  }

  const application = await prisma.application.create({
    data: {
      positionId,
      candidateId: candidateProfile.id,
      status: ApplicationStatus.APPLIED,
    },
  });

  // --- Detailed Logging ---
  await logActivity(userId, 'application.submit', {
    applicationId: application.id,
    positionId: positionId,
    source: 'job_board',
  });
  // --- End of Logging ---

  return application;
}

export async function getApplicationDetails(applicationId: string, agencyId: string) {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      position: {
        agencyId: agencyId,
      },
    },
    include: {
      position: true,
      candidate: {
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          workExperiences: {
            orderBy: {
              startDate: 'desc',
            },
          },
          education: {
            orderBy: {
              startDate: 'desc',
            },
          },
          user: {
            select: {
              id: true,
              email: true,
            }
          },
        },
      },
    },
  });

  if (!application) {
    throw new Error('Application not found or you do not have permission to view it.');
  }

  return application;
}