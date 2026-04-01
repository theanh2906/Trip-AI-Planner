import React from 'react';
import { useWeatherStore } from '../../../stores/weatherStore';
import { useAppStore } from '../../../stores/appStore';
import { translations } from '../../../utils/i18n';

const ForecastList: React.FC = () => {
  const { weatherData } = useWeatherStore();
  const { language } = useAppStore();
  const t = translations[language];

  if (!weatherData || !weatherData.days) return null;

  // Skip the first day as it's the current day
  const forecastDays = weatherData.days.slice(1, 8);

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short' });
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 mt-6">
      <h3 className="text-xl font-bold text-slate-800 mb-6">{t.forecast7Days || '7-Day Forecast'}</h3>
      <div className="space-y-4">
        {forecastDays.map((day, index) => (
          <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors">
            <div className="w-16 font-medium text-slate-600">
              {getDayName(day.datetime)}
            </div>
            <div className="flex-1 flex items-center justify-center gap-4">
              <span className="text-sm text-slate-500 capitalize w-24 truncate text-center">
                {day.conditions}
              </span>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-500 font-medium">{day.precipprob}%</span>
              </div>
            </div>
            <div className="w-24 flex justify-end gap-3 font-bold">
              <span className="text-slate-800">{Math.round(day.tempmax)}°</span>
              <span className="text-slate-400">{Math.round(day.tempmin)}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastList;
