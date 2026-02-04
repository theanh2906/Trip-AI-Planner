import React from 'react';
import { RouteOption, Language } from '../types';
import { Clock, Navigation } from 'lucide-react';
import { translations } from '../utils/i18n';

interface RouteSelectorProps {
  routes: RouteOption[];
  onSelectRoute: (route: RouteOption) => void;
  isLoading: boolean;
  language: Language;
}

const RouteSelector: React.FC<RouteSelectorProps> = ({
  routes,
  onSelectRoute,
  isLoading,
  language,
}) => {
  const t = translations[language];

  if (routes.length === 0) return null;

  return (
    // Adjusted positioning: top-[240px] for mobile, top-80 for desktop. Added padding for mobile.
    <div className="absolute top-[240px] md:top-80 left-0 md:left-4 right-0 md:right-auto px-4 md:px-0 z-10 w-full max-w-md animate-fade-in-up">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          {t.selectRoute}
        </h3>
        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
          {routes.length} {t.options}
        </span>
      </div>

      {/* Added max-height and overflow-y-auto to allow scrolling within the list on mobile */}
      <div className="space-y-3 max-h-[55vh] overflow-y-auto custom-scrollbar pb-4 pr-1">
        {routes.map((route) => (
          <div
            key={route.id}
            onClick={() => !isLoading && onSelectRoute(route)}
            className={`bg-white rounded-xl p-4 border transition-all cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 group relative overflow-hidden ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:bg-indigo-500 transition-colors"></div>

            <div className="flex justify-between items-start mb-2 pl-2">
              <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                {route.name}
              </h4>
              <div className="flex items-center gap-1 text-slate-500 text-xs font-medium bg-slate-100 px-2 py-1 rounded-md">
                <Navigation className="w-3 h-3" />
                {route.distance}
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-3 pl-2 leading-relaxed">{route.description}</p>

            <div className="flex items-center gap-4 pl-2">
              <div className="flex items-center gap-1.5 text-blue-600 font-semibold text-sm">
                <Clock className="w-4 h-4" />
                {route.duration}
              </div>
              <div className="h-4 w-[1px] bg-slate-200"></div>
              <div className="text-xs text-slate-500 truncate max-w-[200px]">
                {t.via}: {route.highlights.join(' • ')}
              </div>
            </div>

            {isLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteSelector;
