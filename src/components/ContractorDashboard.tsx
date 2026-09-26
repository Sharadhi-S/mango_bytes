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
import { useState } from 'react';
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
  } = useApp();

  const [showProfile, setShowProfile] = useState(showProfileInitially);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showAddTenderModal, setShowAddTenderModal] = useState(false);
  const roleLabel = role === 'employer' ? 'Employer' : 'Contractor';

  // Real-time calculated stats from wage records & attendance records
  const pendingWagesSum = wageRecords
    .filter((w) => w.status === 'pending')
    .reduce((s, w) => s + w.totalAmount, 0);

  const presentCount = attendanceRecords
    .filter((a) => a.status === 'present' || a.status === 'half')
    .length || attendance.filter((a) => a.status === 'present').length;

  const stats = [
    { label: 'Active Workers', value: contractorStats.activeWorkers, icon: Users, color: 'bg-brand-50 text-brand-600' },
    { label: 'Present Today', value: presentCount, icon: Calendar, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Wages', value: formatINR(pendingWagesSum || 14200), icon: IndianRupee, color: 'bg-amber-50 text-amber-600' },
    { label: 'Active Projects', value: tenders.length, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
  ];

  const quickActions = [
    { label: 'Find Workers', icon: Users, screen: 'workers' as const, color: 'bg-brand-50 text-brand-600' },
    { label: 'Attendance Muster', icon: Calendar, screen: 'attendance' as const, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Wages Ledger', icon: CreditCard, screen: 'wages' as const, color: 'bg-amber-50 text-amber-600' },
    { label: 'Messages', icon: MessageSquare, screen: 'messages' as const, color: 'bg-purple-50 text-purple-600' },
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
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 active:scale-95 transition-transform"
            aria-label="Back to dashboard"
          >
            <ArrowRight size={19} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{roleLabel} Profile</h1>
            <p className="text-xs text-gray-500">Professional operational information</p>
          </div>
        </div>

        <Card className="p-5 mb-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-extrabold">
              RK
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900">{registrationProfile?.company || 'Kumar Construction Services'}</h2>
              <p className="text-sm text-gray-500 font-medium">Rajesh Kumar · Certified Class-I Contractor</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <MapPin size={14} className="text-gray-400" />
                <span>Belagavi, Karnataka · Verified Contractor</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 mb-4 border border-gray-100 space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900">Workforce Capabilities</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-gray-500">Fleet & Capacity</p>
              <p className="font-bold text-gray-900 mt-0.5">120 Active Tradesmen</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-gray-500">Trust Score</p>
              <p className="font-bold text-emerald-700 mt-0.5">98% Verified Delivery</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-gray-500">Specialties</p>
              <p className="font-bold text-gray-900 mt-0.5">Highways, Bridges & Culverts</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-gray-500">License</p>
              <p className="font-bold text-gray-900 mt-0.5">KA-PWD-CL1-2024-88</p>
            </div>
          </div>
        </Card>

        <button
          onClick={() => setShowRoleSwitcher(true)}
          className="w-full p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-bold text-sm flex items-center justify-between hover:bg-amber-100 transition-colors shadow-xs"
        >
          <span>Switch ShramaSetu Persona</span>
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
            title="Contractor Operations Hub"
            subtitle={registrationProfile?.company || 'Kumar Construction Services · Rajesh Kumar'}
            showBack={false}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRoleSwitcher(true)}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            Switch Persona
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Open contractor profile"
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
            <Card key={i} className="p-4 border border-gray-100 shadow-sm animate-slide-up">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">{stat.label}</p>
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
              <h2 className="text-base font-extrabold text-gray-900">
                Incoming Client RFPs ({pendingRfps.length} Pending)
              </h2>
            </div>
            <span className="text-xs text-gray-500">Real-time sync</span>
          </div>

          <div className="space-y-3">
            {incomingRfps.map((rfp) => (
              <Card
                key={rfp.id}
                className={`p-5 border transition-all ${
                  rfp.status === 'sent'
                    ? 'border-amber-300 bg-amber-50/40 shadow-sm'
                    : rfp.status === 'accepted'
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-gray-200 bg-gray-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700">
                        RFP #{rfp.id.toUpperCase()}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          rfp.status === 'sent'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : rfp.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {rfp.status === 'sent'
                          ? '⚡ Pending Response'
                          : rfp.status === 'accepted'
                          ? '✓ Accepted'
                          : 'Declined'}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-gray-900 text-base">{rfp.projectTitle}</h3>
                    <p className="text-xs text-gray-600 mt-0.5 font-medium">
                      Client: <span className="font-bold text-gray-900">{rfp.employerName}</span> · Budget:{' '}
                      <span className="font-bold text-emerald-700">₹{(rfp.budget / 100000).toFixed(1)} Lakhs</span>
                    </p>
                  </div>

                  <div className="text-right sm:shrink-0 text-xs text-gray-500">
                    <p className="font-semibold text-gray-700">Demand: {rfp.headcountNeeded} Workers</p>
                    <p className="text-[11px]">{rfp.duration}</p>
                  </div>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-gray-200/80 mb-3 text-xs text-gray-700 leading-relaxed">
                  <p className="font-semibold text-gray-900 mb-0.5">Client Note:</p>
                  {rfp.message}
                </div>

                {rfp.status === 'sent' && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => respondToRfp(rfp.id, 'accepted')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Check size={14} /> Accept RFP & Plan Workforce
                    </button>
                    <button
                      onClick={() => respondToRfp(rfp.id, 'declined')}
                      className="px-3 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Ban size={14} /> Decline
                    </button>
                    <button
                      onClick={() => setScreen('messages')}
                      className="px-3 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageSquare size={14} /> Chat with Client
                    </button>
                  </div>
                )}

                {rfp.status === 'accepted' && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={15} /> Ready to deploy workforce for this contract
                    </span>
                    <button
                      onClick={() => {
                        setSelectedProjectId(rfp.projectId);
                        setScreen('projectDetail');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gray-900 text-white font-bold hover:bg-gray-800 transition-colors flex items-center gap-1"
                    >
                      Open Command Center <ArrowRight size={13} />
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
        <h2 className="text-sm font-extrabold text-gray-900 mb-2">Workforce Management Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => setScreen(action.screen)}
                className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 flex items-center gap-3 text-left transition-all shadow-2xs group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${action.color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-[10px] text-gray-400">Launch tool</p>
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
            <h2 className="text-base font-extrabold text-gray-900">Active Work Orders & Projects</h2>
            <p className="text-xs text-gray-500">Tender-won contracts with active workforce deployment</p>
          </div>
          <button
            onClick={() => setShowAddTenderModal(true)}
            className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} /> Add Work Order
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
                className="p-4 sm:p-5 border border-gray-100 hover:border-brand-300 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                        {proj.tenderId || 'Tender #KA-2026-1042'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          fulfillment >= 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {fulfillment >= 100 ? (
                          <>
                            <CheckCircle2 size={11} /> Ready to Deploy
                          </>
                        ) : (
                          <>
                            <HardHat size={11} /> Active Fulfillment ({fulfillment}%)
                          </>
                        )}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-gray-900 text-base sm:text-lg">{proj.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {proj.location} · Value: <span className="font-bold text-gray-900">{formatINR(proj.value)}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setScreen('projectDetail');
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
                  >
                    Open Command Center <ArrowRight size={14} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-gray-600">Workforce Deployed</span>
                    <span className="text-brand-700">
                      {assignedCount} / {totalReq} Workers ({fulfillment}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
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
