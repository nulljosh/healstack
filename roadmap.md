# Healstack Roadmap

## From Healstack.pdf (imported 2026-07-12)
- [ ] Ship: run `asc workflow run ship-ios VERSION:2.3.4` — blocked: production-release permission denied for autonomous agent; needs user go-ahead (ASC build 2 is VALID but predates the rename, so it still shows "Dose" on login)

## From Icons.pdf / Asc.pdf (imported 2026-07-12)

- [ ] If 2.3.3 ship failed: asc workflow run --file .asc/workflow.json ship-ios --resume ship-ios-20260713T003453Z-885325d5
  - note: rm .asc/artifacts/Healstack.ipa first (stale), then resume — not attempted, superseded by v1.0 ASC submission path above

## 2026-07-14 dump
- [ ] Finish full Dose→Healstack rename audit (bundle/display names, docs, UI text, assets, CI, repo metadata) — checked 2026-07-21: most "Dose" hits (DoseEntry, DoseApp.swift, AddDoseSheet) are domain-model naming, not brand text; brand rename in login/UI already done (see checked item above). Needs manual scoping to separate brand strings from domain vocabulary before a blind rename — too risky to automate.

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

## Stashed 2026-07-19
- [ ] Screenshots: none uploaded (blocking) — appstore-screenshots skill / asc screenshots upload; needs simulator capture pass, out of scope for this run
- [ ] Availability: missing (dashboard-only dead-end) — ASC web Pricing & Availability for app 6785764864
