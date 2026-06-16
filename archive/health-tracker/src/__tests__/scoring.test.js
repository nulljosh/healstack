import { describe, expect, test } from 'vitest'
import { computeAnalytics, healthRank, metricAnomalies, scoreBreakdown, supplementAdherence, trendDirection } from '../utils/scoring'

describe('scoreBreakdown', () => {
  test('returns zero for null entry', () => {
    const result = scoreBreakdown(null)
    expect(result.total).toBe(0)
    expect(result.confidence).toBe(0)
  })

  test('scores optimal values high', () => {
    const result = scoreBreakdown({
      sleepHours: 8,
      exerciseMinutes: 60,
      steps: 12000,
      heartRate: 65,
      nutritionScore: 9,
      smokingCount: 0,
      stressLevel: 2,
      moodScore: 9,
      bloodPressureSys: 115,
      bloodGlucose: 90,
      outdoorMinutes: 90,
      screenTimeHours: 3,
    })
    expect(result.total).toBeGreaterThanOrEqual(85)
    expect(result.confidence).toBe(100)
  })

  test('scores poor values low', () => {
    const result = scoreBreakdown({
      sleepHours: 4,
      exerciseMinutes: 5,
      steps: 1000,
      heartRate: 110,
      nutritionScore: 2,
      smokingCount: 15,
      stressLevel: 9,
      moodScore: 2,
      bloodPressureSys: 160,
      bloodGlucose: 200,
      outdoorMinutes: 5,
      screenTimeHours: 14,
    })
    expect(result.total).toBeLessThanOrEqual(40)
  })

  test('confidence reflects filled fields', () => {
    const result = scoreBreakdown({ sleepHours: 7, exerciseMinutes: 30 })
    expect(result.confidence).toBeGreaterThan(0)
    expect(result.confidence).toBeLessThan(100)
  })
})

describe('healthRank', () => {
  test('returns correct ranks for score thresholds', () => {
    expect(healthRank(90)).toBe('Excellent')
    expect(healthRank(86)).toBe('Excellent')
    expect(healthRank(80)).toBe('Healthy')
    expect(healthRank(72)).toBe('Healthy')
    expect(healthRank(65)).toBe('Watch')
    expect(healthRank(58)).toBe('Watch')
    expect(healthRank(50)).toBe('At Risk')
    expect(healthRank(0)).toBe('At Risk')
  })
})

describe('trendDirection', () => {
  test('detects up, down, flat', () => {
    expect(trendDirection(8, 6)).toBe('up')
    expect(trendDirection(5, 8)).toBe('down')
    expect(trendDirection(7, 7)).toBe('flat')
    expect(trendDirection(null, 5)).toBe('flat')
    expect(trendDirection(5, null)).toBe('flat')
  })
})

describe('metricAnomalies', () => {
  test('detects sleep dip vs baseline', () => {
    const flags = metricAnomalies({ sleepHours: 8, steps: null }, { sleepHours: 5 })
    expect(flags).toContain('Sleep dipped sharply vs weekly baseline')
  })

  test('detects step drop', () => {
    const flags = metricAnomalies({ sleepHours: null, steps: 10000 }, { steps: 3000 })
    expect(flags).toContain('Step count dropped materially today')
  })

  test('detects elevated heart rate', () => {
    const flags = metricAnomalies({}, { heartRate: 100 })
    expect(flags).toContain('Heart rate is elevated')
  })

  test('detects stress + sleep combo', () => {
    const flags = metricAnomalies({}, { stressLevel: 9, sleepHours: 4 })
    expect(flags).toContain('High stress combined with sleep deficit')
  })

  test('cross-references family history', () => {
    const fh = { conditions: [{ condition: 'Diabetes Type 2', relation: 'Father' }] }
    const flags = metricAnomalies({}, { bloodGlucose: 110 }, fh)
    expect(flags).toContain('Glucose elevated with family history of diabetes')
  })

  test('returns empty for healthy values', () => {
    const flags = metricAnomalies({ sleepHours: 7, steps: 8000 }, { sleepHours: 7.5, steps: 9000, heartRate: 65 })
    expect(flags).toEqual([])
  })
})

describe('supplementAdherence', () => {
  test('calculates adherence rate', () => {
    const records = [
      { supplements: [{ name: 'NAC', taken: true }, { name: 'Glycine', taken: true }] },
      { supplements: [{ name: 'NAC', taken: true }, { name: 'Glycine', taken: false }] },
      { supplements: [{ name: 'NAC', taken: false }, { name: 'Glycine', taken: true }] },
    ]
    const result = supplementAdherence(records, 3)
    const nac = result.find((r) => r.name === 'NAC')
    const glycine = result.find((r) => r.name === 'Glycine')
    expect(nac.taken).toBe(2)
    expect(nac.rate).toBe(67)
    expect(glycine.taken).toBe(2)
  })

  test('returns empty for no supplement data', () => {
    expect(supplementAdherence([])).toEqual([])
  })
})

describe('computeAnalytics', () => {
  test('computes averages and trends', () => {
    const records = []
    for (let i = 0; i < 14; i++) {
      records.push({
        sleepHours: i < 7 ? 8 : 6,
        steps: i < 7 ? 10000 : 7000,
        heartRate: 65,
        exerciseMinutes: 40,
      })
    }
    const result = computeAnalytics(records)
    expect(result.last7Avg.sleepHours).toBe(8)
    expect(result.prev7Avg.sleepHours).toBe(6)
    expect(result.trends.sleepHours).toBe('up')
  })
})
