import { useState, useMemo } from 'react';
import { MapPin, Clock, IndianRupee, Check, Briefcase, Sparkles } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, Badge, Button } from './ui';
import type { JobListing } from '@/types';

export function JobsScreen() {
  const { jobs, applyJob, role, registrationProfile } = useApp();
  const [filter, setFilter] = useState<'all' | 'nearby' | 'high_wage' | 'long_term'>('all');
  const workerSkill = registrationProfile?.primarySkill?.trim();

  const filteredJobs = useMemo(() => {
    let list = role === 'skilledWorker' && workerSkill
      ? jobs.filter((job) => job.profession?.toLowerCase() === workerSkill.toLowerCase())
      : jobs;

    if (filter === 'nearby') {
      const userLoc = registrationProfile?.location?.toLowerCase() || '';
      list = [...list].sort((a, b) => {
        const aMatch = userLoc && a.location.toLowerCase().includes(userLoc) ? -1 : 1;
        const bMatch = userLoc && b.location.toLowerCase().includes(userLoc) ? -1 : 1;
        return aMatch - bMatch;
      });
    } else if (filter === 'high_wage') {
      list = [...list].sort((a, b) => b.dailyWage - a.dailyWage);
    } else if (filter === 'long_term') {
      list = list.filter((j) => j.duration.toLowerCase().includes('month') || j.duration.toLowerCase().includes('year') || parseInt(j.duration) >= 4);
    }
    return list;
  }, [jobs, role, workerSkill, filter, registrationProfile?.location]);

  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
      <ScreenHeader title="Find Work" subtitle="Available jobs near you" />

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-5 px-5">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
            filter === 'all' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 shadow-card'
          }`}
        >
          All Jobs
        </button>
        <button
          onClick={() => setFilter('nearby')}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
            filter === 'nearby' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 shadow-card'
          }`}
        >
          Nearby
        </button>
        <button
          onClick={() => setFilter('high_wage')}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
            filter === 'high_wage' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 shadow-card'
          }`}
        >
          High Wage
        </button>
        <button
          onClick={() => setFilter('long_term')}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
            filter === 'long_term' ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 shadow-card'
          }`}
        >
          Long Term
        </button>
      </div>

      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} onApply={() => applyJob(job.id)} />
        ))}
        {role === 'skilledWorker' && filteredJobs.length === 0 && (
          <Card className="p-6 text-center">
            <Briefcase size={28} className="mx-auto text-gray-300" />
            <p className="font-bold text-gray-900 mt-3">No {workerSkill || 'matching'} jobs right now</p>
            <p className="text-sm text-gray-500 mt-1">New jobs for your profession will appear here. Construction jobs are hidden from skilled-worker profiles.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, onApply }: { job: JobListing; onApply: () => void }) {
  return (
    <Card className="p-4 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
            <Briefcase size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{job.title}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <MapPin size={12} />
              <span>{job.location}</span>
              <span>·</span>
              <span>{job.distance}</span>
            </div>
          </div>
        </div>
        <div className="text-right ml-2 flex-shrink-0">
          <p className="font-extrabold text-brand-600 text-lg">{formatINR(job.dailyWage)}</p>
          <p className="text-xs text-gray-400">per day</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge color="blue"><Clock size={12} /> {job.duration}</Badge>
        <Badge color="gray"><Sparkles size={12} /> {job.skill}</Badge>
      </div>

      {job.applied ? (
        <div className="w-full py-3 rounded-xl bg-accent-50 text-accent-700 font-semibold text-sm flex items-center justify-center gap-2">
          <Check size={18} /> Applied Successfully
        </div>
      ) : (
        <Button variant="primary" className="w-full" onClick={onApply}>
          Apply Now
        </Button>
      )}
    </Card>
  );
}

function formatINR(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}
