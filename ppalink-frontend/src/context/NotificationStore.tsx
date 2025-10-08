import { create } from 'zustand';
import type { NotificationType } from '../types/notification';
import notificationService from '../services/notification.service';

interface NotificationStatus {
  GENERIC?: number;
  MESSAGE?: number;
  NEW_QUIZ?: number;
}

interface NotificationStoreState {
  status: NotificationStatus;
  
  /**
   * Fetches the latest unread notification counts from the backend.
   * This should be called on login.
   */
  fetchStatus: () => Promise<void>;

  /**
   * Marks all notifications of a specific type as read on the backend
   * and optimistically updates the local state.
   */
  markAsRead: (type: NotificationType) => Promise<void>;

  /**
   * A real-time update function to be called by a socket event.
   * It increments the count for a given notification type.
   */
  incrementCount: (type: NotificationType) => void;

  // --- DERIVED STATE & SELECTORS ---
  // These provide easy access to the data for UI components.

  /**
   * Checks if there are any unread GENERIC notifications.
   */
  hasNewGeneric: () => boolean;

  /**
   * Returns the number of unread MESSAGE notifications.
   */
  messageCount: () => number;
  
  /**
   * Checks if there are any unread NEW_QUIZ notifications.
   */
  hasNewQuiz: () => boolean;
}

export const useNotificationStore = create<NotificationStoreState>((set, get) => ({
  status: {},
  
  fetchStatus: async () => {
    try {
      const newStatus = await notificationService.getNotificationStatus();
      set({ status: newStatus });
    } catch (error) {
      console.error("Failed to fetch notification status", error);
      set({ status: {} }); // Reset on error
    }
  },

  markAsRead: async (type: NotificationType) => {
    try {
      // Call the backend to mark them as read
      await notificationService.markAllAsRead(type);
      
      // Optimistically update the local state to 0 for a snappy UI response
      set(state => {
        const newStatus = { ...state.status };
        newStatus[type] = 0; // Set the count for this type to zero
        return { status: newStatus };
      });
    } catch (error) {
      console.error(`Failed to mark ${type} notifications as read`, error);
      // If the API call fails, we could optionally refetch the true status from the server
      get().fetchStatus();
    }
  },

  incrementCount: (type: NotificationType) => {
    set(state => {
        const newStatus = { ...state.status };
        newStatus[type] = (newStatus[type] || 0) + 1;
        return { status: newStatus };
    });
  },

  // --- Selectors ---
  hasNewGeneric: () => (get().status.GENERIC ?? 0) > 0,
  messageCount: () => get().status.MESSAGE ?? 0,
  hasNewQuiz: () => (get().status.NEW_QUIZ ?? 0) > 0,
}));