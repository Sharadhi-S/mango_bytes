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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 px-3 min-w-[60px] transition-colors ${active ? 'text-brand-600' : 'text-gray-400'}`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-brand-50 scale-110' : ''}`}>
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] font-semibold ${active ? 'text-brand-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
