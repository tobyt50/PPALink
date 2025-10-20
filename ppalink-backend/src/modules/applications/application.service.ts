import { ApplicationStatus, NotificationType } from '@prisma/client';
import type { Server } from 'socket.io';
import { ioInstance, onlineUsers } from '../../config/socket';
import prisma from '../../config/db';
import { logActivity } from '../activity/activity.service';
import { createNotification } from '../notifications/notification.service';
import { calculateMatchScore } from '../scoring/scoring.service';

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

  if (data.status && data.status !== application.status) {
    await createNotification({
      userId: application.candidate.userId,
      message: `Your application for "${application.position.title}" was updated to ${data.status}.`,
      link: '/dashboard/candidate/applications',
      type: NotificationType.GENERIC,
    }, io);
  }

  const agencyMembers = await prisma.agencyMember.findMany({
    where: { agencyId },
    select: { userId: true },
  });
  
  const onlineMemberSocketIds = agencyMembers
    .map(member => onlineUsers.get(member.userId))
    .filter(Boolean) as string[];

  // If there are any online members, broadcast the update.
  if (onlineMemberSocketIds.length > 0) {
    io.to(onlineMemberSocketIds).emit('pipeline:application_updated', {
      jobId: updatedApplication.positionId,
      application: updatedApplication,
    });
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

  // Calculate the match score BEFORE creating the application record
  const matchScore = await calculateMatchScore(candidateProfile.id, positionId);

  // Create the application, now including the calculated score
  const application = await prisma.application.create({
    data: {
      positionId,
      candidateId: candidateProfile.id,
      status: ApplicationStatus.APPLIED,
      matchScore: matchScore, // STORE THE SCORE
    },
  });

  await logActivity(userId, 'application.submit', {
    applicationId: application.id,
    positionId: positionId,
    source: 'job_board',
    matchScore: matchScore,
  });

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
              avatarKey: true,
            }
          },
          quizAttempts: {
        where: { passed: true },
        include: {
          skill: true,
        },
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

/**
 * Deletes a single application.
 * Includes a security check to ensure the user is part of the correct agency.
 * @param applicationId The ID of the application to delete.
 * @param agencyId The ID of the agency performing the action.
 * @param actorId The ID of the user performing the action (for auditing).
 */
export async function deleteApplication(applicationId: string, agencyId: string, actorId: string) {
  // Find the application to ensure it belongs to the correct agency before deleting
  const applicationToDelete = await prisma.application.findFirstOrThrow({
    where: {
      id: applicationId,
      position: {
        agencyId: agencyId,
      },
    },
  });

  const result = await prisma.application.delete({
    where: { id: applicationId },
  });

  await logActivity(actorId, 'application.delete', {
    applicationId: applicationToDelete.id,
    candidateId: applicationToDelete.candidateId,
    positionId: applicationToDelete.positionId,
  });

  return result;
}

/**
 * Fetches a single application for the CANDIDATE who owns it.
 * Includes a security check.
 * @param applicationId The ID of the application to fetch.
 * @param userId The ID of the logged-in candidate.
 */
export async function getApplicationForCandidate(applicationId: string, userId: string) {
  // Find the candidate profile ID associated with the user
  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!candidateProfile) throw new Error('Candidate profile not found.');

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      candidateId: candidateProfile.id, // Security check: ensure this candidate owns the application
    },
    include: {
      position: {
        include: {
          agency: { select: { name: true } },
          skills: {
            include: {
              skill: true,
            },
          },
        },
      },
      interviews: {
        orderBy: {
          scheduledAt: 'desc',
        },
      },
      offers: {
        orderBy: {
            startDate: 'desc'
        }
      }
    },
  });

  if (!application) {
    throw new Error('Application not found or you do not have permission to view it.');
  }

  return application;
}