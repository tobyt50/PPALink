import type { ApplicationStatus } from './application';
import type { Application } from './application';
import type { Position } from './job';
import type { Role } from './user';


// --- Admin Analytics ---
export interface AdminDashboardAnalytics {
  totalUsers: number;
  userDistribution: {
    candidates: number;
    agencies: number;
    admins: number;
  };
  totalJobs: number;
  totalApplications: number;
  pendingVerifications: number;
}

interface TimeSeriesDataPoint {
  createdAt: string; // Date string
  _count: { _all: number };
}

interface UserSignupDataPoint {
  createdAt: string;
  role: Role;
  _count: { _all: number };
}

export interface AdminTimeSeriesData {
  userSignups: UserSignupDataPoint[];
  jobsPosted: TimeSeriesDataPoint[];
  applicationsSubmitted: TimeSeriesDataPoint[];
}

// TYPES for the Reporting page
export interface ReportFilters {
  startDate: string; // ISO string
  endDate: string;   // ISO string
  groupBy: 'day' | 'week' | 'month';
  stateId?: number;
  industryId?: number;
  planId?: string;
  fieldOfStudy?: string;
}

export interface UserGrowthDataPoint {
    date: string; // YYYY-MM-DD
    CANDIDATE: number;
    AGENCY: number;
}

// TYPE for the Funnel Report data points
export interface FunnelDataPoint {
  stage: 'Applied' | 'Reviewing' | 'Interview' | 'Offer' | 'Hired';
  count: number;
  conversion: number; // Conversion rate from the PREVIOUS stage
}

export interface NameCountPair {
  name: string;
  count: number;
}

export interface CandidateInsightsData {
  geographicDistribution: NameCountPair[];
  nyscBatchDistribution: NameCountPair[];
  gpaDistribution: NameCountPair[];
  skillDistribution: NameCountPair[];
}
export interface AgencyInsightsData {
  totalAgencies: number;
  planDistribution: NameCountPair[];
  industryDistribution: NameCountPair[];
  engagement: {
    avgJobsPosted: number;
    avgShortlisted: number;
    totalJobsByGroup: number;
  };
}

// TYPE for the Job Market Insights Report data
export interface JobMarketInsightsData {
  postingVolume: Record<string, number>; // { "2025-09-15": 5, ... }
  byEmploymentType: NameCountPair[];
  remoteDistribution: NameCountPair[];
  salaryAnalytics: {
    avgMin: number | null;
    avgMax: number | null;
    overallMin: number | null;
    overallMax: number | null;
  };
}

// --- Agency Analytics ---

// Tier 1: Data available to Free plan users
export interface AgencyFreeAnalytics {
  planName: 'Free';
  openJobsCount: number;
}

// Tier 2: Data available to Pro plan users (includes everything from Free)
export interface AgencyProAnalytics extends AgencyFreeAnalytics {
  planName: 'Pro' | 'Enterprise';
  totalJobsPosted: number;
  totalApplications: number;
  totalShortlisted: number;
  applicationStatusDistribution: Record<ApplicationStatus, number>;
  applicationTrends: Record<string, number>; // e.g., { "Sep 2025": 10 }
}

// Tier 3: Data available to Enterprise users (includes everything from Pro)
export interface AgencyEnterpriseAnalytics extends AgencyProAnalytics {
  planName: 'Enterprise';
  skillsHeatmap: Record<string, number>;
  geographicSourcing: Record<string, number>;
}

export interface AgencyDashboardData {
  verificationStatus: {
    domainVerified: boolean;
    cacVerified: boolean;
  };
  stats: {
    openJobs: number;
    totalApps: number;
    totalShortlisted: number;
  };
  // Use Pick to select only the fields we need, keeping the payload small
  recentApplications: (Pick<Application, 'id' | 'status'> & {
    candidate: Pick<CandidateProfile, 'id' | 'firstName' | 'lastName'>;
    position: Pick<Position, 'id' | 'title'>;
  })[];
  activeJobs: (Pick<Position, 'id' | 'title' | 'status' | 'agencyId'> & {
    _count: { applications: number };
  })[];
}

export interface CandidateDashboardData {
  profileCompleteness: number;
  stats: {
    totalApplications: number;
    interviews: number;
    offers: number;
    verifiedSkills: number;
  };
  recentApplications: (Pick<Application, 'id' | 'status'> & {
    position: Pick<Position, 'title'> & {
        agency: { name: string };
    };
  })[];
  isVerified: boolean;
}

// A master union type that can represent any of the possible analytics payloads for an agency
export type AgencyAnalyticsData = AgencyFreeAnalytics | AgencyProAnalytics | AgencyEnterpriseAnalytics;