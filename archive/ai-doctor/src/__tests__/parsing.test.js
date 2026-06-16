import { describe, expect, test } from 'vitest'
import { parseHealthText } from '../utils/parsing'

describe('parseHealthText', () => {
  test('extracts common health fields', () => {
    const parsed = parseHealthText('Sleep 7.5 hours Steps: 9821 Heart Rate 62 Exercise Minutes 35')
    expect(parsed.sleepHours).toBe(7.5)
    expect(parsed.steps).toBe(9821)
    expect(parsed.heartRate).toBe(62)
    expect(parsed.exerciseMinutes).toBe(35)
  })

  test('returns nulls when absent', () => {
    const parsed = parseHealthText('random text')
    expect(parsed.sleepHours).toBeNull()
    expect(parsed.steps).toBeNull()
  })
})
