import { HardHat, Building2, Bell, ChefHat } from 'lucide-react';
import { useApp } from '@/AppContext';

export function TopBar() {
  const { role, conversations, registrationProfile } = useApp();
  const unread = conversations.reduce((s, c) => s + c.unread, 0);
  const initials = registrationProfile?.name
    ? registrationProfile.name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : 'MB';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-50">
      <div className="max-w-4xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${role === 'labourer' ? 'bg-brand-600' : role === 'skilledWorker' ? 'bg-purple-600' : 'bg-accent-600'}`}>
            {role === 'labourer' ? <HardHat size={18} /> : role === 'skilledWorker' ? <ChefHat size={18} /> : <Building2 size={18} />}
          </div>
          <span className="font-extrabold text-gray-900 text-sm">ShramaSetu - A Mango Bytes initiative</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-error-500 ring-2 ring-white" />
            )}
          </button>
          <div className={`w-8 h-8 rounded-full ${role === 'labourer' ? 'bg-brand-100 text-brand-700' : role === 'skilledWorker' ? 'bg-purple-100 text-purple-700' : 'bg-accent-100 text-accent-700'} flex items-center justify-center text-sm font-bold`}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
