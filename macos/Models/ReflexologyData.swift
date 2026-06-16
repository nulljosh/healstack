import SwiftUI

enum BodySystem: String, CaseIterable, Identifiable {
    case digestive, respiratory, nervous, circulatory, musculoskeletal
    case endocrine, urinary, reproductive, sensory, immune

    var id: String { rawValue }

    var color: Color {
        switch self {
        case .digestive: .green
        case .respiratory: Color(red: 0.306, green: 0.612, blue: 0.843)
        case .nervous: Color(red: 0.831, green: 0.659, blue: 0.263)
        case .circulatory: Color(red: 0.769, green: 0.251, blue: 0.251)
        case .musculoskeletal: Color(red: 0.545, green: 0.424, blue: 0.757)
        case .endocrine: Color(red: 0.831, green: 0.541, blue: 0.263)
        case .urinary: Color(red: 0.306, green: 0.804, blue: 0.843)
        case .reproductive: Color(red: 0.843, green: 0.306, blue: 0.541)
        case .sensory: Color(red: 0.424, green: 0.757, blue: 0.545)
        case .immune: Color(red: 0.722, green: 0.757, blue: 0.424)
        }
    }
}

struct ReflexZone: Identifiable {
    let id: String
    let name: String
    let organ: String
    let system: BodySystem
    let location: String
    let technique: String
    let duration: String
    let benefits: [String]
    let pathData: String
}

let footZones: [ReflexZone] = [
    ReflexZone(id: "brain", name: "Brain", organ: "Brain & Head", system: .nervous,
               location: "Tips of all toes",
               technique: "Thumb-walk across each toe tip with firm, rolling pressure",
               duration: "1-2 minutes per foot",
               benefits: ["Mental clarity", "Headache relief", "Improved concentration"],
               pathData: "M 140,30 C 145,20 155,15 160,20 L 165,35 C 162,40 148,40 140,30 Z"),
    ReflexZone(id: "sinuses", name: "Sinuses", organ: "Sinus Cavities", system: .respiratory,
               location: "Sides and bottoms of toes 2-5",
               technique: "Squeeze and roll each toe between thumb and index finger",
               duration: "30 seconds per toe",
               benefits: ["Sinus relief", "Reduced congestion", "Clearer breathing"],
               pathData: "M 165,35 C 170,25 180,22 185,28 L 188,42 C 185,48 170,48 165,38 Z"),
    ReflexZone(id: "eyes", name: "Eyes", organ: "Eyes", system: .sensory,
               location: "Base of toes 2 and 3",
               technique: "Press firmly at the base crease of the 2nd and 3rd toes",
               duration: "1 minute each side",
               benefits: ["Eye strain relief", "Improved vision support", "Reduced tension"],
               pathData: "M 155,50 C 158,45 168,44 172,50 C 175,55 160,58 155,50 Z"),
    ReflexZone(id: "ears", name: "Ears", organ: "Ears & Hearing", system: .sensory,
               location: "Base of toes 4 and 5",
               technique: "Press and rotate at the base of 4th and 5th toes",
               duration: "1 minute each side",
               benefits: ["Ear pressure relief", "Tinnitus support", "Balance improvement"],
               pathData: "M 180,50 C 183,45 193,44 196,50 C 199,55 185,58 180,50 Z"),
    ReflexZone(id: "thyroid", name: "Thyroid", organ: "Thyroid Gland", system: .endocrine,
               location: "Ball of the foot, beneath the big toe",
               technique: "Deep circular pressure with the thumb pad",
               duration: "2 minutes per foot",
               benefits: ["Metabolism support", "Energy regulation", "Hormonal balance"],
               pathData: "M 130,65 C 135,58 150,55 158,62 C 162,68 140,75 130,65 Z"),
    ReflexZone(id: "lungs", name: "Lungs", organ: "Lungs & Bronchial", system: .respiratory,
               location: "Ball of the foot, upper area",
               technique: "Thumb-walk across the ball of the foot in horizontal lines",
               duration: "2-3 minutes per foot",
               benefits: ["Deeper breathing", "Chest tension relief", "Respiratory support"],
               pathData: "M 140,75 C 145,68 185,65 195,75 C 200,82 195,95 185,92 L 145,92 C 135,90 135,82 140,75 Z"),
    ReflexZone(id: "heart", name: "Heart", organ: "Heart", system: .circulatory,
               location: "Upper ball of the left foot only",
               technique: "Gentle circular pressure -- never press too hard",
               duration: "1 minute, left foot only",
               benefits: ["Circulation support", "Blood pressure regulation", "Stress reduction"],
               pathData: "M 140,80 C 143,75 155,74 158,80 C 161,86 145,90 140,80 Z"),
    ReflexZone(id: "shoulder", name: "Shoulder", organ: "Shoulder Joint", system: .musculoskeletal,
               location: "Outer edge of the foot below the little toe",
               technique: "Press and rotate along the outer foot edge",
               duration: "1-2 minutes",
               benefits: ["Shoulder tension relief", "Improved range of motion", "Pain reduction"],
               pathData: "M 195,70 C 200,65 210,68 212,75 C 214,82 205,88 198,85 Z"),
    ReflexZone(id: "solar-plexus", name: "Solar Plexus", organ: "Solar Plexus / Diaphragm", system: .nervous,
               location: "Center of the foot, just below the ball",
               technique: "Deep thumb press, hold for 5-10 seconds, release slowly",
               duration: "1-2 minutes per foot",
               benefits: ["Deep relaxation", "Anxiety relief", "Stress reduction"],
               pathData: "M 155,100 C 160,95 175,95 180,100 C 185,108 165,115 155,100 Z"),
    ReflexZone(id: "stomach", name: "Stomach", organ: "Stomach", system: .digestive,
               location: "Inner arch area, left foot primarily",
               technique: "Thumb-walk in an arc pattern across the inner arch",
               duration: "2 minutes per foot",
               benefits: ["Improved digestion", "Nausea relief", "Appetite regulation"],
               pathData: "M 130,100 C 135,95 152,95 155,102 C 158,110 140,118 130,108 Z"),
    ReflexZone(id: "liver", name: "Liver", organ: "Liver & Gallbladder", system: .digestive,
               location: "Right foot, middle of the arch",
               technique: "Firm thumb pressure in diagonal lines",
               duration: "2 minutes, right foot",
               benefits: ["Detoxification support", "Bile flow support", "Metabolic aid"],
               pathData: "M 165,105 C 170,98 195,100 198,108 C 200,115 175,120 165,112 Z"),
    ReflexZone(id: "kidneys", name: "Kidneys", organ: "Kidneys", system: .urinary,
               location: "Center of the arch",
               technique: "Deep, sustained thumb pressure rotating slowly",
               duration: "2 minutes per foot",
               benefits: ["Fluid balance", "Toxin elimination", "Energy restoration"],
               pathData: "M 150,120 C 155,115 175,115 180,122 C 184,130 160,135 150,125 Z"),
    ReflexZone(id: "intestines", name: "Intestines", organ: "Small & Large Intestine", system: .digestive,
               location: "Lower arch and mid-foot area",
               technique: "Thumb-walk in overlapping horizontal lines across the arch",
               duration: "3-4 minutes per foot",
               benefits: ["Bowel regularity", "Nutrient absorption", "Bloating relief"],
               pathData: "M 135,135 C 140,128 195,128 200,138 C 205,148 145,160 135,148 Z"),
    ReflexZone(id: "bladder", name: "Bladder", organ: "Bladder", system: .urinary,
               location: "Inner edge of the foot, near the heel",
               technique: "Press with the thumb pad and hold",
               duration: "1 minute per foot",
               benefits: ["Urinary support", "Fluid balance", "Pelvic floor support"],
               pathData: "M 128,158 C 132,152 148,152 152,160 C 155,168 138,172 128,162 Z"),
    ReflexZone(id: "sciatic", name: "Sciatic Nerve", organ: "Sciatic Nerve", system: .nervous,
               location: "Across the heel pad",
               technique: "Deep thumb pressure across the widest part of the heel",
               duration: "2-3 minutes per foot",
               benefits: ["Sciatic pain relief", "Lower back support", "Leg tension relief"],
               pathData: "M 135,170 C 140,165 192,165 198,175 C 202,185 200,200 190,205 C 175,210 150,210 140,205 C 130,200 128,180 135,170 Z"),
    ReflexZone(id: "spine", name: "Spine", organ: "Spinal Column", system: .musculoskeletal,
               location: "Inner edge of the foot, from big toe to heel",
               technique: "Thumb-walk along the entire inner arch in one smooth line",
               duration: "3-5 minutes per foot",
               benefits: ["Spinal alignment support", "Back pain relief", "Posture improvement"],
               pathData: "M 125,55 C 122,70 120,100 118,130 C 117,150 120,170 128,190 L 132,190 C 126,170 122,150 123,130 C 125,100 127,70 130,55 Z"),
]

let handZones: [ReflexZone] = [
    ReflexZone(id: "h-brain", name: "Brain", organ: "Brain & Head", system: .nervous,
               location: "Tip of the thumb",
               technique: "Firm press and rotate on the thumb tip pad",
               duration: "1-2 minutes per hand",
               benefits: ["Mental clarity", "Headache relief", "Focus improvement"],
               pathData: "M 68,40 C 62,28 55,20 60,15 C 65,10 78,14 82,22 C 86,30 80,42 75,48 Z"),
    ReflexZone(id: "h-sinuses", name: "Sinuses", organ: "Sinus Cavities", system: .respiratory,
               location: "Tips of fingers 2-5",
               technique: "Squeeze each fingertip firmly between thumb and forefinger",
               duration: "30 seconds per finger",
               benefits: ["Sinus pressure relief", "Nasal congestion", "Clearer breathing"],
               pathData: "M 118,12 C 122,5 130,3 134,8 L 136,20 C 133,25 120,24 118,16 Z"),
    ReflexZone(id: "h-eyes", name: "Eyes", organ: "Eyes", system: .sensory,
               location: "Base of index and middle finger",
               technique: "Press the groove between the finger bases",
               duration: "1 minute per hand",
               benefits: ["Eye strain relief", "Visual fatigue", "Tension reduction"],
               pathData: "M 108,55 C 112,48 125,47 130,54 C 134,60 118,65 108,55 Z"),
    ReflexZone(id: "h-thyroid", name: "Thyroid", organ: "Thyroid Gland", system: .endocrine,
               location: "Base of the thumb, fleshy mound",
               technique: "Deep circular thumb pressure on the thenar eminence",
               duration: "2 minutes per hand",
               benefits: ["Metabolism support", "Hormonal balance", "Energy regulation"],
               pathData: "M 72,65 C 78,58 95,56 100,65 C 104,72 85,78 72,68 Z"),
    ReflexZone(id: "h-lungs", name: "Lungs", organ: "Lungs & Chest", system: .respiratory,
               location: "Ball of the hand beneath the fingers",
               technique: "Thumb-walk across the upper palm in horizontal rows",
               duration: "2 minutes per hand",
               benefits: ["Respiratory support", "Chest tension relief", "Deeper breathing"],
               pathData: "M 100,68 C 105,60 145,58 152,68 C 158,78 150,88 140,88 L 108,88 C 98,88 95,78 100,68 Z"),
    ReflexZone(id: "h-heart", name: "Heart", organ: "Heart", system: .circulatory,
               location: "Left palm, below the ring finger",
               technique: "Gentle circular pressure, never too forceful",
               duration: "1 minute, left hand",
               benefits: ["Circulation support", "Calming effect", "Blood pressure regulation"],
               pathData: "M 136,75 C 139,70 150,70 153,76 C 156,82 143,86 136,78 Z"),
    ReflexZone(id: "h-stomach", name: "Stomach", organ: "Stomach & Digestion", system: .digestive,
               location: "Center of the palm",
               technique: "Deep circular pressure clockwise in the palm center",
               duration: "2 minutes per hand",
               benefits: ["Digestive aid", "Nausea relief", "Appetite balance"],
               pathData: "M 100,92 C 105,85 140,84 145,94 C 150,104 115,110 100,98 Z"),
    ReflexZone(id: "h-kidneys", name: "Kidneys", organ: "Kidneys", system: .urinary,
               location: "Center-lower palm",
               technique: "Sustained deep pressure with thumb",
               duration: "1-2 minutes per hand",
               benefits: ["Fluid balance", "Detoxification", "Energy restoration"],
               pathData: "M 108,108 C 112,102 135,102 140,110 C 144,118 120,122 108,112 Z"),
    ReflexZone(id: "h-intestines", name: "Intestines", organ: "Intestines", system: .digestive,
               location: "Lower palm above the wrist",
               technique: "Thumb-walk in small overlapping rows",
               duration: "2-3 minutes per hand",
               benefits: ["Bowel regularity", "Reduced bloating", "Better absorption"],
               pathData: "M 95,120 C 100,114 145,114 150,125 C 155,135 108,142 95,130 Z"),
    ReflexZone(id: "h-spine", name: "Spine", organ: "Spinal Column", system: .musculoskeletal,
               location: "Outer edge of the thumb, from tip to wrist",
               technique: "Thumb-walk along the entire edge",
               duration: "2-3 minutes per hand",
               benefits: ["Back pain relief", "Spinal support", "Posture improvement"],
               pathData: "M 62,48 C 58,55 55,75 56,95 C 57,110 60,125 65,140 L 70,138 C 66,125 62,110 62,95 C 62,75 64,58 68,48 Z"),
    ReflexZone(id: "h-solar-plexus", name: "Solar Plexus", organ: "Solar Plexus", system: .nervous,
               location: "Exact center of the palm",
               technique: "Deep press and hold for 10 seconds, release, repeat",
               duration: "1-2 minutes per hand",
               benefits: ["Deep relaxation", "Anxiety relief", "Stress reduction"],
               pathData: "M 115,95 C 118,90 132,90 135,96 C 138,102 122,106 115,98 Z"),
]
