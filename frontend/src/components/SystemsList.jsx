// Component: horizontal cards for pillar selection.
const SystemsList = ({ systems, selectedSystemId, onSelectSystem, onAddNew }) => {
  return (
    <div className="card">
      <div className="card-header row spaced align-center">
        <div>
          <p className="eyebrow">Your pillars</p>
          <h2 className="section-title">SYSTEMS OVERVIEW</h2>
        </div>
        <button type="button" className="btn-primary" onClick={onAddNew}>
          + New system
        </button>
      </div>
      <div className="pillars-row">
        {systems.map((system) => (
          <button
            key={system.id}
            type="button"
            className={`pillar-card ${selectedSystemId === system.id ? 'active' : ''}`}
            onClick={() => onSelectSystem(system.id)}
          >
            <div className="row gap-8 align-center">
              <span className="system-dot" style={{ background: system.color }} />
              <span className="pillar-icon">{system.icon || '★'}</span>
            </div>
            <div className="stack xs align-start">
              <strong>{system.name}</strong>
              <span className="muted small">{system.description}</span>
            </div>
          </button>
        ))}
        {systems.length === 0 && <div className="muted">No systems yet.</div>}
      </div>
    </div>
  );
};

export default SystemsList;
