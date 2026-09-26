import { useMemo, useState } from 'react';
import { ShieldCheck, HeartPulse, LifeBuoy, HardHat, Umbrella, LockKeyhole, CheckCircle2, ArrowLeft, Plus } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Badge, Button, Card, ScreenHeader, formatINR } from './ui';

const annualPlans = {
  life: { name: 'Life + Accidental Death', premium: 1500, cover: 500000, icon: LifeBuoy },
  health: { name: 'Health Cover', premium: 2400, cover: 200000, icon: HeartPulse },
  accident: { name: 'Personal Accident', premium: 900, cover: 300000, icon: HardHat },
  income: { name: 'Income Protection', premium: 600, cover: 30000, icon: Umbrella },
} as const;

type PlanKey = keyof typeof annualPlans;

function mandatoryForSkills(skills: string[]): PlanKey[] {
  const text = skills.join(' ').toLowerCase();
  const mandatory = new Set<PlanKey>(['accident']);
  const constructionHighRisk = ['mason', 'construction labour', 'welder', 'electrician', 'plumber', 'bar bender', 'scaffolder', 'roofer', 'carpenter', 'tile worker', 'construction supervisor'];
  const industrial = ['industrial', 'factory', 'machine operator', 'fitter', 'lathe', 'rigger', 'production worker', 'maintenance technician', 'industrial electrician'];
  if (constructionHighRisk.some((skill) => text.includes(skill))) mandatory.add('life');
  if (industrial.some((skill) => text.includes(skill))) mandatory.add('health');
  if (text.includes('chemical') || text.includes('foundry') || text.includes('heavy machine')) {
    mandatory.add('health');
    mandatory.add('life');
  }
  return Array.from(mandatory);
}

export function InsuranceScreen() {
  const { workerSkill, showToast, setScreen, registrationProfile } = useApp();
  const analyzedSkills = registrationProfile?.skills?.length ? registrationProfile.skills : [workerSkill];
  const mandatory = useMemo(() => mandatoryForSkills(analyzedSkills), [analyzedSkills]);
  const [selected, setSelected] = useState<PlanKey[]>(Array.from(new Set([...mandatory, 'health'])));
  const annualPremium = selected.reduce((sum, key) => sum + annualPlans[key].premium, 0);
  const togglePlan = (key: PlanKey) => {
    if (mandatory.includes(key)) return;
    setSelected((prev) => prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]);
  };

  const saveDemo = () => {
    showToast('Benefits setup saved as prototype data — no real policy or deduction created.');
  };

  return (
    <div className="px-5 pt-6 pb-28 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setScreen('home')} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700"><ArrowLeft size={18} /></button>
        <div className="flex-1"><ScreenHeader title="Insurance" subtitle="Worker safety benefits — yearly protection + skill-based recommendations" /></div>
      </div>

      <Card className="p-4 bg-brand-50 border border-brand-100">
        <div className="flex gap-3">
          <div className="w-11 h-11 rounded-xl bg-white text-brand-600 flex items-center justify-center"><ShieldCheck size={22} /></div>
          <div>
            <p className="font-extrabold text-gray-900">Skill-based protection</p>
            <p className="text-xs text-gray-600 mt-1">Analysed skills: <strong>{analyzedSkills.join(', ') || 'Not provided'}</strong>. Coverage is prototype logic based on the risk category.</p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3">Annual Insurance Plans</h2>
        <div className="space-y-3">
          {(Object.keys(annualPlans) as PlanKey[]).map((key) => {
            const plan = annualPlans[key];
            const Icon = plan.icon;
            const isMandatory = mandatory.includes(key);
            const active = selected.includes(key);
            return (
              <Card key={key} className={`p-4 border ${active ? 'border-brand-200' : 'border-transparent'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${active ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-500'}`}><Icon size={21} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm">{plan.name}</p>
                      {isMandatory && <Badge color="red">Mandatory for selected skill(s)</Badge>}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Illustrative cover: {formatINR(plan.cover)} · paid yearly</p>
                    <p className="text-sm font-extrabold text-gray-900 mt-2">{formatINR(plan.premium)} / year</p>
                  </div>
                  <button onClick={() => togglePlan(key)} className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}`} aria-label={`Toggle ${plan.name}`}>
                    {active ? <CheckCircle2 size={19} /> : <Plus size={19} />}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="p-4 bg-gray-900 text-white">
        <div className="flex items-center gap-2"><LockKeyhole size={17} /><p className="font-bold text-sm">Prototype only</p></div>
        <p className="text-xs text-gray-300 mt-2">These premiums and mandatory rules are sample product logic for the demo. No insurance policy, premium collection or real financial transaction is executed.</p>
      </Card>

      <Button className="w-full" onClick={saveDemo}>Save Demo Benefits Setup</Button>

      <Card className="p-4">
        <div className="flex justify-between items-center"><span className="text-sm font-semibold text-gray-600">Selected annual insurance</span><span className="text-lg font-extrabold text-brand-600">{formatINR(annualPremium)}</span></div>
        <p className="text-xs text-gray-400 mt-1">{selected.length} plan{selected.length === 1 ? '' : 's'} selected</p>
      </Card>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-gray-50 p-3"><p className="text-[10px] font-semibold text-gray-400">{label}</p><p className="text-sm font-extrabold text-gray-900 mt-1">{value}</p></div>;
}
