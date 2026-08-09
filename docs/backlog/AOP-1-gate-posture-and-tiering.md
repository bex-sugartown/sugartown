---
**Epic:** AOP-1 — Gate posture and tiering
**Linear Issue:** ⚠️ **NONE — PLACEHOLDER.** Linear issue budget exhausted 2026-08-09. This doc is the container until an ID exists. **Before execution:** file the Linear issue, rename this file to `SUG-{N}-gate-posture-and-tiering.md` (`git mv`), and replace this line.
**Source PRD:** `docs/briefs/agent-operability-prd.md` v1.0 §7 — covers **W4** and **W2**
**Status:** Backlog
**Priority:** 🔴 Now — PRD §7 names W4 first of the recommended three
**Merge strategy:** (a) Merge-as-you-go — Phase 1 (W4) merges before Phase 2 (W2) begins
**Depends on:** B4 and B5, both resolved (PRD §10, Appendix A)
**Blocks:** AOP-2 (the close-out runner needs the tier model to know what to stop for)
---

# AOP-1 — Gate posture and tiering

Both halves answer one question: **when may a gate interrupt you, and when may it block a
commit?** W4 sets posture (block vs warn), W2 sets tiering (which gates cost a click). They
touch the same surfaces and share one acceptance test, so splitting them means reclassifying
the same 16 gate sections twice.

## Context

From PRD §3, the findings this tranche closes:

- **C5** — gates are untiered: a rebase costs the same ceremony as a production migration (measured, 24 vs 19)
- **C7** — validators doubled 8→16 and CI steps grew 17→30 in two weeks; **every recent red run is a new gate, none a defect**
- **C10** — gate placement does not match the push model: `validate:doc-budget` is CI-only and cannot fail before a deploy

## Objective

CI red means something is broken, not that a document grew. Human gates fire on
irreversible, outward-facing, or content-writing actions, and nowhere else.

## Divergence from PRD §7, recorded deliberately

PRD §7 recommends shipping **W4 + W1** together, on the grounds that both are size **S** and
independent. This tranche instead pairs **W4 + W2**.

Reason: W4 and W1 are only related by *size*. W4 and W2 are related by *subject* — both
rewrite when a gate fires, both edit `human-gate-conventions.md` and the CLAUDE.md gate
sections, and both are proven by the same test. W1 moves to AOP-2, where it belongs with the
rest of the epic execution loop. Grouping by size optimises one session; grouping by subject
avoids touching 16 gate sections in two separate passes.

## Activation decisions (2026-08-09, Bex)

| # | Question | Decision |
|---|---|---|
| A1 | Where does `validate:doc-budget` run, and at what cap | **Pre-commit, cap 26,000.** Satisfies B1's *raise* branch (not *suspend*), closes C10 — it can now fail before a deploy — and ~6,000 words of headroom means it will not fire on every commit |
| A2 | Which gates convert to warn-only under B4 | **`validate:epic-docs` and `validate:doc-budget`.** Both still run; neither blocks. **`validate:enforcement-liveness` stays blocking** — it is the gate that proves other gates fire, so softening it would weaken the whole liveness chain |
| A3 | Consecutive green CI runs on `main` before new validators are allowed | **5.** Currently at 2 |
| A4 | Verification review | **Run it**, per this doc's Technical constraints |

### A5 — what reads a warning (2026-08-09, Bex). Resolves the review's central blocker

A blocking gate reads itself: it stops you. A warning is read by nothing unless something looks,
and today nothing does — `/eod` keys on the run's `conclusion` (`eod-prompt.md:137-147`) and
`ci-failure-alert.yml:31` fires only on `failure`. A run carrying warnings concludes `success`,
so both would report green.

**Decision: block locally where possible, warn in CI, and teach `/eod` to read warning
annotations on green runs as the backstop.**

| Gate | Pre-commit | CI | Reader |
|---|---|---|---|
| `validate:doc-budget` | **blocks** | warns | the committer, in their own terminal, at the moment they cause it; `/eod` as backstop |
| `validate:epic-docs` | cannot run — exits 0 as `SKIPPED` with no `LINEAR_API_KEY` | warns | **`/eod` only.** No local reader exists for it |

This supersedes A1's "pre-commit" as a *move*: **doc-budget runs in pre-commit *in addition to*
CI**, never instead of it (review B-3). Removing the CI step would delete the only reader that
survives `--no-verify`, merge commits, an uninstalled hook, and `[skip ci]`.

**Accepted cost, stated plainly:** this makes `validate:epic-docs` genuinely weaker than it is
today — it will block nowhere. That is defensible because it caused two of the three recent red
builds and has never caught a code defect, but it is a real reduction, not a free one, and the
re-arm date is what makes it temporary.

### A6 — where the re-arm date lives. Resolves review B-5

The review found the register has no posture field and no re-arm field, so a re-arm date written
as prose in `Bypass` is checked by nothing.

**Decision: the re-arm date goes in `Next read`**, which is the one column
`validate-control-register.js:275-286` already machine-validates and fails the build on when it
passes. No schema change, no new field, and the existing gate becomes the enforcement.

**A1 and A2 combine deliberately:** `doc-budget` moves to pre-commit *and* warns in CI. It
becomes visible early and stops reddening `main`, with a dated re-arm restoring blocking later.
The cap raise is not a softening — it is what makes an early check meaningful rather than
constant noise.

## Evidence gathered at activation (2026-08-09)

**C7's premise verified, not assumed.** The last three red CI runs on `main`, by failed step:

| Run | Failed step(s) |
|---|---|
| `31258189587` | *Prove every gate fires*, *Validate doc budget* |
| `31168947110` | *Validate epic docs* |
| `30930818744` | *Validate epic docs* |

**Three red builds, zero code defects.** Every one was bookkeeping. Reproduce:
`gh run list --branch main --workflow CI --limit 12 --json databaseId,conclusion`

**Two corrections to this doc's own figures, both measured today:**

| Claim | This doc said | Measured | Command |
|---|---|---|---|
| CLAUDE.md gate sections | 24 | **16** by the counter's own regex; 19 by a looser match. The 24 is the total across CLAUDE.md **plus** the `docs/conventions/` files | `grep -cE '^#{2,4} .*(hard stop\|blocking)' CLAUDE.md` |
| Headroom | — | **204 words, 2 stops** against caps of 20,150 and 26 | `pnpm validate:doc-budget` |

The 24 came from Appendix A and was written into this doc without being re-run. Phase 2 is
smaller than originally scoped.

### Defect found while measuring — `validate:doc-budget` undercounts stops

Its stop-counter (`scripts/validate-doc-budget.js:105`) matches `hard stop` and `blocking` but
**not `hard-stop`**, so it silently misses `### Phase 0 hard-stop (visual spec gate)` — one of the
most consequential gates in the file — plus five other headings (`Browser testing pre-flight`,
`Design handoff evaluation gate`, `React hooks — Outlet context pre-flight`, `Gate 3 — Framework-agnostic
constraint`, `Dark mode surface work — pre-flight`).

**The cap meant to limit "places a session must stop and decide" is measured against an
undercount.** Fixing the regex will raise the measured stop count, so the stop cap must be
re-derived in the same commit or the fix immediately turns the gate red. Added to Scope below.

## Verification review (2026-08-09) — **7 blockers, does not clear the gate**

Run as a subagent in a fresh context. Read-only. No implementation code was written.

### The central blocker: "warn-only" has no chosen implementation, and both options break something

| Where warn is implemented | What breaks |
|---|---|
| **In-script** (a `--warn` default, script exits 0) | The liveness probe's violating run now exits 0, so the gate reports `STAYED GREEN`, and `validate:enforcement-liveness` returns 1 on any inert gate (`validate-enforcement-liveness.js:1275-1287`). Decision A2 keeps liveness **blocking**, so the change is **red on landing** |
| **In-wiring** (`continue-on-error` / `\|\| true`) | The run concludes `success`, so `ci-failure-alert.yml:31` never opens a `ci-red` issue and `/eod` (`eod-prompt.md:137-147`) reports green. The only artifact is a log line nobody opens — **the 212-run shape: healthy conclusion, control checking nothing** |

**Decide the location in this doc before any code.** It is not an implementation detail.

### Other blockers

| # | Finding | Evidence |
|---|---|---|
| B-2 | **`validate:epic-docs` would block nowhere at all.** It exits 0 as `SKIPPED` without `LINEAR_API_KEY`, so it never blocks locally and its probe returns `live: null` there. CI is its only teeth. Warn it in CI and it blocks nowhere and is read nowhere | `validate-epic-docs.js:89-93`, probe `:977-991` |
| B-3 | **Scope item 1 says "move to pre-commit".** If the `ci.yml` step is removed, the only machine reader disappears: `--no-verify`, merge commits (no pre-commit hook at all), an uninstalled-hook machine, `[skip ci]`, and Netlify publishing regardless. Must read **pre-commit *in addition to* CI** | `.husky/pre-commit`, `ci.yml:87-88`, CTL-020 |
| B-4 | **The stop cap has no probe, and Phase 2 rewrites its input.** The doc-budget probe pads *words* only. `countDecisionPoints` matches the literal strings `hard stop` / `blocking` — if tier tags replace those words, the count silently collapses toward 0 while the gate reports enormous headroom | `validate-doc-budget.js:85, 104-108`; probe `:526-538` |
| B-5 | **The re-arm counter has no artifact.** The register's columns are fixed — `ID, Control, Class, Probe, Reader, Next read, Bypass` — with **no posture field and no re-arm field**. A re-arm date written as prose in `Bypass` is checked by nothing; only `Next read` is machine-validated. This doc's own Risks section says: if the counter is not built, convert nothing | `validate-control-register.js:60, 275-286` |
| B-6 | **AC #1 and the Scope-to-phase table still say 24** while §Evidence says 16. The acceptance test "every one of the 24 gate sections carries exactly one tier" can never pass against a corpus of 17, and would be quietly reinterpreted at close-out | this doc |
| B-7 | **The 3-tier model does not cover all 16 sections.** 13 map cleanly. Outside both tier lists entirely: the **"Visual QA approved" gate** (close-out step 3), **Chromatic approval** (step 4), and `### Sanity MCP content writes` (`CLAUDE.md:459`). The first two are Tier-1-shaped human sign-offs. **This is the same shape as SUG-268's cadence enum covering 11 of 32 rows** | Appendix A vs the measured heading list |

### Three claims of mine the review corrected

| Claim | I said | Measured |
|---|---|---|
| Consequence of the regex fix | "an unchanged cap turns the gate red on landing" | **False.** Stops go 24 → **25**, cap 26. Headroom 1. Re-deriving the cap is still right, but not for the reason I gave |
| Headings the fix recovers | "six" | **One.** Only `CLAUDE.md:220` contains `hard-stop`. The other five carry **no keyword at all** and stay missed before and after |
| Validators in the tier model | 16 (from Appendix A) | **18** |

### Also flagged

- **Class after conversion.** CTL-024 and CTL-025 are `enforced-by-code`. A gate that runs and cannot fail a build is not enforced by code — `measured` is the honest class while warn-only, reverting on re-arm.
- **"Reset on any red run" is undefined against bookkeeping reds** — and a scheduled one already exists: five rows go overdue **2026-08-29**, exiting 1 with no defect present. Under "any red", that resets the counter and the re-arm recedes. The "temporary becomes permanent" mechanism, arriving on a known date.
- **Tier 1 contains items with no owning file** — "Production data mutation — ad hoc" has no CLAUDE.md section, no skill line, no register row.
- **Register-row IDs must start at CTL-040.** SUG-268 has reserved CTL-036 to CTL-039 in text; CTL-026/032/033 are also reserved. Proposed rows CTL-040 to CTL-044 are held in the review output for the implementing branch.

## Scope

**W4 — gate placement and posture**

- [x] **Done 499bb33f.** `validate:doc-budget` runs at pre-commit (blocking) **and** in CI (warn) — per A5 it is added, not moved, or make it advisory — decide which, and record why (C10: CI-only cannot fail before a deploy)
- [~] **Wiring done 499bb33f** (`continue-on-error` on both CI steps, probes verified still valid). **Register re-arm notes still owed — gated file.** Convert bookkeeping gates to **warn**, each with a **dated re-arm note** in the control register, per B4
- [ ] Wire the re-arm counter into `/eod`; reset it on any red run so a flaky gate cannot age its way to permanence (PRD §B1 guardrails)
- [x] **Done 499bb33f.** Raise the `validate:doc-budget` cap to **26,000 and keep it enforcing**, rather than suspending it — PRD §B1's explicit caveat: suspending removes the only measurement of the instruction surface during exactly the period V1 restructures it
- [ ] Freeze new validators until **N consecutive green runs** on `main`; state N in the control register

**W2 — gate severity tiers**

- [x] **Done 499bb33f** (24→25 stops, cap re-derived to 28). Fix `validate-doc-budget.js:105`'s stop regex to match `hard-stop` as well as `hard stop`, and **re-derive the stop cap in the same commit** — the fix raises the measured count, so an unchanged cap turns the gate red on landing — layer: tooling
- [ ] Rewrite `docs/conventions/human-gate-conventions.md` around the 3-tier model
- [ ] Reclassify the **16 CLAUDE.md gate sections** (measured 2026-08-09; the doc's earlier "24" was the whole-corpus figure, and the PRD's §7 row says 15 — correct both)
- [ ] Reclassify the remaining gate sections in the `docs/conventions/` half of the corpus, so the tiering covers what the budget counts
- [ ] Confirm Appendix A's **Tier 1 = 8 gates** survives contact with the full inventory, or amend it

## Scope-to-phase mapping

Nine Scope items, above the 5-item sizing gate (`docs/conventions/user-story-conventions.md`).

| Phase | Scope items | Ships when |
|---|---|---|
| **Phase 1 — W4 posture** | items 1–5 | Bookkeeping gates warn, doc-budget enforces at 26,000 from its new position, re-arm counter live in `/eod` |
| **Phase 2 — W2 tiering** | items 6–8 | Every measured gate section carries a tier; `human-gate-conventions.md` rewritten |

## Non-Goals

- Adding any new validator. PRD §6 forbids it until C7 is resolved, and C7 *is* this tranche.
- Removing any gate. Tiering changes what a gate costs, not whether it exists.
- Touching the epic execution loop — that is AOP-2.

## Technical constraints

- **Verification review is blocking.** This tranche changes gate and validator behaviour, so the `verification-reviewer` subagent runs before implementation and every changed control gets a `docs/ai/agentic-caucus/control-register.md` row. Enforced by `pnpm validate:controls`.
- **Instruction & Rule File Write Gate applies throughout.** CLAUDE.md, `docs/conventions/**` and `.claude/skills/**` are all in scope here. Every edit goes via a scratchpad copy, diffed and approved before it lands.
- A gate converted to warn must still **run**. Warn means non-blocking, never skipped — a gate that stops executing is indistinguishable from a deleted one (INC-007, INC-010, INC-011).

## Files to modify

- `docs/conventions/human-gate-conventions.md` — rewritten
- `CLAUDE.md` — 16 gate sections tagged with tiers (measured 2026-08-09; re-derive at execution)
- `docs/ai/agentic-caucus/control-register.md` — re-arm notes, posture rows
- `scripts/validate-doc-budget.js` and its CI/pre-commit wiring
- `.claude/skills/eod/` — re-arm counter check
- `docs/briefs/agent-operability-prd.md` §7 — correct the 15 vs 24 gate count

## Acceptance criteria

- [ ] Every measured gate section carries exactly one tier — count re-derived at execution, never copied (16 in CLAUDE.md as of 2026-08-09, 17 with the hard-stop fix)
- [ ] Running the full validator suite against a deliberately bad input shows each gate **either blocking or warning as its register row states** — measured by running it, not by reading the config
- [ ] `validate:doc-budget` can fail before a deploy
- [ ] Every warn-converted gate has a re-arm date and a named reader
- [ ] `pnpm validate:controls` passes
- [ ] The count in PRD §7's W2 row matches Appendix A

## Risks

- **Reclassifying 24 sections is a large diff against the highest-traffic instruction file.** Mitigate by phasing: posture first, tiering second, each merged before the next.
- **"Warn" becoming permanent** is the failure this tranche could introduce. The dated re-arm plus the reset-on-red counter is the countermeasure; if it is not built, do not convert anything to warn.

## Post-Epic Close-Out

- [ ] Friction line: what cost a correction commit (`none` is valid)
- [ ] Incident log: this tranche fixes already-shipped behaviour (C7's red runs), so an entry is expected — state "no incident" only if genuinely none
