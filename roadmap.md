# Healstack Roadmap

## Status (2026-07-26)
v1.0 is WAITING_FOR_REVIEW (submitted 2026-07-21). The "ship VERSION:2.3.4"/"2.3.3 resume" items below were from before that submission and are stale — superseded, not re-run.

## From Merge status.pdf (imported 2026-07-21)
- [ ] Medical-device declaration app-record deletion — needs Joshua's asc web auth login.

## Stashed 2026-07-19
- [x] Availability: NOT missing and never a dashboard-only dead-end — verified 2026-08-03 via `asc pricing availability territory-availabilities --availability 6785764864 --limit 200`: **175/175 territories available**, `availableInNewTerritories: true`, and `asc pricing current` shows a free price schedule (`isFree: true`). `asc review doctor` reports 0 availability blockers. The old "dead end" was a CLI paging bug (`asc pricing territories list` caps at 50, then errors on an unfetched territory like ROU even when you pass only `--territory USA`) — fetch with `--limit 200` and pass all 175.

## From App Store.pdf (imported 2026-07-28)
- [ ] Ship a macOS version of Healstack.

## Ingested 2026-08-04
- [x] Login works with everything now; still needs a landing page — 2026-08-04: added `src/pages/Landing.jsx` (headline, product description, Get started / Sign in CTAs, 4-item feature grid, privacy + not-medical-advice footer linking the existing `/privacy.html` and `/tos.html`). `AppShell` in `src/App.jsx` now shows Landing when signed out and swaps to `<Auth />` on CTA click, instead of dropping straight into the login form. Uses existing design tokens only. `npm run build` passes.
- [x] Favicon was an emoji (💊), against the no-emojis rule — replaced with an inline SVG of the same person glyph the Auth/Landing header uses, on the existing accent blue.
