// Utility: compute completion rates by purpose and system using effective statuses.
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
