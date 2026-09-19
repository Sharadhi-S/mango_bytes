import { useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  Building2,
  Check,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, Button, ProgressBar, formatINR } from './ui';
import type { SavingsGoal } from '@/types';

const goalIconMap: Record<string, typeof ShieldCheck> = {
  shield: ShieldCheck,
  heart: ShieldCheck,
  sparkles: Banknote,
  book: Building2,
};

export function SavingsScreen() {
  const { savingsGoals, saveMoney, workerStats, showToast, earnings, registrationProfile } = useApp();
  const [activeGoal, setActiveGoal] = useState<SavingsGoal | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);
  const [scanOpen, setScanOpen] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const handleSave = (amount: number) => {
    if (!activeGoal || amount <= 0) return;
    if (amount > workerStats.availableBalance) {
      showToast('Not enough available balance for this prototype action.');
      return;
    }
    saveMoney(activeGoal.id, amount);
    setSavedAmount(amount);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setActiveGoal(null);
      setCustomAmount('');
    }, 1600);
  };

  const demoName = registrationProfile?.name?.split(' ')[0] || 'Worker';
  const primaryBankBalance = Math.max(0, workerStats.availableBalance + workerStats.emergencySavings);
  const recent = earnings.slice(0, 3);

  return (
    <div className="px-5 pt-6 pb-28 max-w-2xl mx-auto">
      <ScreenHeader title="Money" subtitle={`Manage your UPI, bank accounts, earnings and savings, ${demoName}`} />

      <Card className="overflow-hidden mb-5 animate-slide-up">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-brand-100 text-sm font-semibold">
              <Wallet size={18} /> Total available balance
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/15 text-[10px] font-bold">PROTOTYPE</span>
          </div>
          <p className="text-3xl font-extrabold">{formatINR(workerStats.availableBalance)}</p>
          <p className="text-brand-100 text-xs mt-1">Available for spending, saving or transfers</p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <ActionButton icon={ArrowUpFromLine} label="Send Money" onClick={() => showToast('Send Money is a prototype action only.')} />
            <ActionButton icon={ArrowDownToLine} label="Request Money" onClick={() => showToast('Request Money is a prototype action only.')} />
          </div>
        </div>
      </Card>

      <h2 className="text-sm font-bold text-gray-700 mb-3">UPI & Payments</h2>
      <Card className="p-4 mb-5 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-accent-50 text-accent-600 flex items-center justify-center">
            <QrCode size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">UPI ID</p>
            <p className="text-xs text-gray-500 truncate">{(registrationProfile?.name || 'worker').toLowerCase().replace(/\s+/g, '.')}.demo@shramasetu</p>
          </div>
          <button
            onClick={() => showToast('UPI ID copied in prototype. No real account is connected.')}
            className="text-xs font-bold text-brand-600 px-3 py-2 rounded-xl bg-brand-50"
          >
            Copy
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setScanOpen(true)} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left hover:bg-gray-100 transition-colors">
            <ScanLine size={21} className="text-brand-600 mb-2" />
            <p className="font-bold text-gray-900 text-sm">Scan & Pay</p>
            <p className="text-[11px] text-gray-500 mt-1">Prototype QR scanner</p>
          </button>
          <button onClick={() => showToast('My QR is shown as a prototype.')} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left hover:bg-gray-100 transition-colors">
            <QrCode size={21} className="text-accent-600 mb-2" />
            <p className="font-bold text-gray-900 text-sm">My QR</p>
            <p className="text-[11px] text-gray-500 mt-1">Show payment QR</p>
          </button>
        </div>
      </Card>

      <h2 className="text-sm font-bold text-gray-700 mb-3">Bank Accounts</h2>
      <Card className="p-4 mb-5 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Building2 size={21} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900 text-sm">ShramaSetu Savings Bank</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-100 text-accent-700">Primary</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Savings account •••• 4821</p>
            <p className="text-sm font-extrabold text-gray-900 mt-2">{formatINR(primaryBankBalance)}</p>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={() => setShowBankModal(true)} className="py-2.5 rounded-xl bg-gray-50 text-gray-700 text-xs font-bold">Manage account</button>
          <button onClick={() => showToast('Add bank account is a prototype flow.')} className="py-2.5 rounded-xl bg-brand-50 text-brand-700 text-xs font-bold">+ Add bank account</button>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400">
          <LockKeyhole size={13} /> No real bank connection is used in this prototype.
        </div>
      </Card>

      <Card className="p-4 mb-5 animate-slide-up">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center"><CreditCard size={19} /></div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">Quick Money Tools</p>
            <p className="text-xs text-gray-500">Keep everyday money tasks in one place</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ToolButton label="Add money" icon={ArrowDownToLine} onClick={() => showToast('Add Money flow is prototype-only.')} />
          <ToolButton label="Transfer to bank" icon={ArrowUpFromLine} onClick={() => showToast('Bank transfer is prototype-only.')} />
          <ToolButton label="Mobile recharge" icon={Smartphone} onClick={() => showToast('Recharge is prototype-only.')} />
          <ToolButton label="Pay bills" icon={Banknote} onClick={() => showToast('Bill payment is prototype-only.')} />
        </div>
      </Card>

      <h2 className="text-sm font-bold text-gray-700 mb-3">Recent Money Activity</h2>
      <Card className="p-4 mb-5 animate-slide-up">
        <div className="space-y-3">
          {recent.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center"><ArrowDownToLine size={16} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{item.label}</p>
                <p className="text-[11px] text-gray-400">{item.date} · {item.employer}</p>
              </div>
              <span className="text-sm font-bold text-accent-600">+{formatINR(item.amount)}</span>
            </div>
          ))}
          {!recent.length && <p className="text-sm text-gray-400 text-center py-3">No activity yet.</p>}
        </div>
      </Card>

      <h2 className="text-sm font-bold text-gray-700 mb-3">Savings & Safety Net</h2>
      <Card className="overflow-hidden mb-5 animate-slide-up">
        <div className="bg-gradient-to-br from-accent-500 to-accent-600 p-5 text-white">
          <div className="flex items-center gap-2 text-accent-50 mb-1"><ShieldCheck size={18} /><span className="text-sm font-semibold">Emergency Fund</span></div>
          <div className="flex items-end justify-between">
            <div><p className="text-3xl font-extrabold">{formatINR(workerStats.emergencySavings)}</p><p className="text-accent-50 text-sm mt-1">of ₹5,000 goal</p></div>
            <p className="text-2xl font-bold">{Math.round((workerStats.emergencySavings / 5000) * 100)}%</p>
          </div>
          <div className="mt-3 h-2.5 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (workerStats.emergencySavings / 5000) * 100)}%` }} /></div>
        </div>
      </Card>

      <div className="space-y-3 mb-4">
        {savingsGoals.map((goal) => {
          const Icon = goalIconMap[goal.icon] || ShieldCheck;
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const colorClasses: Record<string, { bg: string; bar: string; text: string }> = {
            brand: { bg: 'bg-brand-50', bar: 'bg-brand-500', text: 'text-brand-600' },
            accent: { bg: 'bg-accent-50', bar: 'bg-accent-500', text: 'text-accent-600' },
            warning: { bg: 'bg-warning-50', bar: 'bg-warning-500', text: 'text-warning-600' },
          };
          const c = colorClasses[goal.color] || colorClasses.brand;
          return (
            <Card key={goal.id} className="p-4 animate-slide-up">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${c.bg} ${c.text}`}><Icon size={21} /></div>
                <div className="flex-1"><p className="font-bold text-gray-900">{goal.name}</p><p className="text-xs text-gray-500">{formatINR(goal.current)} of {formatINR(goal.target)}</p></div>
                <span className={`text-sm font-bold ${c.text}`}>{pct}%</span>
              </div>
              <ProgressBar value={goal.current} max={goal.target} colorClass={c.bar} />
              <button onClick={() => setActiveGoal(goal)} className={`mt-3 w-full py-2.5 rounded-xl text-sm font-semibold ${c.bg} ${c.text} hover:opacity-80 active:scale-[0.98] transition-all`}>Add money</button>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 mb-5 border border-warning-100 bg-warning-50/60">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-warning-600 flex items-center justify-center"><ShieldCheck size={19} /></div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Protection & yearly dues</p>
            <p className="text-xs text-gray-600 mt-1">Your insurance page can show yearly premiums and renewal reminders separately from your everyday money.</p>
          </div>
        </div>
      </Card>

      <p className="text-[11px] text-gray-400 text-center mb-2">Prototype finance hub — no real UPI, bank, recharge, bill or money transfer is executed.</p>

      {activeGoal && !showSuccess && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setActiveGoal(null)}>
          <div className="absolute inset-0 bg-black/40 animate-fade-in" />
          <div className="relative bg-white w-full max-w-2xl rounded-t-3xl p-6 pb-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5"><div><h2 className="text-lg font-extrabold text-gray-900">Save Money</h2><p className="text-sm text-gray-500">Add to {activeGoal.name}</p></div><button onClick={() => setActiveGoal(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><X size={20} /></button></div>
            <p className="text-sm text-gray-500 mb-3">Choose an amount to save from your available balance ({formatINR(workerStats.availableBalance)})</p>
            <div className="grid grid-cols-3 gap-3 mb-4">{[20, 50, 100].map((amt) => <button key={amt} onClick={() => handleSave(amt)} className="py-5 rounded-2xl bg-brand-50 text-brand-700 font-bold text-lg">₹{amt}</button>)}</div>
            <div className="flex gap-2"><input type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder="Custom amount" className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-400 outline-none text-sm font-semibold text-gray-900" /><Button onClick={() => handleSave(Number(customAmount))} disabled={!customAmount || Number(customAmount) <= 0}>Save</Button></div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6"><div className="absolute inset-0 bg-black/40" /><div className="relative bg-white rounded-3xl p-8 text-center max-w-xs w-full"><div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-accent-600" /></div><h2 className="text-lg font-extrabold text-gray-900">Saved!</h2><p className="text-sm text-gray-500 mt-1">₹{savedAmount} added to your goal.</p></div></div>
      )}

      {scanOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/60" onClick={() => setScanOpen(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-extrabold text-gray-900">Scan UPI QR</h2><p className="text-xs text-gray-500 mt-1">Camera scanner preview for the prototype</p></div><button onClick={() => setScanOpen(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><X size={19} /></button></div>
            <div className="aspect-square rounded-3xl bg-gray-900 flex items-center justify-center p-8 relative overflow-hidden">
              <div className="w-full h-full border-2 border-white/80 rounded-2xl flex items-center justify-center"><div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center"><QrCode size={72} className="text-gray-900" /></div></div>
              <div className="absolute left-8 right-8 top-1/2 h-0.5 bg-brand-400 animate-pulse" />
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">No camera or payment is connected. This screen demonstrates the intended user flow.</p>
            <Button className="w-full mt-4" onClick={() => { setScanOpen(false); showToast('QR detected in prototype. No payment was made.'); }}>Simulate QR detected</Button>
          </div>
        </div>
      )}

      {showBankModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBankModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4"><div><h2 className="text-lg font-extrabold text-gray-900">Manage bank account</h2><p className="text-xs text-gray-500 mt-1">Prototype account controls</p></div><button onClick={() => setShowBankModal(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><X size={19} /></button></div>
            <div className="rounded-2xl bg-gray-50 p-4"><p className="text-xs font-semibold text-gray-400">Account</p><p className="font-bold text-gray-900 mt-1">Savings Bank •••• 4821</p><p className="text-sm font-extrabold text-gray-900 mt-3">{formatINR(primaryBankBalance)}</p></div>
            <div className="space-y-2 mt-4"><button onClick={() => showToast('Primary account setting updated in prototype.')} className="w-full p-3 rounded-xl bg-gray-50 text-left text-sm font-semibold">Set as primary</button><button onClick={() => showToast('Bank statement preview opened in prototype.')} className="w-full p-3 rounded-xl bg-gray-50 text-left text-sm font-semibold">View statement</button><button onClick={() => { setShowBankModal(false); showToast('Remove account is disabled in this prototype.'); }} className="w-full p-3 rounded-xl bg-error-50 text-error-700 text-left text-sm font-semibold">Remove account</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: typeof ArrowUpFromLine; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="p-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-left flex items-center gap-2"><Icon size={17} /><span className="text-xs font-bold">{label}</span></button>;
}

function ToolButton({ icon: Icon, label, onClick }: { icon: typeof ArrowUpFromLine; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center gap-2 text-left"><Icon size={17} className="text-brand-600" /><span className="text-xs font-semibold text-gray-700">{label}</span></button>;
}
