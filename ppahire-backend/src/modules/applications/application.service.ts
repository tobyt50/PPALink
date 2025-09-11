import { ApplicationStatus } from '@prisma/client';
import prisma from '../../config/db';

interface CreateApplicationInput {
  positionId: string;
  candidateId: string; // This is the CandidateProfile ID
  agencyId: string;
}

/**
 * Creates an application, linking a candidate to a position.
 * Checks for existing applications to prevent duplicates.
 * @param data - The input data containing positionId, candidateId, and agencyId.
 */
export async function createApplication(data: CreateApplicationInput) {
  const { positionId, candidateId, agencyId } = data;

  // Security check: Ensure the position belongs to the agency creating the application
  const position = await prisma.position.findFirst({
    where: {
      id: positionId,
      agencyId: agencyId,
    },
  });

  if (!position) {
    throw new Error('Position not found or does not belong to this agency.');
  }

  // Check if an application for this candidate and position already exists
  const existingApplication = await prisma.application.findFirst({
    where: {
      positionId,
      candidateId,
    },
  });

  if (existingApplication) {
    throw new Error('This candidate has already been added to this job pipeline.');
  }

  // Create the new application record
  return prisma.application.create({
    data: {
      positionId,
      candidateId,
      // When an agency adds a candidate, it's like they are already being reviewed.
      status: ApplicationStatus.REVIEWING, 
    },
  });
}

/**
 * Updates the status of an application.
 * Verifies that the agency making the request owns the job associated with the application.
 * @param applicationId The ID of the application to update.
 * @param agencyId The ID of the agency making the request (for security).
 * @param newStatus The new status for the application.
 */
/**
 * Updates the status and/or notes of an application.
 * Verifies that the agency making the request owns the job associated with the application.
 * @param applicationId The ID of the application to update.
 * @param agencyId The ID of the agency making the request (for security).
 * @param data An object containing the new status and/or notes.
 */
export async function updateApplication(
  applicationId: string,
  agencyId: string,
  data: { status?: ApplicationStatus; notes?: string }
) {
  // Security check remains the same
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      position: {
        agencyId: agencyId,
      },
    },
  });

  if (!application) {
    throw new Error('Application not found or you do not have permission to update it.');
  }

  // Update the application with the provided data (status, notes, or both)
  return prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: data.status, // Will be undefined if not provided, so Prisma ignores it
      notes: data.notes,   // Will be undefined if not provided, so Prisma ignores it
    },
  });
}
  
/**
 * Creates an application submitted by a candidate.
 * @param positionId The ID of the job position.
 * @param userId The ID of the user applying.
 */
export async function createCandidateApplication(positionId: string, userId: string) {
  // 1. Get the candidate's profile ID from their user ID
  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!candidateProfile) {
    throw new Error('Candidate profile not found for the current user.');
  }

  // 2. Check if an application for this candidate and position already exists
  const existingApplication = await prisma.application.findFirst({
    where: {
      positionId,
      candidateId: candidateProfile.id,
    },
  });

  if (existingApplication) {
    throw new Error('You have already applied for this position.');
  }

  // 3. Create the new application with status 'APPLIED'
  return prisma.application.create({
    data: {
      positionId,
      candidateId: candidateProfile.id,
      status: ApplicationStatus.APPLIED,
    },
  });
}

/**
 * Fetches a single, detailed application by its ID.
 * Includes the full Position and CandidateProfile.
 * Verifies that the agency making the request owns the associated job.
 * @param applicationId The ID of the application to fetch.
 * @param agencyId The ID of the agency making the request (for security).
 */
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
              id: true, // This is the main User ID
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
