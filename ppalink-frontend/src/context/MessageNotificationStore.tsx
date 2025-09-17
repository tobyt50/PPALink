import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface MessageNotificationState {
  unreadMessageCount: number;
  setUnreadMessageCount: (count: number) => void;
  incrementUnreadCount: () => void;
  clearUnreadCount: () => void;
}

export const useMessageNotificationStore = create<MessageNotificationState>()(
  persist(
    (set) => ({
      unreadMessageCount: 0,
      setUnreadMessageCount: (count) => set({ unreadMessageCount: count }),
      incrementUnreadCount: () => set((state) => ({ unreadMessageCount: state.unreadMessageCount + 1 })),
      clearUnreadCount: () => set({ unreadMessageCount: 0 }),
    }),
    {
      name: 'message-notification-storage',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage to reset on browser close
    }
  )
);