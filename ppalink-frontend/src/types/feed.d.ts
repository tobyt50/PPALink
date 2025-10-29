import type { Agency } from './agency';

export type FeedType = 'ARTICLE' | 'JOB_POST' | 'EVENT' | 'WEBINAR' | 'INSIGHT' | 'SUCCESS_STORY';
export type FeedCategory = 'LEARN_GROW' | 'FROM_EMPLOYERS' | 'CAREER_INSIGHT' | 'RECOMMENDATION' | 'SUCCESS_STORY';
export type BoostStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'FAILED';

export interface FeedBoost {
  id: string;
  feedItemId: string;
  tier: { name: BoostTierName };
  status: BoostStatus;
  startDate: string;
  endDate: string;
}
export interface FeedItem {
  id: string;
  type: FeedType;
  category: FeedCategory;
  audience: FeedAudience;
  title: string;
  content: string;
  link: string | null;
  ctaText: string | null;
  imageUrl?: string | null;
  agency?: {
    id: string;
    name: string;
  };
  
  userId: string | null;
  user?: {
    id: string;
    email: string;
    candidateProfile: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
  };

  agencyId: string | null;
  userId: string | null;
  createdAt: string | Date;
  isActive: boolean;
  boosts?: FeedBoost[];
}

export interface BoostTier {
  id: string;
  name: 'STANDARD' | 'PREMIUM';
  price: number;
  currency: string;
  durationInDays: number;
  reachMultiplier: number;
  description: string;
  stripePriceId: string;
}

export interface PaginatedFeedResponse {
  data: FeedItem[];
  nextCursor: string | null;
}