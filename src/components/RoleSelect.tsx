import { HardHat, Building2, ArrowRight, ChefHat } from 'lucide-react';
import { useApp } from '@/AppContext';

export function RoleSelect() {
  const { setRole, setScreen } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-accent-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center px-6 py-10 transition-colors">
      {/* Logo / Brand */}
      <div className="mb-10 text-center animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-600 text-white shadow-float mb-4">
          <HardHat size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">ShramaSetu</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm font-medium">Work. Wages. Together. · A Mango Bytes initiative</p>
      </div>

      {/* Role selection */}
      <div className="w-full max-w-sm space-y-3.5 animate-slide-up">
        <p className="text-center text-gray-600 dark:text-slate-300 font-bold mb-4 text-sm">Choose how you want to continue</p>

        <button
          onClick={() => { setRole('labourer'); setScreen('auth'); }}
          className="w-full group bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-card hover:shadow-card-hover border border-gray-100 dark:border-slate-800 transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:bg-brand-100 dark:group-hover:bg-brand-900 transition-colors">
              <HardHat size={30} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-slate-100">I am a Labourer</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Find work, track earnings, save money</p>
            </div>
            <ArrowRight size={20} className="text-gray-300 dark:text-slate-600 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          onClick={() => { setRole('contractor'); setScreen('auth'); }}
          className="w-full group bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-card hover:shadow-card-hover border border-gray-100 dark:border-slate-800 transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-50 dark:bg-accent-950/60 flex items-center justify-center text-accent-600 dark:text-accent-400 group-hover:bg-accent-100 dark:group-hover:bg-accent-900 transition-colors">
              <Building2 size={30} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-slate-100">I am a Contractor</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Manage worker teams, muster & wages</p>
            </div>
            <ArrowRight size={20} className="text-gray-300 dark:text-slate-600 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          onClick={() => { setRole('employer'); setScreen('auth'); }}
          className="w-full group bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-card hover:shadow-card-hover border border-gray-100 dark:border-slate-800 transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900 transition-colors">
              <Building2 size={30} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-slate-100">I am an Employer</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Create tenders, workforce plan & RFP</p>
            </div>
            <ArrowRight size={20} className="text-gray-300 dark:text-slate-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          onClick={() => { setRole('skilledWorker'); setScreen('auth'); }}
          className="w-full group bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-card hover:shadow-card-hover border border-gray-100 dark:border-slate-800 transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
              <ChefHat size={30} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-slate-100">I am a Skilled Worker</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Craftsman, mason, chef, driver & specialist</p>
            </div>
            <ArrowRight size={20} className="text-gray-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </div>

      <p className="mt-12 text-xs text-gray-400 text-center max-w-xs">
        This is a demo prototype. All data shown is mock data for demonstration purposes.
      </p>
    </div>
  );
}
