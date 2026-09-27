import { useState } from 'react';
import { CheckCircle2, X, Briefcase, Calendar, User, Clock3, IndianRupee, PiggyBank, ShieldCheck, Wallet, ArrowUpFromLine } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, formatINR, Badge } from './ui';
import type { EarningEntry } from '@/types';

export function EarningsScreen() {
  const { earnings, role, registrationProfile, workerStats, withdrawSavings, showToast } = useApp();
  const [selected, setSelected] = useState<EarningEntry | null>(null);
  const isSkilledWorker = role === 'skilledWorker' || registrationProfile?.category === 'skilledWorker';
  const monthlySalary = registrationProfile?.monthlyIncome || 24000;
  const [savingsRate, setSavingsRate] = useState(registrationProfile?.savingsRate ?? 2);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');

  const skilledSalaryEntry: EarningEntry = {
    id: 'skilled-monthly-salary', date: 'September 2026', label: 'Monthly salary',
    employer: registrationProfile?.company || 'Employer', work: `${registrationProfile?.primarySkill || 'Skilled Worker'} — Monthly Salary`,
    hoursOrDays: 'Monthly salary', amount: monthlySalary, status: 'paid'
  };
  const visibleEarnings = isSkilledWorker ? [skilledSalaryEntry] : earnings;
  const monthlySaving = Math.round(monthlySalary * savingsRate / 100);
  const savingsBalance = workerStats.emergencySavings;

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast('Enter a valid amount.');
      return;
    }
    if (!withdrawReason.trim()) {
      showToast('Please enter a valid reason for taking the money.');
      return;
    }
    if (amount > savingsBalance) {
      showToast('Amount is higher than your available savings.');
      return;
    }
    if (withdrawSavings(amount, withdrawReason)) {
      setWithdrawOpen(false);
      setWithdrawAmount('');
      setWithdrawReason('');
      showToast(`${formatINR(amount)} moved from savings to your available balance.`);
    }
  };

  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
      <ScreenHeader title="Earnings" subtitle={isSkilledWorker ? 'Monthly salary and flexible Smart Savings' : 'Your wage history and payment details'} />

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card className="p-4 bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
          <p className="text-brand-100 text-xs font-semibold">{isSkilledWorker ? 'Monthly Salary' : 'Total This Month'}</p>
          <p className="text-2xl font-extrabold mt-1">{formatINR(isSkilledWorker ? monthlySalary : 12600)}</p>
          {isSkilledWorker && <p className="text-[10px] text-brand-100 mt-1">Paid monthly</p>}
        </Card>
        <Card className="p-4">
          <p className="text-gray-400 text-xs font-semibold">Savings Balance</p>
          <p className="text-2xl font-extrabold mt-1 text-gray-900">{formatINR(savingsBalance)}</p>
          <p className="text-[10px] text-gray-500 mt-1">Available to take when needed</p>
        </Card>
      </div>

      {isSkilledWorker && (
        <>
          <Card className="p-5 mb-4 border border-accent-100 bg-accent-50/60">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-accent-600 flex items-center justify-center shrink-0"><PiggyBank size={20} /></div>
              <div className="flex-1">
                <p className="font-extrabold text-gray-900 text-sm">Smart Savings from Monthly Salary</p>
                <p className="text-xs text-gray-500 mt-1">Choose the percentage of your monthly salary that goes into savings.</p>
                <div className="flex items-center gap-2 mt-4">
                  {[1, 2, 3, 5].map((rate) => (
                    <button key={rate} onClick={() => setSavingsRate(rate)} className={`px-3 py-2 rounded-xl text-sm font-extrabold ${savingsRate === rate ? 'bg-accent-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>{rate}%</button>
                  ))}
                  <div className="flex items-center rounded-xl bg-white border border-gray-200 overflow-hidden ml-auto">
                    <input aria-label="Custom savings percentage" type="number" min="0" max="50" value={savingsRate} onChange={(e) => setSavingsRate(Math.min(50, Math.max(0, Number(e.target.value))))} className="w-16 px-2 py-2 text-sm font-bold text-center outline-none" />
                    <span className="pr-2 font-bold text-gray-500">%</span>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-white px-3 py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Monthly automatic saving</span>
                  <span className="font-extrabold text-accent-700">{formatINR(monthlySaving)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 mb-5 border border-brand-100 bg-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0"><Wallet size={20} /></div>
              <div className="flex-1">
                <p className="font-extrabold text-gray-900 text-sm">Quick Money from Savings</p>
                <p className="text-xs text-gray-500 mt-1">Take money from your savings whenever you need it. A valid reason is required for every withdrawal.</p>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 p-3">
                  <div><p className="text-[11px] text-gray-400 font-semibold">Available savings</p><p className="font-extrabold text-gray-900">{formatINR(savingsBalance)}</p></div>
                  <button onClick={() => setWithdrawOpen(true)} disabled={savingsBalance <= 0} className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-extrabold disabled:opacity-40 flex items-center gap-2"><ArrowUpFromLine size={16} /> Take Money</button>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {!isSkilledWorker && (
        <Card className="p-4 mb-5 border border-accent-100 bg-accent-50/60">
          <div className="flex items-center gap-3"><PiggyBank size={20} className="text-accent-600" /><div><p className="font-bold text-gray-900 text-sm">Smart Savings</p><p className="text-xs text-gray-500 mt-0.5">Your savings tools are available in the Money section.</p></div></div>
        </Card>
      )}

      <div className="space-y-3">
        {visibleEarnings.map((entry) => (
          <Card key={entry.id} className="p-4 animate-slide-up" onClick={() => setSelected(entry)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-accent-100 text-accent-600"><CheckCircle2 size={20} /></div>
                <div className="min-w-0"><p className="font-bold text-gray-900 truncate">{entry.work}</p><p className="text-xs text-gray-500">{entry.date} · {entry.hoursOrDays}</p></div>
              </div>
              <div className="text-right ml-2"><p className="font-extrabold text-gray-900">+{formatINR(entry.amount)}</p><Badge color="green">Paid</Badge></div>
            </div>
          </Card>
        ))}
      </div>

      {withdrawOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setWithdrawOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <Card className="relative w-full max-w-md p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><div><h2 className="font-extrabold text-gray-900">Take Money from Savings</h2><p className="text-xs text-gray-500 mt-1">Available: {formatINR(savingsBalance)}</p></div><button onClick={() => setWithdrawOpen(false)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"><X size={18} /></button></div>
            <label className="text-xs font-bold text-gray-600">Amount</label>
            <input type="number" min="1" max={savingsBalance} value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Enter amount" className="w-full mt-1 mb-4 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-brand-400" />
            <label className="text-xs font-bold text-gray-600">Why are you taking the money?</label>
            <textarea value={withdrawReason} onChange={(e) => setWithdrawReason(e.target.value)} placeholder="Example: Medical emergency, family need, urgent travel..." rows={3} className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-brand-400 resize-none" />
            <p className="text-[11px] text-gray-400 mt-2">Please provide a genuine reason before confirming the withdrawal.</p>
            <button onClick={handleWithdraw} className="w-full mt-4 py-3 rounded-xl bg-brand-600 text-white font-extrabold">Confirm & Take Money</button>
          </Card>
        </div>
      )}

      {selected && <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSelected(null)}>
        <div className="absolute inset-0 bg-black/40 animate-fade-in" />
        <div className="relative bg-white w-full max-w-2xl rounded-t-3xl p-6 pb-8 animate-slide-up max-h-[80vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-extrabold text-gray-900">Payment Details</h2><button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><X size={20} /></button></div>
          <div className="rounded-2xl p-5 mb-4 bg-accent-50"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-accent-700">Payment Received</p><p className="text-xs text-gray-500 mt-0.5">{selected.date}</p></div><p className="text-3xl font-extrabold text-gray-900">{formatINR(selected.amount)}</p></div></div>
          <div className="space-y-4"><DetailRow icon={<Briefcase size={18} />} label="Work" value={selected.work} /><DetailRow icon={<User size={18} />} label="Employer" value={selected.employer} /><DetailRow icon={<Calendar size={18} />} label="Pay period" value={selected.date} /><DetailRow icon={<Clock3 size={18} />} label="Payment type" value={selected.hoursOrDays} /><DetailRow icon={<IndianRupee size={18} />} label="Amount" value={formatINR(selected.amount)} /></div>
          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-2 text-accent-600"><CheckCircle2 size={20} /><span className="font-semibold">Monthly salary payment recorded successfully</span></div>
        </div>
      </div>}
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">{icon}</div><div className="flex-1"><p className="text-xs text-gray-400 font-semibold">{label}</p><p className="text-sm font-semibold text-gray-900">{value}</p></div></div>;
}
