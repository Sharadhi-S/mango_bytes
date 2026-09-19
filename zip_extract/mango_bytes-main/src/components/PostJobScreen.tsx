import { useState } from 'react';
import { Check, Briefcase, Plus, X } from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, Button, Badge } from './ui';

export function PostJobScreen() {
  const { postJob, postedJobs } = useApp();
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({
    title: '',
    skill: '',
    workersNeeded: '',
    location: '',
    dailyWage: '',
    startDate: '',
    duration: '',
    description: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    postJob({
      title: form.title || 'Construction Worker',
      skill: form.skill || 'No experience required',
      workersNeeded: Number(form.workersNeeded) || 1,
      location: form.location || 'Mysuru',
      dailyWage: Number(form.dailyWage) || 500,
      startDate: form.startDate || 'Tomorrow',
      duration: form.duration || '15 days',
      description: form.description || '',
    });
    setShowSuccess(true);
    setForm({ title: '', skill: '', workersNeeded: '', location: '', dailyWage: '', startDate: '', duration: '', description: '' });
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const isValid = form.title && form.workersNeeded && form.dailyWage;

  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
      <ScreenHeader title="Post Job" subtitle="Create a new job requirement" />

      {/* Form */}
      <Card className="p-5 mb-5 animate-slide-up">
        <div className="space-y-4">
          <Field label="Job Title" value={form.title} onChange={(v) => handleChange('title', v)} placeholder="e.g. Construction Helper" />
          <Field label="Required Skill" value={form.skill} onChange={(v) => handleChange('skill', v)} placeholder="e.g. No experience required" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Workers Needed" value={form.workersNeeded} onChange={(v) => handleChange('workersNeeded', v)} placeholder="5" type="number" />
            <Field label="Daily Wage (₹)" value={form.dailyWage} onChange={(v) => handleChange('dailyWage', v)} placeholder="700" type="number" />
          </div>
          <Field label="Location" value={form.location} onChange={(v) => handleChange('location', v)} placeholder="e.g. Site A, Mysuru" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date" value={form.startDate} onChange={(v) => handleChange('startDate', v)} placeholder="e.g. Sep 20" />
            <Field label="Duration" value={form.duration} onChange={(v) => handleChange('duration', v)} placeholder="e.g. 15 days" />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the work..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-400 outline-none text-sm font-medium text-gray-900 resize-none"
            />
          </div>
        </div>

        <Button className="w-full mt-5" size="lg" onClick={handleSubmit} disabled={!isValid}>
          <Plus size={20} className="mr-2" /> Post Requirement
        </Button>
      </Card>

      {/* Posted Jobs */}
      <h2 className="text-sm font-bold text-gray-700 mb-3">Active Requirements</h2>
      <div className="space-y-2">
        {postedJobs.map((job) => (
          <Card key={job.id} className="p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                  <Briefcase size={18} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.location}</p>
                </div>
              </div>
              <Badge color="blue">Active</Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
              <span>👥 {job.workersNeeded} workers</span>
              <span>·</span>
              <span>₹{job.dailyWage}/day</span>
              <span>·</span>
              <span>{job.duration}</span>
              <span>·</span>
              <span>Starts {job.startDate}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" />
          <div className="relative bg-white rounded-3xl p-8 text-center animate-scale-in max-w-xs w-full">
            <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-accent-600" />
            </div>
            <h2 className="text-lg font-extrabold text-gray-900">Job Posted!</h2>
            <p className="text-sm text-gray-500 mt-1">Your requirement is now visible to workers</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-400 outline-none text-sm font-medium text-gray-900"
      />
    </div>
  );
}
