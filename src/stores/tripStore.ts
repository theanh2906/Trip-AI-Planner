import { create } from 'zustand';
import {
  RouteOption,
  TimelineItem,
  TravelMode,
  TripSearchParams,
  HotelRecommendation,
  HotelBudget,
  Travelers,
  FlightOption,
} from '../types';
import {
  fetchRouteOptions,
  fetchItinerary,
  fetchHotelRecommendations,
  fetchFlightOptions,
} from '../services/geminiService';
import { requiresFlying } from '../services/promptService';
import { useAppStore } from './appStore';

interface TripState {
  searchParams: TripSearchParams | null;
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  itinerary: TimelineItem[];
  hotels: HotelRecommendation[];
  flights: FlightOption[];
  navigationPath: [TimelineItem, TimelineItem] | null;
  isLoadingRoutes: boolean;
  isLoadingItinerary: boolean;
  isLoadingHotels: boolean;
  isLoadingFlights: boolean;
  isMobileMapView: boolean;
  showTripDetailsModal: boolean;
  selectedDay: number;
  // Cost estimation
  selectedCostItems: Set<number>;
  selectedHotel: HotelRecommendation | null;
  selectedFlight: FlightOption | null;
  selectedAlternatives: Record<number, number>; // itinerary index → alternative index (-1 = default)

  setSearchParams: (params: Partial<TripSearchParams>) => void;
  search: () => Promise<void>;
  selectRoute: (route: RouteOption) => Promise<void>;
  selectRouteWithDetails: (
    route: RouteOption,
    departureDate: string,
    nights: number,
    hotelBudget: HotelBudget,
    travelers: Travelers
  ) => Promise<void>;
  navigateTo: (item: TimelineItem) => void;
  backToRoutes: () => void;
  backToSearch: () => void;
  toggleMobileView: () => void;
  openTripDetailsModal: () => void;
  closeTripDetailsModal: () => void;
  setSelectedDay: (day: number) => void;
  toggleCostItem: (index: number) => void;
  setSelectedHotel: (hotel: HotelRecommendation | null) => void;
  setSelectedFlight: (flight: FlightOption | null) => void;
  setSelectedAlternative: (itemIndex: number, altIndex: number) => void;
  reset: () => void;
}

const initialSearchParams: TripSearchParams = {
  origin: '',
  destination: '',
  travelMode: TravelMode.CAR,
  tripStyles: [],
};

const initialCostState = {
  selectedCostItems: new Set<number>(),
  selectedHotel: null as HotelRecommendation | null,
  selectedFlight: null as FlightOption | null,
  selectedAlternatives: {} as Record<number, number>,
};

export const useTripStore = create<TripState>((set, get) => ({
  searchParams: initialSearchParams,
  routes: [],
  selectedRoute: null,
  itinerary: [],
  hotels: [],
  flights: [],
  navigationPath: null,
  isLoadingRoutes: false,
  isLoadingItinerary: false,
  isLoadingHotels: false,
  isLoadingFlights: false,
  isMobileMapView: false,
  showTripDetailsModal: false,
  selectedDay: 1,
  ...initialCostState,

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
      flights: [],
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
        1
      );
      set({ itinerary: items });
    } catch (error) {
      console.error('Failed to fetch itinerary:', error);
    } finally {
      set({ isLoadingItinerary: false });
    }
  },

  selectRouteWithDetails: async (route, departureDate, nights, hotelBudget, travelers) => {
    const { searchParams } = get();
    if (!searchParams) return;

    const language = useAppStore.getState().language;

    // Determine if we need flights
    const needsFlights =
      searchParams.travelMode === TravelMode.PLANE ||
      requiresFlying(searchParams.origin, searchParams.destination);

    // Update search params
    set((state) => ({
      searchParams: state.searchParams
        ? { ...state.searchParams, departureDate, nights, hotelBudget, travelers }
        : { ...initialSearchParams, departureDate, nights, hotelBudget, travelers },
      selectedRoute: route,
      isLoadingItinerary: true,
      isLoadingHotels: true,
      isLoadingFlights: needsFlights,
      isMobileMapView: false,
      showTripDetailsModal: false,
      selectedDay: 1,
      ...initialCostState,
    }));

    // Calculate return date for flights
    const returnDate = new Date(
      new Date(departureDate).getTime() + (nights + 1) * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split('T')[0];

    try {
      // Build parallel fetch promises
      const promises: Promise<unknown>[] = [
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
      ];

      // Add flight fetch if needed
      if (needsFlights) {
        promises.push(
          fetchFlightOptions(
            searchParams.origin,
            searchParams.destination,
            departureDate,
            language,
            returnDate
          )
        );
      }

      const results = await Promise.all(promises);
      const items = results[0] as TimelineItem[];
      const hotelResults = results[1] as HotelRecommendation[];
      const flightResults = needsFlights ? (results[2] as FlightOption[]) : [];

      set({ itinerary: items, hotels: hotelResults, flights: flightResults });
    } catch (error) {
      console.error('Failed to fetch trip data:', error);
    } finally {
      set({ isLoadingItinerary: false, isLoadingHotels: false, isLoadingFlights: false });
    }
  },

  navigateTo: (item) => {
    const { itinerary } = get();
    if (itinerary.length > 0) {
      set({ navigationPath: [itinerary[0], item] });
    }
  },

  backToRoutes: () =>
    set({
      itinerary: [],
      hotels: [],
      flights: [],
      selectedRoute: null,
      navigationPath: null,
      selectedDay: 1,
      ...initialCostState,
    }),
  backToSearch: () =>
    set({
      routes: [],
      selectedRoute: null,
      itinerary: [],
      hotels: [],
      flights: [],
      navigationPath: null,
      selectedDay: 1,
      ...initialCostState,
    }),
  toggleMobileView: () => set((state) => ({ isMobileMapView: !state.isMobileMapView })),
  openTripDetailsModal: () => set({ showTripDetailsModal: true }),
  closeTripDetailsModal: () => set({ showTripDetailsModal: false }),
  setSelectedDay: (day) => set({ selectedDay: day }),
  toggleCostItem: (index) =>
    set((state) => {
      const newSet = new Set(state.selectedCostItems);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return { selectedCostItems: newSet };
    }),
  setSelectedHotel: (hotel) => set({ selectedHotel: hotel }),
  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  setSelectedAlternative: (itemIndex, altIndex) =>
    set((state) => ({
      selectedAlternatives: { ...state.selectedAlternatives, [itemIndex]: altIndex },
    })),
  reset: () =>
    set({
      searchParams: initialSearchParams,
      routes: [],
      selectedRoute: null,
      itinerary: [],
      hotels: [],
      flights: [],
      navigationPath: null,
      isLoadingRoutes: false,
      isLoadingItinerary: false,
      isLoadingHotels: false,
      isLoadingFlights: false,
      isMobileMapView: false,
      showTripDetailsModal: false,
      selectedDay: 1,
      ...initialCostState,
    }),
}));
