import { ContractorWorker, WorkerMatchScore } from '../types';

export const INITIAL_WORKERS: ContractorWorker[] = [
  {
    id: 'w1',
    category: 'skilledWorker',
    name: 'Ravi Kumar',
    primarySkill: 'Mason',
    experience: '5 years',
    location: 'Belagavi Central (4 km)',
    availability: 'available',
    workCount: 28,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'w2',
    category: 'labourer',
    name: 'Suresh Patel',
    primarySkill: 'Labourer',
    experience: '3 years',
    location: 'Belagavi North (7 km)',
    availability: 'available',
    workCount: 42,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'w3',
    category: 'skilledWorker',
    name: 'Mahesh Yadav',
    primarySkill: 'Mason',
    experience: '4 years',
    location: 'Belagavi Industrial Area (9 km)',
    availability: 'available',
    workCount: 19,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'w4',
    category: 'skilledWorker',
    name: 'Priya Sharma',
    primarySkill: 'Electrician',
    experience: '4 years',
    location: 'Belagavi South (6 km)',
    availability: 'available',
    workCount: 31,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'w5',
    category: 'skilledWorker',
    name: 'Somanna Patil',
    primarySkill: 'Equipment Operator',
    experience: '6 years',
    location: 'Belagavi Highway Bypass (12 km)',
    availability: 'available',
    workCount: 35,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'w6',
    category: 'labourer',
    name: 'Asha Rao',
    primarySkill: 'Construction Helper',
    experience: '2 years',
    location: 'Belagavi East (8 km)',
    availability: 'available',
    workCount: 15,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'w7',
    category: 'skilledWorker',
    name: 'Ramesh Naik',
    primarySkill: 'Carpenter',
    experience: '5 years',
    location: 'Belagavi West (5 km)',
    availability: 'available',
    workCount: 22,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 'w8',
    category: 'skilledWorker',
    name: 'Anand Hegde',
    primarySkill: 'Plumber',
    experience: '4 years',
    location: 'Belagavi City (3 km)',
    availability: 'available',
    workCount: 26,
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  },
];

// Skill synonym aliases for normalisation
const SKILL_ALIASES: Record<string, string[]> = {
  mason: ['mason', 'masons', 'bricklayer', 'rajmistri', 'masonry', 'tile layer'],
  labourer: ['labourer', 'laborer', 'helper', 'construction helper', 'general worker', 'mazdoor', 'unskilled'],
  operator: ['operator', 'equipment operator', 'crane operator', 'jcb operator', 'heavy machinery', 'driver'],
  electrician: ['electrician', 'wireman', 'electrical', 'lineman'],
  carpenter: ['carpenter', 'bar bender', 'formwork', 'woodworker'],
  plumber: ['plumber', 'pipe fitter', 'sanitary'],
  supervisor: ['supervisor', 'site supervisor', 'foreman', 'mukadam'],
  welder: ['welder', 'fabricator', 'gas cutter'],
};

function normalizeSkill(raw: string): string {
  const clean = raw.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (canonical === clean || aliases.some((a) => clean.includes(a) || a.includes(clean))) {
      return canonical;
    }
  }
  return clean;
}

function parseExperienceYears(exp: string): number {
  const match = exp.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

const STORAGE_KEY = 'shramasetu_workers_v1';

export function getWorkers(): ContractorWorker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_WORKERS;
}

export function saveWorkers(workers: ContractorWorker[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workers));
  } catch (e) {
    // ignore
  }
}

export function getWorkerById(id: string): ContractorWorker | undefined {
  return getWorkers().find((w) => w.id === id);
}

/**
 * Deterministic 100-Point Worker Matching Algorithm
 * - Skill Match: 50 pts (exact alias match)
 * - Location Match: 20 pts (Belagavi / <25km)
 * - Availability: 15 pts (available = 15, busy = 0)
 * - Experience: 10 pts (4+ yrs = 10, 2-3 yrs = 7, 1 yr = 4)
 * - Wage compatibility: 5 pts (fits target range)
 */
export function matchWorker(
  worker: ContractorWorker,
  targetSkill: string,
  targetWage: number = 800,
  targetLocation: string = 'Belagavi'
): WorkerMatchScore {
  let score = 0;
  const matchReasons: string[] = [];
  const matchedSkills: string[] = [];

  const normTarget = normalizeSkill(targetSkill);
  const normWorkerSkill = normalizeSkill(worker.primarySkill);

  // 1. Skill Match (max 50)
  if (normWorkerSkill === normTarget) {
    score += 50;
    matchedSkills.push(worker.primarySkill);
    matchReasons.push(`Exact skill match for ${targetSkill} (+50 pts)`);
  } else if (
    (normTarget === 'labourer' && normWorkerSkill === 'labourer') ||
    (normTarget.includes('helper') && normWorkerSkill.includes('labourer'))
  ) {
    score += 45;
    matchedSkills.push(worker.primarySkill);
    matchReasons.push(`Strong category match for ${targetSkill} (+45 pts)`);
  } else {
    score += 15;
    matchReasons.push(`Transferable construction skillset (+15 pts)`);
  }

  // 2. Location Match (max 20)
  const isNear =
    worker.location.toLowerCase().includes('belagavi') ||
    targetLocation.toLowerCase().includes('belagavi') ||
    worker.location.toLowerCase().includes(targetLocation.toLowerCase());

  if (isNear) {
    score += 20;
    matchReasons.push(`Local resident in Belagavi project cluster (+20 pts)`);
  } else {
    score += 10;
    matchReasons.push(`Regional travel distance (+10 pts)`);
  }

  // 3. Availability (max 15)
  const isAvailable = worker.availability === 'available';
  if (isAvailable) {
    score += 15;
    matchReasons.push(`Immediately available for deployment (+15 pts)`);
  } else {
    matchReasons.push(`Currently committed to another site (+0 pts)`);
  }

  // 4. Experience (max 10)
  const expYears = parseExperienceYears(worker.experience);
  if (expYears >= 4) {
    score += 10;
    matchReasons.push(`${expYears}+ years verified field experience (+10 pts)`);
  } else if (expYears >= 2) {
    score += 7;
    matchReasons.push(`${expYears} years field experience (+7 pts)`);
  } else {
    score += 4;
    matchReasons.push(`Entry level field experience (+4 pts)`);
  }

  // 5. Wage Compatibility (max 5)
  // Standard assumed daily wage by category
  const estimatedWage = worker.category === 'labourer' ? 600 : 850;
  if (estimatedWage <= targetWage) {
    score += 5;
    matchReasons.push(`Daily wage rate within project budget (+5 pts)`);
  } else {
    score += 2;
    matchReasons.push(`Daily wage slightly above threshold (+2 pts)`);
  }

  // Ensure score capped between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  return {
    worker,
    score: finalScore,
    matchedSkills,
    matchReasons,
    isAvailable,
    locationDistanceKm: 5,
  };
}

/**
 * Match and rank all workers for a specific requirement
 */
export function matchWorkersForRequirement(
  skillRequired: string,
  targetWage: number = 800,
  targetLocation: string = 'Belagavi'
): WorkerMatchScore[] {
  const workers = getWorkers();
  return workers
    .map((w) => matchWorker(w, skillRequired, targetWage, targetLocation))
    .sort((a, b) => b.score - a.score);
}
