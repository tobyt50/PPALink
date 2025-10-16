import prisma from "../../config/db";
import { FeedAudience, FeedCategory, FeedType, Prisma } from "@prisma/client";
import type { Agency, CandidateProfile, FeedItem, Role, User } from "@prisma/client";

type CandidateWithDetails = CandidateProfile & {
  skills: { skillId: number }[];
  quizAttempts: { quiz: { skillId: number | null } }[];
};

interface UniversalPostInput {
  title: string;
  content: string;
  category: FeedCategory;
  type: FeedType;
  audience: FeedAudience;
  imageUrl?: string | null;
  link?: string | null;
  ctaText?: string | null;
  targetingCriteria?: Prisma.JsonValue;
}

// Fisher-Yates shuffle function
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * An intelligent service to generate a paginated, filterable career discovery feed.
 * Handles both candidate and agency roles with role-specific injections.
 * @param userId The ID of the user.
 * @param role The role of the user.
 * @param category Optional category to filter the feed.
 * @param cursor Optional cursor for pagination.
 * @param search Optional search query.
 */
export async function generateFeed(
  userId: string,
  role: Role,
  category?: FeedCategory,
  cursor?: string,
  search?: string
): Promise<{ data: any[]; nextCursor: string | null }> {
  let candidateProfile: CandidateWithDetails | null = null;
  let agency: Agency | null = null;
  let agencyId: string | null = null;

  if (role === "CANDIDATE") {
    candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: { select: { skillId: true } },
        quizAttempts: {
          where: { passed: false },
          select: { quiz: { select: { skillId: true } } },
        },
      },
    });

    if (!candidateProfile) {
      return { data: [], nextCursor: null };
    }
  } else if (role === "AGENCY") {
    agency = await prisma.agency.findFirst({
      where: { ownerUserId: userId },
    });
    if (!agency) {
      return { data: [], nextCursor: null };
    }
    agencyId = agency.id;
  }

  // Increase take for general fetches to ensure category diversity (e.g., for Dashboard)
  const take = category ? 10 : 30; // 10 for specific categories, 30 for "all" to cover more variety

  // Enhanced search logic: split into tokens and search across multiple fields (title, content, ctaText, agency name, user first/last name)
  const tokens = search ? search.trim().split(/\s+/).filter(t => t.length > 0) : [];
  let searchCondition: Prisma.FeedItemWhereInput | undefined = undefined;
  if (tokens.length > 0) {
    searchCondition = {
      AND: tokens.map(token => ({
        OR: [
          { title: { contains: token, mode: "insensitive" } },
          { content: { contains: token, mode: "insensitive" } },
          { ctaText: { contains: token, mode: "insensitive" } },
          { agency: { name: { contains: token, mode: "insensitive" } } },
          { user: { candidateProfile: { firstName: { contains: token, mode: "insensitive" } } } },
          { user: { candidateProfile: { lastName: { contains: token, mode: "insensitive" } } } },
        ]
      }))
    };
  }

  // 1. Fetch the main, paginated, and filterable content.
  const whereClause: Prisma.FeedItemWhereInput = {
    isActive: true,
    audience: { in: ["ALL", "CANDIDATE"] }, // Unified audience for same feed across roles
    category: category
      ? category
      : {
          in: [
            "LEARN_GROW",
            "CAREER_INSIGHT",
            "SUCCESS_STORY",
            "FROM_EMPLOYERS",
          ],
        },
    ...searchCondition,
  };

  const [mainFeedItems, activeBoosts] = await Promise.all([
    prisma.feedItem.findMany({
      take,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        agency: { select: { id: true, name: true } },
        user: { select: { id: true, email: true, candidateProfile: { select: { firstName: true, lastName: true } } } },
        boosts: true,
      },
    }),
    prisma.feedBoost.findMany({
      where: {
        status: "ACTIVE",
        endDate: { gte: new Date() },
      },
      include: {
        tier: { select: { name: true } },
      },
    }),
  ]);

  const nextCursor =
    mainFeedItems.length === take ? mainFeedItems[take - 1].id : null;

  // Create a map for quick lookup of active boosts by feedItemId
  const activeBoostMap = new Map(
    activeBoosts.map((boost) => [boost.feedItemId, boost])
  );

  const formattedGeneralContent = mainFeedItems.map((item) => {
    let score = 1; // Base score
    // Retrieve the active boost for this item
    const activeBoost = activeBoostMap.get(item.id);
    let boosts = item.boosts || []; // Use included boosts as fallback, but override with active-only filter
    if (activeBoost) {
      // Filter to include only the active boost (ensures endDate check is handled server-side)
      boosts = [activeBoost];
      const boostTier = activeBoost.tier.name;
      if (boostTier === "PREMIUM") {
        score += 1000; // Premium boosts get the highest priority
      } else if (boostTier === "STANDARD") {
        score += 500;
      }
    }
    return { ...item, boosts, score, sortKey: item.createdAt };
  });

  // Define type for potentialLearning to include relations
  type PotentialLearningPayload = Prisma.FeedItemGetPayload<{
    include: {
      agency: { select: { id: true; name: true } };
      user: {
        select: {
          id: true;
          email: true;
          candidateProfile: { select: { id: true; firstName: true; lastName: true } };
        };
      };
    };
  }>;

  // 2. Fetch high-priority "injections" only on the first page load.
  //    - For general/"all" fetches: Include both recommendations and resources (role-specific).
  //    - For "RECOMMENDATION" specifically: Include only recommendations (role-specific).
  let injections: any[] = [];
  if (!cursor && (!category || category === "RECOMMENDATION") && !search) {
    if (role === "CANDIDATE") {
      const jobsPromise = prisma.position.findMany({
        where: {
          status: "OPEN",
          visibility: "PUBLIC",
          skills: {
            some: {
              skillId: {
                in: candidateProfile!.skills.map((s) => s.skillId),
              },
            },
          },
          applications: { none: { candidateId: candidateProfile!.id } },
        },
        include: { agency: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      });

      let learningFeedItems: PotentialLearningPayload[] = [];
      if (category !== "RECOMMENDATION") {
        const failedSkillIds = candidateProfile!.quizAttempts
          .map((a) => a.quiz.skillId)
          .filter(Boolean) as number[];

        if (failedSkillIds.length > 0) {
          const failedSkills = await prisma.skill.findMany({
            where: { id: { in: failedSkillIds } },
            select: { name: true },
          });
          const failedSkillNames = failedSkills.map((s) => s.name);

          const potentialLearning: PotentialLearningPayload[] = await prisma.feedItem.findMany({
            where: {
              category: FeedCategory.LEARN_GROW,
              audience: { in: ["ALL", "CANDIDATE"] },
              isActive: true,
              type: { in: [FeedType.ARTICLE, FeedType.WEBINAR] },
            },
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              agency: { select: { id: true, name: true } },
              user: {
                select: {
                  id: true,
                  email: true,
                  candidateProfile: { select: { id: true, firstName: true, lastName: true } },
                },
              },
            },
          });

          const matchingLearning = potentialLearning
            .filter((item) => {
              const criteria = item.targetingCriteria as any;
              if (!criteria?.skills || !Array.isArray(criteria.skills))
                return false;
              return failedSkillNames.some((name) =>
                criteria.skills.includes(name)
              );
            })
            .slice(0, 3);

          learningFeedItems = matchingLearning;
        }
      }

      const [recommendedJobs] = await Promise.all([jobsPromise]);

      const formattedJobs = recommendedJobs.map((job) => {
        const formatted = {
          id: `job-${job.id}`,
          type: FeedType.JOB_POST,
          category: FeedCategory.RECOMMENDATION,
          title: job.title,
          content: `A new role at ${job.agency?.name} matches your skills.`,
          link: `/jobs/${job.id}/details`,
          ctaText: "View Job",
          imageUrl: null,
          targetingCriteria: null,
          agency: job.agency ? { id: job.agency.id, name: job.agency.name } : undefined,
          agencyId: job.agencyId || null,
          userId: null,
          isActive: true,
          createdAt: job.createdAt,
          score: 3,
          sortKey: job.createdAt,
          boosts: [], // Ensure no boosts for dynamic items
        };
        return formatted;
      });
      const formattedLearning = learningFeedItems.map((item) => {
        const formatted = {
          id: item.id,
          type: item.type,
          category: item.category,
          title: item.title,
          content: `Based on your recent assessment, you might find this resource helpful.`,
          link: item.link,
          ctaText: "Learn More",
          imageUrl: item.imageUrl,
          targetingCriteria: item.targetingCriteria,
          agency: item.agency,
          user: item.user,
          agencyId: item.agencyId,
          userId: item.userId,
          isActive: item.isActive,
          createdAt: item.createdAt,
          score: 5,
          sortKey: item.createdAt,
          boosts: [], // Ensure no boosts for dynamic items
        };
        return formatted;
      });

      injections = [...formattedJobs, ...formattedLearning];
    } else if (role === "AGENCY") {
      const agencyJobSkills = await prisma.positionSkill.findMany({
        where: { position: { agencyId: agencyId!, status: "OPEN" } },
        select: { skillId: true },
        distinct: ["skillId"],
      });
      const requiredSkillIds = agencyJobSkills.map((s) => s.skillId);

      const recommendedCandidates = await prisma.candidateProfile.findMany({
        where: {
          availability: { not: null },
          skills: { some: { skillId: { in: requiredSkillIds } } },
          applications: { none: { position: { agencyId: agencyId! }, status: "HIRED" } },
        },
        include: { 
          user: { 
            select: { 
              id: true,
              email: true, 
              updatedAt: true 
            } 
          } 
        },
        orderBy: { user: { updatedAt: "desc" } },
        take: 5,
      });

      const formattedCandidates = recommendedCandidates.map((candidate) => {
        const formatted = {
          id: `cand-${candidate.id}`,
          type: FeedType.INSIGHT,
          category: FeedCategory.RECOMMENDATION,
          title: `Top Candidate: ${candidate.firstName} ${candidate.lastName}`,
          content:
            candidate.summary ||
            `A promising candidate matching your required skills.`,
          link: `/dashboard/agency/candidates/${candidate.id}/profile`,
          ctaText: "View Profile",
          user: {
            id: candidate.user.id,
            email: candidate.user.email,
            candidateProfile: {
              id: candidate.id,
              firstName: candidate.firstName,
              lastName: candidate.lastName,
            },
          },
          userId: candidate.userId,
          agencyId: null,
          createdAt: candidate.user.updatedAt,
          score: 3,
          sortKey: candidate.user.updatedAt,
          boosts: [],
        };
        return formatted;
      });
      injections = formattedCandidates;
    }
  }

  // Separate boosted items (promoted posts with score >= 501) for top placement
  const boostedItems = formattedGeneralContent.filter((item) => item.score > 1);
  const nonBoostedGeneral = formattedGeneralContent.filter(
    (item) => item.score === 1
  );

  let combinedFeed: any[];

  if (!category) {
    // For ALL: Pin boosted items at the top (sorted by recency), then mix injections and non-boosted general by recency
    const mixedNonBoosted = [...injections, ...nonBoostedGeneral];
    mixedNonBoosted.sort(
      (a, b) => new Date(b.sortKey).getTime() - new Date(a.sortKey).getTime()
    );

    const sortedBoosted = boostedItems.sort(
      (a, b) => new Date(b.sortKey).getTime() - new Date(a.sortKey).getTime()
    );

    combinedFeed = [...sortedBoosted, ...mixedNonBoosted];
  } else {
    // For specific categories: Keep original score + time sort (injections if applicable will have higher scores)
    combinedFeed = [...injections, ...formattedGeneralContent];
    combinedFeed.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return new Date(b.sortKey).getTime() - new Date(a.sortKey).getTime();
    });
  }

  const uniqueFeed = Array.from(
    new Map(combinedFeed.map((item) => [item.id, item])).values()
  );

  // We return the combined data and the cursor for the main query.
  return {
    data: uniqueFeed,
    nextCursor,
  };
}

/**
 * Fetches a single feed item by its ID, with security checks.
 * Ensures a user can only fetch their own posts or public posts.
 * @param itemId The ID of the feed item to fetch.
 * @param user The authenticated user object.
 */
export async function getMyPostById(itemId: string, user: User) {
  const post = await prisma.feedItem.findUnique({
    where: { id: itemId },
    include: {
      agency: { select: { name: true } },
      user: { select: { email: true } },
    },
  });

  if (!post) {
    throw new Error("Post not found.");
  }

  // Security check:
  // 1. Admins can see everything.
  // 2. The author of the post can see it.
  // 3. Any user can see an active, public post.
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const isAuthor = post.userId === user.id;
  const isPubliclyVisible =
    post.isActive && (post.audience === "ALL" || post.audience === user.role);

  if (!isAdmin && !isAuthor && !isPubliclyVisible) {
    throw new Error("You do not have permission to view this post.");
  }

  return post;
}

/**
 * Fetches all feed items created by a specific user (for their "My Posts" page).
 * @param userId The ID of the user whose posts are being fetched.
 */
export async function getMyPosts(userId: string) {
  return prisma.feedItem.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      agency: { select: { name: true } },
      user: { select: { email: true } },
    },
  });
}

export async function createUniversalPost(
  data: UniversalPostInput,
  userId: string,
  agencyId?: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");

  if (
    user.role === "CANDIDATE" &&
    !["CAREER_INSIGHT", "SUCCESS_STORY"].includes(data.category)
  ) {
    throw new Error("You are not permitted to post in this category.");
  }
  if (
    user.role === "AGENCY" &&
    !["LEARN_GROW", "FROM_EMPLOYERS", "CAREER_INSIGHT"].includes(data.category)
  ) {
    throw new Error("You are not permitted to post in this category.");
  }

  return prisma.feedItem.create({
    data: {
      title: data.title,
      content: data.content,
      category: data.category,
      type: data.type,
      audience: data.audience,
      link: data.link,
      ctaText: data.ctaText,
      imageUrl: data.imageUrl,
      targetingCriteria: data.targetingCriteria || Prisma.JsonNull,
      userId: userId,
      agencyId: agencyId,
    },
  });
}

export async function updateMyPost(
  itemId: string,
  userId: string,
  data: Partial<UniversalPostInput>
) {
  const post = await prisma.feedItem.findUnique({
    where: { id: itemId },
    include: { agency: { select: { ownerUserId: true } } },
  });
  if (
    !post ||
    (post.userId !== userId && post.agency?.ownerUserId !== userId)
  ) {
    throw new Error("Post not found or you do not have permission to edit it.");
  }
  return prisma.feedItem.update({
    where: { id: itemId },
    data: {
      ...data,
      targetingCriteria: data.targetingCriteria
        ? data.targetingCriteria
        : undefined,
    },
  });
}

export async function deleteMyPost(itemId: string, userId: string) {
  const post = await prisma.feedItem.findUnique({
    where: { id: itemId },
    include: { agency: { select: { ownerUserId: true } } },
  });
  if (
    !post ||
    (post.userId !== userId && post.agency?.ownerUserId !== userId)
  ) {
    throw new Error(
      "Post not found or you do not have permission to delete it."
    );
  }
  return prisma.feedItem.delete({ where: { id: itemId } });
}

/**
 * Admin action to fetch all feed items with pagination and filtering.
 */
export async function adminGetAllFeedItems(query: any) {
  // We can add pagination and filtering here later
  return prisma.feedItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      agency: { select: { name: true } },
      user: { select: { email: true } },
    },
  });
}

/**
 * Admin action to fetch a single feed item by its ID.
 */
export async function adminGetFeedItemById(itemId: string) {
  return prisma.feedItem.findUnique({
    where: { id: itemId },
  });
}

/**
 * Admin action to create a new feed item.
 */
export async function adminCreateFeedItem(
  data: Omit<FeedItem, "id" | "createdAt">
) {
  return prisma.feedItem.create({
    data: {
      ...data,
      // Ensure JSON is handled correctly
      targetingCriteria: data.targetingCriteria || Prisma.JsonNull,
    },
  });
}

/**
 * Admin action to update an existing feed item.
 */
export async function adminUpdateFeedItem(
  itemId: string,
  data: Partial<Omit<FeedItem, "id" | "createdAt">>
) {
  return prisma.feedItem.update({
    where: { id: itemId },
    data: {
      ...data,
      targetingCriteria: data.targetingCriteria
        ? data.targetingCriteria
        : undefined,
    },
  });
}

/**
 * Admin action to delete a feed item.
 */
export async function adminDeleteFeedItem(itemId: string) {
  return prisma.feedItem.delete({
    where: { id: itemId },
  });
}
