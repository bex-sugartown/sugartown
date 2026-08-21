---
**Epic:** SUG-269 — Make the Sanity-backed validators probeable
**Linear Issue:** [SUG-269](https://linear.app/sugartown/issue/SUG-269/make-the-sanity-backed-validators-probeable) — **this ID was reused.** It previously held "GlossaryTermPage: AI Attribution item + DescriptionList→List migration", cancelled the same day it was created and absorbed into [SUG-177](docs/backlog/SUG-177-list-component-audit-site-list-patterns.md). Repurposed 2026-08-10: the workspace is at its issue limit and deletion holds a slot for a month, so reusing a fully-superseded ID beats creating one. **References to "SUG-269, cancelled the same day" in `SUG-268-governance-data-layer.md` and `SUG-177-*.md` describe that prior life, not this epic.** The sub-issue parent link it inherited was cleared at repurposing, per one-epic-one-issue.
**Origin:** AOP-0, 2026-08-09. Three of its six controls turned out to be structurally unprobeable; this is the fix, filed rather than absorbed
**Status:** Backlog — sequenced after ST-95, not actionable as written (see reconciliation note)
**Priority:** 🟣 Soon — three CI gates are trusted without proof, but none is newly broken
**Merge strategy:** (a) Merge-as-you-go — one validator per commit
**Depends on:** ST-95 ([#95](https://github.com/bex-sugartown/sugartown/issues/95)) — reuses its
harness pattern once proven; do not build a second harness
---

# SUG-269 — Make the Sanity-backed validators probeable

## Reconciliation note — 2026-08-21

**This doc is not actionable as written.** ST-95's Scope decided to keep this epic separate
rather than merge it, but flagged two things a rewrite must fix before work starts here:

1. **The mechanics below are dead.** `control-register.md`, `governance/source/probes.json`,
   "Verification review" (§Technical constraints), `validate:enforcement-liveness` (§Acceptance
   criteria), and the CTL-008/009/010 IDs were all removed by SUG-284's governance-layer unwind.
   The AC as written calls a script that no longer exists. Rewrite against ST-95's actual
   harness once it ships — reuse its pattern, don't invent a second one.
2. **Scope is stale in scale, not just mechanics.** `validate:content` and
   `validate:schema-parity` are the same remote-data-fetching shape as the three validators
   below and were missed when this was filed (2026-08-09, before either existed in its current
   form). Confirmed 2026-08-21 by reading both scripts directly — five candidates, not three.

**Sequencing, not blocking on capacity or priority:** pick this up once ST-95's harness has run
long enough to show the pattern holds, per the post-mortem's own "prove one thing before the
next" discipline (`docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md`
§6.8, §7). ST-95 itself gates on a 60-day no-new-catch window before its own kill-criterion
check; this doc doesn't need to wait that long, only until the harness pattern (cleanup stack,
fixture shape, CI wiring) exists as real code to extend rather than a design direction.

Everything below this note is the original 2026-08-09 filing. Left as-is per this doc's own
practice of not rewriting history until the rewrite actually happens — do not treat the Scope,
Technical constraints, or Acceptance criteria below as current until this note's two points are
resolved.

---

Three controls cannot be given a liveness probe as the validators are currently written:

| Control | Gate | Why no probe is possible |
|---|---|---|
| CTL-008 | `validate:urls` | Fetches published Sanity documents and checks for duplicate canonical URLs and missing slugs |
| CTL-009 | `validate:filters` | Fetches `archivePage` docs plus content items and runs `buildFilterModel()` |
| CTL-010 | `validate:taxonomy` | Fetches content documents and checks taxonomy health |

## The problem, stated precisely

`validate-enforcement-liveness.js` proves a gate is live by **writing a deliberately broken file
into the repo** and asserting the gate then fails. None of these three reads a repo file. They
judge remote data.

Making them fail means writing bad data to the **production** Sanity dataset. That is not an
acceptable probe at any price, so the current harness cannot reach them. Measured 2026-08-09:
all three run clean locally (exit 0) and none accepts a fixture or offline input — `--no-token`
on two of them controls draft access, not the data source.

This is not "no probe yet". It is a structural property of a validator that judges remote data,
and the register said so as of AOP-0's close.

## Objective

Each of the three separates **fetching** from **judging**, so the rule logic is a pure function
over a document array that a probe can feed a deliberately broken fixture.

## Scope

- [ ] `validate:urls` — extract the rule logic into a pure function over a document array; probe it with a fixture containing a duplicate canonical URL and a published doc with no slug — layer: tooling
- [ ] `validate:filters` — same shape; the seam is around `buildFilterModel()`, which is already a pure function, so this may be the cheapest of the three — layer: tooling
- [ ] `validate:taxonomy` — same shape; fixture carries a document with 0 categories and one with >2 — layer: tooling
- [ ] One `PROBES` entry per validator, each proven to fail on its fixture, plus a `governance/source/probes.json` record — layer: tooling
- [ ] Update CTL-008, CTL-009, CTL-010 rows: probe name in, `Next read` to `continuous` — layer: docs (gated)

## Scope-to-phase mapping

Five Scope items, at the sizing gate. One phase; each validator is an independent commit.

| Phase | Scope items | Ships when |
|---|---|---|
| **Phase 1** | all five | All three probes fail on their fixtures, and no row reads "no probe yet" |

## Non-Goals

- Changing what any of the three validators *checks*. This is about provability, not coverage.
- Creating a fixture Sanity dataset. Considered and rejected in AOP-0: it is a second dataset to
  create, pay for and keep in sync, and a stale fixture proves nothing while looking green.
- Touching `pnpm test:smoke` (CTL-018) — see below, it is a different problem.

## Technical constraints

- **Verification review is blocking** — this changes what three CI gates prove.
- **The pure function must be the one the validator actually calls.** A probe against a
  copy of the logic proves the copy works. The refactor only counts if the CI path and the
  probe path run the same function.
- **`control-register.md` is behind the Rule File Write Gate.** Row updates need an exact diff
  approved, produced from a scratchpad copy.

## Acceptance criteria

- [ ] Each of the three probes fails on its fixture, demonstrated by running it and recording the output
- [ ] `pnpm validate:enforcement-liveness` reports 3 more gates live, 0 inert
- [ ] No row in `control-register.md` reads `none — no probe yet`
- [ ] The probed function is the same one the CI path calls — shown, not asserted

## Risks

- **A probe that tests a parallel copy of the rule logic.** The whole failure class this repo
  keeps hitting: a check that reports healthy while checking nothing. Named in the constraints
  above because it is the likely way this goes wrong.

## Also outstanding from AOP-0 — CTL-018 `pnpm test:smoke`

Not in this doc's Scope; recorded so it is not lost.

`playwright.config.ts` runs `pnpm --filter web build && pnpm --filter web preview` before the
specs, so a probe that breaks a route needs a full production build on **every** harness run.
The other 23 probes finish in seconds. **This is a cost decision, not a technical blocker:**
accept the minutes, or state in CTL-018's Bypass cell that the probe is deliberately not run
locally and why. Undecided as of 2026-08-09.
