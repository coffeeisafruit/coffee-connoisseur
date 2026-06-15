---
stepsCompleted: [1,2,3,4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-migrate-to-do-2026-06-15/prd.md
  - _bmad-output/planning-artifacts/architecture-migrate-to-do.md
status: final
---

# Migrate off Manus → DO — Epic Breakdown

Decomposes the migration PRD (FR-M1…M6) into stories. **Dev order is peripheral-first** so each commit keeps the app working: LLM → maps → storage → decouple → **auth (biggest, last)** → deploy config.

## FR Coverage Map
| FR | Epic.Story |
|----|-----------|
| FR-M4 (LLM→OpenRouter) | M1.1 |
| FR-M3 (maps→Leaflet) | M2.1 |
| FR-M2 (storage→Spaces) | M3.1 |
| FR-M5 (decouple Manus runtime) | M4.1 |
| FR-M1 (auth→Better Auth) | M5.1, M5.2, M5.3 |
| FR-M6 (deploy config) | M6.1 |

---

## Epic M1: AI Chat → OpenRouter
### Story M1.1: Point LLM at OpenRouter
As an operator, I want AI chat to use OpenRouter so it works off Manus.
**AC:** `server/_core/llm.ts` base URL = `https://openrouter.ai/api/v1`, key from `OPENROUTER_API_KEY`, a `:free` model default; missing key → graceful error (no crash). `pnpm check` + tests + build green.

## Epic M2: Maps → Leaflet + OpenStreetMap
### Story M2.1: Replace Google Maps with Leaflet/OSM
As a visitor, I want the roaster map with no Google/Forge dependency.
**AC:** `Map.tsx` uses `react-leaflet` `MapContainer` + OSM `TileLayer` + marker per roaster, fit-to-bounds preserved; no `key=undefined`/CORS errors; `@types/google.maps` + Forge maps removed. Typecheck + build green.

## Epic M3: Storage → DO Spaces
### Story M3.1: Reimplement storage against Spaces (S3)
As an operator, I want brew photos on DO Spaces.
**AC:** `storage.ts` uses `@aws-sdk/client-s3` (+ presigner) against Spaces env (`SPACES_*`); `storagePut/storageGet/storageDelete` signatures unchanged so `routers.ts` is untouched; tests green (upload path still not exercised without creds, same as before).

## Epic M4: Decouple Manus runtime
### Story M4.1: Remove Manus vite plugin + env assumptions
As an operator, I want the app to build/boot with only DO-portable env.
**AC:** `vite-plugin-manus-runtime` removed from `vite.config.ts`; Manus-only allowedHosts cleaned; `pnpm build` + `pnpm start` work; public flows boot with no Manus env.

## Epic M5: Auth → Better Auth  *(largest; touches identity everywhere)*
### Story M5.1: Add Better Auth (schema + config + mount)
As a user, I want email/password auth backed by Better Auth.
**AC:** `better-auth` installed; `user/session/account/verification` tables in `drizzle/schema.ts` (migrated); `auth` configured (drizzle adapter mysql, emailAndPassword); `app.all("/api/auth/*", toNodeHandler(auth))` mounted **before** `express.json`. Typecheck + build green.

### Story M5.2: Switch identity to Better Auth sessions (int→string user id)
As the system, I want `ctx.user` from Better Auth and feature tables keyed by the Better Auth user id.
**AC:** `context.ts` uses `auth.api.getSession`; `ctx.user.id` is string; feature tables' `userId` columns migrated `int`→`varchar(36)`; old Manus `users` table dropped; `oauth.ts`/Manus SDK auth removed; all procedures + zod inputs + **all server tests** updated to string ids; `UNAUTHED_ERR_MSG` contract preserved. `pnpm check` + tests green.

### Story M5.3: Client login/register UI
As a user, I want to register and log in.
**AC:** `createAuthClient` wired; a login/register page replaces `getLoginUrl()` OAuth redirect; `useAuth` reads Better Auth session; unauth → redirect to the new login route. Typecheck + build green.

## Epic M6: Deploy config for DO
### Story M6.1: App Platform spec + env + release migrations
As an operator, I want the repo deploy-ready for DO App Platform.
**AC:** `.do/app.yaml` (web service: build `pnpm build`, run `pnpm start`, http port, instance), a release/pre-deploy step running `pnpm db:push`, `.env.example` documenting all env (DATABASE_URL, BETTER_AUTH_SECRET, SPACES_*, OPENROUTER_API_KEY, etc.), optional `Dockerfile`. No secrets committed.

## Sequencing
M1.1 → M2.1 → M3.1 → M4.1 → M5.1 → M5.2 → M5.3 → M6.1. Auth split into 3 stories because M5.2 (id type change) is high-blast-radius and must be isolated.

> **Provisioning (creating DO resources + deploying) is intentionally NOT an epic here** — it is a separate, user-gated step requiring DO credentials.
