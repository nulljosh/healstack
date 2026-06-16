import SwiftUI

private var allAcuPoints: [(id: String, name: String, meridianColor: Color)] {
    meridians.flatMap { m in m.points.map { p in (id: p.id, name: p.name, meridianColor: m.color) } }
}

struct MacSymptomFinderView: View {
    @State private var query = ""
    @State private var selected: Symptom?

    private var filtered: [Symptom] {
        query.isEmpty ? symptoms : symptoms.filter {
            $0.name.localizedCaseInsensitiveContains(query) || $0.selfCare.localizedCaseInsensitiveContains(query)
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            TextField("Search symptoms...", text: $query)
                .textFieldStyle(.roundedBorder)
                .padding()

            ScrollView {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 140))], spacing: 8) {
                    ForEach(filtered) { s in
                        Button {
                            selected = selected?.id == s.id ? nil : s
                        } label: {
                            Text(s.name)
                                .font(.subheadline.weight(.medium))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(selected?.id == s.id ? Color.accentColor.opacity(0.15) : Color.secondary.opacity(0.08))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal)

                if let s = selected {
                    VStack(alignment: .leading, spacing: 16) {
                        Text(s.name).font(.title2.bold())
                        Text(s.selfCare).font(.subheadline).foregroundStyle(.secondary)

                        Text("REFLEXOLOGY ZONES").font(.caption.weight(.semibold)).foregroundStyle(.tertiary)
                        ForEach(s.reflexZones, id: \.self) { zid in
                            if let zone = footZones.first(where: { $0.id == zid }) ?? handZones.first(where: { $0.id == zid }) {
                                HStack {
                                    Circle().fill(zone.system.color).frame(width: 8, height: 8)
                                    Text(zone.name).font(.subheadline)
                                    Text("-- \(zone.location)").font(.caption).foregroundStyle(.secondary)
                                }
                            }
                        }

                        Text("ACUPUNCTURE POINTS").font(.caption.weight(.semibold)).foregroundStyle(.tertiary)
                        ForEach(s.acuPoints, id: \.self) { pid in
                            if let pt = allAcuPoints.first(where: { $0.id == pid }) {
                                HStack {
                                    Text(pt.id).font(.subheadline.bold()).foregroundStyle(pt.meridianColor)
                                    Text(pt.name).font(.subheadline)
                                }
                            }
                        }
                    }
                    .padding()
                    .frame(maxWidth: 600, alignment: .leading)
                }
            }
        }
        .navigationTitle("Symptom Finder")
    }
}
