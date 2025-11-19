// SubHabitsEditor: manages the checklist items inside a habit.
import { generateId } from '../utils/ids';

const SubHabitsEditor = ({ value = [], onChange }) => {
  const addSubHabit = () => {
    const next = [
      ...value,
      {
        id: generateId('subhabit'),
        name: '',
        notes: '',
        sortOrder: value.length,
      },
    ];
    onChange(next);
  };

  const updateSubHabit = (id, patch) => {
    onChange(value.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)));
  };

  const removeSubHabit = (id) => {
    onChange(value.filter((sub) => sub.id !== id));
  };

  const move = (id, direction) => {
    const index = value.findIndex((sub) => sub.id === id);
    if (index === -1) return;
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next.map((sub, idx) => ({ ...sub, sortOrder: idx })));
  };

  return (
    <div className="subhabits-editor">
      <div className="row spaced align-center">
        <h4>Sub-habits</h4>
        <button type="button" className="btn-primary small-btn" onClick={addSubHabit}>
          + Sub-habit
        </button>
      </div>
      {value.length === 0 && <p className="muted small">No sub-habits yet.</p>}
      <div className="stack sm">
        {value.map((sub, index) => (
          <div key={sub.id} className="subhabit-card">
            <div className="row spaced align-center">
              <strong>Item {index + 1}</strong>
              <div className="row gap-6">
                <button type="button" className="btn-ghost small-btn" onClick={() => move(sub.id, 'up')}>
                  ↑
                </button>
                <button type="button" className="btn-ghost small-btn" onClick={() => move(sub.id, 'down')}>
                  ↓
                </button>
                <button type="button" className="btn-ghost danger small-btn" onClick={() => removeSubHabit(sub.id)}>
                  Delete
                </button>
              </div>
            </div>
            <label className="stack xs">
              <span className="label">Name</span>
              <input
                className="input"
                value={sub.name}
                onChange={(e) => updateSubHabit(sub.id, { name: e.target.value })}
                placeholder="e.g., Clean counters"
              />
            </label>
            <label className="stack xs">
              <span className="label">Notes</span>
              <textarea
                className="input"
                rows={2}
                value={sub.notes || ''}
                onChange={(e) => updateSubHabit(sub.id, { notes: e.target.value })}
                placeholder="Optional context"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubHabitsEditor;
