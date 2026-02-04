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
  MOTORBIKE = 'MOTORBIKE'
}

export type TripStyle = 'adventure' | 'relaxing' | 'photography' | 'foodie' | 'cultural' | 'nature';

export interface TripSearchParams {
  origin: string;
  destination: string;
  travelMode: TravelMode;
  tripStyles: TripStyle[];
  date?: string;
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
  PHOTO_OP = 'PHOTO_OP'
}

export interface TimelineItem {
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
  tips?: string[];
}

export interface TripData {
  origin: string;
  destination: string;
  travelMode?: TravelMode;
  tripStyles?: TripStyle[];
  selectedRoute?: RouteOption;
  itinerary?: TimelineItem[];
}

export interface TripStyleConfig {
  id: TripStyle;
  labelVi: string;
  labelEn: string;
  icon: string;
  color: string;
}

export const TRIP_STYLES: TripStyleConfig[] = [
  { id: 'adventure', labelVi: 'Phiêu lưu', labelEn: 'Adventure', icon: '🏔️', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'relaxing', labelVi: 'Thư giãn', labelEn: 'Relaxing', icon: '😌', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'photography', labelVi: 'Chụp ảnh', labelEn: 'Photography', icon: '📸', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'foodie', labelVi: 'Ẩm thực', labelEn: 'Foodie', icon: '🍜', color: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'cultural', labelVi: 'Văn hóa', labelEn: 'Cultural', icon: '🏛️', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'nature', labelVi: 'Thiên nhiên', labelEn: 'Nature', icon: '🌿', color: 'bg-green-100 text-green-700 border-green-200' },
];
