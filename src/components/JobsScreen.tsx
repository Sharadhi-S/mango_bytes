import { MapPin, Clock, IndianRupee, Check, Briefcase, Sparkles } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, Badge, Button } from './ui';
import type { JobListing } from '@/types';

export function JobsScreen() {
  const { jobs, applyJob, t } = useApp();

  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
      <ScreenHeader title={t('findWorkTitle')} subtitle={t('findWorkSubtitle')} />

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-5 px-5">
        <button className="px-4 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold whitespace-nowrap">{t('allJobs')}</button>
        <button className="px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-semibold whitespace-nowrap shadow-card">{t('nearby')}</button>
        <button className="px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-semibold whitespace-nowrap shadow-card">{t('highWage')}</button>
        <button className="px-4 py-2 rounded-full bg-white text-gray-600 text-sm font-semibold whitespace-nowrap shadow-card">{t('longTerm')}</button>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onApply={() => applyJob(job.id)} />
        ))}
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
          <p className="text-xs text-gray-400">{t('perDay')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge color="blue"><Clock size={12} /> {job.duration}</Badge>
        <Badge color="gray"><Sparkles size={12} /> {job.skill}</Badge>
      </div>

      {job.applied ? (
        <div className="w-full py-3 rounded-xl bg-accent-50 text-accent-700 font-semibold text-sm flex items-center justify-center gap-2">
          <Check size={18} /> {t('appliedSuccessfully')}
        </div>
      ) : (
        <Button variant="primary" className="w-full" onClick={onApply}>
          {t('applyNow')}
        </Button>
      )}
    </Card>
  );
}

function formatINR(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}
