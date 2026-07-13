# Healstack Technical Whitepaper

**v2.2.0** | July 2026

Healstack is a supplement/substance stack tracker with a built-in interaction
checker. Log what you take, see what's currently active, and get warned before
you combine things that interact. Web at
[healstack.heyitsmejosh.com](https://healstack.heyitsmejosh.com), companion
iOS app (bundle ID and `dose://` URL scheme intentionally kept from the app's
former name, Dose, to avoid re-provisioning).

## Interaction Checking

The core mechanic. `src/data/substances.js` holds a curated dataset of
substances with known interactions and harm-reduction notes. When a dose is
logged, `InteractionChecker` cross-references it against every substance
currently "active" (dosed within its known duration window) and surfaces a
warning if any pair is flagged — before the entry is saved, not after.

## Data Model

- **Dose entry**: substance, amount, timestamp, notes
- **Active stack**: derived, not stored — any dose whose substance duration
  window still covers "now" counts as active
- **Dashboard** (`src/pages/Dashboard.jsx`): renders the active stack and
  recent entries from that derived state

## Auth and Backend

Supabase: email/password login, registration, and password reset (listens for
the `PASSWORD_RECOVERY` event to route into the reset flow). No custom
backend — Supabase is the only server dependency.

## Design

Portfolio design tokens (Geist font, flat monochrome + blue accent, no
shadows/gradients/emojis). Mobile-first with bottom nav and safe-area-inset
support. OS-aware theme (auto dark/light + manual override).

## Companion App

| Platform | Framework | Notes |
|----------|-----------|-------|
| iOS | SwiftUI, xcodegen | iOS 17+ |

## Security / Privacy

Auth and data storage delegated entirely to Supabase (RLS-scoped per user).
No substance data leaves the user's own Supabase rows; no analytics or
third-party trackers.

## License

MIT 2026, Joshua Trommel
