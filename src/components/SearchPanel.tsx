import React, { useState, useEffect, useRef } from 'react';
import { Navigation2, MapPin, Globe } from 'lucide-react';
import { Language } from '../types';
import { translations, getLocations } from '../utils/i18n';

interface SearchPanelProps {
  onSearch: (from: string, to: string) => void;
  isLoading: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const SuggestionList: React.FC<{
  query: string;
  locations: string[];
  onSelect: (value: string) => void;
  visible: boolean;
}> = ({ query, locations, onSelect, visible }) => {
  if (!visible || !query) return null;

  const filtered = locations.filter(loc => 
    loc.toLowerCase().includes(query.toLowerCase()) && loc.toLowerCase() !== query.toLowerCase()
  );

  if (filtered.length === 0) return null;

  return (
    <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-100 max-h-48 overflow-y-auto z-50 custom-scrollbar">
      {filtered.map((loc) => (
        <div
          key={loc}
          onClick={() => onSelect(loc)}
          className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-0 transition-colors"
        >
          <div className="p-1.5 bg-slate-100 rounded-full text-slate-400">
            <MapPin className="w-3 h-3" />
          </div>
          <span className="text-slate-700 text-sm font-medium">{loc}</span>
        </div>
      ))}
    </div>
  );
};

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, isLoading, language, onLanguageChange }) => {
  const t = translations[language];
  const locations = getLocations(language);

  const [from, setFrom] = useState(language === 'vi' ? 'TP. Hồ Chí Minh' : 'Ho Chi Minh City');
  const [to, setTo] = useState(language === 'vi' ? 'Đà Lạt' : 'Da Lat');
  
  const [activeInput, setActiveInput] = useState<'from' | 'to' | null>(null);
  
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setActiveInput(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from.trim() && to.trim()) {
      setActiveInput(null);
      onSearch(from, to);
    }
  };

  const toggleLanguage = () => {
    onLanguageChange(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <div ref={panelRef} className="absolute top-0 left-0 md:top-4 md:left-4 z-20 w-full md:max-w-md p-4 md:p-0 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-5 border border-white/20 pointer-events-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30">
              <Navigation2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">{t.appTitle}</h1>
          </div>
          
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 text-[10px] font-bold transition-all"
          >
            <Globe className="w-3 h-3" />
            {language === 'vi' ? 'VN' : 'EN'}
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3 relative">
          
          {/* FROM Input */}
          <div className="relative group">
            <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10">
              <div className="w-2.5 h-2.5 rounded-full border-[3px] border-current"></div>
            </div>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onFocus={() => setActiveInput('from')}
              placeholder={t.originPlaceholder}
              autoComplete="off"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />
            <SuggestionList 
              query={from} 
              locations={locations} 
              visible={activeInput === 'from'} 
              onSelect={(val) => { setFrom(val); setActiveInput(null); }} 
            />
          </div>

          {/* Connector Line */}
          <div className="absolute left-[19px] top-[40px] w-[2px] h-4 bg-slate-200 z-0"></div>

          {/* TO Input */}
          <div className="relative group">
            <div className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-red-500 transition-colors z-10">
               <MapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onFocus={() => setActiveInput('to')}
              placeholder={t.destinationPlaceholder}
              autoComplete="off"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
            />
             <SuggestionList 
              query={to} 
              locations={locations} 
              visible={activeInput === 'to'} 
              onSelect={(val) => { setTo(val); setActiveInput(null); }} 
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-2 text-sm"
          >
            {isLoading ? (
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