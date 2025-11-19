// Component: habits for the selected system with simple inline editor.
import { useEffect, useState } from 'react';
import { generateId } from '../utils/ids';
import { todayString } from '../utils/date';

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
});

const frequencyLabel = (frequency) => {
  if (!frequency) return 'Not set';
  if (frequency.type === 'daily') return 'Daily';
  if (frequency.type === 'daysOfWeek') {
    const labels = (frequency.daysOfWeek || [])
      .sort()
      .map((d) => DAYS.find((day) => day.value === d)?.label)
      .filter(Boolean);
    return labels.join(' ');
  }
  if (frequency.type === 'everyOtherDay') return 'Every 2 days';
  return 'Custom';
};

const HabitsTable = ({ system, habits, onSaveHabit, onDeleteHabit }) => {
  const [editing, setEditing] = useState(null);
  const [openNotesIds, setOpenNotesIds] = useState([]);

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
          <select
            className="input"
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
            <option value="daily">Daily</option>
            <option value="everyOtherDay">Every other day</option>
            <option value="daysOfWeek">Days of week</option>
          </select>
        </label>
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

  if (!system) {
    return (
      <div className="card">
        <p className="muted">Select a system to see its habits.</p>
      </div>
    );
  }

  const startNew = () => setEditing(emptyHabit(system.id));
  const startEdit = (habit) =>
    setEditing({
      ...habit,
      frequency: {
        type: habit.frequency?.type || habit.frequencyType || 'daily',
        daysOfWeek: habit.frequency?.daysOfWeek || habit.daysOfWeek || [],
      },
    });

  const toggleDay = (value) => {
    const current = editing.frequency.daysOfWeek || [];
    const next = current.includes(value) ? current.filter((d) => d !== value) : [...current, value];
    setEditing({ ...editing, frequency: { ...editing.frequency, daysOfWeek: next } });
  };

  const save = () => {
    if (!editing.name.trim()) return;
    onSaveHabit({
      ...editing,
      systemId: system.id,
      frequencyType: editing.frequency.type,
      daysOfWeek: editing.frequency.daysOfWeek || [],
      purpose: undefined,
    });
    setEditing(null);
  };

  const isNewDraft = editing && !habits.some((h) => h.id === editing.id);

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
        {habits.length === 0 && <div className="muted">No habits yet.</div>}
        {habits.map((habit) => {
          const showNotes = habit.notes && openNotesIds.includes(habit.id);
          const isEditing = editing && editing.id === habit.id;
          return (
            <div key={habit.id} className="table-row notes-row">
              <div>
                <strong>{habit.name}</strong>
              </div>
              <div className="muted small freq-text">{frequencyLabel(habit.frequency)}</div>
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
