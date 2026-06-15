---
project_name: 'Coffee Connoisseur'
user_name: 'Joe'
date: '2026-06-14'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality_rules', 'workflow_rules', 'critical_rules']
existing_patterns_found: 12
status: 'complete'
optimized_for_llm: true
---

# Project Context for AI Agents

_Critical rules and patterns AI agents must follow when implementing code in Coffee Connoisseur. Focuses on unobvious details agents would otherwise miss. Full docs: [`docs/index.md`](../docs/index.md)._

---

## Technology Stack & Versions

- **Monorepo, multi-part:** `client/` (web) + `server/` (backend) + `shared/` + `drizzle/`. pnpm 10 workspace-style (single `package.json`).
- **Frontend:** React 19.1 · Vite 7.1 · TypeScript 5.9 (strict) · Tailwind 4 · wouter 3.3 (patched 3.7.1 via `patches/`) · TanStack Query 5.90 · `@trpc/react-query` 11.6 · Radix/shadcn (new-york).
- **Backend:** Express 4.21 · tRPC 11.6 (superjson transformer) · Drizzle ORM 0.44 + mysql2 3.15 · zod 4.1 · jose (JWT) · openai 4.67.
- **Tooling:** tsx (dev), esbuild (prod bundle), Vitest 2.1, Prettier, drizzle-kit.
- **Platform:** Scaffolded on **Manus WebDev**. `vite-plugin-manus-runtime`, and a "Forge" API proxy injects credentials for storage/maps/LLM/voice/image.

## Critical Implementation Rules

### Architecture & Data Flow
- **API = tRPC only.** Add features as procedures in `server/routers.ts`, grouped by domain router (`brewJournal`, `roasters`, `userProfile`). All API paths live under `/api/trpc`. Don't add ad-hoc Express REST routes (except the existing `/api/oauth/callback`).
- **Thin procedures, fat data modules.** Procedures validate + orchestrate; actual DB access lives in `server/<feature>.ts` (e.g. `brewJournal.ts`). Follow this split for new features.
- **End-to-end types via type-only import.** `client/src/lib/trpc.ts` imports `AppRouter` as a **type**. Never import server runtime code into the client. DB row types originate in `drizzle/schema.ts` (`$inferSelect`/`$inferInsert`) and flow outward — don't redefine them on the client.
- **`server/_core/` is a managed platform boundary.** Contains tRPC setup, context, OAuth, and Forge proxies. Extend feature code around it; avoid editing `_core/` unless strictly necessary.

### Language-Specific (TypeScript)
- **Strict mode + ESM everywhere** (`"type": "module"`). Use path aliases `@/*` (client/src) and `@shared/*` (shared). No relative `../../..` reaches across parts except the deliberate `client/src/lib/trpc.ts` → `server/routers` type import.
- `allowImportingTsExtensions` + `moduleResolution: bundler` — match existing import style.

### Framework-Specific
- **tRPC:** every procedure input validated with **zod**. Pick the right base procedure: `publicProcedure` / `protectedProcedure` (requires `ctx.user`) / `adminProcedure` (requires `role==='admin'`). `protected`/`admin` are defined in `server/_core/trpc.ts`.
- **Auth context:** `ctx.user` is resolved in `server/_core/context.ts` via `sdk.authenticateRequest`; it is `null` for unauthenticated requests. Ownership must be checked in queries (pass `userId`, e.g. `getBrewEntryById(id, userId)`) — there are **no DB foreign keys**.
- **React state:** server state = TanStack Query via tRPC hooks (`trpc.x.y.useQuery/useMutation`); invalidate via `trpc.useUtils()`. No Redux/Zustand. Only React Context in use is `ThemeContext`.
- **Auth redirect:** unauthorized errors are detected by exact message match `UNAUTHED_ERR_MSG` (`shared/const.ts`) in `client/src/main.tsx`, which redirects to `getLoginUrl()`. Don't change that error string without updating both sides.
- **Routing:** wouter `<Switch>/<Route>` in `App.tsx`. No route-level auth guard — pages call `useAuth()`.
- **UI:** compose from `client/src/components/ui/*` (shadcn). Keep primitives upstream-standard; style via Tailwind + CSS vars. Merge classes with `cn()` (`lib/utils.ts`).

### Testing
- **Vitest**, tests colocated as `server/*.test.ts`. Run `pnpm test`. Type-check build excludes `**/*.test.ts`.
- **Server boots without a DB** (`getDb()` returns `null` when `DATABASE_URL` is unset; modules throw `"Database not available"`).
- **The test suite requires a live MySQL.** Tests are *integration* tests that exercise real CRUD via `appRouter.createCaller` — without `DATABASE_URL` 21/22 fail; **with** a MySQL all 22 pass *(verified 2026-06-14 against a local `mysql:8` container on `:3307`)*. Set `DATABASE_URL` (and run `pnpm db:push`) before `pnpm test`. CI must provide a MySQL service. `pnpm check` (typecheck) is always green and DB-free.

### Code Quality & Style
- Prettier-formatted (`pnpm format`). Match existing 2-space, double-quote style.
- File naming: React components/pages **PascalCase** (`Journal.tsx`); server modules **camelCase** (`brewJournal.ts`); shadcn primitives **kebab-case** (`alert-dialog.tsx`).
- `pnpm check` (`tsc --noEmit`) must pass — there is no separate ESLint config.

### Development Workflow
- Commands: `pnpm dev` (tsx watch, Express+Vite single origin, port 3000+), `pnpm build` (vite + esbuild), `pnpm db:push` (drizzle generate+migrate). App is single-origin → no CORS handling needed.
- Schema changes → edit `drizzle/schema.ts` → `pnpm db:push` (creates migration in `drizzle/`). Don't hand-edit generated SQL/snapshots.
- Git remote: `coffeeisafruit/coffee-connoisseur`, branch `main`. (No CI config in repo at scan time.)

### Critical Don't-Miss Rules (gotchas)
- **Storage/Maps/LLM go through the Forge proxy, NOT raw SDKs.** `@aws-sdk/*` is in `dependencies` and the README mentions AWS S3 / Google Maps / OpenAI keys, but the live path is `server/storage.ts` (upload), `server/_core/map.ts`, `server/_core/llm.ts` using `BUILT_IN_FORGE_API_URL` + `BUILT_IN_FORGE_API_KEY`. Do **not** wire raw AWS/Maps credentials without confirming intent.
- **`todo.md` is stale/contradictory** (Brew Journal shown unchecked though fully implemented). Don't treat it as ground truth — use `docs/` + code.
- **JSON-in-text columns:** `roasters.beanOrigins/roastStyles/specialties/hours` are JSON strings in `text` columns; `getRoastersByOrigin` uses `LIKE '%origin%'`. Parse/encode manually.
- **Denormalized ratings:** `roasters.averageRating`/`reviewCount` are recomputed by `updateRoasterRating()` after each review — keep them in sync on any review write path.
- **Photo upload flow:** `brewJournal.create` accepts base64 `photoData`, uploads via `storagePut` to `brew-photos/{userId}/...`; `brewJournal.update` does **not** handle photos. Express body limit is raised to 50mb for this.
- **Owner = admin:** `db.upsertUser` auto-grants `admin` role when `openId === OWNER_OPEN_ID`.
- **Secrets:** never hardcode; everything reads `server/_core/env.ts` (`ENV`). `VITE_*` vars are client-exposed by Vite — never put secrets in them.

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code in this repo.
- Follow ALL rules exactly; when in doubt, prefer the more restrictive option.
- Cross-reference [`docs/index.md`](../docs/index.md) for architecture/API/data detail.

**For Humans:**
- Keep this lean and agent-focused. Update when the stack or patterns change.
- Review periodically; remove rules that become obvious.

Last Updated: 2026-06-14

