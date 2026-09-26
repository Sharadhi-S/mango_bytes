import { ContractorRFP } from '../types';
import { broadcastRealtimeEvent } from './realtime';
import { createNotification } from './notifications';

const STORAGE_KEY = 'shramasetu_rfps_v1';

const INITIAL_RFPS: ContractorRFP[] = [
  {
    id: 'rfp-1042',
    projectId: 'T-BELAGAVI-1042',
    projectTitle: 'Belagavi Highway & Flyover Expansion',
    employerId: 'emp-demo',
    employerName: 'Demo Infrastructure Pvt Ltd',
    contractorId: 'c1',
    contractorName: 'Kumar Construction Services',
    status: 'sent',
    budget: 82000000,
    location: 'Belagavi Central to Bypass (KA-2026-1042)',
    duration: '6 Months',
    headcountNeeded: 100,
    message: 'We invite Kumar Construction Services to fulfill the workforce requirements (30 Masons, 40 Helpers, 10 Electricians, 15 Equipment Operators, 5 Supervisors) for Tender #KA-2026-1042.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export function getRfps(): ContractorRFP[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: ContractorRFP[] = JSON.parse(raw);
      return parsed.map((r) => ({
        ...r,
        projectId: r.projectId === 'tender-1' ? 'T-BELAGAVI-1042' : r.projectId,
      }));
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_RFPS;
}

export function saveRfps(rfps: ContractorRFP[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rfps));
  } catch (e) {
    // ignore
  }
}

export function getRfpsForContractor(contractorId: string = 'c1'): ContractorRFP[] {
  return getRfps().filter((r) => r.contractorId === contractorId || contractorId === 'all');
}

export function getRfpsForEmployer(employerId: string = 'emp-demo'): ContractorRFP[] {
  return getRfps().filter((r) => r.employerId === employerId || employerId === 'all');
}

export function getRfpsForProject(projectId: string): ContractorRFP[] {
  return getRfps().filter((r) => r.projectId === projectId);
}

export function sendRfp(params: {
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
}): ContractorRFP {
  const rfps = getRfps();
  const existing = rfps.find(
    (r) => r.projectId === params.projectId && r.contractorId === params.contractorId
  );

  if (existing) {
    existing.status = 'sent';
    existing.message = params.message;
    existing.updatedAt = new Date().toISOString();
    saveRfps(rfps);
    broadcastRealtimeEvent('RFP_UPDATED', existing);
    return existing;
  }

  const newRfp: ContractorRFP = {
    id: 'rfp-' + Math.random().toString(36).substring(2, 9),
    ...params,
    status: 'sent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  rfps.unshift(newRfp);
  saveRfps(rfps);

  // Broadcast realtime event to contractor tab
  broadcastRealtimeEvent('RFP_CREATED', newRfp);

  // Trigger cross-role notification
  createNotification({
    recipientId: params.contractorId,
    recipientRole: 'contractor',
    title: 'New Workforce RFP Received',
    message: `${params.employerName} invited you for "${params.projectTitle}" (Budget: ₹${(params.budget / 100000).toFixed(1)} Lakhs).`,
    type: 'rfp',
    relatedId: newRfp.id,
  });

  return newRfp;
}

export function respondToRfp(
  rfpId: string,
  status: 'accepted' | 'declined',
  responseNotes?: string
): ContractorRFP | null {
  const rfps = getRfps();
  const rfp = rfps.find((r) => r.id === rfpId);
  if (!rfp) return null;

  rfp.status = status;
  rfp.responseNotes = responseNotes || (status === 'accepted' ? 'Contractor accepted the RFP and is ready to deploy workforce.' : 'Contractor declined due to schedule conflict.');
  rfp.updatedAt = new Date().toISOString();

  saveRfps(rfps);

  // Broadcast real-time update
  broadcastRealtimeEvent('RFP_UPDATED', rfp);

  // Notify Employer in real time
  createNotification({
    recipientId: rfp.employerId,
    recipientRole: 'employer',
    title: `RFP ${status === 'accepted' ? 'Accepted' : 'Declined'}`,
    message: `${rfp.contractorName} has ${status} your RFP for "${rfp.projectTitle}".`,
    type: 'rfp',
    relatedId: rfp.id,
  });

  return rfp;
}
