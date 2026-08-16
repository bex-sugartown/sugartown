---
**Epic:** ST-95 — Liveness probes only, no register
**GitHub Issue:** [#95](https://github.com/bex-sugartown/sugartown/issues/95)
**Status:** Backlog
**Priority:** 🔴 High
**Merge strategy:** (a) Merge-as-you-go
---

# ST-95 — Liveness probes only, no register

## Background

Build-back item 1 of 3 from the governance post-mortem
(`docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §7).

SUG-284 removed the governance layer on 2026-08-15, including `validate:enforcement-liveness`.
That validator was the one piece of the layer with measured value: 6 of the 14 incidents in
the log are inert-mechanism bugs, where a gate was declared and not firing. The
`packages/eslint-config` boundary rules sat inert for 176 days while reporting as configured;
`validate:schema-parity` was an always-passing stub.

This epic rebuilds the probes and nothing else. The register machinery that grew around them
(`control-register.md`, `nextRead` dates, the coverage tally) is explicitly not rebuilt, per
§7's "Explicitly not rebuilt" list.

## Objective

One probe per gate, each proving the gate fails on deliberately broken input rather than
confirming the gate exists. No register, no dated rows, no published tally.

## Scope

- [ ] Decide the probe inventory: which gates get a probe, and why each earns one — layer: process
- [ ] Reconcile with SUG-269 ([#93](https://github.com/bex-sugartown/sugartown/issues/93)) — it overlaps directly; decide merge or keep separate — layer: process
- [ ] Implement the probe harness — layer: tooling
- [ ] Wire into CI — layer: tooling
- [ ] Record the kill-criterion check date — layer: process

## Non-Goals

- A control register, in any form. §7 names it as not rebuilt.
- `nextRead` dates, coverage tallies, or any published count. Claim honesty is ST-96's
  subject, and it does not open until this epic has run a full cycle.
- Making the Sanity-backed validators probeable. Classified structurally unprobeable by AOP-0
  and owned by SUG-269 unless the reconciliation above folds it in.

## Kill criterion

**If the probes find nothing new in 60 days, retire them.** Set at birth per post-mortem 6.7.
Check date is 60 days from the first CI run that includes them; record the actual date here
when the harness merges.

## Sequencing

**ST-98 runs first** ([#98](https://github.com/bex-sugartown/sugartown/issues/98)): post-mortem 6.7 (kill criterion at birth) and 6.1 (no generator before its reader) both govern how this epic is built, so they land as rules before the probes are written. Decided 2026-08-16.

Then this epic ships alone. Runs for one full epic cycle before ST-96 opens. Then answer in writing: did
it catch anything a human would not have? Only a yes unlocks item 2. Two consecutive noes end
the rebuild.

This discipline exists because the original layer's failure was that all seven of its features
arrived in five weeks with no interval in which to judge any of them.

## Dangling references to clear

Three live documents carry acceptance criteria against the deleted
`validate-enforcement-liveness.js`. Whoever picks this epic up decides whether the rebuilt
harness satisfies them or whether they are rewritten:

| Where | Line | The dangling requirement |
|---|---|---|
| `docs/backlog/SUG-269-sanity-validator-probeability.md` | 75 | AC requires `pnpm validate:enforcement-liveness` to report 3 more gates live |
| `docs/backlog/SUG-264-validate-banned-words.md` | 63, 79 | AC requires a probe in the deleted script |
| `docs/briefs/governance-data-layer-prd.md` | 183, 231 | live PRD for the cancelled SUG-268 |

## Related

- **GitHub:** [#95](https://github.com/bex-sugartown/sugartown/issues/95)
- **Post-mortem:** `docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §7
- **Next in sequence:** ST-96 ([#96](https://github.com/bex-sugartown/sugartown/issues/96))
- **Overlaps:** SUG-269 ([#93](https://github.com/bex-sugartown/sugartown/issues/93))
