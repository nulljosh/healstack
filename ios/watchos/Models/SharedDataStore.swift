import Foundation
import Observation

@Observable
final class SharedDataStore {
    static let appGroupId = "group.com.heyitsmejosh.dose"

    private(set) var substances: [WatchSubstance] = []
    private(set) var doseEntries: [WatchDoseEntry] = []
    private(set) var activePills: [ActivePill] = []
    private(set) var doseCount: Int = 0
    private(set) var lastDoseName: String = "No recent dose"

    private let shared = UserDefaults(suiteName: appGroupId)

    init() {
        reload()
    }

    func reload() {
        doseCount = shared?.integer(forKey: "widget.doseCount") ?? 0
        lastDoseName = shared?.string(forKey: "widget.lastDoseName") ?? "No recent dose"

        if let data = shared?.data(forKey: "widget.activePills") {
            activePills = (try? JSONDecoder().decode([ActivePill].self, from: data)) ?? []
        }

        if let data = shared?.data(forKey: "dose.substances") {
            substances = (try? JSONDecoder().decode([WatchSubstance].self, from: data)) ?? []
        }

        if let data = shared?.data(forKey: "dose.doseEntries") {
            let decoder = JSONDecoder()
            doseEntries = (try? decoder.decode([WatchDoseEntry].self, from: data)) ?? []
        }
    }

    func logDose(substanceName: String, substanceId: UUID, dose: Double?, unit: String?) {
        let entry = WatchDoseEntry(
            id: UUID(),
            substanceId: substanceId,
            builtInSubstanceId: nil,
            timestamp: Date(),
            notes: "",
            dose: dose,
            unit: unit,
            route: nil,
            rating: nil
        )
        doseEntries.append(entry)
        saveDoseEntries()
        syncWidgetData(latestName: substanceName)
    }

    var activeEntries: [WatchDoseEntry] {
        let cutoff = Date().addingTimeInterval(-24 * 60 * 60)
        return doseEntries.filter { $0.timestamp >= cutoff }
    }

    var recentEntries: [WatchDoseEntry] {
        doseEntries.sorted { $0.timestamp > $1.timestamp }
    }

    func substanceName(for entry: WatchDoseEntry) -> String {
        if let sub = substances.first(where: { $0.id == entry.substanceId }) {
            return sub.name
        }
        return activePills.first?.name ?? "Unknown"
    }

    private func saveDoseEntries() {
        guard let data = try? JSONEncoder().encode(doseEntries) else { return }
        shared?.set(data, forKey: "dose.doseEntries")
    }

    private func syncWidgetData(latestName: String) {
        let active = activeEntries
        shared?.set(active.count, forKey: "widget.doseCount")
        shared?.set(latestName, forKey: "widget.lastDoseName")

        let grouped = Dictionary(grouping: active) { substanceName(for: $0) }
        let pills = grouped.map { ActivePill(name: $0.key, count: $0.value.count) }
        if let data = try? JSONEncoder().encode(pills) {
            shared?.set(data, forKey: "widget.activePills")
        }

        doseCount = active.count
        lastDoseName = latestName
        activePills = pills
    }
}

struct WatchDoseEntry: Codable, Identifiable {
    var id: UUID
    var substanceId: UUID
    var builtInSubstanceId: String?
    var timestamp: Date
    var notes: String
    var dose: Double?
    var unit: String?
    var route: String?
    var rating: Int?
}

struct WatchSubstance: Codable, Identifiable {
    var id: UUID
    var name: String
    var category: String
    var dosage: Double
    var unit: String
    var frequency: String
}

struct ActivePill: Codable, Identifiable {
    let name: String
    let count: Int

    var id: String { name }
}
