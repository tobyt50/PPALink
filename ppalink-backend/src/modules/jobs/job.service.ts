import { PositionStatus, PositionVisibility } from '@prisma/client';
import prisma from '../../config/db';
import { CreateJobPositionInput, UpdateJobPositionInput } from './job.types';

async function connectOrCreateSkills(skillNames: string[]) {
  // Use a transaction to find all skills at once
  const skills = await prisma.skill.findMany({
    where: { name: { in: skillNames, mode: 'insensitive' } },
  });
  
  // Find which skills are new
  const existingSkillNames = new Set(skills.map(s => s.name.toLowerCase()));
  const newSkillsToCreate = skillNames
    .filter(name => !existingSkillNames.has(name.toLowerCase()))
    .map(name => ({ name, slug: name.toLowerCase().replace(/\s+/g, '-') }));

  // Create new skills if any
  if (newSkillsToCreate.length > 0) {
      await prisma.skill.createMany({
          data: newSkillsToCreate,
          skipDuplicates: true,
      });
  }

  // Get all skill IDs (both existing and newly created)
  const allSkills = await prisma.skill.findMany({
      where: { name: { in: skillNames, mode: 'insensitive' } }
  });

  // Note: PositionSkill doesn't have extra fields like `level`, so this is correct.
  return allSkills.map(skill => ({ skillId: skill.id }));
}

/**
 * Creates a new job position for a given agency after verifying subscription limits.
 * @param agencyId The ID of the agency creating the job.
 * @param data The job position details.
 */
export async function createJobPosition(agencyId: string, data: CreateJobPositionInput) {
  // ... (Subscription check logic remains the same)
  const agencySub = await prisma.agencySubscription.findFirst({
    where: { agencyId, status: 'ACTIVE' },
    include: { plan: true },
  });

  const plan = agencySub?.plan || await prisma.subscriptionPlan.findFirst({ where: { price: 0 } });

  if (!plan) {
    throw new Error('Could not determine your subscription plan. Please contact support.');
  }

  const { jobPostLimit } = plan;

  if (jobPostLimit !== -1) {
    const currentOpenJobs = await prisma.position.count({
      where: { agencyId, status: PositionStatus.OPEN },
    });

    if (currentOpenJobs >= jobPostLimit) {
      throw new Error(`Your "${plan.name}" plan is limited to ${jobPostLimit} open job(s). Please upgrade to post more.`);
    }
  }

  // Create the job position
  const { skills: skillNames, ...positionData } = data;
  
  const position = await prisma.position.create({
    data: {
      ...positionData,
      agencyId,
      skills: skillNames && skillNames.length > 0
        ? { create: await connectOrCreateSkills(skillNames) }
        : undefined,
    },
  });

  return position;
}

/**
 * Retrieves all job positions for a specific agency.
 * @param agencyId The ID of the agency.
 */
export async function getJobsByAgencyId(agencyId: string) {
  return prisma.position.findMany({
    where: { agencyId },
    orderBy: { createdAt: 'desc' },
     // Note: Skills are not included here for performance on list views.
     // If a list view needs skills, add the include block.
  });
}

/**
 * Retrieves a single job position by its ID, ensuring it belongs to the correct agency.
 * @param jobId The ID of the job position.
 * @param agencyId The ID of the agency that owns the job.
 */
export async function getJobById(jobId: string, agencyId: string) {
  return prisma.position.findUniqueOrThrow({
    where: { id: jobId, agencyId },
    // --- FIX: Include skills when fetching a job to edit ---
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });
}

/**
 * Updates a job position.
 * @param jobId The ID of the job to update.
 * @param agencyId The ID of the agency that owns the job.
 * @param data The data to update.
 */
export async function updateJobPosition(jobId: string, agencyId: string, data: UpdateJobPositionInput) {
  const { skills: skillNames, ...positionData } = data;

  const position = await prisma.position.update({
    where: { id: jobId, agencyId },
    data: {
      ...positionData,
      skills: skillNames
        ? {
            deleteMany: {},
            create: await connectOrCreateSkills(skillNames),
          }
        : undefined,
    },
  });
  return position;
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
 * This is the primary function for fetching a job to edit.
 * @param jobId The ID of the job position.
 * @param agencyId The ID of the agency that should own the job.
 */
export async function getJobByIdAndAgency(jobId: string, agencyId: string) {
  const job = await prisma.position.findUnique({
    where: { 
      id: jobId,
      agencyId: agencyId,
    },
    // --- FIX: Include skills when fetching a job to edit ---
    include: {
      skills: {
        include: {
          skill: true,
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
 * Fetches a single job position by its ID, including all associated candidate applications.
 * @param jobId The ID of the job position.
 * @param agencyId The ID of the agency that owns the job.
 */
export async function getJobWithApplicants(jobId: string, agencyId: string) {
  const job = await prisma.position.findUnique({
    where: {
      id: jobId,
      agencyId: agencyId,
    },
    include: {
      // --- FIX: Also include the skills required for the job itself ---
      skills: {
        include: {
          skill: true,
        },
      },
      applications: {
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              summary: true,
              verificationLevel: true,
              skills: {
                include: {
                  skill: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
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
 * @param queryParams - An object containing potential search/filter keys like 'q'.
 */
// job.service.ts (backend)
export async function getPublicJobs(queryParams: any) {
  const { q } = queryParams;
  
  const where: any = {
    visibility: PositionVisibility.PUBLIC,
    status: PositionStatus.OPEN,
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { agency: { name: { contains: q, mode: 'insensitive' } } },
      { skills: { some: { skill: { name: { contains: q, mode: 'insensitive' } } } } },
    ];
  }

  return prisma.position.findMany({
    where,
    include: {
      agency: { select: { name: true, domainVerified: true, cacVerified: true } },
      skills: { include: { skill: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Fetches a single public job by its ID.
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
          id: true, 
          name: true, 
          domainVerified: true, 
          cacVerified: true 
        },
      },
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });

  if (!job) {
    throw new Error('Job not found or is no longer available.');
  }
  return job;
}