// App shell: handles navigation, theming, persistence, and passes data to views.
import { useEffect, useMemo, useState } from 'react';
import AnalyticsView from './components/AnalyticsView';
import HabitsTable from './components/HabitsTable';
import SystemEditor from './components/SystemEditor';
import SystemsList from './components/SystemsList';
import Tabs from './components/Tabs';
import TodayView from './components/TodayView';
import mockData from './mockData';
import { formatDisplayDate, isHabitScheduledForDate, todayString } from './utils/date';
import { generateId } from './utils/ids';
import { getEffectiveHabitStatus, HABIT_STATUSES } from './utils/status';
import {
  loadHabits,
  loadSystems,
  loadTheme,
  loadSubHabitStatuses,
  loadTodayOrder,
  saveHabits,
  saveSystems,
  saveTheme,
  saveSubHabitStatuses,
  saveTodayOrder,
} from './utils/storage';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Today');
  const [theme, setTheme] = useState('dark');

  const [systems, setSystems] = useState([]);
  const [habits, setHabits] = useState([]);
  const [subHabitStatuses, setSubHabitStatuses] = useState({});
  const [todayOrder, setTodayOrder] = useState([]);
  const [selectedSystemId, setSelectedSystemId] = useState(null);
  const [systemDraft, setSystemDraft] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate state from localStorage or mock data once.
  useEffect(() => {
    const storedTheme = loadTheme('dark');
    setTheme(storedTheme);

    const storedSystems = loadSystems(mockData.systems);
    const storedHabits = loadHabits(mockData.habits);
    const storedSubStatuses = loadSubHabitStatuses({});
    const storedOrder = loadTodayOrder([]);

    const nextSystems = storedSystems.length ? storedSystems : mockData.systems;
    const nextHabits = storedHabits.length ? storedHabits : mockData.habits;

    setSystems(nextSystems);
    setHabits(nextHabits);
    setSubHabitStatuses(storedSubStatuses);
    setTodayOrder(storedOrder.length ? storedOrder : nextHabits.map((habit) => habit.id));

    const initialSystem = nextSystems[0];
    setSelectedSystemId(initialSystem?.id || null);
    setSystemDraft(initialSystem || null);
    setHydrated(true);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    saveSystems(systems);
    saveHabits(habits);
    saveSubHabitStatuses(subHabitStatuses);
    saveTodayOrder(todayOrder);
  }, [systems, habits, subHabitStatuses, todayOrder, hydrated]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!hydrated) return;
    setTodayOrder((prev) => {
      const habitIds = habits.map((habit) => habit.id);
      const filtered = prev.filter((id) => habitIds.includes(id));
      const missing = habitIds.filter((id) => !filtered.includes(id));
      if (!missing.length && filtered.length === prev.length) return prev;
      return [...filtered, ...missing];
    });
  }, [habits, hydrated]);

  const currentSystem = systems.find((sys) => sys.id === selectedSystemId) || null;
  const currentHabits = habits.filter((habit) => habit.systemId === currentSystem?.id);

  // Sync draft when selection changes.
  useEffect(() => {
    setSystemDraft(currentSystem || null);
  }, [currentSystem]);

  const startNewSystem = () => {
    const draft = {
      id: generateId('system'),
      name: '',
      description: '',
      color: '#F97316',
      icon: '✨',
    };
    setSystemDraft(draft);
    setSelectedSystemId(draft.id);
  };

  const reorderSystems = (draggedId, targetId) => {
    setSystems((prev) => {
      const current = [...prev];
      const fromIndex = current.findIndex((s) => s.id === draggedId);
      const toIndex = current.findIndex((s) => s.id === targetId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const [moved] = current.splice(fromIndex, 1);
      current.splice(toIndex, 0, moved);
      return current;
    });
  };

  const saveSystem = () => {
    if (!systemDraft || !systemDraft.name.trim()) return;
    const exists = systems.some((sys) => sys.id === systemDraft.id);
    const next = exists
      ? systems.map((sys) => (sys.id === systemDraft.id ? systemDraft : sys))
      : [...systems, systemDraft];

    setSystems(next);
    setSelectedSystemId(systemDraft.id);
  };

  const deleteSystem = () => {
    if (!currentSystem) return;
    const nextSystems = systems.filter((sys) => sys.id !== currentSystem.id);
    const nextHabits = habits.filter((habit) => habit.systemId !== currentSystem.id);
    setSystems(nextSystems);
    setHabits(nextHabits);
    const fallback = nextSystems[0] || null;
    setSelectedSystemId(fallback?.id || null);
    setSystemDraft(fallback);
  };

  const cleanupSubHabitStatuses = (habitId, removedIds = []) => {
    if (!removedIds.length) return;
    setSubHabitStatuses((prev) => {
      const next = { ...prev };
      removedIds.forEach((id) => {
        delete next[id];
      });
      syncHabitStatusWithSubHabits(habitId, next);
      return next;
    });
  };

  const syncHabitStatusWithSubHabits = (habitId, nextStatuses) => {
    const date = todayString();
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const derived = getEffectiveHabitStatus(habit, date, nextStatuses);
        return {
          ...habit,
          status: derived,
          lastCompletedOn: derived === 'completed' ? date : habit.lastCompletedOn,
        };
      }),
    );
  };

  const upsertHabit = (habit) => {
    const previous = habits.find((h) => h.id === habit.id);
    const exists = Boolean(previous);
    const next = exists ? habits.map((h) => (h.id === habit.id ? habit : h)) : [...habits, habit];
    setHabits(next);

    if (previous?.subHabits?.length) {
      const newIds = new Set((habit.subHabits || []).map((sub) => sub.id));
      const removed = previous.subHabits.filter((sub) => !newIds.has(sub.id)).map((sub) => sub.id);
      cleanupSubHabitStatuses(habit.id, removed);
    }
  };

  const deleteHabit = (habitId) => {
    const habit = habits.find((h) => h.id === habitId);
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    if (habit?.subHabits) {
      const removedIds = habit.subHabits.map((sub) => sub.id);
      setSubHabitStatuses((prev) => {
        const next = { ...prev };
        removedIds.forEach((id) => delete next[id]);
        return next;
      });
    }
  };

  const handleSubHabitStatusChange = (habitId, subHabitId, status) => {
    setSubHabitStatuses((prev) => {
      const next = { ...prev };
      if (status === 'notStarted') {
        delete next[subHabitId];
      } else {
        next[subHabitId] = status;
      }
      syncHabitStatusWithSubHabits(habitId, next);
      return next;
    });
  };

  const todayHabits = useMemo(() => {
    const date = todayString();
    const todays = habits
      .filter((habit) => isHabitScheduledForDate(habit, date))
      .map((habit) => {
        const isCompletedToday = habit.status === 'completed' && habit.lastCompletedOn === date;
        return {
          habit,
          status: isCompletedToday ? 'completed' : 'notStarted',
        };
      });
    return todays.sort((a, b) => {
      const idxA = todayOrder.indexOf(a.habit.id);
      const idxB = todayOrder.indexOf(b.habit.id);
      if (idxA === -1 && idxB === -1) {
        return a.habit.name.localeCompare(b.habit.name);
      }
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }, [habits, todayOrder]);

  const statusMap = useMemo(() => {
    const date = todayString();
    return habits.reduce((acc, habit) => {
      acc[habit.id] = getEffectiveHabitStatus(habit, date, subHabitStatuses);
      return acc;
    }, {});
  }, [habits, subHabitStatuses]);

  const handleStatusChange = (habitId, status) => {
    const date = todayString();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    console.log('Status change', habitId, status);

    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              status,
              lastCompletedOn: status === 'completed' ? date : h.lastCompletedOn,
            }
          : h,
      ),
    );

    if (habit.subHabits?.length) {
      setSubHabitStatuses((prev) => {
        const next = { ...prev };
        habit.subHabits.forEach((sub) => {
          if (status === 'completed') {
            next[sub.id] = 'completed';
          } else if (status === 'notStarted') {
            delete next[sub.id];
          } else if (status === 'skipped') {
            next[sub.id] = 'skipped';
          }
        });
        syncHabitStatusWithSubHabits(habitId, next);
        return next;
      });
    }
  };

  const setManualTodayOrder = (orderedIds = []) => {
    setTodayOrder(() => {
      const habitIds = habits.map((habit) => habit.id);
      const filtered = orderedIds.filter((id) => habitIds.includes(id));
      const missing = habitIds.filter((id) => !filtered.includes(id));
      return [...filtered, ...missing];
    });
  };

  return (
    <div className={`app theme-${theme}`}>
      <header className="header">
        <div className="row spaced align-center top-bar">
          <p className="eyebrow brand">Routine OS</p>
          <div className="row gap-8 align-center">
            <div className="theme-toggle" role="group" aria-label="Theme toggle">
              <button
                type="button"
                className={`toggle icon-only ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <span className="icon">☾</span>
              </button>
              <button
                type="button"
                className={`toggle icon-only ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <span className="icon">☀︎</span>
              </button>
            </div>
            <div className="date-chip">{formatDisplayDate(new Date())}</div>
          </div>
        </div>
        <div className="title-block">
          <h1 className="hero-title section-title">RUN YOUR LIFE LIKE A SYSTEM</h1>
          <p className="muted hero-subtitle">
            Design elite routines, track what matters daily, and review your data like a pro.
          </p>
        </div>
      </header>

      <Tabs active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Today' && (
        <TodayView
          habitsForToday={todayHabits}
          systems={systems}
          subHabitStatuses={subHabitStatuses}
          onStatusChange={handleStatusChange}
          onSubHabitStatusChange={handleSubHabitStatusChange}
          onReorder={setManualTodayOrder}
        />
      )}

      {activeTab === 'Systems' && (
        <div className="stack md">
          <SystemsList
            systems={systems}
            selectedSystemId={selectedSystemId}
            onSelectSystem={setSelectedSystemId}
            onAddNew={startNewSystem}
            onReorder={reorderSystems}
          />
          <div className="grid split">
            <SystemEditor
              system={systemDraft}
              onChange={setSystemDraft}
              onSave={saveSystem}
              onDelete={deleteSystem}
              isNew={!systems.some((s) => s.id === systemDraft?.id)}
            />
            <div className="habits-wrapper">
              <HabitsTable
                system={systems.find((s) => s.id === selectedSystemId)}
                habits={currentHabits}
                onSaveHabit={upsertHabit}
                onDeleteHabit={deleteHabit}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Analytics' && <AnalyticsView systems={systems} habits={habits} statusMap={statusMap} />}

      <footer className="footer">Who you become is hidden in your daily actions.</footer>
    </div>
  );
}

export default App;
