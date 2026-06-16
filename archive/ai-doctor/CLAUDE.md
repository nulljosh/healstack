# Vital

Local-first health data tracker with multi-user profiles, iOS Health screenshot OCR parsing, and 7-day analytics.

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
- OCR is lightweight text parsing (paste from iOS Live Text), not a vision API
- Package name is "vital" despite directory name
