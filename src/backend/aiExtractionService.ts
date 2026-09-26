import type { Tender, TenderWorkforceItem, AssignedProjectWorker, ContractorWorker } from '../types';

export interface ExtractedTenderData {
  title: string;
  tenderId: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string;
  duration: string;
  durationMonths: number;
  value: number;
  category: string;
  documentName: string;
  documentSize: string;
  summary: string;
  workforceRequirements: TenderWorkforceItem[];
  skillsRequired: string[];
  workingHours: string;
  accommodation: string;
  transportation: string;
  safety: string;
  compliance: string[];
}

export const SAMPLE_TENDER_DOC = {
  fileName: 'Belagavi_Highway_Package_4_WorkOrder.pdf',
  fileSize: '2.4 MB',
  tenderNumber: 'Tender #KA-2026-1042',
  workOrderRef: 'KSHIP/NH-4/PKG-4/2026-1042',
  projectName: 'Belagavi Highway Construction',
  issuingAuthority: 'Karnataka State Highway Improvement Project (KSHIP) / PWD',
  location: 'Belagavi, Karnataka',
  durationMonths: 6,
  startDate: '10 Oct 2026',
  endDate: '10 Apr 2027',
  contractValue: 82000000,
  summary:
    'Awarded Contract for Four-Laning & Pavement Strengthening of Belagavi South Bypass (KM 14.200 to KM 28.600). The contractor is directed to mobilize a ready-to-deploy workforce of 100 personnel conforming to BOCW and CPWD safety standards.',
  requirements: [
    { id: 'wf-1', skill: 'Masons', headcount: 30, assignedCount: 27, dailyWageRate: 900, category: 'skilled' as const, notes: 'Stone pitching, culvert masonry, kerb laying' },
    { id: 'wf-2', skill: 'Construction Helpers', headcount: 40, assignedCount: 40, dailyWageRate: 650, category: 'unskilled' as const, notes: 'Subgrade preparation, aggregate handling, flagging' },
    { id: 'wf-3', skill: 'Electricians', headcount: 10, assignedCount: 10, dailyWageRate: 1050, category: 'skilled' as const, notes: 'High-mast lighting, traffic signaling conduits' },
    { id: 'wf-4', skill: 'Equipment Operators', headcount: 15, assignedCount: 11, dailyWageRate: 1100, category: 'skilled' as const, notes: 'Excavator, road roller, asphalt paver certified' },
    { id: 'wf-5', skill: 'Supervisors', headcount: 5, assignedCount: 5, dailyWageRate: 1400, category: 'skilled' as const, notes: 'Safety oversight, muster roll, daily measurement' },
  ],
  skills: [
    'Masonry & stone pitching',
    'Earthwork & asphalt laying',
    'Heavy equipment operation certification',
    'Electrical conduit laying',
    'Site safety supervision & first aid',
  ],
  workingHours: '8:00 AM – 5:00 PM (1 hr lunch, overtime as per BOCW Act)',
  accommodation: 'Site labor camp provided at KM 18 with sanitized drinking water and solar lighting',
  transportation: 'Daily shuttle arranged from Belagavi central bus depot to work zones',
  safety: 'Mandatory PPE: ISI-marked hard hats, high-visibility reflective vests, steel-toe safety shoes',
  compliance: [
    'Building and Other Construction Workers (BOCW) Act 1996 active registration',
    'Employee Provident Fund (EPFO) & ESIC monthly electronic return filings',
    'Daily biometric / muster roll verification on site',
  ],
};

export function simulateAITenderExtraction(fileName?: string, userScope?: string): ExtractedTenderData {
  const isSample = !fileName || fileName.toLowerCase().includes('belagavi') || fileName.toLowerCase().includes('highway');

  if (isSample) {
    return {
      title: SAMPLE_TENDER_DOC.projectName,
      tenderId: SAMPLE_TENDER_DOC.tenderNumber,
      client: SAMPLE_TENDER_DOC.issuingAuthority,
      location: SAMPLE_TENDER_DOC.location,
      startDate: SAMPLE_TENDER_DOC.startDate,
      endDate: SAMPLE_TENDER_DOC.endDate,
      duration: '6 months',
      durationMonths: 6,
      value: SAMPLE_TENDER_DOC.contractValue,
      category: 'Infrastructure',
      documentName: fileName || SAMPLE_TENDER_DOC.fileName,
      documentSize: '2.4 MB',
      summary: SAMPLE_TENDER_DOC.summary,
      workforceRequirements: SAMPLE_TENDER_DOC.requirements.map((r) => ({ ...r })),
      skillsRequired: SAMPLE_TENDER_DOC.skills,
      workingHours: SAMPLE_TENDER_DOC.workingHours,
      accommodation: SAMPLE_TENDER_DOC.accommodation,
      transportation: SAMPLE_TENDER_DOC.transportation,
      safety: SAMPLE_TENDER_DOC.safety,
      compliance: SAMPLE_TENDER_DOC.compliance,
    };
  }

  // Generic document extraction
  const cleanName = fileName ? fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : 'Commercial Construction Project';
  const capitalizedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

  return {
    title: capitalizedTitle,
    tenderId: `Tender #KA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    client: 'Karnataka Infrastructure Development Corporation (KIDCO)',
    location: 'Bengaluru, Karnataka',
    startDate: '15 Nov 2026',
    endDate: '15 May 2027',
    duration: '6 months',
    durationMonths: 6,
    value: 45000000,
    category: 'Commercial',
    documentName: fileName || 'Uploaded_Tender_WorkOrder.pdf',
    documentSize: '1.8 MB',
    summary: userScope || `Automated workforce extraction for "${capitalizedTitle}". Analyzed scope indicates demand for 50 primary personnel across masonry, structural fabrication, finishing, and safety oversight.`,
    workforceRequirements: [
      { id: 'wf-1', skill: 'Masons', headcount: 15, assignedCount: 10, dailyWageRate: 900, category: 'skilled', notes: 'Brickwork, plastering, stone masonry' },
      { id: 'wf-2', skill: 'Construction Helpers', headcount: 20, assignedCount: 18, dailyWageRate: 650, category: 'unskilled', notes: 'Material movement and general site support' },
      { id: 'wf-3', skill: 'Equipment Operators', headcount: 6, assignedCount: 3, dailyWageRate: 1100, category: 'skilled', notes: 'JCB, batching plant, earthmoving' },
      { id: 'wf-4', skill: 'Electricians', headcount: 5, assignedCount: 4, dailyWageRate: 1050, category: 'skilled', notes: 'Temporary DB boxes, lighting & wiring' },
      { id: 'wf-5', skill: 'Supervisors', headcount: 4, assignedCount: 3, dailyWageRate: 1400, category: 'skilled', notes: 'Safety oversight & quality checks' },
    ],
    skillsRequired: ['Masonry experience', 'Equipment operating certificate', 'Electrical certification', 'Site safety'],
    workingHours: '8:30 AM – 5:30 PM (6 days a week)',
    accommodation: 'On-site housing units provided',
    transportation: 'Provided within 15 km perimeter',
    safety: 'Safety helmets, boots, and harnesses provided',
    compliance: ['BOCW Act compliant', 'EPFO verified'],
  };
}

export function smartMatchWorkers(
  trade: string,
  projectLocation: string,
  workersPool: ContractorWorker[],
  projectStartDate: string = '10 Oct 2026'
): Array<{
  worker: ContractorWorker;
  matchScore: number;
  matchReasons: string[];
}> {
  const normTrade = trade.toLowerCase();

  return workersPool.map((worker) => {
    let score = 50;
    const reasons: string[] = [];

    const normSkill = worker.primarySkill.toLowerCase();
    const isTradeMatch =
      normSkill.includes(normTrade) ||
      normTrade.includes(normSkill) ||
      (normTrade.includes('mason') && normSkill.includes('mason')) ||
      (normTrade.includes('operator') && normSkill.includes('operator')) ||
      (normTrade.includes('helper') && (normSkill.includes('helper') || normSkill.includes('labour'))) ||
      (normTrade.includes('electric') && normSkill.includes('electric')) ||
      (normTrade.includes('supervis') && (normSkill.includes('supervis') || normSkill.includes('lead')));

    if (isTradeMatch) {
      score += 35;
      reasons.push(`✓ Required skill match: ${worker.primarySkill}`);
    } else {
      score += 10;
      reasons.push(`✓ Multi-skilled construction background`);
    }

    if (worker.availability === 'Available') {
      score += 15;
      reasons.push(`✓ Ready to deploy for project start (${projectStartDate})`);
    } else {
      reasons.push(`⚠ Notice period required (currently on assignment)`);
    }

    const expYears = parseInt(worker.experience, 10) || 2;
    if (expYears >= 4) {
      score += 15;
      reasons.push(`✓ ${worker.experience} seasoned highway & civil experience`);
    } else {
      score += 8;
      reasons.push(`✓ ${worker.experience} verified on-site experience`);
    }

    const workerLoc = worker.location.toLowerCase();
    const projLoc = projectLocation.toLowerCase();
    if (projLoc.includes(workerLoc) || workerLoc.includes('belagavi') || projLoc.includes('karnataka')) {
      score += 15;
      reasons.push(`✓ Located within preferred regional proximity (${worker.location})`);
    } else {
      score += 8;
      reasons.push(`✓ Mobility ready across Karnataka sites`);
    }

    if (worker.verified) {
      score += 5;
      reasons.push(`✓ ShramaID background & KYC verified`);
    }

    const finalScore = Math.min(99, Math.max(65, score));

    return {
      worker,
      matchScore: finalScore,
      matchReasons: reasons,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export function generateInitialBelagaviWorkers(): AssignedProjectWorker[] {
  return [
    {
      id: 'apw-1',
      workerId: 'w12',
      name: 'Ramesh Kumar',
      role: 'Equipment Operator',
      category: 'skilledWorker',
      dailyWage: 1100,
      phone: '+91 98450 44102',
      location: 'Belagavi',
      experience: '4 years',
      matchScore: 96,
      matchReasons: ['✓ JCB / Excavator Certified', '✓ Available from start', '✓ 4 yrs highway works', '✓ Local Belagavi resident'],
      assignedDate: '2026-09-22',
      daysWorked: 4,
      attendanceToday: 'present',
      wageStatus: 'pending',
      avatar: 'RK',
    },
    {
      id: 'apw-2',
      workerId: 'w13',
      name: 'Somanna Patil',
      role: 'Equipment Operator',
      category: 'skilledWorker',
      dailyWage: 1100,
      phone: '+91 98450 44105',
      location: 'Belagavi',
      experience: '6 years',
      matchScore: 98,
      matchReasons: ['✓ Heavy Road Roller Certified', '✓ 6 yrs PWD experience', '✓ Belagavi resident'],
      assignedDate: '2026-09-22',
      daysWorked: 4,
      attendanceToday: 'present',
      wageStatus: 'paid',
      avatar: 'SP',
    },
    {
      id: 'apw-3',
      workerId: 'w16',
      name: 'Basavaraj B',
      role: 'Masons',
      category: 'labourer',
      dailyWage: 900,
      phone: '+91 98450 44211',
      location: 'Belagavi',
      experience: '5 years',
      matchScore: 95,
      matchReasons: ['✓ Stone pitching & culvert masonry', '✓ 5 yrs experience', '✓ Belagavi resident'],
      assignedDate: '2026-09-22',
      daysWorked: 5,
      attendanceToday: 'present',
      wageStatus: 'paid',
      avatar: 'BB',
    },
    {
      id: 'apw-4',
      workerId: 'w17',
      name: 'Shivappa Gowda',
      role: 'Masons',
      category: 'labourer',
      dailyWage: 900,
      phone: '+91 98450 44215',
      location: 'Belagavi',
      experience: '4 years',
      matchScore: 94,
      matchReasons: ['✓ Kerb stone laying & plastering', '✓ Belagavi resident'],
      assignedDate: '2026-09-22',
      daysWorked: 5,
      attendanceToday: 'present',
      wageStatus: 'pending',
      avatar: 'SG',
    },
    {
      id: 'apw-5',
      workerId: 'w19',
      name: 'Yallappa M',
      role: 'Construction Helpers',
      category: 'labourer',
      dailyWage: 650,
      phone: '+91 98450 44319',
      location: 'Belagavi',
      experience: '2 years',
      matchScore: 92,
      matchReasons: ['✓ Aggregate handling & earthwork', '✓ Ready to deploy', '✓ Belagavi resident'],
      assignedDate: '2026-09-22',
      daysWorked: 5,
      attendanceToday: 'present',
      wageStatus: 'paid',
      avatar: 'YM',
    },
    {
      id: 'apw-6',
      workerId: 'w22',
      name: 'Anand Kulkarni',
      role: 'Electricians',
      category: 'skilledWorker',
      dailyWage: 1050,
      phone: '+91 98450 44401',
      location: 'Belagavi',
      experience: '5 years',
      matchScore: 95,
      matchReasons: ['✓ High mast and street lighting wiring', '✓ ITI certified', '✓ Belagavi resident'],
      assignedDate: '2026-09-22',
      daysWorked: 3,
      attendanceToday: 'present',
      wageStatus: 'pending',
      avatar: 'AK',
    },
    {
      id: 'apw-7',
      workerId: 'w23',
      name: 'Chandru Naik',
      role: 'Supervisors',
      category: 'skilledWorker',
      dailyWage: 1400,
      phone: '+91 98450 44550',
      location: 'Belagavi',
      experience: '8 years',
      matchScore: 97,
      matchReasons: ['✓ PWD highway site supervisor', '✓ First aid certified', '✓ 8 yrs experience'],
      assignedDate: '2026-09-22',
      daysWorked: 5,
      attendanceToday: 'present',
      wageStatus: 'paid',
      avatar: 'CN',
    },
  ];
}
