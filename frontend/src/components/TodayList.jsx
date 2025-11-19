import { useMemo } from 'react';
import {
  STATUS_OPTIONS,
  isHabitScheduledForDate,
  timeBlockSortWeight,
} from '../utils/routine';

const StatusButtons = ({ current, onChange }) => {
  return (
    <div className="chips">
      {STATUS_OPTIONS.map((status) => (
        <button
          key={status}
          type="button"
          className={`pill ${current === status ? 'active' : ''}`}
          onClick={() => onChange(status)}
        >
          {status}
        </button>
      ))}
    </div>
  );
};

const TodayList = ({ dateString, habits, statuses, onChangeStatus, systems }) => {
  const items = useMemo(() => {
    return habits
      .filter((habit) => isHabitScheduledForDate(habit, dateString))
      .sort((a, b) => timeBlockSortWeight(a.preferredTimeBlock) - timeBlockSortWeight(b.preferredTimeBlock));
  }, [habits, dateString]);

  const statusesForDay = statuses[dateString] || {};

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Today</p>
          <h2 className="panel-title">What is scheduled for {dateString}</h2>
        </div>
        <div className="muted small">{items.length} habit{items.length === 1 ? '' : 's'}</div>
      </div>
      <div className="stack md">
        {items.length === 0 && <div className="muted">No habits scheduled for this day.</div>}
        {items.map((habit) => (
          <div key={habit.id} className="card">
            <div className="card-header">
              <div>
                <div className="small muted">{systems.find((s) => s.id === habit.systemId)?.name}</div>
                <h3>{habit.name}</h3>
                <div className="muted small">
                  {habit.preferredTimeBlock} • {habit.durationMinutes || 0} min • {habit.purpose}
                </div>
              </div>
              <StatusButtons
                current={statusesForDay[habit.id] || 'NotStarted'}
                onChange={(newStatus) => onChangeStatus(dateString, habit.id, newStatus)}
              />
            </div>
            {habit.notes && <p className="muted">{habit.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayList;
