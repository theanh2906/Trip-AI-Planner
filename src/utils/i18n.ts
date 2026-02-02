import { Language } from '../types';

export const translations = {
  vi: {
    appTitle: 'VietTrip AI',
    searchTitle: 'Tìm kiếm hành trình',
    originPlaceholder: 'Điểm khởi hành (vd: TP.HCM)',
    destinationPlaceholder: 'Điểm đến (vd: Đà Lạt)',
    searchButton: 'Tìm kiếm hành trình',
    analyzing: 'Đang phân tích tuyến đường...',
    buildingPlan: 'Đang lên kế hoạch...',
    buildingPlanDesc: 'AI đang tìm những quán ăn ngon và điểm dừng thú vị...',
    selectRoute: 'Chọn tuyến đường',
    options: 'lựa chọn',
    via: 'Qua',
    itineraryTitle: 'Lịch trình chi tiết',
    suggestedBy: 'Đề xuất bởi AI Travel Planner',
    destination: 'Điểm đến',
    intro: 'Giới thiệu',
    location: 'Địa điểm',
    navigate: 'Dẫn đường đến đây',
    exploreTitle: 'KHÁM PHÁ',
    exploreSubtitle: 'VIỆT NAM',
  },
  en: {
    appTitle: 'VietTrip AI',
    searchTitle: 'Find your journey',
    originPlaceholder: 'Origin (e.g. Ho Chi Minh City)',
    destinationPlaceholder: 'Destination (e.g. Da Lat)',
    searchButton: 'Find Routes',
    analyzing: 'Analyzing routes...',
    buildingPlan: 'Building your plan...',
    buildingPlanDesc: 'AI is finding the best restaurants and stops...',
    selectRoute: 'Select Route',
    options: 'options',
    via: 'Via',
    itineraryTitle: 'Detailed Itinerary',
    suggestedBy: 'Suggested by VietTrip AI',
    destination: 'Destination',
    intro: 'Introduction',
    location: 'Location',
    navigate: 'Navigate here',
    exploreTitle: 'EXPLORE',
    exploreSubtitle: 'VIETNAM',
  }
};

export const POPULAR_LOCATIONS_VI = [
  "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Đà Lạt", "Nha Trang", 
  "Vũng Tàu", "Phan Thiết", "Hội An", "Huế", "Sapa", 
  "Hạ Long", "Cần Thơ", "Phú Quốc", "Quy Nhơn", "Buôn Ma Thuột",
  "Hải Phòng", "Vinh", "Mộc Châu", "Hà Giang", "Ninh Bình"
];

export const POPULAR_LOCATIONS_EN = [
  "Ho Chi Minh City", "Hanoi", "Da Nang", "Da Lat", "Nha Trang", 
  "Vung Tau", "Phan Thiet", "Hoi An", "Hue", "Sapa", 
  "Ha Long Bay", "Can Tho", "Phu Quoc", "Quy Nhon", "Buon Ma Thuot",
  "Hai Phong", "Vinh", "Moc Chau", "Ha Giang", "Ninh Binh"
];

export const getLocations = (lang: Language) => lang === 'vi' ? POPULAR_LOCATIONS_VI : POPULAR_LOCATIONS_EN;