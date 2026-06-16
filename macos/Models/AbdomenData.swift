import SwiftUI

struct AbdomenZone: Identifiable {
    let id: String
    let name: String
    let organ: String
    let system: BodySystem
    let location: String
    let technique: String
    let duration: String
    let benefits: [String]
    let conditions: String
    let referral: String
    let number: Int
}

let abdomenZones: [AbdomenZone] = [
    AbdomenZone(id: "epigastric", name: "Epigastric", organ: "Stomach / Pancreas", system: .digestive,
                location: "Upper center abdomen, below the sternum",
                technique: "Gentle clockwise circular pressure with palm. Press CV-12 (4 cun above navel) for 2 minutes.",
                duration: "2-3 minutes",
                benefits: ["Peptic ulcer assessment", "Pancreatitis awareness", "Digestive support"],
                conditions: "Peptic ulcer, Pancreatitis",
                referral: "Pain here may radiate to the back. Burning or gnawing quality suggests gastric origin. Seek medical attention if severe or persistent.",
                number: 1),
    AbdomenZone(id: "right-upper", name: "Right Upper", organ: "Liver / Gallbladder", system: .digestive,
                location: "Right upper quadrant, below the right rib cage",
                technique: "Press LR-14 between the ribs. Work the liver reflex on the right foot arch.",
                duration: "1-2 minutes",
                benefits: ["Hepatic awareness", "Gallbladder support", "Bile flow"],
                conditions: "Hepatitis, Cholecystitis",
                referral: "Pain may radiate to right shoulder (referred pain via phrenic nerve). Worse after fatty meals suggests gallbladder.",
                number: 2),
    AbdomenZone(id: "left-upper", name: "Left Upper", organ: "Spleen", system: .immune,
                location: "Left upper quadrant, below the left rib cage",
                technique: "Very gentle palpation only. Avoid deep pressure. Work SP-6 and SP-9 on the legs instead.",
                duration: "1 minute indirect",
                benefits: ["Splenic awareness", "Immune function", "Blood cell regulation"],
                conditions: "Splenic injury",
                referral: "Left upper quadrant pain radiating to left shoulder (Kehr sign) is a red flag for splenic injury. Seek emergency care if trauma-related.",
                number: 3),
    AbdomenZone(id: "left-flank", name: "Left Flank", organ: "Left Kidney / Ureter", system: .urinary,
                location: "Left side, between ribs and hip",
                technique: "Work the kidney reflex in the center arch of each foot. Press KI-3 behind the inner ankle.",
                duration: "2-3 minutes per side",
                benefits: ["Renal support", "Urinary flow", "Fluid balance"],
                conditions: "Renal and ureteric pain (left)",
                referral: "Colicky pain radiating from flank to groin suggests kidney stones. Constant dull ache may indicate infection.",
                number: 4),
    AbdomenZone(id: "periumbilical", name: "Periumbilical", organ: "Small Intestine", system: .digestive,
                location: "Central abdomen around the navel",
                technique: "Clockwise abdominal massage around the navel. Press ST-25 and CV-6.",
                duration: "3-5 minutes",
                benefits: ["Intestinal motility", "Obstruction awareness", "Core energy"],
                conditions: "Bowel obstruction (back pain)",
                referral: "Diffuse periumbilical pain with distension and vomiting may indicate bowel obstruction. Early appendicitis often starts periumbilical before migrating to RLQ.",
                number: 5),
    AbdomenZone(id: "right-flank", name: "Right Flank", organ: "Right Kidney / Ureter", system: .urinary,
                location: "Right side, between ribs and hip",
                technique: "Same approach as left flank. Work kidney reflexes bilaterally. Press KI-3 and KI-1.",
                duration: "2-3 minutes per side",
                benefits: ["Renal support", "Urinary flow", "Pain management"],
                conditions: "Renal and ureteric pain (right)",
                referral: "Right flank pain radiating to groin suggests renal colic. Must differentiate from appendicitis.",
                number: 6),
    AbdomenZone(id: "right-lower", name: "Right Lower", organ: "Appendix / Cecum", system: .digestive,
                location: "Right lower quadrant (McBurney point)",
                technique: "DO NOT apply deep pressure if appendicitis is suspected. For general wellness: work intestine reflexes on foot.",
                duration: "1-2 minutes indirect",
                benefits: ["Appendicitis awareness", "Cecal health", "Intestinal support"],
                conditions: "Appendicitis",
                referral: "Classic progression: periumbilical pain migrating to RLQ with rebound tenderness. This is a surgical emergency.",
                number: 7),
    AbdomenZone(id: "suprapubic", name: "Suprapubic", organ: "Bladder / Uterus", system: .reproductive,
                location: "Lower center abdomen, above the pubic bone",
                technique: "Warm palm pressure over CV-4. Work bladder reflexes on inner heel. Press SP-6 for gynecological support.",
                duration: "2-3 minutes",
                benefits: ["Pelvic support", "Bladder function", "Reproductive health"],
                conditions: "Pelvic pain",
                referral: "Suprapubic pain with urinary symptoms suggests cystitis. In women, consider ovarian/uterine pathology.",
                number: 8),
    AbdomenZone(id: "left-lower", name: "Left Lower", organ: "Sigmoid Colon", system: .digestive,
                location: "Left lower quadrant",
                technique: "Gentle clockwise massage following colon path. Work intestine reflexes on foot.",
                duration: "2-3 minutes",
                benefits: ["Colonic health", "Diverticulitis awareness", "Bowel regularity"],
                conditions: "Diverticulitis",
                referral: "LLQ pain with fever and altered bowels in older adults suggests diverticulitis (left-sided appendicitis).",
                number: 9)
]
