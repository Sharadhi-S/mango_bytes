import { useMemo, useState } from 'react';
import { MapPin, CheckCircle2, Briefcase, Phone, UserPlus, X, Star, ShieldCheck, Home, Sparkles, Send, Clock } from 'lucide-react';
import { Card, ScreenHeader, Avatar, Badge, Button } from './ui';
import { useApp } from '@/AppContext';
import { matchWorker } from '@/services/workers';
import type { ContractorWorker } from '@/types';

export function WorkersScreen() {
  const {
    workersDirectory,
    invitations,
    assignments,
    inviteWorker,
    selectedProjectId,
    tenders,
    showToast,
  } = useApp();

  const [selected, setSelected] = useState<ContractorWorker | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  const activeProject = tenders.find((t) => t.id === selectedProjectId) || tenders[0];

  const scoredWorkers = useMemo(() => {
    return workersDirectory.map((worker) => {
      const match = matchWorker(
        worker,
        query || 'Mason',
        850,
        activeProject?.location || 'Belagavi'
      );
      return { worker, match };
    });
  }, [workersDirectory, query, activeProject]);

  const filtered = useMemo(() => {
    return scoredWorkers.filter(({ worker }) => {
      const q = query.toLowerCase().trim();
      const matchesQuery =
        !q ||
        [worker.name, worker.primarySkill, worker.location].some((v) =>
          v.toLowerCase().includes(q)
        );
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Available' && worker.availability === 'available') ||
        (filter === 'Verified' && worker.verified) ||
        (filter === 'Mason' && worker.primarySkill.toLowerCase().includes('mason')) ||
        (filter === 'Skilled' && worker.category === 'skilledWorker');
      return matchesQuery && matchesFilter;
    });
  }, [scoredWorkers, query, filter]);

  const handleInvite = (worker: ContractorWorker) => {
    const dailyWage = worker.category === 'labourer' ? 600 : 850;
    inviteWorker({
      projectId: activeProject?.id || 'tender-1',
      projectTitle: activeProject?.title || 'Belagavi Highway & Flyover Expansion',
      contractorId: 'c1',
      contractorName: 'Kumar Construction Services',
      workerId: worker.id,
      workerName: worker.name,
      skill: worker.primarySkill,
      dailyWage,
      location: worker.location,
      duration: activeProject?.duration || '30 Days',
      notes: `Deployment for ${worker.primarySkill} trades on site.`,
    });
  };

  const shramaId = (id: string) =>
    `SHR-${id.toUpperCase()}-${id === 'w1' ? '4821' : id === 'w2' ? '7314' : '5906'}`;

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8 space-y-5">
      <ScreenHeader
        title="Find & Deploy Workers"
        subtitle="Deterministic 100-point skill matching & real-time deployment invitations"
      />

      {/* Match Engine Info Banner */}
      <Card className="p-4 bg-gradient-to-r from-brand-50 to-white border-brand-100 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="font-extrabold text-gray-900 text-sm">Deterministic 100-Point Match Algorithm</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Scores profiles based on Skill Match (50 pts), Location Proximity (20 pts), Immediate Availability (15 pts), Verified Experience (10 pts), and Wage Fit (5 pts).
            </p>
          </div>
        </div>
      </Card>

      {/* Search Input */}
      <div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          placeholder="Search by skill (Mason, Helper, Electrician), name, or location..."
          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-100 focus:border-brand-400 outline-none text-sm font-medium text-gray-900 shadow-xs"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 lg:mx-0 lg:px-0">
        {['All', 'Available', 'Verified', 'Mason', 'Skilled'].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              filter === item
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Workers Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(({ worker, match }) => {
          const isAssigned = assignments.some((a) => a.workerId === worker.id);
          const isInvited = invitations.some(
            (i) => i.workerId === worker.id && i.status === 'invited'
          );

          return (
            <Card key={worker.id} className="p-4 border border-gray-200 hover:border-brand-300 shadow-xs transition-all">
              <div className="flex items-start gap-3 mb-3">
                <Avatar
                  initials={worker.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                  size="md"
                  color={worker.verified ? 'brand' : 'warning'}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{worker.name}</h3>
                      {worker.verified && <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />}
                    </div>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {match.score}% Match
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {worker.primarySkill} · {worker.experience}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                    <MapPin size={11} /> {worker.location}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                <Badge color={worker.availability === 'available' ? 'green' : 'gray'}>
                  {worker.availability === 'available' ? 'Available' : 'Committed'}
                </Badge>
                <Badge color="blue">
                  <Briefcase size={11} className="mr-1 inline" /> {worker.workCount} jobs
                </Badge>
                {worker.verified && (
                  <Badge color="green">
                    <CheckCircle2 size={11} className="mr-1 inline" /> Verified
                  </Badge>
                )}
              </div>

              <div className="p-2 rounded-lg bg-gray-50 mb-3 text-[11px] text-gray-600 space-y-0.5">
                <p className="font-semibold text-gray-800">Match Reasons:</p>
                {match.matchReasons.slice(0, 2).map((reason, idx) => (
                  <p key={idx} className="text-gray-500 truncate">
                    • {reason}
                  </p>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setSelected(worker)}
                >
                  View Profile
                </Button>

                {isAssigned ? (
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> Assigned
                  </div>
                ) : isInvited ? (
                  <div className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                    <Clock size={14} /> Invitation Sent
                  </div>
                ) : (
                  <button
                    onClick={() => handleInvite(worker)}
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white active:scale-95 transition-all text-xs font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <Send size={13} /> Invite
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-8 text-center border border-gray-100">
          <p className="font-bold text-gray-900">No matching worker profiles</p>
          <p className="text-xs text-gray-500 mt-1">Try another trade skill, name, or location.</p>
        </Card>
      )}

      {/* Profile Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 animate-scale-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-gray-900">Worker Credentials</h2>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3.5 mb-4">
              <Avatar
                initials={selected.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
                size="lg"
                color={selected.verified ? 'brand' : 'warning'}
              />
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">{selected.name}</h3>
                <p className="text-xs text-gray-500">
                  {selected.primarySkill} · {selected.experience}
                </p>
                <p className="text-xs text-brand-700 font-bold mt-0.5">
                  ShramaID: {shramaId(selected.id)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs">
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-gray-400 font-semibold">Location</p>
                <p className="font-bold text-gray-900 mt-0.5">{selected.location}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-gray-400 font-semibold">Track Record</p>
                <p className="font-bold text-gray-900 mt-0.5">{selected.workCount} Completed Contracts</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleInvite(selected);
                  setSelected(null);
                }}
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
              >
                <Send size={14} /> Send Project Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
