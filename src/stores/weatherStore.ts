import { create } from 'zustand';
import { WeatherResponse } from '../types/weather';
import { weatherService } from '../services/weatherService';

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
      const data = await weatherService.fetchWeather(location);
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
