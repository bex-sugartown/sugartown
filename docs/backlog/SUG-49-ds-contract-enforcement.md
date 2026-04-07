# SUG-49 — Design System Contract Enforcement

**Linear Issue:** SUG-49
**Status:** Backlog
**Priority:** Medium

---

## Context

Comparison against Cameron Miller's agent-ready DS architecture (5-layer model: design source → token pipeline → agent layer → implementation → contract/test layer) identified three structural gaps in Sugartown's design system. This epic addresses all three.

## Three Tracks

### Track 1: CI Gates

Automate existing validators as pre-commit hooks + build new validators:
- Existing: `validate:tokens`, `validate:urls`, `validate:content`
- New: raw value lint (no hardcoded hex in CSS), token sync check (DS ↔ web drift), schema source comment check
- Implementation: Husky pre-commit hook, local enforcement first (no GitHub Actions yet)

### Track 2: Component Registry as Data

`component-registry.json` — machine-readable inventory of every DS component with: name, package, web adapter path, props, tokens consumed, story file, spec file, variants, Pink Moon status.
- Queryable by Claude Code, CI gates, future Storybook plugin
- Build script: `pnpm registry:build`

### Track 3: Prose as Design Source of Truth

Architectural position paper documenting Sugartown's deliberate choice to use prose + code + HTML mocks as the design source of truth instead of Figma.

**Where prose works:** token definitions (CSS IS the spec), component behaviour (README + Storybook is testable), design philosophy (no Figma file captures governance rules), editorial/content patterns.

**Where prose breaks down:** spatial relationships (can't feel whitespace in prose), responsive behaviour (need visual verification), full-page visual hierarchy (component specs don't show composition), colour relationships in context (the thumb test requires eyes), handoff to non-Claude agents (prose is harder to parse than structured data).

**AI-heavy mitigation:** Claude Code as design tool (interactive HTML mocking), Storybook as visual reference (always in sync), preview panel as composition check, anti-slop governance as quality gate.

**Trade-offs accepted:** no pixel-perfect spec handoff, no visual version control, no multi-tool spatial exploration, scales poorly past 1-2 people.

This analysis becomes a section in the updated PRD (SUG-21), documenting the architectural decision honestly.

## Deliverables

1. Pre-commit hook enforcing validators + raw-value lint
2. `component-registry.json` with build script
3. "Prose as Design SoT" section in the PRD

## Related

- **SUG-21** — PRD update absorbs the prose-as-SoT section
- **SUG-48** — Schema audit, registry will include field mappings
- **SUG-47** (Done) — schema source comment pattern for CI

---

*Created 2026-04-07.*
