# Healstack Roadmap

## Status (corrected 2026-08-10) — v1.0 is REJECTED, not waiting for review

The line below (and `~/Documents/Code/CLAUDE.md`) said "v1.0 is WAITING_FOR_REVIEW
(submitted 2026-07-21)". **Stale.** Live state from `asc versions list --app 6785764864`:
iOS 1.0 is **`REJECTED`**. What actually happened: the 07-21 submission
(`4b9cade8-f484-40a4-8b46-f5c1cbd8da57`) completed, a second submission went in
2026-07-27T03:08Z (`2636ad65-3154-47ba-9d91-d333e8adbffe`) and came back rejected. That
submission is still sitting in `UNRESOLVED_ISSUES`, which blocks any new submission.

**Same phantom-IAP signature as sparkjar:** the one rejected item in that submission is
reported as type `inAppPurchaseVersion`, yet `asc iap list --app 6785764864` returns zero
IAPs. See sparkjar/roadmap.md "ASC state verified 2026-08-10" for the full decoding — don't
chase a nonexistent IAP.

- [ ] **Read the rejection text in Resolution Center.** Not exposed by the public API.
  Needs `asc web review show --app 6785764864`, which needs a web session — `asc web auth
  status` is `authenticated:false` and `asc-login` requires an interactive 2FA code from
  Joshua. The real reason is unknown until then. Plausibly this is the medical-device
  declaration item below finally biting, but that is a guess, not evidence.
- [ ] After the reason is known: rebuild (newest build is `202607261112`, uploaded
  2026-07-26 — it predates nothing important, so a rebuild may not even be required) and
  resubmit. `asc builds upload` reports success on FAILED uploads — verify with
  `asc builds uploads list`.

### Original status line (kept for history)
v1.0 is WAITING_FOR_REVIEW (submitted 2026-07-21). Infrastructure migrated from Vercel to Cloudflare Pages 2026-08-06 (wrangler config cleared of Vercel-only settings, landing page restyled with Lexly design system). The "ship VERSION:2.3.4"/"2.3.3 resume" items below were from before that submission and are stale — superseded, not re-run.

## From Merge status.pdf (imported 2026-07-21)
- [ ] Medical-device declaration app-record deletion — needs Joshua's asc web auth login.
  Re-confirmed 2026-08-10: `asc web auth status` → `{"authenticated":false,"passwordStored":true,
  "appleId":"trommatic@icloud.com"}`. **Exactly what to do:** run `asc-login` and enter the 2FA
  code Apple pushes to your device, then re-run the `asc web` command. The password is already
  in Keychain (`asc-web-password`) — nobody needs to type it. The 2FA code is the only reason
  this can't be automated.

## From App Store.pdf (imported 2026-07-28)
- [ ] Ship a macOS version of Healstack. Note 2026-08-10: `healstack/macos/` **does exist**, so
  this is a build+submit job rather than a from-scratch port. There is currently no `MAC_OS`
  version row on app `6785764864` (only IOS) — the row gets created by submitting a macOS
  build, not by a dashboard toggle.

## Stashed 2026-07-19
- [x] Availability: NOT missing and never a dashboard-only dead-end — verified 2026-08-03 via `asc pricing availability territory-availabilities --availability 6785764864 --limit 200`: **175/175 territories available**, `availableInNewTerritories: true`, and `asc pricing current` shows a free price schedule (`isFree: true`). `asc review doctor` reports 0 availability blockers. The old "dead end" was a CLI paging bug (`asc pricing territories list` caps at 50, then errors on an unfetched territory like ROU even when you pass only `--territory USA`) — fetch with `--limit 200` and pass all 175.

## Ingested 2026-08-04
- [x] Login works with everything now; still needs a landing page — 2026-08-04: added `src/pages/Landing.jsx` (headline, product description, Get started / Sign in CTAs, 4-item feature grid, privacy + not-medical-advice footer linking the existing `/privacy.html` and `/tos.html`). `AppShell` in `src/App.jsx` now shows Landing when signed out and swaps to `<Auth />` on CTA click, instead of dropping straight into the login form. Uses existing design tokens only. `npm run build` passes.
- [x] Favicon was an emoji (💊), against the no-emojis rule — replaced with an inline SVG of the same person glyph the Auth/Landing header uses, on the existing accent blue.

## Rejection reason pulled 2026-08-10 (Resolution Center)
- [ ] **v1.0 REJECTED — Guideline 2.1(a) Performance/App Completeness.** Reviewed 2026-08-05 on iPhone 17 Pro Max, iOS 26.5.1, build `202607211448` (uploaded 07-21). Submission `2636ad65-3154-47ba-9d91-d333e8adbffe`. Apple's report is one line: **"Unable to log in."** No steps, no screenshots attached.
- [ ] **Not an IAP problem** despite `asc review history` labelling the item `inAppPurchaseVersion` — the app has zero IAPs, the `6` in the item ID is a mislabelled type code. Same trap as sparkjar. Don't chase an IAP.
- [ ] **Suspected stale build, not a live bug.** The roadmap's own `## Ingested 2026-08-04` section records "Login works with everything now" — that fix landed *after* the 07-21 build Apple reviewed. Verify login against the current main on a clean device, then rebuild + resubmit; if login genuinely works now, no code change is needed, only a new binary.
- [ ] Reviewers get no demo account — the roadmap's outstanding "demo account" item is likely why a reviewer hit a wall. Provide review credentials in App Review notes with the resubmission.

## Root-cause narrowing 2026-08-10 — corrects the "login fixed 08-04" claim
- [ ] **"Login was fixed 08-04, just rebuild" is FALSE — do not resubmit on that premise.** No commit since the reviewed 07-21 build touches `ios/Views/AuthView.swift` or `ios/Services/AuthService.swift`. Commit `3f8ae32` (08-04) changed a sync-host string in `SettingsView.swift`; `ba0d18b` (08-03) added sign-in buttons to `src/pages/Auth.jsx`, web only. The iOS login path is byte-identical to what Apple rejected.
- [ ] **Ruled out: the stale-host bug that sank sparkjar.** `dose.heyitsmejosh.com` is indeed dead (does not resolve) and `healstack.heyitsmejosh.com` is live, but iOS auth does not use either — `ios/Services/AuthService.swift` talks directly to Supabase (`tjsxsqlxjmanwvmywwvw.supabase.co`). Only `ios/Services/SyncService.swift:23` uses the web host, and it is already on the live one.
- [ ] **Most likely cause is the missing demo account, already open on this roadmap.** Apple's report is a bare "Unable to log in" with no repro steps and no screenshots — consistent with a reviewer who had no credentials, not with a crash. Supply App Review credentials with the resubmission before assuming a code bug.
- [ ] **Second suspect: shared-Supabase auth config.** Auth lives on the shared `spark` project, where `site_url`/`uri_allow_list` are project-wide. Confirm the redirect allow-list still covers healstack after the 08-06 Vercel→Cloudflare Pages migration; diff before PATCHing, never blind-overwrite (it is shared with other apps).
- [ ] Version bump still outstanding: `ios/project.yml:15-16` holds `MARKETING_VERSION: 2.3.3` and `CURRENT_PROJECT_VERSION: 202607211448` — still the rejected build's number. Also reconcile 2.3.3 against the ASC record tracked as v1.0 before archiving.
