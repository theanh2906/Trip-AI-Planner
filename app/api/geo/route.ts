import { NextRequest, NextResponse } from 'next/server';

const PRIVATE_IP_RE = /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|::1$|fc|fd|fe80)/;

function isPrivateIP(ip: string): boolean {
  return !ip || PRIVATE_IP_RE.test(ip);
}

interface GeoResult {
  lat: number;
  lng: number;
  city: string;
  country: string;
  countryCode: string;
}

async function geoFromIpwho(ip?: string): Promise<GeoResult> {
  const url = ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/';
  const res = await fetch(url, { headers: { 'User-Agent': 'TripAI-Planner' } });
  if (!res.ok) throw new Error(`ipwho.is returned ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'ipwho.is lookup failed');
  return {
    lat: data.latitude,
    lng: data.longitude,
    city: data.city || data.region,
    country: data.country,
    countryCode: data.country_code,
  };
}

async function geoFromIpApi(): Promise<GeoResult> {
  const res = await fetch('http://ip-api.com/json/?fields=status,message,city,country,countryCode,lat,lon', {
    headers: { 'User-Agent': 'TripAI-Planner' },
  });
  if (!res.ok) throw new Error(`ip-api.com returned ${res.status}`);
  const data = await res.json();
  if (data.status !== 'success') throw new Error(data.message || 'ip-api.com lookup failed');
  return {
    lat: data.lat,
    lng: data.lon,
    city: data.city,
    country: data.country,
    countryCode: data.countryCode,
  };
}

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIP = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '';

    if (!isPrivateIP(clientIP)) {
      try {
        const result = await geoFromIpwho(clientIP);
        return NextResponse.json(result);
      } catch {
        // fall through to auto-detect
      }
    }

    // For localhost/private IPs or when IP-specific lookup fails,
    // let the services auto-detect the public IP
    try {
      const result = await geoFromIpwho();
      return NextResponse.json(result);
    } catch {
      const result = await geoFromIpApi();
      return NextResponse.json(result);
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to determine location' },
      { status: 500 }
    );
  }
}
