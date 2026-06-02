# Release Notes — v0.26.0

**Date:** 2026-06-02
**Scope:** apps/web, apps/studio, packages/design-system, Sanity production data

---

## What this release is

v0.26.0 is a broad delivery across the design system, the Library surface, content infrastructure, and AEO strategy. The headline themes: a new unified Library archive with series support, the Knowledge Graph dark canvas, a Trust Report pipeline connected to live git data, and a sustained AEO content pass across the site's key editorial surfaces.

---

## What changed

### Knowledge Graph dark field

The KG graph canvas is now permanently `midnight-800` (#141830) — a dark field embedded in the light-mode page. Category hub nodes are lifted to `softgrey-300` and case study nodes to `maroon-400` so all five node types read clearly on the dark ground. The zoom controls and legend card use new dark overlay tokens (`--st-kg-zoom-*`, `--st-kg-legend-*`) so they feel native to the field rather than bright cut-outs against it. 13 new `--st-kg-*` tokens; no raw hex in component CSS; `validate:tokens --strict-colors` passes.

### Library unification and series

`/library` is now a single unified archive combining articles, nodes, and case studies. Visitors can filter by content type or toggle to a force-directed graph view. `/series/:slug` landing pages are live — each series shows type-badged parts with pink part numbers, and a series block above each article/node/case study TOC links back to the series. The `parts[]` array is editable in Studio.

### Design system primitives

Three new DS primitives ship in this release: `Breadcrumb`, `ButtonGroup`, and the `Ledger Button` update. Breadcrumb replaces ad-hoc `backLink`/`eyebrowCurrent` patterns across 8 Library pages. ButtonGroup is adopted by CTASection and Hero with a full-width mobile stack fix. The Ledger Button now uses `border-bottom` (Baseline Rule), adds `sm`/`lg` sizes, hover lift `-3px`, and proper `aria-disabled` support.

### Section Module Showcase and table improvements

A public showcase page at `/platform/design-system/sections` documents every available section type with working examples. The `tableBlock` in Sanity now has a Tone control (accent/subdued) — editors can switch between the pink-header and neutral-header variants. Table responsive cards no longer clip on the right; the wrap border is `neutral-400` in light mode.

### Trust Report pipeline

The Platform Trust Report now pulls live `recentlyShipped` and `miniReleases` data from git history (10 most recent patches). The homepage has migrated from static `recentContentSection` to the live `trustReportSection`.

### AEO content and authority

Direct-answer leads are in place on `/about`, homepage, and `/services`. The Agentic Caucus article is published with a Medium mirror (rel=canonical). FX Networks and Backroads case studies are rewritten outcome-first. The `/now` page is live. A platform selection risk article is published with 4 citations and series context. Person JSON-LD is active on `/about`.

### Content standardisation

14 documents were patched to the canonical TL;DR pattern (heading + blockquote). The AI category was applied to 3 content documents via the Content Write Gate.

---

## Not in this release

- Client taxonomy (`/clients/:slug`) — SUG-107 in backlog
- Glossary — SUG-35 in backlog
- Chromatic baseline updates for KG dark field and table changes — deferred to /eod push
- 1 content doc flagged for manual review during taxonomy enrichment pass

---

## Validator state at release

```
pnpm validate:tokens        ✅ 647 unique tokens defined, all var(--st-*) references resolve
pnpm validate:tokens:strict ✅ No hardcoded color values found in component/page CSS
pnpm lint                   ✅ No ESLint errors
```
