// Component: renders today's habits, allowing expandable sub-habit checklists that inherit status.
import { useState } from 'react';
import { HABIT_STATUSES } from '../utils/status';

const StatusSelect = ({ current, onChange, compact = false }) => {
  const labelMap = {
    notStarted: 'Not started',
    ongoing: 'Ongoing',
    completed: 'Completed',
    skipped: 'Skipped',
  };
  return (
    <select
      className={`input status-select ${compact ? 'compact' : 'wide'}`}
      value={current}
      onChange={(e) => onChange(e.target.value)}
    >
      {HABIT_STATUSES.map((status) => (
        <option key={status} value={status}>
          {labelMap[status] || status}
        </option>
      ))}
    </select>
  );
};

const TodayView = ({ habitsForToday, systems, subHabitStatuses, onStatusChange, onSubHabitStatusChange }) => {
  const [openDetails, setOpenDetails] = useState([]);
  const [expandedHabits, setExpandedHabits] = useState([]);
  const systemMap = systems.reduce((acc, system) => ({ ...acc, [system.id]: system }), {});
  const sorted = [...habitsForToday].sort((a, b) => a.habit.name.localeCompare(b.habit.name));

  const toggleSubHabits = (habitId) => {
    setExpandedHabits((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId],
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Today</p>
          <h2 className="section-title">Habits</h2>
        </div>
      </div>
      {sorted.length === 0 && <div className="muted">No habits scheduled for today.</div>}
      <div className="stack md">
        {sorted.map(({ habit, status }) => {
          const hasSubHabits = Array.isArray(habit.subHabits) && habit.subHabits.length > 0;
          const isExpanded = expandedHabits.includes(habit.id);
          return (
            <div key={habit.id} className="card subtle hoverable habit-wide">
              <div className="row spaced align-start">
                <div className="stack xs">
                  <h3>{habit.name}</h3>
                  <div className="row gap-8 wrap">
                    <span className="pill ghost">
                      <span className="system-dot tiny" style={{ background: systemMap[habit.systemId]?.color }} />
                      {systemMap[habit.systemId]?.name || 'System'}
                    </span>
                    {hasSubHabits && <span className="pill ghost checklist-pill">Sub-habits</span>}
                  </div>
                </div>
                <div className="row gap-8 align-center">
                  <StatusSelect current={status} onChange={(newStatus) => onStatusChange(habit.id, newStatus)} />
                  {habit.notes && (
                    <button
                      type="button"
                      className="btn-primary small-btn"
                      onClick={() =>
                        setOpenDetails((prev) =>
                          prev.includes(habit.id) ? prev.filter((id) => id !== habit.id) : [...prev, habit.id],
                        )
                      }
                    >
                      {openDetails.includes(habit.id) ? 'Hide details' : 'Details'}
                    </button>
                  )}
                </div>
              </div>
              {openDetails.includes(habit.id) && habit.notes && <p className="muted small">{habit.notes}</p>}
              {hasSubHabits && (
                <button type="button" className="subhabits-toggle" onClick={() => toggleSubHabits(habit.id)}>
                  <span>{isExpanded ? 'Hide sub-habits' : 'Show sub-habits'}</span>
                  <span className={`chevron ${isExpanded ? 'open' : ''}`}>⌄</span>
                </button>
              )}
              {hasSubHabits && (
                <div
                  className={`subhabits-panel ${isExpanded ? 'open' : ''}`}
                  style={{ maxHeight: isExpanded ? `${habit.subHabits.length * 120 + 40}px` : 0 }}
                >
                  {habit.subHabits.map((sub) => (
                    <div key={sub.id} className="subhabit-row">
                      <div className="subhabit-info">
                        <strong>{sub.name}</strong>
                        {sub.notes && <p className="muted small">{sub.notes}</p>}
                      </div>
                      <StatusSelect
                        compact
                        current={subHabitStatuses[sub.id] || 'notStarted'}
                        onChange={(newStatus) => onSubHabitStatusChange(habit.id, sub.id, newStatus)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodayView;
