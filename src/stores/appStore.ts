import { create } from 'zustand';
import { Language } from '../types';

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
  isOnline: boolean;
  
  setActiveFeature: (feature: FeatureType) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLanguage: (lang: Language) => void;
  setOnline: (online: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeFeature: 'trip-planner',
  isSidebarOpen: false,
  language: 'vi',
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  
  setActiveFeature: (feature) => set({ activeFeature: feature }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setLanguage: (lang) => set({ language: lang }),
  setOnline: (online) => set({ isOnline: online }),
}));
