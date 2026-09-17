import { HardHat, Building2, Bell, Globe } from 'lucide-react';
import { useApp } from '@/AppContext';
import { LANGUAGES } from '@/i18n';

export function TopBar() {
  const { role, conversations, lang, setLang } = useApp();
  const unread = conversations.reduce((s, c) => s + c.unread, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-50">
      <div className="max-w-4xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${role === 'labourer' ? 'bg-brand-600' : 'bg-accent-600'}`}>
            {role === 'labourer' ? <HardHat size={18} /> : <Building2 size={18} />}
          </div>
          <span className="font-extrabold text-gray-900 text-sm">Mango Bytes</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 shadow-sm">
            <Globe size={14} className="text-gray-500" />
            <select
              aria-label="Select language"
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-transparent text-[11px] font-medium text-gray-700 outline-none"
            >
              {LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>{language.nativeLabel}</option>
              ))}
            </select>
          </div>
          <button className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error-500 ring-2 ring-white" />
            )}
          </button>
          <div className={`w-8 h-8 rounded-full ${role === 'labourer' ? 'bg-brand-100 text-brand-700' : 'bg-accent-100 text-accent-700'} flex items-center justify-center text-sm font-bold`}>
            {role === 'labourer' ? 'RK' : 'KC'}
          </div>
        </div>
      </div>
    </header>
  );
}
