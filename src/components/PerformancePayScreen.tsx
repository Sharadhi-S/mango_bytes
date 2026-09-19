import { useMemo, useState } from 'react';
import { CloudRain, Clock3, HeartPulse, ShieldCheck, Star, Sun } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Badge, Card, ScreenHeader, formatINR } from './ui';

type DayType = 'productive' | 'protected' | 'disruption' | 'overtime';

/**
 * ShramaSetu prototype performance-pay model.
 * Important: the score only changes the bonus. It never reduces the worker's agreed base wage.
 */
function calculatePerformancePay({
  monthlyIncome,
  attendance,
  taskCompletion,
  quality,
  safety,
  teamwork,
  punctuality,
  overtimeHours,
  dayType,
}: {
  monthlyIncome: number;
  attendance: number;
  taskCompletion: number;
  quality: number;
  safety: number;
  teamwork: number;
  punctuality: number;
  overtimeHours: number;
  dayType: DayType;
}) {
  const baseDaily = Math.max(0, monthlyIncome || 18200) / 26;
  const score = Math.round(
    attendance * 0.25 +
    taskCompletion * 0.30 +
    quality * 0.20 +
    safety * 0.15 +
    teamwork * 0.05 +
    punctuality * 0.05
  );

  const protectedDay = dayType === 'protected' || dayType === 'disruption';
  const bonusRate = protectedDay ? 0 : score >= 90 ? 0.15 : score >= 80 ? 0.10 : score >= 70 ? 0.05 : 0;
  const performanceBonus = baseDaily * bonusRate;
  const overtimePay = baseDaily / 8 * 1.5 * (dayType === 'overtime' ? overtimeHours : 0);
  const total = baseDaily + performanceBonus + overtimePay;

  return { baseDaily, score, bonusRate, performanceBonus, overtimePay, total, protectedDay };
}

export function PerformancePayScreen() {
  const { registrationProfile } = useApp();
  const [dayType, setDayType] = useState<DayType>('productive');
  const [attendance, setAttendance] = useState(95);
  const [taskCompletion, setTaskCompletion] = useState(90);
  const [quality, setQuality] = useState(88);
  const [safety, setSafety] = useState(100);
  const [teamwork, setTeamwork] = useState(90);
  const [punctuality, setPunctuality] = useState(92);
  const [overtimeHours, setOvertimeHours] = useState(2);

  const result = useMemo(() => calculatePerformancePay({
    monthlyIncome: registrationProfile?.monthlyIncome || 18200,
    attendance,
    taskCompletion,
    quality,
    safety,
    teamwork,
    punctuality,
    overtimeHours,
    dayType,
  }), [registrationProfile?.monthlyIncome, attendance, taskCompletion, quality, safety, teamwork, punctuality, overtimeHours, dayType]);

  return (
    <div className="px-5 pt-6 pb-28 max-w-3xl mx-auto space-y-4">
      <ScreenHeader title="Performance Pay" subtitle="Transparent pay that rewards good work without penalising uncontrollable events" />

      <Card className="p-4 bg-brand-50 border border-brand-100">
        <div className="flex gap-3">
          <div className="w-11 h-11 rounded-xl bg-white text-brand-600 flex items-center justify-center"><Star size={21} /></div>
          <div>
            <p className="font-extrabold text-gray-900">ShramaSetu Pay Model</p>
            <p className="text-xs text-gray-600 mt-1">Base wage is protected. Performance can add a bonus; rain, traffic, shortages, approved sick/festival leave and emergencies do not create an automatic pay penalty.</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Choose today's situation</p>
        <div className="grid grid-cols-2 gap-2">
          <DayButton active={dayType === 'productive'} onClick={() => setDayType('productive')} icon={<Sun size={18} />} title="Good / Productive" subtitle="Performance bonus eligible" />
          <DayButton active={dayType === 'protected'} onClick={() => setDayType('protected')} icon={<HeartPulse size={18} />} title="Sick / Festival" subtitle="Base pay protected" />
          <DayButton active={dayType === 'disruption'} onClick={() => setDayType('disruption')} icon={<CloudRain size={18} />} title="Rain / Delay / Shortage" subtitle="No penalty for disruption" />
          <DayButton active={dayType === 'overtime'} onClick={() => setDayType('overtime')} icon={<Clock3 size={18} />} title="Overtime" subtitle="Adds overtime pay" />
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div><p className="font-extrabold text-gray-900">Performance score</p><p className="text-xs text-gray-500">Transparent factors used only for bonus calculation</p></div>
          <div className="text-right"><p className="text-2xl font-extrabold text-brand-600">{result.score}/100</p><Badge color={result.score >= 80 ? 'green' : result.score >= 70 ? 'yellow' : 'red'}>{result.bonusRate * 100}% bonus</Badge></div>
        </div>
        <div className="space-y-3">
          <ScoreSlider label="Attendance / reliability" value={attendance} setValue={setAttendance} />
          <ScoreSlider label="Task completion" value={taskCompletion} setValue={setTaskCompletion} />
          <ScoreSlider label="Work quality" value={quality} setValue={setQuality} />
          <ScoreSlider label="Safety" value={safety} setValue={setSafety} />
          <ScoreSlider label="Teamwork" value={teamwork} setValue={setTeamwork} />
          <ScoreSlider label="Punctuality" value={punctuality} setValue={setPunctuality} />
        </div>
      </Card>

      {dayType === 'overtime' && (
        <Card className="p-4">
          <label className="text-xs font-bold text-gray-600">Overtime hours</label>
          <input type="number" min="0" max="12" value={overtimeHours} onChange={(e) => setOvertimeHours(Math.max(0, Number(e.target.value)))} className="mt-1.5 w-full px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none" />
          <p className="text-[11px] text-gray-400 mt-1">Prototype uses an illustrative 1.5× hourly overtime multiplier. Actual overtime rules should be configured for the applicable employment setup.</p>
        </Card>
      )}

      <Card className="p-5">
        <p className="text-sm font-extrabold text-gray-900 mb-3">Today's transparent pay calculation</p>
        <div className="space-y-2 text-sm">
          <PayRow label="Guaranteed base wage" value={formatINR(result.baseDaily)} />
          <PayRow label="Performance bonus" value={`+${formatINR(result.performanceBonus)}`} />
          <PayRow label="Overtime" value={`+${formatINR(result.overtimePay)}`} />
          <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between font-extrabold text-gray-900"><span>Total prototype pay</span><span className="text-brand-600">{formatINR(result.total)}</span></div>
        </div>
      </Card>

      <Card className="p-4 bg-gray-50">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-500"><ShieldCheck size={19} /></div>
          <div>
            <p className="text-sm font-bold text-gray-800">Why this is different</p>
            <p className="text-xs text-gray-500 mt-1">The prototype does not turn bad luck into a salary cut. Workers keep their base wage, can earn more through measurable performance and overtime, and get protected treatment for approved leave or uncontrollable site disruptions.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DayButton({ active, onClick, icon, title, subtitle }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string }) {
  return <button onClick={onClick} className={`p-3 rounded-2xl border text-left ${active ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white'}`}><div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? 'bg-white text-brand-600' : 'bg-gray-50 text-gray-500'}`}>{icon}</div><p className="font-bold text-sm text-gray-900 mt-2">{title}</p><p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p></button>;
}

function ScoreSlider({ label, value, setValue }: { label: string; value: number; setValue: (value: number) => void }) {
  return <label className="block"><div className="flex justify-between text-xs font-semibold text-gray-600 mb-1"><span>{label}</span><span>{value}</span></div><input type="range" min="0" max="100" value={value} onChange={(e) => setValue(Number(e.target.value))} className="w-full accent-brand-600" /></label>;
}

function PayRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-gray-600"><span>{label}</span><span className="font-bold text-gray-900">{value}</span></div>;
}
