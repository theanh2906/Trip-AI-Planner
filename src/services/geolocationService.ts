/**
 * Geolocation Service - Handles current location detection and reverse geocoding
 */

export interface GeoLocationResult {
  lat: number;
  lng: number;
  displayName: string;
  city?: string;
  country?: string;
  countryCode?: string;
}

export interface GeolocationError {
  code:
    | 'PERMISSION_DENIED'
    | 'POSITION_UNAVAILABLE'
    | 'TIMEOUT'
    | 'NOT_SUPPORTED'
    | 'GEOCODE_FAILED';
  message: string;
}

/**
 * Get current position using browser Geolocation API
 */
export function getCurrentPosition(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by this browser',
      } as GeolocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => {
        const codeMap: Record<number, GeolocationError> = {
          1: { code: 'PERMISSION_DENIED', message: 'User denied geolocation permission' },
          2: { code: 'POSITION_UNAVAILABLE', message: 'Location information unavailable' },
          3: { code: 'TIMEOUT', message: 'Location request timed out' },
        };
        reject(codeMap[error.code] ?? { code: 'POSITION_UNAVAILABLE', message: 'Unknown error occurred' });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  });
}

/**
 * Reverse geocode coordinates to get location name
 * Uses OpenStreetMap Nominatim (free, no API key required)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoLocationResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'vi,en',
          'User-Agent': 'TripAI-Planner',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    const address = data.address || {};

    // Extract city name with fallbacks
    const city =
      address.city ||
      address.town ||
      address.municipality ||
      address.county ||
      address.state ||
      address.province;

    const country = address.country || '';
    const countryCode = address.country_code?.toUpperCase() || '';

    // Build display name
    let displayName = city || data.display_name?.split(',')[0] || 'Unknown Location';

    return {
      lat,
      lng,
      displayName,
      city,
      country,
      countryCode,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw {
      code: 'GEOCODE_FAILED',
      message: 'Failed to get location name',
    } as GeolocationError;
  }
}

/**
 * Fallback: Get approximate location via IP geolocation.
 * Calls IP services directly from the client so they see the user's real IP,
 * not the server's IP (which may geolocate to a different city).
 * Falls back to the server-side proxy as a last resort.
 */
export async function getLocationByIP(): Promise<GeoLocationResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  const opts = { signal: controller.signal, headers: { 'User-Agent': 'TripAI-Planner' } };

  try {
    // Try client-side first — IP services see the user's real public IP
    try {
      const res = await fetch('https://ipwho.is/', opts);
      if (res.ok) {
        const d = await res.json();
        if (d.success) {
          return {
            lat: d.latitude, lng: d.longitude,
            displayName: d.city || 'Unknown Location',
            city: d.city || d.region, country: d.country, countryCode: d.country_code,
          };
        }
      }
    } catch { /* try next */ }

    try {
      const res = await fetch(
        'https://api.ipbase.com/v1/json/',
        opts,
      );
      if (res.ok) {
        const d = await res.json();
        if (d.latitude && d.longitude) {
          return {
            lat: d.latitude, lng: d.longitude,
            displayName: d.city || 'Unknown Location',
            city: d.city, country: d.country_name, countryCode: d.country_code,
          };
        }
      }
    } catch { /* try next */ }

    // Last resort: server-side proxy (uses server IP, less accurate)
    const res = await fetch('/api/geo', opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `IP geolocation failed: ${res.status}`);
    }
    const data = await res.json();
    return {
      lat: data.lat, lng: data.lng,
      displayName: data.city || 'Unknown Location',
      city: data.city, country: data.country, countryCode: data.countryCode,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get current location with reverse geocoding.
 * Strategy: browser geolocation (GPS/WiFi, most accurate) → client-side IP geo → server-side IP geo.
 */
export async function getCurrentLocation(): Promise<GeoLocationResult> {
  // Attempt 1: Browser Geolocation API (most accurate)
  try {
    const coords = await getCurrentPosition();
    return await reverseGeocode(coords.latitude, coords.longitude);
  } catch (browserError) {
    console.warn('Browser geolocation failed, trying IP geolocation:', browserError);
  }

  // Attempt 2: IP-based geolocation (client-side first, then server proxy)
  try {
    return await getLocationByIP();
  } catch (ipError) {
    console.error('IP geolocation also failed:', ipError);
    throw {
      code: 'POSITION_UNAVAILABLE',
      message: 'All geolocation methods failed',
    } as GeolocationError;
  }
}
