import Foundation

struct FacemaxxingProtocol: Identifiable, Hashable {
    let id: String
    let title: String
    let category: String
    let difficulty: String
    let summary: String
    let steps: [String]
    let notes: String
    let psl: [String]
}

enum FacemaxxingData {
    static let categories = ["Posture", "Muscle", "Recovery", "Diet", "Skin", "Light", "Style", "Body"]
    static let pslDimensions = ["Harmony", "Dimorphism", "Angularity", "Misc"]

    static let protocols: [FacemaxxingProtocol] = [
        .init(id: "mewing", title: "Mewing", category: "Posture", difficulty: "Daily habit",
              summary: "Tongue posture against the palate to support midface and jawline development.",
              steps: [
                "Rest the entire tongue (not just the tip) flat against the roof of your mouth",
                "Keep teeth lightly touching, lips sealed",
                "Breathe through the nose at all times",
                "Hold posture during all idle moments",
              ],
              notes: "Originally from orthodontist John Mew. Adult bone remodelling is slow. Consistency over months.",
              psl: ["Harmony", "Angularity"]),
        .init(id: "chewing", title: "Hard Chewing", category: "Muscle", difficulty: "15 min/day",
              summary: "Mastic gum or jawliner to load the masseter and temporalis.",
              steps: [
                "Use mastic gum (Falim, Mastiha) or a silicone jawliner",
                "Chew evenly on both sides to avoid asymmetry",
                "10 to 20 minutes per session, 1 to 2 sessions per day",
                "Stop if you feel TMJ pain or clicking",
              ],
              notes: "Hypertrophies the masseter, sharpening the lower face outline.",
              psl: ["Angularity", "Dimorphism"]),
        .init(id: "posture", title: "Posture Reset", category: "Posture", difficulty: "5 min/day",
              summary: "Chin tucks, face pulls, thoracic extension to fix forward head posture.",
              steps: [
                "Chin tucks: 3 sets of 10, hold each rep 5 seconds",
                "Band face pulls: 3 sets of 15",
                "Doorway pec stretch: 30 seconds per side",
                "Wall angels: 3 sets of 10",
              ],
              notes: "Forward head posture flattens the jawline and shortens the neck. Single biggest side-profile lever.",
              psl: ["Harmony", "Angularity"]),
        .init(id: "sleep", title: "Sleep Hygiene", category: "Recovery", difficulty: "Nightly",
              summary: "Sleep on your back to avoid asymmetry and morning puffiness.",
              steps: [
                "Sleep supine with a thin pillow",
                "Tape mouth shut to enforce nasal breathing",
                "7 to 9 hours, dark room, cool temperature",
                "No screens 30 minutes before bed",
              ],
              notes: "Side sleeping compresses one side of the face for hours. Stomach sleeping is the worst.",
              psl: ["Harmony", "Misc"]),
        .init(id: "hydration", title: "Hydration and Sodium", category: "Diet", difficulty: "Daily",
              summary: "Reduce facial bloat by managing water and salt intake.",
              steps: [
                "2 to 3 L water per day, more if active",
                "Cut processed foods and restaurant meals",
                "Cut alcohol -- destroys sleep and bloats the face",
                "Track sodium for one week",
              ],
              notes: "Bloat is the single biggest factor in face puffiness.",
              psl: ["Angularity", "Misc"]),
        .init(id: "skin", title: "Minimal Skincare", category: "Skin", difficulty: "5 min/day",
              summary: "Three-step routine: cleanse, moisturize, sunscreen.",
              steps: [
                "Morning: gentle cleanser, moisturizer, SPF 30+",
                "Night: gentle cleanser, moisturizer",
                "Add tretinoin or adapalene 2-3x/week after a month",
                "Avoid harsh scrubs and alcohol toners",
              ],
              notes: "Sunscreen is non-negotiable. UV is the primary driver of skin ageing.",
              psl: ["Misc"]),
        .init(id: "sun", title: "Sun Exposure", category: "Light", difficulty: "Daily",
              summary: "Morning sunlight for circadian rhythm. Protect the face from UV.",
              steps: [
                "10 to 20 minutes of morning sun on the body, not the face",
                "Wear SPF and a hat at midday",
                "Get vitamin D blood test annually",
                "Supplement D3 + K2 if deficient",
              ],
              notes: "Morning light anchors circadian rhythm. Midday face sun ages you.",
              psl: ["Misc"]),
        .init(id: "diet", title: "Anti-Inflammatory Diet", category: "Diet", difficulty: "Daily",
              summary: "Reduce systemic inflammation that shows in the face.",
              steps: [
                "Cut seed oils, refined sugar, ultra-processed foods",
                "Eat whole foods: meat, fish, eggs, vegetables, fruit, rice",
                "Omega 3: 2g EPA+DHA per day",
                "Identify food sensitivities",
              ],
              notes: "Acne, puffy eyes, dull skin are often dietary.",
              psl: ["Misc", "Angularity"]),
        .init(id: "grooming", title: "Grooming", category: "Style", difficulty: "Weekly",
              summary: "Free wins from haircut, brows, and facial hair shaping.",
              steps: [
                "Get a haircut that fits your face shape",
                "Trim eyebrows, clean unibrow only",
                "Define jawline with stubble or shaved-clean",
                "Whiten teeth -- strips 2 weeks, 1x/year",
              ],
              notes: "Highest-leverage day in facemaxxing is the day you get a great haircut.",
              psl: ["Harmony", "Misc"]),
        .init(id: "lean", title: "Get Lean", category: "Body", difficulty: "Months",
              summary: "Body fat below 15% reveals jawline, cheekbones, orbital bones.",
              steps: [
                "Maintenance calories minus 300 to 500",
                "Protein: 1g per pound of goal bodyweight",
                "Lift weights 3 to 4 days per week",
                "Walk 8000+ steps daily",
              ],
              notes: "Most face fat is body fat. No spot reduction. Get lean and the face follows.",
              psl: ["Angularity", "Dimorphism"]),
    ]
}
