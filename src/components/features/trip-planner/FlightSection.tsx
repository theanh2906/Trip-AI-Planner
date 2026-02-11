import React from 'react';
import { Plane, Loader2, Clock, Check, ArrowRight, CircleDot } from 'lucide-react';
import { translations } from '../../../utils/i18n';
import { formatCurrency } from '../../../utils/currency';
import { useAppStore } from '../../../stores/appStore';
import { useTripStore } from '../../../stores/tripStore';
import { FlightOption } from '../../../types';
import { cn } from '../../../lib/utils';

interface FlightCardProps {
  flight: FlightOption;
  isSelected: boolean;
  onSelect: () => void;
  language: 'vi' | 'en';
  currency: 'VND' | 'USD';
}

const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  isSelected,
  onSelect,
  language,
  currency,
}) => {
  const t = translations[language];
  const fmt = (amount: number) => formatCurrency(amount, currency);

  return (
    <div
      className={cn(
        'flex-shrink-0 w-72 bg-white rounded-xl border shadow-sm overflow-hidden transition-all',
        isSelected ? 'border-sky-300 ring-2 ring-sky-200' : 'border-slate-100 hover:shadow-md'
      )}
    >
      {/* Airline header */}
      <div className="px-4 py-3 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-sky-600" />
            <span className="font-semibold text-slate-800 text-sm">{flight.airline}</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">{flight.flightNumber}</span>
        </div>
      </div>

      {/* Flight details */}
      <div className="p-4">
        {/* Times */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-center">
            <p className="text-xl font-bold text-slate-800">{flight.departureTime}</p>
          </div>
          <div className="flex-1 flex flex-col items-center px-3">
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              <Clock className="w-3 h-3" />
              {flight.duration}
            </div>
            <div className="relative w-full flex items-center">
              <div className="flex-1 border-t border-dashed border-slate-300" />
              {flight.stops > 0 && <CircleDot className="w-3 h-3 text-orange-400 mx-1" />}
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {flight.stops === 0 ? t.direct : `${flight.stops} ${t.stops}`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-slate-800">{flight.arrivalTime}</p>
          </div>
        </div>

        {/* Stop description */}
        {flight.stopDescription && (
          <p className="text-xs text-orange-500 text-center mb-3">{flight.stopDescription}</p>
        )}

        {/* Cabin + Price */}
        <div className="flex items-end justify-between pt-3 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
              {flight.cabinClass}
            </span>
            <div className="mt-2">
              <span className="text-lg font-bold text-blue-600">{fmt(flight.pricePerAdult)}</span>
              <span className="text-xs text-slate-400">
                /{language === 'vi' ? 'người lớn' : 'adult'}
              </span>
            </div>
            {flight.pricePerChild > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'vi' ? 'Trẻ em' : 'Child'}: {fmt(flight.pricePerChild)}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5',
              isSelected
                ? 'bg-sky-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-600'
            )}
          >
            {isSelected ? (
              <>
                <Check className="w-3.5 h-3.5" />
                {t.selectedFlight}
              </>
            ) : (
              t.selectFlight
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const FlightSection: React.FC = () => {
  const { language, currency } = useAppStore();
  const { flights, isLoadingFlights, selectedFlight, setSelectedFlight, searchParams } =
    useTripStore();
  const t = translations[language];

  // Don't show if no flights needed
  if (!searchParams?.travelers || (flights.length === 0 && !isLoadingFlights)) {
    return null;
  }

  return (
    <div className="mb-6 pb-6 border-b-2 border-dashed border-slate-200">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg shadow-sky-500/30">
          <Plane className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">{t.flightOptions}</h3>
          <p className="text-xs text-slate-500">
            {searchParams?.origin} → {searchParams?.destination}
          </p>
        </div>
      </div>

      {/* Loading */}
      {isLoadingFlights && (
        <div className="flex items-center justify-center gap-3 py-8 bg-slate-50 rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
          <span className="text-slate-600">{t.loadingFlights}</span>
        </div>
      )}

      {/* Flight Cards */}
      {!isLoadingFlights && flights.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 custom-scrollbar">
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              isSelected={selectedFlight?.id === flight.id}
              onSelect={() => setSelectedFlight(selectedFlight?.id === flight.id ? null : flight)}
              language={language}
              currency={currency}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoadingFlights && flights.length === 0 && (
        <div className="flex items-center justify-center gap-2 py-8 bg-slate-50 rounded-xl text-slate-500">
          <Plane className="w-5 h-5" />
          <span>{t.noFlights}</span>
        </div>
      )}
    </div>
  );
};

export default FlightSection;
