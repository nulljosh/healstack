# Healstack Roadmap

## From Healstack.pdf (imported 2026-07-12)
- [ ] Ship: run `asc workflow run ship-ios VERSION:2.3.4` — blocked: production-release permission denied for autonomous agent; needs user go-ahead (ASC build 2 is VALID but predates the rename, so it still shows "Dose" on login)

## From Icons.pdf / Asc.pdf (imported 2026-07-12)

- [ ] If 2.3.3 ship failed: asc workflow run --file .asc/workflow.json ship-ios --resume ship-ios-20260713T003453Z-885325d5
  - note: rm .asc/artifacts/Healstack.ipa first (stale), then resume — not attempted, superseded by v1.0 ASC submission path above

## 2026-07-14 dump
- [x] Finish full Dose→Healstack rename audit — done 2026-07-25. Scoped brand strings from domain vocabulary: fixed `ios/Info.plist` (added CFBundleDisplayName), `macos/project.yml` (INFOPLIST_KEY_CFBundleDisplayName), `macos/Views/AuthView.swift` + `SidebarView.swift` ("Dose"→"Healstack"), `ios/DoseApp.swift` ("Dose is locked"). Deliberately kept as domain vocabulary: DoseEntry/AddDoseSheet/useDoseLog, "Log a Dose", "Doses Today", Section("Dose"), widget "Dose Summary". Bundle IDs / App Group / `dose://` scheme intentionally unchanged per CLAUDE.md.

## App Store submission (parked 2026-07-14, wrap-up)
Done via API: copyright, age rating, content rights, encryption (build 53083cc3, VALID).
Remaining blockers for v1.0 submit (asc validate --app 6785764864 --version 1.0):
- [ ] screenshots (none uploaded) — needs simulator capture pass, still blocking

## Build 202607211448 shipped 2026-07-21 — screenshots + fixes
- [ ] subtitle empty (en-US) — non-blocking warning, needs copy decision
- [ ] privacy policy URL empty (en-US) — non-blocking warning, needs a URL
Then: asc review submit --app 6785764864 --version 1.0 --confirm

## From Merge status.pdf (imported 2026-07-21)
- [ ] Medical-device declaration app-record deletion — needs Joshua's asc web auth login.

## From Healstack.pdf (imported 2026-07-19)
- [ ] TestFlight build is stale — rename to Healstack not fully propagated: splash screen still shows old name "dose", Home Screen icon label still says "dose". Needs a fresh build with updated app display name/launch screen assets, then new TestFlight upload.
  - 2026-07-25: source-side root cause FIXED and build-verified. `ios/Info.plist` had no `CFBundleDisplayName`, so the Home Screen fell back to `CFBundleName` = `$(PRODUCT_NAME)` = "Dose"; the `INFOPLIST_KEY_CFBundleDisplayName: Healstack` in `ios/project.yml` was a no-op because the target uses an explicit `INFOPLIST_FILE`. Added the key to Info.plist directly — built bundle now reports `CFBundleDisplayName = Healstack`. SplashView already said "Healstack". **Only the fresh build + TestFlight upload remains** (gated by the ship item at the top of this file).

## Stashed 2026-07-19
- [ ] Screenshots: none uploaded (blocking) — appstore-screenshots skill / asc screenshots upload; needs simulator capture pass, out of scope for this run
- [ ] Availability: missing (dashboard-only dead-end) — ASC web Pricing & Availability for app 6785764864

## Ingested 2026-07-25
- [x] Rename still not fully applied — app name not showing correctly under icon after latest TestFlight build. Fixed 2026-07-25: root cause was the missing `CFBundleDisplayName` in `ios/Info.plist` (see note under "From Healstack.pdf" above). Landing page/login checked clean — web `index.html` title, `src/pages/Auth.jsx` h1 already read "Healstack"; macOS login/sidebar were still "Dose" and are now fixed. Needs a fresh build to show on device.
- [x] Navbar overwriting content bug — fixed 2026-07-25 in `src/index.css`: `.page` had a flat `padding-bottom: 100px`, but the fixed nav pill occupies 12px offset + ~62px height + `env(safe-area-inset-bottom)` (~34px on home-indicator devices), so it covered content. Ported the sibling pattern (`lexly/css/lingo.css:216`) — now `calc(100px + env(safe-area-inset-bottom, 0px))`.
