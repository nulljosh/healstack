import { useState } from 'react'

const COLUMN_SETS = {
  core: [
    { key: 'sleepHours', label: 'Sleep', format: (v) => v != null ? `${v}h` : '--' },
    { key: 'exerciseMinutes', label: 'Exercise', format: (v) => v != null ? `${v}m` : '--' },
    { key: 'nutritionScore', label: 'Nutrition', format: (v) => v != null ? `${v}/10` : '--' },
    { key: 'smokingCount', label: 'Smoking', format: (v) => v != null ? v : '--' },
  ],
  vitals: [
    { key: 'steps', label: 'Steps', format: (v) => v != null ? v.toLocaleString() : '--' },
    { key: 'heartRate', label: 'HR', format: (v) => v != null ? `${v} bpm` : '--' },
    { key: 'bloodPressureSys', label: 'BP', format: (v, e) => v != null ? `${v}/${e.bloodPressureDia || '?'}` : '--' },
    { key: 'weight', label: 'Weight', format: (v) => v != null ? `${v} lbs` : '--' },
  ],
  blood: [
    { key: 'bloodGlucose', label: 'Glucose', format: (v) => v != null ? v : '--' },
    { key: 'cholesterolTotal', label: 'Chol', format: (v) => v != null ? v : '--' },
    { key: 'cholesterolHDL', label: 'HDL', format: (v) => v != null ? v : '--' },
    { key: 'cholesterolLDL', label: 'LDL', format: (v) => v != null ? v : '--' },
    { key: 'triglycerides', label: 'Trig', format: (v) => v != null ? v : '--' },
  ],
  mind: [
    { key: 'stressLevel', label: 'Stress', format: (v) => v != null ? `${v}/10` : '--' },
    { key: 'moodScore', label: 'Mood', format: (v) => v != null ? `${v}/10` : '--' },
    { key: 'anxietyLevel', label: 'Anxiety', format: (v) => v != null ? `${v}/10` : '--' },
  ],
  environment: [
    { key: 'outdoorMinutes', label: 'Outdoor', format: (v) => v != null ? `${v}m` : '--' },
    { key: 'screenTimeHours', label: 'Screen', format: (v) => v != null ? `${v}h` : '--' },
  ],
}

export default function HistoryView({ records, days, onDaysChange }) {
  const [category, setCategory] = useState('core')
  const recent = records.slice(0, days)
  const columns = COLUMN_SETS[category] || COLUMN_SETS.core

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>History</h2>
        <div className="history-controls">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="core">Core</option>
            <option value="vitals">Vitals</option>
            <option value="blood">Blood</option>
            <option value="mind">Mind</option>
            <option value="environment">Environment</option>
          </select>
          <label htmlFor="days">Range</label>
          <select id="days" value={days} onChange={(e) => onDaysChange(Number(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={21}>21 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>
      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((entry) => (
              <tr key={entry.date}>
                <td>{entry.date}</td>
                {columns.map((col) => (
                  <td key={col.key}>{col.format(entry[col.key], entry)}</td>
                ))}
              </tr>
            ))}
            {!recent.length ? (
              <tr>
                <td colSpan={columns.length + 1} className="empty">No records yet. Complete your first check-in.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
