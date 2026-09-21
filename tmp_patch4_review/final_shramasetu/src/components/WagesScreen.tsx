import { Check, Clock, IndianRupee, AlertCircle } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, Badge, Button, formatINR } from './ui';

export function WagesScreen() {
  const { wages, markWagePaid } = useApp();

  const totalPaid = wages.filter((w) => w.status === 'paid').reduce((s, w) => s + w.totalEarned, 0);
  const totalPending = wages.filter((w) => w.status === 'pending').reduce((s, w) => s + w.totalEarned, 0);

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
      <ScreenHeader title="Wage Management" subtitle="Track and pay worker wages" />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <Card className="p-4 bg-gradient-to-br from-accent-500 to-accent-600 text-white border-0">
          <div className="flex items-center gap-2 text-accent-50 mb-1">
            <Check size={16} />
            <span className="text-xs font-semibold">Total Paid</span>
          </div>
          <p className="text-2xl font-extrabold">{formatINR(totalPaid)}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-warning-500 to-warning-600 text-white border-0">
          <div className="flex items-center gap-2 text-warning-50 mb-1">
            <Clock size={16} />
            <span className="text-xs font-semibold">Pending Payment</span>
          </div>
          <p className="text-2xl font-extrabold">{formatINR(totalPending)}</p>
        </Card>
      </div>

      {/* Wages List */}
      <div className="space-y-3">
        {wages.map((wage) => (
          <Card key={wage.id} className="p-4 animate-slide-up">
            {/* Mobile: Card layout, Desktop: Row layout */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${wage.status === 'paid' ? 'bg-accent-100 text-accent-700' : 'bg-warning-100 text-warning-700'}`}>
                  {wage.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{wage.name}</p>
                  <p className="text-xs text-gray-500">{wage.daysWorked} days · {formatINR(wage.dailyWage)}/day</p>
                </div>
              </div>
              <div className="text-right ml-2 flex-shrink-0">
                <p className="font-extrabold text-gray-900">{formatINR(wage.totalEarned)}</p>
                {wage.status === 'paid' ? (
                  <Badge color="green"><Check size={12} /> Paid</Badge>
                ) : (
                  <Badge color="yellow"><Clock size={12} /> Pending</Badge>
                )}
              </div>
            </div>

            {/* Desktop table row details */}
            <div className="hidden md:flex items-center justify-between border-t border-gray-50 pt-3 text-sm text-gray-500">
              <span>Worker</span>
              <span>Days</span>
              <span>Daily Wage</span>
              <span>Total</span>
              <span>Status</span>
            </div>

            {wage.status === 'pending' ? (
              <Button variant="success" size="sm" className="w-full mt-3" onClick={() => markWagePaid(wage.id)}>
                <IndianRupee size={16} className="mr-1" /> Mark as Paid
              </Button>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-xs text-accent-600 font-semibold py-2.5 px-3 bg-accent-50 rounded-xl">
                <Check size={16} /> Payment completed
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Info banner */}
      <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-brand-50 text-brand-700">
        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium">
          This is a demo prototype. No real payments are processed. All data is mock for demonstration.
        </p>
      </div>
    </div>
  );
}
