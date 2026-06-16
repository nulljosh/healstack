import SwiftUI

struct MacFacemaxxingView: View {
    @State private var selection: FacemaxxingProtocol? = FacemaxxingData.protocols.first
    @AppStorage("facemaxxing.checked") private var checkedRaw: String = "{}"

    private var todayKey: String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: Date())
    }

    private var checked: [String: [String: Bool]] {
        guard let data = checkedRaw.data(using: .utf8),
              let dict = try? JSONDecoder().decode([String: [String: Bool]].self, from: data)
        else { return [:] }
        return dict
    }

    private var todayChecks: [String: Bool] { checked[todayKey] ?? [:] }
    private var completedToday: Int { todayChecks.values.filter { $0 }.count }
    private var totalCount: Int { FacemaxxingData.protocols.count }

    var body: some View {
        NavigationSplitView {
            sidebarList
                .navigationSplitViewColumnWidth(min: 220, ideal: 260)
        } detail: {
            detailPane
        }
    }

    private var sidebarList: some View {
        List(selection: $selection) {
            todaySection
            protocolsSection
        }
    }

    private var todaySection: some View {
        Section {
            HStack {
                Text("Today")
                Spacer()
                Text("\(completedToday)/\(totalCount)")
                    .foregroundStyle(.tint)
                    .bold()
            }
        }
    }

    private var protocolsSection: some View {
        Section("Protocols") {
            ForEach(FacemaxxingData.protocols) { p in
                sidebarRow(p).tag(p)
            }
        }
    }

    private func sidebarRow(_ p: FacemaxxingProtocol) -> some View {
        HStack {
            let isChecked = todayChecks[p.id] == true
            Button {
                toggle(p.id)
            } label: {
                Image(systemName: isChecked ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(isChecked ? Color.accentColor : .secondary)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 2) {
                Text(p.title)
                Text(p.category)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    @ViewBuilder
    private var detailPane: some View {
        if let p = selection {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    detailHeader(p)
                    Divider()
                    stepsBlock(p)
                    Divider()
                    pslBlock(p)
                    Divider()
                    notesBlock(p)
                    Text("Not medical advice.")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(24)
            }
        } else {
            Text("Select a protocol")
                .foregroundStyle(.secondary)
        }
    }

    private func detailHeader(_ p: FacemaxxingProtocol) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(p.title).font(.largeTitle.bold())
            Text(p.summary)
                .font(.title3)
                .foregroundStyle(.secondary)
            HStack {
                Label(p.category, systemImage: "tag")
                Label(p.difficulty, systemImage: "clock")
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
    }

    private func stepsBlock(_ p: FacemaxxingProtocol) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Protocol").font(.headline)
            ForEach(Array(p.steps.enumerated()), id: \.offset) { i, s in
                HStack(alignment: .top, spacing: 8) {
                    Text("\(i + 1).")
                        .foregroundStyle(.secondary)
                        .monospacedDigit()
                    Text(s)
                }
            }
        }
    }

    private func pslBlock(_ p: FacemaxxingProtocol) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("PSL Impact").font(.headline)
            HStack {
                ForEach(p.psl, id: \.self) { dim in
                    Text(dim)
                        .font(.caption)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.accentColor.opacity(0.15))
                        .clipShape(Capsule())
                }
            }
        }
    }

    private func notesBlock(_ p: FacemaxxingProtocol) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Notes").font(.headline)
            Text(p.notes).foregroundStyle(.secondary)
        }
    }

    private func toggle(_ id: String) {
        var dict = checked
        var today = dict[todayKey] ?? [:]
        today[id] = !(today[id] ?? false)
        dict[todayKey] = today
        if let data = try? JSONEncoder().encode(dict),
           let str = String(data: data, encoding: .utf8) {
            checkedRaw = str
        }
    }
}
