import Foundation
import UserNotifications
import Observation

@MainActor
@Observable
final class NotificationService {
    private let center = UNUserNotificationCenter.current()

    func requestAuthorization() async -> Bool {
        do {
            return try await center.requestAuthorization(options: [.alert, .sound, .badge])
        } catch {
            return false
        }
    }

    func scheduleDoseReminder(substanceName: String, at date: Date, repeats: Bool) {
        let content = UNMutableNotificationContent()
        content.title = "Dose Reminder"
        content.body = "Time to take \(substanceName)."
        content.sound = .default

        let components = Calendar.current.dateComponents([.hour, .minute], from: date)
        let hour = components.hour ?? 0
        let minute = components.minute ?? 0

        let trigger: UNNotificationTrigger
        if repeats {
            var dateComponents = DateComponents()
            dateComponents.hour = hour
            dateComponents.minute = minute
            trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)
        } else {
            trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
        }

        let id = "dose-\(substanceName)-\(hour)-\(minute)"
        let request = UNNotificationRequest(identifier: id, content: content, trigger: trigger)
        center.add(request)
    }

    func cancelReminder(id: String) {
        center.removePendingNotificationRequests(withIdentifiers: [id])
    }

    func cancelAll() {
        center.removeAllPendingNotificationRequests()
    }

    func getPending() async -> [UNNotificationRequest] {
        await center.pendingNotificationRequests()
    }
}
