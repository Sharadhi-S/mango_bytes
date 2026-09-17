import { HardHat, Building2, ArrowRight, Globe } from 'lucide-react';
import { useApp } from '@/AppContext';
import { LANGUAGES, t } from '@/i18n';

export function RoleSelect() {
  const { setRole, lang, setLang } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-accent-50 flex flex-col items-center justify-center px-6 py-10">
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-card">
          <Globe size={16} className="text-gray-500" />
          <select
            aria-label="Select language"
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="bg-transparent text-sm font-medium text-gray-700 outline-none"
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.nativeLabel}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-12 text-center animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-600 text-white shadow-float mb-4">
          <HardHat size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Mango Bytes</h1>
        <p className="text-gray-500 mt-2 text-sm">{t(lang, 'tagline')}</p>
      </div>

      <div className="w-full max-w-sm space-y-4 animate-slide-up">
        <p className="text-center text-gray-600 font-semibold mb-6">{t(lang, 'chooseRole')}</p>

        <button
          onClick={() => setRole('labourer')}
          className="w-full group bg-white rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-100 transition-colors">
              <HardHat size={32} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{t(lang, 'iAmLabourer')}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{t(lang, 'labourerDesc')}</p>
            </div>
            <ArrowRight size={22} className="text-gray-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          onClick={() => setRole('contractor')}
          className="w-full group bg-white rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center text-accent-600 group-hover:bg-accent-100 transition-colors">
              <Building2 size={32} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">{t(lang, 'iAmContractor')}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{t(lang, 'contractorDesc')}</p>
            </div>
            <ArrowRight size={22} className="text-gray-300 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </div>

      <p className="mt-12 text-xs text-gray-400 text-center max-w-xs">{t(lang, 'demoNote')}</p>
    </div>
  );
}
