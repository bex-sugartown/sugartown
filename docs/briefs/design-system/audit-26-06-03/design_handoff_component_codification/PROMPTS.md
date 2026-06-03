# Claude Code prompts — parse → prioritize → execute

Run these in order, inside a checkout of `github.com/bex-sugartown/sugartown`, with this whole
`design_handoff_component_codification/` folder available. Each prompt is self-contained; paste it as-is.
Treat `component-audit.json`, `CLAUDE.md`, and the `docs/*` epic plans as the source of record.

---

## Prompt 0 — Orient & load the rules

```
Read these files and treat them as binding for this entire session:
- CLAUDE.md (the Naming & Composition Charter — operating rules)
- README.md (handoff overview)
- component-audit.json (source of truth: 103 components with status + notes)
- docs/card-tile-decomposition.md, docs/form-decomposition.md, docs/layout-primitives.md (epic plans)
- docs/component-pr-template.md (the PR gates you must satisfy)

Then map this repo: locate the DS primitives package (packages/ds/), the web design-system adapters,
the patterns directory, the Storybook config, the Sanity Studio schema, and the component registry
(uploads/component-registry.md or its in-repo equivalent). Report the exact paths back to me.
Do not write any code yet.
```

---

## Prompt 1 — Parse the audit into an epic backlog

```
From component-audit.json, build an epic backlog. Only rows with pinkMoonStatusKey "diverges" or
"codify" are actionable (32 rows); "missing" is future-naming reference, "present" is done.

For each actionable row, extract from its `note`:
- the POSITION (where it lives in product today),
- the FUTURE STATE / DECISION (what it should become),
- its tier (primitive | pattern | instance) per the charter,
- its dependencies (which primitives it composes — read the epic docs for the mapped clusters).

Group rows into epics. Start from the five epics in README.md (Card/Tile, Form, Layout, Page-builder
sections, Stragglers) but re-cluster if the dependency graph suggests better seams. Output a single
`BACKLOG.md`: epic → ordered tickets → each ticket with {component, tier, action (extract/rename/build),
files likely touched, child-primitive dependencies, acceptance criteria from the epic doc's DoD}.
Do not start implementing.
```

---

## Prompt 2 — Prioritize & sequence

```
Produce a prioritized execution plan from BACKLOG.md. Rules:
- Primitives before any pattern that composes them (hard constraint — law 02).
- Within that, weight each ticket by: (a) how many other tickets it unblocks, (b) how many live
  call-sites it de-drifts, (c) whether it retires a charter offender (a use-case name).
- Identify the critical path. (Expected early items: `Box`; then leaf primitives Metric/Meter/Skeleton/
  Avatar/DescriptionList; then `Card`; then field primitives; then `Form`.)

Output `PLAN.md`: a dependency-ordered list of tickets in execution order, grouped into PR-sized units,
each annotated with its blockers and what it unblocks. Flag any ticket whose note contains a "confirm"
(e.g. Input not in registry; Flex-vs-Stack; Meter-vs-Progress) as a DECISION-NEEDED item for me to
resolve before its phase. Stop and show me PLAN.md before executing.
```

---

## Prompt 3 — Execute one epic (repeat per epic, in PLAN.md order)

```
Implement the next epic in PLAN.md, following its doc in docs/ exactly. Hard rules:
- PRIMITIVES FIRST: build & give a Storybook story to every child primitive before the pattern that
  uses it. A pattern PR may not merge with un-codified parts.
- NAME BY WHAT IT IS: no use-case names (no domain noun in a component name). A "contact form" is a
  Form + config; "two column" is Columns count={2}; a stat tile is a Card composing a Metric.
- TOKENS ONLY: no raw hex / ad-hoc spacing. Run `pnpm validate:tokens --strict-colors`.
- For each new/changed component, satisfy docs/component-pr-template.md: Storybook story, registry row
  in uploads/component-registry.md, a11y wiring, and the audit-impact note.

Work in small PRs (one PR-sized unit from PLAN.md at a time). For each: list files changed, show the
Storybook story, the registry row diff, and the codemod/migration if you deprecated something. After
each unit, update BACKLOG.md/PLAN.md status and pause for my review before the next.
```

---

## Prompt 4 — Keep the audit honest (after each epic)

```
After an epic merges, update the source of record so it doesn't drift:
- In component-audit.json (or the live audit data in components-data.js), flip the affected rows:
  codified primitives "codify"/"missing" → "present" with the new stName; renamed offenders
  "diverges" → "present"; retired components marked retired.
- Update uploads/component-registry.md with the new primitives/patterns and their Storybook titles.
- Re-run the status counts and report the new In system / Diverges / To codify / Not yet tally.
A row may only become "present" if it has a real registry entry + Storybook story — never on tokens
or usage alone.
```

---

## Guardrails (apply to every prompt above)

- **Never invent a component from scratch.** If you need a primitive that doesn't exist, codify it first
  (story + registry row), then compose.
- **Reuse before naming.** Search the audit + registry; if the concept exists under another name, use the
  canonical one; watch false friends (Stepper, Drawer, Tag, Badge, Tile, Grid, Label, Overflow).
- **One container, not five.** Card is the box; ContentCard/MetadataCard/StatCard/listing compose it — they
  own no container CSS. Same logic for layout: Regions compose layout primitives, they aren't "layout".
- **Ask, don't guess,** on any "confirm" note (Input codified? Flex or Stack? Meter or Progress? Carousel in
  registry?). Surface these as DECISION-NEEDED rather than picking silently.
```
