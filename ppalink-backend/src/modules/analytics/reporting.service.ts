import { Prisma, Role } from '@prisma/client';
import { parseISO, startOfDay, endOfDay, format } from 'date-fns';
import prisma from '../../config/db';
import type { ReportFilters } from './reporting.types';

// --- Helper types for groupBy results to ensure type safety ---
type StateGroup = { primaryStateId: number | null; _count: { _all: number } };
type NyscBatchGroup = { nyscBatch: string | null; _count: { _all: number } };
type GpaGroup = { grade: string | null; _count: { _all: number } };
type SkillGroup = { skillId: number; _count: { _all: number } };
type CountGroupBy<T> = { [key in keyof T]: T[key] } & { _count: { _all: number } };

interface SalaryInsightsFilters {
  stateId?: number;
  industryId?: number;
  skillId?: number;
}

/**
 * Generates a comprehensive Candidate Insights report based on dynamic filters.
 */
export async function generateCandidateInsightsReport(filters: ReportFilters) {
  const { startDate, endDate, industryId, fieldOfStudy, planId, ...candidateFilters } = filters;

  const whereClause: Prisma.CandidateProfileWhereInput = {
    user: {
      createdAt: {
        gte: startOfDay(parseISO(startDate)),
        lte: endOfDay(parseISO(endDate)),
      },
    },
    primaryStateId: candidateFilters.stateId,
    lgaId: candidateFilters.lgaId,
    nyscBatch: candidateFilters.nyscBatch,
    nyscStream: candidateFilters.nyscStream,
    gpaBand: candidateFilters.gpaBand,
    graduationYear: candidateFilters.graduationYear,
    isVerified: candidateFilters.isVerified,
    isOpenToReloc: candidateFilters.isOpenToReloc,
  };

  if (industryId) { whereClause.applications = { some: { position: { agency: { industryId } } } }; }
  if (planId) { whereClause.applications = { some: { position: { agency: { subscriptions: { some: { planId } } } } } }; }
  if (fieldOfStudy) {
      whereClause.education = { some: { field: fieldOfStudy } };
  }

  // --- Run aggregations and safely cast the results ---
  const [
    rawByState,
    rawByNyscBatch,
    rawByGpa,
    rawBySkill
  ] = await prisma.$transaction([
    prisma.candidateProfile.groupBy({ by: ['primaryStateId'], where: whereClause, _count: { _all: true }, orderBy: { _count: { primaryStateId: 'desc' } }, take: 10 }),
    prisma.candidateProfile.groupBy({ by: ['nyscBatch'], where: whereClause, _count: { _all: true }, orderBy: { _count: { nyscBatch: 'desc' } } }),
    
    prisma.education.groupBy({
        by: ['grade'],
        where: {
            candidate: whereClause,
            grade: { not: null, notIn: [''] }
        },
        _count: { _all: true },
        orderBy: { _count: { grade: 'desc' } },
    }),

    prisma.candidateSkill.groupBy({ by: ['skillId'], where: { candidate: whereClause }, _count: { _all: true }, orderBy: { _count: { skillId: 'desc' } }, take: 10 })
  ]);

  const byState = rawByState as StateGroup[];
  const byNyscBatch = rawByNyscBatch as NyscBatchGroup[];
  const byGpa = rawByGpa as GpaGroup[];
  const bySkill = rawBySkill as SkillGroup[];

  // --- Hydrate the results with names ---
  const stateIds = byState.map(s => s.primaryStateId).filter(Boolean) as number[];
  const skillIds = bySkill.map(s => s.skillId);
  
  const [states, skills] = await prisma.$transaction([
      prisma.locationState.findMany({ where: { id: { in: stateIds } } }),
      prisma.skill.findMany({ where: { id: { in: skillIds } } })
  ]);
  
  // --- Format the final payload, safely accessing _count ---
  const geographicDistribution = byState.map(group => ({
      name: states.find(s => s.id === group.primaryStateId)?.name || 'Unknown',
      count: group._count._all,
  }));
  const nyscBatchDistribution = byNyscBatch.map(group => ({
      name: group.nyscBatch || 'Unknown',
      count: group._count._all,
  }));
  const gpaDistribution = byGpa.map(group => ({
      name: group.grade,
      count: group._count._all,
  }));
  const skillDistribution = bySkill.map(group => ({
      name: skills.find(s => s.id === group.skillId)?.name || 'Unknown',
      count: group._count._all,
  }));

  return {
    geographicDistribution,
    nyscBatchDistribution,
    gpaDistribution,
    skillDistribution,
  };
}

/**
 * Generates a comprehensive User Growth report based on DYNAMIC filters using a raw query.
 */
export async function generateUserGrowthReport(filters: ReportFilters) {
  const { startDate, endDate, groupBy, stateId, industryId, planId } = filters;
  
  const startDateIso = startOfDay(parseISO(startDate));
  const endDateIso = endOfDay(parseISO(endDate));
  const rolesToInclude = [Role.CANDIDATE, Role.AGENCY];
  const roleFilter = Prisma.sql`"U"."role" IN (${Prisma.join(rolesToInclude.map(role => Prisma.sql`${role}::"Role"`))})`;
 
  const whereConditions = [
    Prisma.sql`"U"."createdAt" >= ${startDateIso}`,
    Prisma.sql`"U"."createdAt" <= ${endDateIso}`,
    roleFilter,
  ];

  if (stateId) {
    whereConditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "CandidateProfile" "CP" WHERE "CP"."userId" = "U"."id" AND "CP"."primaryStateId" = ${stateId})`);
  }
  if (industryId) {
    whereConditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "Agency" "A" WHERE "A"."ownerUserId" = "U"."id" AND "A"."industryId" = ${industryId})`);
  }
  if (planId) {
    whereConditions.push(Prisma.sql`EXISTS (SELECT 1 FROM "Agency" "A" JOIN "AgencySubscription" "AS" ON "A"."id" = "AS"."agencyId" WHERE "A"."ownerUserId" = "U"."id" AND "AS"."planId" = ${planId})`);
  }

  const query = Prisma.sql`
    SELECT
      DATE_TRUNC(${groupBy}, "U"."createdAt") AS "date",
      "U"."role",
      COUNT("U"."id")::int AS "count"
    FROM "User" AS "U"
    WHERE ${Prisma.join(whereConditions, ' AND ')}
    GROUP BY "date", "U"."role"
    ORDER BY "date" ASC;
  `;

  const result: { date: Date; role: 'CANDIDATE' | 'AGENCY'; count: number }[] = await prisma.$queryRaw(query);

  const processedData = result.reduce((acc, row) => {
    const dateKey = row.date.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = { date: dateKey, CANDIDATE: 0, AGENCY: 0 };
    }
    acc[dateKey][row.role] = row.count;
    return acc;
  }, {} as Record<string, { date: string; CANDIDATE: number; AGENCY: number }>);

  return Object.values(processedData);
}

/**
 * Generates a comprehensive Application Funnel report based on dynamic filters.
 */
export async function generateApplicationFunnelReport(filters: ReportFilters) {
  const { startDate, endDate, stateId, industryId, planId } = filters;
  
  // --- 1. Dynamically build the WHERE clause for the Application table ---
  const whereClause: Prisma.ApplicationWhereInput = {
    createdAt: {
      gte: startOfDay(parseISO(startDate)),
      lte: endOfDay(parseISO(endDate)),
    },
    // We exclude statuses that don't represent forward progress in the funnel
    status: {
      notIn: ['REJECTED', 'WITHDRAWN'],
    },
  };

  // Conditionally add relational filters
  if (stateId) {
    whereClause.position = { stateId: stateId };
  }
  if (industryId) {
    whereClause.position = { agency: { industryId: industryId } };
  }
  if (planId) {
    whereClause.position = { agency: { subscriptions: { some: { planId: planId } } } };
  }

  // --- 2. Run multiple, parallel aggregation queries for each stage of the funnel ---
  // This is more performant and easier to manage than one massive query.
  const [
    appliedCount,
    reviewingCount,
    interviewCount,
    offerCount,
    hiredCount
  ] = await prisma.$transaction([
    // Count all applications that meet the initial criteria
    prisma.application.count({ where: whereClause }),
    
    // Count all that reached at least the REVIEWING stage
    prisma.application.count({ where: { ...whereClause, status: { in: ['REVIEWING', 'INTERVIEW', 'OFFER', 'HIRED'] } } }),
    
    // Count all that reached at least the INTERVIEW stage
    prisma.application.count({ where: { ...whereClause, status: { in: ['INTERVIEW', 'OFFER', 'HIRED'] } } }),

    // Count all that reached at least the OFFER stage
    prisma.application.count({ where: { ...whereClause, status: { in: ['OFFER', 'HIRED'] } } }),

    // Count all that reached the final HIRED stage
    prisma.application.count({ where: { ...whereClause, status: 'HIRED' } }),
  ]);

  // --- 3. Structure the data and calculate conversion rates ---
  const funnelData = [
    { stage: 'Applied', count: appliedCount, conversion: 100 },
    { stage: 'Reviewing', count: reviewingCount, conversion: appliedCount > 0 ? parseFloat(((reviewingCount / appliedCount) * 100).toFixed(1)) : 0 },
    { stage: 'Interview', count: interviewCount, conversion: reviewingCount > 0 ? parseFloat(((interviewCount / reviewingCount) * 100).toFixed(1)) : 0 },
    { stage: 'Offer', count: offerCount, conversion: interviewCount > 0 ? parseFloat(((offerCount / interviewCount) * 100).toFixed(1)) : 0 },
    { stage: 'Hired', count: hiredCount, conversion: offerCount > 0 ? parseFloat(((hiredCount / offerCount) * 100).toFixed(1)) : 0 },
  ];

  return funnelData;
}

/**
 * Generates a comprehensive Agency Insights report based on dynamic filters.
 */
export async function generateAgencyInsightsReport(filters: ReportFilters) {
  const { startDate, endDate, stateId, industryId } = filters;

  const whereClause: Prisma.AgencyWhereInput = {
    owner: {
      createdAt: {
        gte: startOfDay(parseISO(startDate)),
        lte: endOfDay(parseISO(endDate)),
      },
    },
    headquartersStateId: stateId,
    industryId: industryId,
  };

  // 1. Fetch all agencies that match the filters, including their related data.
  const agencies = await prisma.agency.findMany({
    where: whereClause,
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: true },
      },
      _count: {
        select: { positions: true, shortlists: true },
      },
      industry: true, // Include the full industry object
    },
  });

  // 2. Perform all calculations and aggregations on the server.
  const totalAgencies = agencies.length;
  let totalJobsPosted = 0;
  let totalShortlisted = 0;

  const planDistributionMap = new Map<string, number>();
  const industryDistributionMap = new Map<string, number>();
  let freeTierCount = 0;

  for (const agency of agencies) {
    totalJobsPosted += agency._count.positions;
    totalShortlisted += agency._count.shortlists;

    // Tally plan distribution
    const planName = agency.subscriptions[0]?.plan?.name;
    if (planName) {
      planDistributionMap.set(planName, (planDistributionMap.get(planName) || 0) + 1);
    } else {
      freeTierCount++;
    }

    // Tally industry distribution
    const industryName = agency.industry?.name;
    if (industryName) {
      industryDistributionMap.set(industryName, (industryDistributionMap.get(industryName) || 0) + 1);
    }
  }
  
  // 3. Format the data for the frontend.
  const planDistribution = Array.from(planDistributionMap.entries()).map(([name, count]) => ({ name, count }));
  if (freeTierCount > 0) {
    planDistribution.push({ name: 'Free', count: freeTierCount });
  }

  const industryDistribution = Array.from(industryDistributionMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count) // Sort descending
    .slice(0, 10); // Take top 10

  return {
    totalAgencies,
    planDistribution,
    industryDistribution,
    engagement: {
      avgJobsPosted: totalAgencies > 0 ? parseFloat((totalJobsPosted / totalAgencies).toFixed(1)) : 0,
      avgShortlisted: totalAgencies > 0 ? parseFloat((totalShortlisted / totalAgencies).toFixed(1)) : 0,
      totalJobsByGroup: totalJobsPosted,
    },
  };
}

/**
 * Generates a comprehensive Job Market Insights report based on dynamic filters.
 */
export async function generateJobMarketInsightsReport(filters: ReportFilters) {
  const { startDate, endDate, stateId, industryId, planId } = filters;

  const whereClause: Prisma.PositionWhereInput = {
    createdAt: {
      gte: startOfDay(parseISO(startDate)),
      lte: endOfDay(parseISO(endDate)),
    },
    stateId: stateId,
    agency: {
      industryId: industryId,
      subscriptions: planId ? { some: { planId } } : undefined,
    },
  };

  const [
    rawPostingVolume,
    rawByEmploymentType,
    rawRemoteDistribution,
    salaryData
  ] = await prisma.$transaction([
    prisma.position.groupBy({
      by: ['createdAt'],
      where: whereClause,
      _count: { _all: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.position.groupBy({
      by: ['employmentType'],
      where: whereClause,
      _count: { _all: true },
      orderBy: { _count: { employmentType: 'desc' } },
    }),
    prisma.position.groupBy({
      by: ['isRemote'],
      where: whereClause,
      _count: { _all: true },
      orderBy: { _count: { isRemote: 'desc' } },
    }),
    prisma.position.aggregate({
        where: { ...whereClause, minSalary: { not: null }, maxSalary: { not: null } },
        _avg: { minSalary: true, maxSalary: true },
        _min: { minSalary: true },
        _max: { maxSalary: true },
    })
  ]);

  const postingVolume = rawPostingVolume as CountGroupBy<{ createdAt: Date }>[];
  const byEmploymentType = rawByEmploymentType as CountGroupBy<{ employmentType: string }>[];
  const remoteDistribution = rawRemoteDistribution as CountGroupBy<{ isRemote: boolean }>[];
  
  const formattedPostingVolume = postingVolume.reduce((acc, group) => {
      const dateKey = format(group.createdAt, 'yyyy-MM-dd');
      acc[dateKey] = (acc[dateKey] || 0) + group._count._all;
      return acc;
  }, {} as Record<string, number>);

  const formattedByType = byEmploymentType.map(group => ({ 
      name: group.employmentType, 
      count: group._count._all
  }));
  
  const formattedRemote = remoteDistribution.map(group => ({
      name: group.isRemote ? 'Remote' : 'On-site',
      count: group._count._all
  }));

  return {
    postingVolume: formattedPostingVolume,
    byEmploymentType: formattedByType,
    remoteDistribution: formattedRemote,
    salaryAnalytics: {
        avgMin: salaryData._avg.minSalary,
        avgMax: salaryData._avg.maxSalary,
        overallMin: salaryData._min.minSalary,
        overallMax: salaryData._max.maxSalary,
    }
  };
}