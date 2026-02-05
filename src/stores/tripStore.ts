import { create } from 'zustand';
import {
  RouteOption,
  TimelineItem,
  TravelMode,
  TripSearchParams,
  HotelRecommendation,
  HotelBudget,
} from '../types';
import {
  fetchRouteOptions,
  fetchItinerary,
  fetchHotelRecommendations,
} from '../services/geminiService';
import { useAppStore } from './appStore';

interface TripState {
  searchParams: TripSearchParams | null;
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  itinerary: TimelineItem[];
  hotels: HotelRecommendation[];
  navigationPath: [TimelineItem, TimelineItem] | null;
  isLoadingRoutes: boolean;
  isLoadingItinerary: boolean;
  isLoadingHotels: boolean;
  isMobileMapView: boolean;
  showTripDetailsModal: boolean;
  selectedDay: number; // Currently selected day for multi-day view

  setSearchParams: (params: Partial<TripSearchParams>) => void;
  search: () => Promise<void>;
  selectRoute: (route: RouteOption) => Promise<void>;
  selectRouteWithDetails: (
    route: RouteOption,
    departureDate: string,
    nights: number,
    hotelBudget: HotelBudget
  ) => Promise<void>;
  navigateTo: (item: TimelineItem) => void;
  backToRoutes: () => void;
  backToSearch: () => void;
  toggleMobileView: () => void;
  openTripDetailsModal: () => void;
  closeTripDetailsModal: () => void;
  setSelectedDay: (day: number) => void;
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
  hotels: [],
  navigationPath: null,
  isLoadingRoutes: false,
  isLoadingItinerary: false,
  isLoadingHotels: false,
  isMobileMapView: false,
  showTripDetailsModal: false,
  selectedDay: 1,

  setSearchParams: (params) =>
    set((state) => ({
      searchParams: state.searchParams
        ? { ...state.searchParams, ...params }
        : { ...initialSearchParams, ...params },
    })),

  search: async () => {
    const { searchParams } = get();
    if (!searchParams?.origin || !searchParams?.destination) return;

    const language = useAppStore.getState().language;

    set({
      isLoadingRoutes: true,
      routes: [],
      selectedRoute: null,
      itinerary: [],
      hotels: [],
      navigationPath: null,
    });

    try {
      const results = await fetchRouteOptions(
        searchParams.origin,
        searchParams.destination,
        language,
        searchParams.travelMode
      );
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

    set({
      selectedRoute: route,
      isLoadingItinerary: true,
      isMobileMapView: false,
      showTripDetailsModal: false,
      selectedDay: 1,
    });

    try {
      const items = await fetchItinerary(
        searchParams.origin,
        searchParams.destination,
        route.name,
        language,
        searchParams.travelMode,
        1 // Default to 1 night for quick view
      );
      set({ itinerary: items });
    } catch (error) {
      console.error('Failed to fetch itinerary:', error);
    } finally {
      set({ isLoadingItinerary: false });
    }
  },

  selectRouteWithDetails: async (route, departureDate, nights, hotelBudget) => {
    const { searchParams } = get();
    if (!searchParams) return;

    const language = useAppStore.getState().language;

    // Update search params with hotel details
    set((state) => ({
      searchParams: state.searchParams
        ? { ...state.searchParams, departureDate, nights, hotelBudget }
        : { ...initialSearchParams, departureDate, nights, hotelBudget },
      selectedRoute: route,
      isLoadingItinerary: true,
      isLoadingHotels: true,
      isMobileMapView: false,
      showTripDetailsModal: false,
      selectedDay: 1,
    }));

    try {
      // Fetch itinerary and hotels in parallel
      const [items, hotelResults] = await Promise.all([
        fetchItinerary(
          searchParams.origin,
          searchParams.destination,
          route.name,
          language,
          searchParams.travelMode,
          nights
        ),
        fetchHotelRecommendations(
          searchParams.destination,
          nights,
          hotelBudget.min,
          hotelBudget.max,
          language,
          searchParams.tripStyles
        ),
      ]);

      set({ itinerary: items, hotels: hotelResults });
    } catch (error) {
      console.error('Failed to fetch itinerary or hotels:', error);
    } finally {
      set({ isLoadingItinerary: false, isLoadingHotels: false });
    }
  },

  navigateTo: (item) => {
    const { itinerary } = get();
    if (itinerary.length > 0) {
      set({ navigationPath: [itinerary[0], item] });
    }
  },

  backToRoutes: () =>
    set({ itinerary: [], hotels: [], selectedRoute: null, navigationPath: null, selectedDay: 1 }),
  backToSearch: () =>
    set({
      routes: [],
      selectedRoute: null,
      itinerary: [],
      hotels: [],
      navigationPath: null,
      selectedDay: 1,
    }),
  toggleMobileView: () => set((state) => ({ isMobileMapView: !state.isMobileMapView })),
  openTripDetailsModal: () => set({ showTripDetailsModal: true }),
  closeTripDetailsModal: () => set({ showTripDetailsModal: false }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  reset: () =>
    set({
      searchParams: initialSearchParams,
      routes: [],
      selectedRoute: null,
      itinerary: [],
      hotels: [],
      navigationPath: null,
      isLoadingRoutes: false,
      isLoadingItinerary: false,
      isLoadingHotels: false,
      isMobileMapView: false,
      showTripDetailsModal: false,
      selectedDay: 1,
    }),
}));
