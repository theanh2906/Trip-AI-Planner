import { Language } from '../types';

export const translations = {
  vi: {
    appTitle: 'TripAI',
    appTagline: 'Lên kế hoạch du lịch thông minh',
    navTripPlanner: 'Lên kế hoạch',
    navBudget: 'Ngân sách',
    navWeather: 'Thời tiết',
    navAiAssistant: 'Trợ lý AI',
    navSavedTrips: 'Đã lưu',
    navSettings: 'Cài đặt',
    navMore: 'Thêm',
    searchTitle: 'Tìm kiếm hành trình',
    originPlaceholder: 'Điểm khởi hành (vd: TP.HCM)',
    destinationPlaceholder: 'Điểm đến (vd: Đà Lạt)',
    searchButton: 'Tìm kiếm hành trình',
    analyzing: 'Đang phân tích...',
    buildingPlan: 'Đang lên kế hoạch...',
    buildingPlanDesc: 'AI đang tìm những quán ăn ngon và điểm dừng thú vị...',
    selectRoute: 'Chọn tuyến đường',
    options: 'lựa chọn',
    via: 'Qua',
    itineraryTitle: 'Lịch trình chi tiết',
    suggestedBy: 'Đề xuất bởi TripAI',
    destination: 'Điểm đến',
    intro: 'Giới thiệu',
    location: 'Địa điểm',
    navigate: 'Dẫn đường đến đây',
    exploreTitle: 'KHÁM PHÁ',
    exploreSubtitle: 'VIỆT NAM',
    comingSoon: 'Sắp ra mắt',
    featureInDevelopment: 'Tính năng đang được phát triển',
  },
  en: {
    appTitle: 'TripAI',
    appTagline: 'Smart travel planning',
    navTripPlanner: 'Plan Trip',
    navBudget: 'Budget',
    navWeather: 'Weather',
    navAiAssistant: 'AI Assistant',
    navSavedTrips: 'Saved',
    navSettings: 'Settings',
    navMore: 'More',
    searchTitle: 'Find your journey',
    originPlaceholder: 'Origin (e.g. Ho Chi Minh City)',
    destinationPlaceholder: 'Destination (e.g. Da Lat)',
    searchButton: 'Find Routes',
    analyzing: 'Analyzing...',
    buildingPlan: 'Building your plan...',
    buildingPlanDesc: 'AI is finding the best restaurants and stops...',
    selectRoute: 'Select Route',
    options: 'options',
    via: 'Via',
    itineraryTitle: 'Detailed Itinerary',
    suggestedBy: 'Suggested by TripAI',
    destination: 'Destination',
    intro: 'Introduction',
    location: 'Location',
    navigate: 'Navigate here',
    exploreTitle: 'EXPLORE',
    exploreSubtitle: 'VIETNAM',
    comingSoon: 'Coming Soon',
    featureInDevelopment: 'Feature in development',
  }
};

export const POPULAR_LOCATIONS_VI = [
  "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Nha Trang", 
  "Vũng Tàu", "Phan Thiết", "Hội An", "Huế", "Sapa", 
  "Hạ Long", "Cần Thơ", "Phú Quốc", "Quy Nhơn", "Buôn Ma Thuột"
];

export const POPULAR_LOCATIONS_EN = [
  "Ho Chi Minh City", "Hanoi", "Da Nang", "Da Lat", "Nha Trang", 
  "Vung Tau", "Phan Thiet", "Hoi An", "Hue", "Sapa", 
  "Ha Long Bay", "Can Tho", "Phu Quoc", "Quy Nhon", "Buon Ma Thuot"
];

export const getLocations = (lang: Language) => lang === 'vi' ? POPULAR_LOCATIONS_VI : POPULAR_LOCATIONS_EN;
