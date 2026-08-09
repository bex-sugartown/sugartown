---
**Epic:** AOP-0 — Governance probe backlog
**Linear Issue:** ⚠️ **NONE — PLACEHOLDER.** Linear issue budget exhausted 2026-08-09. This doc is the container until an ID exists. **Before execution:** file the Linear issue, rename this file to `SUG-{N}-governance-probe-backlog.md` (`git mv`), and replace this line.
**Origin:** SUG-268 Phase 3, Decision 12 (2026-08-09). Not part of the AOP tranche sequence — it shares the `AOP-` placeholder prefix only because it was created under the same Linear budget constraint
**Status:** Backlog
**Priority:** 🟣 Soon — no deadline, but each row is a gate currently trusted without proof
**Merge strategy:** (a) Merge-as-you-go — one probe per commit
**Depends on:** nothing. SUG-268 Phase 3 *routed* these six rows here, but it is not a prerequisite — all six gates exist and run today, so all six can be probed today. Corrected 2026-08-09; the original header overstated this as a dependency. Doing this work first makes Phase 3 smaller
---

# AOP-0 — Governance probe backlog

Six controls in `docs/ai/agentic-caucus/control-register.md` have **no liveness probe**. Each
one's Bypass cell reads `none — no probe yet, SUG-256 follow-up`. They are enforced-by-code
gates whose enforcement has never been proven to fail on broken input.

## Why this doc exists

SUG-268 Phase 3 splits the register's `Next read` column into three cadence kinds. These six
rows are the `no-probe-yet` kind: a backlog item wearing a date. Every date in the column is
`+1 month` or `+3 months` from the day the register was written (2026-07-28), so nothing
happens when they fire — they are a forced re-read interval, not a prediction. Re-dating them
is avoidance.

The original proposal (SUG-268 Phase 3 Scope) routed them to Linear, so they could be
prioritised against everything else rather than firing as CI failures nobody chose. The Linear
issue budget is exhausted as of 2026-08-09, so they land here on the same terms.

## The six rows

Verified 2026-08-09 by reading `docs/ai/agentic-caucus/control-register.md` directly, not
copied from SUG-268's prose.

| Control | Gate | Class | Current Bypass cell |
|---|---|---|---|
| CTL-008 | `validate:urls` | enforced-by-code | none — no probe yet |
| CTL-009 | `validate:filters` | enforced-by-code | none — no probe yet |
| CTL-010 | `validate:taxonomy` | enforced-by-code | none — no probe yet |
| CTL-011 | `validate:schema-parity` | enforced-by-code | none — no probe yet |
| CTL-016 | `pnpm typecheck` | enforced-by-code | none — no probe yet |
| CTL-018 | `pnpm test:smoke` (5 route specs) | enforced-by-code | none — no probe yet |

## Objective

Every row above either gains a probe in `validate-enforcement-liveness.js` that proves it fails
on deliberately broken input, or is reclassified to what it actually is.

## Scope

- [ ] CTL-008 `validate:urls` — probe, or reclassify
- [ ] CTL-009 `validate:filters` — probe, or reclassify
- [ ] CTL-010 `validate:taxonomy` — probe, or reclassify
- [ ] CTL-011 `validate:schema-parity` — probe, or reclassify
- [ ] CTL-016 `pnpm typecheck` — probe, or reclassify
- [ ] CTL-018 `pnpm test:smoke` — probe, or reclassify

## Scope-to-phase mapping

Six Scope items, at the sizing gate. One phase, one commit per probe — each is independently
verifiable, so there is no reason to batch them.

| Phase | Scope items | Ships when |
|---|---|---|
| **Phase 1** | all six | Each row's Bypass cell names a probe, and the probe fails on broken input |

## Non-Goals

- Changing what any of the six gates checks. This adds proof that they fire, not new coverage.
- Re-dating the rows. That is the behaviour this doc exists to stop.
- Touching the other two cadence kinds (`recurring-read`, `ci-only`). SUG-268 Phase 3 owns those.

## Technical constraints

- **Verification review is blocking** — this changes probe coverage on six controls.
- **A probe must fail on broken input, not confirm the gate exists.** That distinction is the
  entire reason `validate:enforcement-liveness` was built (four architectural boundary rules
  reported as configured while matching nothing, for 176 days).
- **"Reclassify" is a real outcome, not a cop-out.** CTL-013 and CTL-019 cannot be exercised
  locally and become `ci-only` under Decision 12. If one of these six is the same shape, say so
  and classify it rather than writing a probe that cannot run.

## Acceptance criteria

- [ ] No row in `control-register.md` reads `none — no probe yet`
- [ ] Each new probe demonstrated failing on deliberately broken input — run it, record the output
- [ ] `pnpm validate:enforcement-liveness` reports the six as live, or as explicitly classified
- [ ] `pnpm validate:controls` passes

## Risks

- **A probe written to pass rather than to prove.** Mitigate: each probe's evidence is the
  broken-input run, recorded, not the green run.
- Six probes is six chances to write a shallow one. One commit each keeps them individually
  reviewable.
