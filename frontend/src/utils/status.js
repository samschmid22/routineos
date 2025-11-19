// Utility: derive effective habit status based on last completion and frequency.
import { daysBetween, getWeekdayIndex, startOfDayString } from './date';

export const HABIT_STATUSES = ['notStarted', 'ongoing', 'completed', 'skipped'];

const deriveFromSubHabits = (habit, baseStatus, today, subStatuses) => {
  const items = habit.subHabits || [];
  if (!items.length) return baseStatus;
  const statuses = items.map((sub) => subStatuses[sub.id] || 'notStarted');
  if (!statuses.length) return baseStatus;
  const allCompleted = statuses.every((status) => status === 'completed');
  if (allCompleted) return 'completed';
  const allSkipped = statuses.every((status) => status === 'skipped');
  if (allSkipped) return 'skipped';
  const noneTouched = statuses.every((status) => status === 'notStarted');
  if (!noneTouched) return 'ongoing';
  return baseStatus;
};

export const getEffectiveHabitStatus = (habit, currentDateString, subHabitStatuses = {}) => {
  const today = startOfDayString(currentDateString);
  const lastCompleted = habit.lastCompletedOn;
  const storedStatus = habit.status || 'notStarted';
  const freqType = habit.frequency?.type || habit.frequencyType;
  const daysOfWeek = habit.frequency?.daysOfWeek || habit.daysOfWeek || [];

  if (!lastCompleted) return deriveFromSubHabits(habit, storedStatus, today, subHabitStatuses);

  const completedToday = lastCompleted === today;
  if (completedToday) return deriveFromSubHabits(habit, storedStatus, today, subHabitStatuses);

  switch (freqType) {
    case 'daily':
      return deriveFromSubHabits(habit, 'notStarted', today, subHabitStatuses);
    case 'everyOtherDay': {
      const diff = daysBetween(lastCompleted, today);
      return deriveFromSubHabits(habit, diff >= 2 ? 'notStarted' : storedStatus, today, subHabitStatuses);
    }
    case 'daysOfWeek': {
      const todayIndex = getWeekdayIndex(today);
      const isDueToday = daysOfWeek?.includes(todayIndex);
      return deriveFromSubHabits(habit, isDueToday ? 'notStarted' : storedStatus, today, subHabitStatuses);
    }
    default:
      return deriveFromSubHabits(habit, storedStatus, today, subHabitStatuses);
  }
};
