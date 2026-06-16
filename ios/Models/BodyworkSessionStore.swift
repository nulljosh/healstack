import Foundation
import Observation

struct BodyworkSession: Identifiable, Codable {
    let id: UUID
    let type: String
    let name: String
    let area: String
    let date: Date
    var notes: String

    init(type: String, name: String, area: String, notes: String = "") {
        self.id = UUID()
        self.type = type
        self.name = name
        self.area = area
        self.date = Date()
        self.notes = notes
    }
}

@Observable
final class BodyworkSessionStore {
    var sessions: [BodyworkSession] = []

    private static let storageKey = "pulse_sessions"
    private let key = storageKey

    init() {
        if let data = UserDefaults.standard.data(forKey: key),
           let decoded = try? JSONDecoder().decode([BodyworkSession].self, from: data) {
            sessions = decoded
        }
    }

    func add(_ session: BodyworkSession) {
        sessions.insert(session, at: 0)
        save()
    }

    func delete(at offsets: IndexSet) {
        sessions.remove(atOffsets: offsets)
        save()
    }

    func delete(id: UUID) {
        sessions.removeAll { $0.id == id }
        save()
    }

    private func save() {
        if let data = try? JSONEncoder().encode(sessions) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }
}
