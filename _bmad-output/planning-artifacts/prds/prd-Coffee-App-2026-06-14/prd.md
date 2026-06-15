---
title: Coffee Connoisseur
status: final
created: 2026-06-14
updated: 2026-06-14
---

# PRD: Coffee Connoisseur
*Working title — confirm.*

## 0. Document Purpose

This is a **brownfield PRD** for an already-shipped application. It serves two audiences: (1) PMs/stakeholders who need a single source of truth for what Coffee Connoisseur *is*, and (2) the downstream BMad workflows (UX, architecture, epics/stories, dev) that need stable, referenceable requirements. It is reverse-engineered from the codebase and the `document-project` deep scan — see [`docs/index.md`](../../../../docs/index.md) and [`project-context.md`](../../../project-context.md); it does not duplicate them. Vocabulary is Glossary-anchored; features are grouped with globally-numbered FRs nested; inline `[ASSUMPTION]` tags mark inferences and are indexed in §9. The document captures the **as-built baseline** (§4.1–§4.6) and the **active hardening backlog** (§4.7) — the evidence-based gaps the scan surfaced, which are this iteration's real work.

## 1. Vision

Coffee Connoisseur is a full-stack web app for coffee enthusiasts to **discover, track, and perfect their brewing** — *"For the Connoisseur, Not the Snob."* It turns the scattered, tribal-knowledge experience of dialing in coffee into a structured, personal practice: a journal that remembers every brew and its result, a palate quiz that names your preferences, and a map that connects you to local roasters and the community's reviews.

It matters because coffee improvement is currently lossy — people forget what grind/ratio/temperature produced a great cup, repeat mistakes, and lack a trusted, personalized starting point. Coffee Connoisseur makes each brew a recorded experiment and each preference an explicit profile, so getting better is cumulative rather than accidental.

This iteration does not change the product's vision. Its goal is to make the shipped product **complete and trustworthy** — closing the gaps between documentation and behavior, and hardening the rough edges the build left behind — so future feature work stands on solid ground.

## 2. Target User

### 2.1 Jobs To Be Done
- **Functional:** "Record what I brewed and how it tasted so I can reproduce the good cups and stop repeating the bad ones."
- **Functional:** "Tell me where to start with a new bean/method based on my actual palate, not generic advice."
- **Social/contextual:** "Find and vouch for local roasters; see what other enthusiasts think before I buy."
- **Emotional:** "Feel like a competent, improving home barista — not an intimidated beginner or a gatekept 'snob.'"

### 2.2 Non-Users (v1)
- Commercial café operations / inventory management (this is a personal practice tool, not POS/back-office).
- Coffee e-commerce buyers (no purchasing/checkout in scope).

### 2.3 Key User Journeys

- **UJ-1. Maya logs a brew before the cup goes cold.**
  - **Persona + context:** Maya, a weekend home barista dialing in a new Ethiopian pour-over, wants to remember today's exact setup.
  - **Entry state:** Authenticated via Manus OAuth session; on `/journal`.
  - **Path:** Taps "Add entry" → fills bean/origin, roast level, grind size, brew method, water temp, ratio, rating, tasting notes → optionally snaps a photo of the setup → saves.
  - **Climax:** The entry appears at the top of her journal with its photo and a star rating; the cup is now a repeatable record.
  - **Resolution:** Next week she filters by `pour_over`, sees what worked, and adjusts one variable. **Edge case:** if the DB is unavailable she gets a clear error rather than a silent loss.

- **UJ-2. Sam discovers his palate in five questions.**
  - Sam, new to specialty coffee, takes the multi-step Palate Quiz; the app saves his answers and shows a named profile + recommendations he can return to on `/profile`.

- **UJ-3. Priya finds and reviews a local roaster.**
  - Priya opens `/roasters`, sees roasters on a Google Map, filters by bean origin, opens one, reads community reviews, and (once signed in) leaves her own — which updates the roaster's average rating.

## 3. Glossary

- **Brew Entry** — One recorded brewing session owned by a User. Has bean info, brew parameters, a 0–5 Rating, notes, and an optional Photo. (DB: `brew_entries`.)
- **Palate Profile** — Exactly one per User. The saved quiz answers plus a generated `profileType`/`profileDescription`. (DB: `user_profiles`, `userId` unique.)
- **Roaster** — A coffee roaster business shown on the Roaster Map, with location, contact, JSON-encoded attributes, and denormalized rating aggregates. (DB: `roasters`.)
- **Roaster Review** — One User's review of one Roaster (one per User per Roaster), 1–5 stars with optional text. (DB: `roaster_reviews`.)
- **User** — An authenticated person identified by Manus OAuth `openId`; role `user` or `admin`. (DB: `users`.)
- **Forge Proxy** — The Manus platform API gateway (`BUILT_IN_FORGE_API_URL` + key) through which the server reaches object storage, Google Maps, and the LLM.
- **Palate Quiz** — The multi-step questionnaire that produces a Palate Profile.
- **Rating** — Integer score; Brew Entry 0–5, Roaster Review 1–5.

## 4. Features

### 4.1 Authentication & Session
**Description:** Users sign in via Manus-platform OAuth. The client builds the portal URL (`getLoginUrl()`); the provider redirects to `GET /api/oauth/callback`, which upserts the User and sets an `app_session_id` cookie. The session flows on every tRPC call (`credentials: "include"`). Any API error equal to `UNAUTHED_ERR_MSG` triggers a client redirect to login. Realizes the auth precondition of UJ-1, UJ-3.

**Functional Requirements:**

#### FR-1: OAuth sign-in
A visitor can authenticate via the Manus OAuth flow and receive a session cookie.
**Consequences (testable):**
- Successful callback upserts a row in `users` keyed by `openId` and sets `app_session_id`.
- `openId === OWNER_OPEN_ID` is assigned `role = admin`.

#### FR-2: Session identity & logout
An authenticated User's identity is available to procedures as `ctx.user`; the User can log out.
**Consequences (testable):**
- `auth.me` returns the User when the cookie is valid, else `null`.
- `auth.logout` clears the cookie and returns `{ success: true }`.

#### FR-3: Authorization tiers
The system distinguishes public, authenticated, and admin access at the procedure level.
**Consequences (testable):**
- `protectedProcedure` throws `UNAUTHORIZED` (`"Please login (10001)"`) without a user.
- `adminProcedure` throws `FORBIDDEN` for non-admins.

### 4.2 Brew Journal
**Description:** Authenticated Users create, read, update, delete, and filter Brew Entries; create supports a base64 Photo uploaded to Forge storage. Ownership is enforced per query. Realizes UJ-1.

**Functional Requirements:**

#### FR-4: Create brew entry (with optional photo)
A User can create a Brew Entry with bean/brew parameters, a Rating (0–5), notes, and an optional Photo.
**Consequences (testable):**
- Validated enums: roastLevel, grindSize, brewMethod (zod).
- If `photoData` is provided, it is uploaded to `brew-photos/{userId}/...` via Forge storage and `photoUrl`/`photoKey` persist.
- Returns `{ id, photoUrl? }`.

#### FR-5: List / filter brew entries
A User can list their Brew Entries, optionally filtered by brew method.
**Consequences (testable):**
- Returns only the requesting User's entries, ordered by date desc.
- `brewMethod` filter applies unless value is `"all"`/absent.

#### FR-6: Read / update / delete brew entry (ownership-checked)
A User can fetch, edit, or delete one of *their own* Brew Entries.
**Consequences (testable):**
- `get`/`update`/`delete` scope by `(id, userId)`; another user's id yields null / no-op.
**Out of Scope:**
- `update` does **not** currently re-upload or replace photos (see FR-13).

### 4.3 Palate Quiz & Profile
**Description:** A User completes the multi-step Palate Quiz; answers and a generated profile are saved as their single Palate Profile and displayed on `/profile`. Realizes UJ-2.

**Functional Requirements:**

#### FR-7: Save palate profile (upsert)
A User can save quiz answers + generated profile; saving again updates the same Palate Profile.
**Consequences (testable):**
- `user_profiles.userId` is unique; `save` upserts by user.

#### FR-8: Retrieve palate profile
A User can retrieve their Palate Profile.
**Consequences (testable):**
- `userProfile.get` returns the profile or `null`.

### 4.4 Roaster Map & Discovery
**Description:** Anyone can browse Roasters on a Google Map (via Forge Maps), view detail, and filter by origin or minimum rating. Realizes UJ-3.

**Functional Requirements:**

#### FR-9: List / filter roasters (public)
A visitor can list Roasters, optionally filtered by bean origin or minimum rating.
**Consequences (testable):**
- `origin` filter does a substring match against JSON-encoded `beanOrigins`.
- `minRating` filters on denormalized `averageRating`.

#### FR-10: Roaster detail (public)
A visitor can retrieve a single Roaster by id.

### 4.5 Roaster Reviews
**Description:** Authenticated Users review Roasters (one review per Roaster), which recomputes the Roaster's rating aggregates. Reviews are publicly readable. Realizes UJ-3.

**Functional Requirements:**

#### FR-11: Submit roaster review (one per user)
A User can submit a 1–5 Rating with optional title/text for a Roaster they haven't reviewed.
**Consequences (testable):**
- Duplicate review by same User is rejected (`"You have already reviewed this roaster"`).
- On insert, `roasters.averageRating` (rounded mean) and `reviewCount` are recomputed.

#### FR-12: Read roaster reviews (public)
A visitor can read all reviews for a Roaster.

### 4.6 AI Chat Assistant
**Description:** An `AIChatBox` surfaces an LLM assistant (via Forge LLM proxy) for coffee guidance.

**Functional Requirements:**

#### FR-AI-1: Coffee assistant chat *(as-built; behavior thinly specified in code)*
A User can ask the assistant coffee questions and receive responses via the Forge LLM proxy.
**Notes:** `[NOTE FOR PM]` Chat scope/guardrails are not defined in code; treat as experimental until specified.

### 4.7 Hardening & Reconciliation *(this iteration's active backlog)*
**Description:** Evidence-based fixes that make the shipped product trustworthy. Each FR maps to a concrete finding from the deep scan. These are the FRs the dev-cycle will implement.

**Functional Requirements:**

#### FR-13: Photo edit on brew update
A User can change/remove a Brew Entry's Photo when updating it.
**Consequences (testable):**
- `brewJournal.update` accepts `photoData`, uploads via Forge, updates `photoUrl`/`photoKey`; removal clears them.

#### FR-14: Route-level auth guards
Pages requiring a User redirect unauthenticated visitors deterministically (not only via failed-request side-effects).
**Consequences (testable):**
- `/journal`, `/profile`, `/quiz` enforce auth at the route boundary; unauthenticated visitor is redirected to login before data calls fire.

#### FR-15: Mark a review helpful
A User can mark a Roaster Review helpful, incrementing `helpfulCount`.
**Consequences (testable):**
- A `roasters`/reviews procedure increments `helpful_count`; not double-counted per User. `[ASSUMPTION: one helpful vote per user per review]`

#### FR-16: Storage/docs reconciliation
Documentation and dependencies reflect the *actual* storage/maps/LLM path (Forge proxy), removing the AWS-S3/raw-key contradiction.
**Consequences (testable):**
- README + env docs describe Forge vars; unused `@aws-sdk/*` either removed or justified in docs.

#### FR-17: Source-of-truth task tracking
`todo.md` no longer contradicts the code (Brew Journal shown complete), or is replaced by the BMad backlog.

#### FR-18: CI quality gate
Pushes run typecheck + tests automatically.
**Consequences (testable):**
- A CI workflow runs `pnpm check` and `pnpm test` on PRs to `main`. `[ASSUMPTION: GitHub Actions is the CI target]`

**Feature-specific NFRs:**
- FR-13/FR-15 must preserve existing ownership and one-per-user invariants.

## 5. Non-Goals (Explicit)
- Not adding new end-user product surfaces this iteration (no new pages beyond what hardening requires).
- Not introducing DB-level foreign keys / a schema migration framework change unless a hardening FR strictly requires it `[NON-GOAL for MVP]`.
- Not building café/commerce features, payments, or native mobile apps.
- Not redesigning auth away from Manus OAuth.

## 6. MVP Scope

### 6.1 In Scope (this iteration)
- FR-13 through FR-18 (the Hardening & Reconciliation backlog).
- The as-built baseline (FR-1–FR-12, FR-AI-1) is documented and treated as the regression surface to protect.

### 6.2 Out of Scope for MVP
- New consumer features hinted in `todo.md` (bean cellar/inventory, seasonal recommendations, gamification/badges, Discord/community) — deferred to a future PRD. `[NOTE FOR PM]` Several are emotionally load-bearing to the "connoisseur journey"; revisit next cycle.
- AI Chat productization (guardrails, scope) — deferred pending FR-AI-1 specification.

## 7. Success Metrics

**Primary**
- **SM-1**: Behavior/documentation parity — zero known doc/code contradictions remain after this iteration. Validates FR-16, FR-17.
- **SM-2**: Brew Journal completeness — a User can fully manage an entry *including its photo* end-to-end. Validates FR-13.

**Secondary**
- **SM-3**: Auth robustness — protected pages never render data for unauthenticated visitors. Validates FR-14.
- **SM-4**: Quality gate — main is protected by automated typecheck + tests. Validates FR-18.

**Counter-metrics (do not optimize)**
- **SM-C1**: Scope creep — number of *new* end-user features added this iteration should stay at **0** (hardening, not expansion). Counterbalances the temptation to "just add" the deferred todo.md features.
- **SM-C2**: Regression count in baseline FR-1–FR-12 should be 0 — don't trade hardening for broken shipped behavior. Counterbalances SM-2/SM-3.

## 8. Open Questions
1. Is GitHub Actions the intended CI target, or another platform? (affects FR-18)
2. Should unused `@aws-sdk/*` deps be removed, or is a real S3 path planned? (affects FR-16)
3. Should `helpfulCount` votes be tracked per-user (needs a table) or be a simple counter? (affects FR-15)
4. What are the intended guardrails/scope for the AI Chat assistant? (affects FR-AI-1)
5. Are the deferred `todo.md` features (cellar, seasonal, gamification) on the near roadmap? (affects next PRD)

## 9. Assumptions Index
- §4.7 FR-15 — one helpful vote per user per review.
- §4.7 FR-18 — GitHub Actions is the CI target.
- §0 — product brand is "Coffee Connoisseur" though config `project_name` is "Coffee App".
- §4.6 — AI Chat is experimental/as-built; no defined product spec.

---

## Adapt-In: Platform
Web app (SPA). React 19 + Vite client served single-origin by the Express server; no native or PWA target in scope.

## Adapt-In: Information Architecture
Top-level surfaces (wouter routes): `/` (landing), `/quiz`, `/profile`, `/journal`, `/roasters`, `*` (404). AI Chat is an embedded component, not a route.

## Adapt-In: Cross-Cutting NFRs
- **Type safety:** end-to-end via tRPC type-only import; DB types originate in `drizzle/schema.ts`.
- **Resilience:** DB is lazy/optional (`getDb()` may be null); features degrade with explicit errors, tests run DB-less.
- **Security:** secrets only via `server/_core/env.ts`; never in `VITE_*`. Ownership checked in queries (no DB FKs).
- **Single-origin serving:** no CORS surface; OAuth `redirectUri` must be registered per origin.

## Adapt-In: Integration & Dependencies
- **Manus OAuth / SDK** — identity (`server/_core/sdk.ts`, `oauth.ts`).
- **Forge Proxy** — object storage (brew photos), Google Maps (roaster map), OpenAI-compatible LLM (AI chat). Credentials injected by platform; the app holds no raw vendor keys.
- **MySQL** via Drizzle — the system of record (5 tables).
