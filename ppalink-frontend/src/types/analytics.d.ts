import type { ApplicationStatus } from './application';
import type { Application } from './application';
import type { Position } from './job';

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