---
**Epic:** SUG-142 — AI Ethics doc v2026.06.01 — Magnifica Humanitas update
**Linear Issue:** [SUG-142](https://linear.app/sugartown/issue/SUG-142/ai-ethics-doc-v20260601-magnifica-humanitas-update-principle-13)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — content-only, one patch, one mini-release
---

# SUG-142 — AI Ethics doc v2026.06.01

Update the published /ai-ethics page in Sanity to the approved v2026.06.01 brief, incorporating the Magnifica Humanitas governance arguments, restored Principle 13, and updated references.

## Background

The AI Ethics brief was reviewed on the June cadence. Pope Leo XIV's *Magnifica Humanitas* (25 May 2026) directly addresses data ownership, participatory governance, and AI decision-making concentration — all of which map to existing principles. The brief has been updated and approved. The Sanity document needs patching to match.

The Sanity page structure uses accordion items for principles (summary titles + body) and a canonical references accordion. Most accordion body content is null in the current doc — this update is also the opportunity to populate those bodies with the full principle prose.

**Brief:** `docs/briefs/ai-ethics-and-operations.md` (v2026.06.01, approved)
**Sanity doc:** `wp.page.1644`

## Scope

- [ ] Update principles accordion: update titles where changed; populate body for all 13 items — layer: content/Studio
- [ ] Add Principle 13 accordion item body (AI-Generated Content Requires Labelling) — layer: content/Studio
- [ ] Add "Humanitarian & Institutional Ethics" accordion item to references accordion — layer: content/Studio
- [ ] Add "US Federal & State Regulation" entry to Regulatory & Policy accordion item — layer: content/Studio
- [ ] Update TL;DR callout body — minor wording fix (dashes vs. commas) — layer: content/Studio
- [ ] Add citation/endnote for Footnote [1] (Tolkien/Magnifica Humanitas) — layer: content/Studio

## Acceptance criteria

- [ ] All 13 principle accordion items have populated body content matching v2026.06.01 brief
- [ ] References accordion contains "Humanitarian & Institutional Ethics" as a new item
- [ ] Footnote [1] appears in or linked from Principle 2 body
- [ ] Content Write Gate proposal approved before any patch executes
- [ ] Page published and live at /ai-ethics

## Technical notes

- **Content Write Gate**: fired and approved 2026-06-02. Proposal presented and confirmed before any patch executed. See gate record below.
- **Sanity doc ID**: `wp.page.1644` (published); `drafts.wp.page.1644` (draft — all patches target the draft)
- **Accordion content field**: `content` (not `body`) — confirmed from schema. `body` is null on all items; `content` holds the PT.
- **Accordion keys (principles)**: `d7356bd2aee8` (section), items `409e169b9b7f` through `2d00c3c747b8` (#1-12) + `f82abf9419d5` (#13)
- **Accordion keys (references)**: `6c54ff987af2` (section), items `c55f985a6158` through `56f961af28cb`
- **Portable Text rules**: every block needs `markDefs: []`, every span needs `marks: []` — omitting these makes Studio blocks read-only
- **citationRef in accordion items**: `compactPortableText` (accordion) uses a standalone `citationRef` with `index` field — safe to use. The CLAUDE.md warning about `citationRef` locking PT applies to `textSection.content` (full PT), not `compactPortableText`. In this update, plain `[1]` text was used in the blockquote to be conservative; the citation is in the document-level `citations[]` array.
- **Patch strategy**: one `patch_document_from_json` call per modified item; references accordion items array set as a whole to preserve insertion order
- **Model & Mode**: `/model sonnet` — pure content authoring

### Content Write Gate record — 2026-06-02

Approved changes (proposal presented, "yes" received before execution):

| Item | Change |
|------|--------|
| #2 Purpose Before Power (`17b48ec68e45`) | Added 4 blocks: test paragraph ("The useful test…"), Tolkien blockquote with `[1]` marker, gloss paragraph, italic personal aside — before existing "In practice: `grep`" block |
| #4 Data Is Not a Free Buffet (`b97e6eeeaa3e`) | Inserted 1 italic block (Pope Magnifica Humanitas data ownership quote) after "Consent matters" block |
| #8 Governance Is a Feature (`c5ea93bd7b2f`) | Inserted 1 block (external accountability paragraph, **On external accountability:** bold lead) after intro block |
| References accordion (`6c54ff987af2`) — new item `ref_humanitarian` | Added "Humanitarian & Institutional Ethics (Magnifica Humanitas, Rome Call)" between Regulatory and Model Providers items; 2 PT blocks with bold lead + URL for each reference |
| References item `c4d746772e3d` title | Updated from "Regulatory & Policy (EU AI Act, US Executive Order, state laws)" to "Regulatory & Policy (EU AI Act, US & state regulation)" |
| Document-level `citations` | Set citations array with one `citationItem`: key `cite_1`, Tolkien/Magnifica Humanitas footnote text, URL to encyclical, label "Magnifica Humanitas, §213" |

Items #1, 3, 5–7, 9–13 — not touched. Existing content richer than brief; preserved verbatim.

## Model & Mode [REQUIRED]

`/model sonnet` — pure content/editorial epic, no code changes.

## Non-Goals

- No code, CSS, or schema changes
- Not a full prose migration of the text sections (those remain null — addressed in a future content migration epic if needed)
- Does not redesign the page layout

## Related

- **Linear:** [SUG-142](https://linear.app/sugartown/issue/SUG-142/ai-ethics-doc-v20260601-magnifica-humanitas-update-principle-13)
- **Brief:** `docs/briefs/ai-ethics-and-operations.md`
- **Epic template:** `docs/epic-template.md`
