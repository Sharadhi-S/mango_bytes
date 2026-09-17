import { Check, X, Clock } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, Badge, formatINR } from './ui';
import type { AttendanceRow } from '@/types';

const statusConfig = {
  present: { label: 'Present', color: 'green' as const, bg: 'bg-accent-500', text: 'text-white' },
  absent: { label: 'Absent', color: 'red' as const, bg: 'bg-error-500', text: 'text-white' },
  half: { label: 'Half Day', color: 'yellow' as const, bg: 'bg-warning-500', text: 'text-white' },
};

export function AttendanceScreen() {
  const { attendance, setAttendanceStatus, t } = useApp();

  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const absentCount = attendance.filter((a) => a.status === 'absent').length;
  const halfCount = attendance.filter((a) => a.status === 'half').length;
  const totalWage = attendance.reduce((s, a) => s + (a.status === 'present' ? a.dailyWage : a.status === 'half' ? a.dailyWage / 2 : 0), 0);

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
      <ScreenHeader title={t('attendanceTitle')} subtitle={t('attendanceSubtitle')} />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        <Card className="p-3 text-center">
          <p className="text-lg font-extrabold text-accent-600">{presentCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t('present')}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-extrabold text-warning-600">{halfCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t('halfDay')}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-extrabold text-error-600">{absentCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t('absent')}</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-extrabold text-gray-900">{formatINR(Math.round(totalWage))}</p>
          <p className="text-xs text-gray-400 mt-0.5">{t('todaysWages')}</p>
        </Card>
      </div>

      {/* Attendance List */}
      <div className="space-y-3">
        {attendance.map((row) => (
          <AttendanceCard key={row.id} row={row} onStatusChange={(s) => setAttendanceStatus(row.id, s)} />
        ))}
      </div>
    </div>
  );
}

function AttendanceCard({ row, onStatusChange }: { row: AttendanceRow; onStatusChange: (s: 'present' | 'absent' | 'half') => void }) {
  const cfg = statusConfig[row.status];
  const earnedWage = row.status === 'present' ? row.dailyWage : row.status === 'half' ? row.dailyWage / 2 : 0;

  return (
    <Card className="p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-2 h-10 rounded-full ${cfg.bg}`} />
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{row.name}</p>
            <p className="text-xs text-gray-500">{row.job} · {row.status === 'absent' ? '0 hrs' : `${row.hours} hrs`}</p>
          </div>
        </div>
        <div className="text-right ml-2 flex-shrink-0">
          <p className="font-extrabold text-gray-900">{formatINR(Math.round(earnedWage))}</p>
          <p className="text-xs text-gray-400">of {formatINR(row.dailyWage)}</p>
        </div>
      </div>

      {/* Status Toggles */}
      <div className="grid grid-cols-3 gap-2">
        {(['present', 'half', 'absent'] as const).map((s) => {
          const sc = statusConfig[s];
          const active = row.status === s;
          return (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                active ? `${sc.bg} ${sc.text} shadow-card` : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {s === 'present' && <Check size={14} />}
              {s === 'absent' && <X size={14} />}
              {s === 'half' && <Clock size={14} />}
              {sc.label}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
