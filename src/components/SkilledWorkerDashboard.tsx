import {
  FileText,
  Languages,
  MonitorPlay,
  Sparkles,
  Briefcase,
  GraduationCap,
  MessageCircle,
  ArrowRight,
  Target,
  BookOpen,
  MapPin,
  WalletCards,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  Check,
  X,
  Building2,
  TrendingUp,
  PiggyBank,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, Badge, formatINR } from './ui';
import { RoleSwitcher } from './RoleSwitcher';

const learning = [
  { title: 'Resume Builder', desc: 'Turn your skills and experience into a clean job-ready resume.', icon: FileText, color: 'bg-brand-50 text-brand-600' },
  { title: 'Language Coach', desc: 'Practice English and regional languages for interviews and work.', icon: Languages, color: 'bg-accent-50 text-accent-600' },
  { title: 'Workplace Translator', desc: 'Translate work instructions, customer messages and common workplace phrases.', icon: Languages, color: 'bg-purple-50 text-purple-600', translator: true },
  { title: 'Computer Basics', desc: 'Learn typing, email, spreadsheets and digital job skills.', icon: MonitorPlay, color: 'bg-warning-50 text-warning-600' },
  { title: 'Intern Mode', desc: 'Get step-by-step practice tasks and profession demos.', icon: GraduationCap, color: 'bg-purple-50 text-purple-600' },
];

export function SkilledWorkerDashboard() {
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
    showToast,
  } = useApp();

  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const skill = registrationProfile?.primarySkill || 'Mason';

  // Filter invitations for skilled worker (w1)
  const pendingInvs = invitations.filter((i) => i.workerId === 'w1' && i.status === 'invited');
  const activeGoal = savingsGoalsDetailed.find((g) => g.status === 'active') || savingsGoalsDetailed[0];

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8 space-y-5 text-gray-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <ScreenHeader
          title="Skilled Craftsman Dashboard"
          subtitle="Ravi Kumar · Skilled Mason (Grade A) · Belagavi"
          showBack={false}
        />
        <button
          onClick={() => setShowRoleSwitcher(true)}
          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-bold transition-colors shadow-2xs"
        >
          Switch Persona
        </button>
      </div>

      {/* SKILLED WORKER QUARTERLY MEMBERSHIP STATUS CARD */}
      <Card className="p-4 border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                  Quarterly Skilled Portal Access
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 text-[10px] font-extrabold">
                  <CheckCircle2 size={11} /> Active (₹49/quarter)
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
                Priority matching & verified contractor contacts active · Next renewal: 31 Dec 2026
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMembershipModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 transition-colors shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <WalletCards size={14} /> Membership Details
          </button>
        </div>
      </Card>

      {/* REAL-TIME WORK INVITATION BANNER */}
      {pendingInvs.length > 0 && (
        <div className="space-y-3">
          {pendingInvs.map((inv) => (
            <Card
              key={inv.id}
              className="p-4 border-2 border-blue-500 bg-blue-50/70 dark:bg-blue-950/30 dark:border-blue-600 shadow-md animate-scale-up"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <HardHat size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-blue-200 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200">
                      ⚡ Priority Project Invitation
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{inv.duration}</span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-base">{inv.projectTitle}</h3>
                  <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5 font-medium">
                    Contractor: <span className="font-bold text-gray-900 dark:text-white">{inv.contractorName}</span>
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-300 font-bold mt-1">
                    Daily Wage Rate: ₹{inv.dailyWage}/day · Location: {inv.location}
                  </p>
                  {inv.notes && (
                    <p className="text-[11px] text-gray-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/80 p-2 rounded-lg mt-2 border border-blue-200 dark:border-blue-900/40">
                      "{inv.notes}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => {
                        respondToInvitation(inv.id, 'accepted');
                        showToast('Work order assignment accepted!');
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Check size={14} /> Accept Assignment
                    </button>
                    <button
                      onClick={() => {
                        respondToInvitation(inv.id, 'declined');
                        showToast('Assignment declined.');
                      }}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
      <Card className="p-4 border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">
              <Building2 size={15} /> Active Work Order
            </div>
            <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
              {activeAssignment?.projectTitle || 'Belagavi Highway & Flyover Expansion'}
            </h3>
            <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
              Contractor: <span className="font-bold text-gray-900 dark:text-white">{activeAssignment?.contractorName || 'Kumar Construction Services'}</span>
            </p>
            <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mt-1">
              Wage: ₹{activeAssignment?.dailyWage || 850}/day · Expected Earnings: ₹{(activeAssignment?.expectedEarnings || 25500).toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={() => setScreen('messages')}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
          >
            <MessageCircle size={14} /> Message Contractor
          </button>
        </div>
      </Card>

      {/* LIVE EARNINGS HERO CARD */}
      <Card className="overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-100 text-sm mb-1">
              <TrendingUp size={16} />
              <span>Today's Verified Earnings</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
              Live Muster Sync
            </span>
          </div>
          <div className="text-4xl font-extrabold tracking-tight mt-1">
            {formatINR(workerEarningsSummary.todayEarned)}
          </div>
          <p className="text-blue-100 text-xs mt-1">
            Directly verified against contractor's site attendance roll
          </p>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/20 text-xs">
            <div>
              <p className="text-blue-100">Month's Total Earnings</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {formatINR(workerEarningsSummary.thisMonthEarned || 17850)}
              </p>
            </div>
            <div>
              <p className="text-blue-100">Pending Contractor Payout</p>
              <p className="text-lg font-bold text-amber-300 mt-0.5">
                {formatINR(workerEarningsSummary.pendingPayout || 5100)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* SAVINGS RECOMMENDATION CARD */}
      {activeGoal && (
        <Card className="p-4 border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                <PiggyBank size={16} /> Daily Savings Guidance
              </div>
              <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">{activeGoal.title}</h3>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
                Target: ₹{activeGoal.targetAmount.toLocaleString('en-IN')} · Saved: ₹{activeGoal.currentAmount.toLocaleString('en-IN')} ({Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)}%)
              </p>
              <p className="text-xs font-extrabold text-amber-900 dark:text-amber-200 mt-1.5 bg-amber-100/80 dark:bg-amber-900/40 px-2 py-1 rounded inline-block">
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

      {/* AI CAREER STUDIO CARD */}
      <Card className="p-5 bg-gradient-to-br from-purple-50 via-white to-brand-50 dark:from-purple-950/30 dark:via-slate-900 dark:to-brand-950/20 border border-purple-100 dark:border-purple-900/40 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
            <Sparkles size={24} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">ShramaSetu Skill Studio</p>
            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">AI-Powered Career & Trade Practice</h2>
            <p className="text-xs text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">
              Prepare job profiles, practice regional terminology, and review certified safety standards for high-value tenders.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-shramasetu-ai'))}
              className="mt-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 dark:bg-brand-600 dark:hover:bg-brand-700 text-white text-xs font-bold shadow-xs hover:bg-gray-800 transition-colors"
            >
              <MessageCircle size={15} /> Open AI Trade Coach
            </button>
          </div>
        </div>
      </Card>

      {/* Learning Modules */}
      <div className="grid gap-3 sm:grid-cols-2">
        {learning.map(({ title, desc, icon: Icon, color, translator }) => (
          <Card key={title} className="p-4 border border-gray-100 dark:border-slate-800 shadow-2xs">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <h3 className="font-extrabold text-gray-900 dark:text-white text-sm mt-2">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
            <button
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent('open-shramasetu-ai', { detail: translator ? 'translator' : title })
                )
              }
              className="mt-2.5 text-xs font-bold text-brand-600 dark:text-brand-400 inline-flex items-center gap-1 hover:underline"
            >
              Practice with AI <ArrowRight size={13} />
            </button>
          </Card>
        ))}
      </div>

      {/* MEMBERSHIP DETAILS MODAL */}
      {showMembershipModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-scale-up text-gray-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Quarterly Craftsman Membership</h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Subscription ID: SHR-MEM-49Q4</p>
                </div>
              </div>
              <button
                onClick={() => setShowMembershipModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>

            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-emerald-900 dark:text-emerald-300 font-bold">Membership Status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 font-extrabold">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Quarterly Portal Fee</span>
                <span className="font-extrabold text-gray-900 dark:text-white">₹49 / Quarter</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Payment Status</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">Paid (Prototype Verified)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Current Quarter</span>
                <span className="font-bold text-gray-900 dark:text-white">Q4 2026 (Oct – Dec)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Valid Until</span>
                <span className="font-bold text-gray-900 dark:text-white">31 December 2026</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-extrabold text-gray-800 dark:text-slate-200">Included Member Benefits:</p>
              <div className="space-y-1.5 text-gray-600 dark:text-slate-300 text-[11px]">
                <p className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Priority work order invitations from verified contractors</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Automated daily muster wage verification & SMS receipts</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Full access to AI Trade Coach & Workplace Vernacular Translator</p>
                <p className="flex items-center gap-2"><CheckCircle2 size={13} className="text-emerald-500 shrink-0" /> Direct in-app contractor messaging & project chat</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => {
                  showToast('Membership renewed for Q1 2027!');
                  setShowMembershipModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors shadow-sm"
              >
                Renew for Next Quarter (₹49)
              </button>
              <button
                onClick={() => setShowMembershipModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <RoleSwitcher
        isOpen={showRoleSwitcher}
        onClose={() => setShowRoleSwitcher(false)}
        currentRole={role || 'skilledWorker'}
        onSelectRole={(nextRole) => {
          setRole(nextRole);
          setScreen('home');
        }}
      />
    </div>
  );
}
