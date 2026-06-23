# Release Notes — v0.28.0

**Date:** 2026-06-23
**Scope:** apps/web, apps/studio, packages/design-system, apps/storybook, apps/contentful-poc

---

## What this release is

v0.28.0 closes the taxonomy surface gap opened by SUG-190's tag retirements, ships the
Contentful POC foundation and multi-brand theming convention, and delivers a Chromatic
snapshot budget optimisation that reduces CI snapshot consumption across the Storybook suite.

---

## What changed

### Glossary terms surface in MetadataCard (SUG-193 + SUG-186 + SUG-189)

MetadataCard now shows a glossary Terms row alongside the existing Tags row, rendered as
a paired grid that mirrors the Tools|Category pair above it. Terms are drawn from two
sources and merged at query time: inline `glossaryTermRef` marks already embedded in body
portable text (zero editorial overhead — if a term is marked inline, it appears
automatically), and an explicit `relatedTerms[]` reference array added to the `article`,
`node`, and `caseStudy` Sanity schemas for terms implied by content but not marked inline.
Duplicates are resolved by `_id` before render. Each chip label (Terms, Tags, Tools,
Category) now links to its archive index.

This closes the metadata gap created by SUG-190's retirement of 34 tags: the glossary terms
that absorbed those tags are now visible on content pages. The content taxonomy audit
(SUG-189) confirmed term-linking across 14/15 articles, 52/53 nodes, and 39/65 terms, with
zero taxonomy field gaps across 75 documents.

The `glossaryTerm` schema was also restructured (SUG-186): `relatedTerms` narrows to
glossaryTerm-only cross-references, and `relatedTags` + `relatedTools` fields handle
taxonomy relationships separately. A `SyncRelatedAction` keeps bidirectional links in sync
on publish.

### Chromatic snapshot budget optimisation (SUG-191)

TurboSnap (`--only-changed`) is now enabled, so Chromatic only snapshots stories affected
by changed files in a given CI run. A skip gate prevents snapshots on non-visual commits.
All docs stories have `disableSnapshot` applied. Story counts were reduced to ≤4 per
component across 10 components (Hero, PageSidebar, SidebarNav, Chip, Media, Grid,
DescriptionList, Button, CodeBlock, Avatar), with controls replacing combinatorial story
variants. A `chromatic-conventions.md` documents the budget rules going forward.

### Contentful POC Stage 1 (SUG-179 + SUG-188)

The contentful-poc app now has a working navigation layer: SiteHeader and SiteFooter
Next.js adapters pull nav data from Contentful via a `normalizeSiteSettings` flattening
layer. Four content types were added to the Contentful space (navigationItem,
navigationMenu, socialLink, ctaButton), and siteSettings was extended with 12 nav/footer/SEO
fields. A homepage entry and seeded nav data complete the Stage 1 foundation.

### Multi-brand DS theming convention (SUG-180)

`theme.pink-moon.css` attribute selectors were changed from exact-match (`=`) to
includes-word (`~=`), enabling additive `data-theme` values like
`"light-pink-moon light-shop"` without breaking existing single-token usage. `theme.shop.css`
ships in both style dirs. The `validate:style-mirror` check now covers 6 files. The
contentful-poc uses the shop amber theme by default. Studio gains an Assigned content panel
on project documents.

### Bug fixes

Four production bugs resolved:

- **SiteGraphPage white screen on node click** — `Link` (react-router-dom) was referenced
  at two call sites in SiteGraphPage but absent from the import statement. Any node click
  crashed the component tree.
- **Partial dark mode on prerendered pages** — the theme-init script that reads
  localStorage and sets `data-theme` before React hydrates was missing from the HTML shell
  written by the prerender script, causing a light-mode flash or incomplete dark mode on
  first load.
- **GSC crawled-not-indexed** — filter parameter URLs (`?tag=...`) were being indexed as
  thin-content duplicates. robots.txt now blocks `/*?*`; taxonomy/tool pages with fewer
  than 3 items receive a `noindex` tag.
- **`/people/beehead` 404** — redirect to `/people/bex` added.

---

## Not in this release

- SUG-193 Phase 4 backfill — adding `relatedTerms[]` to docs that lost tags during
  SUG-190 retirements and have no inline terms. Deferred; editors can populate in Studio.
- Chromatic VRT run for SUG-193 MetadataCard changes — deferred pending next CI cycle.
- Contentful POC Stage 2+ (rendering, routing, full parity with Sanity web app) — Stage 1
  covers nav/header/footer only.
- SUG-100 performance data — held pending real CI CrUX data.

---

## Validator state at release

```
✅  pnpm validate:tokens       — 652 tokens defined, all var(--st-*) refs resolve
✅  pnpm validate:tokens:strict — zero hardcoded color violations
✅  pnpm validate:style-mirror  — 6 mirrored style files byte-identical
✅  pnpm lint                   — zero ESLint errors
```
