import { AgencyRole, ShortlistSource } from "@prisma/client";
import { Prisma, QuizLevel, Role } from "@prisma/client";
import prisma from "../../config/db";
import { UpdateAgencyProfileInput } from "./agency.types";

// Helper to convert level string to a numerical score for comparison
const levelToScore = (level: QuizLevel): number =>
  ({ BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3 }[level]);

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
    throw new Error(
      "Forbidden: User is not an authorized member of this agency."
    );
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
    include: {
      industry: true,
      subscriptions: {
        include: { plan: true },
      },
    },
  });
}

/**
 * Updates an agency's profile.
 * @param agencyId The ID of the agency to update.
 * @param data The data to update.
 */
export async function updateAgencyProfile(
  agencyId: string,
  data: UpdateAgencyProfileInput
) {
  return prisma.agency.update({
    where: { id: agencyId },
    data,
  });
}

export async function getAgencyByUserId(userId: string) {
  const agencyMember = await prisma.agencyMember.findFirst({
    where: { userId },
    include: {
      agency: {
        include: {
          industry: true,
          subscriptions: {
            include: {
              plan: true,
            },
          },
          members: {
            include: {
              user: {
                // Include user details for each member
                select: {
                  id: true,
                  email: true,
                  status: true,
                  candidateProfile: {
                    select: { firstName: true, lastName: true },
                  },
                },
              },
            },
          },
          invitations: {
            // Include pending invitations
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    }, // Include the full agency details
  });

  if (!agencyMember) {
    throw new Error("User is not associated with any agency.");
  }

  const hasActiveSub = agencyMember.agency.subscriptions.some(
    (s) => s.status === "ACTIVE"
  );
  let freePlanSettings = null;

  if (!hasActiveSub) {
    const [jobLimit, memberLimit] = await prisma.$transaction([
      prisma.setting.findUnique({ where: { key: "freeJobPostLimit" } }),
      prisma.setting.findUnique({ where: { key: "freeMemberLimit" } }),
    ]);
    freePlanSettings = {
      jobPostLimit: (jobLimit?.value as number) ?? 1,
      memberLimit: (memberLimit?.value as number) ?? 1,
    };
  }

  return { ...agencyMember.agency, freePlanSettings };
}

/**
 * Searches for candidate profiles based on a dynamic set of filter criteria.
 * @param queryParams - An object containing potential filter keys like countryId, regionId, cityId, skills, etc.
 */
export async function searchCandidates(userId: string, queryParams: any) {
  const {
    countryId,
    regionId,
    cityId,
    nyscBatch,
    skills,
    isRemote,
    isOpenToReloc,
    gpaBand,
    graduationYear,
    university,
    courseOfStudy,
    degree,
    q,
    verifiedSkillIds,
  } = queryParams;

  // --- Subscription check ---
  const agency = await getAgencyByUserId(userId);
  const activeSub = agency.subscriptions?.[0];
  const isPaid = activeSub && activeSub.plan.name.toUpperCase() !== "BASIC";

  // Free tier: block advanced filters
  if (!isPaid && (university || courseOfStudy || degree)) {
    throw new Error(
      "Upgrade required: University, Course of Study, and Degree filters are only available on paid plans."
    );
  }

  const where: any = {
    AND: [], // combine all filters
  };

  const andConditions = where.AND as Prisma.CandidateProfileWhereInput[];

  if (cityId) {
    andConditions.push({ cityId: parseInt(cityId, 10) });
  } else if (regionId) {
    andConditions.push({ regionId: parseInt(regionId, 10) });
  } else if (countryId) {
    andConditions.push({ countryId: parseInt(countryId, 10) });
  }

  if (nyscBatch) {
    where.AND.push({ nyscBatch: { equals: nyscBatch, mode: "insensitive" } });
  }

  let skillIds: number[] = [];
  if (skills) {
    if (typeof skills === "string") {
      skillIds = skills
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
    } else if (Array.isArray(skills)) {
      skillIds = skills
        .map((s) => parseInt(String(s), 10))
        .filter((n) => !isNaN(n));
    }
  }
  if (skillIds.length > 0) {
    andConditions.push({
      skills: {
        some: {
          skillId: { in: skillIds },
        },
      },
    });
  }

  let verifiedIds: number[] = [];
  if (verifiedSkillIds) {
    if (typeof verifiedSkillIds === "string") {
      verifiedIds = verifiedSkillIds
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
    } else if (Array.isArray(verifiedSkillIds)) {
      verifiedIds = verifiedSkillIds
        .map((s) => parseInt(String(s), 10))
        .filter((n) => !isNaN(n));
    }
  }
  if (verifiedIds.length > 0) {
    andConditions.push({
      quizAttempts: {
        some: {
          skillId: { in: verifiedIds },
          passed: true,
        },
      },
    });
  }

  if (isRemote) {
    andConditions.push({ isRemote: true });
  }

  if (isOpenToReloc) {
    andConditions.push({ isOpenToReloc: true });
  }

  // Map alternative GPA inputs to standard grades
  const gpaInputMap: Record<string, string> = {
    "1st": "First Class",
    first: "First Class",
    "2:1": "Second Class Upper",
    "2i": "Second Class Upper",
    "2nd": "Second Class Upper",
    "2:2": "Second Class Lower",
    "2ii": "Second Class Lower",
    third: "Third Class",
    "3rd": "Third Class",
  };

  if (gpaBand) {
    const normalizedGpa = gpaInputMap[gpaBand.toLowerCase()] || gpaBand;
    andConditions.push({
      education: {
        some: {
          grade: { equals: normalizedGpa, mode: "insensitive" },
        },
      },
    });
  }

  if (graduationYear) {
    const year = parseInt(graduationYear as string, 10);
    andConditions.push({
      education: {
        some: {
          endDate: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1),
          },
        },
      },
    });
  }

  if (university) {
    andConditions.push({
      education: {
        some: {
          institution: { contains: university, mode: "insensitive" },
        },
      },
    });
  }

  if (courseOfStudy) {
    andConditions.push({
      education: {
        some: {
          field: { contains: courseOfStudy, mode: "insensitive" },
        },
      },
    });
  }

  if (degree) {
    andConditions.push({
      education: {
        some: {
          degree: { contains: degree, mode: "insensitive" },
        },
      },
    });
  }

  const searchQuery: string = (q ? String(q) : "").trim();

  if (searchQuery) {
  const words = searchQuery.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) {
    // No valid words; skip search condition
    return;
  }

  // Build per-word conditions: each word must match at least one field (OR across fields)
  const wordConditions = words.map((word) => ({
    OR: [
      // Name
      {
        firstName: {
          contains: word,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      {
        lastName: {
          contains: word,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      // Associated user
      {
        user: {
          email: {
            contains: word,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      },
      // Skills
      {
        skills: {
          some: {
            skill: {
              name: {
                contains: word,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        },
      },
      // Education (paid only)
      ...(isPaid
        ? [
            {
              education: {
                some: {
                  OR: [
                    {
                      institution: {
                        contains: word,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                    {
                      degree: {
                        contains: word,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                    {
                      field: {
                        contains: word,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                  ],
                },
              },
            },
          ]
        : []),
      // Work experiences
      {
        workExperiences: {
          some: {
            OR: [
              {
                company: {
                  contains: word,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                title: {
                  contains: word,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                description: {
                  contains: word,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            ],
          },
        },
      },
    ],
  }));

  // Overall search condition: AND across words (each must match somewhere)
  andConditions.push({
    AND: wordConditions,
  });
}

  return prisma.candidateProfile.findMany({
    where: {
      ...where,
      user: {
        role: "CANDIDATE", // only users with candidate role
      },
    },
    include: {
      user: { select: { email: true, role: true, avatarKey: true } },
      skills: { include: { skill: true } },
      education: true,
      quizAttempts: {
        where: { passed: true },
        include: {
          skill: true,
        },
      },
    },
    take: 50,
  });
}

/**
 * Shortlists a candidate for a given agency.
 * Prevents duplicate entries.
 * @param agencyId The ID of the agency shortlisting the candidate.
 * @param candidateProfileId The ID of the candidate's profile to shortlist.
 */
export async function shortlistCandidate(
  agencyId: string,
  candidateProfileId: string
) {
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
              avatarKey: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc", // Show the most recently shortlisted first
    },
  });

  // The result is an array of Shortlist objects, each containing a 'candidate' property.
  // We want to return just the array of candidate profiles.
  return shortlists.map((shortlist) => shortlist.candidate);
}

/**
 * Removes a candidate from an agency's shortlist.
 * @param agencyId The ID of the agency.
 * @param candidateProfileId The ID of the candidate's profile to remove.
 */
export async function removeShortlist(
  agencyId: string,
  candidateProfileId: string
) {
  const result = await prisma.shortlist.deleteMany({
    where: {
      agencyId: agencyId,
      candidateId: candidateProfileId,
    },
  });

  // deleteMany returns a count of deleted records.
  // We can check if any records were actually deleted.
  if (result.count === 0) {
    throw new Error("Shortlist entry not found or already removed.");
  }

  return result;
}

/**
 * Marks the agency's onboarding process as complete.
 * @param agencyId The ID of the agency to update.
 */
export async function markOnboardingAsComplete(agencyId: string) {
  return prisma.agency.update({
    where: { id: agencyId },
    data: { hasCompletedOnboarding: true },
  });
}

/**
 * Fetches all interview-related applications for an agency,
 * categorized into 'scheduled' and 'unscheduled'.
 * @param agencyId The ID of the agency.
 */
export async function getInterviewPipeline(
  agencyId: string,
  positionId?: string
) {
  const whereClause: Prisma.ApplicationWhereInput = {
    position: { agencyId: agencyId },
    status: "INTERVIEW",
  };

  if (positionId) {
    whereClause.positionId = positionId;
  }

  const applicationsInInterviewStage = await prisma.application.findMany({
    where: whereClause,
    include: {
      interviews: true,
      candidate: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          user: {
            select: {
              avatarKey: true,
            },
          },
        },
      },
      position: { select: { id: true, title: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const jobsInPipeline = applicationsInInterviewStage.reduce((acc, app) => {
    if (!acc.some((job) => job.id === app.position.id)) {
      acc.push(app.position);
    }
    return acc;
  }, [] as { id: string; title: string }[]);

  const unscheduled = applicationsInInterviewStage.filter(
    (app) => app.interviews.length === 0
  );
  const scheduled = applicationsInInterviewStage.filter(
    (app) => app.interviews.length > 0
  );

  return { unscheduled, scheduled, jobsInPipeline };
}

/**
 * Allows an agency to issue a "Work Verification Certificate" for a candidate's
 * specific work experience, but only if they have previously hired that candidate.
 * @param agencyId The ID of the agency issuing the verification.
 * @param workExperienceId The ID of the WorkExperience record to verify.
 * @param actorId The ID of the person verifying.
 */
export async function issueWorkVerification(
  agencyId: string,
  workExperienceId: string,
  actorId: string
) {
  // 1. Fetch the work experience and the candidate who owns it
  const workExperience = await prisma.workExperience.findUnique({
    where: { id: workExperienceId },
    select: { candidateId: true },
  });
  if (!workExperience) throw new Error("Work experience not found.");

  // 2. Security Check: Verify that this agency has a `HIRED` application for this candidate.
  const hireRecord = await prisma.application.findFirst({
    where: {
      candidateId: workExperience.candidateId,
      position: { agencyId: agencyId },
      status: "HIRED",
    },
  });
  if (!hireRecord) {
    throw new Error(
      "You can only verify experience for candidates you have hired through PPAHire."
    );
  }

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    include: {
      candidateProfile: { select: { firstName: true, lastName: true } },
    }, // Assuming admins might have a name in candidateProfile
  });

  const verifierName = `${actor?.candidateProfile?.firstName || "Agency"} ${
    actor?.candidateProfile?.lastName || "Representative"
  }`;

  // 3. Create the verification record
  return prisma.workVerification.create({
    data: {
      workExperienceId,
      verifyingAgencyId: agencyId,
      verifierName: verifierName,
    },
  });
}

/**
 * Fetches the public profile for a single agency, including its open, public jobs.
 * @param agencyId The ID of the agency to fetch.
 */
export async function getPublicAgencyProfile(agencyId: string) {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: {
      // Select only the fields that are safe to be public
      id: true,
      name: true,
      website: true,
      domain: true,
      logoKey: true,
      domainVerified: true,
      cacVerified: true,
      industry: { select: { name: true } },
      country: { select: { name: true } },
      region: { select: { name: true } },
      positions: {
        where: {
          status: "OPEN",
          visibility: "PUBLIC",
        },
        orderBy: { createdAt: "desc" },
        include: {
          skills: { include: { skill: true } },
          country: { select: { name: true } },
          region: { select: { name: true } },
        },
      },
    },
  });

  if (!agency) {
    throw new Error("Agency profile not found or is private.");
  }

  return agency;
}

/**
 * Fetches a list of featured agencies for the public landing page.
 * Prioritizes agencies that are CAC verified.
 */
export async function getFeaturedAgencies() {
  return prisma.agency.findMany({
    where: {
      cacVerified: true,
      // We could add more criteria here, like having a logo or open jobs
    },
    select: {
      id: true,
      name: true,
      logoKey: true,
      industry: { select: { name: true } },
    },
    take: 6, // Limit to a nice grid of 6 agencies
  });
}

/**
 * Updates the logo key for a specific agency.
 * @param agencyId The ID of the agency to update.
 * @param logoKey The new S3 key for their logo image.
 */
export async function updateAgencyLogo(agencyId: string, logoKey: string) {
  return prisma.agency.update({
    where: { id: agencyId },
    data: { logoKey },
  });
}
