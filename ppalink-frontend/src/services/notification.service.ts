import apiClient from '../config/axios';
import type { Notification, NotificationType } from '../types/notification';

class NotificationService {
  /**
   * Fetches the current user's unread notifications.
   */
  async getMyNotifications(): Promise<Notification[]> {
    const response = await apiClient.get('/notifications');
    return response.data.data;
  }

  // Function to mark a single notification as read
  async markOneAsRead(notificationId: string): Promise<void> {
    await apiClient.post(`/notifications/${notificationId}/read`);
  }
  
  // Function to mark all of a specific type as read
  async markAllAsRead(type: NotificationType): Promise<void> {
    await apiClient.post('/notifications/read', { type });
  }

  async getNotificationStatus(): Promise<Record<NotificationType, number>> {
    const response = await apiClient.get('/notifications/status');
    return response.data.data;
  }
}

export default new NotificationService();