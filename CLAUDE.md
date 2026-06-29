# Dose
v2.1.1

## Pending (2026-06-28)
- [ ] Enable GitHub OAuth provider in Supabase dashboard → spark project → Auth → Providers → GitHub
  - Client ID: `0v23lihruvpnuTF2ZJvs`
  - Client Secret: `6cbc46c3f3842ce2f9a18d1839cac41d58296a98`

## Rules
- Portfolio vibe design (Geist font, flat monochrome + blue accent, no shadows/gradients)
- Mobile-first, bottom nav, safe-area-inset support
- Supabase auth: login, register, password reset (PASSWORD_RECOVERY event flow)
- Interaction checker must warn when logging substance that interacts with active stack
- No emojis

## Run
```bash
npm run dev       # Dev server
npm test          # Run tests
npm run build     # Production build
git push           # Deploy (auto via Vercel Git integration from apps monorepo)
```

## Key Files
- src/App.jsx: App shell with routing, OS-aware theme (auto dark/light + manual toggle), nav.
- src/main.jsx: React entry point.
- src/pages/Dashboard.jsx: Active stack and recent dose entries.
- src/components/InteractionChecker.jsx: Interaction checker logic and UI.
- src/data/substances.js: Substance dataset with harm reduction notes and interactions.
- src/index.css: Full design system (portfolio vibe tokens).
- src/design-tokens.css: Token reference (vibed from heyitsmejosh.com).

## iOS
- ios/: SwiftUI iOS app. xcodegen (project.yml). iOS 17+.
- xcodegen generate && xcodebuild build -scheme Dose -project Dose.xcodeproj -destination "platform=iOS Simulator,name=iPhone 17 Pro"

## Pending
- .env.local recreated 2026-06-12 (VITE_SUPABASE_* + DOSE_EMAIL/DOSE_PASSWORD) — file is gone again as of 2026-06-20, needs recreating.
- Account recovery: real account email is jatrommel@gmail.com (not trommatic@icloud.com). Reset password to that address rather than chasing the icloud reset email further.
- Supabase anon key no longer hardcoded in `ios/Services/AuthService.swift` — now read via `infoPlistValue("SUPABASE_ANON_KEY")` from Info.plist (fixed 2026-06-23).
- Web UI refresh, landing page, and iOS ship are tracked in README Roadmap (Declutter UI, Vibe clone portfolio aesthetic, iOS companion app) — not new asks, no changes applied yet.
