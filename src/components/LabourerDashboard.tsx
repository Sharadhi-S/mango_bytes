import {
  Wallet,
  PiggyBank,
  Briefcase,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle2,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, Button, formatINR, ProgressBar } from './ui';
import { todayEarningsBreakdown } from '@/mockData';

export function LabourerDashboard() {
  const { workerStats, setScreen, earnings, conversations } = useApp();
  const unreadCount = conversations.reduce((sum, c) => sum + c.unread, 0);
  const recentEarning = earnings[0];

  const quickActions = [
    { label: 'Earnings', icon: Wallet, screen: 'earnings' as const, color: 'bg-brand-50 text-brand-600' },
    { label: 'Save Money', icon: PiggyBank, screen: 'savings' as const, color: 'bg-accent-50 text-accent-600' },
    { label: 'Find Work', icon: Briefcase, screen: 'jobs' as const, color: 'bg-warning-50 text-warning-600' },
    { label: 'Messages', icon: MessageSquare, screen: 'messages' as const, color: 'bg-error-50 text-error-600', badge: unreadCount },
  ];

  return (
    <div className="px-5 pt-6 pb-24 space-y-5 max-w-2xl mx-auto">
      {/* Greeting */}
      <div className="animate-slide-up">
        <p className="text-sm text-gray-500">Good morning,</p>
        <h1 className="text-2xl font-extrabold text-gray-900">Ravi Kumar</h1>
      </div>

      {/* Earnings Hero Card */}
      <Card className="overflow-hidden animate-slide-up" >
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white">
          <div className="flex items-center gap-2 text-brand-100 text-sm mb-1">
            <TrendingUp size={16} />
            <span>Today's Earnings</span>
          </div>
          <div className="text-4xl font-extrabold tracking-tight">{formatINR(workerStats.todayEarnings)}</div>
          <div className="text-brand-100 text-sm mt-1">earned today</div>

          {/* Breakdown bar */}
          <div className="mt-4">
            <div className="flex h-3 rounded-full overflow-hidden bg-white/20">
              {todayEarningsBreakdown.map((seg, i) => (
                <div
                  key={i}
                  className={seg.color}
                  style={{ width: `${(seg.amount / workerStats.todayEarnings) * 100}%` }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-brand-50">
              {todayEarningsBreakdown.map((seg, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
                  <span>{seg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Wallet size={16} />
            <span className="text-xs font-semibold">Available Balance</span>
          </div>
          <p className="text-xl font-extrabold text-gray-900">{formatINR(workerStats.availableBalance)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <TrendingUp size={16} />
            <span className="text-xs font-semibold">This Month</span>
          </div>
          <p className="text-xl font-extrabold text-gray-900">{formatINR(workerStats.monthlyEarnings)}</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="animate-slide-up">
        <h2 className="text-sm font-bold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => setScreen(action.screen)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.color} group-active:scale-95 transition-transform relative`}>
                  <Icon size={24} strokeWidth={2} />
                  {action.badge ? (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {action.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs font-semibold text-gray-600 text-center leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Job */}
      <Card className="p-4 animate-slide-up" >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700">Current Job</h2>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-600">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" /> Active
          </span>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
            <Briefcase size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">{workerStats.currentJob}</p>
            <p className="text-sm text-gray-500">{workerStats.currentEmployer}</p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <MapPin size={12} />
              <span>Site B, Mysuru</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Emergency Fund Mini */}
      <Card className="p-4 animate-slide-up" onClick={() => setScreen('savings')}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-accent-50 flex items-center justify-center text-accent-600">
              <PiggyBank size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Emergency Fund</p>
              <p className="text-xs text-gray-500">{formatINR(workerStats.emergencySavings)} of ₹5,000</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gray-300" />
        </div>
        <ProgressBar value={workerStats.emergencySavings} max={5000} colorClass="bg-accent-500" />
      </Card>

      {/* Recent Payment */}
      {recentEarning && (
        <Card className="p-4 animate-slide-up" onClick={() => setScreen('earnings')}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700">Recent Payment</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${recentEarning.status === 'paid' ? 'bg-accent-100 text-accent-600' : 'bg-warning-100 text-warning-600'}`}>
                {recentEarning.status === 'paid' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{recentEarning.work}</p>
                <p className="text-xs text-gray-500">{recentEarning.date} · {recentEarning.hoursOrDays}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-accent-600">+{formatINR(recentEarning.amount)}</p>
              <p className={`text-xs font-semibold ${recentEarning.status === 'paid' ? 'text-accent-600' : 'text-warning-600'}`}>
                {recentEarning.status === 'paid' ? 'Paid' : 'Pending'}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Button variant="secondary" className="w-full" onClick={() => setScreen('messages')}>
        View Messages {unreadCount > 0 && `(${unreadCount} new)`}
      </Button>
    </div>
  );
}
