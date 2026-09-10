import { getReadingPlan, READING_PLANS } from '../data/plans';
import type { ReadingPlan } from '../types/study';
import type { PlanProgress } from '../types/user';

export function listPlans(): ReadingPlan[] {
  return READING_PLANS;
}

export function planDayCount(plan: ReadingPlan): number {
  return plan.days.length;
}

export function progressPercent(plan: ReadingPlan, progress?: PlanProgress | null): number {
  if (!progress || plan.days.length === 0) {
    return 0;
  }
  return Math.round((progress.completedDays.length / plan.days.length) * 100);
}

export function nextIncompleteDay(plan: ReadingPlan, progress?: PlanProgress | null): number {
  const completed = new Set(progress?.completedDays ?? []);
  const next = plan.days.find((day) => !completed.has(day.day));
  return next?.day ?? plan.days.length;
}

export { getReadingPlan };
