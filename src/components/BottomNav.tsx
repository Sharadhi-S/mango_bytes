import { Home, Briefcase, Wallet, PiggyBank, User, LayoutDashboard, Users, CreditCard, MessageSquare, ShieldCheck, GraduationCap }  from 'lucide-react';
import { useApp } from '@/AppContext';
import type { ScreenId } from '@/types';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: typeof Home;
}

export function BottomNav() {
  const { role, screen, setScreen, t } = useApp();

  const labourerNav: NavItem[] = [
    { id: 'home', label: t('navHome'), icon: Home },
    { id: 'jobs', label: t('navJobs'), icon: Briefcase },
    { id: 'earnings', label: t('navEarnings'), icon: Wallet },
    { id: 'savings', label: t('navSavings'), icon: Wallet },
    { id: 'insurance', label: t('insuranceTitle') || 'Insurance', icon: ShieldCheck },
    { id: 'profile', label: t('navProfile'), icon: User },
  ];

  const skilledWorkerNav: NavItem[] = [
    { id: 'home', label: t('navHome'), icon: Home },
    { id: 'jobs', label: t('navJobs'), icon: Briefcase },
    { id: 'earnings', label: t('navEarnings'), icon: Wallet },
    { id: 'insurance', label: t('insuranceTitle') || 'Insurance', icon: ShieldCheck },
    { id: 'profile', label: t('navProfile'), icon: User },
  ];

  const employerNav: NavItem[] = [
    { id: 'home', label: t('employerHubTitle') || 'Business Hub', icon: LayoutDashboard },
    { id: 'profile', label: t('navProfile'), icon: User },
  ];

  const contractorNav: NavItem[] = [
    { id: 'home', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'workers', label: t('navWorkers'), icon: Users },
    { id: 'postJob', label: t('postJobTitle'), icon: Briefcase },
    { id: 'wages', label: t('navWages'), icon: CreditCard },
    { id: 'messages', label: t('navMessages'), icon: MessageSquare },
    { id: 'profile', label: t('navProfile'), icon: User },
  ];

  const items = role === 'employer' ? employerNav : role === 'contractor' ? contractorNav : role === 'skilledWorker' ? skilledWorkerNav : labourerNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shadow-md pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-2.5 sm:px-3 min-w-[56px] transition-colors ${active ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-brand-50 dark:bg-brand-950/60 scale-105 shadow-2xs' : ''}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] sm:text-[11px] font-semibold tracking-tight ${active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
