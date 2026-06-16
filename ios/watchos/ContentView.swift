import SwiftUI

struct ContentView: View {
    @State private var store = SharedDataStore()

    var body: some View {
        TabView {
            DashboardView(store: store)
            QuickLogView(store: store)
            HistoryView(store: store)
        }
        .tabViewStyle(.verticalPage)
    }
}
