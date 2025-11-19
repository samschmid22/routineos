// Utility: derive effective habit status based on last completion and frequency.
import { daysBetween, getWeekdayIndex, startOfDayString } from './date';

export const HABIT_STATUSES = ['notStarted', 'ongoing', 'completed', 'skipped'];

export const getEffectiveHabitStatus = (habit, currentDateString) => {
  const today = startOfDayString(currentDateString);
  const lastCompleted = habit.lastCompletedOn;
  const storedStatus = habit.status || 'notStarted';
  const freqType = habit.frequency?.type || habit.frequencyType;
  const daysOfWeek = habit.frequency?.daysOfWeek || habit.daysOfWeek || [];

  if (!lastCompleted) return storedStatus;

  const completedToday = lastCompleted === today;
  if (completedToday) return storedStatus;

  switch (freqType) {
    case 'daily':
      return 'notStarted';
    case 'everyOtherDay': {
      const diff = daysBetween(lastCompleted, today);
      return diff >= 2 ? 'notStarted' : storedStatus;
    }
    case 'daysOfWeek': {
      const todayIndex = getWeekdayIndex(today);
      const isDueToday = daysOfWeek?.includes(todayIndex);
      return isDueToday ? 'notStarted' : storedStatus;
    }
    default:
      return storedStatus;
  }
};
