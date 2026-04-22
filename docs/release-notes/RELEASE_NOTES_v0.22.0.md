# Release Notes — v0.22.0

**Date:** 2026-04-22
**Scope:** apps/web, apps/studio, packages/design-system, apps/storybook

---

## What this release is

v0.22.0 closes out the Pink Moon design system implementation across all four
monorepo surfaces, migrates the font stack to Ledger Tradition, and ships a
substantial page layout overhaul — margin column layout, sidebar TOC, and
section spacing infrastructure. It also delivers the AI search optimization
suite (JSON-LD, llms.txt, robots.txt), Mermaid diagram improvements, footer
rebuild, and structured content field additions. This release aggregates six
patch mini-releases (0.21.1–0.21.6) plus unreleased post-patch work.

---

## What changed

### Pink Moon design system and Ledger Tradition font stack

Pink Moon Light is now the default theme across all surfaces. The Classic modes
have been deprecated and removed from Storybook's theme switcher.

The font stack has migrated to Ledger Tradition (AB-001): Cormorant Garamond
replaces EB Garamond for narrative/editorial type, DM Sans replaces Fira Sans
for UI copy, and IBM Plex Mono replaces Courier Prime for labels and metadata.
Both token files (`apps/web` and `packages/design-system`) were updated in the
same commit. h2 and h3 heading size tokens were bumped to compensate for
Cormorant Garamond's lower x-height. Chip visibility and alignment were
corrected for the new metrics.

Across all DS components, zero border-radius is now consistently applied. Button
weight was corrected from 400 to 700. Card hover state gained a pink border,
frost surface, and title-link underline; the previous glow was removed. 13 new
CSS tokens were added to cover gaps identified during implementation. 51
previously undefined `--st-*` token references across component and page CSS
files were resolved — these were silently falling back to browser UA defaults.

### Page layout — margin column and sidebar

Detail pages (article, node, case study, root pages) now render a 2-column
margin column layout. The primary content column is flanked by a sidebar rail
hosting the new `PageSidebar` component: a TOC panel built from PortableText
headings, a related content list, and an AI disclosure rail.

Section spacing was refactored from per-component `padding-block` to a parent
flex gap model using semantic spacing tokens. This resolved double-padding at
section boundaries. Wide tables now scroll horizontally inside their container
rather than breaking the column layout.

### Footer rebuild and build-time version injection

The footer was rebuilt: a colophon section (mission statement and copyright)
sourced from `siteSettings`, IA-reordered nav columns, a legal utility link row,
and a version + build date strip injected at build time via `lib/buildInfo.js`.
The homepage hero, scroll-triggered header transparency, and footer nav are all
now sourced from `siteSettings.primaryNav` rather than hardcoded values.

### AI search optimization

Three artifacts were added for AI crawler discoverability: JSON-LD structured
data (Organization, WebSite, BreadcrumbList) injected via `SeoHead`; `/llms.txt`
at the public root; and `robots.txt` updated with explicit allow rules for
GPTBot, ClaudeBot, PerplexityBot, and similar agents. The placeholder `<title>`
and meta description in `index.html` were replaced with real site values.

### Mermaid diagram improvements

Mermaid diagrams now use ELK ORTHOGONAL layout and linear curve routing. A
`width` field in Studio controls breakout (standard / wide / full-bleed), with
the wide variant aligned to the `.detailPage` center frame. Inline `style` and
`classDef` directives are stripped before render. The colour palette is fully
token-driven.

### Structured content fields and Studio schema changes

The `node` schema gained `aiDisclosure` and `relatedNodes[]` fields. `siteSettings`
gained colophon fields. The hero panel/overlay fields were separated into
distinct boolean and type fields. The `ctaSection` heading was made optional for
buttons-only layouts. `cardBuilderItem` gained a `tools[]` reference array and
inline `code` decorator. `accordionPortableText` was renamed to
`compactPortableText` and upgraded with list marks, inline code, and citation
support. Deprecated fields were hidden across article, caseStudy, node, and page
schemas.

### Storybook

Storybook is now titled "Pink Moon Design System." Chromatic VRT integration
is live with snapshot composite stories for regression baselines.
`__APP_VERSION__` and `__BUILD_DATE__` are defined in the Vite config, resolving
undefined variable errors in version-aware stories.

---

## Not in this release

- SUG-73 Dynamic Knowledge Graph — Phase 0 CSV audit shipped; Phases 1–4 blocked
  on SUG-74 (taxonomy cleanup) and SUG-67 (stats pipeline)
- SUG-74 Taxonomy Cleanup — CSV export script and audit CSVs shipped; the
  dedup/consolidation work is not started
- SUG-67 Dynamic Trust Reporting Pipeline — not started
- `series` schema (`apps/studio/schemas/documents/series.ts`) — file present but
  not registered or wired to any document type
- Dark-mode parity for the Ledger Tradition font stack — not verified

---

## Validator state at release

**`pnpm validate:tokens`** — PASS
All `var(--st-*)` references resolve to defined tokens. 67 CSS files scanned.

**`pnpm validate:urls`** — 14 warnings, no errors
Nav items with no URL: AI Ethics, Privacy & Terms of Use, Sitemap, Contact (×2),
Work, Services, Case Studies, Platform, Library, Articles, Knowledge Graph,
Overview, CV / Resume. All are known unbuilt routes or placeholder nav items in
Sanity content. No code changes required.

**`pnpm validate:filters`** — PASS
All filter models produced successfully.

**`pnpm validate:content`** — 2 errors, 41 warnings
Errors: `[tag]` slug `design-tokens` used by 2 documents; `[page]` slug `home`
used by 2 documents. Both are Sanity content conflicts tracked in
[SUG-75](https://linear.app/sugartown/issue/SUG-75). Must resolve before the
next content-dependent deploy.
Warnings: 41 documents missing `seo.title` / `seo.description`. Non-blocking.
