---
**Epic:** SUG-265 — `/release` skips steps `/mini-release` runs
**Linear Issue:** [SUG-265](https://linear.app/sugartown/issue/SUG-265/release-skips-the-header-cap-and-chromatic-pre-check-that-mini-release)
**Status:** Backlog
**Priority:** 🟣 Soon — every `/release` repeats it until fixed
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
---

# SUG-265 — `/release` ↔ `/mini-release` step parity

## Background

Found at SUG-243's close-out, 2026-07-30. `docs/mini-release-prompt.md` carries two steps that
`docs/workflows/release-assistant-prompt.md` has no equivalent for:

| Mini-release step | What it does |
|---|---|
| §3B item 2 | Caps the `> Updated` header at the 8 most recent entries, moving older ones to `## Changelog` |
| §0A | Chromatic VRT pre-check when the epic touched CSS or components |

The header cap is not cosmetic. The mini-release prompt says trimming is part of the release,
not separate housekeeping, and records the line reaching **20,391 characters** by 2026-07-22.

v0.32.0 left it at **9 entries / 8,509 characters**, one over the cap. Corrected in `68fcc629`,
but only because a human asked whether `/release` had skipped anything. Chromatic was genuinely
N/A for that release, so the second half is unproven rather than known-broken.

## Scope

- [ ] Decide the model: does `/release` inherit the shared steps, or does each prompt carry its
      own copy?
- [ ] If shared, extract the common close-out steps to one file both reference
- [ ] If duplicated, add both steps to `release-assistant-prompt.md` Step 4 and register the
      two prompts as a must-match pair
- [ ] **Diff the two prompts' full step lists.** This epic names two gaps found by reading; a
      complete comparison has not been done

## Non-Goals

- Rewriting either prompt's gate structure. The 7-gate flow works.

## Files to Modify

- `docs/workflows/release-assistant-prompt.md`, `docs/mini-release-prompt.md` — both gated
  under the Instruction & Rule File Write Gate, so diffs are shown before any edit

## Acceptance Criteria

- [ ] A named mechanism keeps the two prompts in step, or a recorded decision says they diverge
      deliberately and why
- [ ] The full step-list diff is in this doc, not just the two gaps already known

## Risks

- **Extraction changes behaviour.** Both prompts are followed literally by an agent; moving a
  step to a referenced file risks it being skipped rather than read. Prefer duplication with a
  parity check over indirection if that risk looks real.
