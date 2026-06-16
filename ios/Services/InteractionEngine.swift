import Foundation
import SwiftUI

enum Severity: Int, Comparable, Sendable {
    case minor = 0
    case moderate = 1
    case major = 2

    static func < (lhs: Severity, rhs: Severity) -> Bool {
        lhs.rawValue < rhs.rawValue
    }

    var label: String {
        switch self {
        case .minor: return "Minor"
        case .moderate: return "Moderate"
        case .major: return "Major"
        }
    }

    var color: Color {
        switch self {
        case .minor: return .yellow
        case .moderate: return .orange
        case .major: return .red
        }
    }
}

struct InteractionResult: Identifiable, Sendable {
    let id = UUID()
    let severity: Severity
    let description: String
}

enum InteractionEngine {
    static func classify(_ text: String) -> Severity {
        let lowered = text.lowercased()
        let majorKeywords = [
            "fatal", "death", "seizure", "serotonin syndrome",
            "contraindicated", "avoid combination", "dangerous",
            "risk of death", "hypertensive crisis"
        ]
        if majorKeywords.contains(where: { lowered.contains($0) }) {
            return .major
        }

        let moderateKeywords = [
            "potentiates", "increases", "reduces", "inhibits",
            "enhances", "amplifies", "blunted", "diminishes"
        ]
        if moderateKeywords.contains(where: { lowered.contains($0) }) {
            return .moderate
        }

        return .minor
    }

    static func check(_ a: BuiltInSubstance, _ b: BuiltInSubstance) -> [InteractionResult] {
        var results: [InteractionResult] = []

        for interaction in a.interactions {
            if interaction.localizedCaseInsensitiveContains(b.name) {
                let severity = classify(interaction)
                results.append(InteractionResult(severity: severity, description: interaction))
            }
        }

        for interaction in b.interactions {
            if interaction.localizedCaseInsensitiveContains(a.name) {
                let desc = interaction
                let alreadyFound = results.contains { $0.description == desc }
                if !alreadyFound {
                    let severity = classify(interaction)
                    results.append(InteractionResult(severity: severity, description: desc))
                }
            }
        }

        return results.sorted { $0.severity > $1.severity }
    }
}
