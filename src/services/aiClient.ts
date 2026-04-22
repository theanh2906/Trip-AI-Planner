/**
 * Client-side wrapper for AI API calls.
 * Mirrors the public API of geminiService.ts but routes through /api/ai
 * so that the Gemini API key is never exposed to the browser.
 */

import type {
  RouteOption,
  TimelineItem,
  HotelRecommendation,
  FlightOption,
  Language,
  TravelMode,
} from '../types';

import { useAuthStore } from '../stores/authStore';

async function callAI<T>(action: string, payload: Record<string, unknown>): Promise<T> {
  const { user, incrementGuestPrompt } = useAuthStore.getState();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (user) {
    const token = await user.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    incrementGuestPrompt();
  }

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error ?? `API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const fetchRouteOptions = (
  origin: string,
  destination: string,
  lang: Language,
  travelMode: TravelMode
): Promise<RouteOption[]> =>
  callAI('routes', { origin, destination, lang, travelMode });

export const fetchItinerary = (
  origin: string,
  destination: string,
  routeName: string,
  lang: Language,
  travelMode: TravelMode,
  nights: number
): Promise<TimelineItem[]> =>
  callAI('itinerary', { origin, destination, routeName, lang, travelMode, nights });

export const fetchHotelRecommendations = (
  destination: string,
  nights: number,
  budgetMin: number,
  budgetMax: number,
  lang: Language,
  tripStyles?: string[]
): Promise<HotelRecommendation[]> =>
  callAI('hotels', { destination, nights, budgetMin, budgetMax, lang, tripStyles });

export const fetchFlightOptions = (
  origin: string,
  destination: string,
  departureDate: string,
  lang: Language,
  returnDate?: string
): Promise<FlightOption[]> =>
  callAI('flights', { origin, destination, departureDate, lang, returnDate });
