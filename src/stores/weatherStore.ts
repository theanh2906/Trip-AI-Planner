import { create } from 'zustand';
import { WeatherResponse } from '../types/weather';

interface WeatherState {
  searchQuery: string;
  weatherData: WeatherResponse | null;
  isLoading: boolean;
  error: string | null;
  
  setSearchQuery: (query: string) => void;
  fetchWeather: (location: string) => Promise<void>;
  clearWeather: () => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  searchQuery: '',
  weatherData: null,
  isLoading: false,
  error: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchWeather: async (location) => {
    if (!location.trim()) return;

    set({ isLoading: true, error: null, searchQuery: location });
    try {
      const url = `/api/weather?location=${encodeURIComponent(location)}`;
      const response = await fetch(url);
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(err.error ?? `Weather API error ${response.status}`);
      }
      const data = (await response.json()) as WeatherResponse;
      set({ weatherData: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch weather data', 
        isLoading: false 
      });
    }
  },

  clearWeather: () => set({ weatherData: null, error: null, searchQuery: '' }),
}));
