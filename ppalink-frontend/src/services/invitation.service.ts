import apiClient from '../config/axios';
import type { User } from '../types/user';

interface VerifyTokenResponse {
    email: string;
    userExists: boolean;
  }

interface AcceptInvitePayload {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

class InvitationService {
  /**
   * Verifies an invitation token with the backend.
   * @param token The invitation token from the URL.
   */
  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    const response = await apiClient.get(`/public/invitations/verify/${token}`);
    return response.data.data;
  }

  /**
   * Submits the new user's details to finalize the invitation process.
   * @param payload The form data including the token.
   */
  async acceptInvite(payload: AcceptInvitePayload): Promise<User> {
    const response = await apiClient.post('/public/invitations/accept', payload);
    return response.data.data;
  }
    
    /**
   * Accepts an invitation as the currently authenticated user.
   * @param token The invitation token from the URL.
   */
  async acceptInviteAsLoggedInUser(token: string): Promise<void> {
    // Note: The backend route is /api/agencies/invitations/accept
    await apiClient.post('/candidates/invitations/accept', { token });
  }
}

export default new InvitationService();