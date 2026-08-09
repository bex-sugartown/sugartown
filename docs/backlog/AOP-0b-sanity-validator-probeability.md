---
**Epic:** AOP-0b — Make the Sanity-backed validators probeable
**Linear Issue:** ⚠️ **NONE — PLACEHOLDER.** Linear issue budget exhausted 2026-08-09. This doc is the container until an ID exists. **Before execution:** file the Linear issue, rename this file to `SUG-{N}-sanity-validator-probeability.md` (`git mv`), and replace this line.
**Origin:** AOP-0, 2026-08-09. Three of its six controls turned out to be structurally unprobeable; this is the fix, filed rather than absorbed
**Status:** Backlog
**Priority:** 🟣 Soon — three CI gates are trusted without proof, but none is newly broken
**Merge strategy:** (a) Merge-as-you-go — one validator per commit
**Depends on:** nothing
---

# AOP-0b — Make the Sanity-backed validators probeable

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
