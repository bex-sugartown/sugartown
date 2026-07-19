---
**Epic:** SUG-96 — DS component polish — SectionLabel, Tile primitive, Grid primitive + Chip Storybook colorways + Case Study page comprehensive redesign
**Linear Issue:** [SUG-96](https://linear.app/sugartown/issue/SUG-96)
**Status:** Backlog
**Priority:** 🔵 Low
**Merge strategy:** (a) Merge-as-you-go — each item ships independently
---

# SUG-96 — DS component polish: SectionLabel, Tile primitive, Grid primitive + Chip Storybook colorways + Case Study page

Nine items: the original five DS polish items surfaced during SUG-91, plus a comprehensive case study detail page redesign (Item 6), a rename + visual redesign of `answerBlock` as a generic referenced-content primitive (Item 7), Storybook housekeeping (Item 8), and Card story split (Item 9). Items 3, 4, 6, and 7 require Phase 0 mocks before any JSX is written. Item 6 gates on Items 1–4. Item 7's renderer gates on its Phase 0 sign-off and the case study page mock.

## Background

**answerBlock rename**: `answerBlock` (SUG-94) was named after its initial FAQ/Q&A use case, but the schema is generic — a content block (`question` → heading, `answer` → body PortableText) backed by reference links (`evidence[]`). This is a pattern that appears across caseStudy, article, and node sections: a card or tile that makes a claim or poses a question, then backs it with linked evidence. The name `answerBlock` is too narrow; the pattern should be renamed to something that works across all three uses. Field names (`question`, `answer`) will also be generalised as part of this rename. The visual treatment (card? callout variant? tile with reference footer?) and the final name are open decisions to be resolved in the Phase 0 mock for Item 6 (the case study page).

**Storybook housekeeping**: Two story files are redundant. `TaxonomyChips` (`Patterns/TaxonomyChips`) documents a component that orchestrates Chip — it adds no pattern over and above the Chip primitive stories. `PreviewBanner` (`Patterns/PreviewBanner`) is a single no-args story for a dev-only banner that is structurally identical to Preheader. Both have been cleaned up: `TaxonomyChips.stories.tsx` deleted; `PreviewBanner.stories.tsx` deleted and a `PreviewMode` story added to `Preheader.stories.tsx`.

**SectionLabel**: The mono-caps heading with extending horizontal rule is implemented twice — in `RecentContentSection.module.css` (`.heading`) and `pages.module.css` (`.outcomeStripLabel`). Both sets of CSS are identical. The pattern needs a shared component before a third call site appears.

**Chip colorways**: Storybook Chip stories (`/primitives/chip`) were authored before the Ledger Tradition font and palette switch (SUG-63). The stories render correctly in production but the story fixtures may reference stale color names or show mismatched palette comparisons. The `variant="tag"` neutral chip (the canonical evidence chip used in StatTile) is the reference the stories should anchor to.

**Tile primitive**: `StatTile` (metric display) and `TickerCard` inside `RecentContentSection` (content preview) share the same four-zone skeleton — label → primary content → secondary content → footer zone — with different styling on each zone. They are isomorphic and should be unified into a single `Tile` DS primitive. Styling differences are resolved via props (`labelColor`, `titleSize`, `meta`, `chip`, `href`, `loading`). The current `StatTile` and `RecentContentSection/TickerCard` implementations are both retired in favour of `Tile`. `RecentContentSection` keeps its name as the page-section wrapper (it owns the grid, heading, and data-fetching) — only the inner card is extracted.

**Grid primitive**: Two grid patterns exist inline in multiple places — the 24px card grid (`.st-layout-grid` in globals.css) and the 1px-gap hairline tile grid (inlined in `TrustReportSection` and `CaseStudyPage`). These should be unified into a single generic `Grid` primitive with a `spacing` prop (`"card"` = 24px open gap, `"tile"` = 1px bg-through-gap hairline). The tile variant also requires `background: var(--st-color-rule-accent)` on the parent — this is a visual technique, not just a gap value. A mock is required before implementing.

## Scope

**Item 1 — SectionLabel component:**
- [ ] Create `apps/web/src/design-system/components/section-label/SectionLabel.jsx` + `SectionLabel.module.css`
- [ ] Props: `as` (element — default `p`), `rule` (boolean — default `true`), `children`, `className`
- [ ] CSS: `rule=true` → flex + `::after { flex:1; height:2px; background: var(--st-color-ink) }` — exact match to current RecentContentSection pattern
- [ ] Replace `.heading` in `RecentContentSection.module.css` with `<SectionLabel>`
- [ ] Replace `.outcomeStripLabel` in `pages.module.css` with `<SectionLabel>`
- [ ] Remove now-redundant CSS from both files
- [ ] Add Storybook story: `SectionLabel` with rule / without rule / as h2 / as p

**Item 2 — Chip Storybook colorways:**
- [ ] Open Storybook at `/primitives/chip` and audit stories against light-pink-moon + dark-pink-moon
- [ ] Verify all named color variants (pink, seafoam, lime, violet, amber, grey) render correctly in both themes
- [ ] Confirm `variant="tag"` neutral chip is the canonical reference chip (no dot, neutral border/bg)
- [ ] Confirm `variant="status"` stories cover all six dot states: evergreen, validated, exploring, active, draft, deprecated
- [ ] Add `featured` state story for `variant="tag"`
- [ ] Update any story fixtures using stale Pink Moon palette references

**Item 3 — Tile primitive (replaces StatTile + TickerCard):**
- [ ] Phase 0 required: produce `docs/drafts/SUG-96-tile-primitive.html` mock showing both use cases (metric + content preview) side by side, and resolving the open decisions below
- [ ] Open decisions to resolve in mock (do not implement until these are signed off):
  - **Name**: `Tile` — confirm or amend
  - **Primary content prop**: single `title` prop (or `value` alias) — one slot serves both metric values and content titles
  - **Label colour**: `labelColor="ink"` (neutral, default — metric tiles) vs `labelColor="brand"` (brand-primary — content type labels); or derive from `variant`
  - **Title/value size**: `titleSize="display"` (2xl — metrics) vs `titleSize="heading"` (narrative heading scale — content previews)
  - **Top accent border**: currently on the *grid container* in RecentContentSection, not on Tile — confirm it stays on the Grid and is not a Tile concern
  - **Neutral vs themed labels**: decide whether label colour should be token-driven per use case or controlled by a single prop
- [ ] Once mock is signed off:
  - [ ] Create `apps/web/src/design-system/components/tile/Tile.jsx` + `Tile.module.css`
  - [ ] Props: `label`, `labelColor`, `title` (+ `value` alias), `titleSize`, `unit`, `sub`, `chip`, `meta`, `href`, `bar`, `legend`, `loading`, `size`, `className`
  - [ ] Migrate `TrustReportSection` from `StatTile` to `Tile` with `titleSize="display"`
  - [ ] Migrate `CaseStudyPage` outcomes from `StatTile` to `Tile` with `titleSize="display"`
  - [ ] Migrate `RecentContentSection` inner `TickerCard` to `Tile` with `titleSize="heading"` + `labelColor="brand"`
  - [ ] Delete `StatTile.jsx`, `StatTile.module.css` (and `stat-tile/` directory)
  - [ ] Add Storybook stories: `MetricTile`, `ContentPreviewTile`, `WithChip`, `WithBeforeAfter`, `WithBar`, `Loading`, `SizeCompact`

**Item 4 — Grid primitive:**
- [ ] Phase 0 mock: `docs/drafts/SUG-96-grid-primitive.html` ✅ (rev 2 — spacing token naming, hairline=border color, call site audit)
- [ ] Add Grid spacing tokens to foundations before implementing: `--st-grid-gap-hairline: 1px` and `--st-grid-gap-md: var(--st-space-5)` — add to both `tokens.css` files
- [ ] API: `<Grid spacing="md" columns={3}>` / `<Grid spacing="hairline" columns={4} accent>` — spacing values are scale token names, not child component names
- [ ] `spacing="tile"` must apply `background: var(--st-color-rule-accent)` + `gap: 1px` + outer border on the container (the bg-through-gap technique)
- [ ] Audit call sites: `TrustReportSection.module.css` (`.tileGrid`), `pages.module.css` (`.outcomeGrid`), `globals.css` (`.st-layout-grid`)
- [ ] Migrate all three call sites to the shared primitive
- [ ] Add Storybook stories: `CardSpacing` (24px gap, Card children), `TileSpacing` (1px hairline, Tile children)
- [ ] Document the bg-through-gap pattern per CLAUDE.md convention (annotation on each child's `background` declaration)

**Item 5 — Chip Storybook + Tile integration:**
- [ ] After Tile (Item 3) ships: confirm Storybook Chip stories reference `Tile`'s `WithChip` story as the canonical evidence chip context (not standalone)

**Item 7 — answerBlock rename + visual redesign:**

Context: `answerBlock` (SUG-94) has schema + GROQ projection but no renderer. Before the renderer is written, the name and field API must be resolved. The current fields (`question`, `answer`, `evidence[]`) are specific to FAQ use; the component's actual shape is a generic card/tile with body content and reference links.

- [ ] **Phase 0 required** — resolve in `docs/drafts/SUG-96-case-study-page.html` (Item 6 mock). The mock must show at least two name/visual options side by side:
  - **Option A — `citedBlock`**: prose block (heading + body) with a linked reference footer, styled as a callout variant with a reference strip below. Field names: `heading`, `body`, `references[]`.
  - **Option B — `referenceCard`**: card surface (title + excerpt) with inline reference chips in the footer, analogous to a Tile with `evidence` chips instead of a metric. Field names: `title`, `content`, `references[]`.
  - **Option C — `keyPoint`**: a flagged insight or claim (no heading, short statement + body) with evidence links. Field names: `statement`, `detail`, `references[]`.
  - Flag which option best generalises across caseStudy, article, and node contexts without implying Q&A structure.
- [ ] Once Phase 0 sign-off:
  - [ ] Rename schema: `answerBlock` → `{chosenName}` in `apps/studio/schemas/objects/answerBlock.ts` (new file) + `schemas/index.ts`
  - [ ] Update field names (`question` → `heading`/`statement`/`title`, `answer` → `body`/`content`/`detail`) per chosen option
  - [ ] Update `sections[]` in `caseStudy.ts`, `article.ts`, `node.ts` schema files — swap old type ref for new
  - [ ] Update GROQ projections in `queries.js` — rename fields to match new schema
  - [ ] Deploy schema
  - [ ] Add `{chosenName}` renderer to `PageSections.jsx` + CSS (no renderer exists yet — deferred from SUG-94)
  - [ ] Add Storybook story: default, with multiple references, without references

**Item 9 — Card story split:**
- [ ] Split `Primitives/Card` stories into two groups: folio/Ledger stories stay under `Primitives/Card`; listing variant stories move to `Primitives/Card/Listing`
- [ ] Rename listing stories to make the variant's context explicit: `ListingBasic` → `ListingRow`, `ListingWithThumb` → `ListingRowWithThumb`, `ListingFullCard` → `ListingRowFullCard`
- [ ] Update Snapshot story to include both groups
- No component API change needed — `variant="listing"` is unchanged, only the Storybook title changes
- Motivation: the folio card and listing card are visually different primitives; mixing them under one story title obscures both

**Item 8 — Storybook housekeeping:** ✅ Done
- [x] Delete `TaxonomyChips.stories.tsx` — orchestrates Chip with no pattern beyond the primitive
- [x] Delete `PreviewBanner.stories.tsx` — consolidate as `PreviewMode` story in `Preheader.stories.tsx`

## Tile — proposed prop API (draft, subject to Phase 0 sign-off)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | string | — | Top eyebrow label (metric name or content type) |
| `labelColor` | `"ink" \| "brand"` | `"ink"` | `"ink"` = neutral mono; `"brand"` = brand-primary |
| `title` | string | — | Primary display content (metric value or content title) |
| `value` | string | — | Alias for `title`; whichever is provided wins |
| `titleSize` | `"display" \| "heading"` | `"display"` | `"display"` = 2xl (metrics); `"heading"` = narrative heading scale (content) |
| `unit` | string | — | Inline unit suffix after title (metric only) |
| `sub` | string | — | Secondary content below title (before-value or descriptor) |
| `chip` | string | — | Renders `<Chip variant="tag" label={chip}>` in footer zone |
| `meta` | string | — | Footer string with border-top rule (content preview only) |
| `href` | string | — | Makes the tile a linked surface |
| `bar` | object | — | Breakdown bar config (metric only) |
| `legend` | boolean | `false` | Renders bar legend (requires `bar`) |
| `loading` | boolean | `false` | Renders skeleton placeholders |
| `size` | `"md" \| "sm"` | `"md"` | Compact size reduces title font and padding |
| `className` | string | — | Escape hatch for grid positioning |

## Use case definitions (SectionLabel)

| Variant | `rule` | `as` | Example use | Context |
|---|---|---|---|---|
| Structured heading | `true` | `h2` or `p` | RECENTLY SHIPPED ──, OUTCOMES ── | Demarcates data-dense or structured blocks |
| Plain field label | `false` | `p` | CHALLENGE, PUBLISHED | Inline context label above a content block |

Rule of thumb: if the heading introduces a data grid, stat strip, or card collection, use `rule=true`. If it labels a prose block or a single field, use `rule=false`.

## Phase 0 gate

Items 3, 4, 6, and 7 require HTML mocks before any JSX is written (per CLAUDE.md §Phase 0):
- `docs/drafts/SUG-96-tile-primitive.html` — Tile in both use cases, resolving open design decisions
- `docs/drafts/SUG-96-grid-primitive.html` — Grid in both spacing variants
- `docs/drafts/SUG-96-case-study-page.html` — comprehensive case study page mock (also resolves Item 7 `answerBlock` rename options and Item 3 Tile decisions in context)

Items 1–2 (SectionLabel, Chip stories) are CSS/Storybook-only — no Phase 0 gate required.
Item 5 (Chip integration) depends on Item 3 shipping first.
Item 7 (answerBlock rename) Phase 0 is bundled into the Item 6 case study mock — both resolved in the same HTML file. The renderer (Item 7 JSX) gates on Item 6 Phase 0 sign-off.
Item 8 (Storybook housekeeping) — complete, no gate.

**Item 6 — Case Study detail page: comprehensive mock + layout wiring:**

Context: SUG-94 added `statTileSection`, `answerBlock` (to be renamed — see Item 7), and `accordionSection` (semantic FAQ) as section builder blocks. `outcomes[]` on caseStudy was deprecated. The Tile and Grid primitives from Items 3–4 are the canonical renderers for these new blocks. Item 6 wires everything together — but only after Items 1–4 ship. The `answerBlock` rename decision (Item 7) must be resolved in this mock before its renderer is written.

- [ ] **Phase 0 required**: produce `docs/drafts/SUG-96-case-study-page.html` — a comprehensive HTML mock of the full case study detail page. The mock must:
  - Reference Ledger Tradition tokens (Cormorant Garamond headings, DM Sans UI, IBM Plex Mono labels, Ledger palette)
  - Show every zone in the page: Hero, MetadataCard, challengeSummary block, Outcomes/statTileSection (Tile + Grid), body sections (text, callout, accordionSection FAQ, answerBlock, statTileSection mid-content), PageSidebar (related, series, tools)
  - Use existing DS components wherever possible — explicitly name the component (SectionLabel, Tile, Grid, Callout, Accordion, Button, Chip) for each zone. Invent new layouts only where no existing component fits — flag those with a note
  - Show two breakpoints: single-column (mobile) and detail layout with sidebar (≥1024px)
  - Include the Ledger-appropriate treatment for `challengeSummary`: currently inline prose in a left-accent callout — should this become a `Callout` variant? Resolve in mock
- [ ] Once Phase 0 is signed off:
  - [ ] Add `{answerBlock rename}` renderer to `PageSections.jsx` + CSS — schema rename and visual design resolved in Item 7 first; the schema type name and field names used here come from Item 7's Phase 0 sign-off
  - [ ] Add `StatTileSection` renderer to `PageSections.jsx` — use new `Tile` + `Grid` primitives (not deprecated `StatTile`)
  - [ ] Write `migrate-outcomes.mjs` script: copies `caseStudy.outcomes[]` items to a `statTileSection` prepended to `sections[]` on each case study document (7 drafts to patch); removes from the hardcoded `outcomeStrip` zone in `CaseStudyPage.jsx` after migration
  - [ ] Remove `outcomeStrip` + `keyQuestionsZone` hardcoded zones from `CaseStudyPage.jsx` (replaced by section renderer)
  - [ ] Remove `StatTile` import from `CaseStudyPage.jsx` (replaced by `Tile` via sections)
  - [ ] Remove `.outcomeStrip`, `.outcomeGrid`, `.keyQuestionsZone` CSS from `pages.module.css`
  - [ ] Verify: existing accordionSection FAQ renders correctly (renderer already live); GROQ `semantic` field already projected
  - [ ] Publish migrated case study drafts after visual QA

## Non-Goals

- Status chip color tokens per-state (`--st-status-success-*` etc.) — deferred; these tokens don't exist and adding them is a separate pass
- Evidence chip per-state coloring (measured=green, estimated=amber, qualitative=grey) — deferred to same token pass
- Chip component migration from web adapter to `packages/design-system` — deferred to a platform epic
- Renaming `RecentContentSection` as the page-section wrapper — the component name is fine; only the inner `TickerCard` is being replaced

## Related

- **SUG-88:** Ledger Tradition chip system — established the rule-dot system this epic builds on
- **SUG-91:** Case study outcomes — surfaced SectionLabel, StatTile chip gaps, tileGrid duplication; triggered post-mortem that added Items 3–4
- **SUG-87:** Dynamic Trust Report — original StatTile and tileGrid pattern
- **SUG-94:** Structured retrieval + JSON-LD — added statTileSection, answerBlock, accordionSection FAQ flag, outcomeItem schema; deprecated outcomes[] and keyQuestions[] on caseStudy; GROQ projections complete; rendering deferred to this epic
