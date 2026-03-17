// Component: edit/create a single system.
import { useEffect, useRef, useState } from 'react';

const ICONS = [
  '☀️', '🌙', '⭐️', '✨', '🔥', '⚡️', '💼', '🧠', '🏋️', '💪', '🏃‍♂️', '🧘‍♂️', '📚', '📝', '🧭', '🎯', '🧹',
  '🏠', '🌿', '💧', '🍎', '💊', '💵', '💡', '🛠️', '🧰', '📈', '📊', '🗓️', '⏰', '🧴', '🦷', '🛏️', '🥗', '🧗‍♂️',
  '🏊‍♂️', '🚴‍♂️', '🧘‍♀️', '🎹', '🎻', '🎸', '🎤', '🧑‍🍳', '🧼', '🧴', '🪥', '🛁', '🚿', '🧴', '🧯',
];

const SystemEditor = ({ system, onChange, onSave, onDelete, isNew }) => {
  const [local, setLocal] = useState(system);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    setLocal(system);
    setShowPicker(false);
  }, [system]);

  useEffect(() => {
    if (!showPicker) return undefined;
    const handleClick = (event) => {
      if (!pickerRef.current || pickerRef.current.contains(event.target)) return;
      setShowPicker(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPicker]);

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

  const handleSelectIcon = (icon) => {
    updateField('icon', icon);
    setShowPicker(false);
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
        <div className="row gap-16 wrap align-center color-symbol-row">
          <label className="stack xs">
            <span className="label">Color</span>
            <button
              type="button"
              className="color-swatch"
              style={{ background: local?.color || '#FF7A20' }}
              onClick={() => {}}
            >
              <input
                type="color"
                className="color-input-overlay"
                value={local?.color || '#FF7A20'}
                onChange={(e) => updateField('color', e.target.value)}
              />
            </button>
          </label>
          <label className="stack xs icon-picker" ref={pickerRef}>
            <span className="label">Symbol</span>
            <div className="symbol-picker">
              <button
                type="button"
                className="symbol-trigger"
                onClick={() => setShowPicker((prev) => !prev)}
                aria-label="Choose symbol"
              >
                <span className="symbol-selected">{local?.icon || ICONS[0]}</span>
                <span className="caret">▾</span>
              </button>
              {showPicker && (
                <div className="emoji-popover">
                  <div className="emoji-grid">
                    {ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`emoji-btn ${local?.icon === icon ? 'active' : ''}`}
                        onClick={() => handleSelectIcon(icon)}
                        aria-label={`Symbol ${icon}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
