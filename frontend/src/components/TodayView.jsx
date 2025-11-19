// Component: renders today's habits, allowing expandable sub-habit checklists that inherit status.
import { useEffect, useRef, useState } from 'react';
import { HABIT_STATUSES } from '../utils/status';

const STATUS_LABELS = {
  notStarted: 'Not started',
  ongoing: 'Ongoing',
  completed: 'Completed',
  skipped: 'Skipped',
};

const StatusSelect = ({ current, onChange, size = 'wide' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleSelect = (value) => {
    onChange(value);
    setOpen(false);
  };

  return (
    <div className={`status-dropdown ${size}`} ref={ref}>
      <button type="button" className="status-trigger" onClick={() => setOpen((prev) => !prev)}>
        <span>{STATUS_LABELS[current] || current}</span>
        <span className="caret">▾</span>
      </button>
      {open && (
        <div className="status-menu">
          {HABIT_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              className={current === status ? 'active' : ''}
              onClick={() => handleSelect(status)}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const StatusCheckbox = ({ status, onToggle }) => (
  <button
    type="button"
    className={`status-checkbox ${status === 'completed' ? 'checked' : ''}`}
    onClick={onToggle}
    aria-pressed={status === 'completed'}
  >
    {status === 'completed' && <span className="checkmark">✓</span>}
  </button>
);

const TodayView = ({
  habitsForToday,
  systems,
  subHabitStatuses,
  onStatusChange,
  onSubHabitStatusChange,
  onReorder = () => {},
}) => {
  const [openDetails, setOpenDetails] = useState([]);
  const [expandedHabits, setExpandedHabits] = useState([]);
  const [draggingId, setDraggingId] = useState(null);

  const systemMap = systems.reduce((acc, system) => ({ ...acc, [system.id]: system }), {});

  const toggleSubHabits = (habitId) => {
    setExpandedHabits((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId],
    );
  };

  const handleHabitCheckbox = (habitId, currentStatus) => {
    onStatusChange(habitId, currentStatus === 'completed' ? 'notStarted' : 'completed');
  };

  const handleSubHabitCheckbox = (habitId, subHabitId, currentStatus) => {
    onSubHabitStatusChange(habitId, subHabitId, currentStatus === 'completed' ? 'notStarted' : 'completed');
  };

  const handleDragStart = (event, habitId) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', habitId);
    setDraggingId(habitId);
  };

  const handleDrop = (event, targetId) => {
    event.preventDefault();
    const dragged = event.dataTransfer.getData('text/plain') || draggingId;
    if (dragged && dragged !== targetId) {
      onReorder(dragged, targetId);
    }
    setDraggingId(null);
  };

  const handleListDrop = (event) => {
    event.preventDefault();
    const dragged = event.dataTransfer.getData('text/plain') || draggingId;
    if (dragged) {
      onReorder(dragged, null);
    }
    setDraggingId(null);
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
      <div
        className="stack md today-list"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleListDrop}
      >
        {habitsForToday.map(({ habit, status }) => {
          const hasSubHabits = Array.isArray(habit.subHabits) && habit.subHabits.length > 0;
          const isExpanded = expandedHabits.includes(habit.id);
          const subPanelHeight = hasSubHabits ? habit.subHabits.length * 76 + 40 : 0;

          return (
            <div
              key={habit.id}
              className={`card subtle hoverable habit-wide today-habit ${draggingId === habit.id ? 'dragging' : ''}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, habit.id)}
            >
              <div className="row spaced align-start habit-row">
                <div className="row gap-12 align-start habit-left">
                  <button
                    type="button"
                    className="drag-handle"
                    draggable
                    onDragStart={(event) => handleDragStart(event, habit.id)}
                    onDragEnd={() => setDraggingId(null)}
                    aria-label="Reorder habit"
                  >
                    ⠿
                  </button>
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
                  <StatusSelect current={status} onChange={(newStatus) => onStatusChange(habit.id, newStatus)} />
                  <StatusCheckbox status={status} onToggle={() => handleHabitCheckbox(habit.id, status)} />
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

              {hasSubHabits && (
                <div
                  className={`subhabits-panel ${isExpanded ? 'open' : ''}`}
                  style={{ maxHeight: isExpanded ? `${subPanelHeight}px` : 0 }}
                >
                  {habit.subHabits.map((sub) => {
                    const subStatus = subHabitStatuses[sub.id] || 'notStarted';
                    return (
                      <div key={sub.id} className="subhabit-row">
                        <div className="subhabit-info">
                          <strong>{sub.name}</strong>
                        </div>
                        <div className="row gap-8 align-center">
                          <StatusSelect
                            size="compact"
                            current={subStatus}
                            onChange={(newStatus) => onSubHabitStatusChange(habit.id, sub.id, newStatus)}
                          />
                          <StatusCheckbox
                            status={subStatus}
                            onToggle={() => handleSubHabitCheckbox(habit.id, sub.id, subStatus)}
                          />
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
