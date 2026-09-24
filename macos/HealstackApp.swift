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
            .onboarding(key: "healstack",
                        signedIn: authService.user != nil,
                        slides: healstackOnboardingSlides)
        }
        .defaultSize(width: 1050, height: 680)
        .windowStyle(.titleBar)
    }
}
