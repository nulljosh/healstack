import SwiftUI

struct FacemaxxingView: View {
    @AppStorage("facemaxxing.checked") private var checkedRaw: String = "{}"

    private var todayKey: String {
        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd"; return f.string(from: Date())
    }

    private var checked: [String: [String: Bool]] {
        guard let data = checkedRaw.data(using: .utf8),
              let dict = try? JSONDecoder().decode([String: [String: Bool]].self, from: data)
        else { return [:] }
        return dict
    }

    private var todayChecks: [String: Bool] { checked[todayKey] ?? [:] }
    private var completedToday: Int { todayChecks.values.filter { $0 }.count }

    var body: some View {
        List {
            Section {
                HStack {
                    Text("Today").font(.caption2).foregroundStyle(.secondary)
                    Spacer()
                    Text("\(completedToday)/\(FacemaxxingData.protocols.count)")
                        .font(.headline).foregroundStyle(.tint)
                }
            }
            ForEach(FacemaxxingData.protocols) { p in
                Button {
                    toggle(p.id)
                } label: {
                    HStack {
                        Image(systemName: todayChecks[p.id] == true ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(todayChecks[p.id] == true ? .green : .secondary)
                        VStack(alignment: .leading, spacing: 1) {
                            Text(p.title).font(.caption)
                            Text(p.category).font(.caption2).foregroundStyle(.secondary)
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .navigationTitle("Facemaxx")
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
