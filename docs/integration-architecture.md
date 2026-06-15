# Integration Architecture

> How the `client` and `server` parts communicate, and how the backend reaches
> external services.

## Part-to-Part: Client ↔ Server

| From | To | Mechanism | Details |
|------|----|-----------|---------|
| `client` | `server` | **tRPC over HTTP** | `httpBatchLink` → `POST /api/trpc/*`, superjson-encoded, `credentials: "include"` |
| `client` | `server` | **type import** | `client/src/lib/trpc.ts` imports `AppRouter` as a *type* from `server/routers.ts` → compile-time contract, zero runtime coupling / no codegen |
| browser | `server` | **OAuth redirect** | `GET /api/oauth/callback?code&state` sets session cookie, 302 → `/` |
| `client` & `server` | `shared/` | **shared module** | constants (`COOKIE_NAME`, error messages) and types (`export type * from drizzle/schema`) imported via `@shared/*` alias |

The single shared type boundary is the Drizzle schema: DB row types
(`User`, `BrewEntry`, `Roaster`, ...) flow schema → server → (as tRPC output
types) → client, giving end-to-end type safety from database to React component.

### Dev vs Prod serving topology
- **Development:** one process. Express embeds Vite as middleware
  (`setupVite`), so client and API share an origin on the auto-selected port.
- **Production:** `vite build` emits `dist/public`; esbuild bundles the server
  to `dist/index.js`; `serveStatic` serves the built client from the same
  Express app. Still single-origin → no CORS needed.

## Server → External Services (Manus "Forge" proxy)

All external calls go through the platform Forge proxy using
`BUILT_IN_FORGE_API_URL` + bearer `BUILT_IN_FORGE_API_KEY` (injected by the
Manus platform). The app does **not** hold raw vendor credentials.

| Capability | Module | Used by |
|-----------|--------|---------|
| Object storage (photo upload/download) | `server/storage.ts` | `brewJournal.create` (brew photos) |
| Google Maps | `server/_core/map.ts` | Roaster map / geocoding |
| LLM (OpenAI-compatible) | `server/_core/llm.ts` | `AIChatBox` assistant |
| Voice transcription | `server/_core/voiceTranscription.ts` | (available) |
| Image generation | `server/_core/imageGeneration.ts` | (available) |
| OAuth / identity | `server/_core/sdk.ts` + `oauth.ts` | auth flow |

> ⚠️ **README drift:** the README lists "AWS S3" and "Google Maps API key" as
> direct prerequisites, and `@aws-sdk/*` is in `dependencies`, but the live code
> path uses the Forge storage/maps proxy. When planning changes, confirm which
> path is actually wired before adding raw AWS/Maps credentials.

## Data Flow Example — "Log a brew with a photo"

```
Journal.tsx (form)
  → trpc.brewJournal.create.useMutation({ ...fields, photoData: base64 })
  → POST /api/trpc/brewJournal.create  (cookie: app_session_id)
  → protectedProcedure → ctx.user resolved from session
  → routers.ts: decode base64 → storagePut(brew-photos/{userId}/...) → Forge storage → photoUrl
  → brewJournalDb.createBrewEntry({...entry, userId, photoUrl, photoKey})
  → Drizzle INSERT into brew_entries (MySQL)
  → returns { id, photoUrl } → React Query cache → UI updates
```

## Integration Points Summary

```
[ Browser SPA ] --tRPC/HTTP+cookie--> [ Express+tRPC ] --Drizzle--> [ MySQL ]
       |                                     |
       |--OAuth redirect-->/api/oauth/callback
                                             |--Forge proxy--> [ Storage / Maps / LLM / Voice / Image ]
                                             |--Manus SDK----> [ OAuth identity provider ]
```
