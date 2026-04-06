# SUG-21 — Pink Moon: Design System Identity

**Linear Issue:** SUG-21
**Status:** Backlog (scope expanded, final specs TBD)
**Priority:** Elevated — this is the design system's next major evolution

---

## Context

Pink Moon is no longer a theme variant. It is becoming the primary design system identity. Classic dark/light modes served as scaffolding — the system needed a stable baseline before it could develop a voice. It has one now.

Final specs will be delivered as an updated PRD (`docs/briefs/design-system/design-system-prd.md`). This epic doc is a placeholder linking to the working documents that inform that PRD.

## Working Documents (local drafts — `docs/drafts/`, gitignored)

| Document | Purpose |
|----------|---------|
| `pink-moon-manifesto.md` | Visual philosophy, stained glass principle, academic interface, component evolution, migration path |
| `ai-slop-manifesto.md` | Design governance: earmarks of AI-generated slop, anti-slop tests, Sugartown audit (pass/fail) |
| `pink-moon-mock.html` | Interactive HTML mock: hero, cards, chips, buttons in both Pink Moon modes |

## Design System Documentation Audit (completed)

Full inventory of all DS docs with canonicality ranking:
- **Tier 1 (canonical):** PRD, `tokens.css`, `COMPONENT_CONTRACTS.md`
- **Tier 2 (active reference):** Button SPEC, Card/Chip READMEs, `theme.pink-moon.css`
- **Tier 3 (governance):** `CLAUDE.md`, `MEMORY.md`
- **Tier 4 (consolidate/retire):** Ruleset (split), Visual Audit (archive), Component Contracts (extract FilterBar)

## Key Decisions (from manifesto, pending PRD)

- Pink Moon Light = default mode
- Classic modes deprecated iteratively (available behind settings toggle during transition)
- Stained glass, not glassmorphism
- Academic interface patterns (citations, marginalia, indexes, glossaries)
- WCAG AA from ground up (maroon headings on light, frosted panel heroes, colour-matched chip contrast)
- Density through progressive disclosure (accordion metadata, archive index view)

## Scope Outline (final breakdown TBD in PRD)

1. Token convergence (Pink Moon Light ↔ Light Classic reconciliation)
2. Default mode flip to Pink Moon Light
3. Component Pink Moon overrides (12 components, prioritised)
4. Runtime toggle simplification (4 modes → 2)
5. Storybook coverage (all components × both modes)
6. Classic deprecation path

## Related Issues

- **SUG-45** (Done) — Storybook argTypes audit — controls exist for all components
- **SUG-47** (Backlog) — Storybook/Studio props alignment audit

## Non-Goals (for this epic)

- New page types or routes
- Sanity schema changes
- Content migration

---

*Created 2026-04-06. Specs TBD — will be an updated PRD.*
