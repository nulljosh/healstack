# Vital (MVP)

Vital is a standalone project. Not integrated into other repos by default.

## What it does
- Multi-user local profiles/accounts
- Profile switching
- iOS Health screenshot upload flow
- OCR-style parsing attempt from pasted OCR text (or filename fallback)
- Manual correction fallback form
- Structured per-profile health timeline from screenshot imports + manual entries
- 7-day analytics tiles with trend deltas vs prior week
- Anomaly flags and score confidence indicator
- Local-first storage only (no backend)

## Run
```bash
npm install
npm run dev
```

## Test
```bash
npm run test
```

## Notes
- In this MVP, OCR is lightweight text parsing from provided OCR text (paste from iOS/Shortcuts/Live Text output).
- For production OCR quality, integrate tesseract.js or Vision API pipeline later.
