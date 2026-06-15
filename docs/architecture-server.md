# Architecture — Server (Backend API)

> Part: `server` · Type: `backend` · Entry point: [`server/_core/index.ts`](../server/_core/index.ts)

## Executive Summary

An Express 4 server (ESM, run via `tsx` in dev) that exposes a **single tRPC
router** at `/api/trpc` and an OAuth callback at `/api/oauth/callback`. In
development it embeds Vite as middleware (SSR-less HMR); in production it serves
the pre-built static client. Business logic is organized as thin tRPC procedures
delegating to per-feature data modules over Drizzle/MySQL.

## Technology Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| Runtime | Node (ESM) | — | `"type": "module"` |
| Web framework | Express | ^4.21 | body limit raised to 50mb for base64 photo uploads |
| RPC | tRPC | ^11.6 | superjson transformer |
| ORM | Drizzle | ^0.44 | `drizzle-orm/mysql2` |
| DB driver | mysql2 | ^3.15 | |
| Auth | jose (JWT) + Manus SDK | — | session cookie `app_session_id` |
| Validation | zod | ^4.1 | per-procedure input schemas |
| AI/LLM | openai | ^4.67 | via Forge proxy (`_core/llm.ts`) |
| Dev | tsx | watch mode | `tsx watch server/_core/index.ts` |
| Build | esbuild | bundle to `dist/index.js` | |

## Architecture Pattern

**Layered, API-centric:**

```
HTTP (Express)
  ├── /api/oauth/callback         → oauth.ts (session mint)
  └── /api/trpc/*                 → appRouter (routers.ts)
        ├── middleware: createContext → sdk.authenticateRequest → ctx.user
        ├── procedures: public / protected / admin (trpc.ts)
        └── feature data modules: brewJournal.ts, roasters.ts, userProfile.ts, db.ts
              └── Drizzle query builder → MySQL (drizzle/schema.ts)
```

- `server/_core/` = platform-provided infrastructure (tRPC setup, context,
  cookies, OAuth, Forge proxies for storage/maps/LLM/voice/image, Vite glue).
  **Treat `_core/` as a managed boundary** — feature code imports from it but
  shouldn't need to modify it.
- Feature modules at `server/` root (`brewJournal.ts`, `roasters.ts`,
  `userProfile.ts`) are pure data-access functions; `routers.ts` wires them to
  validated tRPC procedures.

## Key Cross-Cutting Concerns

- **Config:** centralized in `server/_core/env.ts` (`ENV` object reads
  `process.env`). Notable vars: `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`,
  `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_URL/KEY`.
- **Resilience:** DB connection is lazy and failure-tolerant (`getDb()` returns
  `null` rather than throwing on connect failure).
- **External services** all route through the Forge proxy with a bearer key:
  storage (`storage.ts`), Google Maps (`_core/map.ts`), LLM (`_core/llm.ts`),
  voice transcription, image generation.
- **Ports:** server auto-discovers a free port starting at `PORT || 3000`
  (scans up to +20).

## Testing

Vitest unit tests colocated in `server/`: `auth.logout.test.ts`,
`brewJournal.test.ts`, `roasters.test.ts`, `userProfile.test.ts`. Run with
`pnpm test`. Tests run without a live DB (the lazy `getDb()` design).

## Source Map (server)

| Path | Responsibility |
|------|----------------|
| `_core/index.ts` | Express bootstrap, route registration, Vite/static, port scan |
| `_core/context.ts` | tRPC context, authenticates request → `ctx.user` |
| `_core/trpc.ts` | tRPC init, `public/protected/admin` procedures |
| `_core/oauth.ts` | OAuth callback → upsert user, set session cookie |
| `_core/sdk.ts` | Manus platform SDK (auth, token exchange, user info) |
| `_core/{map,llm,voiceTranscription,imageGeneration,notification}.ts` | Forge-proxied capabilities |
| `routers.ts` | Root `appRouter`; all feature procedures |
| `db.ts` | Drizzle instance + user upsert/query |
| `brewJournal.ts` / `roasters.ts` / `userProfile.ts` | Feature data access |
| `storage.ts` | Forge object-storage put/get |
