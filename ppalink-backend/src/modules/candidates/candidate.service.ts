import { ApplicationStatus } from '@prisma/client';
import prisma from '../../config/db';
import { UpdateCandidateProfileInput } from './candidate.types';

// Helper function to find or create skills and return their IDs for relation mapping.
async function connectOrCreateSkills(skillNames: string[]) {
  // Find skills that already exist (case-insensitive)
  const skills = await prisma.skill.findMany({
    where: { name: { in: skillNames, mode: 'insensitive' } },
  });

  // Determine which skill names are new
  const existingSkillNames = new Set(skills.map(s => s.name.toLowerCase()));
  const newSkillsToCreate = skillNames
    .filter(name => !existingSkillNames.has(name.toLowerCase()))
    .map(name => ({ name, slug: name.toLowerCase().replace(/\s+/g, '-') }));

  // Create any new skills in a single batch query
  if (newSkillsToCreate.length > 0) {
    await prisma.skill.createMany({
      data: newSkillsToCreate,
      skipDuplicates: true, // Safeguard against race conditions
    });
  }

  // Get all skill records (existing + newly created)
  const allSkills = await prisma.skill.findMany({
    where: { name: { in: skillNames, mode: 'insensitive' } },
  });

  // Map to the format required for the CandidateSkill 'create' operation.
  // We now include the required `level` field with a default value of 1.
  return allSkills.map(skill => ({
    skillId: skill.id,
    level: 1, // Default skill level to satisfy the schema
  }));
}

/**
 * Fetches a candidate's profile using their user ID.
 * Throws an error if the profile is not found.
 * @param userId - The ID of the user whose profile is being fetched.
 */
export async function getCandidateProfileByUserId(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: {
      workExperiences: { orderBy: { startDate: 'desc' } },
      education: { orderBy: { startDate: 'desc' } },
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!profile) {
    throw new Error('Candidate profile not found');
  }

  return profile;
}

/**
 * Updates a candidate's profile using their user ID and the provided data.
 * Handles nested skills properly.
 * @param userId - The ID of the user whose profile is being updated.
 * @param data - An object containing the fields to update.
 */
export async function updateCandidateProfile(
  userId: string,
  data: UpdateCandidateProfileInput
) {
  // Ensure the profile exists before trying to update
  const existingProfile = await prisma.candidateProfile.findUnique({ where: { userId } });
  if (!existingProfile) {
    throw new Error('Candidate profile not found');
  }

  // Separate skills from the rest of the profile data
  const { skills: skillNames, ...profileData } = data;

  const updatedProfile = await prisma.candidateProfile.update({
    where: { userId },
    data: {
      ...profileData,
      // If skills are provided, replace the existing ones with the new set.
      skills: skillNames
        ? {
            deleteMany: {}, // First, remove all existing skill connections
            create: await connectOrCreateSkills(skillNames), // Then, create the new connections with the required `level` field
          }
        : undefined, // If no skills array is sent, do nothing
    },
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
      workExperiences: { orderBy: { startDate: 'desc' } },
      education: { orderBy: { startDate: 'desc' } },
    },
  });

  if (!profile) {
    throw new Error('Candidate profile not found.');
  }

  return profile;
}

/**
 * Fetches all applications for a specific candidate.
 * @param user The authenticated user object.
 */
export async function getMyApplications(userId: string) {
  // First, we need to find the candidate's PROFILE ID from their USER ID.
  const candidateProfile = await prisma.candidateProfile.findUnique({
    where: { userId: userId },
    select: { id: true }, // We only need the ID
  });

  if (!candidateProfile) {
    throw new Error('Candidate profile not found for the current user.');
  }

  // Now, find all applications linked to that profile ID.
  return prisma.application.findMany({
    where: {
      candidateId: candidateProfile.id,
    },
    // Include the details of the position for each application
    include: {
      position: {
        // Also include the agency name for display purposes
        include: {
          agency: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Show the most recent applications first
    },
  });
}

/**
 * Fetches all the necessary data for the candidate's main dashboard UI.
 */
export async function getCandidateDashboardData(userId: string) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
  });

  if (!profile) throw new Error('Candidate profile not found.');

  // Type-safe transaction
  const [
    applicationStatusCountsRaw,
    recentApplications,
    totalApplications,
    workExperienceCount,
    educationCount,
  ] = await prisma.$transaction([
    // Group applications by status with count
    prisma.application.groupBy({
      by: ['status'],
      where: { candidateId: profile.id },
      _count: { _all: true },
      orderBy: { status: 'asc' }, // required by Prisma TS
    }),
    // 3 most recent applications
    prisma.application.findMany({
      where: { candidateId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        position: {
          select: { title: true, agency: { select: { name: true } } },
        },
      },
    }),
    // Total applications
    prisma.application.count({ where: { candidateId: profile.id } }),
    // Work experience count
    prisma.workExperience.count({ where: { candidateId: profile.id } }),
    // Education count
    prisma.education.count({ where: { candidateId: profile.id } }),
  ]);

  // Type-safe mapping of groupBy results
  type CountedApplication = typeof applicationStatusCountsRaw[number] & { _count: { _all: number } };

  const applicationStatusCounts = applicationStatusCountsRaw as CountedApplication[];

  const applicationStats = applicationStatusCounts.reduce((acc, group) => {
    acc[group.status] = group._count._all;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  // Profile completeness calculation
  let completeness = 20; // Base
  if (profile.summary) completeness += 20;
  if (profile.cvFileKey) completeness += 20;
  if (workExperienceCount > 0) completeness += 20;
  if (educationCount > 0) completeness += 20;

  return {
    profileCompleteness: Math.min(100, completeness),
    stats: {
      totalApplications,
      interviews: applicationStats.INTERVIEW || 0,
      offers: applicationStats.OFFER || 0,
    },
    recentApplications,
    isVerified: profile.isVerified,
  };
}