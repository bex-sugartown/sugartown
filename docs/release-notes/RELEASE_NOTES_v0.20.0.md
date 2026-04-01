# Release Notes — v0.20.0

**Date:** 2026-04-01
**Scope:** Sugartown monorepo — apps/web, apps/studio, packages/design-system, tooling

---

## What this release is

A feature-dense release spanning 8 shipped epics (SUG-8, SUG-13, SUG-15, SUG-30, SUG-31, SUG-33, SUG-34, SUG-37). The headline additions are responsive mobile navigation, a full image treatment and gallery system, a custom table authoring experience, and SEO infrastructure. This is the largest release since v0.19.0.

---

## What changed

### Mobile navigation (SUG-37)

The site now has a responsive hamburger menu with a slide-out drawer. The drawer includes the full nav tree, a CTA button, and footer content (legal links, social links, copyright). This replaces the desktop-only nav that was previously inaccessible on narrow viewports.

### Image treatments, gallery, and lightbox (SUG-30, SUG-33)

A complete image presentation system: three overlay treatments (duotone standard, extreme duotone via SVG colour remap, and scrim), plus gallery layouts (carousel, masonry, grid) with a lightbox that preserves scroll position. Hero sections gained an eyebrow field, image treatment support, and up to 3 CTA buttons. Card builder thumbnails also use the new overlay system. The detail page hero and MetadataCard layouts were refined with a compact grid and right-column alignment.

### Table authoring UX (SUG-34)

Studio editors now get a spreadsheet-style table input instead of the default modal-per-cell experience. The custom `TableBlockInput` supports click-to-edit cells, keyboard navigation (Tab/Enter/arrows), and clipboard paste from spreadsheets (TSV) and browsers (HTML tables). A migration script converted 26 legacy HTML tables from `htmlSection` blocks to native `tableBlock` content.

On the frontend, table columns now wrap text dynamically — the previous CSS used `white-space: nowrap` on all cells and a greedy `width: 100%` on the first column, which collapsed short-content columns to a single character and truncated long prose.

### Mermaid diagrams (SUG-13)

A new `mermaidSection` schema type lets editors embed Mermaid diagram syntax in any page section. The web renderer applies Sugartown brand colours and respects the current theme (dark/light).

### SEO infrastructure (SUG-15)

XML sitemap at `/sitemap.xml`, a `robots.txt` file, and a visual HTML sitemap page at `/sitemap` for human browsing. All generated from published Sanity content at build time.

### Studio schema and migration work

- `colorHex` fields migrated from plain strings to `@sanity/color-input` objects (SUG-8)
- Tool type taxonomy expanded with a `toolType` field and reassignment migration
- Archive descriptions upgraded to PortableText
- Node metadata fields (challenge/insight/actionItem) migrated to PortableText then deprecated
- `richImage` `linkUrl` fields migrated to `linkItem` objects
- Title fields relabeled to "Internal Title" for editorial clarity
- Sanity upgraded to 5.17.1

### Spam protection and analytics

Contact form spam protection iterated through three approaches and landed on reCAPTCHA v3 (invisible, score-based). Google Analytics 4 tracking was added site-wide.

### Design system

- Table CSS overhauled for wide-variant viewport breakout and dynamic column wrapping
- Media component gained duotone, extreme, and scrim overlay variants
- Card thumbnails scoped overlay to thumb container with hover zoom
- Tertiary button colour changed from pink to lime
- Border token opacity increased for visibility

---

## Not in this release

- Homepage hero remains temporarily hidden — awaiting content/design decisions
- Storybook has no new stories for the components added in this release (SUG-38 scoped)
- No new content type pages (services, about rewrite) — IA brief Phase 1 items deferred
- Pink Moon theme toggle not yet wired into web app runtime (SUG-21)

---

## Validator state at release

**URL validator:** 10 warnings (pre-existing — trailing slashes in nav data, missing nav URLs). 0 errors.
**Token validator:** 51 unknown references across 15 files — all are component-scoped custom properties with hardcoded fallbacks (pre-existing, not broken). No new regressions from this release.
