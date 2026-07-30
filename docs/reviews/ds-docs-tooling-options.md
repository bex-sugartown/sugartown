# DS documentation tooling — options evaluated

**Decision record.** Moved out of `docs/conventions/usage-doc-style-guide.md` by SUG-243
Phase 4 (2026-07-30): it is an options analysis, not an instruction, and it sat in the
session-loaded surface that `validate:doc-budget` caps.

**Measured at:** v0.26.12. Re-evaluate when component count justifies the maintenance
overhead of Option C, or when SUG-109 lands and unblocks Option D.

**Decision:** A + B together. The style guide states this as the rule; this file holds the
reasoning and the paths not taken.

---

At v0.26.12 the monorepo used Storybook as its only documentation surface for
component-level guidance. Four options were evaluated for expanding coverage.

## Option A — Storybook + structured Guidelines stories (current path)

One `helpers/*Docs.tsx` helper per component. Four fixed sections: Overview, Usage,
Accessibility, Tokens. Incomplete sections render a `<!-- PENDING -->` placeholder instead of
stale content. The helper file is the source of truth; the Guidelines story wraps it.

- **Best for:** component-level API rules, live visual examples
- **Weak for:** cross-component rules, rationale prose, system-level architecture decisions
- **Status:** in use. Formalise the section dependency map and API stability gate

## Option B — `docs/conventions/` markdown

Already in use for CLAUDE.md and the style guides. Plain markdown: machine-readable,
searchable, diffable. No live examples.

- **Best for:** system-level rules, cross-component decisions, CLAUDE.md supplements
- **Weak for:** visual examples, interactive demos
- **Status:** in use. Extend to cover component rules spanning multiple stories (chip
  taxonomy, card composition rules)

## Option C — Claude-generated API docs via MCP/scripts

A build-time script reads component source (`*.tsx`, `*.module.css`, `tokens.json`) and
generates a `docs/generated/` markdown file per component: props table, token usage, CSS
variable inventory. A human edits the rationale layer; the script keeps the API layer current
on each build.

- **Best for:** keeping prop tables and token inventories accurate as a component evolves
- **Weak for:** design rationale, usage examples
- **Status:** not implemented. Viable with existing Claude/MCP tooling. Add to the backlog
  when component count justifies the maintenance overhead

## Option D — Zeroheight / Supernova

Design-system platforms that bridge Figma tokens → code → docs. Require Figma component
parity first.

- **Best for:** stakeholder-facing DS showcasing, design-to-code token sync
- **Weak for:** developer-facing rules, monorepo-embedded workflow
- **Status:** deferred until Figma parity exists (SUG-109)

## Recommended path

**A + B together.** Storybook Guidelines stories for component-level examples,
`docs/conventions/` markdown for system-level rules, CLAUDE.md linking to both. When component
count warrants it, add Option C for automated API doc generation.
