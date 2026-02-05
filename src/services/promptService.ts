/**
 * Prompt Service - Centralized management of AI prompts
 * Keeps all prompt templates in one place for easy maintenance and extension
 */

import { Language, TravelMode } from '../types';

// ============================================================================
// REGION DETECTION
// ============================================================================

/**
 * Detect country/region from place names (basic heuristic)
 * In production, use country code from the selected place
 */
export const detectRegion = (origin: string, destination: string): string => {
  const text = `${origin} ${destination}`.toLowerCase();

  const regionPatterns: [string[], string][] = [
    [
      ['vietnam', 'việt', 'hà nội', 'hồ chí minh', 'đà nẵng', 'đà lạt', 'nha trang', 'huế'],
      'Vietnam',
    ],
    [['thailand', 'bangkok', 'phuket', 'chiang mai'], 'Thailand'],
    [['japan', 'tokyo', 'osaka', 'kyoto', 'hokkaido'], 'Japan'],
    [['korea', 'seoul', 'busan', 'jeju'], 'South Korea'],
    [['singapore'], 'Singapore'],
    [['malaysia', 'kuala lumpur', 'penang'], 'Malaysia'],
    [['indonesia', 'bali', 'jakarta'], 'Indonesia'],
    [['australia', 'sydney', 'melbourne', 'brisbane'], 'Australia'],
    [['new zealand', 'auckland', 'wellington'], 'New Zealand'],
    [['china', 'beijing', 'shanghai', 'hong kong'], 'China'],
    [['india', 'mumbai', 'delhi', 'bangalore'], 'India'],
    [['philippines', 'manila', 'cebu'], 'Philippines'],
    [['cambodia', 'phnom penh', 'siem reap'], 'Cambodia'],
    [['laos', 'vientiane', 'luang prabang'], 'Laos'],
    [['myanmar', 'yangon', 'mandalay'], 'Myanmar'],
  ];

  for (const [keywords, region] of regionPatterns) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return region;
    }
  }

  return 'Asia-Pacific';
};

// ============================================================================
// LANGUAGE HELPERS
// ============================================================================

export const getLangInstruction = (lang: Language): string => {
  return lang === 'vi'
    ? 'Response must be entirely in Vietnamese.'
    : 'Response must be entirely in English.';
};

// ============================================================================
// TRAVEL MODE PROMPTS
// ============================================================================

export interface TravelModeConfig {
  tripType: string;
  routeTypes: string;
  durationLabel: string;
  routeConsiderations: string;
}

export const getTravelModeConfig = (mode: TravelMode, lang: Language): TravelModeConfig => {
  const isVi = lang === 'vi';

  const configs: Record<TravelMode, TravelModeConfig> = {
    [TravelMode.PLANE]: {
      tripType: isVi ? 'chuyến bay' : 'flight trip',
      routeTypes: isVi
        ? '3 lựa chọn chuyến bay khác nhau (ví dụ: bay thẳng, 1 điểm dừng, giá rẻ)'
        : '3 distinct flight options (e.g., direct flight, 1 stopover, budget option)',
      durationLabel: isVi ? 'Thời gian bay ước tính' : 'Estimated flight time',
      routeConsiderations: isVi
        ? 'Xem xét các hãng hàng không lớn, điểm dừng chân và thời gian bay thông thường.'
        : 'Consider major airlines, layover options, and typical flight durations.',
    },
    [TravelMode.MOTORBIKE]: {
      tripType: isVi ? 'chuyến đi xe máy' : 'motorbike trip',
      routeTypes: isVi
        ? '3 tuyến đường xe máy khác nhau (ví dụ: nhanh nhất, phong cảnh đẹp, đường ven biển)'
        : '3 distinct motorbike routes (e.g., fastest, scenic, coastal)',
      durationLabel: isVi ? 'Thời gian đi xe máy ước tính' : 'Estimated riding time',
      routeConsiderations: isVi
        ? 'Xem xét điều kiện đường sá địa phương và các tuyến đường du lịch phổ biến trong khu vực.'
        : 'Consider local road conditions and popular travel routes in this region.',
    },
    [TravelMode.CAR]: {
      tripType: isVi ? 'chuyến đi ô tô' : 'road trip',
      routeTypes: isVi
        ? '3 tuyến đường lái xe khác nhau (ví dụ: nhanh nhất, phong cảnh đẹp, đường ven biển)'
        : '3 distinct driving routes (e.g., fastest, scenic, coastal)',
      durationLabel: isVi ? 'Thời gian lái xe ước tính' : 'Estimated driving time',
      routeConsiderations: isVi
        ? 'Xem xét điều kiện đường sá địa phương và các tuyến đường du lịch phổ biến trong khu vực.'
        : 'Consider local road conditions and popular travel routes in this region.',
    },
  };

  return configs[mode];
};

// ============================================================================
// TRIP FEASIBILITY DETECTION
// ============================================================================

/**
 * Detect if a trip requires flying (international or cross-ocean)
 * Returns true if driving/motorbike is NOT feasible
 */
export const requiresFlying = (origin: string, destination: string): boolean => {
  const originRegion = detectRegion(origin, '');
  const destRegion = detectRegion('', destination);

  // If regions are different and not land-connected, requires flying
  const landConnectedRegions = new Set([
    // Southeast Asia mainland
    'Vietnam-Thailand',
    'Thailand-Vietnam',
    'Vietnam-Cambodia',
    'Cambodia-Vietnam',
    'Vietnam-Laos',
    'Laos-Vietnam',
    'Thailand-Cambodia',
    'Cambodia-Thailand',
    'Thailand-Laos',
    'Laos-Thailand',
    'Thailand-Myanmar',
    'Myanmar-Thailand',
    'Thailand-Malaysia',
    'Malaysia-Thailand',
    'Malaysia-Singapore',
    'Singapore-Malaysia',
    // China connections
    'Vietnam-China',
    'China-Vietnam',
    'Laos-China',
    'China-Laos',
    'Myanmar-China',
    'China-Myanmar',
  ]);

  // Same region = driveable
  if (originRegion === destRegion) {
    return false;
  }

  // Check if land-connected
  const connectionKey = `${originRegion}-${destRegion}`;
  if (landConnectedRegions.has(connectionKey)) {
    return false;
  }

  // Island nations always require flying from mainland
  const islandRegions = ['Japan', 'South Korea', 'Philippines', 'Indonesia', 'Australia', 'New Zealand', 'Singapore'];
  if (islandRegions.includes(destRegion) || islandRegions.includes(originRegion)) {
    // Exception: Singapore-Malaysia are connected
    if (
      (originRegion === 'Singapore' && destRegion === 'Malaysia') ||
      (originRegion === 'Malaysia' && destRegion === 'Singapore')
    ) {
      return false;
    }
    return true;
  }

  // Different continents = requires flying
  const asiaPacific = ['Vietnam', 'Thailand', 'Cambodia', 'Laos', 'Myanmar', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'China', 'Japan', 'South Korea', 'India'];
  const oceania = ['Australia', 'New Zealand'];

  const originInAsia = asiaPacific.includes(originRegion);
  const destInAsia = asiaPacific.includes(destRegion);
  const originInOceania = oceania.includes(originRegion);
  const destInOceania = oceania.includes(destRegion);

  // Cross-continent = requires flying
  if ((originInAsia && destInOceania) || (originInOceania && destInAsia)) {
    return true;
  }

  // Default: if regions are very different, likely requires flying
  return originRegion !== destRegion && originRegion !== 'Asia-Pacific' && destRegion !== 'Asia-Pacific';
};

// ============================================================================
// ROUTE OPTIONS PROMPT
// ============================================================================

export interface RouteOptionsPromptParams {
  origin: string;
  destination: string;
  lang: Language;
  travelMode: TravelMode;
}

export const buildRouteOptionsPrompt = (params: RouteOptionsPromptParams): string => {
  const { origin, destination, lang, travelMode } = params;
  const region = detectRegion(origin, destination);
  const langInstruction = getLangInstruction(lang);
  const regionContext = region !== 'Asia-Pacific' ? ` in ${region}` : '';

  // Check if trip requires flying
  const mustFly = requiresFlying(origin, destination);
  const effectiveMode = mustFly ? TravelMode.PLANE : travelMode;
  const modeConfig = getTravelModeConfig(effectiveMode, lang);

  // Add warning if user selected ground transport but must fly
  const modeOverrideNote =
    mustFly && travelMode !== TravelMode.PLANE
      ? lang === 'vi'
        ? '\nLƯU Ý: Đây là chuyến đi quốc tế/xuyên đại dương, chỉ có thể di chuyển bằng máy bay.'
        : '\nNOTE: This is an international/cross-ocean trip, only air travel is possible.'
      : '';

  return `
I am planning a ${modeConfig.tripType} from ${origin} to ${destination}${regionContext}.
Suggest ${modeConfig.routeTypes}.
${modeConfig.routeConsiderations}${modeOverrideNote}
${langInstruction}
Return the response in a structured JSON format.
`.trim();
};

// ============================================================================
// ITINERARY PROMPT
// ============================================================================

export interface ItineraryPromptParams {
  origin: string;
  destination: string;
  routeName: string;
  lang: Language;
  travelMode: TravelMode;
}

const buildFlightItineraryInstructions = (
  origin: string,
  destination: string,
  routeName: string,
  lang: Language
): string => {
  const isVi = lang === 'vi';

  if (isVi) {
    return `
Tạo lịch trình chi tiết cho chuyến bay từ ${origin} đến ${destination} sử dụng: "${routeName}".
Lịch trình nên bao gồm:
- Khởi hành từ sân bay ${origin}
- Điểm dừng/quá cảnh nếu có
- Đến sân bay ${destination}
- Các điểm tham quan và hoạt động chính tại điểm đến
- Nhà hàng và quán ăn nổi tiếng địa phương
- Gợi ý tham quan

Mục ĐẦU TIÊN PHẢI là Sân bay Khởi hành tại ${origin}.
Mục CUỐI CÙNG nên là điểm tham quan hoặc khách sạn đáng chú ý tại ${destination}.
`;
  }

  return `
Create a detailed travel itinerary for a flight trip from ${origin} to ${destination} using: "${routeName}".
The itinerary should include:
- Departure from origin airport
- Any layovers/stopovers if applicable
- Arrival at destination airport
- Key attractions and activities at the destination
- Famous local restaurants and food spots
- Sightseeing recommendations

The FIRST item MUST be the Departure Airport in ${origin}.
The LAST item should be a notable attraction or hotel in ${destination}.
`;
};

const buildGroundItineraryInstructions = (
  origin: string,
  destination: string,
  routeName: string,
  lang: Language
): string => {
  const isVi = lang === 'vi';

  if (isVi) {
    return `
Tạo lịch trình chi tiết cho chuyến đi từ ${origin} đến ${destination} theo tuyến đường: "${routeName}".
Lịch trình nên là timeline các điểm dừng bao gồm tham quan, ẩm thực (nhà hàng nổi tiếng địa phương), và điểm nghỉ.
Mục ĐẦU TIÊN trong danh sách PHẢI là Điểm Khởi hành (${origin}).
Mục CUỐI CÙNG trong danh sách PHẢI là Điểm Đến (${destination}).
`;
  }

  return `
Create a detailed travel itinerary for a trip from ${origin} to ${destination} specifically taking the route: "${routeName}".
The itinerary should be a timeline of stops including sightseeing, food (famous local restaurants), and rest stops.
The FIRST item in the list MUST be the Departure Point (${origin}).
The LAST item in the list MUST be the Arrival Point (${destination}).
`;
};

export const buildItineraryPrompt = (params: ItineraryPromptParams): string => {
  const { origin, destination, routeName, lang, travelMode } = params;
  const region = detectRegion(origin, destination);
  const langInstruction = getLangInstruction(lang);
  const regionContext = region !== 'Asia-Pacific' ? region : 'the region';

  // Override travel mode if trip requires flying
  const mustFly = requiresFlying(origin, destination);
  const effectiveMode = mustFly ? TravelMode.PLANE : travelMode;

  const itineraryInstructions =
    effectiveMode === TravelMode.PLANE
      ? buildFlightItineraryInstructions(origin, destination, routeName, lang)
      : buildGroundItineraryInstructions(origin, destination, routeName, lang);

  const isVi = lang === 'vi';
  const commonInstructions = isVi
    ? `
QUAN TRỌNG: Cung cấp tọa độ latitude và longitude gần đúng cho MỖI điểm dừng.

Tập trung vào các địa điểm phổ biến, được đánh giá cao tại ${regionContext}.
Bao gồm ẩm thực địa phương và điểm tham quan văn hóa đặc trưng của khu vực này.
Giả định khởi hành vào sáng sớm.
Cung cấp khoảng 6-10 mục.
`
    : `
IMPORTANT: Provide approximate latitude and longitude coordinates for EACH stop.

Focus on popular, highly-rated locations in ${regionContext}.
Include local cuisine and cultural attractions specific to this area.
Assume an early morning departure.
Provide about 6-10 items.
`;

  return `
${itineraryInstructions}
${commonInstructions}
${langInstruction}
`.trim();
};

// ============================================================================
// HOTEL RECOMMENDATIONS PROMPT
// ============================================================================

export interface HotelPromptParams {
  destination: string;
  nights: number;
  budgetMin: number; // VNĐ per night
  budgetMax: number; // VNĐ per night
  lang: Language;
  tripStyles?: string[];
}

export const buildHotelPrompt = (params: HotelPromptParams): string => {
  const { destination, nights, budgetMin, budgetMax, lang, tripStyles } = params;
  const region = detectRegion('', destination);
  const langInstruction = getLangInstruction(lang);
  const isVi = lang === 'vi';

  const formatVND = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}tr VNĐ`;
    }
    return `${(amount / 1000).toFixed(0)}k VNĐ`;
  };

  const styleContext =
    tripStyles && tripStyles.length > 0
      ? isVi
        ? `Phong cách chuyến đi: ${tripStyles.join(', ')}.`
        : `Trip style preferences: ${tripStyles.join(', ')}.`
      : '';

  if (isVi) {
    return `
Gợi ý 3 khách sạn tại ${destination} cho chuyến đi ${nights} đêm.

Ngân sách: từ ${formatVND(budgetMin)} đến ${formatVND(budgetMax)} mỗi đêm.
${styleContext}

Yêu cầu:
- Gợi ý 3 khách sạn với các mức giá khác nhau trong khoảng ngân sách (tiết kiệm, trung bình, cao cấp)
- Mỗi khách sạn cần có: tên, rating, giá mỗi đêm (VNĐ), mô tả ngắn, tiện nghi chính, vị trí
- Giá phải nằm trong khoảng ngân sách đã cho
- Tổng giá = giá mỗi đêm × ${nights} đêm
- Tập trung vào khách sạn được đánh giá cao, phổ biến với du khách
- Cung cấp tọa độ gần đúng cho mỗi khách sạn

${langInstruction}
`.trim();
  }

  return `
Recommend 3 hotels in ${destination} for a ${nights}-night stay.

Budget: from ${formatVND(budgetMin)} to ${formatVND(budgetMax)} per night.
${styleContext}

Requirements:
- Suggest 3 hotels at different price points within the budget range (budget, mid-range, premium)
- Each hotel needs: name, rating, price per night (VNĐ), short description, main amenities, location
- Prices must be within the given budget range
- Total price = price per night × ${nights} nights
- Focus on highly-rated hotels popular with travelers
- Provide approximate coordinates for each hotel

${langInstruction}
`.trim();
};

// ============================================================================
// FALLBACK MESSAGES
// ============================================================================

export const getFallbackRouteMessage = (lang: Language) => ({
  name: lang === 'vi' ? 'Tuyến đường đề xuất' : 'Recommended Route',
  description:
    lang === 'vi'
      ? 'AI chưa thể tạo tuyến đường lúc này.'
      : 'AI could not generate routes at this moment.',
});
