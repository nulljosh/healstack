import { describe, expect, test } from 'vitest'
import { calculateStreak, comparePeriods, evaluateRisk } from '../utils/healthLogic'

describe('calculateStreak', () => {
  test('returns 0 when there is no entry for today', () => {
    const records = [
      { date: '2026-02-19' },
      { date: '2026-02-18' }
    ]

    expect(calculateStreak(records, new Date('2026-02-21T12:00:00'))).toBe(0)
  })

  test('counts consecutive days including today', () => {
    const records = [
      { date: '2026-02-21' },
      { date: '2026-02-20' },
      { date: '2026-02-19' },
      { date: '2026-02-17' }
    ]

    expect(calculateStreak(records, new Date('2026-02-21T12:00:00'))).toBe(3)
  })
})

describe('evaluateRisk', () => {
  test('flags combined and extreme conditions', () => {
    const flags = evaluateRisk({
      sleepHours: 4,
      exerciseMinutes: 10,
      nutritionScore: 3,
      smokingCount: 11
    })

    expect(flags).toEqual([
      'Low sleep + high smoking',
      'Low activity + poor nutrition',
      'Very high smoking count',
      'Sleep deprivation risk'
    ])
  })

  test('returns no flags for balanced inputs', () => {
    const flags = evaluateRisk({
      sleepHours: 7,
      exerciseMinutes: 35,
      nutritionScore: 8,
      smokingCount: 0
    })

    expect(flags).toEqual([])
  })

  test('flags high blood pressure', () => {
    const flags = evaluateRisk({
      sleepHours: 7, exerciseMinutes: 30, nutritionScore: 7, smokingCount: 0,
      bloodPressureSys: 150, bloodPressureDia: 95,
    })
    expect(flags).toContain('High blood pressure (150/95 mmHg)')
    expect(flags).toContain('Diastolic pressure elevated')
  })

  test('flags elevated heart rate', () => {
    const flags = evaluateRisk({
      sleepHours: 7, exerciseMinutes: 30, nutritionScore: 7, smokingCount: 0,
      heartRate: 100,
    })
    expect(flags).toContain('Resting heart rate elevated (>95 bpm)')
  })

  test('flags stress combos', () => {
    const flags = evaluateRisk({
      sleepHours: 5, exerciseMinutes: 10, nutritionScore: 7, smokingCount: 0,
      stressLevel: 9,
    })
    expect(flags).toContain('Acute stress level')
    expect(flags).toContain('High stress + sleep deficit combination')
    expect(flags).toContain('High stress without exercise offset')
  })

  test('cross-references family history', () => {
    const fh = { conditions: [{ condition: 'Heart Disease', relation: 'Father' }] }
    const flags = evaluateRisk({
      sleepHours: 7, exerciseMinutes: 30, nutritionScore: 7, smokingCount: 3,
    }, fh)
    expect(flags).toContain('Smoking with family history of heart disease')
  })
})

describe('comparePeriods', () => {
  test('returns null when insufficient data', () => {
    expect(comparePeriods([])).toBeNull()
    expect(comparePeriods([{ sleepHours: 7 }])).toBeNull()
  })

  test('computes deltas between periods', () => {
    const records = []
    for (let i = 0; i < 14; i++) {
      records.push({ sleepHours: i < 7 ? 8 : 6 })
    }
    const result = comparePeriods(records)
    expect(result.sleepHours.recent).toBe(8)
    expect(result.sleepHours.prior).toBe(6)
    expect(result.sleepHours.delta).toBe(2)
  })
})
