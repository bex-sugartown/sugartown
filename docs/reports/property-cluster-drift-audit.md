# Property-cluster drift audit: typography, spacing, surfaces, motion, focus

**Date:** 2026-11-15
**Epic:** SUG-206, issue [#68](https://github.com/bex-sugartown/sugartown/issues/68)
**Precedent:** `docs/reports/alignment-audit-hypertokens-vs-sugartown-tokens.md` (2026-07-02), which sampled headings only.
**Evidence command:** `python3 -I docs/reports/property-cluster-drift-audit.sweep.py`, run from the repo root. Every count and every `file:line` below comes from its output, reproduced in full in the Appendix. Re-run it before quoting a number from this report.
**Files scanned:** 106 CSS files, 1,739 rule blocks, 5,958 declarations, across `apps/web/src/`, `packages/design-system/src/` and `apps/storybook/.storybook/` (the same roots as `pnpm validate:tokens`). Token and theme definition files are excluded. The two mirrored style files (`globals.css`, `utilities.css`) are counted once, as the DS-package copy.
**Changes made:** none. No CSS, token source, generated token file or component was touched.

## Summary

A property cluster is two or more CSS properties that express one design decision (a heading style, a label style, a focus ring) and that are re-typed by hand at each site instead of being declared once. The sweep is exhaustive: every block in scope was parsed, not a sample.

**Heading drift is not isolated.** Hand-copied clusters exist in four of the five domains. Each domain's duplication has a different cause, so the fix differs too:

| Domain | Verdict | Size | What drifts | Recommendation |
|---|---|---|---|---|
| Typography: headings | **Drift** | 40 blocks, 13 files (8 are `@media` size overrides) | line-height (token, `1.3`, `1.4`, `1.1`, `1.7` or absent), weight (token or `400`/`600`), colour | **Build a fix epic** |
| Typography: labels | **Drift** | 44 blocks, 23 files | 2 family tokens for one family; Card overrides weight `700` and tracking `0.1em`/`0.08em` raw | **Build a fix epic** (same epic as headings) |
| Typography: raw values | **Gap** | 466 raw values, 61 files | `font-size` 159, `font-weight` 113, `line-height` 120, `letter-spacing` 74 | **Monitor** (only cut as part of the fix epic's sites) |
| Spacing | **Match** for clusters | 9 repeated multi-token values, 2 to 4 sites each | the repeats are heading margins (a typography problem) and chip padding | **Not worth it** as a bundle; raw spacing (332 values, 54 files) is a single-value issue |
| Surfaces | **Drift**, caused by components re-implemented, not by missing bundles | 21 repeated signatures, 2 to 4 sites each | Chip, IndexCell, Avatar, Input, Grid hairline and version badges re-typed outside their component | **Build a fix epic**, scoped as component reuse, not tokens |
| Motion | **Drift** | 86 transitions, 49 files, 55 distinct values | `--st-transition-fast` (150ms ease) is used 14 times; the same value typed raw as `150ms`/`0.15s` 51 times | **Monitor**, or fold into a validator |
| Focus rings (found in the sweep) | **Drift** | 41 focus blocks, 30 files, 10 distinct rings | 22 sites in 17 files type `2px solid var(--st-color-brand-primary)`, not `--st-color-focus` | **Build a fix epic** (small; accessibility-relevant) |

## Method

1. The script blanks comments, splits every file into rule blocks with their enclosing `@media`, and records each declaration with its line.
2. **Typography:** every block that sets `font-size` to a heading token or `--st-label-size` is listed with its family, weight, line-height, letter-spacing, transform and colour. Raw values in the four numeric typography properties are counted per file.
3. **Spacing:** every `padding*`, `margin*` or `gap` value with two or more `var(--st-*)` references is grouped by exact value; a group is a cluster when it appears in two or more files.
4. **Surfaces:** every block with two or more of {background, border, border-radius, box-shadow} gets a signature; identical signatures in two or more files are listed. Hairline containers (1px gap plus a background on the same block) are listed separately.
5. **Motion:** every `transition` value is grouped; every `transform` inside a `:hover` selector is listed; durations are classified as token or raw.
6. **Focus:** every block whose selector contains `focus` is grouped by its outline, outline-offset and box-shadow.

**Limits.** Exact-value grouping undercounts near-duplicates (`150ms ease` and `0.15s ease` are listed separately, though they are the same value). Selectors are not resolved against JSX, so a class that is never rendered is still counted. Inherited properties are not traced; where a heading block omits `font-family`, the global `h1, h2, …` rule at `packages/design-system/src/styles/globals.css:51` supplies `var(--st-font-narrative)` and a raw `font-weight: 600`.

## Correction to the precedent audit

The 2026-07-02 report cites `ContentBlock.module.css:27` as the h2 `line-height: 1.3` escape. Line 27 is in the `.h3` block (`.h3` starts at line 22). The `.h2` block (`ContentBlock.module.css:14`) uses `var(--st-line-height-tight)`. The `1.3` escape belongs to h3, in 5 blocks across 4 files (Appendix A1).

## Typography: headings (Drift)

**40 blocks in 13 files set a heading size token** (`--st-font-page-h1`, `-heading-1` to `-heading-4`). 8 of them are `@media` rules that only shrink the size. The other 32 each re-declare the bundle.

What drifts, per the Appendix A1 tables:

- **`--st-font-heading-2`: 10 blocks, 7 files.** The 2026-09-19 issue count still holds. Six sites agree on bold + tight + brand-primary. `PageSections.module.css:919` (`.ctaHeading`) has no line-height and uses `color-text-default`. `PlatformHubPage.module.css:45` (`.heading`) has no weight, `line-height: 1.1`, and `color-text-default`. Only `RichText.module.css:23`, `TrustReportSection.module.css:14` and `PlatformHubPage.module.css:45` set the family; the rest inherit it from `globals.css:51`.
- **`--st-font-heading-3`: 12 blocks, 7 files.** `line-height: 1.3` is hardcoded at `ContentBlock.module.css:23`, `PageSections.module.css:396`, `PageSections.module.css:840`, `RichText.module.css:32` and `pages/pages.module.css:229`. `PageSections.module.css:332` (`.heroStatValue`) uses raw `600` and `1`. The two `.successHeading` blocks (`ContactForm.module.css:32`, `Form.module.css:32`) carry no line-height.
- **`--st-font-heading-4`: 14 blocks, 7 files.** Line-height is `1.4` raw at `PageSections.module.css:404` and `RichText.module.css:41`, `1.7` at `PageSections.module.css:848`, `1.2` at `SiteGraphPage.module.css:198`, and token `line-height-relaxed` at four body-text sites. `heading-4` doubles as a body size (`.contentBlock`, `.richText`, `.detailContent`), so it names a size, not a heading.
- **`--st-font-heading-1`: 3 blocks.** `PlatformLayout/PlatformHero.module.css:37` uses raw weight `400` and `line-height: 1.1` where the other two use bold + tight.
- **Two parallel heading systems.** `.h2`/`.h3`/`.h4` are declared three times: `ContentBlock.module.css`, `RichText.module.css`, `PageSections.module.css`, plus `pages/pages.module.css` (`.detailContent h2/h3`). These are the same rendered heading from four stylesheets.

**Cost of a fix:** 32 bundle sites in 13 files, plus the 8 `@media` overrides, which disappear if the bundle carries its own responsive step.

## Typography: labels (Drift, with half the fix already built)

The label style (mono, small, semibold, tracked, uppercase) already has a token family: `--st-label-font`, `--st-label-size`, `--st-label-weight`, `--st-label-tracking`, `--st-label-color` (`tokens.css:185-191, 443-444`). It also has DS primitives: `Label` and `SectionLabel`. **The bundle is named but not compiled:** 44 blocks in 23 files re-assemble it by hand (Appendix A2).

From the A2 table:

| Property | Agrees with the bundle | Drifts |
|---|---|---|
| family | 25 use `--st-label-font` | 15 use `--st-font-family-mono` directly (resolves to the same value today; a re-point of `--st-label-font` misses them) |
| weight | 34 use `--st-label-weight` (600) | 3 in Card use raw `700`: `Card.module.css:135`, `:274`, `:457` |
| tracking | 36 use `--st-label-tracking` (0.1em) | `0.1em` raw at `Card.module.css:135` and `:274`; `0.08em` at `Card.module.css:457`; `0.06em` at `SectionLabel.module.css:22` |
| transform | 36 uppercase | 4 omit it (`StatCard.module.css:100`, `Tile.module.css:119`, `pages.module.css:151`, `SectionLabel.module.css:22`), some by design |
| colour | varies by surface | intentionally per site; not drift |

4 further rows (`Card.module.css:634-646`, `.compact` overrides) set only the size.

**Cost of a fix:** 44 sites in 23 files. 13 JSX files already render `<Label>` or `<SectionLabel>` (`grep -rln "<Label\b\|<SectionLabel\b" apps/web/src --include='*.jsx'`), so the component exists and most sites could adopt it or a shared class.

## Typography: raw values (Gap)

466 raw values in 61 files bypass the type scale entirely (Appendix A3). They are single-property escapes, not clusters, so a bundling layer does not fix them. They matter here because a bundle migration touches the same blocks: the heading and label sites above account for a share of them.

## Spacing (Match for clusters)

Only 9 multi-token spacing values repeat across files, at 2 to 4 sites each (Appendix B1). The two most-repeated are heading margins (`var(--st-spacing-stack-xl) 0 var(--st-spacing-stack-md)` for h2, `var(--st-spacing-stack-lg) 0 var(--st-spacing-stack-sm)` for h3), which belong to the heading bundle. The rest are chip and badge padding. Spacing does not form hand-copied clusters at any scale worth a bundling layer.

Two observations are outside the cluster question and are recorded for a follow-up:

- **Two spacing scales coexist:** `--st-space-N` (222 references) and `--st-spacing-stack-*`/`-inset-*` (122), plus 65 component-scoped references (Appendix B2). There is no rule saying which to use where.
- **332 raw spacing values with units, in 54 files**, use no token at all.

## Surfaces (Drift: components re-implemented)

162 blocks carry two or more surface properties, in 126 distinct combinations. 21 combinations repeat across files (Appendix C1). Read site by site, almost every repeat is one component's surface re-typed outside the component, not a missing surface bundle:

| Re-implemented | Canonical | Copies |
|---|---|---|
| Chip | DS `Chip` | `ContentsStrip.module.css:33` `.chip`, `pages.module.css:499` `.filterChip` (and their `.active` states at `ContentsStrip.module.css:61`, `pages.module.css:528`) |
| IndexCell | DS `IndexCell` (`IndexCell.module.css:40`) | `TaxonomyArchivePage.module.css:201`, `:207` |
| Avatar | DS `Avatar` (`Avatar.module.css:1`) | `TaxonomyArchivePage.module.css:111` `.itemAvatarFallback` |
| Form control | DS `Input`, `Textarea` | web `Select.module.css:12`; `Checkbox.module.css:13` and `Switch.module.css:44` share their own signature |
| Hairline grid | DS `Grid spacing="0"` (`Grid.module.css:21`) | `CwvSnapshot.module.css:44` `.cwvGrid`, `TrustReportSection.module.css:27` `.tileGrid`; `PageSections.module.css:306` `.heroStatRail` uses the same pattern on white-20 (Appendix C2) |
| Version badges | none shared | `TrustReportSection.module.css:115-127` and `PlatformHubPage.module.css:259-271`, three badges each, identical |
| Tile | `Tile` (`web/design-system/components/tile/`) | `StatCard.module.css` shares the `.linked:hover` and `.skeleton` surfaces (`:17`, `:110`); the two files are separate components that overlap |
| Form error | none shared | `ContactForm.module.css:14`, `Form.module.css:14` |

**Card already shows the working pattern.** `Card.module.css:16` reads its whole surface from a component-scoped family: `--st-card-bg`, `--st-card-border`, `--st-card-radius`, `--st-card-shadow`. MetadataCard reuses `--st-card-border` (`MetadataCard.module.css:18`). The named surfaces in the epic (Card, MetadataCard, Callout, FilterBar) do not copy each other's surface. Callout is the exception: there are two, the DS `Callout` (`ds/components/Callout/Callout.module.css:10`, border-top accent) and a web `Callout` (`web/components/Callout.module.css:1`, `--st-radius-lg`, pink fill variants), with different surfaces.

**Cost of a fix:** about 23 sites in 13 files, each replaced by the existing component. It is component reuse, governed by `.claude/rules/react.md` §Component choice gate, not a token change.

## Motion (Drift)

86 `transition` declarations in 49 files use 55 distinct values (Appendix D1). One motion token exists, `--st-transition-fast: 150ms ease` (`tokens.css:204`). It is used 14 times. The same 150ms duration is typed raw 51 times (`150ms` ×31, `0.15s` ×20), and 10 other raw durations appear, from `80ms` to `0.6s` (Appendix D1, duration table). Easing is almost always `ease` (75 uses); two `cubic-bezier` curves appear 5 and 1 times.

Hover transforms are few (Appendix D2): the image zoom `scale(1.05)` is typed 4 times (`PageSections.module.css:38`, `Card.module.css:87`, `Media.module.css:132`, `utilities.css:27`), always with the same `0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)` transition. Hover lift is tokenised once (`Card.module.css:36`, `--st-card-hover-translate-y`) and raw twice, at different distances (`Chip.module.css:58` `-1px`, `SocialLink.module.css:17` `-2px`).

**Cost of a fix:** 51 raw-duration swaps are mechanical; the image-zoom cluster is 4 sites. Neither needs a bundle layer. A validator rule catches the durations.

## Focus rings (Drift, found in the sweep)

41 focus blocks in 30 files use 10 distinct rings (Appendix E1). 22 blocks in 17 files type the same ring: `outline: 2px solid var(--st-color-brand-primary); outline-offset: 2px`. `--st-color-focus` exists (`tokens.css:574`); only 3 blocks use it in the same ring shape (`Chip.module.css:71`, `Citation.module.css:34`, `:91`). Both resolve to pink today, so nothing renders wrong. If the focus colour is ever re-pointed for contrast, 22 sites keep the old colour. Other rings use `3px` pink with a `3px` offset (`ImageLightbox.module.css:96`, `:127`, `PageSections.module.css:618`), a 30% `color-mix` of the focus token (Checkbox, Radio, Switch), and box-shadow rings on Input and Textarea.

**Cost of a fix:** 22 sites to one shared ring (a token pair or a utility class), plus a decision on whether the variant rings are intentional.

## Where prose stands in for compiled infrastructure

Rules that a session has to remember, because the CSS cannot carry the decision:

| Rule | Where | What it substitutes for |
|---|---|---|
| bg-through-gap annotation: every child must carry `background` with a `/* covers parent … */` comment | `.claude/rules/css-layout.md` §bg-through-gap | the hairline-grid surface as one unit; 6 annotations exist (`grep -rn "covers parent" apps/web/src packages/design-system/src --include='*.css'`), and 2 grids copy `Grid spacing="0"` instead of using it |
| Never put `<Card>` inside `<Grid spacing="0">` | `.claude/rules/css-layout.md` | a surface contract between two components |
| Trace the theme cascade before using a token for `background`; a list of tokens already overridden to `rgba()` in dark | `.claude/rules/tokens.md` §Trace the theme cascade | a surface token tier that is solid by definition |
| Token value cross-check against the typography Storybook story before using a heading token on a DS component | `docs/epic-template.md` Pre-Execution checklist; `.claude/rules/tokens.md` | a heading bundle with a name that says its tier |

## Could tooling catch property-cluster drift?

**What `validate:tokens` checks today**, read from its header (`apps/web/scripts/validate-tokens.js:1-40`) and confirmed by a run on 2026-11-15 (both checks pass):

- every `var(--st-*)` reference resolves to a defined token;
- no `var(--st-*, <raw value>)` fallback of any type (added by #74, 2026-10-11);
- with `--strict-colors`, no raw colour values outside token files.

It parses CSS one declaration at a time and has no notion of a block. It cannot see a cluster.

**What a cluster check would need,** sized against this sweep:

| Check | Catches | Mechanism | Noise risk |
|---|---|---|---|
| Heading size token without its companions | the A1 drift: `font-size: var(--st-font-heading-N)` in a block with no line-height token, or a raw weight | per-block rule: if property X has token T, properties Y, Z must be tokens from set S | low; the 8 `@media` overrides need an exemption |
| Label size token with a raw weight or tracking | the 4 Card and SectionLabel escapes | same rule, label family | low |
| Raw duration equal to a token value | 51 `150ms`/`0.15s` sites | single-declaration regex, like the fallback check | none |
| Focus ring not using `--st-color-focus` | the 22 brand-primary copies | selector contains `focus` and outline colour is not the focus token | low |
| Surface signature duplicated from a DS component | the C1 re-implementations | compare block signatures against DS component roots | high; needs an allowlist, and a reviewer reads these better than a script |

The first four extend `validate:tokens` with a block-aware pass; the parser in `property-cluster-drift-audit.sweep.py` shows a block parser is about 40 lines. None should land before the bundle exists: a rule that requires "a line-height token" has nothing to point at until the heading bundle names one. Building a validator ahead of the bundle breaks `CLAUDE.md` §Building a mechanism, rule 1 (no reader yet).

## Recommendations

| Domain | Call | Scope for the follow-on epic | Size |
|---|---|---|---|
| Typography: headings and labels | **Build a fix epic** | one heading bundle per level (size, line-height, weight, family as one unit: composite tokens or a utility class per level, decided in that epic under Opus plan mode); merge the four `.h2/.h3/.h4` copies; move label sites to `<Label>`/`<SectionLabel>` or one shared class; reconcile Card's `700`/`0.1em` | 76 sites in 31 files |
| Focus rings | **Build a fix epic** (or a phase of the typography one) | one ring definition using `--st-color-focus`; decide the variants | 22 sites in 17 files |
| Surfaces | **Build a fix epic**, as component reuse | replace the C1 re-implementations with Chip, IndexCell, Avatar, Input, Grid; extract the version badge and form error | about 23 sites in 13 files |
| Motion | **Monitor** | swap raw `150ms`/`0.15s` for `--st-transition-fast` when a file is next edited; add the raw-duration validator check | 51 sites; no layer needed |
| Spacing | **Not worth it** as a bundle | the heading margins move with the heading bundle. The two-scale question (`space-N` vs `spacing-stack/inset`) and 332 raw values are a separate single-value cleanup | n/a |
| Tooling | **Monitor**, build after the bundle | add the four low-noise checks to `validate:tokens` in the same epic that creates the bundle they check | 4 rules |

## Appendix: generated evidence

The tables below are the verbatim output of `python3 -I docs/reports/property-cluster-drift-audit.sweep.py` on 2026-11-15. `web/` is `apps/web/src/`; `ds/` is `packages/design-system/src/`.

Scanned 106 files, 1739 rule blocks, 5958 declarations.

### A1. Heading bundles: every block that sets a heading font-size token

`@media` rows are responsive size-only overrides of a bundle above them, listed so the count is complete.

**`--st-font-page-h1`: 1 blocks in 1 files**

| Site | Selector | family | weight | line-height | color |
|---|---|---|---|---|---|
| `ds/components/PageHeader/PageHeader.module.css:91` | `.title` | font-family-narrative | font-weight-normal | line-height-tight | color-text-default |

**`--st-font-heading-1`: 3 blocks in 3 files**

| Site | Selector | family | weight | line-height | color |
|---|---|---|---|---|---|
| `web/components/Hero.module.css:49` | `.heading` | – | font-weight-bold | line-height-tight | – |
| `web/components/PageSections.module.css:288` | `.heroHeading` | – | font-weight-bold | line-height-tight | – |
| `web/components/PlatformLayout/PlatformHero.module.css:37` | `.heading` | font-family-narrative | 400 | 1.1 | color-text-default |

**`--st-font-heading-2`: 10 blocks in 7 files**

| Site | Selector | family | weight | line-height | color |
|---|---|---|---|---|---|
| `web/components/ContentBlock.module.css:15` | `.h2` | – | font-weight-bold | line-height-tight | color-brand-primary |
| `web/components/Hero.module.css:81` | `.heading` (@media) | – | – | – | – |
| `web/components/PageSections.module.css:362` | `.sectionHeading` | – | font-weight-bold | line-height-tight | color-brand-primary |
| `web/components/PageSections.module.css:388` | `.h2` | – | font-weight-bold | line-height-tight | color-brand-primary |
| `web/components/PageSections.module.css:919` | `.ctaHeading` | – | font-weight-bold | – | color-text-default |
| `web/components/PageSections.module.css:1178` | `.heroHeading` (@media) | – | – | – | – |
| `web/components/RichText.module.css:23` | `.h2` | font-family-narrative | font-weight-bold | line-height-tight | color-brand-primary |
| `web/components/TrustReportSection.module.css:14` | `.sectionHeading` | font-family-narrative | font-weight-bold | line-height-tight | color-brand-primary |
| `web/pages/pages.module.css:221` | `.detailContent h2` | – | font-weight-bold | line-height-tight | color-brand-primary |
| `web/pages/platform/PlatformHubPage.module.css:45` | `.heading` | font-family-narrative | – | 1.1 | color-text-default |

**`--st-font-heading-3`: 12 blocks in 7 files**

| Site | Selector | family | weight | line-height | color |
|---|---|---|---|---|---|
| `web/components/ContactForm.module.css:32` | `.successHeading` | – | font-weight-bold | – | color-brand-primary |
| `web/components/ContentBlock.module.css:23` | `.h3` | – | font-weight-semibold | 1.3 | color-text-default |
| `web/components/ContentBlock.module.css:78` | `.h2` (@media) | – | – | – | – |
| `web/components/Form.module.css:32` | `.successHeading` | – | font-weight-bold | – | color-brand-primary |
| `web/components/Hero.module.css:56` | `.subheading` | – | – | line-height-relaxed | – |
| `web/components/PageSections.module.css:295` | `.heroSubheading` | – | – | line-height-relaxed | – |
| `web/components/PageSections.module.css:332` | `.heroStatValue` | font-family-narrative | 600 | 1 | inherit |
| `web/components/PageSections.module.css:396` | `.h3` | – | font-weight-semibold | 1.3 | color-text-default |
| `web/components/PageSections.module.css:840` | `.citedBlockHeading` | font-family-narrative | font-weight-semibold | 1.3 | color-text-default |
| `web/components/PageSections.module.css:1198` | `.h2` (@media) | – | – | – | – |
| `web/components/RichText.module.css:32` | `.h3` | font-family-narrative | font-weight-semibold | 1.3 | color-text-default |
| `web/pages/pages.module.css:229` | `.detailContent h3` | – | font-weight-semibold | 1.3 | color-text-default |

**`--st-font-heading-4`: 14 blocks in 7 files**

| Site | Selector | family | weight | line-height | color |
|---|---|---|---|---|---|
| `web/components/ContentBlock.module.css:5` | `.contentBlock` | – | – | line-height-relaxed | color-text-default |
| `web/components/ContentBlock.module.css:82` | `.h3` (@media) | – | – | – | – |
| `web/components/Drawer.module.css:102` | `.navItem` | – | 600 | – | color-text-primary |
| `web/components/Hero.module.css:85` | `.subheading` (@media) | – | – | – | – |
| `web/components/PageSections.module.css:370` | `.textContent` | – | – | line-height-relaxed | color-text-default |
| `web/components/PageSections.module.css:404` | `.h4` | – | font-weight-semibold | 1.4 | color-text-default |
| `web/components/PageSections.module.css:848` | `.citedBlockBody` | – | – | 1.7 | color-text-default |
| `web/components/PageSections.module.css:926` | `.ctaDescription` | – | – | – | color-text-secondary |
| `web/components/PageSections.module.css:1182` | `.heroSubheading` (@media) | – | – | – | – |
| `web/components/PageSections.module.css:1202` | `.h3` (@media) | – | – | – | – |
| `web/components/RichText.module.css:6` | `.richText` | – | – | line-height-relaxed | color-text-default |
| `web/components/RichText.module.css:41` | `.h4` | font-family-narrative | font-weight-semibold | 1.4 | color-text-default |
| `web/pages/SiteGraphPage.module.css:198` | `.railHubLabel` | font-narrative | – | 1.2 | color-text-primary |
| `web/pages/pages.module.css:214` | `.detailContent` | – | – | line-height-relaxed | color-text-default |

### A2. Label bundle: every block that sets `font-size: var(--st-label-size)`

**44 blocks in 23 files**

| Site | Selector | family | weight | letter-spacing | transform | color |
|---|---|---|---|---|---|---|
| `web/components/ContentsStrip.module.css:38` | `.chip` | label-font | label-weight | label-tracking | uppercase | color-text-default |
| `web/components/Drawer.module.css:50` | `.drawerLabel` | label-font | label-weight | label-tracking | uppercase | color-text-muted |
| `web/components/Footer.module.css:71` | `.columnHeading` | label-font | label-weight | label-tracking | uppercase | label-color |
| `web/components/Footer.module.css:157` | `.colophonLabel` | label-font | label-weight | label-tracking | uppercase | label-color |
| `web/components/KnowledgeGraph/KnowledgeGraph.module.css:33` | `.loading` | label-font | label-weight | label-tracking | uppercase | label-color |
| `web/components/KnowledgeGraph/KnowledgeGraph.module.css:62` | `.legendItem` | label-font | label-weight | label-tracking | uppercase | kg-legend-color |
| `web/components/PageSections.module.css:340` | `.heroStatLabel` | label-font | label-weight | label-tracking | uppercase | inherit |
| `web/components/PageSidebar.module.css:20` | `.label` | label-font | label-weight | label-tracking | uppercase | label-color |
| `web/components/PageSidebar.module.css:104` | `.ethicsLink` | label-font | label-weight | label-tracking | uppercase | label-color |
| `web/components/PlatformLayout/PlatformHero.module.css:19` | `.eyebrow` | label-font | label-weight | label-tracking | uppercase | – |
| `web/components/PlatformLayout/PlatformSidebar.module.css:15` | `.sectionLabel` | label-font | label-weight | label-tracking | uppercase | color-text-muted |
| `web/components/SchemaERD/SchemaERD.module.css:223` | `.sidebarSectionLabel` | label-font | label-weight | label-tracking | uppercase | label-color |
| `web/components/StatCard.module.css:100` | `.foot` | font-family-mono | – | label-tracking | – | color-text-muted |
| `web/design-system/components/sidebar-nav/SidebarNav.module.css:13` | `.label` | label-font | label-weight | label-tracking | uppercase | label-color |
| `web/design-system/components/sidebar-nav/SidebarNav.module.css:71` | `.summary` | label-font | label-weight | label-tracking | uppercase | label-color |
| `web/design-system/components/tile/Tile.module.css:33` | `.label` | font-family-mono | label-weight | label-tracking | uppercase | – |
| `web/design-system/components/tile/Tile.module.css:119` | `.meta` | font-family-mono | – | label-tracking | – | color-text-muted |
| `web/pages/pages.module.css:151` | `.pageEyebrowText` | label-font | label-weight | label-tracking | – | label-color |
| `web/pages/pages.module.css:418` | `.seriesPartNumber` | label-font | label-weight | label-tracking | uppercase | color-brand-primary |
| `web/pages/pages.module.css:504` | `.filterChip` | label-font | label-weight | label-tracking | uppercase | color-text-default |
| `web/pages/pages.module.css:646` | `.graphCardRailHint` | label-font | label-weight | label-tracking | uppercase | label-color |
| `web/pages/pages.module.css:666` | `.graphHubCardType` | label-font | label-weight | label-tracking | uppercase | label-color |
| `web/pages/pages.module.css:683` | `.graphHubCardCta` | label-font | label-weight | label-tracking | uppercase | color-brand-primary |
| `web/pages/platform/PlatformHubPage.module.css:26` | `.eyebrow` | label-font | label-weight | label-tracking | uppercase | color-brand-primary |
| `web/pages/platform/PlatformHubPage.module.css:100` | `.trustLink` | label-font | label-weight | label-tracking | uppercase | color-text-muted |
| `web/pages/platform/PlatformHubPage.module.css:153` | `.priorityBadge` | label-font | – | label-tracking | uppercase | color-text-muted |
| `ds/components/Callout/Callout.module.css:49` | `.label` | font-family-mono | label-weight | label-tracking | uppercase | color-text-default |
| `ds/components/Callout/Callout.module.css:110` | `.bannerLabel` | font-family-mono | label-weight | label-tracking | uppercase | var(--_callout-accent |
| `ds/components/Card/Card.module.css:135` | `.folioStatus` | font-family-mono | 700 | 0.1em | uppercase | – |
| `ds/components/Card/Card.module.css:274` | `.statusBadge` | font-family-mono | 700 | 0.1em | uppercase | – |
| `ds/components/Card/Card.module.css:457` | `.chipGroupLabel` | font-family-mono | 700 | 0.08em | uppercase | color-text-muted |
| `ds/components/Card/Card.module.css:634` | `.compact .eyebrow` | – | – | – | – | – |
| `ds/components/Card/Card.module.css:638` | `.compact .folioLabel` | – | – | – | – | – |
| `ds/components/Card/Card.module.css:642` | `.compact .footerCategoryLink` | – | – | – | – | – |
| `ds/components/Card/Card.module.css:646` | `.compact .date` | – | – | – | – | – |
| `ds/components/DescriptionList/DescriptionList.module.css:121` | `.term` | font-family-mono | label-weight | label-tracking | uppercase | color-text-muted |
| `ds/components/Field/Field.module.css:10` | `.label` | font-family-mono | label-weight | label-tracking | uppercase | color-text-default |
| `ds/components/FilterBar/FilterBar.module.css:30` | `.filterTitle` | label-font | label-weight | label-tracking | uppercase | label-color |
| `ds/components/FilterBar/FilterBar.module.css:81` | `.facetLabel` | label-font | label-weight | label-tracking | uppercase | color-text-primary |
| `ds/components/Label/Label.module.css:4` | `.label` | font-family-mono | label-weight | label-tracking | uppercase | color-text-default |
| `ds/components/Meter/Meter.module.css:9` | `.label` | font-family-mono | label-weight | label-tracking | uppercase | color-text-muted |
| `ds/components/Metric/Metric.module.css:35` | `.label` | font-family-mono | label-weight | label-tracking | uppercase | color-text-muted |
| `ds/components/SectionLabel/SectionLabel.module.css:22` | `.number` | font-family-mono | label-weight | 0.06em | – | color-pink |
| `ds/components/SectionLabel/SectionLabel.module.css:31` | `.name` | font-family-mono | label-weight | label-tracking | uppercase | color-text-default |

### A3. Raw typography values per file (not cluster instances; counted, not listed)

**466 raw values in 61 files:** font-size 159, font-weight 113, line-height 120, letter-spacing 74

| File | font-size | font-weight | line-height | letter-spacing | total |
|---|---|---|---|---|---|
| `web/components/PageSections.module.css` | 18 | 4 | 12 | 6 | 40 |
| `web/pages/pages.module.css` | 18 | 9 | 9 | 4 | 40 |
| `ds/components/Card/Card.module.css` | 0 | 11 | 10 | 11 | 32 |
| `web/pages/TaxonomyArchivePage.module.css` | 11 | 9 | 4 | 0 | 24 |
| `web/pages/GlossaryPage.module.css` | 11 | 5 | 2 | 4 | 22 |
| `web/pages/SiteGraphPage.module.css` | 9 | 5 | 1 | 4 | 19 |
| `ds/components/List/List.module.css` | 6 | 5 | 2 | 4 | 17 |
| `ds/components/Table/Table.module.css` | 6 | 4 | 3 | 4 | 17 |
| `web/components/SchemaERD/SchemaERD.module.css` | 10 | 4 | 2 | 0 | 16 |
| `web/pages/dev/TablesDevPage.module.css` | 8 | 4 | 0 | 4 | 16 |
| `web/pages/SitemapPage.module.css` | 7 | 4 | 2 | 1 | 14 |
| `web/pages/platform/PlatformHubPage.module.css` | 6 | 1 | 3 | 4 | 14 |
| `web/pages/PersonProfilePage.module.css` | 5 | 3 | 1 | 2 | 11 |
| `web/components/PageSidebar.module.css` | 5 | 1 | 2 | 2 | 10 |
| `web/design-system/components/tile/Tile.module.css` | 0 | 1 | 9 | 0 | 10 |
| `ds/components/Callout/Callout.module.css` | 3 | 2 | 4 | 1 | 10 |
| `ds/components/Chip/Chip.module.css` | 3 | 4 | 1 | 2 | 10 |
| `ds/components/SectionLabel/SectionLabel.module.css` | 2 | 2 | 4 | 2 | 10 |
| `web/components/CwvSnapshot.module.css` | 0 | 4 | 3 | 2 | 9 |
| `web/components/StatCard.module.css` | 0 | 1 | 7 | 1 | 9 |
| `ds/components/CodeBlock/CodeBlock.module.css` | 3 | 3 | 1 | 2 | 9 |
| `web/components/FilterStrip.module.css` | 3 | 2 | 0 | 2 | 7 |
| `ds/components/Accordion/Accordion.module.css` | 2 | 2 | 1 | 1 | 6 |
| `ds/components/Button/Button.module.css` | 3 | 1 | 1 | 1 | 6 |
| `web/components/ContentNav.module.css` | 1 | 2 | 1 | 1 | 5 |
| `web/pages/ProjectDetailPage.module.css` | 2 | 1 | 2 | 0 | 5 |
| `web/components/CardBuilderSection.module.css` | 1 | 1 | 1 | 1 | 4 |
| `web/components/Drawer.module.css` | 0 | 4 | 0 | 0 | 4 |
| `web/components/HomepageHero.module.css` | 2 | 0 | 2 | 0 | 4 |
| `web/components/ImageLightbox.module.css` | 3 | 0 | 1 | 0 | 4 |
| `web/design-system/components/sidebar-nav/SidebarNav.module.css` | 2 | 1 | 1 | 0 | 4 |
| `web/pages/platform/ContentModelsPage.module.css` | 0 | 2 | 0 | 2 | 4 |
| `ds/components/ScoreRing/ScoreRing.module.css` | 0 | 2 | 1 | 1 | 4 |
| `web/components/LetterSectionHeader.module.css` | 1 | 1 | 1 | 0 | 3 |
| `web/components/PlatformLayout/PlatformHero.module.css` | 0 | 1 | 2 | 0 | 3 |
| `web/components/PreviewBanner.module.css` | 0 | 1 | 1 | 1 | 3 |
| `ds/components/PageHeader/PageHeader.module.css` | 0 | 0 | 2 | 1 | 3 |
| `ds/components/Sidebar/Sidebar.module.css` | 2 | 0 | 1 | 0 | 3 |
| `ds/components/Swatch/Swatch.module.css` | 1 | 1 | 0 | 1 | 3 |
| `web/components/ContentBlock.module.css` | 1 | 0 | 1 | 0 | 2 |
| `web/components/Pagination.module.css` | 2 | 0 | 0 | 0 | 2 |
| `web/components/PlatformLayout/PlatformSidebar.module.css` | 0 | 1 | 1 | 0 | 2 |
| `web/components/RichText.module.css` | 0 | 0 | 2 | 0 | 2 |
| `web/components/TrustReportSection.module.css` | 0 | 0 | 0 | 2 | 2 |
| `web/components/atoms/NavigationItem.module.css` | 0 | 2 | 0 | 0 | 2 |
| `ds/components/Citation/Citation.module.css` | 0 | 0 | 2 | 0 | 2 |
| `ds/components/Field/Field.module.css` | 0 | 0 | 2 | 0 | 2 |
| `ds/components/FilterBar/FilterBar.module.css` | 0 | 0 | 2 | 0 | 2 |
| `ds/components/SegmentedControl/SegmentedControl.module.css` | 0 | 1 | 1 | 0 | 2 |
| `web/components/Callout.module.css` | 0 | 0 | 1 | 0 | 1 |
| `web/components/ContactForm.module.css` | 0 | 0 | 1 | 0 | 1 |
| `web/components/Form.module.css` | 0 | 0 | 1 | 0 | 1 |
| `web/components/Select/Select.module.css` | 0 | 0 | 1 | 0 | 1 |
| `web/components/Switch/Switch.module.css` | 1 | 0 | 0 | 0 | 1 |
| `ds/components/Avatar/Avatar.module.css` | 0 | 0 | 1 | 0 | 1 |
| `ds/components/Blockquote/Blockquote.module.css` | 1 | 0 | 0 | 0 | 1 |
| `ds/components/ErrorMessage/ErrorMessage.module.css` | 0 | 0 | 1 | 0 | 1 |
| `ds/components/HelperText/HelperText.module.css` | 0 | 0 | 1 | 0 | 1 |
| `ds/components/IndexCell/IndexCell.module.css` | 0 | 0 | 1 | 0 | 1 |
| `ds/components/Metric/Metric.module.css` | 0 | 0 | 1 | 0 | 1 |
| `ds/styles/globals.css` | 0 | 1 | 0 | 0 | 1 |

### B1. Multi-token spacing values repeated in 2 or more files

| Value | Sites | Where |
|---|---|---|
| `margin: var(--st-spacing-stack-xl) 0 var(--st-spacing-stack-md)` | 4 | `web/components/ContentBlock.module.css:17` `.h2`<br>`web/components/PageSections.module.css:390` `.h2`<br>`web/components/RichText.module.css:25` `.h2`<br>`web/pages/pages.module.css:223` `.detailContent h2` |
| `margin: var(--st-spacing-stack-lg) 0 var(--st-spacing-stack-sm)` | 4 | `web/components/ContentBlock.module.css:25` `.h3`<br>`web/components/PageSections.module.css:398` `.h3`<br>`web/components/RichText.module.css:34` `.h3`<br>`web/pages/pages.module.css:231` `.detailContent h3` |
| `padding: var(--st-space-3) var(--st-space-4)` | 3 | `web/components/ContactForm.module.css:19` `.formError`<br>`web/components/Form.module.css:19` `.formError`<br>`web/components/KnowledgeGraph/KnowledgeGraph.module.css:53` `.legend` |
| `padding: var(--st-spacing-inset-xs) var(--st-spacing-inset-md)` | 3 | `web/components/Header.module.css:43` `.headerCtaButton`<br>`web/components/PreviewBanner.module.css:8` `.banner`<br>`web/components/atoms/NavigationItem.module.css:106` `.childItem` |
| `padding: var(--st-space-1) var(--st-space-3)` | 3 | `ds/components/Card/Card.module.css:106` `.cardFolio`<br>`ds/components/Card/Card.module.css:174` `.card:has(.cardFolio) .footer`<br>`ds/components/SegmentedControl/SegmentedControl.module.css:28` `.pillSegment` |
| `padding: var(--st-spacing-stack-lg) var(--st-page-gutter)` | 2 | `web/components/ContactForm.module.css:6` `.contactForm`<br>`web/components/Form.module.css:6` `.form` |
| `padding: var(--st-spacing-stack-xl) var(--st-page-gutter)` | 2 | `web/components/ContentBlock.module.css:4` `.contentBlock`<br>`web/components/Hero.module.css:3` `.hero` |
| `margin: var(--st-spacing-stack-md) 0 var(--st-spacing-stack-xs)` | 2 | `web/components/PageSections.module.css:406` `.h4`<br>`web/components/RichText.module.css:43` `.h4` |
| `gap: var(--st-space-2) var(--st-space-4)` | 2 | `ds/components/Card/Card.module.css:418` `.metadataGrid`<br>`ds/components/DescriptionList/DescriptionList.module.css:26` `.twoCol` |

### B2. Spacing token scales in use

| Token family | References |
|---|---|
| space-N | 222 |
| spacing-stack/inset | 122 |
| component-scoped | 65 |

Raw spacing values with units (no token at all): 332 in 54 files.

### C1. Surface signatures (2+ of background, border, radius, shadow) repeated in 2 or more files

162 blocks carry 2+ surface properties, in 126 distinct combinations; 21 combinations repeat across files.

| Signature | Sites | Where |
|---|---|---|
| bg `var(--st-color-brand-primary)`; border `var(--st-color-brand-primary)` | 4 | `web/components/Checkbox/Checkbox.module.css:27` `.checkbox:checked`<br>`web/components/ContentsStrip.module.css:61` `.chip.active`<br>`web/pages/pages.module.css:528` `.filterChipActive`<br>`ds/components/FilterBar/FilterBar.module.css:138` `.optionCheckbox:checked` |
| bg `none`; border `none` | 4 | `web/components/Drawer.module.css:127` `.accordionToggle`<br>`web/components/PageSections.module.css:472` `.codeBlock code`<br>`web/components/SchemaERD/SchemaERD.module.css:265` `.sidebarRelLink`<br>`ds/components/Accordion/Accordion.module.css:21` `.trigger` |
| bg `var(--st-color-border-wrap)`; border `1px solid var(--st-color-border-wrap)` | 3 | `web/components/CwvSnapshot.module.css:44` `.cwvGrid`<br>`web/components/TrustReportSection.module.css:27` `.tileGrid`<br>`ds/components/Grid/Grid.module.css:21` `.spacing0` |
| bg `var(--st-color-bg-surface)`; border `1px solid var(--st-color-border-default)`; radius `0` | 3 | `web/components/Select/Select.module.css:12` `.select`<br>`ds/components/Input/Input.module.css:1` `.input`<br>`ds/components/Textarea/Textarea.module.css:1` `.textarea` |
| bg `var(--st-color-bg-subtle)`; radius `2px` | 3 | `web/components/StatCard.module.css:110` `.skeleton`<br>`web/design-system/components/tile/Tile.module.css:129` `.skeleton`<br>`web/pages/platform/PlatformHubPage.module.css:150` `.priorityBadge` |
| bg `transparent`; border `none` | 3 | `web/pages/SiteGraphPage.module.css:60` `.filterStripInline`<br>`web/pages/SiteGraphPage.module.css:244` `.fsFilterStrip`<br>`web/pages/pages.module.css:583` `.clearFiltersLink` |
| bg `var(--st-color-bg-surface)`; border `1px solid var(--st-color-border-medium)`; radius `0` | 2 | `web/components/Checkbox/Checkbox.module.css:13` `.checkbox`<br>`web/components/Switch/Switch.module.css:44` `.track` |
| bg `var(--st-color-brand-primary-tint-10)`; border `1px solid var(--st-color-border-default)` | 2 | `web/components/ContactForm.module.css:14` `.formError`<br>`web/components/Form.module.css:14` `.formError` |
| bg `var(--st-color-bg-surface)`; border `1px solid var(--st-color-border-medium)`; radius `2px` | 2 | `web/components/ContentsStrip.module.css:33` `.chip`<br>`web/pages/pages.module.css:499` `.filterChip` |
| bg `none`; border `none`; radius `var(--st-radius-sm)` | 2 | `web/components/Drawer.module.css:58` `.closeButton`<br>`web/components/Header.module.css:47` `.hamburger` |
| bg `var(--st-color-pink)`; border `var(--st-color-pink)` | 2 | `web/components/PageSections.module.css:660` `.carouselDotActive`<br>`web/pages/TaxonomyArchivePage.module.css:201` `.indexCellSelected` |
| bg `var(--st-tile-bg-hover, var(--st-color-bg-subtle))`; shadow `inset 0 2px 0 var(--st-color-brand-primary)` | 2 | `web/components/StatCard.module.css:17` `.linked:hover`<br>`web/design-system/components/tile/Tile.module.css:24` `.linked:hover` |
| bg `var(--st-status-validated-bg)`; border `1px solid var(--st-status-validated-border)` | 2 | `web/components/TrustReportSection.module.css:115` `.badgeMinor`<br>`web/pages/platform/PlatformHubPage.module.css:259` `.badgeMinor` |
| bg `var(--st-status-archived-bg)`; border `1px solid var(--st-status-archived-border)` | 2 | `web/components/TrustReportSection.module.css:121` `.badgePatch`<br>`web/pages/platform/PlatformHubPage.module.css:265` `.badgePatch` |
| bg `var(--st-status-evergreen-bg)`; border `1px solid var(--st-status-evergreen-border)` | 2 | `web/components/TrustReportSection.module.css:127` `.badgeMajor`<br>`web/pages/platform/PlatformHubPage.module.css:271` `.badgeMajor` |
| bg `var(--st-color-bg-subtle)`; border `1px solid var(--st-color-border-default)`; radius `var(--st-radius-full)` | 2 | `web/pages/TaxonomyArchivePage.module.css:111` `.itemAvatarFallback`<br>`ds/components/Avatar/Avatar.module.css:1` `.avatar` |
| bg `var(--st-color-maroon)`; border `var(--st-color-maroon)` | 2 | `web/pages/TaxonomyArchivePage.module.css:207` `.indexCellSelected:hover`<br>`ds/components/IndexCell/IndexCell.module.css:40` `.selected:hover` |
| bg `transparent`; border `1.5px solid var(--st-chip-dot-draft)` | 2 | `ds/components/Card/Card.module.css:325` `.statusDraft::before`<br>`ds/components/Chip/Chip.module.css:261` `.dot-draft` |
| bg `var(--st-code-inline-bg)`; border `var(--st-code-inline-border)`; radius `var(--st-radius-code)` | 2 | `ds/components/CodeBlock/CodeBlock.module.css:155` `.inline`<br>`ds/styles/globals.css:63` `:not(pre) > code` |
| border `var(--st-color-focus)`; shadow `0 0 0 2px var(--st-color-bg-elevated)` | 2 | `ds/components/Input/Input.module.css:21` `.input:focus`<br>`ds/components/Textarea/Textarea.module.css:22` `.textarea:focus` |
| border `var(--st-color-brand-primary)`; shadow `0 0 0 2px var(--st-color-brand-primary-tint-10)` | 2 | `ds/components/Input/Input.module.css:30` `.error:focus`<br>`ds/components/Textarea/Textarea.module.css:31` `.error:focus` |

### C2. bg-through-gap hairline containers (1px gap plus a background on the same block)

| Site | Selector | gap | background |
|---|---|---|---|
| `web/components/CwvSnapshot.module.css:44` | `.cwvGrid` | `var(--st-space-0)` | `var(--st-color-border-wrap)` |
| `web/components/PageSections.module.css:306` | `.heroStatRail` | `var(--st-space-0)` | `var(--st-color-white-20)` |
| `web/components/TrustReportSection.module.css:27` | `.tileGrid` | `var(--st-space-0)` | `var(--st-color-border-wrap)` |
| `ds/components/Grid/Grid.module.css:21` | `.spacing0` | `var(--st-space-0)` | `var(--st-color-border-wrap)` |

### D1. Transition values repeated in 2 or more files

86 `transition` declarations in 49 files, 55 distinct values.

| Value | Sites | Where |
|---|---|---|
| `color 150ms ease` | 6 | `web/components/Drawer.module.css:68`<br>`web/components/Drawer.module.css:104`<br>`web/components/Drawer.module.css:176`<br>`web/components/Drawer.module.css:220`<br>`web/components/Header.module.css:57`<br>`web/components/atoms/NavigationItem.module.css:5` |
| `color var(--st-transition-fast)` | 6 | `web/components/PageSidebar.module.css:58`<br>`web/components/PageSidebar.module.css:75`<br>`web/components/PageSidebar.module.css:110`<br>`web/components/PlatformLayout/PlatformSidebar.module.css:23`<br>`web/pages/pages.module.css:442`<br>`web/pages/platform/PlatformHubPage.module.css:106` |
| `transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)` | 5 | `web/components/PageSections.module.css:34`<br>`ds/components/Card/Card.module.css:83`<br>`ds/components/Media/Media.module.css:51`<br>`ds/components/Media/Media.module.css:128`<br>`ds/styles/utilities.css:23` |
| `opacity 0.2s ease` | 4 | `web/components/ContentBlock.module.css:44`<br>`web/components/PageSections.module.css:426`<br>`web/components/PageSections.module.css:1162`<br>`web/components/portableTextComponents.module.css:9` |
| `background 0.2s` | 3 | `web/components/ImageLightbox.module.css:88`<br>`web/components/ImageLightbox.module.css:119`<br>`web/components/PageSections.module.css:610` |
| `color 0.2s ease` | 2 | `web/components/Callout.module.css:70`<br>`ds/components/Accordion/Accordion.module.css:37` |
| `color 0.15s ease` | 2 | `web/components/ContentNav.module.css:58`<br>`ds/components/FilterBar/FilterBar.module.css:199` |
| `border-color 150ms ease, color 150ms ease, background 150ms ease` | 2 | `web/components/ContentsStrip.module.css:48`<br>`web/pages/pages.module.css:514` |
| `grid-template-rows 200ms ease` | 2 | `web/components/Drawer.module.css:158`<br>`ds/components/Accordion/Accordion.module.css:74` |
| `background 120ms ease` | 2 | `web/components/PageSections.module.css:323`<br>`ds/components/List/List.module.css:69` |
| `color var(--st-transition-fast), border-color var(--st-transition-fast)` | 2 | `web/components/PlatformLayout/PlatformSidebar.module.css:41`<br>`web/design-system/components/sidebar-nav/SidebarNav.module.css:37` |
| `opacity 0.15s ease` | 2 | `web/components/PreviewBanner.module.css:32`<br>`ds/components/Citation/Citation.module.css:27` |
| `background 120ms` | 2 | `web/components/StatCard.module.css:15`<br>`web/design-system/components/tile/Tile.module.css:22` |
| `opacity var(--st-transition-fast)` | 2 | `web/components/atoms/Link.module.css:4`<br>`web/components/atoms/Logo.module.css:3` |
| `transform 0.15s ease` | 2 | `web/design-system/components/sidebar-nav/SidebarNav.module.css:80`<br>`ds/components/Sidebar/Sidebar.module.css:31` |
| `border-color 0.15s ease, box-shadow 0.15s ease` | 2 | `ds/components/Input/Input.module.css:14`<br>`ds/components/Textarea/Textarea.module.css:15` |
| `none` | 2 | `ds/components/MediaLabel/MediaLabel.module.css:89`<br>`ds/styles/utilities.css:53` |

Duration sources across all transitions:

| Duration | Uses |
|---|---|
| raw 150ms | 31 |
| raw 0.2s | 20 |
| raw 0.15s | 20 |
| token | 14 |
| raw 0.1s | 10 |
| raw 200ms | 6 |
| raw 80ms | 5 |
| raw 0.6s | 5 |
| raw 120ms | 5 |
| raw 0.12s | 4 |
| raw 300ms | 3 |
| raw 0.4s | 1 |
| raw 0.3s | 1 |

### D2. Hover transforms

| Site | Selector | transform |
|---|---|---|
| `web/components/PageSections.module.css:38` | `.heroWithImage:hover::after` | `scale(1.05)` |
| `web/components/PageSections.module.css:44` | `.heroWithImage:hover::after` | `none` |
| `web/components/atoms/SocialLink.module.css:17` | `.socialLink:hover` | `translateY(-2px)` |
| `ds/components/Card/Card.module.css:36` | `.card:has(.titleLink):hover` | `translateY(var(--st-card-hover-translate-y))` |
| `ds/components/Card/Card.module.css:87` | `.card:hover .thumbnailImg` | `scale(1.05)` |
| `ds/components/Card/Card.module.css:93` | `.card:hover .thumbnailImg, .card:has(.titleLink)` | `none` |
| `ds/components/Card/Card.module.css:601` | `.variantMetadata.card:has(.titleLink):hover` | `none` |
| `ds/components/Chip/Chip.module.css:58` | `.interactive:hover` | `translateY(-1px)` |
| `ds/components/Chip/Chip.module.css:67` | `.interactive:hover` | `none` |
| `ds/components/Media/Media.module.css:132` | `.hoverScale:hover .image` | `scale(1.05)` |
| `ds/components/Media/Media.module.css:138` | `.hoverScale:hover .image` | `none` |
| `ds/styles/utilities.css:27` | `.st-duotone:hover img` | `scale(1.05)` |
| `ds/styles/utilities.css:33` | `.st-duotone:hover img` | `none` |
| `ds/styles/utilities.css:57` | `.st-duotone--static:hover img` | `none` |

### E1. Focus-ring declarations (selectors containing `focus`)

41 focus blocks in 30 files, 10 distinct rings.

| Ring | Sites | Where |
|---|---|---|
| outline `2px solid var(--st-color-brand-primary)`; outline-offset `2px` | 22 | `web/components/ContentsStrip.module.css:56`<br>`web/components/Drawer.module.css:75`<br>`web/components/Drawer.module.css:148`<br>`web/components/Footer.module.css:133`<br>`web/components/Header.module.css:64`<br>`web/components/PlatformLayout/PlatformSidebar.module.css:51`<br>`web/components/atoms/Link.module.css:11`<br>`web/components/atoms/SocialLink.module.css:20`<br>`web/design-system/components/sidebar-nav/SidebarNav.module.css:47`<br>`web/design-system/components/sidebar-nav/SidebarNav.module.css:84`<br>`web/pages/pages.module.css:522`<br>`web/pages/pages.module.css:600`<br>`ds/components/Accordion/Accordion.module.css:44`<br>`ds/components/Button/Button.module.css:44`<br>`ds/components/Card/Card.module.css:356`<br>`ds/components/FilterBar/FilterBar.module.css:55`<br>`ds/components/FilterBar/FilterBar.module.css:158`<br>`ds/components/IconButton/IconButton.module.css:38`<br>`ds/components/IndexCell/IndexCell.module.css:55`<br>`ds/components/SegmentedControl/SegmentedControl.module.css:59`<br>`ds/components/SegmentedControl/SegmentedControl.module.css:96`<br>`ds/components/Sidebar/Sidebar.module.css:35` |
| outline `2px solid color-mix(in srgb, var(--st-color-focus) 30%, transparent)`; outline-offset `2px` | 3 | `web/components/Checkbox/Checkbox.module.css:45`<br>`web/components/Radio/Radio.module.css:43`<br>`web/components/Switch/Switch.module.css:80` |
| outline `3px solid var(--st-color-pink)`; outline-offset `3px` | 3 | `web/components/ImageLightbox.module.css:96`<br>`web/components/ImageLightbox.module.css:127`<br>`web/components/PageSections.module.css:618` |
| outline `none` | 3 | `web/components/atoms/NavigationItem.module.css:29`<br>`web/components/atoms/NavigationItem.module.css:33`<br>`web/components/atoms/NavigationItem.module.css:120` |
| outline `2px solid var(--st-color-focus)`; outline-offset `2px` | 3 | `ds/components/Chip/Chip.module.css:71`<br>`ds/components/Citation/Citation.module.css:34`<br>`ds/components/Citation/Citation.module.css:91` |
| box-shadow `0 0 0 2px var(--st-color-bg-elevated)` | 2 | `ds/components/Input/Input.module.css:21`<br>`ds/components/Textarea/Textarea.module.css:22` |
| box-shadow `0 0 0 2px var(--st-color-brand-primary-tint-10)` | 2 | `ds/components/Input/Input.module.css:30`<br>`ds/components/Textarea/Textarea.module.css:31` |
| box-shadow `0 0 0 2px color-mix(in srgb, var(--st-color-focus) 18%, transparent)`; outline `none` | 1 | `web/components/Select/Select.module.css:29` |
| outline `2px solid var(--st-color-brand-primary)`; outline-offset `4px` | 1 | `web/components/atoms/Logo.module.css:10` |
| box-shadow `0 0 0 2px var(--st-color-accent)`; outline `none` | 1 | `ds/components/MediaLabel/MediaLabel.module.css:34` |

