export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    currency: string;
    features: string[];
    stripePriceId: string;
    memberLimit: number;
    jobPostLimit: number;
  }