export type Role = 'labourer' | 'contractor' | 'employer' | 'skilledWorker';

export type ScreenId =
  | 'home'
  | 'earnings'
  | 'savings'
  | 'jobs'
  | 'messages'
  | 'profile'
  | 'workers'
  | 'postJob'
  | 'attendance'
  | 'wages'
  | 'register'
  | 'insurance'
  | 'homeWork'
  | 'shramId'
  | 'auth'
  | 'alerts';


export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';

export type WorkerAvailability = 'available' | 'unavailable';
export type DailyWorkStatus = 'todayTimeUp' | 'workDone' | 'sickLeave' | 'festivalLeave';

export interface RegistrationProfile {
  name: string;
  phone: string;
  gender: Gender;
  primarySkill: string;
  category?: 'labourer' | 'skilledWorker';
  skills: string[];
  experience: string;
  qualification: string;
  languages: string[];
  location: string;
  monthlyIncome: number;
  company?: string;
  workersManaged?: number;
  emergencyContact: string;
}

export interface EarningEntry {
  id: string;
  date: string;
  label: string;
  employer: string;
  work: string;
  hoursOrDays: string;
  amount: number;
  status: 'paid' | 'pending';
}

export interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  current: number;
  target: number;
  color: string;
}

export interface JobListing {
  id: string;
  title: string;
  location: string;
  dailyWage: number;
  duration: string;
  skill: string;
  distance: string;
  profession?: string;
  applied: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'contractor' | 'worker';
  text: string;
  time: string;
  attachment?: { type: 'image' | 'location'; url?: string; name?: string };
}

export interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: ChatMessage[];
}

export interface WorkerProfile {
  name: string;
  avatar: string;
  skills: string[];
  experience: string;
  workHistory: { job: string; employer: string; duration: string }[];
  languages: string[];
  availability: string;
  verified: boolean;
  workCount: number;
  location: string;
  primarySkill: string;
}

export interface ContractorWorker {
  id: string;
  category: 'labourer' | 'skilledWorker';
  name: string;
  primarySkill: string;
  experience: string;
  location: string;
  availability: string;
  workCount: number;
  verified: boolean;
  avatar: string;
}

export interface AttendanceRow {
  id: string;
  name: string;
  job: string;
  status: 'present' | 'absent' | 'half';
  hours: number;
  dailyWage: number;
}

export interface WageRow {
  id: string;
  name: string;
  daysWorked: number;
  dailyWage: number;
  totalEarned: number;
  status: 'paid' | 'pending';
}

export interface PostedJob {
  id: string;
  title: string;
  skill: string;
  workersNeeded: number;
  location: string;
  dailyWage: number;
  startDate: string;
  duration: string;
  description: string;
}

export interface TenderWorkforceItem {
  id: string;
  skill: string;
  headcount: number;
  dailyWageRate: number;
  category: 'skilled' | 'semi-skilled' | 'unskilled';
  notes?: string;
}

export interface TenderMilestone {
  phase: string;
  durationWeeks: number;
  tradesInvolved: string[];
}

export interface DynamicFeeCalculation {
  budget: number;
  tenderValue?: number;
  ratePercent: number;
  tierPercentage?: number;
  baseFee: number;
  cgst: number;
  sgst: number;
  gst?: number;
  totalFee: number;
  tierLabel: string;
}

export interface ContractorMatch {
  id: string;
  name: string;
  companyName: string;
  company?: string;
  avatar: string;
  rating: number;
  trustScore: number;
  workforceCapacity: number;
  fleetCapacity?: string;
  specialties: string[];
  trades?: string[];
  location: string;
  matchScore: number;
  pastProjectsCount: number;
  completedTenders?: number;
  licenseVerified: boolean;
  verified?: boolean;
  licenses?: string[];
  contactNumber?: string;
  rfpSent?: boolean;
}

export type TenderStatus = 'draft' | 'analyzed' | 'requirements_configured' | 'fee_paid' | 'contractor_matched';

export interface Tender {
  id: string;
  title: string;
  dept: string;
  location: string;
  value: number;
  closing: string;
  category: string;
  match: number;
  duration: string;
  durationMonths?: number;
  skills: string[];
  eligibility: string[];
  docs: string[];
  workforceRequirements: TenderWorkforceItem[];
  milestones?: TenderMilestone[];
  scopeDescription?: string;
  boqDetails?: string;
  dynamicFee: DynamicFeeCalculation;
  status: TenderStatus;
  unlockedContractors?: ContractorMatch[];
  customTender?: boolean;
  createdAt?: string;
}

export interface WorkforcePlan {
  id: string;
  tenderId: string;
  createdAt: string;
  totalHeadcount: number;
  estimatedLaborCost: number;
  requirements: TenderWorkforceItem[];
}
