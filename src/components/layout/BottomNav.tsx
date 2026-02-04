import React from 'react';
import { Map, Wallet, CloudSun, Sparkles, MoreHorizontal } from 'lucide-react';
import { useAppStore, FeatureType } from '../../stores/appStore';
import { translations } from '../../utils/i18n';
import { cn } from '../../lib/utils';

interface NavItem {
  id: FeatureType | 'more';
  labelKey: keyof typeof translations.vi;
  icon: React.ElementType;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { id: 'trip-planner', labelKey: 'navTripPlanner', icon: Map },
  { id: 'budget', labelKey: 'navBudget', icon: Wallet, disabled: true },
  { id: 'weather', labelKey: 'navWeather', icon: CloudSun, disabled: true },
  { id: 'ai-assistant', labelKey: 'navAiAssistant', icon: Sparkles, disabled: true },
  { id: 'more', labelKey: 'navMore', icon: MoreHorizontal },
];

const BottomNav: React.FC = () => {
  const { activeFeature, setActiveFeature, toggleSidebar, language } = useAppStore();
  const t = translations[language];

  const handleClick = (item: NavItem) => {
    if (item.id === 'more') {
      toggleSidebar();
      return;
    }
    if (item.disabled) return;
    setActiveFeature(item.id as FeatureType);
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-white/95 backdrop-blur-xl border-t border-slate-200/50',
        'pb-[env(safe-area-inset-bottom)] md:hidden'
      )}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id !== 'more' && activeFeature === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              disabled={item.disabled && item.id !== 'more'}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95',
                item.disabled && item.id !== 'more' && 'opacity-40'
              )}
            >
              <div className={cn('p-1.5 rounded-xl transition-all', isActive && 'bg-blue-100')}>
                <Icon
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isActive ? 'text-blue-600' : 'text-slate-500'
                  )}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium mt-0.5',
                  isActive ? 'text-blue-600' : 'text-slate-500'
                )}
              >
                {t[item.labelKey] as string}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
