import SwiftUI

@main
struct HealstackApp: App {
    @State private var authService = AuthService()
    @State private var store = BodyworkSessionStore()
    @State private var dataStore = DataStore()
    @AppStorage("app_theme") private var rawTheme = "system"
    // ponytail: screenshot capture picks the pane by launch argument, same as iOS -UITEST_TAB.
    @State private var selection: SidebarItem? = {
        let a = CommandLine.arguments
        if let i = a.firstIndex(of: "-UITEST_TAB"), i + 1 < a.count, let item = SidebarItem(rawValue: a[i + 1]) { return item }
        return .dashboard
    }()

    var body: some Scene {
        WindowGroup {
            Group {
                if authService.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if authService.user == nil && !CommandLine.arguments.contains("UITEST_SNAPSHOT") {
                    MacAuthView(authService: authService)
                        .frame(width: 400, height: 480)
                } else {
                    NavigationSplitView {
                        SidebarView(dataStore: dataStore, selection: $selection)
                    } detail: {
                        switch selection ?? .dashboard {
                        case .dashboard: MacDashboardView(dataStore: dataStore)
                        case .labs: MacLabResultsView(dataStore: dataStore)
                        case .feet: MacReflexologyView(mode: .feet)
                        case .hands: MacReflexologyView(mode: .hands)
                        case .abdomen: MacAbdomenView()
                        case .meridians: MacMeridianListView()
                        case .symptoms: MacSymptomFinderView()
                        case .facemaxxing: MacFacemaxxingView()
                        case .sessions: MacSessionHistoryView()
                        case .settings: MacSettingsView()
                        }
                    }
                    .environment(store)
                    .environment(authService)
                    .frame(minWidth: 800, minHeight: 550)
                }
            }
            .preferredColorScheme(rawTheme == "dark" ? .dark : rawTheme == "light" ? .light : nil)
            .shareApp("https://healstack.heyitsmejosh.com")
        }
        .defaultSize(width: 1050, height: 680)
        .windowStyle(.titleBar)
    }
}

// MARK: - Share

// ponytail: one overlay rather than a per-screen toolbar button — these root views share no
// navigation container to hang a .toolbar on. Move it into a toolbar per screen if this ever
// covers something that matters.
private struct AppShareOverlay: ViewModifier {
    let link: String

    func body(content: Content) -> some View {
        content.overlay(alignment: .bottomTrailing) {
            if let url = URL(string: link) {
                ShareLink(item: url) {
                    Image(systemName: "square.and.arrow.up")
                        .font(.system(size: 15, weight: .medium))
                        .padding(10)
                        .background(.regularMaterial, in: Circle())
                }
                .buttonStyle(.plain)
                .padding(16)
            }
        }
    }
}

private extension View {
    func shareApp(_ link: String) -> some View { modifier(AppShareOverlay(link: link)) }
}
