---
**Epic:** SUG-264 — Wire the banned-word check as `validate:banned-words`
**Linear Issue:** [SUG-264](https://linear.app/sugartown/issue/SUG-264/wire-the-banned-word-check-as-validatebanned-words)
**Status:** Backlog
**Priority:** ⚪ Later — the check works and returns zero; this makes it a gate
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
---

# SUG-264 — `validate:banned-words`

## Background

`docs/conventions/instruction-writing-style.md` carries a words-to-avoid table and a `grep`
to check against it. The guide shipped 2026-07-29; the grep was unusable from the start,
because it matched the guide's own table, so all 22 hits were false positives.

SUG-243 Phase 4 fixed the command (2026-07-30):

| Fix | Why |
|---|---|
| added `-i` | a capitalised "Brevity" at `.claude/skills/red-pen/SKILL.md:37` was being missed. SUG-243's own Scope said "the two live `inert` uses" when there were three hits |
| excluded `instruction-writing-style.md` | its hits are the words-to-avoid table and the prose defining each word |
| scoped to the agent-facing surface | `CLAUDE.md`, `docs/epic-template.md`, `docs/conventions/`, `docs/ai/agentic-caucus/`, `.claude/` |

Scanning all of `docs/` instead returns hits in **37 files**, nearly all shipped docs and
post-mortems whose historical narrative should not be rewritten. Measured 2026-07-30 with
`grep -rloiE "<list>" docs/ | wc -l`.

The check now returns zero hits. It stays manual, which is why this epic exists.

## Objective

`pnpm validate:banned-words` fails when a banned word enters the agent-facing surface, with a
probe proving it fails and a register row naming who reads the result.

## Scope

- [ ] **Verification review first.** This adds a control, so `verification-reviewer` is
      blocking per CLAUDE.md §Verification review. Run it as a subagent
- [ ] `scripts/validate-banned-words.js` — same scope and `-i` flag as the fixed command
- [ ] `CTL-NNN` row in `docs/ai/agentic-caucus/control-register.md`
- [ ] Probe in `scripts/validate-enforcement-liveness.js`. **Derive the injected violation
      from the check's own output, never a fixed value.** SUG-243 Phase 3 tightened the
      doc-budget cap from 22,000 to 20,150 words; headroom went from 243 to 963, and the
      probe's hardcoded 400-word injection silently stopped violating anything. It reported
      `STAYED GREEN against a known violation` while the gate itself was fine
- [ ] Wire into CI or pre-commit, and record which in the register row
- [ ] Decide whether adding a word to the list fails CI immediately or warns first

## Non-Goals

- Rewriting historical narrative in `docs/shipped/`, `docs/reviews/`, or `docs/drafts/`.
- Extending the word list. It is deliberately short and grows when a new one shows up.

## Files to Modify

- `scripts/validate-banned-words.js` (new)
- `scripts/validate-enforcement-liveness.js`, `package.json`, `.github/workflows/ci.yml`
- `docs/ai/agentic-caucus/control-register.md` (one row)
- `docs/conventions/instruction-writing-style.md` (point the manual grep at the script)

## Acceptance Criteria

- [ ] `pnpm validate:banned-words` exits 0 on a clean tree and 1 on a deliberate violation,
      confirmed by running both
- [ ] The probe's violation size derives from the check's own output
- [ ] Register row names the reader and the bypass paths
- [ ] The word list is in exactly one place, not duplicated between guide and script

## Risks

- **A short list made load-bearing.** The guide says the list is not exhaustive. Failing CI on
  a list that grows by judgment could block unrelated work; the warn-first option exists for
  this reason.
- **Duplicating the word list.** If the script hardcodes the words, the guide's table and the
  script drift. Read the list from the guide, or keep it in the script and have the guide
  point at it.
