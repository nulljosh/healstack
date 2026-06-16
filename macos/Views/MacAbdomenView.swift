import SwiftUI

struct MacAbdomenView: View {
    @Environment(BodyworkSessionStore.self) private var store
    @State private var selected: AbdomenZone?

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                VStack(spacing: 2) {
                    ForEach(0..<3, id: \.self) { row in
                        HStack(spacing: 2) {
                            ForEach(0..<3, id: \.self) { col in
                                let order = [[1, 0, 2], [5, 4, 3], [6, 7, 8]]
                                let idx = order[row][col]
                                if idx < abdomenZones.count {
                                    let zone = abdomenZones[idx]
                                    Button {
                                        selected = selected?.id == zone.id ? nil : zone
                                    } label: {
                                        VStack(spacing: 4) {
                                            Text("\(zone.number)").font(.title2.bold())
                                                .foregroundStyle(selected?.id == zone.id ? .white : zone.system.color)
                                            Text(zone.name).font(.caption2)
                                                .foregroundStyle(selected?.id == zone.id ? .white.opacity(0.8) : .secondary)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 80)
                                        .background(selected?.id == zone.id ? zone.system.color : zone.system.color.opacity(0.12))
                                        .clipShape(RoundedRectangle(cornerRadius: 6))
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                }
                .frame(maxWidth: 400)

                if let zone = selected {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Circle().fill(zone.system.color).frame(width: 12, height: 12)
                            Text(zone.name).font(.headline)
                            Text("-- \(zone.organ)").font(.subheadline).foregroundStyle(.secondary)
                        }
                        Divider()
                        Text(zone.conditions).font(.subheadline.bold())
                        Text(zone.location).font(.subheadline).foregroundStyle(.secondary)
                        Text(zone.technique).font(.subheadline).foregroundStyle(.secondary)
                        Text(zone.referral).font(.caption).foregroundStyle(.orange)
                            .padding(10).background(.orange.opacity(0.08)).clipShape(RoundedRectangle(cornerRadius: 8))
                        Button("Log Session") {
                            store.add(BodyworkSession(type: "abdominal-referral", name: zone.name, area: "abdomen"))
                        }.buttonStyle(.borderedProminent)
                    }
                    .padding()
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
                    .frame(maxWidth: 500)
                }
            }
            .padding()
        }
        .navigationTitle("Abdominal Pain Referral")
    }
}
