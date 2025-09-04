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