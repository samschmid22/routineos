// Component: edit/create a single system.
import { useEffect, useState } from 'react';

const ICONS = [
  '☀️', '🌙', '⭐️', '✨', '🔥', '⚡️', '💼', '🧠', '🏋️', '💪', '🏃‍♂️', '🧘‍♂️', '📚', '📝', '🧭', '🎯', '🧹',
  '🏠', '🌿', '💧', '🍎', '💊', '💵', '💡', '🛠️', '🧰', '📈', '📊', '🗓️', '⏰', '🧴', '🦷', '🛏️', '🥗', '🧗‍♂️',
  '🏊‍♂️', '🚴‍♂️', '🧘‍♀️', '🎹', '🎻', '🎸', '🎤', '🧑‍🍳', '🧼', '🧴', '🪥', '🛁', '🚿', '🧴', '🧯',
];

const SystemEditor = ({ system, onChange, onSave, onDelete, isNew }) => {
  const [local, setLocal] = useState(system);

  useEffect(() => {
    setLocal(system);
  }, [system]);

  if (!system) {
    return (
      <div className="card">
        <p className="muted">Select or create a system to edit.</p>
      </div>
    );
  }

  const updateField = (field, value) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    onChange(updated);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">{isNew ? 'New system' : 'Edit system'}</p>
          <h2>{local?.name || 'Untitled system'}</h2>
        </div>
      </div>
      <div className="stack sm">
        <label className="stack xs">
          <span className="label">Name</span>
          <input
            className="input"
            value={local?.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Morning Routine"
          />
        </label>
        <label className="stack xs">
          <span className="label">Description</span>
          <textarea
            className="input minimal-textarea"
            rows={3}
            value={local?.description || ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Why this system exists"
          />
        </label>
        <div className="row gap-8 wrap align-center">
          <label className="stack xs">
            <span className="label">Color</span>
            <button
              type="button"
              className="color-swatch"
              style={{ background: local?.color || '#F97316' }}
              onClick={() => {}}
            >
              <input
                type="color"
                className="color-input-overlay"
                value={local?.color || '#F97316'}
                onChange={(e) => updateField('color', e.target.value)}
              />
            </button>
          </label>
          <label className="stack xs icon-picker">
            <span className="label">Symbol</span>
            <div className="icon-select">
              <select
                className="input icon-dropdown"
                value={local?.icon || ICONS[0]}
                onChange={(e) => updateField('icon', e.target.value)}
              >
                {ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
              <span className="icon-preview transparent">{local?.icon || ICONS[0]}</span>
            </div>
          </label>
        </div>
        <div className="row gap-8 wrap">
          <button type="button" className="btn-primary" onClick={onSave}>
            Save system
          </button>
          {!isNew && (
            <button type="button" className="btn-ghost danger" onClick={onDelete}>
              Delete system
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemEditor;
