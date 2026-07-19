# Sugartown Ontology Map — reverse-engineered reference-edge spec

**Status:** Draft — SUG-222 Phase 0 deliverable
**Owner:** SUG-222 (glossary category display), feeding SUG-221 (Rules & Tools Audit)
**Date:** 2026-07-19

---

## What this is

Sugartown's content ontology — which document types point at which, through which fields, and how far each connection actually got toward a reader — was never written down. It accreted epic by epic. This is the spec that would have preceded the build: every document type and taxonomy primitive as a node, every reference field as an edge, and for each edge, an honest answer to "does this actually work."

**This is not a field inventory.** SUG-163's content-model codegen (`/platform/design-system/content-models`, 11 types / 176 fields) and the `SchemaERD` component already catalogue schema *structure*. This map catalogues *intent and coverage* — of the edges that exist in schema, which ones a GROQ query actually dereferences, and of those, which ones a page component actually renders as something a reader can see or click.

**Trigger:** publishing the "Clicky Burden" Bextionary glossary term (2026-07-17) surfaced a category chip that led nowhere useful — the edge existed in schema and data, a query dereferenced it, but the destination page's *own* query excluded the source type, so it reported "no content" while holding 9 terms. That specific pattern — schema-complete, partially query-supported, not displayed — is exactly what this map exists to catch before the next screenshot finds it.

### Coverage tiers

| Tier | Meaning |
|---|---|
| 🔴 **schema-only** | Field exists in a schema file. No GROQ query in `queries.js` dereferences it (or it returns a raw `_ref` with no expansion). |
| 🟡 **query-supported** | A GROQ query dereferences the field (`field->` or `field[]->`) — data is fetched and shaped — but no page or component visibly renders it. |
| 🟢 **displayed** | A real page or component renders the dereferenced data as visible content (chip, list, link, section). Named below. |
| ⚫ **orphaned** | The *source document type itself* has no query coverage — every field on it is moot regardless of tier, because nothing ever fetches the document. |

### Methodology

Every edge below was sourced directly from `apps/studio/schemas/documents/*.ts`, `apps/studio/schemas/objects/*.ts`, `apps/web/src/lib/queries.js`, and the consuming page/component files — not from a prior audit doc or memory (per the repo's verify-before-citing convention; a stale reference in a convention doc becomes the next session's false starting assumption — see SUG-192). An initial exhaustive pass was run by a research agent across every schema file; the highest-stakes and most surprising claims were independently re-verified by direct grep/read before being recorded here. One correction came out of that verification pass and is noted inline (`siteSettings.footerColumns`). Three edges the agent flagged as uncertain (`richImage.link.internalRef` in body PT, `cardBuilderItem.body` glossary-popover wiring, `project.categories`/`project.tags` render status) were resolved: the `project.categories`/`tags` case is confirmed **displayed** (verified below); the other two remain flagged **unconfirmed** in the gap register rather than stated as fact.

---

## Nodes

**Core content types** — article, node, caseStudy, page, series, archivePage

**Taxonomy primitives** (all keyed on `name`, not `title` — see `docs/conventions/token-naming.md` / MEMORY.md taxonomy-architecture entry) — category, tag, tool, person, project

**Vocabulary** — glossaryTerm (self-referencing via `relatedTerms`; also a PT annotation target via `glossaryTermRef`)

**Site structure / config** — siteSettings, navigation, ctaButtonDoc, preheader

**Deprecated / orphaned** (registered in Studio, zero or near-zero query coverage) — post, header, footer, hero, homepage, contentBlock

---

## Edge outline (by source type)

### article
- `series` → series · single · 🟢 displayed (PageSidebar series nav)
- `related[]` → node \| article \| caseStudy · array · 🟢 displayed (PageSidebar "Related")
- `authors[]` → person · array · 🟢 displayed (MetadataCard byline)
- `projects[]` → project · array · 🟢 displayed (TaxonomyChips)
- `tools[]` → tool · array · 🟢 displayed (MetadataCard/TaxonomyChips, AI-disclosure assembly)
- `categories[]` → category · array · 🟢 displayed (TaxonomyChips, featured category)
- `tags[]` → tag · array · 🟢 displayed (first tag = featured-tag rubric)
- `relatedTerms[]` → glossaryTerm · array · 🟢 displayed (merged with inline PT terms in MetadataCard)
- `relatedProjects[]` → project · array · 🟡 query-supported — deprecated, superseded by `projects[]`, queried but not distinctly consumed

### caseStudy
- Same shape as article: `series`, `authors[]`, `projects[]`, `tools[]`, `categories[]`, `tags[]`, `relatedTerms[]`, `related[]` — all 🟢 displayed
- `relatedProjects[]` → project · 🟡 query-supported — deprecated, superseded by `projects[]`

### node
- Same shape as article: `series`, `authors[]`, `projects[]`, `tools[]`, `categories[]`, `tags[]`, `relatedTerms[]`, `related[]` — all 🟢 displayed
- `relatedProjects[]` → project · 🟡 query-supported — deprecated, superseded by `projects[]`

### page
- `authors[]` → person · single-array · 🟢 displayed
- `tools[]` → tool · array · 🟢 displayed (AI disclosure block)
- `series` → series · single · 🟢 displayed
- `parent` → page (self-ref) · single · 🔴 schema-only — Studio-preview only (`parent.title`); "URL nesting" mentioned in the field description is not implemented in web queries
- `categories[]` → category · array · 🔴 schema-only — field exists, `pageBySlugQuery` omits it entirely (verified directly against the live query)
- `tags[]` → tag · array · 🔴 schema-only — same, omitted from `pageBySlugQuery`
- `projects[]` → project · array · 🔴 schema-only — field is Studio-`hidden: true` **and** unprojected
- `related[]` → node \| article \| caseStudy · array · 🔴 schema-only — schema comment names this a known SUG-210 gap: field only, no GROQ projection, no rendering
- `relatedTerms[]` → glossaryTerm · array · 🔴 schema-only — same SUG-210 gap as `related[]`

### series
- `parts[]` → article \| node \| caseStudy \| page · array · 🟢 displayed (SeriesPage part list); `seriesBySlugQuery` also runs a reverse GROQ lookup (`series._ref == ^._id`) as a fallback, so `content.series → series` is effectively bidirectional at query time even though only one direction is a stored field

### person
- `expertise[]` → category · array · 🟢 displayed ("Expertise" chips, link to `/categories/:slug`)
- *(incoming, computed, not a stored field)* article/node/caseStudy `.authors[]` → person, resolved via `references(^._id)` in `personProfileQuery` · 🟢 displayed

### project
- `tools[]` → tool · array · 🟢 displayed
- `categories[]` → category · array · 🟢 displayed (confirmed: `ProjectDetailPage.jsx` passes `project.categories` into its taxonomy-chip render — the earlier automated pass had flagged this "unknown"; direct grep confirms it renders)
- `tags[]` → tag · array · 🟢 displayed (same confirmation)
- *(incoming, Studio decoration)* article/node/caseStudy → project via `defineIncomingReferenceDecoration` ("Assigned content" panel), bidirectional write-back into `projects[]` on link
- *(incoming, computed)* article/node/caseStudy backrefs rendered as ContentList on `ProjectDetailPage` · 🟢 displayed

### tool
- *(incoming, Studio decoration)* article/node/caseStudy → tool, "Assigned content" panel
- *(incoming, computed)* article/node/caseStudy backrefs → ContentList on `ToolDetailPage` · 🟢 displayed

### category — **the edge this epic exists to fix**
- *(incoming, Studio decoration)* article, node, caseStudy → category, "Assigned content" panel, bidirectional write-back — **glossaryTerm is not in this decoration's `types` list**, so a category document's own Studio view has no way to show which glossary terms reference it
- *(incoming, from glossaryTerm)* see glossaryTerm row below

### tag
- *(incoming, Studio decoration)* article, node, caseStudy, **project** → tag, "Assigned content" panel (tag's decoration list is the one taxonomy primitive that includes `project` alongside article/node/caseStudy)

### glossaryTerm
- `categories[]` → category · array · 🟡 **query-supported, not displayed as intended** — `glossaryTermBySlugQuery` dereferences this and `GlossaryTermPage.jsx` renders it as a chip linking via `getCanonicalPath({docType:'category', slug})` to `/categories/:slug`. **The chip itself is not a dead link** (it correctly uses the URL Authority pattern) — but the destination page's own content query (`contentByTaxonomyQuery`, see below) excludes `glossaryTerm` from its `_type in [...]` list, so the category page renders "No content associated with this category yet" even when 9+ terms reference it. This is the compound failure: display-layer chip is correct, cross-type query enumeration is the actual gap. **Gap register entry #1.**
- `relatedTerms[]` → glossaryTerm (self-ref) · array · 🟢 displayed — schema comment describes this as bidirectional ("adding a term here also adds this term to the target's Related Terms on publish"); the reciprocal-write mechanism is not in the schema files reviewed (likely a Studio document action or Sanity Function outside `schemas/`) — noted, not verified here
- `relatedTags[]` → tag · array · 🟢 displayed
- `relatedTools[]` → tool · array · 🟢 displayed
- `relatedContent[]` → article \| caseStudy \| node \| page \| person \| project \| tool (6 named subtypes) · array · 🟢 displayed via RefRows
- *(annotation target)* `glossaryTermRef` markDef in Portable Text bodies → glossaryTerm · 🟢 displayed where wired (see PT annotation section below) — this is the mechanism SUG-216 fixed for `calloutSection.body`

### siteSettings
- `primaryNav` → navigation · single · 🟢 displayed (Header desktop/mobile nav; Footer also reuses `primaryNav.items`, not `footerColumns`, for its nav columns)
- `headerCta` → ctaButtonDoc · single · 🟢 displayed
- `preheader` → preheader · single · 🟢 displayed
- `footerColumns[]` → navigation · array · 🟢 displayed — **correction from the initial automated pass**, which flagged this as a fully dead edge because `Footer.jsx` never reads it. Direct verification found it *is* consumed — by `DrawerNav.jsx` (the mobile drawer menu), which `Header.jsx` passes it into. Desktop footer and mobile drawer use different nav sources; the edge is real, just not where the first pass looked.
- `footerToolchain[]` → tool · array · 🟢 displayed (Footer tool-chip colophon)

### Portable Text annotations (shared `portableTextConfig`, used across `content[]`/`body[]`/`description[]` fields wherever `standardPortableText`/`summaryPortableText`/`compactPortableText` appear)
- `markDefs.link.internalRef` → page \| article \| caseStudy \| node \| archivePage · 🟢 displayed — the most-reused edge in the schema; resolved via `PT_CONTENT_PROJECTION` and rendered as inline `<a>` by the PortableText serializer components
- `markDefs.glossaryTermRef.term` → glossaryTerm · 🟢 displayed where the containing query includes `PT_CONTENT_PROJECTION` (double-projected: once inline via the markDef, once hoisted to a top-level `inlineTerms` array on article/node/caseStudy queries) — rendered as the dotted-underline hover popover; also the SUG-216 fix point for `calloutSection.body`
- `markDefs.citationRef` — not a reference edge; holds only a numeric footnote index, resolved against a plain-text `citations[]` array

### Internal-link primitive (`linkItem.internalRef`, used by nav items, CTA buttons, gallery images, card builder titles/citations)
- → page \| article \| caseStudy \| node \| archivePage · single · 🟢 displayed — reused across `navItem`, `childNavItem`, `ctaButton`, `cardBuilderItem.titleLink`, `cardBuilderItem.citations[].link`, `galleryImage.link`, `ctaButtonDoc.link`, `preheader.link`

---

## Deprecated / orphaned types — not in the active ontology

These are registered Studio document types with schema-level reference fields that go nowhere on the web, either because the whole type is unqueried or because it was explicitly superseded:

- **`post`** ⚫ orphaned — zero query coverage in `queries.js` (confirmed via grep for `_type == "post"` — no hits). Superseded by `article` per the post → article rename (see MEMORY.md); still carries `authors[]`, `categories[]`, `tags[]`, `projects[]`/`relatedProjects[]` reference fields, all moot.
- **`homepage`** ⚫ orphaned — whole singleton doc type unqueried; its `cards[]` (editorialCard) fields carry no document references anyway (plain URL objects).
- **`header`**, **`hero`**, **`contentBlock`** ⚫ orphaned — superseded by `siteSettings`/`page` sections; no reference-shaped fields of consequence.
- **`footer`** ⚫ orphaned — superseded by `siteSettings.footerColumns` + `primaryNav`; its own `navColumn.links[]`/`socialLinks[]` are URL strings, not document references.

These are flagged for the SUG-221 Rules & Tools Audit housekeeping pass, not remediated here (out of SUG-222 scope — display work, not schema cleanup).

---

## Mermaid — core content ↔ taxonomy graph

Deliberately scoped to the **active** ontology (excludes the orphaned cluster above, which would only add noise). Solid arrows = 🟢 displayed. Dashed arrows = 🟡 query-supported or 🔴 schema-only (labelled). Dotted = incoming/computed backreference.

```mermaid
graph LR
  article[article]
  node[node]
  caseStudy[caseStudy]
  page[page]
  series[series]
  glossaryTerm[glossaryTerm]
  category[category]
  tag[tag]
  tool[tool]
  person[person]
  project[project]

  article -->|categories| category
  article -->|tags| tag
  article -->|tools| tool
  article -->|projects| project
  article -->|authors| person
  article -->|relatedTerms| glossaryTerm
  article -.->|series| series

  node -->|categories| category
  node -->|tags| tag
  node -->|tools| tool
  node -->|projects| project
  node -->|authors| person
  node -->|relatedTerms| glossaryTerm
  node -.->|series| series

  caseStudy -->|categories| category
  caseStudy -->|tags| tag
  caseStudy -->|tools| tool
  caseStudy -->|projects| project
  caseStudy -->|authors| person
  caseStudy -->|relatedTerms| glossaryTerm
  caseStudy -.->|series| series

  page -->|tools| tool
  page -->|authors| person
  page -.->|series| series
  page -.->|"categories 🔴 schema-only"| category
  page -.->|"tags 🔴 schema-only"| tag
  page -.->|"related/relatedTerms 🔴 schema-only"| glossaryTerm

  glossaryTerm -->|categories, query-supported only| category
  glossaryTerm -.->|"🟡 chip links but destination excludes glossaryTerm"| category
  glossaryTerm -->|relatedTags| tag
  glossaryTerm -->|relatedTools| tool
  glossaryTerm -->|relatedTerms self-ref| glossaryTerm

  person -->|expertise| category

  category -.->|incoming: assigned content| article
  category -.->|incoming: assigned content| node
  category -.->|incoming: assigned content| caseStudy
  project -.->|incoming: assigned content| article
  project -.->|incoming: assigned content| node
  project -.->|incoming: assigned content| caseStudy
  tag -.->|incoming: assigned content| project
```

*(Note: the `glossaryTerm → category` edge is drawn twice deliberately — once as the schema/query edge that exists, once annotated with the specific failure mode this epic fixes. Mermaid doesn't have a clean way to show "half-works" on one arrow.)*

---

## Gap register

Every edge whose coverage tier falls short of plausible intent. Severity is about reader-facing impact; effort is a rough sizing for a future epic, not a commitment. This register is a standing input to SUG-221 Rules & Tools Audit cycles — re-tier on each audit pass rather than letting it go stale.

| # | Edge | Tier found | Tier expected | Severity | Effort | Note |
|---|---|---|---|---|---|---|
| 1 | `glossaryTerm.categories[] → category`, consumed at `/categories/:slug` | 🟡 chip displayed, destination query excludes glossaryTerm | 🟢 fully displayed | **High** | Medium | **This epic's core fix.** `contentByTaxonomyQuery` and all four taxonomy count queries (`allCategoriesQuery`, `allTagsQuery`, `allToolsQuery`, `allProjectsQuery`) use `_type in ["article","node","caseStudy"]` with no `glossaryTerm`. Category page currently false-reports empty for Bextionary (9 terms). |
| 2 | `page.related[]`, `page.relatedTerms[]` → node/article/caseStudy, glossaryTerm | 🔴 schema-only | 🟢 displayed | Medium | Small | Pre-existing named gap (SUG-210 comment in the schema file itself). Not in SUG-222 scope; flagged for its own pickup. |
| 3 | `page.categories[]`, `page.tags[]`, `page.projects[]` → category/tag/project | 🔴 schema-only (`projects[]` also Studio-hidden) | Unclear — may be intentional (pages are structural, not taxonomy-classified content) | Low | — | Needs an intent decision before it's a "gap" at all — record, don't schedule. |
| 4 | `category` incoming-reference decoration `types[]` | excludes `glossaryTerm` | includes `glossaryTerm` | Medium | Small | Studio-side mirror of gap #1 — even after the frontend fix, a category doc's own "Assigned content" panel in Studio still won't show linked glossary terms unless this decoration list is extended. `project`, `tool` decorations have the same exclusion. |
| 5 | `richImage.link.internalRef` inside Portable Text body content | **Unconfirmed** — flagged by automated inventory pass, not independently verified | 🟢 displayed (parity with `markDefs.link`) | Unknown until verified | Small (if real) | `PT_CONTENT_PROJECTION` explicitly resolves `markDefs.link.internalRef` and `markDefs.glossaryTermRef.term` but appears to only special-case `richImage` for image dimensions, not link resolution. Needs a direct check against a real document with a linked `richImage` in body content before treating as a confirmed bug. |
| 6 | `cardBuilderItem.body[]` glossary-popover wiring for nested `glossaryTermRef` marks | **Unconfirmed** | 🟢 displayed (parity with top-level sections) | Unknown until verified | Small (if real) | The shared `PT_CONTENT_PROJECTION` is used, so data should resolve; whether `CardBuilderSection.jsx`'s PortableText renderer actually invokes the glossary-popover component for this specific nested context wasn't confirmed by reading the component. |
| 7 | `article/node/caseStudy.relatedProjects[]` → project | 🟡 query-supported, superseded | — (intentionally deprecated) | Low | — | Not a gap — a known-deprecated field kept for backward compat, per existing convention. Listed for completeness so it isn't mistaken for an unnoticed gap later. |
| 8 | `post`, `homepage`, `header`, `hero`, `footer`, `contentBlock` document types | ⚫ orphaned | — (superseded) | Low (housekeeping) | Medium (multi-type) | Not a display gap — a registry-cleanup item. Feeds SUG-221's housekeeping pass, not a display epic. |

---

## Cross-references

- Structure inventories this map builds on, not duplicates: SUG-163 content-model codegen (`/platform/design-system/content-models`, 11 types / 176 fields), `SchemaERD` component, `docs/conventions/schema-conventions.md`.
- Feeds: SUG-221 Rules & Tools Audit (gap register as a standing re-tiering input; orphaned-type cluster as a housekeeping candidate).
- Planned follow-on (not this epic): a Bex-voice article on reverse-engineering your own ontology, and this map's Mermaid diagram graduating to a `/platform` page via `mermaidSection`, per SUG-166 → SUG-168/169 precedent. Both spin out at this epic's close-out.
