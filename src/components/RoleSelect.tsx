import { HardHat, Building2, ArrowRight, ChefHat, Sun, Moon } from 'lucide-react';
import { useApp } from '@/AppContext';
import { ThemeSelector } from './ThemeSelector';
import { LANGUAGES } from '@/i18n';

export function RoleSelect() {
  const { setRole, setScreen, theme, toggleTheme, t, lang, setLang } = useApp();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-brand-50 via-white to-accent-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center px-6 py-10 transition-colors">
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 flex items-center justify-center transition-all shadow-xs"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme mode"
        >
          {theme === 'dark' ? (
            <Sun size={17} className="text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon size={17} className="text-slate-700 hover:-rotate-12 transition-transform" />
          )}
        </button>
        <ThemeSelector />
        <select
          aria-label="Language"
          value={lang}
          onChange={(e) => setLang(e.target.value as any)}
          className="max-w-[105px] text-xs font-semibold bg-white/80 dark:bg-slate-800/80 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-xl px-2 py-2 outline-none shadow-xs transition-colors"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeLabel}
            </option>
          ))}
        </select>
      </div>

      {/* Logo / Brand */}
      <div className="mb-10 text-center animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-600 text-white shadow-float mb-4">
          <HardHat size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">ShramaSetu</h1>
        <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mt-1">A Mango Bytes Initiative</p>
        <p className="text-gray-500 dark:text-slate-400 mt-1.5 text-sm">{t('tagline') || 'Work. Wages. Together.'}</p>
      </div>

      {/* Role selection */}
      <div className="w-full max-w-sm space-y-3.5 animate-slide-up">
        <p className="text-center text-gray-600 dark:text-slate-300 font-semibold mb-5 text-sm">
          {t('chooseRole') || 'Choose how you want to continue'}
        </p>

        <button
          onClick={() => { setRole('labourer'); setScreen('auth'); }}
          className="w-full group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-card hover:shadow-card-hover dark:hover:border-slate-700 transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/60 transition-colors">
              <HardHat size={28} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">{t('iAmLabourer') || 'I am a Labourer'}</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{t('labourerDesc') || 'Receive site work from contractors, track verified attendance & daily wages'}</p>
            </div>
            <ArrowRight size={20} className="text-gray-300 dark:text-slate-600 group-hover:text-brand-500 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </button>

        <button
          onClick={() => { setRole('contractor'); setScreen('auth'); }}
          className="w-full group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-card hover:shadow-card-hover dark:hover:border-slate-700 transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-50 dark:bg-emerald-950/60 flex items-center justify-center text-accent-600 dark:text-emerald-400 group-hover:bg-accent-100 dark:group-hover:bg-emerald-900/60 transition-colors">
              <Building2 size={28} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">{t('iAmContractor') || 'I am a Contractor'}</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{t('contractorDesc') || 'Win tenders, deploy worker crews, manage muster & pay wages'}</p>
            </div>
            <ArrowRight size={20} className="text-gray-300 dark:text-slate-600 group-hover:text-accent-500 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </button>

        <button
          onClick={() => { setRole('employer'); setScreen('auth'); }}
          className="w-full group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-card hover:shadow-card-hover dark:hover:border-slate-700 transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60 transition-colors">
              <Building2 size={28} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">{t('iAmEmployer') || 'I am an Employer'}</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{t('employerDesc') || 'Post tenders, match with verified contractors & issue RFPs'}</p>
            </div>
            <ArrowRight size={20} className="text-gray-300 dark:text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </button>

        <button
          onClick={() => { setRole('skilledWorker'); setScreen('auth'); }}
          className="w-full group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-card hover:shadow-card-hover dark:hover:border-slate-700 transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/60 transition-colors">
              <ChefHat size={28} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">{t('iAmSkilledWorker') || 'I am a Skilled Worker'}</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">{t('skilledWorkerDesc') || 'Certified trade specialists (Masons, Operators, Technicians) hired by contractors'}</p>
            </div>
            <ArrowRight size={20} className="text-gray-300 dark:text-slate-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </button>
      </div>

      <p className="mt-10 text-xs text-gray-400 dark:text-slate-500 text-center max-w-xs">
        {t('demoNote') || 'This is a demo prototype. All data shown is mock data for demonstration purposes.'}
      </p>
    </div>
  );
}
