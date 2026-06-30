# Dose

v2.3.3

## Rules

- iOS 17+, SwiftUI only, @Observable, @Bindable
- xcodegen (project.yml), no checked-in .xcodeproj
- HealthKit entitlements via Dose.entitlements
- App Group: group.com.heyitsmejosh.dose (widget data sync)
- Supabase auth (email/password, password reset via dose:// deep link)
- Local persistence: UserDefaults via DataStore; syncs to dose.heyitsmejosh.com/api/sync using Supabase JWT
- no emojis

## Run

```bash
xcodegen generate && open Dose.xcodeproj
xcodebuild -scheme Dose build
xcodebuild -scheme Dose test
```

## Key Files

- DoseApp.swift: app entry point with tab layout, splash, biometric lock, and auth/recovery gating
- Services/AuthService.swift: Supabase auth — sign in, sign up, sign out, password reset, recovery flow
- Services/DataStore.swift: UserDefaults persistence, widget sync, and import/export bundle
- Services/SyncService.swift: push/pull sync to web API using Supabase JWT
- Services/HealthKitService.swift: HealthKit authorization and metric fetching
- Services/InteractionEngine.swift: interaction classification for built-in substances
- Views/AuthView.swift: sign in / register / forgot password UI
- Views/NewPasswordView.swift: password update after deep-link recovery
- Views/DashboardView.swift: home dashboard for active stack and recent entries
- Views/SettingsView.swift: account (email, sign out), profile, medications, sync, data export
- Changelog v2.3.2 (2026-06-28): Added custom DoseFloatingTabBar (regularMaterial capsule, haptics, symbolEffect bounce). Fixed tab icons: house/house.fill, books.vertical/fill, chart.line.uptrend.xyaxis.circle/fill, figure.mind.and.body, cross.vial/cross.vial.fill. Corrected always-filled icon bug (unselected tabs now use outline variants).
