import SwiftUI

@main
struct DoseMacApp: App {
    @State private var authService = AuthService()
    @State private var store = BodyworkSessionStore()
    @State private var dataStore = DataStore()

    var body: some Scene {
        WindowGroup {
            Group {
                if authService.isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if authService.user == nil {
                    MacAuthView(authService: authService)
                        .frame(width: 400, height: 480)
                } else {
                    NavigationSplitView {
                        SidebarView(dataStore: dataStore)
                    } detail: {
                        MacDashboardView(dataStore: dataStore)
                    }
                    .environment(store)
                    .frame(minWidth: 800, minHeight: 550)
                }
            }
        }
        .defaultSize(width: 1050, height: 680)
        .windowStyle(.titleBar)
    }
}
