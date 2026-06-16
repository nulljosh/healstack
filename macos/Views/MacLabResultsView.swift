import SwiftUI
import Charts

struct MacFlagLabel: View {
    let flag: MarkerFlag
    var body: some View {
        if flag != .normal {
            Text(flag.label)
                .font(.caption2).fontWeight(.bold).textCase(.uppercase)
                .padding(.horizontal, 6).padding(.vertical, 2)
                .background(flag == .critical ? Color.red.opacity(0.1) : Color.orange.opacity(0.1))
                .foregroundStyle(flag == .critical ? .red : .orange)
                .clipShape(Capsule())
        }
    }
}

struct MacAddLabResultSheet: View {
    @Bindable var dataStore: DataStore
    @Environment(\.dismiss) private var dismiss
    @State private var date = Date()
    @State private var lab = "LifeLabs"
    @State private var selectedPanel = "Thyroid"
    @State private var markers: [(name: String, value: String, unit: String, refLow: String, refHigh: String)] = []

    var body: some View {
        Form {
            Section("Details") {
                DatePicker("Date", selection: $date, displayedComponents: .date)
                TextField("Lab", text: $lab)
            }
            Section("Panel") {
                Picker("Panel", selection: $selectedPanel) {
                    ForEach(LabPanel.all.map(\.name), id: \.self) { Text($0).tag($0) }
                }
                .onChange(of: selectedPanel) { _, name in loadPanel(name) }
            }
            Section("Markers") {
                ForEach(markers.indices, id: \.self) { i in
                    HStack {
                        Text(markers[i].name).frame(width: 140, alignment: .leading)
                        TextField("Value", text: Binding(get: { markers[i].value }, set: { markers[i].value = $0 }))
                            .textFieldStyle(.roundedBorder).frame(width: 80)
                        Text(markers[i].unit).foregroundStyle(.secondary).font(.caption)
                    }
                }
            }
        }
        .navigationTitle("Add Lab Result")
        .toolbar {
            ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
            ToolbarItem(placement: .confirmationAction) {
                Button("Save") { save(); dismiss() }
                    .disabled(markers.filter { !$0.value.isEmpty }.isEmpty)
            }
        }
        .onAppear { loadPanel(selectedPanel) }
    }

    func loadPanel(_ name: String) {
        guard let panel = LabPanel.all.first(where: { $0.name == name }) else { return }
        markers = panel.markers.map { m in
            (name: m.name, value: "", unit: m.unit,
             refLow: m.refLow.map { String($0) } ?? "",
             refHigh: m.refHigh.map { String($0) } ?? "")
        }
    }

    func save() {
        let labMarkers: [LabMarker] = markers.filter { !$0.value.isEmpty }.compactMap { m in
            guard let v = Double(m.value) else { return nil }
            let lo = Double(m.refLow); let hi = Double(m.refHigh)
            return LabMarker(name: m.name, value: v, unit: m.unit, refLow: lo, refHigh: hi,
                             flag: LabMarker.computeFlag(value: v, refLow: lo, refHigh: hi))
        }
        dataStore.addLabResult(LabResult(date: date, lab: lab, panel: selectedPanel, markers: labMarkers))
    }
}

struct MacLabResultsView: View {
    @Bindable var dataStore: DataStore
    @State private var showAdd = false
    @State private var selectedMarker = ""
    @State private var tab = "timeline"

    private var sorted: [LabResult] { dataStore.labResults.sorted { $0.date > $1.date } }
    private var markerNames: [String] { dataStore.allMarkerNames }

    var body: some View {
        VStack(spacing: 0) {
            Picker("", selection: $tab) {
                Text("Timeline").tag("timeline")
                Text("Markers").tag("markers")
            }
            .pickerStyle(.segmented)
            .padding()

            if tab == "timeline" {
                if sorted.isEmpty {
                    ContentUnavailableView("No Lab Results", systemImage: "cross.vial",
                        description: Text("Add results using the button above, or import from a LifeLabs PDF on the web app."))
                } else {
                    List(sorted) { result in
                        DisclosureGroup {
                            ForEach(result.markers) { m in
                                HStack {
                                    Text(m.name).frame(maxWidth: .infinity, alignment: .leading)
                                    Text("\(m.value, specifier: "%.1f") \(m.unit)")
                                        .fontWeight(.semibold)
                                    MacFlagLabel(flag: m.flag)
                                }
                                .padding(.vertical, 2)
                            }
                        } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(result.date, style: .date).font(.caption).foregroundStyle(.secondary)
                                    Text("\(result.lab) — \(result.panel)").fontWeight(.medium)
                                }
                                Spacer()
                                if result.flaggedCount > 0 {
                                    Text("\(result.flaggedCount) flagged")
                                        .font(.caption2).fontWeight(.bold).foregroundStyle(.red)
                                        .padding(.horizontal, 7).padding(.vertical, 3)
                                        .background(Color.red.opacity(0.1)).clipShape(Capsule())
                                }
                                Spacer()
                            }
                        }
                    }
                }
            } else {
                VStack(alignment: .leading) {
                    Picker("Marker", selection: $selectedMarker) {
                        ForEach(markerNames, id: \.self) { Text($0).tag($0) }
                    }
                    .padding(.horizontal)

                    let history = dataStore.labResultsByMarker(selectedMarker)
                    if history.count >= 2 {
                        Chart {
                            ForEach(history, id: \.date) { row in
                                LineMark(x: .value("Date", row.date), y: .value("Value", row.marker.value))
                                    .foregroundStyle(.blue)
                                PointMark(x: .value("Date", row.date), y: .value("Value", row.marker.value))
                                    .foregroundStyle(row.marker.flag == .normal ? Color.blue : .orange)
                            }
                        }
                        .frame(height: 200)
                        .padding()
                    } else {
                        Text("Need at least 2 readings.").foregroundStyle(.secondary).padding()
                    }
                    Spacer()
                }
                .onAppear { if selectedMarker.isEmpty { selectedMarker = markerNames.first ?? "" } }
            }
        }
        .navigationTitle("Lab Results")
        .toolbar {
            ToolbarItem { Button("Add Result") { showAdd = true } }
        }
        .sheet(isPresented: $showAdd) {
            MacAddLabResultSheet(dataStore: dataStore)
                .frame(minWidth: 480, minHeight: 500)
        }
    }
}
