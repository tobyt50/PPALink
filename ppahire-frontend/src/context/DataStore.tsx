import { create } from 'zustand';
import apiClient from '../config/axios';

export interface Industry {
  id: number;
  name: string;
}

export interface LocationState {
  id: number;
  name: string;
}

interface DataState {
  industries: Industry[];
  states: LocationState[];
  isLoading: boolean; // 1. Add isLoading state
  hasFetched: boolean;
  fetchLookupData: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  industries: [],
  states: [],
  isLoading: false, // 2. Initialize as false
  hasFetched: false,

  fetchLookupData: async () => {
    if (get().hasFetched || get().isLoading) { // Prevent re-fetch if already fetched or currently loading
      return;
    }

    set({ isLoading: true }); // 3. Set loading to true before the API call

    try {
      const [industriesRes, statesRes] = await Promise.all([
        apiClient.get('/utils/industries'),
        apiClient.get('/utils/location-states')
      ]);

      set({
        industries: industriesRes.data.data,
        states: statesRes.data.data,
        hasFetched: true,
      });
    } catch (error) {
      console.error("Failed to fetch lookup data:", error);
    } finally {
      set({ isLoading: false }); // 4. Set loading to false after the call finishes (success or fail)
    }
  },
}));