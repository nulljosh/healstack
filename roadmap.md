# Healstack Roadmap

## Status (2026-07-26)
v1.0 is WAITING_FOR_REVIEW (submitted 2026-07-21). The "ship VERSION:2.3.4"/"2.3.3 resume" items below were from before that submission and are stale — superseded, not re-run.

- [ ] subtitle empty (en-US) — non-blocking warning, needs copy decision
- [ ] privacy policy URL empty (en-US) — non-blocking warning, needs a URL

## From Merge status.pdf (imported 2026-07-21)
- [ ] Medical-device declaration app-record deletion — needs Joshua's asc web auth login.

## Stashed 2026-07-19
- [x] Screenshots capture pipeline — DONE 2026-07-26: fastlane snapshot + `UITests/PreviewScreenshot.swift` set up from scratch (no pipeline existed). Added `UITEST_SNAPSHOT` launch-arg bypass in `AuthService`/`DoseApp`/`DataStore` (skips real Supabase auth, biometric lock, HealthKit permission prompt; seeds realistic mock data — substances, dose entries, lab results, biometrics). 10 screenshots captured clean (5 screens × iPhone 11 Pro Max + iPhone 14 Plus) at `ios/fastlane/screenshots/en-US/`.
- [x] Screenshots **upload** — DONE 2026-07-26. Fixed both blockers: (1) recaptured the 6.7" set on iPhone 17 Pro Max sim (1320×2868, matches Apple's current `APP_IPHONE_67` bucket — iPhone 14 Plus's 1284×2778 now falls under 6.5" instead; house convention is stale, update it repo-wide when convenient) (2) cancelled the WAITING_FOR_REVIEW submission with Joshua's go-ahead (`asc submit cancel`), uploaded all 10 screenshots (5 screens × iPhone 11 Pro Max 6.5" + iPhone 17 Pro Max 6.7", all COMPLETE), then resubmitted via `asc review submit` reusing the already-attached build — back to WAITING_FOR_REVIEW, submission `2636ad65-3154-47ba-9d91-d333e8adbffe`.
- [ ] Availability: missing (dashboard-only dead-end) — ASC web Pricing & Availability for app 6785764864

## From App Store.pdf (imported 2026-07-28)
- [ ] Ship a macOS version of Healstack.
