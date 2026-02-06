import React, { useState } from 'react';
import { Calendar, Moon, Wallet, X, ChevronRight, Users, Minus, Plus, Baby } from 'lucide-react';
import { Drawer } from 'vaul';
import { translations } from '../../../utils/i18n';
import { useAppStore } from '../../../stores/appStore';
import { useTripStore } from '../../../stores/tripStore';
import { RouteOption, HotelBudget } from '../../../types';
import { cn } from '../../../lib/utils';

const NIGHT_OPTIONS = [1, 2, 3, 4, 5, 7, 14];

// Format VNĐ
const formatVND = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1).replace('.0', '')}tr`;
  }
  return `${(amount / 1000).toFixed(0)}k`;
};

// Parse VNĐ input — allow "500000" or "500k" or "1.5tr"
const parseVNDInput = (value: string): number => {
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned) || 0;
};

// Format number for input display
const formatInputVND = (amount: number): string => {
  if (amount === 0) return '';
  return new Intl.NumberFormat('vi-VN').format(amount);
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
  const [budgetMinInput, setBudgetMinInput] = useState('300,000');
  const [budgetMaxInput, setBudgetMaxInput] = useState('1,000,000');
  const [customNights, setCustomNights] = useState<number | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const handleSkip = () => {
    if (route) {
      selectRoute(route);
    }
    closeTripDetailsModal();
  };

  const handleSubmit = () => {
    if (route) {
      const finalNights = customNights || nights;
      selectRouteWithDetails(route, departureDate, finalNights, budget, { adults, children });
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

  const handleBudgetMin = (value: string) => {
    setBudgetMinInput(value);
    const num = parseVNDInput(value);
    if (num >= 0) {
      setBudget((prev) => ({ ...prev, min: num }));
    }
  };

  const handleBudgetMax = (value: string) => {
    setBudgetMaxInput(value);
    const num = parseVNDInput(value);
    if (num >= 0) {
      setBudget((prev) => ({ ...prev, max: num }));
    }
  };

  const handleBudgetMinBlur = () => {
    setBudgetMinInput(formatInputVND(budget.min));
  };

  const handleBudgetMaxBlur = () => {
    setBudgetMaxInput(formatInputVND(budget.max));
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
            <div className="flex items-center justify-between mb-5">
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

            {/* Departure Date — full width */}
            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                {t.departureDate}
              </label>
              <input
                type="date"
                value={departureDate}
                min={getTomorrow()}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 text-sm"
              />
            </div>

            {/* Travelers — full width, 2 steppers side by side */}
            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <Users className="w-3.5 h-3.5 text-violet-500" />
                {t.travelers}
              </label>
              <div className="flex gap-3">
                {/* Adults */}
                <div className="flex-1 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm text-slate-600">{t.adults}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      disabled={adults <= 1}
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                        adults <= 1
                          ? 'bg-slate-100 text-slate-300'
                          : 'bg-violet-100 text-violet-600'
                      )}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold text-slate-800 w-5 text-center">
                      {adults}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdults(Math.min(20, adults + 1))}
                      className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 hover:bg-violet-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* Children */}
                <div className="flex-1 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Baby className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm text-slate-600">{t.children}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      disabled={children <= 0}
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                        children <= 0
                          ? 'bg-slate-100 text-slate-300'
                          : 'bg-violet-100 text-violet-600'
                      )}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold text-slate-800 w-5 text-center">
                      {children}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChildren(Math.min(10, children + 1))}
                      className="w-7 h-7 rounded-full bg-violet-100 text-violet-600 hover:bg-violet-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Number of Nights — full width, compact chips */}
            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                {t.numberOfNights}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {NIGHT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleNightSelect(n)}
                    className={cn(
                      'px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
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
                    'w-14 px-2 py-1.5 rounded-full border text-xs font-medium text-center transition-all',
                    customNights
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600'
                  )}
                />
              </div>
            </div>

            {/* Budget — 2 inputs side by side */}
            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <Wallet className="w-3.5 h-3.5 text-emerald-500" />
                {t.hotelBudget}
                <span className="text-slate-400 font-normal">({t.perNight})</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={budgetMinInput}
                    onChange={(e) => handleBudgetMin(e.target.value)}
                    onBlur={handleBudgetMinBlur}
                    onFocus={() => setBudgetMinInput(budget.min > 0 ? String(budget.min) : '')}
                    placeholder="300,000"
                    className="w-full px-3 py-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    đ
                  </span>
                </div>
                <span className="text-slate-400 font-medium">—</span>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={budgetMaxInput}
                    onChange={(e) => handleBudgetMax(e.target.value)}
                    onBlur={handleBudgetMaxBlur}
                    onFocus={() => setBudgetMaxInput(budget.max > 0 ? String(budget.max) : '')}
                    placeholder="1,000,000"
                    className="w-full px-3 py-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    đ
                  </span>
                </div>
              </div>
            </div>

            {/* Compact Summary */}
            <div className="bg-slate-50 rounded-xl px-4 py-3 mb-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
              <span>
                📅{' '}
                <strong>
                  {new Date(departureDate).toLocaleDateString(
                    language === 'vi' ? 'vi-VN' : 'en-US',
                    { weekday: 'short', day: 'numeric', month: 'short' }
                  )}
                </strong>
              </span>
              <span>
                🌙{' '}
                <strong>
                  {displayNights} {displayNights === 1 ? t.night : t.nights}
                </strong>
              </span>
              <span>
                👥{' '}
                <strong>
                  {adults} {t.adult}
                  {children > 0 && `, ${children} ${t.child}`}
                </strong>
              </span>
              {budget.min > 0 && budget.max > 0 && (
                <span>
                  💰{' '}
                  <strong>
                    {formatVND(budget.min * displayNights)} -{' '}
                    {formatVND(budget.max * displayNights)}
                  </strong>
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors text-sm"
              >
                {t.skip}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-[2] py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 text-sm"
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
