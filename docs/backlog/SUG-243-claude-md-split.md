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
   references are already dangling — see §Why IDs matter for the two measured cases.

## Why IDs matter more than the move

Stable IDs make a rule referenceable. A citation by heading text breaks silently the moment
the heading is reworded, and two such citations are dangling right now. Both measured
2026-07-30 by joining wrapped lines and extracting every `CLAUDE.md §…` citation under
`docs/` and `.claude/` (74 citation lines, 71 distinct headings cited):

```bash
for f in $(grep -rl "CLAUDE\.md §" docs/ .claude/ | grep -v node_modules); do
  tr '\n' ' ' < "$f" | grep -o "CLAUDE\.md §[^).,;]*" | sed "s|^|$f :: |"
done | sort -u
```

| Cited heading | Actual heading | Where |
|---|---|---|
| `§Phase 0 hard-stop (mockup gate)` | `§Phase 0 hard-stop (visual spec gate)` (CLAUDE.md:223) | `docs/diagrams/redpen-workflow-current-state.md:25`, and `docs/backlog/SUG-208:27` cites "the Phase 0 mockup gate in CLAUDE.md" |
| `§Linear Done = code in remote` | `§Linear Done = code on main` (CLAUDE.md:113) | `docs/shipped/zArchive/2026/SUG-68:156` |

The first case is the strongest available argument for IDs, because it survived a deliberate
cleanup. SUG-242 renamed that heading and made a zero-results grep for `mockup gate` an
acceptance criterion (`docs/shipped/SUG-242-vspec-rename-prototype-trigger.md:226`) — but the
grep enumerated six files by hand, and `docs/diagrams/` was not among them. A hand-listed
file set is not a reference check. An ID would have made it one.

**Corrected 2026-07-30.** This section previously claimed `docs/conventions/` cited the same
CSS rule under two different headings. It does not: `css-class-naming.md:131`,
`detail-page-recipe.md:10` and `design-handoff-template.md:70` all cite
`§CSS class pre-implementation reuse audit` correctly — the apparent second heading was a
line wrap in `design-handoff-template.md`, where line 70 ends mid-phrase and line 71 continues
`reuse audit`. The claim was read off a `grep -rn` whose output was truncated by the wrap,
which is the failure mode CLAUDE.md §Verify before citing describes.

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

- [x] Add `pnpm validate:doc-budget`. **Measures the session-loaded surface, not one file:**
      CLAUDE.md plus every `docs/conventions/*.md` it references. Counts **words**, not
      lines — 322 of CLAUDE.md's 907 lines are blank, so a line cap is met by deleting
      blank lines with zero content removed. Wire into CI and add a probe to
      `scripts/validate-enforcement-liveness.js`
- [x] **Set an interim cap in Phase 1 that the current tree passes.** Set to 22,000 words against a measured 21,757. `gateProbe` requires
      the control to exit 0 on a clean tree; a Phase 1 cap set to the Phase 3 target would
      make the probe report `PROBE INVALID` for the epic's whole duration. Phase 3 tightens
      it to the achieved figure plus 5%
- [x] Add a row to `docs/ai/agentic-caucus/control-register.md` for the new gate (CTL-025).
      Its Bypass cell records that `MEMORY.md` is auto-loaded from outside the repo and no
      repo-side cap can reach it, and that the gate is CI-only, so a local commit is
      unchecked until CI
- [x] Create `docs/ai/agentic-caucus/rule-register.md`, columns:
      `ID | Rule | Origin incident | Created | Class | Location`
      (**no `Last fired`** — see §Why IDs matter, and the 2026-07-29 verification review).
      Written 2026-07-30, 82 lines, register table empty by design. **IDs are `RULE-NNN`**,
      decided 2026-07-30: the prefix is cited from `CLAUDE.md`, the one file this epic exists
      to keep readable in full, and nothing parses a fixed-width prefix (`FM-C-NN` already
      breaks it; `validate-control-register.js` hardcodes the register path). The file states
      outright that no script reads it, so it does not read as enforced by sitting beside a
      register that is
- [x] **`Class` reuses the control register's four values**, decided 2026-07-30:
      `enforced-by-code`, `measured`, `convention`, `roadmap`. The originally scoped
      `enforced-by-code / detectable / human` would have put a second vocabulary one
      directory from the first, sharing exactly one word, and
      `validate-control-register.js:57` already validates the four. `convention` covers
      what `human` meant (true by discipline). **`detectable` is dropped** — a real
      category (code can flag a candidate, a human decides) with no counterpart in the
      four; revisit if Phase 2's enumeration finds rules that genuinely need it

**Phase 2 — Enumerate and classify (the expensive read, done once)**

- [x] Read CLAUDE.md in full. For every rule record: ID, current text, whether rationale is
      inline, and `Class`. **Done 2026-07-30 against CLAUDE.md at 907 lines. 60 rules**,
      `RULE-001`..`RULE-060`, contiguous, in `docs/ai/agentic-caucus/rule-register.md`
- [x] This single pass produces the move checklist, the register rows, and the
      code-vs-prose triage. Do not split it across epics

**Definition settled:** one rule = one CLAUDE.md heading. Citations are written
`CLAUDE.md §Heading`, so IDs replace them 1:1 and `Location` stays uniquely resolvable by a
future checker. Two headings carry no instruction and get no ID: `§MCP Tool Aliases` (lookup
table) and `§DS Documentation Authoring — Pre-Authoring Gates` (container for Gates 1–3).

**Findings:**

- **54 of 60 rules are `convention`** — true by discipline, no machine backing. 6 are
  `enforced-by-code` (RULE-004, 043, 047, 049, 050, 051); zero `measured` or `roadmap`. The
  control register is the inverse: 19 of 25 rows `enforced-by-code`. Not a defect to fix here
  — most of these rules govern judgment, which no validator holds — but it is the honest
  shape of the rule surface, and it is the answer to "which rules exist as a countable set"
- **RULE-046 is misfiled.** The `spacing-0` Grid rule sits at CLAUDE.md:694 inside
  `§Taxonomy pre-flight` and is unrelated to taxonomy. One placement error in 60
- **Nine headings bundle independent instructions** (listed in the register's §Bundled
  headings). The three largest — RULE-029 `§Section Layout Contract` (49 lines),
  RULE-017 `§Phase 0 hard-stop` (48), RULE-049 `§DS Component Authoring` (38) — are 135
  lines, 15% of the file. **Phase 3's line reduction comes from these, not from trimming the
  57 short rules evenly**
- **`git log -S` dates the heading, not the rule.** Three dates returned rename dates;
  RULE-017 was off by three months. Corrected in the register with raw figures retained. A
  heading reworded after 2026-07-30 will need the same correction

**Phase 3 move checklist (highest-yield first, produced by this pass):**

| Rule | Heading | Lines | What moves out |
|---|---|---|---|
| RULE-029 | Section Layout Contract | 49 | 7 numbered rules → `docs/conventions/`; keep the parent-owns-gap rule inline |
| RULE-017 | Phase 0 hard-stop | 48 | nav annotation layer (6 items) and prototype trigger (7 items) → `docs/conventions/`; keep the trigger test and no-code-until inline |
| RULE-049 | DS Component Authoring | 38 | the 386-violations narrative → node/incident log; 9 sub-rules stay but compress |
| RULE-002 | Epic close-out sequence | 24 | the CI-red, SUG-230 and incident-log narratives → register/incident log; keep the 13 steps |
| RULE-035 | Portable Text via MCP | 24 | the 10-line `citationRef` investigation history → SUG-215's shipped doc |
| RULE-018 | Incomplete epic doc hard stop | 21 | SUG-224 and SUG-231 narratives → register |
| RULE-003 | Verify before citing | 8 | SUG-192/224/255 narratives → register |
| RULE-046 | (misfiled) | 6 | relocate out of `§Taxonomy pre-flight` to a Grid/layout heading |

Ten rules carry heavy inline narrative (RULE-002, 003, 008, 012, 017, 018, 035, 049, 055,
058). Those are the rationale-extraction targets; the other 50 need wording compression only.

**Phase 3 — Rewrite and move**

- [x] Rewrite each rule per `docs/conventions/instruction-writing-style.md`: instruction
      first, said once, no closing aphorism, rationale reduced to one clause. **Done across
      5 rounds, each gated section by section.** 43 of 60 rules rewritten; **17 checked and
      deliberately left unchanged** (RULE-005, 007, 010, 011, 012, 021, 025, 027, 030, 041,
      042, 045, 052, 053, 054, 056, 060) — all recent, already instruction-first, already
      pointing rationale at their own files. Rewriting them would be churn, and each is
      listed in its round's commit message
- [x] Move incident narrative to the rule register or the incident log, linked by ID. Nine
      rules had extractable narrative: RULE-002, 003, 008, 017, 018, 035, 049, 055, 058. All
      now in `rule-register.md` §Rationale, reachable from the rule by ID
- [x] Retire the strikethrough convention. **Zero `~~` remain in CLAUDE.md.** The retired
      DS-component-mirror rule kept its full text plus a five-sentence explanation inside the
      live registry, so a reader had to work out that it no longer applied. Moved to
      `rule-register.md` §Retired; the live rule ends with a pointer. Retired rules keep
      their IDs
- [x] Set the cap to the achieved figure plus 5%: **20,150**, from 19,187 measured
      2026-07-30 by `pnpm validate:doc-budget` (22,000 was the Phase 1 interim). **Note: the
      cap is words, not lines** — this Scope line originally said "line count plus 5%",
      which contradicted the Phase 1 item that built the gate. Words is correct; a line cap
      is what the 2026-07-29 verification review rejected
- [x] **Fixed the probe the tightened cap broke.** `validate-enforcement-liveness.js`
      padded `vqa-workflow.md` with a hardcoded 400 words to prove the gate fires. Headroom
      went from 243 to 963 when the cap moved, so 400 words no longer violated anything and
      the probe reported `STAYED GREEN against a known violation` — the probe broke, not the
      gate. It now derives the padding from the gate's own `--json` output (headroom + 50),
      so tightening the cap can never silently disarm it again. Re-run: 13 gates proven live,
      0 inert, no residue left in the tree

**Phase 4 — Other high-traffic docs**

- [x] Apply the style guide to `docs/epic-template.md`. **Re-measured 2026-07-30: 7,034
      words / 641 lines** by `wc`, not the 6,782 this line originally stated. Result:
      **640 lines, 6,989 words — 1 line and 45 words.** That is the honest yield, and the
      reason is that the file is not padded: it is 641 lines of checklist items, and a
      checklist item is one line whether it runs 60 characters or 990. A grep for narrative
      markers across all 641 lines found them in exactly five places, all five fixed, so
      the pass is bounded and complete. **A line-by-line rewrite was deliberately not done**
      — the checklist scaffolding is the product, and a shortened checklist item is a weaker
      prompt. The real gain is line 110, formerly 993 characters (the longest in the file by
      50%) with 90 words of incident narrative buried mid-sentence; it now states the check
      and points at INC-009 to INC-011, keeping only the non-obvious part: `validate:validators`
      passed through all five failures because it checks a validator is wired and cannot check
      its result is read. `epic-template.md` sits outside the capped surface, so none of this
      moved the budget
- [x] Apply to the 3 largest `docs/conventions/` files. Two changed:
      `usage-doc-style-guide.md` 220→183 lines (the four-option DS tooling analysis moved to
      `docs/reviews/ds-docs-tooling-options.md`, stamped with its measurement version and
      re-evaluation trigger) and `design-handoff-template.md` 132→131.
      **`schema-conventions.md` was read and left unchanged** — every section is a rule or a
      table, no aphorisms, no narrative; churning it would add risk for nothing
- [x] Fix the live banned-word uses. **Three, not two.** The stated "two `inert` uses" was
      wrong because the grep below was case-sensitive: `Brevity` at
      `.claude/skills/red-pen/SKILL.md:37` was invisible to it. Fixed at `CLAUDE.md:428`
      (line number also corrected from 480), `docs/epic-template.md:110`, and the skill
- [x] Make the style guide's own banned-word grep usable. Three fixes: added `-i`, excluded
      `instruction-writing-style.md`, and scoped it to the agent-facing surface. Scanning all
      of `docs/` instead returns hits in **37 files**, nearly all shipped docs and post-mortems
      whose historical narrative must not be rewritten. The check now returns zero. **Stays
      manual; wiring it as a validator is [SUG-264](https://linear.app/sugartown/issue/SUG-264/wire-the-banned-word-check-as-validatebanned-words)**
      — a new control needs a verification review, a register row and a probe, which is its
      own piece of work. Filed with Linear issue, backlog stub and priority row per
      CLAUDE.md §Scope creep

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

- [ ] **Report the achieved line count and the command that produced it.** 650 stays the
      goal, not a binding number — decided 2026-07-30 after Phase 3 Round 1 measured the real
      rate. Extraction and compression yield 2–3 lines per rule, so 60 rules land near 740,
      and the three big bundles pull it toward ~700. Reaching 650 would need either
      relocating whole sub-rule blocks to `docs/conventions/` (which this epic's own
      Technical Constraints forbid, since the word count follows them) or deleting rules
      (which Non-Goals forbid without a recorded decision). **No rules are deleted to hit a
      number.** This is the Risks section's stated position — "if the honest result is 700,
      report 700" — applied
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
6. **Incident log: no incident.** Decided 2026-07-30 after checking the log's own bar. The
   candidate was Phase 3's liveness probe, which stopped violating when the cap tightened
   (headroom 243→963, hardcoded 400-word injection) and reported
   `STAYED GREEN against a known violation`. It does **not** qualify: the log says "do not
   log routine corrections, expected gate stops, or anything caught before it cost
   something — the log is a record of what got through, not a diary." The probe caught its
   own failure in the same session, in an uncommitted tree, minutes after the change.
   Nothing got through. The counter-reading — that the hardcoded coupling shipped
   2026-07-29 and would have silently disarmed on any future cap change — was considered and
   rejected, because it never produced a wrong result in a shipped state. Padding this log is
   the one thing that would undermine it. The lesson is carried forward instead, in SUG-264's
   Scope: derive an injected violation from the check's own output, never a fixed value.
   No rules were lost: all 60 IDs resolve.

## Follow-up

Node: how the house style for published writing spread into the tools nobody publishes.
The repo's instruction docs got written in the same voice as its articles, so CLAUDE.md
reached 12,855 words while the brand voice guide covering actual published content is
2,799 (both `wc -w`, 2026-07-29). Draft via `/write-node` after this epic ships, so the
before and after numbers are
real.
