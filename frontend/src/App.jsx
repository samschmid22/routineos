// App shell: handles navigation, theming, persistence, and passes data to views.
import { useEffect, useMemo, useState } from 'react';
import AnalyticsView from './components/AnalyticsView';
import HabitsTable from './components/HabitsTable';
import { RoutineOsChat } from './components/RoutineOsChat';
import SystemEditor from './components/SystemEditor';
import SystemsList from './components/SystemsList';
import Tabs from './components/Tabs';
import TodayView from './components/TodayView';
import AuthPage from './components/AuthPage';
import { useAuth } from './context/AuthContext.jsx';
import { formatDisplayDate, isHabitScheduledForDate, todayString } from './utils/date';
import { getEffectiveHabitStatus, HABIT_STATUSES } from './utils/status';
import { loadTheme, loadSubHabitStatuses, loadTodayOrder, saveTheme } from './utils/storage';
import { supabase } from './lib/supabaseClient';
import './App.css';

const normalizeSystem = (system) => ({
  id: system.id,
  name: system.name,
  description: system.description || '',
  color: system.color || '#F97316',
  icon: system.icon || '✨',
  order_index: system.order_index ?? 0,
});

const normalizeHabit = (habit) => ({
  ...habit,
  systemId: habit.systemId ?? habit.system_id,
});

function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('Today');
  const [theme, setTheme] = useState('dark');

  const [systems, setSystems] = useState([]);
  const [habits, setHabits] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [subHabitStatuses, setSubHabitStatuses] = useState({});
  const [todayOrder, setTodayOrder] = useState([]);
  const [selectedSystemId, setSelectedSystemId] = useState(null);
  const [systemDraft, setSystemDraft] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Load theme + local-only state once.
  useEffect(() => {
    const storedTheme = loadTheme('dark');
    setTheme(storedTheme);
    const storedSubStatuses = loadSubHabitStatuses({});
    setSubHabitStatuses(storedSubStatuses);
    const storedOrder = loadTodayOrder([]);
    setTodayOrder(storedOrder);
  }, []);

  // Load systems & habits once on mount (no user filter for initial setup).
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoadingData(true);
      setDataError(null);

      const { data: systemsData, error: systemsError } = await supabase
        .from('systems')
        .select('*')
        .order('created_at', { ascending: true });

      const { data: habitsData, error: habitsError } = await supabase.from('habits').select('*');

      if (!isMounted) return;

      if (systemsError || habitsError) {
        console.error('Error loading data', systemsError || habitsError);
        setDataError(systemsError || habitsError);
        setIsLoadingData(false);
        setHydrated(true);
        return;
      }

      const normalizedSystems = (systemsData || []).map(normalizeSystem);
      const normalizedHabits = (habitsData || []).map(normalizeHabit);
      setSystems(normalizedSystems);
      setHabits(normalizedHabits);
      const initialSystem = normalizedSystems[0] || null;
      setSelectedSystemId(initialSystem?.id || null);
      setSystemDraft(initialSystem);
      setHydrated(true);
      setIsLoadingData(false);
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Auto-select the first available system if none is selected.
  useEffect(() => {
    if (!selectedSystemId && systems.length > 0) {
      setSelectedSystemId(systems[0].id);
    }
  }, [selectedSystemId, systems]);

  // Sync draft when selection changes.
  useEffect(() => {
    setSystemDraft(currentSystem || null);
  }, [currentSystem]);

  const createSystem = async (newSystemInput = {}) => {
    console.log('createSystem called with', newSystemInput);

    const payload = {
      user_id: null,
      name: newSystemInput.name || 'New system',
      color: newSystemInput.color || '#FF6347',
      icon: newSystemInput.icon || '★',
      order_index: systems.length,
    };

    console.log('createSystem payload:', payload);

    const { data, error } = await supabase.from('systems').insert([payload]).select().single();

    if (error) {
      console.error('Supabase insert error (systems):', error.message, error.details, error.hint);
      return;
    }

    console.log('Supabase insert success (systems):', data);

    const normalized = normalizeSystem(data);
    setSystems((prev) => [...prev, normalized]);
    setSelectedSystemId(normalized.id);
    setSystemDraft(normalized);
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
      const isCompletedToday = habit.status === 'completed' && habit.lastCompletedOn === date;
      acc[habit.id] = isCompletedToday ? 'completed' : 'notStarted';
      return acc;
    }, {});
  }, [habits]);

  const todayContext = useMemo(
    () => ({
      date: todayString(),
      habits: todayHabits.map(({ habit, status }) => ({
        id: habit.id,
        name: habit.name,
        systemId: habit.systemId,
        status,
      })),
      systems,
    }),
    [todayHabits, systems],
  );

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

  if (authLoading) {
    return <div className="auth-page-wrapper">Loading Routine OS...</div>;
  }

  if (!user) {
    return <AuthPage />;
  }

  if (isLoadingData || !hydrated) {
    return <div className="auth-page-wrapper">Loading your data...</div>;
  }
  if (dataError) {
    return <div className="auth-page-wrapper">Error loading data. Check console for details.</div>;
  }

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
            habits={habits}
            selectedSystemId={selectedSystemId}
            onSelectSystem={setSelectedSystemId}
            onCreateSystem={createSystem}
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

      <button className="floating-chat-button" type="button" onClick={() => setChatOpen(true)}>
        AI
      </button>
      {chatOpen && (
        <div className="ai-chat-overlay">
          <div className="floating-ai-wrapper">
            <RoutineOsChat
              todayContext={todayContext}
              title="ROUTINE OS COACH"
              placeholder="Ask Routine OS Coach about today"
              onClose={() => setChatOpen(false)}
              panelClassName="chat-panel-floating"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
