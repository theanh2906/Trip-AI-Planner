import React, { useEffect } from 'react';
import { AppShell } from './components/layout';
import { SearchPanel, RouteSelector, Timeline } from './components/features/trip-planner';
import Map from './components/Map';
import { translations } from './utils/i18n';
import { useAppStore } from './stores/appStore';
import { useTripStore } from './stores/tripStore';

const ComingSoon: React.FC<{ feature: string }> = ({ feature }) => {
  const { language } = useAppStore();
  const t = translations[language];
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center max-w-sm mx-4 pointer-events-auto">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🚀</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{feature}</h2>
        <p className="text-slate-500">{t.featureInDevelopment}</p>
      </div>
    </div>
  );
};

const TripPlannerFeature: React.FC = () => {
  const { language } = useAppStore();
  const { itinerary, navigationPath, routes, selectedRoute, isLoadingRoutes, isLoadingItinerary } = useTripStore();
  const t = translations[language];

  return (
    <>
      <div className="absolute inset-0 z-0"><Map items={itinerary} navigationPath={navigationPath} /></div>
      <SearchPanel />
      <RouteSelector />
      <div className="absolute inset-0 pointer-events-none z-20"><Timeline /></div>
      {selectedRoute && isLoadingItinerary && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-50 pointer-events-auto">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm text-center mx-4">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t.buildingPlan}</h3>
            <p className="text-slate-500">{t.buildingPlanDesc}</p>
          </div>
        </div>
      )}
      {!isLoadingRoutes && routes.length === 0 && !selectedRoute && (
        <div className="absolute bottom-24 md:bottom-10 right-4 md:right-10 text-right opacity-50 hidden md:block z-0 pointer-events-none">
          <h1 className="text-6xl font-black text-slate-300 tracking-tighter">{t.exploreTitle}</h1>
          <h1 className="text-6xl font-black text-slate-300 tracking-tighter">{t.exploreSubtitle}</h1>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  const { activeFeature, setOnline } = useAppStore();

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [setOnline]);

  const renderFeature = () => {
    switch (activeFeature) {
      case 'trip-planner': return <TripPlannerFeature />;
      case 'budget': return <ComingSoon feature="Budget Calculator" />;
      case 'weather': return <ComingSoon feature="Weather" />;
      case 'ai-assistant': return <ComingSoon feature="AI Assistant" />;
      case 'saved-trips': return <ComingSoon feature="Saved Trips" />;
      case 'settings': return <ComingSoon feature="Settings" />;
      default: return <TripPlannerFeature />;
    }
  };

  return <AppShell>{renderFeature()}</AppShell>;
};

export default App;
