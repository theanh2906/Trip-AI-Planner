import React, { useState, useMemo } from 'react';
import { CategoryIcon, getCategoryColor } from '../../Icons';
import {
  Star,
  MapPin,
  X,
  Clock,
  Navigation,
  List,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import { translations } from '../../../utils/i18n';
import { useAppStore } from '../../../stores/appStore';
import { useTripStore } from '../../../stores/tripStore';
import { TimelineItem } from '../../../types';
import { cn } from '../../../lib/utils';
import HotelSection from './HotelSection';

const Timeline: React.FC = () => {
  const { language } = useAppStore();
  const {
    itinerary,
    selectedRoute,
    backToRoutes,
    navigateTo,
    isMobileMapView,
    toggleMobileView,
    selectedDay,
    setSelectedDay,
    searchParams,
  } = useTripStore();
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
  const t = translations[language];

  // Get unique days from itinerary
  const availableDays = useMemo(() => {
    const days = [...new Set(itinerary.map((item) => item.day))].sort((a, b) => a - b);
    return days.length > 0 ? days : [1];
  }, [itinerary]);

  // Filter itinerary by selected day
  const filteredItinerary = useMemo(() => {
    return itinerary.filter((item) => item.day === selectedDay);
  }, [itinerary, selectedDay]);

  // Check if multi-day trip
  const isMultiDay = availableDays.length > 1;

  if (!selectedRoute || itinerary.length === 0) return null;

  const mobileClasses = isMobileMapView ? 'hidden md:flex' : 'flex w-full';
  const desktopClasses = `md:w-[480px] transition-transform duration-300 ${isCollapsed ? 'md:-translate-x-full' : 'md:translate-x-0'}`;

  return (
    <>
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 md:hidden pointer-events-auto">
        <button
          onClick={toggleMobileView}
          className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 active:scale-95"
        >
          {isMobileMapView ? <List className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
          {isMobileMapView ? t.itineraryTitle : 'View Map'}
        </button>
      </div>
      <div
        className={cn(
          'absolute top-0 md:top-0 bottom-16 md:bottom-0 left-0 bg-white shadow-2xl z-30 flex-col pointer-events-auto',
          mobileClasses,
          desktopClasses
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 -right-12 -translate-y-1/2 bg-white w-12 h-14 rounded-r-xl shadow-lg border hidden md:flex items-center justify-center text-slate-500 hover:text-blue-600 z-40"
        >
          {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
        <div className="flex flex-col border-b border-slate-100 bg-white sticky top-0 flex-shrink-0 z-10">
          <div className="flex items-center justify-between p-6 pb-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{t.itineraryTitle}</h2>
              <p className="text-slate-500 text-sm mt-1">{t.suggestedBy}</p>
            </div>
            <button
              onClick={backToRoutes}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Day Selector - only show for multi-day trips */}
          {isMultiDay && (
            <div className="px-6 pb-4">
              <div className="relative">
                <button
                  onClick={() => setIsDayDropdownOpen(!isDayDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-slate-700 font-medium hover:from-blue-100 hover:to-indigo-100 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>
                      {t.dayLabel} {selectedDay}
                    </span>
                    <span className="text-slate-400 text-sm">
                      ({filteredItinerary.length} {language === 'vi' ? 'hoạt động' : 'activities'})
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-slate-400 transition-transform',
                      isDayDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDayDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20">
                    {availableDays.map((day) => {
                      const dayItemCount = itinerary.filter((item) => item.day === day).length;
                      return (
                        <button
                          key={day}
                          onClick={() => {
                            setSelectedDay(day);
                            setIsDayDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors',
                            selectedDay === day && 'bg-blue-50 text-blue-700'
                          )}
                        >
                          <span className="font-medium">
                            {t.dayLabel} {day}
                          </span>
                          <span className="text-sm text-slate-400">
                            {dayItemCount} {language === 'vi' ? 'hoạt động' : 'activities'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Day Pills for quick switching */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                {availableDays.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                      selectedDay === day
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {t.dayLabel} {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50 pb-24 md:pb-6">
          <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 pb-10">
            {filteredItinerary.map((item, index) => (
              <div key={index} className="relative group">
                <div
                  className={cn(
                    'absolute -left-[33px] top-0 w-10 h-10 rounded-full border-4 border-slate-50 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform',
                    getCategoryColor(item.type)
                  )}
                >
                  <CategoryIcon type={item.type} className="w-5 h-5 text-white" />
                </div>
                <div
                  onClick={() => {
                    setSelectedItem(item);
                    navigateTo(item);
                  }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 ml-4 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                      {item.time}
                    </span>
                    {item.rating && (
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {item.rating}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 truncate mb-1">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1 text-slate-500 text-xs mb-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{item.locationName}</span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="relative">
              <div className="absolute -left-[29px] top-0 w-8 h-8 rounded-full bg-slate-800 border-4 border-slate-50 flex items-center justify-center shadow-md">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="ml-4 pt-1">
                <p className="text-slate-400 font-semibold text-sm uppercase tracking-wider">
                  {t.destination}
                </p>
              </div>
            </div>
          </div>

          {/* Hotel Recommendations Section */}
          <HotelSection />
        </div>
        {selectedItem && (
          <div className="absolute inset-0 z-50 bg-white animate-fade-in flex flex-col">
            <div className="relative h-64 w-full flex-shrink-0">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold mb-2 backdrop-blur-md bg-white/20 border border-white/20">
                  <CategoryIcon type={selectedItem.type} className="w-3 h-3" />
                  {selectedItem.type}
                </div>
                <h2 className="text-3xl font-bold drop-shadow-lg">{selectedItem.title}</h2>
              </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto pb-24 md:pb-8">
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2 text-slate-700 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {selectedItem.time}
                </div>
                {selectedItem.rating && (
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-lg">
                    <Star className="w-4 h-4 fill-current" />
                    {selectedItem.rating}
                  </div>
                )}
              </div>
              <div className="mb-6">
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-2">
                  {t.intro}
                </h3>
                <p className="text-slate-700 leading-relaxed text-lg">{selectedItem.description}</p>
              </div>
              <div className="mb-8">
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-2">
                  {t.location}
                </h3>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <span className="text-blue-900 font-medium">{selectedItem.locationName}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  navigateTo(selectedItem);
                  if (window.innerWidth < 768) toggleMobileView();
                  setSelectedItem(null);
                }}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                {t.navigate}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Timeline;
