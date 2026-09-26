import { useState, useMemo } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  Building2,
  Check,
  ChevronRight,
  CreditCard,
  QrCode,
  ShieldCheck,
  Wallet,
  PiggyBank,
  Sparkles,
  Target,
  Landmark,
  Lightbulb,
  X,
  Plus,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, Button, ProgressBar, formatINR } from './ui';
import type { SavingsGoalDetail } from '@/types';
import { calculateDynamicSavingsRate } from '@/utils/dynamicSavings';

export function SavingsScreen() {
  const {
    savingsGoalsDetailed,
    createSavingsGoalDetailed,
    addSavingsContributionDetailed,
    workerStats,
    showToast,
    earnings,
    registrationProfile,
    role,
  } = useApp();

  const [activeGoal, setActiveGoal] = useState<SavingsGoalDetail | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);
  const [scanOpen, setScanOpen] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showMyQR, setShowMyQR] = useState(false);

  // Create Goal Modal
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('10000');
  const [newGoalDays, setNewGoalDays] = useState('60');

  // Computed preview for new goal
  const newGoalPreview = useMemo(() => {
    const target = Number(newGoalAmount) || 0;
    const days = Math.max(1, Number(newGoalDays) || 1);
    const daily = Math.ceil(target / days);
    return { target, days, daily };
  }, [newGoalAmount, newGoalDays]);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || Number(newGoalAmount) <= 0) {
      showToast('Please enter a goal title and valid target amount.');
      return;
    }

    const d = new Date();
    d.setDate(d.getDate() + Number(newGoalDays || 60));
    const targetDate = d.toISOString().split('T')[0];

    createSavingsGoalDetailed({
      workerId: role === 'labourer' ? 'w2' : 'w1',
      title: newGoalTitle.trim(),
      targetAmount: Number(newGoalAmount),
      currentAmount: 0,
      targetDate,
      category: 'General',
      icon: 'Target',
    });

    setShowCreateGoalModal(false);
    setNewGoalTitle('');
    setNewGoalAmount('10000');
    setNewGoalDays('60');
  };

  const handleSave = (amount: number) => {
    if (!activeGoal || amount <= 0) return;
    addSavingsContributionDetailed(activeGoal.id, amount);
    setSavedAmount(amount);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setActiveGoal(null);
      setCustomAmount('');
    }, 1500);
  };

  const demoName = registrationProfile?.name?.split(' ')[0] || (role === 'labourer' ? 'Suresh' : 'Ravi');
  const primaryBankBalance = Math.max(0, workerStats.availableBalance + workerStats.emergencySavings);
  const todayEarnings = earnings.find((item) => item.date === 'Today')?.amount ?? 850;

  const defaultConditions = {
    market: todayEarnings >= 1500 ? 0.85 : todayEarnings >= 900 ? 0.7 : todayEarnings >= 500 ? 0.55 : 0.3,
    weather: 0.72,
    safety: 0.88,
    productivity: todayEarnings >= 1500 ? 0.84 : todayEarnings >= 900 ? 0.7 : todayEarnings >= 500 ? 0.58 : 0.4,
  };
  const [marketScenario, setMarketScenario] = useState(defaultConditions.market);
  const [weatherScenario, setWeatherScenario] = useState(defaultConditions.weather);
  const [safetyScenario, setSafetyScenario] = useState(defaultConditions.safety);
  const [productivityScenario, setProductivityScenario] = useState(defaultConditions.productivity);

  const dailyConditions = {
    market: marketScenario,
    weather: weatherScenario,
    safety: safetyScenario,
    productivity: productivityScenario,
  };
  const dynamicSavings = calculateDynamicSavingsRate(dailyConditions);
  const smartSavingsRate = dynamicSavings.rate;
  const smartSavingsAmount = Math.round(todayEarnings * smartSavingsRate);

  return (
    <div className="px-5 pt-6 pb-28 max-w-2xl mx-auto space-y-5">
      <ScreenHeader
        title="Savings & Goals"
        subtitle={`Daily savings plan, goals & payments · ${demoName}`}
      />

      {/* Balance Card */}
      <Card className="overflow-hidden shadow-sm animate-slide-up">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-brand-100 text-sm font-semibold">
              <Wallet size={18} /> Available Balance
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold">PROTOTYPE</span>
          </div>
          <p className="text-3xl font-extrabold">{formatINR(workerStats.availableBalance || 18500)}</p>
          <p className="text-brand-100 text-xs mt-1">Available for savings contributions or simulated UPI transfers</p>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/20 text-xs">
            <button
              onClick={() => setShowBankModal(true)}
              className="py-2 px-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-center transition-colors"
            >
              Bank Account (••• 4821)
            </button>
            <button
              onClick={() => setShowMyQR(true)}
              className="py-2 px-3 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-center transition-colors"
            >
              My UPI QR
            </button>
          </div>
        </div>
      </Card>

      {/* SAVINGS GOALS HEADER & CREATE BUTTON */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-base font-extrabold text-gray-900">Active Savings Goals</h2>
          <p className="text-xs text-gray-500">Mathematical daily targets based on your project schedule</p>
        </div>
        <button
          onClick={() => setShowCreateGoalModal(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Plus size={15} /> New Goal
        </button>
      </div>

      {/* DETAILED SAVINGS GOALS LIST */}
      <div className="space-y-3">
        {savingsGoalsDetailed.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
          const isDone = goal.status === 'completed';

          return (
            <Card
              key={goal.id}
              className={`p-4 border transition-all ${
                isDone
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-gray-200 hover:border-brand-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-50 text-brand-600'
                    }`}
                  >
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm">{goal.title}</h3>
                    <p className="text-xs text-gray-500">
                      {formatINR(goal.currentAmount)} of {formatINR(goal.targetAmount)} ({pct}%)
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {isDone ? '✓ Completed' : `${goal.daysRemaining} days left`}
                </span>
              </div>

              <div className="my-2.5">
                <ProgressBar
                  value={goal.currentAmount}
                  max={goal.targetAmount}
                  colorClass={isDone ? 'bg-emerald-500' : 'bg-brand-500'}
                />
              </div>

              {!isDone ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-brand-700 font-semibold">
                    <Lightbulb size={14} className="text-amber-500 shrink-0" />
                    <span>
                      Recommended: <strong className="text-gray-900">₹{goal.recommendedDailyAmount}/day</strong> for{' '}
                      {goal.daysRemaining} days
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveGoal(goal)}
                    className="px-4 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold active:scale-95 transition-all self-end sm:self-auto"
                  >
                    Add Contribution
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-1 border-t border-gray-100">
                  <Check size={14} /> Goal accomplished! Funds ready for disbursement.
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* DYNAMIC SMART SAVINGS CARD */}
      <Card className="p-5 border border-brand-100 bg-brand-50/60 animate-slide-up shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-brand-600 flex items-center justify-center shrink-0">
            <PiggyBank size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-extrabold text-gray-900 text-sm">Dynamic condition-based micro-saving</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Algorithmically balances market demand, weather, and current wage rate
                </p>
              </div>
              <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-extrabold">
                {(smartSavingsRate * 100).toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-3">
              <div className="rounded-xl bg-white p-2.5">
                <p className="text-[10px] text-gray-400 font-semibold">Today's verified wage</p>
                <p className="text-base font-extrabold text-gray-900 mt-0.5">{formatINR(todayEarnings)}</p>
              </div>
              <div className="rounded-xl bg-white p-2.5">
                <p className="text-[10px] text-gray-400 font-semibold">Suggested auto-save</p>
                <p className="text-base font-extrabold text-emerald-600 mt-0.5">{formatINR(smartSavingsAmount)}</p>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
              <Sparkles size={15} className="text-brand-600 shrink-0 mt-0.5" />
              <p>
                {dynamicSavings.label}: {dynamicSavings.note}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* CREATE GOAL MODAL */}
      {showCreateGoalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowCreateGoalModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Create New Savings Goal</h2>
                <p className="text-xs text-gray-500">Plan ahead with automated daily targets</p>
              </div>
              <button
                onClick={() => setShowCreateGoalModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Goal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festival Trip, Tools Purchase, Emergency"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="500"
                    step="500"
                    value={newGoalAmount}
                    onChange={(e) => setNewGoalAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Timeline (Days) *</label>
                  <input
                    type="number"
                    required
                    min="7"
                    max="365"
                    value={newGoalDays}
                    onChange={(e) => setNewGoalDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                  <Lightbulb size={15} /> Mathematical Recommendation
                </div>
                <p className="text-gray-700">
                  To save <strong>₹{newGoalPreview.target.toLocaleString('en-IN')}</strong> in{' '}
                  <strong>{newGoalPreview.days} days</strong>:
                </p>
                <p className="text-base font-extrabold text-amber-800 mt-1">
                  Save ₹{newGoalPreview.daily.toLocaleString('en-IN')}/day
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm active:scale-95 transition-all"
              >
                Create Goal & Start Saving
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONTRIBUTION MODAL */}
      {activeGoal && !showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setActiveGoal(null)}
        >
          <div className="absolute inset-0 bg-black/40 animate-fade-in" />
          <div
            className="relative bg-white w-full max-w-2xl rounded-t-3xl p-6 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Add Contribution</h2>
                <p className="text-sm text-gray-500">{activeGoal.title}</p>
              </div>
              <button
                onClick={() => setActiveGoal(null)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Recommended daily amount: <strong>₹{activeGoal.recommendedDailyAmount}</strong> ({activeGoal.daysRemaining} days remaining)
            </p>

            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {[50, 100, activeGoal.recommendedDailyAmount].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleSave(amt)}
                  className="py-3.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-base transition-colors"
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Custom amount (₹)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 outline-none text-sm font-semibold text-gray-900"
              />
              <Button
                onClick={() => handleSave(Number(customAmount))}
                disabled={!customAmount || Number(customAmount) <= 0}
              >
                Contribute
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-3xl p-6 text-center max-w-xs w-full shadow-2xl animate-scale-up">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <Check size={28} />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900">Saved Successfully!</h2>
            <p className="text-xs text-gray-500 mt-1">₹{savedAmount} added to your goal.</p>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showMyQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMyQR(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center">
            <div className="flex items-center justify-between mb-4 text-left">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">My UPI QR</h2>
                <p className="text-xs text-gray-500 mt-0.5">Direct worker payout identifier</p>
              </div>
              <button
                onClick={() => setShowMyQR(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={19} />
              </button>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-4 inline-flex">
              <div className="w-52 h-52 bg-slate-900 rounded-xl flex items-center justify-center p-4">
                <QrCode size={160} className="text-white" />
              </div>
            </div>
            <p className="font-bold text-gray-900 text-sm mt-3">{demoName} · UPI ID: {demoName.toLowerCase()}@shramasetu</p>
            <p className="text-xs text-gray-400 mt-0.5">Demo QR — no actual transaction is executed.</p>
          </div>
        </div>
      )}

      {/* BANK MODAL */}
      {showBankModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBankModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Direct Benefit Account</h2>
                <p className="text-xs text-gray-500">Linked Jan Dhan / Savings Bank</p>
              </div>
              <button
                onClick={() => setShowBankModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-400">Bank & IFSC</p>
              <p className="font-bold text-gray-900 mt-0.5">State Bank of India (Belagavi Main)</p>
              <p className="text-xs text-gray-500 mt-0.5">SBIN0000812 · A/C •••• 4821</p>
              <div className="mt-3 pt-3 border-t border-gray-200/60 flex justify-between items-center">
                <span className="text-xs text-gray-500">Verified Status</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Aadhaar Linked
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowBankModal(false);
                showToast('Prototype: Bank statement requested.');
              }}
              className="w-full mt-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors"
            >
              View Passbook Mini-Statement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
