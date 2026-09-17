import { Home, Briefcase, Wallet, PiggyBank, User, LayoutDashboard, Users, CreditCard, MessageSquare } from 'lucide-react';
import { useApp } from '@/AppContext';
import type { ScreenId } from '@/types';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: typeof Home;
}

const labourerNav: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'earnings', label: 'Earnings', icon: Wallet },
  { id: 'savings', label: 'Savings', icon: PiggyBank },
  { id: 'profile', label: 'Profile', icon: User },
];

const contractorNav: NavItem[] = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workers', label: 'Workers', icon: Users },
  { id: 'postJob', label: 'Post Job', icon: Briefcase },
  { id: 'wages', label: 'Wages', icon: CreditCard },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
];

export function BottomNav() {
  const { role, screen, setScreen } = useApp();
  const items = role === 'labourer' ? labourerNav : contractorNav;

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
