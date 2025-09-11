import apiClient from '../config/axios';
import type { User, VerificationRequest } from '../types/user';

class AdminService {
  /**
   * Updates the status of a specific verification request.
   * @param verificationId The ID of the verification request to update.
   * @param status The new status ('APPROVED' or 'REJECTED').
   */
  async updateVerificationStatus(
    verificationId: string,
    status: 'APPROVED' | 'REJECTED'
  ): Promise<VerificationRequest> {
    
    // This is the correct path format. The issue is in how it's being called.
    const url = `/admin/verifications/${verificationId}/status`;
    const response = await apiClient.patch(url, { status });
    return response.data.data;
  }

  /**
   * Updates the status of a specific user.
   * @param userId The ID of the user to update.
   * @param status The new status for the user ('ACTIVE', 'SUSPENDED').
   */
  async updateUserStatus(
    userId: string,
    status: User['status']
  ): Promise<User> {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { status });
    return response.data.data;
  }
}

export default new AdminService();