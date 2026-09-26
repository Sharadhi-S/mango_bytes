import { HardHat, Building2, ArrowRight, ChefHat } from 'lucide-react';
import { useApp } from '@/AppContext';
import { ThemeSelector } from './ThemeSelector';

export function RoleSelect() {
  const { setRole, setScreen } = useApp();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-brand-50 via-white to-accent-50 flex flex-col items-center justify-center px-6 py-10">
      <div className="absolute right-4 top-4 z-10">
        <ThemeSelector />
      </div>
      {/* Logo / Brand */}
      <div className="mb-12 text-center animate-slide-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-brand-600 text-white shadow-float mb-4">
          <HardHat size={40} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">ShramaSetu - A Mango Bytes initiative</h1>
        <p className="text-gray-500 mt-2 text-sm">Work. Wages. Together.</p>
      </div>

      {/* Role selection */}
      <div className="w-full max-w-sm space-y-4 animate-slide-up">
        <p className="text-center text-gray-600 font-semibold mb-6">Choose how you want to continue</p>

        <button
          onClick={() => { setRole('labourer'); setScreen('auth'); }}
          className="w-full group bg-white rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-100 transition-colors">
              <HardHat size={32} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">I am a Labourer</h2>
              <p className="text-sm text-gray-500 mt-0.5">Find work, track earnings, save money</p>
            </div>
            <ArrowRight size={22} className="text-gray-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          onClick={() => { setRole('contractor'); setScreen('auth'); }}
          className="w-full group bg-white rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center text-accent-600 group-hover:bg-accent-100 transition-colors">
              <Building2 size={32} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">I am a Contractor</h2>
              <p className="text-sm text-gray-500 mt-0.5">Manage worker teams, attendance & wages</p>
            </div>
            <ArrowRight size={22} className="text-gray-300 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          onClick={() => { setRole('employer'); setScreen('auth'); }}
          className="w-full group bg-white rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
              <Building2 size={32} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">I am an Employer</h2>
              <p className="text-sm text-gray-500 mt-0.5">Post jobs, review work progress & approve payments</p>
            </div>
            <ArrowRight size={22} className="text-gray-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
          </div>
        </button>

        <button
          onClick={() => { setRole('skilledWorker'); setScreen('auth'); }}
          className="w-full group bg-white rounded-3xl p-6 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-100 transition-colors">
              <ChefHat size={32} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900">I am a Skilled Worker</h2>
              <p className="text-sm text-gray-500 mt-0.5">Chef, driver, hotel, delivery & other skills</p>
            </div>
            <ArrowRight size={22} className="text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
          </div>
        </button>
      </div>

      <p className="mt-12 text-xs text-gray-400 text-center max-w-xs">
        This is a demo prototype. All data shown is mock data for demonstration purposes.
      </p>
    </div>
  );
}
