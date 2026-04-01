import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, Thermometer, Wind } from 'lucide-react';
import { weatherService } from '../../../services/weatherService';
import { WeatherResponse, WeatherDay } from '../../../types/weather';
import { useAppStore } from '../../../stores/appStore';
import { translations } from '../../../utils/i18n';

interface TripWeatherWidgetProps {
  destination: string;
  date: string; // YYYY-MM-DD
}

const TripWeatherWidget: React.FC<TripWeatherWidgetProps> = ({ destination, date }) => {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useAppStore();
  const t = translations[language];

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      if (!destination || !date) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await weatherService.fetchWeather(destination, date);
        if (isMounted) {
          setWeatherData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch weather');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [destination, date]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-6">
        <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mr-3" />
        <span className="text-sm text-blue-600 font-medium">{t.loadingWeather || 'Loading weather...'}</span>
      </div>
    );
  }

  if (error || !weatherData || !weatherData.days || weatherData.days.length === 0) {
    return null;
  }

  const dayWeather: WeatherDay = weatherData.days[0];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500">
            {dayWeather.precipprob > 50 ? (
              <CloudRain className="w-5 h-5" />
            ) : dayWeather.cloudcover > 50 ? (
              <Cloud className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">
              {Math.round(dayWeather.tempmax)}° / {Math.round(dayWeather.tempmin)}°
            </div>
            <div className="text-xs text-slate-500 capitalize line-clamp-1 max-w-[120px]">
              {dayWeather.conditions}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex flex-col items-center">
            <CloudRain className="w-3.5 h-3.5 text-blue-400 mb-0.5" />
            <span>{dayWeather.precipprob}%</span>
          </div>
          <div className="flex flex-col items-center">
            <Wind className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
            <span>{Math.round(dayWeather.windspeed)}km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripWeatherWidget;
