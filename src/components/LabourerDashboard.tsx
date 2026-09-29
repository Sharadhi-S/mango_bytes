import {
  Wallet,
  PiggyBank,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  WalletCards,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Languages,
} from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, Button, ScreenHeader, formatINR, ProgressBar } from './ui';
import { todayEarningsBreakdown } from '@/mockData';

export function LabourerDashboard() {
  const {
    workerStats,
    setScreen,
    earnings,
    conversations,
    registrationProfile,
    contractorInvitations,
    respondToContractorInvitation,
    t,
  } = useApp();
  const unreadCount = conversations.reduce((sum, c) => sum + c.unread, 0);
  const recentEarning = earnings[0];

  const quickActions = [
    { label: t('earnings') || 'Earnings', icon: Wallet, screen: 'earnings' as const, color: 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400' },
    { label: t('saveMoney') || 'Save Money', icon: PiggyBank, screen: 'savings' as const, color: 'bg-accent-50 dark:bg-emerald-950/40 text-accent-600 dark:text-emerald-400' },
    { label: t('findWork') || 'Find Work', icon: Briefcase, screen: 'jobs' as const, color: 'bg-warning-50 dark:bg-amber-950/40 text-warning-600 dark:text-amber-400' },
    { label: t('messages') || 'Messages', icon: MessageSquare, screen: 'messages' as const, color: 'bg-error-50 dark:bg-red-950/40 text-error-600 dark:text-red-400', badge: unreadCount },
    { label: t('insurance') || 'Insurance', icon: ShieldCheck, screen: 'insurance' as const, color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="px-5 pt-6 pb-24 space-y-5 max-w-2xl mx-auto">
      <ScreenHeader
        title={t('labourerDashboardTitle') || 'Labourer Dashboard'}
        subtitle={registrationProfile?.name ? `${t('welcomeBack') || 'Welcome back'}, ${registrationProfile.name}` : 'Your work and money at a glance'}
        showBack={false}
      />

      {/* Greeting */}
      <div className="animate-slide-up">
        <p className="text-sm text-gray-500 dark:text-slate-400">{t('goodMorning') || 'Good morning'},</p>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">{registrationProfile?.name || 'Worker'}</h1>
      </div>

      {/* Earnings Hero Card */}
      <Card className="overflow-hidden animate-slide-up border border-brand-200 dark:border-brand-900/60">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white">
          <div className="flex items-center gap-2 text-brand-100 text-sm mb-1 font-semibold">
            <TrendingUp size={16} />
            <span>{t('todayEarnings') || "Today's Earnings"}</span>
          </div>
          <div className="text-4xl font-extrabold tracking-tight">{formatINR(workerStats.todayEarnings)}</div>
          <div className="text-brand-100 text-sm mt-1">{t('earnedToday') || 'earned today'}</div>

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
        <Card className="p-4 border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500 mb-1">
            <Wallet size={16} />
            <span className="text-xs font-semibold">{t('availableBalance') || 'Available Balance'}</span>
          </div>
          <p className="text-xl font-extrabold text-gray-900 dark:text-slate-100">{formatINR(workerStats.availableBalance)}</p>
        </Card>
        <Card className="p-4 border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500 mb-1">
            <TrendingUp size={16} />
            <span className="text-xs font-semibold">{t('thisMonth') || 'This Month'}</span>
          </div>
          <p className="text-xl font-extrabold text-gray-900 dark:text-slate-100">{formatINR(workerStats.monthlyEarnings)}</p>
        </Card>
      </div>

      <Card className="p-4 animate-slide-up border border-purple-100 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
            <Target size={19} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">My Career Roadmap</p>
            <p className="font-extrabold text-gray-900 dark:text-slate-100 mt-1">Build toward your next better-paying role</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Personalised steps help you stay focused, track progress and decide what skill to learn next.</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-gray-100 dark:border-slate-800">
                <BookOpen size={16} className="text-brand-600 dark:text-brand-400" />
                <p className="text-xs font-bold text-gray-900 dark:text-slate-100 mt-2">Learn</p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">Short course / micro-credential</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-gray-100 dark:border-slate-800">
                <WalletCards size={16} className="text-accent-600 dark:text-emerald-400" />
                <p className="text-xs font-bold text-gray-900 dark:text-slate-100 mt-2">Save</p>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">Get nudges before unnecessary spending</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="animate-slide-up">
        <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">{t('quickActions') || 'Quick Actions'}</h2>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => setScreen(action.screen)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.color} group-active:scale-95 transition-transform relative shadow-xs`}>
                  <Icon size={24} strokeWidth={2} />
                  {action.badge ? (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {action.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-slate-300 text-center leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Site Assignment & Contractor Link */}
      <Card className="p-4 sm:p-5 animate-slide-up border border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">
              {t('activeSiteAssignment') || 'Active Site Assignment'}
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 size={12} /> Live Muster: Present
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
              <Briefcase size={22} />
            </div>
            <div>
              <p className="font-extrabold text-gray-900 dark:text-slate-100 text-base">{workerStats.currentJob}</p>
              <p className="text-xs text-brand-700 dark:text-brand-300 font-bold mt-0.5">
                Contractor: <span className="underline underline-offset-2">{workerStats.currentEmployer}</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-500 dark:text-slate-400 mt-1.5">
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> Site B, Belagavi / Mysuru
                </span>
                <span>•</span>
                <span>{t('dailyWageRateLabel') || 'Wage'}: <strong>₹700/day</strong></span>
                <span>•</span>
                <span className="text-emerald-600 font-bold">Muster Verified ✓</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setScreen('messages')}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <MessageSquare size={13} />
              {t('messageContractor') || 'Message Contractor'}
            </button>
          </div>
        </div>
      </Card>

      {/* Contractor Job Invitations */}
      {contractorInvitations && contractorInvitations.length > 0 && (
        <div className="space-y-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">
              {t('newProjectInvitation') || 'Contractor Work Invitations'}
            </h2>
            <span className="text-xs text-brand-600 font-bold">Direct from Verified Contractors</span>
          </div>

          <div className="space-y-2.5">
            {contractorInvitations.map((inv) => (
              <Card key={inv.id} className="p-4 border border-gray-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-extrabold text-brand-700 dark:text-brand-300">
                        {inv.contractorName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        inv.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        inv.status === 'declined' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {inv.status === 'accepted' ? 'Accepted' : inv.status === 'declined' ? 'Declined' : 'Pending Offer'}
                      </span>
                    </div>
                    <p className="font-extrabold text-sm text-gray-900 dark:text-slate-100">{inv.projectTitle}</p>
                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-500 mt-1">
                      <span>{inv.location}</span>
                      <span>•</span>
                      <span>₹{inv.dailyWageRate}/day</span>
                      <span>•</span>
                      <span>{inv.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {inv.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => respondToContractorInvitation(inv.id, 'accepted')}
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold"
                        >
                          {t('acceptInvitation') || 'Accept Work'}
                        </button>
                        <button
                          onClick={() => respondToContractorInvitation(inv.id, 'declined')}
                          className="px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-bold text-gray-500"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-gray-400">Offer {inv.status}</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Insurance & PF Mini */}
      <Card className="p-4 animate-slide-up border border-gray-100 dark:border-slate-800 cursor-pointer hover:border-brand-300" onClick={() => setScreen('insurance')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{t('insurance') || 'Insurance'}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Skill-based cover · yearly protection plans</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gray-300 dark:text-slate-600" />
        </div>
      </Card>

      {/* Language Translator */}
      <Card className="p-4 animate-slide-up border border-purple-100 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('open-shramasetu-ai', { detail: 'translator' }))}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-2xs">
              <Languages size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{t('translator') || 'Language Translator'}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Translate work messages, instructions and everyday phrases.</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gray-300 dark:text-slate-600" />
        </div>
      </Card>

      {/* Smart Savings Mini */}
      <Card className="p-4 animate-slide-up border border-brand-100 dark:border-brand-900/40 bg-brand-50/50 dark:bg-brand-950/20 cursor-pointer" onClick={() => setScreen('savings')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-2xs">
              <PiggyBank size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{t('smartSavings') || 'Smart Savings'}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">0.5–6% based on day conditions, market, weather and work quality</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gray-300 dark:text-slate-600" />
        </div>
      </Card>

      {/* Emergency Fund Mini */}
      <Card className="p-4 animate-slide-up border border-gray-100 dark:border-slate-800 cursor-pointer" onClick={() => setScreen('savings')}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-accent-50 dark:bg-emerald-950/40 flex items-center justify-center text-accent-600 dark:text-emerald-400">
              <PiggyBank size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100">Emergency Fund</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{formatINR(workerStats.emergencySavings)} of ₹5,000</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-gray-300 dark:text-slate-600" />
        </div>
        <ProgressBar value={workerStats.emergencySavings} max={5000} colorClass="bg-accent-500" />
      </Card>

      {/* Recent Payment */}
      {recentEarning && (
        <Card className="p-4 animate-slide-up border border-gray-100 dark:border-slate-800 cursor-pointer" onClick={() => setScreen('earnings')}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300">Recent Payment</h2>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${recentEarning.status === 'paid' ? 'bg-accent-100 dark:bg-emerald-950 text-accent-600 dark:text-emerald-400' : 'bg-warning-100 dark:bg-amber-950 text-warning-600 dark:text-amber-400'}`}>
                {recentEarning.status === 'paid' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{recentEarning.work}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{recentEarning.date} · {recentEarning.hoursOrDays}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-accent-600 dark:text-emerald-400">+{formatINR(recentEarning.amount)}</p>
              <p className={`text-xs font-semibold ${recentEarning.status === 'paid' ? 'text-accent-600 dark:text-emerald-400' : 'text-warning-600 dark:text-amber-400'}`}>
                {recentEarning.status === 'paid' ? 'Paid' : 'Pending'}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Button variant="secondary" className="w-full text-xs font-bold" onClick={() => setScreen('messages')}>
        {t('viewMessages') || 'View Messages'} {unreadCount > 0 && `(${unreadCount} new)`}
      </Button>
    </div>
  );
}
