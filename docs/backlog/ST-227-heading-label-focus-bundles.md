---
**Epic:** ST-227 — Heading, label and focus-ring bundles: one definition each
**Issue:** [#227](https://github.com/bex-sugartown/sugartown/issues/227)
**Status and priority:** on the board ([project 1](https://github.com/users/bex-sugartown/projects/1)), not copied here
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Aligned:** 2026-11-15
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

- [x] **Choose the bundle mechanism** for headings and labels, under Opus plan mode, recorded in this doc with its tradeoff (§Phase 0 decisions). — layer: tokens / DS
- [x] **Phase 0 vspec** showing every heading level, the label style and the focus ring as they will ship, in light and dark, with the drifted variants that change marked. — layer: vspec
- [ ] **Heading bundle** per level (page-h1, h1 to h4): size, line-height, weight and family as one unit, with its responsive step, so the 8 `@media` size overrides go. — layer: tokens / DS styles
- [ ] **Migrate the 21 heading sites** (§Site classification) to compose a bundle class, and delete the 8 `@media` size overrides the bundle replaces. The serializer in `apps/web/src/lib/portableTextComponents.js` adds the class to bare `h2`/`h3`/`h4`. — layer: frontend CSS
- [ ] **Migrate the 37 label sites** (§Site classification) to compose `.monoLabel`. DS `Label` is a form `<label htmlFor>` and is not used for them. Card's `700`/`0.08em` reconcile to the bundle. — layer: frontend CSS / DS
- [ ] **One focus ring**: add `--st-focus-ring` and `--st-focus-ring-offset` to `tokens/source/tokens.json`; the 26 sites classified migrate read them; the kept variants are named in §Site classification. — layer: frontend CSS / tokens
- [ ] **Validator checks** in `validate:tokens`: a heading size token in a block without the bundle's other properties, a raw weight or tracking beside a label size, and a focus outline that bypasses `--st-color-focus`. Each one proves it fires with a liveness probe (`pnpm validate:liveness-probes`). — layer: tooling
- [ ] **Retire the prose rules the bundle replaces**, shown as a diff under the Instruction & Rule File Write Gate: the heading-token cross-check in `.claude/rules/tokens.md` and its line in `docs/epic-template.md`. — layer: docs

## Phases

| Phase | Covers Scope items | Ships | Gate |
|---|---|---|---|
| 0. Decide and spec | mechanism choice, vspec, classification of every heading, label and focus site | §Phase 0 decisions, the vspec, §Site classification | **Bex signs off the vspec, the class/token naming table and the rule-file diffs** (CLAUDE.md §Phase 0) |
| 1. Headings | heading bundle, 32 sites, merge the four `.h2/.h3/.h4` copies | headings read one definition per level | none |
| 2. Labels | 44 label sites, Card and SectionLabel reconciliation | labels read one definition | none |
| 3. Focus | one ring, 22 sites, variant decisions | focus rings read `--st-color-focus` | none |
| 4. Enforce | validator checks with liveness probes, retire the prose rules | `validate:tokens` fails on drift | none |

## Phase 0 decisions

Planned under Opus plan mode, 2026-11-15. Vspec: `docs/drafts/ST-227-heading-label-focus-bundles.vspec.html`.

| Decision | Answer | Why |
|---|---|---|
| Heading and label mechanism | One shared CSS module, `packages/design-system/src/styles/type.module.css`, consumed with `composes:` (or imported directly where a serializer adds the class) | Carries every property a bundle needs, including letter-spacing, case and the 768px step, with no JSX churn. Composite `font` tokens can't carry letter-spacing or case, and they reset `font-style`. A `Heading` component adds JSX to every serializer for no gain |
| Focus ring | Two tokens, `--st-focus-ring` and `--st-focus-ring-offset` | `composes` can't reach `:focus-visible` selectors |
| Colour | Not in any bundle (vspec decision 2) | Colour is surface context; 3 of 10 h2 sites use the default text colour on purpose |
| DS `Label` | Not used for label sites | It renders `<label htmlFor>` (`packages/design-system/src/components/Label/Label.tsx`) |
| `composes` across packages | Works | Spike 2026-11-15: resolved in `vite` dev, `vite build`, the DS `esbuild` build (`esbuild-css-modules-plugin`) and `storybook build`; reverted. The DS build inlines one copy of a composed class per consuming file |

Open in the vspec, section 9: colour in the bundle, the platform hub italic, the page eyebrow's case, and the mobile step for every heading level.

## Site classification

From `python3 -I docs/reports/property-cluster-drift-audit.sweep.py`, 2026-11-15.

### Headings: 40 blocks

| Site | Selector | Level | Decision | Visible change |
|---|---|---|---|---|
| `ds/components/PageHeader/PageHeader.module.css:91` | `.title` | page-h1 | migrate: compose `headingPage` | none (this block becomes the headingPage definition) |
| `web/components/Hero.module.css:49` | `.heading` | heading-1 | migrate: compose `heading1` | none: same token values |
| `web/components/PageSections.module.css:288` | `.heroHeading` | heading-1 | migrate: compose `heading1` | none: same token values |
| `web/components/PlatformLayout/PlatformHero.module.css:37` | `.heading` | heading-1 | migrate: compose `headingPage` | moves to headingPage: size 3.25rem to 3rem, weight 400 kept (headingPage is normal weight), line-height 1.1 to 1.25 |
| `web/components/ContentBlock.module.css:15` | `.h2` | heading-2 | migrate: compose `heading2` | none: same token values |
| `web/components/Hero.module.css:81` | `.heading` (@media) | heading-2 | delete: the bundle carries the 768px step | none |
| `web/components/PageSections.module.css:362` | `.sectionHeading` | heading-2 | migrate: compose `heading2` | gains the mobile size step |
| `web/components/PageSections.module.css:388` | `.h2` | heading-2 | migrate: compose `heading2` | none: same token values |
| `web/components/PageSections.module.css:919` | `.ctaHeading` | heading-2 | migrate: compose `heading2` | gains line-height 1.25 (was inherited) and the mobile size step |
| `web/components/PageSections.module.css:1178` | `.heroHeading` (@media) | heading-2 | delete: the bundle carries the 768px step | none |
| `web/components/RichText.module.css:23` | `.h2` | heading-2 | migrate: compose `heading2` | gains the mobile size step |
| `web/components/TrustReportSection.module.css:14` | `.sectionHeading` | heading-2 | migrate: compose `heading2` | gains the mobile size step |
| `web/pages/pages.module.css:221` | `.detailContent h2` | heading-2 | migrate: compose `heading2`, class added in the serializer | gains the mobile size step (article, glossary and person body h2) |
| `web/pages/platform/PlatformHubPage.module.css:45` | `.heading` | heading-2 | migrate: compose `heading2` | weight 600 to 700, line-height 1.1 to 1.25, gains the mobile size step; italic kept locally |
| `web/components/ContactForm.module.css:32` | `.successHeading` | heading-3 | migrate: compose `heading3` | weight 700 to 600, gains line-height 1.3 and the mobile size step |
| `web/components/ContentBlock.module.css:23` | `.h3` | heading-3 | migrate: compose `heading3` | none: same token values |
| `web/components/ContentBlock.module.css:78` | `.h2` (@media) | heading-3 | delete: the bundle carries the 768px step | none |
| `web/components/Form.module.css:32` | `.successHeading` | heading-3 | migrate: compose `heading3` | weight 700 to 600, gains line-height 1.3 and the mobile size step |
| `web/components/Hero.module.css:56` | `.subheading` | heading-3 | not a heading: hero lead paragraph; stays as is | none |
| `web/components/PageSections.module.css:295` | `.heroSubheading` | heading-3 | not a heading: hero lead paragraph; stays as is | none |
| `web/components/PageSections.module.css:332` | `.heroStatValue` | heading-3 | not a heading: stat numeral, not a heading; stays as is | none |
| `web/components/PageSections.module.css:396` | `.h3` | heading-3 | migrate: compose `heading3` | none: same token values |
| `web/components/PageSections.module.css:840` | `.citedBlockHeading` | heading-3 | migrate: compose `heading3` | gains the mobile size step |
| `web/components/PageSections.module.css:1198` | `.h2` (@media) | heading-3 | delete: the bundle carries the 768px step | none |
| `web/components/RichText.module.css:32` | `.h3` | heading-3 | migrate: compose `heading3` | gains the mobile size step |
| `web/pages/pages.module.css:229` | `.detailContent h3` | heading-3 | migrate: compose `heading3`, class added in the serializer | gains the mobile size step (article, glossary and person body h3) |
| `web/components/ContentBlock.module.css:5` | `.contentBlock` | heading-4 | not a heading: body text set at the h4 size; stays as is | none |
| `web/components/ContentBlock.module.css:82` | `.h3` (@media) | heading-4 | delete: the bundle carries the 768px step | none |
| `web/components/Drawer.module.css:102` | `.navItem` | heading-4 | not a heading: drawer nav item, not a heading; stays as is | none |
| `web/components/Hero.module.css:85` | `.subheading` (@media) | heading-4 | delete: the bundle carries the 768px step | none |
| `web/components/PageSections.module.css:370` | `.textContent` | heading-4 | not a heading: body text set at the h4 size; stays as is | none |
| `web/components/PageSections.module.css:404` | `.h4` | heading-4 | migrate: compose `heading4` | line-height 1.4 to 1.3 |
| `web/components/PageSections.module.css:848` | `.citedBlockBody` | heading-4 | not a heading: body text set at the h4 size; stays as is | none |
| `web/components/PageSections.module.css:926` | `.ctaDescription` | heading-4 | not a heading: body text set at the h4 size; stays as is | none |
| `web/components/PageSections.module.css:1182` | `.heroSubheading` (@media) | heading-4 | delete: the bundle carries the 768px step | none |
| `web/components/PageSections.module.css:1202` | `.h3` (@media) | heading-4 | delete: the bundle carries the 768px step | none |
| `web/components/RichText.module.css:6` | `.richText` | heading-4 | not a heading: body text set at the h4 size; stays as is | none |
| `web/components/RichText.module.css:41` | `.h4` | heading-4 | migrate: compose `heading4` | line-height 1.4 to 1.3 |
| `web/pages/SiteGraphPage.module.css:198` | `.railHubLabel` | heading-4 | not a heading: graph rail label, not a heading; stays as is | none |
| `web/pages/pages.module.css:214` | `.detailContent` | heading-4 | not a heading: body text set at the h4 size; stays as is | none |

Migrate 21, delete 8 (`@media` steps), not a heading 11.

### Labels: 44 blocks

| Site | Selector | Decision | Visible change |
|---|---|---|---|
| `web/components/ContentsStrip.module.css:38` | `.chip` | migrate: compose `monoLabel` | none: same token values |
| `web/components/Drawer.module.css:50` | `.drawerLabel` | migrate: compose `monoLabel` | none: same token values |
| `web/components/Footer.module.css:71` | `.columnHeading` | migrate: compose `monoLabel` | none: same token values |
| `web/components/Footer.module.css:157` | `.colophonLabel` | migrate: compose `monoLabel` | none: same token values |
| `web/components/KnowledgeGraph/KnowledgeGraph.module.css:33` | `.loading` | migrate: compose `monoLabel` | none: same token values |
| `web/components/KnowledgeGraph/KnowledgeGraph.module.css:62` | `.legendItem` | migrate: compose `monoLabel` | none: same token values |
| `web/components/PageSections.module.css:340` | `.heroStatLabel` | migrate: compose `monoLabel` | none: same token values |
| `web/components/PageSidebar.module.css:20` | `.label` | migrate: compose `monoLabel` | none: same token values |
| `web/components/PageSidebar.module.css:104` | `.ethicsLink` | migrate: compose `monoLabel` | none: same token values |
| `web/components/PlatformLayout/PlatformHero.module.css:19` | `.eyebrow` | migrate: compose `monoLabel` | none: same token values |
| `web/components/PlatformLayout/PlatformSidebar.module.css:15` | `.sectionLabel` | migrate: compose `monoLabel` | none: same token values |
| `web/components/SchemaERD/SchemaERD.module.css:223` | `.sidebarSectionLabel` | migrate: compose `monoLabel` | none: same token values |
| `web/components/StatCard.module.css:100` | `.foot` | not the label bundle: mono meta line: no weight, no uppercase | none |
| `web/design-system/components/sidebar-nav/SidebarNav.module.css:13` | `.label` | migrate: compose `monoLabel` | none: same token values |
| `web/design-system/components/sidebar-nav/SidebarNav.module.css:71` | `.summary` | migrate: compose `monoLabel` | none: same token values |
| `web/design-system/components/tile/Tile.module.css:33` | `.label` | migrate: compose `monoLabel` | none: same token values |
| `web/design-system/components/tile/Tile.module.css:119` | `.meta` | not the label bundle: mono meta line: no weight, no uppercase | none |
| `web/pages/pages.module.css:151` | `.pageEyebrowText` | migrate: compose `monoLabel` | gains uppercase |
| `web/pages/pages.module.css:418` | `.seriesPartNumber` | migrate: compose `monoLabel` | none: same token values |
| `web/pages/pages.module.css:504` | `.filterChip` | migrate: compose `monoLabel` | none: same token values |
| `web/pages/pages.module.css:646` | `.graphCardRailHint` | migrate: compose `monoLabel` | none: same token values |
| `web/pages/pages.module.css:666` | `.graphHubCardType` | migrate: compose `monoLabel` | none: same token values |
| `web/pages/pages.module.css:683` | `.graphHubCardCta` | migrate: compose `monoLabel` | none: same token values |
| `web/pages/platform/PlatformHubPage.module.css:26` | `.eyebrow` | migrate: compose `monoLabel` | none: same token values |
| `web/pages/platform/PlatformHubPage.module.css:100` | `.trustLink` | migrate: compose `monoLabel` | none: same token values |
| `web/pages/platform/PlatformHubPage.module.css:153` | `.priorityBadge` | migrate: compose `monoLabel` | gains weight 600 |
| `ds/components/Callout/Callout.module.css:49` | `.label` | migrate: compose `monoLabel` | none: same token values |
| `ds/components/Callout/Callout.module.css:110` | `.bannerLabel` | migrate: compose `monoLabel` | none: same token values |
| `ds/components/Card/Card.module.css:135` | `.folioStatus` | migrate: compose `monoLabel` | weight 700 to 600; tracking unchanged (0.1em is the token value) |
| `ds/components/Card/Card.module.css:274` | `.statusBadge` | migrate: compose `monoLabel` | weight 700 to 600; tracking unchanged (0.1em is the token value) |
| `ds/components/Card/Card.module.css:457` | `.chipGroupLabel` | migrate: compose `monoLabel` | weight 700 to 600, tracking 0.08em to 0.1em |
| `ds/components/Card/Card.module.css:634` | `.compact .eyebrow` | keep: compact-mode size step in a descendant selector, which `composes` can't use | none |
| `ds/components/Card/Card.module.css:638` | `.compact .folioLabel` | keep: compact-mode size step in a descendant selector, which `composes` can't use | none |
| `ds/components/Card/Card.module.css:642` | `.compact .footerCategoryLink` | keep: compact-mode size step in a descendant selector, which `composes` can't use | none |
| `ds/components/Card/Card.module.css:646` | `.compact .date` | keep: compact-mode size step in a descendant selector, which `composes` can't use | none |
| `ds/components/DescriptionList/DescriptionList.module.css:121` | `.term` | migrate: compose `monoLabel` | none: same token values |
| `ds/components/Field/Field.module.css:10` | `.label` | migrate: compose `monoLabel` | none: same token values |
| `ds/components/FilterBar/FilterBar.module.css:30` | `.filterTitle` | migrate: compose `monoLabel` | none: same token values |
| `ds/components/FilterBar/FilterBar.module.css:81` | `.facetLabel` | migrate: compose `monoLabel` | none: same token values |
| `ds/components/Label/Label.module.css:4` | `.label` | migrate: compose `monoLabel` | none: same token values |
| `ds/components/Meter/Meter.module.css:9` | `.label` | migrate: compose `monoLabel` | none: same token values |
| `ds/components/Metric/Metric.module.css:35` | `.label` | migrate: compose `monoLabel` | none: same token values |
| `ds/components/SectionLabel/SectionLabel.module.css:22` | `.number` | not the label bundle: section numeral: tighter tracking, no uppercase, by design | none |
| `ds/components/SectionLabel/SectionLabel.module.css:31` | `.name` | migrate: compose `monoLabel` | none: same token values |

Migrate 37, keep 4, not the label bundle 3.

### Focus rings: 41 blocks, 10 rings

| Ring | Sites | Decision | Visible change |
|---|---|---|---|
| outline `2px solid var(--st-color-brand-primary)`; outline-offset `2px` | 22 | migrate: `outline: var(--st-focus-ring); outline-offset: var(--st-focus-ring-offset)` | none: both colours resolve to `--st-color-pink` |
| outline `2px solid color-mix(in srgb, var(--st-color-focus) 30%, transparent)`; outline-offset `2px` | 3 | keep: form-control or overlay ring drawn with box-shadow or a tint, by design | none |
| outline `3px solid var(--st-color-pink)`; outline-offset `3px` | 3 | keep: heavier ring over images in the lightbox and carousel | none |
| outline `none` | 3 | keep: the nav item draws its own focus indicator | none (activation check: confirm the indicator exists) |
| outline `2px solid var(--st-color-focus)`; outline-offset `2px` | 3 | migrate: `outline: var(--st-focus-ring); outline-offset: var(--st-focus-ring-offset)` | none: both colours resolve to `--st-color-pink` |
| box-shadow `0 0 0 2px var(--st-color-bg-elevated)` | 2 | keep: form-control or overlay ring drawn with box-shadow or a tint, by design | none |
| box-shadow `0 0 0 2px var(--st-color-brand-primary-tint-10)` | 2 | keep: form-control or overlay ring drawn with box-shadow or a tint, by design | none |
| box-shadow `0 0 0 2px color-mix(in srgb, var(--st-color-focus) 18%, transparent)`; outline `none` | 1 | keep: form-control or overlay ring drawn with box-shadow or a tint, by design | none |
| outline `2px solid var(--st-color-brand-primary)`; outline-offset `4px` | 1 | migrate the ring, keep the 4px offset locally (logo sits tight to the header edge) | none |
| box-shadow `0 0 0 2px var(--st-color-accent)`; outline `none` | 1 | keep: form-control or overlay ring drawn with box-shadow or a tint, by design | none |

## Acceptance Criteria

- [x] The mechanism decision is recorded in this doc with its tradeoff, before any CSS is written (§Phase 0 decisions).
- [ ] The vspec is signed off before any file under `apps/web/src/`, `packages/design-system/src/` or `tokens/` changes.
- [ ] Re-running `python3 -I docs/reports/property-cluster-drift-audit.sweep.py` shows no heading site that re-declares the bundle's properties by hand, except the variants named in this doc.
- [ ] `.h2`, `.h3` and `.h4` are defined in one stylesheet (`grep -rn "^\.h[234] " apps/web/src packages/design-system/src --include='*.css'` returns one file).
- [ ] No label site sets `font-family: var(--st-font-family-mono)` beside `--st-label-size`, and none sets a raw weight or letter-spacing (sweep table A2).
- [ ] `grep -rn "outline: 2px solid var(--st-color-brand-primary)" apps/web/src packages/design-system/src --include='*.css'` returns nothing.
- [ ] Each new validator check fails on a planted violation and passes after it is reverted, recorded by `pnpm validate:liveness-probes`.
- [ ] `pnpm validate:tokens`, `pnpm validate:contrast` and `pnpm test:smoke` pass.
- [ ] Visual QA approved against the vspec (design-reviewer comparison table), and Chromatic approved before the push.

## Human QA Walkthrough — example local pages

| Page type | Example local URL (slugs read from Sanity 2026-11-15) | What changes |
|---|---|---|
| Home (hero, CTA, trust report) | `/` | hero heading composes heading1; CTA heading gains tight line-height; trust report heading gains the mobile step |
| Article detail | `/articles/oh-oh-atomic-one-model-two-systems` | body h2/h3 gain the mobile step; eyebrow uppercase; labels |
| Case study detail | `/case-studies/sugartown-platform-is-the-portfolio` | page-section h2/h3/h4 (h4 line-height 1.3) |
| Node detail | `/nodes/poc-platform-agnostic-by-design` | page-section headings; labels |
| Glossary term | `/glossary/ai-stamp` | body h2/h3 gain the mobile step |
| Person profile | `/people/bex` | body headings; labels |
| Page with text sections | `/about` | rich text h2/h3/h4 |
| Contact page | `/contact` | CTA heading line-height |
| Platform hub | `/platform` | hub heading weight, line-height, italic (decision 3) |
| Platform sub-page | `/platform/cms` | PlatformHero heading moves to headingPage |
| Archive (regression guard) | `/articles` | filter chips and labels: no change expected |
| Taxonomy archive (regression guard) | `/tags` | labels: no change expected |
| Form success state | Storybook `Form` story | success heading weight 700 to 600; not reachable on the site without submitting |

Check each at desktop width and at 375px, light and dark, plus keyboard focus on a link and a chip.

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
