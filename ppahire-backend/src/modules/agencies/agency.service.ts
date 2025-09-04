import { AgencyRole } from '@prisma/client';
import prisma from '../../config/db';
import { UpdateAgencyProfileInput } from './agency.types';

/**
 * Checks if a user is an authorized member (Owner or Manager) of a specific agency.
 * Throws an error if not authorized.
 * @param userId The ID of the user.
 * @param agencyId The ID of the agency.
 */
export async function checkAgencyMembership(userId: string, agencyId: string) {
  const member = await prisma.agencyMember.findFirst({
    where: {
      userId,
      agencyId,
      role: { in: [AgencyRole.OWNER, AgencyRole.MANAGER] },
    },
  });

  if (!member) {
    throw new Error('Forbidden: User is not an authorized member of this agency.');
  }
  return member;
}


/**
 * Retrieves an agency's profile by its ID.
 * @param agencyId The ID of the agency.
 */
export async function getAgencyById(agencyId: string) {
  return prisma.agency.findUniqueOrThrow({
    where: { id: agencyId },
  });
}

/**
 * Updates an agency's profile.
 * @param agencyId The ID of the agency to update.
 * @param data The data to update.
 */
export async function updateAgencyProfile(agencyId: string, data: UpdateAgencyProfileInput) {
  return prisma.agency.update({
    where: { id: agencyId },
    data,
  });
}