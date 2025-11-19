// Component: analytics plus insights placeholders for deeper intelligence.
import { TIME_BLOCKS, completionByPurpose, completionBySystem, percent } from '../utils/analytics';

const ProgressBar = ({ percentValue }) => (
  <div className="progress">
    <div className="progress-fill" style={{ width: `${percentValue}%` }} />
  </div>
);

const AnalyticsView = ({ systems, habits, statusMap }) => {
  const byPurpose = completionByPurpose(habits, statusMap);
  const bySystem = completionBySystem(habits, systems, statusMap);

  const completedCounts = habits
    .map((habit) => ({ habit, completed: statusMap[habit.id] === 'completed', skipped: statusMap[habit.id] === 'skipped' }))
    .sort((a, b) => Number(b.completed) - Number(a.completed));
  const skippedCounts = habits
    .map((habit) => ({ habit, skipped: statusMap[habit.id] === 'skipped' }))
    .sort((a, b) => Number(b.skipped) - Number(a.skipped));

  return (
    <div className="stack md">
      <div className="grid two">
        <div className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Analytics</p>
              <h2 className="section-title">BY PURPOSE</h2>
            </div>
          </div>
          <div className="stack sm">
            {Object.entries(byPurpose).map(([purpose, bucket]) => {
              const pct = percent(bucket.completed, bucket.total);
              return (
                <div key={purpose} className="metric">
                  <div className="row spaced align-center">
                    <div className="row gap-8 align-center">
                      <span className={`pill purpose-${purpose.toLowerCase()}`}>{purpose}</span>
                      <span className="muted small">{bucket.total} habits</span>
                    </div>
                    <strong>{pct}%</strong>
                  </div>
                  <ProgressBar percentValue={pct} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Analytics</p>
              <h2 className="section-title">BY SYSTEM</h2>
            </div>
          </div>
          <div className="stack sm">
            {systems.map((system) => {
              const bucket = bySystem[system.id] || { completed: 0, total: 0 };
              const pct = percent(bucket.completed, bucket.total);
              return (
                <div key={system.id} className="metric">
                  <div className="row spaced align-center">
                    <div className="row gap-8 align-center">
                      <span className="system-dot" style={{ background: system.color }} />
                      <span>{system.name}</span>
                    </div>
                    <strong>{pct}%</strong>
                  </div>
                  <ProgressBar percentValue={pct} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Insights</p>
              <h2>AI Routine Coach</h2>
            </div>
          </div>
          <p className="muted small">
            Ask questions about your habits, trends, and how to optimize your time.
          </p>
          <div className="coach-box">
            <div className="muted small">Try asking:</div>
            <ul>
              <li>Which habits do I complete most often?</li>
              <li>Which habits do I skip the most?</li>
              <li>What is my completion rate this week vs last week?</li>
              <li>What should I focus on today?</li>
            </ul>
            <input className="input coach-input" placeholder="Ask the coach (coming soon)" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Insights</p>
              <h2>Habit stats</h2>
            </div>
          </div>
          <div className="grid two mini-cards">
            <div className="mini-card">
              <h4>Most completed</h4>
              <div className="stack xs">
                {completedCounts.slice(0, 3).map(({ habit }, idx) => (
                  <div key={habit.id} className="row spaced small">
                    <span>{idx + 1}. {habit.name}</span>
                    <span className="muted small">{statusMap[habit.id] === 'completed' ? '100%' : '—'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mini-card">
              <h4>Most skipped</h4>
              <div className="stack xs">
                {skippedCounts.slice(0, 3).map(({ habit }, idx) => (
                  <div key={habit.id} className="row spaced small">
                    <span>{idx + 1}. {habit.name}</span>
                    <span className="muted small">{statusMap[habit.id] === 'skipped' ? '100%' : '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mini-card">
            <h4>Completion by time</h4>
            <div className="stack xs">
              {TIME_BLOCKS.map((block) => (
                <div key={block} className="row spaced small">
                  <span>{block}</span>
                  <span className="muted small">Coming soon</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mini-card">
            <h4>Habit completion likelihood</h4>
            <p className="muted small">
              Estimate how likely you are to complete each habit based on past behavior (by weekday and time).
            </p>
            <div className="muted small">AI predictions coming soon.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
