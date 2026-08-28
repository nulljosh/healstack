import SwiftUI
import LocalAuthentication

/// The five destinations, in order. `selectedTab` indexes into this.
/// Shared by the iOS floating tab bar, the iOS TabView, and the macOS sidebar.
private let doseTabs: [(icon: String, fill: String, label: String)] = [
    ("house", "house.fill", "Home"),
    ("books.vertical", "books.vertical.fill", "Library"),
    ("chart.line.uptrend.xyaxis.circle", "chart.line.uptrend.xyaxis.circle.fill", "Insights"),
    ("figure.mind.and.body", "figure.mind.and.body", "Body"),
    ("cross.vial", "cross.vial.fill", "Labs"),
]

@main
struct HealstackApp: App {
    @Environment(\.scenePhase) private var scenePhase
    @State private var authService = AuthService()
    @State private var dataStore = DataStore()
    @State private var healthKitService = HealthKitService()
    @State private var notificationService = NotificationService()
    @State private var syncService = SyncService()
    @State private var bodyworkStore = BodyworkSessionStore()
    @State private var showSplash = true
    @State private var biometryType: LABiometryType = .none
    @AppStorage("app_theme") private var rawTheme = "system"
    @State private var isUnlocked = false
    @State private var isUnlocking = false
    @State private var unlockError: String?
    @State private var selectedTab = 0

    private var isUITestSnapshot: Bool {
        CommandLine.arguments.contains("UITEST_SNAPSHOT")
    }

    private var requiresUnlock: Bool {
        !isUITestSnapshot && biometryType != .none
    }

    var body: some Scene {
        WindowGroup {
            Group {
            if authService.isLoading {
                SplashView()
            } else if authService.user == nil && !isUITestSnapshot {
                AuthView(authService: authService)
            } else if authService.isPasswordRecovery {
                NewPasswordView(authService: authService)
            } else {
            ZStack {
                // Group so the shared modifiers below chain onto whichever shell is compiled.
                Group {
                #if os(macOS)
                NavigationSplitView {
                    List(doseTabs.indices, id: \.self, selection: sidebarSelection) { index in
                        Label(doseTabs[index].label, systemImage: doseTabs[index].fill)
                            .tag(index)
                    }
                    .listStyle(.sidebar)
                    .navigationSplitViewColumnWidth(min: 180, ideal: 200, max: 260)
                } detail: {
                    destination(for: selectedTab)
                }
                #else
                TabView(selection: $selectedTab) {
                    ForEach(doseTabs.indices, id: \.self) { index in
                        destination(for: index)
                            .tabItem { Label(doseTabs[index].label, systemImage: doseTabs[index].fill) }
                            .tag(index)
                            .hideSystemTabBar()
                    }
                }
                .hideSystemTabBar()
                #endif
                }
                .onChange(of: selectedTab) { _, _ in
                    Haptics.impact(.light)
                }
                .task {
                    if HealthKitService.isAvailable && !isUITestSnapshot {
                        await healthKitService.requestAuthorization()
                    }
                }

                if !requiresUnlock || isUnlocked {
                    #if os(iOS)
                    // macOS draws TabView's own tab strip, so the floating bar
                    // would be a second, redundant tab bar on top of it.
                    HealstackFloatingTabBar(selectedTab: $selectedTab)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
                        .padding(.bottom, 8)
                        .zIndex(1)
                    #endif

                    WhatsNewSheet()
                }

                if !showSplash, requiresUnlock, !isUnlocked {
                    HealstackLockView(
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
            .preferredColorScheme(rawTheme == "dark" ? .dark : rawTheme == "light" ? .light : nil)
            .onOpenURL { url in
                Task { try? await supabaseClient.auth.session(from: url) }
            }
        }
        #if os(macOS)
        .defaultSize(width: 1000, height: 700)
        #endif
    }

    /// One construction of each destination, used by both the iOS TabView and the macOS sidebar.
    @ViewBuilder
    private func destination(for index: Int) -> some View {
        switch index {
        case 0:
            DashboardView(dataStore: dataStore, notificationService: notificationService, syncService: syncService, authService: authService)
        case 1:
            LibraryView(dataStore: dataStore)
        case 2:
            InsightsView(dataStore: dataStore)
        case 3:
            CombinedBodyView(dataStore: dataStore, healthKitService: healthKitService)
                .environment(bodyworkStore)
        default:
            LabResultsView(dataStore: dataStore)
        }
    }

    /// `List` single-selection binds an optional; `selectedTab` is not. Ignore deselection
    /// so the detail column always has something to show.
    private var sidebarSelection: Binding<Int?> {
        Binding(get: { selectedTab }, set: { if let new = $0 { selectedTab = new } })
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
            try await context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: "Unlock Healstack")
            isUnlocked = true
        } catch let error as LAError where error.code == .userCancel || error.code == .systemCancel || error.code == .appCancel {
            unlockError = nil
        } catch {
            unlockError = error.localizedDescription
        }
    }
}

private struct HealstackFloatingTabBar: View {
    @Binding var selectedTab: Int

    private let tabs = doseTabs

    var body: some View {
        HStack(spacing: 0) {
            ForEach(tabs.indices, id: \.self) { index in
                Button {
                    selectedTab = index
                    Haptics.impact(.light)
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
                .accessibilityIdentifier("tab.\(tabs[index].label)")
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 10)
        .frame(maxWidth: 360)
        .liquidGlass(in: Capsule(), interactive: true)
        .overlay(Capsule().stroke(Color.primary.opacity(0.08), lineWidth: 1))
    }
}

private struct HealstackLockView: View {
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

                Text("Healstack is locked")
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
