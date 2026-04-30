import { create } from 'zustand';
import { NearbySuggestion, NearbyCategory } from '../types';
import { fetchNearbySuggestions } from '../services/aiClient';
import { getCurrentLocation } from '../services/geolocationService';
import { useWeatherStore } from './weatherStore';
import { useAppStore } from './appStore';

interface LocationInfo {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface ExploreState {
  suggestions: NearbySuggestion[];
  location: LocationInfo | null;
  activeCategory: NearbyCategory | null;
  isLoadingLocation: boolean;
  isLoadingSuggestions: boolean;
  locationError: string | null;
  suggestionsError: string | null;
  hasFetched: boolean;

  fetchSuggestions: () => Promise<void>;
  setActiveCategory: (cat: NearbyCategory | null) => void;
  setLocationManually: (city: string, lat: number, lng: number, country: string) => void;
  reset: () => void;
}

const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const useExploreStore = create<ExploreState>((set, get) => ({
  suggestions: [],
  location: null,
  activeCategory: null,
  isLoadingLocation: false,
  isLoadingSuggestions: false,
  locationError: null,
  suggestionsError: null,
  hasFetched: false,

  fetchSuggestions: async () => {
    set({ isLoadingLocation: true, locationError: null, suggestionsError: null, suggestions: [], hasFetched: false });

    // Step 1: Get location
    let loc: LocationInfo;
    try {
      const geoResult = await getCurrentLocation();
      loc = {
        city: geoResult.city || geoResult.displayName,
        country: geoResult.country || '',
        lat: geoResult.lat,
        lng: geoResult.lng,
      };
      set({ location: loc, isLoadingLocation: false });
    } catch {
      set({ isLoadingLocation: false, locationError: 'LOCATION_ERROR' });
      return;
    }

    // Step 2: Fetch weather (best-effort, don't block on failure)
    let weatherSummary: { temp: number; conditions: string; precipprob: number } | null = null;
    try {
      const weatherStore = useWeatherStore.getState();
      await weatherStore.fetchWeather(loc.city);
      const data = useWeatherStore.getState().weatherData;
      if (data?.currentConditions) {
        weatherSummary = {
          temp: data.currentConditions.temp,
          conditions: data.currentConditions.conditions,
          precipprob: data.currentConditions.precipprob ?? 0,
        };
      }
    } catch {
      // Continue without weather
    }

    // Step 3: Fetch AI suggestions
    set({ isLoadingSuggestions: true });
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const dayOfWeek = DAYS_EN[now.getDay()];
      const { language } = useAppStore.getState();

      const result = await fetchNearbySuggestions(
        loc.city,
        loc.country,
        weatherSummary,
        currentTime,
        dayOfWeek,
        language
      );
      set({ suggestions: result, isLoadingSuggestions: false, hasFetched: true });
    } catch (err) {
      console.error('Nearby suggestions failed:', err);
      set({ isLoadingSuggestions: false, suggestionsError: 'SUGGESTIONS_ERROR', hasFetched: true });
    }
  },

  setActiveCategory: (cat) => set({ activeCategory: cat }),

  setLocationManually: (city, lat, lng, country) => {
    set({
      location: { city, country, lat, lng },
      locationError: null,
    });
  },

  reset: () =>
    set({
      suggestions: [],
      location: null,
      activeCategory: null,
      isLoadingLocation: false,
      isLoadingSuggestions: false,
      locationError: null,
      suggestionsError: null,
      hasFetched: false,
    }),
}));
