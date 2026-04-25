# SUG-79 — Storybook Audit: Card Primitive Reorganisation

**Linear Issue:** [SUG-79](https://linear.app/sugartown/issue/SUG-79/storybook-audit-slim-card-primitive-move-grid-stories-retire)
**Status:** Backlog
**Priority:** Low — schedule after SUG-78 Phase 1 ships
**Epic type:** Tooling / DX

---

## Problem

The Card primitive Storybook file has accumulated ~17 stories, many of which demonstrate grid layout, context-aware sizing, and chip label grouping — concerns that belong to CardGrid and ContentCard patterns, not the atomic Card primitive. EditorialCard is deprecated (does not use the Card primitive) but its stories still appear in the sidebar. The structure doesn't reflect the actual component hierarchy.

---

## Scope

### Phase 0 (not required — no design mock needed)
This is a story reorganisation with no UI output changes. No Phase 0 mock gate applies.

---

## Work Items

### 1 — Card primitive (`/Card`) — slim to API stories only

**Target: ~10 stories**

Keep (API-demonstration value):
- DefaultFull
- DefaultDark
- DefaultWithAccent
- DefaultTitleOnly
- DefaultWithHero
- DefaultCompact
- ListingBasic
- ListingWithThumb
- ListingFullCard
- CategoryBefore / CategoryAfter
- Snapshot

Remove (move to CardGrid or delete):
- CardGrid
- CardTypography Before / After
- Grid Narrow Context (620px)
- CardChipLabels Group Labels
- ListingGrid

### 2 — CardGrid pattern (new or expanded story file)

Move the removed stories here. Verify each story still renders correctly in its new file with appropriate decorators/args.

File: `apps/storybook/src/stories/CardGrid.stories.jsx` (create if absent, expand if exists)

Stories to include:
- CardGrid (basic)
- CardTypography Before / After
- Grid Narrow Context (620px viewport)
- CardChipLabels Group Labels
- ListingGrid

### 3 — EditorialCard — retire

EditorialCard does not use the Card primitive and is not maintained. Options:
- Move existing stories to a `Legacy` section (`title: 'Legacy/EditorialCard'`)
- Or remove entirely if no historical reference value

Do not add new EditorialCard stories. Do not extend the component.

### 4 — ContentCard / CardBuilderSection

Stories stay in PATTERNS. Audit for:
- Ledger Tradition rendering (verify `--st-card-*` tokens apply correctly at `light-pink-moon`)
- Missing states: dark-pink-moon, with accent color, with draft badge
- Add stories for any gaps

### 5 — Chromatic / VRT coverage

For all card variants (Card primitive + CardGrid + ContentCard):
- Confirm Chromatic-stable story at `light-pink-moon` theme
- Confirm Chromatic-stable story at `dark-pink-moon` theme
- Tag stories with `chromatic: { disableSnapshot: false }` where missing

---

## Acceptance Criteria

- [ ] Card primitive story file has ≤10 stories, all demonstrating Card API props
- [ ] CardGrid story file has all grid/layout/context stories
- [ ] EditorialCard stories retired or moved to Legacy section
- [ ] ContentCard/CardBuilderSection stories cover Ledger Tradition states
- [ ] All card story variants have Chromatic coverage at light-pink-moon + dark-pink-moon
- [ ] No stories in Card primitive reference grid layout or context-aware sizing

---

## Out of Scope

- Structural changes to Card JSX or CSS (Phase 2 of SUG-78)
- Adding new Card API props
- EditorialCard refactor (retire only)
