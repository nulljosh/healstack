import SwiftUI

struct ZoneDetailView: View {
    let zone: ReflexZone
    @Environment(BodyworkSessionStore.self) private var store

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 10) {
                Circle().fill(zone.system.color).frame(width: 12, height: 12)
                VStack(alignment: .leading, spacing: 2) {
                    Text(zone.name).font(.headline)
                    Text("\(zone.organ) -- \(zone.system.rawValue)")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }

            Divider()

            Group {
                field("LOCATION", zone.location)
                field("TECHNIQUE", zone.technique)
                field("DURATION", zone.duration)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("BENEFITS").font(.caption).fontWeight(.semibold).tracking(1.2).foregroundStyle(.secondary)
                BodyworkFlowLayout(spacing: 6) {
                    ForEach(zone.benefits, id: \.self) { b in
                        Text(b)
                            .font(.caption)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(zone.system.color.opacity(0.15))
                            .clipShape(Capsule())
                    }
                }
            }

            Button {
                store.add(BodyworkSession(type: "reflexology", name: zone.name, area: zone.organ))
            } label: {
                Text("Log Session")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
            }
            .buttonStyle(.borderedProminent)
            .tint(Color(red: 0.141, green: 0.447, blue: 0.698))
        }
        .padding()
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal)
    }

    private func field(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label).font(.caption).fontWeight(.semibold).tracking(1.2).foregroundStyle(.secondary)
            Text(value).font(.subheadline)
        }
    }
}

struct BodyworkFlowLayout: Layout {
    var spacing: CGFloat = 6

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = arrange(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = arrange(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var totalHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth, x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
            totalHeight = y + rowHeight
        }

        return (CGSize(width: maxWidth, height: totalHeight), positions)
    }
}
