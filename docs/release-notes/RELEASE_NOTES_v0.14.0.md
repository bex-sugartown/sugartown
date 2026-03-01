# Release Notes — v0.14.0

**Date:** 2026-03-01
**Branch:** `epic/taxonomy-governance` → `main`
**Scope:** apps/web, apps/studio, packages/design-system, scripts

---

## What this release is

v0.14.0 completes the taxonomy entity page layer — people and projects now have full rich-detail pages instead of placeholders — and consolidates all structured metadata onto a single reusable MetadataCard sidebar. It also lands content tooling for bulk operations and legacy URL auditing, and fixes three routing/data bugs introduced during earlier stages.

---

## What changed

### Taxonomy entity pages (/people/:slug, /projects/:slug)

`/people/:slug` now renders a PersonProfilePage: profile header with the person's name styled in brand pink, bio, expertise displayed as linked category chips, a roles/titles section, social links, and a full backreference grid showing all content attributed to them via ContentCard.

`/projects/:slug` now renders a ProjectDetailPage: a colour accent bar drawn from the project's colour field, status badge, categories and tags chips, a priority row with emoji label, a KPI table (metric / current / target), and a unified content timeline.

Both pages replace the previous TaxonomyPlaceholderPage, which matched only the `:slug` route and returned an empty state.

### Taxonomy archive pages (/people, /categories, /tags, /projects)

These four routes previously resolved to a 404 or placeholder. A new TaxonomyArchivePage now renders a linked listing at each: people show avatar (initial fallback if no image) + name + primary title; categories and projects show a colour dot + name + description; tags show name + description.

### MetadataCard — unified metadata sidebar

A new MetadataCard component replaces the ad-hoc inline metadata blocks that existed separately in NodePage, ArticlePage, and CaseStudyPage. It consolidates content type, status, AI tool, conversation type, client, role, published date, author attribution (with link to `/people/:slug` when a slug is present), and per-type taxonomy chip rows (Project / Category / Tags) into a single sidebar surface. For project detail pages it also surfaces projectId, priority (with labelled emoji tiers), and a KPI list.

### ContentNav — sequential prev/next navigation

NodePage, ArticlePage, and CaseStudyPage now render a ContentNav bar at the bottom of each detail page. Prev and next items are resolved in the same GROQ query using `^.publishedAt` ordering — no additional API round-trips. The component renders null on boundary items, so no empty markup appears on the first or last document.

### Archive card density control

Editors can now set card density per archive directly in Sanity Studio via a `cardOptions` field on each archivePage document: `size` (compact | full) and `showMeta` (boolean). ContentCard reads this and applies the correct Card variant and badge visibility to the listing grid.

### Studio schema: person and project

The person schema gains 7 new fields (headline, location, pronouns, featured, socialLinks[], seo), field groups (Basics, SEO), and a migration of `expertise` from a free-text string array to category references. The project schema gains field groups (Basics, Profile, SEO), a `categories[]` reference array, and a `seo` object.

The autoTimestamps plugin now auto-populates `publishedAt` on first publish and `updatedAt` on every publish across all content types, eliminating the need to set these fields manually.

### Bug fixes

**Draft shadowing (critical):** The Sanity web client was operating in raw mode, which caused `drafts.*` documents to appear before published ones when both shared a slug. The empty draft won position [0] in GROQ results, hiding the published document from the front end. `perspective: 'published'` is now set on the client.

**Taxonomy back-link URLs:** TaxonomyDetailPage was computing back-link paths as `type + 's'`, producing `'categorys'` and `'persons'` — neither of which are valid routes. Each TAXONOMY_CONFIG entry now carries an explicit `archivePath` string.

**Person profile image crop/hotspot:** The `personProfileQuery` was projecting only `asset`, discarding the `hotspot` and `crop` fields set in Studio. The query now includes both fields, and `urlFor` receives the full image object.

**MetadataCard display labels:** Raw Sanity enum keys (e.g. `"architecture"`, `"claude"`) were being rendered as-is. Display title maps now resolve these to full labels. The node status vocabulary was also extended to cover `validated`, `implemented`, `deprecated`, and `evergreen`.

### Content tooling

`pnpm bulk:export` and `pnpm bulk:import` provide field-contract-driven CSV round-tripping for batch content edits: export a filtered document set to CSV, edit offline, and re-import with a validation pipeline (enum checks, date checks, reference resolution), dry-run diff preview, and patch-only writes.

`pnpm audit:urls` crawls the live WordPress REST API and sitemap, cross-references every URL against Sanity documents and existing redirect rules, and classifies each legacy URL. First run found 326 WP URLs: 59 matched to Sanity content, 266 in taxonomy namespaces requiring redirect decisions.

### Design system

The DS Card component now accepts a `'metadata'` variant (title optional, header conditional, no hover lift) to support the sidebar MetadataCard context. Stories for this variant and for the new ContentNav pattern are documented in Storybook. The Button component was reorganised into its own subdirectory — no behaviour change.

---

## Not in this release

- Redirect rules for the 266 taxonomy-namespace legacy WP URLs (audit complete; decisions pending)
- `/platform`, `/services`, `/contact`, `/about` page routes (Phase 1 IA, deferred — see `docs/ia-brief.md`)
- FilterBar integration with TaxonomyArchivePage (archive listing has no faceted filter yet)
- Person/project content in Sanity production (schema deployed; documents to be authored separately)

---

## Validator state at release

```
pnpm validate:urls     — not run this release (URL namespace changes were routing fixes, not new namespaces)
pnpm validate:filters  — not run this release (no filter model changes)
pnpm validate:taxonomy — extended to 9 checks; last known run: all checks passing on local dataset
pnpm audit:urls        — first run complete: 326 WP URLs found, 59 matched, 266 taxonomy, 0 orphaned
```
