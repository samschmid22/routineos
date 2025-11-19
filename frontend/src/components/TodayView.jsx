// Component: renders today's habits as a luxurious wide list with status dropdowns and details toggles.
import { useState } from 'react';
import { HABIT_STATUSES } from '../utils/status';

const StatusSelect = ({ current, onChange }) => {
  const labelMap = {
    notStarted: 'Not started',
    ongoing: 'Ongoing',
    completed: 'Completed',
    skipped: 'Skipped',
  };
  return (
    <select className="input status-select wide" value={current} onChange={(e) => onChange(e.target.value)}>
      {HABIT_STATUSES.map((status) => (
        <option key={status} value={status}>
          {labelMap[status] || status}
        </option>
      ))}
    </select>
  );
};

const TodayView = ({ habitsForToday, systems, onStatusChange }) => {
  const [openDetails, setOpenDetails] = useState([]);
  const systemMap = systems.reduce((acc, system) => ({ ...acc, [system.id]: system }), {});
  const sorted = [...habitsForToday].sort((a, b) => a.habit.name.localeCompare(b.habit.name));

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
        {sorted.map(({ habit, status }) => (
          <div key={habit.id} className="card subtle hoverable habit-wide">
            <div className="row spaced align-start">
              <div className="stack xs">
                <h3>{habit.name}</h3>
                <div className="row gap-8 wrap">
                  <span className="pill ghost">
                    <span className="system-dot tiny" style={{ background: systemMap[habit.systemId]?.color }} />
                    {systemMap[habit.systemId]?.name || 'System'}
                  </span>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayView;
