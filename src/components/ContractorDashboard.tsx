import {
  Users,
  Briefcase,
  Calendar,
  CreditCard,
  MessageSquare,
  IndianRupee,
  AlertCircle,
  ArrowRight,
  User,
  Languages,
  ArrowLeftRight,
  ChevronRight,
  Phone,
  MapPin,
  Home,
  HardHat,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, formatINR } from './ui';
import { contractorStats } from '@/mockData';
import { AddTenderModal } from './AddTenderModal';
import { RoleSwitcher } from './RoleSwitcher';

export function ContractorDashboard({ showProfileInitially = false }: { showProfileInitially?: boolean }) {
  const {
    screen,
    setScreen,
    setRole,
    wages,
    postedJobs,
    attendance,
    registrationProfile,
    role,
    tenders,
    setSelectedProjectId,
    addTender,
    incomingRfps,
    respondToRfp,
    t,
  } = useApp();

  const [showProfile, setShowProfile] = useState(showProfileInitially || screen === 'profile');
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showAddTenderModal, setShowAddTenderModal] = useState(false);
  const roleLabel = role === 'employer' ? 'Employer' : 'Contractor';

  useEffect(() => {
    if (screen === 'profile') {
      setShowProfile(true);
    } else if (screen === 'home') {
      setShowProfile(false);
    }
  }, [screen]);

  const pendingWages = wages.filter((w) => w.status === 'pending').reduce((s, w) => s + w.totalEarned, 0);
  const presentCount = attendance.filter((a) => a.status === 'present').length;

  const stats = [
    { label: t('activeWorkers') || 'Active Workers', value: contractorStats.activeWorkers, icon: Users, color: 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400', screen: 'workers' as const },
    { label: t('presentToday') || 'Present Today', value: presentCount, icon: Calendar, color: 'bg-accent-50 dark:bg-emerald-950/40 text-accent-600 dark:text-emerald-400', screen: 'attendance' as const },
    { label: t('pendingWages') || 'Pending Wages', value: formatINR(pendingWages), icon: IndianRupee, color: 'bg-warning-50 dark:bg-amber-950/40 text-warning-600 dark:text-amber-400', screen: 'wages' as const },
    { label: t('openJobs') || 'Open Jobs', value: postedJobs.length, icon: Briefcase, color: 'bg-error-50 dark:bg-red-950/40 text-error-600 dark:text-red-400', screen: 'postJob' as const },
  ];

  const quickActions = [
    { label: t('findWorkers') || 'Find Workers', icon: Users, screen: 'workers' as const, color: 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400' },
    { label: t('postJob') || 'Post Job', icon: Briefcase, screen: 'postJob' as const, color: 'bg-warning-50 dark:bg-amber-950/40 text-warning-600 dark:text-amber-400' },
    { label: t('attendanceMuster') || 'Attendance', icon: Calendar, screen: 'attendance' as const, color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
    { label: t('wagesLedger') || 'Wages', icon: CreditCard, screen: 'wages' as const, color: 'bg-error-50 dark:bg-red-950/40 text-error-600 dark:text-red-400' },
    { label: t('messages') || 'Messages', icon: MessageSquare, screen: 'messages' as const, color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
    { label: t('homeWork') || 'Home Work', icon: Home, screen: 'homeWork' as const, color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
  ];

  if (showProfile) {
    return (
      <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setShowProfile(false); setScreen('home'); }}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-slate-200 active:scale-95 transition-transform"
            aria-label={t('backToDashboard') || 'Back to dashboard'}
          >
            <ArrowRight size={19} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-slate-100">{roleLabel} {t('profile') || 'Profile'}</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">{t('professionalInfo') || 'Professional information'}</p>
          </div>
        </div>

        <Card className="p-5 mb-4 border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center text-2xl font-extrabold">
              {(registrationProfile?.name || 'Contractor').split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-slate-100">{registrationProfile?.name || 'Rajesh Kumar'}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">{registrationProfile?.company || 'Kumar Constructions'} · {roleLabel}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 mt-1">
                <MapPin size={14} />
                <span>{registrationProfile?.location || 'Belagavi, Karnataka'}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <Card className="p-4 border border-gray-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-emerald-950/40 text-accent-600 dark:text-emerald-400 flex items-center justify-center">
                <Languages size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500">{t('languages') || 'Languages'}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(registrationProfile?.languages?.length ? registrationProfile.languages : ['Kannada', 'Hindi', 'English']).map((language) => (
                    <span key={language} className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-semibold">
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning-50 dark:bg-amber-950/40 text-warning-600 dark:text-amber-400 flex items-center justify-center">
                <Phone size={19} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-slate-500">{t('phone') || 'Contact'}</p>
                <p className="font-bold text-gray-900 dark:text-slate-100 mt-0.5">{registrationProfile?.phone || '+91 98450 12345'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Persona Switcher Trigger */}
        <button
          onClick={() => setShowRoleSwitcher(true)}
          className="w-full mt-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-center justify-between active:scale-[0.99] transition-all shadow-xs"
        >
          <div className="flex items-center gap-3">
            <ArrowLeftRight size={20} className="text-amber-700 dark:text-amber-400" />
            <div className="text-left">
              <p className="font-bold text-sm">{t('switchPersona') || 'Switch Persona'}</p>
              <p className="text-xs text-amber-700/80 dark:text-amber-300/80">Switch between Employer, Contractor, Skilled Worker, and Labourer</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-amber-700 dark:text-amber-400" />
        </button>

        <RoleSwitcher
          isOpen={showRoleSwitcher}
          onClose={() => setShowRoleSwitcher(false)}
          currentRole={role}
          onSelectRole={(nextRole) => {
            setRole(nextRole);
            setScreen('auth');
          }}
        />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
      <div className="flex items-start justify-between gap-3 mb-6">
        <ScreenHeader
          title={t('contractorHubTitle') || 'Contractor Operations Hub'}
          subtitle={registrationProfile?.company || registrationProfile?.name || 'Kumar Construction Services'}
          showBack={false}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRoleSwitcher(true)}
            className="px-2.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
            title={t('switchPersona') || 'Switch Persona'}
          >
            <ArrowLeftRight size={13} className="text-amber-700 dark:text-amber-400" />
            <span className="hidden sm:inline">{t('switchPersona') || 'Switch Persona'}</span>
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center active:scale-95 transition-transform"
            aria-label={t('contractorProfileTitle') || 'Open contractor profile'}
          >
            <User size={20} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              onClick={() => stat.screen && setScreen(stat.screen)}
              className={`p-4 border border-gray-100 dark:border-slate-800 transition-all shadow-xs ${
                stat.screen ? 'cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 active:scale-[0.98]' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mt-0.5">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">{t('managementTools') || 'Quick Actions'}</h2>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5 lg:mx-0 lg:px-0">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => setScreen(action.screen)}
                className="flex flex-col items-center gap-2 group flex-shrink-0"
              >
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center ${action.color} group-active:scale-95 transition-transform shadow-xs`}>
                  <Icon size={24} strokeWidth={2} />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 text-center leading-tight whitespace-nowrap">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Incoming Client RFPs from Employers */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-slate-100">
                {t('incomingRfps') || 'Incoming Client RFPs'}
              </h2>
              {incomingRfps.filter((r) => r.status === 'pending').length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {incomingRfps.filter((r) => r.status === 'pending').length} {t('pendingResponse') || 'New'}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Direct project RFPs received from verified Employers (PWD & Real Estate Developers)
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t('realtimeSync') || 'Live Sync'}
          </span>
        </div>

        <div className="space-y-3">
          {incomingRfps.map((rfp) => (
            <Card
              key={rfp.id}
              className="p-4 sm:p-5 border border-purple-100 dark:border-purple-900/40 bg-gradient-to-r from-purple-50/30 via-white to-white dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-900 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[11px] font-extrabold font-mono">
                      {rfp.id.toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                      {t('clientLabel') || 'Client'}: <strong className="text-gray-900 dark:text-slate-100">{rfp.clientName}</strong>
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        rfp.status === 'accepted'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : rfp.status === 'declined'
                          ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {rfp.status === 'accepted'
                        ? `✓ ${t('accepted') || 'Accepted'}`
                        : rfp.status === 'declined'
                        ? `✕ ${t('declined') || 'Declined'}`
                        : `⏳ ${t('pendingResponse') || 'Pending Review'}`}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-gray-900 dark:text-slate-100 mt-1">
                    {rfp.projectTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400" /> {rfp.location}
                    </span>
                    <span>•</span>
                    <span>{t('budgetLabel') || 'Budget'}: <strong>{formatINR(rfp.budget)}</strong></span>
                    <span>•</span>
                    <span>{t('demandLabel') || 'Demand'}: <strong>{rfp.workforceDemand} {t('workersLabel') || 'workers'}</strong></span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-slate-300 mt-2 bg-white/70 dark:bg-slate-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                    <span className="font-bold text-purple-700 dark:text-purple-300">{t('clientNote') || 'Client Note'}:</span> {rfp.clientNote} ({rfp.tradesSummary})
                  </p>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                  {rfp.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => {
                          respondToRfp(rfp.id, 'accepted');
                          setSelectedProjectId(rfp.tenderId);
                          setScreen('projectDetail');
                        }}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <CheckCircle2 size={14} />
                        {t('acceptRfpBtn') || 'Accept RFP & Plan'}
                      </button>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setScreen('messages')}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 text-xs font-bold text-gray-700 dark:text-slate-200 flex items-center justify-center gap-1"
                        >
                          <MessageSquare size={13} />
                          {t('chatWithClient') || 'Chat'}
                        </button>
                        <button
                          onClick={() => respondToRfp(rfp.id, 'declined')}
                          className="px-2.5 py-1.5 rounded-xl hover:bg-red-50 text-xs font-bold text-red-600 dark:hover:bg-red-950/40 transition-colors"
                        >
                          {t('declineBtn') || 'Decline'}
                        </button>
                      </div>
                    </>
                  ) : rfp.status === 'accepted' ? (
                    <button
                      onClick={() => {
                        setSelectedProjectId(rfp.tenderId);
                        setScreen('projectDetail');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <HardHat size={14} />
                      {t('openCommandCenter') || 'Open Command Center'}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 italic">RFP Declined</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Work Orders & Tenders */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 dark:text-slate-100">
            {t('activeWorkOrders') || 'Active Work Orders & Projects'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {t('activeWorkOrdersSubtitle') || 'Tender-won contracts with active workforce deployment'}
          </p>
        </div>
        <button
          onClick={() => setShowAddTenderModal(true)}
          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Plus size={15} />
          {t('addWorkOrder') || 'Add Tender / Work Order'}
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {tenders.map((proj) => {
          const reqs = proj.workforceRequirements || [];
          const totalReq = reqs.reduce((s, r) => s + r.headcount, 0) || 100;
          const assignedCount = reqs.reduce((s, r) => s + (r.assignedCount ?? 0), 0) || (proj.assignedWorkers?.length ?? 88);
          const fulfillment = proj.fulfillmentPercent ?? Math.min(100, Math.round((assignedCount / totalReq) * 100));
          const shortage = Math.max(0, totalReq - assignedCount);

          return (
            <Card
              key={proj.id}
              className="p-4 sm:p-5 border border-gray-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      {proj.tenderId || 'Tender #KA-2026-1042'}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        fulfillment === 100
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {fulfillment === 100 ? (
                        <>
                          <CheckCircle2 size={11} /> {t('readyToDeploy') || 'Ready to Deploy'}
                        </>
                      ) : (
                        <>
                          <HardHat size={11} /> {t('activeFulfillment') || 'Active Fulfillment'}
                        </>
                      )}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 dark:text-slate-100 text-base sm:text-lg">
                    {proj.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400 dark:text-slate-500" />
                      {proj.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400 dark:text-slate-500" />
                      Starts {proj.startDate || '10 Oct 2026'} ({proj.duration})
                    </span>
                    <span>•</span>
                    <span className="font-bold text-gray-800 dark:text-slate-200">
                      {formatINR(proj.value)}
                    </span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <button
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setScreen('projectDetail');
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {t('openCommandCenter') || 'View Project Command Center'}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Fulfillment Progress */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-700 dark:text-slate-300">
                    Workforce Fulfillment: <strong>{assignedCount} / {totalReq} workers</strong>
                  </span>
                  <span className={`font-extrabold ${fulfillment === 100 ? 'text-emerald-700 dark:text-emerald-400' : 'text-brand-700 dark:text-brand-400'}`}>
                    {fulfillment}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      fulfillment === 100 ? 'bg-emerald-500' : 'bg-brand-600'
                    }`}
                    style={{ width: `${fulfillment}%` }}
                  />
                </div>
                {shortage > 0 && (
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-1">
                    ⚠️ Shortage: {shortage} workers needed before project start ({proj.startDate || '10 Oct 2026'}).
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {pendingWages > 0 && (
        <Card className="p-4 mb-5 flex items-center gap-3 border-l-4 border-l-warning-500 dark:border-l-amber-500 animate-slide-up cursor-pointer hover:bg-amber-50/20" onClick={() => setScreen('wages')}>
          <div className="w-10 h-10 rounded-xl bg-warning-50 dark:bg-amber-950/40 flex items-center justify-center text-warning-600 dark:text-amber-400 flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-slate-100 text-sm">{t('pendingWagePayments') || 'Pending Wage Payments'}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{formatINR(pendingWages)} {t('toBePaid') || 'to be paid to workers'}</p>
          </div>
          <ArrowRight size={18} className="text-gray-300 dark:text-slate-600" />
        </Card>
      )}

      {/* Smart Insights */}
      <Card className="p-4 mb-5 bg-brand-50/50 dark:bg-brand-950/20 border-brand-100 dark:border-brand-900/40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-extrabold text-gray-900 dark:text-slate-100">Smart Workforce Insights</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Hiring designed for local blue-collar and technical work</p>
          </div>
          <button onClick={() => setScreen('workers')} className="text-xs font-bold text-brand-600 dark:text-brand-400">
            {t('findWorkers') || 'Find workers'}
          </button>
        </div>
        <div className="space-y-2">
          <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-gray-100 dark:border-slate-800">
            <p className="text-xs font-extrabold text-gray-900 dark:text-slate-100">Profile-first hiring</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">ITI and diploma workers do not need a corporate CV. ShramaID highlights practical skills, credentials and past work.</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-gray-100 dark:border-slate-800">
            <p className="text-xs font-extrabold text-gray-900 dark:text-slate-100">Hyper-local matching</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Prioritise workers within a practical <b>5–15 km</b> radius, so local jobs can be filled without expecting workers to relocate.</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-gray-100 dark:border-slate-800">
            <p className="text-xs font-extrabold text-gray-900 dark:text-slate-100">Local businesses can hire directly</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Auto garages, manufacturing units, and contractors can post requirements directly.</p>
          </div>
        </div>
      </Card>

      {/* Open Jobs */}
      <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">{t('openRequirements') || 'Open Job Requirements'}</h2>
      <div className="space-y-2">
        {postedJobs.map((job) => (
          <Card key={job.id} className="p-4 animate-slide-up border border-gray-100 dark:border-slate-800 cursor-pointer hover:border-brand-300" onClick={() => setScreen('postJob')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
                  <Briefcase size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 dark:text-slate-100 text-sm truncate">{job.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{job.workersNeeded} workers · {job.location}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-brand-600 dark:text-brand-400 flex-shrink-0">{formatINR(job.dailyWage)}/day</span>
            </div>
          </Card>
        ))}
      </div>

      {showAddTenderModal && (
        <AddTenderModal
          isOpen={true}
          onClose={() => setShowAddTenderModal(false)}
          onSave={(newTender) => {
            addTender(newTender);
            setSelectedProjectId(newTender.id);
            setShowAddTenderModal(false);
            setScreen('projectDetail');
          }}
          onProjectCreated={(newTender) => {
            addTender(newTender);
            setSelectedProjectId(newTender.id);
            setShowAddTenderModal(false);
            setScreen('projectDetail');
          }}
        />
      )}

      <RoleSwitcher
        isOpen={showRoleSwitcher}
        onClose={() => setShowRoleSwitcher(false)}
        currentRole={role}
        onSelectRole={(nextRole) => {
          setRole(nextRole);
          setScreen('auth');
        }}
      />
    </div>
  );
}
