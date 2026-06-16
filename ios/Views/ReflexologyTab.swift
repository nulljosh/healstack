import SwiftUI

struct ReflexologyTab: View {
    @State private var selectedArea = 0
    @State private var selectedZone: ReflexZone?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    Picker("Area", selection: $selectedArea) {
                        Text("Feet").tag(0)
                        Text("Hands").tag(1)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)

                    let zones = selectedArea == 0 ? footZones : handZones

                    BodyMapView(
                        zones: zones,
                        viewBox: selectedArea == 0
                            ? CGRect(x: 100, y: 5, width: 130, height: 220)
                            : CGRect(x: 40, y: 0, width: 145, height: 165),
                        outlinePath: selectedArea == 0 ? footOutline : handOutline,
                        selectedZone: $selectedZone
                    )
                    .frame(height: 380)
                    .padding(.horizontal)

                    if let zone = selectedZone {
                        ZoneDetailView(zone: zone)
                            .transition(.move(edge: .bottom).combined(with: .opacity))
                    }

                    if selectedZone == nil {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("ZONES")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .tracking(1.2)
                                .foregroundStyle(.secondary)
                                .padding(.horizontal)

                            ForEach(zones) { zone in
                                Button {
                                    withAnimation(.spring(response: 0.35)) {
                                        selectedZone = zone
                                    }
                                } label: {
                                    HStack(spacing: 12) {
                                        Circle()
                                            .fill(zone.system.color)
                                            .frame(width: 10, height: 10)
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(zone.name)
                                                .fontWeight(.medium)
                                            Text(zone.organ)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .font(.caption)
                                            .foregroundStyle(.tertiary)
                                    }
                                    .padding(.horizontal)
                                    .padding(.vertical, 10)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle(selectedArea == 0 ? "Foot Reflexology" : "Hand Reflexology")
            .animation(.spring(response: 0.35), value: selectedZone?.id)
        }
    }
}

private let footOutline = "M 125,55 C 128,40 135,25 145,20 C 155,15 170,18 180,20 C 190,22 200,25 205,35 C 210,45 212,60 212,75 C 212,85 208,95 205,105 C 202,115 200,130 200,145 C 200,160 202,170 200,185 C 198,200 195,210 185,215 C 175,220 155,220 145,215 C 135,210 128,200 125,185 C 122,170 120,155 120,140 C 120,125 122,110 122,95 C 122,80 123,65 125,55 Z"

private let handOutline = "M 70,48 C 65,35 58,22 60,15 C 62,8 72,8 76,15 C 80,22 78,35 80,45 L 85,28 C 82,18 80,8 85,4 C 90,0 98,2 100,8 C 102,14 100,28 98,38 L 108,18 C 106,10 108,2 114,1 C 120,0 126,4 127,10 C 128,16 124,28 120,40 L 130,25 C 130,18 132,10 138,10 C 144,10 148,16 148,22 C 148,28 145,38 142,48 L 150,42 C 152,36 156,32 161,34 C 166,36 168,42 166,48 C 164,54 158,62 152,68 C 146,74 155,82 155,95 C 155,108 152,120 150,130 C 148,140 145,148 138,152 C 131,156 110,158 95,156 C 80,154 68,148 62,140 C 56,132 55,120 56,108 C 57,96 60,85 62,78 C 64,71 68,62 70,55 Z"
