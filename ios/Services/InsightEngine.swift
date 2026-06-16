import Foundation

struct Insight: Identifiable {
    var id = UUID()
    var type: InsightType
    var title: String
    var detail: String
    var severity: InsightSeverity
}

enum InsightType: String {
    case labFlag, anomaly, labTrend, correlation
}

enum InsightSeverity {
    case info, warning, urgent

    var color: String {
        switch self {
        case .info: return "blue"
        case .warning: return "orange"
        case .urgent: return "red"
        }
    }
}

struct InsightEngine {

    // Flagged markers from most recent lab result
    static func flaggedLabMarkers(labResults: [LabResult]) -> [Insight] {
        guard let latest = labResults.sorted(by: { $0.date > $1.date }).first else { return [] }
        return latest.flaggedMarkers.map { m in
            let severity: InsightSeverity = m.flag == .critical ? .urgent : .warning
            return Insight(
                type: .labFlag,
                title: "\(m.name) is \(m.flag.label.lowercased())",
                detail: "\(m.value) \(m.unit) — from \(latest.lab) on \(formatted(latest.date))",
                severity: severity
            )
        }
    }

    // Markers trending in one direction over last 3+ readings
    static func labTrends(labResults: [LabResult]) -> [Insight] {
        guard labResults.count >= 3 else { return [] }

        var markerHistory: [String: [(date: Date, marker: LabMarker)]] = [:]
        for result in labResults {
            for m in result.markers {
                markerHistory[m.name, default: []].append((date: result.date, marker: m))
            }
        }

        var insights: [Insight] = []
        for (name, history) in markerHistory {
            let sorted = history.sorted { $0.date < $1.date }
            guard sorted.count >= 3 else { continue }
            let recent = sorted.suffix(3)
            let values = recent.map { $0.marker.value }

            let rising = values[0] < values[1] && values[1] < values[2]
            let falling = values[0] > values[1] && values[1] > values[2]
            guard rising || falling else { continue }

            let latest = recent.last!.marker
            let hi = latest.refHigh
            let lo = latest.refLow
            let nearHigh = hi != nil && rising && latest.value > hi! * 0.8
            let nearLow = lo != nil && falling && latest.value < lo! * 1.2
            guard nearHigh || nearLow else { continue }

            let direction = rising ? "rising" : "falling"
            insights.append(Insight(
                type: .labTrend,
                title: "\(name) trending \(direction)",
                detail: "\(recent.count) consecutive readings moving toward \(rising ? "upper" : "lower") limit",
                severity: .warning
            ))
        }
        return insights
    }

    // Biometric anomalies: readings > 2 SD from personal mean
    static func anomalyAlerts(biometrics: [BiometricEntry]) -> [Insight] {
        guard biometrics.count >= 5 else { return [] }

        // Extract named metric series from typed BiometricEntry fields
        typealias MetricRow = (date: Date, value: Double)
        var metricHistory: [String: [MetricRow]] = [:]

        func push(_ key: String, _ val: Double?, _ date: Date) {
            guard let v = val else { return }
            metricHistory[key, default: []].append((date: date, value: v))
        }

        for bio in biometrics {
            push("sleep", bio.sleepHours, bio.date)
            push("heartRate", bio.heartRate.map(Double.init), bio.date)
            push("hrv", bio.hrv, bio.date)
            push("bloodOxygen", bio.bloodOxygen, bio.date)
            push("weight", bio.weight, bio.date)
            push("steps", bio.steps.map(Double.init), bio.date)
        }

        let metricLabels: [String: String] = [
            "sleep": "Sleep", "steps": "Steps", "heartRate": "Heart rate",
            "hrv": "HRV", "bloodOxygen": "Blood oxygen", "weight": "Weight",
        ]

        var insights: [Insight] = []
        for (metric, history) in metricHistory {
            guard history.count >= 5 else { continue }
            let values = history.map { $0.value }
            let m = values.reduce(0, +) / Double(values.count)
            let variance = values.map { ($0 - m) * ($0 - m) }.reduce(0, +) / Double(values.count)
            let sd = sqrt(variance)
            guard sd > 0 else { continue }

            let latest = history.sorted { $0.date > $1.date }.first!
            guard abs(latest.value - m) > 2 * sd else { continue }

            let label = metricLabels[metric] ?? metric
            let direction = latest.value > m ? "above" : "below"
            insights.append(Insight(
                type: .anomaly,
                title: "\(label) unusual on \(formatted(latest.date))",
                detail: "\(Int(latest.value)) vs avg \(Int(m)) — \(direction) normal range",
                severity: .warning
            ))
        }
        return insights
    }

    // Correlation between substance and biometric
    static func correlations(doseEntries: [DoseEntry], biometrics: [BiometricEntry], getName: (DoseEntry) -> String) -> [Insight] {
        guard doseEntries.count >= 5, biometrics.count >= 5 else { return [] }

        let substanceIds = Set(doseEntries.map { $0.substanceKey })
        let metricLabels: [String: String] = [
            "sleep": "sleep", "heartRate": "heart rate", "hrv": "HRV",
        ]

        let calendar = Calendar.current
        var insights: [Insight] = []

        for subId in substanceIds {
            let onDays = Set(doseEntries.filter { $0.substanceKey == subId }
                .map { calendar.startOfDay(for: $0.timestamp) })

            var onVals: [String: [Double]] = [:]
            var offVals: [String: [Double]] = [:]

            for bio in biometrics {
                let bioDay = calendar.startOfDay(for: bio.date)
                let isOn = onDays.contains(bioDay)

                func bucket(_ key: String, _ val: Double?) {
                    guard let v = val else { return }
                    if isOn { onVals[key, default: []].append(v) }
                    else { offVals[key, default: []].append(v) }
                }
                bucket("sleep", bio.sleepHours)
                bucket("heartRate", bio.heartRate.map(Double.init))
                bucket("hrv", bio.hrv)
            }

            for (metric, label) in metricLabels {
                let on = onVals[metric] ?? []
                let off = offVals[metric] ?? []
                guard on.count >= 3, off.count >= 3 else { continue }

                let onMean = on.reduce(0, +) / Double(on.count)
                let offMean = off.reduce(0, +) / Double(off.count)
                guard offMean != 0 else { continue }

                let pct = abs((onMean - offMean) / offMean) * 100
                guard pct >= 8 else { continue }

                let direction = onMean > offMean ? "higher" : "lower"
                let entry = doseEntries.first { $0.substanceKey == subId }!
                let name = getName(entry)
                insights.append(Insight(
                    type: .correlation,
                    title: "\(label.capitalized) \(Int(pct))% \(direction) with \(name)",
                    detail: "Based on \(on.count + off.count) logged days",
                    severity: .info
                ))
            }
        }

        return insights
    }

    static func topInsights(
        doseEntries: [DoseEntry],
        biometrics: [BiometricEntry],
        labResults: [LabResult],
        getName: (DoseEntry) -> String
    ) -> [Insight] {
        let all: [Insight] = flaggedLabMarkers(labResults: labResults)
            + labTrends(labResults: labResults)
            + anomalyAlerts(biometrics: biometrics)
            + correlations(doseEntries: doseEntries, biometrics: biometrics, getName: getName)

        let order: [InsightSeverity] = [.urgent, .warning, .info]
        return all.sorted { order.firstIndex(of: $0.severity)! < order.firstIndex(of: $1.severity)! }
            .prefix(5).map { $0 }
    }

    private static func dateString(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: date)
    }

    private static func formatted(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateStyle = .medium
        return f.string(from: date)
    }
}
