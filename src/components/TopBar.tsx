import { HardHat, Building2, Bell, ChefHat, ArrowLeftRight, Briefcase } from 'lucide-react';
import { LANGUAGES } from '@/i18n';
import { useState, useEffect } from 'react';
import { useApp } from '@/AppContext';
import { RoleSwitcher } from './RoleSwitcher';
import { getUnreadNotificationCount } from '@/services/notifications';
import { subscribeToRealtimeEvent } from '@/services/realtime';

export function TopBar() {
  const { role, registrationProfile, setRole, setScreen, lang, setLang } = useApp();
  const [switchOpen, setSwitchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(() => getUnreadNotificationCount(role));

  useEffect(() => {
    setUnreadCount(getUnreadNotificationCount(role));
    const unsub = subscribeToRealtimeEvent('NOTIFICATION_CREATED', () => {
      setUnreadCount(getUnreadNotificationCount(role));
    });
    return unsub;
  }, [role]);

  const initials = registrationProfile?.name
    ? registrationProfile.name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : role === 'employer' ? 'MI' : role === 'contractor' ? 'RK' : role === 'skilledWorker' ? 'RK' : 'SP';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${
            role === 'labourer' ? 'bg-emerald-600' :
            role === 'skilledWorker' ? 'bg-blue-600' :
            role === 'contractor' ? 'bg-amber-600' : 'bg-purple-600'
          }`}>
            {role === 'labourer' ? <HardHat size={18} /> :
             role === 'skilledWorker' ? <ChefHat size={18} /> :
             role === 'contractor' ? <Building2 size={18} /> : <Briefcase size={18} />}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-gray-900 text-sm leading-tight tracking-tight">ShramaSetu</span>
            <span className="text-[10px] text-gray-500 font-medium">Mango Bytes Initiative</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <select
            aria-label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="max-w-[100px] text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2 py-1.5 outline-none transition-colors"
          >
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.nativeLabel}</option>)}
          </select>

          <button
            onClick={() => setScreen('alerts')}
            className="relative w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
            title="Notifications & Alerts"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSwitchOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold active:scale-95 transition-all shadow-xs"
            aria-label="Switch Role Persona"
            title="Switch Role Persona"
          >
            <ArrowLeftRight size={14} className="text-amber-700" />
            <span className="hidden sm:inline capitalize font-semibold">{role === 'skilledWorker' ? 'Skilled' : role}</span>
          </button>

          <button
            onClick={() => setScreen('profile')}
            className={`w-8 h-8 rounded-full ${
              role === 'labourer' ? 'bg-emerald-100 text-emerald-800' :
              role === 'skilledWorker' ? 'bg-blue-100 text-blue-800' :
              role === 'contractor' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
            } flex items-center justify-center text-xs font-bold active:scale-95 transition-transform ring-1 ring-black/5`}
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
          setScreen('home');
        }}
      />
    </header>
  );
}
