import { useState } from 'react';
import { HardHat, Building2, Bell, ChefHat, LogOut, ArrowLeftRight, Briefcase } from 'lucide-react';
import { LANGUAGES } from '@/i18n';
import { useApp } from '@/AppContext';
import { ThemeSelector } from './ThemeSelector';
import { RoleSwitcher } from './RoleSwitcher';

export function TopBar() {
  const { role, conversations, registrationProfile, setRole, setScreen, lang, setLang } = useApp();
  const [switchOpen, setSwitchOpen] = useState(false);
  const unread = conversations.reduce((s, c) => s + c.unread, 0);

  const initials = registrationProfile?.name
    ? registrationProfile.name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : role === 'employer' ? 'MI' : role === 'contractor' ? 'RK' : role === 'skilledWorker' ? 'AS' : 'RK';

  const logout = () => {
    setRole(null);
    setScreen('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-gray-100 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs ${
            role === 'labourer' ? 'bg-emerald-600' :
            role === 'skilledWorker' ? 'bg-blue-600' :
            role === 'contractor' ? 'bg-amber-600' : 'bg-purple-600'
          }`}>
            {role === 'labourer' ? <HardHat size={18} /> :
             role === 'skilledWorker' ? <ChefHat size={18} /> :
             role === 'contractor' ? <Building2 size={18} /> : <Briefcase size={18} />}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-gray-900 dark:text-slate-100 text-sm leading-tight tracking-tight">ShramaSetu</span>
            <span className="text-[10px] text-gray-500 dark:text-slate-400 font-medium hidden sm:inline">Mango Bytes Initiative</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <ThemeSelector />

          {/* Language Selector */}
          <select
            aria-label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="max-w-[85px] sm:max-w-[105px] text-xs font-semibold bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none transition-colors"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeLabel}
              </option>
            ))}
          </select>

          {/* Alerts / Bell */}
          <button
            onClick={() => setScreen('alerts')}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-slate-300 transition-colors"
            title="Notifications & Alerts"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {/* Switch Role Persona Button */}
          <button
            onClick={() => setSwitchOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold active:scale-95 transition-all shadow-2xs"
            aria-label="Switch Role Persona"
            title="Switch Role Persona"
          >
            <ArrowLeftRight size={13} className="text-amber-700 dark:text-amber-400" />
            <span className="hidden sm:inline capitalize font-semibold">
              {role === 'skilledWorker' ? 'Skilled' : role || 'Select'}
            </span>
          </button>

          {/* Log Out */}
          <button
            onClick={logout}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-100 dark:bg-slate-800 text-error-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={16} />
          </button>

          {/* Profile Initials Button */}
          <button
            onClick={() => setScreen('profile')}
            className={`w-8 h-8 rounded-full ${
              role === 'labourer' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
              role === 'skilledWorker' ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300' :
              role === 'contractor' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
            } flex items-center justify-center text-xs font-bold active:scale-95 transition-transform ring-1 ring-black/5 dark:ring-white/10`}
            aria-label="Open profile"
          >
            {initials}
          </button>
        </div>
      </div>

      <RoleSwitcher
        isOpen={switchOpen}
        onClose={() => setSwitchOpen(false)}
        currentRole={role}
        onSelectRole={(newRole) => {
          setRole(newRole);
          setScreen('auth');
        }}
      />
    </header>
  );
}
