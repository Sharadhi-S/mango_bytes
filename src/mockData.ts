import type {
  EarningEntry,
  SavingsGoal,
  JobListing,
  Conversation,
  WorkerProfile,
  ContractorWorker,
  AttendanceRow,
  WageRow,
} from './types';

export const workerProfile: WorkerProfile = {
  name: 'Ravi Kumar',
  avatar: 'RK',
  primarySkill: 'Mason',
  skills: ['Mason', 'Construction Helper', 'Plastering'],
  experience: '4 years',
  workHistory: [
    { job: 'Residential Construction', employer: 'Kumar Constructions', duration: '3 months' },
    { job: 'Commercial Site', employer: 'Shree Builders', duration: '2 months' },
    { job: 'Road Repair', employer: 'Mysuru Municipal', duration: '1 month' },
  ],
  languages: ['Hindi', 'Kannada', 'Basic English'],
  availability: 'Available',
  verified: true,
  workCount: 28,
  location: 'Mysuru',
};

export const initialEarnings: EarningEntry[] = [
  {
    id: 'e1',
    date: 'Today',
    label: 'Today',
    employer: 'Kumar Constructions',
    work: 'Residential construction',
    hoursOrDays: '8 hours',
    amount: 700,
    status: 'paid',
  },
  {
    id: 'e2',
    date: 'Yesterday',
    label: 'Yesterday',
    employer: 'Kumar Constructions',
    work: 'Residential construction',
    hoursOrDays: '8 hours',
    amount: 700,
    status: 'paid',
  },
  {
    id: 'e3',
    date: 'Sep 14',
    label: 'Sep 14',
    employer: 'Kumar Constructions',
    work: 'Residential construction',
    hoursOrDays: '2 days',
    amount: 1400,
    status: 'paid',
  },
  {
    id: 'e4',
    date: 'Sep 12',
    label: 'Sep 12',
    employer: 'Shree Builders',
    work: 'Plastering work',
    hoursOrDays: '1 day',
    amount: 700,
    status: 'pending',
  },
  {
    id: 'e5',
    date: 'Sep 10',
    label: 'Sep 10',
    employer: 'Kumar Constructions',
    work: 'Residential construction',
    hoursOrDays: '8 hours',
    amount: 700,
    status: 'paid',
  },
  {
    id: 'e6',
    date: 'Sep 7',
    label: 'Sep 7',
    employer: 'Mysuru Municipal',
    work: 'Road repair',
    hoursOrDays: '3 days',
    amount: 2100,
    status: 'paid',
  },
];

export const initialSavingsGoals: SavingsGoal[] = [
  {
    id: 'emergency',
    name: 'Emergency Fund',
    icon: 'shield',
    current: 1500,
    target: 5000,
    color: 'brand',
  },
  {
    id: 'family',
    name: 'Family',
    icon: 'heart',
    current: 800,
    target: 3000,
    color: 'accent',
  },
  {
    id: 'festival',
    name: 'Festival',
    icon: 'sparkles',
    current: 400,
    target: 2000,
    color: 'warning',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'book',
    current: 600,
    target: 4000,
    color: 'brand',
  },
];

export const initialJobs: JobListing[] = [
  {
    id: 'j1',
    title: 'Construction Helper',
    location: 'Mysuru',
    dailyWage: 700,
    duration: '15 days',
    skill: 'No experience required',
    distance: '2 km away',
    applied: false,
  },
  {
    id: 'j2',
    title: 'Mason',
    location: 'Mysuru',
    dailyWage: 1000,
    duration: '30 days',
    skill: '2+ years experience',
    distance: '4 km away',
    applied: false,
  },
  {
    id: 'j3',
    title: 'Plastering Work',
    location: 'Mysuru',
    dailyWage: 850,
    duration: '10 days',
    skill: '1+ year experience',
    distance: '3 km away',
    applied: false,
  },
  {
    id: 'j4',
    title: 'Tile Fitter',
    location: 'Mysuru',
    dailyWage: 900,
    duration: '20 days',
    skill: '2+ years experience',
    distance: '6 km away',
    applied: false,
  },
  {
    id: 'j5',
    title: 'Site Supervisor Helper',
    location: 'Mysuru',
    dailyWage: 600,
    duration: '45 days',
    skill: 'No experience required',
    distance: '5 km away',
    applied: false,
  },
];

export const initialConversations: Conversation[] = [
  {
    id: 'c1',
    name: 'Kumar Constructions',
    role: 'Employer',
    lastMessage: 'Please report to Site B tomorrow at 8:00 AM.',
    time: '10:30 AM',
    unread: 1,
    messages: [
      { id: 'm1', sender: 'contractor', text: 'Please report to Site B tomorrow at 8:00 AM.', time: '10:30 AM' },
      { id: 'm2', sender: 'worker', text: 'Okay, I will be there.', time: '10:32 AM' },
      { id: 'm3', sender: 'contractor', text: 'Bring your tools. We are working on the second floor.', time: '10:35 AM' },
    ],
  },
  {
    id: 'c2',
    name: 'Shree Builders',
    role: 'Employer',
    lastMessage: 'Your payment for Sep 12 is pending.',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'm4', sender: 'contractor', text: 'Your payment for Sep 12 is pending.', time: 'Yesterday' },
      { id: 'm5', sender: 'worker', text: 'When will it be ready?', time: 'Yesterday' },
    ],
  },
];

export const initialContractorWorkers: ContractorWorker[] = [
  { id: 'w1', name: 'Ravi Kumar', primarySkill: 'Mason', experience: '4 years', location: 'Mysuru', availability: 'Available', workCount: 28, verified: true, avatar: 'RK' },
  { id: 'w2', name: 'Suresh Patel', primarySkill: 'Construction Helper', experience: '2 years', location: 'Mysuru', availability: 'Available', workCount: 15, verified: true, avatar: 'SP' },
  { id: 'w3', name: 'Mahesh Yadav', primarySkill: 'Plastering', experience: '5 years', location: 'Mysuru', availability: 'Busy', workCount: 42, verified: true, avatar: 'MY' },
  { id: 'w4', name: 'Lakshman Reddy', primarySkill: 'Tile Fitter', experience: '3 years', location: 'Mysuru', availability: 'Available', workCount: 20, verified: false, avatar: 'LR' },
  { id: 'w5', name: 'Imran Khan', primarySkill: 'Mason', experience: '6 years', location: 'Mysuru', availability: 'Available', workCount: 50, verified: true, avatar: 'IK' },
  { id: 'w6', name: 'Ganesh Naik', primarySkill: 'Construction Helper', experience: '1 year', location: 'Mysuru', availability: 'Available', workCount: 8, verified: false, avatar: 'GN' },
  { id: 'w7', name: 'Arjun Singh', primarySkill: 'Plastering', experience: '3 years', location: 'Mysuru', availability: 'Busy', workCount: 25, verified: true, avatar: 'AS' },
];

export const initialAttendance: AttendanceRow[] = [
  { id: 'a1', name: 'Ravi Kumar', job: 'Mason', status: 'present', hours: 8, dailyWage: 700 },
  { id: 'a2', name: 'Suresh Patel', job: 'Helper', status: 'present', hours: 8, dailyWage: 500 },
  { id: 'a3', name: 'Mahesh Yadav', job: 'Plastering', status: 'half', hours: 4, dailyWage: 600 },
  { id: 'a4', name: 'Lakshman Reddy', job: 'Tile Fitter', status: 'absent', hours: 0, dailyWage: 800 },
  { id: 'a5', name: 'Imran Khan', job: 'Mason', status: 'present', hours: 8, dailyWage: 700 },
  { id: 'a6', name: 'Ganesh Naik', job: 'Helper', status: 'present', hours: 6, dailyWage: 500 },
];

export const initialWages: WageRow[] = [
  { id: 'wg1', name: 'Ravi Kumar', daysWorked: 6, dailyWage: 700, totalEarned: 4200, status: 'paid' },
  { id: 'wg2', name: 'Suresh Patel', daysWorked: 5, dailyWage: 500, totalEarned: 2500, status: 'pending' },
  { id: 'wg3', name: 'Mahesh Yadav', daysWorked: 4, dailyWage: 600, totalEarned: 2400, status: 'pending' },
  { id: 'wg4', name: 'Imran Khan', daysWorked: 6, dailyWage: 700, totalEarned: 4200, status: 'paid' },
  { id: 'wg5', name: 'Ganesh Naik', daysWorked: 3, dailyWage: 500, totalEarned: 1500, status: 'pending' },
];

export const initialPostedJobs = [
  {
    id: 'pj1',
    title: 'Construction Helper',
    skill: 'No experience required',
    workersNeeded: 5,
    location: 'Site A, Mysuru',
    dailyWage: 700,
    startDate: 'Sep 20',
    duration: '15 days',
    description: 'Need helpers for residential building construction.',
  },
  {
    id: 'pj2',
    title: 'Mason',
    skill: '2+ years experience',
    workersNeeded: 3,
    location: 'Site B, Mysuru',
    dailyWage: 1000,
    startDate: 'Sep 22',
    duration: '30 days',
    description: 'Experienced masons for commercial complex construction.',
  },
];

export const workerStats = {
  todayEarnings: 700,
  monthlyEarnings: 12600,
  availableBalance: 8450,
  emergencySavings: 1500,
  currentJob: 'Residential Construction',
  currentEmployer: 'Kumar Constructions',
};

export const contractorStats = {
  activeWorkers: 12,
  presentToday: 10,
  pendingWages: 6400,
  openRequirements: 2,
};

export const todayEarningsBreakdown = [
  { label: 'Available to use', amount: 500, color: 'bg-brand-500' },
  { label: 'Auto-saved', amount: 100, color: 'bg-accent-500' },
  { label: 'Pending settlement', amount: 100, color: 'bg-warning-500' },
];
