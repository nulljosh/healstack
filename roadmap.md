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

## App Store submission freeze — until 2026-08-18
- [ ] **BLOCKED: no App Store submission on any app until 2026-08-18.** Account is under a Guideline 5.6 Developer Code of Conduct review suspension (Curvely, Transcriptly, Wiretext, NYC Survive). Apple warns that continued similar submissions may result in removal from the Apple Developer Program. Full detail: wiki `ship-plan.md` § "Guideline 5.6 suspension (2026-08-10)". TestFlight builds, pushes and web deploys are still fine.
- [ ] Healstack iOS 1.0 REJECTED 2.1(a): "Unable to log in" (iPhone 17 Pro Max, iOS 26.5.1, build 202607211448). Production auth is broken — reproduce a real sign-in against the live backend and fix before any resubmit. Same root cause as Sparkjar and Lexly; see wiki `auth-email-audit`.

## Auth 2026-08-10 — not yet reproduced, do this first
Rejected 2.1(a) "Unable to log in" on build 202607211448 (iPhone 17 Pro Max, iOS 26.5.1).
Sparkjar's identical-looking rejection turned out to be a healthy backend + a stale build, so do
not assume the server is broken here either — verify before changing code.
- [ ] Hit the live Supabase auth endpoint directly (project tjsxsqlxjmanwvmywwvw) with a fresh test account: sign up, then sign in. Record the actual status codes.
- [ ] Check whether the reviewed build predates the Cloudflare Pages migration (2026-08-06) — if the build points at the old Vercel API base, that alone explains "unable to log in".
- [ ] Verify the App Review demo account actually signs in before resubmitting.

## 2026-08-10 — ROOT CAUSE FOUND AND FIXED: App Review demo account returned a 500
Apple's 2.1(a) "Unable to log in" is resolved. It was not the app and not the network.

The demo account App Store Connect hands reviewers is **healstack.demo@heyitsmejosh.com**
(not jatrommel@gmail.com, which is a different, healthy account). That user's row in
`auth.users` on the shared `spark` Supabase project had `email_change` and
`email_change_token_new` set to **NULL**. GoTrue scans those columns into non-nullable Go
strings, so any auth call touching that row threw:
- `POST /auth/v1/token?grant_type=password` → **500 "Database error querying schema"**
- `POST /auth/v1/signup` → **500 "Database error finding user"**

A normal wrong-password login returns a clean 400, so the 500 was specific to this one row.
The reviewer typed the exact credentials we gave them and got a server error. Exactly one user
out of nine was affected — the demo account, which is why normal testing never caught it.

Fix applied 2026-08-10: `update auth.users set email_change = coalesce(email_change, ''),
email_change_token_new = coalesce(email_change_token_new, '')` for the affected row.
Verified after: the same login now returns a clean **400 invalid_credentials** instead of 500.

- [x] Root cause identified and fixed in the database.
- [ ] Sign in with the real demo password once to confirm end-to-end before resubmitting (I could only verify the 500 is gone; the stored password is redacted via the API).
- [ ] Then rebuild and resubmit — after 2026-08-18 per the submission freeze. No app code change is required for this rejection.

## From Apple Notes (imported 2026-08-10)
- [x] Landing page screenshot shows the in-app "What's New" panel — should not be in the marketing screenshot (rest of landing page + happy-face icon look good) — swapped `public/screenshots/iPhone-home.png` for the clean light-mode home shot (fastlane's mislabeled `iPhone 17 Pro Max-1Library.png`), rebuilt + deployed to Cloudflare Pages 2026-08-10
- [ ] Re-shoot the iOS fastlane screenshot set — the run is off by one step: `iPhone 17 Pro Max-0Home.png` caught the "What's New in v2.3.2" sheet, `-1Library.png` is actually Home, etc. Same stale set feeds the App Store screenshots, so the What's New sheet is likely in the store listing too. Fix = dismiss the changelog sheet (or set its seen-version default) in the snapshot launch args before capture.
