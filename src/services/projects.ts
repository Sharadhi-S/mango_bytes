import { Tender, TenderStatus, ContractorMatch } from '../types';
import {
  loadEmployerState,
  saveEmployerState,
  calculateDynamicTenderFee,
  analyzeTenderEngine,
} from '../backend/employerBackend';
import { broadcastRealtimeEvent } from './realtime';
import { createNotification } from './notifications';
import { getProjectAssignments } from './assignments';
import { getAttendanceForProject } from './attendance';
import { getWageRecords } from './wages';

export { calculateDynamicTenderFee, analyzeTenderEngine };

export function getProjects(): Tender[] {
  const state = loadEmployerState();
  return state.tenders || [];
}

export function getProjectById(id: string): Tender | undefined {
  const tenders = getProjects();
  return tenders.find((t) => t.id === id || t.tenderId === id);
}

export function updateProject(tender: Tender): void {
  const state = loadEmployerState();
  const index = state.tenders.findIndex((t) => t.id === tender.id);
  if (index >= 0) {
    state.tenders[index] = tender;
  } else {
    state.tenders.unshift(tender);
  }
  saveEmployerState(state);
  broadcastRealtimeEvent('PROJECT_UPDATED', tender);
}

export function updateProjectStatus(
  projectId: string,
  status: TenderStatus,
  contractorId?: string
): Tender | null {
  const state = loadEmployerState();
  const tender = state.tenders.find((t) => t.id === projectId);
  if (!tender) return null;

  tender.status = status;
  if (contractorId && tender.unlockedContractors) {
    tender.unlockedContractors.forEach((c) => {
      if (c.id === contractorId) {
        c.rfpSent = true;
      }
    });
  }

  saveEmployerState(state);
  broadcastRealtimeEvent('PROJECT_UPDATED', tender);
  return tender;
}

export function selectContractorForProject(
  projectId: string,
  contractorId: string,
  contractorName: string
): Tender | null {
  const state = loadEmployerState();
  const tender = state.tenders.find((t) => t.id === projectId);
  if (!tender) return null;

  tender.status = 'active_fulfillment';
  if (tender.unlockedContractors) {
    tender.unlockedContractors.forEach((c) => {
      if (c.id === contractorId) {
        c.rfpSent = true;
      }
    });
  }

  saveEmployerState(state);
  broadcastRealtimeEvent('PROJECT_UPDATED', tender);

  // Notify contractor
  createNotification({
    recipientId: contractorId,
    recipientRole: 'contractor',
    title: 'Contractor Selected for Project',
    message: `You have been selected as the lead workforce contractor for "${tender.title}". You can now match and deploy workers.`,
    type: 'rfp',
    relatedId: tender.id,
  });

  return tender;
}

export function getAggregatedProjectMetrics(projectId: string) {
  const tender = getProjectById(projectId);
  const assignments = getProjectAssignments(projectId);
  const todayAttendance = getAttendanceForProject(projectId);
  const wageRecords = getWageRecords().filter((w) => w.projectId === projectId);

  const totalWorkersNeeded =
    tender?.workforceRequirements.reduce((acc, req) => acc + (req.headcount || 0), 0) || 0;

  const totalWorkersAssigned = assignments.length;
  const fulfillmentPct =
    totalWorkersNeeded > 0 ? Math.min(100, Math.round((totalWorkersAssigned / totalWorkersNeeded) * 100)) : 0;

  const presentTodayCount = todayAttendance.filter((a) => a.status === 'present').length;
  const halfTodayCount = todayAttendance.filter((a) => a.status === 'half').length;

  const totalWagesDisbursed = wageRecords
    .filter((w) => w.status === 'paid')
    .reduce((acc, w) => acc + w.totalAmount, 0);

  const totalWagesPending = wageRecords
    .filter((w) => w.status === 'pending')
    .reduce((acc, w) => acc + w.totalAmount, 0);

  return {
    totalWorkersNeeded,
    totalWorkersAssigned,
    fulfillmentPct,
    presentTodayCount,
    halfTodayCount,
    totalWagesDisbursed,
    totalWagesPending,
  };
}
