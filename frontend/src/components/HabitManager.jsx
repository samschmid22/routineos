import { useMemo, useState } from 'react';
import {
  PURPOSES,
  TIME_BLOCKS,
  formatDate,
  generateId,
} from '../utils/routine';

const DAYS = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const HabitManager = ({ systems, habits, onAddHabit }) => {
  const [systemId, setSystemId] = useState('');
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [frequencyType, setFrequencyType] = useState('daily');
  const [selectedDays, setSelectedDays] = useState([]);
  const [intervalDays, setIntervalDays] = useState(2);
  const [timeBlock, setTimeBlock] = useState(TIME_BLOCKS[0]);
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [notes, setNotes] = useState('');

  const systemMap = useMemo(
    () => systems.reduce((acc, system) => ({ ...acc, [system.id]: system.name }), {}),
    [systems],
  );

  const resetForm = () => {
    setName('');
    setPurpose(PURPOSES[0]);
    setFrequencyType('daily');
    setSelectedDays([]);
    setIntervalDays(2);
    setTimeBlock(TIME_BLOCKS[0]);
    setDurationMinutes(20);
    setNotes('');
  };

  const toggleDay = (value) => {
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!systemId || !name.trim()) return;

    const habit = {
      id: generateId('habit'),
      systemId,
      name: name.trim(),
      purpose,
      frequencyType,
      daysOfWeek: frequencyType === 'daysOfWeek' ? selectedDays : [],
      intervalDays: frequencyType === 'interval' ? Number(intervalDays) || 0 : 0,
      preferredTimeBlock: timeBlock,
      durationMinutes: Number(durationMinutes) || 0,
      notes: notes.trim(),
      startDate: formatDate(new Date()),
    };

    onAddHabit(habit);
    resetForm();
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Habits</p>
          <h2 className="panel-title">Attach habits to systems</h2>
        </div>
      </div>
      <form className="stack sm" onSubmit={handleSubmit}>
        <div className="grid two">
          <label className="stack xs">
            <span className="label">System</span>
            <select
              className="text-input"
              value={systemId}
              onChange={(e) => setSystemId(e.target.value)}
            >
              <option value="">Select a system</option>
              {systems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>
          </label>
          <label className="stack xs">
            <span className="label">Purpose</span>
            <select
              className="text-input"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              {PURPOSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="stack xs">
          <span className="label">Habit name</span>
          <input
            className="text-input"
            placeholder="e.g., Vitamins, Gym, Read 10 pages"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <div className="grid three">
          <label className="stack xs">
            <span className="label">Frequency</span>
            <select
              className="text-input"
              value={frequencyType}
              onChange={(e) => setFrequencyType(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="daysOfWeek">Days of week</option>
              <option value="interval">Every X days</option>
            </select>
          </label>
          <label className="stack xs">
            <span className="label">Preferred block</span>
            <select
              className="text-input"
              value={timeBlock}
              onChange={(e) => setTimeBlock(e.target.value)}
            >
              {TIME_BLOCKS.map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </label>
          <label className="stack xs">
            <span className="label">Duration (min)</span>
            <input
              className="text-input"
              type="number"
              min="0"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </label>
        </div>

        {frequencyType === 'daysOfWeek' && (
          <div className="days-picker">
            {DAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                className={`pill ${selectedDays.includes(day.value) ? 'active' : ''}`}
                onClick={() => toggleDay(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>
        )}

        {frequencyType === 'interval' && (
          <label className="stack xs">
            <span className="label">Repeat every</span>
            <input
              className="text-input"
              type="number"
              min="1"
              value={intervalDays}
              onChange={(e) => setIntervalDays(e.target.value)}
            />
            <span className="muted">days</span>
          </label>
        )}

        <label className="stack xs">
          <span className="label">Notes</span>
          <textarea
            className="text-input"
            rows={2}
            placeholder="Purpose, instructions, links..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>

        <button type="submit" className="primary">
          Add habit
        </button>
      </form>

      <div className="table">
        <div className="table-head">
          <div>Habit</div>
          <div>System</div>
          <div>Purpose</div>
          <div>Block</div>
          <div>Frequency</div>
        </div>
        {habits.length === 0 && <div className="muted">No habits yet.</div>}
        {habits.map((habit) => (
          <div key={habit.id} className="table-row">
            <div>
              <strong>{habit.name}</strong>
              {habit.notes && <div className="muted small">{habit.notes}</div>}
            </div>
            <div>{systemMap[habit.systemId] || 'Unknown'}</div>
            <div>{habit.purpose}</div>
            <div>{habit.preferredTimeBlock}</div>
            <div>
              {habit.frequencyType === 'daily' && 'Daily'}
              {habit.frequencyType === 'daysOfWeek' &&
                `Weekly: ${habit.daysOfWeek
                  .sort()
                  .map((d) => DAYS.find((day) => day.value === d)?.label)
                  .join(', ')}`}
              {habit.frequencyType === 'interval' &&
                `Every ${habit.intervalDays || 0} day${habit.intervalDays === 1 ? '' : 's'}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitManager;
