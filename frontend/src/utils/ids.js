// Utility: generate stable-but-random IDs for systems and habits.
export const generateId = (prefix) => {
  const raw = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  return `${prefix}-${raw}`;
};
