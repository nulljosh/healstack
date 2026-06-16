import SwiftUI

struct MeridianListView: View {
    @State private var expandedMeridian: String?
    @State private var expandedPoint: String?
    @Environment(BodyworkSessionStore.self) private var store

    var body: some View {
        NavigationStack {
            List {
                ForEach(meridians) { m in
                    Section {
                        Button {
                            withAnimation(.spring(response: 0.3)) {
                                expandedMeridian = expandedMeridian == m.id ? nil : m.id
                                expandedPoint = nil
                            }
                        } label: {
                            HStack(spacing: 10) {
                                Circle().fill(m.color).frame(width: 10, height: 10)
                                Text(m.name).fontWeight(.medium)
                                Spacer()
                                Text(m.abbr).font(.caption).fontWeight(.bold).foregroundStyle(m.color)
                                Image(systemName: expandedMeridian == m.id ? "chevron.up" : "chevron.down")
                                    .font(.caption2).foregroundStyle(.tertiary)
                            }
                        }
                        .buttonStyle(.plain)

                        if expandedMeridian == m.id {
                            ForEach(m.points) { p in
                                VStack(alignment: .leading, spacing: 0) {
                                    Button {
                                        withAnimation(.spring(response: 0.3)) {
                                            expandedPoint = expandedPoint == p.id ? nil : p.id
                                        }
                                    } label: {
                                        HStack(spacing: 8) {
                                            Text(p.id).font(.subheadline).fontWeight(.bold).foregroundStyle(m.color)
                                            VStack(alignment: .leading) {
                                                Text(p.name).font(.subheadline).fontWeight(.medium)
                                                Text(p.english).font(.caption).foregroundStyle(.secondary)
                                            }
                                            Spacer()
                                        }
                                        .padding(.vertical, 4)
                                    }
                                    .buttonStyle(.plain)

                                    if expandedPoint == p.id {
                                        VStack(alignment: .leading, spacing: 10) {
                                            pointField("LOCATION", p.location)
                                            pointField("TECHNIQUE", p.technique)
                                            BodyworkFlowLayout(spacing: 4) {
                                                ForEach(p.indications, id: \.self) { ind in
                                                    Text(ind)
                                                        .font(.caption2)
                                                        .padding(.horizontal, 8)
                                                        .padding(.vertical, 4)
                                                        .background(m.color.opacity(0.12))
                                                        .clipShape(Capsule())
                                                }
                                            }
                                            Button("Log Session") {
                                                store.add(BodyworkSession(type: "acupuncture", name: "\(p.id) \(p.name)", area: m.name))
                                            }
                                            .buttonStyle(.borderedProminent)
                                            .tint(Color(red: 0.141, green: 0.447, blue: 0.698))
                                            .controlSize(.small)
                                        }
                                        .padding(.leading, 4)
                                        .padding(.vertical, 6)
                                        .transition(.opacity)
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

    private func pointField(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label).font(.caption2).fontWeight(.semibold).tracking(1).foregroundStyle(.secondary)
            Text(value).font(.caption)
        }
    }
}
