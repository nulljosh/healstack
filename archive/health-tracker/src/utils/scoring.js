import { RANK_THRESHOLDS, SCORE_WEIGHTS } from './constants'

function avg(nums) {
  const valid = nums.filter((n) => Number.isFinite(n))
  if (!valid.length) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

function scoreMetric(key, value) {
  const config = SCORE_WEIGHTS[key]
  if (!config || !Number.isFinite(value)) return null

  const maxPts = config.weight

  // Range-based scoring (sleep, heart rate, blood pressure, glucose)
  if (config.optimal) {
    const [optLow, optHigh] = config.optimal
    if (value >= optLow && value <= optHigh) return maxPts
    if (config.acceptable || config.good) {
      const [accLow, accHigh] = config.acceptable || config.good
      if (value >= accLow && value <= accHigh) return Math.round(maxPts * 0.65)
    }
    return Math.round(maxPts * 0.3)
  }

  // Scale-based scoring (nutrition, mood, stress)
  if (config.scale) {
    const ratio = config.inverse ? (config.scale - value + 1) / config.scale : value / config.scale
    return Math.round(maxPts * Math.max(0, Math.min(1, ratio)))
  }

  // Threshold-based scoring (steps, exercise, outdoor)
  if (config.thresholds) {
    const [high, mid, low] = config.thresholds
    if (config.inverse) {
      if (value <= high) return maxPts
      if (value <= mid) return Math.round(maxPts * 0.65)
      if (value <= low) return Math.round(maxPts * 0.3)
      return 0
    }
    if (value >= high) return maxPts
    if (value >= mid) return Math.round(maxPts * 0.7)
    if (value >= low) return Math.round(maxPts * 0.35)
    return Math.round(maxPts * 0.15)
  }

  return null
}

export function scoreBreakdown(entry) {
  if (!entry) {
    return { total: 0, confidence: 0, parts: {} }
  }

  const parts = {}
  let earned = 0
  let possible = 0
  let filled = 0
  const totalFields = Object.keys(SCORE_WEIGHTS).length

  for (const key of Object.keys(SCORE_WEIGHTS)) {
    const value = Number(entry[key])
    const score = scoreMetric(key, value)

    if (score !== null) {
      parts[key] = score
      earned += score
      possible += SCORE_WEIGHTS[key].weight
      filled++
    } else {
      parts[key] = null
    }
  }

  const total = possible > 0 ? Math.round((earned / possible) * 100) : 0
  const confidence = Math.round((filled / totalFields) * 100)

  return { total, confidence, parts }
}

export function healthRank(score) {
  for (const tier of RANK_THRESHOLDS) {
    if (score >= tier.min) return tier.label
  }
  return 'At Risk'
}

export function trendDirection(current, prev) {
  if (current == null || prev == null) return 'flat'
  if (current > prev) return 'up'
  if (current < prev) return 'down'
  return 'flat'
}

export function metricAnomalies(last7Avg, latest, familyHistory) {
  if (!latest) return []
  const flags = []

  // Sleep
  if (last7Avg.sleepHours != null && latest.sleepHours != null && latest.sleepHours < last7Avg.sleepHours - 1.5) {
    flags.push('Sleep dipped sharply vs weekly baseline')
  }

  // Steps
  if (last7Avg.steps != null && latest.steps != null && latest.steps < last7Avg.steps * 0.6) {
    flags.push('Step count dropped materially today')
  }

  // Heart rate
  if (latest.heartRate != null && latest.heartRate > 95) {
    flags.push('Heart rate is elevated')
  }

  // Stress + sleep combo
  if (latest.stressLevel != null && latest.stressLevel >= 8 && latest.sleepHours != null && latest.sleepHours < 6) {
    flags.push('High stress combined with sleep deficit')
  }

  // Mood drop
  if (last7Avg.moodScore != null && latest.moodScore != null && latest.moodScore < last7Avg.moodScore - 2) {
    flags.push('Mood dropped significantly vs baseline')
  }

  // Screen time spike
  if (last7Avg.screenTimeHours != null && latest.screenTimeHours != null && latest.screenTimeHours > last7Avg.screenTimeHours * 1.5) {
    flags.push('Screen time spiked vs weekly average')
  }

  // Blood pressure
  if (latest.bloodPressureSys != null && latest.bloodPressureSys > 140) {
    flags.push('Blood pressure systolic above 140 mmHg')
  }

  // Blood glucose
  if (latest.bloodGlucose != null && latest.bloodGlucose > 125) {
    flags.push('Blood glucose elevated (>125 mg/dL)')
  }

  // Family history cross-refs
  if (familyHistory && familyHistory.conditions) {
    for (const cond of familyHistory.conditions) {
      const name = cond.condition?.toLowerCase() || ''
      if (name.includes('diabetes') && latest.bloodGlucose != null && latest.bloodGlucose > 100) {
        flags.push('Glucose elevated with family history of diabetes')
      }
      if (name.includes('heart') && latest.heartRate != null && latest.heartRate > 90) {
        flags.push('Elevated heart rate with family history of heart disease')
      }
      if ((name.includes('hypertension') || name.includes('blood pressure')) && latest.bloodPressureSys != null && latest.bloodPressureSys > 130) {
        flags.push('BP trending high with family history of hypertension')
      }
    }
  }

  return flags
}

export function computeAnalytics(records, familyHistory) {
  const last7 = records.slice(0, 7)
  const prev7 = records.slice(7, 14)
  const latest = records[0] || null

  const metricKeys = ['sleepHours', 'steps', 'heartRate', 'exerciseMinutes', 'stressLevel', 'moodScore', 'screenTimeHours', 'outdoorMinutes', 'weight', 'bloodPressureSys']

  const metricAvg = (group, key) => avg(group.map((x) => Number(x[key])).filter((n) => Number.isFinite(n)))

  const last7Avg = {}
  const prev7Avg = {}
  const trends = {}

  for (const key of metricKeys) {
    last7Avg[key] = metricAvg(last7, key)
    prev7Avg[key] = metricAvg(prev7, key)
    trends[key] = trendDirection(last7Avg[key], prev7Avg[key])
  }

  const anomalies = metricAnomalies(last7Avg, latest, familyHistory)

  return { last7Avg, prev7Avg, trends, anomalies }
}

export function supplementAdherence(records, days = 14) {
  const recent = records.slice(0, days)
  if (!recent.length) return []

  const allNames = new Set()
  for (const r of recent) {
    if (r.supplements && Array.isArray(r.supplements)) {
      for (const s of r.supplements) {
        allNames.add(s.name)
      }
    }
  }

  return Array.from(allNames).map((name) => {
    const taken = recent.filter((r) =>
      r.supplements?.some((s) => s.name === name && s.taken)
    ).length
    return { name, taken, total: recent.length, rate: Math.round((taken / recent.length) * 100) }
  })
}
