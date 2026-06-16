import SwiftUI

struct AbdomenView: View {
    @Environment(BodyworkSessionStore.self) private var store
    @State private var selected: AbdomenZone?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    abdomenGrid

                    if let zone = selected {
                        abdomenDetail(zone)
                    }
                }
                .padding()
            }
            .navigationTitle("Abdominal Referral")
        }
    }

    private var abdomenGrid: some View {
        VStack(spacing: 2) {
            ForEach(0..<3) { row in
                HStack(spacing: 2) {
                    ForEach(0..<3) { col in
                        let index = row * 3 + col
                        let order = [[1, 0, 2], [5, 4, 3], [6, 7, 8]]
                        let zoneIndex = order[row][col]
                        if zoneIndex < abdomenZones.count {
                            let zone = abdomenZones[zoneIndex]
                            Button {
                                withAnimation(.spring(response: 0.3)) {
                                    selected = selected?.id == zone.id ? nil : zone
                                }
                            } label: {
                                VStack(spacing: 4) {
                                    Text("\(zone.number)")
                                        .font(.title2.bold())
                                        .foregroundStyle(selected?.id == zone.id ? .white : zone.system.color)
                                    Text(zone.name)
                                        .font(.caption2)
                                        .foregroundStyle(selected?.id == zone.id ? .white.opacity(0.8) : .secondary)
                                }
                                .frame(maxWidth: .infinity)
                                .frame(height: 80)
                                .background(selected?.id == zone.id ? zone.system.color : zone.system.color.opacity(0.12))
                                .clipShape(RoundedRectangle(cornerRadius: row == 0 && col == 0 ? 12 : row == 0 && col == 2 ? 12 : row == 2 && col == 0 ? 12 : row == 2 && col == 2 ? 12 : 4, style: .continuous))
                            }
                        }
                    }
                }
            }
        }
    }

    private func abdomenDetail(_ zone: AbdomenZone) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Circle().fill(zone.system.color).frame(width: 12, height: 12)
                VStack(alignment: .leading) {
                    Text(zone.name).font(.headline)
                    Text("\(zone.organ) -- \(zone.system.rawValue)")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }

            Divider()

            Group {
                detailField("Conditions", zone.conditions)
                detailField("Location", zone.location)
                detailField("Technique", zone.technique)
                detailField("Duration", zone.duration)
            }

            Text(zone.referral)
                .font(.caption)
                .foregroundStyle(.orange)
                .padding(10)
                .background(.orange.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 8))

            HStack {
                ForEach(zone.benefits, id: \.self) { b in
                    Text(b)
                        .font(.caption2)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(zone.system.color.opacity(0.12))
                        .clipShape(Capsule())
                }
            }

            Button {
                store.add(BodyworkSession(type: "abdominal-referral", name: zone.name, area: "abdomen"))
            } label: {
                Text("Log Session")
                    .frame(maxWidth: .infinity)
                    .fontWeight(.semibold)
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func detailField(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label.uppercased())
                .font(.caption2.weight(.medium))
                .foregroundStyle(.tertiary)
            Text(value)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }
}
