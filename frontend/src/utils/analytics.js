// Utility: compute completion rates and trends using effective statuses.
import { formatDate, isHabitScheduledForDate } from './date';

export const PURPOSES = ['Mind', 'Body', 'Intelligence', 'Money', 'Home'];
export const TIME_BLOCKS = ['Morning', 'Midday', 'Evening'];

const initBucket = () => ({ completed: 0, total: 0 });

export const completionByPurpose = (habits, statusMap) => {
  const buckets = PURPOSES.reduce((acc, purpose) => {
    acc[purpose] = initBucket();
    return acc;
  }, {});

  habits.forEach((habit) => {
    const bucket = buckets[habit.purpose];
    if (!bucket) return;
    bucket.total += 1;
    if (statusMap[habit.id] === 'completed') bucket.completed += 1;
  });

  return buckets;
};

export const completionBySystem = (habits, systems, statusMap) => {
  const buckets = systems.reduce((acc, system) => {
    acc[system.id] = initBucket();
    return acc;
  }, {});

  habits.forEach((habit) => {
    const bucket = buckets[habit.systemId];
    if (!bucket) return;
    bucket.total += 1;
    if (statusMap[habit.id] === 'completed') bucket.completed += 1;
  });

  return buckets;
};

export const percent = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

const HISTORY_KEYS = ['completionHistory', 'completion_history', 'history', 'historyEntries', 'history_entries'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;
const COMPLETED_STATUSES = new Set(['completed', 'complete', 'done', 'success', 'true', '1']);

const normalizeHistoryEntry = (entry, fallbackDate) => {
  if (entry == null) return null;

  const normalizeDate = (value) => {
    if (!value) return null;
    return String(value).slice(0, 10);
  };

  if (typeof entry === 'string') {
    if (DATE_PATTERN.test(entry) && !fallbackDate) {
      return { date: normalizeDate(entry), status: 'completed' };
    }
    const dateValue = DATE_PATTERN.test(entry) ? entry : fallbackDate;
    if (!dateValue) return null;
    return { date: normalizeDate(dateValue), status: DATE_PATTERN.test(entry) ? 'completed' : entry };
  }

  if (typeof entry === 'boolean' || typeof entry === 'number') {
    if (!fallbackDate) return null;
    const status = entry === true || entry > 0 ? 'completed' : 'notStarted';
    return { date: normalizeDate(fallbackDate), status };
  }

  if (Array.isArray(entry)) {
    const [first, second] = entry;
    if (DATE_PATTERN.test(first)) {
      return { date: normalizeDate(first), status: typeof second === 'string' ? second : 'completed' };
    }
    return normalizeHistoryEntry(second, fallbackDate || first);
  }

  if (typeof entry === 'object') {
    const dateValue =
      entry.date ||
      entry.day ||
      entry.completedOn ||
      entry.completed_on ||
      entry.dateString ||
      entry.timestamp ||
      fallbackDate;
    if (!dateValue) return null;
    const statusValue =
      entry.status ??
      entry.value ??
      (typeof entry.completed === 'boolean' ? (entry.completed ? 'completed' : 'notStarted') : undefined) ??
      (typeof entry.outcome === 'string' ? entry.outcome : undefined) ??
      undefined;
    return {
      date: normalizeDate(dateValue),
      status: statusValue ?? 'completed',
    };
  }

  return null;
};

const extractCompletionEntries = (habit) => {
  const entries = [];

  HISTORY_KEYS.forEach((key) => {
    const value = habit?.[key];
    if (value == null) return;
    let resolved = value;
    if (typeof resolved === 'string') {
      try {
        resolved = JSON.parse(resolved);
      } catch {
        if (DATE_PATTERN.test(resolved)) {
          entries.push({ date: String(resolved).slice(0, 10), status: 'completed' });
        }
        return;
      }
    }

    if (Array.isArray(resolved)) {
      resolved.forEach((item) => {
        const normalized = normalizeHistoryEntry(item);
        if (normalized) entries.push(normalized);
      });
      return;
    }

    if (typeof resolved === 'object') {
      if (resolved.date || resolved.completedOn || resolved.completed_on) {
        const normalized = normalizeHistoryEntry(resolved);
        if (normalized) entries.push(normalized);
        return;
      }
      Object.entries(resolved).forEach(([keyName, entry]) => {
        const normalized = normalizeHistoryEntry(entry, keyName);
        if (normalized) entries.push(normalized);
      });
    }
  });

  const lastCompleted = habit?.lastCompletedOn || habit?.last_completed_on;
  if (lastCompleted) {
    entries.push({ date: String(lastCompleted).slice(0, 10), status: 'completed' });
  }

  return entries;
};

const isCompletedStatus = (status) => {
  if (status == null) return true;
  if (typeof status === 'boolean') return status;
  if (typeof status === 'number') return status > 0;
  if (typeof status === 'string') {
    return COMPLETED_STATUSES.has(status.toLowerCase());
  }
  return false;
};

const buildCompletionLookup = (habits) => {
  const map = new Map();
  habits.forEach((habit) => {
    if (!habit?.id) return;
    const history = extractCompletionEntries(habit);
    history.forEach(({ date, status }) => {
      if (!date || !isCompletedStatus(status)) return;
      if (!map.has(date)) {
        map.set(date, new Set());
      }
      map.get(date).add(habit.id);
    });
  });
  return map;
};

export const completionTrend = (habits = [], { days = 7 } = {}) => {
  const totalDays = Math.max(days, 1);
  const today = new Date();
  const completionsByDate = buildCompletionLookup(habits);

  const data = [];
  for (let offset = totalDays - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    const isoDate = formatDate(day);
    const completedForDay = completionsByDate.get(isoDate);

    let completedHabits = 0;
    let totalHabits = 0;
    habits.forEach((habit) => {
      if (!habit?.id) return;
      if (!isHabitScheduledForDate(habit, isoDate)) return;
      totalHabits += 1;
      if (completedForDay?.has(habit.id)) {
        completedHabits += 1;
      }
    });

    data.push({
      date: day.toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      completionRate: totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100),
      completedHabits,
      totalHabits,
    });
  }

  return data;
};
