import React from 'react';
import WeatherSearch from './WeatherSearch';
import CurrentWeather from './CurrentWeather';
import ForecastList from './ForecastList';
import { useWeatherStore } from '../../../stores/weatherStore';
import { useAppStore } from '../../../stores/appStore';
import { translations } from '../../../utils/i18n';
import { CloudSun } from 'lucide-react';

const WeatherDashboard: React.FC = () => {
  const { weatherData, isLoading, error } = useWeatherStore();
  const { language } = useAppStore();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-24 md:pb-10 px-4 md:px-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-6">
            <CloudSun className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
            {t.navWeather}
          </h1>
          <p className="text-slate-500 text-lg">
            {t.weatherSubtitle || 'Check current weather and forecasts for your destinations'}
          </p>
        </div>

        <WeatherSearch />

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        {isLoading && !weatherData && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {weatherData && (
          <div className="animate-fade-in space-y-6">
            <CurrentWeather />
            <ForecastList />
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;
