'use client';

import React, { useRef, useCallback } from 'react';
import {
  Utensils,
  Landmark,
  TreePine,
  ShoppingBag,
  Music,
  Coffee,
  Heart,
  Clock,
  MapPin,
  Sun,
  CloudRain,
  Cloud,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations } from '@/utils/i18n';
import { useAppStore } from '@/stores/appStore';
import { useExploreStore } from '@/stores/exploreStore';
import { formatCurrency } from '@/utils/currency';
import type { NearbySuggestion, NearbyCategory } from '@/types';

const categoryConfig: Record<NearbyCategory, { color: string; icon: React.ElementType }> = {
  food: { color: 'bg-orange-500', icon: Utensils },
  culture: { color: 'bg-purple-500', icon: Landmark },
  outdoor: { color: 'bg-emerald-500', icon: TreePine },
  shopping: { color: 'bg-pink-500', icon: ShoppingBag },
  entertainment: { color: 'bg-yellow-500', icon: Music },
  cafe: { color: 'bg-amber-600', icon: Coffee },
  wellness: { color: 'bg-teal-500', icon: Heart },
};

const weatherIcons: Record<string, React.ElementType> = {
  ideal: Sun,
  ok: Cloud,
  poor: CloudRain,
};

const weatherColors: Record<string, string> = {
  ideal: 'text-emerald-600 bg-emerald-50',
  ok: 'text-amber-600 bg-amber-50',
  poor: 'text-red-500 bg-red-50',
};

interface SuggestionCardProps {
  suggestion: NearbySuggestion;
  isSelected?: boolean;
  onClick: () => void;
}

const MOVE_THRESHOLD = 10;

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, isSelected, onClick }) => {
  const { language, currency } = useAppStore();
  const { location } = useExploreStore();
  const t = translations[language];

  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const didDrag = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    didDrag.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      didDrag.current = true;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (didDrag.current) return;
    onClick();
  }, [onClick]);

  const catConfig = categoryConfig[suggestion.category];
  const CatIcon = catConfig.icon;
  const WeatherIcon = weatherIcons[suggestion.weatherSuitability] || Cloud;

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!suggestion.coordinates) return;

    const dest = `${suggestion.coordinates.lat},${suggestion.coordinates.lng}`;
    const origin = location ? `${location.lat},${location.lng}` : '';
    const originParam = origin ? `&origin=${origin}` : '';
    const url = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${dest}&travelmode=walking`;
    window.open(url, '_blank');
  };

  const categoryLabel =
    {
      food: t.exploreFood,
      culture: t.exploreCulture,
      outdoor: t.exploreOutdoor,
      shopping: t.exploreShopping,
      entertainment: t.exploreEntertainment,
      cafe: t.exploreCafe,
      wellness: t.exploreWellness,
    }[suggestion.category] || suggestion.category;

  const weatherLabel =
    {
      ideal: t.exploreIdealWeather,
      ok: t.exploreOkWeather,
      poor: t.explorePoorWeather,
    }[suggestion.weatherSuitability] || '';

  return (
    <div
      onClick={handleClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      className={cn(
        'bg-white rounded-xl border cursor-pointer transition-all hover:shadow-md',
        isSelected ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20' : 'border-slate-200'
      )}
    >
      {/* Image */}
      {suggestion.imageUrl && (
        <div className="relative h-32 overflow-hidden rounded-t-xl">
          <img
            src={suggestion.imageUrl}
            alt={suggestion.title}
            className="w-full h-full object-cover"
          />
          {/* Category badge */}
          <div
            className={cn(
              'absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium',
              catConfig.color
            )}
          >
            <CatIcon className="w-3 h-3" />
            {categoryLabel}
          </div>
          {/* Open/Closed badge */}
          <div
            className={cn(
              'absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium',
              suggestion.isOpenNow
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            )}
          >
            {suggestion.isOpenNow ? t.exploreOpenNow : t.exploreClosed}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2">
            {suggestion.title}
          </h3>
          {suggestion.rating && (
            <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
              ⭐ {suggestion.rating}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 line-clamp-2">{suggestion.description}</p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {suggestion.estimatedDuration}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{suggestion.locationName}</span>
          </div>
        </div>

        {/* Weather + Cost row */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              weatherColors[suggestion.weatherSuitability]
            )}
          >
            <WeatherIcon className="w-3 h-3" />
            {weatherLabel}
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {suggestion.costPerAdult === 0
              ? t.exploreFree
              : formatCurrency(suggestion.costPerAdult, currency)}
          </span>
        </div>

        {/* Open hours */}
        {suggestion.openHours && (
          <div className="text-xs text-slate-400">
            {t.exploreOpenHours}: {suggestion.openHours}
          </div>
        )}

        {/* Tips */}
        {suggestion.tips && suggestion.tips.length > 0 && (
          <div className="text-xs text-blue-600 bg-blue-50 rounded-lg px-2 py-1.5">
            💡 {suggestion.tips[0]}
          </div>
        )}

        {/* Directions button */}
        {suggestion.coordinates && (
          <button
            onClick={handleDirections}
            className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            {t.exploreDirections}
          </button>
        )}
      </div>
    </div>
  );
};

export default SuggestionCard;
