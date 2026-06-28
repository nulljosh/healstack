import SwiftUI
import LocalAuthentication
import UIKit

@main
struct DoseApp: App {
    @Environment(\.scenePhase) private var scenePhase
    @State private var authService = AuthService()
    @State private var dataStore = DataStore()
    @State private var healthKitService = HealthKitService()
    @State private var notificationService = NotificationService()
    @State private var syncService = SyncService()
    @State private var bodyworkStore = BodyworkSessionStore()
    @State private var showSplash = true
    @State private var biometryType: LABiometryType = .none
    @State private var isUnlocked = false
    @State private var isUnlocking = false
    @State private var unlockError: String?
    @State private var selectedTab = 0

    private var requiresUnlock: Bool {
        biometryType != .none
    }

    var body: some Scene {
        WindowGroup {
            Group {
            if authService.isLoading {
                SplashView()
            } else if authService.user == nil {
                AuthView(authService: authService)
            } else if authService.isPasswordRecovery {
                NewPasswordView(authService: authService)
            } else {
            ZStack {
                TabView(selection: $selectedTab) {
                    DashboardView(dataStore: dataStore, notificationService: notificationService, syncService: syncService, authService: authService)
                        .tabItem { Label("Home", systemImage: "house.fill") }
                        .tag(0)
                        .toolbar(.hidden, for: .tabBar)

                    LibraryView(dataStore: dataStore)
                        .tabItem { Label("Library", systemImage: "books.vertical.fill") }
                        .tag(1)
                        .toolbar(.hidden, for: .tabBar)

                    InsightsView(dataStore: dataStore)
                        .tabItem { Label("Insights", systemImage: "chart.line.uptrend.xyaxis.circle.fill") }
                        .tag(2)
                        .toolbar(.hidden, for: .tabBar)

                    CombinedBodyView(dataStore: dataStore, healthKitService: healthKitService)
                        .environment(bodyworkStore)
                        .tabItem { Label("Body", systemImage: "figure.mind.and.body") }
                        .tag(3)
                        .toolbar(.hidden, for: .tabBar)

                    LabResultsView(dataStore: dataStore)
                        .tabItem { Label("Labs", systemImage: "cross.vial.fill") }
                        .tag(4)
                        .toolbar(.hidden, for: .tabBar)
                }
                .toolbar(.hidden, for: .tabBar)
                .onChange(of: selectedTab) { _, _ in
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                }
                .task {
                    if HealthKitService.isAvailable {
                        await healthKitService.requestAuthorization()
                    }
                }

                if !requiresUnlock || isUnlocked {
                    DoseFloatingTabBar(selectedTab: $selectedTab)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
                        .padding(.bottom, 8)
                        .zIndex(1)
                }

                if !showSplash, requiresUnlock, !isUnlocked {
                    DoseLockView(
                        biometryType: biometryType,
                        isUnlocking: isUnlocking,
                        errorMessage: unlockError
                    ) {
                        Task {
                            await unlock()
                        }
                    }
                    .zIndex(2)
                    .transition(.opacity)
                }

                if showSplash {
                    SplashView()
                        .zIndex(1)
                        .transition(.opacity)
                }
            }
            .onAppear {
                biometryType = availableBiometryType()
                isUnlocked = !requiresUnlock
                Task {
                    try? await Task.sleep(for: .seconds(1.5))
                    withAnimation(.easeOut(duration: 0.5)) {
                        showSplash = false
                    }
                    if requiresUnlock {
                        await unlock()
                    }
                }
            }
            .onChange(of: scenePhase) { _, newPhase in
                guard requiresUnlock else { return }
                switch newPhase {
                case .background, .inactive:
                    isUnlocked = false
                case .active:
                    if !showSplash, !isUnlocked, !isUnlocking {
                        Task {
                            await unlock()
                        }
                    }
                @unknown default:
                    break
                }
            }
            } // end auth check
            } // end Group
            .onOpenURL { url in
                Task { try? await supabaseClient.auth.session(from: url) }
            }
        }
    }

    private func availableBiometryType() -> LABiometryType {
        let context = LAContext()
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil) else {
            return .none
        }
        return context.biometryType
    }

    private func unlock() async {
        guard requiresUnlock, !isUnlocking else { return }
        isUnlocking = true
        unlockError = nil
        defer { isUnlocking = false }

        let context = LAContext()
        do {
            try await context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: "Unlock Dose")
            isUnlocked = true
        } catch let error as LAError where error.code == .userCancel || error.code == .systemCancel || error.code == .appCancel {
            unlockError = nil
        } catch {
            unlockError = error.localizedDescription
        }
    }
}

private struct DoseFloatingTabBar: View {
    @Binding var selectedTab: Int

    private let tabs: [(icon: String, fill: String, label: String)] = [
        ("house", "house.fill", "Home"),
        ("books.vertical", "books.vertical.fill", "Library"),
        ("chart.line.uptrend.xyaxis.circle", "chart.line.uptrend.xyaxis.circle.fill", "Insights"),
        ("figure.mind.and.body", "figure.mind.and.body", "Body"),
        ("cross.vial", "cross.vial.fill", "Labs"),
    ]

    var body: some View {
        HStack(spacing: 0) {
            ForEach(tabs.indices, id: \.self) { index in
                Button {
                    selectedTab = index
                    UIImpactFeedbackGenerator(style: .light).impactOccurred()
                } label: {
                    Image(systemName: selectedTab == index ? tabs[index].fill : tabs[index].icon)
                        .font(.system(size: 20, weight: .medium))
                        .foregroundStyle(selectedTab == index ? Color.accentColor : Color.secondary)
                        .symbolEffect(.bounce, value: selectedTab == index)
                        .frame(width: 50, height: 40)
                        .background {
                            if selectedTab == index {
                                Capsule().fill(Color.accentColor.opacity(0.1))
                            }
                        }
                }
                .frame(maxWidth: .infinity)
                .buttonStyle(.plain)
                .accessibilityLabel(tabs[index].label)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 10)
        .frame(maxWidth: 360)
        .background(.regularMaterial, in: Capsule())
        .overlay(Capsule().stroke(Color.primary.opacity(0.08), lineWidth: 1))
        .shadow(color: .black.opacity(0.1), radius: 12, y: 4)
    }
}

private struct DoseLockView: View {
    let biometryType: LABiometryType
    let isUnlocking: Bool
    let errorMessage: String?
    let unlockAction: () -> Void

    private var biometricLabel: String {
        biometryType == .faceID ? "Face ID" : "Touch ID"
    }

    private var biometricIcon: String {
        biometryType == .faceID ? "faceid" : "touchid"
    }

    var body: some View {
        ZStack {
            Rectangle()
                .fill(.ultraThinMaterial)
                .ignoresSafeArea()

            VStack(spacing: 20) {
                Image(systemName: biometricIcon)
                    .font(.system(size: 42))
                    .foregroundStyle(.primary)

                Text("Dose is locked")
                    .font(.title2.weight(.semibold))

                Text("Authenticate with \(biometricLabel) to access your health data.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)

                Button(action: unlockAction) {
                    HStack {
                        if isUnlocking {
                            ProgressView()
                        }
                        Text("Unlock with \(biometricLabel)")
                            .fontWeight(.semibold)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                }
                .buttonStyle(.borderedProminent)

                if let errorMessage, !errorMessage.isEmpty {
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundStyle(.red)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(24)
        }
    }
}
