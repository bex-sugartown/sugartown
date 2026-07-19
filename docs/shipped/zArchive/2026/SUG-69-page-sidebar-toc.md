**Linear Issue:** [SUG-69](https://linear.app/sugartown/issue/SUG-69/page-sidebar-toc-grid-layout)

## EPIC NAME: Page sidebar TOC + grid layout

---

## Context

**Why this epic exists:**
Today the "Contents" block on `/platform` (and any multi-section root page) renders inline at the bottom of the last section. By the time a visitor scrolls to it, they are at the end of the page. It is decoration, not navigation. A sticky right-rail TOC is the standard manifesto/longform pattern and matches Sugartown's "document as product" aesthetic.

**Related epics:**
- SUG-58 (AI Search) — anchor ids already exist on every section via `_sectionId`; this epic reuses them.
- SUG-70 (Mermaid diagram legibility) — wide diagrams + right-rail TOC are complementary layout decisions and benefit from landing in the same cadence.

**Doc types in scope:** `page` (primary). Article/node/caseStudy templates evaluated after `/platform` ships.

---

## Phase 0 — Design confirmation

> No JSX before this phase is signed off.

**Phase 0 deliverables:**

1. HTML mock at `docs/drafts/SUG-69-page-sidebar-toc.html` covering:
   - Desktop ≥1024px: two-column grid, 760px content + 220px sidebar, sticky sidebar with active-state styling.
   - Tablet 768–1023px: single column, sidebar collapsed into a `<details>` "Jump to" block under the hero (or hidden — decision needed in mock review).
   - Mobile <768px: sidebar hidden.
2. Active-state treatment: decide between pink-left-border, bold, or underline. Brand voice suggests understated — pink-left-border with muted type.
3. Decision: does the sidebar live in a shared component reused by article/node/caseStudy later, or is it `page`-only for v1? Default recommendation: v1 = page-only; article reuse is a follow-up after watching analytics.

---

## Scope

- [ ] Phase 0 — HTML mock approved
- [ ] Phase 1 — `PageSidebar.jsx` component
  - [ ] Accepts `sections[]`, derives TOC items from `sections[*].heading` + `sections[*]._sectionId`
  - [ ] Filters to sections with a heading (skips hero/spacer sections)
  - [ ] Renders sticky list with active-state via IntersectionObserver
  - [ ] Keyboard-accessible (Tab reachable, focus-visible styles)
- [ ] Phase 2 — RootPage grid layout
  - [ ] `.detailPage` grid at ≥1024px: `minmax(0, 1fr) 220px` with gap
  - [ ] Content column stays at 760px cap inside its grid cell
  - [ ] Single column below 1024px
  - [ ] Remove inline Contents block from PageSections/section renderers
- [ ] Phase 3 — Active-state observer
  - [ ] IntersectionObserver on section headings (H2 elements with `_sectionId`)
  - [ ] Root margin tuned so active switches at ~25% viewport from top
  - [ ] Reduced-motion fallback: no JS-driven scroll behavior
- [ ] Phase 4 — Accessibility
  - [ ] `aria-label="On this page"` on the sidebar `<nav>`
  - [ ] `aria-current="location"` on the active item
  - [ ] Keyboard traversal test
- [ ] Storybook story for PageSidebar (isolated + within a RootPage-like layout)

---

## Atomic Reuse Gate

1. **Existing patterns —** `_sectionId` anchors already emitted per section; no new data plumbing. The inline Contents block logic is the source-of-truth for current TOC derivation and should be deleted once the rail replaces it (do not fork).
2. **Consumed everywhere —** new `PageSidebar` lives in `apps/web/src/components/`, consumed by `RootPage` in v1. Article/node/caseStudy adoption is a follow-up decision, not part of v1.
3. **API composable —** `<PageSidebar sections={sections} />` — no per-doctype flags. The component derives what it needs from the sections array.

---

## Technical Constraints

- **No new schema fields.** Sidebar is fully derived from existing section data.
- **No scroll-spy library.** Native IntersectionObserver is sufficient and already used elsewhere in the codebase.
- **No sub-heading (H3) support in v1.** Section H2s only. H3 TOC is a real feature request if it comes up later, not a default.
- **Sticky math.** `top: calc(var(--st-header-height) + var(--st-space-section-break-detail))` — verify the header height token exists and reflects actual header height at the sticky breakpoint.
- **Grid breakout rule (MEMORY.md §Section Layout Contract).** Grid sidebar must not break the existing `> *` catch-all that enforces full-width children in `.detailContext`. Sidebar sits OUTSIDE `.detailContext`, in its own grid column.

---

## Acceptance Criteria

1. Sidebar renders on `/platform` and any `/:slug` root page with 2+ sections.
2. Active section highlights as the reader scrolls.
3. Keyboard focus order is sensible (sidebar reachable via Tab after main nav).
4. Mobile fallback tested at 390px (no horizontal scroll, no layout shift).
5. Existing inline Contents block is removed (not coexisting with the rail).
6. Storybook story exists for PageSidebar.
7. At least one commit referencing SUG-69 on origin/main before Done.

---

## Non-Goals

- Sub-heading (H3) TOC entries
- Article/node/caseStudy template adoption (follow-up after analytics)
- Scroll-spy libraries or smooth-scroll polyfills
- Any re-authoring of section content or headings

---

## Rollback Plan

Single-commit rollback — the sidebar is additive. Reverting restores the current inline Contents block. No schema, no data, no migrations.

---

## Definition of Done

- All acceptance criteria pass
- Storybook story added
- Mock-to-implementation comparison table presented and approved
- Epic doc moved from `docs/backlog/` to `docs/shipped/`
- Linear SUG-69 transitioned to Done
