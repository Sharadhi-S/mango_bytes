import { describe, it, expect, beforeEach } from 'vitest';
import { matchWorker, matchWorkersForRequirement } from '../workers';
import { calculateSavingsPlan } from '../savings';
import { sendRfp, respondToRfp } from '../rfps';
import { createWorkerInvitation, respondToWorkerInvitation } from '../assignments';
import { markAttendance } from '../attendance';
import { calculateDynamicTenderFee } from '../../backend/employerBackend';
import type { ContractorWorker } from '../../types';

// In-memory localStorage mock for node test runner
if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

describe('ShramaSetu Core Business Logic & Algorithms', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Deterministic 100-Point Worker Matching Engine', () => {
    const mockWorker: ContractorWorker = {
      id: 'w-test-1',
      category: 'skilledWorker',
      name: 'Test Mason',
      primarySkill: 'Mason',
      experience: '5 years',
      location: 'Belagavi Central (3 km)',
      availability: 'available',
      workCount: 25,
      verified: true,
      avatar: 'TM',
    };

    it('awards high score (>= 90 pts) for exact skill, local Belagavi location, availability, and high experience', () => {
      const match = matchWorker(mockWorker, 'Mason', 900, 'Belagavi');
      expect(match.score).toBeGreaterThanOrEqual(90);
      expect(match.score).toBeLessThanOrEqual(100);
      expect(match.isAvailable).toBe(true);
      expect(match.matchReasons).toContain('Exact skill match for Mason (+50 pts)');
      expect(match.matchReasons).toContain('Local resident in Belagavi project cluster (+20 pts)');
      expect(match.matchReasons).toContain('Immediately available for deployment (+15 pts)');
      expect(match.matchReasons).toContain('5+ years verified field experience (+10 pts)');
    });

    it('correctly handles skill aliases (e.g., Bricklayer / Rajmistri maps to Mason)', () => {
      const match = matchWorker(mockWorker, 'Bricklayer', 900, 'Belagavi');
      expect(match.score).toBeGreaterThanOrEqual(90);
      expect(match.matchReasons.some((r) => r.includes('Exact skill match'))).toBe(true);
    });

    it('penalizes unavailable workers by granting 0 pts for availability', () => {
      const busyWorker: ContractorWorker = {
        ...mockWorker,
        availability: 'unavailable',
      };
      const matchAvailable = matchWorker(mockWorker, 'Mason', 900, 'Belagavi');
      const matchBusy = matchWorker(busyWorker, 'Mason', 900, 'Belagavi');
      expect(matchAvailable.score - matchBusy.score).toBe(15);
      expect(matchBusy.matchReasons).toContain('Currently committed to another site (+0 pts)');
    });

    it('ranks workers in descending order of score for a given requirement', () => {
      const ranked = matchWorkersForRequirement('Mason', 900, 'Belagavi');
      expect(ranked.length).toBeGreaterThan(0);
      for (let i = 0; i < ranked.length - 1; i++) {
        expect(ranked[i].score).toBeGreaterThanOrEqual(ranked[i + 1].score);
      }
    });
  });

  describe('2. Mathematical Daily Savings Calculator', () => {
    it('calculates recommended daily amount using: ceil(remaining / daysRemaining)', () => {
      const targetAmount = 10000;
      const currentAmount = 4000; // remaining = 6000
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days
      const targetDate = futureDate.toISOString().split('T')[0];

      const plan = calculateSavingsPlan(targetAmount, currentAmount, targetDate);
      expect(plan.remaining).toBe(6000);
      expect(plan.daysRemaining).toBe(30);
      expect(plan.recommendedDailyAmount).toBe(200); // 6000 / 30 = 200
      expect(plan.isCompleted).toBe(false);
    });

    it('rounds recommended amount up to nearest integer (ceil)', () => {
      const targetAmount = 5000;
      const currentAmount = 0; // remaining = 5000
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 60); // 60 days -> 5000 / 60 = 83.333 -> ceil = 84
      const targetDate = futureDate.toISOString().split('T')[0];

      const plan = calculateSavingsPlan(targetAmount, currentAmount, targetDate);
      expect(plan.remaining).toBe(5000);
      expect(plan.daysRemaining).toBe(60);
      expect(plan.recommendedDailyAmount).toBe(84);
      expect(plan.isCompleted).toBe(false);
    });

    it('sets recommended amount to 0 and isCompleted to true when target is reached', () => {
      const targetAmount = 10000;
      const currentAmount = 10000;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      const targetDate = futureDate.toISOString().split('T')[0];

      const plan = calculateSavingsPlan(targetAmount, currentAmount, targetDate);
      expect(plan.remaining).toBe(0);
      expect(plan.recommendedDailyAmount).toBe(0);
      expect(plan.isCompleted).toBe(true);
    });
  });

  describe('3. Contractor RFP Lifecycle', () => {
    it('dispatches RFP with initial sent status and records proposal', () => {
      const rfp = sendRfp({
        projectId: 'proj-unit-1',
        projectTitle: 'Highway Bridge Construction',
        employerId: 'emp-1',
        employerName: 'Infra Corp',
        contractorId: 'c1',
        contractorName: 'Kumar Constructions',
        budget: 50000000,
        location: 'Belagavi',
        duration: '12 Months',
        headcountNeeded: 80,
        message: 'Please review requirements and respond.',
      });

      expect(rfp.id).toBeDefined();
      expect(rfp.status).toBe('sent');
      expect(rfp.projectTitle).toBe('Highway Bridge Construction');
    });

    it('allows contractor to accept RFP and transitions status to accepted', () => {
      const rfp = sendRfp({
        projectId: 'proj-unit-2',
        projectTitle: 'Solar Farm Fencing',
        employerId: 'emp-1',
        employerName: 'Infra Corp',
        contractorId: 'c1',
        contractorName: 'Kumar Constructions',
        budget: 15000000,
        location: 'Belagavi',
        duration: '3 Months',
        headcountNeeded: 30,
        message: 'Deploy workforce.',
      });

      const accepted = respondToRfp(rfp.id, 'accepted', 'Confirmed readiness to deploy.');
      expect(accepted).not.toBeNull();
      expect(accepted?.status).toBe('accepted');
      expect(accepted?.responseNotes).toBe('Confirmed readiness to deploy.');
    });
  });

  describe('4. Worker Invitations and Assignment Generation', () => {
    it('creates an invitation and generates expected earnings upon acceptance', () => {
      const inv = createWorkerInvitation({
        projectId: 'proj-unit-10',
        projectTitle: 'Highway Expansion',
        contractorId: 'c1',
        contractorName: 'Kumar Constructions',
        workerId: 'w-test-mason',
        workerName: 'Ravi Kumar',
        skill: 'Mason',
        dailyWage: 850,
        location: 'Belagavi',
        duration: '30 Days',
      });

      expect(inv.status).toBe('invited');
      expect(inv.dailyWage).toBe(850);

      const result = respondToWorkerInvitation(inv.id, 'accepted');
      expect(result).not.toBeNull();
      expect(result?.invitation.status).toBe('accepted');
      expect(result?.assignment).toBeDefined();
      expect(result?.assignment?.expectedEarnings).toBe(850 * 30); // dailyWage * expectedDays
      expect(result?.assignment?.status).toBe('assigned');
    });
  });

  describe('5. Contractor Attendance Roll & Wage Calculation', () => {
    it('calculates full wage and 8 hours for present status', () => {
      const record = markAttendance({
        projectId: 'proj-unit-1',
        workerId: 'w-1',
        workerName: 'Ravi Kumar',
        contractorId: 'c1',
        date: '2026-09-26',
        status: 'present',
        dailyWage: 900,
      });

      expect(record.status).toBe('present');
      expect(record.hours).toBe(8);
      expect(record.wageEarned).toBe(900);
    });

    it('calculates half wage and 4 hours for half day status', () => {
      const record = markAttendance({
        projectId: 'proj-unit-1',
        workerId: 'w-2',
        workerName: 'Suresh Patel',
        contractorId: 'c1',
        date: '2026-09-26',
        status: 'half',
        dailyWage: 600,
      });

      expect(record.status).toBe('half');
      expect(record.hours).toBe(4);
      expect(record.wageEarned).toBe(300);
    });

    it('calculates 0 wage and 0 hours for absent status', () => {
      const record = markAttendance({
        projectId: 'proj-unit-1',
        workerId: 'w-3',
        workerName: 'Mahesh Yadav',
        contractorId: 'c1',
        date: '2026-09-26',
        status: 'absent',
        dailyWage: 900,
      });

      expect(record.status).toBe('absent');
      expect(record.hours).toBe(0);
      expect(record.wageEarned).toBe(0);
    });
  });

  describe('6. Dynamic Employer Tender Access Fee Calculation', () => {
    it('applies Up to ₹25 Lakhs: ₹4,000 + 18% GST (₹4,720)', () => {
      const fee = calculateDynamicTenderFee(2000000);
      expect(fee.baseFee).toBe(4000);
      expect(fee.cgst).toBe(360);
      expect(fee.sgst).toBe(360);
      expect(fee.totalFee).toBe(4720);
    });

    it('applies ₹25 Lakhs to ₹50 Lakhs: ₹5,000 + 18% GST (₹5,900)', () => {
      const fee = calculateDynamicTenderFee(4000000);
      expect(fee.baseFee).toBe(5000);
      expect(fee.cgst).toBe(450);
      expect(fee.sgst).toBe(450);
      expect(fee.totalFee).toBe(5900);
    });

    it('applies ₹50 Lakhs to ₹1 Crore: ₹8,000 + 18% GST (₹9,440)', () => {
      const fee = calculateDynamicTenderFee(8000000);
      expect(fee.baseFee).toBe(8000);
      expect(fee.cgst).toBe(720);
      expect(fee.sgst).toBe(720);
      expect(fee.totalFee).toBe(9440);
    });

    it('applies ₹1 Crore to ₹2.5 Crores: ₹12,000 + 18% GST (₹14,160)', () => {
      const fee = calculateDynamicTenderFee(18000000);
      expect(fee.baseFee).toBe(12000);
      expect(fee.cgst).toBe(1080);
      expect(fee.sgst).toBe(1080);
      expect(fee.totalFee).toBe(14160);
    });

    it('applies Above ₹2.5 Crores: ₹15,000 + 18% GST (₹17,700)', () => {
      const fee = calculateDynamicTenderFee(82000000);
      expect(fee.baseFee).toBe(15000);
      expect(fee.cgst).toBe(1350);
      expect(fee.sgst).toBe(1350);
      expect(fee.totalFee).toBe(17700);
    });
  });
});
