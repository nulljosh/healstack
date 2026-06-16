import Foundation

enum CSVExporter {
    private static let header = "date,time,substance,dose,unit,route,rating,notes"

    static func export(entries: [DoseEntry], dataStore: DataStore) -> Result<URL, Error> {
        var lines = [header]
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "HH:mm"

        for entry in entries {
            let name = dataStore.substanceName(for: entry)
            let date = dateFormatter.string(from: entry.timestamp)
            let time = timeFormatter.string(from: entry.timestamp)
            let dose = entry.dose.map { String($0) } ?? ""
            let unit = entry.unit ?? ""
            let route = entry.route ?? ""
            let rating = entry.rating.map { String($0) } ?? ""
            let notes = entry.notes

            let fields = [date, time, name, dose, unit, route, rating, notes]
            let escaped = fields.map { escapeCSV($0) }
            lines.append(escaped.joined(separator: ","))
        }

        let csv = lines.joined(separator: "\n")
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("dose-export.csv")
        do {
            try csv.write(to: url, atomically: true, encoding: .utf8)
            return .success(url)
        } catch {
            return .failure(error)
        }
    }

    static func cleanup() {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("dose-export.csv")
        try? FileManager.default.removeItem(at: url)
    }

    private static func escapeCSV(_ field: String) -> String {
        if field.contains(",") || field.contains("\"") || field.contains("\n") {
            let escaped = field.replacingOccurrences(of: "\"", with: "\"\"")
            return "\"\(escaped)\""
        }
        return field
    }
}
