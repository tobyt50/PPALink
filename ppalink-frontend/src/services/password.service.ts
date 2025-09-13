import apiClient from '../config/axios';

class PasswordService {
  /**
   * Sends a request to the backend to initiate the password reset process.
   * @param email The user's email address.
   */
  async requestReset(email: string): Promise<void> {
    await apiClient.post('/password/request-reset', { email });
  }

  /**
   * Sends the new password and the reset token to the backend.
   * @param token The password reset token from the URL.
   * @param password The user's new password.
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/password/reset', { token, password });
  }
}

export default new PasswordService();