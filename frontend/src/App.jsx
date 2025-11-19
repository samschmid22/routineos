// App shell: handles navigation, theming, persistence, and passes data to views.
import { useEffect, useMemo, useState } from 'react';
import AnalyticsView from './components/AnalyticsView';
import HabitsTable from './components/HabitsTable';
import SystemEditor from './components/SystemEditor';
import SystemsList from './components/SystemsList';
import Tabs from './components/Tabs';
import TodayView from './components/TodayView';
import mockData from './mockData';
import { STATUSES } from './utils/analytics';
import { formatDisplayDate, isHabitScheduledForDate, todayString } from './utils/date';
import { generateId } from './utils/ids';
import {
  loadHabits,
  loadSystems,
  loadTheme,
  loadTodayState,
  saveHabits,
  saveSystems,
  saveTheme,
  saveTodayState,
} from './utils/storage';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('Today');
  const [theme, setTheme] = useState('dark');

  const [systems, setSystems] = useState([]);
  const [habits, setHabits] = useState([]);
  const [todayState, setTodayState] = useState({});
  const [selectedSystemId, setSelectedSystemId] = useState(null);
  const [systemDraft, setSystemDraft] = useState(null);

  // Hydrate state from localStorage or mock data once.
  useEffect(() => {
    const storedTheme = loadTheme('dark');
    setTheme(storedTheme);

    const storedSystems = loadSystems(mockData.systems);
    const storedHabits = loadHabits(mockData.habits);
    const storedToday = loadTodayState({});

    setSystems(storedSystems.length ? storedSystems : mockData.systems);
    setHabits(storedHabits.length ? storedHabits : mockData.habits);
    setTodayState(storedToday);

    const initialSystem = (storedSystems.length ? storedSystems : mockData.systems)[0];
    setSelectedSystemId(initialSystem?.id || null);
    setSystemDraft(initialSystem || null);
  }, []);

  // Persist on change.
  useEffect(() => {
    saveSystems(systems);
    saveHabits(habits);
    saveTodayState(todayState);
  }, [systems, habits, todayState]);

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
      .map((habit) => ({ habit, status: todayState[habit.id] || 'NotStarted' }));
  }, [habits, todayState]);

  const handleStatusChange = (habitId, status) => {
    if (!STATUSES.includes(status)) return;
    setTodayState((prev) => ({ ...prev, [habitId]: status }));
  };

  return (
    <div className={`app theme-${theme}`}>
      <header className="header">
        <div>
          <p className="eyebrow brand">Routine OS</p>
          <h1 className="hero-title">Operating system for your life</h1>
          <p className="muted hero-subtitle">
            Design elite routines, track what matters daily, and review your data like a pro.
          </p>
        </div>
        <div className="row gap-8 align-center">
          <div className="theme-toggle" role="group" aria-label="Theme toggle">
            <button
              type="button"
              className={`toggle icon-only ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              <span className="icon">🌙</span>
            </button>
            <button
              type="button"
              className={`toggle icon-only ${theme === 'light' ? 'active' : ''}`}
              onClick={() => setTheme('light')}
            >
              <span className="icon">☀️</span>
            </button>
          </div>
          <div className="date-chip">{formatDisplayDate(new Date())}</div>
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
          <div className="grid two">
            <SystemEditor
              system={systemDraft}
              onChange={setSystemDraft}
              onSave={saveSystem}
              onDelete={deleteSystem}
              isNew={!systems.some((s) => s.id === systemDraft?.id)}
            />
            <HabitsTable
              system={systems.find((s) => s.id === selectedSystemId)}
              habits={currentHabits}
              onSaveHabit={upsertHabit}
              onDeleteHabit={deleteHabit}
            />
          </div>
        </div>
      )}

      {activeTab === 'Analytics' && <AnalyticsView systems={systems} habits={habits} todayState={todayState} />}
    </div>
  );
}

export default App;
