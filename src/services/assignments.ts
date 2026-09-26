import { WorkerInvitation, WorkerAssignment } from '../types';
import { broadcastRealtimeEvent } from './realtime';
import { createNotification } from './notifications';

const INVITATIONS_STORAGE_KEY = 'shramasetu_invitations_v1';
const ASSIGNMENTS_STORAGE_KEY = 'shramasetu_assignments_v1';

const INITIAL_INVITATIONS: WorkerInvitation[] = [
  {
    id: 'inv-101',
    projectId: 'tender-1',
    projectTitle: 'Belagavi Highway & Flyover Expansion',
    contractorId: 'c1',
    contractorName: 'Kumar Construction Services',
    workerId: 'w1',
    workerName: 'Ravi Kumar',
    skill: 'Mason',
    dailyWage: 850,
    location: 'Belagavi Central (Site A)',
    duration: '45 Days',
    status: 'invited',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: 'Immediate deployment required for pier cap masonry on Section 2.',
  },
  {
    id: 'inv-102',
    projectId: 'tender-1',
    projectTitle: 'Belagavi Highway & Flyover Expansion',
    contractorId: 'c1',
    contractorName: 'Kumar Construction Services',
    workerId: 'w2',
    workerName: 'Suresh Patel',
    skill: 'Labourer',
    dailyWage: 600,
    location: 'Belagavi Central (Site A)',
    duration: '45 Days',
    status: 'accepted',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    notes: 'Material handling and concrete batching assistance.',
  },
];

const INITIAL_ASSIGNMENTS: WorkerAssignment[] = [
  {
    id: 'assign-201',
    projectId: 'tender-1',
    projectTitle: 'Belagavi Highway & Flyover Expansion',
    contractorId: 'c1',
    workerId: 'w2',
    workerName: 'Suresh Patel',
    skill: 'Labourer',
    dailyWage: 600,
    expectedDays: 45,
    expectedEarnings: 27000,
    status: 'assigned',
    assignedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export function getWorkerInvitations(workerId?: string): WorkerInvitation[] {
  try {
    const raw = localStorage.getItem(INVITATIONS_STORAGE_KEY);
    const all: WorkerInvitation[] = raw ? JSON.parse(raw) : INITIAL_INVITATIONS;
    if (!workerId || workerId === 'all') return all;
    return all.filter((inv) => inv.workerId === workerId);
  } catch (e) {
    return INITIAL_INVITATIONS;
  }
}

export function saveWorkerInvitations(invs: WorkerInvitation[]): void {
  try {
    localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invs));
  } catch (e) {
    // ignore
  }
}

export function getWorkerAssignments(workerId?: string): WorkerAssignment[] {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
    const all: WorkerAssignment[] = raw ? JSON.parse(raw) : INITIAL_ASSIGNMENTS;
    if (!workerId || workerId === 'all') return all;
    return all.filter((a) => a.workerId === workerId);
  } catch (e) {
    return INITIAL_ASSIGNMENTS;
  }
}

export function getProjectAssignments(projectId: string): WorkerAssignment[] {
  return getWorkerAssignments('all').filter((a) => a.projectId === projectId);
}

export function saveWorkerAssignments(assigns: WorkerAssignment[]): void {
  try {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assigns));
  } catch (e) {
    // ignore
  }
}

export function getActiveAssignmentForWorker(workerId: string = 'w1'): WorkerAssignment | undefined {
  const assigns = getWorkerAssignments(workerId);
  return assigns.find((a) => a.status === 'assigned' || a.status === 'active') || assigns[0];
}

export function createWorkerInvitation(params: {
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
}): WorkerInvitation {
  const all = getWorkerInvitations();
  const existing = all.find(
    (inv) => inv.projectId === params.projectId && inv.workerId === params.workerId
  );

  if (existing) {
    existing.status = 'invited';
    existing.dailyWage = params.dailyWage;
    existing.notes = params.notes;
    saveWorkerInvitations(all);
    broadcastRealtimeEvent('INVITATION_UPDATED', existing);
    return existing;
  }

  const newInv: WorkerInvitation = {
    id: 'inv-' + Math.random().toString(36).substring(2, 9),
    projectId: params.projectId,
    projectTitle: params.projectTitle,
    contractorId: params.contractorId,
    contractorName: params.contractorName,
    workerId: params.workerId,
    workerName: params.workerName,
    skill: params.skill,
    dailyWage: params.dailyWage,
    location: params.location,
    duration: params.duration || '30 Days',
    status: 'invited',
    createdAt: new Date().toISOString(),
    notes: params.notes,
  };

  all.unshift(newInv);
  saveWorkerInvitations(all);

  // Broadcast realtime event to worker tab
  broadcastRealtimeEvent('WORKER_INVITED', newInv);

  // Send push notification to worker
  createNotification({
    recipientId: params.workerId,
    recipientRole: params.skill.toLowerCase().includes('labour') ? 'labourer' : 'skilledWorker',
    title: 'New Work Invitation',
    message: `${params.contractorName} invited you for "${params.projectTitle}" at ₹${params.dailyWage}/day.`,
    type: 'invitation',
    relatedId: newInv.id,
  });

  return newInv;
}

export function respondToWorkerInvitation(
  invitationId: string,
  status: 'accepted' | 'declined'
): { invitation: WorkerInvitation; assignment?: WorkerAssignment } | null {
  const allInvs = getWorkerInvitations();
  const inv = allInvs.find((i) => i.id === invitationId);
  if (!inv) return null;

  inv.status = status;
  saveWorkerInvitations(allInvs);
  broadcastRealtimeEvent('INVITATION_UPDATED', inv);

  let assignment: WorkerAssignment | undefined;

  if (status === 'accepted') {
    const allAssigns = getWorkerAssignments();
    const expectedDays = 30;
    const expectedEarnings = inv.dailyWage * expectedDays;

    assignment = {
      id: 'assign-' + Math.random().toString(36).substring(2, 9),
      projectId: inv.projectId,
      projectTitle: inv.projectTitle,
      contractorId: inv.contractorId,
      workerId: inv.workerId,
      workerName: inv.workerName,
      skill: inv.skill,
      dailyWage: inv.dailyWage,
      expectedDays,
      expectedEarnings,
      status: 'assigned',
      assignedAt: new Date().toISOString(),
    };

    allAssigns.unshift(assignment);
    saveWorkerAssignments(allAssigns);
    broadcastRealtimeEvent('ASSIGNMENT_CREATED', assignment);

    // Notify contractor in real time
    createNotification({
      recipientId: inv.contractorId,
      recipientRole: 'contractor',
      title: 'Worker Accepted Invitation',
      message: `${inv.workerName} (${inv.skill}) accepted the assignment for "${inv.projectTitle}".`,
      type: 'invitation',
      relatedId: assignment.id,
    });
  }

  return { invitation: inv, assignment };
}
