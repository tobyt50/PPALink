import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '../types/user';

// Define the shape of our store's state
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// Create the store
export const useAuthStore = create<AuthState>()(
  // Use the `persist` middleware
  persist(
    // The first argument is the function that defines the store
    (set) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,

      // Actions (functions to update the state)
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    // The second argument is the configuration for the middleware
    {
      name: 'auth-storage', // The key to use in localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
    }
  )
);