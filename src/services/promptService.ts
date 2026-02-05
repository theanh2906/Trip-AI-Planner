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
  nights?: number; // Number of nights (default: 1)
}

const buildFlightItineraryInstructions = (
  origin: string,
  destination: string,
  routeName: string,
  lang: Language,
  nights: number
): string => {
  const isVi = lang === 'vi';
  const totalDays = nights + 1; // nights + 1 = total days

  if (isVi) {
    return `
Tạo lịch trình chi tiết ${totalDays} NGÀY cho chuyến bay từ ${origin} đến ${destination} sử dụng: "${routeName}".

NGÀY 1: Di chuyển + khám phá ban đầu
- Khởi hành từ sân bay ${origin}
- Điểm dừng/quá cảnh nếu có
- Đến sân bay ${destination}
- Khám phá khu vực xung quanh khách sạn

${nights >= 2 ? `NGÀY 2 đến NGÀY ${totalDays - 1}: Khám phá ${destination}
- Các điểm tham quan và hoạt động chính
- Nhà hàng và quán ăn nổi tiếng địa phương
- Điểm check-in, chụp ảnh đẹp` : ''}

NGÀY ${totalDays}: Ngày cuối
- Hoạt động buổi sáng trước khi ra sân bay
- Di chuyển ra sân bay ${destination}
- Bay về ${origin}

QUAN TRỌNG: Mỗi item PHẢI có field "day" là số ngày (1, 2, 3...).
`;
  }

  return `
Create a detailed ${totalDays}-DAY itinerary for a flight trip from ${origin} to ${destination} using: "${routeName}".

DAY 1: Travel + initial exploration
- Departure from ${origin} airport
- Any layovers/stopovers if applicable
- Arrival at ${destination} airport
- Explore area around the hotel

${nights >= 2 ? `DAY 2 to DAY ${totalDays - 1}: Explore ${destination}
- Key attractions and activities
- Famous local restaurants and food spots
- Photo spots and sightseeing` : ''}

DAY ${totalDays}: Final day
- Morning activities before airport
- Transfer to ${destination} airport
- Flight back to ${origin}

IMPORTANT: Each item MUST have a "day" field with the day number (1, 2, 3...).
`;
};

const buildGroundItineraryInstructions = (
  origin: string,
  destination: string,
  routeName: string,
  lang: Language,
  nights: number
): string => {
  const isVi = lang === 'vi';
  const totalDays = nights + 1;

  if (isVi) {
    return `
Tạo lịch trình chi tiết ${totalDays} NGÀY cho chuyến đi từ ${origin} đến ${destination} theo tuyến đường: "${routeName}".

NGÀY 1: Di chuyển từ ${origin}
- Khởi hành từ ${origin}
- Các điểm dừng trên đường (ẩm thực, nghỉ ngơi, tham quan)
- Đến ${destination} (hoặc điểm dừng chân nếu quãng đường xa)

${nights >= 2 ? `NGÀY 2 đến NGÀY ${totalDays - 1}: Khám phá ${destination}
- Các điểm tham quan chính
- Nhà hàng và quán ăn nổi tiếng địa phương
- Điểm check-in, chụp ảnh đẹp
- Hoạt động theo phong cách du lịch` : ''}

NGÀY ${totalDays}: Ngày cuối
- Hoạt động buổi sáng
- Di chuyển về ${origin}
- Các điểm dừng trên đường về

QUAN TRỌNG: Mỗi item PHẢI có field "day" là số ngày (1, 2, 3...).
Lịch trình nên bao gồm tham quan, ẩm thực, nghỉ ngơi cho mỗi ngày.
`;
  }

  return `
Create a detailed ${totalDays}-DAY itinerary for a trip from ${origin} to ${destination} taking the route: "${routeName}".

DAY 1: Travel from ${origin}
- Departure from ${origin}
- Stops along the way (food, rest, sightseeing)
- Arrive at ${destination} (or midway stop if long distance)

${nights >= 2 ? `DAY 2 to DAY ${totalDays - 1}: Explore ${destination}
- Key attractions
- Famous local restaurants and food spots
- Photo spots and sightseeing
- Activities based on trip style` : ''}

DAY ${totalDays}: Final day
- Morning activities
- Travel back to ${origin}
- Stops along the return journey

IMPORTANT: Each item MUST have a "day" field with the day number (1, 2, 3...).
The itinerary should include sightseeing, food, and rest stops for each day.
`;
};

export const buildItineraryPrompt = (params: ItineraryPromptParams): string => {
  const { origin, destination, routeName, lang, travelMode, nights = 1 } = params;
  const region = detectRegion(origin, destination);
  const langInstruction = getLangInstruction(lang);
  const regionContext = region !== 'Asia-Pacific' ? region : 'the region';
  const totalDays = nights + 1;
  const itemsPerDay = 4; // ~4 items per day
  const totalItems = totalDays * itemsPerDay;

  // Override travel mode if trip requires flying
  const mustFly = requiresFlying(origin, destination);
  const effectiveMode = mustFly ? TravelMode.PLANE : travelMode;

  const itineraryInstructions =
    effectiveMode === TravelMode.PLANE
      ? buildFlightItineraryInstructions(origin, destination, routeName, lang, nights)
      : buildGroundItineraryInstructions(origin, destination, routeName, lang, nights);

  const isVi = lang === 'vi';
  const commonInstructions = isVi
    ? `
QUAN TRỌNG:
- Cung cấp tọa độ latitude và longitude gần đúng cho MỖI điểm dừng.
- MỖI item PHẢI có field "day" (số nguyên: 1, 2, 3...).
- Cung cấp khoảng ${totalItems} mục (khoảng ${itemsPerDay} mục mỗi ngày).

Tập trung vào các địa điểm phổ biến, được đánh giá cao tại ${regionContext}.
Bao gồm ẩm thực địa phương và điểm tham quan văn hóa đặc trưng của khu vực này.
Giả định khởi hành vào sáng sớm mỗi ngày.
`
    : `
IMPORTANT:
- Provide approximate latitude and longitude coordinates for EACH stop.
- Each item MUST have a "day" field (integer: 1, 2, 3...).
- Provide about ${totalItems} items (approximately ${itemsPerDay} items per day).

Focus on popular, highly-rated locations in ${regionContext}.
Include local cuisine and cultural attractions specific to this area.
Assume an early morning departure each day.
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
