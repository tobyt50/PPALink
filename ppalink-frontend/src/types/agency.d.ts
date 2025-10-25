import type { SubscriptionPlan } from './subscription';
import type { AgencyMember } from './user';
import type { Position } from './job';

export interface AgencySubscription {
  id: string;
  agencyId: string;
  planId: string;
  startDate: string;
  endDate: string | null;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripeCurrentPeriodEnd: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'INCOMPLETE';
  plan: SubscriptionPlan;
}

export interface Industry {
  id: number;
  name: string;
  isHeading: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Agency {
  id: string;
  ownerUserId: string;
  name: string;
  rcNumber: string | null;
  industryId: number | null;
  industry?: Industry | null;
  website: string | null;
  sizeRange: string | null;
  domain: string | null;
  domainVerified: boolean;
  cacVerified: boolean;
  hasCompletedOnboarding: boolean;
  logoKey: string | null;
  countryId: number | null;
  regionId: number | null;
  cityId: number | null;
  createdAt: string;

  members?: AgencyMember[];
  invitations?: Invitation[];
  subscriptions?: AgencySubscription[];
  freePlanSettings?: {
    jobPostLimit: number;
    memberLimit: number;
  };
  positions?: Position[];
  industry?: {
      name: string;
  };
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';

export interface Invitation {
    id: string;
    email: string;
    agencyId: string;
    expiresAt: string;
    status: InvitationStatus;
}