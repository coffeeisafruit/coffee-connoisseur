---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-Coffee-App-2026-06-14/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-designs/ux-Coffee-App-2026-06-14/EXPERIENCE.md
  - _bmad-output/project-context.md
status: 'final'
---

# Coffee Connoisseur - Epic Breakdown

## Overview

Decomposes the **hardening backlog** (PRD §4.7, FR-13–FR-18) into implementable
stories with testable acceptance criteria for the Dev agent. The as-built
baseline (FR-1–FR-12, FR-AI-1) is **already shipped** — it is the regression
surface to protect (PRD SM-C2), not new work. Architecture decisions in
[`architecture.md`](./architecture.md) are binding.

## Requirements Inventory

### Functional Requirements (this iteration)
- **FR-13** Photo edit on brew update
- **FR-14** Route-level auth guards
- **FR-15** Mark a review helpful (one per user)
- **FR-16** Storage/docs reconciliation (Forge vs AWS)
- **FR-17** Source-of-truth task tracking
- **FR-18** CI quality gate

### NonFunctional Requirements
- Preserve type-safety, DB-optional resilience, secrets-in-ENV, app-enforced ownership, single-origin (PRD Cross-Cutting NFRs).
- No regression in baseline FR-1–FR-12 (SM-C2). No new product surfaces (SM-C1).

### UX Design Requirements
- EXPERIENCE.md KF-1 (photo replace), KF-2 (auth redirect, no data-flash), KF-3 (optimistic helpful vote, no double-count). New icon buttons require `aria-label`.

### FR Coverage Map
| FR | Epic.Story | Type |
|----|-----------|------|
| FR-13 | 1.1 | code (server+client) |
| FR-14 | 2.1 | code (client) |
| FR-15 | 3.1, 3.2 | code (schema+server+client) |
| FR-16 | 4.1 | docs+deps |
| FR-17 | 4.2 | docs |
| FR-18 | 4.3 | infra |

## Epic List
1. **Trustworthy Brew Journal** — finish the journal's edit flow (photos).
2. **Reliable Access Control** — protected pages enforce auth at the boundary.
3. **Community Signal: Helpful Reviews** — let users vouch for useful reviews.
4. **Engineering Trust & Hygiene** — reconcile docs/deps, fix tracking, add CI.

---

## Epic 1: Trustworthy Brew Journal

Make the Brew Journal's edit experience complete so a user can fully manage an entry, including its photo (PRD SM-2).

### Story 1.1: Edit or remove a brew entry's photo
As a coffee enthusiast,
I want to change or remove the photo on an existing brew entry,
So that my journal stays accurate when I retake or drop a photo.

**Acceptance Criteria:**

**Given** I am authenticated and editing one of my brew entries
**When** I attach a new photo and save
**Then** the new image uploads via Forge storage to `brew-photos/{userId}/...`
**And** the entry's `photoUrl`/`photoKey` update to the new image
**And** ownership is still enforced by `(id, userId)`.

**Given** I am editing an entry that has a photo
**When** I choose Remove photo and save
**Then** the entry's `photoUrl` and `photoKey` are cleared.

**Given** the photo upload fails
**When** I save
**Then** the edit dialog stays open with an inline error
**And** the entry's original photo is unchanged.

**Notes:** Forge has no delete helper — the previous object is orphaned (accepted, documented in architecture.md §3 FR-13).

---

## Epic 2: Reliable Access Control

Protected pages must redirect unauthenticated visitors at the route boundary, with no data-flash or failed-request side-effects (PRD SM-3, EXPERIENCE.md KF-2).

### Story 2.1: Guard protected routes
As a logged-out visitor,
I want to be sent to login before a protected page tries to load my data,
So that I never see an empty/broken page or trigger errors.

**Acceptance Criteria:**

**Given** I am not authenticated
**When** I navigate to `/journal`, `/profile`, or `/quiz`
**Then** I am redirected to the OAuth login before any tRPC data request fires
**And** no "unauthorized" error is logged from those pages.

**Given** I am authenticated
**When** I navigate to a protected route
**Then** the page renders normally with no extra redirect.

**Given** I am on the login redirect path
**When** the guard evaluates
**Then** it does not loop (reuses `useAuth`'s existing `pathname === redirectPath` guard).

**Implementation:** new `client/src/components/RequireAuth.tsx` wrapping routes in `App.tsx`; server `protectedProcedure` remains source of truth.

---

## Epic 3: Community Signal: Helpful Reviews

Let users mark roaster reviews helpful, once each, so quality reviews surface (PRD FR-15, EXPERIENCE.md KF-3).

### Story 3.1: Persist helpful votes (schema + API)
As the system,
I want to record one helpful vote per user per review,
So that `helpfulCount` is trustworthy and not double-counted.

**Acceptance Criteria:**

**Given** the schema
**When** the migration is applied (`pnpm db:push`)
**Then** a `review_helpful_votes` table exists with a unique `(reviewId, userId)` constraint.

**Given** an authenticated user who has not voted on a review
**When** they call `roasters.markReviewHelpful({ reviewId })`
**Then** a vote row is inserted
**And** `roaster_reviews.helpful_count` increments by 1.

**Given** a user who has already voted on that review
**When** they call the procedure again
**Then** the count does not increase (idempotent / rejected gracefully).

### Story 3.2: Helpful button on review cards
As a reader of roaster reviews,
I want a "Helpful (N)" button on each review,
So that I can vouch for useful reviews.

**Acceptance Criteria:**

**Given** I am viewing a roaster's reviews
**When** the review card renders
**Then** it shows a "Helpful (N)" button with an `aria-label` ("Mark review helpful").

**Given** I am authenticated and tap Helpful
**When** the action fires
**Then** the count increments optimistically
**And** rolls back if the request fails.

**Given** I am not authenticated
**When** I tap Helpful
**Then** I am routed to login (consistent with other protected actions).

---

## Epic 4: Engineering Trust & Hygiene

Eliminate the doc/code contradictions and add an automated quality gate so the project is trustworthy (PRD SM-1, SM-4).

### Story 4.1: Reconcile storage docs & dependencies
As a developer onboarding to this repo,
I want the docs and dependencies to reflect the real storage path,
So that I don't wire raw AWS credentials that the app doesn't use.

**Acceptance Criteria:**

**Given** the README and env docs
**When** I read setup instructions
**Then** they describe the Forge proxy vars (`BUILT_IN_FORGE_API_URL/KEY`), not raw AWS S3 keys, for the storage path.

**Given** `@aws-sdk/*` is unused by live code (verified: zero references)
**When** dependency cleanup runs
**Then** `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` are removed from `package.json` (or a README note justifies keeping them).
**And** `pnpm check` and `pnpm test` still pass.

### Story 4.2: Fix task-tracking source of truth
As a contributor,
I want `todo.md` to stop contradicting the code,
So that I trust the project's status.

**Acceptance Criteria:**

**Given** `todo.md` currently shows Brew Journal incomplete though it ships
**When** the cleanup runs
**Then** `todo.md` either reflects reality or points to the BMad backlog as the source of truth.

### Story 4.3: Add CI quality gate
As a maintainer,
I want CI to typecheck and test every PR,
So that regressions are caught before merge (protects SM-C2).

**Acceptance Criteria:**

**Given** a PR targeting `main`
**When** CI runs
**Then** it executes `pnpm install`, `pnpm check`, and `pnpm test`
**And** fails the PR if any step fails.

**Notes:** `[ASSUMPTION: GitHub Actions]` — confirm CI platform (PRD Open Question #1).

---

---

## Epic 5: Complete Client UI for Shipped APIs *(discovered during implementation, 2026-06-14)*

**Discovery:** While implementing Stories 1.1 and 3.2, the dev cycle found the
**client UI lags the backend API**: `Journal.tsx` has only a *create* flow (no
edit/delete UI) despite `brewJournal.update/delete`; `Roasters.tsx` shows roaster
details but **no review list or submit form** despite `roasters.reviews`/`addReview`.
This blocked the client halves of Stories 1.1 and 3.2. Captured here as real
follow-up rather than silently scoped away.

### Story 5.1: Brew Journal edit & delete UI
As a coffee enthusiast, I want to edit and delete existing brew entries (including
the photo, via the already-shipped `brewJournal.update` photo support — Story 1.1
server), so my journal stays accurate.
**Acceptance:** edit dialog (mirrors create) wired to `brewJournal.update` incl.
photo replace/remove (FR-13 client half); delete action wired to `brewJournal.delete`.

### Story 5.2: Roaster review display & submission UI
As a visitor, I want to read a roaster's reviews and (signed in) submit one, so the
review feature is usable. **Acceptance:** review list via `roasters.reviews`;
submit form via `roasters.addReview`; **then** the "Helpful (N)" button (FR-15 /
Story 3.2) attaches to each rendered review card using the shipped
`roasters.markReviewHelpful` API.

> **Note:** Story 3.2's helpful-button work depends on 5.2 (no review cards exist
> to attach to yet). The backend for it (Story 3.1) is **done and tested**.

## Sequencing Notes
- **3.1 before 3.2** (API/schema before UI).
- **4.1 depends on** the verified `@aws-sdk` non-usage (already confirmed).
- Epics are independent and can be sprinted in any order; recommended value order: 1 → 2 → 3 → 4.
- Every story is additive; none modifies a baseline procedure signature except `brewJournal.update` (additive optional fields).
