---
**Epic:** SUG-264 — Wire the banned-word check as `validate:banned-words`
**GitHub Issue:** [#89](https://github.com/bex-sugartown/sugartown/issues/89) (legacy ID SUG-264; Linear retired 2026-09-05)
**Status and priority:** on the board ([project 1](https://github.com/users/bex-sugartown/projects/1)), not copied here
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
---

# SUG-264 — `validate:banned-words`

## Verified 2026-09-19

Re-measured against the repo and Sanity. Where this section disagrees with the text below, this section is current.

This doc predates SUG-284 and ST-95.

- **Removed by SUG-284 (2026-08-13), so these steps no longer apply:** `scripts/validate-enforcement-liveness.js`, `docs/ai/agentic-caucus/control-register.md` and its `CTL-NNN` rows, the `verification-reviewer` agent and CLAUDE.md §Verification review. They are struck through below.
- **The probe goes in `scripts/validate-liveness-probes.js`** (ST-95, `pnpm validate:liveness-probes`). No register row, by design.
- **12 hits in 10 files today, 0 `Canary`** (the guide's own command, `.claude/worktrees/` excluded): `CLAUDE.md:18`, `:414`; `.claude/rules/css-layout.md:25`; `.claude/skills/new-tool/docs/new-tool-prompt.md:93`, `:106`; `docs/conventions/user-story-conventions.md:20`, `taxonomy-listview-spec.md:30`, `human-gate-conventions.md:23`, `schema-conventions.md:175`; `case-study-north-star.md:135`; `docs/ai/agentic-caucus/incident-log.md:113`, `:134` (historical log, exemption candidate).
- **#126 is folded into this issue as step 1** (closed 2026-09-19). Its list was out of date: 2 of its 6 files were archived, and it missed 7 of today's hits.
- **The script must skip `.claude/worktrees/`.** Two local worktrees sit inside `.claude/` and add 770 hits locally that CI never sees.
- **The word list exists in two copies.** `docs/conventions/instruction-writing-style.md` (this repo) and `SUGARTOWN_DEV/conventions/instruction-writing-style.md` (shared, outside the repo). Same 17 words today. CI can only read the repo copy, so the script reads that one. Decide whether to add a check that the copies agree.

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

The check returned zero hits on 2026-07-30. It no longer does. Re-measured 2026-08-07 with
the guide's own command: **17 hits, 13 of them genuine** — 4 are the exempt defined term
`Canary`. Whether all 13 arrived since 2026-07-30, or the earlier zero was measured against a
different scope, is not established here — run `git log -S` per word at activation if it
matters.

| File | Word | Hits |
|---|---|---|
| `CLAUDE.md` :323, :449 | load-bearing | 2 |
| `docs/ai/agentic-caucus/control-register.md` :61, :72, :73 | inert | 4 |
| `docs/ai/agentic-caucus/control-register.md` :75 | load-bearing | 1 |
| `docs/ai/agentic-caucus/governance-coverage.md` :39, :81 | corpus | 2 |
| `docs/conventions/human-gate-conventions.md` :13 | corpus | 1 |
| `docs/conventions/taxonomy-listview-spec.md` :30 | load-bearing | 1 |
| `docs/conventions/user-story-conventions.md` :17 | load-bearing | 1 |
| `docs/ai/agentic-caucus/rule-register.md` :228 | failure class | 1 |

Wiring the gate without clearing these first lands it red on `main`.

## Objective

`pnpm validate:banned-words` fails when a banned word enters the agent-facing surface, with a
probe proving it fails, and this doc naming who reads the result.

## Scope

- [ ] ~~**Verification review first.** This adds a control, so `verification-reviewer` is
      blocking per CLAUDE.md §Verification review. Run it as a subagent~~ (removed by SUG-284)
- [ ] **Re-measure before writing the script, and clear the surface first.** Run the command
      and act on that day's output, not the table in Background. Each hit is either rewritten
      to a plain word or added to the exempt list with a reason. A gate wired over a red
      surface cannot land
- [ ] `scripts/validate-banned-words.js` — same scope and `-i` flag as the fixed command
- [ ] ~~`CTL-NNN` row in `docs/ai/agentic-caucus/control-register.md`~~ (removed by SUG-284)
- [ ] Probe in `scripts/validate-liveness-probes.js` (was `validate-enforcement-liveness.js`, removed by SUG-284). **Derive the injected violation
      from the check's own output, never a fixed value.** SUG-243 Phase 3 tightened the
      doc-budget cap from 22,000 to 20,150 words; headroom went from 243 to 963, and the
      probe's hardcoded 400-word injection silently stopped violating anything. It reported
      `STAYED GREEN against a known violation` while the gate itself was fine
- [ ] Wire into CI or pre-commit, and record which in this doc
- [ ] Decide whether adding a word to the list fails CI immediately or warns first

## Non-Goals

- Rewriting historical narrative in `docs/shipped/`, `docs/reviews/`, or `docs/drafts/`.
- Extending the word list. It is deliberately short and grows when a new one shows up.

## Files to Modify

- `scripts/validate-banned-words.js` (new)
- `scripts/validate-liveness-probes.js`, `package.json`, `.github/workflows/ci.yml`
- `docs/conventions/instruction-writing-style.md` (point the manual grep at the script)

## Acceptance Criteria

- [ ] `pnpm validate:banned-words` exits 0 on a clean tree and 1 on a deliberate violation,
      confirmed by running both
- [ ] The probe's violation size derives from the check's own output
- [ ] This doc names the reader and the bypass paths
- [ ] The word list is in exactly one place, not duplicated between guide and script

## Risks

- **A short list made load-bearing.** The guide says the list is not exhaustive. Failing CI on
  a list that grows by judgment could block unrelated work; the warn-first option exists for
  this reason.
- **Duplicating the word list.** If the script hardcodes the words, the guide's table and the
  script drift. Read the list from the guide, or keep it in the script and have the guide
  point at it.
