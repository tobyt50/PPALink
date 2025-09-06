import { create } from 'zustand';
import apiClient from '../config/axios';

// Define the types for our lookup data, which can be shared
export interface Industry {
  id: number;
  name: string;
}

export interface LocationState {
  id: number;
  name: string;
}

// Define the shape of our store's state and actions
interface DataState {
  industries: Industry[];
  states: LocationState[];
  hasFetched: boolean; // To ensure we only fetch once
  fetchLookupData: () => Promise<void>;
}

// Create the Zustand store
export const useDataStore = create<DataState>((set, get) => ({
  industries: [],
  states: [],
  hasFetched: false,

  // Action to fetch all necessary lookup data
  fetchLookupData: async () => {
    // If we have already fetched, don't do it again
    if (get().hasFetched) {
      return;
    }

    try {
      // Use Promise.all to fetch both datasets in parallel for efficiency
      const [industriesRes, statesRes] = await Promise.all([
        apiClient.get('/utils/industries'),
        apiClient.get('/utils/location-states')
      ]);

      set({
        industries: industriesRes.data.data,
        states: statesRes.data.data,
        hasFetched: true, // Mark as fetched
      });
    } catch (error) {
      console.error("Failed to fetch lookup data:", error);
      // You could set an error state here if needed
    }
  },
}));