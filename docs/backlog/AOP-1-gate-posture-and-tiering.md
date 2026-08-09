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
the same 24 gate sections twice.

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
avoids touching 24 gate sections in two separate passes.

## Scope

**W4 — gate placement and posture**

- [ ] Move `validate:doc-budget` to pre-commit, or make it advisory — decide which, and record why (C10: CI-only cannot fail before a deploy)
- [ ] Convert bookkeeping gates to **warn**, each with a **dated re-arm note** in the control register, per B4
- [ ] Wire the re-arm counter into `/eod`; reset it on any red run so a flaky gate cannot age its way to permanence (PRD §B1 guardrails)
- [ ] Raise the `validate:doc-budget` cap to **26,000 and keep it enforcing**, rather than suspending it — PRD §B1's explicit caveat: suspending removes the only measurement of the instruction surface during exactly the period V1 restructures it
- [ ] Freeze new validators until **N consecutive green runs** on `main`; state N in the control register

**W2 — gate severity tiers**

- [ ] Rewrite `docs/conventions/human-gate-conventions.md` around the 3-tier model
- [ ] Reclassify all **24 CLAUDE.md gate sections** against Appendix A's inventory (the PRD's own §7 row says 15; Appendix A measured 24 — trust the appendix, and correct §7)
- [ ] Confirm Appendix A's **Tier 1 = 8 gates** survives contact with the full inventory, or amend it

## Scope-to-phase mapping

Nine Scope items, above the 5-item sizing gate (`docs/conventions/user-story-conventions.md`).

| Phase | Scope items | Ships when |
|---|---|---|
| **Phase 1 — W4 posture** | items 1–5 | Bookkeeping gates warn, doc-budget enforces at 26,000 from its new position, re-arm counter live in `/eod` |
| **Phase 2 — W2 tiering** | items 6–8 | All 24 gate sections carry a tier; `human-gate-conventions.md` rewritten |

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
- `CLAUDE.md` — 24 gate sections tagged with tiers
- `docs/ai/agentic-caucus/control-register.md` — re-arm notes, posture rows
- `scripts/validate-doc-budget.js` and its CI/pre-commit wiring
- `.claude/skills/eod/` — re-arm counter check
- `docs/briefs/agent-operability-prd.md` §7 — correct the 15 vs 24 gate count

## Acceptance criteria

- [ ] Every one of the 24 gate sections carries exactly one tier
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
