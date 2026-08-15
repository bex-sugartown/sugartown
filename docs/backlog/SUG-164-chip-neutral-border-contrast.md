---
**Epic:** SUG-164 — Chip neutral border contrast — 1.3:1 non-text contrast (system token review)
**Linear Issue:** [SUG-164](https://linear.app/sugartown/issue/sug-164)
**Status:** Backlog
**Priority:** 🔵 Low
**Labels:** Design System
**Merge strategy:** (a) Merge-as-you-go
---

# SUG-164 — Chip neutral border contrast — 1.3:1 non-text contrast (system token review)

> **Backlog doc created 2026-08-15**, backfilled during migration Phase 2. This issue was open
> in Linear with no `docs/backlog/` doc — one of nine found by the first parity audit since
> `validate:epic-docs` was archived by SUG-284. The Background below is the Linear description
> verbatim; it was already substantive, so it is preserved rather than paraphrased.

## Background

Logged from the [SUG-162](https://linear.app/sugartown/issue/SUG-162/glossary-term-detail-design-handoff-implementation-reuse-first) design handoff (Open Item 1): the neutral Chip border (`--st-chip-border` → neutral-300) measures ~1.3:1 non-text contrast against the page background. WCAG 1.4.11 requires 3:1 for meaningful UI component boundaries, though chips with adjacent text labels may pass via the text itself.

Scope: system-level token review of `--st-chip-border` (and any other hairline borders that carry meaning) across light + dark Pink Moon themes. Deliberately NOT fixed locally in [SUG-162](https://linear.app/sugartown/issue/SUG-162/glossary-term-detail-design-handoff-implementation-reuse-first) — a local override would fork the token graph.

Affected surfaces: all `Chip variant="status"` / `variant="tag"` neutral chassis, including the [SUG-162](https://linear.app/sugartown/issue/SUG-162/glossary-term-detail-design-handoff-implementation-reuse-first) abbreviation badge and tag chips.

## Scope

Scope is carried in the Background above, which came over from Linear complete. Before
executing, confirm it still holds — several of these were written between 2026-07-23 and
2026-08-09 and the platform has moved since (SUG-284 removed the governance layer; v0.33.0
shipped 2026-08-15).

## Related

- **Linear:** [SUG-164](https://linear.app/sugartown/issue/sug-164)
- Backfilled by the Phase 2 parity audit — `docs/briefs/linear-to-github-migration-plan.md` §5.1
