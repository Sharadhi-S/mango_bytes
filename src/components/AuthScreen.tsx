import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, Button, ScreenHeader } from './ui';
import { ThemeSelector } from './ThemeSelector';
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

  const signIn = async () => {
    const trimmedId = shramaId.trim().toUpperCase();
    const trimmedPhone = phone.trim();
    if (!trimmedId || !trimmedPhone) {
      setError('Please enter both your ShramaID and 10-digit mobile number.');
      return;
    }

    // Try backend authentication
    try {
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shramaId: trimmedId, phone: trimmedPhone, role }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.account) {
          setRole(data.account.role);
          setRegistrationProfile(data.account.profile);
          setScreen(data.account.role === 'labourer' || data.account.role === 'skilledWorker' ? 'shramId' : 'home');
          showToast(`Signed in as ${data.account.profile.name}`);
          return;
        }
      }
    } catch {}

    // Check saved accounts fallback
    const accounts = JSON.parse(localStorage.getItem('shrama-accounts') || '[]') as Array<{ shramaId: string; phone: string; role: Role; profile: any; lang?: string }>;
    const match = accounts.find((a) => a.shramaId.toUpperCase() === trimmedId && a.phone === trimmedPhone);
    if (!match) {
      setError('ShramaID and mobile number do not match. Please verify your details or register a new profile.');
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-5 pt-8 pb-12 max-w-xl mx-auto text-gray-900 dark:text-slate-100 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <ScreenHeader title="Sign in with ShramaID" subtitle={`Access your ${roleLabel} account securely`} showBack={false} />
          <ThemeSelector />
        </div>

        <Card className="p-5 space-y-4 border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-900/60 p-4 text-xs text-brand-900 dark:text-brand-300">
            <b>Account protection:</b> enter the ShramaID and 10-digit mobile number linked to your profile to sign in securely.
          </div>
          <label className="block">
            <span className="text-xs font-bold text-gray-600 dark:text-slate-300">ShramaID</span>
            <input
              value={shramaId}
              onChange={(e) => { setShramaId(e.target.value); setError(''); }}
              placeholder="e.g. SHR-RK-1234"
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none focus:border-brand-400 font-mono text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-gray-600 dark:text-slate-300">Registered mobile number</span>
            <input
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
              inputMode="tel"
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
              className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none focus:border-brand-400 text-sm"
            />
          </label>
          {error && <p className="text-xs font-semibold text-error-600 dark:text-red-400 bg-error-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-3">{error}</p>}
          <div className="pt-2">
            <Button className="w-full text-xs font-bold py-3" onClick={signIn}>
              <LogIn size={16} className="mr-2" />Sign In to Account
            </Button>
          </div>
        </Card>

        <button onClick={() => setMode('choice')} className="mt-4 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 flex items-center gap-1.5">
          <ArrowLeft size={14} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-5 pt-8 pb-12 max-w-xl mx-auto text-gray-900 dark:text-slate-100 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <ScreenHeader title="Account access" subtitle={`Continue as ${roleLabel}`} showBack={false} />
        <ThemeSelector />
      </div>

      <button
        type="button"
        onClick={() => { setRole(null); setScreen('home'); }}
        aria-label="Back to account types"
        className="mb-4 w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
      >
        <ArrowLeft size={17} />
      </button>

      <div className="space-y-3">
        <button
          onClick={() => setScreen('register')}
          className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-card flex items-center gap-4 text-left hover:shadow-card-hover dark:hover:border-slate-700 transition-all active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <UserPlus />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-gray-900 dark:text-slate-100 text-sm">New Registration</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Create a new ShramaSetu verified profile</p>
          </div>
        </button>

        <button
          onClick={() => setMode('signin')}
          className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-card flex items-center gap-4 text-left hover:shadow-card-hover dark:hover:border-slate-700 transition-all active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-xl bg-accent-50 dark:bg-emerald-950/60 text-accent-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <KeyRound />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-gray-900 dark:text-slate-100 text-sm">Already Registered</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Sign in with your ShramaID and registered mobile</p>
          </div>
        </button>
      </div>

      <button
        onClick={() => { setRole(null); setScreen('home'); }}
        className="mt-6 text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 flex items-center gap-1.5"
      >
        <ArrowLeft size={14} /> Choose another role
      </button>
    </div>
  );
}
