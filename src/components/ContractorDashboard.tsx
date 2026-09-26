import {
  Users,
  Briefcase,
  Calendar,
  CreditCard,
  MessageSquare,
  IndianRupee,
  ArrowRight,
  User,
  ChevronRight,
  Phone,
  MapPin,
  X,
  HardHat,
  Plus,
  CheckCircle2,
  Send,
  Building2,
  Clock3,
  ShieldCheck,
  Check,
  Ban,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, formatINR } from './ui';
import { contractorStats } from '@/mockData';
import { AddTenderModal } from './AddTenderModal';
import { RoleSwitcher } from './RoleSwitcher';

export function ContractorDashboard({ showProfileInitially = false }: { showProfileInitially?: boolean }) {
  const {
    setScreen,
    setRole,
    wages,
    postedJobs,
    attendance,
    registrationProfile,
    role,
    tenders,
    setSelectedProjectId,
    rfps,
    respondToRfp,
    wageRecords,
    attendanceRecords,
    t,
  } = useApp();

  const [showProfile, setShowProfile] = useState(showProfileInitially);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showAddTenderModal, setShowAddTenderModal] = useState(false);

  useEffect(() => {
    setShowProfile(showProfileInitially);
  }, [showProfileInitially]);

  const roleLabel = role === 'employer' ? t('iAmEmployer') : t('contractorProfileTitle');

  // Real-time calculated stats from wage records & attendance records
  const pendingWagesSum = wageRecords
    .filter((w) => w.status === 'pending')
    .reduce((s, w) => s + w.totalAmount, 0);

  const presentCount = attendanceRecords
    .filter((a) => a.status === 'present' || a.status === 'half')
    .length || attendance.filter((a) => a.status === 'present').length;

  const stats = [
    { label: t('activeWorkers'), value: contractorStats.activeWorkers, icon: Users, color: 'bg-brand-50 text-brand-600', screen: 'workers' as const },
    { label: t('presentToday'), value: presentCount, icon: Calendar, color: 'bg-emerald-50 text-emerald-600', screen: 'attendance' as const },
    { label: t('pendingWages'), value: formatINR(pendingWagesSum || 14200), icon: IndianRupee, color: 'bg-amber-50 text-amber-600', screen: 'wages' as const },
    { label: t('activeProjects'), value: tenders.length, icon: Briefcase, color: 'bg-blue-50 text-blue-600', screen: null },
  ];

  const quickActions = [
    { label: t('findWorkers'), icon: Users, screen: 'workers' as const, color: 'bg-brand-50 text-brand-600' },
    { label: t('attendanceMuster'), icon: Calendar, screen: 'attendance' as const, color: 'bg-emerald-50 text-emerald-600' },
    { label: t('wagesLedger'), icon: CreditCard, screen: 'wages' as const, color: 'bg-amber-50 text-amber-600' },
    { label: t('messages'), icon: MessageSquare, screen: 'messages' as const, color: 'bg-purple-50 text-purple-600' },
  ];

  // Incoming RFPs targeted at contractor c1
  const incomingRfps = rfps.filter((r) => r.contractorId === 'c1' || r.contractorId === 'all');
  const pendingRfps = incomingRfps.filter((r) => r.status === 'sent');

  if (showProfile) {
    return (
      <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setShowProfile(false); setScreen('home'); }}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-slate-200 active:scale-95 transition-transform"
            aria-label={t('backToDashboard')}
          >
            <ArrowRight size={19} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-slate-100">{roleLabel}</h1>
            <p className="text-xs text-gray-500 dark:text-slate-400">{t('professionalInfo')}</p>
          </div>
        </div>

        <Card className="p-5 mb-4 border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center text-2xl font-extrabold">
              RK
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-slate-100">{registrationProfile?.company || 'Kumar Construction Services'}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Rajesh Kumar · Certified Class-I Contractor</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 mt-1">
                <MapPin size={14} className="text-gray-400" />
                <span>Belagavi, Karnataka · Verified Contractor</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 mb-4 border border-gray-100 dark:border-slate-800 space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-slate-100">{t('workforceCapabilities')}</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700">
              <p className="text-gray-500 dark:text-slate-400">{t('fleetCapacity')}</p>
              <p className="font-bold text-gray-900 dark:text-slate-100 mt-0.5">120 Active Tradesmen</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700">
              <p className="text-gray-500 dark:text-slate-400">{t('trustScore')}</p>
              <p className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">98% Verified Delivery</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700">
              <p className="text-gray-500 dark:text-slate-400">{t('specialties')}</p>
              <p className="font-bold text-gray-900 dark:text-slate-100 mt-0.5">Highways, Bridges & Culverts</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700">
              <p className="text-gray-500 dark:text-slate-400">{t('license')}</p>
              <p className="font-bold text-gray-900 dark:text-slate-100 mt-0.5">KA-PWD-CL1-2024-88</p>
            </div>
          </div>
        </Card>

        <button
          onClick={() => setShowRoleSwitcher(true)}
          className="w-full p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold text-sm flex items-center justify-between hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors shadow-xs"
        >
          <span>{t('switchPersona')}</span>
          <ChevronRight size={18} />
        </button>

        <RoleSwitcher
          isOpen={showRoleSwitcher}
          onClose={() => setShowRoleSwitcher(false)}
          currentRole={role || 'contractor'}
          onSelectRole={(nextRole) => {
            setRole(nextRole);
            setScreen('home');
          }}
        />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <ScreenHeader
            title={t('contractorHubTitle')}
            subtitle={registrationProfile?.company || 'Kumar Construction Services · Rajesh Kumar'}
            showBack={false}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRoleSwitcher(true)}
            className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            {t('switchPersona')}
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center active:scale-95 transition-transform"
            aria-label={t('contractorProfileTitle')}
          >
            <User size={20} />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              onClick={() => stat.screen && setScreen(stat.screen)}
              className={`p-4 border border-gray-100 dark:border-slate-800 shadow-sm animate-slide-up transition-all ${
                stat.screen ? 'cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 active:scale-[0.98]' : ''
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 dark:text-slate-100">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold mt-0.5">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* INCOMING CLIENT RFPS (REALTIME) */}
      {incomingRfps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-base font-extrabold text-gray-900 dark:text-slate-100">
                {t('incomingRfps')} ({pendingRfps.length} {t('pending')})
              </h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-slate-400">{t('realtimeSync')}</span>
          </div>

          <div className="space-y-3">
            {incomingRfps.map((rfp) => (
              <Card
                key={rfp.id}
                className={`p-5 border transition-all ${
                  rfp.status === 'sent'
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm'
                    : rfp.status === 'accepted'
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300">
                        RFP #{rfp.id.toUpperCase()}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          rfp.status === 'sent'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : rfp.status === 'accepted'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                        }`}
                      >
                        {rfp.status === 'sent'
                          ? `⚡ ${t('pendingResponse')}`
                          : rfp.status === 'accepted'
                          ? `✓ ${t('accepted')}`
                          : t('declined')}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-slate-100 text-base">{rfp.projectTitle}</h3>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5 font-medium">
                      {t('clientLabel')}: <span className="font-bold text-gray-900 dark:text-slate-100">{rfp.employerName}</span> · {t('budgetLabel')}:{' '}
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{(rfp.budget / 100000).toFixed(1)} Lakhs</span>
                    </p>
                  </div>

                  <div className="text-right sm:shrink-0 text-xs text-gray-500 dark:text-slate-400">
                    <p className="font-semibold text-gray-700 dark:text-slate-300">
                      {t('demandLabel')}: {rfp.headcountNeeded} {t('workersLabel')}
                    </p>
                    <p className="text-[11px]">{rfp.duration}</p>
                  </div>
                </div>

                <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-gray-200/80 dark:border-slate-700/80 mb-3 text-xs text-gray-700 dark:text-slate-300 leading-relaxed">
                  <p className="font-semibold text-gray-900 dark:text-slate-100 mb-0.5">{t('clientNote')}:</p>
                  {rfp.message}
                </div>

                {rfp.status === 'sent' && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => respondToRfp(rfp.id, 'accepted')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Check size={14} /> {t('acceptRfpBtn')}
                    </button>
                    <button
                      onClick={() => respondToRfp(rfp.id, 'declined')}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Ban size={14} /> {t('declineBtn')}
                    </button>
                    <button
                      onClick={() => setScreen('messages')}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare size={14} /> {t('chatWithClient')}
                    </button>
                  </div>
                )}

                {rfp.status === 'accepted' && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs pt-1 gap-2">
                    <span className="text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={15} /> {t('readyToDeploy')}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedProjectId(rfp.projectId);
                        setScreen('projectDetail');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:bg-gray-800 dark:hover:bg-white transition-colors flex items-center gap-1 self-start sm:self-auto"
                    >
                      {t('openCommandCenter')} <ArrowRight size={13} />
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Operations Bar */}
      <div>
        <h2 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 mb-2">{t('managementTools')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => setScreen(action.screen)}
                className="p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-850 flex items-center gap-3 text-left transition-all shadow-2xs group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{t('launchTool')}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE PROJECTS LIST */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-slate-100">{t('activeWorkOrders')}</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">{t('activeWorkOrdersSubtitle')}</p>
          </div>
          <button
            onClick={() => setShowAddTenderModal(true)}
            className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} /> {t('addWorkOrder')}
          </button>
        </div>

        <div className="space-y-3">
          {tenders.map((proj) => {
            const reqs = proj.workforceRequirements || [];
            const totalReq = reqs.reduce((s, r) => s + r.headcount, 0) || 100;
            const assignedCount =
              reqs.reduce((s, r) => s + (r.assignedCount ?? 0), 0) || (proj.assignedWorkers?.length ?? 88);
            const fulfillment =
              proj.fulfillmentPercent ?? Math.min(100, Math.round((assignedCount / totalReq) * 100));

            return (
              <Card
                key={proj.id}
                className="p-4 sm:p-5 border border-gray-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        {proj.tenderId || 'Tender #KA-2026-1042'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          fulfillment >= 100
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {fulfillment >= 100 ? (
                          <>
                            <CheckCircle2 size={11} /> {t('readyToDeploy')}
                          </>
                        ) : (
                          <>
                            <HardHat size={11} /> {t('activeFulfillment')} ({fulfillment}%)
                          </>
                        )}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-gray-900 dark:text-slate-100 text-base sm:text-lg">{proj.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      {proj.location} · Value: <span className="font-bold text-gray-900 dark:text-slate-100">{formatINR(proj.value)}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setScreen('projectDetail');
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-slate-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
                  >
                    {t('openCommandCenter')} <ArrowRight size={14} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-600 dark:text-slate-400">{t('workforceDeployed')}</span>
                    <span className="text-brand-700 dark:text-brand-300">
                      {assignedCount} / {totalReq} {t('workersLabel')} ({fulfillment}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        fulfillment >= 100 ? 'bg-emerald-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${fulfillment}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <AddTenderModal
        isOpen={showAddTenderModal}
        onClose={() => setShowAddTenderModal(false)}
        onSave={(newTender) => {
          setSelectedProjectId(newTender.id);
          setShowAddTenderModal(false);
          setScreen('projectDetail');
        }}
      />

      <RoleSwitcher
        isOpen={showRoleSwitcher}
        onClose={() => setShowRoleSwitcher(false)}
        currentRole={role || 'contractor'}
        onSelectRole={(nextRole) => {
          setRole(nextRole);
          setScreen('home');
        }}
      />
    </div>
  );
}
