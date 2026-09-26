import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import type {
  Role,
  ScreenId,
  EarningEntry,
  SavingsGoal,
  JobListing,
  Conversation,
  AttendanceRow,
  WageRow,
  PostedJob,
  ChatMessage,
  RegistrationProfile,
  WorkerAvailability,
  DailyWorkStatus,
  Tender,
  TenderWorkforceItem,
  AssignedProjectWorker,
  WorkforcePlan,
  ContractorRFP,
  WorkerInvitation,
  WorkerAssignment,
  AttendanceRecord,
  WageRecord,
  WorkerEarningsSummary,
  SavingsGoalDetail,
  PlatformNotification,
  WorkerMatchScore,
  ContractorWorker,
} from './types';
import {
  initialEarnings,
  initialSavingsGoals,
  initialJobs,
  initialConversations,
  initialAttendance,
  initialWages,
  initialPostedJobs,
  workerStats as initialWorkerStats,
} from './mockData';
import { t as translate, type LangCode } from './i18n';
import {
  getInitialEmployerState,
  saveEmployerState,
  calculateDynamicTenderFee,
  analyzeTenderEngine,
  generateSuitableContractors,
  BROADCAST_CHANNEL as EMPLOYER_CHANNEL,
} from './backend/employerBackend';

// Import service layer
import {
  getRfps,
  sendRfp as sendRfpService,
  respondToRfp as respondToRfpService,
  getRfpsForContractor,
  getRfpsForEmployer,
} from './services/rfps';
import {
  getWorkerInvitations,
  getWorkerAssignments,
  createWorkerInvitation as createInvitationService,
  respondToWorkerInvitation as respondToInvitationService,
  getActiveAssignmentForWorker,
} from './services/assignments';
import {
  getAttendanceRecords,
  getAttendanceForWorker,
  getAttendanceForProject,
  markAttendance as markAttendanceService,
} from './services/attendance';
import {
  getWageRecords,
  getWageRecordsForWorker,
  getWageRecordsForContractor,
  disburseWage as disburseWageService,
  bulkDisbursePendingWages as bulkDisburseService,
} from './services/wages';
import {
  computeWorkerEarnings,
  getWorkerEarningEntries,
} from './services/earnings';
import {
  getSavingsGoals,
  createSavingsGoal as createSavingsGoalService,
  addSavingsContribution as addSavingsContributionService,
} from './services/savings';
import {
  getConversationsForRole,
  sendMessage as sendRealtimeMessageService,
} from './services/messages';
import {
  getNotifications,
  createNotification as createNotificationService,
  markNotificationAsRead as markNotificationReadService,
  markAllNotificationsAsRead as markAllNotificationsReadService,
  getUnreadNotificationCount as getUnreadNotificationCountService,
} from './services/notifications';
import {
  getWorkers,
  matchWorkersForRequirement as matchWorkersService,
} from './services/workers';
import {
  subscribeToAllRealtime,
  broadcastRealtimeEvent,
} from './services/realtime';
import {
  selectContractorForProject as selectContractorService,
  getAggregatedProjectMetrics,
} from './services/projects';

interface WorkerStats {
  todayEarnings: number;
  monthlyEarnings: number;
  availableBalance: number;
  emergencySavings: number;
  currentJob: string;
  currentEmployer: string;
}

interface Toast {
  id: number;
  message: string;
}

export interface AppContextValue {
  role: Role | null;
  setRole: (r: Role | null) => void;
  screen: ScreenId;
  setScreen: (s: ScreenId) => void;
  goBack: () => void;
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
  toasts: Toast[];
  showToast: (message: string) => void;
  voiceActive: boolean;
  voiceText: string;
  playVoice: (text?: string) => void;
  stopVoice: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  resetPlatformData: () => void;

  // worker state
  earnings: EarningEntry[];
  savingsGoals: SavingsGoal[];
  jobs: JobListing[];
  conversations: Conversation[];
  workerStats: WorkerStats;
  saveMoney: (goalId: string, amount: number) => void;
  applyJob: (jobId: string) => void;
  sendMessage: (conversationId: string, text: string, attachment?: ChatMessage['attachment']) => void;
  markConversationRead: (conversationId: string) => void;
  transferToBank: () => void;

  // contractor state
  attendance: AttendanceRow[];
  wages: WageRow[];
  postedJobs: PostedJob[];
  setAttendanceStatus: (id: string, status: 'present' | 'absent' | 'half') => void;
  markWagePaid: (id: string) => void;
  postJob: (job: Omit<PostedJob, 'id'>) => void;
  workerSkill: string;
  setWorkerSkill: (skill: string) => void;
  monthlySalary: number;
  setMonthlySalary: (salary: number) => void;
  registrationProfile: RegistrationProfile | null;
  setRegistrationProfile: (profile: RegistrationProfile, options?: { showWellbeing?: boolean }) => void;
  showWellbeingAlertNow: () => void;
  availability: WorkerAvailability;
  dailyWorkStatus: DailyWorkStatus;
  setAvailability: (value: WorkerAvailability) => void;
  setDailyWorkStatus: (value: DailyWorkStatus) => void;
  wellbeingAlertOpen: boolean;
  dismissWellbeingAlert: () => void;

  // employer real-time state
  tenders: Tender[];
  savedTenderIds: string[];
  workforcePlans: Record<string, WorkforcePlan>;
  partnerRequests: Record<string, boolean>;
  createAndAnalyzeTender: (data: {
    title: string;
    dept: string;
    location: string;
    value: number;
    durationMonths: number;
    category: string;
    scopeDescription: string;
    boqDetails?: string;
  }) => Tender;
  updateTenderWorkforceRequirements: (tenderId: string, requirements: TenderWorkforceItem[]) => void;
  payTenderFeeAndUnlockContractors: (tenderId: string, paymentMethod: string) => void;
  sendRfpToContractor: (tenderId: string, contractorId: string) => void;
  toggleSaveTender: (tenderId: string) => void;
  createWorkforcePlan: (tenderId: string, requirements?: TenderWorkforceItem[]) => WorkforcePlan;
  requestPartnerConnection: (categoryName: string) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  addTender: (newTender: Tender) => void;
  updateTender: (updatedTender: Tender) => void;
  assignWorkerToProject: (tenderId: string, worker: AssignedProjectWorker) => void;
  updateProjectWorkerAttendance: (tenderId: string, workerId: string, status: 'present' | 'absent' | 'half') => void;
  markProjectWorkerWagePaid: (tenderId: string, workerId: string) => void;
  markAllProjectWorkersPresent: (tenderId: string) => void;
  payAllProjectWages: (tenderId: string) => void;

  // Real-time Service Layer Extensions
  rfps: ContractorRFP[];
  sendRfp: (params: {
    projectId: string;
    projectTitle: string;
    employerId: string;
    employerName: string;
    contractorId: string;
    contractorName: string;
    budget: number;
    location: string;
    duration: string;
    headcountNeeded: number;
    message: string;
  }) => ContractorRFP;
  respondToRfp: (rfpId: string, status: 'accepted' | 'declined', responseNotes?: string) => void;
  selectContractor: (projectId: string, contractorId: string, contractorName: string) => void;

  // Worker Invitations & Assignments
  invitations: WorkerInvitation[];
  assignments: WorkerAssignment[];
  activeAssignment: WorkerAssignment | undefined;
  inviteWorker: (params: {
    projectId: string;
    projectTitle: string;
    contractorId: string;
    contractorName: string;
    workerId: string;
    workerName: string;
    skill: string;
    dailyWage: number;
    location: string;
    duration?: string;
    notes?: string;
  }) => WorkerInvitation;
  respondToInvitation: (invitationId: string, status: 'accepted' | 'declined') => void;

  // Attendance & Wage Ledger
  attendanceRecords: AttendanceRecord[];
  markAttendanceRecord: (params: {
    projectId: string;
    workerId: string;
    workerName: string;
    contractorId: string;
    status: 'present' | 'half' | 'absent';
    dailyWage: number;
    notes?: string;
  }) => AttendanceRecord;
  wageRecords: WageRecord[];
  disburseWageRecord: (recordId: string, reference?: string) => void;
  bulkDisburseWageRecords: (contractorId?: string) => void;

  // Worker Earnings
  workerEarningsSummary: WorkerEarningsSummary;

  // Savings Goals
  savingsGoalsDetailed: SavingsGoalDetail[];
  createSavingsGoalDetailed: (params: {
    workerId: string;
    title: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate: string;
    category?: string;
    icon?: string;
    color?: string;
  }) => SavingsGoalDetail;
  addSavingsContributionDetailed: (goalId: string, amount: number, note?: string) => void;

  // Notifications
  notifications: PlatformNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Workers Directory & Smart Matching
  workersDirectory: ContractorWorker[];
  matchWorkersForTrade: (skill: string, maxWage?: number, location?: string) => WorkerMatchScore[];
  projectMetrics: (projectId: string) => ReturnType<typeof getAggregatedProjectMetrics>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('shrama-role') : null;
    return (saved as Role) || null;
  });
  const [screen, setScreenState] = useState<ScreenId>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>([]);

  const setRole = useCallback((nextRole: Role | null) => {
    setRoleState(nextRole);
    if (nextRole) {
      localStorage.setItem('shrama-role', nextRole);
    } else {
      localStorage.removeItem('shrama-role');
    }
    setScreenHistory([]);
  }, []);

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('shrama-theme') as 'light' | 'dark';
      if (stored) return stored;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('shrama-theme', next);
        if (typeof document !== 'undefined') {
          if (next === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (e) {}
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const resetPlatformData = useCallback(() => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('shramasetu') || key.startsWith('shrama-') || key.startsWith('shrama_'))) {
          if (key !== 'shrama-theme') {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
    window.location.reload();
  }, []);

  const [workerSkill, setWorkerSkill] = useState('Mason');
  const [monthlySalary, setMonthlySalary] = useState(18000);
  const [registrationProfile, setRegistrationProfileState] = useState<RegistrationProfile | null>(() => {
    return {
      name: 'Rajesh Kumar',
      company: 'Kumar Construction Services',
      phone: '+91 98450 12345',
      location: 'Belagavi, Karnataka',
      primarySkill: 'Civil Contractor',
      skills: ['Roads', 'Masonry', 'Earthwork', 'Concrete'],
      experience: '12 years',
      qualification: 'Diploma in Civil Engg',
      languages: ['Kannada', 'Hindi', 'English'],
      monthlyIncome: 85000,
      emergencyContact: '+91 98450 54321',
      gender: 'Male',
      workersManaged: 120,
    };
  });

  const [availability, setAvailability] = useState<WorkerAvailability>('available');
  const [dailyWorkStatus, setDailyWorkStatus] = useState<DailyWorkStatus>('workDone');
  const [wellbeingAlertOpen, setWellbeingAlertOpen] = useState(false);

  const wellbeingStorageKey = 'shrama-wellbeing-last-shown';

  const showWellbeingAlertNow = useCallback(() => {
    const now = Date.now();
    setWellbeingAlertOpen(true);
    localStorage.setItem(wellbeingStorageKey, String(now));
  }, []);

  const setRegistrationProfile = useCallback((profile: RegistrationProfile, options?: { showWellbeing?: boolean }) => {
    setRegistrationProfileState(profile);
    if (options?.showWellbeing !== false) showWellbeingAlertNow();
  }, [showWellbeingAlertNow]);

  const dismissWellbeingAlert = useCallback(() => {
    setWellbeingAlertOpen(false);
  }, []);

  // Worker active ID based on role
  const activeWorkerId = role === 'labourer' ? 'w2' : 'w1';

  // State slices
  const [earnings, setEarnings] = useState<EarningEntry[]>(() => getWorkerEarningEntries(activeWorkerId));
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialSavingsGoals);
  const [jobs, setJobs] = useState<JobListing[]>(initialJobs);
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    getConversationsForRole(role || 'contractor', activeWorkerId)
  );
  const [attendance, setAttendance] = useState<AttendanceRow[]>(initialAttendance);
  const [wages, setWages] = useState<WageRow[]>(initialWages);
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>(initialPostedJobs);
  const [workerStats, setWorkerStats] = useState<WorkerStats>(initialWorkerStats);

  // Real-time Service Layer States
  const [rfps, setRfps] = useState<ContractorRFP[]>(() => getRfps());
  const [invitations, setInvitations] = useState<WorkerInvitation[]>(() => getWorkerInvitations());
  const [assignments, setAssignments] = useState<WorkerAssignment[]>(() => getWorkerAssignments());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => getAttendanceRecords());
  const [wageRecords, setWageRecords] = useState<WageRecord[]>(() => getWageRecords());
  const [savingsGoalsDetailed, setSavingsGoalsDetailed] = useState<SavingsGoalDetail[]>(() => getSavingsGoals());
  const [notifications, setNotifications] = useState<PlatformNotification[]>(() => getNotifications(role || 'contractor'));
  const [workersDirectory, setWorkersDirectory] = useState<ContractorWorker[]>(() => getWorkers());

  // Worker live earnings computation
  const workerEarningsSummary = useMemo(() => {
    return computeWorkerEarnings(activeWorkerId);
  }, [activeWorkerId, attendanceRecords, wageRecords, assignments]);

  // Active assignment for worker
  const activeAssignment = useMemo(() => {
    return getActiveAssignmentForWorker(activeWorkerId);
  }, [activeWorkerId, assignments]);

  // Employer state
  const [employerState, setEmployerState] = useState(() => getInitialEmployerState());
  const [tenders, setTenders] = useState<Tender[]>(() => employerState.tenders);
  const [savedTenderIds, setSavedTenderIds] = useState<string[]>(() => employerState.savedTenderIds);
  const [workforcePlans, setWorkforcePlans] = useState<Record<string, WorkforcePlan>>(() => employerState.workforcePlans);
  const [partnerRequests, setPartnerRequests] = useState<Record<string, boolean>>(() => employerState.partnerRequests);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>('T-BELAGAVI-1042');

  // Sync employer state to localStorage
  useEffect(() => {
    const nextState = {
      tenders,
      savedTenderIds,
      workforcePlans,
      partnerRequests,
    };
    saveEmployerState(nextState);
  }, [tenders, savedTenderIds, workforcePlans, partnerRequests]);

  // Realtime subscription listener across tabs
  useEffect(() => {
    const unsub = subscribeToAllRealtime((event) => {
      switch (event.type) {
        case 'PROJECT_UPDATED':
          setTenders((prev) => {
            const index = prev.findIndex((t) => t.id === event.payload.id);
            if (index >= 0) {
              const copy = [...prev];
              copy[index] = event.payload;
              return copy;
            }
            return [event.payload, ...prev];
          });
          break;
        case 'RFP_CREATED':
        case 'RFP_UPDATED':
          setRfps(getRfps());
          break;
        case 'WORKER_INVITED':
        case 'INVITATION_UPDATED':
          setInvitations(getWorkerInvitations());
          break;
        case 'ASSIGNMENT_CREATED':
          setAssignments(getWorkerAssignments());
          break;
        case 'ATTENDANCE_MARKED':
          setAttendanceRecords(getAttendanceRecords());
          setEarnings(getWorkerEarningEntries(activeWorkerId));
          break;
        case 'WAGE_RECORD_UPDATED':
          setWageRecords(getWageRecords());
          setEarnings(getWorkerEarningEntries(activeWorkerId));
          break;
        case 'SAVINGS_GOAL_UPDATED':
          setSavingsGoalsDetailed(getSavingsGoals());
          break;
        case 'NOTIFICATION_CREATED':
          setNotifications(getNotifications(role || 'contractor'));
          break;
        case 'MESSAGE_SENT':
          setConversations(getConversationsForRole(role || 'contractor', activeWorkerId));
          break;
      }
    });

    return unsub;
  }, [role, activeWorkerId]);

  // Keep conversations and notifications refreshed on role change
  useEffect(() => {
    setConversations(getConversationsForRole(role || 'contractor', activeWorkerId));
    setNotifications(getNotifications(role || 'contractor'));
    setEarnings(getWorkerEarningEntries(activeWorkerId));
  }, [role, activeWorkerId]);

  // Language & UI
  const [lang, setLang] = useState<LangCode>(() => (localStorage.getItem('shrama-lang') as LangCode) || 'en');
  const changeLang = useCallback((value: LangCode) => {
    setLang(value);
    localStorage.setItem('shrama-lang', value);
  }, []);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const playVoice = useCallback((text?: string) => {
    const narration = text || translate(lang, 'voiceIntro');
    setVoiceText(narration);
    setVoiceActive(true);
  }, [lang]);

  const stopVoice = useCallback(() => {
    setVoiceActive(false);
  }, []);

  // Screen navigation
  const setScreen = useCallback((next: ScreenId) => {
    setScreenState((current) => {
      if (current === next) return current;
      setScreenHistory((history) => [...history, current]);
      return next;
    });
  }, []);

  const goBack = useCallback(() => {
    setScreenHistory((history) => {
      if (!history.length) {
        setScreenState('home');
        return history;
      }
      const previous = history[history.length - 1];
      setScreenState(previous);
      return history.slice(0, -1);
    });
  }, []);

  // Worker actions
  const saveMoney = useCallback((goalId: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, current: g.current + amount } : g))
    );
    addSavingsContributionService(goalId, amount);
    setSavingsGoalsDetailed(getSavingsGoals());
  }, []);

  const applyJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, applied: true } : j)));
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string, _attachment?: ChatMessage['attachment']) => {
    sendRealtimeMessageService({
      conversationId,
      senderRole: role || 'contractor',
      text,
      senderName: registrationProfile?.name || undefined,
    });
    setConversations(getConversationsForRole(role || 'contractor', activeWorkerId));
  }, [role, registrationProfile, activeWorkerId]);

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conversation) => (conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation))
    );
  }, []);

  const transferToBank = useCallback(() => {
    showToast('Simulation: ₹2,500 transferred to bank account (demo prototype).');
  }, [showToast]);

  const setAttendanceStatus = useCallback((id: string, status: 'present' | 'absent' | 'half') => {
    setAttendance((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const hours = status === 'present' ? 8 : status === 'half' ? 4 : 0;
        return { ...a, status, hours };
      })
    );
  }, []);

  const markWagePaid = useCallback((id: string) => {
    setWages((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'paid' } : w)));
  }, []);

  const postJob = useCallback((job: Omit<PostedJob, 'id'>) => {
    setPostedJobs((prev) => [{ ...job, id: `pj-${Date.now()}` }, ...prev]);
  }, []);

  // Employer actions
  const createAndAnalyzeTender = useCallback((data: {
    title: string;
    dept: string;
    location: string;
    value: number;
    durationMonths: number;
    category: string;
    scopeDescription: string;
    boqDetails?: string;
  }) => {
    const dynamicFee = calculateDynamicTenderFee(data.value);
    const analysis = analyzeTenderEngine(
      data.title,
      data.category,
      data.value,
      data.durationMonths,
      data.location,
      data.scopeDescription
    );

    const newTender: Tender = {
      id: 'T-' + Math.floor(1000 + Math.random() * 9000),
      title: data.title,
      dept: data.dept || 'Private Commercial',
      location: data.location,
      value: data.value,
      closing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      category: data.category,
      match: 92,
      duration: data.durationMonths + ' months',
      durationMonths: data.durationMonths,
      skills: analysis.workforceRequirements.map((r) => r.skill),
      eligibility: analysis.eligibility,
      docs: analysis.docs,
      workforceRequirements: analysis.workforceRequirements,
      milestones: analysis.milestones,
      scopeDescription: data.scopeDescription,
      boqDetails: data.boqDetails,
      dynamicFee,
      status: 'analyzed',
      customTender: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTenders((prev) => [newTender, ...prev]);
    broadcastRealtimeEvent('PROJECT_UPDATED', newTender);
    return newTender;
  }, []);

  const updateTenderWorkforceRequirements = useCallback((tenderId: string, requirements: TenderWorkforceItem[]) => {
    const updatedSkills = requirements.map((r) => r.skill);
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const updated = {
          ...t,
          skills: updatedSkills,
          workforceRequirements: requirements,
          status: t.status === 'analyzed' ? ('requirements_configured' as const) : t.status,
        };
        broadcastRealtimeEvent('PROJECT_UPDATED', updated);
        return updated;
      })
    );
  }, []);

  const payTenderFeeAndUnlockContractors = useCallback((tenderId: string, _paymentMethod: string) => {
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const matches = generateSuitableContractors(t, t.workforceRequirements);
        const updated = {
          ...t,
          status: 'contractor_matched' as const,
          unlockedContractors: matches,
        };
        broadcastRealtimeEvent('PROJECT_UPDATED', updated);
        return updated;
      })
    );
  }, []);

  const sendRfpToContractor = useCallback((tenderId: string, contractorId: string) => {
    const targetTender = tenders.find((t) => t.id === tenderId);
    if (!targetTender) return;

    sendRfpService({
      projectId: targetTender.id,
      projectTitle: targetTender.title,
      employerId: 'emp-demo',
      employerName: 'Demo Infrastructure Pvt Ltd',
      contractorId,
      contractorName: 'Kumar Construction Services',
      budget: targetTender.value,
      location: targetTender.location,
      duration: targetTender.duration || '6 Months',
      headcountNeeded: targetTender.workforceRequirements.reduce((sum, r) => sum + r.headcount, 0) || 100,
      message: `We invite Kumar Construction Services to fulfill the workforce requirements for "${targetTender.title}".`,
    });

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const updatedContractors = (t.unlockedContractors || []).map((c) =>
          c.id === contractorId ? { ...c, rfpSent: true } : c
        );
        return { ...t, unlockedContractors: updatedContractors };
      })
    );

    setRfps(getRfps());
  }, [tenders]);

  const toggleSaveTender = useCallback((tenderId: string) => {
    setSavedTenderIds((prev) =>
      prev.includes(tenderId) ? prev.filter((id) => id !== tenderId) : [...prev, tenderId]
    );
  }, []);

  const createWorkforcePlan = useCallback((tenderId: string, requirements?: TenderWorkforceItem[]) => {
    const targetTender = tenders.find((t) => t.id === tenderId);
    const reqs = requirements || targetTender?.workforceRequirements || [];
    const totalCount = reqs.reduce((sum, r) => sum + r.headcount, 0);
    const totalCost = reqs.reduce((sum, r) => sum + r.headcount * r.dailyWageRate, 0);

    const plan: WorkforcePlan = {
      id: 'wp-' + Date.now(),
      tenderId,
      createdAt: new Date().toISOString(),
      totalHeadcount: totalCount,
      estimatedLaborCost: totalCost,
      requirements: reqs,
    };

    setWorkforcePlans((prev) => ({ ...prev, [tenderId]: plan }));
    return plan;
  }, [tenders]);

  const requestPartnerConnection = useCallback((categoryName: string) => {
    setPartnerRequests((prev) => ({ ...prev, [categoryName]: true }));
  }, []);

  const addTender = useCallback((newTender: Tender) => {
    setTenders((prev) => {
      const updated = [newTender, ...prev.filter((t) => t.id !== newTender.id)];
      try {
        const state = getInitialEmployerState();
        saveEmployerState({
          ...state,
          tenders: updated,
        });
      } catch (e) {}
      return updated;
    });
    broadcastRealtimeEvent('PROJECT_UPDATED', newTender);
  }, []);

  const updateTender = useCallback((updatedTender: Tender) => {
    setTenders((prev) => {
      const updated = prev.map((t) => (t.id === updatedTender.id ? updatedTender : t));
      try {
        const state = getInitialEmployerState();
        saveEmployerState({
          ...state,
          tenders: updated,
        });
      } catch (e) {}
      return updated;
    });
    broadcastRealtimeEvent('PROJECT_UPDATED', updatedTender);
  }, []);

  const assignWorkerToProject = useCallback((tenderId: string, worker: AssignedProjectWorker) => {
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const currentWorkers = t.assignedWorkers || [];
        if (currentWorkers.some((w) => w.workerId === worker.workerId || w.id === worker.id)) {
          return t;
        }
        const updatedWorkers = [worker, ...currentWorkers];

        const updatedReqs = (t.workforceRequirements || []).map((r) => {
          const normSkill = r.skill.toLowerCase();
          const normWorkerRole = worker.role.toLowerCase();
          const matches =
            normSkill.includes(normWorkerRole) ||
            normWorkerRole.includes(normSkill) ||
            (normSkill.includes('operator') && normWorkerRole.includes('operator')) ||
            (normSkill.includes('mason') && normWorkerRole.includes('mason')) ||
            (normSkill.includes('helper') && (normWorkerRole.includes('helper') || normWorkerRole.includes('labour')));
          if (matches) {
            return { ...r, assignedCount: (r.assignedCount ?? 0) + 1 };
          }
          return r;
        });

        const totalReq = updatedReqs.reduce((sum, r) => sum + r.headcount, 0) || 100;
        const totalAssigned = updatedReqs.reduce((sum, r) => sum + (r.assignedCount ?? 0), 0);
        const fulfillmentPercent = Math.min(100, Math.round((totalAssigned / totalReq) * 100));
        const status = fulfillmentPercent >= 100 ? ('ready_to_deploy' as const) : t.status;

        const updated = {
          ...t,
          assignedWorkers: updatedWorkers,
          workforceRequirements: updatedReqs,
          fulfillmentPercent,
          status,
        };
        broadcastRealtimeEvent('PROJECT_UPDATED', updated);
        return updated;
      })
    );
  }, []);

  const updateProjectWorkerAttendance = useCallback((tenderId: string, workerId: string, status: 'present' | 'absent' | 'half') => {
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const updatedWorkers = (t.assignedWorkers || []).map((w) => {
          if (w.id === workerId || w.workerId === workerId) {
            return { ...w, attendanceToday: status };
          }
          return w;
        });
        const updated = { ...t, assignedWorkers: updatedWorkers };
        broadcastRealtimeEvent('PROJECT_UPDATED', updated);
        return updated;
      })
    );
  }, []);

  const markProjectWorkerWagePaid = useCallback((tenderId: string, workerId: string) => {
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const updatedWorkers = (t.assignedWorkers || []).map((w) => {
          if (w.id === workerId || w.workerId === workerId) {
            return { ...w, wageStatus: 'paid' as const };
          }
          return w;
        });
        const updated = { ...t, assignedWorkers: updatedWorkers };
        broadcastRealtimeEvent('PROJECT_UPDATED', updated);
        return updated;
      })
    );
  }, []);

  const markAllProjectWorkersPresent = useCallback((tenderId: string) => {
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const updatedWorkers = (t.assignedWorkers || []).map((w) => ({
          ...w,
          attendanceToday: 'present' as const,
        }));
        const updated = { ...t, assignedWorkers: updatedWorkers };
        broadcastRealtimeEvent('PROJECT_UPDATED', updated);
        return updated;
      })
    );
  }, []);

  const payAllProjectWages = useCallback((tenderId: string) => {
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const updatedWorkers = (t.assignedWorkers || []).map((w) => ({
          ...w,
          wageStatus: 'paid' as const,
        }));
        const updated = { ...t, assignedWorkers: updatedWorkers };
        broadcastRealtimeEvent('PROJECT_UPDATED', updated);
        return updated;
      })
    );
  }, []);

  // Real-time Service Dispatchers
  const sendRfp = useCallback((params: Parameters<typeof sendRfpService>[0]) => {
    const rfp = sendRfpService(params);
    setRfps(getRfps());
    showToast('Workforce RFP dispatched to contractor in real time!');
    return rfp;
  }, [showToast]);

  const respondToRfp = useCallback((rfpId: string, status: 'accepted' | 'declined', responseNotes?: string) => {
    respondToRfpService(rfpId, status, responseNotes);
    setRfps(getRfps());
    showToast(`RFP ${status === 'accepted' ? 'Accepted' : 'Declined'} successfully.`);
  }, [showToast]);

  const selectContractor = useCallback((projectId: string, contractorId: string, contractorName: string) => {
    selectContractorService(projectId, contractorId, contractorName);
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== projectId) return t;
        return { ...t, status: 'active_fulfillment' as const };
      })
    );
    showToast(`${contractorName} assigned as lead workforce contractor.`);
  }, [showToast]);

  const inviteWorker = useCallback((params: Parameters<typeof createInvitationService>[0]) => {
    const inv = createInvitationService(params);
    setInvitations(getWorkerInvitations());
    showToast(`Work invitation sent to ${params.workerName} in real time!`);
    return inv;
  }, [showToast]);

  const respondToInvitation = useCallback((invitationId: string, status: 'accepted' | 'declined') => {
    respondToInvitationService(invitationId, status);
    setInvitations(getWorkerInvitations());
    setAssignments(getWorkerAssignments());
    showToast(status === 'accepted' ? 'Invitation accepted! Assignment activated.' : 'Invitation declined.');
  }, [showToast]);

  const markAttendanceRecord = useCallback((params: Parameters<typeof markAttendanceService>[0]) => {
    const rec = markAttendanceService(params);
    setAttendanceRecords(getAttendanceRecords());
    setEarnings(getWorkerEarningEntries(activeWorkerId));
    showToast(`Attendance marked for ${params.workerName}: ${params.status.toUpperCase()}`);
    return rec;
  }, [activeWorkerId, showToast]);

  const disburseWageRecord = useCallback((recordId: string, reference?: string) => {
    disburseWageService(recordId, reference);
    setWageRecords(getWageRecords());
    setEarnings(getWorkerEarningEntries(activeWorkerId));
    showToast('Wage disbursed successfully (Prototype simulated payout).');
  }, [activeWorkerId, showToast]);

  const bulkDisburseWageRecords = useCallback((contractorId: string = 'c1') => {
    bulkDisburseService(contractorId);
    setWageRecords(getWageRecords());
    setEarnings(getWorkerEarningEntries(activeWorkerId));
    showToast('All pending wages marked as paid (Prototype simulated payout).');
  }, [activeWorkerId, showToast]);

  const createSavingsGoalDetailed = useCallback((params: Parameters<typeof createSavingsGoalService>[0]) => {
    const goal = createSavingsGoalService(params);
    setSavingsGoalsDetailed(getSavingsGoals());
    showToast(`New savings goal "${goal.title}" created! Target: ₹${goal.targetAmount.toLocaleString('en-IN')}`);
    return goal;
  }, [showToast]);

  const addSavingsContributionDetailed = useCallback((goalId: string, amount: number, note?: string) => {
    addSavingsContributionService(goalId, amount, note);
    setSavingsGoalsDetailed(getSavingsGoals());
    showToast(`₹${amount.toLocaleString('en-IN')} added to savings goal!`);
  }, [showToast]);

  const markNotificationRead = useCallback((id: string) => {
    markNotificationReadService(id);
    setNotifications(getNotifications(role || 'contractor'));
  }, [role]);

  const markAllNotificationsRead = useCallback(() => {
    markAllNotificationsReadService(role || 'contractor');
    setNotifications(getNotifications(role || 'contractor'));
    showToast('All notifications marked as read.');
  }, [role, showToast]);

  const matchWorkersForTrade = useCallback((skill: string, maxWage?: number, location?: string) => {
    return matchWorkersService(skill, maxWage, location);
  }, []);

  const unreadNotificationCount = useMemo(() => {
    return getUnreadNotificationCountService(role || 'contractor');
  }, [role, notifications]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        screen,
        setScreen,
        goBack,
        lang,
        setLang: changeLang,
        t,
        toasts,
        showToast,
        voiceActive,
        voiceText,
        playVoice,
        stopVoice,
        theme,
        toggleTheme,
        resetPlatformData,
        earnings,
        savingsGoals,
        jobs,
        conversations,
        workerStats,
        saveMoney,
        applyJob,
        sendMessage,
        markConversationRead,
        transferToBank,
        attendance,
        wages,
        postedJobs,
        setAttendanceStatus,
        markWagePaid,
        postJob,
        workerSkill,
        setWorkerSkill,
        monthlySalary,
        setMonthlySalary,
        registrationProfile,
        setRegistrationProfile,
        availability,
        dailyWorkStatus,
        setAvailability,
        setDailyWorkStatus,
        wellbeingAlertOpen,
        dismissWellbeingAlert,
        showWellbeingAlertNow,
        tenders,
        savedTenderIds,
        workforcePlans,
        partnerRequests,
        createAndAnalyzeTender,
        payTenderFeeAndUnlockContractors,
        sendRfpToContractor,
        updateTenderWorkforceRequirements,
        toggleSaveTender,
        createWorkforcePlan,
        requestPartnerConnection,
        selectedProjectId,
        setSelectedProjectId,
        addTender,
        updateTender,
        assignWorkerToProject,
        updateProjectWorkerAttendance,
        markProjectWorkerWagePaid,
        markAllProjectWorkersPresent,
        payAllProjectWages,

        // Real-time Service Extensions
        rfps,
        sendRfp,
        respondToRfp,
        selectContractor,
        invitations,
        assignments,
        activeAssignment,
        inviteWorker,
        respondToInvitation,
        attendanceRecords,
        markAttendanceRecord,
        wageRecords,
        disburseWageRecord,
        bulkDisburseWageRecords,
        workerEarningsSummary,
        savingsGoalsDetailed,
        createSavingsGoalDetailed,
        addSavingsContributionDetailed,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        workersDirectory,
        matchWorkersForTrade,
        projectMetrics: getAggregatedProjectMetrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
