import { useState } from 'react';
import { generateId } from '../utils/routine';

const SystemManager = ({ systems, onAddSystem }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    onAddSystem({
      id: generateId('system'),
      name: name.trim(),
      description: description.trim(),
    });
    setName('');
    setDescription('');
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Systems</p>
          <h2 className="panel-title">Define the pillars you run</h2>
        </div>
      </div>
      <form className="stack sm" onSubmit={handleSubmit}>
        <input
          className="text-input"
          placeholder="System name (e.g., Morning Routine)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="text-input"
          rows={2}
          placeholder="Short description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" className="primary">
          Add system
        </button>
      </form>
      <div className="chips">
        {systems.length === 0 && <span className="muted">No systems yet.</span>}
        {systems.map((system) => (
          <div key={system.id} className="chip">
            <strong>{system.name}</strong>
            {system.description && <span className="muted"> — {system.description}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemManager;
