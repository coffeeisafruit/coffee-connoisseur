# Implementation Readiness — Migrate off Manus → DO

**Date:** 2026-06-15 · **Verdict:** ✅ READY (with provisioning explicitly out of scope)

## Coverage
| FR | Story | Verdict |
|----|-------|---------|
| FR-M4 LLM→OpenRouter | M1.1 | ✅ |
| FR-M3 maps→Leaflet | M2.1 | ✅ |
| FR-M2 storage→Spaces | M3.1 | ✅ |
| FR-M5 decouple | M4.1 | ✅ |
| FR-M1 auth→Better Auth | M5.1/M5.2/M5.3 | ✅ |
| FR-M6 deploy config | M6.1 | ✅ |

No orphan FRs/stories. Versions pinned (architecture §4).

## Alignment
- Architecture honors project-context rules (tRPC-only, zod, secrets-in-ENV, single-origin).
- Each story verifiable locally (typecheck + tests on MySQL + build); auth split so the high-blast-radius id-type change (M5.2) is isolated.

## Risks (carried)
- M5.2 int→string user id touches all procedures + tests — highest risk; isolated + typecheck-guarded.
- Storage/LLM upload/inference paths not fully exercisable without Spaces/OpenRouter creds — interface-preserved + graceful-degrade, same pattern as the hardening.

## Open (non-blocking, resolve at provisioning)
- DO region, Spaces bucket name, BETTER_AUTH_SECRET, real OPENROUTER_API_KEY.

✅ Proceed to sprint planning → dev cycle. **Provisioning gated on user DO credentials.**
