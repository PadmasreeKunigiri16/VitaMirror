# VitaMirror Frontend

## Overview
React 18 + TypeScript + Vite frontend providing the wellness dashboard and camera analysis UI.

## Tech Stack
- React 18
- TypeScript
- Vite
- React Router v6
- Axios
- Recharts
- Lucide React icons

## Setup

```bash
npm install
npm run dev       # Development server on port 5173
npm run build     # Production build
npm run preview   # Preview production build
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | LandingPage | Hero + features + CTA |
| `/dashboard` | DashboardPage | Wellness summary + recent history |
| `/check` | WellnessCheckPage | Live camera + analysis |
| `/history` | HistoryPage | All checks + trend chart |
| `/history/:id` | ResultPage | Single check detail |
| `/privacy` | PrivacyPage | Data privacy + delete all |

## Running E2E Tests

> Requires frontend + backend both running.

```bash
npx playwright install chromium   # First time only
npx playwright test
npx playwright show-report        # View HTML report
```

## Environment Variables

Create `.env` (optional):
```env
VITE_API_URL=http://localhost:8000/api
```
