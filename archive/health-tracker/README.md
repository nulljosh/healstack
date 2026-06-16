# Health Tracker (Same-Day MVP)

A local-first React + Vite app for daily health check-ins and simple behavior trends.

## Features

- Daily check-in form
  - sleep hours
  - exercise minutes
  - nutrition score (1-10)
  - smoking count
- Dashboard
  - today summary cards
  - streak counter (consecutive check-in days)
  - clean weekly trend chart
  - risk flags for common negative combinations
- History view
  - review records for the last 7, 14, 21, or 30 days
- Local persistence
  - data stored in browser `localStorage`
- Basic tests
  - key streak and risk logic via Vitest

## Stack

- React 18
- Vite 5
- Recharts
- Vitest

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run test     # run unit tests
npm run preview  # preview production build
```

## Notes

- No backend is used.
- Check-ins are saved by date and can be updated for the current day.
- Clearing browser storage clears app data.
