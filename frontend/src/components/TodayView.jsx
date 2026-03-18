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
  const [openDetails, setOpenDetails] = useState([]);
  const [expandedHabits, setExpandedHabits] = useState([]);
  const [draggedHabitId, setDraggedHabitId] = useState(null);
  const [dragOverHabitId, setDragOverHabitId] = useState(null);

  const systemMap = systems.reduce((acc, system) => ({ ...acc, [system.id]: system }), {});

  const toggleSubHabits = (habitId) => {
    setExpandedHabits((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId],
    );
  };

  const reorderHabits = (draggedId, targetId) => {
    if (!draggedId || !targetId || draggedId === targetId) return;
    const orderedIds = habitsForToday.map(({ habit }) => habit.id);
    if (!orderedIds.includes(draggedId) || !orderedIds.includes(targetId)) return;

    const next = orderedIds.filter((id) => id !== draggedId);
    const targetIndex = next.indexOf(targetId);
    next.splice(targetIndex, 0, draggedId);
    onReorder(next);
  };

  const handleDragStart = (event, habitId) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', habitId);
    setDraggedHabitId(habitId);
    setDragOverHabitId(habitId);
  };

  const handleDragOver = (event, habitId) => {
    if (!draggedHabitId || draggedHabitId === habitId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverHabitId(habitId);
  };

  const handleDrop = (event, targetHabitId) => {
    event.preventDefault();
    const droppedHabitId = event.dataTransfer.getData('text/plain') || draggedHabitId;
    reorderHabits(droppedHabitId, targetHabitId);
    setDraggedHabitId(null);
    setDragOverHabitId(null);
  };

  const handleDragEnd = () => {
    setDraggedHabitId(null);
    setDragOverHabitId(null);
  };

  return (
    <div className="card today-view-shell">
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
            <div
              key={habit.id}
              className={`card subtle hoverable habit-wide today-habit ${
                dragOverHabitId === habit.id && draggedHabitId !== habit.id ? 'drop-target' : ''
              } ${draggedHabitId === habit.id ? 'dragging' : ''}`}
              onDragOver={(event) => handleDragOver(event, habit.id)}
              onDrop={(event) => handleDrop(event, habit.id)}
            >
              <div className="row spaced align-start habit-row">
                <div className="row gap-12 align-start habit-left">
                  <button
                    type="button"
                    className="drag-handle"
                    draggable
                    onDragStart={(event) => handleDragStart(event, habit.id)}
                    onDragEnd={handleDragEnd}
                    aria-label={`Drag to reorder ${habit.name}`}
                    title="Drag to reorder"
                  >
                    ⋮⋮
                  </button>
                  <div className="stack xs habit-content">
                    <div className="row gap-6 align-center">
                      <h3 className="today-habit-title">{habit.name}</h3>
                    </div>
                    <div className="row gap-8 wrap habit-meta-row">
                      <span className="pill ghost pill-system">
                        <span className="system-dot tiny" style={{ background: systemMap[habit.systemId]?.color }} />
                        {systemMap[habit.systemId]?.name || 'System'}
                      </span>
                      {habit.notes && (
                        <button
                          type="button"
                          className={`details-chip ${openDetails.includes(habit.id) ? 'active' : ''}`}
                          onClick={() =>
                            setOpenDetails((prev) =>
                              prev.includes(habit.id) ? prev.filter((id) => id !== habit.id) : [...prev, habit.id],
                            )
                          }
                        >
                          {openDetails.includes(habit.id) ? 'Hide notes' : 'Notes'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row gap-10 align-center habit-actions">
                  <button
                    type="button"
                    className={`status-check ${status === 'completed' ? 'completed' : ''}`}
                    onClick={() => onStatusChange(habit.id, status === 'completed' ? 'notStarted' : 'completed')}
                    aria-label={status === 'completed' ? 'Mark as not completed' : 'Mark as completed'}
                  >
                    ✓
                  </button>
                </div>
              </div>

              {openDetails.includes(habit.id) && habit.notes && <p className="muted small habit-notes">{habit.notes}</p>}

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
                          <button
                            type="button"
                            className={`status-check small ${subStatus === 'completed' ? 'completed' : ''}`}
                            onClick={() =>
                              onSubHabitStatusChange(habit.id, sub.id, subStatus === 'completed' ? 'notStarted' : 'completed')
                            }
                            aria-label={subStatus === 'completed' ? 'Mark as not completed' : 'Mark as completed'}
                          >
                            ✓
                          </button>
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
