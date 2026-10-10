# MedCare AI frontend

React 19 + TypeScript + Vite single-page app for MedCare AI. It talks to the FastAPI backend in `../backend`.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL if you are not using the production backend
npm run dev            # http://localhost:5173
```

`VITE_API_URL` is the backend base URL including `/api/v1`. When it is not set, the app falls back to the production Cloud Run URL in `src/config.ts`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve `dist/` on http://localhost:4173 |
| `npm run typecheck` | TypeScript, strict mode |
| `npm run lint` | ESLint |
| `npm test` | Unit and component tests (Vitest) |

## Deploying on Vercel

`vercel.json` sets the Vite framework preset, the `dist` output folder and a rewrite so every route serves `index.html`. In the Vercel project settings, the environment variable is now `VITE_API_URL` (it used to be `REACT_APP_API_URL`).
