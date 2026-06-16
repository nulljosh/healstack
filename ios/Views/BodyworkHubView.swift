import SwiftUI

struct BodyworkHubView: View {
    var body: some View {
        NavigationStack {
            List {
                Section("Reflexology") {
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
                }

                Section("Acupuncture") {
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
                }

                Section("Facemaxxing") {
                    NavigationLink {
                        FacemaxxingView()
                    } label: {
                        Label("Protocols", systemImage: "face.smiling")
                    }
                }

                Section("History") {
                    NavigationLink {
                        SessionHistoryView()
                    } label: {
                        Label("Session Log", systemImage: "clock.arrow.trianglehead.counterclockwise.rotate.90")
                    }
                }
            }
            .navigationTitle("Bodywork")
        }
    }
}
