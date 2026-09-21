import { useState } from 'react';
import { CheckCircle2, Clock, X, Briefcase, Calendar, User, Clock3, IndianRupee, PiggyBank, ArrowRight } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, formatINR, Badge } from './ui';
import type { EarningEntry } from '@/types';

export function EarningsScreen() {
  const { earnings, setScreen } = useApp();
  const [selected, setSelected] = useState<EarningEntry | null>(null);
  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
      <ScreenHeader title="Earnings" subtitle="Your wage history and payment details" />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card className="p-4 bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
          <p className="text-brand-100 text-xs font-semibold">Total This Month</p>
          <p className="text-2xl font-extrabold mt-1">₹12,600</p>
        </Card>
        <Card className="p-4">
          <p className="text-gray-400 text-xs font-semibold">Total Paid</p>
          <p className="text-2xl font-extrabold mt-1 text-gray-900">₹10,500</p>
        </Card>
      </div>

      <Card
        className="p-4 mb-5 border border-accent-100 bg-accent-50/60 cursor-pointer hover:shadow-card-hover transition-all"
        onClick={() => setScreen('savings')}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-accent-600 flex items-center justify-center"><PiggyBank size={20} /></div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">Smart Savings from Daily Earnings</p>
            <p className="text-xs text-gray-500 mt-0.5">₹0 on a low-income day · 2% on a stronger day · 3% on a very good day.</p>
            <p className="text-xs font-bold text-accent-700 mt-2 inline-flex items-center gap-1">Open Smart Savings <ArrowRight size={13} /></p>
          </div>
          <ArrowRight size={18} className="text-accent-500 shrink-0" />
        </div>
      </Card>

      {/* History */}
      <div className="space-y-3">
        {earnings.map((entry, i) => (
          <Card
            key={entry.id}
            className="p-4 animate-slide-up"
            onClick={() => setSelected(entry)}
            // style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${entry.status === 'paid' ? 'bg-accent-100 text-accent-600' : 'bg-warning-100 text-warning-600'}`}>
                  {entry.status === 'paid' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{entry.work}</p>
                  <p className="text-xs text-gray-500">{entry.date} · {entry.hoursOrDays}</p>
                </div>
              </div>
              <div className="text-right ml-2">
                <p className="font-extrabold text-gray-900">+{formatINR(entry.amount)}</p>
                {entry.status === 'paid' ? (
                  <Badge color="green">Paid</Badge>
                ) : (
                  <Badge color="yellow">Pending</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40 animate-fade-in" />
          <div
            className="relative bg-white w-full max-w-2xl rounded-t-3xl p-6 pb-8 animate-slide-up max-h-[80vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-gray-900">Payment Details</h2>
              <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className={`rounded-2xl p-5 mb-4 ${selected.status === 'paid' ? 'bg-accent-50' : 'bg-warning-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${selected.status === 'paid' ? 'text-accent-700' : 'text-warning-700'}`}>
                    {selected.status === 'paid' ? 'Payment Received' : 'Payment Pending'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{selected.date}</p>
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{formatINR(selected.amount)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <DetailRow icon={<Briefcase size={18} />} label="Work" value={selected.work} />
              <DetailRow icon={<User size={18} />} label="Employer" value={selected.employer} />
              <DetailRow icon={<Calendar size={18} />} label="Date" value={selected.date} />
              <DetailRow icon={<Clock3 size={18} />} label="Duration" value={selected.hoursOrDays} />
              <DetailRow icon={<IndianRupee size={18} />} label="Amount" value={formatINR(selected.amount)} />
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              {selected.status === 'paid' ? (
                <div className="flex items-center gap-2 text-accent-600">
                  <CheckCircle2 size={20} />
                  <span className="font-semibold">Payment completed successfully</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-warning-600">
                  <Clock size={20} />
                  <span className="font-semibold">Payment expected within 2-3 days</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-400 font-semibold">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
