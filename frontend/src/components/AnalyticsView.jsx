// Component: analytics plus insights placeholders for deeper intelligence.
import AiCoachPanel from './AiCoachPanel';
import { HabitCompletionTrendChart } from './HabitCompletionTrendChart';
import HabitCompletionLikelihood from './HabitCompletionLikelihood';
import { completionBySystem, completionTrend, percent } from '../utils/analytics';

const ProgressBar = ({ percentValue }) => (
  <div className="progress">
    <div className="progress-fill" style={{ width: `${percentValue}%` }} />
  </div>
);

const AnalyticsView = ({ systems, habits, statusMap }) => {
  const bySystem = completionBySystem(habits, systems, statusMap);
  const trendData = completionTrend(habits);

  const completedCounts = habits
    .map((habit) => ({ habit, completed: statusMap[habit.id] === 'completed', skipped: statusMap[habit.id] === 'skipped' }))
    .sort((a, b) => Number(b.completed) - Number(a.completed));
  const skippedCounts = habits
    .map((habit) => ({ habit, skipped: statusMap[habit.id] === 'skipped' }))
    .sort((a, b) => Number(b.skipped) - Number(a.skipped));
  const topCompleted = completedCounts.filter((item) => item.completed).slice(0, 3);
  const topSkipped = skippedCounts.filter((item) => item.skipped).slice(0, 3);

  const coachContext = {
    systems,
    statusMap,
    bySystem,
  };

  return (
    <div className="analytics-grid">
      <div className="stack md">
        <AiCoachPanel context={coachContext} />
        <HabitCompletionTrendChart data={trendData} />
      </div>
      <div className="stack md">
        <div className="card analytics-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Analytics</p>
              <h2 className="section-title">Systems</h2>
            </div>
          </div>
          <div className="stack sm">
            {systems.map((system) => {
              const bucket = bySystem[system.id] || { completed: 0, total: 0 };
              const pct = percent(bucket.completed, bucket.total);
              return (
                <div key={system.id} className="metric">
                  <div className="row spaced align-center analytics-metric-head">
                    <div className="row gap-8 align-center">
                      <span className="system-dot" style={{ background: system.color }} />
                      <span>{system.name}</span>
                    </div>
                    <div className="analytics-metric-value">
                      <strong>{pct}%</strong>
                      <span className="muted small">
                        {bucket.completed}/{bucket.total}
                      </span>
                    </div>
                  </div>
                  <ProgressBar percentValue={pct} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="card analytics-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Insights</p>
              <h2 className="section-title">Highlights</h2>
            </div>
          </div>
          <div className="grid two mini-cards analytics-highlights">
            <div className="mini-card">
              <div className="row spaced align-center">
                <h4>Top done</h4>
                <span className="muted small">Today</span>
              </div>
              {topCompleted.length === 0 && <p className="muted small highlight-empty">No completions yet.</p>}
              <div className="stack xs highlight-list">
                {topCompleted.map(({ habit }, idx) => (
                  <div key={habit.id} className="row spaced small highlight-item">
                    <span>
                      {idx + 1}. {habit.name}
                    </span>
                    <strong>Done</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="mini-card">
              <div className="row spaced align-center">
                <h4>Top skipped</h4>
                <span className="muted small">Today</span>
              </div>
              {topSkipped.length === 0 && <p className="muted small highlight-empty">No skips today.</p>}
              <div className="stack xs highlight-list">
                {topSkipped.map(({ habit }, idx) => (
                  <div key={habit.id} className="row spaced small highlight-item">
                    <span>
                      {idx + 1}. {habit.name}
                    </span>
                    <strong>Skipped</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <HabitCompletionLikelihood habits={habits} systems={systems} statusMap={statusMap} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
