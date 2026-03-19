# Release Notes — v0.19.0

**Date:** 2026-03-19
**Scope:** Sugartown monorepo — apps/web, apps/studio, packages/design-system, Sanity production data, docs

---

## What this release is

Seven epics shipped since v0.18.0, spanning preview infrastructure, content editing, performance, and data quality. The headline additions are a content preview system with draft badges, a production contact form, responsive image delivery, and an enforced taxonomy governance layer that audited and backfilled all 57 published content documents.

---

## What changed

### Preview UI (EPIC-0177)

Content authors can now see which documents are in draft state directly from the frontend. A lime-green PreviewBanner appears when preview mode is active, and amber DraftBadge chips render on both archive cards and detail pages for any document with an unpublished draft. Detection uses a raw Sanity client that queries draft IDs without perspective filtering.

### PortableText editing improvements (EPIC-0178)

Inline code now renders as a styled pill — lime on dark, magenta on light — using a new decorator registered in Studio's portableTextConfig. The missing citationRef mark handler in PageSections is fixed (previously rendered as `unknown__pt__mark__citationRef`). Code blocks no longer overflow their containers horizontally.

### Contact form (EPIC-0179)

A production contact form at `/contact` with name, email, and message fields. Client-side validation prevents empty submissions; a honeypot field blocks basic spam bots. Form data posts to Netlify Forms via fetch() — a hidden static form in index.html enables Netlify's SPA form detection.

### Card adapter convergence (EPIC-0180)

The web Card adapter CSS is now in parity with the design system Card primitive. Title font tokens match, and `toolsLabel`/`tagsLabel` props allow per-instance chip section headings without forking the component.

### cardImage field (EPIC-0181)

Article, case study, and node schemas gain a `cardImage` field (image + hotspot + alt). GROQ archive queries project `cardImageUrl` and `cardImageAlt` into a thumbnail chain: `cardImageUrl → imageOverride → heroImageUrl → null`. No visual change until editors populate the field in Studio.

### Image optimization (EPIC-0182)

Responsive images delivered via a new SanityImage component with srcset at 400w/800w/1200w breakpoints. Sanity CDN auto-format serves WebP or AVIF based on browser support. All `<img>` elements now carry `loading="lazy"` and `decoding="async"`. Detail page hero images get a `<link rel="preload">`. Background PNGs converted to WebP, reducing asset weight from 2.4 MB to 383 KB. Three breakpoint tokens (`--st-breakpoint-sm/md/lg`) standardize media query boundaries across 13 CSS files.

### Content metadata governance (EPIC-0183)

An audit of all 57 published content documents identified 18 below taxonomy minimums (≥1 category, ≥3 tags, ≥1 tool for articles/nodes, ≥1 author). All 18 were backfilled and published. Nine unused taxonomy entries (zero-reference categories and tags) were deleted. Three new validator checks enforce these minimums going forward: H (taxonomy coverage), I (author attribution), J (SEO metadata completeness). The `--strict` flag promotes these to errors; `--report` appends a taxonomy utilization summary.

### Taxonomy and schema refinement

Tools taxonomy is now available on project documents — editors can tag projects with the same tool references used on articles and nodes. Taxonomy field order is standardized across all content types: Author → Project → Status → Tools → Category → Tag, matching both Studio field groups and the filter nav facet order.

### Infrastructure and fixes

Favicon now loads from Sanity siteSettings instead of the Vite default. The `@sanity/image-url` import was updated from the deprecated default export to the named `createImageUrlBuilder`. SocialLink correctly handles `mailto:` and `tel:` URLs. The Button component's `type` prop works for form submission. CTA button's deprecated `text` field is hidden in Studio — `link.label` is the canonical source.

---

## Not in this release

- DNS cutover to Netlify — hosting decision made, execution pending
- Themed background images — WebP assets exist but remain commented out in CSS pending design decision
- Brand color picker for Studio — `@sanity/color-input` installed but field migration not started
- Sitemap generation — deferred to post-launch
- Site-wide content search — needs design spike

---

## Validator state at release

Validators not run in this session (release artifact generation only). Last validator run during EPIC-0183 confirmed 0 of 57 published documents below taxonomy minimums.
