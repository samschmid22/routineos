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

export const startOfDayString = (date) => {
  const d = new Date(date);
  return formatDate(d);
};

export const daysBetween = (from, to) => {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

export const getWeekdayIndex = (dateString) => {
  return new Date(`${dateString}T00:00:00`).getDay();
};

export const isHabitScheduledForDate = (habit, dateString) => {
  if (!habit) return false;
  const target = new Date(`${dateString}T00:00:00`);
  const start = habit.startDate ? new Date(`${habit.startDate}T00:00:00`) : target;
  const dayOfWeek = target.getDay();
  const freqType = habit.frequency?.type || habit.frequencyType;
  const daysOfWeek = habit.frequency?.daysOfWeek || habit.daysOfWeek || [];

  if (freqType === 'daily') return true;

  if (freqType === 'everyOtherDay') {
    const daysFromStart = Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return daysFromStart % 2 === 0;
  }

  if (freqType === 'daysOfWeek') {
    return Array.isArray(daysOfWeek) && daysOfWeek.includes(dayOfWeek);
  }

  return false;
};
