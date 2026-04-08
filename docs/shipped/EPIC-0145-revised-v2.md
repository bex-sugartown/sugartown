# Sugartown — Claude Code Epic Prompt

**Epic ID:** EPIC-0145
## EPIC NAME: Content State & Taxonomy Governance — Entity Pages & Authorship

**Branch:** `epic/taxonomy-governance`
**Priority:** P1 — Foundation for knowledge graph entity pages.
**Revised:** 2026-02-28 — Rebuilt against epic-template.md; deduped against v0.10.0–v0.13.0; tool doctype descoped to `docs/backlog/EPIC-tool-doctype.md`.

---

## Context

### What already shipped — DO NOT recreate

**v0.10.0:**
- `TaxonomyDetailPage.jsx` — handles `tag` and `category` types only
- Routes `/tags/:slug`, `/categories/:slug` → `TaxonomyDetailPage`
- Routes `/projects/:slug`, `/people/:slug` → `TaxonomyPlaceholderPage` (**NOT** TaxonomyDetailPage — confirmed in App.jsx)
- `TaxonomyChips.jsx` — chips link to canonical URLs via `getCanonicalPath()`
- `slug` field added to `project` schema

**v0.11.0:**
- `tools[]` string enum (30-item) on `article`, `caseStudy`, `node`
- `status` field on `article`, `caseStudy`, `node`
- `tag.ts` description field (max 300 chars)
- `scripts/validate-taxonomy.js` — 4 checks (category count warn, tools enum fail, dangling tags fail, reserved namespace fail)

**v0.12.0:**
- `resolveSeo()` rewritten — full doc object signature; `extractPlainText()` for auto description
- `SEO_FRAGMENT` includes `autoGenerate`
- `seoMetadata.ts` has `autoGenerate` field

**v0.13.0 / EPIC-0146:**
- Full DS adapter layer: `apps/web/src/design-system/components/` with `Card`, `Chip`, `FilterBar`, `Table`, `Blockquote`, `Callout`, `CodeBlock`, `Media` adapters; barrel export at `src/design-system/index.js`
- `ContentCard.jsx` — unified card component for archive and taxonomy listings
- `MetadataCard.jsx` — structured metadata sidebar for detail pages; currently wired in `ArticlePage.jsx` (passes `authors` prop); NOT yet wired in `NodePage.jsx` or `CaseStudyPage.jsx` — **verify render location in each file before writing byline code**
- `sections[]` added to `article` and `node` schemas (parity with `page`, `caseStudy`)
- Filter model: `client`, `tools`, `status` enum facets added
- `FilterBar` wired in archives
- `htmlSection` schema and renderer

### Confirmed facts — do not re-derive

- `PERSON_FRAGMENT` in `queries.js` already includes `"slug": slug.current` ✅ — no update needed
- `ContentCard.jsx` does NOT render author name in the meta line — archive queries do not need author slug projection ✅
- `/people/:slug` and `/projects/:slug` currently route to `TaxonomyPlaceholderPage` (stub) — this epic migrates them to dedicated pages

### Files in scope for this epic

- `apps/studio/schemas/documents/person.ts` — EXTEND (add 7 new fields)
- `apps/web/src/lib/queries.js` — add `personProfileQuery`, `projectDetailQuery`; PERSON_FRAGMENT already correct ✅
- `apps/web/src/pages/PersonProfilePage.jsx` — CREATE
- `apps/web/src/pages/PersonProfilePage.module.css` — CREATE
- `apps/web/src/pages/ProjectDetailPage.jsx` — CREATE
- `apps/web/src/pages/ProjectDetailPage.module.css` — CREATE
- `apps/web/src/App.jsx` — reroute `/people/:slug` and `/projects/:slug`
- `apps/web/src/components/MetadataCard.jsx` — update author byline to link to `/people/:slug`
- `apps/web/src/pages/ArticlePage.jsx` — verify author is passed via MetadataCard; update if not
- `apps/web/src/pages/NodePage.jsx` — verify author render location; update byline
- `apps/web/src/pages/CaseStudyPage.jsx` — verify author render location; update byline
- `apps/web/src/lib/routes.js` — verify person path helper exists
- `apps/web/scripts/validate-taxonomy.js` — EXTEND (5 new checks; do not recreate)

### Recent epics touching same surface area

- EPIC-0146 (Archive & Page Type Normalization) — touched `NodePage.jsx`, `ArticlePage.jsx`, `CaseStudyPage.jsx`, `MetadataCard.jsx`. **Read those files before writing any byline code — the author rendering location may have moved. Update wherever it currently renders; do not add a second location.**

---

## Objective

After this epic: (1) the `person` schema has richer fields (headline, location, pronouns, expertise, socialLinks, featured, seo); (2) `/people/:slug` routes to a dedicated `PersonProfilePage` with image, bio, social links, and content grouped by type — replacing `TaxonomyPlaceholderPage`; (3) `/projects/:slug` routes to a dedicated `ProjectDetailPage` with a color-accented header and unified content timeline — replacing `TaxonomyPlaceholderPage`; (4) author bylines on all content detail pages link to `/people/:slug`; (5) `validate-taxonomy.js` covers 5 new entity checks.

**Data layer:** `person` schema extension.
**Query layer:** new `personProfileQuery` and `projectDetailQuery` in `queries.js`; `PERSON_FRAGMENT` already includes slug (confirmed).
**Render layer:** `PersonProfilePage.jsx`, `ProjectDetailPage.jsx`, byline links via `MetadataCard.jsx` and any page that renders author directly.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☐ No | Pages have no author byline; not a content entity linking to person/project |
| `article`   | ☑ Yes | Author byline link update; project detail page lists articles |
| `caseStudy` | ☑ Yes | Author byline link update; project detail page lists case studies |
| `node`      | ☑ Yes | Author byline link update; project detail page lists nodes |
| `archivePage` | ☐ No | Structural config doc; no author, no entity page relationship |

---

## Scope

- [ ] Extend `apps/studio/schemas/documents/person.ts` with headline, location, pronouns, expertise, socialLinks, featured, seo fields
- [ ] Create `apps/web/src/pages/PersonProfilePage.jsx` + `PersonProfilePage.module.css`
- [ ] Add `personProfileQuery` to `apps/web/src/lib/queries.js`
- [ ] Update `App.jsx` to route `/people/:slug` → `PersonProfilePage`
- [ ] Create `apps/web/src/pages/ProjectDetailPage.jsx` + `ProjectDetailPage.module.css`
- [ ] Add `projectDetailQuery` to `apps/web/src/lib/queries.js`
- [ ] Update `App.jsx` to route `/projects/:slug` → `ProjectDetailPage`
- [ ] Update author byline in `MetadataCard.jsx` (primary target) and any page that renders author name directly — link to `/people/:slug` when slug exists; plain text fallback when no slug
- [ ] Extend `apps/web/scripts/validate-taxonomy.js` with 5 new checks (no new file — extend existing)
- [ ] No web adapter sync required — new pages use CSS Modules + existing DS adapters; no new DS component

---

## Query Layer Checklist

- [ ] `personProfileQuery` — CREATE in `queries.js`; project person doc + all referenced content (articles, nodes, caseStudies) via `references(^._id)`
- [ ] `projectDetailQuery` — CREATE in `queries.js`; project doc + all referenced content (articles, caseStudies, nodes)
- [ ] `PERSON_FRAGMENT` — CONFIRMED already includes `"slug": slug.current` ✅; no update needed
- [ ] `pageBySlugQuery` — EXCLUDED: page has no author, not affected
- [ ] `articleBySlugQuery` — VERIFY author fragment carries slug (for byline link); PERSON_FRAGMENT is already correct so no change expected — confirm by reading the query
- [ ] `caseStudyBySlugQuery` — same as above
- [ ] `nodeBySlugQuery` — same as above
- [ ] Archive queries (`allArticlesQuery`, `allCaseStudiesQuery`, `allNodesQuery`) — EXCLUDED: ContentCard does not render author name in meta line (confirmed); no projection change needed

---

## Schema Enum Audit

| Field name | Schema file | `value` → Display title |
|-----------|-------------|--------------------------|
| `status` (person/project pages) | N/A | Not rendered as UI enum — plain text from data |
| `socialLinks[].platform` | `person.ts` (ADD) | `website → Website`, `linkedin → LinkedIn`, `github → GitHub`, `twitter → Twitter/X`, `mastodon → Mastodon`, `bluesky → Bluesky`, `dribbble → Dribbble`, `other → Link` — **read schema after extension to confirm exact values; do not build label maps from this document** |
| `status` (project detail page) | `project.ts` | Read `project.ts` `status` field options before writing status badge render code — do NOT assume values match any other type's status enum |

---

## Metadata Field Inventory

> This epic creates NEW dedicated pages for person and project — not MetadataCard updates (except for byline link).

**PersonProfilePage fields:**

| Field | Sanity field name | Source | Render location |
|-------|------------------|--------|-----------------|
| Name | `name` | `person` doc | Profile header — primary heading |
| Short name | `shortName` | `person` doc | Fallback for compact contexts |
| Headline | `headline` | `person` doc (NEW) | Profile header — subtitle |
| Location | `location` | `person` doc (NEW) | Profile header — meta line |
| Pronouns | `pronouns` | `person` doc (NEW) | Profile header — meta line |
| Bio | `bio` | `person` doc | Body — Portable Text |
| Expertise | `expertise[]` | `person` doc (NEW) | Chip row — neutral tag chips |
| Profile image | `image` | `person` doc | Profile header — circle crop |
| Social links | `socialLinks[]` | `person` doc (NEW) | Profile header — icon links |
| Legacy links | `links[]` | `person` doc (existing) | Not rendered — retained in schema only |
| Articles | via `references()` | GROQ backref | Content section |
| Nodes | via `references()` | GROQ backref | Content section |
| Case Studies | via `references()` | GROQ backref | Content section |

**ProjectDetailPage fields:**

| Field | Sanity field name | Source | Render location |
|-------|------------------|--------|-----------------|
| Name | `name` | `project` doc | Page heading |
| Description | `description` | `project` doc | Below heading |
| Color | `colorHex` | `project` doc | Accent bar — WCAG fallback required |
| Status | `status` | `project` doc | Status badge (read schema for enum values first) |
| Project ID | `projectId` | `project` doc | Meta — display only |
| Content (all types) | via `references()` | GROQ backref | Unified timeline — type badge per item |

---

## Non-Goals

- **`tool` document type and seed script:** Descoped — see `docs/backlog/EPIC-tool-doctype.md`. The `tools[]` string enum is unchanged. Do not create `tool.ts`, do not modify `schemas/index.ts` for tool registration, do not modify `sanity.config.ts`.
- **`tools[]` string → document reference migration:** `tools[]` stays as string enum on all content types. Future epic gated on `/tools` entering the IA roadmap.
- **Tag and category dedicated pages:** `TaxonomyDetailPage` stays as-is for `/tags/:slug` and `/categories/:slug`. Only person and project routes migrate.
- **New DS component in `packages/design-system`:** `PersonProfilePage` and `ProjectDetailPage` use CSS Modules and existing DS adapters. No new `packages/design-system` component; no web adapter sync required.
- **`apps/storybook`:** No changes.
- **`page` doc type:** No author byline, no entity page relationship — excluded deliberately.
- **`archivePage` doc type:** Structural config; no author or entity page relationship — excluded.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; scripts at `apps/web/scripts/` and repo root
- `nanoid` is NOT needed in this epic (seed script is descoped)
- All migration/seed script patterns are N/A — no migration in this epic

**Schema (Studio)**
- `person.ts` extension: add new fields with `defineField`; do not remove or reorder any existing field; keep all hidden legacy fields (`role`, `email`, `website`)
- `socialLinks` is a new array field alongside `links[]` (existing) — do not remove `links[]`
- `seo` field on person: use the existing `seoMetadata` object type (already registered) — check `article.ts` for the import and usage pattern before adding

**Query (GROQ)**
- All queries in `apps/web/src/lib/queries.js` — never inline in components
- `personProfileQuery` must use backreferences: `*[_type == "article" && references(^._id)]`
- Both new queries must be named exports from `queries.js`
- Read existing query patterns in `queries.js` before writing — match style and projection conventions exactly

**Render (Frontend)**
- `PersonProfilePage` and `ProjectDetailPage` use `useSanityDoc()` hook — read `lib/useSanityDoc.js` first
- Use `ContentCard.jsx` for content item listings in both new pages — never build inline card markup
- Use `SeoHead.jsx` for SEO — `PersonProfilePage` should set `og:type="profile"`
- Use `TaxonomyChips.jsx` for expertise chips on `PersonProfilePage`
- Every page component requires: loading state, error state, 404 state
- **Byline links:** Read `MetadataCard.jsx`, `ArticlePage.jsx`, `NodePage.jsx`, `CaseStudyPage.jsx` before writing. EPIC-0146 moved author display — update wherever it currently renders; do not add a second render location
- CSS Modules: use `--st-*` tokens; no hardcoded color values; BEM-style naming within module scope
- **Deep Pink Rule:** `#ff247d` fails WCAG contrast on white — do not use as text color on light backgrounds
- **10-line rule:** If a CSS pattern > 10 lines, check whether it belongs in an existing DS component

**Design System → Web Adapter Sync**
- Not required this epic — no new DS component created
- New pages import from `apps/web/src/design-system/index.js` (existing adapters) and use CSS Modules

---

## Migration Script Constraints

N/A — no migration or seed script in this epic. Tool seed script is in `docs/backlog/EPIC-tool-doctype.md`.

---

## Files to Modify

**Studio**
- `apps/studio/schemas/documents/person.ts` — EXTEND (add 7 new fields: headline, location, pronouns, expertise[], socialLinks[], featured, seo)

**Frontend**
- `apps/web/src/lib/queries.js` — add `personProfileQuery`, `projectDetailQuery`
- `apps/web/src/pages/PersonProfilePage.jsx` — CREATE
- `apps/web/src/pages/PersonProfilePage.module.css` — CREATE
- `apps/web/src/pages/ProjectDetailPage.jsx` — CREATE
- `apps/web/src/pages/ProjectDetailPage.module.css` — CREATE
- `apps/web/src/App.jsx` — reroute `/people/:slug` and `/projects/:slug`
- `apps/web/src/components/MetadataCard.jsx` — update author byline to link to `/people/:slug`
- `apps/web/src/pages/ArticlePage.jsx` — verify/update author rendering (read before editing)
- `apps/web/src/pages/NodePage.jsx` — verify/update author rendering (read before editing)
- `apps/web/src/pages/CaseStudyPage.jsx` — verify/update author rendering (read before editing)

**Scripts**
- `apps/web/scripts/validate-taxonomy.js` — EXTEND (5 new checks; do not recreate)

---

## Deliverables

1. **Person schema extension** — 7 new fields visible in person editor in Studio; existing person documents load without errors; Studio TypeScript check passes
2. **PersonProfilePage** — `/people/:slug` renders dedicated profile layout with image, name, headline, bio, social links, expertise chips, and content grouped by type using `ContentCard`
3. **ProjectDetailPage** — `/projects/:slug` renders dedicated detail page with color accent bar, status badge, and unified content timeline using `ContentCard`
4. **Author byline links** — "by [Name]" on article, node, and case study detail pages is a `<Link>` to `/people/:slug` when slug exists; plain text fallback when no slug; no duplicate render locations
5. **Extended validator** — `pnpm validate:taxonomy` runs all original 4 checks plus 5 new checks; exit codes correct

---

## Acceptance Criteria

- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors (document pre-existing errors before starting)
- [ ] Studio hot-reloads without errors; person editor shows all 7 new fields; no existing person document shows errors
- [ ] `/people/[any-existing-slug]` renders `PersonProfilePage`, not `TaxonomyPlaceholderPage`
- [ ] `PersonProfilePage` shows: profile image (or placeholder), name, headline, bio, social link icons, expertise chips; content sections only render when they have items
- [ ] Content items in `PersonProfilePage` link to their detail pages via `getCanonicalPath()` using `ContentCard`
- [ ] `/projects/[any-existing-slug]` renders `ProjectDetailPage`, not `TaxonomyPlaceholderPage`
- [ ] `ProjectDetailPage` color accent bar renders from `colorHex`; falls back gracefully if `colorHex` is null
- [ ] Unified content timeline on `ProjectDetailPage` shows a type badge distinguishing article/node/caseStudy
- [ ] Author byline on `/articles/:slug`, `/knowledge-graph/:slug`, `/case-studies/:slug` is a `<Link>` to `/people/:slug` when that person has a slug
- [ ] Plain text fallback renders when person has no slug — no broken links, no console errors
- [ ] No author name renders in more than one location on any detail page (no duplication from pre-EPIC-0146 code and new byline code coexisting)
- [ ] `pnpm validate:taxonomy` runs and reports all 9 checks (4 original + 5 new); exits 0 on warnings, 1 on errors
- [ ] `pnpm validate:urls` passes — no routes broken
- [ ] `pnpm validate:filters` passes — filter model unaffected
- [ ] **Enum coverage:** `socialLinks[].platform` display labels are built from the schema's `options.list` — raw stored values (`"linkedin"`, `"github"`) do not appear in the UI
- [ ] **Taxonomy rows (ProjectDetailPage):** if project content includes taxonomy chips, each type renders as its own labelled row

---

## Risks / Edge Cases

**Schema risks**
- [ ] `seo` field on person: does `person.ts` already import `seoMetadata`? Check `article.ts` for the import pattern before adding
- [ ] `socialLinks` array: does the platform enum include a value that collides with any existing `links[]` field kind enum? Read both before writing

**Query risks**
- [ ] `personProfileQuery` uses `references(^._id)` — requires that `authors[]` stores references (not strings). Verify `article.ts` `authors[]` field type before writing the query
- [ ] `projectDetailQuery` includes all three content types in one union — verify `node.ts` uses `slug` consistent with `getCanonicalPath()` expectations

**Render risks**
- [ ] Byline location: EPIC-0146 moved author metadata into `MetadataCard.jsx`. Read `ArticlePage.jsx`, `NodePage.jsx`, `CaseStudyPage.jsx` first — update the correct location; do not introduce a second author rendering
- [ ] Profile image: Sanity image URL builder requires `@sanity/image-url` — check if it is already used in the codebase before importing
- [ ] `PersonProfilePage` bio uses Portable Text — check how other pages render `body`/`bio` and follow the same pattern
- [ ] `colorHex` on `ProjectDetailPage`: null/undefined must not break inline style rendering; use a CSS variable fallback, not a hardcoded hex
- [ ] `socialLinks[].platform` enum values must be read from the schema file after extension — do not build label maps from this document
- [ ] **`project.ts` status enum**: read the schema before writing the status badge — do not assume values match article/node status values
