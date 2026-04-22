import { NextRequest, NextResponse } from 'next/server';
import {
  fetchRouteOptions,
  fetchItinerary,
  fetchHotelRecommendations,
  fetchFlightOptions,
} from '@/services/geminiService';
import type { Language, TravelMode, HotelBudget } from '@/types';

import { adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    let user = null;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      try {
        if (adminAuth) {
          user = await adminAuth.verifyIdToken(token);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    // Guest limit check
    if (!user) {
      const cookieStore = await cookies();
      const guestPrompts = parseInt(cookieStore.get('guest_prompts')?.value || '0');
      
      if (guestPrompts >= 3) {
        return NextResponse.json(
          { error: 'Limit reached. Please login to continue.' },
          { status: 403 }
        );
      }
      
      // Increment guest prompt cookie
      // Note: Next.js cookies are read-only in this context if not using Server Action
      // But we can set the header in the response
    }

    const body = await request.json();
    const { action, payload } = body as { action: string; payload: Record<string, unknown> };

    let response: NextResponse;
    switch (action) {
      case 'routes': {
        const { origin, destination, lang, travelMode } = payload as {
          origin: string;
          destination: string;
          lang: Language;
          travelMode: TravelMode;
        };
        const result = await fetchRouteOptions(origin, destination, lang, travelMode);
        response = NextResponse.json(result);
        break;
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
        response = NextResponse.json(result);
        break;
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
        response = NextResponse.json(result);
        break;
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
        response = NextResponse.json(result);
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // Set guest cookie if not logged in
    if (!user) {
      const cookieStore = await cookies();
      const guestPrompts = parseInt(cookieStore.get('guest_prompts')?.value || '0');
      response.cookies.set('guest_prompts', (guestPrompts + 1).toString(), {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('[/api/ai] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
