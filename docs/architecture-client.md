# Architecture — Client (Web Frontend)

> Part: `client` · Type: `web` · Entry point: [`client/src/main.tsx`](../client/src/main.tsx) · Root: [`client/src/App.tsx`](../client/src/App.tsx)

## Executive Summary

A React 19 SPA built with Vite. Routing is handled by **wouter** (lightweight),
server state by **TanStack Query** wired through **tRPC's React Query adapter**
for fully typed, codegen-free API calls. UI is composed from **shadcn/Radix**
primitives styled with Tailwind CSS 4. There is no Redux/global store — server
state lives in React Query; the only React Context is theming.

## Technology Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| Framework | React | ^19.1 | |
| Build | Vite | ^7.1 | root = `client/`, output `dist/public` |
| Language | TypeScript | 5.9 | strict; path aliases `@/*`, `@shared/*` |
| Routing | wouter | ^3.3 (patched 3.7.1) | `<Switch>`/`<Route>` in `App.tsx` |
| Server state | TanStack Query | ^5.90 | `QueryClient` in `main.tsx` |
| API client | @trpc/react-query | ^11.6 | `trpc` from `lib/trpc.ts`, httpBatchLink → `/api/trpc` |
| UI primitives | Radix UI + shadcn (new-york) | — | 60+ components in `components/ui/` |
| Styling | Tailwind CSS 4 + `tw-animate-css` | — | CSS vars, `index.css` |
| Animation | framer-motion | ^12 | |
| Forms | react-hook-form + zod | — | |
| Misc | sonner (toasts), lucide-react (icons), recharts, embla-carousel, date-fns | — | |

## Application Structure

```
client/src/
├── main.tsx            # Bootstrap: QueryClient + tRPC provider + global error→login redirect
├── App.tsx             # ErrorBoundary → ThemeProvider → TooltipProvider → wouter Router
├── const.ts            # APP_TITLE, APP_LOGO, getLoginUrl() (OAuth portal URL builder)
├── index.css           # Tailwind layer + theme color palette
├── pages/              # Route components: Home, Quiz, Profile, Journal, Roasters, NotFound, ComponentShowcase
├── components/
│   ├── ui/             # shadcn/Radix primitives (button, card, dialog, ...)
│   ├── AIChatBox.tsx   # AI assistant chat
│   ├── Map.tsx         # Google Maps view (MapView) for Roasters
│   ├── DashboardLayout(.Skeleton).tsx, ErrorBoundary.tsx, ManusDialog.tsx
├── contexts/ThemeContext.tsx   # light/dark theme (default light, optionally switchable)
├── hooks/              # useMobile, useComposition, usePersistFn
├── _core/hooks/useAuth.ts      # auth state via trpc.auth.me + logout
└── lib/{trpc,utils}.ts # tRPC react client; cn() classname helper
```

## Routing

`App.tsx` defines 5 app routes + fallback (wouter):

| Path | Page | Auth gate |
|------|------|-----------|
| `/` | Home (landing) | none (shows login CTA via `useAuth`) |
| `/quiz` | Quiz | uses `useAuth` |
| `/profile` | Profile | uses `useAuth` |
| `/journal` | Journal | uses `useAuth` |
| `/roasters` | Roasters | public list, protected review submit |
| `*` | NotFound | — |

> Routes are **not** wrapped in a route-level auth guard; pages call `useAuth()`
> and the global query-error handler in `main.tsx` redirects to the OAuth portal
> when any request returns `UNAUTHED_ERR_MSG`.

## State Management

- **Server state:** TanStack Query via tRPC hooks (`trpc.brewJournal.list.useQuery()` etc.). Cache invalidation through `trpc.useUtils()`.
- **Auth:** `useAuth()` wraps `trpc.auth.me` (cached, no retry) and `auth.logout`; mirrors user info into `localStorage` (`manus-runtime-user-info`).
- **Theme:** `ThemeContext` (light/dark, toggles `dark` class on `<html>`).
- **No Redux/Zustand/MobX.**

## Auth & API Flow (client side)

1. `getLoginUrl()` (`const.ts`) builds the Manus OAuth portal URL with `appId`, `redirectUri = origin + /api/oauth/callback`, base64 `state`.
2. On any query/mutation error equal to `UNAUTHED_ERR_MSG`, `main.tsx` redirects `window.location` to that login URL.
3. All tRPC requests use `credentials: "include"` so the `app_session_id` cookie flows.

## UI System

shadcn "new-york" style over Radix, configured in `components.json` (aliases
`@/components`, `@/components/ui`, `@/lib`, `@/hooks`). Base color neutral; CSS
variables for theming. See [Component Inventory](./component-inventory-client.md).
