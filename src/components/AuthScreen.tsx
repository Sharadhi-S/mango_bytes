import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, Button, ScreenHeader } from './ui';
import { getShramaId } from './ShramaIDScreen';
import { LANGUAGES } from '@/i18n';
import type { RegistrationProfile, Role } from '@/types';

export function AuthScreen() {
  const { role, setRole, setScreen, setRegistrationProfile, signInAccount, setLang, showToast } = useApp();
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

  const signIn = async () => {
    const accounts = JSON.parse(localStorage.getItem('shrama-accounts') || '[]') as Array<{ shramaId: string; phone: string; role: Role; profile: any; lang?: string }>;
    const accountRole = role ?? 'labourer';
    const match = accounts.find((a) => a.role === accountRole && a.shramaId.toUpperCase() === shramaId.trim().toUpperCase() && a.phone === phone.trim());
    try {
      let profile: RegistrationProfile;
      if (match) {
        await setRegistrationProfile(match.profile, {
          accountRole,
          signIn: true,
          shramaId: match.shramaId,
          showWellbeing: false,
        });
        profile = match.profile;
      } else {
        profile = await signInAccount(shramaId.trim(), phone.trim(), accountRole);
      }
      if (match?.lang && LANGUAGES.some((l) => l.code === match.lang)) setLang(match.lang as any);
      setScreen(accountRole === 'labourer' || accountRole === 'skilledWorker' ? 'shramId' : 'home');
      showToast(`Signed in as ${profile.name}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sign in failed.');
    }
  };

  if (mode === 'signin') {
    return (
      <div className="min-h-screen bg-gray-50 px-5 pt-8 pb-12 max-w-xl mx-auto">
        <ScreenHeader title="Sign in with ShramaID" subtitle={`Access your ${roleLabel} account securely`} showBack={false} />
        <Card className="p-5 space-y-4">
          <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4 text-sm text-brand-800">
            <b>Prototype account protection:</b> both the ShramaID and the registered mobile number must match. This prevents one demo user from opening another saved profile.
          </div>
          <label className="block"><span className="text-xs font-bold text-gray-600">ShramaID</span><input value={shramaId} onChange={(e) => { setShramaId(e.target.value); setError(''); }} placeholder="Example: SHR-RK-3210" className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-brand-400" /></label>
          <label className="block"><span className="text-xs font-bold text-gray-600">Registered mobile number</span><input value={phone} onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }} inputMode="tel" maxLength={10} placeholder="Example: 9876543210" className="mt-1.5 w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-brand-400" /></label>
          {error && <p className="text-xs font-semibold text-error-600 bg-error-50 rounded-xl p-3">{error}</p>}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={useExample}><CheckCircle2 size={16} className="mr-2" />Use Example</Button>
            <Button className="flex-1" onClick={signIn}><LogIn size={16} className="mr-2" />Sign In</Button>
          </div>
        </Card>
        <button onClick={() => setMode('choice')} className="mt-4 text-sm font-bold text-gray-500 flex items-center gap-1"><ArrowLeft size={15} /> Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-5 pt-8 pb-12 max-w-xl mx-auto">
      <ScreenHeader title="Account access" subtitle={`Continue as ${roleLabel}`} showBack={false} />
      <button type="button" onClick={() => { setRole(null); setScreen('home'); }} aria-label="Back to account types" className="mb-4 w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"><ArrowLeft size={19} /></button>
      <div className="space-y-3">
        <button onClick={() => setScreen('register')} className="w-full bg-white rounded-2xl p-5 shadow-card flex items-center gap-4 text-left hover:shadow-card-hover">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><UserPlus /></div>
          <div className="flex-1"><p className="font-extrabold text-gray-900">New Registration</p><p className="text-xs text-gray-500 mt-1">Create a new ShramaSetu prototype profile</p></div>
        </button>
        <button onClick={() => setMode('signin')} className="w-full bg-white rounded-2xl p-5 shadow-card flex items-center gap-4 text-left hover:shadow-card-hover">
          <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center"><KeyRound /></div>
          <div className="flex-1"><p className="font-extrabold text-gray-900">Already Registered</p><p className="text-xs text-gray-500 mt-1">Sign in with your ShramaID and registered mobile</p></div>
        </button>
      </div>
      <button onClick={() => { setRole(null); setScreen('home'); }} className="mt-6 text-sm font-bold text-gray-500 flex items-center gap-1"><ArrowLeft size={15} /> Choose another role</button>
    </div>
  );
}
