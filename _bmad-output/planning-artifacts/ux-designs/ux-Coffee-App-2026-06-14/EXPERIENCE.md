---
title: Coffee Connoisseur — Experience Spec
status: final
created: 2026-06-14
updated: 2026-06-14
sources:
  - prd: ../../prds/prd-Coffee-App-2026-06-14/prd.md
  - design: ./DESIGN.md
  - code: client/src/pages, client/src/components
---

# Coffee Connoisseur — Experience Spec

> Scope: **hardening iteration**. The as-built experience (5 features) is the
> baseline to protect; this spec details only the behavioral **deltas** required
> by PRD FR-13, FR-14, FR-15. Visual tokens live in [DESIGN.md](./DESIGN.md),
> referenced as `{token}`.

## Foundation
- **Form-factor:** Web SPA (desktop + responsive mobile via `useMobile`).
- **UI system:** shadcn (new-york) + Radix + Tailwind 4. Behavioral delta only here.
- **Routing:** wouter; surfaces `/`, `/quiz`, `/profile`, `/journal`, `/roasters`.

## Information Architecture (as-built)
| Surface | Purpose | Auth |
|---------|---------|------|
| `/` Home | Landing, value prop, login CTA | public |
| `/quiz` | Palate Quiz (multi-step) | user |
| `/profile` | Palate Profile + recommendations | user |
| `/journal` | Brew Journal list + CRUD dialogs | user |
| `/roasters` | Map + roaster list + reviews | public list / user to review |

No new surfaces this iteration.

## Voice and Tone (microcopy)
Friendly, encouraging, jargon-light. Errors are plain and actionable
(e.g. "Couldn't save your brew — check your connection and try again"), never raw
codes. Auth nudges invite rather than scold ("Sign in to start your journal").

## Component Patterns (behavioral deltas)
- **Photo edit on Brew Entry (FR-13):** The edit dialog (existing `Dialog` in
  `Journal.tsx`) gains a photo control mirroring create: show current photo
  thumbnail, allow Replace (file picker → base64) and Remove. Pending upload
  shows a spinner ({rounded} thumbnail, `Spinner`); failure keeps the dialog open
  with an inline error.
- **Helpful button on Roaster Review (FR-15):** Each review card gets a "Helpful
  (N)" toggle button (ghost variant, `ThumbsUp` icon). Optimistic increment;
  disabled/active state once the user has voted.

## State Patterns
- **Loading:** existing skeletons (`DashboardLayoutSkeleton`) / `Spinner` for in-dialog actions.
- **Empty:** journal/roaster empty states use `ui/empty`.
- **Error:** TanStack Query error → `sonner` toast; unauthorized → login redirect (see Flows).
- **Optimistic:** helpful-vote increments immediately, rolls back on failure.

## Interaction Primitives
- Dialogs for create/edit (Radix `Dialog`), `Select` for filters, `RadioGroup` for quiz, toasts for feedback.

## Accessibility Floor (behavioral)
- New controls are keyboard-reachable and labeled (icon buttons get `aria-label`: "Mark review helpful", "Remove photo").
- Redirect-on-unauth must not trap focus or loop; announce nothing visually jarring.
- Contrast inherits DESIGN.md tokens (coffee-brown primary on white meets AA for large/icon use; verify for small text).

## Key Flows

- **KF-1. Maya replaces a brew photo (FR-13).**
  Maya opens an existing entry's edit dialog, sees the current setup photo, taps
  Replace, picks a sharper shot. **Climax:** the new thumbnail renders in the
  dialog and, on save, on the journal card — the old photo is gone. Edge: upload
  fails → dialog stays open, inline error, original photo intact.

- **KF-2. Unauthenticated visitor hits a protected page (FR-14).**
  A logged-out visitor navigates to `/journal`. **Climax:** before any data
  request fires, the route guard redirects to the OAuth login (no flash of empty
  journal, no failed-request console error). After login they land back on `/journal`.

- **KF-3. Priya marks a review helpful (FR-15).**
  Priya reads a roaster review she found useful, taps "Helpful". **Climax:** the
  count ticks up immediately and the button shows her vote registered; refresh
  persists it. Edge: a second tap does not double-count.

## Notes
- `[NOTE FOR UX]` AI Chat (`AIChatBox`) UX is unspecified/experimental — out of scope until FR-AI-1 is defined.
