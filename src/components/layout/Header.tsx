import React from 'react';
import { Menu, Navigation2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { translations } from '../../utils/i18n';
import { cn } from '../../lib/utils';

const Header: React.FC = () => {
  const { language, toggleSidebar } = useAppStore();
  const t = translations[language];

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-10 h-14',
      'flex items-center justify-between px-4',
      'bg-white/80 backdrop-blur-xl border-b border-slate-200/50',
      'md:bg-transparent md:border-none md:backdrop-blur-none'
    )}>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-2.5 rounded-xl transition-all',
            'bg-white/90 hover:bg-white shadow-lg shadow-black/5',
            'border border-slate-200/50 active:scale-95'
          )}
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-2 md:hidden">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/30">
            <Navigation2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800">{t.appTitle}</span>
        </div>
      </div>
      <div className="md:hidden" />
    </header>
  );
};

export default Header;
