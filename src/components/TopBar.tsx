import { HardHat, Building2, Bell, ChefHat, ArrowLeftRight, X } from 'lucide-react';
import { LANGUAGES } from '@/i18n';
import { useState } from 'react';
import { useApp } from '@/AppContext';
import type { Role } from '@/types';

export function TopBar() {
  const { role, conversations, registrationProfile, setRole, setScreen, lang, setLang } = useApp();
  const [switchOpen, setSwitchOpen] = useState(false);
  const unread = conversations.reduce((s, c) => s + c.unread, 0);
  const initials = registrationProfile?.name
    ? registrationProfile.name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : 'MB';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-50">
      <div className="max-w-4xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${role === 'labourer' ? 'bg-brand-600' : role === 'skilledWorker' ? 'bg-purple-600' : 'bg-accent-600'}`}>
            {role === 'labourer' ? <HardHat size={18} /> : role === 'skilledWorker' ? <ChefHat size={18} /> : <Building2 size={18} />}
          </div>
          <span className="font-extrabold text-gray-900 text-sm">ShramaSetu - A Mango Bytes initiative</span>
        </div>
        <div className="flex items-center gap-3">
          <select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value as any)} className="max-w-[105px] text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 outline-none">{LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.nativeLabel}</option>)}</select>
          <button onClick={() => setScreen('alerts')} className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error-500 ring-2 ring-white" />
            )}
          </button>
          <button
            onClick={() => setSwitchOpen(true)}
            className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Switch account"
            title="Switch account"
          >
            <ArrowLeftRight size={18} />
          </button>
          <button
            onClick={() => setScreen('profile')}
            className={`w-8 h-8 rounded-full ${role === 'labourer' ? 'bg-brand-100 text-brand-700' : role === 'skilledWorker' ? 'bg-purple-100 text-purple-700' : 'bg-accent-100 text-accent-700'} flex items-center justify-center text-sm font-bold active:scale-95 transition-transform`}
            aria-label="Open profile"
          >
            {initials}
          </button>
        </div>
      </div>
      {switchOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-4" onClick={() => setSwitchOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div><p className="font-extrabold text-gray-900">Switch account</p><p className="text-xs text-gray-500 mt-1">Choose a different portal role and sign in with its ShramaID.</p></div>
              <button onClick={() => setSwitchOpen(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([
                ['labourer', 'Labourer'],
                ['skilledWorker', 'Skilled Worker'],
                ['contractor', 'Contractor'],
                ['employer', 'Employer'],
              ] as [Role, string][]).map(([nextRole, label]) => (
                <button key={nextRole} onClick={() => { setSwitchOpen(false); setRole(nextRole); setScreen('auth'); }} className={`p-4 rounded-2xl border text-left ${role === nextRole ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`}>
                  <p className="font-bold text-gray-900 text-sm">{label}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{role === nextRole ? 'Current account' : 'Switch & sign in'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
