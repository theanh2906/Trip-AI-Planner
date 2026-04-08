import { NextRequest, NextResponse } from 'next/server';
import { weatherService } from '@/services/weatherService';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const location = searchParams.get('location');
  const date1 = searchParams.get('date1') ?? undefined;
  const date2 = searchParams.get('date2') ?? undefined;

  if (!location) {
    return NextResponse.json({ error: 'location is required' }, { status: 400 });
  }

  try {
    const data = await weatherService.fetchWeather(location, date1, date2);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[/api/weather] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch weather' },
      { status: 500 }
    );
  }
}
