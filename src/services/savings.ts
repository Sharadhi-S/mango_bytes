import { SavingsGoalDetail } from '../types';
import { broadcastRealtimeEvent } from './realtime';
import { createNotification } from './notifications';

const STORAGE_KEY = 'shramasetu_savings_goals_v1';

/**
 * Pure mathematical savings calculator as specified:
 * - remaining = Math.max(0, target - current)
 * - daysRemaining = Math.max(1, Math.ceil((targetDate - now) / 1 day))
 * - recommendedDailyAmount = remaining > 0 ? Math.ceil(remaining / daysRemaining) : 0
 * - status = remaining === 0 ? 'completed' : 'active'
 */
export function calculateSavingsPlan(
  targetAmount: number,
  currentAmount: number,
  targetDate: string
): {
  remaining: number;
  daysRemaining: number;
  recommendedDailyAmount: number;
  isCompleted: boolean;
} {
  const remaining = Math.max(0, targetAmount - currentAmount);

  const targetTime = new Date(targetDate).getTime();
  const nowTime = Date.now();
  const diffMs = targetTime - nowTime;
  const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const recommendedDailyAmount = remaining > 0 ? Math.ceil(remaining / daysRemaining) : 0;
  const isCompleted = remaining === 0;

  return {
    remaining,
    daysRemaining,
    recommendedDailyAmount,
    isCompleted,
  };
}

function getDefaultFutureDate(daysAhead: number = 60): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

const INITIAL_GOALS_RAW = [
  {
    id: 'sg-1',
    workerId: 'w1',
    title: 'Festival & Family Trip',
    targetAmount: 15000,
    currentAmount: 8500,
    targetDate: getDefaultFutureDate(45),
    category: 'Celebration',
    icon: 'Sparkles',
    color: '#3B82F6',
    status: 'active' as const,
    createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
  },
  {
    id: 'sg-2',
    workerId: 'w1',
    title: 'Emergency Medical Buffer',
    targetAmount: 20000,
    currentAmount: 12000,
    targetDate: getDefaultFutureDate(90),
    category: 'Health',
    icon: 'Shield',
    color: '#10B981',
    status: 'active' as const,
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
  {
    id: 'sg-3',
    workerId: 'w1',
    title: 'Child School Uniforms & Books',
    targetAmount: 5000,
    currentAmount: 5000,
    targetDate: getDefaultFutureDate(10),
    category: 'Education',
    icon: 'BookOpen',
    color: '#F59E0B',
    status: 'completed' as const,
    createdAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
  },
];

function enrichGoal(goal: any): SavingsGoalDetail {
  const calc = calculateSavingsPlan(goal.targetAmount, goal.currentAmount, goal.targetDate);
  return {
    ...goal,
    remainingAmount: calc.remaining,
    daysRemaining: calc.daysRemaining,
    recommendedDailyAmount: calc.recommendedDailyAmount,
    status: calc.isCompleted ? 'completed' : goal.status || 'active',
  };
}

export function getSavingsGoals(workerId?: string): SavingsGoalDetail[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : INITIAL_GOALS_RAW;
    const enriched: SavingsGoalDetail[] = stored.map(enrichGoal);

    if (!workerId || workerId === 'all') return enriched;
    return enriched.filter((g) => g.workerId === workerId);
  } catch (e) {
    return INITIAL_GOALS_RAW.map(enrichGoal);
  }
}

export function saveSavingsGoals(goals: SavingsGoalDetail[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch (e) {
    // ignore
  }
}

export function createSavingsGoal(params: {
  workerId: string;
  title: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate: string;
  category?: string;
  icon?: string;
  color?: string;
}): SavingsGoalDetail {
  const goals = getSavingsGoals();
  const currentAmount = params.currentAmount || 0;
  const calc = calculateSavingsPlan(params.targetAmount, currentAmount, params.targetDate);

  const newGoal: SavingsGoalDetail = {
    id: 'sg-' + Math.random().toString(36).substring(2, 9),
    workerId: params.workerId,
    title: params.title,
    targetAmount: params.targetAmount,
    currentAmount,
    targetDate: params.targetDate,
    category: params.category || 'General',
    icon: params.icon || 'Target',
    color: params.color || '#3B82F6',
    status: calc.isCompleted ? 'completed' : 'active',
    remainingAmount: calc.remaining,
    daysRemaining: calc.daysRemaining,
    recommendedDailyAmount: calc.recommendedDailyAmount,
    createdAt: new Date().toISOString(),
  };

  goals.unshift(newGoal);
  saveSavingsGoals(goals);

  // Broadcast realtime event
  broadcastRealtimeEvent('SAVINGS_GOAL_UPDATED', newGoal);

  createNotification({
    recipientId: params.workerId,
    recipientRole: 'skilledWorker',
    title: 'New Savings Goal Created',
    message: `Goal "${newGoal.title}" started. Recommended daily saving: ₹${newGoal.recommendedDailyAmount}/day for ${newGoal.daysRemaining} days.`,
    type: 'system',
    relatedId: newGoal.id,
  });

  return newGoal;
}

export function addSavingsContribution(
  goalId: string,
  amount: number,
  note?: string
): SavingsGoalDetail | null {
  const goals = getSavingsGoals();
  const goalIndex = goals.findIndex((g) => g.id === goalId);
  if (goalIndex < 0) return null;

  const current = goals[goalIndex];
  const newCurrent = current.currentAmount + amount;
  const calc = calculateSavingsPlan(current.targetAmount, newCurrent, current.targetDate);

  const updated: SavingsGoalDetail = {
    ...current,
    currentAmount: newCurrent,
    remainingAmount: calc.remaining,
    daysRemaining: calc.daysRemaining,
    recommendedDailyAmount: calc.recommendedDailyAmount,
    status: calc.isCompleted ? 'completed' : current.status,
  };

  goals[goalIndex] = updated;
  saveSavingsGoals(goals);

  // Broadcast realtime event
  broadcastRealtimeEvent('SAVINGS_GOAL_UPDATED', updated);

  if (calc.isCompleted) {
    createNotification({
      recipientId: updated.workerId,
      recipientRole: 'skilledWorker',
      title: '🎉 Savings Goal Completed!',
      message: `Congratulations! You reached your goal of ₹${updated.targetAmount.toLocaleString('en-IN')} for "${updated.title}".`,
      type: 'system',
      relatedId: updated.id,
    });
  }

  return updated;
}
