import { WeatherResponse } from '../types/weather';

const API_KEY = process.env.VISUAL_CROSSING_API_KEY;
const BASE_URL =
  'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

export const weatherService = {
  async fetchWeather(location: string, date1?: string, date2?: string): Promise<WeatherResponse> {
    if (!API_KEY) {
      throw new Error('Visual Crossing API key is missing');
    }

    try {
      // Build the URL path based on provided dates
      let urlPath = `/${encodeURIComponent(location)}`;
      if (date1) {
        urlPath += `/${date1}`;
        if (date2) {
          urlPath += `/${date2}`;
        }
      }

      const url = new URL(`${BASE_URL}${urlPath}`);
      url.searchParams.append('unitGroup', 'metric'); // Use metric units (Celsius)
      url.searchParams.append('key', API_KEY);
      url.searchParams.append('contentType', 'json');
      // Include current conditions and days in the response
      url.searchParams.append('include', 'current,days');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data as WeatherResponse;
    } catch (error) {
      console.error('Error fetching weather:', error);
      throw error;
    }
  },
};
