// Component: renders today's habits, allowing expandable sub-habit checklists that inherit status.
import { useState } from 'react';

const TodayView = ({
  habitsForToday,
  systems,
  subHabitStatuses,
  onStatusChange,
  onSubHabitStatusChange,
  onReorder = () => {},
}) => {
  console.count('TodayView render');
  const [openDetails, setOpenDetails] = useState([]);
  const [expandedHabits, setExpandedHabits] = useState([]);

  const systemMap = systems.reduce((acc, system) => ({ ...acc, [system.id]: system }), {});

  const toggleSubHabits = (habitId) => {
    setExpandedHabits((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId],
    );
  };

  const moveHabit = (habitId, direction) => {
    const orderedIds = habitsForToday.map(({ habit }) => habit.id);
    const index = orderedIds.indexOf(habitId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedIds.length) return;
    const next = [...orderedIds];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    console.log('moveHabit', { habitId, direction, next });
    onReorder(next);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Today</p>
          <h2 className="section-title">Habits</h2>
        </div>
      </div>
      {habitsForToday.length === 0 && <div className="muted">No habits scheduled for today.</div>}
      <div className="stack md today-list">
        {habitsForToday.map(({ habit, status }) => {
          const hasSubHabits = Array.isArray(habit.subHabits) && habit.subHabits.length > 0;
          const isExpanded = expandedHabits.includes(habit.id);
          return (
            <div key={habit.id} className="card subtle hoverable habit-wide today-habit">
              <div className="row spaced align-start habit-row">
                <div className="row gap-12 align-start habit-left">
                  <div className="reorder-buttons">
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => moveHabit(habit.id, 'up')}
                      disabled={habitsForToday[0]?.habit.id === habit.id}
                      aria-label="Move habit up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => moveHabit(habit.id, 'down')}
                      disabled={habitsForToday[habitsForToday.length - 1]?.habit.id === habit.id}
                      aria-label="Move habit down"
                    >
                      ↓
                    </button>
                  </div>
                  <div className="stack xs">
                    <div className="row gap-6 align-center">
                      <h3>{habit.name}</h3>
                      {hasSubHabits && <span className="checklist-indicator" aria-hidden="true">☑</span>}
                    </div>
                    <div className="row gap-8 wrap">
                      <span className="pill ghost">
                        <span className="system-dot tiny" style={{ background: systemMap[habit.systemId]?.color }} />
                        {systemMap[habit.systemId]?.name || 'System'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="row gap-10 align-center habit-actions">
                  <select
                    className="input status-basic"
                    value={status === 'completed' ? 'completed' : 'notStarted'}
                    onChange={(event) => onStatusChange(habit.id, event.target.value)}
                  >
                    <option value="notStarted">Not completed</option>
                    <option value="completed">Completed</option>
                  </select>
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
                <div className="habit-footer">
                  <button type="button" className="subhabits-toggle" onClick={() => toggleSubHabits(habit.id)}>
                    <span>{isExpanded ? 'Hide sub-habits' : 'Show sub-habits'}</span>
                    <span className={`chevron ${isExpanded ? 'open' : ''}`}>⌄</span>
                  </button>
                </div>
              )}

              {hasSubHabits && isExpanded && (
                <div className="subhabits-panel static">
                  {habit.subHabits.map((sub) => {
                    const rawSubStatus = subHabitStatuses[sub.id] || 'notStarted';
                    const subStatus = rawSubStatus === 'completed' ? 'completed' : 'notStarted';
                    return (
                      <div key={sub.id} className="subhabit-row">
                        <div className="subhabit-info">
                          <strong>{sub.name}</strong>
                        </div>
                        <div className="row gap-8 align-center">
                          <select
                            className="input status-basic compact"
                            value={subStatus}
                            onChange={(event) => onSubHabitStatusChange(habit.id, sub.id, event.target.value)}
                          >
                            <option value="notStarted">Not completed</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
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
