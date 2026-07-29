---
**Epic:** SUG-263 — Decide Chromatic's gating status (`--exit-zero-on-changes` never blocks)
**Linear Issue:** [SUG-263](https://linear.app/sugartown/issue/SUG-263/decide-chromatics-gating-status-exit-zero-on-changes-never-blocks)
**Status:** Backlog
**Priority:** ⚪ Later — small, but it is a published claim that is currently wrong
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each
---

# SUG-263 — Decide Chromatic's gating status

Decide whether Chromatic blocks or advises, then make the docs, the flag and the control
register agree.

## Background

`pnpm --filter storybook chromatic --exit-zero-on-changes` reports visual diffs and always
exits 0. CLAUDE.md's close-out step 4 reads as though Chromatic gates, and
`/platform/governance` counts it among the enforcement checkpoints.

Raised as S5 in `docs/drafts/workflow-audit-v0.3-grounded.md` (2026-07-24): "That is a
defensible choice, but the map should say 'advisory' and CLAUDE.md close-out step 4 should
stop reading as though it gates. Either recolour it or drop the flag. Do not leave the docs
and the flag disagreeing." Undecided since.

Same fault class as CTL-021 (`/platform/governance` published "30 checkpoints · 0 gaps"
with no date and no reproducing command): a governance surface asserting an enforcement
property that the code does not provide.

## Scope

- [ ] Decide: advisory or blocking. This is a human decision, not a finding
- [ ] **If advisory** — relabel in CLAUDE.md close-out step 4 and on `/platform/governance`;
      record in the control register as `convention` with a reader and a re-read date
- [ ] **If blocking** — drop `--exit-zero-on-changes`, add a liveness probe proving it
      fails on a real diff, record as `enforced-by-code`
- [ ] Either way: one control-register row, complete, so `validate:controls` passes

## Non-Goals

- **Changing Chromatic's snapshot budget or TurboSnap config.** SUG-191 owns that.
- **Auditing which stories run.** SUG-192 owns that.

## Acceptance Criteria

- [ ] The flag and CLAUDE.md close-out step 4 agree
- [ ] `/platform/governance` describes Chromatic at its true enforcement class
- [ ] A control-register row exists with a probe (or an explicit reason it has none), a
      named reader, and a re-read date
- [ ] `pnpm validate:controls` passes

## Post-Epic Close-Out

1. Visual QA: N/A unless the governance page copy changes — if it does, the red-pen gate
   for published governance statistics fires
2. Chromatic: N/A
3. Move to `docs/shipped/`
4. `/mini-release`
5. Transition SUG-263 to Done
6. Incident log: no incident unless the decision is "blocking", in which case a gate was
   found not firing
