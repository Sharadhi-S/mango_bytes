import { WageRecord } from '../types';
import { broadcastRealtimeEvent } from './realtime';
import { createNotification } from './notifications';

const STORAGE_KEY = 'shramasetu_wages_v1';

const INITIAL_WAGES: WageRecord[] = [
  {
    id: 'wage-1',
    projectId: 'tender-1',
    projectTitle: 'Belagavi Highway & Flyover Expansion',
    contractorId: 'c1',
    workerId: 'w1',
    workerName: 'Ravi Kumar',
    periodStart: '2026-09-15',
    periodEnd: '2026-09-22',
    daysWorked: 6,
    dailyWage: 850,
    totalAmount: 5100,
    status: 'pending',
    notes: 'Week 3 masonry foundation work',
  },
  {
    id: 'wage-2',
    projectId: 'tender-1',
    projectTitle: 'Belagavi Highway & Flyover Expansion',
    contractorId: 'c1',
    workerId: 'w2',
    workerName: 'Suresh Patel',
    periodStart: '2026-09-15',
    periodEnd: '2026-09-22',
    daysWorked: 5.5,
    dailyWage: 600,
    totalAmount: 3300,
    status: 'paid',
    disbursedDate: '2026-09-23T10:30:00Z',
    paymentReference: 'UPI-MOCK-928174',
    notes: 'Material handling and staging',
  },
  {
    id: 'wage-3',
    projectId: 'tender-1',
    projectTitle: 'Belagavi Highway & Flyover Expansion',
    contractorId: 'c1',
    workerId: 'w1',
    workerName: 'Ravi Kumar',
    periodStart: '2026-09-08',
    periodEnd: '2026-09-14',
    daysWorked: 6,
    dailyWage: 850,
    totalAmount: 5100,
    status: 'paid',
    disbursedDate: '2026-09-15T11:00:00Z',
    paymentReference: 'UPI-MOCK-819231',
    notes: 'Week 2 masonry foundation work',
  },
];

export function getWageRecords(): WageRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_WAGES;
}

export function saveWageRecords(records: WageRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    // ignore
  }
}

export function getWageRecordsForContractor(contractorId: string = 'c1'): WageRecord[] {
  return getWageRecords().filter((w) => w.contractorId === contractorId || contractorId === 'all');
}

export function getWageRecordsForWorker(workerId: string): WageRecord[] {
  return getWageRecords().filter((w) => w.workerId === workerId);
}

export function disburseWage(recordId: string, reference?: string): WageRecord | null {
  const records = getWageRecords();
  const record = records.find((w) => w.id === recordId);
  if (!record) return null;

  record.status = 'paid';
  record.disbursedDate = new Date().toISOString();
  record.paymentReference = reference || `UPI-SETU-${Math.floor(100000 + Math.random() * 900000)}`;

  saveWageRecords(records);

  // Broadcast realtime event
  broadcastRealtimeEvent('WAGE_RECORD_UPDATED', record);

  // Notify worker
  createNotification({
    recipientId: record.workerId,
    recipientRole: 'skilledWorker',
    title: 'Wage Payout Processed',
    message: `₹${record.totalAmount.toLocaleString('en-IN')} has been disbursed for period ${record.periodStart} to ${record.periodEnd}. Ref: ${record.paymentReference}. (Demo prototype mode - no actual bank transfer executed).`,
    type: 'wage',
    relatedId: record.id,
  });

  return record;
}

export function bulkDisbursePendingWages(contractorId: string = 'c1'): WageRecord[] {
  const records = getWageRecords();
  const updated: WageRecord[] = [];

  records.forEach((record) => {
    if (record.contractorId === contractorId && record.status === 'pending') {
      record.status = 'paid';
      record.disbursedDate = new Date().toISOString();
      record.paymentReference = `UPI-SETU-${Math.floor(100000 + Math.random() * 900000)}`;
      updated.push(record);

      createNotification({
        recipientId: record.workerId,
        recipientRole: 'skilledWorker',
        title: 'Wage Payout Processed',
        message: `₹${record.totalAmount.toLocaleString('en-IN')} has been disbursed. Ref: ${record.paymentReference}.`,
        type: 'wage',
        relatedId: record.id,
      });
    }
  });

  if (updated.length > 0) {
    saveWageRecords(records);
    updated.forEach((r) => broadcastRealtimeEvent('WAGE_RECORD_UPDATED', r));
  }

  return updated;
}
