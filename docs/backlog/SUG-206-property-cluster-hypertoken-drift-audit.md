---
**Epic:** SUG-206 — Property-cluster (hypertoken) drift audit
**Linear Issue:** [SUG-206](https://linear.app/sugartown/issue/SUG-206/property-cluster-hypertoken-drift-audit)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-206 — Property-cluster (hypertoken) drift audit

System-wide inventory of hand-copied multi-property style bundles (typography, spacing, surfaces, motion) that drift silently across CSS files, following up on the heading-token drift finding in the hypertokens alignment audit.

## Background

The alignment audit at `docs/reports/alignment-audit-hypertokens-vs-sugartown-tokens.md` (2026-07-02) compared Sugartown's token pipeline against the "hypertokens" concept (a compiled bundle of multiple CSS properties, read once, instead of a decision hand-copied everywhere it's used). It proved the exact failure mode exists for headings: `font-size: var(--st-font-heading-2); font-weight: var(--st-font-weight-bold); color: var(--st-color-brand-primary)` is independently re-declared across at least 6 CSS files (`ContentBlock.module.css`, `RichText.module.css`, `PageSections.module.css` ×4, `Hero.module.css`, `TrustReportSection.module.css`), with `line-height` inconsistently token-referenced, omitted, or hardcoded (`line-height: 1.3`).

That audit deliberately scoped to one case (headings) to prove the pattern exists — it did not check the other bundle domains the source article names: spacing groups, surfaces (background + border + radius + shadow), and motion/transforms. Before scoping a fix (a bundling layer, a new DS component, or tooling), we need to know whether heading drift is an isolated incident or a systemic pattern across the DS component layer (`apps/web/src/design-system/components/`, `packages/design-system/src/components/`) and app-level components (`apps/web/src/components/`).

## Objective

After this epic, there is a single audit report (`docs/reports/property-cluster-drift-audit.md`) that enumerates every property-cluster Sugartown's UI relies on but does not currently compile as one unit — one section per bundle domain (typography, spacing, surfaces, motion), each with cited file:line evidence of every hand-duplicated instance and a Match/Drift/Gap verdict. The report ends with a per-domain recommendation on whether a bundling fix is warranted, sized by rough migration cost (file/instance count).

This epic touches **documentation only**. It does not touch `tokens/source/tokens.json`, any generated `tokens.css`, any component CSS, or any DS component code — building the fix (if warranted) is explicitly deferred to a follow-on epic scoped after this audit's findings exist.

## Scope

- [ ] Full typography sweep: grep every `var(--st-font-*)` usage (heading, body, caption, family, weight, line-height, letter-spacing tokens) across all CSS in `apps/web/src/**/*.css` and `packages/design-system/src/**/*.css` — not a sample, exhaustive. Tabulate which of {family, size, weight, line-height, letter-spacing, color} accompany each usage and flag hardcoded escapes (e.g. the known `line-height: 1.3` in `ContentBlock.module.css`). — layer: tooling/audit
- [ ] Spacing-group sweep: identify any place 2+ spacing tokens combine into a repeated shorthand pattern (padding/margin pairs, stack rhythms) that's hand-duplicated across files rather than expressed once. — layer: tooling/audit
- [ ] Surface sweep: identify background + border + radius + shadow combinations repeated across structured-surface components (Card, MetadataCard, Callout, FilterBar) — cross-reference the dark-mode cascade and bg-through-gap patterns already named in `CLAUDE.md` to see whether those existing prose conventions are substituting for compiled infrastructure. — layer: tooling/audit
- [ ] Motion/transform sweep: identify transition/transform property clusters (e.g. hover-lift distance + duration + easing) repeated across interactive components (Button, Card, Chip, IconButton). — layer: tooling/audit
- [ ] Write `docs/reports/property-cluster-drift-audit.md` using the same evidence-based Match/Drift/Gap method as the precedent alignment audit — every verdict cited to file:line, no domain-level assertions without instance-level backing. — layer: documentation
- [ ] Add a report section evaluating whether `validate:tokens` (or a new script) could mechanically catch property-cluster drift going forward, independent of whether a bundling layer gets built. — layer: tooling/audit

## Acceptance criteria

- [ ] `docs/reports/property-cluster-drift-audit.md` exists and covers all 4 domains (typography, spacing, surfaces, motion), each with a Match/Drift/Gap verdict and file:line citations, plus any additional domain discovered during the sweep.
- [ ] Every hand-duplicated property-cluster instance found is individually listed with a citation — matching the evidence bar the precedent audit set, not a summary count.
- [ ] Report ends with an explicit "build a fix epic / monitor / not worth it" recommendation per domain, sized by rough file/instance count, so a follow-on fix epic's scope decision doesn't require re-deriving this analysis.
- [ ] No CSS, schema, token source, or generated token file is modified as part of this epic.

## Human QA Walkthrough — example local pages

Not applicable — documentation/audit epic only. No CSS, layout, token, or component changes ship as part of this epic.

## Technical notes

- **Content Write Gate:** not applicable — no Sanity writes.
- **Schema changes:** none.
- **Upstream dependencies:** builds directly on `docs/reports/alignment-audit-hypertokens-vs-sugartown-tokens.md` (2026-07-02) — read it first for the heading-drift precedent, the evidence method, and the framing caveats (Sugartown is web-only; no Figma-token sync exists; design source of truth is HTML mocks, not Figma).
- **Activation audits:**
  - Read `apps/web/scripts/validate-tokens.js` in full before writing the "could tooling catch this" section — its own header comment already documents scope boundaries (it checks `var()` resolution, not property-cluster consistency); confirm that's still accurate before citing it.
  - Grep exhaustively (not sample) across `apps/web/src/**/*.css` and `packages/design-system/src/**/*.css` for: every `var(--st-font-*)` reference, every `var(--st-space-*)`/`var(--st-spacing-*)` combination, every `background`/`border`/`border-radius`/`box-shadow` combination on structured-surface classes, and every `transition`/`transform` declaration. Exhaustiveness is the point of this epic — the precedent audit was explicitly a sample and said so.
  - Cross-reference `docs/conventions/token-naming.md` and any CSS-naming convention doc for existing prose-level rules that already try to compensate for this gap by hand (e.g. `CLAUDE.md`'s Section Layout Contract, bg-through-gap annotation rule, theme cascade audit) — note in the report where documentation is currently substituting for compiled infrastructure, since that's itself evidence of the problem's cost.
- **Model & Mode [REQUIRED]:** `/model sonnet` — pure audit/documentation epic, no code changes, no architecture decisions (a follow-on fix epic, if warranted, should use `/model opusplan` since it would involve real component/token architecture decisions).

## Non-Goals

- Building any hypertoken/composite-token compilation pipeline, DS component, or bundling mechanism — deferred to a follow-on fix epic scoped after this audit's findings exist.
- Migrating any component CSS off hand-assembled property clusters — same reason; this epic finds the problem, it doesn't fix it.
- Evaluating Figma bidirectional token sync — out of scope per the precedent audit's framing caveat: Sugartown's design source of truth is hand-authored HTML mocks (`docs/drafts/`), not Figma.
- Auditing native/iOS/Android platform drift — Sugartown is web-only; the source article's cross-platform framing doesn't apply here.

## Model & Mode [REQUIRED]

`/model sonnet` — pure audit/documentation epic, no code changes, no architecture decisions being made in this epic itself.

## Related

- **Linear:** [SUG-206](https://linear.app/sugartown/issue/SUG-206/property-cluster-hypertoken-drift-audit)
- **Precedent audit:** `docs/reports/alignment-audit-hypertokens-vs-sugartown-tokens.md`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time (Schema Enum Audit and Query Layer Checklist are likely not applicable given this epic's documentation-only scope — confirm at activation)
