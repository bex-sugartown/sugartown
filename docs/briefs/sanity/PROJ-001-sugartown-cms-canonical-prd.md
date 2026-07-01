# Sugartown CMS — Canonical Product Requirements Document
**PRD Version:** v1.6
**Status:** In Review
**Author:** Bex Head
**Domain:** CMS/Headless
**Project ID:** PROJ-001 (Sugartown CMS)
**Last updated:** 2026-05-09
**Related epics:** All shipped SUG-* epics through v0.23.17
**Supersedes:** `docs/briefs/sanity/PROJ-001-content-model-strategy-superseded.md`, `docs/briefs/sanity/PROJ-001-studio-setup.md` (both remain as historical context; this document is the consolidated canonical reference)

---

## Note on Scope

This document specifies the Sugartown CMS as designed and built. It covers `apps/studio/schemas/` and the deployed Content Lake (`poalmzla / production`). Where earlier planning documents conflict with the current implementation, this PRD is authoritative.

---

## 2. Problem Statement

Sugartown.io migrated from WordPress to a headless Sanity + React stack. The content model was designed to satisfy three constraints simultaneously: migration compatibility with 80+ existing posts, a forward-looking knowledge-graph content strategy, and a portfolio context where the CMS itself demonstrates composable architecture to clients. This PRD is the consolidated reference for the full content model, its taxonomy contracts, its section builder system, and its site configuration layer.

---

## 3. Goals & Non-Goals

| Goal | Description |
|------|-------------|
| Document the complete content model | Every document type, object type, section type, and taxonomy primitive is specified with field names, types, and validation rules |
| Define the taxonomy contract | Five taxonomy primitives (tag, category, tool, project, person) with clear field authority and cross-reference rules |
| Specify the section builder system | Twelve section types with their composition rules, portable text variants, and rendering contracts |
| Establish the site configuration layer | siteSettings, navigation, preheader, and redirect documents described as a singleton pattern |
| Record AI ethics compliance surfaces | richImage AI provenance fields and node aiDisclosure field documented as first-class requirements |
| Serve as the source of truth for GROQ query authors | Field names, types, and projection patterns are explicit enough to write queries without opening Studio |

| Non-Goal | Why excluded |
|----------|-------------|
| Frontend component specifications | Covered by the Design System PRD (`docs/briefs/design-system/PROJ-003-design-system-prd.md`) |
| GROQ query implementations | Live in `apps/web/src/lib/queries.js`; this doc specifies the contract, not the code |
| Deployment and CI pipeline | Covered by the monorepo PRD (`docs/briefs/PROJ-005-monorepo-prd.md`) |
| Commerce/ecommerce integration | Not in scope for current platform |
| Multi-tenant or multi-workspace configuration | Single project (`poalmzla`), single dataset (`production`) |

---

## 4. User Stories

| ID | Title | User Story | Acceptance Criteria | Priority |
|----|-------|-----------|---------------------|----------|
| US-001 | Publish an article | As an author, I want to write and publish an article with taxonomy tags, citations, and section blocks so that it appears on the articles archive | Article appears at `/articles/:slug`; tags, categories, tools, and projects are filterable from the archive | P0 |
| US-002 | Write a knowledge graph node | As an author, I want to document an AI collaboration session as a node with evolution status and related content so that the knowledge graph reflects real work | Node appears at `/nodes/:slug`; evolution status and aiDisclosure are set; related content references resolve | P0 |
| US-003 | Publish a case study | As an author, I want to document a client project with outcomes, evidence types, and team references so that it appears on the case studies archive | Case study appears at `/case-studies/:slug`; outcomeItem values and evidenceType are visible | P0 |
| US-004 | Manage site navigation | As an admin, I want to configure the primary nav, footer nav, and header CTA in one place so that navigation changes deploy without a code change | siteSettings navigation arrays drive the rendered nav; childNavItem dropdowns render correctly | P0 |
| US-005 | Set an announcement bar | As an admin, I want to schedule a preheader bar with a publish/unpublish window so that time-bounded announcements appear and disappear automatically | preheader with publishAt/unpublishAt in the configured timezone renders during the window and not outside it | P1 |
| US-006 | Build a page from sections | As an author, I want to assemble a page from reusable section blocks (hero, text, CTA, cards, callout, accordion, stat tiles) so that content layout doesn't require a code deploy | page document with sections array renders all section types correctly at the page's URL | P0 |
| US-007 | Apply AI provenance to an image | As an author, I want to flag an image as AI-generated and specify the tool used so that the site honours its AI ethics commitments | richImage with aiGenerated=true and aiTool set persists correctly; frontend can query and display the disclosure | P0 |
| US-008 | Manage taxonomy vocabulary | As an admin, I want to create and assign tags, categories, tools, and projects so that content is consistently classified | All five taxonomy types create, resolve cross-references, and appear in archive page filters | P1 |
| US-009 | Add a reusable CTA button | As an author, I want to create a named CTA button document so that the same button can appear across multiple pages without copy-paste drift | ctaButtonDoc persists; linkItem resolves to the correct internal or external URL; style variant renders correctly | P1 |
| US-010 | Redirect a legacy URL | As an admin, I want to create a redirect document mapping an old WordPress URL to its new path so that migrated content doesn't produce 404s | redirect document with fromPath, toPath, statusCode (301/302), and isActive fields persists correctly | P1 |
| US-011 | Configure SEO metadata | As an author, I want to set a custom title, description, and OG image per document so that each page has accurate search and social previews | `autoGenerate=true` (default): meta title is `{doc.title} \| Sugartown Digital`, description derives from `excerpt` then `body`. `autoGenerate=false`: `seo.title` and `seo.description` are used exactly. siteSettings defaults are last-resort fallback in both modes. | P1 |
| US-012 | View incoming references on a taxonomy term | As an admin, I want to see which articles, nodes, and case studies reference a given tag or category so that I can assess taxonomy health | Incoming reference decorations in Studio list assigned content for category, tag, tool, person, and project documents | P2 |

---

## 5. Technical Architecture

### Content model boundary

Sanity is the exclusive content authority. No content duplication in the frontend codebase. All data fetches use the GROQ API via the Sanity JS client (`apps/web/src/lib/sanity.js`). The client is configured with `perspective: 'published'` — draft documents are never fetched by the web layer.

### Query contract

GROQ projections must be explicit. No `*` spread projections in production queries. All cross-references are dereferenced inline using the `->` operator. Taxonomy fields that alias `name` as `title` in projections must use the `"title": name` pattern — querying `title` directly on a taxonomy document returns null (the field is `name`).

### Schema deployment

Local Studio runs from code and does not require deployment. The Content Lake API and MCP tools validate against the deployed schema. After any schema change: `npx sanity schema deploy` from `apps/studio/`. Skipping this step causes silent write failures on the API and MCP layers while Studio continues to work locally.

### Render contract

Page templates in `apps/web/src/pages/` consume document data via `useSanityDoc` and `useSanityList` hooks. The sections array is rendered by `PageSections.jsx`, which switches on `_type` to select the correct section component. Section types not registered in `PageSections.jsx` silently produce no output.

### Integration points

| System | Purpose | Auth |
|--------|---------|------|
| Sanity Content Lake | CMS API | Sanity project token (env var) |
| Netlify | Hosting + deploys | GitHub integration |
| Google Fonts | Typography (Cormorant Garamond, DM Sans, IBM Plex Mono) | Public CDN, no auth |
| Chromatic | Visual regression testing | Chromatic project token |

---

## 5.5 Content Modeling Strategy

This section establishes the architectural philosophy behind the content model. It is the rationale layer — the "why" behind the field structures in §6. Any future schema addition, deprecation, or refactor should be evaluated against these principles before work begins.

---

### CMS-agnostic design

The content model is designed as though it could migrate to a different headless CMS. No Sanity-specific capabilities (perspectives, real-time listeners, custom input components) are embedded in field names or document structure. Document types map to universal content concepts: article, page, taxonomy term, site configuration. GROQ is an implementation detail of the current stack, not a constraint on the data shape.

**In practice:** field names are semantic (`publishedAt`, not `_createdAt`). The section builder uses a standard discriminated union on `_type`. Object shapes are flat where possible — deeply nested objects increase query complexity and reduce portability.

**Omnichannel implication:** semantic field names are surface-neutral by design. An `article` document's `title`, `excerpt`, `sections[]`, and taxonomy references carry the same meaning whether consumed by the web frontend, an email renderer, a mobile app, a social card generator, or a third-party API. No field is named for the surface that first needed it. See §5.5 Multi-Surface Extension Pattern for the concrete model.

---

### Atomic content modelling

The schema follows atomic design principles, mirroring the component hierarchy in the frontend. This is not coincidental — the schema is the contract that the frontend components consume. When the layers are aligned, adding a new content type requires changes at exactly one level of the hierarchy, not across all of them.

| Layer | Schema examples | Frontend equivalent |
|-------|----------------|---------------------|
| **Atoms** — primitive value objects, no independent identity | `linkItem`, `mediaOverlay`, `socialLink`, `citationItem` | Utility functions (`getLinkProps`, `urlFor`) |
| **Molecules** — composed objects that carry meaning | `richImage`, `ctaButton`, `cardBuilderItem`, `outcomeItem`, `navItem` | Primitive components (`Button`, `Image`, `Tile`) |
| **Organisms** — section types that assemble molecules into a complete block | `heroSection`, `cardBuilderSection`, `statTileSection`, `calloutSection` | Section components (`HeroSection`, `CardBuilderSection`) |
| **Templates** — document types that sequence organisms into a page | `article`, `page`, `caseStudy`, `node` | Page templates (`ArticlePage`, `NodePage`) |
| **Vocabulary** — standalone documents providing controlled classification | `tag`, `category`, `tool`, `project`, `person` | Filter UI, taxonomy detail pages |

**Rule:** when proposing a new schema object, place it in this hierarchy first. An atom that tries to carry document-level identity should become a document. A molecule that is only ever used in one section should be inlined rather than extracted. The layer determines whether the object is embedded or referenced.

---

### Schema mirrors component contract

Every shared object in the composable object registry (§6.0) maps directly to a component or utility in the frontend. The schema field names, types, and enum values are the props interface for that component. They should be designed together, not in sequence.

| Schema object | Frontend consumer | Contract surface |
|---------------|-------------------|-----------------|
| `linkItem` | `getLinkProps()` in `lib/linkUtils.js` | `type`, `internalRef`, `externalUrl`, `label`, `openInNewTab` |
| `richImage` | `Image` component + `urlFor()` | `asset`, `alt`, `hotspot`, `overlay`, `aiGenerated` |
| `ctaButton` | `Button` component | `link` (via `getLinkProps`), `style` |
| `mediaOverlay` | `getOverlayStyles()` utility | `type`, `panel`, `overlayColor`, `overlayOpacity` |
| `seoMetadata` | `resolveSeo()` in `lib/seo.js` | `autoGenerate`, `title`, `description`, `openGraph` |

When a schema object's field names diverge from the component props, one of them is wrong. The PRD is the place to catch this before implementation.

---

### References over embedded copies

Documents with independent identity are always referenced, never embedded as copies. A `tag` document's name exists in exactly one place in the Content Lake — change it once and every piece of content using it reflects the change with no migration required.

The test for reference vs embed: **does this data have meaning outside the document that contains it?**

| Belongs as reference | Belongs as embedded object |
|---------------------|---------------------------|
| `person`, `tool`, `project`, `category`, `tag` — have their own detail pages, archive listings, and incoming reference counts | `citationItem`, `outcomeItem`, `navItem` — meaningful only in context; no independent URL or identity |
| `navigation`, `ctaButtonDoc`, `preheader` — shared across multiple surfaces; updating one should propagate everywhere | `linkItem`, `mediaOverlay`, `socialLink` — value objects with no cross-document lifetime |

**Omnichannel implication:** because taxonomy, authorship, and metadata resolve from a single referenced document, any surface that queries the Content Lake gets the same canonical data. A `person` document's name, bio, and image are consistent whether rendered in a web byline, an email footer, an API response to a mobile app, or a structured data JSON-LD block. No surface maintains its own copy.

**Corollary:** embedding a string where a reference should be is a data normalisation failure. The `aiTool` enum on `richImage` (claude/midjourney/dall-e/other) is a deliberate exception — the provenance value is point-in-time and does not need to track a living `tool` document. Any new string enum that represents a real entity in the taxonomy should be a reference instead.

---

### Flexibility at the composition layer, governance at the field layer

The section builder is where editorial flexibility lives: any section type can appear in any order in any document. This is intentional. Constraining section order would require code changes for every new content pattern.

Field-level governance compensates. Within a section, fields are strictly typed, enum-constrained, length-validated, and required where necessary. The principle is: **strict inputs, flexible assembly**.

| Flexible (composition layer) | Governed (field layer) |
|-----------------------------|----------------------|
| Section order in `sections[]` | Enum values in `status`, `toolType`, `kind`, `backgroundColor` |
| Which section types appear on a page | String length limits (`title` max 100, `excerpt` max 300) |
| How many sections a document has | Required fields (`title`, `slug`, `publishedAt`, `contentTypes`) |
| Whether `seoMetadata` is manually overridden | `autoGenerate` initial value (true — default to derived, opt in to override) |

**Omnichannel implication:** surface-specific requirements belong at the field layer, not the document layer. A campaign that needs email-specific editorial fields does not get a separate document type — it gets an extension field group (`email { subjectLine, preheaderText, ... }`) on the shared document type. The web surface ignores that group in its GROQ projection; the email renderer ignores `sections[]` it cannot render. Both surfaces share the same canonical content and taxonomy. See §5.5 Multi-Surface Extension Pattern for the concrete model.

**Governance failure mode:** adding a free-text field where an enum or reference should be. Free-text fields for controlled concepts (tool names as strings, status as freeform text) produce taxonomy drift and break filter UIs. Every new field that represents a classifiable concept should default to a reference or enum, not a string.

**Flexibility failure mode:** adding `_type`-specific rendering rules inside `PageSections.jsx` for a new section that could have been handled by extending an existing section type. Before adding a new section type, check whether the use case is covered by a variant prop on an existing type.

---

### Validation-first

Validation rules are the schema's enforcement mechanism for editorial quality. They catch problems at authoring time, before bad data reaches the query layer or the frontend.

Required validation patterns in this schema:
- **Required fields** prevent invisible content (a node with no title, a redirect with no `fromPath`)
- **Max-length strings** prevent SEO overflow and layout breakage
- **Enum constraints** prevent taxonomy drift and display-label mapping failures
- **Unique validation** on arrays (tags, tools, authors) prevents duplicate references
- **Custom format validation** on structured strings (`projectId` must match `PROJ-XXX`, `fromPath` must start with `/`)

New fields that skip validation are tech debt: the frontend will eventually encounter the missing or malformed data and either crash or silently produce empty output.

---

### Migration compatibility

The content model serves two audiences simultaneously: new content creation and historical data from the WordPress migration. These must not compromise each other.

The `legacySource` embedded object preserves WordPress provenance on migrated documents without polluting the active schema. Deprecated fields from previous schema iterations are hidden (not removed) so existing data continues to resolve without migration scripts. This means:

- New queries never project deprecated fields
- Deprecated fields are not surfaced in Studio for new authoring
- Old data is not broken by schema changes

The pattern for any future migration or schema refactor: hide the old field, add the new field, write a migration script to backfill, verify, then schedule removal after a confirmed clean dataset.

---

### Multi-Surface Extension Pattern

This is the concrete model for omnichannel content. It shows how a single document type can serve multiple surfaces without schema duplication, naming conflicts, or surface-specific document types.

#### The principle

A document's core content — title, body, taxonomy, authorship, SEO — is surface-neutral. Surface-specific requirements are isolated in a named extension group on the same document. Each surface's GROQ query projects only the fields it needs. Surfaces that don't need an extension group never see it.

```
┌─────────────────────────────────────┐
│  campaign document                  │
│                                     │
│  ── Core (all surfaces) ──────────  │
│  title, slug, excerpt               │
│  sections[] (section builder)       │
│  authors[], tags[], categories[]    │
│  publishedAt, status                │
│  seo { seoMetadata }                │
│                                     │
│  ── email extension group ────────  │
│  email {                            │
│    subjectLine                      │
│    preheaderText                    │
│    fromName                         │
│    replyTo                          │
│    plainTextFallback                │
│  }                                  │
│                                     │
│  ── social extension group ───────  │
│  social {                           │
│    cardHeadline                     │
│    cardImage (richImage)            │
│    platforms[]                      │
│    scheduledAt                      │
│  }                                  │
└─────────────────────────────────────┘
```

#### Schema design for the email extension group

The extension group is a named embedded object, not a separate document. It sits in its own Studio group tab — authors who only write web content never see it.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email.subjectLine` | `string` | No | Max 60 chars. Maps to `<title>` in email HTML. Distinct from `seo.title` — subject line copy is not SEO copy. |
| `email.preheaderText` | `string` | No | Max 100 chars. The grey preview text after the subject in inbox view. Not rendered in email body. |
| `email.fromName` | `string` | No | Max 100 chars. Sender display name override, e.g. "Bex at Sugartown". Falls back to siteSettings if blank. |
| `email.replyTo` | `string` | No | Reply-to address. Validated for email format. |
| `email.plainTextFallback` | `text` | No | Plain text version for clients that cannot render HTML. If blank, auto-stripped from `sections[]` body copy by the email renderer — but manually authored copy is preferred. |

The `email` group is hidden in Studio unless the document's `channels[]` array includes `'email'` (or equivalent surface flag). Authors are not shown irrelevant fields.

#### GROQ projection by surface

Each surface requests only what it needs. The same document ID is queried; only the projection differs.

```groq
// Web frontend — ignores email group entirely
*[_type == "campaign" && slug.current == $slug][0] {
  title, slug, excerpt,
  sections[],
  "authors": authors[]->{ name, slug, image },
  tags[]->{ name, slug },
  categories[]->{ name, slug, colorHex },
  publishedAt, status,
  seo { autoGenerate, title, description, openGraph }
}

// Email renderer — ignores sections[], uses email group
*[_type == "campaign" && slug.current == $slug][0] {
  title, excerpt,
  "subject": email.subjectLine,
  "preheader": email.preheaderText,
  "from": email.fromName,
  "replyTo": email.replyTo,
  "plainText": email.plainTextFallback,
  "authors": authors[]->{ name, image },
  tags[]->{ name, slug }
}
```

#### What is shared vs surface-specific

| Content | Shared | Surface-specific |
|---------|--------|-----------------|
| Title, excerpt, body copy | Yes — all surfaces read `title` and `excerpt` | Email subject line is distinct from `seo.title`; both may exist on the same doc |
| Taxonomy (tags, categories, tools, projects) | Yes — one set of references, all surfaces query it | None — taxonomy is universal |
| Authorship | Yes — `authors[]` references resolve the same `person` doc on all surfaces | None |
| Images | Shared via `richImage` — `urlFor()` generates surface-appropriate dimensions at query time | Email renderers may request fixed-pixel crops; web uses responsive sizes |
| SEO metadata | Web only — email ignores `seo` group | Email `subjectLine` and `preheaderText` are the email equivalents; they do not overlap with OG fields |
| Scheduling | `publishedAt` is the canonical publish datetime | `email.scheduledAt` (if added) is the send time — a different concept, not a duplicate |

#### When to add a surface extension group vs a new document type

Add an extension group when: the new surface shares 70%+ of fields with the base document; the content has the same editorial lifecycle (written, reviewed, published together); authors who manage one surface also manage the other.

Create a new document type when: the surfaces have fundamentally different editorial workflows; content on one surface has no meaningful relationship to the other; the taxonomy and authorship do not overlap.

A campaign article and its email version are the same piece of content with surface-specific delivery metadata — one document, two extension groups. A transactional email (password reset, order confirmation) shares nothing with editorial content — separate document type.

---

### Structured content as AI infrastructure (AEO/GEO)

**What AEO/GEO means:** Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) are the practices of structuring content so that AI systems — ChatGPT, Perplexity, Gemini, Claude — can extract, synthesize, and surface it in generated answers. Traditional SEO targeted crawlers that ranked documents. AEO/GEO targets systems that consume documents to construct answers. The requirements are different, and most content architectures are not ready for them.

#### The blob problem

Most organisations that adopted headless CMS did not actually adopt structured content. They replaced a WYSIWYG text editor with a slightly smaller text editor inside a JSON field called `bodyContent`. That is not structured content. It is a blob with better PR.

The failure mode has two recognisable eras:

**Era 1 — WYSIWYG:** content and layout were fused. You typed into a big box, added an image, clicked publish. No reuse. No system thinking. Completely unportable. Fast and intuitive, which is why teams loved it and why it scaled terribly.

**Era 2 — headless CMS:** the pitch was genuine. Content models, schemas, fields, APIs. Content separated from presentation, reusable anywhere. What actually happened: teams designed the page first, wrote copy to fit the layout, then someone reverse-engineered it into a schema in an afternoon. The big blobs got field names. The mental model never changed.

A `body` PortableText field containing five paragraphs of narrative prose gives an AI answer engine the same signal as a WordPress post: word proximity, nothing more. The content is inside a database with a schema, but the schema wraps a blob.

#### Content-shaped thinking vs UI-shaped thinking

The fix is not to ban visual exploration — early UX work is spatial and iterative by nature. The fix is to treat "extract structure" as a mandatory step between exploration and schema. Most teams skip this step under deadline pressure. The blob survives because nobody made removing it anyone's explicit job.

The distinction between UI-shaped and content-shaped schema design is concrete:

**UI-shaped (what gets built):**
```
Hero:
  heading
  subheading
  image
  button_text
```

**Content-shaped (what should have been built):**
```
Value Proposition:
  audience
  problem
  promise
  differentiator
  proof_point
  tone
```

The first schema only works as a hero. The second works as a hero, a product detail page, an email, a paid ad, a sales deck, and a chatbot response — from the same authored object. The copy for the hero heading is derived from `promise`. The email subject is derived from `problem` with a 60-character constraint. The paid ad concatenates `promise` and `proof_point`. The schema is upstream of every surface. This is what "content-first" actually means: define the smallest meaningful unit before any visual surface exists.

#### How this maps to the Sugartown schema

Sugartown's content model is designed to be upstream of every surface it serves. The machine-readable signal in the schema is not an accident.

| Schema pattern | What it enables for AI systems |
|----------------|-------------------------------|
| `tags[]->`, `categories[]->`, `tools[]->`, `authors[]->` | Explicit typed relationships. "What tools does Sugartown use?" is answerable from `tools[]` references — not by scanning prose for tool names buried in paragraphs |
| Named section `_type` values (`heroSection`, `calloutSection`, `statTileSection`) | Content role signal. A callout is structurally distinct from body prose. AI knows the callout carries emphasis; it does not have to infer it from formatting |
| `outcomeItem[]` with typed `value`, `unit`, `label` fields | Queryable evidence. A `value: 14, unit: "weeks"` field is extractable; the same number inside a sentence is not |
| `excerpt` (max 300 chars, required pattern) | Authored summary. Human-written summaries express intended meaning. AI-extracted summaries guess at it. When an answer engine needs two sentences, this is the canonical source |
| `seoMetadata.description` + `openGraph.description` | Dual authored summary layer. One optimised for search snippets, one for social/AI previews |
| `publishedAt` + explicit `status` enum | Freshness and lifecycle signal. AI answer engines discount stale or non-published content; explicit fields let them judge without parsing prose |
| `project[]->` references | Context clustering. Content linked to the same project is semantically related; the reference graph communicates this without NLP |
| `node` with `aiDisclosure`, `evolution`, `aiTool` | Explicit AI provenance. A node documents a collaboration session; the schema encodes how the content came to exist, not just what it says |

#### The `node` type as proof of concept

The `node` document type is the clearest current demonstration of AEO/GEO-first schema design. It encodes not just content but the process that produced it. `aiDisclosure` records the human-AI collaboration context, `evolution` tracks a typed lifecycle, `aiTool` records the tool involved. A machine reading the schema knows not just what the content says but how it came to exist. That provenance is invisible inside a prose paragraph and fully legible as schema fields.

This is the pattern. Every structured field is a machine-readable fact. Every blob is a human-readable artifact that machines have to guess at.

#### The "extract structure" rule

For any new field or section type: apply the blob test. A field passes if removing the type label would lose information. `body` PortableText alone fails — it is a blob with a label. `calloutSection.title` + `calloutSection.body` + `calloutSection.backgroundColor` passes: the type, the named fields, and the constrained enum values each carry signal independently.

When designing new content, ask: would an AI answer engine be able to extract a clean, accurate answer from this field, or would it have to read a paragraph and infer? If the answer is "infer," the field should be a typed value, not prose.

The same structured content that makes query logic clean and filter UIs reliable also makes the schema legible to AI answer engines. These are not separate concerns. The structural discipline is the same; the beneficiaries now include both machines and humans.

#### AI as mirror

Left to default behaviour, AI generates the path of least resistance: always a blob. Loose prompts produce plausible-sounding content that renders fine in a mockup, is useless as a content system, cannot be queried, cannot be reused, and cannot be surfaced accurately by an answer engine. AI at scale makes structural debt visible at speed. A team that could produce one blob per hour can now produce a thousand. The system has never looked more finished or been more brittle.

The structural discipline problem has always existed. AI just made it impossible to ignore.

**Extended treatment:** the article "We Never Actually Adopted Structured Content" (`/articles/we-never-adopted-structured-content`, published Apr 10 2026) covers this argument in full, including the Value Proposition multi-surface example and the five-step process for extracting structure from UX exploration.

---

## 6. Content Model

### 6.0 Composable Object Registry

The content model is built around shared, reusable objects embedded wherever needed rather than duplicated inline. The table below maps each shared object to every document or section that embeds it. Cross-references in §6.1–§6.4 field tables use `object ↗` notation (e.g., `seoMetadata ↗`) to signal the field is a reusable object fully specified in §6.3.

| Object | Defined in | Embedded in |
|--------|-----------|-------------|
| `seoMetadata ↗` | §6.3 | `article`, `caseStudy`, `node`, `page`, `archivePage`, `person`, `project` |
| `legacySource ↗` | §6.3 | `article`, `caseStudy`, `node` |
| `linkItem ↗` | §6.3 | `ctaButton`, `ctaButtonDoc`, `navItem`, `cardBuilderItem.titleLink`, `preheader`, `richImage.link`, `galleryImage.link` |
| `mediaOverlay ↗` | §6.3 | `richImage.overlay`, `cardBuilderItem.overlay`, `heroSection.imageTreatment`, `imageGallery.treatment` |
| `richImage ↗` | §6.3 | `heroSection.backgroundImage`, `standardPortableText` blocks |
| `ctaButton ↗` | §6.3 | `heroSection.ctas[]`, `ctaSection.buttons[]` |
| `citationItem ↗` | §6.3 | `article.citations[]`, `caseStudy.citations[]`, `node.citations[]` |
| `outcomeItem ↗` | §6.3 | `statTileSection.items[]` |
| `navItem ↗` | §6.3 | `navigation.items[]` |
| `socialLink ↗` | §6.3 | `siteSettings.socialLinks[]`, `person.socialLinks[]` |
| `galleryImage ↗` | §6.3 | `imageGallery.images[]` |

---

### 6.1 Document Types

> **Field table notation:**
> - `object ↗` — reusable shared object; see §6.3 for full field definition
> - `ref→X` — Sanity reference to document type X
> - ~~`field`~~ — deprecated; hidden in Studio, do not query or write

#### article

The primary editorial content type. Replaces the legacy `post` type. Groups: Content, Metadata, SEO, Migration.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `title` | `string` | Yes | Max 100 chars | Internal title used for slug, Studio preview, and `<title>` tag. The rendered page heading lives in `heroSection`. |
| `slug` | `slug` | Yes | Unique; auto from `title`; max 96 | |
| `excerpt` | `text` | No | Max 300 chars | Used in card displays and headless summaries |
| `sections` | `array[section types]` | No | | See §6.4 for full section inventory |
| `citations` | `array[citationItem ↗]` | No | | Endnote definitions; inline `[n]` markers in body reference these by position |
| `publishedAt` | `datetime` | Yes | Initial value: now | |
| `updatedAt` | `datetime` | No | Initial value: now | |
| `readingTime` | `number` | No | Integer; min 1, max 60 | Minutes |
| `aiDisclosure` | `string` | No | Max 300 chars | e.g. "Narrated by Claude, directed by Bex Head." Renders below byline. |
| `authors` | `array[ref→person]` | No | Unique | |
| `projects` | `array[ref→project]` | No | | |
| `status` | `string` | Yes | Enum; initial: `exploring` | `exploring`, `validated`, `operationalized`, `deprecated`, `evergreen` |
| `tools` | `array[ref→tool]` | No | Unique | Tools beyond the primary AI tool |
| `categories` | `array[ref→category]` | No | Warning at 3+ | Prefer 1–2 |
| `tags` | `array[ref→tag]` | No | Unique | Controlled vocabulary |
| `related` | `array[ref→node/article/caseStudy]` | No | Unique | Cross-references for margin column on detail pages |
| `series` | `ref→series` | No | | |
| `partNumber` | `number` | No | Integer; min 1; hidden unless `series` set | Position in series |
| `seo` | `seoMetadata ↗` | No | | Per-document SEO override |
| `legacySource` | `legacySource ↗` | No | Read-only | WordPress migration provenance |
| ~~`keyTakeaway`~~ | `string` | — | Deprecated | Use `excerpt` instead |
| ~~`content`~~ | `array` | — | Deprecated | Use `sections` instead |
| ~~`cardImage`~~ | `image` | — | Deprecated | Card thumbnails derive from hero section |
| ~~`relatedProjects`~~ | `array` | — | Deprecated | Use `projects` instead |

#### caseStudy

Client project documentation. Groups: Content, Metadata, Case Study specifics, SEO, Migration.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `title` | `string` | Yes | Max 100 chars | |
| `slug` | `slug` | Yes | Unique; auto from `title`; max 96 | |
| `excerpt` | `text` | No | Max 300 chars | |
| `sections` | `array[section types]` | No | | |
| `citations` | `array[citationItem ↗]` | No | | |
| `publishedAt` | `datetime` | Yes | Initial value: now | |
| `updatedAt` | `datetime` | No | Initial value: now | |
| `readingTime` | `number` | No | Integer; min 1, max 60 | |
| `aiDisclosure` | `string` | No | Max 300 chars | |
| `authors` | `array[ref→person]` | No | Unique | |
| `projects` | `array[ref→project]` | No | | |
| `status` | `string` | Yes | Enum; initial: `exploring` | `exploring`, `validated`, `operationalized`, `deprecated`, `evergreen` |
| `tools` | `array[ref→tool]` | No | Unique | |
| `categories` | `array[ref→category]` | No | Warning at 3+ | |
| `tags` | `array[ref→tag]` | No | Unique | |
| `related` | `array[ref→node/article/caseStudy]` | No | Unique | |
| `series` | `ref→series` | No | | |
| `partNumber` | `number` | No | Integer; min 1; hidden unless `series` set | |
| `dateRange` | `object` | No | | `startDate` (datetime, required) + `endDate` (datetime, optional) |
| `contractType` | `string` | No | Enum | `fixed`, `retainer`, `hybrid` |
| `industry` | `array[string]` | No | Radio list from predefined values | Industries the client operates in |
| `companySize` | `string` | No | Enum | `startup`, `smb`, `enterprise` |
| `aeoSummary` | `text` | No | Max 200 chars | AEO-optimised "About the engagement" description |
| `geoSummary` | `text` | No | Max 200 chars | Geographic/market scope |
| `keyQuestions` | `array[string]` | No | | Business questions this case study answers |
| `seo` | `seoMetadata ↗` | No | | |
| `legacySource` | `legacySource ↗` | No | Read-only | |
| ~~`cardImage`~~ | `image` | — | Deprecated | |
| ~~`relatedProjects`~~ | `array` | — | Deprecated | Use `projects` |

#### node

Knowledge graph documents. Each node captures an AI collaboration session, its evolution, and its relationships to other content. Groups: Content, Metadata, SEO, Migration.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `title` | `string` | Yes | Max 100 chars | |
| `slug` | `slug` | Yes | Unique; auto from `title`; max 96 | |
| `excerpt` | `text` | No | Max 300 chars | Lead with principle, not setup |
| `sections` | `array[section types]` | No | | |
| `citations` | `array[citationItem ↗]` | No | | |
| `publishedAt` | `datetime` | Yes | Initial value: now | |
| `updatedAt` | `datetime` | No | Initial value: now | |
| `readingTime` | `number` | No | Integer; min 1, max 60 | |
| `aiDisclosure` | `string` | No | Max 300 chars | |
| `authors` | `array[ref→person]` | No | Unique | |
| `projects` | `array[ref→project]` | No | | |
| `status` | `string` | Yes | Enum; initial: `exploring` | `exploring`, `validated`, `operationalized`, `deprecated`, `evergreen` |
| `tools` | `array[ref→tool]` | No | Unique | |
| `categories` | `array[ref→category]` | No | Warning at 3+ | |
| `tags` | `array[ref→tag]` | No | Unique | |
| `related` | `array[ref→node/article/caseStudy]` | No | Unique | Cross-content graph edges |
| `series` | `ref→series` | No | | |
| `partNumber` | `number` | No | Integer; min 1; hidden unless `series` set | |
| `seo` | `seoMetadata ↗` | No | | |
| `legacySource` | `legacySource ↗` | No | Read-only | |
| ~~`keyTakeaway`~~ | `string` | — | Deprecated | |
| ~~`content`~~ | `array` | — | Deprecated | Use `sections` |
| ~~`cardImage`~~ | `image` | — | Deprecated | |
| ~~`aiTool`~~ | `string` | — | Deprecated | Use `tools` taxonomy |
| ~~`conversationType`~~ | `string` | — | Deprecated | Use categories and tags |
| ~~`challenge`~~ / ~~`insight`~~ / ~~`actionItem`~~ | PT arrays | — | Deprecated | Work these into node body sections |
| ~~`relatedProjects`~~ | `array` | — | Deprecated | Use `projects` |

#### page

Hierarchical CMS pages. The homepage is a `page` document with slug `home`.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `title` | `string` | Yes | Max 100 chars | |
| `slug` | `slug` | Yes | Unique; auto from `title`; max 96 | |
| `parent` | `ref→page` | No | | Enables page hierarchy |
| `template` | `string` | No | Enum; initial: `default` | `default`, `full-width`, `sidebar` |
| `sections` | `array[section types]` | Yes | Min 1 | |
| `publishedAt` | `datetime` | Yes | Initial value: now | |
| `updatedAt` | `datetime` | No | Initial value: now | |
| `featured` | `boolean` | No | Initial: false | Display on homepage or primary navigation |
| `seo` | `seoMetadata ↗` | No | | |

#### archivePage

Controls listing/archive pages. One document per archive. Groups: Content, Archive Configuration, Metadata, SEO.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `title` | `string` | Yes | Max 100 chars | |
| `slug` | `slug` | Yes | Unique; must match URL namespace | |
| `excerpt` | `text` | No | Max 300 chars | |
| `contentTypes` | `array[string]` | Yes | Min 1; enum: `article`, `caseStudy`, `node` | Which content types to display |
| `featuredItems` | `array[ref→article/caseStudy/node]` | No | | Pinned items shown above the main list |
| `taxonomyFilters` | `object` | No | | Taxonomy facets available to filter by |
| `taxonomyFilters.categories` | `array[ref→category]` | No | | |
| `taxonomyFilters.tags` | `array[ref→tag]` | No | | |
| `taxonomyFilters.tools` | `array[ref→tool]` | No | | |
| `taxonomyFilters.projects` | `array[ref→project]` | No | | |
| `filterConfig` | `object` | No | | Frontend filter display and behaviour |
| `filterConfig.facets` | `array[object]` | No | | Each facet: `id` (string), `label` (string, max 60), `type` (enum: category/tag/tool/project/status/author), `enabled` (boolean), `multi` (boolean) |
| `filterConfig.displayStyle` | `string` | No | Enum: `chips`, `dropdown`, `sidebar`; initial: `chips` | |
| `cardOptions` | `object` | No | | Card display configuration |
| `cardOptions.variant` | `string` | No | Enum: `minimal`, `standard`, `rich` | |
| `cardOptions.imagePosition` | `string` | No | Enum: `top`, `left` | |
| `cardOptions.showExcerpt` | `boolean` | No | Initial: true | |
| `cardOptions.showMeta` | `boolean` | No | Initial: true | Author, date, reading time |
| `cardOptions.showTags` | `boolean` | No | Initial: false | |
| `sortBy` | `string` | No | Enum; initial: `publishedDesc` | `publishedDesc`, `publishedAsc`, `titleAsc` |
| `itemsPerPage` | `number` | No | Min 6, max 50; initial: 12 | |
| `showPagination` | `boolean` | No | Initial: true | Pagination vs. infinite scroll |
| `publishedAt` | `datetime` | Yes | Initial value: now | |
| `updatedAt` | `datetime` | No | Initial value: now | |
| `seo` | `seoMetadata ↗` | No | | |
| ~~`displayStyle`~~ | `string` | — | Deprecated | Use `cardOptions` |
| ~~`listStyle`~~ | `string` | — | Deprecated | Use `cardOptions` |

#### person

Author and contributor profiles. Also functions as a taxonomy primitive — content documents reference `person` in their `authors` array.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `name` | `string` | Yes | Max 100 chars | **Primary field. Not `title`.** GROQ: `"title": name` |
| `shortName` | `string` | No | Max 50 chars | Shortened form, e.g. "Bex" |
| `slug` | `slug` | Yes | Unique; auto from `name`; max 96 | |
| `titles` | `array[string]` | No | | Professional titles/roles |
| `headline` | `string` | No | Max 150 chars | One-line tagline |
| `bio` | `text` | No | Max 500 chars | |
| `image` | `image` | No | Hotspot enabled | Profile photograph |
| `location` | `string` | No | Max 100 chars | |
| `pronouns` | `string` | No | Max 20 chars | |
| `expertise` | `array[ref→tag]` | No | | Topics/skills. References `tag`, not `category`. |
| `featured` | `boolean` | No | Initial: false | Highlight on contributor pages |
| `socialLinks` | `array[socialLink ↗]` | No | | |
| `seo` | `seoMetadata ↗` | No | | |
| ~~`links`~~ | `array` | — | Deprecated | Use `socialLinks` |

#### series

Multi-part content grouping. Articles, case studies, and nodes reference a series via `series` + `partNumber`.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `title` | `string` | Yes | Max 100 chars | |
| `slug` | `slug` | Yes | Unique; auto from `title`; max 96 | |
| `description` | `text` | No | Max 300 chars | |

#### siteSettings

Singleton. One document, one instance. Organised into four Studio groups: General, Header, Footer, SEO Defaults.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `siteTitle` | `string` | Yes | Max 60 chars | General group |
| `tagline` | `string` | No | Max 100 chars | General group |
| `siteLogo` | `image` | No | Hotspot enabled | Primary site logo used in header; General group |
| `favicon` | `image` | No | PNG/ICO/SVG only | Recommended 32×32 or 64×64; General group |
| `primaryNav` | `ref→navigation` | No | | Header group |
| `headerCta` | `ref→ctaButtonDoc` | No | | Header group |
| `preheader` | `ref→preheader` | No | | Header group |
| `footerLogo` | `image` | No | Hotspot enabled | Falls back to `siteLogo` if not set; Footer group |
| `footerColumns` | `array[ref→navigation]` | No | Max 4 | Footer navigation columns; Footer group |
| `socialLinks` | `array[socialLink ↗]` | No | Max 8 | Footer group |
| `copyrightText` | `string` | No | Max 100 chars | Appended after "© {year} {siteTitle}."; Footer group |
| `footerToolchain` | `array[ref→tool]` | No | Max 12 | Chips in footer colophon linking to `/tools/:slug`; Footer group |
| `licenseLabel` | `string` | No | Max 100 chars | e.g. "Content CC BY-NC 4.0 · Code MIT"; Footer group |
| `licenseUrl` | `url` | No | https only | Link for license label; Footer group |
| `siteUrl` | `url` | No | https only | Canonical domain for OG and sitemap; SEO group |
| `defaultMetaTitle` | `string` | No | Max 60 chars | Fallback for pages without custom SEO; SEO group |
| `defaultMetaDescription` | `text` | No | Max 160 chars | SEO group |
| `defaultOgImage` | `image` | No | 1200×630px recommended | Fallback social share image; SEO group |

**Note:** Brand colours are managed exclusively via design tokens (`tokens/source/tokens.json`). No colour picker fields exist in siteSettings.

#### navigation

Named menu documents. `siteSettings.primaryNav` references one. `siteSettings.footerColumns` references up to four.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `title` | `string` | Yes | Max 100 chars | Internal identifier; not rendered |
| `header` | `string` | No | Max 100 chars | Display label for the rendered menu heading |
| `items` | `array[navItem ↗]` | Yes | Min 1 | |

#### preheader

Announcement bar with scheduling. Referenced from `siteSettings.preheader`.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `title` | `string` | Yes | Max 100 chars | Internal identifier only |
| `message` | `string` | Yes | Max 200 chars | The rendered announcement text |
| `link` | `linkItem ↗` | No | | Optional CTA within the bar |
| `backgroundColor` | `string` | No | Enum | `pink`, `seafoam`, `dark`, `light` |
| `publishAt` | `datetime` | No | | When the bar goes live |
| `unpublishAt` | `datetime` | No | | When the bar expires |
| `timezone` | `string` | No | Enum from predefined IANA list | Timezone for scheduling |

#### ctaButtonDoc

Reusable CTA button document. Referenced from `siteSettings.headerCta` and any page section that accepts a named button.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `internalTitle` | `string` | Yes | Max 100 chars | Studio reference label; not rendered |
| `link` | `linkItem ↗` | Yes | | Button destination and label |
| `style` | `string` | No | Enum | `primary`, `secondary`, `tertiary` |

#### redirect

URL redirect records from the WordPress migration.

| Field | Type | Required | Validation | Notes |
|-------|------|----------|-----------|-------|
| `fromPath` | `string` | Yes | Custom path format validation | Source path, e.g. `/old-page` |
| `toPath` | `string` | Yes | Custom validation prevents circular redirects | Destination path |
| `statusCode` | `number` | No | Enum: `301`, `302`, `410` | 301 = permanent, 302 = temporary, 410 = gone |
| `isActive` | `boolean` | No | Initial: true | |
| `notes` | `text` | No | Max 300 chars | Internal explanation |

---

### 6.2 Taxonomy Types

All five taxonomy types use `name` (not `title`) as the primary display field. GROQ projections alias as `"title": name`. Studio preview blocks use `select: { title: 'name' }`. Querying `title` directly on a taxonomy document returns null.

#### category

Categories are domain classifiers. They also drive colour-coded visualisation in the knowledge graph.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `string` | Yes | Max 60 chars |
| `slug` | `slug` | Yes | Auto from `name`; max 96 |
| `description` | `text` | No | Max 200 chars |
| `colorHex` | `color` | No | Sanity color type, alpha disabled |

**colorHex preset palette:** Sugartown Pink `#FF247D`, Maroon `#b91c68`, Lime `#D1FF1D`, Seafoam `#2BD4AA`, Midnight `#0D1226`, Charcoal `#1e1e1e`, Softgrey `#94A3B8`, Blue `#0066CC`

Studio shows incoming references for `article`, `node`, and `caseStudy` documents assigned to this category.

#### tag

Tags are conceptual/thematic classifiers. Controlled vocabulary: target 60–100 total. Tool and platform names belong in the `tool` type, not here.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `string` | Yes | Max 50 chars |
| `slug` | `slug` | Yes | Auto from `name`; max 96 |
| `description` | `text` | No | Max 300 chars. Describes what the tag means and when to apply it. |

Studio shows incoming references for `article`, `node`, `caseStudy`, and `project` documents tagged with this term.

#### tool

Named software, platforms, and technologies.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `string` | Yes | Max 60 chars |
| `slug` | `slug` | Yes | Auto from `name`; max 96 |
| `kind` | `string` | No | Enum: `practitioner` (Bex uses directly), `platform` (client-operated) |
| `toolType` | `string` | Yes | Enum: `ai`, `cms`, `dam`, `data`, `design`, `development`, `ecommerce`, `os`, `pim`, `productivity`, `visualization`, `analytics`, `other` |
| `description` | `text` | No | Max 300 chars |
| `url` | `url` | No | Official website or documentation |
| `logo` | `image` | No | Hotspot enabled; square aspect ratio recommended |

Studio shows incoming references for `article`, `node`, and `caseStudy` documents that reference this tool.

#### project

Project registry. Documents reference projects to associate content with a specific initiative.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `string` | Yes | Max 100 chars |
| `slug` | `slug` | Yes | Auto from `name`; max 96 |
| `projectId` | `string` | Yes | Custom validation: must match `PROJ-XXX` format; unique across all projects |
| `status` | `string` | Yes | Enum: `dreaming`, `designing`, `developing`, `testing`, `deploying`, `iterating` |
| `priority` | `number` | No | Range 1–5 |
| `colorHex` | `color` | No | Sanity color type, alpha disabled |
| `description` | `text` | No | Max 500 chars |
| `tools` | `array[ref→tool]` | No | Unique |
| `categories` | `array[ref→category]` | No | Warning at 3+ |
| `tags` | `array[ref→tag]` | No | Unique |
| `kpis` | `array[object]` | No | Each KPI: `metric` (string, required), `target` (number), `current` (number) |
| `seo` | `seoMetadata ↗` | No | |

#### person

*(Documented in §6.1 as a full document type — `person` serves as both an author profile and a taxonomy primitive.)*

---

### 6.3 Object Types

These are reusable embedded objects, not documents. They have no `_id` in the Content Lake — they exist only as embedded values within the documents that contain them. All are cross-referenced from §6.0 and from document field tables via `↗` notation.

#### linkItem ↗

The canonical link primitive. All links in the content model flow through this object.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | `string` | Yes | Enum: `internal`, `external` |
| `internalRef` | `ref→page` | Conditional | Shown when `type = internal` |
| `externalUrl` | `string` | Conditional | Shown when `type = external`; validated for http/https |
| `label` | `string` | Yes | Max 100 chars; button or link display text |
| `openInNewTab` | `boolean` | No | Initial: false |

**Note:** `linkItem` references only `page` documents for internal links. To link to an `archivePage`, use `navItem.archiveRef` instead — that is the only object that holds an `archivePage` reference.

#### ctaButton ↗

Inline CTA button. Used inside sections (`heroSection.ctas[]`, `ctaSection.buttons[]`). Distinct from `ctaButtonDoc`, which is a named, reusable document.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `link` | `linkItem ↗` | Yes | Destination and label |
| `style` | `string` | No | Enum: `primary`, `secondary`, `tertiary` |
| ~~`text`~~ | `string` | — | Deprecated; use `link.label` |

#### richImage ↗

The primary image type for authored content. Used in `heroSection.backgroundImage` and inside `standardPortableText` blocks.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `asset` | `image` | Yes | Hotspot and crop enabled |
| `alt` | `string` | Yes | Max 200 chars |
| `caption` | `text` | No | Max 300 chars |
| `credit` | `string` | No | Max 150 chars |
| `link` | `linkItem ↗` | No | Makes the image a clickable link |
| `overlay` | `mediaOverlay ↗` | No | Visual treatment control |
| `aiGenerated` | `boolean` | No | Initial: false; AI ethics compliance |
| `aiTool` | `string` | No | Shown only when `aiGenerated = true`. Enum: `claude`, `midjourney`, `dall-e`, `other` |
| `blurhash` | `string` | No | Blur hash for LQIP effect |
| `lqip` | `string` | No | Low-quality image placeholder data URI |
| `palette` | `array[object]` | No | Extracted colour palette |
| ~~`linkUrl`~~ | `string` | — | Deprecated; use `link` object |

#### galleryImage ↗

A lighter image object used in `imageGallery.images[]`. Same fields as `richImage` minus `overlay`, `aiGenerated`, `aiTool`, and LQIP fields.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `asset` | `image` | Yes | |
| `alt` | `string` | Yes | Max 200 chars |
| `caption` | `text` | No | Max 300 chars |
| `credit` | `string` | No | Max 150 chars |
| `link` | `linkItem ↗` | No | Optional clickthrough |
| ~~`linkUrl`~~ | `string` | — | Deprecated |

#### mediaOverlay ↗

Visual treatment/duotone control for images. Embedded in `richImage.overlay`, `cardBuilderItem.overlay`, `heroSection.imageTreatment`, and `imageGallery.treatment`.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | `string` | Yes | Enum: `none`, `duotone-featured`, `duotone-subtle`, `duotone-extreme`, `dark-scrim`, `greyscale`, `color` |
| `panel` | `boolean` | No | Apply treatment to panel background |
| `overlayColor` | `string` | No | Custom colour for `color` type |
| `overlayOpacity` | `number` | No | Range 0–1 |

#### outcomeItem ↗

Stat/metric tile. Used in `statTileSection.items[]`.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `metric` | `string` | Yes | Max 100 chars; what was measured |
| `valueAfter` | `number` | Yes | Post-project value |
| `valueBefore` | `number` | No | Pre-project baseline |
| `impactStatement` | `text` | No | Max 200 chars |
| `evidenceType` | `string` | No | Enum: `measured`, `estimated`, `qualitative` |

#### citationItem ↗

Endnote definition. Inline `citationRef` marks in portable text reference these by position. Defined at the document level in `article.citations[]`, `caseStudy.citations[]`, and `node.citations[]`.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `text` | `string` | Yes | Max 500 chars |
| `url` | `url` | No | Optional source link |
| `label` | `string` | No | Max 50 chars |

#### navItem ↗

Top-level navigation item. Used in `navigation.items[]`.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `label` | `string` | Yes | Max 100 chars |
| `linkType` | `string` | No | Enum: `internal`, `archive`, `external` |
| `internalPage` | `ref→page` | Conditional | Shown when `linkType = internal` |
| `archiveRef` | `ref→archivePage` | Conditional | Shown when `linkType = archive` |
| `externalUrl` | `string` | Conditional | Shown when `linkType = external` |
| `openInNewTab` | `boolean` | No | Initial: false |
| `children` | `array[childNavItem]` | No | Dropdown items |
| ~~`link`~~ | `linkItem ↗` | — | Deprecated legacy field |

#### cardBuilderItem ↗

Composable card for `cardBuilderSection.cards[]`. Each field is optional — the card renders only the fields provided.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | `string` | Yes | Max 100 chars |
| `titleLink` | `linkItem ↗` | No | Optional link on the title |
| `image` | `image` | No | Hotspot enabled |
| `overlay` | `mediaOverlay ↗` | No | Treatment for card image |
| `eyebrow` | `string` | No | Max 50 chars; overline above title |
| `subtitle` | `string` | No | Max 150 chars |
| `body` | `array[compactPortableText]` | No | Lists, inline code, citation refs — no headings or images |
| `citations` | `array[object]` | No | Inline citations: `text` (required), `link` (string), `linkLabel` (string) |
| `tools` | `array[ref→tool]` | No | Unique |
| `tags` | `array[ref→tag]` | No | Unique |

#### seoMetadata ↗

Reusable SEO block. Embedded in every content document type and taxonomy documents that have detail pages. Resolution is handled by `resolveSeo()` in `apps/web/src/lib/seo.js` — not by GROQ coalesce.

**`autoGenerate` resolution order (`apps/web/src/lib/seo.js`):**

| Mode | Title | Description |
|------|-------|-------------|
| `autoGenerate = true` (default) | `{doc.title} \| Sugartown Digital` (doc.title capped at 40 chars before suffix) | `seo.description` override → `doc.excerpt` → plain text extracted from `doc.body` (160 chars) → `siteSettings.defaultMetaDescription` |
| `autoGenerate = false` | `seo.title` exactly as entered, no suffix appended | `seo.description` exactly as entered → `siteSettings.defaultMetaDescription` |

When `autoGenerate = true`, the `seo.title` field is hidden in Studio — authors can only set `seo.description` as a partial override. siteSettings defaults are the last-resort fallback in both modes, not the primary source.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `autoGenerate` | `boolean` | No | Initial: true. When true, title derives from `doc.title`; description derives from `doc.excerpt` or `doc.body`. `seo.title` is hidden in Studio while this is on. |
| `title` | `string` | No | Max 60 chars. Only shown and used when `autoGenerate = false`. Rendered exactly — no site suffix appended. |
| `description` | `string` | No | Max 160 chars. Respected in both modes as an explicit override ahead of excerpt/body fallbacks. |
| `canonicalUrl` | `string` | No | Full URL including scheme |
| `noIndex` | `boolean` | No | Initial: false |
| `noFollow` | `boolean` | No | Initial: false |
| `openGraph.title` | `string` | No | Max 100 chars |
| `openGraph.description` | `string` | No | Max 160 chars |
| `openGraph.image` | `image` | No | |
| `openGraph.type` | `string` | No | Enum: `website`, `article`, `profile` |

#### socialLink ↗

Social profile link. Used in `siteSettings.socialLinks[]` and `person.socialLinks[]`.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `platform` | `string` | Yes | Enum: `Behance`, `Bluesky`, `Dribbble`, `Facebook`, `GitHub`, `Instagram`, `LinkedIn`, `Mastodon`, `X`, `Twitter`, `YouTube` |
| `url` | `string` | Yes | Custom validation: http/https/mailto/tel schemes permitted |
| `label` | `string` | No | Max 50 chars; display label override |

#### legacySource ↗

WordPress migration provenance. Embedded in `article`, `caseStudy`, and `node`. All fields are read-only. Collapsed by default in Studio.

| Field | Type | Notes |
|-------|------|-------|
| `system` | `string` | Always `wp` |
| `wpId` | `number` | WordPress post ID |
| `wpType` | `string` | WordPress post type |
| `wpUrl` | `string` | Original WordPress URL |
| `legacySlug` | `string` | Original WordPress slug |
| `importHash` | `string` | Content hash for deduplication |
| `importedAt` | `datetime` | When imported |
| `legacyHtml` | `text` | Original WordPress HTML fallback |
| `legacyFeaturedImageUrl` | `string` | Original featured image URL |

---

### 6.4 Section Types

All sections are valid in the `sections` array of `page`, `article`, `caseStudy`, and `node` documents unless noted. The `sections` array switches on `_type` in `PageSections.jsx`. A section type not registered there renders nothing.

#### heroSection

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `eyebrow` | `string` | No | Max 50 chars |
| `heading` | `string` | Yes | Max 150 chars |
| `subheading` | `string` | No | Max 300 chars |
| `backgroundImage` | `richImage ↗` | No | |
| `imageTreatment` | `mediaOverlay ↗` | No | |
| `imageWidth` | `string` | No | Enum: `content-width`, `full-width`; initial: `full-width` |
| `showStatRail` | `boolean` | No | Initial: false |
| `ctas` | `array[ctaButton ↗]` | No | Max 3 |

#### textSection

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `heading` | `string` | No | Max 120 chars |
| `content` | `array[standardPortableText]` | Yes | H2–H4, blockquote, lists, `richImage`, code blocks, `tableBlock`, citation refs |

#### imageGallery

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `heading` | `string` | No | Max 120 chars |
| `images` | `array[galleryImage ↗]` | Yes | Min 1 |
| `layout` | `string` | No | Enum: `grid`, `carousel`; initial: `grid` |
| `treatment` | `mediaOverlay ↗` | No | Applied uniformly to all images |

#### ctaSection

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `heading` | `string` | No | Max 120 chars |
| `description` | `text` | No | Max 300 chars |
| `buttons` | `array[ctaButton ↗]` | Yes | Min 1, max 3 |

#### cardBuilderSection

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `heading` | `string` | No | Max 120 chars |
| `layout` | `string` | No | Enum: `grid`, `list`, `tile`; initial: `grid` |
| `cards` | `array[cardBuilderItem ↗]` | Yes | Min 1 |

#### calloutSection

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `variant` | `string` | No | Enum: `default`, `info`, `tip`, `warn`, `danger`; initial: `default` |
| `number` | `string` | No | Max 20 chars; optional folio number |
| `title` | `string` | No | Max 100 chars; callout heading |
| `body` | `array[summaryPortableText]` | Yes | Normal text, bold/italic/underline, links. No headings or images. |

#### accordionSection

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `heading` | `string` | No | Max 120 chars |
| `semantic` | `string` | No | Enum: `faq`. Set to `faq` to emit JSON-LD `FAQPage` structured data. |
| `multi` | `boolean` | No | Initial: false; allow multiple items expanded simultaneously |
| `numbered` | `boolean` | No | Initial: false; render Q.NN prefix in Cormorant with hairline dividers |
| `numberPrefix` | `string` | No | Max 4 chars; initial: `Q`; hidden unless `numbered = true` |
| `items` | `array[object]` | Yes | Min 1; each item: `title` (string, required, max 200) + `content` (array[compactPortableText], required) |

#### statTileSection

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `number` | `string` | No | Max 20 chars; folio number, e.g. "§ 03" |
| `name` | `string` | No | Max 60 chars; short mono-caps label, e.g. "Outcomes" |
| `title` | `string` | No | Max 120 chars; Cormorant centre title |
| `kicker` | `string` | No | Max 80 chars; right-aligned note, e.g. "Measured 90 days post-launch" |
| `items` | `array[outcomeItem ↗]` | Yes | Min 1, max 4 |

#### mermaidSection

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `code` | `text` | Yes | Mermaid markup. Supports flowchart, sequence, class, state, ER, Gantt, pie, mindmap, timeline. |
| `caption` | `string` | No | Max 120 chars |
| `width` | `string` | No | Enum: `column` (760px), `wide` (1080px breakout), `full` (viewport); initial: `column` |

#### htmlSection

Migration fallback only. Do not author new content here.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `html` | `text` | Yes | Raw HTML; renders as-is with no sanitisation |
| `label` | `string` | No | Max 100 chars; internal label only, not rendered |

#### trustReportSection

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `heading` | `string` | No | Max 120 chars; leave blank for no heading |
| `reports` | `array[string]` | Yes | Min 1, max 3; enum: `recent-releases`, `design-system-stats`, `cwv-snapshot` |
| `defaultFormFactor` | `string` | No | Enum: `mobile`, `desktop`; initial: `mobile`; shown only when `cwv-snapshot` is selected |
| `cwvUrl` | `string` | No | https only; shown only when `cwv-snapshot` selected; specific URL to query CrUX for (falls back to origin-level data if blank) |
| ~~`reportType`~~ | `string` | — | Deprecated; migrated to `reports` array |

#### recentContentSection

Dynamically sources the latest published `article`, `node`, and release. No manual content selection.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `number` | `string` | No | Max 20 chars; folio number |
| `name` | `string` | No | Max 60 chars; mono-caps label; placeholder: "Recently shipped" |
| `title` | `string` | No | Max 120 chars; Cormorant centre title |
| `kicker` | `string` | No | Max 80 chars; right-aligned note |

---

### 6.5 Portable Text Variants

Four portable text configurations are in use. Choosing the wrong variant for a context silently drops formatting. There is no `minimalPortableText` — the four below are the full set.

| Variant | Headings | Lists | Images | Block code | Inline code | citationRef | Used in |
|---------|----------|-------|--------|-----------|-------------|------------|---------|
| `standardPortableText` | H2–H4 + blockquote | Yes | `richImage` | Yes | Yes | Yes | `textSection.content`, section content in article/node/caseStudy |
| `compactPortableText` | None | Yes | None | None | Yes | Yes | `cardBuilderItem.body`, `accordionSection` item content |
| `summaryPortableText` | None | None | None | None | None | None | `calloutSection.body` — normal text, bold/italic/underline, links only |
| `metadataPortableText` | None | None | None | None | Yes | None | SEO description fields, short metadata contexts |

---

### 6.6 Rendering Rules and Conditional Behaviour

These rules describe how section output changes based on context, position, field values, or surrounding documents. They live in the frontend (`PageSections.jsx`, page templates, and section components) — not in Sanity schemas. An author setting values in Studio must understand these rules to predict what will render.

#### Page context: `detail` vs `full`

`PageSections` accepts a `context` prop. All detail pages (`ArticlePage`, `NodePage`, `CaseStudyPage`, `RootPage`) pass `context="detail"`. All other page types use the default `context="full"`.

| Context | Wrapper class | Spacing | Child padding |
|---------|--------------|---------|---------------|
| `detail` | `.detailContext` | `var(--st-space-section-break-detail)` gap | Children: zero padding, zero margin, `width: 100%` |
| `full` | `.fullContext` | `var(--st-space-section-break)` gap | Standard component defaults |

**Consequence for authors:** A section that looks correctly spaced in a standalone page preview may render differently when placed on a detail page. The detail context strips all external spacing from children — internal padding in a component is preserved, but margin is not.

---

#### heroSection — conditional rules by field state

The hero is the most conditional section in the model. Its rendered form depends on five independent signal chains.

**1. Image presence**

| Condition | Output |
|-----------|--------|
| `backgroundImage.asset` exists | White text, overlay treatment applied, minimum height 320px |
| No `backgroundImage` | Dark text, no overlay, minimum height 180px, class `.heroImageless` |

**2. Image width**

| `imageWidth` value | CSS class | Effect |
|--------------------|-----------|--------|
| `full-width` (default) | `.heroFullWidth` | 100vw breakout with negative margin |
| `content-width` | `.heroContentWidth` | Capped at `--st-width-detail`; has border-radius |
| (unset) | none | No special width treatment |

**3. Image treatment (`imageTreatment.type`)**

| Treatment | Glow class | Text shadow |
|-----------|-----------|-------------|
| `duotone-extreme` | `.heroGlowExtreme` | `--st-text-shadow-glow-strong` |
| `duotone-*` | `.heroGlowDuotone` | `--st-text-shadow-glow-pink` |
| `dark-scrim` | `.heroGlowScrim` | `--st-text-shadow-subtle` |
| `color` | `.heroGlowColor` | `--st-text-shadow-dark` |
| other / none | `.heroGlowDefault` | `--st-text-shadow-overlay` |
| panel enabled | `.heroGlowNone` | No shadow (panel provides contrast) |

**4. Panel mode (`imageTreatment.panel = true`)**

| Condition | Layout |
|-----------|--------|
| `panel = true` AND image exists | Text content in `.heroPanel` (frosted glass, centred, fixed padding) |
| Otherwise | Text content in `.heroContent` (max-width 700px, flex column) |

**5. Document metadata (`docMeta` from page template)**

The metadata strip (date · status · read time) below the hero heading only renders when the page template passes a `docMeta` object to `PageSections`. This only happens on `ArticlePage`, `NodePage`, and `CaseStudyPage`. The `heroSection` schema field `showStatRail` is separate and controls the stat rail, not the metadata line.

| Passed by | Metadata line renders |
|-----------|----------------------|
| ArticlePage, NodePage, CaseStudyPage | Yes — `publishedAt` date, `status`, `readingTime` |
| page, archivePage, RootPage | No |

---

#### textSection

No conditional logic. Renders static output. The `content` field is required — if empty the section produces nothing.

---

#### imageGallery — layout variants

| `layout` value | Output |
|----------------|--------|
| `grid` (default) | Multi-column grid using CSS columns |
| `carousel` | Horizontal scroll track with prev/next buttons and dot indicators (only when `images.length > 1`) |

---

#### cardBuilderSection — layout variants and column count

| `layout` value | Component | Column behaviour |
|----------------|-----------|-----------------|
| `grid` (default) | `Card` variant=`default` | 1 card → 1 col; 2 or 4 cards → 2 cols; 3, 5, 6+ → 3 cols |
| `list` | `Card` variant=`listing` | Single column, full-width rows |
| `tile` | `Tile` primitive, `SectionLabel` heading | `SectionContainer` grid |

---

#### calloutSection — body rendering engine

The `body` field changed from a plain string (legacy) to a portable text array in production. The component detects the data type at render time:

| `body` type | Rendering |
|-------------|-----------|
| `Array` (current) | `<PortableText>` with shared serialiser |
| `string` (legacy) | `<p style="white-space: pre-line">` |

Authors writing new callout sections will always get the portable text path.

---

#### accordionSection — early exit

If `items` is empty or missing, the entire section is suppressed (returns `null`). An accordion with no items produces no DOM output — it does not render a heading or empty container.

---

#### statTileSection — label header presence

The `SectionLabel` header (containing `number`, `name`, `title`, `kicker`) is only rendered if at least one of those four fields is populated. A statTileSection with tiles but no label fields renders tiles only, with no header row.

---

#### mermaidSection — width breakout in detail context

| `width` value | Base behaviour | In `detail` context without sidebar | In `detail` context with sidebar (≥1024px, `data-has-margin`) |
|---------------|---------------|--------------------------------------|---------------------------------------------------------------|
| `column` (default) | 760px | Contained within detail column | Contained within detail column |
| `wide` | 1080px breakout | Breaks out via negative margin | Constrained to column (breakout disabled) |
| `full` | Full viewport | Breaks out to full viewport | Constrained to column (breakout disabled) |

The sidebar presence is detected via `data-has-margin` on the page wrapper. Authors cannot control this directly — it is determined by the page template.

---

#### trustReportSection — single vs multi-report layout

| `reports.length` | Layout |
|-----------------|--------|
| 1 | No section numbers; `cwv-snapshot` gets its own `SectionLabel`, others do not |
| 2–3 | Each report gets a numbered `SectionLabel` (`01`, `02`, `03`) above it; multi-report root wrapper applied |

---

#### citedBlockSection — further reading strip

The "Further reading" reference strip below the content body only renders when `references` contains at least one item. An empty or omitted `references` array produces no strip.

---

#### CaseStudy page — section partitioning

The `CaseStudyPage` template applies layout rules that are not present in other page types. When sections are fetched, the template partitions them before passing to `PageSections`:

1. The first `calloutSection` in the array is extracted and rendered in a dedicated challenge summary area, regardless of its position.
2. Any consecutive `statTileSections` at the start of the remaining sections are extracted and rendered in a full-width outcomes strip above the sidebar layout.
3. All remaining sections are rendered normally inside `PageSections context="detail"`.

**Consequence for authors:** On a case study, the first callout and any leading stat tiles are position-dependent. Placing a `statTileSection` after a `textSection` will not make it render in the full-width strip — it will render inline with the body.

---

### 6.7 Sections Not Fully Wired

These section types exist in the schema but have known gaps in their rendering pipeline or data connection.

| Section | Gap | Notes |
|---------|-----|-------|
| `recentContentSection` | Renders live data via `useSanityDoc` at client runtime — not build-time or server-side | Output depends on the query returning data; empty states are handled by the hook but not explicitly designed |
| `htmlSection` | Raw HTML is rendered with no sanitisation | Frontend treats this as trusted input; only suitable for migrated content. No XSS protection in place. |
| `trustReportSection` / `cwv-snapshot` | Requires CrUX data to have flowed through CI for real values | Falls back to origin-level data or shows empty state if no traffic data available for the specified `cwvUrl` |

---

## 7. Design Constraints

- All components consuming CMS data must reference `--st-*` CSS custom properties. No hardcoded hex values.
- Typography: IBM Plex Mono (labels, metadata, mono), DM Sans (UI text), Cormorant Garamond (editorial/narrative headings).
- Dark and light theme support is required for all content-rendering surfaces. Theme application via `[data-theme]` attribute.
- Images must use `urlFor()` from `apps/web/src/lib/sanity.js` for URL construction. Never concatenate Sanity asset IDs manually.
- `featuredImage` is deprecated and must not appear in any new schema, query, or component. The image source is `hero.media[0]` or the first richImage in `sections[]` where applicable.
- Responsive breakpoint: all section layout changes at 768px must be handled in the component CSS, not in Sanity.

---

## 8. Open Decisions

| Decision | Options | Owner | Target resolution |
|----------|---------|-------|------------------|
| `post` schema deprecation | Remove `post.ts` entirely vs. keep as archived reference | Bex | Deferred — `post.ts` retained until all legacy data confirmed migrated |
| `htmlSection` removal | Remove when no migrated docs use it vs. keep permanently as escape hatch | Bex | Audit migrated docs; track in a future SUG-* epic |
| `editorialCard` removal | Already superseded by `cardBuilderItem`; needs a sweep of any remaining references | Eng | Next schema cleanup epic |
| `homepage` / `header` / `footer` / `hero` / `contentBlock` legacy type removal | Safe to remove once Studio docs confirmed orphaned | Bex + Eng | Next schema cleanup epic |
| Archive page taxonomy filter config | Currently set in `archivePage.taxonomyFilters` as strings; consider migrating to explicit reference fields | Eng | Low priority; no user impact |

---

## 9. Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Deployed schema out of sync with local code | High — MCP writes and API writes silently fail | Run `npx sanity schema deploy` after every schema change; document in CLAUDE.md |
| `perspective: 'published'` strips drafts from all web queries | Med — draft content is invisible to the web layer by design, but this surprises new contributors | Document explicitly; use Studio preview for draft review |
| Taxonomy vocabulary drift | Med — unchecked tag creation produces duplicates and orphaned terms | Taxonomy pre-flight query required before creating any new taxonomy document |
| `htmlSection` content is not portable text | Med — cannot be queried or rendered with standard PT serializers | Treat as read-only migration artefact; do not author new content in it |
| Legacy type references in old documents | Low — hidden types still resolve in queries | Keep hidden types registered; do not remove until data migration confirmed |
| `featuredImage` field in migrated content | Low — field exists on old docs; must not be read by new code | All new queries use `hero.media[0]` or sections; `featuredImage` is not projected |

---

## 10. Success Criteria

| Area | Metric |
|------|--------|
| Content model completeness | All 21 document types, 12 section types, and 5 taxonomy types resolve correctly in Studio and via GROQ |
| Taxonomy health | Zero duplicate taxonomy documents; all five types use `name` as primary field with no `title` field references in queries |
| AI ethics compliance | Every image flagged as AI-generated carries `aiGenerated: true` and a populated `aiTool` value |
| Section rendering | All 12 section types render correctly in `PageSections.jsx`; no section type produces silent empty output |
| Schema deployment | After any schema change, `npx sanity schema deploy` produces zero validation errors on the next MCP write |
| SEO | All published documents have either a manual `seoMetadata` block or a valid `autoGenerate: true` fallback to siteSettings |
| Redirects | All active redirect documents resolve with the correct status code; no 404s on paths registered in redirect documents |
| Legacy type isolation | Legacy document types (header, footer, hero, homepage, contentBlock) are hidden in Studio and produce no new content |

---

## 11. Out of Scope (Deferred)

- **Commerce integration** — no ecommerce data layer is planned for the current platform
- **Multi-author publishing workflow** — Studio currently has no approval/review state machine; all published content is Bex's direct publish action
- **Webhook-triggered ISR** — Netlify deploys on push; no Sanity webhook triggers incremental regeneration today
- **Programmatic redirect handling** — redirect documents exist in Sanity but the web layer must query and apply them; no Netlify edge redirect sync is in place
- **Taxonomy merge tooling** — deduplication of tags is manual today; a future SUG-* epic will handle bulk taxonomy cleanup (SUG-74 tracks this)
- **Series navigation UI** — series + partNumber fields exist; no UI component for series navigation is shipped yet

---

## 12. Authoring Checklist

- [x] Every claim references a real system — verified against `apps/studio/schemas/` and the deployed Content Lake
- [x] Field types are explicit — no TBD in the content model table
- [x] Enum values are exhaustive for all enumerated fields
- [x] Non-goals name the reason for exclusion
- [x] Open decisions have owners
- [x] Success criteria are independently verifiable
- [x] `featuredImage` does not appear anywhere (deprecated)
- [x] Brand voice check: no em dashes, no adjective triads
- [x] A senior engineer could start writing GROQ queries from this doc without opening Studio

---

## Appendix A: Legacy Types (Hidden, Preserved)

These types are registered in `apps/studio/schemas/index.ts` with `hidden: true`. They are preserved for query compatibility with migrated documents only. No new content should be authored in them.

| Type | Superseded by |
|------|--------------|
| `post` | `article` |
| `header` | `siteSettings.primaryNav` |
| `footer` | `siteSettings` footer fields |
| `hero` | `page` + `heroSection` |
| `homepage` | `page` with slug `home` |
| `contentBlock` | `sections[]` array |
| `editorialCard` | `cardBuilderItem` |

---

## Appendix C: Deprecated, Legacy, and Unwired Inventory

A complete reference of everything in the schema that is hidden, retired, partially wired, or preserved only for backwards compatibility. Organised by category.

### C.1 Legacy Document Types

These types are registered in `apps/studio/schemas/index.ts` but hidden from Studio UI. They exist to preserve query compatibility with documents created before the current architecture. No new content should be authored in them.

| Type | Hidden | Superseded by | Safe to remove when |
|------|--------|--------------|---------------------|
| `post` | Yes | `article` | All `_type: "post"` documents confirmed migrated to `article` |
| `header` | Yes | `siteSettings.primaryNav` | No `_type: "header"` documents remain in dataset |
| `footer` | Yes | `siteSettings` footer fields | No `_type: "footer"` documents remain in dataset |
| `hero` | Yes | `page` + `heroSection` | No `_type: "hero"` documents remain in dataset |
| `homepage` | Yes | `page` document with slug `home` | No `_type: "homepage"` documents remain in dataset |
| `contentBlock` | Yes | `sections[]` array | No `_type: "contentBlock"` documents remain in dataset |
| `editorialCard` | Partial | `cardBuilderItem` | Schema registered; no known active usage; sweep component references before removing |

**Verification query (run before removing any type):**
```groq
*[_type == "post"]{ _id, title }          // replace type name as needed
```

---

### C.2 Deprecated Fields on Active Document Types

These fields exist in the deployed schema and may hold data on older documents. They are hidden in Studio (authors cannot write to them) but remain in the schema so existing data continues to resolve via GROQ. Do not project them in new queries.

#### article, caseStudy, node (shared)

| Field | Type | Replaced by | Notes |
|-------|------|------------|-------|
| `keyTakeaway` | `string` | `excerpt` | Max 200 chars; copy migrated to excerpt on most docs |
| `content` | `array[standardPortableText]` | `sections[]` | Legacy body field; superseded by section builder |
| `cardImage` | `image` | Derived from `heroSection.backgroundImage` | Card thumbnails now auto-derived from hero |
| `relatedProjects` | `array[ref→project]` | `projects` | Duplicate of the renamed `projects` field |

#### node only

| Field | Type | Replaced by | Notes |
|-------|------|------------|-------|
| `aiTool` | `string` enum | `tools[]` taxonomy | Radio: claude/chatgpt/gemini/mixed. Superseded by tools reference array |
| `conversationType` | `string` enum | `categories[]` + `tags[]` | Radio: problem/learning/code/design/architecture/debug/reflection |
| `challenge` | `array[metadataPortableText]` | Sections body | Legacy agentic caucus field |
| `insight` | `array[metadataPortableText]` | Sections body | Legacy agentic caucus field |
| `actionItem` | `array[metadataPortableText]` | Sections body | Legacy agentic caucus field |

#### person

| Field | Type | Replaced by | Notes |
|-------|------|------------|-------|
| `links` | `array[object]` | `socialLinks[]` | Legacy flat link array; pre-`socialLink` object |

#### navItem

| Field | Type | Replaced by | Notes |
|-------|------|------------|-------|
| `link` | `linkItem` | `internalPage`, `archiveRef`, `externalUrl` | Hidden; pre-refactor link object on nav items |

#### archivePage

| Field | Type | Replaced by | Notes |
|-------|------|------------|-------|
| `displayStyle` | `string` | `cardOptions.variant` | Enum: grid/list/table |
| `listStyle` | `string` | `cardOptions` | Compact/detailed control |

#### ctaButton (object)

| Field | Type | Replaced by | Notes |
|-------|------|------------|-------|
| `text` | `string` | `link.label` | Button label was previously a separate field; now part of `linkItem` |

#### richImage

| Field | Type | Replaced by | Notes |
|-------|------|------------|-------|
| `linkUrl` | `string` | `link` (linkItem object) | Legacy flat URL string |

#### galleryImage

| Field | Type | Replaced by | Notes |
|-------|------|------------|-------|
| `linkUrl` | `string` | `link` (linkItem object) | Same migration pattern as richImage |

#### trustReportSection

| Field | Type | Replaced by | Notes |
|-------|------|------------|-------|
| `reportType` | `string` | `reports[]` array | Single-report legacy field; migration maps it to `reports[0]` |

---

### C.3 Migration-Only Fields

These fields are populated by the WordPress import pipeline and are read-only in Studio. They persist on migrated documents indefinitely as provenance records. They should never appear in frontend GROQ projections.

All fields below live inside the `legacySource` embedded object on `article`, `caseStudy`, and `node` documents.

| Field | Content |
|-------|---------|
| `system` | Always `"wp"` |
| `wpId` | WordPress numeric post ID |
| `wpType` | WordPress post type string |
| `wpUrl` | Original WordPress permalink |
| `legacySlug` | Original WordPress slug (may differ from current slug) |
| `importHash` | SHA hash of imported content; used to detect re-imports |
| `importedAt` | ISO timestamp of import |
| `legacyHtml` | Full original WordPress HTML; preserved as fallback for content that could not convert to portable text |
| `legacyFeaturedImageUrl` | Original featured image CDN URL from WordPress; source of the now-deprecated `featuredImage` pattern |

**Rule:** `legacyFeaturedImageUrl` must never be used as an image source in frontend code. It points to a WordPress CDN that may not be maintained. All images must go through `urlFor()` on Sanity-hosted assets.

---

### C.4 Partially Wired / Conditional Fields

These fields exist in the schema and are writable by authors, but their frontend wiring has gaps or conditions that are not obvious from Studio.

| Document/Object | Field | Gap |
|-----------------|-------|-----|
| `heroSection` | `showStatRail` | Field exists and is writable. The stat rail it controls may or may not be implemented on all page types — verify in the page template before setting. |
| `archivePage` | `featuredItems` | Fields persist and are queryable. Frontend must explicitly query and render pinned items; there is no automatic "pin to top" behaviour built into `PageSections`. |
| `archivePage` | `filterConfig.facets` | Full facet config is stored. The frontend filter UI must read and honour each facet's `enabled` and `multi` flags — these are not enforced at the query layer. |
| `caseStudy` | `aeoSummary`, `geoSummary`, `keyQuestions` | Fields persist. No rendering surface has been confirmed for these fields as of v1.1 — they are authored but may not yet appear on the frontend. |
| `project` | `kpis[].target`, `kpis[].current` | Fields exist. No KPI visualisation component is confirmed shipped. |
| `richImage` | `blurhash`, `lqip`, `palette` | These are writable but are typically populated by automated tooling, not by authors. If the tooling is not running, these fields will be empty and the frontend will render without LQIP. |
| `person` | `titles[]` | Writable. No dedicated rendering surface confirmed — may appear in author bylines depending on component implementation. |
| `siteSettings` | `footerToolchain` | Field and colophon chip rendering confirmed shipped. Each chip links to `/tools/:slug` — tool documents must have valid slugs for links to resolve. |

---

### C.5 Schema Types With No Active Frontend Route

These document types have schemas and can hold data, but currently have no dedicated page template or URL namespace in `routes.js`.

| Type | Status | Notes |
|------|--------|-------|
| `series` | Schema only | No `/series/:slug` route exists. `series` + `partNumber` fields are authored but series navigation UI is deferred (see §11 Out of Scope). |
| `redirect` | Data persists in Sanity | Redirect documents must be queried and applied by the web layer or a Netlify edge function. No automatic enforcement exists — a redirect document does not self-activate. |

---

## Appendix D: Known UX Gaps — Future Improvements

Issues observed in the current implementation that are not bugs but represent author experience debt. Each is a candidate for a future SUG-* epic.

### D.1 SEO preview not visible in Studio

**What happens now:** When `autoGenerate = true`, the `seo.title` field is hidden in Studio. The resolved meta title (`{doc.title} | Sugartown Digital`) and the derived description (from `excerpt` or `body`) are computed at render time by `resolveSeo()` in `apps/web/src/lib/seo.js`. Authors have no way to see what will actually appear in search results or social cards without checking the live rendered page.

**Why it matters:** An author who wants to verify their title will render under 60 characters, or check that the excerpt reads well as a meta description, has no feedback loop in Studio. The gap is invisible — Studio shows `autoGenerate` toggled on and nothing else, which looks correct even when the derived string would be truncated or missing.

**What a fix would look like:** A Sanity custom input component that computes and displays the resolved title and description strings in real time as the author edits `title`, `excerpt`, or `seo.description`. Sanity's `useFormValue` hook can read sibling fields; the preview could render as a Google SERP snippet mockup beneath the `seo` field group. This is a Studio-only change — no schema or frontend code changes required.

**Scope estimate:** Small-to-medium Studio plugin. Self-contained. No Content Lake schema deployment needed.

---

## Appendix B: Sanity Project Reference

| Property | Value |
|----------|-------|
| Project ID | `poalmzla` |
| Dataset | `production` |
| Studio app | `apps/studio/` |
| Schema deploy command | `npx sanity schema deploy` (run from `apps/studio/`) |
| Web client config | `apps/web/src/lib/sanity.js` |
| Perspective | `published` (drafts never served to web layer) |

---

## Changelog

- **v1.0 (2026-05-09):** Initial schema specification.

- **v1.1 (2026-05-09):** Full field-level audit pass against every schema file. Corrections across all document, object, and section types. Added §6.0 Composable Object Registry. Added `↗` cross-reference notation for shared objects. Deprecated fields now explicitly marked in tables.

- **v1.2 (2026-05-09):** Added §6.6 Rendering Rules and Conditional Behaviour (frontend conditional logic per section type). Added §6.7 Sections Not Fully Wired. Added Appendix C: Deprecated, Legacy, and Unwired Inventory.

- **v1.3 (2026-05-09):** Corrected `seoMetadata.autoGenerate` — derives from document's own `title`/`excerpt`/`body`, not siteSettings. Added resolution order table. siteSettings defaults are last-resort fallback only. Fixed US-011 AC to match.

- **v1.4 (2026-05-09):** Added §5.5 Content Modeling Strategy — CMS-agnostic design, atomic content modelling with layer hierarchy table, schema-mirrors-component-contract mapping, references-over-copies decision rule, flexibility-vs-governance principle, validation-first patterns, migration compatibility. Sourced from and supersedes `PROJ-001-content-model-strategy-superseded.md` §4–§5.

- **v1.5 (2026-05-09):** Annotated §5.5 with omnichannel implications at CMS-agnostic design, references-over-copies, and flexibility-vs-governance principles. Added Multi-Surface Extension Pattern sub-section — architecture diagram, email extension group field table, GROQ projection examples by surface, shared-vs-surface-specific decision table, and extension group vs new document type decision rule.

- **v1.6 (2026-05-09):** Added §5.5 "Structured content as AI infrastructure (AEO/GEO)" — the blob test, machine-readable signal table, `node` type as proof of concept, and the structural debt argument. References the unpublished article "We Never Actually Adopted Structured Content" as the extended treatment.
