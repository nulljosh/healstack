import Foundation

struct MyMedication: Codable, Identifiable {
    var id: UUID
    var builtInSubstanceId: String?
    var name: String
    var dosage: Double?
    var unit: String
    var schedule: Schedule
    var reminderHour: Int
    var reminderMinute: Int

    enum Schedule: String, Codable, CaseIterable {
        case daily
        case twiceDaily
        case asNeeded
        case weekly

        var label: String {
            switch self {
            case .daily: return "Daily"
            case .twiceDaily: return "Twice daily"
            case .asNeeded: return "As needed"
            case .weekly: return "Weekly"
            }
        }
    }

    init(
        id: UUID = UUID(),
        builtInSubstanceId: String? = nil,
        name: String,
        dosage: Double? = nil,
        unit: String = "mg",
        schedule: Schedule = .daily,
        reminderHour: Int = 17,
        reminderMinute: Int = 0
    ) {
        self.id = id
        self.builtInSubstanceId = builtInSubstanceId
        self.name = name
        self.dosage = dosage
        self.unit = unit
        self.schedule = schedule
        self.reminderHour = reminderHour
        self.reminderMinute = reminderMinute
    }
}
