import {
  Users,
  Briefcase,
  Calendar,
  CreditCard,
  MessageSquare,
  TrendingUp,
  IndianRupee,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, formatINR } from './ui';
import { contractorStats } from '@/mockData';

export function ContractorDashboard() {
  const { setScreen, wages, postedJobs, attendance, lang, t } = useApp();

  const pendingWages = wages.filter((w) => w.status === 'pending').reduce((s, w) => s + w.totalEarned, 0);
  const presentCount = attendance.filter((a) => a.status === 'present').length;

  const stats = [
    { label: t('activeWorkers'), value: contractorStats.activeWorkers, icon: Users, color: 'bg-brand-50 text-brand-600' },
    { label: t('presentToday'), value: presentCount, icon: Calendar, color: 'bg-accent-50 text-accent-600' },
    { label: t('pendingWages'), value: formatINR(pendingWages), icon: IndianRupee, color: 'bg-warning-50 text-warning-600' },
    { label: t('openJobs'), value: postedJobs.length, icon: Briefcase, color: 'bg-error-50 text-error-600' },
  ];

  const quickActions = [
    { label: t('findWorkers'), icon: Users, screen: 'workers' as const, color: 'bg-brand-50 text-brand-600' },
    { label: t('postJob'), icon: Briefcase, screen: 'postJob' as const, color: 'bg-accent-50 text-accent-600' },
    { label: t('attendance'), icon: Calendar, screen: 'attendance' as const, color: 'bg-warning-50 text-warning-600' },
    { label: t('wages'), icon: CreditCard, screen: 'wages' as const, color: 'bg-error-50 text-error-600' },
    { label: t('messages'), icon: MessageSquare, screen: 'messages' as const, color: 'bg-brand-50 text-brand-600' },
  ];

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
      <ScreenHeader title={t('dashboard')} subtitle={t('dashboardSubtitle')} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-4 animate-slide-up">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <h2 className="text-sm font-bold text-gray-700 mb-3">{t('quickActionsTitle')}</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-5 px-5 lg:mx-0 lg:px-0">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => setScreen(action.screen)}
              className="flex flex-col items-center gap-2 group flex-shrink-0"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${action.color} group-active:scale-95 transition-transform`}>
                <Icon size={26} strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-gray-600 text-center leading-tight whitespace-nowrap">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pending Payments Alert */}
      {pendingWages > 0 && (
        <Card className="p-4 mb-5 flex items-center gap-3 border-l-4 border-l-warning-500 animate-slide-up" onClick={() => setScreen('wages')}>
          <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center text-warning-600 flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">{t('pendingWagePayments')}</p>
            <p className="text-xs text-gray-500">{formatINR(pendingWages)} {t('toBePaid')}</p>
          </div>
          <ArrowRight size={18} className="text-gray-300" />
        </Card>
      )}

      {/* Open Requirements */}
      <h2 className="text-sm font-bold text-gray-700 mb-3">{t('openRequirements')}</h2>
      <div className="space-y-2">
        {postedJobs.map((job) => (
          <Card key={job.id} className="p-4 animate-slide-up" onClick={() => setScreen('postJob')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                  <Briefcase size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.workersNeeded} workers · {job.location}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-brand-600 flex-shrink-0">{formatINR(job.dailyWage)}/day</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
