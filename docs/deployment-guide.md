# Deployment Guide

> ⚠️ No CI/CD pipeline, Dockerfile, or IaC was found in the repo at scan time
> (no `.github/workflows/`, `Dockerfile`, `docker-compose.yml`, `terraform/`,
> etc.). The app is structured for the **Manus WebDev platform**, which supplies
> the Forge proxy credentials and runtime. This guide documents the build/run
> contract; wire it into your target platform accordingly.

## Build Contract

```bash
pnpm install          # install + apply patches
pnpm check            # type-check (recommended gate)
pnpm test             # unit tests
pnpm build            # client → dist/public, server → dist/index.js
pnpm start            # NODE_ENV=production node dist/index.js
```

- **Client build:** `vite build` outputs static assets to `dist/public`.
- **Server build:** `esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist`.
- **Single-process serving:** in production the Express server serves the built
  client via `serveStatic` (same origin as the API). No separate static host or
  CORS config required.

## Runtime Requirements

| Requirement | Notes |
|-------------|-------|
| Node runtime (ESM) | runs `dist/index.js` |
| MySQL | reachable via `DATABASE_URL`; run migrations before/at deploy (`pnpm db:push`) |
| Env vars | all keys from [development-guide.md](./development-guide.md#environment-variables) must be present in the deploy environment |
| Forge proxy | `BUILT_IN_FORGE_API_URL` + `BUILT_IN_FORGE_API_KEY` for storage/maps/LLM |
| Port | binds `PORT` (default 3000), auto-scans +20 if busy — pin `PORT` in production for predictable routing |

## Database Migrations

Migrations live in `drizzle/` (`0000`–`0002`). On deploy:

```bash
pnpm db:push   # drizzle-kit generate && drizzle-kit migrate
```

Requires `DATABASE_URL`. Seed reference roaster data with
`node scripts/seed-roasters.mjs` if starting from an empty DB.

## Pre-Deploy Checklist

- [ ] All env vars set (DB, JWT, OAuth, Forge)
- [ ] `pnpm check` and `pnpm test` green
- [ ] Migrations applied against target DB
- [ ] `PORT` pinned; reverse proxy points at it
- [ ] OAuth `redirectUri` (`{origin}/api/oauth/callback`) registered with the OAuth provider for the production origin
