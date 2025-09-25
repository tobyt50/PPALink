import apiClient from '../config/axios';
import type { Position } from '../types/job';
import type { User, VerificationRequest } from '../types/user';
import type { SubscriptionPlan } from '../types/subscription';
import type { AuditLog, PaginatedResponse, Role } from '../types/user';

export interface AdminUser {
    id: string;
    email: string;
    role: Role;
    status: 'ACTIVE' | 'SUSPENDED';
    createdAt: string;
}
interface ImpersonateResponse {
  token: string;
  user: User;
}

export interface PlatformSetting {
  key: string;
  value: any;
  description: string | null;
}

export interface FeatureFlag {
  name: string;
  description: string | null;
  isEnabled: boolean;
}

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

  async forceVerifyEmail(userId: string): Promise<void> {
    await apiClient.post(`/admin/users/${userId}/force-verify-email`);
  }

  async forceVerifyNysc(userId: string): Promise<void> {
    await apiClient.post(`/admin/users/${userId}/force-verify-nysc`);
  }

  async forceVerifyDomain(userId: string): Promise<void> {
    await apiClient.post(`/admin/users/${userId}/force-verify-domain`);
  }
  
  async forceVerifyCac(userId: string): Promise<void> {
    await apiClient.post(`/admin/users/${userId}/force-verify-cac`);
  }

  /**
   * Sends a message from the system account to a specific user.
   * @param userId The ID of the user to message.
   * @param message The content of the message.
   */
  async sendSystemMessage(userId: string, message: string): Promise<void> {
    await apiClient.post(`/admin/users/${userId}/send-message`, { message });
  }

  /**
   * Requests a short-lived impersonation token for a specific user.
   * @param userId The ID of the user to impersonate.
   */
  async impersonateUser(userId: string): Promise<ImpersonateResponse> {
    const response = await apiClient.post(`/admin/users/${userId}/impersonate`);
    return response.data.data;
  }

  async adminUpdateJob(jobId: string, data: any): Promise<Position> {
    const response = await apiClient.patch(`/admin/jobs/${jobId}`, data);
    return response.data.data;
  }

  async adminUnpublishJob(jobId: string): Promise<void> {
    await apiClient.post(`/admin/jobs/${jobId}/unpublish`);
  }

  async adminRepublishJob(jobId: string): Promise<void> {
    await apiClient.post(`/admin/jobs/${jobId}/republish`);
  }

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get('/admin/plans');
    return response.data.data;
  }

  async createPlan(planData: Omit<SubscriptionPlan, 'id' | 'stripePriceId'>): Promise<SubscriptionPlan> {
    const response = await apiClient.post('/admin/plans', planData);
    return response.data.data;
  }

  async updatePlan(planId: string, planData: Partial<Omit<SubscriptionPlan, 'id' | 'stripePriceId'>>): Promise<SubscriptionPlan> {
    const response = await apiClient.patch(`/admin/plans/${planId}`, planData);
    return response.data.data;
  }

  async deletePlan(planId: string): Promise<void> {
    await apiClient.delete(`/admin/plans/${planId}`);
  }

  /**
   * Requests a Stripe Customer Portal session link for a specific agency.
   * @param agencyId The ID of the agency.
   */
  async createStripePortalSession(agencyId: string): Promise<{ url: string }> {
    const response = await apiClient.post('/admin/subscriptions/create-portal-session', { agencyId });
    return response.data.data;
  }

  // METHODS for settings management

  async getAllSettings(): Promise<PlatformSetting[]> {
    const response = await apiClient.get('/admin/settings');
    return response.data.data;
  }

  async updateSettings(settings: { key: string; value: any }[]): Promise<void> {
    await apiClient.patch('/admin/settings', settings);

  }
  
  async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    const response = await apiClient.get('/admin/feature-flags');
    return response.data.data;
  }

  async updateFeatureFlag(flagName: string, isEnabled: boolean): Promise<FeatureFlag> {
    const response = await apiClient.patch(`/admin/feature-flags/${flagName}`, { isEnabled });
    return response.data.data;
  }

  async getAuditLogs(queryParams?: URLSearchParams): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get(`/admin/audit-logs?${queryParams?.toString() || ''}`);
    return response.data;
  }

  async getFullAuditLogExport(): Promise<AuditLog[]> {
    const response = await apiClient.get('/admin/audit-logs/export');
    return response.data.data;
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    const response = await apiClient.get('/admin/admins');
    return response.data.data;
  }

  async createAdmin(email: string, role: Role): Promise<User> {
    const response = await apiClient.post('/admin/admins', { email, role });
    return response.data.data;
  }

  async deleteAdmin(userId: string): Promise<void> {
    await apiClient.delete(`/admin/admins/${userId}`);
  }
}

export default new AdminService();