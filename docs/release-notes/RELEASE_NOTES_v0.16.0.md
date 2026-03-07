# Release Notes — v0.16.0

**Date:** 2026-03-07
**Scope:** Sugartown monorepo — apps/web, apps/studio, packages/design-system

---

## What this release is

Four epics (EPIC-0153, 0159, 0160, 0161) plus post-epic layout fixes, aggregated from patches 0.15.1–0.15.4. The release adds content authoring primitives (citations, card builder), gives editors control over hero image layout, and reworks archive grid behaviour at narrow viewports.

---

## What changed

### Hero layout control (EPIC-0153)

Editors can now choose between content-width and full-width hero images from a radio field in the Sanity hero schema. Full-width heroes break out of the content column to span the viewport. All hero surfaces enforce `border-radius: 0`, and image-bearing heroes force white text for legibility. The ghost CTA button variant now maps to the tertiary button style.

Detail pages and archive pages use canonical width tokens (`--st-width-detail` at 760px, `--st-width-archive` at 1140px) instead of the retired `--st-page-max` and `--st-content-width` values.

### Citation components (EPIC-0159)

Three new design system primitives — `CitationMarker`, `CitationNote`, and `CitationZone` — provide inline knowledge notation for marking sourced claims with superscript markers and endnote-style footnotes. Eight semantic `--st-citation-*` tokens control the visual treatment. A web adapter bridges these components into the web app.

### Card Builder section (EPIC-0160)

A new `CardBuilderSection` allows editors to compose freeform card grids directly from Sanity. Each card carries editorial content and optional citations. The section type is registered in the page builder and rendered by the web app with its own GROQ projection.

### Card grid and typography polish (EPIC-0161)

Card titles shifted from Playfair Display 1.4rem/700 to Fira Sans 1rem/600, controlled by a new `--st-card-title-size` component token. Chip rows now display group labels ("Tools ·" / "Tags ·") so readers can distinguish chip categories at a glance. Archive pages gained a grid/list layout toggle that persists the user's choice per archive via `sessionStorage`.

### Archive layout fixes

After EPIC-0161 shipped, `container-type: inline-size` was found to interfere with flex-grow negotiation in the archive sidebar. Five follow-up commits removed the containment, replaced it with media queries, switched the sidebar to `flex-wrap`, and established stable breakpoints: 420px for 2-up grid, 640px for list view, with unified title styling across both variants.

### Studio housekeeping

Eight deferred `archivePage` fields were moved to an "Advanced (coming soon)" tab to reduce editor clutter. The hero section on archive pages was also moved there. The CTA button secondary label was renamed from "Seafoam" to "Lime" to match the actual colour token.

---

## Not in this release

- Background image theming (dark/light flourish PNGs) — uncommitted, will ship in a subsequent patch
- Archive display-tab fields remain deferred and unwired
- Card web adapter migration to DS Card new API — not yet scoped
- Phase 2 IA sections (docs, governance, ai-ethics) remain deferred

---

## Validator state at release

```
validate:urls     ✅  All checks passed — URL authority is clean
validate:filters  ✅  All filter models produced successfully
validate:tokens   ❌  52 unknown token references in 19 files (pre-existing — App.css legacy
                      refs, --st-page-gutter defined in globals.css not tokens.css, Media/Table
                      component tokens not yet defined, design-tokens.css aliases)
validate:content  ❌  4 duplicate-slug errors (published+draft pairs for node, page × 2;
                      wp.tag.246 legacy duplicate for "agile")
                  ⚠️  11 PortableText HTML entity warnings (WP-era &# encoded quotes/apostrophes)
```

All token and content issues are pre-existing and tracked — none were introduced by this release.
