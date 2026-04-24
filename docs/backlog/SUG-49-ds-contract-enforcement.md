# SUG-49 — Design System Contract Enforcement

**Linear Issue:** SUG-49
**Status:** Backlog
**Priority:** Medium

---

## Model & Mode [REQUIRED]

> Use Claude Code's `opusplan` alias for this epic. Opus handles planning
> (Pre-Execution Gate → Files to Modify), Sonnet handles execution
> (code changes, migration runs, acceptance tests). The handoff is automatic
> when you exit plan mode.
>
> **Session setup:**
> 1. `/model opusplan` — set once at session start
> 2. `Shift+Tab` until status bar reads "plan mode"
> 3. Paste this epic as the first prompt
> 4. Review Opus's plan against the gates below; push back until aligned
> 5. Exit plan mode (`Shift+Tab`) — Sonnet takes over for execution
>
> **Override rule:** if Sonnet stalls during execution on something that's
> architectural rather than mechanical (e.g. an unexpected cross-workspace
> type error, a token cascade that isn't resolving), type `/model opus`
> for that single question, then `/model opusplan` to return. Note the
> override in the epic's post-mortem so we learn where Sonnet's ceiling is.
>
> **When to deviate from opusplan:**
> - Pure copy/content epics (no code): use `/model sonnet` — no planning depth needed
> - Pure architecture epics (Schema ERD, SSR strategy, monorepo boundary changes): use `/model opus` — execution benefits from sustained depth too

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
