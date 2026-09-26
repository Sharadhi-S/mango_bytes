import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileSearch,
  FileText,
  IndianRupee,
  MapPin,
  Search,
  Sparkles,
  Users,
  Edit3,
  Plus,
  Minus,
  Trash2,
  Check,
  Save,
  ShieldCheck,
  Send,
  CreditCard,
  Lock,
  PhoneCall,
  MessageSquare,
  Award,
  Layers,
  CheckCheck,
  QrCode,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/AppContext';
import { Card, ScreenHeader, formatINR, Button } from './ui';
import type { Tender, TenderWorkforceItem, ContractorMatch, ContractorWorker } from '@/types';
import { calculateDynamicTenderFee } from '@/backend/employerBackend';

const CATALOG_TRADES = [
  'Civil Engineers',
  'Site Supervisors',
  'Masons',
  'Machine Operators',
  'Construction Labourers',
  'Bar Bender & Steel Fixer',
  'Formwork Carpenter',
  'Structural Welder',
  'Electrician & Conduiting',
  'Plumber & Sanitary Specialist',
  'Tile Worker & Stone Layer',
  'Surveyor & Total Station',
  'Safety Officer',
  'Software Developers',
  'UI/UX Designers',
  'QA Engineers',
  'Data Operators',
];

type EmployerDashboardView =
  | 'dashboard'
  | 'tenders'
  | 'enterTender'
  | 'summary'
  | 'workforce'
  | 'feeCheckout'
  | 'contractors'
  | 'partners'
  | 'alerts'
  | 'profile';

interface EmployerRfpLink {
  id: string;
  contractorId: string;
  contractorName: string;
  tenderId: string;
  tenderTitle: string;
  status: 'pending' | 'accepted' | 'declined';
}

export function EmployerDashboard() {
  const {
    tenders,
    savedTenderIds,
    partnerRequests,
    createAndAnalyzeTender,
    updateTenderWorkforceRequirements,
    payTenderFeeAndUnlockContractors,
    sendRfpToContractor,
    toggleSaveTender,
    createWorkforcePlan,
    requestPartnerConnection,
    registrationProfile,
    showToast,
    t,
  } = useApp();

  const [view, setView] = useState<EmployerDashboardView>('dashboard');
  const [selectedTenderId, setSelectedTenderId] = useState<string>(tenders[0]?.id || 'T-1001');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [isEditingReqs, setIsEditingReqs] = useState(false);
  const [selectedNewTrade, setSelectedNewTrade] = useState(CATALOG_TRADES[0]);
  const [registeredWorkers, setRegisteredWorkers] = useState<ContractorWorker[]>([]);
  const [registeredContractors, setRegisteredContractors] = useState<ContractorMatch[]>([]);
  const [outgoingRfps, setOutgoingRfps] = useState<EmployerRfpLink[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/workers')
      .then(async (response) => {
        const result = await response.json() as { workers?: ContractorWorker[]; error?: string };
        if (!response.ok) throw new Error(result.error || 'Could not load registered workers.');
        return result.workers || [];
      })
      .then((workers) => {
        if (active) setRegisteredWorkers(workers);
      })
      .catch((error: unknown) => {
        if (active) showToast(error instanceof Error ? error.message : 'Could not load registered workers.');
      });
    return () => { active = false; };
  }, [showToast]);

  useEffect(() => {
    let active = true;
    fetch('/api/contractors')
      .then(async (response) => {
        const result = await response.json() as { contractors?: ContractorMatch[]; error?: string };
        if (!response.ok) throw new Error(result.error || 'Could not load contractor accounts.');
        return result.contractors || [];
      })
      .then((contractors) => {
        if (active) setRegisteredContractors(contractors);
      })
      .catch((error: unknown) => {
        if (active) showToast(error instanceof Error ? error.message : 'Could not load contractor accounts.');
      });
    return () => { active = false; };
  }, [showToast]);

  useEffect(() => {
    let active = true;
    const refreshOutbox = async () => {
      try {
        const response = await fetch('/api/contractor-links/outbox');
        const result = await response.json() as { links?: EmployerRfpLink[]; error?: string };
        if (!response.ok) throw new Error(result.error || 'Could not load contractor responses.');
        if (active) setOutgoingRfps(result.links || []);
      } catch (error) {
        if (active) showToast(error instanceof Error ? error.message : 'Could not load contractor responses.');
      }
    };
    void refreshOutbox();
    const refreshTimer = window.setInterval(() => {
      if (!document.hidden) void refreshOutbox();
    }, 10000);
    return () => {
      active = false;
      window.clearInterval(refreshTimer);
    };
  }, [showToast]);

  // Fallback safe selected tender
  const selected: Tender = useMemo(() => {
    return tenders.find((tItem) => tItem.id === selectedTenderId) || tenders[0] || {
      id: 'T-1001',
      title: 'Road Development & Widening Project',
      dept: 'Karnataka PWD',
      location: 'Mysuru, Karnataka',
      value: 82000000,
      closing: '08 Oct 2026',
      category: 'Infrastructure',
      match: 91,
      duration: '18 months',
      skills: ['Civil Engineers', 'Masons', 'Labourers'],
      eligibility: ['Class-I Contractor License', 'BOCW Compliance'],
      docs: ['GST Certificate', 'Machinery Ownership Affidavit'],
      workforceRequirements: [
        { id: 'wf-1', skill: 'Civil Engineers', headcount: 4, dailyWageRate: 1400, category: 'skilled' },
        { id: 'wf-2', skill: 'Masons', headcount: 15, dailyWageRate: 900, category: 'skilled' },
        { id: 'wf-3', skill: 'Construction Labourers', headcount: 35, dailyWageRate: 650, category: 'unskilled' },
      ],
      dynamicFee: calculateDynamicTenderFee(82000000),
      status: 'analyzed',
    };
  }, [tenders, selectedTenderId]);

  const matchedRegisteredWorkers = useMemo(() => {
    const requiredSkills = selected.workforceRequirements?.map((requirement) => requirement.skill.toLowerCase()) || [];
    return registeredWorkers.filter((worker) => requiredSkills.some((skill) =>
      skill.includes(worker.primarySkill.toLowerCase()) || worker.primarySkill.toLowerCase().includes(skill)
    ));
  }, [registeredWorkers, selected.workforceRequirements]);

  // Editable requirements state
  const [editedRequirements, setEditedRequirements] = useState<TenderWorkforceItem[]>(
    selected.workforceRequirements || []
  );

  // Enter Tender Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newCategory, setNewCategory] = useState('Infrastructure');
  const [newLocation, setNewLocation] = useState('Bengaluru, Karnataka');
  const [newBudget, setNewBudget] = useState(4800000);
  const [newDuration, setNewDuration] = useState(6);
  const [newScope, setNewScope] = useState('');
  const [isSubmittingTender, setIsSubmittingTender] = useState(false);

  // Dynamic fee calculation for the intake form in real-time
  const liveFormFee = useMemo(() => {
    return calculateDynamicTenderFee(Number(newBudget) || 100000);
  }, [newBudget]);

  // Selected tender's fee breakdown (always freshly calculated or preserved)
  const selectedTenderFee = useMemo(() => {
    return calculateDynamicTenderFee(selected.value || 1000000);
  }, [selected.value]);

  // Payment mode state for fee checkout
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'upi' | 'netbanking' | 'card' | 'neft'>('upi');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessStep, setPaymentSuccessStep] = useState(false);

  // Navigation helpers
  const openSummary = (tender: Tender) => {
    setSelectedTenderId(tender.id);
    setEditedRequirements(tender.workforceRequirements || []);
    setIsEditingReqs(false);
    setView('summary');
  };

  const openWorkforce = (tender: Tender) => {
    setSelectedTenderId(tender.id);
    setEditedRequirements(tender.workforceRequirements || []);
    setIsEditingReqs(true);
    setView('workforce');
  };

  const openFeeCheckout = (tender: Tender) => {
    setSelectedTenderId(tender.id);
    setPaymentSuccessStep(false);
    setIsProcessingPayment(false);
    setView('feeCheckout');
  };

  const openContractors = (tender: Tender) => {
    setSelectedTenderId(tender.id);
    setView('contractors');
  };

  const back = () => {
    setIsEditingReqs(false);
    setView('dashboard');
  };

  // Filtered tenders
  const filtered = useMemo(() => {
    return tenders.filter((item) => {
      const matchCat = category === 'All' || item.category === category;
      const searchTarget = `${item.title} ${item.dept} ${item.location}`.toLowerCase();
      const matchQuery = searchTarget.includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [tenders, category, query]);

  // Requirement editing functions
  const handleHeadcountChange = (id: string, delta: number) => {
    setEditedRequirements((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, headcount: Math.max(1, item.headcount + delta) };
      })
    );
  };

  const handleWageChange = (id: string, wage: number) => {
    setEditedRequirements((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, dailyWageRate: Math.max(300, wage) };
      })
    );
  };

  const handleDeleteTrade = (id: string) => {
    if (editedRequirements.length <= 1) {
      showToast(t('cancel') || 'At least one requirement must remain');
      return;
    }
    setEditedRequirements((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddTrade = () => {
    if (editedRequirements.some((r) => r.skill === selectedNewTrade)) {
      showToast('Trade already exists in requirements');
      return;
    }
    const isUnskilled = selectedNewTrade.toLowerCase().includes('labourer') || selectedNewTrade.toLowerCase().includes('helper');
    const newItem: TenderWorkforceItem = {
      id: 'wf-' + Date.now(),
      skill: selectedNewTrade,
      headcount: 5,
      dailyWageRate: isUnskilled ? 650 : 900,
      category: isUnskilled ? 'unskilled' : 'skilled',
      notes: 'Added via Employer Customizer',
    };
    setEditedRequirements((prev) => [...prev, newItem]);
  };

  const handleSaveRequirements = () => {
    updateTenderWorkforceRequirements(selected.id, editedRequirements);
    setIsEditingReqs(false);
    showToast(t('requirementsSavedToast') || 'Workforce requirements updated & saved in real time!');
  };

  const handleCreatePlan = () => {
    createWorkforcePlan(selected.id, editedRequirements);
    showToast(t('workforcePlanCreatedToast') || 'Workforce plan created and stored in real time!');
  };

  const handleToggleSave = (tenderId: string) => {
    toggleSaveTender(tenderId);
    const isSaved = savedTenderIds.includes(tenderId);
    showToast(isSaved ? (t('tenderRemovedToast') || 'Removed from watchlist') : (t('tenderSavedToast') || 'Saved to watchlist!'));
  };

  const handleContactPartner = (partnerName: string) => {
    requestPartnerConnection(partnerName);
    showToast(t('partnerContactedToast') || 'Partner connection inquiry sent!');
  };

  // Preset loader for quick testing
  const loadPreset = (presetIndex: number) => {
    if (presetIndex === 1) {
      setNewTitle('Flyover & Grade Separator Construction');
      setNewDept('State Highway Development Project');
      setNewCategory('Infrastructure');
      setNewLocation('Bengaluru Outer Ring Road, Karnataka');
      setNewBudget(18000000);
      setNewDuration(12);
      setNewScope('Cast-in-situ pier caps, pre-stressed girder placement, asphalt wearing course, road safety signage, and drainage.');
    } else if (presetIndex === 2) {
      setNewTitle('Commercial IT Tech Park Civil Extension');
      setNewDept('Private Infrastructure Developer');
      setNewCategory('Civil & Commercial');
      setNewLocation('Whitefield, Bengaluru');
      setNewBudget(4800000);
      setNewDuration(6);
      setNewScope('RC framed structure, interior partitioning, vitrified tiling, fire suppression conduits, and exterior glazing.');
    } else {
      setNewTitle('750 kW Solar Power Substation & Civil Footings');
      setNewDept('Renewable Energy Development Agency');
      setNewCategory('Electrical & Substation');
      setNewLocation('Tumakuru Solar Corridor, Karnataka');
      setNewBudget(7500000);
      setNewDuration(5);
      setNewScope('Transformer plinths, inverter stations, high voltage HT cable conduits, switchgear earthing, and security perimeter.');
    }
  };

  // Handle Form Submit: Enter & Analyze Tender
  const handleSubmitTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter a tender title');
      return;
    }
    setIsSubmittingTender(true);

    try {
      const created = createAndAnalyzeTender({
        title: newTitle,
        dept: newDept || 'Private Contracting Authority',
        category: newCategory,
        location: newLocation,
        value: Number(newBudget),
        durationMonths: Number(newDuration),
        scopeDescription: newScope || 'Turnkey civil, electrical and MEP execution according to statutory standards.',
      });

      setSelectedTenderId(created.id);
      setEditedRequirements(created.workforceRequirements || []);
      setIsSubmittingTender(false);
      showToast(t('tenderCreatedToast') || 'Tender created, analyzed & stored in real time!');
      setView('summary');
    } catch (err) {
      setIsSubmittingTender(false);
      showToast('Error analyzing tender: ' + String(err));
    }
  };

  // Handle Dynamic Fee Payment & Unlock Contractors
  const handlePayFee = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      payTenderFeeAndUnlockContractors(selected.id, selectedPaymentMode);
      setIsProcessingPayment(false);
      setPaymentSuccessStep(true);
      showToast(t('paymentSuccessToast') || 'Fee paid successfully! Contractor profiles unlocked.');
      setTimeout(() => {
        setView('contractors');
      }, 700);
    }, 1100);
  };

  // Handle Send RFP to contractor
  const handleSendRfp = async (contractorId: string) => {
    const contractor = registeredContractors.find((item) => item.id === contractorId && item.accountBacked);
    if (!contractor) {
      sendRfpToContractor(selected.id, contractorId);
      showToast('Demo RFP saved locally; this sample contractor has no linked account.');
      return;
    }
    try {
      const response = await fetch('/api/contractor-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractorId,
          tenderId: selected.id,
          tenderTitle: selected.title,
          location: selected.location,
          budget: selected.value,
          scopeDescription: selected.scopeDescription || '',
        }),
      });
      const result = await response.json() as { link?: Omit<EmployerRfpLink, 'contractorName'>; error?: string };
      if (!response.ok || !result.link) throw new Error(result.error || 'Could not send contractor request.');
      const savedLink: EmployerRfpLink = { ...result.link, contractorName: contractor.name };
      setOutgoingRfps((previous) => [savedLink, ...previous.filter((link) => link.id !== savedLink.id)]);
      sendRfpToContractor(selected.id, contractorId);
      showToast('RFP sent to ' + contractor.name + '.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not send contractor request.');
    }
  };

  // Metrics
  const totalWorkforceNeeded = useMemo(() => {
    return tenders.reduce((sum, tender) => {
      const tenderTotal = tender.workforceRequirements?.reduce((s, r) => s + r.headcount, 0) || 0;
      return sum + tenderTotal;
    }, 0);
  }, [tenders]);

  const currentTenderTotalWorkers = useMemo(() => {
    return editedRequirements.reduce((sum, r) => sum + r.headcount, 0);
  }, [editedRequirements]);

  const currentTenderDailyBudget = useMemo(() => {
    return editedRequirements.reduce((sum, r) => sum + r.headcount * r.dailyWageRate, 0);
  }, [editedRequirements]);

  // =========================================================================
  // VIEW: ENTER / POST TENDER DETAILS
  // =========================================================================
  if (view === 'enterTender') {
    return (
      <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8 space-y-6">
        <button onClick={back} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">
          <ArrowLeft size={18} /> {t('backToHub')}
        </button>

        <ScreenHeader
          title={t('enterTender')}
          subtitle={t('postTenderSubtitle')}
          showBack={false}
        />

        {/* Quick Presets for testing */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/70 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-purple-900">
            <Sparkles size={16} className="text-purple-600" />
            <span>{t('quickPresets')}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => loadPreset(1)}
              className="p-2.5 rounded-xl bg-white border border-purple-200 hover:border-purple-400 text-left transition-all shadow-sm group"
            >
              <p className="text-xs font-bold text-gray-900 group-hover:text-purple-700">{t('preset1')}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">₹1.80 Cr · 12 Mo · Infra</p>
            </button>
            <button
              type="button"
              onClick={() => loadPreset(2)}
              className="p-2.5 rounded-xl bg-white border border-purple-200 hover:border-purple-400 text-left transition-all shadow-sm group"
            >
              <p className="text-xs font-bold text-gray-900 group-hover:text-purple-700">{t('preset2')}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">₹48 Lakhs · 6 Mo · Civil</p>
            </button>
            <button
              type="button"
              onClick={() => loadPreset(3)}
              className="p-2.5 rounded-xl bg-white border border-purple-200 hover:border-purple-400 text-left transition-all shadow-sm group"
            >
              <p className="text-xs font-bold text-gray-900 group-hover:text-purple-700">{t('preset3')}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">₹75 Lakhs · 5 Mo · Solar</p>
            </button>
          </div>
        </div>

        {/* Tender Intake Form */}
        <form onSubmit={handleSubmitTender} className="space-y-4">
          <Card className="p-5 space-y-4 border border-gray-200 shadow-sm">
            {/* Title */}
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                {t('tenderTitleLabel')} *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t('tenderTitlePlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            {/* Department & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                  {t('issuingAuthorityLabel')}
                </label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder={t('issuingAuthorityPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                  {t('categoryLabel')}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                >
                  <option value="Infrastructure">Infrastructure & Roads</option>
                  <option value="Civil & Commercial">Civil & Commercial Building</option>
                  <option value="Electrical & Substation">Electrical & Substation</option>
                  <option value="Water & Irrigation">Water & Irrigation</option>
                  <option value="Smart City & Urban">Smart City & Urban Development</option>
                  <option value="IT & Technology">IT & Technology Infrastructure</option>
                </select>
              </div>
            </div>

            {/* Location & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                  {t('projectLocationLabel')}
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder={t('projectLocationPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                  {t('durationMonthsLabel')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            {/* Budget with Live Reasonable Dynamic Fee Breakdown Callout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                  {t('tenderBudgetLabel')} *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-extrabold text-xs">₹</span>
                  <input
                    type="number"
                    min={50000}
                    step={25000}
                    required
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-black focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1 font-semibold">
                  Budget: {formatINR(newBudget)}
                </p>
              </div>

              {/* Reasonable Dynamic Live Fee Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-medium">Platform Matching Fee ({liveFormFee.tierLabel})</span>
                  <span className="font-extrabold text-amber-400">₹{liveFormFee.baseFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>18% GST (CGST 9% + SGST 9%)</span>
                  <span>₹{liveFormFee.gst?.toLocaleString('en-IN') || (liveFormFee.cgst + liveFormFee.sgst).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-700 pt-1.5 flex items-center justify-between text-xs font-black text-white">
                  <span>Total Amount Payable</span>
                  <span className="text-emerald-400 text-sm">₹{liveFormFee.totalFee.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[9px] text-gray-400 pt-0.5 leading-tight">
                  * Scaled affordably to your budget. Charged only when unlocking verified contractors.
                </p>
              </div>
            </div>

            {/* Scope & Description */}
            <div>
              <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                {t('scopeDescriptionLabel')}
              </label>
              <textarea
                rows={4}
                value={newScope}
                onChange={(e) => setNewScope(e.target.value)}
                placeholder={t('scopeDescriptionPlaceholder')}
                className="w-full p-3 rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none leading-relaxed"
              />
            </div>
          </Card>

          <Button
            type="submit"
            disabled={isSubmittingTender}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-float"
          >
            <Sparkles size={16} />
            {isSubmittingTender ? t('analyzingTender') : t('analyseAndGenerateBtn')}
          </Button>
        </form>
      </div>
    );
  }

  // =========================================================================
  // VIEW: DYNAMIC FEE CHECKOUT & PAYMENT GATEWAY
  // =========================================================================
  if (view === 'feeCheckout') {
    return (
      <div className="px-5 pt-6 pb-24 max-w-3xl mx-auto lg:px-8 space-y-6">
        <button onClick={() => setView('summary')} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">
          <ArrowLeft size={18} /> {selected.title}
        </button>

        <ScreenHeader
          title={t('feeCheckoutTitle')}
          subtitle={t('feeCheckoutSubtitle')}
          showBack={false}
        />

        {/* Fee Breakdown Card */}
        <Card className="p-5 border-2 border-brand-200/80 bg-white space-y-4 shadow-md">
          <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
                {selected.category}
              </span>
              <h2 className="font-black text-gray-900 text-base mt-1.5">{selected.title}</h2>
              <p className="text-xs text-gray-500">{selected.dept} · {selected.location}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('tenderBudget')}</span>
              <p className="text-base font-extrabold text-gray-900">{formatINR(selected.value)}</p>
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-gray-600">
              <span>{t('feeTierRate')}</span>
              <span className="font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md">
                {selectedTenderFee.tierLabel} ({selectedTenderFee.ratePercent}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-700">
              <span>{t('baseFee')}</span>
              <span className="font-bold">₹{selectedTenderFee.baseFee.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between text-gray-500 text-[11px]">
              <span>{t('cgst')}</span>
              <span>₹{selectedTenderFee.cgst.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between text-gray-500 text-[11px]">
              <span>{t('sgst')}</span>
              <span>₹{selectedTenderFee.sgst.toLocaleString('en-IN')}</span>
            </div>

            <div className="border-t-2 border-dashed border-gray-200 pt-3 flex items-center justify-between text-sm font-black text-gray-900">
              <span>{t('totalPayable')}</span>
              <span className="text-xl font-black text-brand-600">
                ₹{selectedTenderFee.totalFee.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5">
            <Lock size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900 leading-snug">
              {t('feeExplanation')}
            </p>
          </div>
        </Card>

        {/* Payment Gateway Experience */}
        <Card className="p-5 space-y-4 border border-gray-200 shadow-sm">
          <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
            <CreditCard size={17} className="text-brand-600" />
            {t('selectPaymentMethod')}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'upi', label: 'UPI / QR', desc: 'GPay, PhonePe, Paytm' },
              { id: 'netbanking', label: 'NetBanking', desc: 'HDFC, SBI, ICICI' },
              { id: 'card', label: 'Corporate Card', desc: 'Visa, MasterCard, RuPay' },
              { id: 'neft', label: 'NEFT / RTGS', desc: 'Virtual Escrow Account' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedPaymentMode(mode.id as any)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedPaymentMode === mode.id
                    ? 'border-brand-600 bg-brand-50/80 text-brand-900 shadow-sm ring-1 ring-brand-500'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <p className="text-xs font-black">{mode.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{mode.desc}</p>
              </button>
            ))}
          </div>

          {/* Interactive Gateway Mode Specific Displays */}
          {selectedPaymentMode === 'upi' && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-4 animate-fade-in">
              <div className="w-24 h-24 bg-white rounded-xl p-2 border border-gray-300 flex flex-col items-center justify-center shadow-inner">
                <QrCode size={56} className="text-gray-800" />
                <span className="text-[8px] font-bold text-gray-400 mt-1">BHIM UPI QR</span>
              </div>
              <div className="space-y-1 text-center sm:text-left flex-1">
                <p className="text-xs font-black text-gray-900">Scan & Pay via any UPI App</p>
                <p className="text-[11px] text-gray-600">VPA: <strong className="text-brand-700">shramasetu.pay@hdfcbank</strong></p>
                <p className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                  Instant Auto-Verification Enabled
                </p>
              </div>
            </div>
          )}

          {selectedPaymentMode === 'netbanking' && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 animate-fade-in">
              <p className="text-xs font-bold text-gray-700">Select Bank:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Canara Bank', 'Punjab National'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    className={`p-2 rounded-xl text-xs font-bold border text-left transition-all ${
                      selectedBank === b ? 'bg-white border-brand-500 text-brand-700 shadow-sm ring-1 ring-brand-500' : 'bg-gray-100/70 border-gray-200 text-gray-700'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedPaymentMode === 'card' && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5 animate-fade-in">
              <div>
                <span className="text-[11px] font-bold text-gray-600">Card Number</span>
                <input
                  type="text"
                  readOnly
                  value="4532 •••• •••• 8821"
                  className="w-full mt-1 p-2 rounded-xl border border-gray-300 text-xs bg-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] font-bold text-gray-600">Valid Thru</span>
                  <input type="text" readOnly value="10/29" className="w-full mt-1 p-2 rounded-xl border border-gray-300 text-xs bg-white font-mono" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-600">CVV</span>
                  <input type="text" readOnly value="•••" className="w-full mt-1 p-2 rounded-xl border border-gray-300 text-xs bg-white font-mono" />
                </div>
              </div>
            </div>
          )}

          {selectedPaymentMode === 'neft' && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1.5 text-xs animate-fade-in">
              <p className="font-extrabold text-gray-900">Virtual Escrow Account Details</p>
              <p className="text-gray-600">Beneficiary: <strong>ShramaSetu Technologies Pvt Ltd</strong></p>
              <p className="text-gray-600">Account No: <strong>SHRAMA820019283</strong></p>
              <p className="text-gray-600">IFSC Code: <strong>HDFC0000128</strong></p>
            </div>
          )}

          <p className="text-[11px] text-gray-400 italic">
            * {t('onlinePaymentMock')}
          </p>

          <Button
            onClick={handlePayFee}
            disabled={isProcessingPayment || paymentSuccessStep}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-float transition-all"
          >
            {isProcessingPayment ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Verifying Gateway Payment...
              </>
            ) : paymentSuccessStep ? (
              <>
                <CheckCircle2 size={16} />
                Payment Confirmed! Opening Contractors...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                {t('payAndUnlockBtn')} (₹{selectedTenderFee.totalFee.toLocaleString('en-IN')})
              </>
            )}
          </Button>
        </Card>
      </div>
    );
  }

  // =========================================================================
  // VIEW: SUITABLE CONTRACTOR PROFILES MATCHED TO TENDER
  // =========================================================================
  if (view === 'contractors') {
    const rawContractors = selected.unlockedContractors || [];
    // Ensure fallback sample contractors if empty
    const demoContractors: ContractorMatch[] = rawContractors.length > 0 ? rawContractors : [
      {
        id: 'c-shree-balaji',
        name: 'R. K. Balaji',
        companyName: 'Shree Balaji Infra Projects Pvt Ltd',
        company: 'Shree Balaji Infra Projects Pvt Ltd',
        avatar: 'SB',
        rating: 4.9,
        trustScore: 97,
        workforceCapacity: 85,
        fleetCapacity: '85 verified workers',
        specialties: ['Civil Engineers', 'Masons', 'Bar Bender & Steel Fixer', 'Machine Operators'],
        trades: ['Civil Engineers', 'Masons', 'Bar Bender & Steel Fixer', 'Machine Operators'],
        location: selected.location || 'Mysuru, Karnataka',
        pastProjectsCount: 42,
        completedTenders: 42,
        licenseVerified: true,
        verified: true,
        licenses: ['CPWD Class 1', 'BOCW Active', 'EPFO Verified'],
        contactNumber: '+91 98450 32101',
        matchScore: 96,
        rfpSent: false,
      },
      {
        id: 'c-kumar-constructions',
        name: 'Rajesh Kumar',
        companyName: 'Kumar Constructions & Civil Tech',
        company: 'Kumar Constructions & Civil Tech',
        avatar: 'KC',
        rating: 4.8,
        trustScore: 94,
        workforceCapacity: 60,
        fleetCapacity: '60 verified workers',
        specialties: ['Civil Engineers', 'Site Supervisors', 'Construction Labourers', 'Masons'],
        trades: ['Civil Engineers', 'Site Supervisors', 'Construction Labourers', 'Masons'],
        location: selected.location || 'Mysuru, Karnataka',
        pastProjectsCount: 29,
        completedTenders: 29,
        licenseVerified: true,
        verified: true,
        licenses: ['PWD Class 2', 'BOCW Registered', 'ISO 9001'],
        contactNumber: '+91 98450 33250',
        matchScore: 93,
        rfpSent: false,
      },
      {
        id: 'c-apex-industrial',
        name: 'Vikramaditya Rao',
        companyName: 'Apex Industrial & Engineering Solutions',
        company: 'Apex Industrial & Engineering Solutions',
        avatar: 'AI',
        rating: 4.7,
        trustScore: 92,
        workforceCapacity: 110,
        fleetCapacity: '110 verified workers',
        specialties: ['Machine Operators', 'Civil Engineers', 'Structural Welder', 'QA Engineers'],
        trades: ['Machine Operators', 'Civil Engineers', 'Structural Welder', 'QA Engineers'],
        location: 'Bengaluru / Mysuru, Karnataka',
        pastProjectsCount: 38,
        completedTenders: 38,
        licenseVerified: true,
        verified: true,
        licenses: ['CPWD Class 1', 'Electrical Inspectorate Certified'],
        contactNumber: '+91 98450 34400',
        matchScore: 90,
        rfpSent: false,
      },
    ];
    const contractors: ContractorMatch[] = [
      ...registeredContractors.map((contractor) => ({
        ...contractor,
        rfpSent: outgoingRfps.some((link) => link.contractorId === contractor.id && link.tenderId === selected.id),
      })),
      ...demoContractors.filter((contractor) => !registeredContractors.some((registered) =>
        registered.name.trim().toLowerCase() === contractor.name.trim().toLowerCase()
      )),
    ];

    return (
      <div className="px-5 pt-6 pb-24 max-w-5xl mx-auto lg:px-8 space-y-6">
        <button onClick={() => setView('summary')} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">
          <ArrowLeft size={18} /> {t('backToHub')}
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <ScreenHeader
              title={t('matchedContractorsTitle')}
              subtitle={`${contractors.length} ${t('matchedContractorsSubtitle')}`}
              showBack={false}
            />
            <p className="text-xs font-bold text-brand-700 mt-1">
              Project: {selected.title} · Budget: {formatINR(selected.value)}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={14} className="text-emerald-600" />
              {t('feePaid')} ✓
            </span>
          </div>
        </div>

        {/* Contractor Cards List */}
        <div className="space-y-4">
          {contractors.map((c) => {
            const displayTrades = c.specialties || c.trades || [];
            const displayLicenses = c.licenses || ['CPWD Class 1', 'BOCW Active'];
            const compName = c.companyName || c.company || 'Verified Enterprise';
            const rfpStatus = outgoingRfps.find((link) => link.contractorId === c.id && link.tenderId === selected.id)?.status;

            return (
              <Card key={c.id} className="p-5 border border-gray-200 hover:shadow-card-hover transition-all space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-gray-900 text-base">{c.name}</h3>
                        {(c.licenseVerified || c.verified) && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 font-semibold mt-0.5">{compName} · {c.location}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-2 mt-1">
                        <span>⭐ {c.rating} Rating</span>
                        <span>·</span>
                        <span>{c.pastProjectsCount || c.completedTenders || 25} Tenders Completed</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col items-end gap-1.5 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-black">
                      {c.matchScore}% Match
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold">
                      {c.fleetCapacity || `${c.workforceCapacity} Available`}
                    </span>
                  </div>
                </div>

                {/* Licenses & Specializations */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {displayLicenses.map((lic) => (
                    <span key={lic} className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-semibold border border-gray-200 flex items-center gap-1">
                      <Award size={12} className="text-brand-600" /> {lic}
                    </span>
                  ))}
                  {displayTrades.map((tr) => (
                    <span key={tr} className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-800 text-[11px] font-semibold">
                      {tr}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <PhoneCall size={14} className="text-gray-400" />
                    <span className="font-semibold">{c.contactNumber || '+91 98450 32100'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {rfpStatus && (
                      <span className={`rounded-lg px-2.5 py-2 text-[11px] font-bold ${rfpStatus === 'accepted' ? 'bg-accent-50 text-accent-700' : rfpStatus === 'declined' ? 'bg-error-50 text-error-700' : 'bg-warning-50 text-warning-700'}`}>
                        {rfpStatus === 'accepted' ? 'Accepted' : rfpStatus === 'declined' ? 'Declined' : 'Pending'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => showToast('Opening direct communication channel with ' + c.name)}
                      className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5"
                    >
                      <MessageSquare size={14} /> {t('contactContractor')}
                    </button>

                    <Button
                      onClick={() => handleSendRfp(c.id)}
                      disabled={c.rfpSent}
                      className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                        c.rfpSent
                          ? 'bg-emerald-500 text-white cursor-default'
                          : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                      }`}
                    >
                      {c.rfpSent ? (
                        <>
                          <CheckCheck size={14} /> {t('rfpSent')}
                        </>
                      ) : (
                        <>
                          <Send size={14} /> {t('sendRfp')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: TENDER SUMMARY
  // =========================================================================
  if (view === 'summary') {
    const isSaved = savedTenderIds.includes(selected.id);
    const isUnlocked = selected.status === 'contractor_matched' || (selected.unlockedContractors && selected.unlockedContractors.length > 0);

    return (
      <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8 space-y-5">
        <button onClick={back} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">
          <ArrowLeft size={18} /> {t('backToHub')}
        </button>

        {/* Hero Card */}
        <Card className="p-5 bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                {selected.category}
              </span>
              <h1 className="text-2xl font-extrabold mt-2 leading-tight">{selected.title}</h1>
              <p className="text-sm opacity-90 mt-1 flex items-center gap-1.5">
                <MapPin size={14} /> {selected.dept} · {selected.location}
              </p>
            </div>
            <div className="bg-white/15 rounded-2xl px-3.5 py-2.5 text-center shrink-0 border border-white/10">
              <p className="text-2xl font-black">{selected.match || 90}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider">{t('matchProfile')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/5">
              <p className="text-xs opacity-75">{t('estimatedValue')}</p>
              <p className="font-extrabold text-lg mt-0.5">{formatINR(selected.value)}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/5">
              <p className="text-xs opacity-75">{t('closing')}</p>
              <p className="font-extrabold text-lg mt-0.5">{selected.closing || '30 Oct 2026'}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm border border-white/5 col-span-2 sm:col-span-1">
              <p className="text-xs opacity-75">{t('duration')}</p>
              <p className="font-extrabold text-lg mt-0.5">{selected.duration}</p>
            </div>
          </div>
        </Card>

        {/* Reasonable Dynamic Fee Banner */}
        <div className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div>
            <span className="text-[10px] font-extrabold text-brand-700 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded">
              Platform Matching Fee ({selectedTenderFee.tierLabel})
            </span>
            <p className="text-xs text-gray-700 font-bold mt-1">
              Fee: ₹{selectedTenderFee.totalFee.toLocaleString('en-IN')} (incl. 18% GST)
            </p>
          </div>

          {isUnlocked ? (
            <Button
              onClick={() => openContractors(selected)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 size={14} /> {t('viewContractors')} ({selected.unlockedContractors?.length || 3})
            </Button>
          ) : (
            <Button
              onClick={() => openFeeCheckout(selected)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Lock size={14} /> {t('unlockProfiles')}
            </Button>
          )}
        </div>

        {/* AI Summary Card */}
        <Card className="p-5 border border-purple-100 bg-purple-50/30">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-extrabold text-gray-900">{t('aiSummary')}</h2>
              <p className="text-xs text-gray-500">{t('aiSummarySubtitle')}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {selected.scopeDescription || `This ${selected.duration} project requires an optimized team across ${selected.skills?.length || 4} core trades. Review statutory eligibility and tender checklists below before official submission.`}
          </p>
        </Card>

        {/* Milestones if present */}
        {selected.milestones && selected.milestones.length > 0 && (
          <Card className="p-5 space-y-3">
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <Layers size={17} className="text-brand-600" />
              Project Milestones & Timeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selected.milestones.map((m) => (
                <div key={m.phase} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs font-black text-gray-900">{m.phase}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">{m.durationWeeks} weeks planned</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Eligibility & Documents */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="font-extrabold text-gray-900 mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-accent-600" />
              {t('whoCanApply')}
            </h3>
            <div className="space-y-2.5">
              {(selected.eligibility || []).map((x) => (
                <div key={x} className="flex gap-2 text-xs text-gray-700">
                  <CheckCircle2 size={16} className="text-accent-600 flex-shrink-0 mt-0.5" />
                  <span>{x}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-extrabold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-brand-600" />
              {t('documentsToPrepare')}
            </h3>
            <div className="space-y-2.5">
              {(selected.docs || []).map((x) => (
                <div key={x} className="flex gap-2 text-xs text-gray-700">
                  <FileText size={16} className="text-brand-600 flex-shrink-0 mt-0.5" />
                  <span>{x}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recommended Workforce with Real-Time Edit Option */}
        <Card className="p-5 space-y-4 border-2 border-brand-200/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                <Users size={18} className="text-brand-600" />
                {t('recommendedWorkforce')}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('totalWorkersRequired')}: <strong className="text-brand-700">{currentTenderTotalWorkers} workers</strong> (₹{currentTenderDailyBudget.toLocaleString('en-IN')}/day)
              </p>
            </div>

            <button
              onClick={() => setIsEditingReqs(!isEditingReqs)}
              className="px-3.5 py-1.5 rounded-xl border border-brand-300 text-brand-700 hover:bg-brand-50 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto shadow-sm"
            >
              <Edit3 size={14} />
              {isEditingReqs ? t('cancel') : t('editRequirements')}
            </button>
          </div>

          {/* If Editing Mode */}
          {isEditingReqs ? (
            <div className="space-y-3 pt-2 border-t border-gray-100 animate-fade-in">
              <p className="text-xs font-semibold text-gray-600">
                {t('editRequirementsDesc')}
              </p>

              <div className="space-y-2.5">
                {editedRequirements.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-gray-900">{item.skill}</p>
                      <p className="text-[11px] text-gray-500">₹{item.dailyWageRate}/day · {item.category}</p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-200">
                        <button
                          type="button"
                          onClick={() => handleHeadcountChange(item.id, -1)}
                          className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 font-bold"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-black">{item.headcount}</span>
                        <button
                          type="button"
                          onClick={() => handleHeadcountChange(item.id, 1)}
                          className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 font-bold"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-500">₹</span>
                        <input
                          type="number"
                          step={50}
                          value={item.dailyWageRate}
                          onChange={(e) => handleWageChange(item.id, Number(e.target.value))}
                          className="w-20 text-xs p-1 text-right rounded border border-gray-200 bg-white font-bold"
                          title="Daily Wage Rate"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTrade(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Trade Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <select
                  value={selectedNewTrade}
                  onChange={(e) => setSelectedNewTrade(e.target.value)}
                  className="w-full sm:flex-1 text-xs p-2 rounded-xl border border-gray-200 bg-white"
                >
                  {CATALOG_TRADES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddTrade}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Plus size={14} /> {t('addTrade')}
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  onClick={handleSaveRequirements}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Save size={14} /> {t('saveRequirements')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingReqs(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          ) : (
            /* Read Mode */
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {selected.workforceRequirements?.map((x) => (
                  <span
                    key={x.id}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-800 text-xs font-bold border border-gray-200 flex items-center gap-1.5"
                  >
                    <span>{x.skill}</span>
                    <span className="bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {x.headcount}
                    </span>
                  </span>
                ))}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => openWorkforce(selected)}
                  variant="outline"
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Edit3 size={14} /> {t('editRequirements')}
                </Button>

                {isUnlocked ? (
                  <Button
                    onClick={() => openContractors(selected)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-float"
                  >
                    <CheckCircle2 size={14} /> {t('viewContractors')}
                  </Button>
                ) : (
                  <Button
                    onClick={() => openFeeCheckout(selected)}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-float"
                  >
                    <Lock size={14} /> {t('unlockProfiles')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Bottom Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => handleToggleSave(selected.id)}
            className={`py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isSaved
                ? 'border-brand-300 bg-brand-50 text-brand-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Check size={16} />
            {isSaved ? t('saved') : t('saveTender')}
          </button>
          <button
            onClick={() => showToast('Opening official e-Procurement portal (prototype)')}
            className="py-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm"
          >
            {t('viewOfficialTender')}
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: TENDER EXPLORER
  // =========================================================================
  if (view === 'tenders') {
    return (
      <div className="px-5 pt-6 pb-24 max-w-5xl mx-auto lg:px-8 space-y-4">
        <button onClick={back} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">
          <ArrowLeft size={18} /> {t('backToHub')}
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <ScreenHeader
            title={t('tenderExplorer')}
            subtitle={t('tenderExplorerSubtitle')}
            showBack={false}
          />
          <Button
            onClick={() => setView('enterTender')}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} /> {t('enterTender')}
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchTendersPlaceholder')}
              className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'All', label: t('categoryAll') },
            { id: 'Infrastructure', label: t('categoryInfra') },
            { id: 'Civil & Commercial', label: 'Civil & Commercial' },
            { id: 'Electrical & Substation', label: 'Electrical & Substation' },
            { id: 'IT & Technology', label: t('categoryIT') },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                category === c.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Tenders List */}
        <div className="space-y-3 pt-2">
          {filtered.map((tItem) => (
            <TenderCard
              key={tItem.id}
              tender={tItem}
              saved={savedTenderIds.includes(tItem.id)}
              onOpen={() => openSummary(tItem)}
              onSave={() => handleToggleSave(tItem.id)}
              t={t}
            />
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: WORKFORCE PLANNER & EDIT REQUIREMENTS
  // =========================================================================
  if (view === 'workforce') {
    return (
      <SimplePanel title={t('findWorkforce')} icon={<Users size={22} />} onBack={back} t={t}>
        <div className="space-y-5">
          <div className="p-4 bg-brand-50 border border-brand-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-brand-950 text-sm">{selected.title}</h3>
              <p className="text-xs text-brand-800/80 mt-1">
                Customize trade requirements and generate a real-time workforce allocation plan for this tender.
              </p>
            </div>
            <Button
              onClick={() => openFeeCheckout(selected)}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Lock size={14} /> {t('unlockProfiles')}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {t('editRequirementsTitle')}
              </h4>
              <span className="text-xs font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                Total: {currentTenderTotalWorkers} workers · ₹{currentTenderDailyBudget.toLocaleString('en-IN')}/day
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {editedRequirements.map((req) => (
                <Card key={req.id} className="p-4 border border-gray-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-extrabold text-gray-900 text-sm">{req.skill}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{req.category} · ₹{req.dailyWageRate}/day</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTrade(req.id)}
                      className="p-1 text-gray-300 hover:text-red-500 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-600 font-semibold">{t('headcount')}:</span>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleHeadcountChange(req.id, -1)}
                        className="w-6 h-6 rounded bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-black text-gray-900">{req.headcount}</span>
                      <button
                        type="button"
                        onClick={() => handleHeadcountChange(req.id, 1)}
                        className="w-6 h-6 rounded bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Add Trade Stream */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-dashed border-gray-300 flex items-center gap-2">
              <select
                value={selectedNewTrade}
                onChange={(e) => setSelectedNewTrade(e.target.value)}
                className="flex-1 text-xs p-2 rounded-xl border border-gray-200 bg-white"
              >
                {CATALOG_TRADES.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddTrade}
                className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-800 text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus size={14} /> {t('addTrade')}
              </button>
            </div>
          </div>

          <section className="border-t border-gray-100 pt-4" aria-labelledby="registered-workers-title">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h4 id="registered-workers-title" className="text-xs font-bold uppercase tracking-wider text-gray-500">Registered workers matching this plan</h4>
              <span className="text-xs text-gray-400">{matchedRegisteredWorkers.length} profiles</span>
            </div>
            {matchedRegisteredWorkers.length ? (
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white px-3">
                {matchedRegisteredWorkers.slice(0, 8).map((worker) => (
                  <div key={worker.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900">{worker.name}</p>
                      <p className="truncate text-xs text-gray-500">{worker.primarySkill} · {worker.experience} · {worker.location}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-semibold text-brand-700">{worker.shramaId}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500">No registered worker profiles match these trades yet.</p>
            )}
          </section>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleSaveRequirements}
              className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-1.5"
            >
              <Save size={14} /> {t('saveRequirements')}
            </Button>
            <Button
              onClick={handleCreatePlan}
              className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-float"
            >
              <Check size={14} /> Create Workforce Plan
            </Button>
          </div>
        </div>
      </SimplePanel>
    );
  }

  // =========================================================================
  // VIEW: PARTNERS
  // =========================================================================
  if (view === 'partners') {
    const partnerList = [
      { id: 'p1', name: 'Electrical Contractors', count: 14 },
      { id: 'p2', name: 'Earthwork & Civil Subcontractors', count: 19 },
      { id: 'p3', name: 'Transport & Fleet Logistics', count: 24 },
      { id: 'p4', name: 'Labour Supply Contractors', count: 32 },
      { id: 'p5', name: 'Heavy Machinery & Crane Providers', count: 11 },
    ];

    return (
      <SimplePanel title={t('projectPartners')} icon={<Building2 size={22} />} onBack={back} t={t}>
        <p className="text-xs text-gray-600 mb-4">{t('projectPartnersDesc')}</p>
        <div className="space-y-3">
          {partnerList.map((p) => {
            const isRequested = partnerRequests[p.name];
            return (
              <Card key={p.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <BriefcaseBusiness size={18} />
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.count} verified providers nearby</p>
                  </div>
                </div>
                <button
                  onClick={() => handleContactPartner(p.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isRequested
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                  }`}
                >
                  {isRequested ? 'Inquiry Sent ✓' : 'Contact →'}
                </button>
              </Card>
            );
          })}
        </div>
      </SimplePanel>
    );
  }

  // =========================================================================
  // VIEW: ALERTS
  // =========================================================================
  if (view === 'alerts') {
    return (
      <SimplePanel title={t('tenderAlerts')} icon={<Bell size={22} />} onBack={back} t={t}>
        <Card className="p-4 mb-3 border border-amber-200 bg-amber-50/40">
          <p className="font-extrabold text-xs text-amber-900">Your Alert Notification Preferences</p>
          <p className="text-xs text-amber-800 mt-1">Karnataka · Infrastructure · IT & Technology · Real-time SMS & In-app</p>
        </Card>
        <div className="space-y-2.5">
          {[
            'New Road Development tender matches your profile',
            'Smart City RFP closing date in 5 days',
            'Irrigation canal tender corrigendum published by Water Resources',
          ].map((x, i) => (
            <Card key={x} className="p-3.5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-warning-50 text-warning-600 flex items-center justify-center shrink-0">
                <Bell size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 leading-snug">{x}</p>
                <p className="text-[10px] text-gray-400 mt-1">{i + 1} hour{i ? 's' : ''} ago</p>
              </div>
            </Card>
          ))}
        </div>
      </SimplePanel>
    );
  }

  // =========================================================================
  // VIEW: PROFILE
  // =========================================================================
  if (view === 'profile') {
    return (
      <SimplePanel title={t('businessProfile')} icon={<Building2 size={22} />} onBack={back} t={t}>
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-extrabold text-xl shadow-sm">
              {(registrationProfile?.company || registrationProfile?.name || 'AB').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-extrabold text-lg text-gray-900">
                {registrationProfile?.company || registrationProfile?.name || 'ABC Infrastructure Pvt Ltd'}
              </p>
              <p className="text-xs text-gray-500">Infrastructure & Technology Contracting · Karnataka</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Metric label={t('experience')} value={registrationProfile?.experience || '8 years'} />
            <Metric label={t('teamSize')} value={`${registrationProfile?.workersManaged || 65} workers`} />
            <Metric label={t('savedProjects')} value={`${savedTenderIds.length} projects`} />
            <Metric label={t('matchProfile')} value="88% Match" />
          </div>
        </Card>
      </SimplePanel>
    );
  }

  // =========================================================================
  // MAIN VIEW: EMPLOYER HUB DASHBOARD
  // =========================================================================
  return (
    <div className="px-5 pt-6 pb-24 max-w-5xl mx-auto lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            {t('employerHubTitle')}
          </p>
          <h1 className="text-2xl font-black text-gray-900 mt-1">
            {t('employerWelcome')}, {registrationProfile?.company || registrationProfile?.name || 'ABC Infrastructure'} 👋
          </h1>
          <p className="text-xs text-gray-500 mt-1 max-w-lg leading-relaxed">
            {t('employerSubtitle')}
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setView('enterTender')}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-float"
          >
            <Plus size={16} />
            {t('enterTender')}
          </Button>

          <button
            onClick={() => setView('profile')}
            className="w-10 h-10 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-600 flex items-center justify-center transition-all shadow-sm"
            title={t('businessProfile')}
          >
            <Building2 size={18} />
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          [tenders.length.toString(), t('matchingTenders'), FileSearch, () => setView('tenders')],
          ['6', t('closingSoon'), Clock3, () => setView('tenders')],
          [totalWorkforceNeeded.toString(), t('workforceNeeds'), Users, () => openWorkforce(selected)],
          [savedTenderIds.length.toString(), t('savedProjects'), BriefcaseBusiness, () => setView('tenders')],
        ].map(([val, label, IconComponent, clickAction], idx) => {
          const Icon = IconComponent as any;
          return (
            <Card
              key={idx}
              onClick={clickAction as any}
              className="p-4 cursor-pointer hover:shadow-card-hover transition-all border border-gray-100 group"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Icon size={18} />
              </div>
              <p className="text-2xl font-black text-gray-900">{val as string}</p>
              <p className="text-xs text-gray-500 font-semibold mt-0.5">{label as string}</p>
            </Card>
          );
        })}
      </div>

      {/* 3 Core Workflow Cards */}
      <div className="grid md:grid-cols-3 gap-3">
        {[
          [FileSearch, t('findTenders'), t('findTendersDesc'), 'tenders'],
          [Sparkles, t('understandTenders'), t('understandTendersDesc'), 'enterTender'],
          [Users, t('executeTenders'), t('executeTendersDesc'), 'workforce'],
        ].map(([IconComponent, title, subtitle, targetView]) => {
          const Icon = IconComponent as any;
          return (
            <button
              key={title as string}
              onClick={() => {
                if (targetView === 'workforce') {
                  openWorkforce(selected);
                } else {
                  setView(targetView as any);
                }
              }}
              className="text-left bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Icon size={20} />
              </div>
              <p className="font-extrabold text-sm text-gray-900">{title as string}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{subtitle as string}</p>
              <span className="text-xs font-bold text-brand-600 mt-3 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                {t('open')} <ArrowRight size={14} />
              </span>
            </button>
          );
        })}
      </div>

      {/* Employer's Active Tenders / Projects */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-gray-900 text-base">{t('yourTenders')}</h2>
            <p className="text-xs text-gray-500">{t('yourTendersDesc')}</p>
          </div>
          <button
            onClick={() => setView('tenders')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700"
          >
            {t('viewAll')}
          </button>
        </div>

        <div className="space-y-3">
          {tenders.slice(0, 3).map((tItem) => (
            <TenderCard
              key={tItem.id}
              tender={tItem}
              saved={savedTenderIds.includes(tItem.id)}
              onOpen={() => openSummary(tItem)}
              onSave={() => handleToggleSave(tItem.id)}
              t={t}
            />
          ))}
        </div>
      </div>

      {/* Partner & Alert Links */}
      <div className="grid md:grid-cols-2 gap-3">
        <Card
          className="p-4 flex items-center gap-3 cursor-pointer hover:shadow-card-hover transition-all"
          onClick={() => setView('alerts')}
        >
          <div className="w-10 h-10 rounded-xl bg-warning-50 text-warning-600 flex items-center justify-center shrink-0">
            <Bell size={19} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900">{t('tenderAlerts')}</p>
            <p className="text-xs text-gray-500">3 {t('tenderAlertsDesc')}</p>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </Card>

        <Card
          className="p-4 flex items-center gap-3 cursor-pointer hover:shadow-card-hover transition-all"
          onClick={() => setView('partners')}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 size={19} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900">{t('projectPartners')}</p>
            <p className="text-xs text-gray-500">{t('projectPartnersDesc')}</p>
          </div>
          <ChevronRight size={18} className="text-gray-300" />
        </Card>
      </div>
    </div>
  );
}

// =========================================================================
// Helper Component: TenderCard
// =========================================================================
function TenderCard({
  tender,
  saved,
  onOpen,
  onSave,
  t,
}: {
  tender: Tender;
  saved: boolean;
  onOpen: () => void;
  onSave: () => void;
  t: (k: string) => string;
}) {
  const totalHeadcount = tender.workforceRequirements?.reduce((sum, r) => sum + r.headcount, 0) || 0;

  return (
    <Card className="p-4 border border-gray-100 hover:shadow-card-hover transition-all group">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
          <FileText size={20} />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-extrabold text-gray-900 text-sm leading-snug group-hover:text-brand-600 transition-colors">
                {tender.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{tender.dept} · {tender.location}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap ${
              tender.status === 'contractor_matched'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-brand-50 text-brand-700 border border-brand-200'
            }`}>
              {tender.status === 'contractor_matched' ? '✓ Contractors Unlocked' : 'AI Analyzed'}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1 font-semibold text-gray-700">
              <IndianRupee size={12} /> {formatINR(tender.value)}
            </span>
            <span className="flex items-center gap-1">
              <Clock3 size={12} /> {tender.closing || '30 Oct 2026'}
            </span>
            <span className="flex items-center gap-1 text-brand-700 font-semibold">
              <Users size={12} /> {totalHeadcount} workers
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onOpen}
              className="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold transition-colors shadow-sm"
            >
              {t('viewSummary')}
            </button>
            <button
              onClick={onSave}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                saved
                  ? 'border-brand-300 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {saved ? t('saved') : t('save')}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// =========================================================================
// Helper Component: SimplePanel
// =========================================================================
function SimplePanel({
  title,
  icon,
  onBack,
  children,
  t,
}: {
  title: string;
  icon: React.ReactNode;
  onBack: () => void;
  children: React.ReactNode;
  t: (k: string) => string;
}) {
  return (
    <div className="px-5 pt-6 pb-24 max-w-4xl mx-auto lg:px-8 space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-600 transition-colors">
        <ArrowLeft size={18} /> {t('backToHub')}
      </button>
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500">{t('employerServices')}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// =========================================================================
// Helper Component: Metric
// =========================================================================
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
      <p className="text-[11px] font-semibold text-gray-400">{label}</p>
      <p className="font-extrabold text-gray-900 text-sm mt-0.5">{value}</p>
    </div>
  );
}
