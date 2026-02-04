import { GoogleGenAI, Type } from "@google/genai";
import { RouteOption, TimelineItem, StopType, Language } from "../types";

// Helper to get a "real" image using a search proxy based on the location/title
// This replaces the random seed placeholder with relevant photos.
const getLocationImage = (title: string, location: string, country?: string) => {
  // Dynamic query based on location context
  const countryContext = country || 'travel';
  const query = `${title} ${location} ${countryContext} travel scenery`;
  // employing a standard thumbnail proxy for demo purposes to get relevant images without a custom search API key
  return `https://tse3.mm.bing.net/th?q=${encodeURIComponent(query)}&w=800&h=600&c=7&rs=1`;
};

// Detect country/region from place names (basic heuristic)
const detectRegion = (origin: string, destination: string): string => {
  // This is a simple heuristic - in production, you'd use the country code from the selected place
  const text = `${origin} ${destination}`.toLowerCase();
  
  // Check for common patterns
  if (text.includes('vietnam') || text.includes('việt') || text.includes('hà nội') || 
      text.includes('hồ chí minh') || text.includes('đà nẵng') || text.includes('đà lạt')) {
    return 'Vietnam';
  }
  if (text.includes('thailand') || text.includes('bangkok') || text.includes('phuket')) {
    return 'Thailand';
  }
  if (text.includes('japan') || text.includes('tokyo') || text.includes('osaka') || text.includes('kyoto')) {
    return 'Japan';
  }
  if (text.includes('korea') || text.includes('seoul') || text.includes('busan')) {
    return 'South Korea';
  }
  if (text.includes('singapore')) {
    return 'Singapore';
  }
  if (text.includes('malaysia') || text.includes('kuala lumpur')) {
    return 'Malaysia';
  }
  if (text.includes('indonesia') || text.includes('bali') || text.includes('jakarta')) {
    return 'Indonesia';
  }
  if (text.includes('australia') || text.includes('sydney') || text.includes('melbourne')) {
    return 'Australia';
  }
  if (text.includes('new zealand') || text.includes('auckland') || text.includes('wellington')) {
    return 'New Zealand';
  }
  if (text.includes('china') || text.includes('beijing') || text.includes('shanghai')) {
    return 'China';
  }
  if (text.includes('india') || text.includes('mumbai') || text.includes('delhi')) {
    return 'India';
  }
  
  // Default to Asia-Pacific region
  return 'Asia-Pacific';
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchRouteOptions = async (origin: string, destination: string, lang: Language): Promise<RouteOption[]> => {
  const langInstruction = lang === 'vi' 
    ? "Response must be entirely in Vietnamese." 
    : "Response must be entirely in English.";

  const region = detectRegion(origin, destination);
  
  const prompt = `
    I am planning a road trip from ${origin} to ${destination}${region !== 'Asia-Pacific' ? ` in ${region}` : ''}.
    Suggest 3 distinct driving routes (e.g., fastest, scenic, coastal).
    Consider local road conditions and popular travel routes in this region.
    ${langInstruction}
    Return the response in a structured JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING, description: "Name of the route" },
              distance: { type: Type.STRING, description: "Estimated distance" },
              duration: { type: Type.STRING, description: "Estimated driving time" },
              description: { type: Type.STRING, description: "Short description of why this route is good" },
              highlights: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of 3 major cities or landmarks passed"
              }
            },
            required: ["id", "name", "distance", "duration", "description", "highlights"]
          }
        }
      }
    });
    console.log(JSON.parse(response.text));
    
    if (response.text) {
      return JSON.parse(response.text) as RouteOption[];
    }
    return [];
  } catch (error) {
    console.error("Error fetching routes:", error);
    return [
      {
        id: "r1",
        name: lang === 'vi' ? "Tuyến đường đề xuất" : "Recommended Route",
        distance: "Unknown",
        duration: "Unknown",
        description: lang === 'vi' ? "AI chưa thể tạo tuyến đường lúc này." : "AI could not generate routes at this moment.",
        highlights: []
      }
    ];
  }
};

export const fetchItinerary = async (origin: string, destination: string, routeName: string, lang: Language): Promise<TimelineItem[]> => {
  const langInstruction = lang === 'vi' 
    ? "Response must be entirely in Vietnamese." 
    : "Response must be entirely in English.";

  const region = detectRegion(origin, destination);

  const prompt = `
    Create a detailed travel itinerary for a trip from ${origin} to ${destination} specifically taking the route: "${routeName}".
    The itinerary should be a timeline of stops including sightseeing, food (famous local restaurants), and rest stops.
    The FIRST item in the list MUST be the Departure Point (${origin}).
    The LAST item in the list MUST be the Arrival Point (${destination}).
    
    IMPORTANT: Provide approximate latitude and longitude coordinates for EACH stop.
    
    Focus on popular, highly-rated locations in ${region !== 'Asia-Pacific' ? region : 'the region'}.
    Include local cuisine and cultural attractions specific to this area.
    Assume an early morning departure.
    ${langInstruction}
    Provide about 6-10 items.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "Time of arrival/activity (e.g. 07:30 AM)" },
              title: { type: Type.STRING, description: "Name of the place or activity" },
              description: { type: Type.STRING, description: "Interesting details about this stop" },
              type: { 
                type: Type.STRING, 
                enum: [StopType.SIGHTSEEING, StopType.FOOD, StopType.REST, StopType.HOTEL, StopType.PHOTO_OP] 
              },
              locationName: { type: Type.STRING, description: "City or specific address area" },
              rating: { type: Type.STRING, description: "Rating out of 5 (e.g. 4.7/5)" },
              coordinates: {
                type: Type.OBJECT,
                properties: {
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER }
                },
                required: ["lat", "lng"]
              }
            },
            required: ["time", "title", "description", "type", "locationName", "coordinates"]
          }
        }
      }
    });

    if (response.text) {
      const items = JSON.parse(response.text) as TimelineItem[];
      return items.map(item => ({
        ...item,
        // Generate a dynamic search URL for the image based on title and location
        imageUrl: getLocationImage(item.title, item.locationName, region)
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    return [];
  }
};