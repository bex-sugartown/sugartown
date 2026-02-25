# Release Notes — v0.13.0

**Date:** 2026-02-25
**Branch:** `feat/v7c-legacy-components`
**Scope:** Sugartown monorepo — packages/design-system, apps/web, apps/studio, apps/storybook, root tooling

---

## What this release is

The design system goes from two components (Button, Media) to ten. Every new DS primitive has a web adapter, a Storybook story, and a visual contract spec. The adapter layer bridges the DS package to the web app without a build-time package dependency. Alongside the component work, article and node schemas gain the same flexible section builder that page and caseStudy already had, and three FilterBar bugs that caused blank labels and empty URL params are fixed.

---

## What changed

### Design system component library (8 new primitives)

Card, Chip, FilterBar, Table, Blockquote, Callout, CodeBlock (with InlineCode), and Media are now available as DS primitives in `packages/design-system`. Each ships with CSS Modules, TypeScript types, and Storybook stories. Card supports four variants (default, compact, listing, dark) and a polymorphic `as` prop for SPA routing. Chip drives its entire color scheme from a single `--chip-color` custom property via `color-mix()`. CodeBlock uses Prism.js with a custom Sugartown theme (pink keywords, seafoam strings, lime comments) across 12 language grammars. Media now supports duotone overlays with three brand presets and a custom mode.

A `COMPONENT_CONTRACTS.md` spec document provides the authoritative visual reference for Chip, FilterBar, and Card — including anatomy diagrams, sizing tables, state transitions, and Figma build guidance.

### Token system restructure and brand pink correction

The token file has been restructured from a flat list of variables into an explicit 3-tier architecture: Tier 1 raw primitives (color scales, spacing, typography stacks), Tier 2 semantic aliases (role-named tokens like `--st-color-brand-primary`), and Tier 3 component tokens (dedicated groups for Card, Button, Table, Blockquote, Callout, Code, and Media). Legacy flat aliases are retained for backward compatibility.

Brand pink was corrected from `#FF69B4` (hot pink) to `#ff247d` (the canonical Sugartown brand pink) across all tokens and components.

### Button visual contract overhaul

The Button's three variants were redesigned. Primary now uses the correct brand pink with a hover lift and glow shadow. Secondary changed from a grey ghost button to a lime accent (`#D1FF1D`). A new tertiary variant provides a transparent button with a pink border. All three variants have Pink Moon theme adaptations — frosted-glass substrate, pill border-radius, and inner glow rings.

### Web adapter layer and ContentCard

JSX adapter mirrors for all 8 DS components now live in `apps/web/src/design-system/components/`. These bridge DS primitives to the web app without requiring a package dependency — consuming components import from `'../design-system'` and get the adapter.

ContentCard (`src/components/ContentCard.jsx`) replaces inline card functions that were duplicated in ArchivePage and TaxonomyDetailPage. It standardizes docType derivation, SPA routing via the Card's polymorphic `as={Link}` prop, eyebrow composition with status badges, meta lines, and taxonomy chips in the footer.

### PageSections wired to DS components

Sanity blockquote blocks now route through the DS Blockquote component. Inline code marks render via InlineCode. Code blocks from `@sanity/code-input` render via CodeBlock with Prism syntax highlighting. Hero and CTA section buttons use the DS Button with variant props instead of raw `<button>` elements.

### htmlSection and legacy HTML styles

A new HtmlSection component renders raw HTML content (from WordPress migration) via `dangerouslySetInnerHTML` with scoped CSS containment. Over 200 lines of legacy HTML styles ensure visual parity between raw migrated content and DS component output — tables with responsive card layout at 860px, typography, blockquotes, code blocks, and links all match their DS counterparts.

### Section builder parity across all content types

The `sections[]` field (heroSection, textSection, imageGallery, ctaSection, htmlSection) has been added to both the node and article schemas. All four content types (page, caseStudy, node, article) now share the same flexible section builder. The frontend already supported sections on articles and nodes via PageSections and GROQ queries — only the Studio schemas were missing.

### Filter model hardening

Three new enum facets (client, tools, status) are available in the archive filter model. Three bugs were fixed: FilterBar was rendering `option.title` (undefined) instead of `option.label`, causing blank labels; enum facets used `option.slug` (undefined for enums) as URL param values, producing empty params; and ARCHIVE_QUERIES were not projecting the `client`, `status`, and `tools` fields, so the filter model had no data to derive options from.

### Storybook font loading fix

Google Fonts (Playfair Display, Fira Sans) are now loaded via `<link>` tags in Storybook's `preview-head.html`. CSS `@import url()` inside Vite-bundled files was unreliable in Storybook's Vite config — fonts were intermittently missing in story renders.

### Studio schema additions

The `htmlSection` section type supports raw HTML content with a label and HTML-stripping preview. The `mediaOverlay` object provides per-image overlay configuration (duotone presets or arbitrary color overlay) and is now embedded in the `richImage` schema. The node aiTool option "Mixed" was renamed to "Agentic Caucus".

### Sanity production data migrations

62 documents had SEO fields migrated from legacy `seo.metaTitle`/`seo.metaDescription` to canonical `seo.title`/`seo.description`, with `autoGenerate` set based on whether the content had real Yoast overrides. 50 WP-imported documents had missing `_key` properties added to their `tags[]` arrays — these tags were read-only in Studio without the key.

### Tooling

Stylelint config enforces `--st-*` custom property namespacing and forbids `!important`. A token validator script detects drift between the web and DS package token files. Epic and post-mortem prompt templates were added. Migration scripts for htmlSection backfill and featured-to-hero conversion are available.

---

## Not in this release

- DS components are not yet consumed as a package dependency — the adapter layer bridges the gap but `@sugartown/design-system` is not in `apps/web/package.json` dependencies
- Pink Moon theme is defined in CSS but has no runtime toggle — theme switching UI is deferred
- Storybook is not deployed — stories are local development only
- `featured-to-hero.js` migration script exists but has not been run against production data
- Foundation stories (Colors, Typefaces) are documentation — no runtime visual regression testing
- Token drift between web and DS package token files exists (58 web-only, 9 DS-only, 17 value mismatches) — sync is deferred to a dedicated token reconciliation pass
- DNS cutover — WordPress remains the live production site

---

## Validator state at release

```
pnpm validate:urls    ✅  All checks passed — URL authority is clean.
pnpm validate:filters ✅  All filter models produced successfully. No WP-era keys.
pnpm validate:tokens  ❌  67 missing tokens, 17 value mismatches (known drift — deferred)
pnpm --filter web build  ✅  2071 modules transformed. Built in 1.59s. Zero errors.
```
