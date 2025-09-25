import { create } from 'zustand';
import apiClient from '../config/axios';
import type { Industry } from '../types/agency';

export interface LocationState {
  id: number;
  name: string;
}

export interface University {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  name: string;
}

export interface Degree {
  id: number;
  name: string;
}

interface DataState {
  industries: Industry[];
  states: LocationState[];
  universities: University[];
  courses: string[];
  degrees: Degree[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchLookupData: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  industries: [],
  states: [],
  universities: [],
  courses: [],
  degrees: [],
  isLoading: false,
  hasFetched: false,

  fetchLookupData: async () => {
    if (get().hasFetched || get().isLoading) {
      return;
    }

    set({ isLoading: true });

    try {
      const [industriesRes, statesRes, unisRes, coursesRes, degreesRes] = await Promise.all([
        apiClient.get('/utils/industries'),
        apiClient.get('/utils/location-states'),
        apiClient.get('/utils/universities'),
        apiClient.get('/utils/courses'),
        apiClient.get('/utils/degrees'),
      ]);

      set({
        industries: industriesRes.data.data,
        states: statesRes.data.data,
        universities: unisRes.data.data,
        courses: coursesRes.data.data,
        degrees: degreesRes.data.data,
        hasFetched: true,
      });
    } catch (error) {
      console.error("Failed to fetch lookup data:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
