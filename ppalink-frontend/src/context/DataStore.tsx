import { create } from 'zustand';
import apiClient from '../config/axios';
import type { Industry } from '../types/agency';
import type { Country } from '../types/location';

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
export interface Skill {
  id: number;
  name: string;
  slug: string;
}

interface DataState {
  industries: Industry[];
  universities: University[];
  courses: string[];
  degrees: Degree[];
  skills: Skill[];
  verifiableSkills: Skill[];
  isLoading: boolean;
  hasFetched: boolean;
  fetchLookupData: () => Promise<void>;
  fetchSkills: () => Promise<void>;
  countries: Country[];
}

export const useDataStore = create<DataState>((set, get) => ({
  industries: [],
  universities: [],
  courses: [],
  degrees: [],
  skills: [],
  verifiableSkills: [],
  isLoading: false,
  hasFetched: false,
  countries: [],

  fetchLookupData: async () => {
    if (get().hasFetched || get().isLoading) {
      return;
    }
    set({ isLoading: true });
    try {
      const [
        industriesRes,
        unisRes,
        coursesRes,
        degreesRes,
        skillsRes,
        verifiableSkillsRes,
        countriesRes,
      ] = await Promise.all([
        apiClient.get("/utils/industries"),
        apiClient.get("/utils/universities"),
        apiClient.get("/utils/courses"),
        apiClient.get("/utils/degrees"),
        apiClient.get("/utils/skills"),
        apiClient.get("/utils/verifiable-skills"),
        apiClient.get("/locations/countries"),
      ]);

      set({
        industries: industriesRes.data.data,
        universities: unisRes.data.data,
        courses: coursesRes.data.data,
        degrees: degreesRes.data.data,
        skills: skillsRes.data.data,
        verifiableSkills: verifiableSkillsRes.data.data,
        countries: countriesRes.data.data,
        hasFetched: true,
      });
    } catch (error) {
      console.error("Failed to fetch lookup data:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSkills: async () => {
    try {
      const skillsRes = await apiClient.get('/utils/skills');
      set({ skills: skillsRes.data.data });
    } catch (error) {
      console.error("Failed to re-fetch skills", error);
    }
  },
}));