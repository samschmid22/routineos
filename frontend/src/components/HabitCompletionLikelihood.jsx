import { useEffect, useMemo, useRef, useState } from 'react';

const MAX_HABITS = 25;

const normalizeHabitPayload = (habits = [], systems = [], statusMap = {}) => {
  if (!Array.isArray(habits) || habits.length === 0) return [];
  const systemMap = systems.reduce((acc, system) => {
    acc[system.id] = system;
    return acc;
  }, {});

  return habits
    .filter((habit) => habit && habit.id)
    .slice(0, MAX_HABITS)
    .map((habit) => {
      let completionHistory = habit.completionHistory ?? habit.completion_history ?? [];
      if (typeof completionHistory === 'string') {
        try {
          completionHistory = JSON.parse(completionHistory);
        } catch {
          completionHistory = [];
        }
      }
      return {
        id: String(habit.id),
        name: habit.name,
        systemId: habit.systemId,
        systemName: systemMap[habit.systemId]?.name || 'System',
        purpose: habit.purpose || '',
        status: habit.status || 'notStarted',
        todayStatus: statusMap?.[habit.id] || habit.status || 'notStarted',
        lastCompletedOn: habit.lastCompletedOn || habit.last_completed_on || null,
        completionHistory,
        frequency: habit.frequency,
        daysOfWeek: habit.daysOfWeek || habit.frequency?.daysOfWeek || [],
        intervalDays: habit.intervalDays ?? habit.interval_days ?? null,
        streak: habit.streak ?? habit.currentStreak ?? habit.streak_count ?? 0,
        startDate: habit.startDate || habit.start_date || habit.created_at || null,
        notes: habit.notes || '',
      };
    });
};

const PredictionRow = ({ prediction }) => {
  const likelihood = Math.max(0, Math.min(100, Math.round(prediction?.likelihood ?? 0)));
  return (
    <div className="stack xs">
      <div className="row spaced align-center small">
        <div className="stack xs">
          <strong>{prediction.habitName}</strong>
          <span className="muted small">{prediction.systemName}</span>
        </div>
        <strong>{likelihood}%</strong>
      </div>
      <div className="progress" style={{ height: 8 }}>
        <div className="progress-fill" style={{ width: `${likelihood}%` }} />
      </div>
      {prediction.reasoning && <p className="muted small">{prediction.reasoning}</p>}
      {prediction.guidance && <p className="muted small">{prediction.guidance}</p>}
    </div>
  );
};

const HabitCompletionLikelihood = ({ habits, systems, statusMap }) => {
  const [state, setState] = useState({ predictions: [], summary: '', status: 'idle', error: null });
  const [refreshIndex, setRefreshIndex] = useState(0);

  const normalizedHabits = useMemo(
    () => normalizeHabitPayload(habits, systems, statusMap),
    [habits, systems, statusMap],
  );

  const payloadSignature = useMemo(() => {
    if (!normalizedHabits.length) return '';
    return JSON.stringify(
      normalizedHabits.map((habit) => ({
        id: habit.id,
        todayStatus: habit.todayStatus,
        lastCompletedOn: habit.lastCompletedOn,
        historyCount: Array.isArray(habit.completionHistory) ? habit.completionHistory.length : 0,
      })),
    );
  }, [normalizedHabits]);

  const payloadRef = useRef([]);
  useEffect(() => {
    payloadRef.current = normalizedHabits;
  }, [normalizedHabits]);

  useEffect(() => {
    if (!payloadSignature || !payloadRef.current.length) return;
    let aborted = false;
    const controller = new AbortController();
    const fetchPredictions = async () => {
      setState((prev) => ({
        ...prev,
        status: prev.predictions.length ? 'refreshing' : 'loading',
        error: null,
      }));

      try {
        const response = await fetch('/api/habit-likelihood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ habits: payloadRef.current }),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to generate predictions');
        }
        const data = await response.json();
        if (aborted) return;
        setState({
          predictions: Array.isArray(data.predictions) ? data.predictions : [],
          summary: data.summary || '',
          status: 'success',
          error: null,
        });
      } catch (error) {
        if (aborted || error.name === 'AbortError') return;
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: error.message || 'Prediction request failed',
        }));
      }
    };

    fetchPredictions();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [payloadSignature, refreshIndex]);

  const handleRefresh = () => {
    setRefreshIndex((prev) => prev + 1);
  };

  const isLoading = state.status === 'loading' || state.status === 'refreshing';
  const hasHabits = normalizedHabits.length > 0;

  return (
    <div className="mini-card">
      <div className="row spaced align-center">
        <h4>Habit completion likelihood</h4>
        <button type="button" className="btn-ghost small-btn" onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? 'Updating…' : 'Refresh'}
        </button>
      </div>
      <p className="muted small">
        AI estimates of the chance each habit gets completed the next time it is scheduled (next 7 days).
      </p>
      {state.status === 'idle' && hasHabits && <div className="muted small">Preparing predictions…</div>}
      {state.status === 'loading' && <div className="muted small">Generating predictions…</div>}
      {state.status === 'refreshing' && <div className="muted small">Refreshing with latest data…</div>}
      {state.status === 'error' && (
        <div className="muted small">Could not load predictions right now. Try refreshing in a moment.</div>
      )}
      {!hasHabits && <div className="muted small">Add a habit to unlock AI likelihood estimates.</div>}
      {hasHabits && !isLoading && !state.error && state.predictions.length === 0 && (
        <div className="muted small">Complete a few routines to give the AI something to learn from.</div>
      )}
      <div className="stack sm">
        {state.predictions.map((prediction) => (
          <PredictionRow key={prediction.habitId || prediction.habitName} prediction={prediction} />
        ))}
      </div>
      {state.summary && <p className="muted small">{state.summary}</p>}
    </div>
  );
};

export default HabitCompletionLikelihood;
