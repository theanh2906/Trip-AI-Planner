/**
 * Places Service - Handles location autocomplete functionality
 * 
 * Strategy:
 * 1. Load popular places (top 1000) on app init - small file (~80KB)
 * 2. Lazy load full dataset when user needs more results
 */

import { Place, Language } from '../types';

// Cache for loaded data
let popularPlaces: Place[] | null = null;
let allPlaces: Place[] | null = null;
let isLoadingFull = false;

// Data file paths
const POPULAR_PLACES_URL = '/data/places-popular.json';
const ALL_PLACES_URL = '/data/places-asia-pacific.json';

/**
 * Load popular places (called on app init)
 */
export async function loadPopularPlaces(): Promise<Place[]> {
  if (popularPlaces) return popularPlaces;

  try {
    const response = await fetch(POPULAR_PLACES_URL);
    if (!response.ok) {
      console.warn('Failed to load popular places, using fallback');
      return getFallbackPlaces();
    }
    popularPlaces = await response.json();
    return popularPlaces!;
  } catch (error) {
    console.error('Error loading popular places:', error);
    return getFallbackPlaces();
  }
}

/**
 * Load full places dataset (lazy loaded when needed)
 */
export async function loadAllPlaces(): Promise<Place[]> {
  if (allPlaces) return allPlaces;
  if (isLoadingFull) {
    // Wait for ongoing load
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (allPlaces) {
          clearInterval(checkInterval);
          resolve(allPlaces!);
        }
      }, 100);
    });
  }

  isLoadingFull = true;
  try {
    const response = await fetch(ALL_PLACES_URL);
    if (!response.ok) {
      console.warn('Failed to load all places');
      return popularPlaces || getFallbackPlaces();
    }
    allPlaces = await response.json();
    isLoadingFull = false;
    return allPlaces!;
  } catch (error) {
    console.error('Error loading all places:', error);
    isLoadingFull = false;
    return popularPlaces || getFallbackPlaces();
  }
}

/**
 * Search places by query string
 */
export function searchPlaces(
  query: string,
  places: Place[],
  options: {
    limit?: number;
    countryCode?: string;
    language?: Language;
  } = {}
): Place[] {
  const { limit = 10, countryCode, language = 'en' } = options;

  if (!query || query.length < 1) return [];

  const normalizedQuery = normalizeString(query);

  let filtered = places.filter((place) => {
    // Filter by country if specified
    if (countryCode && place.countryCode !== countryCode) return false;

    // Match against name or ascii name
    const nameMatch = normalizeString(place.name).includes(normalizedQuery);
    const asciiMatch = normalizeString(place.asciiName).includes(normalizedQuery);

    return nameMatch || asciiMatch;
  });

  // Sort by relevance (exact match first, then by population)
  filtered.sort((a, b) => {
    const aExact = normalizeString(a.name).startsWith(normalizedQuery) ||
                   normalizeString(a.asciiName).startsWith(normalizedQuery);
    const bExact = normalizeString(b.name).startsWith(normalizedQuery) ||
                   normalizeString(b.asciiName).startsWith(normalizedQuery);

    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // Then sort by population
    return b.population - a.population;
  });

  return filtered.slice(0, limit);
}

/**
 * Format place for display
 */
export function formatPlaceDisplay(place: Place, language: Language = 'en'): string {
  const countryName = language === 'vi' ? place.country.vi : place.country.en;
  return `${place.name}, ${countryName}`;
}

/**
 * Get place by ID
 */
export async function getPlaceById(id: number): Promise<Place | null> {
  const places = allPlaces || popularPlaces || await loadPopularPlaces();
  return places.find(p => p.id === id) || null;
}

/**
 * Normalize string for search (remove diacritics, lowercase)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Fallback places when data files are not available
 */
function getFallbackPlaces(): Place[] {
  return [
    { id: 1, name: 'Hồ Chí Minh City', asciiName: 'Ho Chi Minh City', countryCode: 'VN', country: { en: 'Vietnam', vi: 'Việt Nam' }, lat: 10.8231, lng: 106.6297, population: 8993082 },
    { id: 2, name: 'Hà Nội', asciiName: 'Hanoi', countryCode: 'VN', country: { en: 'Vietnam', vi: 'Việt Nam' }, lat: 21.0285, lng: 105.8542, population: 8053663 },
    { id: 3, name: 'Đà Nẵng', asciiName: 'Da Nang', countryCode: 'VN', country: { en: 'Vietnam', vi: 'Việt Nam' }, lat: 16.0544, lng: 108.2022, population: 1134310 },
    { id: 4, name: 'Bangkok', asciiName: 'Bangkok', countryCode: 'TH', country: { en: 'Thailand', vi: 'Thái Lan' }, lat: 13.7563, lng: 100.5018, population: 10539000 },
    { id: 5, name: 'Singapore', asciiName: 'Singapore', countryCode: 'SG', country: { en: 'Singapore', vi: 'Singapore' }, lat: 1.3521, lng: 103.8198, population: 5638700 },
    { id: 6, name: 'Tokyo', asciiName: 'Tokyo', countryCode: 'JP', country: { en: 'Japan', vi: 'Nhật Bản' }, lat: 35.6762, lng: 139.6503, population: 13960000 },
    { id: 7, name: 'Seoul', asciiName: 'Seoul', countryCode: 'KR', country: { en: 'South Korea', vi: 'Hàn Quốc' }, lat: 37.5665, lng: 126.9780, population: 9776000 },
    { id: 8, name: 'Sydney', asciiName: 'Sydney', countryCode: 'AU', country: { en: 'Australia', vi: 'Úc' }, lat: -33.8688, lng: 151.2093, population: 5312000 },
    { id: 9, name: 'Auckland', asciiName: 'Auckland', countryCode: 'NZ', country: { en: 'New Zealand', vi: 'New Zealand' }, lat: -36.8509, lng: 174.7645, population: 1657000 },
    { id: 10, name: 'Kuala Lumpur', asciiName: 'Kuala Lumpur', countryCode: 'MY', country: { en: 'Malaysia', vi: 'Malaysia' }, lat: 3.1390, lng: 101.6869, population: 1768000 },
    { id: 11, name: 'Đà Lạt', asciiName: 'Da Lat', countryCode: 'VN', country: { en: 'Vietnam', vi: 'Việt Nam' }, lat: 11.9404, lng: 108.4583, population: 422000 },
    { id: 12, name: 'Nha Trang', asciiName: 'Nha Trang', countryCode: 'VN', country: { en: 'Vietnam', vi: 'Việt Nam' }, lat: 12.2388, lng: 109.1967, population: 392000 },
    { id: 13, name: 'Huế', asciiName: 'Hue', countryCode: 'VN', country: { en: 'Vietnam', vi: 'Việt Nam' }, lat: 16.4637, lng: 107.5909, population: 354000 },
    { id: 14, name: 'Hội An', asciiName: 'Hoi An', countryCode: 'VN', country: { en: 'Vietnam', vi: 'Việt Nam' }, lat: 15.8801, lng: 108.3380, population: 120000 },
    { id: 15, name: 'Sapa', asciiName: 'Sapa', countryCode: 'VN', country: { en: 'Vietnam', vi: 'Việt Nam' }, lat: 22.3364, lng: 103.8438, population: 60000 },
  ];
}

/**
 * Check if places data is loaded
 */
export function isDataLoaded(): { popular: boolean; full: boolean } {
  return {
    popular: popularPlaces !== null,
    full: allPlaces !== null
  };
}
