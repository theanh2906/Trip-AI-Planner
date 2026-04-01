import React from 'react';
import { Wind, Droplets, Sun, CloudRain, Thermometer } from 'lucide-react';
import { useWeatherStore } from '../../../stores/weatherStore';
import { useAppStore } from '../../../stores/appStore';
import { translations } from '../../../utils/i18n';

const CurrentWeather: React.FC = () => {
  const { weatherData } = useWeatherStore();
  const { language } = useAppStore();
  const t = translations[language];

  if (!weatherData) return null;

  const current = weatherData.currentConditions;

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">{weatherData.resolvedAddress}</h2>
          <p className="text-slate-500 capitalize">{current.conditions}</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-7xl font-black text-slate-800 tracking-tighter">
            {Math.round(current.temp)}°
          </div>
          <div className="flex flex-col gap-1 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-orange-500" />
              {t.feelsLike || 'Feels like'} {Math.round(current.feelslike)}°
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-200/60">
        <div className="flex flex-col items-center p-4 bg-slate-50/50 rounded-2xl">
          <Wind className="w-6 h-6 text-blue-500 mb-2" />
          <span className="text-sm text-slate-500 mb-1">{t.wind || 'Wind'}</span>
          <span className="font-bold text-slate-800">{current.windspeed} km/h</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-slate-50/50 rounded-2xl">
          <Droplets className="w-6 h-6 text-blue-400 mb-2" />
          <span className="text-sm text-slate-500 mb-1">{t.humidity || 'Humidity'}</span>
          <span className="font-bold text-slate-800">{Math.round(current.humidity)}%</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-slate-50/50 rounded-2xl">
          <Sun className="w-6 h-6 text-amber-500 mb-2" />
          <span className="text-sm text-slate-500 mb-1">{t.uvIndex || 'UV Index'}</span>
          <span className="font-bold text-slate-800">{current.uvindex}</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-slate-50/50 rounded-2xl">
          <CloudRain className="w-6 h-6 text-indigo-400 mb-2" />
          <span className="text-sm text-slate-500 mb-1">{t.precipitation || 'Precip'}</span>
          <span className="font-bold text-slate-800">{current.precipprob}%</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
