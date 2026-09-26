import { useMemo, useState } from 'react';
import { MapPin, CheckCircle2, Briefcase, Phone, UserPlus, X, Star, ShieldCheck, Home } from 'lucide-react';
import { Card, ScreenHeader, Avatar, Badge, Button } from './ui';
import { initialContractorWorkers } from '@/mockData';
import type { ContractorWorker } from '@/types';

export function WorkersScreen() {
  const [selected, setSelected] = useState<ContractorWorker | null>(null);
  const [assigned, setAssigned] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => initialContractorWorkers.filter((worker) => {
    const q = query.toLowerCase().trim();
    const matchesQuery = !q || [worker.name, worker.primarySkill, worker.location].some((v) => v.toLowerCase().includes(q));
    const matchesFilter = filter === 'All' ||
      (filter === 'Available' && worker.availability === 'Available') ||
      (filter === 'Verified' && worker.verified) ||
      (filter === 'Mason' && worker.primarySkill === 'Mason') ||
      (filter === 'Skilled Workers' && worker.category === 'skilledWorker');
    return matchesQuery && matchesFilter;
  }), [query, filter]);

  const handleAssign = (id: string) => setAssigned((prev) => new Set(prev).add(id));
  const shramaId = (id: string) => `SHR-${id.toUpperCase()}-${id === 'w1' ? '4821' : id === 'w2' ? '7314' : '5906'}`;

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
      <ScreenHeader title="Find Workers" subtitle="Discover labourers and skilled workers near you" />

      <Card className="p-4 mb-5 bg-gradient-to-r from-brand-50 to-white border-brand-100">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-brand-600" size={28} />
          <div>
            <p className="font-extrabold text-gray-900">Smart Workforce Matching</p>
            <p className="text-xs text-gray-500">Search a skill such as <b>Mason</b> to instantly see matching profiles. ShramaID helps verify worker identity and history. Local matching can prioritise workers within 5–15 km.</p>
          </div>
        </div>
      </Card>

      <div className="mb-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search by skill, name, or location..." className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-100 focus:border-brand-400 outline-none text-sm font-medium text-gray-900 shadow-card" />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-5 px-5 lg:mx-0 lg:px-0">
        {['All', 'Available', 'Verified', 'Mason', 'Skilled Workers'].map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${filter === item ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 shadow-card'}`}>{item}</button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((worker) => (
          <Card key={worker.id} className="p-4 animate-slide-up">
            <div className="flex items-start gap-3 mb-3">
              <Avatar initials={worker.avatar} size="md" color={worker.verified ? 'brand' : 'warning'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-gray-900 truncate">{worker.name}</h3>
                  {worker.verified && <CheckCircle2 size={16} className="text-accent-500 flex-shrink-0" />}
                </div>
                <p className="text-sm text-gray-500">{worker.primarySkill} · {worker.experience}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><MapPin size={12} /> {worker.location}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge color={worker.availability === 'Available' ? 'green' : 'gray'}>{worker.availability}</Badge>
              <Badge color="blue"><Briefcase size={12} /> {worker.workCount} jobs</Badge>
              {worker.category === 'skilledWorker' && <Badge color="blue">Skilled Worker</Badge>}
              {worker.verified && <Badge color="green"><CheckCircle2 size={12} /> Verified</Badge>}
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setSelected(worker)}>View Profile</Button>
              <button className="px-3 py-2 rounded-lg bg-accent-50 text-accent-600 active:scale-95 transition-transform" title="Contact"><Phone size={18} /></button>
              {assigned.has(worker.id) ? (
                <div className="px-3 py-2 rounded-lg bg-accent-100 text-accent-700 text-sm font-semibold flex items-center gap-1"><CheckCircle2 size={16} /> Assigned</div>
              ) : (
                <button onClick={() => handleAssign(worker.id)} className="px-3 py-2 rounded-lg bg-brand-600 text-white active:scale-95 transition-transform text-sm font-semibold flex items-center gap-1"><UserPlus size={16} /> Assign</button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && <Card className="p-8 text-center"><p className="font-bold text-gray-900">No matching profiles</p><p className="text-sm text-gray-500 mt-1">Try another skill, name, or location.</p></Card>}

      {selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40 animate-fade-in" />
          <div className="relative bg-white w-full max-w-2xl rounded-3xl p-5 sm:p-6 pb-8 animate-slide-up max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2.5rem)] overflow-y-auto overscroll-contain no-scrollbar shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-gray-900">Worker Profile</h2>
              <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><X size={20} /></button>
            </div>

            <Card className="p-4 mb-4 bg-gradient-to-r from-brand-50 to-white border-brand-100">
              <div className="flex gap-3 items-center">
<div className="flex-1"><p className="text-xs font-bold text-brand-700 uppercase tracking-wide">Smart Workforce Machine</p><p className="text-lg font-extrabold text-gray-900">ShramaID</p><p className="text-xs text-gray-500">Verified profile + workforce trust history</p></div>
              </div>
            </Card>

            <div className="flex items-center gap-4 mb-4">
              <Avatar initials={selected.avatar} size="lg" color={selected.verified ? 'brand' : 'warning'} />
              <div className="min-w-0">
                <div className="flex items-center gap-2"><h3 className="text-xl font-extrabold text-gray-900 truncate">{selected.name}</h3>{selected.verified && <CheckCircle2 size={18} className="text-accent-500" />}</div>
                <p className="text-sm text-gray-500">{selected.primarySkill} · {selected.experience}</p>
                <p className="text-xs text-brand-700 font-bold mt-1">ShramaID: {shramaId(selected.id)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-400 font-semibold">Workforce Trust Score</p><p className="font-extrabold text-gray-900 text-lg mt-0.5">{selected.verified ? '94/100' : '76/100'}</p></div>
              <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-400 font-semibold">Rating</p><p className="font-bold text-gray-900 text-sm mt-0.5 flex items-center gap-1">4.8 <Star size={14} className="text-warning-500 fill-warning-500" /> · {selected.workCount} jobs</p></div>
              <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-400 font-semibold">Location</p><p className="font-bold text-gray-900 text-sm mt-0.5">{selected.location}</p></div>
              <div className="p-3 rounded-xl bg-gray-50"><p className="text-xs text-gray-400 font-semibold">Availability</p><p className="font-bold text-gray-900 text-sm mt-0.5">{selected.availability}</p></div>
            </div>
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Complete profile</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50"><p className="text-[10px] text-gray-400 font-semibold">Phone</p><p className="font-bold text-gray-800 text-sm mt-1">+91 98765 43210</p></div>
                <div className="p-3 rounded-xl bg-gray-50"><p className="text-[10px] text-gray-400 font-semibold">Qualification</p><p className="font-bold text-gray-800 text-sm mt-1">ITI / Diploma</p></div>
                <div className="p-3 rounded-xl bg-gray-50"><p className="text-[10px] text-gray-400 font-semibold">Languages</p><p className="font-bold text-gray-800 text-sm mt-1">Kannada, Hindi, English</p></div>
                <div className="p-3 rounded-xl bg-gray-50"><p className="text-[10px] text-gray-400 font-semibold">Work preference</p><p className="font-bold text-gray-800 text-sm mt-1">Local / nearby sites</p></div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Skills & work history</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge color="blue">{selected.primarySkill}</Badge><Badge color="blue">Safety trained</Badge><Badge color="blue">Site experience</Badge>
              </div>
              <div className="space-y-2">
                {[['Residential construction', 'Kumar Constructions', '3 months'], ['Finishing / repair work', 'Local site projects', '2 months'], ['Previous site assignment', 'Verified employer', '1 month']].map(([job, employer, duration]) => <div key={job} className="p-3 rounded-xl border border-gray-100 bg-white"><div className="flex items-center justify-between gap-2"><p className="text-sm font-bold text-gray-800">{job}</p><span className="text-[10px] text-gray-400">{duration}</span></div><p className="text-xs text-gray-500 mt-1">{employer}</p></div>)}
              </div>
            </div>

            <div className="mb-4 p-4 rounded-2xl bg-gray-50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Work reliability</p>
              <div className="grid grid-cols-3 gap-2 text-center"><div><p className="font-extrabold text-gray-900">{selected.workCount}</p><p className="text-[10px] text-gray-400">Jobs</p></div><div><p className="font-extrabold text-gray-900">95%</p><p className="text-[10px] text-gray-400">Attendance</p></div><div><p className="font-extrabold text-gray-900">On time</p><p className="text-[10px] text-gray-400">Recent status</p></div></div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-brand-50"><p className="text-xs font-bold text-brand-700">Credential validation</p><p className="text-xs text-gray-600 mt-1">Phone + profile + past work records</p></div>
              <div className="p-3 rounded-xl bg-accent-50"><p className="text-xs font-bold text-accent-700">Escrow-ready</p><p className="text-xs text-gray-600 mt-1">Milestone payments can be tracked in the prototype</p></div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1"><Phone size={18} className="mr-2" /> Contact</Button>
              <Button variant="secondary" className="flex-1"><Home size={18} className="mr-2" /> Invite Home Work</Button>
              {assigned.has(selected.id) ? <Button variant="success" className="flex-1" disabled><CheckCircle2 size={18} className="mr-2" /> Assigned</Button> : <Button className="flex-1" onClick={() => { handleAssign(selected.id); setSelected(null); }}><UserPlus size={18} className="mr-2" /> Assign Job</Button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
