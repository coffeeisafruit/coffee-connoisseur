---
stepsCompleted: [1,2,3,4,5,6,7,8]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-migrate-to-do-2026-06-15/prd.md
  - _bmad-output/project-context.md
  - docs/integration-architecture.md
workflowType: architecture
project_name: Coffee App
date: 2026-06-15
status: final
---

# Architecture — Migrate off Manus → DigitalOcean

_Binding decisions for the migration BMad cycle. Versions pinned against live docs (context7) on 2026-06-15._

## 1. Context
Decouple the app from Manus (auth + Forge proxy for storage/maps/LLM) and make it run on DO, preserving all 5 features. Stack stays Node/Express/tRPC/Drizzle/React.

## 2. Decisions per subsystem

### A. Auth → Better Auth (`better-auth` ^1.6, latest 1.6.11)
- **Mount:** `app.all("/api/auth/*", toNodeHandler(auth))` **before** `express.json()` (Better Auth reads the raw body); keep `express.json({limit:"50mb"})` for the rest.
- **Config:** `betterAuth({ database: drizzleAdapter(db, { provider: "mysql" }), emailAndPassword: { enabled: true } })`. Email verification stubbed (log) this cycle.
- **Server session:** `auth.api.getSession({ headers })` → replaces `sdk.authenticateRequest` in `server/_core/context.ts`. `ctx.user` is populated from the Better Auth session.
- **Better Auth owns tables:** `user`, `session`, `account`, `verification` (generated via Better Auth CLI / added to `drizzle/schema.ts`, migrated with `pnpm db:push`).
- **⚠️ KEY DECISION — user id type.** Better Auth `user.id` is `varchar(36)` (UUID), but existing feature tables (`brew_entries`, `user_profiles`, `roaster_reviews`, `review_helpful_votes`) key `userId` as **int** referencing the old `users` table.
  - **Decision:** Better Auth becomes the system of record for identity. **Migrate the feature tables' `userId` columns from `int` → `varchar(36)`** to reference `user.id`. Drop the old Manus `users` table. `ctx.user.id` becomes a **string** end-to-end.
  - **Blast radius:** every procedure using `ctx.user.id`, the zod inputs that type ids, and all server tests (which construct `createAuthContext(userId:number)` and assert numeric `userId`) must move to string ids. This is the single largest story.
  - **Safe because** pre-production (no real user data to preserve). Alternative (keep int `users` + mapping table to Better Auth) rejected: permanent dual-identity complexity.
- **Client:** replace `getLoginUrl()` OAuth redirect with a real login/register form hitting `better-auth` client (`createAuthClient`) `/api/auth/*`. Keep the `UNAUTHED_ERR_MSG`→redirect contract pointing at the new login route.
- **Remove:** `server/_core/oauth.ts`, `sdk.ts` auth usage, Manus OAuth env.

### B. Storage → DO Spaces (`@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, re-add)
- Reimplement `server/storage.ts` `storagePut/storageGet/storageDelete` against Spaces (S3-compatible): `S3Client({ endpoint: SPACES_ENDPOINT, region, credentials })`. **Interface unchanged** → `routers.ts` callers untouched (the hardening already routes update/delete through `storageDelete`).
- Env: `SPACES_ENDPOINT`, `SPACES_REGION`, `SPACES_BUCKET`, `SPACES_KEY`, `SPACES_SECRET`. Public-read objects or presigned GET for photos.

### C. Maps → Leaflet + OpenStreetMap (`leaflet` + `react-leaflet` ^5 for React 19)
- Replace `client/src/components/Map.tsx` (`MapView`) with a Leaflet `MapContainer` + OSM `TileLayer` + a `Marker` per roaster; preserve fit-to-bounds. No API key, no `_core/map.ts` / Forge.
- Remove `@types/google.maps` usage and the Forge maps script injection.

### D. AI Chat → OpenRouter (`openai` SDK, already present)
- Point `server/_core/llm.ts` base URL at `https://openrouter.ai/api/v1` with `OPENROUTER_API_KEY`; pick a free model (e.g. a `:free` model id). Graceful error if key absent. Minimal change (OpenAI-compatible).

### E. Decouple Manus runtime
- Remove `vite-plugin-manus-runtime` from `vite.config.ts` and any Manus-only allowedHosts; ensure build/boot needs only DO-portable env. Keep `_core` infra that's generic (trpc, cookies, vite glue).

## 3. DO Topology
- **App Platform** service: build `pnpm install && pnpm build`, run `pnpm start`; single web service, single origin (Express serves `dist/public`).
- **Managed MySQL**: `DATABASE_URL` from DO; **release/pre-deploy job** runs `pnpm db:push`.
- **Spaces**: bucket for brew photos.
- **Env**: documented in `.env.example`; secrets in App Platform env (encrypted), never committed.
- Artifacts: `.do/app.yaml` (spec), optional `Dockerfile` if buildpack insufficient.

## 4. Pinned versions (verify at install)
| Lib | Version | Notes |
|-----|---------|-------|
| better-auth | ^1.6 (1.6.11) | node handler + drizzle adapter (mysql) |
| @aws-sdk/client-s3 / s3-request-presigner | ^3 | Spaces (S3 API) |
| leaflet / react-leaflet | leaflet ^1.9 / react-leaflet ^5 | react-leaflet 5 supports React 19 |
| openai | ^4.67 (present) | base URL → OpenRouter |

## 5. Risks
| Risk | Mitigation |
|------|-----------|
| user id int→string touches everything | Do it as the first, isolated story; update all procedures + tests together; lean on typecheck |
| Better Auth body-parser ordering | mount auth handler before express.json (documented) |
| react-leaflet/React 19 peer deps | pin react-leaflet ^5; verify `pnpm install` |
| Spaces public URL vs presigned | default to presigned GET; revisit ACL at provisioning |
| OpenRouter free-tier rate limits | acceptable for experimental chat; degrade gracefully |

## 6. Validation
- ✅ Each story verified with `pnpm check` + `pnpm test` (local MySQL) + `pnpm build`.
- ✅ No Manus/Forge/OAuth on any core path (SM-1).
- ✅ No secrets committed; `.env.example` documents env (SM-C2).
- ⚠️ Provisioning/deploy is OUT of scope (user-gated).
