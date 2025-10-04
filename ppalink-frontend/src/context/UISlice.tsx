import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

// read initial value from localStorage (fallback to true)
const stored = localStorage.getItem('sidebarOpen');
const initialOpen = stored !== null ? stored === 'true' : true;

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: initialOpen,
  setSidebarOpen: (isOpen) => {
    localStorage.setItem('sidebarOpen', String(isOpen));
    set({ isSidebarOpen: isOpen });
  },
  toggleSidebar: () =>
    set((state) => {
      const next = !state.isSidebarOpen;
      localStorage.setItem('sidebarOpen', String(next));
      return { isSidebarOpen: next };
    }),
}));
