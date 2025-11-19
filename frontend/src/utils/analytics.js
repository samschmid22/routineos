// Utility: compute completion rates by purpose and system using today's state.
export const PURPOSES = ['Mind', 'Body', 'Intelligence', 'Money', 'Home'];
export const TIME_BLOCKS = ['Morning', 'Midday', 'Evening'];
export const STATUSES = ['NotStarted', 'Ongoing', 'Completed', 'Skipped'];

const initBucket = () => ({ completed: 0, total: 0 });

export const completionByPurpose = (habits, todayState) => {
  const buckets = PURPOSES.reduce((acc, purpose) => {
    acc[purpose] = initBucket();
    return acc;
  }, {});

  habits.forEach((habit) => {
    const bucket = buckets[habit.purpose];
    if (!bucket) return;
    bucket.total += 1;
    if (todayState[habit.id] === 'Completed') bucket.completed += 1;
  });

  return buckets;
};

export const completionBySystem = (habits, systems, todayState) => {
  const buckets = systems.reduce((acc, system) => {
    acc[system.id] = initBucket();
    return acc;
  }, {});

  habits.forEach((habit) => {
    const bucket = buckets[habit.systemId];
    if (!bucket) return;
    bucket.total += 1;
    if (todayState[habit.id] === 'Completed') bucket.completed += 1;
  });

  return buckets;
};

export const percent = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};
