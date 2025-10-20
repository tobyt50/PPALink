import type {
  AuthResponse,
  Generate2faResponse,
  LoginPayload,
  RegisterAgencyPayload,
  RegisterCandidatePayload
} from '../types/auth';
import apiClient from '../config/axios';
import type { User } from '../types/user';

class AuthService {
  async registerCandidate(payload: RegisterCandidatePayload): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register/candidate', payload);
    return response.data;
  }

  async registerAgency(payload: RegisterAgencyPayload): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register/agency', payload);
    return response.data;
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  }

  async changePassword(newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', { newPassword });
  }

  async generate2faSecret(): Promise<Generate2faResponse> {
      const response = await apiClient.post('/auth/2fa/generate');
      return response.data.data;
  }
  
  async enable2fa(token: string): Promise<void> {
      await apiClient.post('/auth/2fa/enable', { token });
  }

  /**
   * Fetches the full profile object for the currently authenticated user.
   * This is used to re-sync the frontend state with the latest backend data.
   */
  async getMyProfile(): Promise<User> {
    const response = await apiClient.get('/auth/me/profile');
    return response.data.data;
  }

  /**
   * Disables 2FA for the logged-in user.
   * @param token The current 2FA token to authorize the action.
   */
  async disable2fa(token: string): Promise<void> {
    await apiClient.post('/auth/2fa/disable', { token });
  }

  /**
   * Updates the avatar key for the currently logged-in user.
   * @param avatarKey The new S3 key for the user's avatar.
   */
  async updateAvatar(avatarKey: string): Promise<User> {
    const response = await apiClient.patch('/auth/me/avatar', { avatarKey });
    return response.data.data;
  }
}

export default new AuthService();