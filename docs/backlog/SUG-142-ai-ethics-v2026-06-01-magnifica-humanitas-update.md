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

- **Content Write Gate**: fires — all body content is AI-drafted from the approved brief. Show before/after proposal before patching.
- **Sanity doc ID**: `wp.page.1644`
- **Accordion keys (principles)**: `d7356bd2aee8` (section), items `409e169b9b7f` through `2d00c3c747b8` (#1-12) + `f82abf9419d5` (#13)
- **Accordion keys (references)**: `6c54ff987af2` (section), items `c55f985a6158` through `56f961af28cb`
- **Portable Text rules**: every block needs `markDefs: []`, every span needs `marks: []` — omitting these makes Studio blocks read-only
- **citationRef in nested fields**: do NOT use `citationRef` mark type in accordion item body content — it locks the entire PT field in Studio. Use plain spans with superscript text for footnote markers instead.
- **Patch strategy**: one `patch_document_from_json` call per accordion item body to avoid rate limits and allow per-item review
- **Model & Mode**: `/model sonnet` — pure content authoring

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
