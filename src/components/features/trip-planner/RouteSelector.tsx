import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, Navigation, Info, ArrowLeft } from 'lucide-react';
import { translations } from '../../../utils/i18n';
import { useAppStore } from '../../../stores/appStore';
import { useTripStore } from '../../../stores/tripStore';
import { RouteOption } from '../../../types';
import { cn } from '../../../lib/utils';
import TripDetailsModal from './TripDetailsModal';

// Tooltip Component with Portal
const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({
  content,
  children,
}) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 280;

      // Position to the right of the icon, or left if no space
      let left = rect.right + 8;
      if (left + tooltipWidth > window.innerWidth - 16) {
        left = rect.left - tooltipWidth - 8;
      }

      setPosition({
        top: rect.top + rect.height / 2,
        left: Math.max(16, left),
      });
    }
  }, [show]);

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => {
          e.stopPropagation();
          setShow(!show);
        }}
      >
        {children}
      </div>
      {show &&
        createPortal(
          <div
            className="fixed z-[9999] w-70 max-w-[280px] p-3 bg-slate-900 text-white text-sm rounded-xl shadow-2xl animate-fade-in"
            style={{
              top: position.top,
              left: position.left,
              transform: 'translateY(-50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="leading-relaxed">{content}</p>
          </div>,
          document.body
        )}
    </>
  );
};

const RouteSelector: React.FC = () => {
  const { language } = useAppStore();
  const {
    routes,
    isLoadingItinerary,
    selectedRoute,
    backToSearch,
    searchParams,
    openTripDetailsModal,
  } = useTripStore();
  const t = translations[language];

  const [pendingRoute, setPendingRoute] = useState<RouteOption | null>(null);

  const handleRouteClick = (route: RouteOption) => {
    if (isLoadingItinerary) return;
    setPendingRoute(route);
    openTripDetailsModal();
  };

  if (routes.length === 0 || selectedRoute) return null;

  return (
    <div className="absolute top-16 left-0 md:top-4 md:left-20 z-20 w-full md:max-w-md p-4 md:p-0 animate-fade-in-up">
      {/* Header with Back button */}
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Trip info header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={backToSearch}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Quay lại tìm kiếm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {searchParams?.origin} → {searchParams?.destination}
              </p>
              <p className="text-xs text-slate-500">{t.selectRoute}</p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
              {routes.length} {t.options}
            </span>
          </div>
        </div>

        {/* Route cards list */}
        <div className="p-4 space-y-3 max-h-[50vh] md:max-h-[60vh] overflow-y-auto custom-scrollbar">
          {routes.map((route, index) => (
            <div
              key={route.id}
              onClick={() => handleRouteClick(route)}
              className={cn(
                'bg-slate-50 hover:bg-white rounded-xl p-4 border border-slate-100 transition-all cursor-pointer',
                'hover:shadow-lg hover:-translate-y-0.5',
                'group relative overflow-visible',
                isLoadingItinerary && 'opacity-50 cursor-wait'
              )}
            >
              {/* Rank indicator */}
              <div
                className={cn(
                  'absolute top-0 left-0 w-1 h-full rounded-l-xl',
                  index === 0
                    ? 'bg-gradient-to-b from-amber-400 to-orange-500'
                    : 'bg-blue-400 group-hover:bg-indigo-500'
                )}
              />

              {/* Recommended badge */}
              {index === 0 && (
                <div className="absolute top-2 right-2">
                  <span className="text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full">
                    ⭐ Đề xuất
                  </span>
                </div>
              )}

              {/* Route Name + Info Tooltip */}
              <div className="flex items-center gap-2 mb-2 pl-2 pr-16">
                <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {route.name}
                </h4>
                <Tooltip content={route.description}>
                  <button
                    type="button"
                    className="p-1 hover:bg-blue-100 rounded-full transition-colors flex-shrink-0"
                  >
                    <Info className="w-4 h-4 text-slate-400 hover:text-blue-500" />
                  </button>
                </Tooltip>
              </div>

              {/* Duration & Distance */}
              <div className="flex items-center gap-4 pl-2">
                <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm">
                  <Clock className="w-4 h-4" />
                  {route.duration}
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <Navigation className="w-4 h-4" />
                  {route.distance}
                </div>
              </div>

              {/* Highlights */}
              <div className="mt-2 pl-2 flex flex-wrap gap-1.5">
                {route.highlights.slice(0, 3).map((highlight, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200"
                  >
                    {highlight}
                  </span>
                ))}
                {route.highlights.length > 3 && (
                  <span className="text-xs text-slate-400">+{route.highlights.length - 3}</span>
                )}
              </div>

              {isLoadingItinerary && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trip Details Modal */}
      <TripDetailsModal route={pendingRoute} />
    </div>
  );
};

export default RouteSelector;
