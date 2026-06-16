import { describe, expect, test } from 'vitest'
import { calculateStreak, evaluateRisk } from '../utils/healthLogic'

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
})
