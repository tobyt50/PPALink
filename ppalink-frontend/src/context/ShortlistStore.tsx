import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import agencyService from '../services/agency.service';
import type { CandidateProfile } from '../types/candidate';

interface ShortlistState {
  shortlistedIds: string[];
  hasFetched: boolean;
  fetchShortlist: () => Promise<void>;
  addShortlistId: (candidateId: string) => void;
  removeShortlistId: (candidateId: string) => void;
  clearShortlist: () => void;
}

export const useShortlistStore = create<ShortlistState>()(
  persist(
    (set, get) => ({
      shortlistedIds: [],
      hasFetched: false,

      // Action to fetch the initial list of shortlisted candidate IDs
      fetchShortlist: async () => {
        if (get().hasFetched) return; // Prevent multiple fetches
        try {
          const candidates: CandidateProfile[] = await agencyService.getShortlistedCandidates();
          const ids = candidates.map(candidate => candidate.id);
          set({ shortlistedIds: ids, hasFetched: true });
        } catch (error) {
          console.error("Failed to fetch shortlist:", error);
          set({ hasFetched: true }); // Mark as fetched even on error to prevent re-fetching
        }
      },

      // Action to add a new ID to the list after a successful shortlist
      addShortlistId: (candidateId: string) => {
        set((state) => ({
          shortlistedIds: [...state.shortlistedIds, candidateId],
        }));
          },
      
          removeShortlistId: (candidateId: string) => {
            set((state) => ({
              shortlistedIds: state.shortlistedIds.filter(id => id !== candidateId),
            }));
          },

      // Action to clear the store on logout
      clearShortlist: () => {
        set({ shortlistedIds: [], hasFetched: false });
      },
    }),
    {
      name: 'shortlist-storage', // Key for localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);