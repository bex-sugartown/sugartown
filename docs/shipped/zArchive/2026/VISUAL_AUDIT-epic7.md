# Visual Audit — Epic 7

> This document is the build contract for Epic 7. No component code is written
> without this audit being complete. For each component the audit covers:
> current location → reference spec → CSS classes/tokens → drift → re-pointing verdict.
>
> Reference spec: `artifacts/style 260118.css`
> Design system home: `packages/design-system/src/`

---

## 1 · Chip

### 1a. Current Location
`apps/web/src/components/TaxonomyChips.jsx`
`apps/web/src/components/TaxonomyChips.module.css`

TaxonomyChips is the only chip-like component in the app. It renders `project`,
`category`, and `tag` items as linked pills in `project → category → tag` order,
deduplicates by `_id`, falls back to `<span>` when slug is missing.

### 1b. Reference CSS — `style 260118.css`

```css
/* ── Container ───────────────────────────────────────── */
.st-chips {
  display: flex; flex-wrap: wrap; align-items: center;
  gap: 10px; margin: 0; padding: 0;
}

/* ── Canonical chip ──────────────────────────────────── */
.st-chip, a.st-chip {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--st-font-mono, "Menlo", monospace);
  font-size: 0.75rem; line-height: 1.2;
  padding: 0.45em 0.75em;
  border-radius: var(--st-radius-xs, 4px);   /* ← squircle, NOT pill */
  background: rgba(255, 36, 125, 0.08);
  border: 1px solid rgba(255, 36, 125, 0.35);
  color: var(--st-color-accent, #ff247d);
  text-decoration: none !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

/* ── Hover ──────────────────────────────────────────── */
.st-chip:hover { transform: translateY(-1px); background: rgba(255,36,125,0.15);
  border-color: var(--st-color-accent); box-shadow: 0 2px 5px rgba(255,36,125,0.15); }

/* ── Active ─────────────────────────────────────────── */
.st-chip.is-active { background: var(--st-color-accent); border-color: var(--st-color-accent);
  color: #fff; box-shadow: 0 0 0 2px rgba(255,36,125,0.2); }
```

**Tokens referenced:** `--st-font-mono`, `--st-radius-xs`, `--st-color-accent`

### 1c. Production CSS Classes & Tokens (TaxonomyChips.module.css)

| Class | Key properties |
|---|---|
| `.chipList` | `flex; flex-wrap; gap: 0.375rem; list-style: none` |
| `.chip` | `inline-flex; padding: 0.2em 0.6em; border-radius: 9999px; font-size: 0.75rem; border: 1px solid currentColor` |
| `.chipLink` | `text-decoration: none; color: inherit` |
| `.chip.project` | `color/border: var(--chip-color, #6b7280); bg: color-mix(in srgb, var(--chip-color) 8%, transparent)` |
| `.chip.category` | Same as `.chip.project` |
| `.chip.tag` | `color: #6b7280; border-color: #d1d5db; bg: transparent` |

**Tokens used:** `--chip-color` (custom property from caller). Zero `--st-` tokens.

### 1d. Drift

| Property | Spec (260118.css) | Production (TaxonomyChips) | Severity |
|---|---|---|---|
| Border-radius | `var(--st-radius-xs, 4px)` — squircle | `9999px` — full pill | **Major** — different visual identity |
| Font family | `var(--st-font-mono)` | none (inherits body) | **Major** |
| Hover effect | `translateY(-1px)` + color shift + shadow | `opacity: 0.75` | **Major** |
| Color system | Pink accent base (`rgba(255,36,125,0.08)`) | Generic grey `#6b7280` base | **Major** |
| Active state | Solid pink fill + white text | Not implemented | **Major** |
| Token namespace | `--st-*` throughout | Hard-coded hex fallbacks only | **Major** |
| Gap | 10px | 0.375rem (~6px) | Minor |
| Padding | `0.45em 0.75em` | `0.2em 0.6em` | Minor |

### 1e. Production Re-pointing Verdict

**NOT directly re-pointable.**

The design system `Chip` will be the canonical visual primitive following the spec.
`TaxonomyChips` is an *app-layer* component: it wraps routing (`react-router-dom Link`,
`getCanonicalPath()`), Sanity data shape, and color-aware taxonomy logic — all concerns
that must remain in `apps/web`.

**Plan:**
- Build `packages/design-system/Chip/` as the pure visual primitive.
- Add `// TODO Epic 7 — TaxonomyChips.jsx: adopt @sugartown/design-system Chip for visual consistency` comment in TaxonomyChips.
- Long-term (post Epic 7): TaxonomyChips renders `<Chip>` from the design system.

**Color-aware chips:** The `--chip-color` custom property pattern is app-layer and will be
supported in the design system `Chip` via a `colorHex` prop → `style={{ '--chip-color': colorHex }}`.
The default visual (no colorHex) is the canonical pink.

---

## 2 · FilterBar

### 2a. Current Location
`apps/web/src/components/FilterBar.jsx`
`apps/web/src/components/FilterBar.module.css`

Dumb, fully controlled component. Takes `filterModel` (from `buildFilterModel()`),
`activeFilters` (object), `onFilterChange`, `onClearAll`. Renders `<fieldset>` groups
with native `<input type="checkbox">`. No data fetching. No routing dependencies.

### 2b. Reference CSS — `style 260118.css`

The reference file contains two distinct filter patterns:

1. **`a.st-filter` / `button.st-filter`** — standalone clickable filter chip
   (same visual spec as `.st-chip` exactly: font-mono, 0.75rem, 0.45em 0.75em, border-radius xs, pink).
   This is the *chip-level* element, not a sidebar layout.

2. **`.st-filter` as layout wrapper** (lines ~2009+) — a dropdown container component
   (`position: relative; display: inline-block`) used in a different context.

The production `FilterBar.jsx` is a sidebar checkbox layout — it has no direct
equivalent in `260118.css`. The canonical visual for filter *chips* (the tag-style
toggle buttons) is `.st-filter` = same as `.st-chip`.

**Relevant token references:**
`--st-font-mono`, `--st-radius-xs`, `--st-color-accent`

### 2c. Production CSS Classes & Tokens (FilterBar.module.css)

| Class | Key properties | Token drift |
|---|---|---|
| `.filterBar` | `flex; flex-direction: column; gap: 1.5rem; padding: 1rem; border-radius: 0.5rem` | `border: 1px solid var(--color-border, #e5e7eb)` — wrong namespace |
| `.filterTitle` | `0.75rem; fw 600; uppercase; letter-spacing 0.06em` | `color: var(--color-text-muted, #6b7280)` — wrong namespace |
| `.clearAllButton` | Pill shape (9999px), pill visual | `color: var(--color-text-muted)` — wrong namespace; `outline: 2px solid var(--color-accent, #FF69B4)` — wrong hex |
| `.optionCheckbox` | 1rem × 1rem | `accent-color: var(--color-accent, #FF69B4)` — `#FF69B4` ≠ Sugartown pink `#ff247d` |
| `.optionLabel` | flex, gap 0.375rem | `color: var(--color-text, #111827)` — wrong namespace; hover: `color: var(--color-accent, #FF69B4)` — wrong hex |
| `.optionSwatch` | 0.625rem circle | `background-color: var(--chip-color, transparent)` — OK |
| `.optionCount` | 0.75rem | `color: var(--color-text-muted, #6b7280)` — wrong namespace |

**Tokens used:** `--color-border`, `--color-surface`, `--color-text-muted`, `--color-text`,
`--color-accent`, `--chip-color`. Zero `--st-` tokens.

**Invalid CSS found:** Line 108: `accent-color: var(--color-accent, #FF69B4)` and
line 52: `outline: 2px solid var(--color-accent, #FF69B4)` — fallback hex `#FF69B4` is
standard hot pink, NOT Sugartown `#ff247d`.

### 2d. Drift

| Property | Spec | Production | Severity |
|---|---|---|---|
| Token namespace | `--st-*` | `--color-*` (no `--st-` prefix) | **Critical** — will not pick up design system theming |
| Accent color fallback | `#ff247d` | `#FF69B4` | **Major** — wrong brand pink |
| Layout component | No sidebar equivalent in spec | Sidebar layout (fine) | Design gap — no spec drift |
| Border token | `--st-color-border-default` | `--color-border` (undefined) | **Critical** |
| Surface token | `--st-color-bg-surface` | `--color-surface` (undefined) | **Critical** |

### 2e. Production Re-pointing Verdict

**NOT directly re-pointable — requires token migration first.**

The component logic (fieldset/checkbox pattern, `filterModel` prop shape) is
architecturally sound and should be preserved in the design system verbatim.
Only CSS token names need updating from `--color-*` to `--st-*`.

**Plan:**
- Build `packages/design-system/FilterBar/` as a clean migration of this component.
- Token names migrated: `--color-border` → `--st-color-border-default`, etc.
- All props preserved identically (drop-in compatible after import swap).
- Add `// TODO Epic 7 — replace with @sugartown/design-system FilterBar` comment to
  `apps/web/src/components/FilterBar.jsx`.

---

## 3 · Card

### 3a. Current Location
`apps/web/src/components/EditorialCard.jsx`
`apps/web/src/components/EditorialCard.module.css`
`apps/web/src/components/CardGrid.jsx` (grid wrapper, wraps EditorialCard)

EditorialCard renders `title`, `description`, `image` (via Sanity `urlFor()`), and
optional `link`. Renders as `<a>` when `link.url` present, else `<div>`.

**Critical coupling:** imports `urlFor` from `../lib/sanity` — hard Sanity dependency.
This makes EditorialCard impossible to port to `packages/design-system` as-is.

### 3b. Reference CSS — `style 260118.css`

```css
/* ── Component tokens ────────────────────────────────── */
--st-card-border: var(--st-color-accent, #ff247d);   /* PINK border */
--st-card-bg: var(--st-color-surface, #fff);
--st-card-bg-alt: var(--st-color-surface-alt, #fff0f5);
--st-card-text: var(--st-color-text, #222);
--st-card-muted: var(--st-color-muted, #666);

/* ── Base card ───────────────────────────────────────── */
.st-card {
  position: relative; display: flex; flex-direction: column;
  height: 100%; min-height: 420px; width: 100%;
  background: var(--st-card-bg);
  border: 1px solid var(--st-card-border);   /* ← pink border */
  border-radius: var(--st-radius-md);        /* 12px */
  padding: 28px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.st-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(255,36,125,0.15); }
.st-card--compact { padding: 20px; min-height: 360px; }

/* ── BEM elements ────────────────────────────────────── */
/* .st-card__inner     — relative, flex-col, flex:1 */
/* .st-card__header    — grid: 1fr auto; gap 8px 16px */
/* .st-card__eyebrow   — font-mono, 0.7rem, uppercase, accent color */
/* .st-card__title     — serif, 1.4rem, fw 700, color: var(--st-card-border) = pink */
/* .st-card__subtitle  — ui font, 0.9rem, muted */
/* .st-card__content   — 0.95rem, line-height 1.55 */
/* .st-card__footer    — margin-top: auto (pinned); dashed pink top border */
```

**Tokens referenced:** `--st-card-border`, `--st-card-bg`, `--st-card-text`,
`--st-card-muted`, `--st-radius-md`, `--st-font-mono`

### 3c. Production CSS Classes & Tokens (EditorialCard.module.css)

| Class | Key properties | Token status |
|---|---|---|
| `.card` | `flex-col; border-radius: var(--st-radius-lg, 12px)` | `--st-color-border-subtle` (exists in web, missing in packages); `--st-radius-lg` (exists in web, **missing in packages**) |
| `.card:hover` | `translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1)` | No pink glow — spec uses `rgba(255,36,125,0.15)` |
| `.content` | `padding: var(--st-spacing-inset-md)` | `--st-spacing-inset-md` (exists in web, **missing in packages**) |
| `.title` | `var(--st-font-size-lg, 1.25rem); color: var(--st-color-text-primary)` | `--st-font-size-lg` and `--st-color-text-primary` **missing in packages** |
| `.description` | `var(--st-font-size-sm, 0.875rem); color: var(--st-color-text-secondary)` | `--st-font-size-sm`, `--st-color-text-secondary` **missing in packages** |
| `.linkText` | `var(--st-font-weight-medium)` | `--st-font-weight-medium` **missing in packages** |

**Border note:** EditorialCard uses `var(--st-color-border-subtle)` — a soft grey.
The spec uses `var(--st-card-border)` = pink. **This is the biggest visual drift.**

### 3d. Drift

| Property | Spec (260118.css) | Production (EditorialCard) | Severity |
|---|---|---|---|
| Border colour | `var(--st-card-border)` = **pink** | `var(--st-color-border-subtle)` = grey | **Critical** — different brand identity |
| Border token layer | Tier 3 component token | Tier 2 semantic token | Major |
| min-height | 420px (compact: 360px) | None | Major |
| Hover shadow | `rgba(255,36,125,0.15)` pink glow | `rgba(0,0,0,0.1)` neutral | Major |
| BEM structure | `__inner`, `__header`, `__eyebrow`, `__title`, `__subtitle`, `__content`, `__footer` | Flat: `.card`, `.content`, `.title`, `.description` | Major — missing eyebrow, footer |
| Title colour | `var(--st-card-border)` = pink | `var(--st-color-text-primary)` = dark | Major |
| Title font | Serif (Playfair Display) | Inherited | Major |
| Sanity coupling | None (pure CSS) | `urlFor()` from `../lib/sanity` | Architectural blocker |
| Padding | 28px | `var(--st-spacing-inset-md)` = 16px | Minor |

### 3e. Production Re-pointing Verdict

**NOT re-pointable. Two separate components should coexist:**

1. **`packages/design-system/Card/`** — canonical visual primitive following the spec.
   Pure React, no Sanity, BEM structure, pink border, full spec compliance.
   Used in Storybook, usable by any consumer.

2. **`apps/web/src/components/EditorialCard.jsx`** — stays as-is, web-only.
   Sanity-connected (urlFor), used by CMS page sections.
   Add `// TODO Epic 7 — EditorialCard is a CMS-connected component; visual primitive lives in @sugartown/design-system Card`.

---

## 4 · Token Gap Summary

Tokens missing from `packages/design-system/src/styles/tokens.css` that are needed
for Card, Chip, and FilterBar to render correctly in Storybook:

### Tier 1 — Raw Primitives (add to packages tokens.css)

| Token | Value | Exists in web? | Notes |
|---|---|---|---|
| `--st-font-mono` | `"Menlo", "Monaco", Consolas, monospace` | ✅ as `--st-font-family-mono` | Chip and card eyebrow |
| `--st-font-size-xs` | `0.75rem` | ✅ | Chip, eyebrow, option counts |
| `--st-font-size-sm` | `0.875rem` | ✅ | FilterBar option name, card description |
| `--st-font-size-lg` | `1.125rem` | ✅ | Card title |
| `--st-font-size-xl` | `1.4rem` | ✅ | Card title (spec value) |
| `--st-font-weight-medium` | `500` | ✅ | FilterBar, LinkText |
| `--st-radius-xs` | `4px` | ✅ (`--st-radius-xs: 4px`) | Chip border-radius — packages has `--st-radius-1: 0.25rem` which = 4px but not named correctly |
| `--st-radius-md` | `12px` | ✅ (`--st-radius-md: 12px`) | Card border-radius — packages has `--st-radius-3: 0.75rem` which = 12px but not named correctly |
| `--st-radius-lg` | `16px` | ✅ | EditorialCard fallback |
| `--st-shadow-card` | `0 4px 12px rgba(255, 36, 125, 0.05)` | ✅ | Card Tier 1 shadow |
| `--st-shadow-card-hover` | `0 12px 40px rgba(255, 36, 125, 0.15)` | ✅ | Card hover shadow |
| `--st-shadow-card-deep` | `0 10px 30px rgba(0, 0, 0, 0.06)` | ✅ | Card default shadow (spec) |

### Tier 2 — Semantic (add to packages tokens.css)

| Token | Points to | Exists in web? | Notes |
|---|---|---|---|
| `--st-color-bg-surface-alt` | `--st-color-grey-050` | ✅ | Card alt bg |
| `--st-color-text-default` | `--st-color-charcoal-900` | ✅ | Card text |
| `--st-color-text-secondary` | `--st-color-grey-600` | ✅ | Card description, subtitles |
| `--st-color-text-muted` | `--st-color-grey-400` | ✅ | FilterBar labels, counts |
| `--st-color-border-subtle` | `--st-color-grey-030` | ✅ | EditorialCard border |
| `--st-color-border-medium` | `--st-color-grey-200` | ✅ | General |
| `--st-color-bg-subtle` | `--st-color-grey-040` | ✅ | Surfaces |

### Tier 3 — Component Tokens (add to packages tokens.css)

| Token | Value | Notes |
|---|---|---|
| `--st-card-bg` | `var(--st-color-bg-surface)` | Card bg |
| `--st-card-bg-alt` | `var(--st-color-bg-surface-alt)` | Card alt bg |
| `--st-card-text` | `var(--st-color-text-default)` | Card body text |
| `--st-card-text-muted` | `var(--st-color-text-muted)` | Card muted text |
| `--st-card-border` | `var(--st-color-brand-primary)` | **Pink border — brand signature** |
| `--st-card-radius` | `var(--st-radius-md)` | 12px |
| `--st-card-shadow` | `var(--st-shadow-card-deep)` | Default drop shadow |
| `--st-card-hover-shadow` | `var(--st-shadow-card-hover)` | Hover pink glow |
| `--st-card-hover-translate-y` | `-4px` | Hover lift |

### Semantic Spacing (add to packages tokens.css)

| Token | Value | Notes |
|---|---|---|
| `--st-spacing-stack-xs` | `var(--st-space-1)` | Tight vertical rhythm |
| `--st-spacing-stack-sm` | `var(--st-space-2)` | |
| `--st-spacing-stack-md` | `var(--st-space-4)` | |
| `--st-spacing-inset-md` | `var(--st-space-4)` | Card content padding |
| `--st-spacing-inset-lg` | `var(--st-space-6)` | |

---

## 5 · Build Order

Based on this audit, the correct build order for Epic 7 is:

1. **Token verification** — add all gaps above to `packages/design-system/src/styles/tokens.css`
2. **Chip** — simplest component, no routing, pure CSS Modules
3. **FilterBar** — layout wrapper, clean token migration from `--color-*`
4. **Card** — most complex, full BEM structure, all new component tokens
5. **Exports** — update `packages/design-system/src/index.ts`
6. **Production wiring** — `// TODO Epic 7` comments in `apps/web`, safe re-points only
7. **COMPONENT_CONTRACTS.md** — canonical spec document

---

## 6 · Architecture Constraints (re-stated)

- `packages/design-system` imports **nothing** from `apps/*` or Sanity
- `packages/design-system` imports **nothing** from `react-router-dom`
- All component tokens follow the `--st-` namespace
- CSS Modules throughout (`Component.module.css`)
- Pink Moon theme via `:global([data-st-theme="pink-moon"]) .localClass`
- Canonical structural pattern: `Button.tsx` — named export, typed props, CSS Modules
- BEM element/modifier naming for multi-element components (`__inner`, `__header`, `--compact`)
