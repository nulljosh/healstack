# Health Tracker

Local-first React app for daily health check-ins (sleep, exercise, nutrition, smoking) with streak tracking and risk flags.

## Commands

```bash
npm install
npm run dev       # Vite dev server (localhost:5173)
npm run build     # Production build
npm run test      # Vitest unit tests
npm run preview   # Preview production build
```

## Stack

React 18, Vite 5, Recharts, Vitest + Testing Library (jsdom)

## Code Style

- JSX components in `src/components/`, utilities in `src/utils/`
- camelCase naming, functional components
- Tests in `src/__tests__/`

## Notes

- No backend -- all data in browser localStorage
- Check-ins keyed by date, one per day (updatable same-day)
- Streak logic and risk flag logic are the core testable units
