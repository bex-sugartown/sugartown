# Structured Content Audit Brief

### *Converting blobs to models, section by section*

**Date:** 2026-04-08
**Status:** Working brief — informs future schema epics
**Companion:** Node draft: "We Never Actually Adopted Structured Content" (docs/drafts/)
**Related:** SUG-48 (schema field audit, done), SUG-21 (Pink Moon, in progress)

---

## The Thesis

Every content surface should pass the **headless summary test**: can the structured fields alone — no body text — tell you what this content is about, who made it, and where it fits in the taxonomy? If the answer is "no, the meaning is all in the blob," the model needs more fields.

This brief audits each content type and section type against that test, identifies the blobs, and proposes conversions.

---

## The Spectrum

Not all content needs to be fully decomposed. There's a spectrum:

| Level | Description | Example |
|-------|-------------|---------|
| **Fully structured** | Every meaningful unit is a named field. No prose blob. Queryable, facetable, reusable on any surface. | Taxonomy terms (tag, category, tool, project, person) |
| **Structured spine + narrative body** | Meaningful fields for classification, status, relationships. Body is prose (PortableText) for the story. | Nodes, articles, case studies |
| **Section-shaped** | Content is structured at the section level (hero, callout, accordion) but the section's internal content is often a blob. | Page sections via section builder |
| **Pure blob** | Freeform rich text with no structured metadata around it. Can't be queried, faceted, or reused. | Legacy `content` field (deprecated) |

The goal isn't to eliminate all blobs. It's to ensure every content type has enough structured spine that the blob is *commentary*, not the entire model.

---

## Content Type Audit

### Taxonomy Documents (Fully Structured ✅)

**Types:** tag, category, tool, project, person

These are pure structure — name, slug, description, colour, relationships. No blob. The headless summary IS the content. These are the backbone of the knowledge graph.

**No conversion needed.** These are the model.

---

### Node (Structured Spine + Narrative ✅ with gaps)

**Headless summary test:** Pass — mostly.

| Field | Structured? | Notes |
|-------|------------|-------|
| title | ✅ | |
| slug | ✅ | |
| excerpt | ✅ | Card-level summary |
| status (evolution) | ✅ | Exploring → Validated → Operationalized → Deprecated → Evergreen |
| authors[] | ✅ | Person references |
| tools[] | ✅ | Tool taxonomy references |
| categories[] | ✅ | Category references |
| tags[] | ✅ | Tag references |
| projects[] | ✅ | Project references |
| publishedAt | ✅ | |
| sections[] | 🟡 | Section-shaped, not pure blob. But see below. |
| aiTool | ❌ | Deprecated (SUG-48) — was a blob-adjacent string enum. Tools[] is the structured replacement. |
| conversationType | ❌ | Deprecated (SUG-48) — was a blob-adjacent string enum. Categories/tags are the structured replacement. |
| challenge / insight / actionItem | ❌ | Deprecated (style guide) — these were attempts to extract structure from the narrative arc. Good intent, wrong execution — they duplicated the body content instead of complementing it. |

**Gaps:**
- **No `relatedNodes` field.** Cross-references between nodes are implicit (shared tags/categories) not explicit. A `relatedNodes[]` reference array would make the knowledge graph queryable without body text parsing.
- **No `difficulty` or `audience` field.** Who is this node for? What prerequisite knowledge does it assume? These are structured dimensions that live in the author's head but not the schema.
- **No `keyTakeaway` field.** The style guide says the lesson is in the narrative arc. But a single-sentence structured takeaway would make the headless summary much richer.

**Proposed additions (future epic):**
```
relatedNodes[]     → array of reference to node (explicit cross-links)
keyTakeaway        → string (single sentence, structured, not a blob)
audience           → string enum: beginner | practitioner | expert
```

---

### Article (Structured Spine + Narrative ✅ with gaps)

**Headless summary test:** Weaker than node.

| Field | Structured? | Notes |
|-------|------------|-------|
| title | ✅ | |
| slug | ✅ | |
| excerpt | ✅ | |
| authors[] | ✅ | |
| tools[] | ✅ | |
| categories[] | ✅ | |
| tags[] | ✅ | |
| projects[] | ✅ | |
| publishedAt | ✅ | |
| sections[] | 🟡 | Same section builder as node |

**Gaps:**
- **No `status` field.** Articles don't have lifecycle status (unlike nodes). Is this correct? Articles might benefit from a publication status (draft/published/archived) beyond Sanity's native state — especially for editorial workflow visibility.
- **No `series` or `collection` field.** Multi-part articles have no structured grouping. A `series` reference with `partNumber` would make article sequences queryable.
- **No `readingTime` field.** Currently derived client-side from word count. A structured field (or computed field) would make it available to cards without rendering the body.

**Proposed additions (future epic):**
```
series             → reference to a "series" document (new doc type)
partNumber         → number (position within series)
readingTime        → number (minutes, computed or manual)
```

---

### Case Study (Structured Spine + Narrative ✅ — strongest model)

**Headless summary test:** Best of the three content types.

| Field | Structured? | Notes |
|-------|------------|-------|
| title | ✅ | |
| slug | ✅ | |
| excerpt | ✅ | |
| client | ✅ | |
| role | ✅ | |
| contractType | ✅ | full-time / contract / freelance / advisory |
| employer | ✅ | |
| dateRange | ✅ | Start + end date |
| authors[] | ✅ | |
| tools[] | ✅ | |
| categories[] | ✅ | |
| tags[] | ✅ | |
| projects[] | ✅ | |
| publishedAt | ✅ | |
| sections[] | 🟡 | |

Case studies have the richest structured spine — client, role, contract type, date range. The headless summary alone tells you: who, what, when, for whom, with what tools.

**Gaps:**
- **No `outcomes` or `results` field.** What happened? Quantified results (revenue, speed, satisfaction) are in the narrative blob. A structured `outcomes[]` array with `metric` + `value` + `description` would make case studies queryable by impact.
- **No `industry` or `sector` field.** Client industry is implicit in the narrative. A structured enum or taxonomy ref would make filtering possible.

**Proposed additions (future epic):**
```
outcomes[]         → array of { metric: string, value: string, description: text }
industry           → reference to a taxonomy (or string enum)
```

---

### Page (Minimal Structure — relies on section builder)

**Headless summary test:** Fails. Pages are pure section containers.

| Field | Structured? | Notes |
|-------|------------|-------|
| title | ✅ | |
| slug | ✅ | |
| template | ✅ | default / full-width / sidebar |
| parent | ✅ | Hierarchy |
| sections[] | 🟡 | The entire content is here |

Pages have almost no structured spine. They're layout containers — "put these sections on this URL." That's by design for static pages (About, Services, Contact, Platform) where the content is bespoke.

**This is acceptable.** Not every content type needs a rich model. Pages are the "brochure" type — they exist to compose sections. The structure is in the sections, not the page.

**No conversion proposed** — but individual section types should be audited (see below).

---

## Section Type Audit

This is where the blobs live. Each section type in the `sections[]` array is a content block. Some are structured. Some are blobs with names.

### heroSection ✅ Structured

| Field | Structured? |
|-------|------------|
| heading | ✅ |
| subheading | ✅ |
| backgroundStyle | ✅ enum |
| backgroundImage + hotspot | ✅ |
| imageTreatment (overlay) | ✅ |
| imageWidth | ✅ enum |
| ctas[] | ✅ (url, label, style) |

**Verdict:** Fully structured. Every field has a purpose and a constraint. The hero is a model, not a blob. No conversion needed.

### textSection 🟡 Blob (the main one)

| Field | Structured? |
|-------|------------|
| heading | ✅ |
| content (PortableText) | 🟡 |

This is the primary narrative container. `content` is PortableText — which supports inline marks (links, citations, code), block types (lists, blockquotes), and custom types (images, dividers). It's a *better* blob than raw HTML, but it's still freeform prose.

**Should it be decomposed?** Mostly no. Narrative content IS prose. You can't field-ify a story. But you can extract structured metadata *from* the prose:

**Potential enrichments (not fields — computed or AI-assisted):**
- Word count (for reading time)
- Heading extraction (for table of contents)
- Link extraction (for bibliography/references)
- Entity extraction (people, tools, projects mentioned in body text but not in taxonomy fields)

These don't change the schema — they're derived views of the blob content. The blob stays, but the system can query around it.

### imageGallery ✅ Structured

Images with alt text, captions, overlay config. Fully structured.

### ctaSection ✅ Structured

Heading + CTA buttons with url/label/style. Structured.

### calloutSection ✅ Structured

Variant (info/tip/warn/danger), title, icon, content (PortableText). The variant and title are structured. The body is a small blob — acceptable for a callout-sized chunk.

### cardBuilderSection ✅ Structured

Cards with title, body (small PT blob), tags, citations, titleLink, image, overlay. The structured fields (title, tags, link, image) carry most of the meaning. The body blob is supplementary.

### accordionSection ✅ Structured

Heading + items[] with trigger (text) + content (PortableText). Trigger is structured. Content is a small blob per item — acceptable for FAQ/collapsible patterns.

### mermaidSection ✅ Structured

Heading + mermaid code (string). The code IS the structure — it's a diagram definition, not prose.

### htmlSection ❌ Pure Blob

Raw HTML string. The legacy escape hatch. Used for migrated WordPress content that hasn't been converted to native section types.

**Conversion path:** Each htmlSection should be reviewed and migrated to the appropriate native section type (textSection, imageGallery, calloutSection, etc.). SUG-34 (Table Migration) already did this for `<table>` blocks. The remaining htmlSections should be inventoried and converted.

**Proposed action:** Run a GROQ query to count remaining htmlSections across all documents. If < 10, convert manually. If > 10, write a migration script.

---

## The Test: Could AI Render This Without the Body?

For each content type, here's what an AI (or an API consumer, or a card component) gets from structured fields alone:

**Node headless summary:**
> "Post-Mortems as System Upgrades" — a validated node by Becky Alice, filed under AI Collaboration, tagged post mortem + agentic caucus + source control. Tools: Claude Code, ChatGPT, Gemini. Project: Sugartown CMS. Published March 2026.

That's a useful summary. The blob adds the story, but the model tells you what the story is about.

**Article headless summary:**
> "Typography at Scale: Variable Fonts in Production" — by Becky Alice, filed under Engineering. Tools: Figma, Storybook. Published January 2024.

Thinner. No status, no audience indicator, no series context. The blob carries more weight here.

**Case study headless summary:**
> "Building a Token-Driven Design System for a Live Product" — contract work for [client], role: Content Architect, using Figma + Storybook + Sanity. Filed under Design Systems + CSS + Tokens. March 2025.

Rich. The structured fields tell you almost everything. The blob adds the narrative detail.

---

## Priority Actions

### Immediate (schema changes, no migration)
1. ~~Deprecate aiTool, conversationType, challenge/insight/actionItem~~ — Done (SUG-48)
2. Inventory remaining `htmlSection` usage — GROQ count query
3. Add `relatedNodes[]` to node schema (explicit knowledge graph edges)

### Near-term (small schema additions)
4. Add `keyTakeaway` (string) to node
5. Add `readingTime` (number) to article + node
6. Add `outcomes[]` to case study

### Future (new doc types + enrichments)
7. `series` doc type for multi-part articles
8. Computed enrichments: word count, heading extraction, entity extraction from PT body
9. `industry` taxonomy for case studies
10. `audience` enum for nodes

---

## The Enforcer Rule

From the rant:

> **Every interface must resolve into a structured content model before it ships.** Visual exploration is fine. Shipping a blob is not.

For Sugartown, this translates to:

**Before any new section type or content type ships, it must pass the headless summary test.** The structured fields alone — rendered as a card, an API response, or a taxonomy facet — must communicate what the content is about. If they can't, the model needs more fields.

Add this to the epic template Pre-Execution Completeness Gate:
```
- [ ] **Headless summary test** — can the structured fields alone (no body/PortableText)
      communicate what this content is about? If not, add fields until they can.
```

---

*This brief is the audit. What survives into schema epics should be the specific field additions. The philosophy survives into the epic template as a gate.*
