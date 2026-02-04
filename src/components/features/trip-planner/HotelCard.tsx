import React from 'react';
import { Star, MapPin, Wifi, Coffee, Car, Waves } from 'lucide-react';
import { HotelRecommendation } from '../../../types';
import { cn } from '../../../lib/utils';

// Format VNĐ with proper formatting
const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
};

// Map amenity names to icons
const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="w-3 h-3" />,
  'wi-fi': <Wifi className="w-3 h-3" />,
  breakfast: <Coffee className="w-3 h-3" />,
  'ăn sáng': <Coffee className="w-3 h-3" />,
  parking: <Car className="w-3 h-3" />,
  'bãi đỗ xe': <Car className="w-3 h-3" />,
  pool: <Waves className="w-3 h-3" />,
  'hồ bơi': <Waves className="w-3 h-3" />,
};

const getAmenityIcon = (amenity: string): React.ReactNode => {
  const lowerAmenity = amenity.toLowerCase();
  for (const [key, icon] of Object.entries(amenityIcons)) {
    if (lowerAmenity.includes(key)) {
      return icon;
    }
  }
  return null;
};

interface HotelCardProps {
  hotel: HotelRecommendation;
  nights: number;
  language: 'vi' | 'en';
  className?: string;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, nights, language, className }) => {
  const nightLabel = language === 'vi' ? 'đêm' : nights === 1 ? 'night' : 'nights';
  const perNightLabel = language === 'vi' ? '/đêm' : '/night';

  return (
    <div
      className={cn(
        'flex-shrink-0 w-64 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow',
        className
      )}
    >
      {/* Hotel Image */}
      <div className="relative h-32 bg-slate-100">
        {hotel.imageUrl ? (
          <img
            src={hotel.imageUrl}
            alt={hotel.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <span className="text-4xl">🏨</span>
          </div>
        )}
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-slate-700">{hotel.rating}</span>
        </div>
      </div>

      {/* Hotel Info */}
      <div className="p-3">
        <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{hotel.name}</h4>

        {/* Location */}
        <div className="flex items-center gap-1 mt-1 text-slate-500">
          <MapPin className="w-3 h-3" />
          <span className="text-xs line-clamp-1">{hotel.location}</span>
        </div>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {hotel.amenities.slice(0, 4).map((amenity, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 rounded-full text-xs text-slate-600"
              >
                {getAmenityIcon(amenity)}
                <span className="line-clamp-1">{amenity}</span>
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-lg font-bold text-blue-600">
                {formatVND(hotel.pricePerNight)}
              </span>
              <span className="text-xs text-slate-400">{perNightLabel}</span>
            </div>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            💰 {language === 'vi' ? 'Tổng' : 'Total'} {nights} {nightLabel}:{' '}
            <span className="font-semibold text-slate-700">{formatVND(hotel.totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
