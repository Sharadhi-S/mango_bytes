import {
  Shield,
  Briefcase,
  Star,
  MapPin,
  CheckCircle2,
  Clock,
  Languages,
  Calendar,
  IndianRupee,
  LogOut,
} from 'lucide-react';
import { useApp } from '@/AppContext';
import { getShramaId } from './ShramaIDScreen';
import { Card, ScreenHeader, Badge, Button, ProgressBar, formatINR } from './ui';
import { workerProfile } from '@/mockData';

export function ProfileScreen() {
  const { earnings, setRole, setScreen, registrationProfile } = useApp();

  const profile = registrationProfile;
  const displayName = profile?.name || '';
  const displaySkill = profile?.primarySkill || '';
  const displaySkills = profile?.skills?.length ? profile.skills : [];
  const displayLanguages = profile?.languages?.length ? profile.languages : [];
  const totalPaid = earnings.filter((e) => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
  const totalPending = earnings.filter((e) => e.status === 'pending').reduce((s, e) => s + e.amount, 0);

  return (
    <div className="px-5 pt-6 pb-24 max-w-2xl mx-auto">
      {/* Profile Header */}
      <Card className="overflow-hidden mb-5 animate-slide-up">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 h-24" />
        <div className="px-5 pb-5">
          <div className="-mt-10 mb-3">
            <div className="w-20 h-20 rounded-3xl bg-white p-1.5 shadow-card">
              <div className="w-full h-full rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-extrabold text-2xl">
                {displayName ? displayName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase() : '?'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-gray-900">{displayName || 'Your name'}</h1>

          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <MapPin size={14} /> {profile?.location || 'Location not provided'}
            <span>·</span>
            <Briefcase size={14} /> {displaySkill || 'Skill not provided'}
          </div>
        </div>
      </Card>

      {/* Entered registration details */}
      <Card className="p-4 mb-5 animate-slide-up">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Detail label="Mobile" value={profile?.phone || 'Not provided'} />
          <Detail label="Qualification" value={profile?.qualification || 'Not provided'} />
          <Detail label="Monthly income" value={profile?.monthlyIncome ? formatINR(profile.monthlyIncome) : 'Not provided'} />
          <Detail label="Emergency contact" value={profile?.emergencyContact || 'Not provided'} />
        </div>
      </Card>

      {/* Profile basics */}
      <Card className="p-4 mb-5 animate-slide-up">
        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-xs font-semibold text-gray-400">Gender</p><p className="font-bold text-gray-900 mt-1">{profile?.gender || 'Not provided'}</p></div>
          <button onClick={() => setScreen('shramId')} className="text-left rounded-xl p-2 -m-2 hover:bg-brand-50 transition-colors"><p className="text-xs font-semibold text-gray-400">ShramaID</p><p className="font-bold text-brand-700 mt-1">{getShramaId(profile?.name, profile?.phone)}</p><p className="text-[10px] text-brand-600 font-bold mt-1">Open ShramaID →</p></button>
        </div>
      </Card>

      {/* Verification Banner */}
      <Card className="p-4 mb-5 flex items-center gap-3 animate-slide-up">
        <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center text-accent-600">
          <Shield size={24} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-sm">Profile information</p>
          <p className="text-xs text-gray-500">Shown from the details you entered during prototype registration.</p>
        </div>
        <CheckCircle2 size={20} className="text-accent-500" />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <Card className="p-3 text-center">
          <p className="text-xl font-extrabold text-gray-900">{profile ? '—' : workerProfile.workCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Jobs Done</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-extrabold text-gray-900">{profile?.experience || '—'}</p>
          <p className="text-xs text-gray-400 mt-0.5">Experience</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-extrabold text-gray-900 flex items-center justify-center gap-0.5">
            4.8 <Star size={14} className="text-warning-500 fill-warning-500" />
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Rating</p>
        </Card>
      </div>

      {/* Skills */}
      <SectionTitle>Skills</SectionTitle>
      <Card className="p-4 mb-5 animate-slide-up">
        <div className="flex flex-wrap gap-2">
          {displaySkills.map((skill) => (
            <Badge key={skill} color="blue">{skill}</Badge>
          ))}
        </div>
      </Card>

      {/* Availability */}
      <SectionTitle>Availability</SectionTitle>
      <Card className="p-4 mb-5 animate-slide-up flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center text-accent-600">
            <Clock size={20} />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Currently Available</p>
        </div>
        <Badge color="green">Available</Badge>
      </Card>

      {/* Languages */}
      <SectionTitle>Languages</SectionTitle>
      <Card className="p-4 mb-5 animate-slide-up">
        <div className="flex flex-wrap gap-2">
          {displayLanguages.map((lang) => (
            <div key={lang} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50">
              <Languages size={14} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">{lang}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Work History */}
      <SectionTitle>Work History</SectionTitle>
      <div className="space-y-2 mb-5">
        {profile ? [] : workerProfile.workHistory.map((wh, i) => (
          <Card key={i} className="p-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                <Briefcase size={18} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{wh.job}</p>
                <p className="text-xs text-gray-500">{wh.employer}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={12} />
                {wh.duration}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Payment Summary */}
      <SectionTitle>Payment History Summary</SectionTitle>
      <Card className="p-4 mb-5 animate-slide-up">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <IndianRupee size={14} />
              <span className="text-xs font-semibold">Total Received</span>
            </div>
            <p className="text-xl font-extrabold text-accent-600">{formatINR(totalPaid)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-gray-400 mb-1">
              <Clock size={14} />
              <span className="text-xs font-semibold">Pending</span>
            </div>
            <p className="text-xl font-extrabold text-warning-600">{formatINR(totalPending)}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Payment reliability</span>
            <span className="font-semibold text-accent-600">95%</span>
          </div>
          <div className="mt-2">
            <ProgressBar value={95} max={100} colorClass="bg-accent-500" />
          </div>
        </div>
      </Card>

      <Card className="p-4 mb-5 animate-slide-up flex items-center justify-between cursor-pointer" onClick={() => setScreen('insurance')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Shield size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Insurance</p>
            <p className="text-xs text-gray-500">View yearly protection and skill-based insurance recommendations</p>
          </div>
        </div>
        <span className="text-xs font-bold text-brand-600">View</span>
      </Card>

      {/* Logout */}
      <Button variant="ghost" className="w-full text-error-600 hover:bg-error-50" onClick={() => setRole(null)}>
        <LogOut size={18} className="mr-2" /> Switch Role
      </Button>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-gray-50 p-3"><p className="text-[10px] font-semibold text-gray-400">{label}</p><p className="text-sm font-bold text-gray-800 mt-1 break-words">{value}</p></div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-gray-700 mb-3">{children}</h2>;
}
