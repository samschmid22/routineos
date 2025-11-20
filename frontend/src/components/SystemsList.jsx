// Component: horizontal cards for pillar selection.
const SystemsList = ({
  systems = [],
  habits = [], // accepted for future needs
  selectedSystemId,
  onSelectSystem,
  onCreateSystem = () => {},
  onReorder = () => {},
}) => {
  void habits;
  const handleDragStart = (event, systemId) => {
    event.dataTransfer.setData('text/system-id', systemId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (event, targetId) => {
    event.preventDefault();
    const draggedId = event.dataTransfer.getData('text/system-id');
    if (!draggedId || draggedId === targetId) return;
    onReorder(draggedId, targetId);
  };

  return (
    <div className="card">
      <div className="card-header row spaced align-center">
        <div>
          <p className="eyebrow">Your pillars</p>
          <h2 className="section-title systems-heading">SYSTEMS OVERVIEW</h2>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() =>
            onCreateSystem({
              name: 'New system',
              category: 'General',
              color: '#FF6347',
            })
          }
        >
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
            draggable
            onDragStart={(e) => handleDragStart(e, system.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, system.id)}
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
