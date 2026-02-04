import React from 'react';
import { Hotel, Loader2, AlertCircle } from 'lucide-react';
import { translations } from '../../../utils/i18n';
import { useAppStore } from '../../../stores/appStore';
import { useTripStore } from '../../../stores/tripStore';
import HotelCard from './HotelCard';

const HotelSection: React.FC = () => {
  const { language } = useAppStore();
  const { searchParams, hotels, isLoadingHotels } = useTripStore();
  const t = translations[language];

  // Don't show if no hotel data requested
  if (!searchParams?.nights || !searchParams?.hotelBudget) {
    return null;
  }

  const nights = searchParams.nights;
  const destination = searchParams.destination;

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      day: 'numeric',
      month: 'short',
    });
  };

  const departureDate = searchParams.departureDate || '';
  const checkoutDate = departureDate
    ? new Date(new Date(departureDate).getTime() + nights * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    : '';

  return (
    <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-200">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg shadow-amber-500/30">
          <Hotel className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">
            {t.hotelRecommendations} {t.hotelAt} {destination}
          </h3>
          {departureDate && (
            <p className="text-xs text-slate-500">
              📅 {formatDate(departureDate)} - {formatDate(checkoutDate)} • {nights}{' '}
              {nights === 1 ? t.night : t.nights}
            </p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoadingHotels && (
        <div className="flex items-center justify-center gap-3 py-8 bg-slate-50 rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span className="text-slate-600">{t.loadingHotels}</span>
        </div>
      )}

      {/* Hotels List */}
      {!isLoadingHotels && hotels.length > 0 && (
        <>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 custom-scrollbar">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} nights={nights} language={language} />
            ))}
          </div>

          {/* Disclaimer */}
          <p className="mt-3 text-xs text-slate-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {t.priceDisclaimer}
          </p>
        </>
      )}

      {/* Empty State */}
      {!isLoadingHotels && hotels.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-8 bg-slate-50 rounded-xl text-slate-500">
          <Hotel className="w-5 h-5" />
          <span>{t.noHotels}</span>
        </div>
      )}
    </div>
  );
};

export default HotelSection;
