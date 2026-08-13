# Agentic Caucus — Rule Register

**Version:** v1.1
**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-07-30
**Related:** [[control-register]] (`docs/ai/agentic-caucus/control-register.md`), [[incident-log]] (`docs/ai/agentic-caucus/incident-log.md`), [[instruction-writing-style]] (`docs/conventions/instruction-writing-style.md`)

---

## Purpose

One row per rule in `CLAUDE.md`: a stable ID, the incident that caused it, and where its text
lives.

Rules are the only governed object without IDs. Incidents have `INC-NNN`, failure modes
`FM-C-NN`, controls `CTL-NNN`. Without one, a rule is cited by heading text, and a heading
reword breaks every citation silently. Two are dangling as of 2026-07-30:
`docs/diagrams/redpen-workflow-current-state.md:25` cites
`§Phase 0 hard-stop (mockup gate)`, renamed to `(visual spec gate)` by SUG-242; and
`docs/shipped/zArchive/2026/SUG-68:156` cites `§Linear Done = code in remote`, now
`= code on main`.

[[control-register]] answers whether a control is probed and who reads its result. This
answers a different question: which rules exist as a countable set, which cite an incident
that no longer applies, and which citations dangle.

## What counts as one rule

**One rule = one `CLAUDE.md` heading.** Citations are written as `CLAUDE.md §Heading`, so IDs
replace them one-for-one and `Location` stays uniquely resolvable by a future checker.

Two consequences, both deliberate:

- A heading that bundles several independent instructions gets **one** ID, and is marked in
  §Bundled headings below. Splitting it is a rewrite decision, which belongs to SUG-243
  Phase 3, not to this enumeration.
- A heading carrying no instruction gets **no** ID. Two qualify: `§MCP Tool Aliases` (a lookup
  table) and `§DS Documentation Authoring — Pre-Authoring Gates` (a container for Gates 1–3).

## What this deliberately does not record

**When a rule last fired.** Nothing observes a rule firing. The column would have been
populated once and decayed from that day with no updater and no staleness check, and a stale
`last fired` is worse than an absent one because the next audit would use it to retire a rule
that does fire. Audits re-measure instead. Dropped by the 2026-07-29 verification review of
SUG-243.

**The rule's text.** The `Rule` column is a handle, not a copy. Two copies of a rule drift,
and the copy nobody edits becomes the one somebody follows. `CLAUDE.md` holds the text.

## How to read a row

- **ID** — `RULE-NNN`. Never reused.
- **Rule** — a short handle, enough to find the rule. Not its wording.
- **Origin incident** — the `INC-NNN`, `FM-C-NN`, epic, or post-mortem behind it. `none` where
  the rule cites no failure of its own.
- **Created** — when the rule entered `CLAUDE.md`. See §How Created was measured for the one
  caveat that matters.
- **Class** — `enforced-by-code` (a validator, hook, or build step makes it true), `measured`
  (an empirical result with a committed record), `convention` (true by discipline), `roadmap`
  (not true yet). Same four values as [[control-register]] and the red-pen diagram gate.
- **Location** — the file and heading holding the rule's text: `CLAUDE.md §Heading`, or a
  `docs/conventions/` path once SUG-243 Phase 3 moves it.

## How to add a row

Use the next free `RULE-NNN`. A rule and its row land in the same commit.

Where `Class` is `enforced-by-code`, the row names the enforcing `CTL-NNN` so the rule and its
control are traceable in both directions.

## How Created was measured

Enumerated 2026-07-30 against `CLAUDE.md` at 907 lines:

```bash
grep -n "^#\{2,4\} " CLAUDE.md | while IFS=: read -r ln rest; do
  h=$(echo "$rest" | sed 's/^#* //')
  printf '%s\t%s\t%s\n' "$ln" "$(git log --format=%as -S"$h" -- CLAUDE.md | tail -1)" "$h"
done
```

**`git log -S` dates the heading text, not the rule.** Where a heading was later reworded, the
naive result is the rename date. Three rules were affected and are corrected in the table
below; the raw figure is kept alongside so the correction is auditable.

| ID | Rule | Naive (rename) date | Corrected date | Renamed by |
|---|---|---|---|---|
| RULE-003 | Verify before citing | 2026-07-21 | 2026-07-01 | heading gained `— don't trust a prior claim` |
| RULE-009 | Linear Done = code on main | 2026-04-19 | 2026-04-04 | was `= code in remote` |
| RULE-017 | Phase 0 hard-stop | 2026-07-25 | 2026-04-16 | was `(mockup gate)`, renamed by SUG-242 |

Any future re-run of the command above reproduces the naive dates, not the corrected ones. A
heading reworded after 2026-07-30 will need the same correction, which is one more argument
for citing by ID.

---

## Register

60 rules. Enumerated 2026-07-30 from `CLAUDE.md` at 907 lines.

| ID | Rule | Origin incident | Created | Class | Location |
|---|---|---|---|---|---|
| RULE-001 | Orient before acting (call `get_epic` + `get_changelog` at session start) | none | 2026-07-27 | convention | `CLAUDE.md §MCP Server` |
| RULE-002 | Epic close-out sequence (9 steps + 1b/5b/6b/8b) | CI red on `main` 2026-05-10→07-27; INC-008; SUG-230 handoff loss; SUG-240 | 2026-03-05 | convention | `CLAUDE.md §Epic close-out sequence` |
| RULE-003 | Verify before citing — don't trust a prior claim | SUG-192; SUG-224; SUG-255 | 2026-07-01 | convention | `CLAUDE.md §Verify before citing — don't trust a prior claim` |
| RULE-004 | Verification review before building a gate | SUG-256 | 2026-07-29 | enforced-by-code (CTL-015) | `CLAUDE.md §Verification review (blocking)` |
| RULE-005 | Instruction writing style (incl. session replies) | none | 2026-07-29 | convention | `CLAUDE.md §Instruction writing style` |
| RULE-006 | Epic authoring — Linear issue first | none | 2026-03-22 | convention | `CLAUDE.md §Epic authoring — Linear-first workflow` |
| RULE-007 | Three-strike retrospective trigger | SUG-241 | 2026-07-25 | convention | `CLAUDE.md §Process feedback loop — three-strike retrospective trigger` |
| RULE-008 | Mid-epic commit checkpoints + push cadence | SUG-231 (48 commits, one disk, two days) | 2026-03-16 | convention | `CLAUDE.md §Mid-epic commit checkpoints` |
| RULE-009 | Linear Done = code on main | 2026-04-04 post-mortem (via SUG-46) | 2026-04-04 | convention | `CLAUDE.md §Linear Done = code on main` |
| RULE-010 | Linear status = workflow stage | SUG-246 | 2026-07-25 | convention | `CLAUDE.md §Linear status = workflow stage` |
| RULE-011 | Scope creep — file findings before continuing | 6 issues with no doc, 2026-07-27→28 | 2026-07-29 | convention (CTL-024) | `CLAUDE.md §Scope creep (blocking)` |
| RULE-012 | Multi-phase epic merge cadence — pick (a) or (b) | SUG-63 Phase 1c stranded | 2026-04-19 | convention | `CLAUDE.md §Multi-phase epic merge cadence` |
| RULE-013 | Never end a session on an unresolved merge conflict | none | 2026-04-04 | convention | `CLAUDE.md §Merge conflict cleanup` |
| RULE-014 | Browser testing pre-flight | none | 2026-04-03 | convention | `CLAUDE.md §Browser testing pre-flight` |
| RULE-015 | `docs/drafts/` is local-only, never committed | none | 2026-04-06 | convention | `CLAUDE.md §Local-only directories (gitignored)` |
| RULE-016 | Generated stats files are not a dirty-tree blocker | none | 2026-05-29 | convention | `CLAUDE.md §Generated stats files — dirty tree behaviour` |
| RULE-017 | Phase 0 hard-stop — no code before vspec sign-off | SUG-231 Ph3 (gate misfired); SUG-242 | 2026-04-16 | convention | `CLAUDE.md §Phase 0 hard-stop (visual spec gate)` |
| RULE-018 | Incomplete epic doc hard stop (7 conditions) | SUG-224 (unverified "44 mirrors"); SUG-231 (`.wide`, Non-Goals conflict) | 2026-04-30 | convention | `CLAUDE.md §Incomplete epic doc hard stop` |
| RULE-019 | Design handoff evaluation gate | SUG-163 | 2026-06-12 | convention | `CLAUDE.md §Design handoff evaluation gate (SUG-163)` |
| RULE-020 | React hooks — Outlet context pre-flight | none | 2026-05-12 | convention | `CLAUDE.md §React hooks — Outlet context pre-flight` |
| RULE-021 | No speculative fixes — request the error first | none | 2026-04-03 | convention | `CLAUDE.md §No speculative fixes` |
| RULE-022 | Worktree path discipline | none | 2026-05-10 | convention | `CLAUDE.md §Worktree path discipline` |
| RULE-023 | CSS Triage Protocol (+ bg-through-gap annotation) | none | 2026-03-16 | convention | `CLAUDE.md §CSS Triage Protocol` |
| RULE-024 | CSS layout fix escalation — root-cause after 2 fixes | none | 2026-03-07 | convention | `CLAUDE.md §CSS layout fix escalation rule` |
| RULE-025 | `container-type` guardrail | none | 2026-03-07 | convention | `` CLAUDE.md §`container-type` guardrail `` |
| RULE-026 | Studio schema changes get their own commit (+ deploy) | none | 2026-03-05 | convention | `CLAUDE.md §Studio schema changes get their own commit` |
| RULE-027 | Paired schema convention | none | 2026-03-11 | convention | `CLAUDE.md §Paired schema convention` |
| RULE-028 | Single Field Authority | none | 2026-03-16 | convention | `CLAUDE.md §Single Field Authority` |
| RULE-029 | Section Layout Contract (7 numbered rules) | double-padding at section boundaries | 2026-03-11 | convention | `CLAUDE.md §Section Layout Contract` |
| RULE-030 | GROQ projection audit for nested image types | none | 2026-03-11 | convention | `CLAUDE.md §GROQ projection audit for nested image types` |
| RULE-031 | Content Write Gate | `ai-ethics-and-operations.md` principles 6 and 7 | 2026-04-30 | convention | `CLAUDE.md §Content Write Gate (hard stop — all Sanity MCP writes)` |
| RULE-032 | The Human-Publishes Rule | none | 2026-07-17 | convention | `CLAUDE.md §The Human-Publishes Rule (hard stop — publish/unpublish operations)` |
| RULE-033 | Instruction & Rule File Write Gate | none | 2026-07-17 | convention | `CLAUDE.md §Instruction & Rule File Write Gate (hard stop — skill/CLAUDE.md/governance doc edits)` |
| RULE-034 | Sanity MCP content writes — no AI rewriting | none | 2026-03-22 | convention | `CLAUDE.md §Sanity MCP content writes — no AI rewriting` |
| RULE-035 | Portable Text blocks via MCP — `markDefs`/`marks` required | SUG-215 | 2026-05-14 | convention | `CLAUDE.md §Portable Text blocks written via MCP — required fields` |
| RULE-036 | Anti-Slop Content Rules | none | 2026-04-09 | convention | `CLAUDE.md §Anti-Slop Content Rules` |
| RULE-037 | DS docs Gate 1 — API stability | SUG-152 Chip docs | 2026-06-08 | convention | `CLAUDE.md §Gate 1 — API stability (hard stop)` |
| RULE-038 | DS docs Gate 2 — Template lock | none | 2026-06-08 | convention | `CLAUDE.md §Gate 2 — Template lock (hard stop before any content)` |
| RULE-039 | DS docs Gate 3 — Framework-agnostic constraint | none | 2026-06-08 | convention | `CLAUDE.md §Gate 3 — Framework-agnostic constraint` |
| RULE-040 | Section dependency map in component helpers | none | 2026-06-08 | convention | `CLAUDE.md §Section dependency map` |
| RULE-041 | Schema conventions — taxonomy primary field is `name` | none | 2026-04-22 | convention | `CLAUDE.md §Schema Conventions` |
| RULE-042 | Image asset naming convention | none | 2026-03-23 | convention | `CLAUDE.md §Image Asset Naming` |
| RULE-043 | URL Authority — all internal URLs via `getCanonicalPath()` | none | 2026-04-16 | enforced-by-code (CTL-008) | `CLAUDE.md §URL Authority Rule (blocking)` |
| RULE-044 | Atomic Reuse Gate (3 written questions) | none | 2026-03-16 | convention | `CLAUDE.md §Atomic Reuse Gate (blocking)` |
| RULE-045 | Taxonomy pre-flight before creating a taxonomy doc | SUG-74 | 2026-04-20 | convention | `CLAUDE.md §Taxonomy pre-flight (blocking)` |
| RULE-046 | `spacing-0` Grid takes borderless tiles only | SUG-152 Ph7 | 2026-04-20 | convention | ``CLAUDE.md §`Grid spacing="0"` takes borderless children only`` |
| RULE-047 | CSS class pre-implementation reuse audit + proposal table | SUG-191/192 | 2026-05-10 | enforced-by-code (CTL-005, partial) | `CLAUDE.md §CSS class pre-implementation reuse audit (blocking — fires before any new CSS class)` |
| RULE-048 | Component choice gate + variant-first rule | none | 2026-05-02 | convention | `CLAUDE.md §Component choice gate (blocking — fires before any new JSX surface)` |
| RULE-049 | DS Component Authoring — Token-First Rule (9 sub-rules) | 386 hardcoded values; SUG-68 | 2026-04-22 | enforced-by-code (CTL-001, CTL-002) | `CLAUDE.md §DS Component Authoring — Token-First Rule (blocking)` |
| RULE-050 | Pre-commit checklist for CSS token changes | `theme.pink-moon.css` drift post-mortem, 2026-06-13 (93 missing tokens) | 2026-03-05 | enforced-by-code (CTL-001, CTL-002, CTL-003) | `CLAUDE.md §Pre-Commit Checklist for CSS Token Changes` |
| RULE-051 | Mirrored File Registry — must-be-identical pairs | SUG-224 | 2026-06-13 | enforced-by-code (CTL-003) | `CLAUDE.md §Mirrored File Registry (must-be-identical pairs)` |
| RULE-052 | Build success is not visual correctness | none | 2026-04-15 | convention | `CLAUDE.md §Visual Verification Rules` |
| RULE-053 | Pre-audit branch check before production verification | none | 2026-04-19 | convention | `CLAUDE.md §Pre-audit branch check` |
| RULE-054 | Vspec-to-build comparison table when a vspec exists | none | 2026-07-25 | convention | `CLAUDE.md §When a vspec exists` |
| RULE-055 | Technical diagram red-pen gate (+ published statistics) | `redpen-platform-is-the-portfolio`; the "0 gaps" claim | 2026-07-17 | convention | `CLAUDE.md §Technical diagram red-pen gate (blocking — fires before any diagram is uploaded or published)` |
| RULE-056 | Per-CSS-property checklist (token, arithmetic, vspec match) | none | 2026-04-15 | convention | `CLAUDE.md §For every CSS property you write` |
| RULE-057 | Dark mode surface work — inspect computed values first | MetadataCard dark mode repair cycle | 2026-04-29 | convention | `CLAUDE.md §Dark mode surface work — pre-flight` |
| RULE-058 | Storybook build-time globals must be frozen | 2026-07-19 chromatic-footer-version-freeze post-mortem | 2026-05-12 | convention | `CLAUDE.md §Storybook — build-time globals must be frozen` |
| RULE-059 | Storybook coverage requirement (incl. dark mode as AC) | none | 2026-04-15 | convention | `CLAUDE.md §Storybook coverage requirement` |
| RULE-060 | Honesty over confidence — name what you cannot verify | none | 2026-04-15 | convention | `CLAUDE.md §Honesty over confidence` |

### Class distribution

| Class | Count |
|---|---|
| `convention` | 54 |
| `enforced-by-code` | 6 (RULE-004, 043, 047, 049, 050, 051) |
| `measured` | 0 |
| `roadmap` | 0 |

**54 of 60 rules are true by discipline alone.** That is the headline finding of the
enumeration, and it is not a defect to fix inside SUG-243 — most of these rules govern
judgment (when to stop, what to ask, what to verify) and no validator can hold them. It does
mean the platform's rule surface is far less machine-backed than its control surface, where
19 of 25 rows are `enforced-by-code`.

### Bundled headings

Nine headings carry more than one independent instruction. Each has one ID; Phase 3 decides
whether to split.

| ID | Heading | Lines | Independent instructions |
|---|---|---|---|
| RULE-029 | Section Layout Contract | 49 | 7 numbered rules + a new-section-type checklist |
| RULE-017 | Phase 0 hard-stop | 48 | trigger test, no-code-until, nav annotation layer (6), prototype trigger (7), class naming (3), entity folios |
| RULE-049 | DS Component Authoring — Token-First | 38 | verify name, verify computed value, no inline injection, no raw colour, fallback syntax, naming, theme override-only, status tokens, theme cascade audit |
| RULE-031 | Content Write Gate | 26 | proposal format, fires-when (4), does-not-fire (3), response mechanism |
| RULE-002 | Epic close-out sequence | 24 | 13 steps counting 1b/5b/6b/8b |
| RULE-035 | Portable Text blocks via MCP | 24 | required fields + a 10-line `citationRef` investigation history |
| RULE-036 | Anti-Slop Content Rules | 24 | scope carve-out + 8 banned patterns + node exemptions |
| RULE-047 | CSS class reuse audit | 24 | 4-step audit + proposal table gate |
| RULE-048 | Component choice gate | 24 | 3-step audit + variant-first hard stop |

**RULE-046 was misfiled and has been moved.** The `spacing-0` Grid rule sat inside
`§Taxonomy pre-flight` and had nothing to do with taxonomy. It was the one placement error the
enumeration found. Phase 3 Round 3 gave it its own heading; no renumbering was needed, because
Phase 2 had already assigned it an ID.

---

## Rationale

Narrative moved out of `CLAUDE.md` by SUG-243 Phase 3, keyed by rule ID. Each rule's own text
links here. Nothing in this section is an instruction: the rule is followable without reading
it, and if it is not, the rule was compressed too far.

### RULE-002 — Epic close-out sequence

**Step 1b, recording the CI run ID.** "CI is green" was accepted as a close-out artifact for
months. Because no run was ever named, nobody could audit the claim afterwards, and CI sat red
on `main` for 100+ consecutive runs (2026-05-10 → 2026-07-27) while six releases shipped
through it. A named run ID makes the claim checkable by the next session.

**Step 5b, verifying handoffs.** SUG-230's close-out deferred three items to SUG-231 on the
stated grounds that they belonged to SUG-231's axis. None of the three was in SUG-231's Scope.
They survived only because a later session happened to re-read both docs. Items handed between
epics are the most likely of all work to be dropped, because each side assumes the other owns
it.

**Step 8b, the incident log.** The log went 27 days un-appended after its own creation,
including a shipped-then-reverted production regression (INC-008) that met its own stated High
bar. A log nobody appends to is another mechanism that is declared and does not fire, which is
the failure class most of its entries describe.

### RULE-003 — Verify before citing

SUG-192: three of SUG-191's audit rows named the wrong file — a deprecated component, or a
directory with no stories file at all. The error propagated silently until a later session
read the live files. SUG-224: the `"use client"` claim was false (zero such directives exist
in the package), and "Upstream dependencies: none blocking" was wrong (three CSS epics gate
it). SUG-255: `turbo run` is fail-fast, so the CI log showed 7 lint errors in one package
while a local run found 84 across three.

### RULE-008 — Mid-epic commit checkpoints

SUG-231 closed with 48 commits on `main` that existed nowhere else, for two days, across five
mini-releases. The rule's `main`-branch clause exists because the free-push escape hatch does
not apply there: pushing `main` triggers a Netlify deploy, and avoiding that deploy became the
reason to accumulate. One deploy costs less than two days of work.

Uncommitted code that survives a session break is lost context, which is why work-in-progress
gets a `wip(epic):` commit rather than being left in the tree.

### RULE-017 — Phase 0 hard-stop

SUG-231 Phase 3 (porting web's canonical Callout to the package) was assumed to need a vspec
on structural grounds. It changed nothing a user could see, because `apps/contentful-poc` used
Callout in zero files. That is why the gate's trigger is a rendered surface a human has not
signed off on, not an epic's shape.

The nav annotation layer exists because behaviour already codified elsewhere kept being
re-discovered and re-implemented. Annotating "same as PageSidebar scrollspy" is cheaper than
rebuilding it, and a blank annotation reads as "no behaviour" rather than "behaviour inherited".

### RULE-018 — Incomplete epic doc hard stop

SUG-224: the "44 mirrors" framing came from a single TODO comment in `Card.jsx`; the audit
found 26 pure mirrors, 6 adapters, 6 diverged components, and 6 with no package counterpart.
SUG-231: "define or remove Table's `.wide`" sat outside Phases 1/1b/2/3 and was caught only
at close-out, after surviving four phases of review. SUG-231 again: Scope said "add `href` to
the package `Button`" while Non-Goals said Button's `href` stays until SUG-224 — both written
2026-07-21, the contradiction caught at activation the next day.

### RULE-055 — Technical diagram red-pen gate

The gate was written after the platform-is-the-portfolio failure: three published SVGs, zero
sources committed to the repo, one overstated claim each. With no committed source, a later
session cannot fact-check a published diagram except by reconstructing it from the rendered
image.

The published-statistics clause was added because `/platform/governance` §05 published
"30 checkpoints · 0 gaps" with neither a measurement date nor a source, while the pipeline
behind it had been red for three months (as of 2026-07-27). On a platform whose positioning is
the portfolio, the reputational exposure exceeds the technical one.

### RULE-058 — Storybook build-time globals

`__APP_VERSION__` went unfrozen for over two months after `__BUILD_DATE__` was fixed, so every
version bump kept diffing the Footer story on Chromatic. The cause was a partial fix: the
variable named in the original bug report was frozen, and the sibling `define:` entry
introduced by the same feature was never audited. Post-mortem:
`docs/reviews/rules-audit/2026-07.md`.

### RULE-049 — DS Component Authoring, Token-First

One inline `rgba` in a first-pass component became four violations by the time both DS mirrors
and both theme overrides were written. 386 of them became an epic (SUG-68). A hardcoded value
bypasses the token graph completely: the theme system cannot override it and the validator
cannot audit it, so the count only ever grows. Written up in the node *"The Validator Said Zero
Errors. It Was Watching the Wrong Door."*

Card's status chip system accumulated 90 hardcoded values by deferring its
`--st-status-<state>-*` token definitions, which is why that sub-rule says "not deferrable".

### RULE-019 — Design handoff evaluation gate

SUG-162's handoff carried seven correctable errors, every one attributable to design reading
inferred state rather than the files that govern the build: a Next.js project skeleton, one
Merriam-Webster sample, a pasted hex value. SUG-163 turned that into
`docs/conventions/design-handoff-template.md`, which routes every decision back to a source of
truth the validators enforce.

### RULE-033 — Instruction & Rule File Write Gate

The copy-first clause was added 2026-07-30 after the gate held six times in one session and was
skipped on the seventh. The cause was not a misreading: the rule already says "never" and
already pre-empts the "but the edit is correct" excuse. In rounds 1 to 5 the editing script
wrote to a scratchpad copy, which was then diffed and gated; in round 6 it wrote straight to
`docs/conventions/`, and the diff was produced afterwards. Same rule, same understanding,
different plumbing.

Nothing landed unreviewed — the edit was reverted, the diff shown, and the change re-applied
after approval. The point is that self-catching is the only mechanism this gate has. It is
`convention` class: no validator can hold it, because approval happens in conversation and the
gap between edit and commit produces no artifact a hook could read. A copy-first method is a
weaker guarantee than a gate but a stronger one than memory.

### RULE-035 — citationRef investigation

A 2026-05-14 note claimed a `citationRef` markDef inside `sections[].content` locks the whole
PT field in Studio. SUG-215 (2026-07-18) reproduced the exact pattern on a scratch document,
plus a block with `markDefs`/`marks` genuinely omitted, and confirmed visually that the
toolbar stayed functional in both cases. A retrofit audit found 11 live documents already
using `citationRef` there, none locked. The original claim likely conflated this with the
missing-`markDefs` bug added the same day, four hours earlier.

---

## Retired

Rules that no longer apply. They live here rather than in `CLAUDE.md` with a strikethrough,
because a struck-through rule still occupies a session's attention and still has to be read to
learn it does not apply. SUG-243 Phase 3 retired that convention; `CLAUDE.md` carries no
strikethroughs.

A retired rule keeps its ID. IDs are never reused.

### DS component CSS mirrors — retired 2026-07-24 (SUG-224)

Part of RULE-051 (Mirrored File Registry). `apps/web/src/design-system/components/` used to hold
a mirror of every DS package component, kept byte-identical by hand and by
`validate:style-mirror` pass 2.

`apps/web` now consumes `@sugartown/design-system` directly, so the mirror-adapter pattern no
longer exists. The directory holds only `SidebarNav` and `Tile` — genuine app coupling with no
package counterpart, nothing to mirror against. `validate:style-mirror` pass 2 still runs as a
harmless no-op (0 pairs to compare), kept as a backstop in case the pattern reappears.

---

## Not yet enforced

**No script reads this file.** `pnpm validate:controls` validates [[control-register]] only.

Nothing checks that every rule in `CLAUDE.md` has a row, that every cited `RULE-NNN` resolves,
or that `Location` still points at the rule. Until something does, this register is
`convention` by its own vocabulary — true by discipline, kept current by whoever edits a rule
remembering to edit its row.

Pointing `validate-control-register.js` at this file would be possible, since it shares the
`Class` vocabulary and the table shape, but no decision has been made and it is not in
SUG-243's scope.
