---
title: Coffee Connoisseur — Migrate off Manus to DigitalOcean
status: final
created: 2026-06-15
updated: 2026-06-15
---

# PRD: Migrate Coffee Connoisseur off Manus → DigitalOcean
*Brownfield platform migration. Decisions locked with the user; this PRD is the contract for the BMad cycle that follows.*

## 0. Document Purpose
For the downstream BMad workflows (architecture → epics → dev → deploy). Captures the **platform-decoupling + deployment** requirements to move the app off Manus (auth + Forge proxy for storage/maps/LLM) onto DigitalOcean, with **no change to end-user features**. Builds on [`docs/`](../../../../docs/index.md), [`project-context.md`](../../../project-context.md), and the integration map in [`docs/integration-architecture.md`](../../../../docs/integration-architecture.md).

## 1. Vision
Coffee Connoisseur currently only runs inside the Manus WebDev platform: login is Manus OAuth, and storage/maps/LLM are reached through the Manus "Forge" proxy. This PRD makes the app **self-hostable on DigitalOcean** — owning its auth and wiring real, portable providers — so it can be deployed, operated, and evolved independently. The product the user sees is unchanged; the platform underneath becomes ours.

## 2. Target User
### 2.1 Jobs To Be Done
- **Operator:** "Deploy and run Coffee Connoisseur on infrastructure I control (DO), without Manus."
- **End user:** "Sign in and use the app (journal, quiz, roasters, reviews) exactly as before — just on the new home."

### 2.2 Non-Users (v1)
- No new end-user personas; this is infrastructure, not features.

## 3. Glossary
- **Manus / Forge** — the current platform and its API proxy (storage, maps, LLM) the app must stop depending on.
- **DO Spaces** — DigitalOcean's S3-compatible object storage (brew photos).
- **Better Auth** — self-hosted TypeScript auth library (Drizzle adapter) replacing Manus OAuth.
- **OpenRouter** — OpenAI-compatible LLM gateway (free tier) replacing the Forge LLM.
- **App Platform** — DO's PaaS that builds + runs the app from GitHub.
- **Session** — authenticated user state; today a Manus JWT cookie, becoming a Better Auth session.

## 4. Features

### 4.1 Authentication (replace Manus OAuth)
**Description:** Replace the Manus OAuth flow (`server/_core/oauth.ts`, `sdk.ts`, `getLoginUrl()`) with **Better Auth** (email/password + sessions) hosted in the existing Express app, using the Drizzle adapter against MySQL. Preserve the app's authorization model (`protectedProcedure`/`adminProcedure`, `ctx.user`) and the `UNAUTHED_ERR_MSG` client-redirect contract.

#### FR-M1: Email/password auth via Better Auth
Users can register, log in, and log out with email/password; sessions persist via secure cookie.
**Consequences (testable):**
- `auth.me` returns the authenticated user or null; `protectedProcedure` still throws `UNAUTHORIZED` with `UNAUTHED_ERR_MSG` when unauthenticated.
- `ctx.user` shape stays compatible with existing procedures (id, role, etc.).
- Better Auth tables live in `drizzle/schema.ts` (or its adapter), migrated via `pnpm db:push`.
**Out of Scope:** social/OAuth providers (later), password-reset email delivery infra (stub/log in this cycle).

### 4.2 Object Storage (replace Forge → DO Spaces)
**Description:** Replace `server/storage.ts` (Forge proxy) with an **S3 client targeting DO Spaces** (`@aws-sdk/client-s3` + presigner — the deps removed during hardening return). Same `storagePut`/`storageGet`/`storageDelete` interface so callers (brew photo upload/edit) are untouched.

#### FR-M2: Brew photos on DO Spaces
Brew photo upload/replace/remove works against DO Spaces.
**Consequences (testable):** `storagePut` returns a public/presigned URL; `storageDelete` removes the object; interface signatures unchanged so `routers.ts` needs no logic change.

### 4.3 Maps (replace Google Maps/Forge → Leaflet + OSM)
**Description:** Replace `client/src/components/Map.tsx` + `server/_core/map.ts` usage with **Leaflet + OpenStreetMap** tiles (no API key). Roaster markers + fit-bounds behavior preserved.

#### FR-M3: Roaster map via Leaflet/OSM
The roaster map renders markers from lat/lng with no Google/Forge dependency and no API key.
**Consequences (testable):** `/roasters` shows an interactive OSM map with a marker per roaster; no `key=undefined` / CORS errors.

### 4.4 AI Chat (replace Forge LLM → OpenRouter)
**Description:** Point `server/_core/llm.ts` at **OpenRouter** (OpenAI-compatible) via base URL + `OPENROUTER_API_KEY`. Minimal change since it already uses the `openai` SDK shape.

#### FR-M4: AI chat via OpenRouter
The AI assistant responds using an OpenRouter free-tier model.
**Consequences (testable):** with `OPENROUTER_API_KEY` set, a chat request returns a completion; without it, the feature degrades gracefully (clear error, no crash).

### 4.5 Decouple from Manus runtime
**Description:** Remove `vite-plugin-manus-runtime` reliance and Manus-only env assumptions; ensure the app boots and serves with only DO-portable env vars.

#### FR-M5: No hard Manus dependency at runtime
App builds and boots with no Manus SDK/Forge/OAuth env required for core flows.
**Consequences (testable):** `pnpm build` + `pnpm start` run; public flows work; protected flows work with Better Auth; no Forge/Manus calls on the hot path.

### 4.6 Deployment configuration for DO
**Description:** Add the artifacts DO App Platform needs to build+run from GitHub.

#### FR-M6: DO App Platform deploy config
Repo contains a working App Platform spec + env template + release-time migrations.
**Consequences (testable):** `.do/app.yaml` defines the service (build `pnpm build`, run `pnpm start`), env var list, and a release/pre-deploy step running `pnpm db:push`; a Dockerfile exists if buildpack is insufficient; `.env.example` documents all required vars.
**Out of Scope:** actually creating DO resources / deploying (gated on user credentials — see §5).

## 5. Non-Goals (Explicit)
- **No billable DO provisioning or deployment in this cycle.** Code + config only; provisioning requires the user's DO account/`doctl` token and is a separate, user-gated step. `[NON-GOAL for this cycle]`
- No new end-user features; the 5 shipped features must keep working.
- No social-login providers, no email-delivery infra (password reset stubbed/logged).
- No re-platforming the backend language (stays Node/Express/tRPC/Drizzle).

## 6. MVP Scope
### 6.1 In Scope
FR-M1…FR-M6 — full decoupling + deploy config, verified locally (typecheck + tests + build), CI green.
### 6.2 Out of Scope
- DO provisioning/deploy (gated), custom domain/TLS specifics, observability stack, CDN tuning.

## 7. Success Metrics
**Primary**
- **SM-1**: Zero Manus/Forge/OAuth calls required for any core flow (auth, journal, quiz, roasters, reviews). Validates FR-M1,M2,M3,M5.
- **SM-2**: App is deploy-ready — `.do/app.yaml` + env template present; a reviewer could deploy with only credentials. Validates FR-M6.

**Secondary**
- **SM-3**: All existing tests still pass + new provider tests added. Validates FR-M1,M2.

**Counter-metrics (do not optimize)**
- **SM-C1**: No regression in the 5 shipped features (parity, not expansion).
- **SM-C2**: No secrets committed; everything via env (`.env` gitignored, `.env.example` documents).

## 8. Open Questions
1. DO region + Spaces bucket name (needed at provisioning, not build).
2. Better Auth: keep `users` table compatible vs. let Better Auth own its schema (architecture to decide).
3. Password reset email delivery — stub now; pick a provider later.

## 9. Assumptions Index
- §4.4 — OpenRouter free tier is acceptable for experimental AI chat.
- §4.1 — email/password is sufficient for v1; social login deferred.
- §5 — user will provide DO credentials for the separate provisioning step.
