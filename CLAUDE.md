# Dose
v2.2.0

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
- .env.local recreated 2026-06-12 (VITE_SUPABASE_* + DOSE_EMAIL/DOSE_PASSWORD)
- Account recovery: no reset email arrived at trommatic@icloud.com (2026-06-12) — account likely under a different email. Check Supabase dashboard Auth > Users for the real email, or admin-reset password to match .env.local. Also check SMTP config (default Supabase mailer is heavily rate-limited).
