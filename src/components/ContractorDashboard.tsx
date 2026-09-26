import {
  Users,
  Briefcase,
  Calendar,
  CreditCard,
  MessageSquare,
  IndianRupee,
  AlertCircle,
  ArrowRight,
  User,
  Languages,
  GraduationCap,
  ArrowLeftRight,
  ChevronRight,
  Phone,
  MapPin,
  X,
  Home,
} from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, formatINR } from './ui';
import { contractorStats } from '@/mockData';

export function ContractorDashboard({ showProfileInitially = false }: { showProfileInitially?: boolean }) {
  const { setScreen, setRole, wages, postedJobs, attendance, registrationProfile, role } = useApp();
  const [showProfile, setShowProfile] = useState(showProfileInitially);
  const [showSwitchUser, setShowSwitchUser] = useState(false);
  const roleLabel = role === 'employer' ? 'Employer' : 'Contractor';

  const pendingWages = wages.filter((w) => w.status === 'pending').reduce((s, w) => s + w.totalEarned, 0);
  const presentCount = attendance.filter((a) => a.status === 'present').length;

  const stats = [
    { label: 'Active Workers', value: contractorStats.activeWorkers, icon: Users, color: 'bg-brand-50 text-brand-600' },
    { label: 'Present Today', value: presentCount, icon: Calendar, color: 'bg-accent-50 text-accent-600' },
    { label: 'Pending Wages', value: formatINR(pendingWages), icon: IndianRupee, color: 'bg-warning-50 text-warning-600' },
    { label: 'Open Jobs', value: postedJobs.length, icon: Briefcase, color: 'bg-error-50 text-error-600' },
  ];

  const quickActions = [
    { label: 'Find Workers', icon: Users, screen: 'workers' as const, color: 'bg-brand-50 text-brand-600' },
    { label: 'Post Job', icon: Briefcase, screen: 'postJob' as const, color: 'bg-warning-50 text-warning-600' },
    { label: 'Attendance', icon: Calendar, screen: 'attendance' as const, color: 'bg-warning-50 text-warning-600' },
    { label: 'Wages', icon: CreditCard, screen: 'wages' as const, color: 'bg-error-50 text-error-600' },
    { label: 'Messages', icon: MessageSquare, screen: 'messages' as const, color: 'bg-brand-50 text-brand-600' },
    { label: 'Home Work', icon: Home, screen: 'homeWork' as const, color: 'bg-purple-50 text-purple-600' },
  ];

  const switchToStartingPage = () => {
    setShowSwitchUser(false);
    // Clear the current role so AppContent returns to the starting role-selection page.
    setRole(null);
    setScreen('home');
  };

  if (showProfile) {
    return (
      <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setShowProfile(false); setScreen('home'); }}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 active:scale-95 transition-transform"
            aria-label="Back to dashboard"
          >
            <ArrowRight size={19} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{roleLabel} Profile</h1>
            <p className="text-xs text-gray-500">Professional information</p>
          </div>
        </div>

        <Card className="p-5 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-extrabold">
              {(registrationProfile?.name || 'Contractor').split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-gray-900">{registrationProfile?.name || 'Your name'}</h2>
              <p className="text-sm text-gray-500">{registrationProfile?.company || roleLabel} · {roleLabel}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                <MapPin size={14} />
                <span>{registrationProfile?.location || 'Location not provided'}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400">Qualification</p>
                <p className="font-bold text-gray-900 mt-0.5">{registrationProfile?.qualification || 'Qualification not provided'}</p>
                <p className="text-xs text-gray-500 mt-1">Experience: {registrationProfile?.experience || 'Not provided'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
                <Languages size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400">Languages</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(registrationProfile?.languages?.length ? registrationProfile.languages : []).map((language) => (
                    <span key={language} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning-50 text-warning-600 flex items-center justify-center">
                <Phone size={19} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400">Contact</p>
                <p className="font-bold text-gray-900 mt-0.5">{registrationProfile?.phone || 'Mobile number not provided'}</p>
              </div>
            </div>
          </Card>
        </div>

        <button
          onClick={() => setShowSwitchUser(true)}
          className="w-full mt-5 p-4 rounded-2xl bg-gray-900 text-white flex items-center justify-between active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <ArrowLeftRight size={20} />
            <div className="text-left">
              <p className="font-bold text-sm">Switch User</p>
              <p className="text-xs text-gray-300">Switch between Employer, Contractor and Labourer</p>
            </div>
          </div>
          <ChevronRight size={18} />
        </button>

        {showSwitchUser && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
            <Card className="w-full max-w-md p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-gray-900">Switch User</h3>
                  <p className="text-xs text-gray-500 mt-1">Choose the account type to continue</p>
                </div>
                <button
                  onClick={() => setShowSwitchUser(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </div>

              <button
                onClick={() => setShowSwitchUser(false)}
                className="w-full p-4 rounded-2xl border border-brand-200 bg-brand-50 flex items-center gap-3 mb-2"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                  <Briefcase size={19} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-gray-900">Contractor</p>
                  <p className="text-xs text-gray-500">Kumar Constructions</p>
                </div>
                <span className="text-xs font-bold text-brand-600">Current</span>
              </button>

              <button
                onClick={switchToStartingPage}
                className="w-full p-4 rounded-2xl border border-gray-200 bg-white flex items-center gap-3 hover:bg-gray-50"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                  <User size={19} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-gray-900">Switch User</p>
                  <p className="text-xs text-gray-500">Return to the starting page and choose a role</p>
                </div>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8">
      <div className="flex items-start justify-between gap-3 mb-6">
        <ScreenHeader title="Dashboard" subtitle={registrationProfile?.company || registrationProfile?.name || `${roleLabel} workspace`} />
        <button
          onClick={() => setShowProfile(true)}
          className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Open contractor profile"
        >
          <User size={21} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-4 animate-slide-up">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      <h2 className="text-sm font-bold text-gray-700 mb-3">Quick Actions</h2>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-5 px-5 lg:mx-0 lg:px-0">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => setScreen(action.screen)}
              className="flex flex-col items-center gap-2 group flex-shrink-0"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${action.color} group-active:scale-95 transition-transform`}>
                <Icon size={26} strokeWidth={2} />
              </div>
              <span className="text-xs font-semibold text-gray-600 text-center leading-tight whitespace-nowrap">{action.label}</span>
            </button>
          );
        })}
      </div>

      {pendingWages > 0 && (
        <Card className="p-4 mb-5 flex items-center gap-3 border-l-4 border-l-warning-500 animate-slide-up" onClick={() => setScreen('wages')}>
          <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center text-warning-600 flex-shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">Pending Wage Payments</p>
            <p className="text-xs text-gray-500">{formatINR(pendingWages)} to be paid to workers</p>
          </div>
          <ArrowRight size={18} className="text-gray-300" />
        </Card>
      )}

      <Card className="p-4 mb-5 bg-brand-50 border-brand-100">
        <div className="flex items-center justify-between mb-3">
          <div><p className="font-extrabold text-gray-900">Smart Workforce Insights</p><p className="text-xs text-gray-500">Hiring designed for local blue-collar and technical work</p></div>
          <button onClick={() => setScreen('workers')} className="text-xs font-bold text-brand-600">Find workers</button>
        </div>
        <div className="space-y-2">
          <div className="rounded-xl bg-white p-3"><p className="text-xs font-extrabold text-gray-900">Profile-first hiring</p><p className="text-xs text-gray-500 mt-1">ITI and diploma workers do not need a polished corporate CV. ShramaID highlights practical skills, credentials and past work instead.</p></div>
          <div className="rounded-xl bg-white p-3"><p className="text-xs font-extrabold text-gray-900">Hyper-local matching</p><p className="text-xs text-gray-500 mt-1">Prioritise workers within a practical <b>5–15 km</b> radius, so local jobs can be filled without expecting low-wage workers to relocate.</p></div>
          <div className="rounded-xl bg-white p-3"><p className="text-xs font-extrabold text-gray-900">Local businesses can hire directly</p><p className="text-xs text-gray-500 mt-1">Auto garages, small manufacturing units, electricians and other micro-enterprises can post requirements instead of relying only on posters or word-of-mouth.</p></div>
          <div className="rounded-xl bg-white p-3"><p className="text-xs font-extrabold text-gray-900">Up-skilling bridge</p><p className="text-xs text-gray-500 mt-1">Workers can be connected to short courses and micro-credentials for modern machinery, solar PV, EV charging and other industry needs.</p></div>
        </div>
      </Card>

      <h2 className="text-sm font-bold text-gray-700 mb-3">Open Job Requirements</h2>
      <div className="space-y-2">
        {postedJobs.map((job) => (
          <Card key={job.id} className="p-4 animate-slide-up" onClick={() => setScreen('postJob')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                  <Briefcase size={20} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{job.title}</p>
                  <p className="text-xs text-gray-500">{job.workersNeeded} workers · {job.location}</p>
                </div>
              </div>
              <span className="text-sm font-bold text-brand-600 flex-shrink-0">{formatINR(job.dailyWage)}/day</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
