---
**Epic:** AOP-0 — Governance probe backlog
**Linear Issue:** ⚠️ **NONE — PLACEHOLDER.** Linear issue budget exhausted 2026-08-09. This doc is the container until an ID exists. **Before execution:** file the Linear issue, rename this file to `SUG-{N}-governance-probe-backlog.md` (`git mv`), and replace this line.
**Origin:** SUG-268 Phase 3, Decision 12 (2026-08-09). Not part of the AOP tranche sequence — it shares the `AOP-` placeholder prefix only because it was created under the same Linear budget constraint
**Status:** **Closed 2026-08-09 — 2 of 6 probed, 4 filed with reasons.** Harness went 21 → 23 gates proven live, 0 inert. The other four were not skipped: three are structurally unprobeable and moved to `AOP-0b`; `pnpm test:smoke` needs a cost decision, recorded there too. See §Findings
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

- [ ] CTL-008 `validate:urls` — **reclassify: not probeable without a refactor.** See §Findings
- [ ] CTL-009 `validate:filters` — **reclassify: not probeable without a refactor.** See §Findings
- [ ] CTL-010 `validate:taxonomy` — **reclassify: not probeable without a refactor.** See §Findings
- [x] CTL-011 `validate:schema-parity` — **probed 2026-08-09**, PRB-024, `8108ea60`
- [x] CTL-016 `pnpm typecheck` — **probed 2026-08-09**, PRB-023, `da9380a4`
- [ ] CTL-018 `pnpm test:smoke` — probeable, but costs a full production build. Needs a call

## Findings — 2026-08-09, measured

**Two done, both proven by running them, not by inspection.** Harness went from 21 to
**23 gates proven live, 0 inert** (`pnpm validate:enforcement-liveness`, exit 0).

| Gate | Clean-tree exit | Broken-tree exit | What proved it |
|---|:--:|:--:|---|
| `pnpm typecheck` | 0 | 2 | `error TS2322` naming the probe file |
| `validate:schema-parity` | 0 | 1 | `article: +field(s) livenessProbeField` |

### The three Sanity-backed gates cannot be probed as the harness is built

`validate:urls`, `validate:filters` and `validate:taxonomy` do not check repo files. They
**fetch published documents from Sanity and judge that data**. The harness breaks a gate by
writing a file into the repo, and no file in this repo can make any of the three fail.

Making them fail means **writing bad data to the production dataset**. That is not an acceptable
probe at any price, so it is not on the table.

Three options, none of them a probe:

1. **Refactor each validator to separate fetching from judging.** The rule logic becomes a pure
   function over a document array, testable against a fixture. This is the real fix and the only
   one that produces a genuine liveness proof. It is a change to three validators, not a probe —
   so it needs its own scope, and arguably its own epic.
2. **A fixture dataset** with deliberately broken content, selected via `VITE_SANITY_DATASET`
   (all three already read it from env). Works, but it is a second dataset to create, pay for and
   keep in sync, and a stale fixture proves nothing while looking green.
3. **Reclassify honestly** — the register says these three are `enforced-by-code` with no probe.
   That is true and is not a lie; what is missing is a stated reason better than "no probe yet".

**Recommendation: option 3 now, option 1 filed as its own work.** The current Bypass cells say
"none — no probe yet, SUG-256 follow-up", which reads as an oversight. It is not: it is a
structural property of validators that judge remote data, and the cell should say so.

### `pnpm test:smoke` is probeable but expensive

`playwright.config.ts` runs `pnpm --filter web build && pnpm --filter web preview` before the
specs. A probe would break a route, so it needs that full production build on every harness run.
The other 23 probes complete in seconds; this one would add minutes.

**Needs a call:** accept the cost, or state in the Bypass cell that the probe is deliberately not
run locally for that reason. Not decided here.

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
