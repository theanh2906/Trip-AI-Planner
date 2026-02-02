import { GoogleGenAI, Type } from "@google/genai";
import { RouteOption, TimelineItem, StopType, Language } from "../types";

// Helper to get image based on keyword seed to have consistent images
const getPlaceholderImage = (keyword: string) => {
  const seed = keyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${seed}/400/300`;
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchRouteOptions = async (origin: string, destination: string, lang: Language): Promise<RouteOption[]> => {
  const langInstruction = lang === 'vi' 
    ? "Response must be entirely in Vietnamese." 
    : "Response must be entirely in English.";

  const prompt = `
    I am planning a road trip from ${origin} to ${destination} in Vietnam.
    Suggest 3 distinct driving routes (e.g., fastest, scenic, coastal).
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

  const prompt = `
    Create a detailed travel itinerary for a trip from ${origin} to ${destination} specifically taking the route: "${routeName}".
    The itinerary should be a timeline of stops including sightseeing, food (famous local restaurants), and rest stops.
    The FIRST item in the list MUST be the Departure Point (${origin}).
    The LAST item in the list MUST be the Arrival Point (${destination}).
    
    IMPORTANT: Provide approximate latitude and longitude coordinates for EACH stop.
    
    Focus on popular, highly-rated locations. 
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
        imageUrl: getPlaceholderImage(item.title)
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    return [];
  }
};