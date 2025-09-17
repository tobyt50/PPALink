import { ApplicationStatus, NotificationType } from '@prisma/client';
import type { Server } from 'socket.io';
import prisma from '../../config/db';
import { createNotification } from '../notifications/notification.service';

interface CreateApplicationInput {
  positionId: string;
  candidateId: string;
  agencyId: string;
}

export async function createApplication(data: CreateApplicationInput) {
  const { positionId, candidateId, agencyId } = data;

  const position = await prisma.position.findFirst({
    where: {
      id: positionId,
      agencyId: agencyId,
    },
  });

  if (!position) {
    throw new Error('Position not found or does not belong to this agency.');
  }

  const existingApplication = await prisma.application.findFirst({
    where: {
      positionId,
      candidateId,
    },
  });

  if (existingApplication) {
    throw new Error('This candidate has already been added to this job pipeline.');
  }

  return prisma.application.create({
    data: {
      positionId,
      candidateId,
      status: ApplicationStatus.REVIEWING,
    },
  });
}

export async function updateApplication(
  applicationId: string,
  agencyId: string,
  data: { status?: ApplicationStatus; notes?: string },
  io: Server
) {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      position: {
        agencyId: agencyId,
      },
    },
    // We need to include this data to create the notification
    include: {
      candidate: { select: { userId: true } },
      position: { select: { title: true } },
    }
  });

  if (!application) {
    throw new Error('Application not found or you do not have permission to update it.');
  }

  const updatedApplication = await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: data.status,
      notes: data.notes,
    },
  });

  // If the status was changed, create and emit the notification
  if (data.status && data.status !== application.status) {
    await createNotification({
      userId: application.candidate.userId,
      message: `Your application for "${application.position.title}" was updated to ${data.status}.`,
      link: '/dashboard/candidate/applications',
      type: NotificationType.GENERIC, // Specify the type as GENERIC
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
    where: {
      positionId,
      candidateId: candidateProfile.id,
    },
  });

  if (existingApplication) {
    throw new Error('You have already applied for this position.');
  }

  return prisma.application.create({
    data: {
      positionId,
      candidateId: candidateProfile.id,
      status: ApplicationStatus.APPLIED,
    },
  });
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