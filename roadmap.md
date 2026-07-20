# Healstack Roadmap

## From Healstack.pdf (imported 2026-07-12)
- [x] Rename login branding Dose → Healstack (web + iOS + watchOS), verified in sim — 1c78ce9
- [ ] Ship: run `asc workflow run ship-ios VERSION:2.3.4` — blocked: production-release permission denied for autonomous agent; needs user go-ahead (ASC build 2 is VALID but predates the rename, so it still shows "Dose" on login)

## From Icons.pdf / Asc.pdf (imported 2026-07-12)
- [ ] Submit for review — v2.3.3 build 2 valid on ASC since 07-02 (ASC latest version list oddly shows 1.0 PREPARE — check version list first)

- [ ] If 2.3.3 ship failed: asc workflow run --file .asc/workflow.json ship-ios --resume ship-ios-20260713T003453Z-885325d5
  - note: rm .asc/artifacts/Healstack.ipa first (stale), then resume

## 2026-07-14 dump
- [ ] Finish full Dose→Healstack rename audit (bundle/display names, docs, UI text, assets, CI, repo metadata)
- [ ] Fix failed Vercel production deployment; verify env vars/domains post-rename

## App Store submission (parked 2026-07-14, wrap-up)
Done via API: copyright, age rating, content rights, encryption (build 53083cc3, VALID).
Remaining blockers for v1.0 submit (asc validate --app 6785764864 --version 1.0):
- [ ] en-US description, keywords, support URL (asc metadata push)
- [ ] review details (contact info)
- [ ] primary category
- [ ] availability (Pricing & Availability)
- [ ] screenshots (none uploaded)
- [ ] confirm App Privacy published
Then: asc review submit --app 6785764864 --version 1.0 --confirm

## From Healstack.pdf (imported 2026-07-19)
- [ ] TestFlight build is stale — rename to Healstack not fully propagated: splash screen still shows old name "dose", Home Screen icon label still says "dose". Needs a fresh build with updated app display name/launch screen assets, then new TestFlight upload.
- [ ] Tiles in-app still have drop shadows — design cleanup, remove per current flat-design direction (check other renamed apps for the pattern already applied).
