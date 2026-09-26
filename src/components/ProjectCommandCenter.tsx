import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Filter,
  HardHat,
  IndianRupee,
  Layers,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X,
  AlertTriangle,
  Check,
  Send,
  Building2,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, Button, Badge, formatINR, ProgressRing, Avatar } from './ui';
import type { Tender, AssignedProjectWorker, TenderWorkforceItem } from '@/types';
import { initialContractorWorkers } from '@/mockData';
import { smartMatchWorkers } from '@/backend/aiExtractionService';

interface ProjectCommandCenterProps {
  tenderId?: string;
  onBack?: () => void;
}

interface SiteMessage {
  id: string;
  sender: string;
  role: string;
  avatar: string;
  text: string;
  time: string;
  isSelf?: boolean;
}

const INITIAL_SITE_MESSAGES: SiteMessage[] = [
  {
    id: 'sm-1',
    sender: 'Praveen Rao',
    role: 'Site Supervisor',
    avatar: 'PR',
    text: 'Good morning sir. Section 2 earthwork mobilization begins today. First batch of aggregate gravel is on route from Khanapur quarry.',
    time: '08:15 AM',
  },
  {
    id: 'sm-2',
    sender: 'Somanna Patil',
    role: 'Equipment Operator',
    avatar: 'SP',
    text: 'Excavator and compaction roller pre-start checks completed. Hydraulic fluid levels and safety alarms verified.',
    time: '08:30 AM',
  },
  {
    id: 'sm-3',
    sender: 'Rajesh Kumar (You)',
    role: 'Contractor',
    avatar: 'RK',
    text: 'Acknowledged Praveen. Ensure all 40 helpers and masons receive their high-visibility reflective vests before entry into KM 18 bypass.',
    time: '08:45 AM',
    isSelf: true,
  },
  {
    id: 'sm-4',
    sender: 'Basavaraj B',
    role: 'Mason Lead',
    avatar: 'BB',
    text: 'Understood sir. Mortar mix testing for culvert wing-walls underway. Tools and staging scaffolding arranged.',
    time: '09:05 AM',
  },
];

export function ProjectCommandCenter({ tenderId, onBack }: ProjectCommandCenterProps) {
  const {
    tenders,
    selectedProjectId,
    setScreen,
    assignWorkerToProject,
    updateProjectWorkerAttendance,
    markProjectWorkerWagePaid,
    markAllProjectWorkersPresent,
    payAllProjectWages,
    showToast,
  } = useApp();

  // Determine active project
  const activeProjectId = tenderId || selectedProjectId || tenders[0]?.id || 'T-BELAGAVI-1042';
  const project: Tender = useMemo(() => {
    return tenders.find((t) => t.id === activeProjectId) || tenders[0] || {
      id: 'T-BELAGAVI-1042',
      tenderId: 'Tender #KA-2026-1042',
      title: 'Belagavi Highway Construction',
      client: 'Karnataka PWD / KSHIP',
      dept: 'Karnataka PWD',
      location: 'Belagavi, Karnataka',
      value: 82000000,
      closing: '10 Oct 2026',
      category: 'Infrastructure',
      match: 96,
      duration: '6 months',
      startDate: '10 Oct 2026',
      endDate: '10 Apr 2027',
      documentName: 'Belagavi_Highway_Package_4_WorkOrder.pdf',
      documentSize: '2.4 MB',
      skills: ['Masons', 'Helpers', 'Electricians', 'Equipment Operators', 'Supervisors'],
      eligibility: ['Class-I Road Contractor License', 'BOCW Cess Code', 'EPF & ESIC Registration'],
      docs: ['Work Order Agreement', 'Labour Insurance Declaration'],
      workforceRequirements: [
        { id: 'wf-1', skill: 'Masons', headcount: 30, assignedCount: 27, dailyWageRate: 900, category: 'skilled' },
        { id: 'wf-2', skill: 'Construction Helpers', headcount: 40, assignedCount: 40, dailyWageRate: 650, category: 'unskilled' },
        { id: 'wf-3', skill: 'Electricians', headcount: 10, assignedCount: 10, dailyWageRate: 1050, category: 'skilled' },
        { id: 'wf-4', skill: 'Equipment Operators', headcount: 15, assignedCount: 11, dailyWageRate: 1100, category: 'skilled' },
        { id: 'wf-5', skill: 'Supervisors', headcount: 5, assignedCount: 5, dailyWageRate: 1400, category: 'skilled' },
      ],
      assignedWorkers: [],
      fulfillmentPercent: 88,
      status: 'active_fulfillment',
      dynamicFee: { budget: 82000000, ratePercent: 0.018, baseFee: 15000, cgst: 1350, sgst: 1350, totalFee: 17700, tierLabel: 'Above ₹2.5 Crores' },
    };
  }, [tenders, activeProjectId]);

  // Tabs state
  const [activeTab, setActiveTab] = useState<'overview' | 'workforce' | 'attendance' | 'wages' | 'messages'>('overview');

  // Workforce filtering and searching
  const [tradeFilter, setTradeFilter] = useState<string>('all');
  const [searchWorkerQuery, setSearchWorkerQuery] = useState<string>('');

  // Smart Matching Modal
  const [matchingModalOpen, setMatchingModalOpen] = useState(false);
  const [matchingTrade, setMatchingTrade] = useState<string>('Equipment Operator');

  // Attendance date & state
  const [attendanceDate, setAttendanceDate] = useState('Today (26 Sep 2026)');

  // Messages state
  const [messages, setMessages] = useState<SiteMessage[]>(INITIAL_SITE_MESSAGES);
  const [newMessageText, setNewMessageText] = useState('');

  // Compute workforce fulfillment statistics
  const reqs = project.workforceRequirements || [];
  const assignedList = project.assignedWorkers || [];

  const totalRequired = reqs.reduce((sum, r) => sum + r.headcount, 0) || 100;
  const totalAssigned = reqs.reduce((sum, r) => sum + (r.assignedCount ?? assignedList.filter(w => w.role.toLowerCase().includes(r.skill.toLowerCase()) || r.skill.toLowerCase().includes(w.role.toLowerCase())).length), 0);
  const totalShortage = Math.max(0, totalRequired - totalAssigned);
  const fulfillmentPct = Math.min(100, Math.round((totalAssigned / totalRequired) * 100));

  // Compute trades with shortages
  const tradesWithShortage = useMemo(() => {
    return reqs
      .map((r) => {
        const assigned = r.assignedCount ?? 0;
        const shortage = Math.max(0, r.headcount - assigned);
        return { ...r, shortage };
      })
      .filter((r) => r.shortage > 0);
  }, [reqs]);

  // Attendance stats for today
  const attendanceStats = useMemo(() => {
    const present = assignedList.filter((w) => w.attendanceToday === 'present').length;
    const half = assignedList.filter((w) => w.attendanceToday === 'half').length;
    const absent = assignedList.filter((w) => w.attendanceToday === 'absent').length;
    const todayWages = assignedList.reduce((sum, w) => {
      if (w.attendanceToday === 'present') return sum + w.dailyWage;
      if (w.attendanceToday === 'half') return sum + Math.round(w.dailyWage / 2);
      return sum;
    }, 0);
    return { present, half, absent, todayWages };
  }, [assignedList]);

  // Wage ledger stats
  const wageStats = useMemo(() => {
    const totalWagesIncurred = assignedList.reduce((sum, w) => sum + (w.daysWorked || 4) * w.dailyWage, 0);
    const paidWages = assignedList.filter((w) => w.wageStatus === 'paid').reduce((sum, w) => sum + (w.daysWorked || 4) * w.dailyWage, 0);
    const pendingWages = totalWagesIncurred - paidWages;
    return { totalWagesIncurred, paidWages, pendingWages };
  }, [assignedList]);

  // Filtered assigned workers
  const filteredAssignedWorkers = useMemo(() => {
    return assignedList.filter((w) => {
      const matchTrade = tradeFilter === 'all' || w.role.toLowerCase().includes(tradeFilter.toLowerCase()) || tradeFilter.toLowerCase().includes(w.role.toLowerCase());
      const matchQuery = !searchWorkerQuery || w.name.toLowerCase().includes(searchWorkerQuery.toLowerCase()) || w.location.toLowerCase().includes(searchWorkerQuery.toLowerCase()) || w.phone.includes(searchWorkerQuery);
      return matchTrade && matchQuery;
    });
  }, [assignedList, tradeFilter, searchWorkerQuery]);

  // Candidates for smart match modal
  const candidates = useMemo(() => {
    if (!matchingModalOpen) return [];
    const matched = smartMatchWorkers(matchingTrade, project.location, initialContractorWorkers, project.startDate || '10 Oct 2026');
    // Exclude workers already in project
    const assignedIds = new Set(assignedList.map((w) => w.workerId));
    return matched.filter((c) => !assignedIds.has(c.worker.id));
  }, [matchingModalOpen, matchingTrade, project.location, project.startDate, assignedList]);

  // Open smart match modal for a specific trade
  const openSmartMatch = (trade: string) => {
    setMatchingTrade(trade);
    setMatchingModalOpen(true);
  };

  // Handle assigning a matched worker
  const handleAssignWorker = (candidate: { worker: typeof initialContractorWorkers[0]; matchScore: number; matchReasons: string[] }) => {
    const newWorker: AssignedProjectWorker = {
      id: 'apw-' + Date.now(),
      workerId: candidate.worker.id,
      name: candidate.worker.name,
      role: candidate.worker.primarySkill,
      category: candidate.worker.category,
      dailyWage: candidate.worker.primarySkill.toLowerCase().includes('operator') ? 1100 : candidate.worker.primarySkill.toLowerCase().includes('mason') ? 900 : candidate.worker.primarySkill.toLowerCase().includes('electric') ? 1050 : 650,
      phone: '+91 98' + Math.floor(10000000 + Math.random() * 90000000),
      location: candidate.worker.location,
      experience: candidate.worker.experience,
      matchScore: candidate.matchScore,
      matchReasons: candidate.matchReasons,
      assignedDate: new Date().toISOString().split('T')[0],
      daysWorked: 0,
      attendanceToday: 'present',
      wageStatus: 'pending',
      avatar: candidate.worker.avatar || candidate.worker.name.slice(0, 2).toUpperCase(),
    };

    assignWorkerToProject(project.id, newWorker);
    showToast(`${candidate.worker.name} successfully assigned to ${project.title}!`);
    setMatchingModalOpen(false);
  };

  // Handle sending a site coordination message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    const msg: SiteMessage = {
      id: 'sm-' + Date.now(),
      sender: 'Rajesh Kumar (You)',
      role: 'Contractor',
      avatar: 'RK',
      text: newMessageText.trim(),
      time: 'Just now',
      isSelf: true,
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessageText('');
    showToast('Site message broadcasted to workforce');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setScreen('home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Back to dashboard"
                className="mt-1 w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all shrink-0"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    {project.tenderId || 'Tender #KA-2026-1042'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      fulfillmentPct === 100
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {fulfillmentPct === 100 ? (
                      <>
                        <CheckCircle2 size={12} /> Ready to Deploy
                      </>
                    ) : (
                      <>
                        <HardHat size={12} /> Active Fulfillment
                      </>
                    )}
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:inline">•</span>
                  <span className="text-xs font-semibold text-gray-600 hidden sm:inline">
                    {project.client || project.dept}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
                  {project.title}
                </h1>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-500 mt-1.5 font-medium">
                  <span className="flex items-center gap-1 text-gray-600">
                    <MapPin size={13} className="text-brand-600" />
                    {project.location}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Calendar size={13} className="text-brand-600" />
                    Starts {project.startDate || '10 Oct 2026'} ({project.duration})
                  </span>
                  <span className="flex items-center gap-1 font-bold text-gray-900">
                    <IndianRupee size={13} className="text-emerald-600" />
                    {formatINR(project.value)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openSmartMatch('Equipment Operator')}
                className="flex items-center gap-1.5"
              >
                <Sparkles size={15} />
                Smart Match
              </Button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mt-4 -mb-1 pt-1 border-t border-gray-100">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'overview'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Layers size={16} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('workforce')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'workforce'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Users size={16} />
              Workforce Roster
              {totalShortage > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold">
                  ! {totalShortage} gap
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
                  100%
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'attendance'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Calendar size={16} />
              Attendance
              <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-extrabold">
                {attendanceStats.present}/{assignedList.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('wages')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'wages'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <CreditCard size={16} />
              Wages Ledger
              {wageStats.pendingWages > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold">
                  {formatINR(wageStats.pendingWages)}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === 'messages'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <MessageSquare size={16} />
              Site Messages
              <span className="px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-extrabold">
                {messages.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Workforce Fulfillment Hero Card */}
            <Card className="p-6 bg-gradient-to-br from-white via-white to-brand-50/40 border border-brand-100 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <ProgressRing
                      progress={fulfillmentPct}
                      size={92}
                      color={fulfillmentPct === 100 ? '#10b981' : '#1b76f0'}
                      bgColor="#e2e8f0"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-extrabold text-gray-900 leading-none">
                        {fulfillmentPct}%
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Staffed</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-gray-900">
                        Workforce Deployment Status
                      </h2>
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-brand-100 text-brand-700">
                        {totalAssigned} / {totalRequired} Deployed
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 max-w-xl">
                      {fulfillmentPct === 100
                        ? 'Your workforce mobilization is 100% complete! All personnel have been verified with ShramaID KYC and are ready for site deployment.'
                        : `Target peak workforce is ${totalRequired} workers. Currently ${totalAssigned} assigned with a gap of ${totalShortage} workers to fulfill prior to mobilization on ${project.startDate || '10 Oct 2026'}.`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (tradesWithShortage.length > 0) {
                        openSmartMatch(tradesWithShortage[0].skill);
                      } else {
                        setActiveTab('workforce');
                      }
                    }}
                    className="flex items-center gap-2 text-sm shadow-md"
                  >
                    <Sparkles size={16} />
                    {totalShortage > 0 ? `Fulfill Shortage (${totalShortage} Needed)` : 'Manage Roster'}
                  </Button>
                </div>
              </div>

              {/* 4 Stats Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500">Total Required</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{totalRequired}</p>
                  <p className="text-[11px] text-gray-400 font-medium">BOCW Mandate</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-800">Assigned & Ready</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{totalAssigned}</p>
                  <p className="text-[11px] text-emerald-600 font-medium">Verified Workers</p>
                </div>
                <div className={`p-3.5 rounded-xl border ${totalShortage > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                  <p className={`text-xs font-semibold ${totalShortage > 0 ? 'text-amber-800' : 'text-gray-500'}`}>
                    Workforce Gap
                  </p>
                  <p className={`text-2xl font-black mt-1 ${totalShortage > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
                    {totalShortage}
                  </p>
                  <p className={`text-[11px] font-medium ${totalShortage > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {totalShortage > 0 ? 'Action Needed' : 'Fully Staffed'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-brand-50/60 border border-brand-100">
                  <p className="text-xs font-semibold text-brand-800">Est. Daily Wage Bill</p>
                  <p className="text-2xl font-black text-brand-700 mt-1">
                    {formatINR(attendanceStats.todayWages || 84200)}
                  </p>
                  <p className="text-[11px] text-brand-600 font-medium">Active Deployment</p>
                </div>
              </div>
            </Card>

            {/* Workforce Risk / Shortage Alert */}
            {totalShortage > 0 ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-amber-900">
                      Workforce Shortage Alert: {totalShortage} Workers Missing
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                      Mobilization kickoff date is{' '}
                      <strong>{project.startDate || '10 Oct 2026'}</strong>. Immediate shortage of{' '}
                      <strong>
                        {tradesWithShortage.map((t) => `${t.shortage} ${t.skill}`).join(' and ')}
                      </strong>
                      . Deploy candidates now to prevent delay penalties.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openSmartMatch(tradesWithShortage[0]?.skill || 'Equipment Operator')}
                  className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2"
                >
                  <Sparkles size={15} />
                  Fulfill Now ({tradesWithShortage[0]?.skill})
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="font-extrabold text-emerald-900 text-sm">
                    Workforce Target 100% Met!
                  </p>
                  <p className="text-xs text-emerald-700">
                    All 100 workers have been matched, confirmed and assigned to the project muster roll.
                  </p>
                </div>
              </div>
            )}

            {/* Trade-by-Trade Workforce Breakdown */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">
                    Trade-by-Trade Requirements & Allocation
                  </h3>
                  <p className="text-xs text-gray-500">
                    Extracted directly from work order BOQ and civil schedule
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('workforce')}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  View full roster →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reqs.map((req) => {
                  const assigned = req.assignedCount ?? 0;
                  const shortage = Math.max(0, req.headcount - assigned);
                  const pct = Math.min(100, Math.round((assigned / req.headcount) * 100));
                  const isFulfilled = shortage === 0;

                  return (
                    <Card key={req.id} className="p-4 border border-gray-100 hover:border-brand-200 transition-all">
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isFulfilled ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <HardHat size={18} />
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-900 text-sm">{req.skill}</p>
                            <p className="text-[11px] text-gray-500 font-medium">
                              Rate: <span className="font-bold text-gray-800">{formatINR(req.dailyWageRate)}/day</span> • {req.category}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                            isFulfilled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isFulfilled ? 'Fulfilled' : `${shortage} Needed`}
                        </span>
                      </div>

                      {/* Mini progress bar */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-xs font-semibold text-gray-600">
                          <span>Progress ({assigned} / {req.headcount})</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFulfilled ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <span className="text-gray-500 truncate max-w-[200px]">
                          {req.notes || 'Mandatory on-site skill'}
                        </span>
                        {!isFulfilled ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => openSmartMatch(req.skill)}
                            className="py-1 px-2.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 flex items-center gap-1"
                          >
                            <Plus size={13} />
                            Find {shortage} Workers
                          </Button>
                        ) : (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check size={14} /> Ready
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* AI Tender Document Extraction & Scope Insights */}
            <Card className="p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">
                      AI Tender & Work Order Analysis
                    </h3>
                    <p className="text-xs text-gray-500">
                      Extracted from: {project.documentName || 'Belagavi_Highway_Package_4_WorkOrder.pdf'} ({project.documentSize || '2.4 MB'})
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
                  AI Verified Document
                </span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 mb-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
                <p className="font-semibold text-gray-900 mb-1">Contract Scope Summary:</p>
                {project.scopeDescription ||
                  'Awarded Contract for Four-Laning & Pavement Strengthening of Belagavi South Bypass (KM 14.200 to KM 28.600). The contractor is directed to mobilize a ready-to-deploy workforce of 100 personnel conforming to BOCW and CPWD safety standards.'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2.5">
                  <p className="font-extrabold text-gray-900 uppercase text-[11px] tracking-wider">
                    Site Logistics & Facilities Mandate
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm space-y-2">
                    <div>
                      <span className="font-bold text-gray-800">Working Hours: </span>
                      <span className="text-gray-600">{project.otherRequirements?.workingHours || '8:00 AM – 5:00 PM (1 hr lunch)'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-800">Accommodation: </span>
                      <span className="text-gray-600">{project.otherRequirements?.accommodation || 'Site labor camp provided at KM 18'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-800">Transit: </span>
                      <span className="text-gray-600">{project.otherRequirements?.transportation || 'Daily shuttle from Belagavi central bus depot'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-800">Safety PPE: </span>
                      <span className="text-gray-600">{project.otherRequirements?.safety || 'Mandatory ISI helmets, jackets, steel-toe boots'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="font-extrabold text-gray-900 uppercase text-[11px] tracking-wider">
                    Statutory Compliance Checklist
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm space-y-2">
                    {(project.otherRequirements?.compliance || [
                      'BOCW Act 1996 active registration',
                      'EPFO & ESIC monthly electronic return filings',
                      'Daily biometric muster verification on site',
                    ]).map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WORKFORCE ROSTER */}
        {/* ========================================================================= */}
        {activeTab === 'workforce' && (
          <div className="space-y-6 animate-fade-in">
            {/* Shortage Quick Action Banners if any gaps */}
            {tradesWithShortage.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                    <AlertTriangle size={18} className="text-amber-600" />
                    Pending Workforce Gaps ({totalShortage} workers required)
                  </div>
                  <span className="text-xs font-semibold text-amber-700">Click trade to smart match</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tradesWithShortage.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => openSmartMatch(t.skill)}
                      className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Sparkles size={14} className="text-brand-600" />
                      <span>{t.skill}: Need {t.shortage}</span>
                      <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px]">
                        Smart Match →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                <Search size={16} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search workers by name, trade or phone..."
                  value={searchWorkerQuery}
                  onChange={(e) => setSearchWorkerQuery(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-transparent outline-none text-gray-800"
                />
                {searchWorkerQuery && (
                  <button onClick={() => setSearchWorkerQuery('')} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openSmartMatch(tradesWithShortage[0]?.skill || 'Equipment Operator')}
                  className="flex items-center gap-1.5 whitespace-nowrap shadow-sm text-xs sm:text-sm"
                >
                  <Plus size={16} />
                  Smart Match & Assign
                </Button>
              </div>
            </div>

            {/* Trade Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setTradeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  tradeFilter === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Trades ({assignedList.length})
              </button>
              {reqs.map((r) => {
                const count = assignedList.filter(
                  (w) => w.role.toLowerCase().includes(r.skill.toLowerCase()) || r.skill.toLowerCase().includes(w.role.toLowerCase())
                ).length;
                return (
                  <button
                    key={r.id}
                    onClick={() => setTradeFilter(r.skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      tradeFilter === r.skill
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{r.skill}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      tradeFilter === r.skill ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Assigned Workers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAssignedWorkers.map((worker) => (
                <Card key={worker.id} className="p-4 border border-gray-100 hover:border-brand-200 shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 font-extrabold text-base flex items-center justify-center shrink-0">
                        {worker.avatar || worker.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-gray-900 text-sm sm:text-base">
                            {worker.name}
                          </h4>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            <ShieldCheck size={11} className="mr-0.5" />
                            ShramaID
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-600">
                          {worker.role} • {worker.experience || '4 years exp'}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin size={11} />
                          {worker.location}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-brand-600 text-sm">
                        {formatINR(worker.dailyWage)}/day
                      </span>
                      <div className="mt-1">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-50 text-brand-700 border border-brand-200">
                          {worker.matchScore}% Match
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Match Reasons Pill */}
                  {worker.matchReasons && worker.matchReasons.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1.5">
                        {worker.matchReasons.slice(0, 2).map((reason, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 font-medium"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Actions Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs">
                    <span className="font-mono text-gray-500 text-[11px]">
                      {worker.phone}
                    </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${worker.phone}`}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1 text-[11px] font-semibold active:scale-95 transition-all"
                        aria-label={`Call ${worker.name}`}
                      >
                        <Phone size={12} />
                        Call
                      </a>
                      <button
                        onClick={() => {
                          setActiveTab('messages');
                          setNewMessageText(`@${worker.name}: Please confirm arrival time for tomorrow morning.`);
                        }}
                        className="p-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 flex items-center gap-1 text-[11px] font-semibold active:scale-95 transition-all"
                      >
                        <MessageSquare size={12} />
                        Message
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredAssignedWorkers.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Users size={36} className="mx-auto text-gray-400 mb-2" />
                <p className="font-bold text-gray-700">No workers match this filter</p>
                <p className="text-xs text-gray-500 mt-1">Try resetting the search or switch to "All Trades"</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setTradeFilter('all'); setSearchWorkerQuery(''); }}
                  className="mt-3 text-xs"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ATTENDANCE */}
        {/* ========================================================================= */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Date Switcher */}
            <Card className="p-5 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">
                    Daily Site Muster Roll
                  </h3>
                  <p className="text-xs text-gray-500">
                    Record daily biometric/manual muster for Belagavi Highway Construction
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-gray-800 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200">
                    {attendanceDate}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      markAllProjectWorkersPresent(project.id);
                      showToast('Marked all assigned workers as PRESENT for today');
                    }}
                    className="text-xs font-bold"
                  >
                    Mark All Present
                  </Button>
                </div>
              </div>

              {/* Attendance Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-800">Present Today</p>
                  <p className="text-2xl font-black text-emerald-700 mt-0.5">{attendanceStats.present}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-xs font-semibold text-amber-800">Half Day</p>
                  <p className="text-2xl font-black text-amber-700 mt-0.5">{attendanceStats.half}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600">Absent</p>
                  <p className="text-2xl font-black text-gray-800 mt-0.5">{attendanceStats.absent}</p>
                </div>
                <div className="p-3 rounded-xl bg-brand-50 border border-brand-100">
                  <p className="text-xs font-semibold text-brand-800">Today's Wage Incurred</p>
                  <p className="text-2xl font-black text-brand-700 mt-0.5">
                    {formatINR(attendanceStats.todayWages)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Attendance Roster Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-extrabold text-gray-900 text-sm">
                  Assigned Personnel ({assignedList.length} total)
                </h4>
                <span className="text-xs text-gray-500">Live Wage Calculation Active</span>
              </div>

              <div className="divide-y divide-gray-100">
                {assignedList.map((worker) => (
                  <div key={worker.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 font-bold flex items-center justify-center shrink-0">
                        {worker.avatar || worker.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-gray-900 text-sm">{worker.name}</p>
                        <p className="text-xs text-gray-500">
                          {worker.role} • Rate: <span className="font-bold text-gray-700">{formatINR(worker.dailyWage)}/day</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateProjectWorkerAttendance(project.id, worker.id, 'present')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          worker.attendanceToday === 'present'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        Present (1.0)
                      </button>
                      <button
                        onClick={() => updateProjectWorkerAttendance(project.id, worker.id, 'half')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          worker.attendanceToday === 'half'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        Half Day (0.5)
                      </button>
                      <button
                        onClick={() => updateProjectWorkerAttendance(project.id, worker.id, 'absent')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          worker.attendanceToday === 'absent'
                            ? 'bg-gray-800 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700'
                        }`}
                      >
                        Absent (0)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: WAGES LEDGER */}
        {/* ========================================================================= */}
        {activeTab === 'wages' && (
          <div className="space-y-6 animate-fade-in">
            {/* Financial Summary */}
            <Card className="p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">
                    Project Labor Wage Ledger
                  </h3>
                  <p className="text-xs text-gray-500">
                    Transparent wage records directly tied to site muster attendance
                  </p>
                </div>

                {wageStats.pendingWages > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      payAllProjectWages(project.id);
                      showToast(`Disbursed ${formatINR(wageStats.pendingWages)} to all pending workers!`);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold shadow-md"
                  >
                    <CreditCard size={15} />
                    Disburse All ({formatINR(wageStats.pendingWages)})
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500">Total Contract Value</p>
                  <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                    {formatINR(project.value)}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium">KSHIP Allocation</p>
                </div>
                <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-100">
                  <p className="text-xs font-semibold text-brand-800">Wages Incurred</p>
                  <p className="text-xl sm:text-2xl font-black text-brand-700 mt-1">
                    {formatINR(wageStats.totalWagesIncurred)}
                  </p>
                  <p className="text-[11px] text-brand-600 font-medium">To Date</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-800">Wages Disbursed</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                    {formatINR(wageStats.paidWages)}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium">Settled via Escrow</p>
                </div>
                <div className={`p-3.5 rounded-xl border ${wageStats.pendingWages > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                  <p className={`text-xs font-semibold ${wageStats.pendingWages > 0 ? 'text-amber-800' : 'text-gray-500'}`}>
                    Pending Payout
                  </p>
                  <p className={`text-xl sm:text-2xl font-black mt-1 ${wageStats.pendingWages > 0 ? 'text-amber-700' : 'text-gray-900'}`}>
                    {formatINR(wageStats.pendingWages)}
                  </p>
                  <p className={`text-[11px] font-medium ${wageStats.pendingWages > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {wageStats.pendingWages > 0 ? 'Due This Week' : 'All Settled'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Wages Detail Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-extrabold text-gray-900 text-sm">
                  Worker Payout Roll ({assignedList.length} workers)
                </h4>
                <span className="text-xs text-gray-500">EPF/ESIC Compliant</span>
              </div>

              <div className="divide-y divide-gray-100">
                {assignedList.map((worker) => {
                  const days = worker.daysWorked || 4;
                  const earned = days * worker.dailyWage;
                  const isPaid = worker.wageStatus === 'paid';

                  return (
                    <div key={worker.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 font-bold flex items-center justify-center shrink-0">
                          {worker.avatar || worker.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-gray-900 text-sm">{worker.name}</p>
                          <p className="text-xs text-gray-500">
                            {worker.role} • {days} days worked @ {formatINR(worker.dailyWage)}/day
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-gray-900">
                            {formatINR(earned)}
                          </p>
                          <span className={`inline-block text-[10px] font-bold ${
                            isPaid ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {isPaid ? '● Paid' : '● Payment Due'}
                          </span>
                        </div>

                        {!isPaid ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              markProjectWorkerWagePaid(project.id, worker.id);
                              showToast(`Paid ${formatINR(earned)} to ${worker.name}`);
                            }}
                            className="text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                          >
                            Mark Paid
                          </Button>
                        ) : (
                          <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200 flex items-center gap-1">
                            <Check size={14} /> Settled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SITE MESSAGES */}
        {/* ========================================================================= */}
        {activeTab === 'messages' && (
          <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
            <Card className="p-4 border border-gray-200">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm">
                      Site Coordination Channel
                    </h3>
                    <p className="text-xs text-gray-500">
                      Live dispatch for {project.title}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Site Online
                </span>
              </div>

              {/* Messages Flow */}
              <div className="py-4 space-y-3 min-h-[300px] max-h-[460px] overflow-y-auto pr-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${msg.isSelf ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      msg.isSelf ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {msg.avatar}
                    </div>

                    <div className={`max-w-[78%] rounded-2xl p-3.5 text-xs sm:text-sm ${
                      msg.isSelf
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                      <div className={`flex items-center justify-between gap-3 text-[10px] font-bold mb-1 ${
                        msg.isSelf ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        <span>{msg.sender} ({msg.role})</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-gray-100 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Broadcast instructions to site supervisor and crew..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:border-brand-500 text-gray-800 transition-all"
                />
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!newMessageText.trim()}
                  className="px-4 py-2.5 flex items-center gap-1.5"
                >
                  <Send size={15} />
                  Send
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SMART MATCHING MODAL */}
      {/* ========================================================================= */}
      {matchingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-brand-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">
                    Smart Match: {matchingTrade}
                  </h3>
                  <p className="text-xs text-gray-500">
                    AI matched against Belagavi Highway work order requirements
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMatchingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-gray-700 flex items-center justify-center border border-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Trade Selector Inside Modal */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-gray-500 shrink-0">Trade:</span>
              {reqs.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setMatchingTrade(r.skill)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    matchingTrade === r.skill
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {r.skill}
                </button>
              ))}
            </div>

            {/* Candidates List */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {candidates.length > 0 ? (
                candidates.map((c) => (
                  <div
                    key={c.worker.id}
                    className="p-4 rounded-2xl border border-gray-200 hover:border-brand-300 hover:bg-brand-50/20 transition-all shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 font-extrabold text-base flex items-center justify-center shrink-0">
                          {c.worker.avatar || c.worker.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-gray-900 text-base">
                              {c.worker.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                              KYC Verified
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-gray-600">
                            {c.worker.primarySkill} • {c.worker.experience}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <MapPin size={12} />
                            {c.worker.location} ({c.worker.workCount} previous jobs)
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-brand-100 text-brand-700 border border-brand-200">
                          {c.matchScore}% Match
                        </span>
                        <p className="text-xs font-extrabold text-gray-900 mt-1">
                          {formatINR(c.worker.primarySkill.toLowerCase().includes('operator') ? 1100 : c.worker.primarySkill.toLowerCase().includes('mason') ? 900 : 650)}/day
                        </p>
                      </div>
                    </div>

                    {/* Match Factors Checklist */}
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
                      <p className="font-bold text-gray-700 text-[11px] mb-1">
                        Matching Criteria Grounding:
                      </p>
                      {c.matchReasons.map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-gray-700">
                          <Check size={13} className="text-emerald-600 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Assign Action Button */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAssignWorker(c)}
                        className="w-full sm:w-auto px-5 py-2 font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <UserCheck size={16} />
                        Assign to Project
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <UserCheck size={36} className="mx-auto text-gray-400 mb-2" />
                  <p className="font-bold text-gray-700">No additional unassigned candidates found</p>
                  <p className="text-xs text-gray-500 mt-1">All qualified workers for this trade have already been assigned.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>All candidates possess verified ShramaID credentials</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMatchingModalOpen(false)}
                className="text-gray-600 font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
