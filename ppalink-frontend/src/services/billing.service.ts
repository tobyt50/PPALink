import apiClient from '../config/axios';

interface CreateCheckoutSessionResponse {
  url: string;
}

class BillingService {
  /**
   * Asks our backend to create a new Stripe Checkout session for a given plan.
   * @param planId The ID of the subscription plan from our database.
   */
  async createCheckoutSession(planId: string): Promise<CreateCheckoutSessionResponse> {
    const response = await apiClient.post('/billing/create-checkout-session', { planId });
    return response.data.data;
  }

  /**
   * Asks our backend to create a Stripe Customer Portal session.
   */
  async createPortalSession(): Promise<CreateCheckoutSessionResponse> {
    const response = await apiClient.post('/billing/create-portal-session');
    return response.data.data;
  }
}

export default new BillingService();