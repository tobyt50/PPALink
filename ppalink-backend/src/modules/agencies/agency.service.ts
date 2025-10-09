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
 * @param queryParams - An object containing potential filter keys like stateId, skills, etc.
 */
export async function searchCandidates(userId: string, queryParams: any) {
  const {
    stateId,
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

  // --- Build the query dynamically ---
  if (stateId) {
    where.AND.push({ primaryStateId: parseInt(stateId, 10) });
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
    andConditions.push({
      OR: [
        // Name
        {
          firstName: {
            contains: searchQuery,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          lastName: {
            contains: searchQuery,
            mode: Prisma.QueryMode.insensitive,
          },
        },

        // Associated user
        {
          user: {
            email: {
              contains: searchQuery,
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
                  contains: searchQuery,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          },
        },

        // Education (paid)
        ...(isPaid
          ? [
              {
                education: {
                  some: {
                    OR: [
                      {
                        institution: {
                          contains: searchQuery,
                          mode: Prisma.QueryMode.insensitive,
                        },
                      },
                      {
                        degree: {
                          contains: searchQuery,
                          mode: Prisma.QueryMode.insensitive,
                        },
                      },
                      {
                        field: {
                          contains: searchQuery,
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
                    contains: searchQuery,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  title: {
                    contains: searchQuery,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  description: {
                    contains: searchQuery,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            },
          },
        },
      ],
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
      user: { select: { email: true, role: true } }, // role included for debugging/verification
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
export async function getInterviewPipeline(agencyId: string, positionId?: string) {
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
      candidate: { select: { id: true, firstName: true, lastName: true } },
      position: { select: { id: true, title: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const jobsInPipeline = applicationsInInterviewStage.reduce((acc, app) => {
      if (!acc.some(job => job.id === app.position.id)) {
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
