import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../config/axios';

interface CurrencyState {
  // The viewer's local currency (e.g., "USD")
  viewerCurrency: string;
  // A map to store multiple rate objects, e.g., { "NGN": { "USD": 0.0007, ... }, "USD": { "NGN": 1500, ... } }
  rateSets: Record<string, Record<string, number>>;
  
  setViewerCurrency: (currency: string) => void;
  initializeCurrency: () => Promise<void>;
  // The fetch action now takes a base currency
  fetchRates: (baseCurrency: string) => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      viewerCurrency: 'NGN', // Default fallback
      rateSets: {},
      
      setViewerCurrency: (currency) => set({ viewerCurrency: currency }),
      
      initializeCurrency: async () => {
        // Only run this once on initial app load
        if (get().viewerCurrency !== 'NGN' && get().viewerCurrency !== 'USD') return;

        try {
          const response = await fetch('https://ipapi.co/json/');
          if (!response.ok) throw new Error('Failed to fetch geo IP.');
          const data = await response.json();
          if (data && data.currency) {
            set({ viewerCurrency: data.currency });
            // After finding the viewer's currency, fetch rates for it and NGN.
            get().fetchRates(data.currency);
            get().fetchRates('NGN');
          } else {
             get().fetchRates('USD'); // Fallback for serverside rendering etc.
             get().fetchRates('NGN');
          }
        } catch (error) {
          console.error("Could not determine currency from IP, defaulting to NGN.", error);
          set({ viewerCurrency: 'NGN' });
          get().fetchRates('NGN');
        }
      },

      fetchRates: async (baseCurrency: string) => {
        // Don't refetch if we already have rates for this base currency
        if (get().rateSets[baseCurrency]) return;

        try {
          const response = await apiClient.get(`/public/exchange-rates?base=${baseCurrency}`);
          set(state => ({
            rateSets: {
              ...state.rateSets,
              [baseCurrency]: response.data.data,
            }
          }));
        } catch (error) {
          console.error(`Failed to fetch exchange rates for ${baseCurrency}`, error);
        }
      },
    }),
    {
      name: 'currency-storage',
      partialize: (state) => ({ viewerCurrency: state.viewerCurrency }),
    }
  )
);