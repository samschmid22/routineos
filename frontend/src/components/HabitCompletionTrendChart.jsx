import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const sampleCompletionData = [
  { date: 'Mon', completionRate: 80, completedHabits: 8, totalHabits: 10 },
  { date: 'Tue', completionRate: 60, completedHabits: 6, totalHabits: 10 },
  { date: 'Wed', completionRate: 100, completedHabits: 10, totalHabits: 10 },
  { date: 'Thu', completionRate: 40, completedHabits: 4, totalHabits: 10 },
  { date: 'Fri', completionRate: 70, completedHabits: 7, totalHabits: 10 },
  { date: 'Sat', completionRate: 90, completedHabits: 9, totalHabits: 10 },
  { date: 'Sun', completionRate: 50, completedHabits: 5, totalHabits: 10 },
];

export function HabitCompletionTrendChart({ data = sampleCompletionData }) {
  return (
    <div className="completion-trend-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h2 className="section-title">COMPLETION TREND</h2>
        </div>
        <span className="card-meta">Last 7 days</span>
      </div>
      <div className="completion-chart-wrapper">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
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
              formatter={(value, name, props) => {
                if (name === 'completionRate') {
                  return [`${value}%`, 'Completion'];
                }
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                const d = payload?.[0]?.payload;
                return `${label} • ${d.completedHabits}/${d.totalHabits} habits`;
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
      </div>
    </div>
  );
}
