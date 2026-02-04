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
        let errorResult: GeolocationError;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorResult = {
              code: 'PERMISSION_DENIED',
              message: 'User denied geolocation permission',
            };
            break;
          case error.POSITION_UNAVAILABLE:
            errorResult = {
              code: 'POSITION_UNAVAILABLE',
              message: 'Location information unavailable',
            };
            break;
          case error.TIMEOUT:
            errorResult = { code: 'TIMEOUT', message: 'Location request timed out' };
            break;
          default:
            errorResult = { code: 'POSITION_UNAVAILABLE', message: 'Unknown error occurred' };
        }
        reject(errorResult);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache position for 5 minutes
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
 * Get current location with reverse geocoding
 */
export async function getCurrentLocation(): Promise<GeoLocationResult> {
  const coords = await getCurrentPosition();
  const result = await reverseGeocode(coords.latitude, coords.longitude);
  return result;
}
