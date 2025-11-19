// Component: habits for the selected system with simple inline editor.
import { useEffect, useState } from 'react';
import { PURPOSES, TIME_BLOCKS } from '../utils/analytics';
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
  purpose: PURPOSES[0],
  timeBlock: TIME_BLOCKS[0],
  frequency: { type: 'daily' },
  durationMinutes: 20,
  notes: '',
  startDate: todayString(),
});

const frequencyLabel = (frequency) => {
  if (!frequency) return 'Not set';
  if (frequency.type === 'daily') return 'Daily';
  if (frequency.type === 'daysOfWeek') {
    const labels = (frequency.daysOfWeek || []).sort().map((d) => DAYS.find((day) => day.value === d)?.label);
    return `Weekly: ${labels.join(', ')}`;
  }
  if (frequency.type === 'everyXDays') return `Every ${frequency.intervalDays || 0} days`;
  return 'Custom';
};

const HabitsTable = ({ system, habits, onSaveHabit, onDeleteHabit }) => {
  const [editing, setEditing] = useState(null);
  const [openNotesIds, setOpenNotesIds] = useState([]);

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
  const startEdit = (habit) => setEditing({ ...habit });

  const toggleDay = (value) => {
    const current = editing.frequency.daysOfWeek || [];
    const next = current.includes(value) ? current.filter((d) => d !== value) : [...current, value];
    setEditing({ ...editing, frequency: { ...editing.frequency, daysOfWeek: next } });
  };

  const save = () => {
    if (!editing.name.trim()) return;
    onSaveHabit({ ...editing, systemId: system.id });
    setEditing(null);
  };

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

      {editing && (
        <div className="card subtle">
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
            <label className="stack xs">
              <span className="label">Purpose</span>
              <select
                className="input"
                value={editing.purpose}
                onChange={(e) => setEditing({ ...editing, purpose: e.target.value })}
              >
                {PURPOSES.map((purpose) => (
                  <option key={purpose} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid three">
            <label className="stack xs">
              <span className="label">Time block</span>
              <select
                className="input"
                value={editing.timeBlock}
                onChange={(e) => setEditing({ ...editing, timeBlock: e.target.value })}
              >
                {TIME_BLOCKS.map((block) => (
                  <option key={block} value={block}>
                    {block}
                  </option>
                ))}
              </select>
            </label>
            <label className="stack xs">
              <span className="label">Frequency</span>
              <select
                className="input"
                value={editing.frequency.type}
                onChange={(e) => setEditing({ ...editing, frequency: { type: e.target.value } })}
              >
                <option value="daily">Daily</option>
                <option value="daysOfWeek">Days of week</option>
                <option value="everyXDays">Every X days</option>
              </select>
            </label>
            <label className="stack xs">
              <span className="label">Duration (min)</span>
              <input
                className="input"
                type="number"
                min="0"
                value={editing.durationMinutes}
                onChange={(e) => setEditing({ ...editing, durationMinutes: Number(e.target.value) || 0 })}
              />
            </label>
          </div>

          {editing.frequency.type === 'daysOfWeek' && (
            <div className="days-picker">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  className={`pill ${editing.frequency.daysOfWeek?.includes(day.value) ? 'active' : ''}`}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          )}

          {editing.frequency.type === 'everyXDays' && (
            <label className="stack xs">
              <span className="label">Repeat every</span>
              <input
                className="input"
                type="number"
                min="1"
                value={editing.frequency.intervalDays || 1}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    frequency: { ...editing.frequency, intervalDays: Number(e.target.value) || 1 },
                  })
                }
              />
              <span className="muted small">days</span>
            </label>
          )}

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

          <div className="row gap-8 wrap">
            <button type="button" className="btn-primary" onClick={save}>
              Save habit
            </button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="table">
        <div className="table-head">
          <div>Habit</div>
          <div>Purpose</div>
          <div>Frequency</div>
          <div>Duration</div>
          <div>Actions</div>
        </div>
        {habits.length === 0 && <div className="muted">No habits yet.</div>}
        {habits.map((habit) => {
          const showNotes = habit.notes && openNotesIds.includes(habit.id);
          return (
            <div key={habit.id} className="table-row notes-row">
              <div>
                <strong>{habit.name}</strong>
              </div>
              <div>{habit.purpose}</div>
              <div>{frequencyLabel(habit.frequency)}</div>
              <div>{habit.durationMinutes} min</div>
              <div className="row gap-6 wrap">
                {habit.notes && (
                  <button
                    type="button"
                    className="btn-ghost small-btn"
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
              {showNotes && <div className="notes-panel">{habit.notes}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HabitsTable;
