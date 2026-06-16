import SwiftUI

struct MacSessionHistoryView: View {
    @Environment(BodyworkSessionStore.self) private var store

    var body: some View {
        List {
            if store.sessions.isEmpty {
                Text("No sessions logged yet.").foregroundStyle(.secondary)
            } else {
                ForEach(store.sessions) { s in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(s.type == "reflexology" || s.type == "abdominal-referral" ? s.name : s.name)
                                .font(.subheadline.weight(.medium))
                            Text("\(s.type) -- \(s.area)")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text(s.date, style: .date).font(.caption).foregroundStyle(.secondary)
                    }
                }
                .onDelete { store.delete(at: $0) }
            }
        }
        .navigationTitle("Session History")
    }
}
