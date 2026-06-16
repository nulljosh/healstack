import Foundation

struct Symptom: Identifiable {
    let id: String
    let name: String
    let icon: String
    let reflexZones: [String]
    let acuPoints: [String]
    let selfCare: String
}

let symptoms: [Symptom] = [
    Symptom(id: "headache", name: "Headache", icon: "head.profile", reflexZones: ["brain", "sinuses", "spine", "solar-plexus"], acuPoints: ["LI-4", "GB-20", "GV-20", "LR-3", "ST-44"],
            selfCare: "Apply firm pressure to LI-4 (Hegu) between thumb and index finger for 2-3 minutes. Follow with GB-20 at the base of the skull. For reflexology, work the big toe tips and the inner edge (spine reflex)."),
    Symptom(id: "back-pain", name: "Back Pain", icon: "figure.walk", reflexZones: ["spine", "sciatic", "kidneys", "shoulder"], acuPoints: ["GB-34", "KI-3", "GV-20", "SP-6"],
            selfCare: "Work the entire inner arch of the foot (spine reflex) with thumb-walking. For acupressure, press GB-34 below the fibula head and KI-3 behind the inner ankle. Hold each point 1-2 minutes."),
    Symptom(id: "insomnia", name: "Insomnia", icon: "moon.zzz", reflexZones: ["brain", "solar-plexus", "kidneys", "thyroid"], acuPoints: ["HT-7", "SP-6", "KI-1", "GV-20", "PC-6"],
            selfCare: "Press HT-7 (Shenmen) on the inner wrist crease for 2 minutes each hand before bed. Press KI-1 on the sole of each foot. Work the solar plexus reflex in the center of each foot with deep, slow pressure."),
    Symptom(id: "stress", name: "Stress & Anxiety", icon: "brain.head.profile", reflexZones: ["solar-plexus", "brain", "thyroid", "heart"], acuPoints: ["HT-7", "PC-6", "LR-3", "GV-20", "LI-4"],
            selfCare: "Start with the solar plexus reflex: press deep into the center of each foot and hold for 10 seconds, release, repeat 5 times. Then press LR-3 between the 1st and 2nd toe. Finish with HT-7 on each wrist."),
    Symptom(id: "digestive", name: "Digestive Issues", icon: "stomach", reflexZones: ["stomach", "intestines", "liver", "solar-plexus"], acuPoints: ["ST-36", "ST-25", "CV-12", "SP-6", "PC-6"],
            selfCare: "Press ST-36 (Zusanli) below the knee for 2-3 minutes each leg. For reflexology, thumb-walk the entire arch area covering stomach, intestines, and liver reflexes."),
    Symptom(id: "nausea", name: "Nausea", icon: "arrow.up.and.down.circle", reflexZones: ["stomach", "solar-plexus", "intestines"], acuPoints: ["PC-6", "ST-36", "CV-12"],
            selfCare: "PC-6 (Neiguan) is the single most effective anti-nausea point. Press between the two tendons on the inner forearm, 2 cun above the wrist crease. Hold for 2-3 minutes."),
    Symptom(id: "neck-shoulder", name: "Neck & Shoulder", icon: "figure.arms.open", reflexZones: ["shoulder", "spine", "brain"], acuPoints: ["GB-20", "GB-21", "LI-4", "LU-7"],
            selfCare: "Press GB-20 at the base of the skull on both sides. Follow with GB-21 at the top of the shoulder. For reflexology, work the shoulder reflex on the outer edge of each foot below the little toe."),
    Symptom(id: "fatigue", name: "Fatigue", icon: "bolt.slash", reflexZones: ["kidneys", "thyroid", "solar-plexus", "brain"], acuPoints: ["ST-36", "CV-6", "CV-4", "KI-3", "GV-20"],
            selfCare: "ST-36 (Zusanli) is the longevity point -- press firmly for 3 minutes each leg. Follow with CV-6 (Sea of Qi) below the navel with warm palm pressure. Work the kidney reflex in the center arch of each foot."),
    Symptom(id: "sinus", name: "Sinus Congestion", icon: "nose", reflexZones: ["sinuses", "lungs", "eyes"], acuPoints: ["LI-20", "LI-4", "LU-7", "GB-20"],
            selfCare: "Press LI-20 (Yingxiang) beside each nostril for immediate relief. Add LI-4 between thumb and index finger. For reflexology, squeeze and roll each toe (sinus reflexes) for 30 seconds each."),
    Symptom(id: "menstrual", name: "Menstrual Pain", icon: "circle.hexagongrid", reflexZones: ["bladder", "kidneys", "intestines", "solar-plexus"], acuPoints: ["SP-6", "SP-10", "LR-3", "CV-4", "ST-36"],
            selfCare: "SP-6 (Sanyinjiao) is the key point -- press 3 cun above the inner ankle for 2-3 minutes each leg. Add LR-3 between the 1st and 2nd toe. AVOID SP-6 and LI-4 during pregnancy."),
    Symptom(id: "eye-strain", name: "Eye Strain", icon: "eye", reflexZones: ["eyes", "brain", "kidneys"], acuPoints: ["GB-20", "LR-3", "LI-4"],
            selfCare: "Press the eye reflex at the base of the 2nd and 3rd toes on each foot. For acupressure, use GB-20 at the skull base and LR-3 on the foot."),
    Symptom(id: "knee-pain", name: "Knee Pain", icon: "figure.run", reflexZones: ["sciatic", "spine", "kidneys"], acuPoints: ["GB-34", "SP-9", "SP-10", "ST-36"],
            selfCare: "GB-34 below the fibula head is the master point for tendons and ligaments. Press SP-9 on the inner knee and ST-36 below the knee."),
]
