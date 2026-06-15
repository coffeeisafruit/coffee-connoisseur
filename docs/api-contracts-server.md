# API Contracts — Server

> Transport: **tRPC 11** mounted at **`/api/trpc`** (Express adapter), superjson
> transformer. Root router: [`server/routers.ts`](../server/routers.ts), type
> `AppRouter`. The client imports `AppRouter` as a **type only** — full end-to-end
> type safety, no codegen.

## Procedure Auth Levels

Defined in [`server/_core/trpc.ts`](../server/_core/trpc.ts):

- `publicProcedure` — no auth; `ctx.user` may be `null`.
- `protectedProcedure` — requires `ctx.user`, else `TRPCError UNAUTHORIZED` (`"Please login (10001)"`).
- `adminProcedure` — requires `ctx.user.role === 'admin'`, else `FORBIDDEN` (defined but not yet used by feature routers).

Auth context is built in [`server/_core/context.ts`](../server/_core/context.ts) via
`sdk.authenticateRequest(req)` (reads the session cookie). Failures resolve to
`user = null` (auth is optional at the context layer; procedures enforce it).

## Router Map

### `system` — platform/system router
From `server/_core/systemRouter.ts` (Manus template-provided).

### `auth`
| Procedure | Type | Auth | Input | Returns |
|-----------|------|------|-------|---------|
| `auth.me` | query | public | — | `User \| null` |
| `auth.logout` | mutation | public | — | `{ success: true }` (clears session cookie) |

> Login is **not** a tRPC procedure — it's the OAuth redirect flow:
> client builds the portal URL (`getLoginUrl()`), provider redirects to
> `GET /api/oauth/callback` (`server/_core/oauth.ts`), which upserts the user,
> mints a session token, sets the `app_session_id` cookie, and 302-redirects to `/`.

### `brewJournal` (all `protected`)
| Procedure | Type | Input | Returns |
|-----------|------|-------|---------|
| `brewJournal.list` | query | `{ brewMethod?: string }?` | `BrewEntry[]` (filtered by method unless `"all"`) |
| `brewJournal.get` | query | `{ id: number }` | `BrewEntry \| null` (ownership-checked) |
| `brewJournal.create` | mutation | full entry incl. enums + `photoData?` (base64) | `{ id, photoUrl? }` |
| `brewJournal.update` | mutation | `{ id }` + partial fields | `{ success: true }` |
| `brewJournal.delete` | mutation | `{ id: number }` | `{ success: true }` |

Photo handling: `create` decodes base64 `photoData`, uploads to Forge storage
under `brew-photos/{userId}/{ts}-{rand}.jpg` via `storagePut`, stores
`photoUrl`/`photoKey`. (Note: `update` does not currently re-upload photos.)

### `roasters`
| Procedure | Type | Auth | Input | Returns |
|-----------|------|------|-------|---------|
| `roasters.list` | query | public | `{ origin?, minRating? }?` | `Roaster[]` |
| `roasters.get` | query | public | `{ id }` | `Roaster \| null` |
| `roasters.reviews` | query | public | `{ roasterId }` | `RoasterReview[]` |
| `roasters.addReview` | mutation | protected | `{ roasterId, rating 1–5, title?, review?, beansPurchased?, visitDate? }` | `{ id }` |

`addReview` rejects duplicates (`"You have already reviewed this roaster"`) and
triggers `updateRoasterRating` to recompute the roaster's average.

### `userProfile` (all `protected`)
| Procedure | Type | Input | Returns |
|-----------|------|-------|---------|
| `userProfile.get` | query | — | `UserProfile \| null` |
| `userProfile.save` | mutation | 10 optional string fields (quiz answers + generated profile) | `{ id }` (upsert by `userId`) |

## Error Conventions

- Auth errors thrown as `TRPCError` with messages from `shared/const.ts`
  (`UNAUTHED_ERR_MSG`, `NOT_ADMIN_ERR_MSG`). The client matches
  `UNAUTHED_ERR_MSG` exactly in `main.tsx` to trigger a login redirect.
- Domain errors thrown as plain `Error` (e.g. duplicate review) → surfaced as
  tRPC `INTERNAL_SERVER_ERROR`.
- `shared/_core/errors.ts` provides an `HttpError` hierarchy (`BadRequestError`,
  etc.) available for REST-style handlers, though tRPC procedures currently
  throw `TRPCError`/`Error`.
