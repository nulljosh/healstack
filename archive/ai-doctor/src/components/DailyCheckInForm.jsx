import { useMemo, useState } from 'react'
import { toDateKey } from '../utils/healthLogic'

const defaults = {
  sleepHours: 7,
  exerciseMinutes: 30,
  nutritionScore: 7,
  smokingCount: 0
}

export default function DailyCheckInForm({ todayRecord, onSubmit }) {
  const [form, setForm] = useState(todayRecord || defaults)

  const hasToday = Boolean(todayRecord)
  const dateLabel = useMemo(() => toDateKey(new Date()), [])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: Number(value) }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({
      date: dateLabel,
      sleepHours: Number(form.sleepHours),
      exerciseMinutes: Number(form.exerciseMinutes),
      nutritionScore: Number(form.nutritionScore),
      smokingCount: Number(form.smokingCount)
    })
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Daily Check-In</h2>
        <p>{dateLabel}</p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Sleep hours
          <input
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={form.sleepHours}
            onChange={(e) => updateField('sleepHours', e.target.value)}
          />
        </label>
        <label>
          Exercise minutes
          <input
            type="number"
            min="0"
            max="600"
            value={form.exerciseMinutes}
            onChange={(e) => updateField('exerciseMinutes', e.target.value)}
          />
        </label>
        <label>
          Nutrition score (1-10)
          <input
            type="number"
            min="1"
            max="10"
            value={form.nutritionScore}
            onChange={(e) => updateField('nutritionScore', e.target.value)}
          />
        </label>
        <label>
          Smoking count
          <input
            type="number"
            min="0"
            max="100"
            value={form.smokingCount}
            onChange={(e) => updateField('smokingCount', e.target.value)}
          />
        </label>
        <button type="submit" className="cta-button">{hasToday ? 'Update check-in' : 'Save check-in'}</button>
      </form>
    </section>
  )
}
