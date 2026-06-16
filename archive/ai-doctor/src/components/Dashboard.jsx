import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { evaluateRisk, weeklyTrend } from '../utils/healthLogic'

function StatCard({ label, value, unit = '' }) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <h3>
        {value}
        {unit ? <span>{unit}</span> : null}
      </h3>
    </article>
  )
}

export default function Dashboard({ records, todayRecord, streak }) {
  const trendData = weeklyTrend(records)
  const flags = todayRecord ? evaluateRisk(todayRecord) : []

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Dashboard</h2>
        <p>Today at a glance</p>
      </div>
      <div className="card-grid">
        <StatCard label="Sleep" value={todayRecord?.sleepHours ?? '--'} unit="h" />
        <StatCard label="Exercise" value={todayRecord?.exerciseMinutes ?? '--'} unit="m" />
        <StatCard label="Nutrition" value={todayRecord?.nutritionScore ?? '--'} unit="/10" />
        <StatCard label="Smoking" value={todayRecord?.smokingCount ?? '--'} />
        <StatCard label="Streak" value={streak} unit="days" />
      </div>

      <div className="chart-wrap">
        <h3>Weekly Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip
              contentStyle={{
                background: '#10151a',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px'
              }}
            />
            <Line type="monotone" dataKey="sleep" stroke="#d4f4dd" strokeWidth={2} />
            <Line type="monotone" dataKey="exercise" stroke="#8ecae6" strokeWidth={2} />
            <Line type="monotone" dataKey="smoking" stroke="#ff6b6b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="risk-block">
        <h3>Risk Flags</h3>
        {flags.length ? (
          <ul>
            {flags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        ) : (
          <p>No major risk flags today.</p>
        )}
      </div>
    </section>
  )
}
