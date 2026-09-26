import { Camera, CheckCircle2, Clock3, MapPin, ShieldCheck, Star, Upload, UserRound } from 'lucide-react';
import { Badge, Button, Card, ScreenHeader } from './ui';

const progressEntries = [
  {
    id: 'p1',
    worker: 'Ravi Kumar',
    job: 'Site B - Wall plastering',
    location: 'Mysuru',
    day: 'Day 2',
    percent: 35,
    status: 'In progress',
    verified: true,
    notes: 'Base plastering completed. Final smoothing in progress.',
    photos: ['Progress photo 1', 'Progress photo 2'],
    rating: 4.8,
  },
  {
    id: 'p2',
    worker: 'Suresh Patel',
    job: 'House repair - kitchen wall',
    location: 'Mysuru',
    day: 'Day 1',
    percent: 60,
    status: 'Needs review',
    verified: false,
    notes: 'Material delivery and surface prep complete; contractor review pending.',
    photos: ['Site prep', 'Material check'],
    rating: 4.5,
  },
  {
    id: 'p3',
    worker: 'Meera Nair',
    job: 'Interior touch-up',
    location: 'Mysuru',
    day: 'Day 3',
    percent: 86,
    status: 'Verified',
    verified: true,
    notes: 'Paint touch-up nearly complete and quality reviewed by supervisor.',
    photos: ['Final finish', 'Client check-in'],
    rating: 4.9,
  },
];

export function ProgressScreen() {
  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
      <ScreenHeader title="Progress & Photo Proof" subtitle="Track job status with photo uploads from workers and contractors" />

      <Card className="p-4 mb-5 bg-gradient-to-r from-brand-50 to-white border-brand-100">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
            <Camera size={22} />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-gray-900">Employer proof-of-work workflow</p>
            <p className="text-xs text-gray-500 mt-1">A simple mock workflow that lets labourers or contractors upload progress photos as evidence before milestone payment release.</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-3 mb-5">
        <Card className="p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Photos uploaded</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">18</p>
          <p className="text-xs text-gray-500 mt-1">Across active jobs</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Verified</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">12</p>
          <p className="text-xs text-gray-500 mt-1">Ready for payment</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Review needed</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-2">3</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
        </Card>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-700">Live job progress</h2>
        <Button variant="secondary" size="sm">
          <Upload size={16} className="mr-2" /> Upload proof
        </Button>
      </div>

      <div className="space-y-4">
        {progressEntries.map((entry) => (
          <Card key={entry.id} className="p-4 animate-slide-up">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-extrabold text-gray-900">{entry.worker}</p>
                <p className="text-xs text-gray-500 mt-1">{entry.job}</p>
              </div>
              <Badge color={entry.status === 'Verified' ? 'green' : entry.status === 'Needs review' ? 'yellow' : 'blue'}>{entry.status}</Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1"><MapPin size={12} /> {entry.location}</span>
              <span className="inline-flex items-center gap-1"><Clock3 size={12} /> {entry.day}</span>
              <span className="inline-flex items-center gap-1"><UserRound size={12} /> {entry.verified ? 'Approved by employer' : 'Waiting on employer review'}</span>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500">Completion</span>
                <span className="text-xs font-bold text-brand-700">{entry.percent}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${entry.percent}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {entry.photos.map((photo, index) => (
                <div key={`${entry.id}-${index}`} className="rounded-xl bg-gradient-to-br from-brand-50 via-white to-accent-50 border border-gray-100 p-3 min-h-[72px] flex items-end justify-start">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-600">
                    <Camera size={12} /> {photo}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
              <p className="font-semibold text-gray-800">Employer note</p>
              <p className="mt-1">{entry.notes}</p>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Star size={14} className="text-warning-500 fill-warning-500" /> {entry.rating}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold">Ask for update</button>
                <button className="px-3 py-2 rounded-lg bg-accent-600 text-white text-sm font-semibold">Approve</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 mt-5 border border-brand-100 bg-brand-50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-brand-600 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-gray-900">Prototype logic</p>
            <p className="text-xs text-gray-600 mt-1">This is a mock employer verification flow for presentation purposes. It demonstrates how photo proof can support milestone approval without needing a real backend or storage setup.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
