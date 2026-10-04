// One list of Browse categories and pinnable metrics. Mirror in Swift (ios/) so the platforms do not drift.
export const BROWSE = [
  { title: 'Medications', items: [['Library', '/substances'], ['Interactions', '/interactions'], ['Supplements', '/supplements'], ['Routine', '/routine']] },
  { title: 'Vitals', items: [['Biometrics', '/biometrics'], ['Insights', '/insights']] },
  { title: 'Health Records', items: [['Lab Results', '/lab-results']] },
  { title: 'Body', items: [['Body', '/body'], ['Bodywork', '/bodywork'], ['Feet', '/feet'], ['Hands', '/hands'], ['Abdomen', '/abdomen'], ['Meridians', '/meridians'], ['Face', '/facemaxxing']] },
  { title: 'Symptoms', items: [['Symptom Finder', '/symptom-finder'], ['Sessions', '/sessions']] },
];

export const PINNABLE = {
  heartRate: ['Heart Rate', 'bpm', '/biometrics'],
  sleep: ['Sleep', 'hr', '/biometrics'],
  steps: ['Steps', 'steps', '/biometrics'],
  activeEnergy: ['Active Energy', 'kcal', '/biometrics'],
  exerciseMin: ['Exercise', 'min', '/biometrics'],
  hrv: ['HRV', 'ms', '/biometrics'],
  bloodOxygen: ['Blood Oxygen', '%', '/biometrics'],
  weight: ['Weight', 'lbs', '/biometrics'],
  water: ['Water', 'oz', '/biometrics'],
  mindfulness: ['Mindfulness', 'min', '/biometrics'],
};
export const DEFAULT_PINS = ['heartRate', 'sleep', 'steps'];
