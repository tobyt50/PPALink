import apiClient from '../config/axios';
import type { BoostTier } from '../types/feed';

class BoostService {
  /**
   * Fetches all available boost tiers from the database.
   */
  async getAvailableTiers(): Promise<BoostTier[]> {
    // We need to create this public endpoint
    const response = await apiClient.get('/boosts/boost-tiers');
    return response.data.data;
  }

  /**
   * Creates a Stripe Checkout session for boosting a specific feed post.
   * @param feedItemId The ID of the post to boost.
   * @param tierName The name of the selected boost tier ('STANDARD' or 'PREMIUM').
   */
  async createBoostCheckoutSession(feedItemId: string, tierName: 'STANDARD' | 'PREMIUM'): Promise<{ url: string }> {
    const response = await apiClient.post('/boosts/create-checkout-session', { feedItemId, tierName });
    return response.data.data;
  }
}

export default new BoostService();