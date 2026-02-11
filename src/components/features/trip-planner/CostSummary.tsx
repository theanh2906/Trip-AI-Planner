import React, { useMemo, useState } from 'react';
import {
  Calculator,
  ChevronUp,
  ChevronDown,
  Utensils,
  MapPin,
  Hotel,
  Plane,
  X,
} from 'lucide-react';
import { translations } from '../../../utils/i18n';
import { formatCurrency, formatCurrencyCompact } from '../../../utils/currency';
import { useAppStore } from '../../../stores/appStore';
import { useTripStore } from '../../../stores/tripStore';
import { StopType } from '../../../types';
import { cn } from '../../../lib/utils';

const CostSummary: React.FC = () => {
  const { language, currency } = useAppStore();
  const {
    itinerary,
    selectedCostItems,
    selectedHotel,
    selectedFlight,
    selectedAlternatives,
    searchParams,
  } = useTripStore();
  const t = translations[language];
  const [isExpanded, setIsExpanded] = useState(false);

  // Format currency using centralized utility
  const fmt = (amount: number) => formatCurrency(amount, currency);
  const fmtCompact = (amount: number) => formatCurrencyCompact(amount, currency);

  const travelers = searchParams?.travelers;
  if (!travelers) return null;

  const { adults, children } = travelers;

  // Calculate costs - respecting selected alternatives
  const costBreakdown = useMemo(() => {
    let foodCost = 0;
    let activityCost = 0;
    let foodItems = 0;
    let activityItems = 0;

    selectedCostItems.forEach((index) => {
      const item = itinerary[index];
      if (!item) return;

      // Check if user selected an alternative for this item
      const altIdx = selectedAlternatives[index] ?? -1;
      const alt = altIdx >= 0 && item.alternatives?.[altIdx] ? item.alternatives[altIdx] : null;

      const costAdult = alt?.costPerAdult ?? item.costPerAdult ?? 0;
      const costChild = alt?.costPerChild ?? item.costPerChild ?? 0;
      const itemCost = costAdult * adults + costChild * children;

      if (item.type === StopType.FOOD) {
        foodCost += itemCost;
        foodItems++;
      } else {
        activityCost += itemCost;
        activityItems++;
      }
    });

    const hotelCost = selectedHotel?.totalPrice || 0;

    // Flight cost: per person × travelers
    const flightCost = selectedFlight
      ? selectedFlight.pricePerAdult * adults + selectedFlight.pricePerChild * children
      : 0;

    const totalCost = foodCost + activityCost + hotelCost + flightCost;

    return { foodCost, activityCost, hotelCost, flightCost, totalCost, foodItems, activityItems };
  }, [
    itinerary,
    selectedCostItems,
    selectedHotel,
    selectedFlight,
    selectedAlternatives,
    adults,
    children,
  ]);

  const hasAnyCost = costBreakdown.totalCost > 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto">
      {/* Expandable breakdown panel */}
      {isExpanded && hasAnyCost && (
        <div className="bg-white border-t border-slate-200 px-6 py-4 shadow-lg animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-700">{t.costEstimation}</h4>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="space-y-2">
            {/* Travelers info */}
            <div className="text-xs text-slate-500 mb-2">
              👥 {adults} {t.adult}
              {children > 0 && `, ${children} ${t.child}`}
            </div>

            {/* Flight */}
            {costBreakdown.flightCost > 0 && selectedFlight && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                    <Plane className="w-3 h-3 text-sky-600" />
                  </div>
                  <span className="text-sm text-slate-600 truncate max-w-[200px]">
                    {t.flightCost} ({selectedFlight.airline})
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {fmt(costBreakdown.flightCost)}
                </span>
              </div>
            )}

            {/* Food */}
            {costBreakdown.foodCost > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <Utensils className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-sm text-slate-600">
                    {t.foodCost} <span className="text-slate-400">({costBreakdown.foodItems})</span>
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {fmt(costBreakdown.foodCost)}
                </span>
              </div>
            )}

            {/* Activities */}
            {costBreakdown.activityCost > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-600">
                    {t.activityCost}{' '}
                    <span className="text-slate-400">({costBreakdown.activityItems})</span>
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {fmt(costBreakdown.activityCost)}
                </span>
              </div>
            )}

            {/* Hotel */}
            {costBreakdown.hotelCost > 0 && selectedHotel && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Hotel className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="text-sm text-slate-600 truncate max-w-[200px]">
                    {selectedHotel.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {fmt(costBreakdown.hotelCost)}
                </span>
              </div>
            )}

            {/* Divider + Total */}
            <div className="border-t border-slate-200 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">{t.totalCost}</span>
                <span className="text-lg font-bold text-blue-600">
                  {fmt(costBreakdown.totalCost)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div
        onClick={() => hasAnyCost && setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center justify-between px-6 py-3 border-t transition-all',
          hasAnyCost
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-pointer'
            : 'bg-white text-slate-400 border-slate-200'
        )}
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          <span className="text-sm font-medium">
            {hasAnyCost ? t.costSummary : t.noCostSelected}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasAnyCost && (
            <>
              <span className="text-lg font-bold">{fmtCompact(costBreakdown.totalCost)}</span>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostSummary;
