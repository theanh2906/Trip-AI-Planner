import { create } from 'zustand';
import { RouteOption, TimelineItem, TravelMode, TripStyle, TripSearchParams } from '../types';
import { fetchRouteOptions, fetchItinerary } from '../services/geminiService';
import { useAppStore } from './appStore';

interface TripState {
  searchParams: TripSearchParams | null;
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  itinerary: TimelineItem[];
  navigationPath: [TimelineItem, TimelineItem] | null;
  isLoadingRoutes: boolean;
  isLoadingItinerary: boolean;
  isMobileMapView: boolean;
  
  setSearchParams: (params: Partial<TripSearchParams>) => void;
  search: () => Promise<void>;
  selectRoute: (route: RouteOption) => Promise<void>;
  navigateTo: (item: TimelineItem) => void;
  backToRoutes: () => void;
  backToSearch: () => void;
  toggleMobileView: () => void;
  reset: () => void;
}

const initialSearchParams: TripSearchParams = {
  origin: '',
  destination: '',
  travelMode: TravelMode.CAR,
  tripStyles: [],
};

export const useTripStore = create<TripState>((set, get) => ({
  searchParams: initialSearchParams,
  routes: [],
  selectedRoute: null,
  itinerary: [],
  navigationPath: null,
  isLoadingRoutes: false,
  isLoadingItinerary: false,
  isMobileMapView: false,
  
  setSearchParams: (params) => set((state) => ({
    searchParams: state.searchParams 
      ? { ...state.searchParams, ...params }
      : { ...initialSearchParams, ...params }
  })),
  
  search: async () => {
    const { searchParams } = get();
    if (!searchParams?.origin || !searchParams?.destination) return;
    
    const language = useAppStore.getState().language;
    
    set({ isLoadingRoutes: true, routes: [], selectedRoute: null, itinerary: [], navigationPath: null });
    
    try {
      const results = await fetchRouteOptions(searchParams.origin, searchParams.destination, language);
      set({ routes: results });
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    } finally {
      set({ isLoadingRoutes: false });
    }
  },
  
  selectRoute: async (route) => {
    const { searchParams } = get();
    if (!searchParams) return;
    
    const language = useAppStore.getState().language;
    
    set({ selectedRoute: route, isLoadingItinerary: true, isMobileMapView: false });
    
    try {
      const items = await fetchItinerary(searchParams.origin, searchParams.destination, route.name, language);
      set({ itinerary: items });
    } catch (error) {
      console.error('Failed to fetch itinerary:', error);
    } finally {
      set({ isLoadingItinerary: false });
    }
  },
  
  navigateTo: (item) => {
    const { itinerary } = get();
    if (itinerary.length > 0) {
      set({ navigationPath: [itinerary[0], item] });
    }
  },
  
  backToRoutes: () => set({ itinerary: [], selectedRoute: null, navigationPath: null }),
  backToSearch: () => set({ routes: [], selectedRoute: null, itinerary: [], navigationPath: null }),
  toggleMobileView: () => set((state) => ({ isMobileMapView: !state.isMobileMapView })),
  reset: () => set({
    searchParams: initialSearchParams,
    routes: [],
    selectedRoute: null,
    itinerary: [],
    navigationPath: null,
    isLoadingRoutes: false,
    isLoadingItinerary: false,
    isMobileMapView: false,
  }),
}));
