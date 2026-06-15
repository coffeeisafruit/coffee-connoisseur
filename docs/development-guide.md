# Development Guide

## Prerequisites

- **Node.js 18+** (repo uses `@types/node` 24; Node 20+ recommended)
- **pnpm 10** (`packageManager` pinned to `pnpm@10.4.1`)
- **MySQL** database (optional for non-DB work — see note below)
- Platform/Forge credentials for storage, maps, and LLM features

## Install

```bash
pnpm install
```

(`postinstall` applies the patched `wouter@3.7.1` via `patches/`.)

## Environment Variables

Create `.env` at the repo root. Read by `server/_core/env.ts` (`ENV`) and Vite
(`VITE_*` are client-exposed). Keys observed in code:

| Var | Used by | Purpose |
|-----|---------|---------|
| `DATABASE_URL` | server, drizzle.config | MySQL connection string |
| `JWT_SECRET` | server (`cookieSecret`) | session token signing |
| `VITE_APP_ID` | client + server (`appId`) | OAuth app id |
| `VITE_OAUTH_PORTAL_URL` | client (`getLoginUrl`) | OAuth portal base URL |
| `OAUTH_SERVER_URL` | server | OAuth server |
| `OWNER_OPEN_ID` | server (`db.upsertUser`) | auto-grants `admin` role to this openId |
| `BUILT_IN_FORGE_API_URL` / `BUILT_IN_FORGE_API_KEY` | server | Forge proxy (storage/maps/LLM/voice/image) |
| `VITE_APP_TITLE` | client | app title |
| `PORT` | server | preferred port (auto-scans +20 if busy) |

> The README also references `AWS_*` and `GOOGLE_MAPS_API_KEY` and
> `OPENAI_API_KEY`. The current code path uses the **Forge proxy** instead — see
> [integration-architecture.md](./integration-architecture.md). Verify before
> wiring raw vendor keys.

## Common Commands

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Dev server: `tsx watch server/_core/index.ts` (Express embeds Vite HMR; single origin) |
| `pnpm build` | `vite build` (client → `dist/public`) + esbuild bundle server → `dist/index.js` |
| `pnpm start` | Production: `node dist/index.js` (serves built client) |
| `pnpm check` | `tsc --noEmit` type check |
| `pnpm test` | `vitest run` (server unit tests) |
| `pnpm format` | Prettier write |
| `pnpm db:push` | `drizzle-kit generate && drizzle-kit migrate` |

App runs at `http://localhost:3000` (or next free port).

## Database-Optional Development

`getDb()` (`server/db.ts`) returns `null` when `DATABASE_URL` is unset, so the
server boots and tests pass without MySQL. Feature data calls then throw
`"Database not available"` at runtime. For full feature work, set `DATABASE_URL`
and run `pnpm db:push`, then seed roasters: `node scripts/seed-roasters.mjs`.

## Testing Approach

- Framework: **Vitest** (`vitest.config.ts`).
- Location: colocated `server/*.test.ts` (`auth.logout`, `brewJournal`, `roasters`, `userProfile`).
- `tsconfig` excludes `**/*.test.ts` from the type-check build.
- Run a single file: `pnpm vitest run server/brewJournal.test.ts`.

## Code Conventions

- **TypeScript strict**, ESM throughout, path aliases `@/*` (client) and `@shared/*`.
- Prettier (`.prettierrc`) for formatting; `.prettierignore` excludes generated paths.
- tRPC procedures: validate every input with **zod**; choose
  `public`/`protected`/`admin` deliberately.
- Keep `server/_core/` and `client/src/components/ui/` close to upstream; extend
  rather than rewrite.
