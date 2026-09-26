import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
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
  WorkforcePlan,
  ContractorMatch,
  DynamicFeeCalculation,
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

interface AppContextValue {
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

}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [screen, setScreenState] = useState<ScreenId>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>([]);

  const setRole = useCallback((nextRole: Role | null) => {
    setRoleState(nextRole);
    setScreenHistory([]);
  }, []);
  const [workerSkill, setWorkerSkill] = useState('Mason');
  const [monthlySalary, setMonthlySalary] = useState(18000);
  const [registrationProfile, setRegistrationProfileState] = useState<RegistrationProfile | null>(null);
  const [availability, setAvailability] = useState<WorkerAvailability>('available');
  const [dailyWorkStatus, setDailyWorkStatus] = useState<DailyWorkStatus>('workDone');
  const [wellbeingAlertOpen, setWellbeingAlertOpen] = useState(false);

  const wellbeingIntervalMs = 20 * 60 * 1000;
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

  useEffect(() => {
    if (!registrationProfile) return;

    const checkReminder = () => {
      const lastShown = Number(localStorage.getItem(wellbeingStorageKey) || 0);
      if (lastShown && Date.now() - lastShown >= wellbeingIntervalMs) {
        showWellbeingAlertNow();
      }
    };

    const intervalId = window.setInterval(checkReminder, 30 * 1000);
    return () => window.clearInterval(intervalId);
  }, [registrationProfile, showWellbeingAlertNow]);

  const dismissWellbeingAlert = useCallback(() => setWellbeingAlertOpen(false), []);
  // Employer real-time persistent state
  const initialEmployer = getInitialEmployerState();
  const [tenders, setTenders] = useState<Tender[]>(initialEmployer.tenders);
  const [savedTenderIds, setSavedTenderIds] = useState<string[]>(initialEmployer.savedTenderIds);
  const [workforcePlans, setWorkforcePlans] = useState<Record<string, WorkforcePlan>>(initialEmployer.workforcePlans);
  const [partnerRequests, setPartnerRequests] = useState<Record<string, boolean>>(initialEmployer.partnerRequests);

  // Sync state to persistent localStorage & BroadcastChannel
  useEffect(() => {
    saveEmployerState({
      tenders,
      savedTenderIds,
      workforcePlans,
      partnerRequests,
    });
  }, [tenders, savedTenderIds, workforcePlans, partnerRequests]);

  // Listen for cross-tab updates
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const channel = new BroadcastChannel(EMPLOYER_CHANNEL);
    channel.onmessage = (event) => {
      if (event.data?.type === 'EMPLOYER_STATE_UPDATE' && event.data.state) {
        const s = event.data.state;
        if (s.tenders) setTenders(s.tenders);
        if (s.savedTenderIds) setSavedTenderIds(s.savedTenderIds);
        if (s.workforcePlans) setWorkforcePlans(s.workforcePlans);
        if (s.partnerRequests) setPartnerRequests(s.partnerRequests);
      }
    };
    return () => channel.close();
  }, []);

  
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
    return newTender;
  }, []);

  const updateTenderWorkforceRequirements = useCallback((tenderId: string, requirements: TenderWorkforceItem[]) => {
    const updatedSkills = requirements.map((r) => r.skill);
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        return {
          ...t,
          skills: updatedSkills,
          workforceRequirements: requirements,
          status: t.status === 'analyzed' ? 'requirements_configured' : t.status,
        };
      })
    );
  }, []);

  const payTenderFeeAndUnlockContractors = useCallback((tenderId: string, _paymentMethod: string) => {
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const matches = generateSuitableContractors(t, t.workforceRequirements);
        return {
          ...t,
          status: 'contractor_matched',
          unlockedContractors: matches,
        };
      })
    );
  }, []);

  const sendRfpToContractor = useCallback((tenderId: string, contractorId: string) => {
    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        const updatedContractors = (t.unlockedContractors || []).map((c) =>
          c.id === contractorId ? { ...c, rfpSent: true } : c
        );
        return { ...t, unlockedContractors: updatedContractors };
      })
    );
  }, []);

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



  const [lang, setLang] = useState<LangCode>(() => (localStorage.getItem('shrama-lang') as LangCode) || 'en');
  const changeLang = useCallback((value: LangCode) => { setLang(value); localStorage.setItem('shrama-lang', value); }, []);

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
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  const [earnings] = useState<EarningEntry[]>(initialEarnings);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(initialSavingsGoals);
  const [jobs, setJobs] = useState<JobListing[]>(initialJobs);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [workerStats, setWorkerStats] = useState<WorkerStats>(initialWorkerStats);

  const [attendance, setAttendance] = useState<AttendanceRow[]>(initialAttendance);
  const [wages, setWages] = useState<WageRow[]>(initialWages);
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>(initialPostedJobs);

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

  const saveMoney = useCallback((goalId: string, amount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, current: g.current + amount } : g))
    );
    setWorkerStats((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - amount,
      emergencySavings:
        goalId === 'emergency' ? prev.emergencySavings + amount : prev.emergencySavings,
    }));
  }, []);

  const applyJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, applied: true } : j)));
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string, attachment?: ChatMessage['attachment']) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const newMsg: ChatMessage = { id: `m-${Date.now()}`, sender: role === 'contractor' || role === 'employer' ? 'contractor' : 'worker', text, time: now, attachment };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, time: now, unread: 0 }
          : c
      )
    );
  }, [role]);

  const markConversationRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((conversation) => conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation)
    );
  }, []);

  const transferToBank = useCallback(() => {
    showToast(translate(lang, 'toastTransferBank'));
    setTimeout(() => showToast(translate(lang, 'toastTransferDone')), 1000);
  }, [lang, showToast]);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
