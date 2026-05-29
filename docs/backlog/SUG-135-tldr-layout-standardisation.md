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

After this epic, every document with a TL;DR section renders it identically: heading label `TL;DR` (uppercase, no trailing colon), h2 level, pink colour (inherits from the h2 pink style already applied site-wide), and content in a blockquote block (left accent bar). No schema changes. No code changes. All affected documents published.

Layers touched: Sanity content only (`patch_document_from_json` on PT `content` fields). The Content Write Gate fires for each document — proposal table required before any patch.

## Scope

- [ ] **Audit** — query all published articles, nodes, and case studies for the presence of a TL;DR heading in `content[]`. Identify: (a) heading label variant, (b) heading level (`style`), (c) whether the following block is a `blockquote` style or `normal`. Layer: GROQ query (read-only)
- [ ] **Produce proposal table** — for each affected document, show current vs proposed PT block values. Gate: wait for explicit approval before any patch. Layer: Content Write Gate
- [ ] **Patch heading blocks** — for each approved document: set heading span text to `TL;DR`, set block `style` to `h2`. Layer: Sanity content (`patch_document_from_json`)
- [ ] **Patch content blocks** — for each approved document where the paragraph following the TL;DR heading is `style: "normal"`: set `style` to `blockquote`. Layer: Sanity content (`patch_document_from_json`)
- [ ] **Publish all patched documents** — publish each document after its patches are verified in Studio preview. Layer: Sanity publish

## Phases

Single-phase. All items are content-only; ship together.

## Acceptance criteria

- [ ] Proposal table produced and explicitly approved before any patch is applied
- [ ] All documents with a TL;DR section render: heading `TL;DR` (no colon), h2 level, pink, content in blockquote
- [ ] No document has `tl;dr`, `tl;dr:`, `TL;DR:`, or an h3 TL;DR heading after the pass
- [ ] All patched documents are published (not just patched as drafts)
- [ ] `validate-content.js` passes after publish with no new errors

## Technical notes

**Activation audit:** Before writing any patches, run the following GROQ to map the current state:

```groq
*[_type in ["article", "node", "caseStudy"] && defined(content)]{
  _id,
  _type,
  title,
  "tldrBlocks": content[
    lower(children[0].text) match "tl;dr*"
  ]{ _key, style, "text": children[0].text }
}[count(tldrBlocks) > 0]
```

This surfaces every document with a TL;DR heading, its current `style`, and the exact span text. Use this to build the proposal table.

**Blockquote vs calloutSection:** The correct treatment for TL;DR content is a PT `blockquote` block (sets `style: "blockquote"` on the paragraph immediately following the heading) — not a `calloutSection` schema object. The `calloutSection` is a separate section-builder type with its own label field and accent variants. PT blockquote is inline within the document body, which is the correct context for TL;DRs.

**Portable Text patch shape:** To change a block's style in-place, patch the specific block by `_key`:

```json
{
  "set": {
    "content[_key==\"<blockKey>\"].style": "blockquote"
  }
}
```

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
