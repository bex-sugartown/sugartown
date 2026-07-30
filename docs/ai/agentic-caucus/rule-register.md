# Agentic Caucus — Rule Register

**Version:** v1.0
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
- **Origin incident** — the `INC-NNN`, `FM-C-NN`, or post-mortem behind it. `none` where the
  rule predates the incident log or came from a convention rather than a failure.
- **Created** — when the rule entered `CLAUDE.md`, not when this row was written.
- **Class** — `enforced-by-code` (a validator, hook, or build step makes it true), `measured`
  (an empirical result with a committed record), `convention` (true by discipline), `roadmap`
  (not true yet). Same four values as [[control-register]] and the red-pen diagram gate.
- **Location** — the file and heading holding the rule's text: `CLAUDE.md §Heading`, or a
  `docs/conventions/` path once SUG-243 Phase 3 moves it.

## How to add a row

Use the next free `RULE-NNN`. A rule and its row land in the same commit.

Where `Class` is `enforced-by-code`, name the enforcing `CTL-NNN` so the rule and its control
are traceable in both directions.

---

## Register

Empty by design. SUG-243 Phase 2 reads `CLAUDE.md` in full and fills this in one pass; rows
added piecemeal before then produce a partial set that looks complete.

| ID | Rule | Origin incident | Created | Class | Location |
|---|---|---|---|---|---|

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
