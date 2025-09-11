import { PositionStatus, PositionVisibility } from '@prisma/client';
import prisma from '../../config/db';
import { CreateJobPositionInput, UpdateJobPositionInput } from './job.types';

/**
 * Creates a new job position for a given agency.
 * @param agencyId The ID of the agency creating the job.
 * @param data The job position details.
 */
export async function createJobPosition(agencyId: string, data: CreateJobPositionInput) {
  return prisma.position.create({
    data: {
      ...data,
      agencyId, // Link the position to the agency
    },
  });
}

/**
 * Retrieves all job positions for a specific agency.
 * @param agencyId The ID of the agency.
 */
export async function getJobsByAgencyId(agencyId: string) {
  return prisma.position.findMany({
    where: { agencyId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Retrieves a single job position by its ID, ensuring it belongs to the correct agency.
 * @param jobId The ID of the job position.
 * @param agencyId The ID of the agency that owns the job.
 */
export async function getJobById(jobId: string, agencyId: string) {
  return prisma.position.findUniqueOrThrow({
    where: { id: jobId, agencyId }, // CRITICAL: Ensures agency owns the job
  });
}

/**
 * Updates a job position.
 * @param jobId The ID of the job to update.
 * @param agencyId The ID of the agency that owns the job.
 * @param data The data to update.
 */
export async function updateJobPosition(jobId: string, agencyId: string, data: UpdateJobPositionInput) {
  // The where clause ensures an agency can't update another agency's job
  return prisma.position.update({
    where: { id: jobId, agencyId },
    data,
  });
}

/**
 * Deletes a job position.
 * @param jobId The ID of the job to delete.
 * @param agencyId The ID of the agency that owns the job.
 */
export async function deleteJobPosition(jobId: string, agencyId: string) {
  return prisma.position.delete({
    where: { id: jobId, agencyId },
  });
}

/**
 * Retrieves a single job position by its ID, ensuring it belongs to the correct agency.
 * Throws an error if the job is not found or does not belong to the agency.
 * @param jobId The ID of the job position.
 * @param agencyId The ID of the agency that should own the job.
 */
export async function getJobByIdAndAgency(jobId: string, agencyId: string) {
  const job = await prisma.position.findUnique({
    where: { 
      id: jobId,
      agencyId: agencyId, // This condition is crucial for security
    },
  });

  if (!job) {
    throw new Error('Job not found or you do not have permission to view it.');
  }

  return job;
}

/**
 * Fetches a single job position by its ID, including all associated candidate applications.
 * Ensures the job belongs to the requesting agency for security.
 * @param jobId The ID of the job position.
 * @param agencyId The ID of the agency that owns the job.
 */
export async function getJobWithApplicants(jobId: string, agencyId: string) {
  const job = await prisma.position.findUnique({
    where: {
      id: jobId,
      agencyId: agencyId, // Security check
    },
    include: {
      // This is the key: include all applications for this job
      applications: {
        // For each application, include the full candidate profile
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              summary: true,
              verificationLevel: true, // Include the verification level
              skills: {
                include: {
                  skill: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc', // Show newest applicants first
        },
      },
    },
  });

  if (!job) {
    throw new Error('Job not found or you do not have permission to view it.');
  }
  return job;
}

/**
 * Fetches all publicly visible and open job postings for candidates to browse.
 * Includes agency name for display.
 */
export async function getPublicJobs() {
  return prisma.position.findMany({
    where: {
      visibility: PositionVisibility.PUBLIC,
      status: PositionStatus.OPEN,
    },
    include: {
      // Include the agency's name to show who posted the job
      agency: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Show the newest jobs first
    },
  });
}

/**
 * Fetches a single public job by its ID.
 * Ensures the job is PUBLIC and OPEN.
 * @param jobId The ID of the job position.
 */
export async function getPublicJobById(jobId: string) {
  const job = await prisma.position.findFirst({
    where: {
      id: jobId,
      visibility: PositionVisibility.PUBLIC,
      status: PositionStatus.OPEN,
    },
    include: {
      agency: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  if (!job) {
    throw new Error('Job not found or is no longer available.');
  }
  return job;
}