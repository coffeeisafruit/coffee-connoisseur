# Data Models — Server

> Source of truth: [`drizzle/schema.ts`](../drizzle/schema.ts). Dialect: **MySQL**. ORM: **Drizzle**. Migrations in [`drizzle/`](../drizzle/) (`0000`–`0002`).

## Entity-Relationship Summary

```
users (1) ──< (N) brew_entries          # userId FK (app-level, not DB-enforced)
users (1) ──< (1) user_profiles         # userId UNIQUE
users (1) ──< (N) roaster_reviews       # userId FK
roasters (1) ──< (N) roaster_reviews    # roasterId FK
```

> ⚠️ Relations are **application-enforced**, not declared as SQL foreign keys in
> the schema. `userId` / `roasterId` columns are plain `int` without `references()`.
> Ownership is checked in code (e.g. `getBrewEntryById(entryId, userId)`).

## Tables

### `users`
Backs the OAuth auth flow. One row per Manus `openId`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | int PK auto-increment | surrogate key, used for relations |
| `openId` | varchar(64) NOT NULL UNIQUE | Manus OAuth identifier |
| `name` | text | |
| `email` | varchar(320) | |
| `loginMethod` | varchar(64) | |
| `role` | enum(`user`,`admin`) default `user` NOT NULL | `admin` auto-assigned if `openId == OWNER_OPEN_ID` |
| `createdAt` / `updatedAt` / `lastSignedIn` | timestamp | `updatedAt` uses `onUpdateNow()` |

### `brew_entries`
A user's brewing experiments with parameters, rating, notes, and an optional photo.

| Column | Type | Notes |
|--------|------|-------|
| `id` | int PK | |
| `userId` | int NOT NULL | owner (app-enforced) |
| `date` | timestamp default now | brew date |
| `beanName` | varchar(255) NOT NULL | |
| `origin` | varchar(255) NOT NULL | |
| `roastLevel` | enum(`light`,`medium`,`medium_dark`,`dark`) NOT NULL | |
| `grindSize` | enum(`extra_fine`,`fine`,`medium`,`coarse`) NOT NULL | |
| `brewMethod` | enum(`pour_over`,`french_press`,`aeropress`,`espresso`,`drip`,`cold_brew`) NOT NULL | |
| `waterTemp`,`brewTime`,`coffeeAmount`,`waterAmount` | varchar(50) | free-text params |
| `rating` | int NOT NULL default 0 | 0–5 (zod-validated at API) |
| `tastingNotes`,`observations` | text | |
| `photoUrl`,`photoKey` | text | set after Forge storage upload |
| `createdAt`/`updatedAt` | timestamp | |

### `user_profiles`
Palate-quiz results — exactly one per user (`userId` UNIQUE → upsert semantics).

| Column | Type | Notes |
|--------|------|-------|
| `id` | int PK | |
| `userId` | int NOT NULL UNIQUE | one profile per user |
| `flavorPreference`,`roastPreference`,`tasteSensitivity`,`acidityPreference`,`brewingMethod`,`originInterest`,`sweetnessLevel`,`bodyPreference` | varchar(100) | raw quiz answers |
| `profileType` | varchar(255) | generated profile label |
| `profileDescription` | text | generated narrative |
| `createdAt`/`updatedAt` | timestamp | |

### `roasters`
Local coffee roasters shown on the map. Seeded via [`scripts/seed-roasters.mjs`](../scripts/seed-roasters.mjs).

| Column | Type | Notes |
|--------|------|-------|
| `id` | int PK | |
| `name` | varchar(255) NOT NULL | |
| `description` | text | |
| `address`,`city`,`country` | varchar NOT NULL | `state`,`zipCode` optional |
| `latitude`,`longitude` | varchar(50) NOT NULL | stored as strings |
| `phone`,`email`,`website` | varchar | contact |
| `beanOrigins`,`roastStyles`,`specialties`,`hours` | text | **JSON-encoded strings** (not native JSON columns) |
| `logoUrl`,`photoUrl` | text | |
| `averageRating` | int default 0 | recomputed on each new review (rounded mean) |
| `reviewCount` | int default 0 | |

### `roaster_reviews`
User reviews of roasters. One review per (roaster, user) — enforced in code via `hasUserReviewed`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | int PK | |
| `roasterId` | int NOT NULL | |
| `userId` | int NOT NULL | |
| `rating` | int NOT NULL | 1–5 (zod-validated) |
| `title` | varchar(255) | |
| `review` | text | |
| `beansPurchased` | varchar(255) | |
| `visitDate` | timestamp | |
| `helpfulCount` | int default 0 | not yet writable via API |
| `createdAt`/`updatedAt` | timestamp | |

## Data-Layer Conventions & Gotchas

- **DB is lazy & optional.** `getDb()` (`server/db.ts`) returns `null` if
  `DATABASE_URL` is unset, so tooling/tests can run without MySQL. Feature
  modules throw `"Database not available"`; `db.ts` helpers warn and no-op.
- **JSON-in-text columns.** `roasters.beanOrigins/roastStyles/specialties/hours`
  hold JSON strings; `getRoastersByOrigin` does a `LIKE '%origin%'` substring
  match against the raw text, not a structured query.
- **Rating denormalization.** `roasters.averageRating`/`reviewCount` are
  recomputed and written by `updateRoasterRating()` after each review insert.
- **Migrations** live in `drizzle/0000–0002_*.sql` with snapshots in
  `drizzle/meta/`. Apply with `pnpm db:push` (generate + migrate).
