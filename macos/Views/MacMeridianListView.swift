import SwiftUI

struct MacMeridianListView: View {
    @State private var expandedMeridian: String?
    @State private var expandedPoint: String?
    @Environment(BodyworkSessionStore.self) private var store

    var body: some View {
        List {
            ForEach(meridians) { m in
                Section {
                    Button {
                        withAnimation { expandedMeridian = expandedMeridian == m.id ? nil : m.id; expandedPoint = nil }
                    } label: {
                        HStack(spacing: 10) {
                            Circle().fill(m.color).frame(width: 10, height: 10)
                            Text(m.name).fontWeight(.medium)
                            Spacer()
                            Text(m.abbr).font(.caption).fontWeight(.bold).foregroundStyle(m.color)
                            Image(systemName: expandedMeridian == m.id ? "chevron.up" : "chevron.down").font(.caption2).foregroundStyle(.tertiary)
                        }
                    }.buttonStyle(.plain)

                    if expandedMeridian == m.id {
                        ForEach(m.points) { p in
                            VStack(alignment: .leading, spacing: 0) {
                                Button {
                                    withAnimation { expandedPoint = expandedPoint == p.id ? nil : p.id }
                                } label: {
                                    HStack(spacing: 8) {
                                        Text(p.id).font(.subheadline).fontWeight(.bold).foregroundStyle(m.color)
                                        VStack(alignment: .leading) {
                                            Text(p.name).font(.subheadline).fontWeight(.medium)
                                            Text(p.english).font(.caption).foregroundStyle(.secondary)
                                        }
                                        Spacer()
                                    }.padding(.vertical, 4)
                                }.buttonStyle(.plain)

                                if expandedPoint == p.id {
                                    VStack(alignment: .leading, spacing: 8) {
                                        Text(p.location).font(.caption)
                                        Text(p.technique).font(.caption).foregroundStyle(.secondary)
                                        Button("Log Session") {
                                            store.add(BodyworkSession(type: "acupuncture", name: "\(p.id) \(p.name)", area: m.name))
                                        }.buttonStyle(.borderedProminent).controlSize(.small)
                                    }.padding(.leading, 4).padding(.vertical, 4)
                                }
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("Acupuncture Points")
    }
}
