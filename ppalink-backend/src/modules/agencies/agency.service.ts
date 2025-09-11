import { AgencyRole, ShortlistSource } from '@prisma/client';
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

export async function getAgencyByUserId(userId: string) {
 const agencyMember
  = await prisma.agencyMember.findFirst({
   where: { userId },
   include: { agency: true }, // Include the full agency details
 });

 if (!agencyMember) {
   throw new Error('User is not associated with any agency.');
 }

 return agencyMember.agency;
}

/**
 * Searches for candidate profiles based on a dynamic set of filter criteria.
 * @param queryParams - An object containing potential filter keys like stateId, skills, etc.
 */
export async function searchCandidates(queryParams: any) {
  const { stateId, nyscBatch, skills, isRemote, isOpenToReloc } = queryParams;

  const where: any = {
    AND: [], // We use AND to combine all active filters
  };

  // --- Build the query dynamically ---

  if (stateId) {
    where.AND.push({ primaryStateId: parseInt(stateId, 10) });
  }

  if (nyscBatch) {
    where.AND.push({ nyscBatch: { equals: nyscBatch, mode: 'insensitive' } });
  }
  
  if (isRemote === 'true') {
    where.AND.push({ isRemote: true });
  }
  
  if (isOpenToReloc === 'true') {
    where.AND.push({ isOpenToReloc: true });
  }

  // Handle skills: search for candidates with at least one of the provided skills
  if (skills) {
    const skillsArray = skills.split(',').map((skill: string) => skill.trim());
    if (skillsArray.length > 0) {
      where.AND.push({
        skills: {
          some: {
            skill: {
              name: {
                in: skillsArray,
                mode: 'insensitive',
              },
            },
          },
        },
      });
    }
  }

  return prisma.candidateProfile.findMany({
    where,
    // Include related data to display on the search result cards
    include: {
      user: {
        select: { email: true }, // Select only non-sensitive fields
      },
      skills: {
        include: {
          skill: true,
        },
      },
    },
    take: 50, // Add pagination limit to prevent fetching too much data
  });
}

/**
 * Shortlists a candidate for a given agency.
 * Prevents duplicate entries.
 * @param agencyId The ID of the agency shortlisting the candidate.
 * @param candidateProfileId The ID of the candidate's profile to shortlist.
 */
export async function shortlistCandidate(agencyId: string, candidateProfileId: string) {
  // First, check if this candidate is already shortlisted by this agency
  const existingShortlist = await prisma.shortlist.findFirst({
    where: {
      agencyId: agencyId,
      candidateId: candidateProfileId,
    },
  });

  if (existingShortlist) {
    // If they are already shortlisted, we can just return the existing record.
    return existingShortlist;
  }

  // If not, create a new Shortlist entry
  const newShortlist = await prisma.shortlist.create({
    data: {
      agencyId: agencyId,
      candidateId: candidateProfileId,
      source: ShortlistSource.SEARCH, // The source is from the search page
    },
  });

  return newShortlist;
}

/**
 * Fetches all candidate profiles shortlisted by a specific agency.
 * @param agencyId The ID of the agency.
 */
export async function getShortlistedCandidates(agencyId: string) {
  const shortlists = await prisma.shortlist.findMany({
    where: {
      agencyId: agencyId,
    },
    // Include the full candidate profile for each shortlist entry
    include: {
      candidate: {
        // Also include the candidate's skills for the card display
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Show the most recently shortlisted first
    },
  });

  // The result is an array of Shortlist objects, each containing a 'candidate' property.
  // We want to return just the array of candidate profiles.
  return shortlists.map(shortlist => shortlist.candidate);
}

/**
 * Removes a candidate from an agency's shortlist.
 * @param agencyId The ID of the agency.
 * @param candidateProfileId The ID of the candidate's profile to remove.
 */
export async function removeShortlist(agencyId: string, candidateProfileId: string) {
  const result = await prisma.shortlist.deleteMany({
    where: {
      agencyId: agencyId,
      candidateId: candidateProfileId,
    },
  });

  // deleteMany returns a count of deleted records.
  // We can check if any records were actually deleted.
  if (result.count === 0) {
    throw new Error('Shortlist entry not found or already removed.');
  }

  return result;
}