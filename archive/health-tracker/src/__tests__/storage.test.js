import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const mockStorage = {}
beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: (key) => mockStorage[key] ?? null,
    setItem: (key, val) => { mockStorage[key] = val },
    removeItem: (key) => { delete mockStorage[key] },
  })
})
afterEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k])
  vi.restoreAllMocks()
})

describe('migrateV1toV2', () => {
  test('migrates v1 records to v2 format with null fields', async () => {
    const { migrateV1toV2 } = await import('../utils/storage')

    const v1Records = [
      { date: '2026-02-20', sleepHours: 7, exerciseMinutes: 30, nutritionScore: 8, smokingCount: 0 },
      { date: '2026-02-19', sleepHours: 6, exerciseMinutes: 45, nutritionScore: 7, smokingCount: 2 },
    ]
    mockStorage['health-tracker-records-v1'] = JSON.stringify(v1Records)

    const result = migrateV1toV2()
    expect(result).toHaveLength(2)
    expect(result[0].sleepHours).toBe(7)
    expect(result[0].steps).toBeNull()
    expect(result[0].heartRate).toBeNull()
    expect(result[0].stressLevel).toBeNull()
    expect(result[0].supplements).toEqual([])
    expect(result[0].notes).toBe('')
  })

  test('returns existing v2 if present', async () => {
    const { migrateV1toV2 } = await import('../utils/storage')

    const v2Records = [{ date: '2026-02-20', sleepHours: 8, steps: 10000 }]
    mockStorage['health-tracker-records-v2'] = JSON.stringify(v2Records)
    mockStorage['health-tracker-records-v1'] = JSON.stringify([{ date: '2026-02-20', sleepHours: 5 }])

    const result = migrateV1toV2()
    expect(result[0].sleepHours).toBe(8)
    expect(result[0].steps).toBe(10000)
  })

  test('returns empty array when no data exists', async () => {
    const { migrateV1toV2 } = await import('../utils/storage')
    expect(migrateV1toV2()).toEqual([])
  })
})

describe('loadRecords / saveRecords', () => {
  test('roundtrips records through localStorage', async () => {
    const { loadRecords, saveRecords } = await import('../utils/storage')

    const records = [{ date: '2026-02-21', sleepHours: 7.5 }]
    saveRecords(records)
    const loaded = loadRecords()
    expect(loaded).toEqual(records)
  })
})

describe('family history', () => {
  test('loads default when no data', async () => {
    const { loadFamilyHistory } = await import('../utils/storage')
    const fh = loadFamilyHistory()
    expect(fh.conditions).toEqual([])
    expect(fh.bloodType).toBe('')
  })

  test('saves and loads family history', async () => {
    const { loadFamilyHistory, saveFamilyHistory } = await import('../utils/storage')
    saveFamilyHistory({ conditions: [{ condition: 'Diabetes', relation: 'Father', ageOfOnset: 55 }], bloodType: 'O+' })
    const fh = loadFamilyHistory()
    expect(fh.conditions).toHaveLength(1)
    expect(fh.conditions[0].condition).toBe('Diabetes')
    expect(fh.bloodType).toBe('O+')
    expect(fh.updatedAt).toBeTruthy()
  })
})

describe('supplement stack', () => {
  test('loads empty array when no data', async () => {
    const { loadSupplementStack } = await import('../utils/storage')
    expect(loadSupplementStack()).toEqual([])
  })

  test('saves and loads supplement stack', async () => {
    const { loadSupplementStack, saveSupplementStack } = await import('../utils/storage')
    const stack = [{ name: 'NAC', defaultDoseMg: 1500, schedule: 'morning' }]
    saveSupplementStack(stack)
    expect(loadSupplementStack()).toEqual(stack)
  })
})
