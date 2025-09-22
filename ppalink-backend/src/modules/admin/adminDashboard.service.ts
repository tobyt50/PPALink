import { Role, VerificationStatus } from '@prisma/client';
import { subDays, startOfDay, format } from 'date-fns';
import prisma from '../../config/db';
import { stripe } from '../../config/stripe';

/**
 * Fetches all aggregated and time-series data for the main Admin Dashboard.
 */
export async function getAdminDashboardData() {
  const thirtyDaysAgo = subDays(new Date(), 30);

  const [
    totalUsers,
    totalAgencies,
    totalCandidates,
    activeJobs,
    pendingVerifications,
    userSignups,
    jobPosts,
    applications,
    rawSubscriptionDistribution
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.AGENCY } }),
    prisma.user.count({ where: { role: Role.CANDIDATE } }),
    prisma.position.count({ where: { status: 'OPEN' } }),
    prisma.verification.count({ where: { status: VerificationStatus.PENDING } }),
    prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, role: true },
    }),
    prisma.position.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.application.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    // --- THIS IS THE FIX for the groupBy error ---
    prisma.agencySubscription.groupBy({
        by: ['planId'],
        where: { status: 'ACTIVE' },
        _count: { _all: true },
        orderBy: { planId: 'asc' }, // Added required orderBy
    })
  ]);
  const subscriptionDistribution = rawSubscriptionDistribution as { planId: string; _count: { _all: number } }[];

  const dateRange = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return startOfDay(date).toISOString().split('T')[0];
  });

  const processTimeSeries = (data: { createdAt: Date }[]) => {
    const counts = data.reduce((acc, item) => {
      const date = item.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return dateRange.map(date => ({ date, count: counts[date] || 0 }));
  };
  
  const userSignupTrends = {
      candidates: processTimeSeries(userSignups.filter(u => u.role === 'CANDIDATE')),
      agencies: processTimeSeries(userSignups.filter(u => u.role === 'AGENCY'))
  };
  const jobPostTrends = processTimeSeries(jobPosts);
  const applicationTrends = processTimeSeries(applications);

  const planIds = subscriptionDistribution.map(p => p.planId);
  const plans = await prisma.subscriptionPlan.findMany({ where: { id: { in: planIds } }, select: { id: true, name: true }});
  const planMap = new Map(plans.map(p => [p.id, p.name]));
  
  const subDistributionProcessed = subscriptionDistribution.map(group => ({
      name: planMap.get(group.planId) || 'Unknown',
      // --- THIS IS THE FIX for the possibly 'undefined' error ---
      count: group._count?._all ?? 0,
  }));
  const subscribedAgenciesCount = subscriptionDistribution.reduce((sum, group) => sum + (group._count?._all ?? 0), 0);
  const freeUsers = totalAgencies - subscribedAgenciesCount;
  subDistributionProcessed.push({ name: 'Free', count: freeUsers });

  // Placeholder for Stripe Revenue Data
  const revenueMTD = 0;

  return {
    kpis: {
      totalUsers,
      totalAgencies,
      totalCandidates,
      activeJobs,
      pendingVerifications,
      revenueMTD,
    },
    trends: {
      userSignups: userSignupTrends,
      jobPosts: jobPostTrends,
      applications: applicationTrends,
    },
    subscriptionDistribution: subDistributionProcessed,
  };
}