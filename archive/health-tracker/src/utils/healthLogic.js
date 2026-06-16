import { RISK_THRESHOLDS } from './constants'

export function toDateKey(input = new Date()) {
  const date = new Date(input)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function sortDesc(records) {
  return [...records].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function calculateStreak(records, today = new Date()) {
  if (!records.length) return 0

  const byDate = new Map(records.map((entry) => [entry.date, entry]))
  let streak = 0
  const todayKey = toDateKey(today)

  if (!byDate.has(todayKey)) return 0

  const cursorDate = new Date(today)
  cursorDate.setHours(12, 0, 0, 0)

  while (true) {
    const key = toDateKey(cursorDate)
    if (!byDate.has(key)) break
    streak += 1
    cursorDate.setDate(cursorDate.getDate() - 1)
  }

  return streak
}

export function evaluateRisk(entry, familyHistory) {
  const flags = []

  if (entry.sleepHours < 6 && entry.smokingCount >= 5) {
    flags.push('Low sleep + high smoking')
  }
  if (entry.exerciseMinutes < 20 && entry.nutritionScore <= 4) {
    flags.push('Low activity + poor nutrition')
  }
  if (entry.smokingCount >= 10) {
    flags.push('Very high smoking count')
  }
  if (entry.sleepHours < 5) {
    flags.push('Sleep deprivation risk')
  }

  if (entry.bloodPressureSys != null && entry.bloodPressureSys > RISK_THRESHOLDS.bloodPressureSys.high) {
    flags.push(`High blood pressure (${entry.bloodPressureSys}/${entry.bloodPressureDia || '?'} mmHg)`)
  }
  if (entry.bloodPressureDia != null && entry.bloodPressureDia > RISK_THRESHOLDS.bloodPressureDia.high) {
    flags.push('Diastolic pressure elevated')
  }
  if (entry.heartRate != null && entry.heartRate > RISK_THRESHOLDS.heartRate.high) {
    flags.push('Resting heart rate elevated (>95 bpm)')
  }

  if (entry.stressLevel != null && entry.stressLevel >= RISK_THRESHOLDS.stressLevel.high) {
    flags.push('Acute stress level')
    if (entry.sleepHours != null && entry.sleepHours < 6) {
      flags.push('High stress + sleep deficit combination')
    }
    if (entry.exerciseMinutes != null && entry.exerciseMinutes < 15) {
      flags.push('High stress without exercise offset')
    }
  }

  if (entry.bloodGlucose != null && entry.bloodGlucose > RISK_THRESHOLDS.bloodGlucose.high) {
    flags.push(`Blood glucose elevated (${entry.bloodGlucose} mg/dL)`)
  }
  if (entry.cholesterolTotal != null && entry.cholesterolTotal > RISK_THRESHOLDS.cholesterolTotal.high) {
    flags.push('Total cholesterol high')
  }
  if (entry.cholesterolLDL != null && entry.cholesterolLDL > RISK_THRESHOLDS.cholesterolLDL.high) {
    flags.push('LDL cholesterol elevated')
  }
  if (entry.triglycerides != null && entry.triglycerides > RISK_THRESHOLDS.triglycerides.high) {
    flags.push('Triglycerides elevated')
  }

  if (familyHistory && familyHistory.conditions) {
    for (const cond of familyHistory.conditions) {
      const name = (cond.condition || '').toLowerCase()
      if (name.includes('diabetes') && entry.bloodGlucose != null && entry.bloodGlucose > 100) {
        flags.push('Glucose above normal with family history of diabetes')
      }
      if (name.includes('heart') && entry.smokingCount > 0) {
        flags.push('Smoking with family history of heart disease')
      }
    }
  }

  return flags
}

export function normalizeRecords(records) {
  return sortDesc(records)
}

export function weeklyTrend(records, today = new Date()) {
  const output = []
  const recordByDate = new Map(records.map((entry) => [entry.date, entry]))

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = toDateKey(date)
    const item = recordByDate.get(dateKey)
    output.push({
      date: dateKey.slice(5),
      sleep: item?.sleepHours ?? null,
      exercise: item?.exerciseMinutes ?? null,
      smoking: item?.smokingCount ?? null,
      steps: item?.steps ?? null,
      heartRate: item?.heartRate ?? null,
      stress: item?.stressLevel ?? null,
      mood: item?.moodScore ?? null,
      outdoor: item?.outdoorMinutes ?? null,
      screen: item?.screenTimeHours ?? null,
    })
  }

  return output
}

export function comparePeriods(records, days = 7) {
  const recent = records.slice(0, days)
  const prior = records.slice(days, days * 2)

  if (!recent.length || !prior.length) return null

  const metricKeys = ['sleepHours', 'exerciseMinutes', 'steps', 'heartRate', 'stressLevel', 'moodScore', 'screenTimeHours', 'outdoorMinutes']

  function avgMetric(group, key) {
    const vals = group.map((r) => Number(r[key])).filter((n) => Number.isFinite(n))
    if (!vals.length) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  const deltas = {}
  for (const key of metricKeys) {
    const recentAvg = avgMetric(recent, key)
    const priorAvg = avgMetric(prior, key)
    if (recentAvg != null && priorAvg != null) {
      deltas[key] = {
        recent: Math.round(recentAvg * 10) / 10,
        prior: Math.round(priorAvg * 10) / 10,
        delta: Math.round((recentAvg - priorAvg) * 10) / 10,
      }
    }
  }

  return deltas
}
