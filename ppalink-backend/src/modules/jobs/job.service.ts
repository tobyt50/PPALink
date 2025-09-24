import { PositionStatus, PositionVisibility } from '@prisma/client';
import prisma from '../../config/db';
import { emitToAdmins } from '../../config/socket';
import { CreateJobPositionInput, UpdateJobPositionInput } from './job.types';
import { logActivity } from '../activity/activity.service';

async function connectOrCreateSkills(skillNames: string[]) {
  const skills = await prisma.skill.findMany({
    where: { name: { in: skillNames, mode: 'insensitive' } },
  });
  
  const existingSkillNames = new Set(skills.map(s => s.name.toLowerCase()));
  const newSkillsToCreate = skillNames
    .filter(name => !existingSkillNames.has(name.toLowerCase()))
    .map(name => ({ name, slug: name.toLowerCase().replace(/\s+/g, '-') }));

  if (newSkillsToCreate.length > 0) {
      await prisma.skill.createMany({
          data: newSkillsToCreate,
          skipDuplicates: true,
      });
  }

  const allSkills = await prisma.skill.findMany({
      where: { name: { in: skillNames, mode: 'insensitive' } }
  });

  return allSkills.map(skill => ({ skillId: skill.id }));
}

export async function createJobPosition(agencyId: string, data: CreateJobPositionInput) {
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

  const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { name: true, ownerUserId: true } });
  if (!agency) throw new Error('Agency not found');

  await logActivity(agency.ownerUserId, 'job.create', { 
    jobId: position.id, 
    jobTitle: position.title 
  });
  
  emitToAdmins('admin:job_posted', {
      id: position.id,
      title: position.title,
      agencyName: agency.name,
  });

  return position;
}

export async function getJobsByAgencyId(agencyId: string) {
  return prisma.position.findMany({
    where: { agencyId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getJobById(jobId: string, agencyId: string) {
  return prisma.position.findUniqueOrThrow({
    where: { id: jobId, agencyId },
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
  });
}

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

  const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { name: true, ownerUserId: true } });
  if (!agency) throw new Error('Agency not found');

  await logActivity(agency.ownerUserId, 'job.update', {
    jobId: position.id,
    jobTitle: position.title,
    changes: Object.keys(data), // Log which fields were changed
  });
  
  emitToAdmins('admin:job_updated', {
      id: position.id,
      title: position.title,
      agencyName: agency.name,
  });
  return position;
}

export async function deleteJobPosition(jobId: string, agencyId: string) {
  const agency = await prisma.agency.findUnique({ where: { id: agencyId }, select: { ownerUserId: true } });
  if (!agency) throw new Error('Agency not found');
  
  const positionToDelete = await prisma.position.findUnique({
    where: { id: jobId, agencyId },
    select: { id: true, title: true, agency: { select: { name: true } } }
  });

  if (!positionToDelete) {
    throw new Error('Job to delete not found.');
  }

  await prisma.position.delete({
    where: { id: jobId, agencyId },
  });
  
  await logActivity(agency.ownerUserId, 'job.delete', {
    jobId: positionToDelete.id,
    jobTitle: positionToDelete.title,
  });
  
  emitToAdmins('admin:job_deleted', {
      id: positionToDelete.id,
      title: positionToDelete.title,
      agencyName: positionToDelete.agency?.name,
  });
}


export async function getJobByIdAndAgency(jobId: string, agencyId: string) {
  const job = await prisma.position.findUnique({
    where: { 
      id: jobId,
      agencyId: agencyId,
    },
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

export async function getJobWithApplicants(jobId: string, agencyId: string) {
  const job = await prisma.position.findUnique({
    where: {
      id: jobId,
      agencyId: agencyId,
    },
    include: {
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

export async function getPublicJobs(queryParams: any) {
  const { q } = queryParams;
  
  const where: any = {
    visibility: PositionVisibility.PUBLIC,
    status: PositionStatus.OPEN,
  };

  if (q) {
    const searchQuery = String(q).trim();
    const matchingAgencies = await prisma.agency.findMany({
      where: { name: { contains: searchQuery, mode: 'insensitive' } },
      select: { id: true },
    });
    const matchingAgencyIds = matchingAgencies.map(agency => agency.id);
    
    where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { agencyId: { in: matchingAgencyIds } },
        { skills: { some: { skill: { name: { contains: searchQuery, mode: 'insensitive' } } } } },
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