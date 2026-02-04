import React, { useState } from 'react';
import { Calendar, Moon, Wallet, X, ChevronRight } from 'lucide-react';
import { Drawer } from 'vaul';
import { translations } from '../../../utils/i18n';
import { useAppStore } from '../../../stores/appStore';
import { useTripStore } from '../../../stores/tripStore';
import { RouteOption, HotelBudget } from '../../../types';
import { cn } from '../../../lib/utils';

// Budget presets in VNĐ
const BUDGET_PRESETS = [
  { min: 200000, max: 500000, label: '200k-500k' },
  { min: 300000, max: 1000000, label: '300k-1tr' },
  { min: 500000, max: 1500000, label: '500k-1.5tr' },
  { min: 1000000, max: 3000000, label: '1tr-3tr' },
  { min: 2000000, max: 5000000, label: '2tr-5tr' },
];

const NIGHT_OPTIONS = [1, 2, 3, 4, 5, 7, 14];

// Format VNĐ
const formatVND = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace('.0', '')}tr`;
  }
  return `${(amount / 1000).toFixed(0)}k`;
};

// Get tomorrow's date
const getTomorrow = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

interface TripDetailsModalProps {
  route: RouteOption | null;
}

const TripDetailsModal: React.FC<TripDetailsModalProps> = ({ route }) => {
  const { language } = useAppStore();
  const { showTripDetailsModal, closeTripDetailsModal, selectRoute, selectRouteWithDetails } =
    useTripStore();
  const t = translations[language];

  const [departureDate, setDepartureDate] = useState(getTomorrow());
  const [nights, setNights] = useState(2);
  const [budget, setBudget] = useState<HotelBudget>({ min: 300000, max: 1000000 });
  const [customNights, setCustomNights] = useState<number | null>(null);

  const handleSkip = () => {
    if (route) {
      selectRoute(route);
    }
    closeTripDetailsModal();
  };

  const handleSubmit = () => {
    if (route) {
      const finalNights = customNights || nights;
      selectRouteWithDetails(route, departureDate, finalNights, budget);
    }
  };

  const handleNightSelect = (n: number) => {
    setNights(n);
    setCustomNights(null);
  };

  const handleCustomNights = (value: string) => {
    const num = parseInt(value);
    if (num > 0 && num <= 30) {
      setCustomNights(num);
      setNights(num);
    }
  };

  const displayNights = customNights || nights;

  return (
    <Drawer.Root
      open={showTripDetailsModal}
      onOpenChange={(open) => !open && closeTripDetailsModal()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-auto flex-col rounded-t-2xl bg-white">
          <div className="mx-auto mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-slate-200" />

          <div className="flex-1 overflow-y-auto p-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{t.tripDetails}</h2>
                {route && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {route.name} • {route.duration}
                  </p>
                )}
              </div>
              <button
                onClick={closeTripDetailsModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Departure Date */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Calendar className="w-4 h-4 text-blue-500" />
                {t.departureDate}
              </label>
              <input
                type="date"
                value={departureDate}
                min={getTomorrow()}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700"
              />
            </div>

            {/* Number of Nights */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Moon className="w-4 h-4 text-indigo-500" />
                {t.numberOfNights}
              </label>
              <div className="flex flex-wrap gap-2">
                {NIGHT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleNightSelect(n)}
                    className={cn(
                      'px-4 py-2 rounded-full border text-sm font-medium transition-all',
                      nights === n && !customNights
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {n} {n === 1 ? t.night : t.nights}
                  </button>
                ))}
                <input
                  type="number"
                  min="1"
                  max="30"
                  placeholder="..."
                  value={customNights || ''}
                  onChange={(e) => handleCustomNights(e.target.value)}
                  className={cn(
                    'w-16 px-3 py-2 rounded-full border text-sm font-medium text-center transition-all',
                    customNights
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600'
                  )}
                />
              </div>
            </div>

            {/* Budget Range */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Wallet className="w-4 h-4 text-emerald-500" />
                {t.hotelBudget}
                <span className="text-slate-400 font-normal">({t.perNight})</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {BUDGET_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setBudget({ min: preset.min, max: preset.max })}
                    className={cn(
                      'px-4 py-2 rounded-full border text-sm font-medium transition-all',
                      budget.min === preset.min && budget.max === preset.max
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-slate-500">
                💰 {formatVND(budget.min)} - {formatVND(budget.max)} / {t.night}
              </p>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-600">
                📅{' '}
                <strong>
                  {new Date(departureDate).toLocaleDateString(
                    language === 'vi' ? 'vi-VN' : 'en-US',
                    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
                  )}
                </strong>
              </p>
              <p className="text-sm text-slate-600 mt-1">
                🌙{' '}
                <strong>
                  {displayNights} {displayNights === 1 ? t.night : t.nights}
                </strong>
              </p>
              <p className="text-sm text-slate-600 mt-1">
                💰 {t.estimatedCost}:{' '}
                <strong>
                  {formatVND(budget.min * displayNights)} - {formatVND(budget.max * displayNights)}
                </strong>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                {t.skip}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-[2] py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                {t.viewItinerary}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

export default TripDetailsModal;
