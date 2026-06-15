---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-Coffee-App-2026-06-14/prd.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Coffee-App-2026-06-14/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Coffee-App-2026-06-14/EXPERIENCE.md
  - _bmad-output/project-context.md
  - docs/index.md
workflowType: 'architecture'
project_name: 'Coffee App'
user_name: 'Joe'
date: '2026-06-14'
status: 'final'
---

# Architecture Decision Document — Coffee Connoisseur

_Brownfield architecture. The system already exists; this document records the
**binding architectural decisions** (existing + new) that AI agents must follow
when implementing the PRD's hardening backlog (FR-13–FR-18). It complements the
descriptive [`docs/`](../../docs/index.md) set and the rules in
[`project-context.md`](../project-context.md)._

## 1. Project Context Analysis

- **Type:** Multi-part monorepo — React 19 SPA (`client/`) ⇄ tRPC ⇄ Express (`server/`) ⇄ Drizzle/MySQL, single-origin served.
- **Platform:** Manus WebDev; external capabilities (storage, maps, LLM) via the **Forge proxy** with platform-injected credentials.
- **Iteration goal:** Make the shipped product trustworthy (close doc/code drift, finish partial flows, add a quality gate) **without** changing the architecture or adding product surfaces.
- **Constraint set inherited from PRD §Cross-Cutting NFRs + project-context.md:** end-to-end type safety, DB-optional resilience, secrets only via `ENV`, app-enforced ownership, single-origin (no CORS).

## 2. Architectural Stance: Preserve, Don't Re-platform

**Decision A — No stack changes.** Keep React 19 / Vite / tRPC 11 / Drizzle / MySQL / Express exactly as-is. Rationale: hardening must not introduce regression risk in 12 shipped FRs (PRD SM-C2). Any temptation to "modernize" during hardening is a non-goal.

**Decision B — Respect the `_core/` boundary.** `server/_core/` and `client/src/_core/` are platform-managed. New code composes around them; do not edit `_core/` unless a hardening FR strictly requires it (none do).

**Decision C — tRPC remains the only API surface.** New capabilities (FR-15 helpful-vote, FR-13 photo-on-update) are added as tRPC procedures, not REST routes. The single non-tRPC route (`/api/oauth/callback`) stays as the sole exception.

## 3. Decisions per Hardening Requirement

### FR-13 — Photo edit on brew update
- **Decision:** Extend `brewJournal.update` input with optional `photoData` (base64) and a `removePhoto` boolean. Reuse `storagePut` exactly as `create` does; on replace, upload new key `brew-photos/{userId}/{ts}-{rand}.jpg` and overwrite `photoUrl`/`photoKey`; on remove, null both.
- **Pattern:** Mirror the existing create-path photo logic in `server/routers.ts`; keep ownership scoping `(id, userId)`.
- **Note:** Old object cleanup in Forge storage is best-effort/out-of-scope (no delete helper exists in `storage.ts`); document the orphan.

### FR-14 — Route-level auth guards
- **Decision:** Add a client-side `RequireAuth` wrapper component (uses `useAuth({ redirectOnUnauthenticated: true })`) around protected routes in `App.tsx` (`/journal`, `/profile`, `/quiz`). Server stays the source of truth via `protectedProcedure`; the guard is a UX/defense-in-depth layer that prevents data-flash and failed-request redirects.
- **Pattern:** Composition in `App.tsx` `<Switch>`; no new routing library. `useAuth` already supports `redirectOnUnauthenticated`.

### FR-15 — Mark a review helpful
- **Decision:** Add `roasters.markReviewHelpful` (`protectedProcedure`, input `{ reviewId }`). To enforce one-vote-per-user (PRD assumption), introduce a new table `review_helpful_votes(reviewId, userId)` with a unique `(reviewId, userId)` constraint; increment `roaster_reviews.helpful_count` only on first vote.
- **Decision (schema):** This is the one **schema migration** this iteration (`drizzle/` new migration via `pnpm db:push`). Keep app-enforced FK convention (plain int columns), consistent with existing tables.
- **Alternative considered (rejected):** bare counter without a votes table — rejected because it can't prevent double-counting (violates FR-15 consequence). Logged in decision log.

### FR-16 — Storage/docs reconciliation
- **Decision:** Treat as **documentation + dependency hygiene**, not runtime change. Update `README.md` to describe the Forge proxy + env vars; remove `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` from `package.json` (unused by the live path) OR add a README note if a future S3 path is intended (resolve Open Question #2 first).

### FR-17 — Source-of-truth task tracking
- **Decision:** Replace `todo.md` content with a pointer to the BMad backlog (sprint status / epics), eliminating the contradiction. No code impact.

### FR-18 — CI quality gate
- **Decision:** Add `.github/workflows/ci.yml` running `pnpm install`, `pnpm check`, `pnpm test` on PRs to `main`. `[ASSUMPTION: GitHub Actions]` (Open Question #1). No app code change.

## 4. Patterns & Conventions (binding)

- **New procedures:** validate input with zod; choose `public`/`protected`/`admin` deliberately; delegate to a `server/<feature>.ts` data module (don't inline DB calls in `routers.ts` beyond orchestration).
- **New tables:** define in `drizzle/schema.ts` with `$inferSelect/$inferInsert` exports; generate migration via `pnpm db:push`; never hand-edit generated SQL.
- **Client data:** TanStack Query via tRPC hooks; optimistic update for the helpful-vote (per EXPERIENCE.md KF-3) with rollback on error; invalidate via `trpc.useUtils()`.
- **Types:** new DB types flow schema → server → client (type-only). No client-side duplication.
- **Errors:** throw `TRPCError` for auth; user-facing copy per EXPERIENCE.md Voice & Tone; preserve `UNAUTHED_ERR_MSG` string contract.

## 5. Source Structure Impact

| Change | Files |
|--------|-------|
| FR-13 | `server/routers.ts` (update proc), `server/brewJournal.ts` (update fn), `client/src/pages/Journal.tsx` (edit dialog photo control) |
| FR-14 | new `client/src/components/RequireAuth.tsx`, `client/src/App.tsx` |
| FR-15 | `drizzle/schema.ts` (+`review_helpful_votes`), new migration, `server/roasters.ts` (+vote fn), `server/routers.ts` (+proc), `client/src/pages/Roasters.tsx` (helpful button) |
| FR-16 | `README.md`, `package.json` |
| FR-17 | `todo.md` |
| FR-18 | `.github/workflows/ci.yml` |

No new top-level directories except `.github/workflows/`.

## 6. Validation (architecture self-check)

- ✅ Every PRD hardening FR has a decision and a file map.
- ✅ No decision violates project-context.md rules (tRPC-only, zod inputs, `_core/` boundary, Forge proxy, app-enforced FKs, secrets-in-ENV).
- ✅ Counter-metric SM-C1 honored: no new product surfaces; only the one necessary schema addition (votes table) which serves FR-15.
- ✅ Regression guard SM-C2: changes are additive; baseline procedures untouched in signature except `brewJournal.update` (additive optional fields).
- ⚠️ Open dependencies on PRD Open Questions #1 (CI target), #2 (aws-sdk removal vs. future S3), #3 (helpful vote model — resolved here in favor of a votes table).

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Forge storage orphans on photo replace/remove | Document; revisit if a delete helper is added |
| Schema migration on shared DB | Single additive table, no destructive change; run `pnpm db:push` in deploy |
| Auth guard double-redirect loop | `useAuth` already guards `pathname === redirectPath`; reuse, don't re-implement |
| aws-sdk removal breaks a hidden path | Grep for `@aws-sdk` usage before removal (expected: none in live code) |
