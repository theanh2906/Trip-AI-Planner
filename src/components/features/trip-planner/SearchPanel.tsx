import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigation2, MapPin, Car, Bike, Plane, Loader2, LocateFixed } from 'lucide-react';
import { translations } from '../../../utils/i18n';
import { useAppStore } from '../../../stores/appStore';
import { useTripStore } from '../../../stores/tripStore';
import { TravelMode, TripStyle, TRIP_STYLES, Place } from '../../../types';
import { cn } from '../../../lib/utils';
import {
  loadPopularPlaces,
  loadAllPlaces,
  searchPlaces,
  formatPlaceDisplay,
} from '../../../services/placesService';
import { getCurrentLocation, GeolocationError } from '../../../services/geolocationService';

// Suggestion List Component
const SuggestionList: React.FC<{
  suggestions: Place[];
  onSelect: (place: Place) => void;
  visible: boolean;
  isLoading?: boolean;
  language: 'vi' | 'en';
}> = ({ suggestions, onSelect, visible, isLoading, language }) => {
  if (!visible) return null;

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-100 p-4 z-50">
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Đang tìm...</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-100 max-h-48 overflow-y-auto z-50 custom-scrollbar">
      {suggestions.map((place) => (
        <div
          key={place.id}
          onClick={() => onSelect(place)}
          className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
        >
          <div className="p-1.5 bg-slate-100 rounded-full text-slate-400">
            <MapPin className="w-3 h-3" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-slate-700 text-sm font-medium block truncate">{place.name}</span>
            <span className="text-slate-400 text-xs">
              {language === 'vi' ? place.country.vi : place.country.en}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Travel Mode Selector Component
const TravelModeSelector: React.FC<{
  value: TravelMode;
  onChange: (mode: TravelMode) => void;
  language: 'vi' | 'en';
}> = ({ value, onChange, language }) => {
  const labels = {
    car: language === 'vi' ? 'Ô tô' : 'Car',
    motorbike: language === 'vi' ? 'Xe máy' : 'Motorbike',
    plane: language === 'vi' ? 'Máy bay' : 'Plane',
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(TravelMode.CAR)}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all',
          value === TravelMode.CAR
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
        )}
      >
        <Car className="w-4 h-4" />
        <span className="text-sm font-medium">{labels.car}</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(TravelMode.MOTORBIKE)}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all',
          value === TravelMode.MOTORBIKE
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
        )}
      >
        <Bike className="w-4 h-4" />
        <span className="text-sm font-medium">{labels.motorbike}</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(TravelMode.PLANE)}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all',
          value === TravelMode.PLANE
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
        )}
      >
        <Plane className="w-4 h-4" />
        <span className="text-sm font-medium">{labels.plane}</span>
      </button>
    </div>
  );
};

// Trip Style Chips Component
const TripStyleChips: React.FC<{
  selectedStyles: TripStyle[];
  onToggle: (style: TripStyle) => void;
  language: 'vi' | 'en';
}> = ({ selectedStyles, onToggle, language }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {TRIP_STYLES.map((style) => {
        const isSelected = selectedStyles.includes(style.id);
        const label = language === 'vi' ? style.labelVi : style.labelEn;

        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onToggle(style.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all',
              isSelected
                ? style.color
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            )}
          >
            <span>{style.icon}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

// Main SearchPanel Component
const SearchPanel: React.FC = () => {
  const { language } = useAppStore();
  const { searchParams, setSearchParams, search, isLoadingRoutes, routes, selectedRoute } =
    useTripStore();

  const t = translations[language];

  const [origin, setOrigin] = useState(language === 'vi' ? 'Hồ Chí Minh City' : 'Ho Chi Minh City');
  const [destination, setDestination] = useState(language === 'vi' ? 'Đà Lạt' : 'Da Lat');
  const [originCountry, setOriginCountry] = useState('VN');
  const [destinationCountry, setDestinationCountry] = useState('VN');
  const [travelMode, setTravelMode] = useState<TravelMode>(TravelMode.CAR);
  const [tripStyles, setTripStyles] = useState<TripStyle[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const [activeInput, setActiveInput] = useState<'origin' | 'destination' | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [originSuggestions, setOriginSuggestions] = useState<Place[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load places data on mount
  useEffect(() => {
    loadPopularPlaces().then(setPlaces);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setActiveInput(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string, type: 'origin' | 'destination') => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (query.length < 2) {
        if (type === 'origin') setOriginSuggestions([]);
        else setDestinationSuggestions([]);
        return;
      }

      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        // First search in loaded places
        let results = searchPlaces(query, places, { limit: 8, language });

        // If few results, try loading full dataset
        if (results.length < 3 && places.length < 1000) {
          const allPlaces = await loadAllPlaces();
          setPlaces(allPlaces);
          results = searchPlaces(query, allPlaces, { limit: 8, language });
        }

        if (type === 'origin') setOriginSuggestions(results);
        else setDestinationSuggestions(results);
        setIsSearching(false);
      }, 200);
    },
    [places, language]
  );

  // Handle origin input change
  const handleOriginChange = (value: string) => {
    setOrigin(value);
    debouncedSearch(value, 'origin');
  };

  // Handle destination input change
  const handleDestinationChange = (value: string) => {
    setDestination(value);
    debouncedSearch(value, 'destination');
  };

  // Handle place selection
  const handleSelectPlace = (place: Place, type: 'origin' | 'destination') => {
    const displayName = formatPlaceDisplay(place, language);
    if (type === 'origin') {
      setOrigin(place.name);
      setOriginCountry(place.countryCode);
      setOriginSuggestions([]);
    } else {
      setDestination(place.name);
      setDestinationCountry(place.countryCode);
      setDestinationSuggestions([]);
    }
    setActiveInput(null);
  };

  // Handle current location
  const handleUseCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);
    setActiveInput(null);

    try {
      const location = await getCurrentLocation();
      setOrigin(location.displayName);
      setOriginCountry(location.countryCode || 'VN');
      setOriginSuggestions([]);
    } catch (error) {
      const geoError = error as GeolocationError;
      let errorMessage: string;

      switch (geoError.code) {
        case 'PERMISSION_DENIED':
          errorMessage = t.locationPermissionDenied;
          break;
        case 'POSITION_UNAVAILABLE':
          errorMessage = t.locationUnavailable;
          break;
        case 'TIMEOUT':
          errorMessage = t.locationTimeout;
          break;
        case 'NOT_SUPPORTED':
          errorMessage = t.locationNotSupported;
          break;
        default:
          errorMessage = t.locationError;
      }

      setLocationError(errorMessage);
      // Clear error after 3 seconds
      setTimeout(() => setLocationError(null), 3000);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleToggleStyle = (style: TripStyle) => {
    setTripStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    setActiveInput(null);
    setSearchParams({
      origin,
      destination,
      travelMode,
      tripStyles,
    });

    // Small delay to ensure state is updated
    setTimeout(() => {
      search();
    }, 0);
  };

  // Don't show search panel when we have routes or viewing itinerary
  if (routes.length > 0 || selectedRoute) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-16 left-0 md:top-4 md:left-20 z-20 w-full md:max-w-md p-4 md:p-0 pointer-events-none"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 pointer-events-auto overflow-hidden">
        {/* Header - Desktop only */}
        <div className="hidden md:flex items-center gap-3 p-5 pb-0">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
            <Navigation2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">{t.appTitle}</h1>
            <p className="text-xs text-slate-500">{t.appTagline}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Origin Input */}
          <div className="relative group">
            <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
              <div className="w-2.5 h-2.5 rounded-full border-[3px] border-current"></div>
            </div>
            <input
              type="text"
              value={origin}
              onChange={(e) => handleOriginChange(e.target.value)}
              onFocus={() => setActiveInput('origin')}
              placeholder={t.originPlaceholder}
              autoComplete="off"
              className="w-full pl-9 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />
            {/* Current Location Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isGettingLocation}
              title={t.useCurrentLocation}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all z-10',
                isGettingLocation
                  ? 'text-blue-500 cursor-wait'
                  : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'
              )}
            >
              {isGettingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LocateFixed className="w-4 h-4" />
              )}
            </button>
            <SuggestionList
              suggestions={originSuggestions}
              visible={activeInput === 'origin' && origin.length >= 2}
              onSelect={(place) => handleSelectPlace(place, 'origin')}
              isLoading={isSearching && activeInput === 'origin'}
              language={language}
            />
            {/* Location Error Message */}
            {locationError && (
              <div className="absolute top-full left-0 w-full mt-1 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 z-50">
                {locationError}
              </div>
            )}
          </div>

          {/* Connector Line */}
          <div className="absolute left-[39px] md:left-[39px] top-[calc(theme(spacing.16)+theme(spacing.5)+40px)] md:top-[calc(theme(spacing.5)+88px+40px)] w-[2px] h-4 bg-slate-200 z-0"></div>

          {/* Destination Input */}
          <div className="relative group">
            <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-red-500 transition-colors z-10">
              <MapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={destination}
              onChange={(e) => handleDestinationChange(e.target.value)}
              onFocus={() => setActiveInput('destination')}
              placeholder={t.destinationPlaceholder}
              autoComplete="off"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />
            <SuggestionList
              suggestions={destinationSuggestions}
              visible={activeInput === 'destination' && destination.length >= 2}
              onSelect={(place) => handleSelectPlace(place, 'destination')}
              isLoading={isSearching && activeInput === 'destination'}
              language={language}
            />
          </div>

          {/* Expandable Options */}
          <div>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              {isExpanded ? '− Ẩn tùy chọn' : '+ Tùy chọn nâng cao'}
            </button>

            {isExpanded && (
              <div className="mt-3 space-y-4 animate-fade-in">
                {/* Travel Mode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Phương tiện
                  </label>
                  <TravelModeSelector
                    value={travelMode}
                    onChange={setTravelMode}
                    language={language}
                  />
                </div>

                {/* Trip Styles */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Phong cách chuyến đi
                  </label>
                  <TripStyleChips
                    selectedStyles={tripStyles}
                    onToggle={handleToggleStyle}
                    language={language}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoadingRoutes || !origin.trim() || !destination.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
          >
            {isLoadingRoutes ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {t.analyzing}
              </>
            ) : (
              t.searchButton
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SearchPanel;
