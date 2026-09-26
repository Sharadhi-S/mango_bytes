import {
  Wallet,
  PiggyBank,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Clock,
  Target,
  CheckCircle2,
  MapPin,
  ArrowRight,
  HardHat,
  Check,
  X,
  Building2,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/AppContext';
import { Card, Button, ScreenHeader, formatINR } from './ui';
import { RoleSwitcher } from './RoleSwitcher';

export function LabourerDashboard() {
  const {
    setScreen,
    setRole,
    role,
    registrationProfile,
    invitations,
    respondToInvitation,
    activeAssignment,
    workerEarningsSummary,
    savingsGoalsDetailed,
    t,
  } = useApp();

  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Filter invitations for labourer (w2)
  const pendingInvs = invitations.filter((i) => i.workerId === 'w2' && i.status === 'invited');
  const activeGoal = savingsGoalsDetailed.find((g) => g.status === 'active') || savingsGoalsDetailed[0];

  return (
    <div className="px-5 pt-6 pb-24 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <ScreenHeader
          title={t('labourerDashboardTitle')}
          subtitle={registrationProfile?.name ? `${t('welcomeBack')}, ${registrationProfile.name}` : 'Suresh Patel · Labourer'}
          showBack={false}
        />
        <button
          onClick={() => setShowRoleSwitcher(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold transition-colors shadow-2xs"
        >
          {t('switchPersona')}
        </button>
      </div>

      {/* REAL-TIME WORK INVITATION BANNER */}
      {pendingInvs.length > 0 && (
        <div className="space-y-3">
          {pendingInvs.map((inv) => (
            <Card
              key={inv.id}
              className="p-4 border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-md animate-scale-up"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <HardHat size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                      ⚡ {t('newProjectInvitation')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{inv.duration}</span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 dark:text-slate-100 text-base">{inv.projectTitle}</h3>
                  <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5 font-medium">
                    {t('contractorLabel')}: <span className="font-bold text-gray-900 dark:text-slate-100">{inv.contractorName}</span>
                  </p>
                  <p className="text-xs text-emerald-800 dark:text-emerald-400 font-bold mt-1">
                    {t('dailyWageRateLabel')}: ₹{inv.dailyWage}/{t('perDay')} · {inv.location}
                  </p>
                  {inv.notes && (
                    <p className="text-[11px] text-gray-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/80 p-2 rounded-lg mt-2 border border-emerald-200 dark:border-emerald-800">
                      "{inv.notes}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => respondToInvitation(inv.id, 'accepted')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Check size={14} /> {t('acceptInvitation')}
                    </button>
                    <button
                      onClick={() => respondToInvitation(inv.id, 'declined')}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <X size={14} /> {t('declineBtn')}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ACTIVE SITE ASSIGNMENT CARD */}
      <Card className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">
              <Building2 size={15} /> {t('activeSiteAssignment')}
            </div>
            <h3 className="font-extrabold text-gray-900 dark:text-slate-100 text-base">
              {activeAssignment?.projectTitle || 'Belagavi Highway & Flyover Expansion'}
            </h3>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
              {t('contractorLabel')}: <span className="font-bold text-gray-900 dark:text-slate-100">{activeAssignment?.contractorName || 'Kumar Construction Services'}</span>
            </p>
            <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mt-1">
              {t('wageLabel')}: ₹{activeAssignment?.dailyWage || 600}/{t('perDay')} · {t('expectedEarningsLabel')}: ₹{(activeAssignment?.expectedEarnings || 18000).toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={() => setScreen('messages')}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
          >
            <MessageSquare size={13} /> {t('messageContractor')}
          </button>
        </div>
      </Card>

      {/* LIVE EARNINGS HERO CARD */}
      <Card className="overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-100 text-sm mb-1">
              <TrendingUp size={16} />
              <span>{t('todayLoggedEarnings')}</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
              {t('liveAttendanceSync')}
            </span>
          </div>
          <div className="text-4xl font-extrabold tracking-tight mt-1">
            {formatINR(workerEarningsSummary.todayEarned)}
          </div>
          <p className="text-emerald-100 text-xs mt-1">
            {t('calculatedFromMuster')}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/20 text-xs">
            <div>
              <p className="text-emerald-100">{t('thisMonthEarnings')}</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {formatINR(workerEarningsSummary.thisMonthEarned || 12600)}
              </p>
            </div>
            <div>
              <p className="text-emerald-100">{t('pendingContractorPayout')}</p>
              <p className="text-lg font-bold text-amber-200 mt-0.5">
                {formatINR(workerEarningsSummary.pendingPayout || 3300)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* SAVINGS RECOMMENDATION CARD */}
      {activeGoal && (
        <Card className="p-4 border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                <PiggyBank size={16} /> {t('dailySavingsRecommendation')}
              </div>
              <h3 className="font-extrabold text-gray-900 dark:text-slate-100 text-sm">{activeGoal.title}</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
                {t('targetLabel')}: ₹{activeGoal.targetAmount.toLocaleString('en-IN')} · {t('savedLabel')}: ₹{activeGoal.currentAmount.toLocaleString('en-IN')} ({Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)}%)
              </p>
              <p className="text-xs font-extrabold text-amber-900 dark:text-amber-200 mt-1.5 bg-amber-100/80 dark:bg-amber-900/40 px-2 py-1 rounded inline-block">
                💡 {t('recommendedLabel')}: Save ₹{activeGoal.recommendedDailyAmount}/{t('perDay')} for {activeGoal.daysRemaining} days remaining
              </p>
            </div>
            <button
              onClick={() => setScreen('savings')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors shadow-2xs"
            >
              {t('saveToday')}
            </button>
          </div>
        </Card>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setScreen('earnings')}
          className="p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-850 flex items-center gap-3 text-left transition-colors shadow-2xs"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-slate-100">{t('earningsLog')}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">{t('viewDailyBreakdown')}</p>
          </div>
        </button>

        <button
          onClick={() => setScreen('savings')}
          className="p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-850 flex items-center gap-3 text-left transition-colors shadow-2xs"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
            <PiggyBank size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-slate-100">{t('savingsGoals')}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">{t('dailyPlannerTargets')}</p>
          </div>
        </button>

        <button
          onClick={() => setScreen('messages')}
          className="p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-850 flex items-center gap-3 text-left transition-colors shadow-2xs"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
            <MessageSquare size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-slate-100">{t('contractorChat')}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">{t('siteInstructions')}</p>
          </div>
        </button>

        <button
          onClick={() => setScreen('jobs')}
          className="p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-850 flex items-center gap-3 text-left transition-colors shadow-2xs"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Briefcase size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-slate-100">{t('nearbyJobs')}</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500">{t('nearbyJobsSub')}</p>
          </div>
        </button>
      </div>

      <RoleSwitcher
        isOpen={showRoleSwitcher}
        onClose={() => setShowRoleSwitcher(false)}
        currentRole={role || 'labourer'}
        onSelectRole={(nextRole) => {
          setRole(nextRole);
          setScreen('home');
        }}
      />
    </div>
  );
}
