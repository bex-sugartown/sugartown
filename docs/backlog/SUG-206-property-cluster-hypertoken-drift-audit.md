---
**Epic:** SUG-206 — Property-cluster (hypertoken) drift audit
**GitHub Issue:** [#68](https://github.com/bex-sugartown/sugartown/issues/68) (legacy ID SUG-206; Linear retired 2026-09-05)
**Status and priority:** on the board ([project 1](https://github.com/users/bex-sugartown/projects/1)), not copied here
**Merge strategy:** (b) Single close-out — one long-lived branch, shipped with `/ship`
**Aligned:** 2026-11-15
**Visual:** no (documentation-only audit; nothing renders)
---

# SUG-206 — Property-cluster (hypertoken) drift audit

## Verified 2026-09-19

Re-measured against the repo and Sanity. Where this section disagrees with the text below, this section is current.

- **Still open, and the drift has grown.** The heading-2 bundle is now in 10 selectors across 7 files (8 when the audit ran). New since: `pages/pages.module.css:221` and `pages/platform/PlatformHubPage.module.css:45`. `PlatformHubPage:45` has already drifted (`line-height: 1.1`, no weight, different colour).
- **The source report's h2 example is wrong.** `ContentBlock.module.css:27` is the `.h3` block; `.h2` has used `var(--st-line-height-tight)` since 2026-01-24. The real hardcoded `line-height: 1.3` drift is in h3, in 4 files (ContentBlock, RichText, PageSections, pages.module.css). Fix this when the report is used as a source.
- **Rules cross-referenced below now live in `.claude/rules/`:** the Section Layout Contract and bg-through-gap rule in `css-layout.md`, the theme cascade in `tokens.md`.
- **Do after #74 (SUG-232).** Same files; the audit reads cleaner once raw fallbacks are gone and the validator is extended. Recorded as a GitHub relation.
- 655 tokens today, not 656.

System-wide inventory of hand-copied multi-property style bundles (typography, spacing, surfaces, motion) that drift silently across CSS files, following up on the heading-token drift finding in the hypertokens alignment audit.

## Background

The alignment audit at `docs/reports/alignment-audit-hypertokens-vs-sugartown-tokens.md` (2026-07-02) compared Sugartown's token pipeline against the "hypertokens" concept (a compiled bundle of multiple CSS properties, read once, instead of a decision hand-copied everywhere it's used). It proved the exact failure mode exists for headings: `font-size: var(--st-font-heading-2); font-weight: var(--st-font-weight-bold); color: var(--st-color-brand-primary)` is independently re-declared across at least 6 CSS files (`ContentBlock.module.css`, `RichText.module.css`, `PageSections.module.css` ×4, `Hero.module.css`, `TrustReportSection.module.css`), with `line-height` inconsistently token-referenced, omitted, or hardcoded (`line-height: 1.3`).

That audit deliberately scoped to one case (headings) to prove the pattern exists — it did not check the other bundle domains the source article names: spacing groups, surfaces (background + border + radius + shadow), and motion/transforms. Before scoping a fix (a bundling layer, a new DS component, or tooling), we need to know whether heading drift is an isolated incident or a systemic pattern across the DS component layer (`apps/web/src/design-system/components/`, `packages/design-system/src/components/`) and app-level components (`apps/web/src/components/`).

## Objective

After this epic, there is a single audit report (`docs/reports/property-cluster-drift-audit.md`) that enumerates every property-cluster Sugartown's UI relies on but does not currently compile as one unit — one section per bundle domain (typography, spacing, surfaces, motion), each with cited file:line evidence of every hand-duplicated instance and a Match/Drift/Gap verdict. The report ends with a per-domain recommendation on whether a bundling fix is warranted, sized by rough migration cost (file/instance count).

This epic touches **documentation only**. It does not touch `tokens/source/tokens.json`, any generated `tokens.css`, any component CSS, or any DS component code — building the fix (if warranted) is explicitly deferred to a follow-on epic scoped after this audit's findings exist.

## Scope

- [x] Full typography sweep: grep every `var(--st-font-*)` usage (heading, body, caption, family, weight, line-height, letter-spacing tokens) across all CSS in `apps/web/src/**/*.css` and `packages/design-system/src/**/*.css` — not a sample, exhaustive. Tabulate which of {family, size, weight, line-height, letter-spacing, color} accompany each usage and flag hardcoded escapes (e.g. the known `line-height: 1.3` in `ContentBlock.module.css`). — layer: tooling/audit
- [x] Spacing-group sweep: identify any place 2+ spacing tokens combine into a repeated shorthand pattern (padding/margin pairs, stack rhythms) that's hand-duplicated across files rather than expressed once. — layer: tooling/audit
- [x] Surface sweep: identify background + border + radius + shadow combinations repeated across structured-surface components (Card, MetadataCard, Callout, FilterBar) — cross-reference the dark-mode cascade and bg-through-gap patterns already named in `CLAUDE.md` to see whether those existing prose conventions are substituting for compiled infrastructure. — layer: tooling/audit
- [x] Motion/transform sweep: identify transition/transform property clusters (e.g. hover-lift distance + duration + easing) repeated across interactive components (Button, Card, Chip, IconButton). — layer: tooling/audit
- [x] Write `docs/reports/property-cluster-drift-audit.md` using the same evidence-based Match/Drift/Gap method as the precedent alignment audit — every verdict cited to file:line, no domain-level assertions without instance-level backing. — layer: documentation
- [x] Add a report section evaluating whether `validate:tokens` (or a new script) could mechanically catch property-cluster drift going forward, independent of whether a bundling layer gets built. — layer: tooling/audit

## Phases

| Phase | Covers Scope items | Output | Gate |
|---|---|---|---|
| 1. Sweep | typography, spacing-group, surface, motion sweeps (Scope items 1 to 4) | raw instance tables, file:line per instance | none |
| 2. Report | write the report, validator-feasibility section (Scope items 5 and 6) | `docs/reports/property-cluster-drift-audit.md` | none |

Phase 2 starts in the same turn as Phase 1 ends.

## Start audit

- `.claude/rules/tokens.md` changed 2026-10-11 (#74): `validate:tokens` now rejects raw `var(--st-*, <value>)` fallbacks of every type and scans `apps/storybook/.storybook/` too. The epic's "could tooling catch this" item assumed the July scope. Fix: the report cites the current validator header, and the sweep adds `apps/storybook/.storybook/**/*.css`.
- The one missing path (`docs/reports/property-cluster-drift-audit.md`) is this epic's output.
- Skipped 45 of 47 changed rule files: content pipeline, vspec, process and gate docs, none touch CSS or tokens. Read: `.claude/rules/tokens.md`, `.claude/rules/css-layout.md` (only change since July is the ST-130 path move).
- Hard stop items 4 to 7: no page set (4 N/A), no mechanical transform (5 N/A), every Scope item maps to a phase (6 clear), Scope and Non-Goals agree on no CSS or token change (7 clear).
- Pre-Execution checklist: every item N/A (no component, schema, page, diagram, mechanism or removal), except "correct audit file paths", checked at the sweep.

## Acceptance criteria

- [x] `docs/reports/property-cluster-drift-audit.md` exists and covers all 4 domains (typography, spacing, surfaces, motion), each with a Match/Drift/Gap verdict and file:line citations, plus any additional domain discovered during the sweep.
- [x] Every hand-duplicated property-cluster instance found is individually listed with a citation — matching the evidence bar the precedent audit set, not a summary count.
- [x] Report ends with an explicit "build a fix epic / monitor / not worth it" recommendation per domain, sized by rough file/instance count, so a follow-on fix epic's scope decision doesn't require re-deriving this analysis.
- [x] No CSS, schema, token source, or generated token file is modified as part of this epic.

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
- **Model & Mode [REQUIRED]:** `/model sonnet` — pure audit/documentation epic, no code changes, no architecture decisions (a follow-on fix epic, if warranted, should use `/model opus` + plan mode since it would involve real component/token architecture decisions).

## Non-Goals

- Building any hypertoken/composite-token compilation pipeline, DS component, or bundling mechanism — deferred to a follow-on fix epic scoped after this audit's findings exist.
- Migrating any component CSS off hand-assembled property clusters — same reason; this epic finds the problem, it doesn't fix it.
- Evaluating Figma bidirectional token sync — out of scope per the precedent audit's framing caveat: Sugartown's design source of truth is hand-authored HTML mocks (`docs/drafts/`), not Figma.
- Auditing native/iOS/Android platform drift — Sugartown is web-only; the source article's cross-platform framing doesn't apply here.

## Model & Mode [REQUIRED]

`/model sonnet` — pure audit/documentation epic, no code changes, no architecture decisions being made in this epic itself.

## Related

- **GitHub:** [#68](https://github.com/bex-sugartown/sugartown/issues/68)
- **Precedent audit:** `docs/reports/alignment-audit-hypertokens-vs-sugartown-tokens.md`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time (Schema Enum Audit and Query Layer Checklist are likely not applicable given this epic's documentation-only scope — confirm at activation)

## Close-out review

### Acceptance criteria

- [x] Report exists and covers typography, spacing, surfaces, motion, plus focus rings found in the sweep, each with a verdict and file:line citations: `docs/reports/property-cluster-drift-audit.md`.
- [x] Every cluster instance is listed individually: Appendix A1, A2, B1, C1, C2, D1, D2 and E1, generated by `python3 -I docs/reports/property-cluster-drift-audit.sweep.py`. Raw single-property values are counted per file (A3, B2), not listed, because they are not clusters; the report says so.
- [x] Report ends with a fix / monitor / not-worth-it call per domain, sized by site and file count (§Recommendations).
- [x] No CSS, schema, token source or generated token file changed: `git show --stat 4248bd47` lists only the epic doc, the report and its sweep script.

### What didn't work

- An exploratory pass and the final generator used slightly different property sets for surfaces and focus rings (168 vs 162 surface blocks, 42 vs 41 focus blocks). Every count in the report was re-read from the generator output before commit, so no correction commit was needed.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| Heading, label and focus-ring bundles (76 + 22 sites) | implementation | #227 |
| Surfaces re-typed outside their DS component (about 23 sites) | implementation | #228 |
| Raw 150ms transitions duplicate `--st-transition-fast` (51 sites) | implementation | #229 |
| Two spacing scales and 332 raw spacing values | implementation | #230 |
| Precedent audit cites the h3 block as h2 | workflow-docs | declined: fixed in this epic, correction note at the top of `docs/reports/alignment-audit-hypertokens-vs-sugartown-tokens.md` |

### Friction line

none

## Post-ship checks

none (documentation only; nothing renders on the live site)
