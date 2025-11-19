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
  saveHabits,
  saveSystems,
  saveTheme,
} from './utils/storage';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Today');
  const [theme, setTheme] = useState('dark');

  const [systems, setSystems] = useState([]);
  const [habits, setHabits] = useState([]);
  const [selectedSystemId, setSelectedSystemId] = useState(null);
  const [systemDraft, setSystemDraft] = useState(null);

  // Hydrate state from localStorage or mock data once.
  useEffect(() => {
    const storedTheme = loadTheme('dark');
    setTheme(storedTheme);

    const storedSystems = loadSystems(mockData.systems);
    const storedHabits = loadHabits(mockData.habits);

    setSystems(storedSystems.length ? storedSystems : mockData.systems);
    setHabits(storedHabits.length ? storedHabits : mockData.habits);

    const initialSystem = (storedSystems.length ? storedSystems : mockData.systems)[0];
    setSelectedSystemId(initialSystem?.id || null);
    setSystemDraft(initialSystem || null);
  }, []);

  // Persist on change.
  useEffect(() => {
    saveSystems(systems);
    saveHabits(habits);
  }, [systems, habits]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

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

  const upsertHabit = (habit) => {
    const exists = habits.some((h) => h.id === habit.id);
    const next = exists ? habits.map((h) => (h.id === habit.id ? habit : h)) : [...habits, habit];
    setHabits(next);
  };

  const deleteHabit = (habitId) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setTodayState((prev) => {
      const next = { ...prev };
      delete next[habitId];
      return next;
    });
  };

  const todayHabits = useMemo(() => {
    const date = todayString();
    return habits
      .filter((habit) => isHabitScheduledForDate(habit, date))
      .map((habit) => ({
        habit,
        status: getEffectiveHabitStatus(habit, date),
      }));
  }, [habits]);

  const statusMap = useMemo(() => {
    const date = todayString();
    return habits.reduce((acc, habit) => {
      acc[habit.id] = getEffectiveHabitStatus(habit, date);
      return acc;
    }, {});
  }, [habits]);

  const handleStatusChange = (habitId, status) => {
    if (!HABIT_STATUSES.includes(status)) return;
    const date = todayString();
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              status,
              lastCompletedOn: status === 'completed' ? date : habit.lastCompletedOn,
            }
          : habit,
      ),
    );
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
        <TodayView habitsForToday={todayHabits} systems={systems} onStatusChange={handleStatusChange} />
      )}

      {activeTab === 'Systems' && (
        <div className="stack md">
          <SystemsList
            systems={systems}
            selectedSystemId={selectedSystemId}
            onSelectSystem={setSelectedSystemId}
            onAddNew={startNewSystem}
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
