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
| RULE-046 | `spacing-0` Grid takes borderless tiles only | SUG-152 Ph7 | 2026-04-20 | convention | `CLAUDE.md §Taxonomy pre-flight (blocking)` — misfiled, see §Bundled headings |
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

**RULE-046 is misfiled.** The `spacing-0` Grid rule sits inside `§Taxonomy pre-flight`
(CLAUDE.md:694) and has nothing to do with taxonomy. It is the one placement error the
enumeration found. Moving it is a Phase 3 edit.

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
