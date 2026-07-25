---
**Epic:** SUG-243 — Split CLAUDE.md (hard stops/conventions vs. rationale/incident history)
**Linear Issue:** [SUG-243](https://linear.app/sugartown/issue/SUG-243/split-claudemd-hard-stopsconventions-vs-rationaleincident-history)
**Status:** Backlog
**Priority:** ⚪ Later — worth doing, not urgent, and must run last in this batch
**Merge strategy:** (b) Single close-out — this epic should not be interleaved with the
other five in this batch, since it restructures the file all of them are actively
editing. See Risks.
---

# SUG-243 — Split CLAUDE.md

CLAUDE.md holds hard stops, conventions, tooling notes, and incident post-mortems in one
file, and grows by appending. At 797 lines it is still read in full every session, but
the trend line doesn't stay that way for free. This epic keeps hard stops and
conventions in CLAUDE.md; rationale and incident history move to `docs/conventions/`
(22 files already exist there — the destination isn't new, just under-used for this
purpose) and are referenced by path.

## Template adaptation — declared once

Process/documentation epic. No Sanity schema, GROQ, or render-layer work.

| Template section | Status | Reason |
|---|---|---|
| Component-Reuse Manifest | N/A | No visual surface |
| Doc Type Coverage Audit | N/A | No content doc type touched |
| Schema Field Proposal | N/A | No schema field added |
| Query Layer Checklist | N/A | No GROQ touched |
| Schema Enum Audit | N/A | No enum field rendered |
| Metadata Field Inventory | N/A | No metadata surface touched |
| Themed Colour Variant Audit | N/A | No themed surface touched |
| Migration Script Constraints | N/A | No data transform |
| Human QA Walkthrough | N/A | No CSS/layout/rendering |
| Visual QA Gate | N/A | No visual output |

Phase 0 does not fire.

## Pre-Execution Completeness Gate [REQUIRED]

- [x] **Correct audit file paths** — `CLAUDE.md` (797 lines, confirmed), `docs/conventions/`
  (22 files present, confirmed) — both verified during the originating audit
- [x] **Scope ↔ Non-Goals consistency** — checked
- [ ] **Instruction & Rule File Write Gate pre-flight** — this entire epic is a rewrite
  of CLAUDE.md. Diff must be shown and approved before writing — not a single diff, but
  section-by-section, since a rewrite this size approved as one giant block defeats the
  point of the gate.

## Context [REQUIRED]

`CLAUDE.md` currently does four jobs in one file: hard stops (things that block
execution), conventions (patterns to follow), tooling notes (how a script or validator
works), and incident post-mortems (narrative explaining why a rule exists, often
including a specific SUG-N story). New rules get appended, so the file grows in the
direction of eventually being long enough that it stops being read in full — a form of
the same "planning-layer staleness" already flagged elsewhere in this repo's own
conventions.

This is the last epic in the SUG-239–SUG-243 batch specifically because every other epic
in that batch edits CLAUDE.md directly. Running this epic mid-batch would mean later
epics' diffs are computed against a moving target.

## Objective [REQUIRED]

After this epic, `CLAUDE.md` holds hard stops and conventions only — short enough to be
read in full each session — with rationale and incident history moved to
`docs/conventions/` and referenced by path from the rule they support. Every rule that
was moved is referenced from CLAUDE.md by a one-line pointer; zero rules are lost, only
relocated.

## Scope [REQUIRED]

- [ ] Read CLAUDE.md in full and classify every section: **Hard stop** (blocks
  execution, stays), **Convention** (a pattern to follow, stays, but strip inline
  incident narrative if present), or **Rationale/incident** (explains *why* via a
  specific story — e.g. "SUG-192 bit three of the audit rows..." — moves out)
- [ ] For each Rationale/incident section, find or create the matching
  `docs/conventions/*.md` file and move the narrative there in full, preserving the
  specific detail (commit hashes, SUG-N references, dates) that makes it a real
  post-mortem rather than a generic rule
- [ ] Replace the moved narrative in CLAUDE.md with a one-line rule statement + a path
  reference to the full rationale (matching the existing pattern already used for
  `docs/conventions/vqa-workflow.md` and similar)
- [ ] Enumerate every rule before moving anything — a checklist of "rule → destination"
  — and verify after the move that every item on the checklist is present somewhere
  (CLAUDE.md as a pointer, `docs/conventions/` as the full text)
- [ ] Consolidate the reuse rule to exactly one canonical location if it's currently
  duplicated across CLAUDE.md and `docs/epic-template.md` (verify first — don't assume
  the duplication is exactly as described in the originating audit's Simplification S1
  without re-checking against the current file state at execution time)

## Non-Goals [REQUIRED]

- **Removing or weakening any rule.** This epic relocates rationale, it does not delete
  a hard stop or a convention. If a rule seems safe to remove entirely while doing this,
  that's a separate epic's decision, not a side effect of this one.
- **Rewriting rules for clarity while moving them.** Move the text as-is unless a
  factual error is found (in which case, fix and note the correction, same as any other
  epic's "verify before citing" discipline) — this is a structural move, not a rewrite
  pass.
- **Reorganizing `docs/conventions/` itself.** New files land using the existing naming
  pattern; no epic-scope reshuffling of what's already there.

## Technical Constraints [REQUIRED]

- Every rule moved out of CLAUDE.md must be referenced from it by path — a rule with no
  pointer back is a rule a future session won't find.
- `grep -c "reuse" CLAUDE.md docs/epic-template.md` should show references after this
  epic, not duplicated rule text, if consolidation applies.

## Files to Modify [REQUIRED]

- `CLAUDE.md` — line count reduced, rationale/incident sections replaced with pointers
- `docs/conventions/*.md` — new files for relocated rationale (exact filenames determined
  during execution, from the enumeration checklist)

## Deliverables [REQUIRED]

1. `CLAUDE.md`, restructured: hard stops + conventions only
2. Every relocated rule present in full at its new `docs/conventions/` home
3. A before/after line count for CLAUDE.md, reported in this doc at close-out

## Acceptance Criteria [REQUIRED]

- [ ] `CLAUDE.md` line count reduced — report before (797) and after
- [ ] Every rule moved out of CLAUDE.md is referenced from it by path — zero rules lost,
  verified against the pre-move enumeration checklist
- [ ] `grep -c "reuse" CLAUDE.md docs/epic-template.md` shows references, not duplicated
  rule text (if consolidation applies after re-verification)
- [ ] A rule picked at random from the pre-move enumeration is spot-checked: confirm it
  reads correctly in its new location and its CLAUDE.md pointer resolves to it
- [ ] Every section-level diff was shown and approved before writing

## Risks / Edge Cases [REQUIRED]

- **This epic rewrites the process every other epic in this batch closes out with.**
  Run it last, and only after SUG-239 through SUG-242 have merged — not concurrently.
  Do not run any other epic's close-out against a half-migrated CLAUDE.md.
- **Losing a rule silently during the move.** The zero-rules-lost AC is the mitigation:
  enumerate before moving, verify after. A rule that existed in CLAUDE.md and exists
  nowhere post-move is a regression, not a simplification.
- **Approving the whole diff as one block defeats the gate's purpose.** Given the size
  of this rewrite, request section-by-section approval rather than one giant diff — the
  Instruction & Rule File Write Gate exists to let a human actually read what's changing,
  and a 400-line single diff undermines that regardless of technical compliance.

## Post-Epic Close-Out [REQUIRED]

1. Visual QA gate — N/A
2. Chromatic — N/A
3. Data pipeline gap check — N/A
4. Move `docs/backlog/SUG-243-claude-md-split.md` → `docs/shipped/SUG-243-claude-md-split.md`
5. Confirm clean tree
6. `/release` rather than `/mini-release` — this is a process-surface change to the file
   every session reads, and warrants a minor bump per CLAUDE.md's own existing
   mini-release-vs-release convention
7. Transition SUG-243 to **Done** in Linear
8. Sprint/batch complete once SUG-239 through SUG-243 have all shipped
