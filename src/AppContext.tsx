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
  sendMessage: (conversationId: string, text: string) => void;
  transferToBank: () => void;

  // contractor state
  attendance: AttendanceRow[];
  wages: WageRow[];
  postedJobs: PostedJob[];
  setAttendanceStatus: (id: string, status: 'present' | 'absent' | 'half') => void;
  markWagePaid: (id: string) => void;
  postJob: (job: Omit<PostedJob, 'id'>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('mango-bytes-role');
    return stored === 'labourer' || stored === 'contractor' ? stored : null;
  });
  const [screen, setScreen] = useState<ScreenId>('home');
  const [lang, setLangState] = useState<LangCode>(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = localStorage.getItem('mango-bytes-lang');
    return stored === 'en' || stored === 'hi' || stored === 'kn' || stored === 'ta' || stored === 'te' || stored === 'mr' || stored === 'bn'
      ? stored
      : 'en';
  });
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mango-bytes-role', role ?? '');
    }
  }, [role]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mango-bytes-lang', lang);
    }
  }, [lang]);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  const setLang = useCallback((nextLang: LangCode) => {
    setLangState(nextLang);
  }, []);

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

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const newMsg: ChatMessage = { id: `m-${Date.now()}`, sender: role === 'contractor' ? 'contractor' : 'worker', text, time: now };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, time: now, unread: 0 }
          : c
      )
    );
  }, [role]);

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
        lang,
        setLang,
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
        transferToBank,
        attendance,
        wages,
        postedJobs,
        setAttendanceStatus,
        markWagePaid,
        postJob,
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
