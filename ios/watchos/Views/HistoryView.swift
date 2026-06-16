import SwiftUI

struct HistoryView: View {
    var store: SharedDataStore

    private var recent: [WatchDoseEntry] {
        Array(store.recentEntries.prefix(5))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 8) {
                    if recent.isEmpty {
                        emptyState
                    } else {
                        ForEach(recent) { entry in
                            entryRow(entry)
                        }
                    }
                }
                .padding(.horizontal)
            }
            .navigationTitle("History")
        }
        .onAppear { store.reload() }
    }

    private func entryRow(_ entry: WatchDoseEntry) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(store.substanceName(for: entry))
                    .font(.caption)
                    .fontWeight(.semibold)
                Spacer()
                Text(entry.timestamp, style: .time)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            HStack(spacing: 4) {
                if let dose = entry.dose, let unit = entry.unit {
                    Text(formatDose(dose, unit: unit))
                        .font(.caption2)
                        .foregroundStyle(.cyan)
                }

                if isToday(entry.timestamp) {
                    Text("Today")
                        .font(.caption2)
                        .foregroundStyle(.green)
                } else {
                    Text(entry.timestamp, style: .date)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.vertical, 8)
        .padding(.horizontal, 10)
        .background(.blue.opacity(0.08), in: RoundedRectangle(cornerRadius: 10))
    }

    private var emptyState: some View {
        VStack(spacing: 8) {
            Image(systemName: "clock")
                .font(.title2)
                .foregroundStyle(.secondary)
            Text("No entries yet")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
    }

    private func formatDose(_ dose: Double, unit: String) -> String {
        if dose == dose.rounded() {
            return "\(Int(dose)) \(unit)"
        }
        return "\(String(format: "%.1f", dose)) \(unit)"
    }

    private func isToday(_ date: Date) -> Bool {
        Calendar.current.isDateInToday(date)
    }
}
