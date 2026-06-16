import Foundation

enum MarkerFlag: String, Codable, CaseIterable {
    case normal, low, high, critical

    var label: String { rawValue.capitalized }

    var color: String {
        switch self {
        case .normal: return "green"
        case .low, .high: return "orange"
        case .critical: return "red"
        }
    }
}

struct LabMarker: Codable, Identifiable {
    var id: UUID = UUID()
    var name: String
    var value: Double
    var unit: String
    var refLow: Double?
    var refHigh: Double?
    var flag: MarkerFlag

    static func computeFlag(value: Double, refLow: Double?, refHigh: Double?) -> MarkerFlag {
        guard refLow != nil || refHigh != nil else { return .normal }
        let lo = refLow ?? -Double.infinity
        let hi = refHigh ?? Double.infinity
        if value < lo * 0.7 || value > hi * 1.5 { return .critical }
        if value < lo { return .low }
        if value > hi { return .high }
        return .normal
    }
}

struct LabResult: Codable, Identifiable {
    var id: UUID = UUID()
    var date: Date
    var lab: String
    var panel: String
    var markers: [LabMarker]

    var flaggedMarkers: [LabMarker] {
        markers.filter { $0.flag != .normal }
    }

    var flaggedCount: Int { flaggedMarkers.count }
}

// Common panel templates
struct LabPanel {
    let name: String
    let markers: [(name: String, unit: String, refLow: Double?, refHigh: Double?)]

    static let all: [LabPanel] = [
        LabPanel(name: "CBC", markers: [
            ("WBC", "10^9/L", 4.0, 11.0),
            ("RBC", "10^12/L", 4.2, 5.8),
            ("Hgb", "g/L", 120, 175),
            ("Hct", "L/L", 0.36, 0.52),
            ("MCV", "fL", 80, 100),
            ("PLT", "10^9/L", 150, 400),
        ]),
        LabPanel(name: "BMP", markers: [
            ("Sodium", "mmol/L", 136, 145),
            ("Potassium", "mmol/L", 3.5, 5.0),
            ("Creatinine", "umol/L", 53, 106),
            ("eGFR", "mL/min/1.73m2", 60, nil),
            ("Glucose", "mmol/L", 3.9, 5.6),
        ]),
        LabPanel(name: "Lipids", markers: [
            ("Total Cholesterol", "mmol/L", nil, 5.2),
            ("LDL", "mmol/L", nil, 3.4),
            ("HDL", "mmol/L", 1.0, nil),
            ("Triglycerides", "mmol/L", nil, 1.7),
        ]),
        LabPanel(name: "Thyroid", markers: [
            ("TSH", "mIU/L", 0.35, 5.0),
            ("Free T4", "pmol/L", 9.0, 25.0),
            ("Free T3", "pmol/L", 3.5, 6.5),
        ]),
        LabPanel(name: "Vitamins", markers: [
            ("Vitamin D", "nmol/L", 75, 250),
            ("B12", "pmol/L", 148, 738),
            ("Ferritin", "ug/L", 15, 200),
            ("Folate", "nmol/L", 7, nil),
        ]),
        LabPanel(name: "HbA1c", markers: [
            ("HbA1c", "%", nil, 5.7),
        ]),
    ]
}
