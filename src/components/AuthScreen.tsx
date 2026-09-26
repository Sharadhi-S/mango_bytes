import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, Button, ScreenHeader } from './ui';
import { getShramaId } from './ShramaIDScreen';
import { LANGUAGES } from '@/i18n';
import type { Role } from '@/types';

export function AuthScreen() {
  const { role, setRole, setScreen, setRegistrationProfile, setLang, showToast } = useApp();
  const [mode, setMode] = useState<'choice' | 'signin'>('choice');
  const [shramaId, setShramaId] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const roleLabel = useMemo(() => ({ labourer: 'Labourer', skilledWorker: 'Skilled Worker', contractor: 'Contractor', employer: 'Employer' } as Record<Role, string>)[role || 'labourer'], [role]);

  const useExample = () => {
    const accounts = JSON.parse(localStorage.getItem('shrama-accounts') || '[]') as Array<{ shramaId: string; phone: string; role: Role }>;
    const account = accounts.find((item) => item.role === role) || accounts[0];
    if (account) {
      setShramaId(account.shramaId);
      setPhone(account.phone);
    } else {
      setShramaId(role === 'skilledWorker' ? 'SHR-AS-3210' : role === 'contractor' ? 'SHR-RK-3210' : role === 'employer' ? 'SHR-MI-3210' : 'SHR-RK-3210');
      setPhone('9876543210');
    }
    setError('');
  };

  const signIn = () => {
    const accounts = JSON.parse(localStorage.getItem('shrama-accounts') || '[]') as Array<{ shramaId: string; phone: string; role: Role; profile: any; lang?: string }>;
    const match = accounts.find((a) => a.shramaId.toUpperCase() === shramaId.trim().toUpperCase() && a.phone === phone.trim());
    if (!match) {
      setError('ShramaID and mobile number do not match. You can only open the account linked to both details.');
      return;
    }
    setRole(match.role);
    setRegistrationProfile(match.profile);
    if (match.lang && LANGUAGES.some((l) => l.code === match.lang)) setLang(match.lang as any);
    setScreen(match.role === 'labourer' || match.role === 'skilledWorker' ? 'shramId' : 'home');
    showToast(`Signed in as ${match.profile.name}`);
  };

  if (mode === 'signin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-5 pt-8 pb-12 max-w-xl mx-auto text-gray-900 dark:text-slate-100">
        <ScreenHeader title="Sign in with ShramaID" subtitle={`Access your ${roleLabel} account securely`} showBack={false} />
        <Card className="p-5 space-y-4 dark:bg-slate-900 dark:border-slate-800">
          <div className="rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/50 p-4 text-sm text-brand-800 dark:text-brand-300">
            <b>Prototype account protection:</b> both the ShramaID and the registered mobile number must match. This prevents one demo user from opening another saved profile.
          </div>
          <label className="block">
            <span className="text-xs font-bold text-gray-600 dark:text-slate-300">ShramaID</span>
            <input
              value={shramaId}
              onChange={(e) => { setShramaId(e.target.value); setError(''); }}
              placeholder="Example: SHR-RK-3210"
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-brand-400 dark:focus:border-brand-400 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-600 dark:text-slate-300">Registered mobile number</span>
            <input
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
              inputMode="tel"
              maxLength={10}
              placeholder="Example: 9876543210"
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:border-brand-400 dark:focus:border-brand-400 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </label>
          {error && <p className="text-xs font-semibold text-error-600 dark:text-red-400 bg-error-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-3">{error}</p>}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={useExample}><CheckCircle2 size={16} className="mr-2" />Use Example</Button>
            <Button className="flex-1" onClick={signIn}><LogIn size={16} className="mr-2" />Sign In</Button>
          </div>
        </Card>
        <button onClick={() => setMode('choice')} className="mt-4 text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"><ArrowLeft size={15} /> Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-5 pt-8 pb-12 max-w-xl mx-auto text-gray-900 dark:text-slate-100">
      <ScreenHeader title="Account access" subtitle={`Continue as ${roleLabel}`} showBack={false} />
      <button
        type="button"
        onClick={() => { setRole(null); setScreen('home'); }}
        aria-label="Back to account types"
        className="mb-4 w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
      >
        <ArrowLeft size={19} />
      </button>
      <div className="space-y-3.5">
        <button
          onClick={() => setScreen('register')}
          className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:border-brand-500 dark:hover:border-brand-500 flex items-center gap-4 text-left transition-all active:scale-[0.99] group"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <UserPlus size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-base text-gray-900 dark:text-white">New Registration</p>
            <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">Create a new ShramaSetu prototype profile</p>
          </div>
        </button>
        <button
          onClick={() => setMode('signin')}
          className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:border-amber-500 dark:hover:border-amber-500 flex items-center gap-4 text-left transition-all active:scale-[0.99] group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <KeyRound size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-base text-gray-900 dark:text-white">Already Registered</p>
            <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">Sign in with your ShramaID and registered mobile</p>
          </div>
        </button>
      </div>
      <button
        onClick={() => { setRole(null); setScreen('home'); }}
        className="mt-6 text-sm font-bold text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft size={16} /> Choose another role
      </button>
    </div>
  );
}
