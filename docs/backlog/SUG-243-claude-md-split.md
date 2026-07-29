---
**Epic:** SUG-243 — Shrink CLAUDE.md: rule IDs, plain English, and a size cap
**Linear Issue:** [SUG-243](https://linear.app/sugartown/issue/SUG-243/split-claudemd-hard-stopsconventions-vs-rationaleincident-history)
**Status:** Backlog
**Priority:** 🟠 Next — the earlier "⚪ Later" rating assumed this was a filing exercise. Rescoped 2026-07-29.
**Merge strategy:** (b) Single close-out. This epic restructures the file every other epic edits.
---

# SUG-243 — Shrink CLAUDE.md

## What changed in this rescope (2026-07-29)

The original epic moved rationale out of CLAUDE.md and forbade removing or rewriting any
rule. Evidence from SUG-221 says that shape does not work:

- SUG-221's rules audit spent about 534,000 tokens across 6 subagents. It retired 3 items,
  merged 1, and simplified 1. Net effect on CLAUDE.md: **+2 lines**.
- CLAUDE.md then grew from 768 to 862 lines in the following 8 days.
- The audit's own KPI note explains why the merge added lines: it kept all merged content
  verbatim and added cross-references.

Moving text without shortening it, and without capping the file, clears space that fills
back up in about two weeks. Three changes to scope follow:

1. **Rewriting rules to be shorter is now in scope.** It was a Non-Goal, and that is why the
   last pass added lines instead of removing them.
2. **A size cap is added**, enforced in CI. Nothing else acts on the rate of growth.
3. **Rules get stable IDs.** Incidents (`INC-NNN`), failure modes (`FM-C-NN`), and controls
   (`CTL-NNN`) all have them. Rules are the only governed object without one, and
   references are already drifting: `docs/conventions/` contains both
   `CLAUDE.md §CSS class pre-implementation` and
   `CLAUDE.md §CSS class pre-implementation reuse audit` for the same rule.

## Why IDs matter more than the move

Stable IDs make a rule referenceable. Today `docs/conventions/` cites the same rule under
two different headings, so a reference breaks silently whenever a heading is reworded.

The register answers questions nothing can answer today: which rules cite an incident that
no longer applies, which cross-references are dangling, which rules exist at all as a
countable set.

**It does not record when a rule last fired.** That was the original rationale, and the
2026-07-29 verification review removed it: nothing observes a rule firing, so the column
would have been populated once and decayed from that day with no updater and no staleness
check. A stale `last fired` is worse than an absent one, because the next audit would use
it to retire a rule that does fire. The next audit re-measures instead.

## Template adaptation

Process and documentation epic. No schema, GROQ, or render work. Phase 0 does not fire.

| Template section | Status |
|---|---|
| Component-Reuse Manifest, Doc Type Coverage, Schema Field Proposal, Query Layer, Schema Enum, Metadata Inventory, Themed Colour Variant, Migration Constraints, Human QA, Visual QA | N/A — no visual or data surface |

## Pre-Execution Completeness Gate

- [x] **Audit file paths** — `CLAUDE.md` **907 lines / 12,855 words**, `docs/conventions/`
  **24 files / 3,511 lines**, of which CLAUDE.md references 11 across 19 links. Measured
  2026-07-29 by `wc -l` / `wc -w`. The earlier "862 lines, re-measured 2026-07-29" was
  itself stale within hours — the file grew 45 lines the same day across three additions.
  **Record the command with any future figure, not just the number**
- [x] **Scope ↔ Non-Goals consistency** — checked; the Non-Goal forbidding rewrites is
  removed in this rescope, see below
- [ ] **Instruction & Rule File Write Gate pre-flight** — this epic rewrites CLAUDE.md.
  Show diffs section by section, not as one block.
- [x] **Verification review** — run 2026-07-29 as a subagent per
  `docs/conventions/verification-review.md`. Returned **2 blockers**, both resolved in this
  doc: (1) the cap measured lines in one file, defeatable by deleting blank lines (585 of
  907 are non-blank) or relocating text to `docs/conventions/` — now measures words across
  the referenced surface; (2) `rule-register.md`'s `Last fired` had no updater, reader or
  staleness check — column dropped. Also corrected three stale baselines. Proposed rows
  CTL-025 (kept, amended) and CTL-026 (dropped with the column)

## Objective

CLAUDE.md holds rules only: each with an ID, stated in plain English, short enough to read
in full every session. Rationale lives in the rule register and the incident log. A CI
check keeps the file under a fixed line count.

## Scope

**Phase 1 — Machinery (small, do first)**

- [ ] Add `pnpm validate:doc-budget`. **Measures the session-loaded surface, not one file:**
      CLAUDE.md plus every `docs/conventions/*.md` it references. Counts **words**, not
      lines — 322 of CLAUDE.md's 907 lines are blank, so a line cap is met by deleting
      blank lines with zero content removed. Wire into CI and add a probe to
      `scripts/validate-enforcement-liveness.js`
- [ ] **Set an interim cap in Phase 1 that the current tree passes.** `gateProbe` requires
      the control to exit 0 on a clean tree; a Phase 1 cap set to the Phase 3 target would
      make the probe report `PROBE INVALID` for the epic's whole duration. Phase 3 tightens
      it to the achieved figure plus 5%
- [ ] Add a row to `docs/ai/agentic-caucus/control-register.md` for the new gate (CTL-025).
      Its Bypass cell records that `MEMORY.md` is auto-loaded from outside the repo and no
      repo-side cap can reach it, and that the gate is CI-only, so a local commit is
      unchecked until CI
- [ ] Create `docs/ai/agentic-caucus/rule-register.md`, columns:
      `ID | Rule | Origin incident | Created | Class | Location`
      (**no `Last fired`** — see §Why IDs matter, and the 2026-07-29 verification review)
- [ ] `Class` is one of: `enforced-by-code`, `detectable` (code can flag a candidate, human
      decides), `human` (judgment only)

**Phase 2 — Enumerate and classify (the expensive read, done once)**

- [ ] Read CLAUDE.md in full. For every rule record: ID, current text, whether rationale is
      inline, and `Class`
- [ ] This single pass produces the move checklist, the register rows, and the
      code-vs-prose triage. Do not split it across epics

**Phase 3 — Rewrite and move**

- [ ] Rewrite each rule per `docs/conventions/instruction-writing-style.md`: instruction
      first, said once, no closing aphorism, rationale reduced to one clause
- [ ] Move incident narrative to the rule register or the incident log, linked by ID
- [ ] Retire the strikethrough convention. CLAUDE.md:772 keeps a retired rule's full text
      plus an explanatory paragraph. Retired rules move to the register
- [ ] Set the cap to the resulting line count plus 5%

**Phase 4 — Other high-traffic docs**

- [ ] Apply the style guide to `docs/epic-template.md` (6,782 words)
- [ ] Apply to the 3 largest `docs/conventions/` files
- [ ] Fix the two live `inert` uses: `CLAUDE.md:480`, `docs/epic-template.md:110`
      (measured 2026-07-29; the style guide shipped 2026-07-29 and these predate it)
- [ ] Make the style guide's own banned-word grep usable: it currently matches its own
      words-to-avoid table, so all 22 hits in `instruction-writing-style.md` are false
      positives and the check cannot be wired as written. Exclude the table or the file,
      then decide whether it becomes a validator or stays manual

## Non-Goals

- **Silent removal.** A rule may be cut only with a recorded decision, the same as
  SUG-221's disposition column. Shortening is not removal.
- **Reorganising `docs/conventions/` itself.**
- **Re-litigating what a rule means.** This pass changes wording and location, not
  substance. If a rule looks wrong, note it and raise it separately.

> **Reversed from the original epic:** "Rewriting rules for clarity while moving them" was a
> Non-Goal. It is now the main work.

## Technical Constraints

- Every rule moved out of CLAUDE.md is reachable from it by ID.
- A rule must be followable from its CLAUDE.md text alone, without opening the register. If
  it is not, it was compressed too far.
- Cap the session-loaded surface, not just one file, or text moves to
  `docs/conventions/` and the count looks better while nothing improves.

## Files to Modify

- `CLAUDE.md`
- `docs/ai/agentic-caucus/rule-register.md` (new)
- `docs/ai/agentic-caucus/control-register.md` (one row)
- `scripts/validate-doc-budget.js` (new), `scripts/validate-enforcement-liveness.js`,
  `package.json`, `.github/workflows/ci.yml`
- `docs/epic-template.md` and 3 `docs/conventions/*.md` files (Phase 4)

## Acceptance Criteria

- [ ] CLAUDE.md under 650 lines (from **907**). Report the actual figure and the command
      that produced it
- [ ] The session-loaded surface (CLAUDE.md + referenced `docs/conventions/*.md`) is
      smaller in **words** than at epic start (12,855 + 3,511 lines of conventions).
      A total that fell only because text moved between the two is a failed epic
- [ ] `pnpm validate:doc-budget` passes, is wired into CI, and has a liveness probe that
      proves it fails — confirmed by exceeding the cap deliberately, not assumed
- [ ] Every rule has an ID and a register row
- [ ] Zero rules lost: every ID from the Phase 2 enumeration resolves
- [ ] Three rules picked at random read correctly and are followable without the register
- [ ] Every section diff was shown and approved before writing

## Risks

- **Compressing a rule until it stops working.** Mitigation: the followable-without-the-
  register check, on a sample, before close-out.
- **The 650-line target driving deletion for its own sake.** The target is a goal; the
  Non-Goal on silent removal is the limit. If the honest result is 700, report 700.
- **Rewriting during an active rules review.** Do not restyle a rule whose substance is
  under review in another epic.
- **Approving one large diff.** Section by section, per the original epic's own risk note.

## Post-Epic Close-Out

1. Visual QA, Chromatic, data pipeline: N/A
2. Record the before and after line counts in this doc
3. Move to `docs/shipped/`
4. `/release`, not `/mini-release` — this changes the file every session reads
5. Transition SUG-243 to Done in Linear
6. Incident log: no incident, unless a rule is found to have been lost

## Follow-up

Node: how the house style for published writing spread into the tools nobody publishes.
The repo's instruction docs got written in the same voice as its articles, so CLAUDE.md
reached 12,855 words while the brand voice guide covering actual published content is
2,799 (both `wc -w`, 2026-07-29). Draft via `/write-node` after this epic ships, so the
before and after numbers are
real.
