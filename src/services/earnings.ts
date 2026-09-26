import { WorkerEarningsSummary, EarningEntry } from '../types';
import { getAttendanceForWorker, getTodayAttendanceForWorker } from './attendance';
import { getWageRecordsForWorker } from './wages';
import { getActiveAssignmentForWorker } from './assignments';

export function computeWorkerEarnings(workerId: string = 'w1'): WorkerEarningsSummary {
  const attendanceList = getAttendanceForWorker(workerId);
  const wageList = getWageRecordsForWorker(workerId);
  const activeAssignment = getActiveAssignmentForWorker(workerId);

  const todayAtt = getTodayAttendanceForWorker(workerId);
  const todayEarned = todayAtt ? todayAtt.wageEarned : 0;

  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const currentYearMonth = now.toISOString().substring(0, 7);

  let thisWeekEarned = 0;
  let thisMonthEarned = 0;
  let totalEarned = 0;
  let daysPresentMonth = 0;

  attendanceList.forEach((att) => {
    totalEarned += att.wageEarned;

    const attDate = new Date(att.date);
    if (attDate >= oneWeekAgo) {
      thisWeekEarned += att.wageEarned;
    }

    if (att.date.startsWith(currentYearMonth)) {
      thisMonthEarned += att.wageEarned;
      if (att.status === 'present') {
        daysPresentMonth += 1;
      } else if (att.status === 'half') {
        daysPresentMonth += 0.5;
      }
    }
  });

  let pendingPayout = 0;
  let paidPayout = 0;

  wageList.forEach((w) => {
    if (w.status === 'pending') {
      pendingPayout += w.totalAmount;
    } else if (w.status === 'paid') {
      paidPayout += w.totalAmount;
    }
  });

  // Base fallback if worker just logged in with seed data
  if (totalEarned === 0 && paidPayout > 0) {
    totalEarned = paidPayout + pendingPayout;
    thisMonthEarned = totalEarned;
    thisWeekEarned = pendingPayout || 5100;
  }

  const expectedProjectEarnings = activeAssignment?.expectedEarnings || 25500;

  return {
    workerId,
    todayEarned,
    thisWeekEarned,
    thisMonthEarned,
    totalEarned,
    pendingPayout,
    paidPayout,
    daysPresentMonth,
    expectedProjectEarnings,
  };
}

export function getWorkerEarningEntries(workerId: string = 'w1'): EarningEntry[] {
  const attendanceList = getAttendanceForWorker(workerId);
  const wageList = getWageRecordsForWorker(workerId);

  // Generate earning entries from attendance records
  const entries: EarningEntry[] = attendanceList.map((att) => ({
    id: att.id,
    date: att.date,
    label: att.notes || (att.status === 'present' ? 'Full Day Work' : 'Half Day Work'),
    employer: 'Kumar Construction Services',
    work: 'Belagavi Highway & Flyover Expansion',
    hoursOrDays: att.status === 'present' ? '8 hrs (Full Day)' : att.status === 'half' ? '4 hrs (Half Day)' : '0 hrs (Absent)',
    amount: att.wageEarned,
    status: wageList.some((w) => w.status === 'paid' && w.periodStart <= att.date && w.periodEnd >= att.date)
      ? 'paid'
      : 'pending',
  }));

  // If no attendance entries yet, provide seed defaults
  if (entries.length === 0) {
    return [
      {
        id: 'e1',
        date: '2026-09-22',
        label: 'Masonry Work - Section 2',
        employer: 'Kumar Construction Services',
        work: 'Belagavi Highway & Flyover Expansion',
        hoursOrDays: '8 hrs',
        amount: 850,
        status: 'pending',
      },
      {
        id: 'e2',
        date: '2026-09-21',
        label: 'Foundation Pier Brickwork',
        employer: 'Kumar Construction Services',
        work: 'Belagavi Highway & Flyover Expansion',
        hoursOrDays: '8 hrs',
        amount: 850,
        status: 'pending',
      },
      {
        id: 'e3',
        date: '2026-09-15',
        label: 'Site Preparation & Leveling',
        employer: 'Kumar Construction Services',
        work: 'Belagavi Highway & Flyover Expansion',
        hoursOrDays: '6 days',
        amount: 5100,
        status: 'paid',
      },
    ];
  }

  return entries;
}
