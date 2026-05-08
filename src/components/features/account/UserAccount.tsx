'use client';

import React from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  LogOut, 
  Fingerprint,
  Smartphone,
  Globe,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { translations } from '@/utils/i18n';
import { cn } from '@/lib/utils';

const UserAccount: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { language } = useAppStore();
  const t = translations[language];

  if (!user) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-full bg-slate-50 pt-20 pb-24 md:pb-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-6">
            <UserIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">
            {t.profileTitle}
          </h1>
          <p className="text-slate-500 text-lg">
            {t.profileSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar / Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center">
              <div className="relative group mb-6">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                      <UserIcon className="w-12 h-12 text-indigo-300" />
                    </div>
                  )}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-1">{user.displayName || 'Traveler'}</h2>
              <p className="text-slate-500 text-sm mb-6 truncate w-full px-2">{user.email}</p>
              
              <div className="w-full pt-6 border-t border-slate-100 flex flex-col gap-3">
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-semibold transition-all active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  {t.logout}
                </button>
              </div>
            </div>

            {/* Quick Status */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">{t.profileStatus}</span>
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                  user.emailVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  {user.emailVerified ? t.verified : t.unverified}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Fingerprint className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">ID</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {user.uid.substring(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Account Details */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-indigo-500" />
                {language === 'vi' ? 'Chi tiết tài khoản' : 'Account Details'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{language === 'vi' ? 'Họ và tên' : 'Display Name'}</label>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-medium text-slate-700">
                    {user.displayName || '---'}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-medium text-slate-700 flex items-center justify-between">
                    <span className="truncate">{user.email}</span>
                    {user.emailVerified && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{language === 'vi' ? 'Số điện thoại' : 'Phone Number'}</label>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-medium text-slate-700">
                    {user.phoneNumber || (language === 'vi' ? 'Chưa liên kết' : 'Not linked')}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">{t.profileProviders}</label>
                  <div className="flex gap-2 p-2">
                    {user.providerData.map((provider, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                        {provider.providerId === 'google.com' ? (
                          <>
                            <Globe className="w-3 h-3 text-blue-500" />
                            Google
                          </>
                        ) : provider.providerId === 'password' ? (
                          <>
                            <Mail className="w-3 h-3 text-indigo-500" />
                            Email
                          </>
                        ) : (
                          provider.providerId
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Activity */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-500" />
                {language === 'vi' ? 'Hoạt động gần đây' : 'Recent Activity'}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors rounded-2xl">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{t.profileJoined}</p>
                    <p className="text-xs text-slate-500">{formatDate(user.metadata.creationTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                      {formatTime(user.metadata.creationTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors rounded-2xl">
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{t.profileLastLogin}</p>
                    <p className="text-xs text-slate-500">{formatDate(user.metadata.lastSignInTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                      {formatTime(user.metadata.lastSignInTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Management Info */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldAlert className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  {language === 'vi' ? 'Bảo mật tài khoản' : 'Account Security'}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {language === 'vi' 
                    ? 'Tài khoản của bạn được bảo mật bằng Firebase Authentication. Mọi thông tin cá nhân và lịch trình du lịch đều được mã hóa và bảo vệ an toàn.' 
                    : 'Your account is secured with Firebase Authentication. All personal data and travel itineraries are encrypted and protected.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-medium backdrop-blur-sm border border-white/10">
                    OAuth 2.0
                  </div>
                  <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-medium backdrop-blur-sm border border-white/10">
                    Firebase Shield
                  </div>
                  <div className="px-4 py-2 bg-white/10 rounded-xl text-xs font-medium backdrop-blur-sm border border-white/10">
                    HTTPS/SSL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
