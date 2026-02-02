import React, { useState } from 'react';
import SearchPanel from './components/SearchPanel';
import RouteSelector from './components/RouteSelector';
import Timeline from './components/Timeline';
import Map from './components/Map';
import { RouteOption, TimelineItem, Language } from './types';
import { fetchRouteOptions, fetchItinerary } from './services/geminiService';
import { translations } from './utils/i18n';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('vi'); // Default 'vi'
  const t = translations[language];

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [itinerary, setItinerary] = useState<TimelineItem[]>([]);
  
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false);
  
  const [searchParams, setSearchParams] = useState({ from: '', to: '' });
  
  // Navigation State
  const [navigationPath, setNavigationPath] = useState<TimelineItem[] | null>(null);
  
  // Mobile View State
  const [isMobileMapView, setIsMobileMapView] = useState(false);

  const handleSearch = async (from: string, to: string) => {
    setSearchParams({ from, to });
    setIsLoadingRoutes(true);
    setRoutes([]); 
    setSelectedRoute(null);
    setItinerary([]);
    setNavigationPath(null);

    const results = await fetchRouteOptions(from, to, language);
    setRoutes(results);
    setIsLoadingRoutes(false);
  };

  const handleRouteSelect = async (route: RouteOption) => {
    setSelectedRoute(route);
    setIsLoadingItinerary(true);
    setIsMobileMapView(false); // Show list first
    
    const items = await fetchItinerary(searchParams.from, searchParams.to, route.name, language);
    setItinerary(items);
    setIsLoadingItinerary(false);
  };

  const handleBackToRoutes = () => {
    setItinerary([]);
    setSelectedRoute(null);
    setNavigationPath(null);
  };

  const handleNavigate = (item: TimelineItem) => {
    // Determine Start Point (First item in itinerary is Start)
    if (itinerary.length > 0) {
      const startPoint = itinerary[0];
      setNavigationPath([startPoint, item]);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-100 overflow-hidden font-sans text-slate-900">
      {/* Map Layer - z-0 */}
      <div className="absolute inset-0 z-0">
         <Map items={itinerary} navigationPath={navigationPath} />
      </div>

      {/* UI Layers - z-10 and above */}
      {/* Note: We removed the wrapping pointer-events-none div to prevent any event capturing issues. 
          Each component handles its own positioning and pointer events. */}

      {!selectedRoute && (
        <SearchPanel 
          onSearch={handleSearch} 
          isLoading={isLoadingRoutes} 
          language={language}
          onLanguageChange={setLanguage}
        />
      )}

      {/* Route Selection */}
      {!selectedRoute && routes.length > 0 && (
         <RouteSelector 
           routes={routes} 
           onSelectRoute={handleRouteSelect} 
           isLoading={isLoadingItinerary} 
           language={language}
         />
      )}

      {/* Itinerary Timeline */}
      {selectedRoute && itinerary.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="pointer-events-auto w-full h-full">
            <Timeline 
              items={itinerary} 
              onBack={handleBackToRoutes} 
              language={language}
              onNavigate={handleNavigate}
              onToggleView={() => setIsMobileMapView(!isMobileMapView)}
              isMobileMapView={isMobileMapView}
            />
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {selectedRoute && isLoadingItinerary && (
         <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm text-center mx-4">
               <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">{t.buildingPlan}</h3>
               <p className="text-slate-500">{t.buildingPlanDesc}</p>
            </div>
         </div>
      )}

      {/* Empty State Text */}
      {!isLoadingRoutes && routes.length === 0 && !selectedRoute && (
        <div className="absolute bottom-10 right-10 text-right opacity-50 hidden md:block z-0 pointer-events-none">
          <h1 className="text-6xl font-black text-slate-300 tracking-tighter">{t.exploreTitle}</h1>
          <h1 className="text-6xl font-black text-slate-300 tracking-tighter">{t.exploreSubtitle}</h1>
        </div>
      )}
    </div>
  );
};

export default App;