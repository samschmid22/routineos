// Utility: small date helpers for formatting and habit scheduling checks.
const pad = (value) => String(value).padStart(2, '0');

export const formatDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const todayString = () => formatDate(new Date());

export const formatDisplayDate = (date) => {
  const weekdaysShort = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthsShort = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  const weekday = weekdaysShort[date.getDay()];
  const month = monthsShort[date.getMonth()];
  const day = pad(date.getDate());
  const year = date.getFullYear();
  return `${weekday} · ${month} ${day} · ${year}`;
};

export const isHabitScheduledForDate = (habit, dateString) => {
  if (!habit || !habit.frequency) return false;

  const target = new Date(`${dateString}T00:00:00`);
  const start = habit.startDate ? new Date(`${habit.startDate}T00:00:00`) : target;
  const dayOfWeek = target.getDay();

  if (habit.frequency.type === 'daily') return true;

  if (habit.frequency.type === 'daysOfWeek') {
    return Array.isArray(habit.frequency.daysOfWeek) && habit.frequency.daysOfWeek.includes(dayOfWeek);
  }

  if (habit.frequency.type === 'everyXDays') {
    const interval = Number(habit.frequency.intervalDays) || 0;
    if (interval <= 0) return false;
    const daysFromStart = Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return daysFromStart >= 0 && daysFromStart % interval === 0;
  }

  return false;
};
