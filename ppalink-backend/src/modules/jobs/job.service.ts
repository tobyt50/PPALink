import {
  ApplicationStatus,
  Prisma,
  PositionStatus,
  PositionVisibility,
  QuizLevel,
} from "@prisma/client";
import prisma from "../../config/db";
import { emitToAdmins } from "../../config/socket";
import { CreateJobPositionInput, UpdateJobPositionInput } from "./job.types";
import { logActivity } from "../activity/activity.service";
import { parseISO } from "date-fns";
import Papa from "papaparse";

interface PipelineQueryFilters {
  q?: string;
  skills?: string[];
  appliedAfter?: string; // ISO Date string
  appliedBefore?: string; // ISO Date string
  institution?: string;
}

async function connectOrCreateSkills(
  skillsData: { name: string; requiredLevel: QuizLevel }[]
) {
  if (!skillsData || skillsData.length === 0) {
    return [];
  }

  // 2. Extract just the names for querying.
  const skillNames = skillsData.map((s) => s.name);

  const existingSkills = await prisma.skill.findMany({
    where: { name: { in: skillNames, mode: "insensitive" } },
  });

  const existingSkillNames = new Set(
    existingSkills.map((s) => s.name.toLowerCase())
  );
  const newSkillsToCreate = skillNames
    .filter((name) => !existingSkillNames.has(name.toLowerCase()))
    .map((name) => ({ name, slug: name.toLowerCase().replace(/\s+/g, "-") }));

  if (newSkillsToCreate.length > 0) {
    await prisma.skill.createMany({
      data: newSkillsToCreate,
      skipDuplicates: true,
    });
  }

  const allSkills = await prisma.skill.findMany({
    where: { name: { in: skillNames, mode: "insensitive" } },
  });

  // 3. Map the final array, pairing the correct skill ID with its required level from the input.
  return skillsData.map((inputSkill) => {
    const dbSkill = allSkills.find(
      (s) => s.name.toLowerCase() === inputSkill.name.toLowerCase()
    );
    return {
      skillId: dbSkill!.id,
      requiredLevel: inputSkill.requiredLevel,
    };
  });
}

export async function createJobPosition(
  agencyId: string,
  data: CreateJobPositionInput
) {
  const agencySub = await prisma.agencySubscription.findFirst({
    where: { agencyId, status: "ACTIVE" },
    include: { plan: true },
  });

  let jobPostLimit: number;
  let planName: string;

  if (agencySub?.plan) {
    jobPostLimit = agencySub.plan.jobPostLimit;
    planName = agencySub.plan.name;
  } else {
    // User is on the Free plan, use the limit from the Settings table.
    const freeJobLimitSetting = await prisma.setting.findUnique({
      where: { key: "freeJobPostLimit" },
    });
    jobPostLimit = (freeJobLimitSetting?.value as number) ?? 1; // Fallback to 1 if setting is missing
    planName = "Free";
  }

  if (jobPostLimit !== -1) {
    const currentOpenJobs = await prisma.position.count({
      where: { agencyId, status: PositionStatus.OPEN },
    });

    if (currentOpenJobs >= jobPostLimit) {
      throw new Error(
        `Your "${planName}" plan is limited to ${jobPostLimit} open job(s). Please upgrade to post more.`
      );
    }
  }

  const { skills: skillNames, ...positionData } = data;

  const position = await prisma.position.create({
    data: {
      ...positionData,
      agencyId,
      skills:
        skillNames && skillNames.length > 0
          ? { create: await connectOrCreateSkills(skillNames) }
          : undefined,
    },
  });

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { name: true, ownerUserId: true },
  });
  if (!agency) throw new Error("Agency not found");

  await logActivity(agency.ownerUserId, "job.create", {
    jobId: position.id,
    jobTitle: position.title,
  });

  emitToAdmins("admin:job_posted", {
    id: position.id,
    title: position.title,
    agencyName: agency.name,
  });

  return position;
}

export async function getJobsByAgencyId(agencyId: string) {
  return prisma.position.findMany({
    where: { agencyId },
    orderBy: { createdAt: "desc" },
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

export async function updateJobPosition(
  jobId: string,
  agencyId: string,
  data: UpdateJobPositionInput
) {
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

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { name: true, ownerUserId: true },
  });
  if (!agency) throw new Error("Agency not found");

  await logActivity(agency.ownerUserId, "job.update", {
    jobId: position.id,
    jobTitle: position.title,
    changes: Object.keys(data), // Log which fields were changed
  });

  emitToAdmins("admin:job_updated", {
    id: position.id,
    title: position.title,
    agencyName: agency.name,
  });
  return position;
}

export async function deleteJobPosition(jobId: string, agencyId: string) {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { ownerUserId: true },
  });
  if (!agency) throw new Error("Agency not found");

  const positionToDelete = await prisma.position.findUnique({
    where: { id: jobId, agencyId },
    select: { id: true, title: true, agency: { select: { name: true } } },
  });

  if (!positionToDelete) {
    throw new Error("Job to delete not found.");
  }

  await prisma.position.delete({
    where: { id: jobId, agencyId },
  });

  await logActivity(agency.ownerUserId, "job.delete", {
    jobId: positionToDelete.id,
    jobTitle: positionToDelete.title,
  });

  emitToAdmins("admin:job_deleted", {
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
    throw new Error("Job not found or you do not have permission to view it.");
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
            include: {
              skills: {
                include: {
                  skill: true,
                },
              },
              user: {
                select: {
                  id: true,
                  email: true,
                  avatarKey: true,
                },
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
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!job) {
    throw new Error("Job not found or you do not have permission to view it.");
  }

  const candidateIdsInPipeline = job.applications.map(
    (app) => app.candidate.id
  );

  const uniqueInstitutions = await prisma.education.findMany({
    where: {
      candidateId: {
        in:
          candidateIdsInPipeline.length > 0
            ? candidateIdsInPipeline
            : undefined,
      },
      institution: { not: "" },
    },
    distinct: ["institution"],
    select: {
      institution: true,
    },
    orderBy: {
      institution: "asc",
    },
  });

  (job as any).pipelineInstitutions = uniqueInstitutions.map(
    (edu) => edu.institution
  );

  const metricsQuery = Prisma.sql`
    SELECT
      "status",
      -- Calculate the average of (NOW() - "createdAt") for each status group
      -- The result is an interval, which we extract the total days from.
      -- We use COALESCE to handle cases where there are no applications in a stage.
      COALESCE(AVG(EXTRACT(EPOCH FROM (NOW() - "createdAt")) / 86400), 0) as "avgDaysInStage"
    FROM "Application"
    WHERE "positionId" = ${jobId}
    GROUP BY "status";
  `;

  const metricsResult: { status: ApplicationStatus; avgDaysInStage: number }[] =
    await prisma.$queryRaw(metricsQuery);

  (job as any).metrics = metricsResult.reduce((acc, metric) => {
    acc[metric.status] = {
      avgDaysInStage: parseFloat(metric.avgDaysInStage.toFixed(1)), // Format to one decimal place
    };
    return acc;
  }, {} as Record<ApplicationStatus, { avgDaysInStage: number }>);
  return job;
}

export async function getPublicJobs(queryParams: any) {
  const { q, stateId, isRemote } = queryParams;

  const where: any = {
    visibility: PositionVisibility.PUBLIC,
    status: PositionStatus.OPEN,
    ...(isRemote === "true" && { isRemote: true }),
    ...(stateId && { stateId: Number(stateId) }),
  };

  if (q) {
    const searchQuery = String(q).trim();
    const matchingAgencies = await prisma.agency.findMany({
      where: { name: { contains: searchQuery, mode: "insensitive" } },
      select: { id: true },
    });
    const matchingAgencyIds = matchingAgencies.map((agency) => agency.id);

    where.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { agencyId: { in: matchingAgencyIds } },
      {
        skills: {
          some: {
            skill: { name: { contains: searchQuery, mode: "insensitive" } },
          },
        },
      },
    ];
  }

  return prisma.position.findMany({
    where,
    include: {
      agency: {
        select: { name: true, domainVerified: true, cacVerified: true, logoKey: true },
      },
      skills: { include: { skill: true } },
    },
    orderBy: { createdAt: "desc" },
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
          cacVerified: true,
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
    throw new Error("Job not found or is no longer available.");
  }
  return job;
}

/**
 * Performs a comprehensive search and filter query within a single job's pipeline.
 * @param jobId The ID of the job to query within.
 * @param filters An object containing all filter and search criteria.
 */
export async function queryApplicantsInPipeline(
  jobId: string,
  filters: PipelineQueryFilters
) {
  const { q, skills, appliedAfter, appliedBefore, institution } = filters;

  const where: Prisma.ApplicationWhereInput = {
    positionId: jobId,
    AND: [], // Use an AND array to stack multiple conditions
  };

  if (q) {
    const searchQuery = q.trim();
    (where.AND as Prisma.ApplicationWhereInput[]).push({
      candidate: {
        OR: [
          { firstName: { contains: searchQuery, mode: "insensitive" } },
          { lastName: { contains: searchQuery, mode: "insensitive" } },
          { summary: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
    });
  }

  if (skills && skills.length > 0) {
    (where.AND as Prisma.ApplicationWhereInput[]).push({
      candidate: {
        skills: {
          some: { skill: { name: { in: skills, mode: "insensitive" } } },
        },
      },
    });
  }

  if (institution) {
    (where.AND as Prisma.ApplicationWhereInput[]).push({
      candidate: {
        education: {
          some: { institution: { contains: institution, mode: "insensitive" } },
        },
      },
    });
  }

  if (appliedAfter) {
    (where.AND as Prisma.ApplicationWhereInput[]).push({
      createdAt: { gte: parseISO(appliedAfter) },
    });
  }
  if (appliedBefore) {
    (where.AND as Prisma.ApplicationWhereInput[]).push({
      createdAt: { lte: parseISO(appliedBefore) },
    });
  }

  // 5. Execute the final, dynamically constructed query
  return prisma.application.findMany({
    where,
    // We must include the same detailed data as the main pipeline fetch
    include: {
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          summary: true,
          verificationLevel: true,
          skills: { include: { skill: true } },
          quizAttempts: {
            where: { passed: true },
            include: { skill: true },
          },
          user: { select: { id: true, email: true } },
        },
      },
    },
  });
}

/**
 * Fetches all applicants for a job and formats them into a CSV string for export.
 * @param jobId The ID of the job whose pipeline is being exported.
 * @param agencyId The ID of the agency for security verification.
 */
export async function exportPipelineToCSV(jobId: string, agencyId: string) {
  // 1. Fetch all applications for the job with detailed candidate data
  const applications = await prisma.application.findMany({
    where: {
      positionId: jobId,
      position: { agencyId: agencyId },
    },
    include: {
      candidate: {
        include: {
          user: { select: { email: true } },
          skills: { include: { skill: true } },
        },
      },
    },
    orderBy: {
      status: "asc", // Group by status in the export
    },
  });

  if (!applications) {
    throw new Error(
      "Job pipeline not found or you do not have permission to access it."
    );
  }

  // 2. Map the rich data into a flat structure suitable for a CSV
  const dataForCSV = applications.map((app) => ({
    "First Name": app.candidate.firstName,
    "Last Name": app.candidate.lastName,
    Email: app.candidate.user.email,
    "Current Stage": app.status,
    "Date Applied": app.createdAt.toISOString().split("T")[0],
    Skills: app.candidate.skills.map((s) => s.skill.name).join(" | "),
    "Verification Level": app.candidate.verificationLevel,
    "Profile Summary": app.candidate.summary,
  }));

  // 3. Use Papaparse to convert the JSON data to a CSV string
  const csv = Papa.unparse(dataForCSV);

  return csv;
}

/**
 * Finds publicly available jobs that are similar to a given job.
 * Similarity is based on title keywords and shared skills.
 * @param jobId The ID of the source job to find similarities for.
 * @param userId The ID of the candidate requesting, to exclude jobs they've already applied to.
 */
export async function findSimilarJobs(jobId: string, userId: string) {
  // 1. Fetch the source job to get its title and skills
  const sourceJob = await prisma.position.findUnique({
    where: { id: jobId },
    include: { skills: { select: { skillId: true } } },
  });

  if (!sourceJob) {
    throw new Error("Source job not found.");
  }

  // 2. Find all jobs the candidate has already applied to, so we can exclude them
  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId },
  });
  const appliedJobIds = await prisma.application
    .findMany({
      where: { candidateId: candidate?.id },
      select: { positionId: true },
    })
    .then((apps) => apps.map((app) => app.positionId));

  // 3. Extract keywords from the title
  const titleKeywords = sourceJob.title
    .toLowerCase()
    .split(" ")
    .filter((word) => word.length > 3); // Ignore short words
  const sourceSkillIds = sourceJob.skills.map((s) => s.skillId);

  // 4. Construct the complex "similarity" query
  const similarJobs = await prisma.position.findMany({
    where: {
      // Basic requirements: Must be open, public, and not the source job itself
      AND: [
        // Use an explicit AND to combine the ID checks
        { id: { not: jobId } },
        { id: { notIn: appliedJobIds } },
      ],
      status: "OPEN",
      visibility: "PUBLIC",

      // The core "OR" logic for similarity
      OR: [
        // Option A: Title contains similar keywords
        { title: { contains: titleKeywords[0], mode: "insensitive" } }, // Simple match on first keyword
        // Option B: Job shares at least one skill with the source job
        { skills: { some: { skillId: { in: sourceSkillIds } } } },
      ],
    },
    include: {
      agency: { select: { name: true } },
    },
    take: 5, // Limit to 5 similar jobs
  });

  return similarJobs;
}

/**
 * Records a view for a specific job post.
 * @param jobId The ID of the job being viewed.
 * @param userId The optional ID of the logged-in user who is viewing.
 */
export async function recordJobView(jobId: string, userId?: string) {
  return prisma.jobView.create({
    data: {
      jobId: jobId,
      viewerId: userId,
    },
  });
}
