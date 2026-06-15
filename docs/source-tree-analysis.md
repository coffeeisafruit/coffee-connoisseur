# Source Tree Analysis

> Annotated structure of the Coffee Connoisseur monorepo (excludes
> `node_modules/`, `dist/`, `_bmad*/`, `.claude/`).

```
coffee app/                      # repo root (git: coffeeisafruit/coffee-connoisseur)
├── client/                      # ── PART: client (web frontend) ──
│   ├── index.html               # Vite HTML entry
│   ├── public/                  # static assets (hero/coffee imagery)
│   └── src/
│       ├── main.tsx             # ★ entry: QueryClient + tRPC provider + auth-redirect wiring
│       ├── App.tsx              # ★ root: providers + wouter routes
│       ├── const.ts             # APP_TITLE/LOGO, getLoginUrl()
│       ├── index.css            # Tailwind + theme palette
│       ├── pages/               # route components (Home, Quiz, Profile, Journal, Roasters, NotFound, ComponentShowcase)
│       ├── components/
│       │   ├── ui/              # 60+ shadcn/Radix primitives
│       │   ├── AIChatBox.tsx    # AI assistant
│       │   ├── Map.tsx          # Google Maps view (Roasters)
│       │   └── DashboardLayout*, ErrorBoundary, ManusDialog
│       ├── contexts/ThemeContext.tsx
│       ├── hooks/               # useMobile, useComposition, usePersistFn
│       ├── _core/hooks/useAuth.ts   # platform auth hook
│       └── lib/{trpc,utils}.ts
│
├── server/                      # ── PART: server (backend API) ──
│   ├── _core/                   # platform infra (managed boundary)
│   │   ├── index.ts             # ★ entry: Express bootstrap + routes + Vite/static + port scan
│   │   ├── context.ts trpc.ts   # tRPC context + procedures (public/protected/admin)
│   │   ├── oauth.ts sdk.ts cookies.ts   # auth flow
│   │   ├── map.ts llm.ts voiceTranscription.ts imageGeneration.ts notification.ts  # Forge proxies
│   │   ├── env.ts               # ENV config object
│   │   └── vite.ts dataApi.ts systemRouter.ts
│   ├── routers.ts               # ★ root appRouter (auth, brewJournal, roasters, userProfile)
│   ├── db.ts                    # Drizzle instance + user upsert/query
│   ├── brewJournal.ts roasters.ts userProfile.ts   # feature data access
│   ├── storage.ts               # Forge object storage
│   └── *.test.ts                # vitest unit tests
│
├── shared/                      # ── cross-cutting ──
│   ├── const.ts                 # COOKIE_NAME, error messages, timeouts
│   ├── types.ts                 # re-exports schema types + errors
│   └── _core/errors.ts          # HttpError hierarchy
│
├── drizzle/                     # ── data layer ──
│   ├── schema.ts                # ★ 5 tables (users, brew_entries, user_profiles, roasters, roaster_reviews)
│   ├── relations.ts
│   ├── 0000–0002_*.sql + meta/  # migrations + snapshots
│   └── migrations/
│
├── scripts/seed-roasters.mjs    # seed sample roasters
├── patches/wouter@3.7.1.patch   # pnpm patched dep
├── docs/                        # ← this documentation set
├── package.json                 # scripts + deps (pnpm)
├── vite.config.ts               # root=client, aliases, Manus runtime plugin
├── drizzle.config.ts            # MySQL dialect, schema/out paths
├── tsconfig.json                # strict, path aliases
├── vitest.config.ts components.json tsconfig.node.json
├── README.md  todo.md           # (todo.md is stale — see project-overview)
```

## Entry Points (where to start reading)

| Concern | File |
|---------|------|
| Frontend bootstrap | `client/src/main.tsx` → `App.tsx` |
| Backend bootstrap | `server/_core/index.ts` |
| API surface | `server/routers.ts` |
| Database schema | `drizzle/schema.ts` |
| Shared contract | `shared/types.ts` |

## Critical Directories

- `server/_core/` — **platform-managed**; infra + Forge proxies. Avoid editing unless necessary.
- `client/src/components/ui/` — generated shadcn primitives; customize via Tailwind/CSS vars, not wholesale rewrites.
- `drizzle/` — schema changes here drive migrations (`pnpm db:push`) and propagate types app-wide.
