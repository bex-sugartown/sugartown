---
**Epic:** ST-100 — Move epic close-out to epic finish, keep push and spend at EOD
**Issue:** [#100](https://github.com/bex-sugartown/sugartown/issues/100)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# ST-100 — Move epic close-out to epic finish, keep push and spend at EOD

Re-cut the close-out / EOD boundary along what costs money rather than what happens last, so an
epic that finishes at 11am is finished at 11am.

## Background

**Close-out cannot complete without a push today.** Two steps require the network:

- **Step 1b** requires `pnpm test:smoke` locally **and** "the CI run for the merged commit
  concludes `success`". CI triggers on `push: branches: [main]` and `pull_request:`, so there is
  no CI run without one or the other.
- **§Issue Done = code on main** requires the work to be on `origin/main` before the issue moves
  to Done.

Pushing `main` triggers a Netlify production deploy regardless of CI, so the cheapest honest
close-out is one that waits for `/eod`. That is what happened on 2026-08-16: #98 finished, was
correct, was committed, and stayed `In Progress` because closing it would have broken the rule.

**This is not a new discovery.** SUG-265 Part B
(`docs/backlog/SUG-265-release-prompt-step-parity.md`, [#90](https://github.com/bex-sugartown/sugartown/issues/90),
filed 2026-07-30) documents the same collision with harder evidence: **two production deploys in
one day**, the first (`main@02599e2`, 05:27) pushed *solely* to obtain CI run `30542636194` and
touching nothing under `apps/web/src` — Netlify redeployed byte-identical output — and a second
at `/eod` carrying the real change.

SUG-265 also records two findings this epic inherits rather than rediscovers:

- **Two rules disagree and nothing names which wins.** §Mid-epic commit checkpoints sets the
  push threshold at "~15 unpushed commits, or at any session end"; there were 12, mid-session,
  so it said wait. Step 1b said it needed CI to close.
- **A commit can suppress its own CI run.** GitHub scans the whole commit message for the skip
  marker, not just the subject. A SUG-256 commit whose *body quoted* `[skip ci]` produced no CI
  run at all. Writing it `skip-ci` avoids this, and nobody currently knows that.

## Objective

The close-out sequence splits at the cost boundary. Mini-release, the issue transition to Done,
and the `docs/backlog/` → `docs/shipped/` move all complete when the epic's work is finished and
committed locally. Push, Netlify deploy, Chromatic and CI verification all belong to `/eod`, and
running `/eod` remains the only action in the day that spends credits.

Touches process and instruction files only: `CLAUDE.md`, `docs/epic-template.md`,
`docs/workflows/eod-prompt.md`, `docs/mini-release-prompt.md`,
`docs/workflows/release-assistant-prompt.md`, and the `/eod` skill. No schema, no GROQ, no
`apps/web` render code, no content.

## Scope

Eight items, above the sizing gate, so the scope-to-phase mapping is in §Phases.

- [ ] **S1 — Split step 1b.** `pnpm test:smoke` locally gates the epic; the CI conclusion moves
      to `/eod`, which already watches the run to a conclusion (Phase 3 step 5) — layer: process
- [ ] **S2 — Redefine Done.** Rewrite §Issue Done = code on main so Done means "committed to
      local `main`, work complete", with the origin/main guarantee re-homed to `/eod` — layer: process
- [ ] **S3 — Consolidate Chromatic to one place.** It currently sits in three: close-out step 4
      (Tier 1), `/mini-release` §0A (with an existing "Defer to /eod" option), and `/eod` Phase 3
      step 2. Decide which owns the Tier 1 human gate — layer: process
- [ ] **S4 — Add a "Done but unpushed" signal.** Removing the origin/main precondition removes
      the thing that currently keeps unpushed work visible. Name the replacement — layer: process/tooling
- [ ] **S5 — Define the reopen path.** If `/eod`'s CI run concludes `failure` on a day whose
      epics are already Done, state what happens to those issues — layer: process
- [ ] **S6 — Reconcile the two disagreeing push rules** (§Mid-epic commit checkpoints threshold
      vs. close-out's CI need), stating which governs, in both places. Inherited from SUG-265 — layer: process
- [ ] **S7 — Record the `[skip ci]` trap** where a session writing a commit message will meet it,
      and adopt `skip-ci` as the safe spelling. Inherited from SUG-265 — layer: process
- [ ] **S8 — Disposition SUG-265 Part B.** This epic absorbs it; Part A (prompt parity) is
      unrelated and stays. Re-scope [#90](https://github.com/bex-sugartown/sugartown/issues/90)
      to Part A only, or close it into this — layer: process

## Phases

**Phase 1 — Decide (the epic is mostly this).** S1, S2, S3, S5, S6, S8. Six interacting rule
decisions; none of the edits are hard once they are made. Ships: a decisions table in this doc,
approved, with each decision naming the file it lands in.

**Phase 2 — Apply.** The rule-file edits for every Phase 1 decision, as one batch under the
Instruction & Rule File Write Gate, with an ST-99 v1 walkthrough on the diff. Also S7. Ships: the
edits, committed.

**Phase 3 — Prove it.** Run one real epic end to end under the new boundary and record what
happened. Also S4, whose right shape is only visible once the new flow has run once. Ships: a
recorded run, and the signal mechanism.

## Acceptance criteria

- [ ] An epic that finishes mid-morning reaches Done, mini-released, and moved to
      `docs/shipped/`, with zero network calls and zero credits spent
- [ ] `/eod` remains the only step in the day that pushes, deploys, or runs Chromatic
- [ ] Step 1b's CI half is verifiably still enforced, just later: name the step in
      `docs/workflows/eod-prompt.md` that fails the day if the run concludes `failure`
- [ ] Every rule that currently says "origin/main" or "merged" as a Done precondition is either
      rewritten or has a written reason it stays
- [ ] A named signal exists for "epic is Done, code is not pushed", and it is demonstrated
      firing at least once
- [ ] The reopen path for a red EOD CI run is written down, including who moves the issue
- [ ] SUG-265 Part B has a recorded disposition, and [#90](https://github.com/bex-sugartown/sugartown/issues/90)
      reflects it
- [ ] ST-99 v1 walkthrough run on the Phase 2 diff, findings in the commit

## Impact analysis — what else this touches

Answering the invocation's "what else does this impact, what are blockers". Each row was checked
against the file named, not inferred.

| # | Impact | Where | Severity |
|---|---|---|---|
| I1 | Step 1b's CI requirement is the hard blocker | `CLAUDE.md:43` | **Blocker** — resolved by S1 |
| I2 | Done requires `origin/main` | `CLAUDE.md` §Issue Done = code on main | **Blocker** — resolved by S2 |
| I3 | "Done but unpushed" is invisible on the board | new failure mode created by S2 | **High** — S4 |
| I4 | Done becomes reversible: a red CI at EOD leaves a Done epic with broken code | new failure mode | **High** — S5 |
| I5 | Chromatic lives in three places, one of them a Tier 1 gate | close-out step 4, `/mini-release` §0A, `/eod` Phase 3.2 | Medium — S3 |
| I6 | `/switch`: finish an epic, switch machines without `/eod`, and the other machine has nothing while the board reads Done | `.claude/skills/switch` | Medium |
| I7 | `stats.linearRoadmap` feeds `/platform/governance`; Done-before-live makes published completion counts lead reality | `apps/web/scripts/stats/linear.js` | Medium — ties to ST-96 |
| I8 | `docs/shipped/` move happens before the code is pushed; reopening means moving the doc back | close-out step 6 | Low |
| I9 | Morning briefing's "previous session didn't run `/eod`" flag still works, but its meaning shifts from "unfinished" to "unpublished" | `docs/workflows/morning-housekeeping-prompt.md` | Low |
| I10 | Mini-release version bumps accumulate locally when several epics finish in one day | `docs/mini-release-prompt.md` | Low — git history is linear, already covered |
| I11 | A commit body quoting the skip marker suppresses its own CI run | verified 2026-08-02, SUG-265 | Low — S7 |
| I12 | Netlify branch-deploy and deploy-preview settings are unknown; `netlify.toml` is fully commented out and config lives in the UI | SUG-265, unresolved | Unknown — inherited |

**The genuine trade this epic makes:** today's rule is strict because it prevents calling
something Done that is stranded where nobody can see it (SUG-231: 48 commits on one disk for two
days). Relaxing the precondition does not remove that risk, it moves it — from "cannot mark Done"
to "marked Done, still on one disk". S4 exists because the epic is not honest without it, and
**Phase 2 should not merge before S4 has a named mechanism**, even if building it waits for
Phase 3.

## Open questions for activation

1. **Does a PR run satisfy step 1b?** SUG-265 raises this and does not settle it: a PR run tests
   the merge candidate, not the merge commit. If S1 keeps any CI requirement at close-out, this
   decides whether a `wip/<epic>` → PR path is viable. If S1 moves CI wholly to `/eod`, the
   question disappears — note which outcome applies.
2. **Does Done mean "work complete" or "shipped"?** S2 chooses. Naming it "work complete" makes
   the board a record of effort; "shipped" makes it a record of what users have. Sugartown has
   used the second for a year, and the priority queue is read by `/platform/governance`.
3. **Is a sixth status the cleaner answer?** `On Hold` was added 2026-08-16, so the option set is
   no longer frozen. A `Done (unpushed)` or `Ready to ship` state would preserve both meanings at
   the cost of a state everyone has to learn. Decide against it explicitly if rejected.

## Kill criterion

Required by the rule this epic's sibling ST-98 just added (post-mortem 6.7).

**If, after 30 days, no epic has reached Done before its `/eod` push — or the "Done but unpushed"
signal has fired without anyone acting on it — revert to the current sequence and delete the
split.** Check date: 30 days after Phase 2 merges. The failure this guards against is a boundary
that is more complicated than the friction it removed.

## Human QA Walkthrough

Not applicable — no shared CSS, token, or multi-page component changes. This epic edits
instruction files only.

## Technical notes

- **Content Write Gate:** does not fire. No Sanity writes.
- **Instruction & Rule File Write Gate:** fires on every Phase 2 edit. `CLAUDE.md`,
  `docs/epic-template.md`, `docs/conventions/`, and `.claude/skills/**` are all in scope, so
  diffs are produced from scratchpad copies and approved before any write.
- **ST-99 v1 walkthrough** runs on the Phase 2 diff before commit. Prior runs show the dominant
  defect class here is a renamed heading orphaning inbound cross-references — this epic renames
  or rewrites at least one section heading (§Issue Done = code on main), so grep for inbound
  pointers before committing.
- **Activation audit:** read `docs/workflows/eod-prompt.md` Phase 3 in full before editing it.
  Steps 2 and 5 already do Chromatic and CI verification; S1 and S3 extend existing steps rather
  than adding new ones, and the epic should not duplicate what is there.
- **Activation audit:** read `.github/workflows/ci.yml` triggers and confirm they are still
  `push: branches: [main]` plus `pull_request: branches: [main]` before relying on open question 1.
- **Upstream dependencies:** none blocking. ST-98 has shipped the rules this epic is measured
  against. SUG-265 Part B overlaps and is handled by S8 rather than by waiting.

## Model & Mode [REQUIRED]

**`/model opus` with plan mode for Phase 1**, then `/model sonnet` for Phases 2 and 3. Phase 1 is
six interacting rule decisions where the wrong call creates a failure mode rather than a bug —
I3, I4 and I6 are all consequences of getting S2 wrong. That is the ambiguity the plan-first
workflow exists for. Phases 2 and 3 are text edits against an approved decisions table, which is
ordinary Sonnet work.

## Non-Goals

- **Changing what triggers a Netlify deploy.** A push to `main` deploys; that is the constraint
  this epic works within, not one it removes.
- **Branch protection on `main`.** Deliberately absent (SUG-255) so merge-as-you-go is not
  blocked. Unchanged here.
- **SUG-265 Part A** (`/release` vs `/mini-release` prompt parity). Unrelated to the cost
  boundary and stays on [#90](https://github.com/bex-sugartown/sugartown/issues/90).
- **Rewriting the 7-gate release flow.** It works.
- **Reducing the number of deploys per day below one.** One deploy at `/eod` is the target, not
  zero.

## Related

- **GitHub:** [#100](https://github.com/bex-sugartown/sugartown/issues/100)
- **Absorbs:** SUG-265 Part B — [#90](https://github.com/bex-sugartown/sugartown/issues/90),
  `docs/backlog/SUG-265-release-prompt-step-parity.md`
- **QA:** ST-99 — [#99](https://github.com/bex-sugartown/sugartown/issues/99)
- **Sibling:** ST-98 — [#98](https://github.com/bex-sugartown/sugartown/issues/98), whose
  close-out was the trigger
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist,
  Schema Enum Audit, and Files to Modify at activation time
