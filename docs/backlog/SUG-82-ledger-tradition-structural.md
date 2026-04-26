**Linear Issue:** SUG-82
**Phase strategy:** merge-as-you-go (each structural surface ships independently)

# SUG-82 — Ledger Tradition Phase 2: Structural DS Component Updates

---

## Model & Mode

Use `opusplan` for the planning phase (Pre-Execution Gate → Files to Modify lock-in), then exit plan mode for Sonnet to execute. This epic has one genuinely structural change (Card folio slot) and two CSS-only surfaces (FilterBar density, canvas token gap). If the Card folio slot causes unexpected prop-API complexity — e.g. backward-compat collision with how `eyebrow` + `status` currently render — call `/model opus` for that decision only, then return.

---

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — Card folio slot: existing Card.tsx has `eyebrow` and `status` props that currently render inside the card body header area. The folio row is a new structural slot above the header. No existing component serves this purpose — it requires new DOM + prop extension. Web adapter (Card.jsx) must be updated in the same commit. FilterBar: no zebra or ruled-section pattern exists in FilterBar.module.css — confirmed. MetadataCard: columnar layout already done in SUG-78, not in scope.
- [x] **Use case coverage** — Card folio slot must work across: ContentCard (article, node, caseStudy, project), archive grid cards, and Storybook stories. The `eyebrow` prop already passes the content-type label from ContentCard — the folio slot reuses it. Status badge already exists — moves from eyebrow-area to folio right cell.
- [x] **Layout contract** — Card folio row: `display: grid; grid-template-columns: 1fr auto; align-items: center; padding: 5px 12px; background: var(--st-color-canvas); border-bottom: 1px solid var(--st-color-rule-accent)`. FilterBar section headers: `border-top: 2px solid var(--st-color-ink); padding-top: 8px`. Zebra: alternating `background: var(--st-color-canvas)` on filter group rows. Checkboxes: `border-radius: 0; border: 1px solid var(--st-color-rule-accent)`.
- [x] **All prop value enumerations** — Card `status` enum values are already in STATUS_BADGE_CLASS in both Card.tsx and Card.jsx — no new values needed for the folio slot.
- [x] **Correct audit file paths** — DS Card: `packages/design-system/src/components/Card/Card.tsx` + `Card.module.css`. Web adapter: `apps/web/src/design-system/components/card/Card.jsx` + `Card.module.css`. FilterBar: `apps/web/src/components/FilterBar.module.css` + `packages/design-system/src/components/FilterBar/FilterBar.module.css`. Tokens: `apps/web/src/design-system/styles/tokens.css` + `packages/design-system/src/styles/tokens.css`. Light theme: `apps/web/src/design-system/styles/theme.light.css`. All paths confirmed.
- [x] **Dark / theme modifier treatment** — Two active themes: `light-pink-moon` (default) and `dark-pink-moon`. Legacy `light` and `dark` theme values are deprecated — no CSS authored in this epic targets those selectors. Card folio uses `--st-color-canvas` (dark-pink-moon default: `midnight-800`; light-pink-moon override: `neutral-100` via `theme.pink-moon.css`). The folio bg will look correct in both active themes. FilterBar zebra uses the same `--st-color-canvas` token and inherits the same overrides.
- [x] **Studio schema changes scoped** — None. This epic touches only component CSS/JSX and tokens. Explicitly out of scope.
- [x] **Web adapter sync scoped** — Card.tsx changes require matching Card.jsx changes in the same commit. FilterBar DS package + web component must stay in sync. Both pairs listed in Files to Modify.
- [x] **Composition overlap audit** — Card `eyebrow` prop: currently renders between category and title in the card header. In the folio slot, `eyebrow` renders in the folio row instead (not both). Implementation must suppress the existing eyebrow render location when `showFolio` is true — do not render the same content twice.
- [x] **Atomic Reuse Gate** — No new components. Folio slot is an extension to existing Card primitive. FilterBar changes are CSS-only additions to existing module. One new token (`--st-color-canvas` light override) is a gap fix.

---

## Context

SUG-78 shipped the full token/CSS-only pass for Ledger Tradition (April 25 2026): neutral scale primitives, ink/canvas/rule-accent semantic tokens, Cormorant Garamond for card titles and headings, MetadataCard columnar layout, RecentContentSection ticker treatment, Chip transparent treatment, FilterBar token pass, Card border/canvas/hover updates. SUG-80 shipped the Callout structural rewrite (left-border + wash → horizontal rule pair + rubric grid).

The mock at `docs/drafts/SUG-78-ledger-tradition-mock.html` (approved 24 Apr 2026, Bex decision column complete) defines two surfaces as **structural (Phase 2)**:
- Content Card folio slot — new DOM element; folio header row with type label + status badge
- Callout — done in SUG-80

The mock also identified archive grid as needing sidebar ruled section headers, zebra rows, and square checkboxes — classified token+CSS only in the decision table, but the FilterBar CSS confirms these weren't shipped in SUG-78.

One token correctness gap was identified during this audit: `--st-color-canvas` is overridden in `theme.pink-moon.css` (to `neutral-100`) but not in `theme.light.css`. The dark default is `midnight-800`. This epic adds the missing light override.

---

## Objective

After this epic, the Card primitive (DS + web adapter) renders a folio header row above the card body when `showFolio` is true — grey canvas background, content-type label on the left, status badge on the right — completing the Ledger Tradition card structure shown in the mock. The archive FilterBar gains ruled section headers, zebra rows, and square checkbox styling that match the mock's sidebar treatment. The `--st-color-canvas` token is correctly overridden in `theme.light.css` so canvas backgrounds render as neutral-100 in non-pink-moon light contexts. No schema or GROQ changes. No new Sanity doc types. No page template changes.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | No | Card folio slot is consumed by ContentCard; RootPage renders Cards — inherits automatically. No direct page template changes needed. |
| `article`   | No | ContentCard wraps Card; archive and detail pages are unaffected at the template layer. Visual change flows through ContentCard → Card. |
| `caseStudy` | No | Same as article. |
| `node`      | No | Same as article. |
| `archivePage` | No | Archive pages use ContentCard which uses Card — folio slot activates automatically when ContentCard passes `eyebrow`. Archive density improvement is in FilterBar CSS, not in archivePage template. |

No schema, GROQ, or route changes. All changes are at the component/CSS layer.

---

## Scope

### Phase A — Card folio slot (structural — DS + web adapter)

- [ ] Add `showFolio?: boolean` prop to `CardProps` in `Card.tsx`
- [ ] Add `.cardFolio` DOM element in Card.tsx render: renders above `.cardHeader` when `showFolio` is true, contains eyebrow label (left) and status badge (right)
- [ ] Suppress eyebrow render in `.cardHeader` when `showFolio` is true (eyebrow moves to folio row — do not render in both)
- [ ] Add `.cardFolio` CSS class to `packages/design-system/src/components/Card/Card.module.css`
- [ ] Mirror all changes to web adapter: `Card.jsx` prop + render + `.cardFolio` in `apps/web/src/design-system/components/card/Card.module.css`
- [ ] Update `ContentCard.jsx` to pass `showFolio` prop
- [ ] Update Storybook: `Card.stories.tsx` — add `showFolio` variant and update existing stories that use `eyebrow` + `status` together
- [ ] Run `pnpm validate:tokens --strict-colors` — zero violations gate

### Phase B — FilterBar archive density (CSS-only)

- [ ] Add ruled section header style: `border-top: 2px solid var(--st-color-ink)` on FilterBar group heading rows
- [ ] Add zebra row alternating background: every other filter item row gets `background: var(--st-color-canvas)`
- [ ] Add square checkbox override: `border-radius: 0; border: 1px solid var(--st-color-rule-accent)` on checkbox inputs
- [ ] Update both `apps/web/src/components/FilterBar.module.css` and `packages/design-system/src/components/FilterBar/FilterBar.module.css` in the same commit
- [ ] Run `pnpm validate:tokens --strict-colors` — zero violations gate

### Close-out

- [ ] Storybook stories updated for Card folio variant
- [ ] Chromatic VRT snapshot (if configured)
- [ ] Mini-release + ship doc + Linear Done

---

## Query Layer Checklist

Not applicable. No schema or GROQ changes in this epic. All changes are at the component/CSS layer.

---

## Schema Enum Audit

Not applicable — no new enum fields rendered. Card `status` badge is an existing rendered field; its STATUS_BADGE_CLASS map is already complete in both Card.tsx and Card.jsx.

---

## Themed Colour Variant Audit

Two active themes only: `light-pink-moon` (default, set by ThemeToggle and `index.html`) and `dark-pink-moon`. Legacy `light` and `dark` values are deprecated — they are not accessible via UI and no new CSS targets them. All overrides live in `theme.pink-moon.css`.

| Surface | Pink Moon Light (default) | Pink Moon Dark | Token(s) |
|---------|--------------------------|----------------|----------|
| Card folio bg | `var(--st-color-neutral-100)` (#F2F2F3) | `var(--st-color-midnight-800)` (#141830) | `--st-color-canvas` |
| Card folio border | `#C6C6C8` (neutral-300) | `rgba(255,255,255,0.15)` | `--st-color-rule-accent` |
| Card folio label text | `var(--st-color-neutral-500)` (#6C6C6F) | `var(--st-color-neutral-500)` | `--st-label-color` (existing) |
| FilterBar zebra bg | `var(--st-color-neutral-100)` | `var(--st-color-midnight-800)` | `--st-color-canvas` |
| FilterBar section header rule | `#0a0f1a` (ink) | `#0a0f1a` (ink — visible on dark bg) | `--st-color-ink` |
| Checkbox border | `#C6C6C8` (neutral-300) | `rgba(255,255,255,0.15)` | `--st-color-rule-accent` |

---

## Non-Goals

- **MetadataCard** — columnar ruled-row layout was shipped in SUG-78. Not in scope for this epic.
- **RecentContentSection (Ticker)** — Ledger Tradition treatment shipped in SUG-78. Not in scope.
- **Chip / Tag** — Ledger Tradition treatment (transparent bg, rule-accent border) shipped in SUG-78. Not in scope.
- **Typography heading tokens** — Cormorant Garamond for H1–H3 shipped in SUG-78. Not in scope.
- **Callout structural** — shipped in SUG-80. Not in scope.
- **Pink Moon Dark folio bg** — folio slot will render against `midnight-800` canvas in dark-pink-moon mode. This is correct per the token system — no special override needed.
- **Legacy theme CSS (`theme.light.css`, `[data-theme="light"]`, `[data-theme="dark"]` selectors)** — deprecated; no new CSS in this epic targets these. A dedicated cleanup epic will remove the 27 dead `[data-theme="light"]` and 12 dead `[data-theme="dark"]` selectors across 15 component files.
- **Schema changes** — none. This is a DS/CSS epic only.
- **Archive page template changes** — the FilterBar improvements apply via CSS to the existing FilterBar component. No changes to `ArticlesArchivePage.jsx`, `CaseStudiesArchivePage.jsx`, or `KnowledgeGraphArchivePage.jsx`.

---

## Technical Constraints

**Monorepo / tooling**
- pnpm workspaces; run `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` from `apps/web/` before every CSS commit
- Card changes span two packages: `packages/design-system/` (source) and `apps/web/src/design-system/components/card/` (adapter). They must be updated in the same commit.

**DS Component → Web Adapter Sync (blocking)**
- `apps/web` does not import from `@sugartown/design-system`. It has its own JSX adapter at `apps/web/src/design-system/components/card/`.
- When Card.tsx gets a new prop (`showFolio`) and new DOM element (`.cardFolio`), Card.jsx must receive the identical prop and DOM structure in the same commit. CSS class names must match between `Card.module.css` in both locations.
- FilterBar: same rule — `packages/design-system/src/components/FilterBar/FilterBar.module.css` and `apps/web/src/components/FilterBar.module.css` must be updated in the same commit.

**Token-first rule (blocking)**
- No raw hex, rgba, or hsla in any component CSS file. Every colour in `.cardFolio` must use `var(--st-*)`. The two relevant tokens (`--st-color-canvas`, `--st-color-rule-accent`) already exist.
- Fallback form: `var(--st-token, var(--st-primitive))` only. `var(--st-token, #hex)` is banned.

**Card API backward compat**
- `showFolio` must be optional and default to `false`. Existing Card usage without `showFolio` must render identically to today. All existing `Card.stories.tsx` stories must continue to render without modification.
- When `showFolio` is true: `eyebrow` renders in folio row (left cell). When `showFolio` is false: `eyebrow` renders in its current location inside `.cardHeader`. Do not break the existing eyebrow render path.
- `status` badge: when `showFolio` is true, the badge renders in the folio row (right cell). When `showFolio` is false, it renders in its existing position. Check Card.tsx render path carefully — current `evolution` vs `status` precedence logic (`evolution takes priority; status is the fallback`) must be preserved in the folio row too.

**Two token files stay in sync**
- `apps/web/src/design-system/styles/tokens.css` and `packages/design-system/src/styles/tokens.css` must be updated in the same commit. Same rule for theme files: `theme.pink-moon.css` in both locations. Do not edit `theme.light.css` — it is a deprecated theme.

---

## Files to Modify

**DS Package — Card**
- `packages/design-system/src/components/Card/Card.tsx` — add `showFolio?: boolean` prop; add `.cardFolio` DOM element; suppress eyebrow in header when showFolio true
- `packages/design-system/src/components/Card/Card.module.css` — add `.cardFolio`, `.folioLabel`, `.folioStatus` classes
- `packages/design-system/src/components/Card/Card.stories.tsx` — add `showFolio` variant

**Web Adapter — Card**
- `apps/web/src/design-system/components/card/Card.jsx` — mirror Card.tsx changes (same prop, same DOM structure)
- `apps/web/src/design-system/components/card/Card.module.css` — mirror Card.module.css changes (copy `.cardFolio`, `.folioLabel`, `.folioStatus`)

**App Component — ContentCard**
- `apps/web/src/components/ContentCard.jsx` — pass `showFolio` prop to Card (e.g. when `eyebrow` is present)

**FilterBar CSS**
- `apps/web/src/components/FilterBar.module.css` — add section header rule, zebra row bg, square checkbox
- `packages/design-system/src/components/FilterBar/FilterBar.module.css` — same changes (sync)

---

## Deliverables

1. **Card folio slot** — `Card.tsx` and `Card.jsx` both have `showFolio` prop; `.cardFolio` DOM element renders above `.cardHeader` when prop is true; eyebrow appears in folio row left cell; status badge appears in folio row right cell
2. **Card stories updated** — Storybook `Card.stories.tsx` includes a `ShowFolio` story demonstrating the folio slot with eyebrow + status
3. **FilterBar density** — FilterBar renders section headers with 2px ink top rule, alternating canvas-bg zebra rows, and square (zero-radius) checkboxes
4. **Token validator clean** — `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` both report zero violations after each phase commit

---

## Acceptance Criteria

- [ ] `Card` with `showFolio={true}` renders a `.cardFolio` row above the card header — confirmed in Storybook and on a real archive page
- [ ] `Card` without `showFolio` prop (or `showFolio={false}`) renders identically to pre-epic — existing Storybook stories render without changes
- [ ] `eyebrow` does not render twice: when `showFolio` is true, it appears only in the folio row, not also inside `.cardHeader`
- [ ] `evolution` prop still takes visual priority over `status` in the folio badge slot (existing precedence logic preserved)
- [ ] Folio row background is `neutral-100` (#F2F2F3) in light-pink-moon theme — confirmed via `preview_inspect` on a live page or Storybook canvas with `data-theme="light-pink-moon"`
- [ ] FilterBar has visible ruled section group headers (2px ink top border), zebra alternating rows (canvas bg on even items), and square checkboxes on a real archive page
- [ ] `pnpm validate:tokens` from `apps/web/` reports zero errors after each phase
- [ ] `pnpm validate:tokens --strict-colors` from `apps/web/` reports zero hardcoded colour violations after each phase
- [ ] Both Card CSS module files (`packages/design-system` + `apps/web/src/design-system/components/card/`) contain identical `.cardFolio` class definitions
- [ ] Both FilterBar CSS module files contain identical section header / zebra / checkbox additions
- [ ] No new CSS in this epic uses `[data-theme="light"]` or `[data-theme="dark"]` selectors
- [ ] **Mock fidelity**: agent produces mock-to-implementation comparison table for the Content Card folio slot (Component 01 in the mock) before close-out. Human approves before Linear transition to Done.

---

## Visual QA Gate

After all acceptance criteria pass, agent prepares:

1. **Mock-to-implementation comparison table** for Content Card folio slot (mock: `docs/drafts/SUG-78-ledger-tradition-mock.html` Component 01, Ledger column):

   | Mock element | Expected | Status | Notes |
   |---|---|---|---|
   | Folio row background | `var(--lt-neutral-200)` → neutral-100 (#F2F2F3) | | |
   | Folio row border-bottom | 1px hairline rule-accent | | |
   | Folio label font | IBM Plex Mono, 0.6rem, 700, uppercase, muted | | |
   | Folio status badge | mono uppercase, 1px border, no fill, 0 radius | | |
   | Card title font | Cormorant Garamond 500 (already shipped SUG-78) | Match | |
   | Card border | 1px neutral-300 | Match (SUG-78) | |
   | Card radius | 0 | Match (SUG-78) | |
   | Card shadow | none | Match (SUG-78) | |
   | Footer row background | neutral-200 solid bg (replaces dashed divider) | | verify |

2. **FilterBar comparison** (mock Component 02 sidebar, Ledger column):

   | Mock element | Expected | Status | Notes |
   |---|---|---|---|
   | Section headers | 2px ink top border, mono uppercase label | | |
   | Zebra rows | canvas bg on alternating items | | |
   | Checkboxes | square (0 radius), rule-accent border | | |

3. **Token compliance**: `grep` new `.cardFolio` and FilterBar zebra CSS for any hardcoded values. Report: "0 hardcoded values" or list violations.

4. **Cross-surface check**: confirm Card with `showFolio` renders on at least two routes — archive page (e.g. `/articles`) and one detail page context — without errors.

### Human gate
Agent presents the table above. Bex reviews Storybook + cross-surface spot check. Bex approves or returns with corrections. Epic does not close until "Visual QA approved."

---

## Risks / Edge Cases

- [ ] **Eyebrow double-render** — when `showFolio` is true, `eyebrow` moves to the folio row. It must be completely absent from `.cardHeader`. Check Card.tsx render tree carefully — there may be a category-position conditional that also references eyebrow.
- [ ] **Evolution vs status precedence in folio** — current Card logic: `evolution` takes priority over `status` for badge render. This logic must be preserved when badges move to the folio row. Do not simplify it.
- [ ] **ContentCard prop passthrough** — `ContentCard.jsx` constructs the `eyebrow` string and passes it to Card. It also passes `status`. Confirm `showFolio` is threaded through ContentCard → Card correctly and that `eyebrow` is populated for all content types (article, node, caseStudy, project).
- [ ] **Cards without eyebrow** — if a Card is rendered without an `eyebrow` prop and `showFolio` is true, the folio row will be mostly empty (only status badge if present). Decide: should `showFolio` be suppressed when both `eyebrow` and `status` are absent? Confirm this edge case before implementation.
- [ ] **FilterBar structure** — the current FilterBar renders filter groups with checkboxes. Before adding zebra CSS, read `FilterBar.module.css` and `FilterBar.jsx` to identify the exact class names for group rows and checkbox inputs. Do not guess selector names.
- [ ] **theme.light.css sync** — confirm both `theme.light.css` locations exist (`apps/web/src/design-system/styles/` and `packages/design-system/src/styles/`) before editing. Check with `ls` before writing.

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-82-ledger-tradition-structural.md` → `docs/shipped/SUG-82-ledger-tradition-structural.md`; `git rm` from backlog; commit: `docs: ship SUG-82 Ledger Tradition Phase 2 structural`
2. Confirm `git status` clean
3. Run `/mini-release SUG-82 Ledger Tradition Phase 2 structural DS updates`
4. Update Linear SUG-82 → Done (only after merge to main confirmed)
5. Start next epic
