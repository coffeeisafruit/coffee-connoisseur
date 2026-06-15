# Component Inventory — Client

> Part: `client`. UI system: **shadcn (new-york) over Radix UI**, Tailwind 4.
> Config in [`components.json`](../components.json). Aliases: `@/components`,
> `@/components/ui`, `@/lib`, `@/hooks`.

## Application Components (`client/src/components/`)

| Component | Purpose |
|-----------|---------|
| `AIChatBox.tsx` | AI assistant chat surface (Forge LLM proxy via backend) |
| `Map.tsx` (`MapView`) | Google Maps view with roaster markers; used by Roasters page |
| `DashboardLayout.tsx` / `DashboardLayoutSkeleton.tsx` | App shell layout + loading skeleton |
| `ErrorBoundary.tsx` | Top-level React error boundary (wraps `App`) |
| `ManusDialog.tsx` | Platform dialog helper |

## Page Components (`client/src/pages/`)

| Page | Route | Notes |
|------|-------|-------|
| `Home.tsx` (397 LOC) | `/` | Marketing landing: hero, feature showcase, CTAs; `useAuth` for login state |
| `Quiz.tsx` (359 LOC) | `/quiz` | Multi-step palate quiz; RadioGroup + Progress; saves via `userProfile.save` |
| `Profile.tsx` (372 LOC) | `/profile` | Quiz-result profile + recommendations |
| `Journal.tsx` (498 LOC) | `/journal` | Brew CRUD with photo upload; Dialog forms, Select filters |
| `Roasters.tsx` (441 LOC) | `/roasters` | Map + roaster list + filters + review dialog |
| `NotFound.tsx` | `*` | 404 |
| `ComponentShowcase.tsx` | (dev) | UI primitive gallery |

## UI Primitives (`client/src/components/ui/`) — 60+

Categorized (shadcn-generated, Radix-backed):

- **Layout / containers:** card, sheet, sidebar, resizable, scroll-area, separator, aspect-ratio, drawer
- **Forms / inputs:** button, button-group, input, input-group, input-otp, textarea, label, field, form, checkbox, radio-group, select, switch, slider, toggle, toggle-group, calendar, react-day-picker
- **Overlays:** dialog, alert-dialog, popover, hover-card, tooltip, context-menu, dropdown-menu, menubar, command (cmdk)
- **Navigation:** navigation-menu, breadcrumb, pagination, tabs, accordion, collapsible
- **Feedback / display:** alert, badge, avatar, progress, skeleton, spinner, sonner (toast), empty, item, kbd, chart (recharts), carousel (embla), table

## Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAuth` | `_core/hooks/useAuth.ts` | auth state (`trpc.auth.me`), `logout`, optional redirect |
| `useMobile` | `hooks/useMobile.tsx` | responsive breakpoint detection |
| `useComposition` | `hooks/useComposition.ts` | IME composition handling for inputs |
| `usePersistFn` | `hooks/usePersistFn.ts` | stable function reference |
| `useTheme` | `contexts/ThemeContext.tsx` | light/dark theme access |

## Conventions

- Compose features from `ui/` primitives; keep primitives shadcn-standard.
- Class merging via `cn()` (`lib/utils.ts`, clsx + tailwind-merge).
- Icons from `lucide-react`; toasts via `sonner`; animation via `framer-motion`.
