# Healstack Roadmap

## Sign in with Apple was still guaranteed to fail — gated off 2026-08-18 (`/work start`)

The 08-15 note below says the backend is reviewable, and for **email/password it is** —
re-ran `scripts/check-auth-live.sh` today: anon key accepted, demo row answers a wrong
password with a clean 400. But the app also shipped a **Sign in with Apple button that
cannot work**, and a reviewer tapping it gets an error. That is the same user-visible
symptom Apple wrote up as "Unable to log in".

Proven live, not inferred:

```
POST /auth/v1/token?grant_type=id_token  {"provider":"apple", id_token with iss=https://appleid.apple.com}
-> 400 {"error_code":"provider_disabled",
        "msg":"Provider (issuer \"https://appleid.apple.com\") is not enabled"}
```

`GET /auth/v1/settings` agrees: `"apple": false`. (A bare dummy token returns a *parse*
error instead, which is why this needs a token with a real Apple `iss` to probe — don't
conclude "provider works" from the parse error.)

**Fix applied:** `appleSignInEnabled = false` in `ios/Services/AuthService.swift`, checked
by `ios/Views/AuthView.swift:123`. The button no longer renders; email/password sign-in is
untouched and works. Guideline 4.8 is not a concern — the app offers no *other* third-party
sign-in, so Sign in with Apple is not required. Build verified:
`xcodebuild build -project Healstack.xcodeproj -scheme Dose -destination 'generic/platform=iOS Simulator' -skipPackagePluginValidation`
-> BUILD SUCCEEDED (the `-skipPackagePluginValidation` flag is still load-bearing).

- [ ] **Re-enable Sign in with Apple properly (blocked on Joshua, dashboard + portal).**
      Two steps, neither has an API path: (1) Apple Developer portal — create a Sign in with
      Apple key and Services ID for `com.heyitsmejosh.dose`; (2) Supabase dashboard on the
      shared `spark` project — Auth -> Providers -> Apple, enable and add
      `com.heyitsmejosh.dose` to the authorized client IDs. Note this is the **shared** spark
      project, so diff the auth config before changing it. When done, flip
      `appleSignInEnabled` to `true` in the same commit and re-probe with the curl above.
- [x] **Rebuild + re-upload — DONE 2026-08-18.** Build `202608181252`
      (`092ba31b-70e7-4c92-9af4-b7cb968b3d16`) archived from HEAD (contains the
      `appleSignInEnabled = false` gate), uploaded, verified `COMPLETE` via
      `asc builds uploads list` and `VALID` via `asc builds list`, and attached to version
      2.3.4. Version deliberately left in `PREPARE_FOR_SUBMISSION` — **not submitted**
      (Curvely, Wiretext and Wordroot iOS are in review; ship-plan says one at a time).
- [x] Submission `2636ad65-3154-47ba-9d91-d333e8adbffe` — **cleared 2026-08-18.** Cancelled
      earlier today; `asc review doctor` now reports it `COMPLETE` and `reviewState: COMPLETE`,
      so it no longer blocks a new submission.

**Submission readiness 2026-08-18:** `asc review doctor` reports **0 errors, 0 blocking**. The
only warning is the known false-positive empty `whatsNew` (see below — it cannot be written until
the app has shipped once). The remaining pre-submit decision is Joshua's: submit as-is with Sign in
with Apple hidden, or enable the Supabase Apple provider first and flip the flag back on.

## ASC state verified 2026-08-13 — three claims below this line are STALE, don't act on them

Read this first; the sections further down contradict live state and each other.

**Live state (`asc versions list` / `asc builds list` / `asc review doctor`, app 6785764864):**
- Version row is **`2.3.4`, `PREPARE_FOR_SUBMISSION`** (`bdf10a5f-0d97-4c1e-9615-af49ca6eda8a`).
  Not "1.0 REJECTED" — the version-string reconciliation was already resolved via option 1
  (keep lineage). **That item is done; don't re-decide it.**
- Build **`202608121022`** (`a934fdb2-b03d-445d-a527-b27e14a49aa4`) is uploaded and **`VALID`**,
  from commit `109d3b1`. The "latest build is `202607261112`, older than the fix" /
  "the fix was never built and uploaded" claim at the bottom of this file is **FALSE**.
- Working tree is clean and in sync with `origin/main`. The "Resume note (2026-08-11): a wip
  commit holds unfinished, unverified, unpushed changes" is **FALSE** — no such commit is at HEAD.
  (Same stale-"unpushed" claim turned up in bookrank, talli and litigate the same week.)

**The one remaining blocker is dashboard-only:** submission
`2636ad65-3154-47ba-9d91-d333e8adbffe` is still in `UNRESOLVED_ISSUES`, which blocks any new
submission. Needs `asc-login` + a live 2FA code from Joshua. Submissions are frozen until
2026-08-18 anyway.

Remaining warning (non-blocking) — **RESOLVED as a false positive 2026-08-15, stop trying to
fix it**: `asc review doctor` reports "what's new is empty" for `en-US`. It cannot be filled.
Apple rejects the write outright — `asc metadata apply` returns *"Attribute 'whatsNew' cannot
be edited at this time"* — because What's New only exists for an **update**, and this app has
never been released. The canonical `metadata/version/2.3.4/en-US.json` deliberately omits the
field so future `metadata plan` runs don't retry a call that always fails. It will become
editable on its own once 2.3.4 ships. Do not spend another session on this warning.

## Auth re-verified live against production 2026-08-15 — backend is reviewable

Independent re-check of the 08-10 fix, straight against the live Supabase backend. All green:

- **Anon key still accepted** — `/auth/v1/health` with the exact `SUPABASE_ANON_KEY` baked
  into the build returns 200. (A rotated JWT secret would silently break every sign-in with no
  app-side change, so this is worth confirming before any resubmit.)
- **A real account signs in** — `POST /auth/v1/token?grant_type=password` returns 200 with an
  access token.
- **The demo row is healthy** — `healstack.demo@heyitsmejosh.com` answers a wrong password with
  a clean **400 invalid_credentials**, not the 500 that got the app rejected. The 08-10
  `coalesce` fix is holding.
- **Config wiring is correct** — `SUPABASE_URL`/`SUPABASE_ANON_KEY` are build settings in
  `ios/project.yml` *and* referenced as `$(...)` in `ios/Info.plist`, so `infoPlistValue()`
  resolves them and `supabaseConfigError` stays nil. Not the cause.
- **Build is green** — `xcodebuild build -destination 'generic/platform=iOS Simulator'` exits 0.
  Note it **requires `-skipPackagePluginValidation`**; without it the SwiftLint build-tool
  plugin fails its trust prompt headlessly and the build dies with a bare exit 65 that looks
  like a code error but isn't.

Regression guard added: **`scripts/check-auth-live.sh`** (exit 0 = reviewable). Run it before
any resubmit. It re-tests all of the above and prints the exact SQL to re-apply if the demo
row ever falls back into the 500 state. Set `HEALSTACK_DEMO_PASSWORD` to also verify the real
ASC credentials sign in end to end — that is the one thing this check cannot prove on its own,
since the password isn't stored in the repo.

**Nothing about this rejection needs an app code change.** The fix is server-side, verified,
and already in a VALID uploaded build. The only thing standing between here and a resubmit is
the dashboard-only `2636ad65` submission plus the 2026-08-18 freeze.

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

## Root-cause narrowing 2026-08-10 — corrects the "login fixed 08-04" claim
- [ ] **"Login was fixed 08-04, just rebuild" is FALSE — do not resubmit on that premise.** No commit since the reviewed 07-21 build touches `ios/Views/AuthView.swift` or `ios/Services/AuthService.swift`. Commit `3f8ae32` (08-04) changed a sync-host string in `SettingsView.swift`; `ba0d18b` (08-03) added sign-in buttons to `src/pages/Auth.jsx`, web only. The iOS login path is byte-identical to what Apple rejected.
- [ ] **Ruled out: the stale-host bug that sank sparkjar.** `dose.heyitsmejosh.com` is indeed dead (does not resolve) and `healstack.heyitsmejosh.com` is live, but iOS auth does not use either — `ios/Services/AuthService.swift` talks directly to Supabase (`tjsxsqlxjmanwvmywwvw.supabase.co`). Only `ios/Services/SyncService.swift:23` uses the web host, and it is already on the live one.
- [ ] **Second suspect: shared-Supabase auth config.** Auth lives on the shared `spark` project, where `site_url`/`uri_allow_list` are project-wide. Confirm the redirect allow-list still covers healstack after the 08-06 Vercel→Cloudflare Pages migration; diff before PATCHing, never blind-overwrite (it is shared with other apps). **Partially retired 2026-08-10:** irrelevant to the iOS rejection (native email/password sign-in never touches a redirect URL, and it returns 200), so this only affects *web* OAuth/magic-link flows. Still worth a diff, no longer a ship blocker.
- [ ] **Version-string reconciliation — needs Joshua's call before archiving (product decision, store-facing).** `ios/project.yml` still holds `MARKETING_VERSION: '2.3.3'` (unchanged since 2026-07-01), but ASC has exactly **one** version row: **`1.0`, REJECTED** (`bdf10a5f-0d97-4c1e-9615-af49ca6eda8a`) — there is no 2.3.3 row. `Info.plist` derives `CFBundleShortVersionString` from `MARKETING_VERSION`, so every build uploaded so far has carried 2.3.3 while the store row says 1.0. Two ways to close it, pick one:
  1. **Keep lineage (recommended):** edit the ASC version row to `2.3.4` (`asc versions update`) and bump `MARKETING_VERSION` to match. The app's own UI already speaks 2.3.x (the What's New sheet says v2.3.2), so debuting at 2.3.4 stays honest. Row is REJECTED/never-released, so the string should still be editable.
  2. **Match the store:** set `MARKETING_VERSION: '1.0'` to match the existing row. Simpler, but the in-app changelog then contradicts the store version.
  Deliberately not chosen unilaterally — `asc review doctor` does not currently flag the mismatch, so nothing is blocked on it *except* the next archive.

## App Store submission freeze — until 2026-08-18
- [ ] **BLOCKED: no App Store submission on any app until 2026-08-18.** Account is under a Guideline 5.6 Developer Code of Conduct review suspension (Curvely, Transcriptly, Wiretext, NYC Survive). Apple warns that continued similar submissions may result in removal from the Apple Developer Program. Full detail: wiki `ship-plan.md` § "Guideline 5.6 suspension (2026-08-10)". TestFlight builds, pushes and web deploys are still fine.

## Auth 2026-08-10 — not yet reproduced, do this first
Rejected 2.1(a) "Unable to log in" on build 202607211448 (iPhone 17 Pro Max, iOS 26.5.1).
Sparkjar's identical-looking rejection turned out to be a healthy backend + a stale build, so do
not assume the server is broken here either — verify before changing code.

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

- [ ] Then rebuild and resubmit — after 2026-08-18 per the submission freeze. No app code change is required for this rejection. Build number already bumped off the rejected one (see version item below); the only pre-archive decision left is the 1.0-vs-2.3.x version-string reconciliation.

## From Apple Notes (imported 2026-08-10)
- [ ] Re-shoot the iOS fastlane screenshot set — the run is off by one step: `iPhone 17 Pro Max-0Home.png` caught the "What's New in v2.3.2" sheet, `-1Library.png` is actually Home, etc. Same stale set feeds the App Store screenshots, so the What's New sheet is likely in the store listing too. Fix = dismiss the changelog sheet (or set its seen-version default) in the snapshot launch args before capture.

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

## Ingested 2026-08-18
- [ ] Landing page: white nav — fix it.

## Rejection cause CONFIRMED from Apple's screenshot — 2026-08-18

Pulled the Resolution Center thread + attachment for the first time (`asc web review show --app
6785764864`; needed a live 2FA web session). Screenshot saved at
`.asc/web-review/6785764864/2636ad65-3154-47ba-9d91-d333e8adbffe/Screenshot-0805-102925.png`.

**The reviewer's failure was email/password sign-in, not Sign in with Apple.** The screenshot shows
the demo account `healstack.demo@heyitsmejosh.com` filled in and a red error under the password
field:

> **Database error querying schema**

That is a GoTrue/Supabase *server-side* fault, not a client bug — which is why no amount of reading
`AuthView.swift` / `AuthService.swift` ever explained it, and why the "no commit touched the login
path" observation was true and yet the login really was broken.

**Verified 2026-08-18: the fault is gone.** Against the live shared `spark` project
(`tjsxsqlxjmanwvmywwvw`):
- bad password → `400 invalid_credentials` (correct)
- real demo credentials → `200` with a valid `access_token` (correct)

So the demo account works today. Root cause of the original outage was server-side on the shared
Supabase project and is no longer reproducible; do not spend more time hunting it in Swift.

- [ ] **Rebuild before resubmitting.** The staged build `202608121022` predates the 2026-08-18
      commit that gates off the Sign in with Apple button, so the button would still ship live and
      still error. Rebuild, re-upload, then submit version 2.3.4.
- [ ] Sign in with Apple stays gated off until the provider is enabled — needs an Apple Developer
      portal key **and** Supabase Auth → Providers on the *shared* spark project (diff before
      changing, other apps use it). Verified live as `400 provider_disabled`.

## SUBMITTED 2026-08-18 — iOS 2.3.4 WAITING_FOR_REVIEW

Submission `f5e9ce05-9bc0-443b-a360-3b25deb20107`, build `202608181252`
(`092ba31b-70e7-4c92-9af4-b7cb968b3d16`). Verified by re-reading the version, not from command
output. This is the first post-freeze submission, per `ship-plan.md` step 5 ("submit one app —
Healstack or Sparkjar — confirm it passes, then the rest one at a time").

Pre-submit verification that mattered: the demo credentials stored in the ASC review detail
(`healstack.demo@heyitsmejosh.com`) were confirmed to match `.env.local` **and** to return a valid
access token against production. Since the rejection was literally "Unable to log in", a stale demo
credential would have reproduced it exactly.

Review notes now name the original submission ID, state that the backend fault behind
"Database error querying schema" is resolved and re-verified, and disclose that Sign in with Apple
was removed from this build rather than left erroring.

**`asc review submit` failed again with the false "does not contain target version" error** — third
app today (also Wordroot, and BCGD has a stray submission waiting to do the same). `asc review
items list --submission <id>` showed the item present all along. Workaround, now reliable:
`asc review submissions-submit --id <id> --confirm`.

- [ ] Do not submit Sparkjar / BCGD / Wordroot macOS until this clears — never a batch.
