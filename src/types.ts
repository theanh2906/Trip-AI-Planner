export type Language = 'vi' | 'en';

// Place/Location types for autocomplete
export interface Place {
  id: number;
  name: string;
  asciiName: string;
  countryCode: string;
  country: {
    en: string;
    vi: string;
  };
  lat: number;
  lng: number;
  population: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export enum TravelMode {
  CAR = 'CAR',
  MOTORBIKE = 'MOTORBIKE',
  PLANE = 'PLANE',
}

export type TripStyle = 'adventure' | 'relaxing' | 'photography' | 'foodie' | 'cultural' | 'nature';

export interface HotelBudget {
  min: number; // VNĐ per night
  max: number; // VNĐ per night
}

export interface Travelers {
  adults: number; // >= 1
  children: number; // >= 0
}

export interface TripSearchParams {
  origin: string;
  destination: string;
  travelMode: TravelMode;
  tripStyles: TripStyle[];
  date?: string;
  // Hotel booking fields
  departureDate?: string; // ISO date: "2026-02-15"
  nights?: number; // 1-30
  hotelBudget?: HotelBudget;
  travelers?: Travelers;
}

export interface RouteOption {
  id: string;
  name: string;
  distance: string;
  duration: string;
  description: string;
  highlights: string[];
}

export enum StopType {
  SIGHTSEEING = 'SIGHTSEEING',
  FOOD = 'FOOD',
  REST = 'REST',
  HOTEL = 'HOTEL',
  PHOTO_OP = 'PHOTO_OP',
  DEPARTURE = 'DEPARTURE',
  ARRIVAL = 'ARRIVAL',
  TRANSIT = 'TRANSIT',
}

// Alternative option for a stop (e.g., different restaurant or attraction)
export interface AlternativeOption {
  title: string;
  description: string;
  costPerAdult: number; // VNĐ
  costPerChild: number; // VNĐ
  rating?: string;
  locationName: string;
  coordinates?: Coordinates;
  imageUrl?: string;
}

export interface TimelineItem {
  day: number; // Day number (1, 2, 3, ...)
  time: string;
  title: string;
  description: string;
  type: StopType;
  locationName: string;
  rating?: string;
  coordinates?: Coordinates;
  imageUrl?: string;
  duration?: string;
  estimatedCost?: { min: number; max: number };
  costPerAdult?: number; // VNĐ - AI estimated cost per adult
  costPerChild?: number; // VNĐ - AI estimated cost per child (typically 50-70% of adult)
  tips?: string[];
  alternatives?: AlternativeOption[]; // 2-3 alternative options for FOOD/SIGHTSEEING
}

// Flight ticket option
export interface FlightOption {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string; // "07:30"
  arrivalTime: string; // "09:45"
  duration: string; // "2h 15m"
  stops: number; // 0 = direct, 1 = 1 stop, etc.
  stopDescription?: string; // "Via Bangkok" or ""
  pricePerAdult: number; // VNĐ
  pricePerChild: number; // VNĐ
  cabinClass: string; // "Economy", "Business"
}

export interface HotelRecommendation {
  id: string;
  name: string;
  rating: string; // "4.5/5"
  pricePerNight: number; // VNĐ
  totalPrice: number; // VNĐ (pricePerNight * nights)
  description: string;
  amenities: string[]; // ["Wifi", "Pool", "Breakfast"]
  location: string; // "Trung tâm Đà Lạt"
  coordinates?: Coordinates;
  imageUrl?: string;
}

export interface TripData {
  origin: string;
  destination: string;
  travelMode?: TravelMode;
  tripStyles?: TripStyle[];
  selectedRoute?: RouteOption;
  itinerary?: TimelineItem[];
  hotels?: HotelRecommendation[];
}

export interface TripStyleConfig {
  id: TripStyle;
  labelVi: string;
  labelEn: string;
  icon: string;
  color: string;
}

export const TRIP_STYLES: TripStyleConfig[] = [
  {
    id: 'adventure',
    labelVi: 'Phiêu lưu',
    labelEn: 'Adventure',
    icon: '🏔️',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  {
    id: 'relaxing',
    labelVi: 'Thư giãn',
    labelEn: 'Relaxing',
    icon: '😌',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: 'photography',
    labelVi: 'Chụp ảnh',
    labelEn: 'Photography',
    icon: '📸',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  {
    id: 'foodie',
    labelVi: 'Ẩm thực',
    labelEn: 'Foodie',
    icon: '🍜',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
  {
    id: 'cultural',
    labelVi: 'Văn hóa',
    labelEn: 'Cultural',
    icon: '🏛️',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    id: 'nature',
    labelVi: 'Thiên nhiên',
    labelEn: 'Nature',
    icon: '🌿',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
];
