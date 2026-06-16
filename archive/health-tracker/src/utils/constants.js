export const CATEGORIES = {
  core: { label: 'Core', order: 0 },
  vitals: { label: 'Vitals', order: 1 },
  blood: { label: 'Blood Markers', order: 2 },
  mind: { label: 'Mind', order: 3 },
  supplements: { label: 'Supplements', order: 4 },
  environment: { label: 'Environment', order: 5 },
}

export const METRIC_FIELDS = [
  // Core
  { key: 'sleepHours', label: 'Sleep', unit: 'h', min: 0, max: 24, step: 0.5, default: 7, category: 'core' },
  { key: 'exerciseMinutes', label: 'Exercise', unit: 'min', min: 0, max: 600, step: 5, default: 30, category: 'core' },
  { key: 'nutritionScore', label: 'Nutrition', unit: '/10', min: 1, max: 10, step: 1, default: 7, category: 'core' },
  { key: 'smokingCount', label: 'Smoking', unit: '', min: 0, max: 100, step: 1, default: 0, category: 'core' },
  // Vitals
  { key: 'steps', label: 'Steps', unit: '', min: 0, max: 99999, step: 100, default: null, category: 'vitals' },
  { key: 'heartRate', label: 'Heart Rate', unit: 'bpm', min: 30, max: 220, step: 1, default: null, category: 'vitals' },
  { key: 'bloodPressureSys', label: 'BP Systolic', unit: 'mmHg', min: 60, max: 250, step: 1, default: null, category: 'vitals' },
  { key: 'bloodPressureDia', label: 'BP Diastolic', unit: 'mmHg', min: 30, max: 150, step: 1, default: null, category: 'vitals' },
  { key: 'weight', label: 'Weight', unit: 'lbs', min: 50, max: 500, step: 0.1, default: null, category: 'vitals' },
  // Blood Markers
  { key: 'bloodGlucose', label: 'Blood Glucose', unit: 'mg/dL', min: 30, max: 500, step: 1, default: null, category: 'blood' },
  { key: 'cholesterolTotal', label: 'Total Cholesterol', unit: 'mg/dL', min: 50, max: 400, step: 1, default: null, category: 'blood' },
  { key: 'cholesterolHDL', label: 'HDL', unit: 'mg/dL', min: 10, max: 150, step: 1, default: null, category: 'blood' },
  { key: 'cholesterolLDL', label: 'LDL', unit: 'mg/dL', min: 10, max: 300, step: 1, default: null, category: 'blood' },
  { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', min: 10, max: 1000, step: 1, default: null, category: 'blood' },
  // Mind
  { key: 'stressLevel', label: 'Stress', unit: '/10', min: 1, max: 10, step: 1, default: null, category: 'mind' },
  { key: 'moodScore', label: 'Mood', unit: '/10', min: 1, max: 10, step: 1, default: null, category: 'mind' },
  { key: 'anxietyLevel', label: 'Anxiety', unit: '/10', min: 1, max: 10, step: 1, default: null, category: 'mind' },
  // Environment
  { key: 'outdoorMinutes', label: 'Outdoor Time', unit: 'min', min: 0, max: 1440, step: 5, default: null, category: 'environment' },
  { key: 'screenTimeHours', label: 'Screen Time', unit: 'h', min: 0, max: 24, step: 0.5, default: null, category: 'environment' },
]

export function fieldsByCategory(category) {
  return METRIC_FIELDS.filter((f) => f.category === category)
}

export function fieldByKey(key) {
  return METRIC_FIELDS.find((f) => f.key === key)
}

export const SCORE_WEIGHTS = {
  sleepHours: { weight: 15, optimal: [7, 9], good: [6, 10] },
  exerciseMinutes: { weight: 15, thresholds: [45, 30, 15] },
  steps: { weight: 10, thresholds: [10000, 7000, 4000] },
  heartRate: { weight: 10, optimal: [55, 80], acceptable: [50, 90] },
  nutritionScore: { weight: 10, scale: 10 },
  smokingCount: { weight: 10, inverse: true, thresholds: [0, 3, 10] },
  stressLevel: { weight: 5, inverse: true, scale: 10 },
  moodScore: { weight: 5, scale: 10 },
  bloodPressureSys: { weight: 5, optimal: [90, 120], acceptable: [85, 140] },
  bloodGlucose: { weight: 5, optimal: [70, 100], acceptable: [60, 125] },
  outdoorMinutes: { weight: 5, thresholds: [60, 30, 15] },
  screenTimeHours: { weight: 5, inverse: true, thresholds: [4, 8, 12] },
}

export const RISK_THRESHOLDS = {
  bloodPressureSys: { high: 140, low: 90 },
  bloodPressureDia: { high: 90, low: 60 },
  heartRate: { high: 95, low: 45 },
  bloodGlucose: { high: 125, low: 70 },
  cholesterolTotal: { high: 240 },
  cholesterolLDL: { high: 160 },
  triglycerides: { high: 200 },
  stressLevel: { high: 8 },
  sleepHours: { low: 5 },
  smokingCount: { high: 10 },
}

export const RANK_THRESHOLDS = [
  { min: 86, label: 'Excellent' },
  { min: 72, label: 'Healthy' },
  { min: 58, label: 'Watch' },
  { min: 0, label: 'At Risk' },
]

export const DEFAULT_SUPPLEMENTS = [
  { name: 'NAC', defaultDoseMg: 1500, schedule: 'morning' },
  { name: 'Glycine', defaultDoseMg: 6000, schedule: 'evening' },
  { name: 'Vitamin D3', defaultDoseMg: 5000, schedule: 'morning' },
  { name: 'Magnesium', defaultDoseMg: 400, schedule: 'evening' },
  { name: 'Omega-3', defaultDoseMg: 2000, schedule: 'morning' },
]
