import { create } from 'zustand';
import type { LucideIcon } from 'lucide-react';

export interface ActivityEvent {
  id: string;
  message: string;
  timestamp: Date;
  icon: LucideIcon;
}

interface ActivityState {
  events: ActivityEvent[];
  addEvent: (newEvent: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  events: [],
  addEvent: (newEvent) => {
    set((state) => ({
      events: [
        { ...newEvent, id: new Date().toISOString(), timestamp: new Date() },
        ...state.events
      ].slice(0, 10) // Keep a buffer of the last 10 events
    }));
  },
}));