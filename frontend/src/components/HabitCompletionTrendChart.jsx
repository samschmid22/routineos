import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export function HabitCompletionTrendChart({ data = [] }) {
  const chartData = Array.isArray(data) ? data : [];
  const showEmptyState = chartData.length === 0 || chartData.every((day) => !day?.totalHabits);

  return (
    <div className="completion-trend-card analytics-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2 className="section-title">Completion trend</h2>
        </div>
        <span className="card-meta">Last 7 days</span>
      </div>
      <div className="completion-chart-wrapper">
        {showEmptyState ? (
          <div className="muted small">No habit schedules logged during the last 7 days.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff6a1a" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ff6a1a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" stroke="#777" />
              <YAxis stroke="#777" tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#050505',
                  border: '1px solid #333',
                  borderRadius: 10,
                  fontSize: '0.8rem',
                }}
                formatter={(value, name) => {
                  if (name === 'completionRate') {
                    return [`${value}%`, 'Completion'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  const d = payload?.[0]?.payload;
                  if (!d) return label;
                  const summary =
                    d.totalHabits === 0 ? 'No habits due' : `${d.completedHabits}/${d.totalHabits} habits`;
                  return `${d.fullDate || label} • ${summary}`;
                }}
              />
              <Area
                type="monotone"
                dataKey="completionRate"
                stroke="#ff6a1a"
                strokeWidth={2}
                fill="url(#completionGradient)"
                dot={{ r: 4, stroke: '#ff6a1a', strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
