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
  | 'alerts'
  | 'projectDetail';


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
  sender: 'contractor' | 'worker' | 'employer';
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
  assignedCount?: number;
  dailyWageRate: number;
  category: 'skilled' | 'semi-skilled' | 'unskilled';
  notes?: string;
  requiredSkills?: string[];
  requiredExperience?: string;
  certifications?: string[];
}

export interface AssignedProjectWorker {
  id: string;
  workerId: string;
  name: string;
  role: string;
  category: 'labourer' | 'skilledWorker';
  dailyWage: number;
  phone: string;
  location: string;
  experience: string;
  matchScore: number;
  matchReasons: string[];
  assignedDate: string;
  daysWorked: number;
  attendanceToday: 'present' | 'absent' | 'half';
  wageStatus: 'paid' | 'pending';
  avatar: string;
}

export interface TenderOtherRequirements {
  workingHours?: string;
  accommodation?: string;
  transportation?: string;
  safety?: string;
  experience?: string;
  certifications?: string[];
  compliance?: string[];
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

export type TenderStatus = 'draft' | 'analyzed' | 'requirements_configured' | 'fee_paid' | 'contractor_matched' | 'active_fulfillment' | 'ready_to_deploy';

export interface Tender {
  id: string;
  tenderId?: string;
  title: string;
  client?: string;
  dept: string;
  location: string;
  value: number;
  closing: string;
  category: string;
  match: number;
  duration: string;
  durationMonths?: number;
  startDate?: string;
  endDate?: string;
  documentName?: string;
  documentSize?: string;
  aiExtracted?: boolean;
  skills: string[];
  eligibility: string[];
  docs: string[];
  workforceRequirements: TenderWorkforceItem[];
  milestones?: TenderMilestone[];
  scopeDescription?: string;
  boqDetails?: string;
  otherRequirements?: TenderOtherRequirements;
  assignedWorkers?: AssignedProjectWorker[];
  fulfillmentPercent?: number;
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

export interface ContractorRFP {
  id: string;
  projectId: string;
  projectTitle: string;
  employerId: string;
  employerName: string;
  contractorId: string;
  contractorName: string;
  status: 'sent' | 'accepted' | 'declined';
  budget: number;
  location: string;
  duration: string;
  headcountNeeded: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkerInvitation {
  id: string;
  projectId: string;
  projectTitle: string;
  contractorId: string;
  contractorName: string;
  workerId: string;
  workerName: string;
  skill: string;
  dailyWage: number;
  location: string;
  duration: string;
  status: 'invited' | 'accepted' | 'declined';
  createdAt: string;
  notes?: string;
}

export interface WorkerAssignment {
  id: string;
  projectId: string;
  projectTitle: string;
  contractorId: string;
  workerId: string;
  workerName: string;
  skill: string;
  dailyWage: number;
  expectedDays: number;
  expectedEarnings: number;
  status: 'assigned' | 'completed' | 'cancelled';
  assignedAt: string;
}

export interface AttendanceRecord {
  id: string;
  projectId: string;
  workerId: string;
  workerName: string;
  contractorId: string;
  date: string;
  status: 'present' | 'absent' | 'half';
  hours: number;
  wageEarned: number;
  notes?: string;
  createdAt: string;
}

export interface WageRecord {
  id: string;
  projectId: string;
  projectTitle: string;
  contractorId: string;
  workerId: string;
  workerName: string;
  periodStart: string;
  periodEnd: string;
  daysWorked: number;
  dailyWage: number;
  totalAmount: number;
  status: 'pending' | 'paid';
  disbursedDate?: string;
  paymentReference?: string;
  notes?: string;
}

export interface WorkerEarningsSummary {
  todayEarned: number;
  thisWeekEarned: number;
  thisMonthEarned: number;
  totalEarned: number;
  pendingPayout: number;
  paidPayout: number;
  daysPresentMonth: number;
  recentEntries: EarningEntry[];
}

export interface SavingsGoalDetail {
  id: string;
  workerId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  icon: string;
  color: string;
  status: 'active' | 'completed';
  createdAt: string;
  remaining: number;
  daysRemaining: number;
  recommendedDailyAmount: number;
}

export interface PlatformNotification {
  id: string;
  recipientId: string;
  recipientRole: Role;
  title: string;
  message: string;
  type: 'rfp' | 'invitation' | 'attendance' | 'wage' | 'message' | 'system';
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

export interface WorkerMatchScore {
  worker: ContractorWorker;
  score: number; // 0 - 100
  isAvailable: boolean;
  matchReasons: string[];
}
