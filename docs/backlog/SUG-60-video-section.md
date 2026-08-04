---
**Epic:** SUG-60 — Video Section — embedded video support (Vimeo, YouTube, uploaded)
**Linear Issue:** [SUG-60](https://linear.app/sugartown/issue/SUG-60/video-section-embedded-video-support-vimeo-youtube-uploaded)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
---

# SUG-60 — Video / embed section

## Background

Two case studies use `htmlSection` to embed third-party iframes: FX Networks (Vimeo
sizzle reel) and Backroads (Lucidchart customer journey map) — 2 of the 6 remaining
`htmlSection` blocks from the SUG-54 inventory. Raw iframe embeds are invisible to
editors, unstyled by the design system, and a security surface (`dangerouslySetInnerHTML`).

## Objective

A new `videoSection` (or `embedSection` — see naming note below) schema type replaces
both existing `htmlSection` embeds, reducing that inventory from 6 to 4, with editor-visible
fields instead of raw iframe HTML.

## Scope

- [ ] New schema type supporting: external embed (Vimeo/YouTube URL parsing, generic
      iframe fallback), uploaded video (Sanity `file` type), metadata (title, caption,
      aspect ratio), responsive `aspect-ratio` container, Pink Moon styling (zero radius,
      subtle border, Courier Prime caption), lazy-loading facade pattern, sandboxed
      iframe with explicit `allow` attributes — layer: schema + frontend renderer
- [ ] Migrate `wp.caseStudy.271` (FX Networks, Vimeo sizzle reel) from `htmlSection` to
      the new type — layer: content
- [ ] Migrate `wp.caseStudy.274` (Backroads, Lucidchart journey map) from `htmlSection`
      to the new type — layer: content

## Non-Goals

- `mux.video` plugin integration for self-hosted video — flagged as a future
  consideration, not this epic's scope
- Touching any of the other 4 remaining `htmlSection` blocks from the SUG-54 inventory

## Naming note

Field/type name: `videoSection` vs. `embedSection` — Lucidchart is not video, so
`embedSection` may be more accurate. Decide at activation, before writing schema code
(Atomic Reuse Gate / CSS-class-pre-implementation-audit spirit applies to schema naming
too).

## Acceptance Criteria

- [ ] New section type ships, both case studies migrated, `htmlSection` inventory at 4
- [ ] No `dangerouslySetInnerHTML` in the new component
- [ ] Lazy-loading facade verified (iframe does not load until user interaction)

## Related

- **Linear:** [SUG-60](https://linear.app/sugartown/issue/SUG-60)
- **Origin:** SUG-54 (`htmlSection` inventory)
