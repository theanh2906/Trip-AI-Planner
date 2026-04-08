import { NextRequest, NextResponse } from 'next/server';
import {
  fetchRouteOptions,
  fetchItinerary,
  fetchHotelRecommendations,
  fetchFlightOptions,
} from '@/services/geminiService';
import type { Language, TravelMode, HotelBudget } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body as { action: string; payload: Record<string, unknown> };

    switch (action) {
      case 'routes': {
        const { origin, destination, lang, travelMode } = payload as {
          origin: string;
          destination: string;
          lang: Language;
          travelMode: TravelMode;
        };
        const result = await fetchRouteOptions(origin, destination, lang, travelMode);
        return NextResponse.json(result);
      }

      case 'itinerary': {
        const { origin, destination, routeName, lang, travelMode, nights } = payload as {
          origin: string;
          destination: string;
          routeName: string;
          lang: Language;
          travelMode: TravelMode;
          nights: number;
        };
        const result = await fetchItinerary(origin, destination, routeName, lang, travelMode, nights);
        return NextResponse.json(result);
      }

      case 'hotels': {
        const { destination, nights, budgetMin, budgetMax, lang, tripStyles } = payload as {
          destination: string;
          nights: number;
          budgetMin: number;
          budgetMax: number;
          lang: Language;
          tripStyles?: string[];
        };
        const result = await fetchHotelRecommendations(
          destination,
          nights,
          budgetMin,
          budgetMax,
          lang,
          tripStyles
        );
        return NextResponse.json(result);
      }

      case 'flights': {
        const { origin, destination, departureDate, lang, returnDate } = payload as {
          origin: string;
          destination: string;
          departureDate: string;
          lang: Language;
          returnDate?: string;
        };
        const result = await fetchFlightOptions(origin, destination, departureDate, lang, returnDate);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[/api/ai] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
