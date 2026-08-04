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
- [ ] Login works with everything now; still needs a landing page
