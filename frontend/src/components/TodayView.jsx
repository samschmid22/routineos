// Component: renders today's scheduled habits grouped by time block with status controls.
import { STATUSES, TIME_BLOCKS } from '../utils/analytics';

const PurposePill = ({ purpose }) => (
  <span className={`pill purpose-${purpose.toLowerCase()}`}>{purpose}</span>
);

const StatusButtons = ({ current, onChange }) => (
  <div className="status-row">
    {STATUSES.map((status) => (
      <button
        key={status}
        type="button"
        className={`chip ${current === status ? 'active' : ''}`}
        onClick={() => onChange(status)}
      >
        {status}
      </button>
    ))}
  </div>
);

const TodayView = ({ habitsForToday, systems, onStatusChange }) => {
  const systemMap = systems.reduce((acc, system) => ({ ...acc, [system.id]: system }), {});
  const sorted = [...habitsForToday].sort((a, b) => {
    const order = TIME_BLOCKS.indexOf(a.habit.timeBlock) - TIME_BLOCKS.indexOf(b.habit.timeBlock);
    return order !== 0 ? order : a.habit.name.localeCompare(b.habit.name);
  });

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Today</p>
          <h2>Habits list</h2>
        </div>
      </div>
      {sorted.length === 0 && <div className="muted">No habits scheduled for today.</div>}
      <div className="stack md">
        {sorted.map(({ habit, status }) => (
          <div key={habit.id} className="card subtle hoverable habit-wide">
            <div className="row spaced align-start">
              <div className="stack xs">
                <div className="row gap-8 align-center wrap">
                  <h3>{habit.name}</h3>
                  <span className="pill ghost">{habit.timeBlock}</span>
                </div>
              </div>
              <StatusButtons current={status} onChange={(newStatus) => onStatusChange(habit.id, newStatus)} />
            </div>
            <div className="row spaced align-center wrap">
              <div className="row gap-8 wrap">
                <span className="pill ghost">
                  <span className="system-dot tiny" style={{ background: systemMap[habit.systemId]?.color }} />
                  {systemMap[habit.systemId]?.name || 'System'}
                </span>
                <PurposePill purpose={habit.purpose} />
              </div>
              <span className="pill ghost">{habit.durationMinutes} min</span>
            </div>
            {habit.notes && <p className="muted small">{habit.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayView;
