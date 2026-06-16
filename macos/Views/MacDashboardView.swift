import SwiftUI

struct MacDashboardView: View {
    @Bindable var dataStore: DataStore
    private var activePills: [String] {
        let cutoff = Date().addingTimeInterval(-24 * 3600)
        let active = dataStore.doseEntries.filter { $0.timestamp >= cutoff }
        return Array(Set(active.map { dataStore.substanceName(for: $0) })).sorted()
    }

    private var recentEntries: [DoseEntry] {
        Array(dataStore.doseEntries.sorted { $0.timestamp > $1.timestamp }.prefix(8))
    }

    private var topInsight: Insight? {
        InsightEngine.topInsights(
            doseEntries: dataStore.doseEntries,
            biometrics: dataStore.biometricEntries,
            labResults: dataStore.labResults,
            getName: { dataStore.substanceName(for: $0) }
        ).first
    }

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 20) {
                // Header
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(greeting)
                            .font(.largeTitle.weight(.light))
                        Text(Date(), style: .date)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Text("Log doses from the iOS app")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                // Insight card
                if let insight = topInsight {
                    HStack(spacing: 12) {
                        Image(systemName: "waveform.path.ecg")
                            .foregroundStyle(insightColor(insight.severity))
                        VStack(alignment: .leading, spacing: 2) {
                            Text(insight.title).fontWeight(.semibold)
                            Text(insight.detail).font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer()
                    }
                    .padding(14)
                    .background(insightColor(insight.severity).opacity(0.06))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(insightColor(insight.severity).opacity(0.18)))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                // Active stack
                if !activePills.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Active Stack")
                            .font(.headline)
                        HStack(spacing: 8) {
                            ForEach(activePills, id: \.self) { name in
                                Text(name)
                                    .font(.subheadline.weight(.medium))
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(Color.accentColor.opacity(0.1))
                                    .clipShape(Capsule())
                            }
                        }
                    }
                }

                // Recent entries
                VStack(alignment: .leading, spacing: 10) {
                    Text("Recent Entries").font(.headline)
                    if recentEntries.isEmpty {
                        Text("No doses logged yet.")
                            .foregroundStyle(.secondary)
                            .padding()
                    } else {
                        ForEach(recentEntries) { entry in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(dataStore.substanceName(for: entry))
                                        .fontWeight(.medium)
                                    if let dose = entry.dose {
                                        Text("\(dose.formatted()) \(entry.unit ?? "")")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                                Spacer()
                                Text(entry.timestamp, style: .relative)
                                    .font(.caption)
                                    .foregroundStyle(.tertiary)
                            }
                            .padding(10)
                            .background(Color(.secondarySystemFill))
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                    }
                }
            }
            .padding(24)
        }
        .navigationTitle("Dashboard")
    }

    private var greeting: String {
        let h = Calendar.current.component(.hour, from: Date())
        if h < 12 { return "Good morning." }
        if h < 17 { return "Good afternoon." }
        return "Good evening."
    }

    func insightColor(_ s: InsightSeverity) -> Color {
        switch s {
        case .urgent: return .red
        case .warning: return .orange
        case .info: return .blue
        }
    }
}
