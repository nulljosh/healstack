# Healstack Roadmap

## From Healstack.pdf (imported 2026-07-12)
- [x] Rename login branding Dose → Healstack (web + iOS + watchOS), verified in sim — 1c78ce9
- [ ] Ship: run `asc workflow run ship-ios VERSION:2.3.4` — blocked: production-release permission denied for autonomous agent; needs user go-ahead (ASC build 2 is VALID but predates the rename, so it still shows "Dose" on login)

## From Icons.pdf / Asc.pdf (imported 2026-07-12)
- [ ] Submit for review — v2.3.3 build 2 valid on ASC since 07-02 (ASC latest version list oddly shows 1.0 PREPARE — check version list first)

- [ ] If 2.3.3 ship failed: asc workflow run --file .asc/workflow.json ship-ios --resume ship-ios-20260713T003453Z-885325d5
  - note: rm .asc/artifacts/Healstack.ipa first (stale), then resume
