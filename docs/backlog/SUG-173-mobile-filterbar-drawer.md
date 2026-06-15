**Linear Issue:** [SUG-173](https://linear.app/sugartown/issue/SUG-173/mobile-filterbar-drawer-archive-page-filter-panel-on-mobile-sug-153)
## EPIC NAME: Mobile FilterBar drawer — archive page filter panel on mobile

**Parent:** SUG-153 Phase 2

---

## Pre-Execution Completeness Gate

- [ ] **Phase 0 mock produced and approved** — HTML mock at `docs/drafts/SUG-173-filterbar-drawer-mock.html` before any JSX/CSS
- [ ] **FilterBar component audit** — locate current component, understand how filters are applied/cleared, how active state is tracked
- [ ] **Archive page audit** — identify all archive pages that render FilterBar (`/articles`, `/case-studies`, `/knowledge-graph`, `/tags/:slug`, `/categories/:slug`, `/projects/:slug`, `/people/:slug`, `/tools/:slug`)
- [ ] **Active filter count** — Phase 0 must decide: is the count derived from URL params, local state, or FilterBar's own model? Must be resolved before drawer trigger badge design is locked
- [ ] **Drawer reuse confirmed** — Phase 0 must verify `Drawer.jsx` (from SUG-153 Phase 1) covers the drawer shell with no changes needed

---

## Context

Archive pages render a `FilterBar` with faceted checkboxes: AUTHOR, TYPE, PROJECT, TOOL/PLATFORM. On mobile this is a full-width panel that forces significant scroll before content is reached. The Drawer primitive and ContentsStrip chip pattern established in SUG-153 Phase 1 provide the shell — this epic wires FilterBar into that pattern.

**Current mobile behaviour:** FilterBar renders full-width above the content grid on all viewports. No collapse.

**Target behaviour:** below 768px, the FilterBar is hidden; a "FILTERS" chip appears via `ContentsStrip` (or equivalent). Tapping opens the Drawer containing the full FilterBar. Active filters persist when the drawer is closed. When filters are active, the chip shows a count badge.

---

## Doc Type Coverage Audit

| Surface | In scope? |
|---------|-----------|
| `/articles` | ✅ Yes |
| `/case-studies` | ✅ Yes |
| `/knowledge-graph` | ✅ Yes |
| `/tags/:slug`, `/categories/:slug`, `/projects/:slug`, `/people/:slug`, `/tools/:slug` | ✅ Yes |
| Article/Node/CaseStudy detail pages | ☐ No — PageSidebar drawer covered by SUG-153 Phase 1 |

---

## Objective

After this epic: archive page FilterBar is accessible on mobile via a drawer trigger chip, not inline above the content grid. Reuses `Drawer` + `ContentsStrip` pattern from SUG-153 Phase 1 with no new drawer primitives.

---

## Scope

### Phase 0 — Design + mock (HARD STOP)

- [ ] HTML mock at `docs/drafts/SUG-173-filterbar-drawer-mock.html`
- [ ] Mock must annotate:
  - Trigger chip placement (position, label, badge when filters active)
  - Drawer width and layout of filter groups inside
  - Apply / clear / close affordances
  - How active filter count is surfaced on the chip
  - Breakpoint: 768px (matches `bpMd`)
  - What happens to the ContentsStrip on archive pages (no TOC = no Contents chip; Filters chip replaces it)
- [ ] Phase 0 sign-off required before any code

### Phase 1 — Implementation (post Phase 0 sign-off)

- [ ] Audit `FilterBar.jsx` — understand props, state, active filter tracking
- [ ] Add `mobileDrawer` mode to FilterBar (or wrap in a `FilterDrawer` component)
- [ ] `ContentsStrip`-style trigger chip on archive pages — label "Filters", badge count when active
- [ ] Drawer label contextual per archive type ("Filter articles", "Filter case studies", etc.)
- [ ] FilterBar at ≥768px: inline as today (no change)
- [ ] FilterBar at <768px: hidden; drawer trigger visible
- [ ] Escape / overlay tap closes drawer; filter state preserved
- [ ] Storybook story: FilterBar mobile drawer variant

---

## Acceptance Criteria

- [ ] Phase 0 mock approved before any code
- [ ] On mobile (<768px), FilterBar is not visible inline — drawer trigger chip is present
- [ ] Trigger chip shows active filter count when filters are applied
- [ ] Drawer opens/closes correctly; Escape closes it; overlay tap closes it
- [ ] Filter state persists across open/close
- [ ] Desktop layout (≥768px) unchanged
- [ ] `pnpm validate:tokens --strict-colors` passes
- [ ] Storybook story renders without console errors
- [ ] Visual QA: "Visual QA approved" before close-out

---

## Non-Goals

- Does not change FilterBar desktop layout
- Does not redesign the filter UX (facets, counts, clear-all)
- Does not add new filter types or filter model changes
- Does not introduce swipe gestures

---

## Files Likely Modified

- `apps/web/src/components/FilterBar.jsx` (or equivalent) — add mobile drawer mode
- Archive page components (`ArticlesArchivePage.jsx`, `CaseStudiesArchivePage.jsx`, etc.) — add drawer trigger
- Possibly a new `FilterDrawer.jsx` wrapper if FilterBar needs clean separation
- `apps/storybook/.storybook/stories/` — FilterBar mobile story

---

## Post-Epic Close-Out

1. Phase 0 mock approved (hard stop)
2. All acceptance criteria met
3. Visual QA gate
4. Chromatic VRT
5. Move `docs/backlog/SUG-173-mobile-filterbar-drawer.md` → `docs/shipped/`
6. `/mini-release`
7. Update Linear SUG-173 → Done
