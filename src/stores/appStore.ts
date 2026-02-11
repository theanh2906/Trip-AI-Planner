import { create } from 'zustand';
import { Language, Currency } from '../types';
import { getDefaultCurrency } from '../utils/currency';

export type FeatureType =
  | 'trip-planner'
  | 'budget'
  | 'weather'
  | 'ai-assistant'
  | 'saved-trips'
  | 'settings';

interface AppState {
  activeFeature: FeatureType;
  isSidebarOpen: boolean;
  language: Language;
  currency: Currency;
  isOnline: boolean;

  setActiveFeature: (feature: FeatureType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLanguage: (lang: Language) => void;
  setCurrency: (currency: Currency) => void;
  setOnline: (online: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeFeature: 'trip-planner',
  isSidebarOpen: false,
  language: 'vi',
  currency: 'VND',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,

  setActiveFeature: (feature) => set({ activeFeature: feature }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setLanguage: (lang) =>
    set((state) => ({
      language: lang,
      // Auto-switch currency to default when language changes (only if current is the old default)
      currency:
        state.currency === getDefaultCurrency(state.language)
          ? getDefaultCurrency(lang)
          : state.currency,
    })),
  setCurrency: (currency) => set({ currency }),
  setOnline: (online) => set({ isOnline: online }),
}));
