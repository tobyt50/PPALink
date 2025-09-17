export interface SubscriptionPlan {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    features: string[];
    stripePriceId: string;
    
    jobPostLimit: number;
  }