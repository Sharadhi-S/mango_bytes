import { AttendanceRecord } from '../types';
import { broadcastRealtimeEvent } from './realtime';
import { createNotification } from './notifications';

const STORAGE_KEY = 'shramasetu_attendance_v1';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    projectId: 'tender-1',
    workerId: 'w1',
    workerName: 'Ravi Kumar',
    contractorId: 'c1',
    date: getPastDate(2),
    status: 'present',
    hours: 8,
    wageEarned: 850,
    notes: 'Completed base masonry work on Section 2.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'att-2',
    projectId: 'tender-1',
    workerId: 'w1',
    workerName: 'Ravi Kumar',
    contractorId: 'c1',
    date: getPastDate(1),
    status: 'present',
    hours: 8,
    wageEarned: 850,
    notes: 'Brick alignment and cement inspection.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'att-3',
    projectId: 'tender-1',
    workerId: 'w2',
    workerName: 'Suresh Patel',
    contractorId: 'c1',
    date: getPastDate(2),
    status: 'present',
    hours: 8,
    wageEarned: 600,
    notes: 'Concrete aggregate unloading.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'att-4',
    projectId: 'tender-1',
    workerId: 'w2',
    workerName: 'Suresh Patel',
    contractorId: 'c1',
    date: getPastDate(1),
    status: 'half',
    hours: 4,
    wageEarned: 300,
    notes: 'Afternoon half-day leave for medical checkup.',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export function getAttendanceRecords(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_ATTENDANCE;
}

export function saveAttendanceRecords(records: AttendanceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    // ignore
  }
}

export function getAttendanceForWorker(workerId: string): AttendanceRecord[] {
  return getAttendanceRecords()
    .filter((a) => a.workerId === workerId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getAttendanceForProject(projectId: string, date?: string): AttendanceRecord[] {
  const records = getAttendanceRecords().filter((a) => a.projectId === projectId);
  if (!date) return records;
  return records.filter((a) => a.date === date);
}

export function getTodayAttendanceForWorker(workerId: string): AttendanceRecord | undefined {
  const today = getTodayString();
  return getAttendanceRecords().find((a) => a.workerId === workerId && a.date === today);
}

export function markAttendance(params: {
  projectId: string;
  workerId: string;
  workerName: string;
  contractorId: string;
  date?: string;
  status: 'present' | 'half' | 'absent';
  dailyWage: number;
  notes?: string;
}): AttendanceRecord {
  const records = getAttendanceRecords();
  const targetDate = params.date || getTodayString();

  const hours = params.status === 'present' ? 8 : params.status === 'half' ? 4 : 0;
  const wageEarned =
    params.status === 'present'
      ? params.dailyWage
      : params.status === 'half'
      ? Math.round(params.dailyWage * 0.5)
      : 0;

  const existingIndex = records.findIndex(
    (a) => a.projectId === params.projectId && a.workerId === params.workerId && a.date === targetDate
  );

  let record: AttendanceRecord;

  if (existingIndex >= 0) {
    record = {
      ...records[existingIndex],
      status: params.status,
      hours,
      wageEarned,
      notes: params.notes ?? records[existingIndex].notes,
    };
    records[existingIndex] = record;
  } else {
    record = {
      id: 'att-' + Math.random().toString(36).substring(2, 9),
      projectId: params.projectId,
      workerId: params.workerId,
      workerName: params.workerName,
      contractorId: params.contractorId,
      date: targetDate,
      status: params.status,
      hours,
      wageEarned,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };
    records.unshift(record);
  }

  saveAttendanceRecords(records);

  // Broadcast realtime event
  broadcastRealtimeEvent('ATTENDANCE_MARKED', record);

  // Notify worker in real time
  const statusLabel =
    params.status === 'present'
      ? 'Present (Full Day)'
      : params.status === 'half'
      ? 'Half Day'
      : 'Absent';

  createNotification({
    recipientId: params.workerId,
    recipientRole: 'skilledWorker',
    title: `Attendance Marked: ${statusLabel}`,
    message: `Attendance recorded for today. Earned: ₹${wageEarned.toLocaleString('en-IN')}.`,
    type: 'attendance',
    relatedId: record.id,
  });

  return record;
}
