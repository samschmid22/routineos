const STORAGE_KEYS = {
  systems: 'routineos_systems',
  habits: 'routineos_habits',
  statuses: 'routineos_statuses',
};

export const PURPOSES = ['Mind', 'Body', 'Intelligence', 'Money', 'Home'];
export const TIME_BLOCKS = ['Morning', 'Midday', 'Evening'];
export const STATUS_OPTIONS = [
  'NotStarted',
  'Ongoing',
  'Completed',
  'Skipped',
];

const pad = (value) => String(value).padStart(2, '0');

export const formatDate = (date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const generateId = (prefix) => {
  const fallback = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const unique = window.crypto?.randomUUID ? window.crypto.randomUUID() : fallback;
  return `${prefix}-${unique}`;
};

export const loadPersistedData = () => {
  const readJson = (key, fallback) => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
      console.error(`Failed to parse ${key}`, error);
      return fallback;
    }
  };

  return {
    systems: readJson(STORAGE_KEYS.systems, []),
    habits: readJson(STORAGE_KEYS.habits, []),
    statuses: readJson(STORAGE_KEYS.statuses, {}),
  };
};

export const persistData = ({ systems, habits, statuses }) => {
  window.localStorage.setItem(STORAGE_KEYS.systems, JSON.stringify(systems));
  window.localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits));
  window.localStorage.setItem(STORAGE_KEYS.statuses, JSON.stringify(statuses));
};

export const isHabitScheduledForDate = (habit, dateString) => {
  if (!habit) return false;
  const target = new Date(`${dateString}T00:00:00`);
  const start = habit.startDate ? new Date(`${habit.startDate}T00:00:00`) : target;
  const dayOfWeek = target.getDay();

  if (habit.frequencyType === 'daily') {
    return true;
  }

  if (habit.frequencyType === 'daysOfWeek') {
    return Array.isArray(habit.daysOfWeek) && habit.daysOfWeek.includes(dayOfWeek);
  }

  if (habit.frequencyType === 'interval' && habit.intervalDays > 0) {
    const daysFromStart = Math.floor(
      (target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysFromStart >= 0 && daysFromStart % habit.intervalDays === 0;
  }

  return false;
};

export const getLastNDates = (n, anchorDateString) => {
  const anchor = new Date(`${anchorDateString}T00:00:00`);
  const dates = [];

  for (let i = 0; i < n; i += 1) {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() - i);
    dates.push(formatDate(d));
  }

  return dates;
};

const initBucket = () => ({ completed: 0, total: 0 });

export const buildAnalytics = (habits, systems, statuses, anchorDate) => {
  const lastSevenDays = getLastNDates(7, anchorDate);
  const byPurpose = PURPOSES.reduce((acc, purpose) => {
    acc[purpose] = initBucket();
    return acc;
  }, {});
  const bySystem = systems.reduce((acc, system) => {
    acc[system.id] = initBucket();
    return acc;
  }, {});

  lastSevenDays.forEach((dateString) => {
    habits.forEach((habit) => {
      if (!isHabitScheduledForDate(habit, dateString)) return;

      const statusForDate = statuses[dateString]?.[habit.id] || 'NotStarted';
      const isComplete = statusForDate === 'Completed';

      if (byPurpose[habit.purpose]) {
        byPurpose[habit.purpose].total += 1;
        if (isComplete) byPurpose[habit.purpose].completed += 1;
      }

      if (bySystem[habit.systemId]) {
        bySystem[habit.systemId].total += 1;
        if (isComplete) bySystem[habit.systemId].completed += 1;
      }
    });
  });

  return { byPurpose, bySystem, daysCounted: lastSevenDays.length };
};

export const timeBlockSortWeight = (block) => {
  const order = { Morning: 1, Midday: 2, Evening: 3 };
  return order[block] || 99;
};
