import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Navigation2,
  Map,
  Wallet,
  CloudSun,
  Sparkles,
  Bookmark,
  Settings,
  Globe,
  DollarSign,
} from 'lucide-react';
import { useAppStore, FeatureType } from '../../stores/appStore';
import { translations } from '../../utils/i18n';
import { cn } from '../../lib/utils';
import { Currency } from '../../types';

interface NavItem {
  id: FeatureType;
  labelKey: keyof typeof translations.vi;
  icon: React.ElementType;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { id: 'trip-planner', labelKey: 'navTripPlanner', icon: Map },
  { id: 'budget', labelKey: 'navBudget', icon: Wallet, disabled: true },
  { id: 'weather', labelKey: 'navWeather', icon: CloudSun, disabled: true },
  { id: 'ai-assistant', labelKey: 'navAiAssistant', icon: Sparkles, disabled: true },
  { id: 'saved-trips', labelKey: 'navSavedTrips', icon: Bookmark, disabled: true },
];

const Sidebar: React.FC = () => {
  const {
    isSidebarOpen,
    setSidebarOpen,
    activeFeature,
    setActiveFeature,
    language,
    setLanguage,
    currency,
    setCurrency,
  } = useAppStore();
  const t = translations[language];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setSidebarOpen]);

  const handleNavClick = (item: NavItem) => {
    if (item.disabled) return;
    setActiveFeature(item.id);
    setSidebarOpen(false);
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-white shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                  <Navigation2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-slate-800 text-lg">{t.appTitle}</h1>
                  <p className="text-xs text-slate-500">{t.appTagline}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <nav className="flex-1 p-3 overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeFeature === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavClick(item)}
                        disabled={item.disabled}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium',
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-slate-600 hover:bg-slate-50',
                          item.disabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <Icon className={cn('w-5 h-5', isActive && 'text-blue-500')} />
                        <span>{t[item.labelKey] as string}</span>
                        {item.disabled && (
                          <span className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                            Soon
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="my-4 border-t border-slate-100" />
              <button
                onClick={() => {
                  setActiveFeature('settings');
                  setSidebarOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium text-slate-600 hover:bg-slate-50',
                  activeFeature === 'settings' && 'bg-blue-50 text-blue-600'
                )}
              >
                <Settings className="w-5 h-5" />
                <span>{t.navSettings}</span>
              </button>
            </nav>
            <div className="p-4 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-medium text-slate-700"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500">{language === 'vi' ? 'EN' : 'VN'}</span>
              </button>
              <button
                onClick={() => setCurrency(currency === 'VND' ? 'USD' : 'VND')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-medium text-slate-700"
              >
                <DollarSign className="w-4 h-4" />
                <span>{currency === 'VND' ? 'VNĐ' : 'USD'}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500">{currency === 'VND' ? 'USD' : 'VNĐ'}</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
