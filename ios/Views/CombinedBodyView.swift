import SwiftUI

struct CombinedBodyView: View {
    let dataStore: DataStore
    let healthKitService: HealthKitService

    var body: some View {
        NavigationStack {
            List {
                Section("Bodywork") {
                    NavigationLink {
                        ReflexologyTab()
                    } label: {
                        Label("Foot & Hand Maps", systemImage: "hand.raised.fingers.spread")
                    }
                    NavigationLink {
                        AbdomenView()
                    } label: {
                        Label("Abdominal Referral", systemImage: "figure.stand")
                    }
                    NavigationLink {
                        MeridianListView()
                    } label: {
                        Label("Meridian Points", systemImage: "target")
                    }
                    NavigationLink {
                        SymptomFinderView()
                    } label: {
                        Label("Symptom Finder", systemImage: "cross.circle")
                    }
                    NavigationLink {
                        SessionHistoryView()
                    } label: {
                        Label("Session Log", systemImage: "clock.arrow.trianglehead.counterclockwise.rotate.90")
                    }
                }

                Section("Biometrics") {
                    NavigationLink {
                        BodyView(dataStore: dataStore, healthKitService: healthKitService)
                    } label: {
                        Label("Health & Metrics", systemImage: "heart.fill")
                    }
                }
            }
            .navigationTitle("Body")
        }
    }
}
