export enum TravelMode {
  CAR = 'CAR',
  MOTORBIKE = 'MOTORBIKE'
}

export type Language = 'vi' | 'en';

export interface Coordinates {
  lat: number;
  lng: number;
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
  rating?: string; // e.g., "4.5/5"
  coordinates?: Coordinates; // Optional simulation for map
  imageUrl?: string;
}

export interface TripData {
  origin: string;
  destination: string;
  selectedRoute?: RouteOption;
  itinerary?: TimelineItem[];
}