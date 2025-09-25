import { z } from 'zod';
import apiClient from '../config/axios';

// Define types that match the backend API responses and frontend form data
// This creates a contract between your frontend and backend.

// This should match the Zod schema in the backend's auth.types.ts
const registerCandidateSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  password: z.string(),
});
type RegisterCandidatePayload = z.infer<typeof registerCandidateSchema>;

// Similarly for agency registration
const registerAgencySchema = z.object({
  agencyName: z.string(),
  email: z.string(),
  password: z.string(),
});
type RegisterAgencyPayload = z.infer<typeof registerAgencySchema>;

// For login
const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});
type LoginPayload = z.infer<typeof loginSchema>;


// Define the actual service functions
class AuthService {
  async registerCandidate(payload: RegisterCandidatePayload) {
    const response = await apiClient.post('/auth/register/candidate', payload);
    return response.data;
  }

  async registerAgency(payload: RegisterAgencyPayload) {
    const response = await apiClient.post('/auth/register/agency', payload);
    return response.data;
  }

  async login(payload: LoginPayload) {
    const response = await apiClient.post('/auth/login', payload);
    return response.data; // Expected to return { success, message, data: { user, token } }
  }

  /**
   * Allows a logged-in user to change their own password.
   * This is used for the "force password change" flow.
   * @param newPassword The new password to set.
   */
  async changePassword(newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', { newPassword });
  }
}

// Export a singleton instance of the service
export default new AuthService();