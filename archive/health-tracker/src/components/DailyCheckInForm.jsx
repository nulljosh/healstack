import { useMemo, useState } from 'react'
import { CATEGORIES, fieldsByCategory } from '../utils/constants'
import { toDateKey } from '../utils/healthLogic'
import { createEmptyRecord } from '../utils/storage'
import SupplementChecklist from './SupplementChecklist'

const TAB_ORDER = ['core', 'vitals', 'blood', 'mind', 'supplements', 'environment']

export default function DailyCheckInForm({ todayRecord, onSubmit, supplementStack }) {
  const dateLabel = useMemo(() => toDateKey(new Date()), [])
  const [form, setForm] = useState(() => {
    if (todayRecord) return { ...createEmptyRecord(dateLabel), ...todayRecord }
    return {
      ...createEmptyRecord(dateLabel),
      sleepHours: 7,
      exerciseMinutes: 30,
      nutritionScore: 7,
      smokingCount: 0,
    }
  })
  const [activeTab, setActiveTab] = useState('core')
  const hasToday = Boolean(todayRecord)

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value === '' ? null : Number(value) }))
  }

  function updateNotes(value) {
    setForm((prev) => ({ ...prev, notes: value }))
  }

  function updateSupplements(supplements) {
    setForm((prev) => ({ ...prev, supplements }))
  }

  function tabHasData(category) {
    if (category === 'supplements') {
      return form.supplements && form.supplements.some((s) => s.taken)
    }
    const fields = fieldsByCategory(category)
    return fields.some((f) => form[f.key] != null && form[f.key] !== '')
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit({ ...form, date: dateLabel })
  }

  const fields = activeTab !== 'supplements' ? fieldsByCategory(activeTab) : []

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Daily Check-In</h2>
        <p>{dateLabel}</p>
      </div>

      <div className="tab-bar">
        {TAB_ORDER.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`tab-btn ${activeTab === cat ? 'active' : ''}`}
            onClick={() => setActiveTab(cat)}
          >
            {CATEGORIES[cat].label}
            {tabHasData(cat) && <span className="tab-dot" />}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'supplements' ? (
          <SupplementChecklist
            stack={supplementStack}
            supplements={form.supplements || []}
            onChange={updateSupplements}
          />
        ) : (
          <div className="form-grid">
            {fields.map((f) => (
              <label key={f.key}>
                {f.label} {f.unit && `(${f.unit})`}
                <input
                  type="number"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={form[f.key] ?? ''}
                  placeholder={f.default != null ? String(f.default) : ''}
                  onChange={(e) => updateField(f.key, e.target.value)}
                />
              </label>
            ))}
          </div>
        )}

        <div className="form-footer">
          <label className="notes-label">
            Notes
            <textarea
              value={form.notes || ''}
              onChange={(e) => updateNotes(e.target.value)}
              placeholder="Any notes for today..."
              rows={2}
            />
          </label>
          <button type="submit" className="cta-button">
            {hasToday ? 'Update check-in' : 'Save check-in'}
          </button>
        </div>
      </form>
    </section>
  )
}
