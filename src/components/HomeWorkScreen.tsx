import { useMemo, useState } from 'react';
import { Home, MapPin, Phone, UserPlus, CheckCircle2, ChefHat, HardHat, Car, Search } from 'lucide-react';
import { Card, ScreenHeader, Badge, Button } from './ui';
import { initialContractorWorkers } from '@/mockData';

export function HomeWorkScreen() {
  const [query, setQuery] = useState('');
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [kind, setKind] = useState<'All' | 'Labourers' | 'Skilled Workers'>('All');

  const workers = useMemo(() => initialContractorWorkers.filter((w) => {
    const q = query.trim().toLowerCase();
    const matchText = !q || [w.name, w.primarySkill, w.location].some((v) => v.toLowerCase().includes(q));
    const matchKind = kind === 'All' || (kind === 'Labourers' ? w.category === 'labourer' : w.category === 'skilledWorker');
    return matchText && matchKind;
  }), [query, kind]);

  const invite = (id: string) => setInvited((prev) => new Set(prev).add(id));

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
      <ScreenHeader title="Home Work" subtitle="Invite trusted labourers or skilled workers directly to jobs at a home" />

      <Card className="p-5 mb-5 overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center"><Home size={24} /></div>
          <div className="flex-1"><h2 className="font-extrabold text-gray-900">Direct Home-Work Invitations</h2><p className="text-sm text-gray-500 mt-1">For painting, masonry, plumbing, cooking, driving, cleaning, electrical repairs and other household work.</p></div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-3 rounded-xl bg-gray-50 text-center"><HardHat size={18} className="mx-auto text-brand-600" /><p className="text-xs font-bold mt-1">Labourers</p></div>
          <div className="p-3 rounded-xl bg-gray-50 text-center"><ChefHat size={18} className="mx-auto text-purple-600" /><p className="text-xs font-bold mt-1">Skilled</p></div>
          <div className="p-3 rounded-xl bg-gray-50 text-center"><Car size={18} className="mx-auto text-accent-600" /><p className="text-xs font-bold mt-1">Drivers</p></div>
        </div>
      </Card>

      <div className="flex gap-2 mb-4">
        {(['All', 'Labourers', 'Skilled Workers'] as const).map((item) => <button key={item} onClick={() => setKind(item)} className={`px-4 py-2 rounded-full text-sm font-semibold ${kind === item ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 shadow-card'}`}>{item}</button>)}
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search home-work skill or worker..." className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-brand-200" />
      </div>

      <div className="space-y-3">
        {workers.map((worker) => (
          <Card key={worker.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-extrabold">{worker.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="font-bold text-gray-900">{worker.name}</p>{worker.verified && <CheckCircle2 size={15} className="text-accent-500" />}</div>
                <p className="text-sm text-gray-500">{worker.primarySkill} · {worker.experience}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={12} /> {worker.location} · {worker.availability}</p>
                <div className="flex gap-2 mt-2"><Badge color="blue">{worker.category === 'skilledWorker' ? 'Skilled Worker' : 'Labourer'}</Badge><Badge color="green">Verified profile</Badge></div>
              </div>
              <div className="flex flex-col gap-2">
                {invited.has(worker.id) ? <Button variant="success" size="sm" disabled><CheckCircle2 size={15} className="mr-1" /> Invited</Button> : <Button size="sm" onClick={() => invite(worker.id)}><UserPlus size={15} className="mr-1" /> Invite</Button>}
                <button className="px-3 py-2 rounded-lg bg-gray-50 text-gray-600"><Phone size={16} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
