import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const METRICS = [
  { key: 'sleep', label: 'Sleep', color: '#3d9e6a' },
  { key: 'exercise', label: 'Exercise', color: '#8ecae6' },
  { key: 'smoking', label: 'Smoking', color: '#ff6b6b' },
  { key: 'steps', label: 'Steps', color: '#d4a843' },
  { key: 'heartRate', label: 'Heart Rate', color: '#e07a5f' },
  { key: 'stress', label: 'Stress', color: '#bc6c8a' },
  { key: 'mood', label: 'Mood', color: '#81b29a' },
  { key: 'outdoor', label: 'Outdoor', color: '#a8dadc' },
  { key: 'screen', label: 'Screen', color: '#9e8dc4' },
]

export default function TrendChart({ data }) {
  const [active, setActive] = useState(['sleep', 'exercise', 'smoking'])

  function toggle(key) {
    setActive((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  return (
    <div className="chart-wrap">
      <h3>Weekly Trend</h3>
      <div className="chart-toggles">
        {METRICS.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`chart-toggle ${active.includes(m.key) ? 'active' : ''}`}
            style={active.includes(m.key) ? { borderColor: m.color, color: m.color } : {}}
            onClick={() => toggle(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
          <YAxis stroke="rgba(255,255,255,0.6)" />
          <Tooltip
            contentStyle={{
              background: '#10151a',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
            }}
          />
          {METRICS.filter((m) => active.includes(m.key)).map((m) => (
            <Line
              key={m.key}
              type="monotone"
              dataKey={m.key}
              stroke={m.color}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
