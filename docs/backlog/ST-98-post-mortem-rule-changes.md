---
**Epic:** ST-98 — Apply the six post-mortem rule changes
**GitHub Issue:** [#98](https://github.com/bex-sugartown/sugartown/issues/98)
**Status:** In Progress
**Priority:** 🟡 Medium
**Merge strategy:** (b) Single close-out — one session, one batched commit
---

# ST-98 — Apply the six post-mortem rule changes

## Background

The governance post-mortem
(`docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md`) produced nine
recommendations. §8.2 routed them three ways: six are doc edits needing no tracking issue, one
(6.3) is held in reserve with nothing to do, and one (6.8) is the three-step build-back now
tracked as ST-95 to ST-97.

**The six doc edits were never applied.** Verified 2026-08-16 by grepping both target files for
each rule's distinguishing phrase: "consumer-first", "may not be widened", "registers are
generated", "surfaces, not sections", "one index, or one ID", "kill criterion". All six return
zero hits in `CLAUDE.md` and `docs/epic-template.md`.

They were routed as "no ticket needed", which is why nothing tracked them, and then nothing
happened. This epic exists to give them one.

## Objective

The six recommendations land as rules in their target files, in one session, as one batched
commit under the Instruction & Rule File Write Gate.

## Scope

| Rec | Rule | Target file |
|---|---|---|
| 6.1 | Consumer-first: no generator ships before the thing that reads its output exists | `CLAUDE.md` |
| 6.2 | A guard may not be widened to accommodate a breach. If a cap is exceeded, the surface is cut or the cap is retired with a stated reason | `CLAUDE.md` |
| 6.4 | Registers are generated or they do not exist | `CLAUDE.md` |
| 6.5 | Removal scope enumerates surfaces, not sections | `docs/epic-template.md` |
| 6.6 | One index, or one ID scheme | `docs/epic-template.md` |
| 6.7 | Every new process carries a kill criterion at birth, with a date to check it | `docs/epic-template.md` |

- [x] Get the §8.3 decision (below) before writing anything — layer: process
- [x] Run the ST-99 v1 QA walkthrough on the resulting diff before committing — layer: process (run 3, 2 findings, both fixed)
- [x] Draft all six as diffs from scratchpad copies — layer: process
- [x] Instruction & Rule File Write Gate: show the exact diff, get approval — layer: process
- [x] Apply and commit as one batch — layer: process

## Non-Goals

- **6.3**, the measure-the-whole-surface spec. No cap currently exists, so there is nothing to
  write. It stays held in reserve as a guardrail spec for whenever a cap returns.
- Reinstating the doc-budget cap itself. §7 lists it as explicitly not rebuilt.

## The decision this epic needs first

Post-mortem §8.3, stated as a standing note rather than resolved:

> 6.1, 6.2, 6.4 and 6.7 all add rules to the instruction surface, in a post-mortem about that
> surface growing too fast. Roughly 150 words against CLAUDE.md's 10,093. Defensible, but it is
> the same motion that started this, and warrants an explicit decision rather than an assumed
> one.

**Decided 2026-08-16 (Bex): apply all six.** Reasoning given: the rules are tested into rather
than assumed correct — ST-99's QA walkthrough runs on each change, and they are refined
iteratively and slowly rather than being frozen on first write. That answers §8.3's objection
directly: the surface grows, but not unexamined.

Two additions were made in the same pass, both outside the original six and both requested:

- **The `In Progress` transition is now an imperative step in CLAUDE.md**, not just a row in
  the status table. It was stated only in `docs/epic-template.md`, so a session following the
  close-out sequence never met it.
- **A portability rule**: write "issue", never "Linear issue" or "GitHub issue", except where
  the mechanics are genuinely platform-specific. Every rule here outlives the tracker it was
  written under. Swept across CLAUDE.md, the epic template, the mini-release prompt and the
  new-epic prompt; 58 older backlog docs still carry `**Linear Issue:**` and were deliberately
  left, to migrate when there is a reason to open them.

## Acceptance Criteria

- [x] Each of the six is either applied, or has a written reason it was not — all six applied
- [x] The §8.3 decision is recorded in this doc with its date
- [x] The Instruction & Rule File Write Gate was honoured: exact diff shown, explicit approval
      received, before any write to `CLAUDE.md` or `docs/epic-template.md`

## Where each rule landed

| Rec | Rule | Landed |
|---|---|---|
| 6.1 | Name the reader before building the writer | `CLAUDE.md` §Building a mechanism, rule 1 |
| 6.2 | A guard is never widened to fit a breach | `CLAUDE.md` §Building a mechanism, rule 2 |
| 6.4 | A register is generated or it does not exist | `CLAUDE.md` §Building a mechanism, rule 3 |
| 6.5 | Removal scope enumerates surfaces, not sections | `docs/epic-template.md` Pre-Execution gate |
| 6.6 | One index, or one ID scheme | `docs/epic-template.md` Pre-Execution gate |
| 6.7 | Kill criterion at birth | `docs/epic-template.md` Pre-Execution gate |

## Close-out state

**Not closeable yet.** CLAUDE.md §Issue Done = code on main requires the work to be on
`origin/main`, and these commits are local only pending the end-of-day push. #98 stays
`In Progress` until then. The rule is doing its job.

## Related

- **GitHub:** [#98](https://github.com/bex-sugartown/sugartown/issues/98)
- **Post-mortem:** `docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §6, §8.2, §8.3
- **Sibling:** ST-95 to ST-97 carry recommendation 6.8
- **QA:** ST-99 ([#99](https://github.com/bex-sugartown/sugartown/issues/99)) — run v1 on this epic's diff

## Sequencing

**This epic runs before ST-95.** Two of its six rules govern how ST-95 is built: 6.7 requires
a kill criterion at birth, and 6.1 forbids shipping a generator before its reader exists.
Building the liveness probes first means building them without the rules meant to constrain
them. 6.4 likewise governs ST-97. Decided 2026-08-16.
