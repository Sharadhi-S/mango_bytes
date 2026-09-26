import type {
  Tender,
  TenderWorkforceItem,
  TenderMilestone,
  DynamicFeeCalculation,
  ContractorMatch,
  WorkforcePlan,
} from '../types';

import { generateInitialBelagaviWorkers } from './aiExtractionService';

export const STORAGE_KEY = 'shramasetu_employer_state_v4';
export const BROADCAST_CHANNEL = 'shramasetu_employer_sync';

export interface EmployerBackendState {
  tenders: Tender[];
  savedTenderIds: string[];
  workforcePlans: Record<string, WorkforcePlan>;
  partnerRequests: Record<string, boolean>;
}

// ----------------------------------------------------
// Employer Dynamic Tender Access Fee Calculator
// User Specified Tier Rates:
// • Up to ₹25 Lakhs: ₹4,000 + 18% GST (₹4,720)
// • ₹25 Lakhs to ₹50 Lakhs: ₹5,000 + 18% GST (₹5,900)
// • ₹50 Lakhs to ₹1 Crore: ₹8,000 + 18% GST (₹9,440)
// • ₹1 Crore to ₹2.5 Crores: ₹12,000 + 18% GST (₹14,160)
// • Above ₹2.5 Crores: ₹15,000 + 18% GST (₹17,700)
// Itemized with 18% GST (9% CGST + 9% SGST)
// ----------------------------------------------------
export function calculateDynamicTenderFee(budget: number): DynamicFeeCalculation {
  const cleanBudget = Math.max(0, Number(budget) || 0);
  let baseFee = 4000;
  let tierLabel = 'Up to ₹25 Lakhs';

  if (cleanBudget <= 2500000) {
    baseFee = 4000;
    tierLabel = 'Up to ₹25 Lakhs';
  } else if (cleanBudget <= 5000000) {
    baseFee = 5000;
    tierLabel = '₹25 Lakhs – ₹50 Lakhs';
  } else if (cleanBudget <= 10000000) {
    baseFee = 8000;
    tierLabel = '₹50 Lakhs – ₹1 Crore';
  } else if (cleanBudget <= 25000000) {
    baseFee = 12000;
    tierLabel = '₹1 Crore – ₹2.5 Crores';
  } else {
    baseFee = 15000;
    tierLabel = 'Above ₹2.5 Crores';
  }

  const cgst = Math.round(baseFee * 0.09);
  const sgst = Math.round(baseFee * 0.09);
  const gst = cgst + sgst;
  const totalFee = baseFee + gst;
  const ratePercent = cleanBudget > 0 ? Number(((baseFee / cleanBudget) * 100).toFixed(3)) : 0;

  return {
    budget: cleanBudget,
    tenderValue: cleanBudget,
    ratePercent,
    tierPercentage: ratePercent,
    baseFee,
    cgst,
    sgst,
    gst,
    totalFee,
    tierLabel,
  };
}

// ----------------------------------------------------
// AI Tender Analysis Engine
// Analyzes scope, budget, and duration to generate
// milestone schedule and trade-by-trade labor breakdown
// ----------------------------------------------------
export function analyzeTenderEngine(
  title: string,
  category: string,
  budget: number,
  durationMonths: number,
  location: string,
  scope: string
): {
  summary: string;
  milestones: TenderMilestone[];
  workforceRequirements: TenderWorkforceItem[];
  eligibility: string[];
  docs: string[];
} {
  const cleanMonths = Math.max(1, durationMonths || 6);

  let workforceRequirements: TenderWorkforceItem[] = [];

  if (category === 'IT & Technology') {
    workforceRequirements = [
      { id: 'wf-1', skill: 'Software Developers', headcount: Math.max(4, Math.round(budget / 3000000)), dailyWageRate: 1800, category: 'skilled', notes: 'React, Node, Cloud & API Integration' },
      { id: 'wf-2', skill: 'UI/UX Designers', headcount: Math.max(2, Math.round(budget / 10000000)), dailyWageRate: 1600, category: 'skilled', notes: 'Vernacular interface & accessibility' },
      { id: 'wf-3', skill: 'QA & Test Engineers', headcount: Math.max(2, Math.round(budget / 6000000)), dailyWageRate: 1400, category: 'skilled', notes: 'Security testing & performance load' },
      { id: 'wf-4', skill: 'Project Manager / Scrum Master', headcount: Math.max(1, Math.round(budget / 15000000)), dailyWageRate: 2200, category: 'skilled', notes: 'PMP or Agile certified' },
      { id: 'wf-5', skill: 'Data Entry & Support Operators', headcount: Math.max(4, Math.round(budget / 1200000)), dailyWageRate: 750, category: 'semi-skilled', notes: 'Regional language data typing' },
    ];
  } else {
    // Infrastructure, Commercial, Residential, Renovation
    workforceRequirements = [
      { id: 'wf-1', skill: 'Civil Engineers', headcount: Math.max(2, Math.round(budget / 20000000)), dailyWageRate: 1400, category: 'skilled', notes: 'B.E./B.Tech Civil with quality control experience' },
      { id: 'wf-2', skill: 'Site Supervisors', headcount: Math.max(2, Math.round(budget / 12000000)), dailyWageRate: 1100, category: 'skilled', notes: 'Safety oversight & daily muster logging' },
      { id: 'wf-3', skill: 'Masons', headcount: Math.max(6, Math.round(budget / 3000000)), dailyWageRate: 900, category: 'skilled', notes: 'Brickwork, plastering, stone pitching' },
      { id: 'wf-4', skill: 'Bar Bender & Steel Fixers', headcount: Math.max(4, Math.round(budget / 4500000)), dailyWageRate: 880, category: 'skilled', notes: 'TMT cutting, bending, column tying' },
      { id: 'wf-5', skill: 'Machine Operators', headcount: Math.max(2, Math.round(budget / 8000000)), dailyWageRate: 950, category: 'skilled', notes: 'Excavator, road roller & batching plant certified' },
      { id: 'wf-6', skill: 'Construction Labourers', headcount: Math.max(10, Math.round(budget / 1500000)), dailyWageRate: 650, category: 'unskilled', notes: 'Earthwork, material hauling, staging' },
    ];
  }

  const totalHeadcount = workforceRequirements.reduce((sum, r) => sum + r.headcount, 0);

  const summary = `Tender analysis for "${title}" in ${location}. A ${cleanMonths}-month ${category.toLowerCase()} contract with an estimated budget of ₹${(budget / 100000).toFixed(2)} Lakhs. Synthesized requirements allocate ${workforceRequirements.length} critical trade streams, requiring a peak workforce of ${totalHeadcount} workers under BOCW and CPWD standards.`;

  const milestones: TenderMilestone[] = [
    { phase: 'Phase 1: Mobilization, Site Survey & Sub-structure Earthwork', durationWeeks: Math.max(2, Math.round(cleanMonths * 1.5)), tradesInvolved: ['Civil Engineers', 'Machine Operators', 'Construction Labourers'] },
    { phase: 'Phase 2: Core Superstructure RCC & Masonry Construction', durationWeeks: Math.max(4, Math.round(cleanMonths * 2)), tradesInvolved: ['Masons', 'Bar Bender & Steel Fixers', 'Site Supervisors'] },
    { phase: 'Phase 3: Utility Installations & Technical Infrastructure', durationWeeks: Math.max(3, Math.round(cleanMonths * 1.2)), tradesInvolved: ['Site Supervisors', 'Construction Labourers'] },
    { phase: 'Phase 4: Finishing, Quality Snagging & Project Handover', durationWeeks: Math.max(2, Math.round(cleanMonths * 1)), tradesInvolved: ['Civil Engineers', 'Masons'] },
  ];

  const eligibility = [
    'Valid Class-I / Class-II contractor registration or corporate IT credential',
    'Demonstrated past completion of similar value contracts in past 5 years',
    'Average annual turnover meeting department tender criteria',
    'Compliance with e-Shram worker linkage and PMSBY mandatory insurance',
  ];

  const docs = [
    'GST Registration & Clearance Certificate',
    'Audited balance sheets for past 3 financial years',
    'Technical staff credentials & machinery ownership/lease affidavits',
    'Bid Security / EMD Guarantee document',
  ];

  return { summary, milestones, workforceRequirements, eligibility, docs };
}

// ----------------------------------------------------
// Suitable Contractor Matching Engine
// Evaluates contractors based on trade overlap, capacity,
// verified licenses, and ShramaSetu trust score
// ----------------------------------------------------
export function generateSuitableContractors(
  tender: Tender,
  requirements: TenderWorkforceItem[]
): ContractorMatch[] {
  const reqTrades = requirements.map((r) => r.skill.toLowerCase());
  const totalHeadcount = requirements.reduce((sum, r) => sum + r.headcount, 0);

  const contractorPool: Omit<ContractorMatch, 'matchScore' | 'rfpSent'>[] = [
    {
      id: 'c-shree-balaji',
      name: 'R. K. Balaji',
      companyName: 'Shree Balaji Infra Projects Pvt Ltd',
      avatar: 'SB',
      rating: 4.9,
      trustScore: 97,
      workforceCapacity: Math.max(totalHeadcount + 18, 65),
      specialties: ['Masons', 'Bar Bender & Steel Fixers', 'Machine Operators', 'Civil Engineers'],
      location: tender.location || 'Mysuru, Karnataka',
      pastProjectsCount: 42,
      licenseVerified: true,
    },
    {
      id: 'c-kumar-constructions',
      name: 'Rajesh Kumar',
      companyName: 'Kumar Constructions & Civil Tech',
      avatar: 'KC',
      rating: 4.8,
      trustScore: 94,
      workforceCapacity: Math.max(totalHeadcount + 8, 48),
      specialties: ['Civil Engineers', 'Site Supervisors', 'Construction Labourers', 'Masons'],
      location: tender.location || 'Mysuru, Karnataka',
      pastProjectsCount: 29,
      licenseVerified: true,
    },
    {
      id: 'c-apex-industrial',
      name: 'Vikramaditya Rao',
      companyName: 'Apex Industrial & Engineering Solutions',
      avatar: 'AI',
      rating: 4.7,
      trustScore: 92,
      workforceCapacity: Math.max(totalHeadcount + 25, 80),
      specialties: ['Machine Operators', 'Civil Engineers', 'Software Developers', 'QA & Test Engineers'],
      location: 'Bengaluru / Mysuru, Karnataka',
      pastProjectsCount: 38,
      licenseVerified: true,
    },
    {
      id: 'c-chamundi-infra',
      name: 'G. Suresh Babu',
      companyName: 'Chamundi Infrastructure Works',
      avatar: 'CI',
      rating: 4.6,
      trustScore: 89,
      workforceCapacity: Math.max(totalHeadcount, 35),
      specialties: ['Construction Labourers', 'Masons', 'Site Supervisors'],
      location: tender.location || 'Mysuru, Karnataka',
      pastProjectsCount: 19,
      licenseVerified: true,
    },
  ];

  return contractorPool.map((c, idx) => {
    const capacityScore = c.workforceCapacity >= totalHeadcount ? 35 : 20;
    const trustWeight = (c.trustScore / 100) * 40;
    const specialtyOverlap = c.specialties.filter((s) =>
      reqTrades.some((rt) => rt.includes(s.toLowerCase()) || s.toLowerCase().includes(rt))
    ).length;
    const tradeScore = Math.min(25, specialtyOverlap * 10);
    const matchScore = Math.min(99, Math.round(capacityScore + trustWeight + tradeScore - idx * 2));

    return {
      ...c,
      company: c.companyName,
      fleetCapacity: `${c.workforceCapacity} verified workers`,
      trades: c.specialties,
      completedTenders: c.pastProjectsCount,
      verified: c.licenseVerified,
      licenses: ['CPWD Class 1', 'BOCW Active', 'EPFO Verified'],
      contactNumber: '+91 98450 ' + (32000 + idx * 1150),
      matchScore,
      rfpSent: false,
    };
  });
}

// Initial Default Tenders
export const defaultTenders: Tender[] = [
  {
    id: 'T-BELAGAVI-1042',
    tenderId: 'Tender #KA-2026-1042',
    title: 'Belagavi Highway Construction',
    client: 'Karnataka State Highway Improvement Project (KSHIP) / PWD',
    dept: 'Karnataka PWD',
    location: 'Belagavi, Karnataka',
    value: 82000000,
    closing: '10 Oct 2026',
    category: 'Infrastructure',
    match: 96,
    duration: '6 months',
    durationMonths: 6,
    startDate: '10 Oct 2026',
    endDate: '10 Apr 2027',
    documentName: 'Belagavi_Highway_Package_4_WorkOrder.pdf',
    documentSize: '2.4 MB',
    aiExtracted: true,
    skills: ['Masons', 'Construction Helpers', 'Electricians', 'Equipment Operators', 'Supervisors'],
    eligibility: [
      'Awarded contract under KSHIP Package-4 highway construction works',
      'Mandatory mobilization of 100 personnel under BOCW compliance',
      'Site safety supervisor with certified First-Aid accreditation',
    ],
    docs: [
      'Signed Work Order Agreement',
      'BOCW Cess Challan Copy',
      'EPF & ESIC Registration Code',
      'Labour Insurance Declaration',
    ],
    workforceRequirements: [
      { id: 'wf-1', skill: 'Masons', headcount: 30, assignedCount: 27, dailyWageRate: 900, category: 'skilled', notes: 'Stone pitching, culvert masonry, kerb laying' },
      { id: 'wf-2', skill: 'Construction Helpers', headcount: 40, assignedCount: 40, dailyWageRate: 650, category: 'unskilled', notes: 'Subgrade preparation, aggregate handling, flagging' },
      { id: 'wf-3', skill: 'Electricians', headcount: 10, assignedCount: 10, dailyWageRate: 1050, category: 'skilled', notes: 'High-mast lighting, traffic signaling conduits' },
      { id: 'wf-4', skill: 'Equipment Operators', headcount: 15, assignedCount: 11, dailyWageRate: 1100, category: 'skilled', notes: 'Excavator, road roller, asphalt paver certified' },
      { id: 'wf-5', skill: 'Supervisors', headcount: 5, assignedCount: 5, dailyWageRate: 1400, category: 'skilled', notes: 'Safety oversight, muster roll, daily measurement' },
    ],
    otherRequirements: {
      workingHours: '8:00 AM – 5:00 PM (1 hr lunch, overtime as per BOCW Act)',
      accommodation: 'Site labor camp provided at KM 18 with sanitized drinking water and solar lighting',
      transportation: 'Daily shuttle arranged from Belagavi central bus depot to work zones',
      safety: 'Mandatory PPE: ISI-marked hard hats, high-visibility reflective vests, steel-toe safety shoes',
      certifications: ['Heavy Earthmoving Machinery License for Operators', 'Safety induction card'],
      compliance: [
        'BOCW Act 1996 active registration',
        'EPFO & ESIC monthly electronic return filings',
        'Daily biometric muster verification on site',
      ],
    },
    assignedWorkers: generateInitialBelagaviWorkers(),
    fulfillmentPercent: 88,
    dynamicFee: calculateDynamicTenderFee(82000000),
    status: 'active_fulfillment',
    createdAt: '2026-09-22',
  },
  {
    id: 'T-1002',
    title: 'Smart City Citizen Services Platform',
    dept: 'Urban Development Department',
    location: 'Bengaluru, Karnataka',
    value: 36000000,
    closing: '14 Oct 2026',
    category: 'IT & Technology',
    match: 84,
    duration: '12 months',
    durationMonths: 12,
    skills: ['Software Developers', 'UI/UX Designers', 'QA Engineers', 'Project Manager'],
    eligibility: [
      'Demonstrated experience delivering municipal or state e-governance solutions',
      'In-house technical team profile with full-time staff accreditation',
      'ISO 9001 and ISO 27001 certifications preferred',
    ],
    docs: [
      'GST & ROC certificate',
      'Company technical capability portfolio',
      'Past municipal project credentials',
      'Comprehensive technical & architectural proposal',
    ],
    workforceRequirements: [
      { id: 'wf-1', skill: 'Software Developers', headcount: 12, dailyWageRate: 1800, category: 'skilled', notes: 'React, Node, Cloud architecture' },
      { id: 'wf-2', skill: 'UI/UX Designers', headcount: 3, dailyWageRate: 1600, category: 'skilled', notes: 'Accessibility, vernacular interface design' },
      { id: 'wf-3', skill: 'QA Engineers', headcount: 5, dailyWageRate: 1400, category: 'skilled', notes: 'Automated testing, load testing' },
      { id: 'wf-4', skill: 'Project Manager', headcount: 2, dailyWageRate: 2200, category: 'skilled', notes: 'PMP or Agile certified' },
    ],
    dynamicFee: calculateDynamicTenderFee(36000000),
    status: 'analyzed',
    createdAt: '2026-09-22',
  },
  {
    id: 'T-1003',
    title: 'Irrigation Canal Rehabilitation Works',
    dept: 'Water Resources Department',
    location: 'Mandya, Karnataka',
    value: 124000000,
    closing: '21 Oct 2026',
    category: 'Infrastructure',
    match: 78,
    duration: '24 months',
    durationMonths: 24,
    skills: ['Civil Engineers', 'Surveyors', 'Masons', 'Operators', 'Labourers'],
    eligibility: [
      'Proven civil waterworks experience with lining & aqueduct structures',
      'Registration with Department of Water Resources / Minor Irrigation',
      'Owned or leased earthmoving equipment availability',
    ],
    docs: [
      'GST certificate',
      'Water resource experience certificates',
      'Heavy machinery inventory list',
      'Bank solvency certificate & Bid security',
    ],
    workforceRequirements: [
      { id: 'wf-1', skill: 'Civil Engineers', headcount: 6, dailyWageRate: 1400, category: 'skilled', notes: 'Hydraulic structures & concrete quality' },
      { id: 'wf-2', skill: 'Surveyors', headcount: 4, dailyWageRate: 1100, category: 'skilled', notes: 'Total station & GPS levelling' },
      { id: 'wf-3', skill: 'Masons', headcount: 25, dailyWageRate: 900, category: 'skilled', notes: 'Stone pitch canal lining' },
      { id: 'wf-4', skill: 'Operators', headcount: 12, dailyWageRate: 950, category: 'skilled', notes: 'JCB, backhoe, concrete mixer' },
      { id: 'wf-5', skill: 'Labourers', headcount: 60, dailyWageRate: 650, category: 'unskilled', notes: 'Canal de-silting, stone hauling' },
    ],
    dynamicFee: calculateDynamicTenderFee(124000000),
    status: 'analyzed',
    createdAt: '2026-09-24',
  },
  {
    id: 'T-1004',
    title: 'Government Data Digitisation & Support',
    dept: 'Department of e-Governance',
    location: 'Hubballi, Karnataka',
    value: 9500000,
    closing: '29 Oct 2026',
    category: 'IT & Technology',
    match: 73,
    duration: '9 months',
    durationMonths: 9,
    skills: ['Data Operators', 'Software Support', 'Team Lead'],
    eligibility: [
      'Registered IT services capability with verified high-speed scanning infrastructure',
      'Manpower availability for on-premise government office scanning',
    ],
    docs: [
      'GST certificate',
      'Company registration',
      'Past digitisation record proof',
    ],
    workforceRequirements: [
      { id: 'wf-1', skill: 'Data Operators', headcount: 20, dailyWageRate: 750, category: 'semi-skilled', notes: 'English/Kannada typing 40wpm' },
      { id: 'wf-2', skill: 'Software Support', headcount: 5, dailyWageRate: 1200, category: 'skilled', notes: 'Data validation & OCR verification' },
      { id: 'wf-3', skill: 'Team Lead', headcount: 3, dailyWageRate: 1600, category: 'skilled', notes: 'Project coordination & QC check' },
    ],
    dynamicFee: calculateDynamicTenderFee(9500000),
    status: 'analyzed',
    createdAt: '2026-09-25',
  },
];

export const defaultEmployerState: EmployerBackendState = {
  tenders: defaultTenders,
  savedTenderIds: ['T-1001'],
  workforcePlans: {},
  partnerRequests: {},
};

export function getInitialEmployerState(): EmployerBackendState {
  if (typeof window === 'undefined') return defaultEmployerState;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultEmployerState;
    const parsed = JSON.parse(raw) as Partial<EmployerBackendState>;

    const mergedTenders = defaultTenders.map((dt) => {
      const existing = parsed.tenders?.find((t) => t.id === dt.id);
      if (existing) {
        return {
          ...existing,
          dynamicFee: calculateDynamicTenderFee(existing.value),
        };
      }
      return dt;
    });

    const customTenders = (parsed.tenders || []).filter(
      (t) => !defaultTenders.some((dt) => dt.id === t.id)
    ).map((ct) => ({
      ...ct,
      dynamicFee: calculateDynamicTenderFee(ct.value),
    }));

    return {
      tenders: [...mergedTenders, ...customTenders],
      savedTenderIds: parsed.savedTenderIds ?? defaultEmployerState.savedTenderIds,
      workforcePlans: parsed.workforcePlans ?? defaultEmployerState.workforcePlans,
      partnerRequests: parsed.partnerRequests ?? defaultEmployerState.partnerRequests,
    };
  } catch {
    return defaultEmployerState;
  }
}

export function saveEmployerState(state: EmployerBackendState): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL);
      channel.postMessage({ type: 'EMPLOYER_STATE_UPDATE', state });
      channel.close();
    }
  } catch {}
}

export const loadEmployerState = getInitialEmployerState;

