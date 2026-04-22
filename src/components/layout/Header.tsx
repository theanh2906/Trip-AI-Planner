import React from 'react';
import { Menu, Navigation2, User, LogIn } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { translations } from '../../utils/i18n';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

const Header: React.FC = () => {
  const { language, toggleSidebar } = useAppStore();
  const { user, setIsAuthForced } = useAuthStore();
  const t = translations[language];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-10 h-14',
        'flex items-center justify-between px-4',
        'bg-white/80 backdrop-blur-xl border-b border-slate-200/50',
        'md:bg-transparent md:border-none md:backdrop-blur-none'
      )}
    >
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
      
      <div className="flex items-center gap-2">
        {user ? (
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-2 p-1 pr-3 bg-white/90 rounded-full border border-slate-200 shadow-sm hover:bg-white transition-all active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">{user.displayName || 'User'}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthForced(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 text-sm font-bold"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Đăng nhập</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
