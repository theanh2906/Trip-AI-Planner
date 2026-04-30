'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Compass,
  RefreshCw,
  MapPin,
  Loader2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations } from '@/utils/i18n';
import { useAppStore } from '@/stores/appStore';
import { useExploreStore } from '@/stores/exploreStore';
import { useIsMobile } from '@/hooks/useMediaQuery';
import SuggestionCard from './SuggestionCard';
import type { NearbySuggestion, NearbyCategory, TimelineItem, StopType } from '@/types';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

const CATEGORIES: { id: NearbyCategory | null; labelKey: string }[] = [
  { id: null, labelKey: 'exploreAllCategories' },
  { id: 'food', labelKey: 'exploreFood' },
  { id: 'culture', labelKey: 'exploreCulture' },
  { id: 'outdoor', labelKey: 'exploreOutdoor' },
  { id: 'cafe', labelKey: 'exploreCafe' },
  { id: 'shopping', labelKey: 'exploreShopping' },
  { id: 'entertainment', labelKey: 'exploreEntertainment' },
  { id: 'wellness', labelKey: 'exploreWellness' },
];

// Convert NearbySuggestion to TimelineItem for Map compatibility
const toMapItems = (suggestions: NearbySuggestion[]): TimelineItem[] =>
  suggestions
    .filter((s) => s.coordinates)
    .map((s, i) => ({
      day: 1,
      time: '',
      title: s.title,
      description: s.description,
      type: categoryToStopType(s.category),
      locationName: s.locationName,
      rating: s.rating,
      coordinates: s.coordinates,
      imageUrl: s.imageUrl,
      duration: s.estimatedDuration,
      costPerAdult: s.costPerAdult,
      costPerChild: s.costPerChild,
      tips: s.tips,
    }));

const categoryToStopType = (cat: NearbyCategory): StopType => {
  const map: Record<NearbyCategory, string> = {
    food: 'FOOD',
    culture: 'SIGHTSEEING',
    outdoor: 'SIGHTSEEING',
    shopping: 'SIGHTSEEING',
    entertainment: 'SIGHTSEEING',
    cafe: 'FOOD',
    wellness: 'REST',
  };
  return map[cat] as StopType;
};

const ExploreNearby: React.FC = () => {
  const { language } = useAppStore();
  const t = translations[language];
  const isMobile = useIsMobile();
  const {
    suggestions,
    location,
    activeCategory,
    isLoadingLocation,
    isLoadingSuggestions,
    locationError,
    suggestionsError,
    hasFetched,
    fetchSuggestions,
    setActiveCategory,
    setLocationManually,
  } = useExploreStore();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [manualCity, setManualCity] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    if (!hasFetched && !isLoadingLocation && !isLoadingSuggestions) {
      fetchSuggestions();
    }
  }, [hasFetched, isLoadingLocation, isLoadingSuggestions, fetchSuggestions]);

  const filteredSuggestions = activeCategory
    ? suggestions.filter((s) => s.category === activeCategory)
    : suggestions;

  const mapItems = toMapItems(filteredSuggestions);

  const handleCardClick = (suggestion: NearbySuggestion) => {
    setSelectedId(suggestion.id === selectedId ? null : suggestion.id);
  };

  const handleRefresh = () => {
    setSelectedId(null);
    fetchSuggestions();
  };

  const handleManualSubmit = useCallback(() => {
    if (!manualCity.trim()) return;
    setLocationManually(manualCity.trim(), 0, 0, '');
    setShowManualInput(false);
    fetchSuggestions();
  }, [manualCity, setLocationManually, fetchSuggestions]);

  const isLoading = isLoadingLocation || isLoadingSuggestions;

  // --- Loading / Error states ---
  const renderStatus = () => {
    if (isLoadingLocation) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-500 text-sm">{t.exploreLoadingLocation}</p>
        </div>
      );
    }

    if (locationError && !showManualInput) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-slate-600 text-sm text-center">{t.exploreLocationError}</p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchSuggestions()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t.exploreRetry}
            </button>
            <button
              onClick={() => setShowManualInput(true)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              {t.exploreManualInput}
            </button>
          </div>
        </div>
      );
    }

    if (showManualInput) {
      return (
        <div className="px-4 py-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              placeholder={t.exploreManualInput}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleManualSubmit}
            disabled={!manualCity.trim()}
            className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t.searchButton}
          </button>
        </div>
      );
    }

    if (isLoadingSuggestions) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-500 text-sm">{t.exploreLoadingSuggestions}</p>
        </div>
      );
    }

    if (suggestionsError) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-slate-500 text-sm">{t.exploreNoSuggestions}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.exploreRetry}
          </button>
        </div>
      );
    }

    return null;
  };

  // --- Panel content ---
  const renderPanel = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t.exploreNearbyTitle}</h2>
              <p className="text-xs text-slate-500">{t.exploreNearbySubtitle}</p>
            </div>
          </div>
          {suggestions.length > 0 && (
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
          )}
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <MapPin className="w-3 h-3" />
            <span>
              {location.city}
              {location.country ? `, ${location.country}` : ''}
            </span>
          </div>
        )}
      </div>

      {/* Category filter tabs */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-100 overflow-x-auto overscroll-contain touch-pan-x">
          <div className="flex gap-1.5 min-w-max">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id ?? 'all'}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap',
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {(t as Record<string, string>)[cat.labelKey]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar overscroll-contain touch-pan-y">
        {renderStatus()}

        {filteredSuggestions.length > 0 && (
          <div className="p-3 space-y-3">
            {filteredSuggestions.map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={selectedId === suggestion.id}
                onClick={() => handleCardClick(suggestion)}
              />
            ))}

            {/* Disclaimer */}
            <p className="text-[10px] text-slate-400 text-center py-2">
              {t.exploreDisclaimer}
            </p>
          </div>
        )}

        {!isLoading &&
          !locationError &&
          !suggestionsError &&
          suggestions.length > 0 &&
          filteredSuggestions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-500 text-sm">{t.exploreNoSuggestions}</p>
            </div>
          )}
      </div>
    </div>
  );

  return (
    <>
      {/* Map background */}
      <div className="absolute inset-0 z-0">
        <Map items={mapItems} navigationPath={null} />
      </div>

      {/* Desktop: side panel */}
      {!isMobile && (
        <div className="absolute left-0 top-0 bottom-0 w-96 bg-white/95 backdrop-blur-xl shadow-2xl z-20 flex flex-col">
          {renderPanel()}
        </div>
      )}

      {/* Mobile: bottom panel */}
      {isMobile && (
        <div className="absolute bottom-16 left-0 right-0 max-h-[60vh] bg-white/95 backdrop-blur-xl rounded-t-2xl shadow-2xl z-20 flex flex-col overflow-hidden">
          {/* Drag handle */}
          <div className="flex justify-center py-2">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>
          {renderPanel()}
        </div>
      )}
    </>
  );
};

export default ExploreNearby;
