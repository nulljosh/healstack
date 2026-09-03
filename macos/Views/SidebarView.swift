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
    case settings = "Settings"

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
        case .settings: return "gearshape"
        }
    }
}

struct SidebarView: View {
    @Bindable var dataStore: DataStore
    @Binding var selection: SidebarItem?

    var body: some View {
        List(SidebarItem.allCases, selection: $selection) { item in
            NavigationLink(value: item) {
                Label(item.rawValue, systemImage: item.icon)
            }
        }
        .navigationSplitViewColumnWidth(min: 180, ideal: 220)
        .navigationTitle("Healstack")
    }
}
