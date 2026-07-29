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

Most of SUG-221's cost went on working out when each rule last fired, by reading shipped
epic docs. Nothing records it. A rule register with a `last fired` field makes that a
lookup, so the next audit is much cheaper.

It also answers questions nothing can answer today: which rules have never fired, which
cite an incident that no longer applies, which cross-references broke when a heading was
renamed.

## Template adaptation

Process and documentation epic. No schema, GROQ, or render work. Phase 0 does not fire.

| Template section | Status |
|---|---|
| Component-Reuse Manifest, Doc Type Coverage, Schema Field Proposal, Query Layer, Schema Enum, Metadata Inventory, Themed Colour Variant, Migration Constraints, Human QA, Visual QA | N/A — no visual or data surface |

## Pre-Execution Completeness Gate

- [x] **Audit file paths** — `CLAUDE.md` **862 lines** (re-measured 2026-07-29; the earlier
  "797 lines, confirmed" is stale), `docs/conventions/` 24 files
- [x] **Scope ↔ Non-Goals consistency** — checked; the Non-Goal forbidding rewrites is
  removed in this rescope, see below
- [ ] **Instruction & Rule File Write Gate pre-flight** — this epic rewrites CLAUDE.md.
  Show diffs section by section, not as one block.

## Objective

CLAUDE.md holds rules only: each with an ID, stated in plain English, short enough to read
in full every session. Rationale lives in the rule register and the incident log. A CI
check keeps the file under a fixed line count.

## Scope

**Phase 1 — Machinery (small, do first)**

- [ ] Add `pnpm validate:doc-budget`: fails if CLAUDE.md exceeds its cap. Wire into CI and
      add a probe to `scripts/validate-enforcement-liveness.js`
- [ ] Add a row to `docs/ai/agentic-caucus/control-register.md` for the new gate
- [ ] Create `docs/ai/agentic-caucus/rule-register.md`, columns:
      `ID | Rule | Origin incident | Created | Last fired | Class | Location`
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

- [ ] CLAUDE.md under 650 lines (from 862). Report the actual figure
- [ ] `pnpm validate:doc-budget` passes, is wired into CI, and has a liveness probe
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
reached 12,246 words while the brand voice guide covering actual published content is
2,770. Draft via `/write-node` after this epic ships, so the before and after numbers are
real.
