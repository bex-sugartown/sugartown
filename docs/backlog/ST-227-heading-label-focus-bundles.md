---
**Epic:** ST-227 — Heading, label and focus-ring bundles: one definition each
**Issue:** [#227](https://github.com/bex-sugartown/sugartown/issues/227)
**Status and priority:** on the board ([project 1](https://github.com/users/bex-sugartown/projects/1)), not copied here
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** yes
**Vspec:** `docs/drafts/ST-227-heading-label-focus-bundles.vspec.html`
---

# ST-227 — Heading, label and focus-ring bundles: one definition each

Heading styles, the mono label style and the focus ring are each typed by hand at every site, and the copies drift. After this epic each one is declared once and every site reads it.

## Background

The SUG-206 audit (`docs/reports/property-cluster-drift-audit.md`, 2026-11-15, #68) swept all 106 in-scope stylesheets and found three hand-copied clusters that drift:

- **Headings.** 40 blocks in 13 files set a heading size token (`--st-font-page-h1`, `--st-font-heading-1` to `-4`); 8 are `@media` size-only overrides. Line-height is a token, `1.3`, `1.4`, `1.1`, `1.7` or absent; weight is a token or raw `400`/`600`. `.h2/.h3/.h4` are declared in four stylesheets that style the same rendered heading: `ContentBlock.module.css`, `RichText.module.css`, `PageSections.module.css`, `pages/pages.module.css` (`.detailContent h2/h3`). h3 hardcodes `line-height: 1.3` in 4 files. The global `h1…h6` rule (`packages/design-system/src/styles/globals.css:51`) supplies the family and a raw `font-weight: 600`.
- **Labels.** The label style already has a token family (`--st-label-font`, `-size`, `-weight`, `-tracking`, `-color`) and DS primitives (`Label`, `SectionLabel`), but 44 blocks in 23 files re-assemble it by hand. 15 use `--st-font-family-mono` instead of `--st-label-font`; Card uses raw `700` and `0.1em`/`0.08em` (`Card.module.css:135`, `:274`, `:457`).
- **Focus rings.** 41 focus blocks in 30 files use 10 distinct rings. 22 blocks in 17 files type `outline: 2px solid var(--st-color-brand-primary); outline-offset: 2px` instead of `--st-color-focus`. Both resolve to pink today, so a re-point of the focus colour for contrast would miss them.

**Why now:** the audit named this the highest-value fix, and two existing prose rules compensate for it by hand (the heading-token tier cross-check in `.claude/rules/tokens.md` and the epic template). Every count above comes from `python3 -I docs/reports/property-cluster-drift-audit.sweep.py`; re-run it at activation.

**Surfaces affected:** every page that renders a Portable Text heading (articles, nodes, case studies, pages, glossary), page sections (hero, CTA, text, cited block), the platform hub, every label and eyebrow, and every keyboard focus state.

## Objective

After this epic, each heading level, the label style and the focus ring has one definition, and every site reads it instead of re-typing the properties. The duplicated `.h2/.h3/.h4` sets in four stylesheets collapse to one. `validate:tokens` fails a heading or label site that drifts from its bundle and a focus ring that bypasses `--st-color-focus`.

**Layers:** design tokens (`tokens/source/tokens.json`, if the mechanism is tokens), DS styles (`packages/design-system/src/styles/`), component and page CSS (`apps/web/src/**`, `packages/design-system/src/components/**`), possibly DS components (`Label`, `SectionLabel`, and a heading primitive if one is chosen), and tooling (`apps/web/scripts/validate-tokens.js`). **Excluded:** Sanity schema, GROQ, content.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] **Choose the bundle mechanism** for headings and labels, under Opus plan mode, recorded in this doc with its tradeoff. Candidates: (a) composite tokens compiled by Style Dictionary (for example a `font` shorthand per level plus letter-spacing), (b) one utility class per level in the DS styles, (c) a DS `Heading` component. — layer: tokens / DS
- [ ] **Phase 0 vspec** showing every heading level, the label style and the focus ring as they will ship, in light and dark, with the drifted variants that change marked. — layer: vspec
- [ ] **Heading bundle** per level (page-h1, h1 to h4): size, line-height, weight and family as one unit, with its responsive step, so the 8 `@media` size overrides go. — layer: tokens / DS styles
- [ ] **Migrate the 32 heading bundle sites** in 13 files, and merge the four `.h2/.h3/.h4` copies into one. Each site is classified first: migrate, keep as a deliberate variant (named in this doc), or delete. — layer: frontend CSS
- [ ] **Migrate the 44 label sites** in 23 files to `<Label>`/`<SectionLabel>` or one shared class, family through `--st-label-font`; reconcile Card's `700`/`0.1em`/`0.08em` and `SectionLabel`'s `0.06em`. — layer: frontend CSS / DS
- [ ] **One focus ring**: the 22 brand-primary copies read `--st-color-focus`; each of the other 9 ring variants is kept (named here, with its reason) or folded in. — layer: frontend CSS / tokens
- [ ] **Validator checks** in `validate:tokens`: a heading size token in a block without the bundle's other properties, a raw weight or tracking beside a label size, and a focus outline that bypasses `--st-color-focus`. Each one proves it fires with a liveness probe (`pnpm validate:liveness-probes`). — layer: tooling
- [ ] **Retire the prose rules the bundle replaces**, shown as a diff under the Instruction & Rule File Write Gate: the heading-token cross-check in `.claude/rules/tokens.md` and its line in `docs/epic-template.md`. — layer: docs

## Phases

| Phase | Covers Scope items | Ships | Gate |
|---|---|---|---|
| 0. Decide and spec | mechanism choice, vspec, classification of every heading, label and focus site | the mechanism decision in this doc, the vspec, the classification tables | **Bex signs off the vspec, the class/token naming table and the rule-file diffs** (CLAUDE.md §Phase 0) |
| 1. Headings | heading bundle, 32 sites, merge the four `.h2/.h3/.h4` copies | headings read one definition per level | none |
| 2. Labels | 44 label sites, Card and SectionLabel reconciliation | labels read one definition | none |
| 3. Focus | one ring, 22 sites, variant decisions | focus rings read `--st-color-focus` | none |
| 4. Enforce | validator checks with liveness probes, retire the prose rules | `validate:tokens` fails on drift | none |

## Acceptance Criteria

- [ ] The mechanism decision is recorded in this doc with its tradeoff, before any CSS is written.
- [ ] The vspec is signed off before any file under `apps/web/src/`, `packages/design-system/src/` or `tokens/` changes.
- [ ] Re-running `python3 -I docs/reports/property-cluster-drift-audit.sweep.py` shows no heading site that re-declares the bundle's properties by hand, except the variants named in this doc.
- [ ] `.h2`, `.h3` and `.h4` are defined in one stylesheet (`grep -rn "^\.h[234] " apps/web/src packages/design-system/src --include='*.css'` returns one file).
- [ ] No label site sets `font-family: var(--st-font-family-mono)` beside `--st-label-size`, and none sets a raw weight or letter-spacing (sweep table A2).
- [ ] `grep -rn "outline: 2px solid var(--st-color-brand-primary)" apps/web/src packages/design-system/src --include='*.css'` returns nothing.
- [ ] Each new validator check fails on a planted violation and passes after it is reverted, recorded by `pnpm validate:liveness-probes`.
- [ ] `pnpm validate:tokens`, `pnpm validate:contrast` and `pnpm test:smoke` pass.
- [ ] Visual QA approved against the vspec (design-reviewer comparison table), and Chromatic approved before the push.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Content Write Gate:** does not fire; no Sanity writes.
- **Schema changes:** none.
- **Upstream dependencies:** SUG-206 (#68, Done) supplies the evidence. Not blocked by any open epic; activation audit: read `docs/backlog/` for in-flight epics touching `PageSections.module.css`, `RichText.module.css`, `Card.module.css` or `tokens.json`, and state why each is or isn't blocking.
- **Activation audits:**
  - Re-run the sweep script and use its A1, A2 and E1 tables as the site lists; do not copy counts from this doc.
  - Classify every site (CLAUDE.md §Incomplete epic doc hard stop, item 5): the `ctaHeading`, `heroStatValue`, `PlatformHero`/`PlatformHubPage` headings and the `heading-4` body-size uses (`.contentBlock`, `.richText`, `.detailContent`, `.textContent`) may be deliberate variants, not drift.
  - Read `docs/conventions/token-naming.md` and `.claude/rules/tokens.md` §DS Component Authoring Token-First Rule before naming any bundle token or class.
  - Run the Token value cross-check (`docs/epic-template.md`): grep each heading token's resolved value in `tokens.css` and compare it with the `Foundations/Typography` conventions story.
  - Read `sd.config.mjs` before choosing mechanism (a): it emits only `css/variables` today.
  - Component choice audit (`.claude/rules/react.md`) before choosing mechanism (c), and before moving label sites to `<Label>`.
  - Check every changed focus ring with `pnpm validate:contrast` and the axe gate in `pnpm test:smoke`, light and dark.
- **Chromatic:** fires; the diff touches CSS on most components.

## Model & Mode [REQUIRED]

`/model opus` with plan mode (Shift+Tab) for Phase 0: the mechanism choice is a token and DS architecture decision across 31 files. Exit plan mode to execute Phases 1 to 4, which can run on `/model sonnet` once the mechanism and classification are signed off.

## Non-Goals

- **Spacing, surfaces and motion.** Filed separately: #228 (surfaces), #229 (motion), #230 (spacing).
- **Raw typography values outside the bundle sites** (466 in 61 files, sweep table A3). Only the raw values inside a heading or label site migrated here are removed.
- **Changing the type scale itself** (new sizes or new levels). The bundle carries today's values; any value change is shown in the vspec and limited to resolving a drifted site.
- **Figma or native token output.** Sugartown is web-only (SUG-206 framing caveats).

## Related

- **GitHub:** [#227](https://github.com/bex-sugartown/sugartown/issues/227); relates to #68
- **Evidence:** `docs/reports/property-cluster-drift-audit.md` and `docs/reports/property-cluster-drift-audit.sweep.py`
- **Epic template:** `docs/epic-template.md` — complete the Pre-Execution checklist, Component-Reuse Manifest and Files to Modify at activation time
