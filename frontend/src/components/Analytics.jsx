import { buildAnalytics } from '../utils/routine';

const Ratio = ({ completed, total }) => {
  if (total === 0) return <span className="muted">No data</span>;
  const percent = Math.round((completed / total) * 100);
  return (
    <span>
      {percent}% ({completed}/{total})
    </span>
  );
};

const Analytics = ({ systems, habits, statuses, anchorDate }) => {
  const { byPurpose, bySystem } = buildAnalytics(habits, systems, statuses, anchorDate);
  const systemMap = systems.reduce((acc, system) => ({ ...acc, [system.id]: system.name }), {});

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2 className="panel-title">Last 7 days completion</h2>
        </div>
      </div>
      <div className="grid two">
        <div className="card">
          <h3>By purpose</h3>
          <div className="stack xs">
            {Object.entries(byPurpose).map(([purpose, bucket]) => (
              <div key={purpose} className="row spaced">
                <span>{purpose}</span>
                <Ratio completed={bucket.completed} total={bucket.total} />
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>By system</h3>
          <div className="stack xs">
            {Object.entries(bySystem).map(([systemId, bucket]) => (
              <div key={systemId} className="row spaced">
                <span>{systemMap[systemId] || 'Unknown system'}</span>
                <Ratio completed={bucket.completed} total={bucket.total} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
