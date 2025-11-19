// Utility: thin wrappers over localStorage for systems, habits, today state, and theme.
const KEYS = {
  systems: 'routineos_systems',
  habits: 'routineos_habits',
  today: 'routineos_today_state',
  subHabits: 'routineos_subhabit_statuses',
  theme: 'routineos_theme',
  todayOrder: 'routineos_today_order',
};

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error('Failed to parse stored data', error);
    return fallback;
  }
};

export const loadSystems = (fallback) => {
  const stored = window.localStorage.getItem(KEYS.systems);
  return safeParse(stored, fallback);
};

export const saveSystems = (systems) => {
  window.localStorage.setItem(KEYS.systems, JSON.stringify(systems));
};

export const loadHabits = (fallback) => {
  const stored = window.localStorage.getItem(KEYS.habits);
  return safeParse(stored, fallback);
};

export const saveHabits = (habits) => {
  window.localStorage.setItem(KEYS.habits, JSON.stringify(habits));
};

export const loadTodayState = (fallback) => {
  const stored = window.localStorage.getItem(KEYS.today);
  return safeParse(stored, fallback);
};

export const saveTodayState = (state) => {
  window.localStorage.setItem(KEYS.today, JSON.stringify(state));
};

export const loadTheme = (fallback) => {
  const stored = window.localStorage.getItem(KEYS.theme);
  return stored || fallback;
};

export const saveTheme = (theme) => {
  window.localStorage.setItem(KEYS.theme, theme);
};

export const loadSubHabitStatuses = (fallback) => {
  const stored = window.localStorage.getItem(KEYS.subHabits);
  return safeParse(stored, fallback);
};

export const saveSubHabitStatuses = (state) => {
  window.localStorage.setItem(KEYS.subHabits, JSON.stringify(state));
};

export const loadTodayOrder = (fallback) => {
  const stored = window.localStorage.getItem(KEYS.todayOrder);
  return safeParse(stored, fallback);
};

export const saveTodayOrder = (order) => {
  window.localStorage.setItem(KEYS.todayOrder, JSON.stringify(order));
};
