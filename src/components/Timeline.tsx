import React, { useState } from 'react';
import { TimelineItem, Language } from '../types';
import { CategoryIcon, getCategoryColor } from './Icons';
import { Star, MapPin, X, Clock, Navigation, List, Map as MapIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { translations } from '../utils/i18n';

interface TimelineProps {
  items: TimelineItem[];
  onBack: () => void;
  language: Language;
  onNavigate: (item: TimelineItem) => void;
  onToggleView: () => void; // For mobile toggle
  isMobileMapView: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ items, onBack, language, onNavigate, onToggleView, isMobileMapView }) => {
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse state
  const t = translations[language];

  // Mobile: Controlled by isMobileMapView (passed from parent).
  // Desktop: Controlled by isCollapsed (local state).
  
  // Base classes
  // Mobile: if isMobileMapView is true -> hidden (show map). else -> flex w-full.
  // Desktop: flex w-[480px]. transform based on isCollapsed.
  
  // Note: We use pointer-events-auto here because parent wrapper in App is pointer-events-none
  const mobileClasses = isMobileMapView ? "hidden md:flex" : "flex w-full";
  const desktopClasses = `md:w-[480px] transition-transform duration-300 ease-in-out ${isCollapsed ? 'md:-translate-x-full' : 'md:translate-x-0'}`;

  return (
    <>
      {/* Mobile Toggle Button (Floating) - pointer-events-auto */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden pointer-events-auto">
        <button 
          onClick={onToggleView}
          className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 active:scale-95 transition-transform"
        >
          {isMobileMapView ? <List className="w-5 h-5"/> : <MapIcon className="w-5 h-5"/>}
          {isMobileMapView ? t.itineraryTitle : "View Map"}
        </button>
      </div>

      {/* Sidebar Container - pointer-events-auto */}
      <div className={`absolute inset-y-0 left-0 bg-white shadow-2xl z-20 flex-col pointer-events-auto ${mobileClasses} ${desktopClasses}`}>
        
        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 -right-12 -translate-y-1/2 bg-white w-12 h-14 rounded-r-xl shadow-[4px_0_16px_rgba(0,0,0,0.1)] border-y border-r border-slate-100 hidden md:flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors z-40"
          title={isCollapsed ? "Expand Itinerary" : "Collapse Itinerary"}
        >
           {isCollapsed ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white z-10 sticky top-0 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{t.itineraryTitle}</h2>
            <p className="text-slate-500 text-sm mt-1">{t.suggestedBy}</p>
          </div>
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Timeline Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50 pb-24 md:pb-6">
          <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 pb-10">
            
            {items.map((item, index) => (
              <div key={index} className="relative group">
                {/* Node Dot */}
                <div 
                  className={`absolute -left-[33px] top-0 w-10 h-10 rounded-full border-4 border-slate-50 flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${getCategoryColor(item.type)}`}
                >
                  <CategoryIcon type={item.type} className="w-5 h-5 text-white" />
                </div>

                {/* Card */}
                <div 
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 ml-4 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all transform hover:-translate-y-1 active:scale-[0.99]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 mb-2">
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
                    {/* Thumbnail Image */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1 truncate">{item.title}</h3>
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
            
            {/* Finish Line */}
            <div className="relative">
              <div className="absolute -left-[29px] top-0 w-8 h-8 rounded-full bg-slate-800 border-4 border-slate-50 flex items-center justify-center shadow-md">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="ml-4 pt-1">
                <p className="text-slate-400 font-semibold text-sm uppercase tracking-wider">{t.destination}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Detail Modal (Pop-over inside the timeline column) */}
        {selectedItem && (
          <div className="absolute inset-0 z-50 bg-white animate-fade-in flex flex-col pointer-events-auto">
             <div className="relative h-64 w-full flex-shrink-0">
                <img 
                  src={selectedItem.imageUrl} 
                  alt={selectedItem.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors z-10 pointer-events-auto"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold mb-2 backdrop-blur-md bg-white/20 text-white border border-white/20`}>
                     <CategoryIcon type={selectedItem.type} className="w-3 h-3" />
                     {selectedItem.type}
                  </div>
                  <h2 className="text-3xl font-bold leading-tight shadow-black drop-shadow-lg">{selectedItem.title}</h2>
                </div>
             </div>

             <div className="flex-1 p-8 overflow-y-auto pb-24 md:pb-8">
                <div className="flex items-center gap-4 mb-6">
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
                  <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-2">{t.intro}</h3>
                  <p className="text-slate-700 leading-relaxed text-lg">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="mb-8">
                   <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-2">{t.location}</h3>
                   <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-blue-900 font-medium">{selectedItem.locationName}</span>
                   </div>
                </div>

                <button 
                  onClick={() => {
                    onNavigate(selectedItem);
                    if (window.innerWidth < 768) {
                       onToggleView(); // Mobile: switch to map
                    } else {
                       // Desktop: Maybe collapse the sidebar to show the route better?
                       // Optional: setIsCollapsed(true);
                    }
                    setSelectedItem(null); 
                  }}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
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