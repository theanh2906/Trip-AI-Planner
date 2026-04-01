import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useWeatherStore } from '../../../stores/weatherStore';
import { useAppStore } from '../../../stores/appStore';
import { translations } from '../../../utils/i18n';

const WeatherSearch: React.FC = () => {
  const [input, setInput] = useState('');
  const { fetchWeather, isLoading } = useWeatherStore();
  const { language } = useAppStore();
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      fetchWeather(input);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <MapPin className="absolute left-4 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.weatherSearchPlaceholder || 'Search for a city...'}
          className="w-full pl-12 pr-16 py-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 text-lg transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
};

export default WeatherSearch;
