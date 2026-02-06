/**
 * Gemini Service - Handles AI API calls for trip planning
 * Prompts are managed in promptService.ts
 */

import { GoogleGenAI, Type } from '@google/genai';
import {
  RouteOption,
  TimelineItem,
  StopType,
  Language,
  TravelMode,
  HotelRecommendation,
  FlightOption,
} from '../types';
import {
  buildRouteOptionsPrompt,
  buildItineraryPrompt,
  buildHotelPrompt,
  buildFlightPrompt,
  getFallbackRouteMessage,
  detectRegion,
  requiresFlying,
} from './promptService';

// ============================================================================
// CONFIGURATION
// ============================================================================

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-flash-preview';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Generate image URL using Bing image search proxy
 */
const getLocationImage = (title: string, location: string, country?: string): string => {
  const countryContext = country || 'travel';
  const query = `${title} ${location} ${countryContext} travel scenery`;
  return `https://tse3.mm.bing.net/th?q=${encodeURIComponent(query)}&w=800&h=600&c=7&rs=1`;
};

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

const routeOptionsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      name: { type: Type.STRING, description: 'Name of the route' },
      distance: { type: Type.STRING, description: 'Estimated distance' },
      duration: { type: Type.STRING, description: 'Estimated travel time' },
      description: {
        type: Type.STRING,
        description: 'Short description of why this route is good',
      },
      highlights: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of 3 major cities or landmarks passed',
      },
    },
    required: ['id', 'name', 'distance', 'duration', 'description', 'highlights'],
  },
};

const alternativeSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Name of the alternative place' },
    description: { type: Type.STRING, description: 'Short description' },
    costPerAdult: { type: Type.NUMBER, description: 'Cost per adult in VNĐ' },
    costPerChild: { type: Type.NUMBER, description: 'Cost per child in VNĐ' },
    rating: { type: Type.STRING, description: 'Rating (e.g. 4.5/5)' },
    locationName: { type: Type.STRING, description: 'Location name' },
    coordinates: {
      type: Type.OBJECT,
      properties: {
        lat: { type: Type.NUMBER },
        lng: { type: Type.NUMBER },
      },
      required: ['lat', 'lng'],
    },
  },
  required: ['title', 'description', 'costPerAdult', 'costPerChild', 'locationName'],
};

const itinerarySchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.NUMBER, description: 'Day number (1, 2, 3...)' },
      time: { type: Type.STRING, description: 'Time of arrival/activity (e.g. 07:30 AM)' },
      title: { type: Type.STRING, description: 'Name of the place or activity' },
      description: {
        type: Type.STRING,
        description: 'Interesting details about this stop',
      },
      type: {
        type: Type.STRING,
        enum: [
          StopType.SIGHTSEEING,
          StopType.FOOD,
          StopType.REST,
          StopType.HOTEL,
          StopType.PHOTO_OP,
          StopType.DEPARTURE,
          StopType.ARRIVAL,
          StopType.TRANSIT,
        ],
      },
      locationName: { type: Type.STRING, description: 'City or specific address area' },
      rating: { type: Type.STRING, description: 'Rating out of 5 (e.g. 4.7/5)' },
      costPerAdult: {
        type: Type.NUMBER,
        description: 'Estimated cost per adult in VNĐ (0 if free or not applicable)',
      },
      costPerChild: {
        type: Type.NUMBER,
        description: 'Estimated cost per child in VNĐ (typically 50-70% of adult, 0 if free)',
      },
      alternatives: {
        type: Type.ARRAY,
        items: alternativeSchema,
        description: '2 alternative options for FOOD/SIGHTSEEING items, empty for others',
      },
      coordinates: {
        type: Type.OBJECT,
        properties: {
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER },
        },
        required: ['lat', 'lng'],
      },
    },
    required: [
      'day',
      'time',
      'title',
      'description',
      'type',
      'locationName',
      'coordinates',
      'costPerAdult',
      'costPerChild',
      'alternatives',
    ],
  },
};

const hotelSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      name: { type: Type.STRING, description: 'Hotel name' },
      rating: { type: Type.STRING, description: 'Rating out of 5 (e.g. 4.5/5)' },
      pricePerNight: { type: Type.NUMBER, description: 'Price per night in VNĐ' },
      totalPrice: { type: Type.NUMBER, description: 'Total price for all nights in VNĐ' },
      description: { type: Type.STRING, description: 'Short description of the hotel' },
      amenities: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of main amenities (e.g. Wifi, Pool, Breakfast)',
      },
      location: { type: Type.STRING, description: 'Location description (e.g. City center)' },
      coordinates: {
        type: Type.OBJECT,
        properties: {
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER },
        },
        required: ['lat', 'lng'],
      },
    },
    required: [
      'id',
      'name',
      'rating',
      'pricePerNight',
      'totalPrice',
      'description',
      'amenities',
      'location',
    ],
  },
};

const flightSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      airline: { type: Type.STRING, description: 'Airline name (e.g. Vietnam Airlines)' },
      flightNumber: { type: Type.STRING, description: 'Flight number (e.g. VN123)' },
      departureTime: { type: Type.STRING, description: 'Departure time (e.g. 07:30)' },
      arrivalTime: { type: Type.STRING, description: 'Arrival time (e.g. 09:45)' },
      duration: { type: Type.STRING, description: 'Flight duration (e.g. 2h 15m)' },
      stops: { type: Type.NUMBER, description: 'Number of stops (0 = direct)' },
      stopDescription: {
        type: Type.STRING,
        description: 'Stop description if any (e.g. Via Bangkok)',
      },
      pricePerAdult: { type: Type.NUMBER, description: 'Ticket price per adult in VNĐ' },
      pricePerChild: { type: Type.NUMBER, description: 'Ticket price per child in VNĐ' },
      cabinClass: { type: Type.STRING, description: 'Cabin class (Economy or Business)' },
    },
    required: [
      'id',
      'airline',
      'flightNumber',
      'departureTime',
      'arrivalTime',
      'duration',
      'stops',
      'pricePerAdult',
      'pricePerChild',
      'cabinClass',
    ],
  },
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

export const fetchRouteOptions = async (
  origin: string,
  destination: string,
  lang: Language,
  travelMode: TravelMode = TravelMode.CAR
): Promise<RouteOption[]> => {
  const prompt = buildRouteOptionsPrompt({ origin, destination, lang, travelMode });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: routeOptionsSchema,
      },
    });

    if (response.text) {
      const routes = JSON.parse(response.text) as RouteOption[];
      console.log('Routes:', routes);
      return routes;
    }
    return [];
  } catch (error) {
    console.error('Error fetching routes:', error);
    const fallback = getFallbackRouteMessage(lang);
    return [
      {
        id: 'r1',
        name: fallback.name,
        distance: 'Unknown',
        duration: 'Unknown',
        description: fallback.description,
        highlights: [],
      },
    ];
  }
};

export const fetchItinerary = async (
  origin: string,
  destination: string,
  routeName: string,
  lang: Language,
  travelMode: TravelMode = TravelMode.CAR,
  nights: number = 1
): Promise<TimelineItem[]> => {
  const prompt = buildItineraryPrompt({ origin, destination, routeName, lang, travelMode, nights });
  const region = detectRegion(origin, destination);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: itinerarySchema,
      },
    });

    if (response.text) {
      const items = JSON.parse(response.text) as TimelineItem[];
      // Add images to each item + alternatives, ensure day defaults to 1
      return items.map((item) => ({
        ...item,
        day: item.day || 1,
        imageUrl: getLocationImage(item.title, item.locationName, region),
        alternatives: (item.alternatives || []).map((alt) => ({
          ...alt,
          imageUrl: getLocationImage(alt.title, alt.locationName, region),
        })),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return [];
  }
};

export const fetchHotelRecommendations = async (
  destination: string,
  nights: number,
  budgetMin: number,
  budgetMax: number,
  lang: Language,
  tripStyles?: string[]
): Promise<HotelRecommendation[]> => {
  const prompt = buildHotelPrompt({
    destination,
    nights,
    budgetMin,
    budgetMax,
    lang,
    tripStyles,
  });
  const region = detectRegion('', destination);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: hotelSchema,
      },
    });

    if (response.text) {
      const hotels = JSON.parse(response.text) as HotelRecommendation[];
      console.log('Hotels:', hotels);
      return hotels.map((hotel) => ({
        ...hotel,
        imageUrl: getLocationImage(hotel.name, destination, region),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return [];
  }
};

export const fetchFlightOptions = async (
  origin: string,
  destination: string,
  departureDate: string,
  lang: Language,
  returnDate?: string
): Promise<FlightOption[]> => {
  const prompt = buildFlightPrompt({ origin, destination, departureDate, returnDate, lang });

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: flightSchema,
      },
    });

    if (response.text) {
      const flights = JSON.parse(response.text) as FlightOption[];
      console.log('Flights:', flights);
      return flights;
    }
    return [];
  } catch (error) {
    console.error('Error fetching flights:', error);
    return [];
  }
};
