import prisma from '../../config/db';
import { UpdateCandidateProfileInput } from './candidate.types';

/**
 * Fetches a candidate's profile using their user ID.
 * Throws an error if the profile is not found.
 * @param userId - The ID of the user whose profile is being fetched.
 */
export async function getCandidateProfileByUserId(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    // Optionally include related data in the future, e.g., skills, certificates
    // include: { skills: true, certificates: true }
  });

  if (!profile) {
    throw new Error('Candidate profile not found');
  }

  return profile;
}

/**
 * Updates a candidate's profile using their user ID and the provided data.
 * @param userId - The ID of the user whose profile is being updated.
 * @param data - An object containing the fields to update.
 */
export async function updateCandidateProfile(userId: string, data: UpdateCandidateProfileInput) {
  // Ensure the profile exists before trying to update
  const existingProfile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!existingProfile) {
    throw new Error('Candidate profile not found');
  }

  const updatedProfile = await prisma.candidateProfile.update({
    where: { userId },
    data,
  });

  return updatedProfile;
}

/**
 * Fetches a single candidate profile by its primary key (ID).
 * This is for public viewing by agencies.
 * @param profileId - The ID of the CandidateProfile.
 */
export async function getCandidateProfileById(profileId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { id: profileId },
    // We include skills here so agencies can see them
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!profile) {
    throw new Error('Candidate profile not found.');
  }

  return profile;
}