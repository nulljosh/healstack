export const meridians = [
  {
    id: 'lung',
    name: 'Lung',
    abbr: 'LU',
    color: '#4e9cd7',
    points: [
      { id: 'LU-1', name: 'Zhongfu', english: 'Central Treasury', location: 'Lateral chest, 1 cun below the clavicle, 6 cun lateral to midline', indications: ['Cough', 'Asthma', 'Chest pain', 'Shoulder pain'], technique: 'Perpendicular press, 0.5-0.8 cun depth equivalent pressure' },
      { id: 'LU-5', name: 'Chize', english: 'Cubit Marsh', location: 'Elbow crease, radial side of the biceps tendon', indications: ['Cough', 'Asthma', 'Elbow pain', 'Fever'], technique: 'Press with thumb perpendicular to the arm, moderate pressure' },
      { id: 'LU-7', name: 'Lieque', english: 'Broken Sequence', location: '1.5 cun above the wrist crease, radial side', indications: ['Headache', 'Neck stiffness', 'Cough', 'Sore throat'], technique: 'Press with thumbnail obliquely toward the elbow' },
      { id: 'LU-9', name: 'Taiyuan', english: 'Great Abyss', location: 'Wrist crease, radial side of the radial artery', indications: ['Cough', 'Asthma', 'Wrist pain', 'Palpitations'], technique: 'Gentle press avoiding the artery, circular motion' }
    ]
  },
  {
    id: 'large-intestine',
    name: 'Large Intestine',
    abbr: 'LI',
    color: '#3d9e6a',
    points: [
      { id: 'LI-4', name: 'Hegu', english: 'Joining Valley', location: 'Dorsum of hand, between 1st and 2nd metacarpal bones, midpoint', indications: ['Headache', 'Toothache', 'Facial pain', 'Common cold', 'Constipation'], technique: 'Firm thumb pressure toward the 2nd metacarpal bone. AVOID during pregnancy.' },
      { id: 'LI-10', name: 'Shousanli', english: 'Arm Three Miles', location: '2 cun below the elbow crease, on the radial side', indications: ['Elbow pain', 'Arm weakness', 'Abdominal pain', 'Diarrhea'], technique: 'Firm perpendicular pressure with thumb' },
      { id: 'LI-11', name: 'Quchi', english: 'Pool at the Crook', location: 'Lateral end of the elbow crease when arm is flexed', indications: ['Fever', 'Sore throat', 'Skin conditions', 'Elbow pain', 'Hypertension'], technique: 'Press firmly into the depression at the lateral elbow crease' },
      { id: 'LI-20', name: 'Yingxiang', english: 'Welcome Fragrance', location: 'Beside the nostril, in the nasolabial groove', indications: ['Nasal congestion', 'Sinusitis', 'Loss of smell', 'Facial paralysis'], technique: 'Press inward and slightly upward beside each nostril' }
    ]
  },
  {
    id: 'stomach',
    name: 'Stomach',
    abbr: 'ST',
    color: '#d4a843',
    points: [
      { id: 'ST-25', name: 'Tianshu', english: 'Celestial Pivot', location: '2 cun lateral to the navel', indications: ['Abdominal pain', 'Diarrhea', 'Constipation', 'Bloating'], technique: 'Moderate perpendicular pressure beside the navel' },
      { id: 'ST-36', name: 'Zusanli', english: 'Leg Three Miles', location: '3 cun below the knee, 1 finger-width lateral to the tibia', indications: ['Stomach pain', 'Fatigue', 'Nausea', 'Immune support', 'General wellness'], technique: 'Firm perpendicular pressure. One of the most important points in all of TCM.' },
      { id: 'ST-40', name: 'Fenglong', english: 'Abundant Bulge', location: 'Midway between the knee and ankle, 2 finger-widths lateral to the tibia', indications: ['Phlegm conditions', 'Cough', 'Dizziness', 'Headache'], technique: 'Firm perpendicular pressure into the muscle belly' },
      { id: 'ST-44', name: 'Neiting', english: 'Inner Court', location: 'Web between the 2nd and 3rd toes, proximal to the margin', indications: ['Toothache', 'Nosebleed', 'Stomach pain', 'Foot pain'], technique: 'Press firmly into the web space between the toes' }
    ]
  },
  {
    id: 'spleen',
    name: 'Spleen',
    abbr: 'SP',
    color: '#d48a43',
    points: [
      { id: 'SP-6', name: 'Sanyinjiao', english: 'Three Yin Intersection', location: '3 cun above the medial malleolus, posterior to the tibia', indications: ['Menstrual issues', 'Digestive problems', 'Insomnia', 'Fatigue'], technique: 'Moderate perpendicular pressure. AVOID during pregnancy.' },
      { id: 'SP-9', name: 'Yinlingquan', english: 'Yin Mound Spring', location: 'Depression below the medial condyle of the tibia', indications: ['Knee pain', 'Edema', 'Urinary issues', 'Abdominal distension'], technique: 'Press into the depression below the knee on the inner leg' },
      { id: 'SP-10', name: 'Xuehai', english: 'Sea of Blood', location: '2 cun above the upper border of the patella, on the vastus medialis', indications: ['Skin conditions', 'Menstrual issues', 'Knee pain', 'Itching'], technique: 'Press firmly into the muscle bulk on the inner thigh above the knee' }
    ]
  },
  {
    id: 'heart',
    name: 'Heart',
    abbr: 'HT',
    color: '#c44040',
    points: [
      { id: 'HT-3', name: 'Shaohai', english: 'Lesser Sea', location: 'Medial end of the elbow crease when arm is flexed', indications: ['Elbow pain', 'Arm numbness', 'Anxiety', 'Heart pain'], technique: 'Press into the depression at the medial elbow with moderate pressure' },
      { id: 'HT-7', name: 'Shenmen', english: 'Spirit Gate', location: 'Wrist crease, ulnar side, radial to the pisiform bone', indications: ['Insomnia', 'Anxiety', 'Palpitations', 'Poor memory', 'Emotional instability'], technique: 'Gentle press with thumb on the inner wrist crease. Premier calming point.' }
    ]
  },
  {
    id: 'pericardium',
    name: 'Pericardium',
    abbr: 'PC',
    color: '#d74e8a',
    points: [
      { id: 'PC-6', name: 'Neiguan', english: 'Inner Pass', location: '2 cun above the wrist crease, between the tendons', indications: ['Nausea', 'Vomiting', 'Motion sickness', 'Anxiety', 'Chest pain', 'Palpitations'], technique: 'Press between the two tendons on the inner forearm. Anti-nausea point.' },
      { id: 'PC-8', name: 'Laogong', english: 'Palace of Toil', location: 'Center of the palm, between 2nd and 3rd metacarpal bones', indications: ['Anxiety', 'Mouth sores', 'Bad breath', 'Hand tremors'], technique: 'Press the center of the palm with the opposite thumb' }
    ]
  },
  {
    id: 'kidney',
    name: 'Kidney',
    abbr: 'KI',
    color: '#4ecdd7',
    points: [
      { id: 'KI-1', name: 'Yongquan', english: 'Bubbling Spring', location: 'Sole of the foot, in the depression when toes are curled', indications: ['Emergency revival', 'Headache', 'Dizziness', 'Insomnia', 'Hot flashes'], technique: 'Firm pressure into the sole depression. Lowest point on the body.' },
      { id: 'KI-3', name: 'Taixi', english: 'Great Ravine', location: 'Depression between the medial malleolus and Achilles tendon', indications: ['Sore throat', 'Toothache', 'Insomnia', 'Lower back pain', 'Kidney support'], technique: 'Press into the depression behind the inner ankle bone' },
      { id: 'KI-27', name: 'Shufu', english: 'Shu Mansion', location: 'Depression below the clavicle, 2 cun lateral to the midline', indications: ['Cough', 'Asthma', 'Chest tightness', 'Breathing difficulty'], technique: 'Press into the hollow beneath the collarbone' }
    ]
  },
  {
    id: 'gallbladder',
    name: 'Gallbladder',
    abbr: 'GB',
    color: '#6cc18b',
    points: [
      { id: 'GB-20', name: 'Fengchi', english: 'Wind Pool', location: 'Below the occiput, in the depression between the SCM and trapezius', indications: ['Headache', 'Neck stiffness', 'Dizziness', 'Eye problems', 'Common cold'], technique: 'Press upward toward the opposite eye. Major headache point.' },
      { id: 'GB-21', name: 'Jianjing', english: 'Shoulder Well', location: 'Midpoint of the line from C7 spinous process to the acromion', indications: ['Shoulder pain', 'Neck stiffness', 'Headache', 'Difficult labor'], technique: 'Press downward firmly. AVOID during pregnancy.' },
      { id: 'GB-34', name: 'Yanglingquan', english: 'Yang Mound Spring', location: 'Depression anterior and inferior to the head of the fibula', indications: ['Knee pain', 'Muscle cramps', 'Sciatica', 'Rib pain', 'Tendon issues'], technique: 'Press into the depression below and in front of the fibula head' }
    ]
  },
  {
    id: 'liver',
    name: 'Liver',
    abbr: 'LR',
    color: '#8b6cc1',
    points: [
      { id: 'LR-3', name: 'Taichong', english: 'Great Surge', location: 'Dorsum of the foot, in the depression between the 1st and 2nd metatarsals', indications: ['Stress', 'Anger', 'Headache', 'Eye problems', 'Menstrual issues', 'Hypertension'], technique: 'Press firmly between the 1st and 2nd toe bones toward the ankle. Major stress point.' },
      { id: 'LR-14', name: 'Qimen', english: 'Cycle Gate', location: 'Directly below the nipple, in the 6th intercostal space', indications: ['Chest pain', 'Rib pain', 'Hiccup', 'Liver support'], technique: 'Press between the ribs with moderate pressure' }
    ]
  },
  {
    id: 'governing',
    name: 'Governing Vessel',
    abbr: 'GV',
    color: '#b8c16c',
    points: [
      { id: 'GV-20', name: 'Baihui', english: 'Hundred Meetings', location: 'Top of the head, at the intersection of midline and ear apex line', indications: ['Headache', 'Dizziness', 'Mental clarity', 'Prolapse', 'Insomnia'], technique: 'Press directly downward on the crown of the head' },
      { id: 'GV-26', name: 'Renzhong', english: 'Water Trough', location: 'Upper lip, at the junction of the upper and middle third of the philtrum', indications: ['Emergency consciousness', 'Fainting', 'Seizure', 'Low back pain'], technique: 'Press firmly upward into the philtrum. Emergency revival point.' }
    ]
  },
  {
    id: 'conception',
    name: 'Conception Vessel',
    abbr: 'CV',
    color: '#d74e8a',
    points: [
      { id: 'CV-4', name: 'Guanyuan', english: 'Origin Pass', location: '3 cun below the navel, on the midline', indications: ['Fatigue', 'Menstrual issues', 'Urinary problems', 'Fertility support'], technique: 'Warm palm pressure or gentle circular press below the navel' },
      { id: 'CV-6', name: 'Qihai', english: 'Sea of Qi', location: '1.5 cun below the navel, on the midline', indications: ['Fatigue', 'Abdominal pain', 'Edema', 'Overall energy boost'], technique: 'Warm, gentle sustained pressure. Key energy cultivation point.' },
      { id: 'CV-12', name: 'Zhongwan', english: 'Central Stomach', location: '4 cun above the navel, on the midline', indications: ['Stomach pain', 'Nausea', 'Vomiting', 'Bloating', 'Acid reflux'], technique: 'Gentle clockwise circular pressure above the navel' }
    ]
  }
]

export function getAllPoints() {
  return meridians.flatMap(m =>
    m.points.map(p => ({ ...p, meridian: m.name, meridianAbbr: m.abbr, meridianColor: m.color }))
  )
}
