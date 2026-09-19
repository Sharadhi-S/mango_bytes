import { useState } from 'react';
import { MapPin, CheckCircle2, Briefcase, Phone, UserPlus, X, Star } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, Avatar, Badge, Button } from './ui';
import { initialContractorWorkers } from '@/mockData';
import type { ContractorWorker } from '@/types';

export function WorkersScreen() {
  const [selected, setSelected] = useState<ContractorWorker | null>(null);
  const [assigned, setAssigned] = useState<Set<string>>(new Set());

  const handleAssign = (id: string) => {
    setAssigned((prev) => new Set(prev).add(id));
  };

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
      <ScreenHeader title="Find Workers" subtitle="Discover skilled workers near you" />

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by skill, name, or location..."
          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-100 focus:border-brand-400 outline-none text-sm font-medium text-gray-900 shadow-card"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-5 px-5 lg:mx-0 lg:px-0">
        <button className="px-4 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold whitespace-nowrap">All</button>
        <button className="px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-semibold whitespace-nowrap shadow-card">Available</button>
        <button className="px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-semibold whitespace-nowrap shadow-card">Verified</button>
        <button className="px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-semibold whitespace-nowrap shadow-card">Mason</button>
        <button className="px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-semibold whitespace-nowrap shadow-card">Helper</button>
      </div>

      {/* Worker cards */}
      <div className="grid gap-3 md:grid-cols-2">
        {initialContractorWorkers.map((worker) => (
          <Card key={worker.id} className="p-4 animate-slide-up">
            <div className="flex items-start gap-3 mb-3">
              <Avatar initials={worker.avatar} size="md" color={worker.verified ? 'brand' : 'warning'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-gray-900 truncate">{worker.name}</h3>
                  {worker.verified && <CheckCircle2 size={16} className="text-accent-500 flex-shrink-0" />}
                </div>
                <p className="text-sm text-gray-500">{worker.primarySkill} · {worker.experience}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <MapPin size={12} /> {worker.location}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Badge color={worker.availability === 'Available' ? 'green' : 'gray'}>{worker.availability}</Badge>
              <Badge color="blue"><Briefcase size={12} /> {worker.workCount} jobs</Badge>
              {worker.verified && <Badge color="green"><CheckCircle2 size={12} /> Verified</Badge>}
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1" onClick={() => setSelected(worker)}>
                View Profile
              </Button>
              <button className="px-3 py-2 rounded-lg bg-accent-50 text-accent-600 active:scale-95 transition-transform" title="Contact">
                <Phone size={18} />
              </button>
              {assigned.has(worker.id) ? (
                <div className="px-3 py-2 rounded-lg bg-accent-100 text-accent-700 text-sm font-semibold flex items-center gap-1">
                  <CheckCircle2 size={16} /> Assigned
                </div>
              ) : (
                <button
                  onClick={() => handleAssign(worker.id)}
                  className="px-3 py-2 rounded-lg bg-brand-600 text-white active:scale-95 transition-transform text-sm font-semibold flex items-center gap-1"
                >
                  <UserPlus size={16} /> Assign
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Worker Detail Sheet */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40 animate-fade-in" />
          <div
            className="relative bg-white w-full max-w-2xl rounded-t-3xl p-6 pb-8 animate-slide-up max-h-[80vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-gray-900">Worker Profile</h2>
              <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <Avatar initials={selected.avatar} size="lg" color={selected.verified ? 'brand' : 'warning'} />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-gray-900">{selected.name}</h3>
                  {selected.verified && <CheckCircle2 size={18} className="text-accent-500" />}
                </div>
                <p className="text-sm text-gray-500">{selected.primarySkill}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={14} className="text-warning-500 fill-warning-500" />
                  <span className="text-xs font-semibold text-gray-600">4.8 · {selected.workCount} jobs completed</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-400 font-semibold">Experience</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{selected.experience}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-400 font-semibold">Location</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{selected.location}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-400 font-semibold">Availability</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{selected.availability}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-400 font-semibold">Verification</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{selected.verified ? 'Verified' : 'Pending'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1">
                <Phone size={18} className="mr-2" /> Contact
              </Button>
              {assigned.has(selected.id) ? (
                <Button variant="success" className="flex-1" disabled>
                  <CheckCircle2 size={18} className="mr-2" /> Assigned
                </Button>
              ) : (
                <Button className="flex-1" onClick={() => { handleAssign(selected.id); setSelected(null); }}>
                  <UserPlus size={18} className="mr-2" /> Assign Job
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
