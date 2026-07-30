---
**Epic:** SUG-267 — Rule-file write gate has no artifact between edit and commit
**Linear Issue:** [SUG-267](https://linear.app/sugartown/issue/SUG-267/rule-file-write-gate-has-no-artifact-between-edit-and-commit)
**Status:** Backlog
**Priority:** ⚪ Later — investigation; a valid outcome is "cannot be closed"
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
---

# SUG-267 — Write-gate artifact

## Background

Filed 2026-07-30 after `RULE-033` was skipped once during SUG-243. **This may conclude that no
mechanism is worth building.** The point is to decide that deliberately rather than leave it a
standing assumption.

The gate held six times in one session and was skipped on the seventh. Not from misreading — the
rule says "never" and pre-empts the "but the edit is correct" excuse — but from method drift:
rounds 1–5 wrote to a scratchpad copy and diffed it, round 6 wrote straight to the repo path. A
copy-first clause landed in `02599e2c` as a method nudge.

Approval happens in conversation, which a pre-commit hook cannot see. A hook could only prompt,
and would not have caught this failure, which happened before commit and was self-caught. The
window between edit and commit produces no artifact anything can read.

## Scope

- [ ] Enumerate candidate mechanisms and test rather than assume: a `PreToolUse` hook on
      Edit/Write over the gated paths, blocking unless a marker records an approved diff hash; a
      session-scoped approvals ledger the hook reads; a post-hoc auditor flagging commits that
      touch gated paths with no approval record
- [ ] For each, state what breaks it. **False positives are worse than the current state**,
      because they train the operator to bypass
- [ ] Run `verification-reviewer` on any proposal — this adds a control, so the review is blocking
- [ ] If nothing is worth its false-positive cost, record that in `rule-register.md` §RULE-033 so
      the question is answered rather than reopened each time the gate is missed

## Non-Goals

- Widening or rewording the gate. The wording is not the failure mode; checked at filing.
- Removing the copy-first clause, which is the mitigation already in place.

## Acceptance Criteria

- [ ] Either a mechanism with a probe and a control-register row, or a recorded decision in
      §RULE-033 that none is justified, with the reasoning

## Risks

- **Building a gate that mostly cries wolf.** Every gated-path edit in a legitimate approved flow
  would hit it. If the false-positive rate is not near zero, the honest answer is no mechanism.

## Notes

One instance of a broader measured fact: **54 of 60 CLAUDE.md rules are `convention` class**
against 19 of 25 `enforced-by-code` in the control register, and `pnpm mttn` reports **0 of 11
logged incidents caught by a gate**. This epic asks only whether *this* rule is different,
because it guards the file defining all the others.
