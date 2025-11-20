// Component: habits for the selected system with simple inline editor.
import { useEffect, useState } from 'react';
import { generateId } from '../utils/ids';
import { todayString } from '../utils/date';
import SubHabitsEditor from './SubHabitsEditor';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext.jsx';

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const emptyHabit = (systemId) => ({
  id: generateId('habit'),
  systemId,
  name: '',
  frequency: { type: 'daily', daysOfWeek: [] },
  durationMinutes: 20,
  notes: '',
  startDate: todayString(),
  status: 'notStarted',
  lastCompletedOn: null,
  subHabits: [],
});

const frequencyLabel = (frequency, fallbackType, fallbackDays = []) => {
  if (!frequency && !fallbackType) return 'Not set';
  const type = typeof frequency === 'string' ? frequency : frequency?.type || fallbackType || '';
  const days =
    (typeof frequency === 'object' && Array.isArray(frequency.daysOfWeek) && frequency.daysOfWeek) || fallbackDays || [];
  if (type === 'daily') return 'Every day';
  if (type === 'everyOtherDay' || type === 'every_other_day' || type === 'every_other') return 'Every other day';
  if (type === 'daysOfWeek' || type === 'days_of_week') {
    const labels = days
      .sort()
      .map((d) => DAYS.find((day) => day.value === d)?.label)
      .filter(Boolean);
    return labels.length ? labels.join(' ') : 'Specific days';
  }
  if (type === 'weekly') return 'Weekly';
  if (type === 'monthly') return 'Monthly';
  return type ? type : 'Custom';
};

const HabitsTable = ({ system, habits, onSaveHabit, onDeleteHabit }) => {
  const [editing, setEditing] = useState(null);
  const [openNotesIds, setOpenNotesIds] = useState([]);
  const { user } = useAuth();

  const renderForm = () => (
    <div className="card subtle row-editor">
      <div className="grid two">
        <label className="stack xs">
          <span className="label">Name</span>
          <input
            className="input"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            placeholder="Gym"
          />
        </label>
      </div>

      <div className="grid two">
        <label className="stack xs">
          <span className="label">Frequency</span>
          <div className="select-shell">
            <select
              className="input select-input"
              value={editing.frequency.type}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  frequency: {
                    type: e.target.value,
                    daysOfWeek: editing.frequency.daysOfWeek || [],
                  },
                })
              }
            >
              <option value="daily">Every day</option>
              <option value="everyOtherDay">Every other day</option>
              <option value="daysOfWeek">Specific days of the week</option>
            </select>
            <span className="select-caret" aria-hidden="true">
              ⌄
            </span>
          </div>
        </label>
        <div />
      </div>

      {editing.frequency.type === 'daysOfWeek' && (
        <div className="days-picker">
          {DAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              className={`pill day-chip ${editing.frequency.daysOfWeek?.includes(day.value) ? 'active' : ''}`}
              onClick={() => toggleDay(day.value)}
            >
              {day.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid two">
        <label className="stack xs">
          <span className="label">Duration (min)</span>
          <input
            className="input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={editing.durationMinutes}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^0-9]/g, '');
              setEditing({ ...editing, durationMinutes: Number(digits) || 0 });
            }}
          />
        </label>
        <div />
      </div>

      <div className="grid two">
        <label className="stack xs">
          <span className="label">Notes</span>
          <textarea
            className="input"
            rows={2}
            value={editing.notes}
            onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
            placeholder="What does good look like?"
          />
        </label>
        <div />{/* spacer to balance the grid */}
      </div>

      <SubHabitsEditor
        value={editing.subHabits || []}
        onChange={(list) => setEditing({ ...editing, subHabits: list })}
      />

      <div className="row gap-8 wrap">
        <button type="button" className="btn-primary" onClick={save}>
          Save habit
        </button>
        <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
          Cancel
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    setEditing(null);
    setOpenNotesIds([]);
  }, [system?.id]);

  const currentHabits = habits;

  if (!system) {
    return (
      <div className="card">
        <p className="muted">Select a system to see its habits.</p>
      </div>
    );
  }

  const startNew = () => setEditing(emptyHabit(system.id));
  const startEdit = (habit) => {
    setEditing({
      id: habit.id,
      systemId: habit.systemId || habit.system_id || system.id,
      name: habit.name || '',
      notes: habit.notes ?? habit.description ?? '',
      status: habit.status || 'notStarted',
      durationMinutes: habit.durationMinutes ?? habit.duration_minutes ?? 0,
      frequency: {
        type:
          (typeof habit.frequency === 'string' && habit.frequency) ||
          habit.frequency?.type ||
          habit.frequencyType ||
          habit.frequency_type ||
          'daily',
        daysOfWeek:
          (typeof habit.frequency === 'object' && habit.frequency?.daysOfWeek) ||
          habit.daysOfWeek ||
          habit.days_of_week ||
          [],
      },
      startDate: habit.startDate || habit.start_date || todayString(),
      subHabits: habit.subHabits || [],
    });
  };

  const toggleDay = (value) => {
    const current = editing.frequency.daysOfWeek || [];
    const next = current.includes(value) ? current.filter((d) => d !== value) : [...current, value];
    setEditing({ ...editing, frequency: { ...editing.frequency, daysOfWeek: next } });
  };

  const save = async () => {
    if (!editing?.name?.trim()) return;
    const frequencyValue = editing.frequency?.type || editing.frequencyType || 'daily';
    const daysOfWeekValue = editing.frequency?.daysOfWeek || editing.daysOfWeek || [];
    const durationValue = Number(editing.durationMinutes) || 0;

    if (isNewDraft && user) {
      const insertPayload = {
        user_id: user.id,
        system_id: system.id,
        name: editing.name,
        description: editing.notes || null,
        frequency: frequencyValue,
        frequency_type: frequencyValue,
        days_of_week: daysOfWeekValue,
        duration_minutes: durationValue,
        status: editing.status || 'notStarted',
        order_index: currentHabits.length,
      };

      const { data, error } = await supabase.from('habits').insert([insertPayload]).select().single();

      if (error) {
        console.error('Supabase insert error (habits):', error.message, error.details, error.hint);
        return;
      }

      const normalized = {
        ...data,
        systemId: data.systemId ?? data.system_id,
        durationMinutes: data.durationMinutes ?? data.duration_minutes ?? editing.durationMinutes,
      };
      onSaveHabit(normalized);
      setEditing(null);
      return;
    }

    const updatePayload = {
      name: editing.name,
      description: editing.notes || null,
      frequency: frequencyValue,
      frequency_type: frequencyValue,
      days_of_week: daysOfWeekValue,
      duration_minutes: durationValue,
      status: editing.status || 'notStarted',
    };

    const { data, error } = await supabase.from('habits').update(updatePayload).eq('id', editing.id).select().single();

    if (error) {
      console.error('Supabase update error (habits):', error.message, error.details, error.hint);
      return;
    }

    const normalized = {
      ...data,
      systemId: data.systemId ?? data.system_id,
      durationMinutes: data.durationMinutes ?? data.duration_minutes ?? editing.durationMinutes,
    };
    onSaveHabit(normalized);
    setEditing(null);
  };

  const isNewDraft = editing && !currentHabits.some((h) => h.id === editing.id);

  return (
    <div className="card">
      <div className="card-header row spaced align-center">
        <div>
          <p className="eyebrow">Habits</p>
          <h2>{system.name}</h2>
        </div>
        <button type="button" className="btn-primary" onClick={startNew}>
          + Add habit
        </button>
      </div>

      {isNewDraft && renderForm()}

      <div className="table">
        <div className="table-head">
          <div>Habit</div>
          <div>Frequency</div>
          <div>Duration</div>
        </div>
        {currentHabits.length === 0 && <div className="muted">No habits yet.</div>}
        {currentHabits.map((habit) => {
          const showNotes = habit.notes && openNotesIds.includes(habit.id);
          const isEditing = editing && editing.id === habit.id;
          return (
            <div key={habit.id} className="table-row notes-row">
              <div>
                <strong>{habit.name}</strong>
              </div>
              <div className="muted small freq-text">
                {frequencyLabel(habit.frequency, habit.frequencyType, habit.daysOfWeek)}
              </div>
              <div>{habit.durationMinutes} min</div>
              <div className="row gap-6 wrap actions-row">
                <div className="row gap-6">
                  {habit.notes && (
                    <button
                      type="button"
                      className="btn-primary small-btn"
                      onClick={() =>
                        setOpenNotesIds((prev) =>
                          prev.includes(habit.id) ? prev.filter((id) => id !== habit.id) : [...prev, habit.id],
                        )
                      }
                    >
                      {showNotes ? 'Hide details' : 'Details'}
                    </button>
                  )}
                  <button type="button" className="btn-ghost small-btn" onClick={() => startEdit(habit)}>
                    Edit
                  </button>
                  <button type="button" className="btn-ghost danger small-btn" onClick={() => onDeleteHabit(habit.id)}>
                    Delete
                  </button>
                </div>
              </div>
              {isEditing && renderForm()}
              {showNotes && <div className="notes-panel">{habit.notes}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitsTable;
