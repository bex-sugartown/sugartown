# SUG-99 — case-study template: component harmony rework

**Linear Issue:** SUG-99 _(link pending — Linear MCP was unavailable at epic creation; add URL once created)_
**Status:** Backlog
**Priority:** Normal
**Tags:** Design System · Case Study
**Phase 0 mock:** `docs/drafts/SUG-99-component-harmony-mock.html`

---

## Background

The case-study page template has three components that break harmony with MetadataCard (locked in
SUG-88). A design exploration produced locked direction choices in
`docs/drafts/Component rework _ explore_ decide_ handoff/`.

The directions update three existing components — `Callout`, `SectionLabel`, `Accordion` — add one
new semantic wrapper (`SectionContainer`), and verify the existing `Tile` CSS for zero-radius compliance.

**Phase 0 sign-off required** before any JSX or CSS is written. Open
`docs/drafts/SUG-99-component-harmony-mock.html` to review all four surfaces with annotations.

---

## Design handoff

| File | Location |
|------|----------|
| Decision doc | `docs/drafts/Component rework _ explore_ decide_ handoff/SUG-XX-decisions.md` |
| Interactive exploration | `docs/drafts/Component rework _ explore_ decide_ handoff/exploration/SUG-XX-backroads-rework-explorations.html` |
| Phase 0 mock | `docs/drafts/SUG-99-component-harmony-mock.html` |

Reference component: `MetadataCard` (SUG-88). Every change must harmonize with it.

---

## Scope

### What the design doc proposes vs what exists + what this epic does

| Design doc | Existing component | Epic action |
|---|---|---|
| `Callout` `variant="ledger"` (new variant) | `Callout.jsx` — two-column grid, accent-tinted bg | **Update default.** No new variant. Row-format becomes the default layout. |
| New `SectionLabel.jsx` (folio pattern) | `SectionLabel.jsx` — mono-caps + rule only | **Add `variant="folio"`** with `number`, `name`, `title`, `kicker` props |
| New `SectionLedger.jsx` | `Grid` + `Tile` from SUG-96 | **New `SectionContainer`** — thin semantic wrapper, owns outer border + 2px rule |
| New `StatTile.jsx` | `Tile` from SUG-96 | **CSS audit only.** No new component. Strip radius/shadow if present. |
| `Accordion` `variant="hairline"` (new variant) | `Accordion.jsx` — existing items/ARIA pattern | **Update existing.** No new variant. Add `numbered`, `numberPrefix` props. |

---

## Token review — explicit list for approval

> **User constraint (2026-05-04):** No "ledger"-specific tokens. No new tokens for "ledger"-themed
> naming. Resolve to existing tokens wherever possible.

The design doc proposed 9 new tokens. Below is each one with the agreed resolution.
This list must be confirmed before any token file changes.

### Callout

| Design doc token | Proposed resolution |
|---|---|
| `--st-callout-ledger-label-w: 130px` | ❌ No new token. Widen existing `--st-callout-label-width` from `72px` → `130px` |
| `--st-callout-ledger-label-bg: var(--st-card-label-bg)` | ❌ No new token. Reference `--st-card-label-bg` directly in `.label` CSS |
| `--st-callout-ledger-border: var(--st-color-rule-accent)` | ❌ No new token. Reference `--st-color-rule-accent` directly |
| `--st-callout-ledger-rule: var(--st-color-ink)` | ❌ No new token. Update `--st-callout-rule-top` default value to `2px solid var(--st-color-ink)` |
| dark: `--st-callout-ledger-rule: var(--st-color-pink)` | ❌ No new token. Scoped CSS under `[data-theme="dark-pink-moon"]` on `.callout` |

### SectionContainer + Tile

| Design doc token | Proposed resolution |
|---|---|
| `--st-section-ledger-rule: var(--st-color-ink)` | ❌ No new token. Reference `--st-color-ink` directly in `SectionContainer.module.css` |
| `--st-section-ledger-divider: var(--st-color-rule-accent)` | ❌ No new token. Reference `--st-color-rule-accent` directly |

### Accordion

| Design doc token | Proposed resolution |
|---|---|
| `--st-accordion-hairline-rule: var(--st-color-ink)` | ❌ No new token. Reference `--st-color-ink` directly in `.numbered` CSS |
| `--st-accordion-hairline-divider: var(--st-color-rule-accent)` | ❌ No new token. Reference `--st-color-rule-accent` directly |
| `--st-accordion-qnum-color: var(--st-color-pink)` | ❌ No new token. Reference `--st-color-pink` directly |

**Net token changes: one.** `--st-callout-label-width` value changes from `72px` → `130px`.
No new token names. `pnpm validate:tokens` must pass before and after — confirm no new `--st-*` names.

---

## Component API changes — for review

### 1. Callout — default layout updated to row format, colorways revised

**No new variant prop.** The default callout changes from accent-tinted fill to the row format
(neutral label column, full box border). All five variant names are retained; colorways updated.

**Structural changes:**
- `--st-callout-label-width`: `72px` → `130px`
- `--st-callout-rule-top` default: `var(--st-color-pink)` → `var(--st-color-ink)` (default is neutral, not pink)
- Label column gains `background: var(--st-card-label-bg)` (solid strip, not full-width tint)
- Body column gains explicit `background: var(--st-color-canvas)` (white on light, not color-mix)
- Side + bottom borders added: `1px solid var(--st-color-rule-accent)`
- Accent-mix background (`color-mix(in srgb, …)`) removed from base `.callout`

**Prop additions (applies to all variants):**
```ts
number?: string   // folio label e.g. '§ 01' — displayed above title in label column
// title prop already exists — becomes primary label text in row format
```

**Colorway mapping (existing variant names, updated accent colors):**

| Variant | Top border | Label `§NN` color | Label bg |
|---|---|---|---|
| `default` | `--st-color-ink` | `--st-color-pink` | `--st-card-label-bg` |
| `info` | `--st-color-pink` | `--st-color-pink` | `--st-card-label-bg` |
| `tip` | `--st-color-violet` | `--st-color-violet` | `--st-card-label-bg` |
| `warn` | `--st-color-orange-400` | `--st-color-orange-400` | `--st-card-label-bg` |
| `danger` | `--st-color-maroon` | `--st-color-maroon` | `--st-card-label-bg` |

Dark theme: all top borders flip to accent (pink for default, or variant accent for named variants).

### 2. SectionLabel — new `variant="folio"` prop

**Existing API preserved.** `variant="default"` (current `rule` + `children` behavior) is unchanged.

**New props (only active when `variant="folio"`):**
```ts
variant?: 'default' | 'folio'
number?: string    // '§ 03' — mono, pink, left
name?: string      // 'Outcomes' — mono caps, ink, left (after number)
title?: string     // 'What changed' — Cormorant, centre
kicker?: string    // 'Measured 90 days post-launch' — mono, right-aligned
```

Visual: single row, 1px `--st-color-ink` baseline, three zones —
left (mono pink §NN + mono name) | centre (Cormorant title) | right (mono kicker).
`children` becomes a no-op in `variant="folio"`.

### 3. SectionContainer — new component

**New file:** `apps/web/src/design-system/components/section-container/SectionContainer.jsx`

Thin semantic wrapper. Owns outer border and 2px ink top rule. Children (Tiles) share internal
dividers via the bg-through-gap pattern (inner grid bg = `--st-color-rule-accent`, gap: `1px`).

```ts
children: ReactNode   // expects Tile children
className?: string
```

No theme-specific tokens. Uses `--st-color-ink` and `--st-color-rule-accent` directly.
Each Tile child must carry `background: var(--st-card-bg)` to cover the gap bg — annotate this
in both the Tile CSS and SectionContainer docs.

### 4. Accordion — `numbered` and `numberPrefix` props added

**No new variant.** Existing `items`, `multi`, `defaultOpen` props unchanged.

**New props:**
```ts
numbered?: boolean          // default false — enables Q-number column + hairline styling
numberPrefix?: string       // default 'Q' — e.g. 'Q' → 'Q.01', 'A' → 'A.01'
```

When `numbered=true`:
- Container gets 2px `--st-color-ink` top rule + 1px `--st-color-rule-accent` row dividers
- Layout becomes a 3-column grid: `56px` (number) | `1fr` (question/answer) | `auto` (chevron)
- Q-number renders as `{prefix}.{index padded to 2}` in `--st-color-pink` IBM Plex Mono
- Question text renders in Cormorant Garamond
- Internals: `<details>`/`<summary>` when `numbered=true` — zero-JS keyboard + screen-reader correctness
- Answer body aligns to column 2 (skipping number column), prefixed by a dashed hairline divider

Existing button/ARIA pattern remains the internals for `numbered=false`.

### 5. Tile — CSS audit only

Verify `Tile.module.css` has zero radius and zero shadow. No API changes.
If hardcoded values found, replace with token references in the same commit.

---

## Phases

### ✅ Phase 0 — HTML mock (complete — pending sign-off)

Mock at `docs/drafts/SUG-99-component-harmony-mock.html`. Shows:
1. Callout — default grey + 4 colorways (info/pink, tip/violet, warn/orange, danger/maroon)
2. SectionLabel `variant="folio"` + SectionContainer + Tile strip
3. Accordion `numbered={true}` with Q.01/Q.02 items
4. In-context page sequence (MetadataCard → Callout → SectionLabel+SectionContainer → Accordion)

**Phase 0 approved 2026-05-04. Phase 1 may begin.**

### Phase 1a — Tile CSS audit

- Read `Tile.module.css`, verify `border-radius: 0` / no `box-shadow`
- Fix any hardcoded color values → token references
- Run `pnpm validate:tokens --strict-colors` — zero violations
- Commit: `fix(sug-99): verify Tile zero-radius, strip any hardcoded values`

### Phase 1b — Callout update

- Update `Callout.jsx`: add `number` prop
- Update `Callout.module.css`: row layout, `--st-callout-label-width` → 130px, label column bg,
  full box border, remove color-mix bg, update variant colorways (info=pink, tip=violet, warn=orange)
- Update `--st-callout-label-width` in both token files (72px → 130px)
- Update `--st-callout-rule-top` default value (→ ink)
- Update stories in `Callout.stories.tsx`
- Run token validators
- Commit: `feat(sug-99): update Callout to row format, add number prop, revise colorways`

### Phase 1c — SectionLabel `variant="folio"`

- Extend `SectionLabel.jsx` with `variant="folio"`, `number`, `name`, `title`, `kicker` props
- Update `SectionLabel.module.css` with `.folio` rules
- Add folio story to `SectionLabel.stories.tsx`
- Commit: `feat(sug-99): add SectionLabel variant="folio"`

### Phase 1d — SectionContainer

- Create `apps/web/src/design-system/components/section-container/SectionContainer.jsx`
- Create `SectionContainer.module.css`
- Create `SectionContainer.stories.tsx` (with Tile children)
- Commit: `feat(sug-99): add SectionContainer — semantic wrapper for shared-border Tile strips`

### Phase 1e — Accordion `numbered` prop

- Extend `Accordion.jsx` with `numbered`, `numberPrefix` props; add `<details>`/`<summary>` path
- Update `Accordion.module.css` with `.numbered` rules
- Update stories
- Commit: `feat(sug-99): add Accordion numbered prop — Q-numbers, hairline rules, details internals`

### Phase 2 — Wire into case-study template

- Update `PageSections.jsx` renderers (or `CaseStudyPage.jsx`) to use updated components
- Challenge block → `<Callout number="§ 01" title="The Challenge">…</Callout>`
- Outcomes block → `<SectionLabel variant="folio" …>` + `<SectionContainer><Tile …/></SectionContainer>`
- Key Questions block → `<Accordion numbered numberPrefix="Q" items={…} />`
- Sanity schema: add `number` field to Callout section type if needed
- Commit: `feat(sug-99): wire updated components into case-study template`

### Phase 3 — Close-out

- Chromatic snapshot pass — zero new component errors
- Light + dark WCAG AA check on all updated surfaces
- Mini-release, ship epic doc, Linear → Done

---

## Acceptance criteria

1. Callout default renders as a two-column box: 2px `--st-color-ink` top, 1px `--st-color-rule-accent` sides/bottom, 130px label column on `--st-card-label-bg`, body on canvas. `number` prop shows `§ 01` in pink mono above `title`.
2. Callout colorways: info=pink, tip=violet, warn=orange, danger=maroon — top border + §NN color match. Label bg remains `--st-card-label-bg` in all colorways.
3. `variant="default"` Callout (no number, no title) degrades gracefully — label column shows variant name as before.
4. `<SectionLabel variant="folio" number="§ 03" name="Outcomes" title="What changed" kicker="90 days">` renders three-zone row with 1px ink baseline.
5. `<SectionContainer>` renders 2px ink top rule, 1px neutral border, shared 1px dividers between Tile children, zero gaps.
6. `<Accordion numbered numberPrefix="Q" items={[…]}>` renders Q.NN in pink mono, Cormorant questions, 2px ink top rule, hairline dividers, `<details>`/`<summary>` internals.
7. `numbered=false` Accordion is **visually and functionally unchanged** — existing stories pass.
8. `pnpm validate:tokens` passes — only one token change (`--st-callout-label-width` value, not name).
9. All new/updated variants have Storybook stories included in the Chromatic snapshot.
10. Light + dark themes both pass WCAG AA on all updated surfaces.

---

## Deferred (post-launch)

- **Section heading audit across the template** — once SectionLabel folio ships for Outcomes,
  the plain h2s on Challenge, Big Picture, Process, Reflection look inconsistent. File as SUG-XY.
- **Visual Artifacts grid** — verify `--st-radius-media` is the only radius in the template.
- **Marginalia accordion** — "Direction C" Accordion design reserved for long-form essays.

---

_Sugartown · Design System · 2026-05-04_
