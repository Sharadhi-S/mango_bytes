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
          title="Labourer Dashboard"
          subtitle={registrationProfile?.name ? `Welcome back, ${registrationProfile.name}` : 'Suresh Patel · Labourer'}
          showBack={false}
        />
        <button
          onClick={() => setShowRoleSwitcher(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-bold transition-colors shadow-2xs"
        >
          Switch Persona
        </button>
      </div>

      {/* REAL-TIME WORK INVITATION BANNER */}
      {pendingInvs.length > 0 && (
        <div className="space-y-3">
          {pendingInvs.map((inv) => (
            <Card
              key={inv.id}
              className="p-4 border-2 border-emerald-500 bg-emerald-50/70 shadow-md animate-scale-up"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <HardHat size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-emerald-200 text-emerald-900">
                      ⚡ New Project Invitation
                    </span>
                    <span className="text-xs text-gray-500">{inv.duration}</span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base">{inv.projectTitle}</h3>
                  <p className="text-xs text-gray-600 mt-0.5 font-medium">
                    Contractor: <span className="font-bold text-gray-900">{inv.contractorName}</span>
                  </p>
                  <p className="text-xs text-emerald-800 font-bold mt-1">
                    Daily Wage Rate: ₹{inv.dailyWage}/day · {inv.location}
                  </p>
                  {inv.notes && (
                    <p className="text-[11px] text-gray-600 bg-white/70 p-2 rounded-lg mt-2 border border-emerald-200">
                      "{inv.notes}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => respondToInvitation(inv.id, 'accepted')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Check size={14} /> Accept Invitation
                    </button>
                    <button
                      onClick={() => respondToInvitation(inv.id, 'declined')}
                      className="px-3 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <X size={14} /> Decline
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ACTIVE SITE ASSIGNMENT CARD */}
      <Card className="p-4 border border-blue-200 bg-blue-50/40 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 mb-1">
              <Building2 size={15} /> Active Site Assignment
            </div>
            <h3 className="font-extrabold text-gray-900 text-base">
              {activeAssignment?.projectTitle || 'Belagavi Highway & Flyover Expansion'}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Contractor: <span className="font-bold text-gray-900">{activeAssignment?.contractorName || 'Kumar Construction Services'}</span>
            </p>
            <p className="text-xs font-bold text-blue-800 mt-1">
              Wage: ₹{activeAssignment?.dailyWage || 600}/day · Expected Earnings: ₹{(activeAssignment?.expectedEarnings || 18000).toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={() => setScreen('messages')}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
          >
            <MessageSquare size={13} /> Message Contractor
          </button>
        </div>
      </Card>

      {/* LIVE EARNINGS HERO CARD */}
      <Card className="overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-100 text-sm mb-1">
              <TrendingUp size={16} />
              <span>Today's Logged Earnings</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
              Live Attendance Sync
            </span>
          </div>
          <div className="text-4xl font-extrabold tracking-tight mt-1">
            {formatINR(workerEarningsSummary.todayEarned)}
          </div>
          <p className="text-emerald-100 text-xs mt-1">
            Calculated from contractor's verified daily attendance muster
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/20 text-xs">
            <div>
              <p className="text-emerald-100">This Month's Earnings</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {formatINR(workerEarningsSummary.thisMonthEarned || 12600)}
              </p>
            </div>
            <div>
              <p className="text-emerald-100">Pending Contractor Payout</p>
              <p className="text-lg font-bold text-amber-200 mt-0.5">
                {formatINR(workerEarningsSummary.pendingPayout || 3300)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* SAVINGS RECOMMENDATION CARD */}
      {activeGoal && (
        <Card className="p-4 border border-amber-200 bg-amber-50/50 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
                <PiggyBank size={16} /> Daily Savings Recommendation
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm">{activeGoal.title}</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Target: ₹{activeGoal.targetAmount.toLocaleString('en-IN')} · Saved: ₹{activeGoal.currentAmount.toLocaleString('en-IN')} ({Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)}%)
              </p>
              <p className="text-xs font-extrabold text-amber-900 mt-1.5 bg-amber-100/80 px-2 py-1 rounded inline-block">
                💡 Recommended: Save ₹{activeGoal.recommendedDailyAmount}/day for {activeGoal.daysRemaining} days remaining
              </p>
            </div>
            <button
              onClick={() => setScreen('savings')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-colors shadow-2xs"
            >
              Save Today
            </button>
          </div>
        </Card>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setScreen('earnings')}
          className="p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-3 text-left transition-colors shadow-2xs"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Wallet size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Earnings Log</p>
            <p className="text-[10px] text-gray-400">View daily breakdown</p>
          </div>
        </button>

        <button
          onClick={() => setScreen('savings')}
          className="p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-3 text-left transition-colors shadow-2xs"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <PiggyBank size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Savings Goals</p>
            <p className="text-[10px] text-gray-400">Daily planner & targets</p>
          </div>
        </button>

        <button
          onClick={() => setScreen('messages')}
          className="p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-3 text-left transition-colors shadow-2xs"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <MessageSquare size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Contractor Chat</p>
            <p className="text-[10px] text-gray-400">Site instructions</p>
          </div>
        </button>

        <button
          onClick={() => setScreen('jobs')}
          className="p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center gap-3 text-left transition-colors shadow-2xs"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Briefcase size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Nearby Jobs</p>
            <p className="text-[10px] text-gray-400">Belagavi construction</p>
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
