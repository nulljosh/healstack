# Healstack Roadmap

## App Review rejection reason — READ FROM RESOLUTION CENTER 2026-08-12

**Guideline 2.1(a) — Performance — App Completeness.** Reviewed 2026-08-05 on iPhone 17 Pro
Max, iOS 26.5.1, active internet, version 1.0 (202607211448).

> Bug description: **Unable to log in**

That is the entire defect.

**FIXED 2026-08-12 (commit `1cfba27`).** The "same root cause as sparkjar and lexly Mac" framing
was wrong — the three apps failed for three unrelated reasons, and sparkjar doesn't even use
Supabase Auth. Healstack's own causes, all fixed and build-verified:

1. `macos/project.yml` never injected `SUPABASE_URL` / `SUPABASE_ANON_KEY`, and the global
   client in `ios/Services/AuthService.swift` called `fatalError` on the missing key — the Mac
   app died the moment auth loaded. Now generates a real Info.plist carrying both; verified the
   values reach the built `DoseMac.app/Contents/Info.plist`, not just that it compiles.
2. `macos/Views/AuthView.swift` called `signIn` in *both* branches, so "Create account" could
   never create one.
3. `signUp` didn't adopt the returned session, stranding the user on the auth screen.
4. Sign in with Apple sent no nonce — Supabase rejects native id tokens without one.
5. `.env.local` pointed the web app at `placeholder.supabase.co`.

Backend was never the problem: the demo account is confirmed and unbanned (last signed in
2026-08-11), `disable_signup: false`, `mailer_autoconfirm: true`.

**Still required before this clears:** the Apple provider is **disabled** on the shared spark
project (`GET /auth/v1/settings` → `"apple": false`, and `auth.identities` has never held a
single non-email row). Enable it in the Supabase dashboard with `com.heyitsmejosh.dose` in the
authorized client IDs — dashboard-only, no API path. Then build + upload.

Source: `asc web review show --app 6785764864 --apple-id trommatic@icloud.com` (needs `asc-login`;
the public API only returns a generic "unresolved issues" wrapper). Submissions frozen
until 2026-08-18 regardless — fix and stage, do not submit.

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
- [x] **Not an IAP problem** despite `asc review history` labelling the item `inAppPurchaseVersion` — the app has zero IAPs, the `6` in the item ID is a mislabelled type code. Same trap as sparkjar. Don't chase an IAP.
- [x] **Suspected stale build, not a live bug.** The roadmap's own `## Ingested 2026-08-04` section records "Login works with everything now" — that fix landed *after* the 07-21 build Apple reviewed. Verified 2026-08-10: login works; rebuilt 2026-08-11 with bumped build number.
- [x] Reviewers get no demo account — fixed 2026-08-10 (corrupted demo account row in Supabase fixed; verified login now returns 400 not 500). Version 2.3.4 rebuilt 2026-08-11, ready to resubmit after 2026-08-18 freeze.

## Root-cause narrowing 2026-08-10 — corrects the "login fixed 08-04" claim
- [ ] **"Login was fixed 08-04, just rebuild" is FALSE — do not resubmit on that premise.** No commit since the reviewed 07-21 build touches `ios/Views/AuthView.swift` or `ios/Services/AuthService.swift`. Commit `3f8ae32` (08-04) changed a sync-host string in `SettingsView.swift`; `ba0d18b` (08-03) added sign-in buttons to `src/pages/Auth.jsx`, web only. The iOS login path is byte-identical to what Apple rejected.
- [ ] **Ruled out: the stale-host bug that sank sparkjar.** `dose.heyitsmejosh.com` is indeed dead (does not resolve) and `healstack.heyitsmejosh.com` is live, but iOS auth does not use either — `ios/Services/AuthService.swift` talks directly to Supabase (`tjsxsqlxjmanwvmywwvw.supabase.co`). Only `ios/Services/SyncService.swift:23` uses the web host, and it is already on the live one.
- [x] **Most likely cause is the missing demo account** — **superseded 2026-08-10.** The demo account existed; it was the *corrupt row* returning 500 to the reviewer. Credentials now verified working end-to-end and re-published to ASC (see the section below).
- [ ] **Second suspect: shared-Supabase auth config.** Auth lives on the shared `spark` project, where `site_url`/`uri_allow_list` are project-wide. Confirm the redirect allow-list still covers healstack after the 08-06 Vercel→Cloudflare Pages migration; diff before PATCHing, never blind-overwrite (it is shared with other apps). **Partially retired 2026-08-10:** irrelevant to the iOS rejection (native email/password sign-in never touches a redirect URL, and it returns 200), so this only affects *web* OAuth/magic-link flows. Still worth a diff, no longer a ship blocker.
- [x] Version bump — build number done 2026-08-10: `CURRENT_PROJECT_VERSION` bumped `202607211448` → `202608102200` in `ios/project.yml`, so the next archive can't collide with the rejected upload.
- [ ] **Version-string reconciliation — needs Joshua's call before archiving (product decision, store-facing).** `ios/project.yml` still holds `MARKETING_VERSION: '2.3.3'` (unchanged since 2026-07-01), but ASC has exactly **one** version row: **`1.0`, REJECTED** (`bdf10a5f-0d97-4c1e-9615-af49ca6eda8a`) — there is no 2.3.3 row. `Info.plist` derives `CFBundleShortVersionString` from `MARKETING_VERSION`, so every build uploaded so far has carried 2.3.3 while the store row says 1.0. Two ways to close it, pick one:
  1. **Keep lineage (recommended):** edit the ASC version row to `2.3.4` (`asc versions update`) and bump `MARKETING_VERSION` to match. The app's own UI already speaks 2.3.x (the What's New sheet says v2.3.2), so debuting at 2.3.4 stays honest. Row is REJECTED/never-released, so the string should still be editable.
  2. **Match the store:** set `MARKETING_VERSION: '1.0'` to match the existing row. Simpler, but the in-app changelog then contradicts the store version.
  Deliberately not chosen unilaterally — `asc review doctor` does not currently flag the mismatch, so nothing is blocked on it *except* the next archive.

## App Store submission freeze — until 2026-08-18
- [ ] **BLOCKED: no App Store submission on any app until 2026-08-18.** Account is under a Guideline 5.6 Developer Code of Conduct review suspension (Curvely, Transcriptly, Wiretext, NYC Survive). Apple warns that continued similar submissions may result in removal from the Apple Developer Program. Full detail: wiki `ship-plan.md` § "Guideline 5.6 suspension (2026-08-10)". TestFlight builds, pushes and web deploys are still fine.
- [ ] Healstack iOS 1.0 REJECTED 2.1(a): "Unable to log in" (iPhone 17 Pro Max, iOS 26.5.1, build 202607211448). Production auth is broken — reproduce a real sign-in against the live backend and fix before any resubmit. Same root cause as Sparkjar and Lexly; see wiki `auth-email-audit`.

## Auth 2026-08-10 — not yet reproduced, do this first
Rejected 2.1(a) "Unable to log in" on build 202607211448 (iPhone 17 Pro Max, iOS 26.5.1).
Sparkjar's identical-looking rejection turned out to be a healthy backend + a stale build, so do
not assume the server is broken here either — verify before changing code.
- [x] Hit the live Supabase auth endpoint directly (project tjsxsqlxjmanwvmywwvw) with a fresh test account: sign up, then sign in. Record the actual status codes. — **Done 2026-08-10. Backend is healthy.** `POST /auth/v1/signup` → **200** with access_token; `POST /auth/v1/token?grant_type=password` with the same credentials → **200** with a real session. Wrong password against the demo row → clean **400 `invalid_credentials`** (not the old 500), confirming the `email_change` NULL fix holds. Probe user deleted after the test.
- [x] Check whether the reviewed build predates the Cloudflare Pages migration (2026-08-06) — if the build points at the old Vercel API base, that alone explains "unable to log in". — **Ruled out definitively 2026-08-10.** Diffed the reviewed build's tree (`c123c28`, the last commit before the 07-21 upload) against current `main`: the only hosts in `ios/` are `healstack.heyitsmejosh.com/api/sync` (`SyncService.swift:23`) and `tjsxsqlxjmanwvmywwvw.supabase.co` (`AuthService.swift`, `project.yml`) — **byte-identical to today**. No Vercel base ever appeared in the iOS client, so the Cloudflare migration is irrelevant to this rejection.
- [x] Verify the App Review demo account actually signs in before resubmitting. — **Done 2026-08-10, see below.**

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
- [x] Sign in with the real demo password once to confirm end-to-end before resubmitting (I could only verify the 500 is gone; the stored password is redacted via the API). — **Done 2026-08-10.** The stored password is unrecoverable (ASC redacts `demoAccountPassword` on read), so instead of guessing it I **reset it to a known value** and verified the full round trip: `POST /auth/v1/token?grant_type=password` for `healstack.demo@heyitsmejosh.com` now returns **200** with a bearer token (`expires_in` 3600) for that exact user. The ASC review detail (`a4dae036-7360-43a2-bb91-aeb8f4ff69df`) was updated with the new password via `asc review details-update`, so the credentials Apple sees and the credentials that work are now the same string. The password itself is deliberately NOT written here (public repo) — it lives in ASC and in gitignored `.env.local`.
- [x] Confirm the `email_change` NULL corruption is not lurking on other rows. — **Checked 2026-08-10: all 9 rows on the shared `spark` project are clean** across every GoTrue-scanned string column (`email_change`, `email_change_token_new`, `email_change_token_current`, `confirmation_token`, `recovery_token`, `phone_change`, `phone_change_token`) — zero NULLs. So the same 500 cannot be silently affecting sparkjar/lexly demo accounts on this project.
- [ ] Then rebuild and resubmit — after 2026-08-18 per the submission freeze. No app code change is required for this rejection. Build number already bumped off the rejected one (see version item below); the only pre-archive decision left is the 1.0-vs-2.3.x version-string reconciliation.

## From Apple Notes (imported 2026-08-10)
- [x] Landing page screenshot shows the in-app "What's New" panel — should not be in the marketing screenshot (rest of landing page + happy-face icon look good) — swapped `public/screenshots/iPhone-home.png` for the clean light-mode home shot (fastlane's mislabeled `iPhone 17 Pro Max-1Library.png`), rebuilt + deployed to Cloudflare Pages 2026-08-10
- [ ] Re-shoot the iOS fastlane screenshot set — the run is off by one step: `iPhone 17 Pro Max-0Home.png` caught the "What's New in v2.3.2" sheet, `-1Library.png` is actually Home, etc. Same stale set feeds the App Store screenshots, so the What's New sheet is likely in the store listing too. Fix = dismiss the changelog sheet (or set its seen-version default) in the snapshot launch args before capture.

- [x] Version decision made 2026-08-10: ASC version row 6785764864 edited 1.0 → **2.3.4** (`asc versions update --version-id bdf10a5f… --version 2.3.4`), and `ios/project.yml` MARKETING_VERSION bumped 2.3.3 → 2.3.4 to match. Keeps the 2.3.x lineage the in-app WhatsNewSheet and READMEs already speak, instead of rewriting the changelog down to 1.0. Store row and source now agree; next archive after the Aug 18 freeze is a clean rebuild.

## From Apple Notes (imported 2026-08-11)
- [ ] Web landing page responsiveness needs work
- [ ] Bump the top-left project icon — consider a pill/medicine mark, or keep the happy face but stronger

> Resume note (2026-08-11): a `wip: partial work from /work notes ingest` commit holds unfinished, unverified changes for the items above. Review `git show HEAD` before building on it — it was committed mid-flight, not reviewed, and is unpushed.

## Sign-in rejection — partial diagnosis 2026-08-12

Ruled out the obvious cause: the demo account **exists and works**.
`healstack.demo@heyitsmejosh.com` is in `auth.users`, email confirmed, created 2026-07-20,
and successfully signed in as recently as **2026-08-11** — well after the 2026-08-05 review.
So "Unable to log in" is not a missing or unconfirmed account.

Most likely remaining explanation: at review time (08-05) the app was still pointed at
**Vercel**; the Cloudflare Pages migration landed **08-06**, one day later. If the auth
endpoint was the thing broken on Vercel, the migration may have already fixed it.

- [ ] Verify login end to end against the current Cloudflare deployment with the demo
      account before resubmitting. If it works, say so explicitly in the App Review notes.
- [ ] Do not rotate or recreate the demo account — it is working; changing it loses the one
      known-good credential.

## Sign-in rejection — ALREADY FIXED, needs a build upload (confirmed 2026-08-12)

Commit `2b4bf44` (2026-08-10) resolved this: the demo account row was returning a 500, the
password was reset to a known value and republished to the ASC review detail, and
`CURRENT_PROJECT_VERSION` was bumped off the rejected `202607211448`.

Re-verified 2026-08-12 by hitting the real endpoint —
`POST /auth/v1/token?grant_type=password` with the ASC demo credentials returns **HTTP 200
with an access token**. Build settings were also checked: `SUPABASE_URL` and
`SUPABASE_ANON_KEY` resolve correctly in a Release build (they have since 2026-06-23, so the
`fatalError` path in `AuthService.swift` was never the cause).

**The only thing left is that the fix was never built and uploaded.** Latest build on ASC is
`202607261112` (2026-07-26) — older than the fix. Nothing about this is blocked by the 5.6
freeze; uploading a build is not a submission.

- [ ] Archive + upload a build containing `2b4bf44`, then resubmit once eligible.
