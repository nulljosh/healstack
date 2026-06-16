import SwiftUI

enum SidebarItem: String, CaseIterable, Identifiable {
    case dashboard = "Dashboard"
    case labs = "Lab Results"
    case feet = "Feet"
    case hands = "Hands"
    case abdomen = "Abdomen"
    case meridians = "Meridians"
    case symptoms = "Symptoms"
    case facemaxxing = "Facemaxxing"
    case sessions = "Sessions"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .dashboard: return "house"
        case .labs: return "cross.vial"
        case .feet: return "shoe.fill"
        case .hands: return "hand.raised.fingers.spread"
        case .abdomen: return "figure.stand"
        case .meridians: return "target"
        case .symptoms: return "cross.circle"
        case .facemaxxing: return "face.smiling"
        case .sessions: return "clock.arrow.trianglehead.counterclockwise.rotate.90"
        }
    }
}

struct SidebarView: View {
    @Bindable var dataStore: DataStore
    @State private var selection: SidebarItem? = .dashboard

    var body: some View {
        List(SidebarItem.allCases, selection: $selection) { item in
            NavigationLink(value: item) {
                Label(item.rawValue, systemImage: item.icon)
            }
        }
        .navigationSplitViewColumnWidth(min: 180, ideal: 220)
        .navigationTitle("Dose")
        .navigationDestination(for: SidebarItem.self) { item in
            switch item {
            case .dashboard: MacDashboardView(dataStore: dataStore)
            case .labs: MacLabResultsView(dataStore: dataStore)
            case .feet: MacReflexologyView(mode: .feet)
            case .hands: MacReflexologyView(mode: .hands)
            case .abdomen: MacAbdomenView()
            case .meridians: MacMeridianListView()
            case .symptoms: MacSymptomFinderView()
            case .facemaxxing: MacFacemaxxingView()
            case .sessions: MacSessionHistoryView()
            }
        }
    }
}
