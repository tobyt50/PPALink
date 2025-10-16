import { ApplicationStatus, PositionStatus } from '@prisma/client';
import { format, subMonths } from 'date-fns';
import prisma from '../../config/db';

// 🔹 Helper types for groupBy results
type ApplicationGroup = { status: ApplicationStatus; _count: { _all: number } };
type SkillGroup = { skillId: number; _count: { _all: number } };
type LocationGroup = { primaryStateId: number | null; _count: { _all: number } };

/**
 * Fetches analytics data for a specific agency, tailored to their subscription plan.
 */
export async function getAgencyAnalytics(agencyId: string) {
  const agencySub = await prisma.agencySubscription.findFirst({
    where: { agencyId, status: 'ACTIVE' },
    include: { plan: true },
  });
  const planName = agencySub?.plan?.name || 'Free';

  const openJobsCount = await prisma.position.count({
    where: { agencyId, status: PositionStatus.OPEN },
  });

  const freeAnalytics = { planName, openJobsCount };
  if (planName === 'Free') return freeAnalytics;

  // ✅ Pro and Enterprise common data
  const [totalJobsPosted, totalApplications, recentApplications, totalJobViews] = await prisma.$transaction([
    prisma.position.count({ where: { agencyId } }),
    prisma.application.count({ where: { position: { agencyId } } }),
    prisma.application.findMany({
      where: {
        position: { agencyId },
        createdAt: { gte: subMonths(new Date(), 3) },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.jobView.count({
        where: { job: { agencyId: agencyId } }
    })
  ]);

  const rawAppStatusCounts = await prisma.application.groupBy({
    by: ['status'],
    where: { position: { agencyId } },
    _count: { _all: true },
    orderBy: { status: 'asc' },
  });
  const applicationStatusCounts = rawAppStatusCounts as ApplicationGroup[];

  const statusDistribution = applicationStatusCounts.reduce((acc, group) => {
    acc[group.status] = group._count._all;
    return acc;
  }, {} as Record<ApplicationStatus, number>);

  const applicationTrends = recentApplications.reduce((acc, app) => {
    const month = format(new Date(app.createdAt), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const proAnalytics = {
    ...freeAnalytics,
    totalJobsPosted,
    totalApplications,
    totalShortlisted: await prisma.shortlist.count({ where: { agencyId } }),
    applicationStatusDistribution: statusDistribution,
    applicationTrends,
    totalJobViews,
  };
  if (planName === 'Pro') return proAnalytics;

  // ✅ Enterprise additional data
  if (planName === 'Enterprise') {
    const rawSkillsData = await prisma.candidateSkill.groupBy({
      by: ['skillId'],
      _count: { _all: true },
      where: { candidate: { applications: { some: { position: { agencyId } } } } },
      orderBy: { _count: { skillId: 'desc' } },
      take: 5,
    });
    const skillsData = rawSkillsData as SkillGroup[];

    const rawLocationsData = await prisma.candidateProfile.groupBy({
      by: ['primaryStateId'],
      _count: { _all: true },
      where: {
        applications: { some: { position: { agencyId } } },
        primaryStateId: { not: null },
      },
      orderBy: { _count: { primaryStateId: 'desc' } },
      take: 5,
    });
    const locationsData = rawLocationsData as LocationGroup[];
    const topSkillIds = skillsData.map((s) => s.skillId);
    const topSkills = await prisma.skill.findMany({ where: { id: { in: topSkillIds } } });

    const skillsHeatmap = topSkills.reduce((acc, skill) => {
      const count = skillsData.find((s) => s.skillId === skill.id)?._count._all ?? 0;
      acc[skill.name] = count;
      return acc;
    }, {} as Record<string, number>);

    const topStateIds = locationsData.map((s) => s.primaryStateId).filter(Boolean) as number[];
    const topStates = await prisma.locationState.findMany({ where: { id: { in: topStateIds } } });
    const geographicSourcing = topStates.reduce((acc, state) => {
      const count = locationsData.find((s) => s.primaryStateId === state.id)?._count._all ?? 0;
      acc[state.name] = count;
      return acc;
    }, {} as Record<string, number>);

    return { ...proAnalytics, skillsHeatmap, geographicSourcing };
  }

  return freeAnalytics;
}

/**
 * Fetches the specific data needed for the main Agency Dashboard UI.
 */
export async function getAgencyDashboardData(agencyId: string) {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { domainVerified: true, cacVerified: true }
  });

  if (!agency) {
    throw new Error('Agency not found.');
  }
  const [
    recentApplications,
    activeJobs,
    openJobsCount,
    totalApplications,
    totalShortlisted,
    totalJobViews,
  ] = await prisma.$transaction([
    prisma.application.findMany({
      where: { position: { agencyId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        position: { select: { id: true, title: true } },
      },
    }),
    prisma.position.findMany({
      where: { agencyId, status: 'OPEN' },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        agencyId: true,
        _count: { select: { applications: true } },
      },
    }),
    prisma.position.count({ where: { agencyId, status: 'OPEN' } }),
    prisma.application.count({ where: { position: { agencyId } } }),
    prisma.shortlist.count({ where: { agencyId } }),
    prisma.jobView.count({ where: { job: { agencyId: agencyId } } })
  ]);

  return {
    verificationStatus: {
      domainVerified: agency.domainVerified,
      cacVerified: agency.cacVerified,
    },
    stats: {
      openJobs: openJobsCount,
      totalApps: totalApplications,
      totalShortlisted,
      totalJobViews,
    },
    recentApplications,
    activeJobs,
  };
}