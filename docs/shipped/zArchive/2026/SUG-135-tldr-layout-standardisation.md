---
**Epic:** SUG-135 — TL;DR Layout Standardisation
**Linear Issue:** [SUG-135](https://linear.app/sugartown/issue/SUG-135)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-135 — TL;DR Layout Standardisation

Audit all article, node, and case study documents for TL;DR section treatment, standardise on a single canonical pattern, apply globally, and publish.

## Background

The TL;DR section appears on most long-form content documents but is inconsistently authored. Four variations observed in production:

| Doc | Heading label | Heading level/colour | Content treatment |
|-----|--------------|----------------------|-------------------|
| Article: "Or, How a 'Quick Tweak'..." | `tl;dr:` | h2, pink | Blockquote (left accent bar) ✅ |
| Node: POC Contentful/Vercel | `TL;DR` | h2, pink | Plain paragraph ❌ |
| Node: "The Epic That Executed Itself" | `TL;DR:` | h2, pink | Blockquote (left accent bar) ✅ |
| Node: "Resume Factory v3.0" | `tl;dr:` | h3, dark | Plain paragraph ❌ |

Inconsistencies: label capitalisation (`tl;dr` vs `TL;DR`), trailing colon (present or absent), heading level (h2 vs h3), heading colour (pink vs dark/default), and content treatment (blockquote with accent bar vs bare paragraph).

The blockquote/callout treatment is clearly the correct one — it visually anchors the TL;DR as a distinct navigational block, consistent with the intent of the section.

## Objective

After this epic, every document with a TL;DR section renders it identically: a `textSection` whose `heading` field is exactly `TL;DR` (uppercase, no colon), with body content in a Blockquote PT block. No schema changes. No code changes. All affected documents published.

Layers touched: Sanity content only (`patch_document_from_json`). The Content Write Gate fires for each document — proposal table required before any patch.

## Scope

- [ ] **Audit** — query all published articles, nodes, and case studies. For each, determine how the TL;DR is currently authored: (a) standalone `textSection` with a `heading` field value, (b) inline PT h2/h3 block inside a larger `textSection`'s `content` body, or (c) inline in a top-level `content` PT field. Map the current state before touching anything. Layer: GROQ query (read-only)
- [ ] **Produce proposal table** — for each affected document, show: current structure → proposed structure. Gate: wait for explicit approval before any patch. Layer: Content Write Gate
- [ ] **Patch `textSection.heading` field** — for sections that are already standalone TL;DR textSections: set `heading` to `TL;DR` (normalise label). Layer: Sanity content
- [ ] **Patch body blocks to Blockquote** — for each TL;DR section where the body paragraph is `style: "normal"`: set `style` to `blockquote`. Layer: Sanity content
- [ ] **Restructure inline TL;DRs** — for documents where the TL;DR is an h2/h3 inline inside a larger section's PT body: split into a standalone `textSection` (heading: `TL;DR`, content: the TL;DR paragraph as Blockquote). This requires inserting a new section array item and removing the heading+paragraph blocks from the existing section. Layer: Sanity content (more complex patch — draft carefully)
- [ ] **Publish all patched documents** — publish each after verifying in Studio preview. Layer: Sanity publish

## Phases

Single-phase. All items are content-only; ship together.

## Acceptance criteria

- [ ] Proposal table produced and explicitly approved before any patch is applied
- [ ] All documents with a TL;DR section render via a standalone `textSection` with `heading: "TL;DR"` and Blockquote body content
- [ ] No document has `tl;dr`, `tl;dr:`, `TL;DR:`, or an h3 TL;DR heading after the pass
- [ ] All patched documents are published (not just patched as drafts)
- [ ] `validate-content.js` passes after publish with no new errors

## Technical notes

**Canonical TL;DR structure:** A `textSection` item in `sections[]` with `heading: "TL;DR"` and the TL;DR paragraph authored as a Blockquote PT block in the `content` field. The `textSection`'s `heading` field renders as the pink section label — no PT heading block needed inside the content body.

**Activation audit:** Before writing any patches, run two queries:

```groq
// 1. Find sections[] textSections with a TL;DR-like heading
*[_type in ["article", "node", "caseStudy"] && defined(sections)]{
  _id, _type, title,
  "tldrSections": sections[_type == "textSection" && lower(heading) match "tl;dr*"]{
    _key, heading,
    "firstBlockStyle": content[0].style,
    "firstBlockText": content[0].children[0].text
  }
}[count(tldrSections) > 0]

// 2. Find inline TL;DR h2/h3 blocks buried inside a section's PT content
*[_type in ["article", "node", "caseStudy"] && defined(sections)]{
  _id, _type, title,
  "inlineTldr": sections[_type == "textSection"]{
    _key, heading,
    "tldrBlocks": content[lower(children[0].text) match "tl;dr*"]{ _key, style, "text": children[0].text }
  }[count(tldrBlocks) > 0]
}[count(inlineTldr) > 0]
```

Use both results together to build the full proposal table.

**Patch shape for `heading` field normalisation:**
```json
{ "set": { "sections[_key==\"<sectionKey>\"].heading": "TL;DR" } }
```

**Patch shape for body blockquote:**
```json
{ "set": { "sections[_key==\"<sectionKey>\"].content[_key==\"<blockKey>\"].style": "blockquote" } }
```

**Inline TL;DR restructure (more complex):** Where TL;DR is an h2/h3 block inside a larger section's PT content, the operation is: (1) insert a new `textSection` array item before the existing section with `heading: "TL;DR"` and the TL;DR paragraph as content, (2) remove the h2/h3 heading block and its following paragraph from the original section's `content`. Do this as two sequential patches — insert first, then remove — and verify in Studio before publishing.

**Content Write Gate:** Fires for every document. Present the full before/after table and wait for explicit per-document (or batch) approval before issuing any `patch_document_from_json` call.

**Model & Mode:** `/model sonnet` — pure content pass, no code or architecture decisions.

## Model & Mode [REQUIRED]

`/model sonnet` — pure content audit and patch. No code changes, no architecture decisions.

## Non-Goals

- No schema changes to article, node, or caseStudy
- No new `calloutSection` instances — blockquote PT style is the correct fix
- No changes to the blockquote CSS rendering (it already has the left accent bar treatment)
- No audit of other heading inconsistencies beyond TL;DR — that is separate scope

## Related

- **Linear:** [SUG-135](https://linear.app/sugartown/issue/SUG-135)
- **Epic template:** `docs/epic-template.md`
