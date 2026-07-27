# Healstack Roadmap

## Status (2026-07-26)
v1.0 is WAITING_FOR_REVIEW (submitted 2026-07-21). The "ship VERSION:2.3.4"/"2.3.3 resume" items below were from before that submission and are stale — superseded, not re-run.

- [ ] subtitle empty (en-US) — non-blocking warning, needs copy decision
- [ ] privacy policy URL empty (en-US) — non-blocking warning, needs a URL

## From Merge status.pdf (imported 2026-07-21)
- [ ] Medical-device declaration app-record deletion — needs Joshua's asc web auth login.

## Stashed 2026-07-19
- [x] Screenshots capture pipeline — DONE 2026-07-26: fastlane snapshot + `UITests/PreviewScreenshot.swift` set up from scratch (no pipeline existed). Added `UITEST_SNAPSHOT` launch-arg bypass in `AuthService`/`DoseApp`/`DataStore` (skips real Supabase auth, biometric lock, HealthKit permission prompt; seeds realistic mock data — substances, dose entries, lab results, biometrics). 10 screenshots captured clean (5 screens × iPhone 11 Pro Max + iPhone 14 Plus) at `ios/fastlane/screenshots/en-US/`.
- [ ] Screenshots **upload** still blocked — two separate issues found:
  1. App version `bdf10a5f-0d97-4c1e-9615-af49ca6eda8a` (1.0) is `WAITING_FOR_REVIEW`; ASC API refuses screenshot uploads in that state ("Can't Create Screenshot while Waiting For Review"). Needs Joshua to either wait for review to clear, or explicitly authorize cancelling the review to edit metadata (didn't do this unilaterally — real, hard-to-reverse action on a live submission).
  2. iPhone 14 Plus's native resolution (1284×2778) now falls in Apple's `APP_IPHONE_65` bucket, not `APP_IPHONE_67` — Apple's 6.7" bucket wants newer Pro Max/Plus hardware (1290×2796, e.g. iPhone 16 Plus/15 Pro Max). House convention (14 Plus for 6.7") is stale; re-simulate the 6.7" set with a newer device once upload is unblocked.
- [ ] Availability: missing (dashboard-only dead-end) — ASC web Pricing & Availability for app 6785764864
