import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '../types/user';
import authService from '../services/auth.service';
import { useNotificationStore } from './NotificationStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  impersonator: { user: User; token: string } | null;
  isImpersonating: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  startImpersonation: (impersonatedUser: User, impersonationToken: string) => void;
  stopImpersonation: () => void;
  refreshUser: () => Promise<void>;
}

// Create the store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      impersonator: null, // Changed from impersonatorToken
      isImpersonating: false,

      // Actions
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
        useNotificationStore.getState().fetchStatus();
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          impersonator: null, // Ensure this is cleared
          isImpersonating: false,
        });
      },

      // 3. Update the impersonation actions to handle the full user object
      startImpersonation: (impersonatedUser, impersonationToken) => {
        const adminUser = get().user;
        const adminToken = get().token;

        if (!adminUser || !adminToken) {
          console.error("Cannot start impersonation without an active admin session.");
          return;
        }

        set({
          user: impersonatedUser,
          token: impersonationToken,
          isAuthenticated: true,
          impersonator: { user: adminUser, token: adminToken }, // Store the full session
          isImpersonating: true,
        });
        useNotificationStore.getState().fetchStatus();
      },
      stopImpersonation: () => {
        const adminSession = get().impersonator;

        if (!adminSession) {
          get().logout(); // Failsafe if the admin session is lost
          return;
        }
        
        // Restore the entire admin session (user object and token) seamlessly
        set({
          user: adminSession.user,
          token: adminSession.token,
          isAuthenticated: true,
          impersonator: null,
          isImpersonating: false,
        });
        useNotificationStore.getState().fetchStatus();
      },
      refreshUser: async () => {
        try {
            const freshUser = await authService.getMyProfile();
            set({ user: freshUser });
            useNotificationStore.getState().fetchStatus();
        } catch (error) {
            console.error("Failed to refresh user session:", error);
            // If the token is expired, this will fail. We should log the user out.
            get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);