# Glossary: Term Definitions, Inline Annotations & Glossary Page

**Linear Issue:** [SUG-35](https://linear.app/sugartown/issue/SUG-35/glossary-term-definitions-inline-annotations-and-glossary-page)
**Status:** In Progress (Phase 1 shipped v0.26.13 — Phase 2 next)
**Priority:** Low (post-launch, high editorial value)
**Date logged:** 2026-03-26

---

## Why a Glossary Matters for Sugartown

Sugartown already has citations (MLA-style endnotes), a knowledge graph (nodes capturing *how decisions were made*), and a taxonomy system (tags, categories, tools, projects, people). What's missing is the **controlled vocabulary** — the layer that defines *what the words mean*.

A glossary is not a nice-to-have for a content-as-code portfolio. It's the editorial contract:
- **"Headless CMS"** appears in 12 articles — but what does Sugartown mean by it? The industry definition? A narrower operational definition?
- **"Design token"** is both a tag and a concept. The tag classifies; the glossary defines.
- **"Content model"** vs **"content architecture"** vs **"information architecture"** — three terms that overlap. The glossary disambiguates.

This fits the MLA/library thesis: citations reference *sources*, the knowledge graph captures *reasoning*, and the glossary defines *language*. Together they form a complete scholarly apparatus for a working portfolio.

---

## Design Exploration: Three Open Questions

### Q1. New doc type or extend `tag`?

**Recommendation: New `glossaryTerm` doc type.** Tags and glossary terms serve different purposes:

| | Tag | Glossary Term |
|---|-----|--------------|
| **Purpose** | Classification metadata — groups content | Editorial definition — explains a concept |
| **Lifecycle** | Created when needed for filtering | Authored deliberately as reference content |
| **Content** | Name + 200–300-char plain-text description (see Q4) | Name + rich definition (PortableText) + sources + related terms |
| **Audience** | Editors (which tag to apply) | Readers (what does this mean) |
| **URL** | `/tags/:slug` | `/glossary/:slug` |

Some terms will overlap with tags (e.g. "headless-cms" exists as both). The glossary term can reference the tag (and vice versa) without merging the types. This is the same pattern as nodes referencing tools — related but distinct.

### Q2. How do glossary terms relate to knowledge graph nodes?

Some nodes ARE terms. "Headless CMS" might be both a glossary entry and a knowledge graph node. But they serve different purposes:
- The **glossary entry** defines the term concisely (300 words max, reference-style)
- The **node** captures Sugartown's evolving thinking about the concept (conversation, decisions, status)

**Recommendation:** Cross-reference via `relatedContent[]` on glossary term (which accepts `node` among all other detail page types). The reverse direction — a node showing which glossary terms cite it — is a GROQ reverse lookup, not a separate field on `node`. Don't merge the types. A reader who wants "what is this?" goes to the glossary. A reader who wants "what does Sugartown think about this?" goes to the node.

### Q3. Inline visual treatment — what pattern?

**Industry patterns observed:**

| Pattern | Examples | Pros | Cons |
|---------|----------|------|------|
| **Link to glossary page** | MDN, Sanity.io | SEO-friendly, accessible, simple | Navigates away from content |
| **Dotted underline + tooltip** | Some technical docs | Quick context, no navigation | Accessibility nightmares on mobile |
| **Link + hover preview card** | Wikipedia Hovercards, GitHub | Best of both — preview + full page | Complex implementation |
| **Margin definitions** | Tufte CSS, academic journals | Scholarly aesthetic, content stays visible | Viewport-dependent, responsive complexity |
| **`<dfn>` semantic element** | W3C specs | Zero JS, assistive tech friendly | Minimal visual affordance alone |

**Recommendation:** **Pattern B+C** — glossary terms render as links to `/glossary/:slug` (solid baseline, SEO-friendly), styled with a **dotted underline** to distinguish from regular links. Progressive enhancement adds a **hover preview popover** (WCAG 1.4.13 compliant: dismissible via Escape, hoverable, persistent). First occurrence in an article uses `<dfn>` for semantic markup.

On mobile: tap navigates to the glossary page (no hover). The popover is desktop-only progressive enhancement.

### Q4. Existing taxonomy `description` fields — upgrade path?

**Current state:** All three taxonomy types already have a plain-text `description` field used for editor guidance:

| Type | Field type | Max length | Current purpose |
|------|-----------|-----------|-----------------|
| `tag` | `text` (2 rows) | 300 chars | "What does this tag mean and when should it be applied?" |
| `tool` | `text` (2 rows) | 300 chars | "What is this tool and when should it be tagged?" |
| `category` | `text` (3 rows) | 200 chars | "Brief description of what this category covers" |

These descriptions are editor-facing (Studio only) — they don't render on the frontend today. But they contain seed content that could bootstrap glossary definitions.

**Recommendation: Upgrade `description` to PortableText on all three taxonomy types.**

The current plain-text fields are undersized for reader-facing definitions and can't carry links, emphasis, or inline references. Upgrading to `summaryPortableText` (the same constrained PT config used elsewhere in Sugartown) would:

1. **Enable rich definitions** — links to related terms, inline code, emphasis for technical precision
2. **Surface on taxonomy detail pages** — `/tags/:slug`, `/tools/:slug`, `/categories/:slug` could render the definition as structured content instead of hiding it in Studio
3. **Feed the glossary** — for terms that overlap with tags (e.g. "headless-cms"), the `glossaryTerm` can pull its short definition from the tag's enriched description via reference, avoiding duplicate authoring
4. **Preserve backward compat** — existing plain-text values migrate cleanly into single-block PT (Sanity migration script: wrap each string in a `block` with a `span`)

**Migration path:**
- Phase 0 (pre-glossary): Rename field to `definition`, change type from `text` to `summaryPortableText`, run migration script to convert existing strings → PT blocks. Update `description` labels to "Definition — reader-facing explanation of this term". Increase Studio field height.
- Phase 1 (glossary launch): `glossaryTerm.relatedTag` / `relatedTool` references allow cross-linking. Taxonomy detail pages render the PT definition.
- Phase 3 (content enrichment): Authors review and enrich the migrated definitions with links, emphasis, and cross-references.

**What NOT to do:** Don't try to make tags *become* glossary terms. The taxonomy `description` → `definition` upgrade makes taxonomy pages better independently. The glossary system remains its own doc type with its own editorial workflow. The two systems cross-reference — they don't merge.

---

## Proposed Architecture

### Schema Layer (Sanity Studio)

**New document type: `glossaryTerm`**

```
glossaryTerm
├── term (string, required, max 80 chars) — the defined term
├── slug (slug, auto from term)
├── definition (summaryPortableText) — concise definition (target: 1-3 sentences)
├── extendedDefinition (standardPortableText) — optional deep-dive explanation
├── pronunciation (string, optional) — IPA or phonetic
├── abbreviation (string, optional) — if the term is an abbreviation (e.g. "CMS")
├── relatedTerms[] (references to glossaryTerm | tool | tag | category) — "see also" cross-references; includes taxonomy types so e.g. "design-tokens" term links directly to its tag and tool equivalents
├── relatedContent[] (references to article | caseStudy | node | page | person | project | tool) — manually curated content using or exemplifying this term; all detail page types, no archive pages
├── sources[] (array of objects: text + url) — attribution for definition
├── seo (seoMetadata object) — standard SEO fields
└── categories[] (references to category) — topical grouping
```

**Bidirectionality:** Relations are written on `glossaryTerm` and surfaced in both directions via GROQ reverse lookups at read time — no duplicate fields on the target type. `relatedTerms` and `relatedContent` are the single source of truth; the reverse direction is a computed query.

- On a `tag`, `tool`, or `category` detail page: `*[_type == "glossaryTerm" && references(^._id)]` surfaces any glossary terms that link to this taxonomy item.
- On an `article`, `caseStudy`, `node`, `page`, `person`, `project`, or `tool` detail page: the same reverse query surfaces glossary terms that cite this content as an example — distinct from `glossaryTermRef` PT annotations which are inline usage.

This means no schema changes are needed on existing doc types to enable the reverse direction.

**New PT annotation: `glossaryTermRef`**

Added to `portableTextConfig.ts` → `standardPortableText` annotations:

```ts
{
  name: 'glossaryTermRef',
  type: 'object',
  title: 'Glossary Term',
  icon: BookOpenIcon,
  fields: [
    {
      name: 'term',
      type: 'reference',
      to: [{ type: 'glossaryTerm' }],
      title: 'Term',
    },
  ],
}
```

In Studio, editors select text → click "Glossary Term" annotation → pick from glossary terms. Same UX as adding a citation reference.

### Query Layer (GROQ)

**New fragment:**
```groq
GLOSSARY_TERM_FRAGMENT = `
  _id,
  term,
  "slug": slug.current,
  "definition": definition[0..1],  // first block only for preview
`
```

**Glossary archive query:**
```groq
*[_type == "glossaryTerm"] | order(lower(term) asc) {
  _id,
  term,
  "slug": slug.current,
  definition,
  abbreviation,
  "relatedTerms": relatedTerms[]->{_id, term, "slug": slug.current},
  "categories": categories[]->{_id, name, "slug": slug.current}
}
```

**Glossary detail query:**
```groq
*[_type == "glossaryTerm" && slug.current == $slug][0] {
  ...,
  definition,
  extendedDefinition,
  pronunciation,
  abbreviation,
  // relatedTerms: glossaryTerm | tool | tag | category — coerce name/term to "label"
  "relatedTerms": relatedTerms[]-> {
    _id, _type,
    "label": select(_type == "glossaryTerm" => term, name),
    "slug": slug.current
  },
  // relatedContent: all detail page types — coerce title/name/term to "title"
  "relatedContent": relatedContent[]-> {
    _id, _type,
    "title": select(
      _type == "glossaryTerm" => term,
      _type in ["tag","category","tool","person","project"] => name,
      title
    ),
    "slug": slug.current
  },
  sources,
  "categories": categories[]->{_id, name, "slug": slug.current},
  // usedIn: content that has a glossaryTermRef PT annotation referencing this term
  "usedIn": *[
    _type in ["article", "caseStudy", "node", "page"]
    && references(^._id)
  ] | order(coalesce(title, term, name) asc) [0..20] {
    _id, _type,
    "title": coalesce(title, term, name),
    "slug": slug.current
  }
}
```

**Reverse lookup fragment** (add to article, node, caseStudy, person, project, tool, tag, category detail queries):
```groq
// On any detail page — surfaces glossary terms that link to this doc
"glossaryTerms": *[_type == "glossaryTerm" && references(^._id)] | order(term asc) {
  _id, term, "slug": slug.current,
  "definition": definition[0..0]
}
```

**Inline annotation expansion** — add to all content detail queries (article, caseStudy, node):
```groq
// Inside sections[] or content[] projection, the glossaryTermRef mark
// needs the term's slug for linking and definition for preview
// This is handled by expanding the reference in the PT serializer at runtime
```

### Render Layer (React)

**Three new surfaces:**

1. **`GlossaryArchivePage.jsx`** — `/glossary`
   - A-Z jump navigation (letter links at top)
   - `<dl>` / `<dt>` / `<dd>` semantic markup
   - Each term: name as link to `/glossary/:slug`, abbreviation badge, short definition
   - Category filter chips (optional)
   - JSON-LD: `DefinedTermSet` with all terms

2. **`GlossaryTermPage.jsx`** — `/glossary/:slug`
   - Term as `<h1>`, pronunciation, abbreviation
   - Definition rendered as PortableText
   - Extended definition (collapsible or below fold)
   - Related terms as linked chips — glossaryTerm, tool, tag, and category refs all render as chips; use existing `Chip` DS primitive, link to appropriate detail page via `getCanonicalPath()`
   - Related content as linked list — all relatedContent[] entries, typed badge per `_type` (same `doc-type-badge` pattern as "used in")
   - "Used in" back-references (content with inline `glossaryTermRef` PT annotation — articles, case studies, nodes, pages)
   - Sources list (MLA-style attribution)
   - JSON-LD: `DefinedTerm` with `inDefinedTermSet`

3. **`GlossaryTermAnnotation`** — inline PT mark renderer
   - Renders as `<a>` with `href="/glossary/:slug"` and class `glossaryLink`
   - CSS: dotted underline, slightly different color from regular links
   - First occurrence wraps in `<dfn>` element
   - Hover: popover with term + short definition + "Read more →" link
   - Popover: WCAG 1.4.13 compliant (Escape to dismiss, hoverable, persistent until blur)
   - Mobile: no popover, just link navigation

### Structured Data (SEO)

**Glossary archive page JSON-LD:**
```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "name": "Sugartown Glossary",
  "description": "Key terms and concepts used across Sugartown Digital",
  "url": "https://sugartown.io/glossary",
  "hasDefinedTerm": [
    {
      "@type": "DefinedTerm",
      "name": "Headless CMS",
      "description": "A content management system that...",
      "url": "https://sugartown.io/glossary/headless-cms"
    }
  ]
}
```

**Individual term page JSON-LD:**
```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "name": "Headless CMS",
  "description": "A content management system that...",
  "url": "https://sugartown.io/glossary/headless-cms",
  "inDefinedTermSet": {
    "@type": "DefinedTermSet",
    "name": "Sugartown Glossary",
    "url": "https://sugartown.io/glossary"
  }
}
```

---

## Visual Treatment: The Dotted Line

The glossary link visual treatment is central to the editorial identity:

```
Regular link:     solid underline, brand pink on hover
Citation ref:     superscript [n] pill, no underline
Glossary term:    dotted underline, muted color, popover on hover
```

This creates a visual hierarchy of reference types within body content — exactly the kind of typographic precision an MLA/academic site should have. A reader learns: solid underline = navigation, superscript = citation, dotted underline = definition.

**CSS token audit required at implementation:** Before adding any `--st-glossary-*` tokens, verify that `--st-card-bg`, `--st-color-border-default`, `--st-color-text-muted`, and `--st-color-brand-primary` don't already cover all needs. New tokens are only justified if the glossary treatment requires a value that differs from existing tokens in both light and dark mode. The mock uses no new tokens — the implementation should match that constraint.

---

## Phased Delivery

### Phase 0 — Taxonomy Definition Upgrade _(deferred — not blocking Phase 1)_

> **Decision (2026-06-09):** Phase 0 was scoped as a pre-glossary taxonomy upgrade but was not needed to ship Phase 1. Deferred indefinitely — taxonomy `description` fields remain plain text for now.

### Phase 1 — Schema + Archive Page ✅ Shipped v0.26.13 (2026-06-09)

- [x] `glossaryTerm` document type in Studio
- [x] GROQ queries + fragments
- [x] `/glossary` archive page with A-Z filter nav
- [x] `/glossary/:slug` term detail page
- [x] Route registration in App.jsx + routes.js
- [x] DefinedTerm/DefinedTermSet JSON-LD
- [ ] Seed 10-15 foundational terms — **pending: no `glossaryTerm` docs in Sanity yet**

**Reuse consolidation (added to Phase 1 during SUG-159, 2026-06-09):**
- [x] `AlphaFilter` replaces custom `.azNav` — **filter mode** (hides other letters), not jump-scroll anchors as originally specced. Decision: consistent with tags page pattern, simpler.
- [x] DS `Chip` with `featured` prop replaces custom `.filterChip` / `.filterChipActive` for category filter row
- [x] `LetterSectionHeader` new shared component (`components/LetterSectionHeader.jsx`) replaces `.letterAnchor` inline div
- [x] `PageHeader` replaces raw `<header>` masthead on `ArchivePage.jsx` and `SiteGraphPage.jsx` — dead `.masthead` / `.archiveHeading` / `.archiveHeadingItalic` CSS removed from `pages.module.css`
- [x] `archivePageWide` CSS class applied to glossary (full-width layout at `--st-width-detail-wide`)

### Phase 2 — Inline Annotations (the magic)
- `glossaryTermRef` PT annotation in Studio
- PT mark renderer in all three serializer files
- Dotted underline CSS treatment
- Hover preview popover (desktop progressive enhancement)
- `<dfn>` semantic wrapping for first occurrence
- WCAG 1.4.13 compliance testing

### Phase 3 — Content Authoring + Cross-References
- Author definitions for 30+ terms from existing tag/tool descriptions
- Add `glossaryTermRef` annotations to 5-10 key articles
- Wire `relatedTerms[]` and `relatedContent[]` on seed terms
- Add reverse lookup fragment to article, node, caseStudy, person, project, tool, tag, and category detail queries — each page can then surface "Defined in glossary: [term]" when a glossaryTerm references it
- Add glossary link to Library nav dropdown (confirmed placement)

---

## Seed Terms (starting vocabulary)

Terms that already appear across multiple articles and would benefit from authoritative definitions:

| Term | Current tag? | Current node? | Priority |
|------|-------------|--------------|----------|
| Headless CMS | Yes (`headless-cms`) | No | High |
| Design system | Yes (`design-system`) | No | High |
| Content model | Yes (`content-model`) | No | High |
| Structured content | Yes (`structured-content`) | No | High |
| Design tokens | Yes (`design-tokens`) | No | High |
| Composable architecture | Yes (`composable`) | No | High |
| Atomic design | Yes (`atomic-design`) | No | Medium |
| Content operations | Yes (`content-ops`) | No | Medium |
| Monorepo | Yes (`monorepo`) | No | Medium |
| Knowledge graph | Yes (`knowledge-graph`) | Related | Medium |
| GROQ | Related (`groq` label) | No | Medium |
| Portable Text | No | No | Medium |
| Content-as-code | Yes (`content-as-code`) | No | Medium |
| Information architecture | Related | No | High |
| Semantic versioning | Yes (`semver`) | No | Low |

---

## Industry References

| Site | Pattern | Takeaway |
|------|---------|----------|
| **MDN Web Docs** | `/Glossary/` with individual pages per term, inline linking from articles | Gold standard for technical glossaries. Each term is an SEO page. |
| **Sanity.io** | `/glossary/` with full content pages per term | CMS vendor using glossary as SEO strategy — "what is headless CMS" pages rank. |
| **Wikipedia** | Inline links + Hovercards (hover preview) | Best UX for inline term context without leaving the article. |
| **Schema.org** | `DefinedTerm` + `DefinedTermSet` types | Structured data support for glossary content. Google can surface in rich results. |
| **Tufte CSS** | Margin notes for definitions | Beautiful academic aesthetic but viewport-dependent. Inspiration for visual treatment. |
| **Digital.gov** | A-Z alphabetical jump nav, plain-language definitions | Accessibility-first government glossary pattern. |

---

## Relationship to Existing Sugartown Systems

```
Citations (EPIC-0169)          Glossary (SUG-35)           Knowledge Graph
  ↓                               ↓                            ↓
"Who said this?"              "What does this mean?"       "What do we think about this?"
  ↓                               ↓                            ↓
Endnote [n] superscript      Dotted underline link         Full node page
  ↓                               ↓                            ↓
Source attribution            Term definition               Decision record
```

Three reference types, three visual treatments, three editorial purposes. The glossary completes the scholarly trifecta.

---

## Not in Scope

- **Automatic term detection** — no AI scanning content to suggest glossary links. Annotations are manual editorial choices.
- **Full-text search** within glossary — defer to site-wide search epic (SUG-36)
- **Studio autocomplete** — no inline term suggestion while typing in PT editor. Could be a Sanity plugin enhancement later.
- **Glossary versioning** — definitions don't track historical changes (unlike nodes which have status/evolution)
- **Multi-language glossary** — single-language site

---

## AEO Cross-Reference (SUG-58)

**JSON-LD is in scope for this epic.** The `DefinedTerm` and `DefinedTermSet` JSON-LD (already documented in the Structured Data section above) should use the `generateJsonLd()` utility from SUG-58 if it has shipped. If SUG-35 ships first, implement the JSON-LD inline and refactor to the shared utility when SUG-58 lands.

Glossary pages are the single highest-value AEO surface for Sugartown. Each term page is an indexable ~250-word entity page with structured definitions that AI search engines can extract directly.

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-35-glossary.md` → `docs/shipped/SUG-35-glossary.md`
2. Commit: `docs: ship SUG-35 Glossary`
3. Run `/mini-release SUG-35 Glossary`
4. Transition SUG-35 to **Done** in Linear
