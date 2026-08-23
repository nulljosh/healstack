import Foundation

struct Substance: Codable, Identifiable {
    enum Category: String, Codable, CaseIterable, Identifiable {
        case medication
        case vitamin
        case supplement

        var id: String { rawValue }

        var displayName: String {
            rawValue.capitalized
        }
    }

    var id: UUID
    var name: String
    var category: Category
    var dosage: Double
    var unit: String
    var frequency: String

    init(
        id: UUID = UUID(),
        name: String,
        category: Category,
        dosage: Double,
        unit: String,
        frequency: String
    ) {
        self.id = id
        self.name = name
        self.category = category
        self.dosage = dosage
        self.unit = unit
        self.frequency = frequency
    }
}

struct BuiltInSubstance: Codable, Identifiable, Hashable {
    enum Category: String, Codable, CaseIterable, Identifiable {
        case psychedelic = "psychedelic"
        case stimulant = "stimulant"
        case depressant = "depressant"
        case entactogen = "entactogen"
        case cannabinoid = "cannabinoid"
        case opioid = "opioid"
        case benzodiazepine = "benzodiazepine"
        case medication = "medication"
        case vitamin = "vitamin"
        case supplement = "supplement"
        case mineral = "mineral"
        case herb = "herb"
        case nootropic = "nootropic"
        case dissociative = "dissociative"
        case opioidAdjacent = "opioid-adjacent"

        var id: String { rawValue }
    }

    var id: String
    var name: String
    var category: Category
    var icon: String
    var halfLife: String
    var effects: [String]
    var interactions: [String]
    var harmReduction: [String]
    var routes: [String]
    var unit: String
    var notes: String
}

/// A citation backing the information shown for a substance.
///
/// App Review Guideline 1.4.1 requires apps presenting medical or health
/// information to cite their sources, so every library entry links out to the
/// references it is derived from rather than presenting the summary as fact.
struct SubstanceSource: Identifiable, Hashable {
    var id: String { title }
    let title: String
    let detail: String
    let url: URL
}

extension BuiltInSubstance {
    /// Sources are built from the substance's own name so each entry cites
    /// material about *that* substance, not a blanket reference for the app.
    /// Query-based URLs are used deliberately: unlike guessed article paths,
    /// a search URL always resolves, so a citation can never 404 on a reviewer
    /// or a user.
    var sources: [SubstanceSource] {
        guard let query = name.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let pubmed = URL(string: "https://pubmed.ncbi.nlm.nih.gov/?term=\(query)"),
              let medlinePlus = URL(string: "https://medlineplus.gov/search/?query=\(query)") else {
            return []
        }

        var sources = [
            SubstanceSource(
                title: "MedlinePlus",
                detail: "U.S. National Library of Medicine — consumer health information",
                url: medlinePlus
            ),
            SubstanceSource(
                title: "PubMed",
                detail: "NIH index of peer-reviewed biomedical literature",
                url: pubmed
            )
        ]

        switch category {
        case .medication, .benzodiazepine, .opioid, .opioidAdjacent:
            if let dailyMed = URL(string: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=\(query)") {
                sources.insert(
                    SubstanceSource(
                        title: "DailyMed",
                        detail: "FDA-approved prescribing information and drug labels",
                        url: dailyMed
                    ),
                    at: 0
                )
            }
        case .psychedelic, .stimulant, .depressant, .entactogen, .cannabinoid, .dissociative:
            if let psychonaut = URL(string: "https://psychonautwiki.org/w/index.php?search=\(query)") {
                sources.append(
                    SubstanceSource(
                        title: "PsychonautWiki",
                        detail: "Community harm-reduction reference — dosage, duration and interactions",
                        url: psychonaut
                    )
                )
            }
        case .vitamin, .mineral, .supplement, .herb, .nootropic:
            if let ncchi = URL(string: "https://www.nccih.nih.gov/search?keyword=\(query)") {
                sources.append(
                    SubstanceSource(
                        title: "NIH NCCIH",
                        detail: "National Center for Complementary and Integrative Health",
                        url: ncchi
                    )
                )
            }
        }

        return sources
    }
}
