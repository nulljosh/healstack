const V1_KEY = 'health-tracker-records-v1'
const V2_KEY = 'health-tracker-records-v2'
const FAMILY_KEY = 'health-tracker-family-v1'
const SUPPLEMENTS_KEY = 'health-tracker-supplements-v1'

function safeLoad(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function safeSave(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

export function migrateV1toV2() {
  const v2 = safeLoad(V2_KEY)
  if (v2 && Array.isArray(v2) && v2.length > 0) return v2

  const v1 = safeLoad(V1_KEY)
  if (!v1 || !Array.isArray(v1)) return []

  const migrated = v1.map((entry) => ({
    date: entry.date,
    sleepHours: entry.sleepHours ?? null,
    exerciseMinutes: entry.exerciseMinutes ?? null,
    nutritionScore: entry.nutritionScore ?? null,
    smokingCount: entry.smokingCount ?? null,
    steps: null,
    heartRate: null,
    bloodPressureSys: null,
    bloodPressureDia: null,
    weight: null,
    bloodGlucose: null,
    cholesterolTotal: null,
    cholesterolHDL: null,
    cholesterolLDL: null,
    triglycerides: null,
    stressLevel: null,
    moodScore: null,
    anxietyLevel: null,
    supplements: [],
    outdoorMinutes: null,
    screenTimeHours: null,
    notes: '',
  }))

  safeSave(V2_KEY, migrated)
  return migrated
}

export function loadRecords() {
  const v2 = safeLoad(V2_KEY)
  if (v2 && Array.isArray(v2)) return v2
  return migrateV1toV2()
}

export function saveRecords(records) {
  safeSave(V2_KEY, records)
}

export function createEmptyRecord(date) {
  return {
    date,
    sleepHours: null,
    exerciseMinutes: null,
    nutritionScore: null,
    smokingCount: null,
    steps: null,
    heartRate: null,
    bloodPressureSys: null,
    bloodPressureDia: null,
    weight: null,
    bloodGlucose: null,
    cholesterolTotal: null,
    cholesterolHDL: null,
    cholesterolLDL: null,
    triglycerides: null,
    stressLevel: null,
    moodScore: null,
    anxietyLevel: null,
    supplements: [],
    outdoorMinutes: null,
    screenTimeHours: null,
    notes: '',
  }
}

// Family History
export function loadFamilyHistory() {
  const data = safeLoad(FAMILY_KEY)
  if (data && data.conditions) return data
  return { conditions: [], bloodType: '', updatedAt: null }
}

export function saveFamilyHistory(familyHistory) {
  safeSave(FAMILY_KEY, { ...familyHistory, updatedAt: new Date().toISOString() })
}

// Supplement Stack Template
export function loadSupplementStack() {
  const data = safeLoad(SUPPLEMENTS_KEY)
  if (data && Array.isArray(data)) return data
  return []
}

export function saveSupplementStack(stack) {
  safeSave(SUPPLEMENTS_KEY, stack)
}
