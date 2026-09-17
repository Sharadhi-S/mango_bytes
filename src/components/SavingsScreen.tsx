import { useState } from 'react';
import { Shield, Heart, Sparkles, BookOpen, Check, X } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, Button, ProgressBar, formatINR } from './ui';
import type { SavingsGoal } from '@/types';

const iconMap: Record<string, typeof Shield> = {
  shield: Shield,
  heart: Heart,
  sparkles: Sparkles,
  book: BookOpen,
};

export function SavingsScreen() {
  const { savingsGoals, saveMoney, workerStats, t } = useApp();
  const [activeGoal, setActiveGoal] = useState<SavingsGoal | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [autoSavePercent, setAutoSavePercent] = useState(15);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);

  const handleSave = (amount: number) => {
    if (!activeGoal || amount <= 0) return;
    saveMoney(activeGoal.id, amount);
    setSavedAmount(amount);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setActiveGoal(null);
      setCustomAmount('');
    }, 2000);
  };

  const presetAmounts = [20, 50, 100];

  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
      <ScreenHeader title={t('savingsTitle')} subtitle={t('savingsSubtitle')} />

      <Card className="p-4 mb-5 animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-400">{t('automaticSavings')}</p>
            <h2 className="text-lg font-extrabold text-gray-900">{autoSavePercent}% of every wage</h2>
          </div>
          <div className="rounded-full bg-accent-50 px-2 py-1 text-xs font-bold text-accent-600">Demo setting</div>
        </div>
        <input
          type="range"
          min={5}
          max={40}
          step={5}
          value={autoSavePercent}
          onChange={(e) => setAutoSavePercent(Number(e.target.value))}
          className="w-full accent-brand-600"
        />
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>5%</span>
          <span>20%</span>
          <span>40%</span>
        </div>
        <Button variant="secondary" className="w-full mt-4" onClick={() => handleSave(Math.max(20, Math.round(workerStats.availableBalance * (autoSavePercent / 100))))}>
          {t('saveNow')}
        </Button>
      </Card>

      {/* Emergency Fund Highlight */}
      <Card className="overflow-hidden mb-5 animate-slide-up">
        <div className="bg-gradient-to-br from-accent-500 to-accent-600 p-5 text-white">
          <div className="flex items-center gap-2 text-accent-50 mb-1">
            <Shield size={18} />
            <span className="text-sm font-semibold">{t('emergencyFundTitle')}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-extrabold">{formatINR(workerStats.emergencySavings)}</p>
              <p className="text-accent-50 text-sm mt-1">{t('ofGoal')}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{Math.round((workerStats.emergencySavings / 5000) * 100)}%</p>
            </div>
          </div>
          <div className="mt-3 h-2.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${(workerStats.emergencySavings / 5000) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Available Balance */}
      <Card className="p-4 mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-semibold">{t('availableToSave')}</p>
          <p className="text-xl font-extrabold text-gray-900">{formatINR(workerStats.availableBalance)}</p>
        </div>
        <Button size="sm" variant="success" onClick={() => setActiveGoal(savingsGoals[0])}>
          {t('saveFromEarnings')}
        </Button>
      </Card>

      {/* Savings Goals */}
      <h2 className="text-sm font-bold text-gray-700 mb-3">{t('yourGoals')}</h2>
      <div className="space-y-3 mb-4">
        {savingsGoals.map((goal) => {
          const Icon = iconMap[goal.icon] || Shield;
          const pct = Math.round((goal.current / goal.target) * 100);
          const colorClasses: Record<string, { bg: string; bar: string; text: string }> = {
            brand: { bg: 'bg-brand-50', bar: 'bg-brand-500', text: 'text-brand-600' },
            accent: { bg: 'bg-accent-50', bar: 'bg-accent-500', text: 'text-accent-600' },
            warning: { bg: 'bg-warning-50', bar: 'bg-warning-500', text: 'text-warning-600' },
          };
          const c = colorClasses[goal.color] || colorClasses.brand;
          return (
            <Card key={goal.id} className="p-4 animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg} ${c.text}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{goal.name}</p>
                  <p className="text-xs text-gray-500">{formatINR(goal.current)} of {formatINR(goal.target)}</p>
                </div>
                <span className={`text-sm font-bold ${c.text}`}>{pct}%</span>
              </div>
              <ProgressBar value={goal.current} max={goal.target} colorClass={c.bar} />
              <button
                onClick={() => setActiveGoal(goal)}
                className={`mt-3 w-full py-2.5 rounded-xl text-sm font-semibold ${c.bg} ${c.text} hover:opacity-80 active:scale-[0.98] transition-all`}
              >
                {t('addMoney')}
              </button>
            </Card>
          );
        })}
      </div>

      {/* Save Modal */}
      {activeGoal && !showSuccess && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setActiveGoal(null)}>
          <div className="absolute inset-0 bg-black/40 animate-fade-in" />
          <div
            className="relative bg-white w-full max-w-2xl rounded-t-3xl p-6 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">{t('saveMoneyTitle')}</h2>
                <p className="text-sm text-gray-500">{t('addTo')} {activeGoal.name}</p>
              </div>
              <button onClick={() => setActiveGoal(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-3">{t('chooseAmount')} ({formatINR(workerStats.availableBalance)})</p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleSave(amt)}
                  className="py-5 rounded-2xl bg-brand-50 text-brand-700 font-bold text-lg hover:bg-brand-100 active:scale-95 transition-all"
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={t('customAmount')}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-400 outline-none text-sm font-semibold text-gray-900"
              />
              <Button onClick={() => handleSave(Number(customAmount))} disabled={!customAmount || Number(customAmount) <= 0}>
                Save
              </Button>
            </div>

            <p className="text-xs text-gray-400 text-center">{t('withdrawAnytime')}</p>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" />
          <div className="relative bg-white rounded-3xl p-8 text-center animate-scale-in max-w-xs w-full">
            <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-accent-600" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900">{t('saved')}</h2>
            <p className="text-sm text-gray-500 mt-1">₹{savedAmount} {t('savedTo')} {activeGoal?.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
