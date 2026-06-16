import Foundation

struct ScoreBreakdown {
    let total: Int
    let confidence: Int
    let parts: [String: Int?]
}

struct AdherenceItem: Identifiable {
    let id = UUID()
    let name: String
    let taken: Int
    let total: Int
    let rate: Int
}

enum HealthRank: Equatable {
    case excellent
    case healthy
    case watch
    case atRisk

    var label: String {
        switch self {
        case .excellent: return "Excellent"
        case .healthy: return "Healthy"
        case .watch: return "Watch"
        case .atRisk: return "At Risk"
        }
    }

    var color: SwiftUI.Color {
        switch self {
        case .excellent: return .green
        case .healthy: return .blue
        case .watch: return .orange
        case .atRisk: return .red
        }
    }
}

struct HealthScoreResult {
    let breakdown: ScoreBreakdown
    let rank: HealthRank
    let anomalies: [String]
    let adherence: [AdherenceItem]

    static let empty = HealthScoreResult(
        breakdown: ScoreBreakdown(total: 0, confidence: 0, parts: [:]),
        rank: .atRisk,
        anomalies: [],
        adherence: []
    )
}

import SwiftUI

enum HealthScoringService {

    // MARK: - Metric definitions

    private struct RangeMetric {
        let maxPoints: Int
        let optimal: ClosedRange<Double>
        let acceptable: ClosedRange<Double>
    }

    private struct ThresholdMetric {
        let maxPoints: Int
        let high: Double
        let mid: Double
        let low: Double
    }

    private struct ScaleMetric {
        let maxPoints: Int
        let scaleMax: Double
    }

    private static let rangeMetrics: [String: RangeMetric] = [
        "sleepHours": RangeMetric(maxPoints: 30, optimal: 7...9, acceptable: 6...10),
        "heartRate": RangeMetric(maxPoints: 22, optimal: 55...75, acceptable: 50...85),
        "bloodPressureSys": RangeMetric(maxPoints: 13, optimal: 90...120, acceptable: 85...130),
    ]

    private static let thresholdMetrics: [String: ThresholdMetric] = [
        "steps": ThresholdMetric(maxPoints: 22, high: 10000, mid: 7000, low: 4000),
    ]

    private static let scaleMetrics: [String: ScaleMetric] = [
        "moodScore": ScaleMetric(maxPoints: 13, scaleMax: 10),
    ]

    private static let allKeys = ["sleepHours", "steps", "heartRate", "bloodPressureSys", "moodScore"]

    // MARK: - Public API

    static func scoreMetric(key: String, value: Double) -> Int? {
        guard value.isFinite else { return nil }

        if let rm = rangeMetrics[key] {
            if rm.optimal.contains(value) {
                return rm.maxPoints
            }
            if rm.acceptable.contains(value) {
                return Int((Double(rm.maxPoints) * 0.65).rounded())
            }
            return Int((Double(rm.maxPoints) * 0.3).rounded())
        }

        if let tm = thresholdMetrics[key] {
            if value >= tm.high { return tm.maxPoints }
            if value >= tm.mid { return Int((Double(tm.maxPoints) * 0.7).rounded()) }
            if value >= tm.low { return Int((Double(tm.maxPoints) * 0.35).rounded()) }
            return Int((Double(tm.maxPoints) * 0.15).rounded())
        }

        if let sm = scaleMetrics[key] {
            let ratio = min(max(value / sm.scaleMax, 0), 1.0)
            return Int((Double(sm.maxPoints) * ratio).rounded())
        }

        return nil
    }

    static func healthRank(score: Int) -> HealthRank {
        if score >= 86 { return .excellent }
        if score >= 72 { return .healthy }
        if score >= 58 { return .watch }
        return .atRisk
    }

    static func scoreBreakdown(metrics: [String: Double]) -> ScoreBreakdown {
        var parts: [String: Int?] = [:]
        var total = 0
        var provided = 0

        for key in allKeys {
            if let value = metrics[key] {
                let score = scoreMetric(key: key, value: value)
                parts[key] = score
                total += score ?? 0
                provided += 1
            } else {
                parts[key] = nil as Int?
            }
        }

        let confidence = allKeys.isEmpty ? 0 : (provided * 100) / allKeys.count
        return ScoreBreakdown(total: total, confidence: confidence, parts: parts)
    }

    static func metricAnomalies(last7Avg: [String: Double], latest: [String: Double]) -> [String] {
        var anomalies: [String] = []

        if let avgSleep = last7Avg["sleepHours"], let currentSleep = latest["sleepHours"] {
            if avgSleep - currentSleep > 1.5 {
                anomalies.append("Sleep dipped sharply vs weekly baseline")
            }
        }

        if let avgSteps = last7Avg["steps"], let currentSteps = latest["steps"] {
            if currentSteps < avgSteps * 0.6 {
                anomalies.append("Step count dropped materially today")
            }
        }

        if let hr = latest["heartRate"], hr > 95 {
            anomalies.append("Heart rate is elevated")
        }

        if let sys = latest["bloodPressureSys"], sys > 140 {
            anomalies.append("Blood pressure systolic above 140 mmHg")
        }

        return anomalies
    }

    @MainActor
    static func flattenToday(
        biometricEntries: [BiometricEntry],
        healthEntries: [HealthEntry],
        healthKit: HealthKitService?
    ) -> [String: Double] {
        var metrics: [String: Double] = [:]
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())

        let todayBio = biometricEntries.filter { calendar.startOfDay(for: $0.date) == today }.last
        let todayHealth = healthEntries.filter { calendar.startOfDay(for: $0.date) == today }.last

        // Priority: HealthKit > BiometricEntry > HealthEntry
        if let hk = healthKit {
            if let sleep = hk.sleepHours { metrics["sleepHours"] = sleep }
            if let steps = hk.steps { metrics["steps"] = Double(steps) }
            if let hr = hk.heartRate { metrics["heartRate"] = hr }
            if let sys = hk.systolicBP { metrics["bloodPressureSys"] = Double(sys) }
        }

        if let bio = todayBio {
            if metrics["sleepHours"] == nil, let s = bio.sleepHours { metrics["sleepHours"] = s }
            if metrics["steps"] == nil, let s = bio.steps { metrics["steps"] = Double(s) }
            if metrics["heartRate"] == nil, let h = bio.heartRate { metrics["heartRate"] = Double(h) }
            if metrics["bloodPressureSys"] == nil, let s = bio.bpSystolic { metrics["bloodPressureSys"] = Double(s) }
        }

        if let health = todayHealth {
            if metrics["sleepHours"] == nil { metrics["sleepHours"] = health.sleepHours }
            if metrics["moodScore"] == nil {
                // Scale mood 1-5 to 1-10
                metrics["moodScore"] = Double(health.mood) * 2.0
            }
        }

        // HealthKit mood (State of Mind, iOS 18+)
        if metrics["moodScore"] == nil, let hk = healthKit, let mood = hk.moodScore {
            metrics["moodScore"] = mood
        }

        return metrics
    }

    static func supplementAdherence(doseEntries: [DoseEntry]) -> [AdherenceItem] {
        let calendar = Calendar.current
        let cutoff = calendar.date(byAdding: .day, value: -14, to: Date()) ?? Date()
        let recent = doseEntries.filter { $0.timestamp >= cutoff }

        let grouped = Dictionary(grouping: recent, by: \.substanceKey)

        return grouped.compactMap { id, entries in
            let name = SubstanceDatabase.find(id: id)?.name ?? id
            let uniqueDays = Set(entries.map { calendar.startOfDay(for: $0.timestamp) }).count
            let rate = (uniqueDays * 100) / 14
            return AdherenceItem(name: name, taken: uniqueDays, total: 14, rate: rate)
        }
        .sorted { $0.name < $1.name }
    }

    @MainActor
    static func computeFullScore(dataStore: DataStore, healthKit: HealthKitService) -> HealthScoreResult {
        let metrics = flattenToday(
            biometricEntries: dataStore.biometricEntries,
            healthEntries: dataStore.healthEntries,
            healthKit: healthKit
        )

        let breakdown = scoreBreakdown(metrics: metrics)
        let rank = healthRank(score: breakdown.total)

        // Compute 7-day averages for anomaly detection
        let calendar = Calendar.current
        let weekAgo = calendar.date(byAdding: .day, value: -7, to: Date()) ?? Date()
        let recentHealth = dataStore.healthEntries.filter { $0.date >= weekAgo }
        let recentBio = dataStore.biometricEntries.filter { $0.date >= weekAgo }

        var avgMetrics: [String: Double] = [:]
        let sleepValues = recentHealth.map(\.sleepHours) + recentBio.compactMap(\.sleepHours)
        if !sleepValues.isEmpty { avgMetrics["sleepHours"] = sleepValues.reduce(0, +) / Double(sleepValues.count) }
        let stepValues = recentBio.compactMap(\.steps).map(Double.init)
        if !stepValues.isEmpty { avgMetrics["steps"] = stepValues.reduce(0, +) / Double(stepValues.count) }

        let anomalies = metricAnomalies(last7Avg: avgMetrics, latest: metrics)
        let adherence = supplementAdherence(doseEntries: dataStore.doseEntries)

        return HealthScoreResult(breakdown: breakdown, rank: rank, anomalies: anomalies, adherence: adherence)
    }
}
