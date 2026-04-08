# Component Contracts — Epic 7

> Handoff document for Figma. This spec defines every visual property of the
> Chip, FilterBar, and Card components. Build Figma components to match these
> values exactly. All values are expressed as design token names. Resolve tokens
> via `packages/design-system/src/styles/tokens.css`.
>
> Visual spec source of truth: `artifacts/style 260118.css`
> Implementation: `packages/design-system/src/components/`

---

## 1 · Chip

### Anatomy

```
┌────────────────────────────────┐
│  [label]                       │
└────────────────────────────────┘
```

Single text label. No icon slot at this revision. Future: `[icon] [label]`.

| Layer | Notes |
|---|---|
| **Container** | Inline-flex element. Carries background, border, radius, padding. |
| **Label** | Text content. Mono font, lowercase, no transform. |

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | required | Display text |
| `href` | `string` | — | Renders `<a>` when present |
| `onClick` | `() => void` | — | Renders `<button>` when present (no href) |
| `isActive` | `boolean` | `false` | Solid accent fill |
| `colorHex` | `string` | — | Hex string sets `--chip-color`; overrides pink default |
| `size` | `'sm' \| 'md'` | `'md'` | |
| `className` | `string` | — | Layout overrides |

### Sizing

| Property | Token | Resolved value |
|---|---|---|
| Font family | `--st-font-mono` | `"Menlo", "Monaco", Consolas, monospace` |
| Font size (md) | `--st-font-size-xs` | `0.75rem` (12px) |
| Font size (sm) | — | `0.7rem` |
| Font weight | — | `400` (normal) |
| Line height | — | `1.2` |
| Padding (md) | — | `0.45em 0.75em` |
| Padding (sm) | — | `0.3em 0.6em` |
| Border radius | `--st-radius-xs` | `4px` — squircle |
| Border width | — | `1px` |
| Min-height (md) | — | `28px` |
| Min-height (sm) | — | `24px` |

### Color System

All colours derive from a single `--chip-color` custom property via `color-mix()`:

| Property | Expression | Default resolved value |
|---|---|---|
| Background | `color-mix(in srgb, --chip-color 8%, transparent)` | `rgba(255,36,125,0.08)` |
| Border | `color-mix(in srgb, --chip-color 35%, transparent)` | `rgba(255,36,125,0.35)` |
| Label colour | `var(--chip-color)` | `#ff247d` |

**Default:** `--chip-color` resolves to `var(--st-color-accent)` = `#ff247d`.
**Color-aware:** pass `colorHex` prop to override.

### States

| State | Background | Border | Label | Transform | Shadow | Cursor |
|---|---|---|---|---|---|---|
| Default | 8% accent | 35% accent | accent | — | — | `default` (static) / `pointer` (interactive) |
| Hover (interactive) | 15% accent | accent solid | accent | `translateY(-1px)` | `0 2px 5px 15% accent` | `pointer` |
| Focus | — | — | — | — | 2px solid accent ring, 2px offset | `pointer` |
| Active | solid accent fill | accent solid | `--st-color-white` | — | `0 0 0 2px 20% accent` | — |
| Active + hover | 85% accent (deeper) | 85% accent | white | `translateY(-1px)` | 2px box-shadow | `pointer` |

### Focus Style

2px solid `var(--chip-color)`, 2px offset from container. Applied via `:focus-visible`.

### Transition

`transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease`

---

## 2 · FilterBar

### Anatomy

```
┌─────────────────────────────────────┐
│  FILTER                  [Clear all]│  ← .filterHeader
├─────────────────────────────────────┤
│  <fieldset>                         │  ─┐
│    CATEGORY (legend)                │   │
│    ☐ Option 1            (12)       │   │ .facetList
│    ☑ Option 2            (7)        │   │
│    ☐ Option 3            (4)        │   │
│  </fieldset>                        │  ─┘
│  ···                                │
└─────────────────────────────────────┘
```

| Layer | Notes |
|---|---|
| **filterBar** | `<aside>` wrapper. Flex column, gap 1.5rem. Carries border, radius, bg. |
| **filterHeader** | Title + optional "Clear all" pill button, space-between. |
| **filterTitle** | "FILTER" — mono-style, uppercase, 0.75rem, muted. |
| **clearAllButton** | Ghost pill. Shows only when `hasActiveFilters`. |
| **facetList** | Vertical list of FacetGroup wrappers, gap 1.25rem. |
| **facetGroup** | `<fieldset>`. No border/padding — reset native styles. |
| **facetLabel** | `<legend>`. Uppercase, 0.75rem, semibold, muted. |
| **optionItem** | One checkbox row. `display: flex; align-items: flex-start`. |
| **optionSwatch** | 10px circle; background = `--chip-color` for color-aware facets. |
| **optionName** | Text label, 0.875rem, transitions to brand-primary on hover. |
| **optionCount** | `(n)` count, 0.75rem, muted, flex-shrink: 0. |

### Props

| Prop | Type | Notes |
|---|---|---|
| `filterModel` | `FilterModel \| null \| undefined` | Returns null when empty/null |
| `activeFilters` | `Record<string, string[]>` | `{ facetId: [value, ...] }` |
| `onFilterChange` | `(facetId, value, checked) => void` | Controlled — no internal state |
| `onClearAll` | `() => void` | Called when "Clear all" is clicked |

### Sizing

| Property | Token | Resolved value |
|---|---|---|
| Font size (default) | `--st-font-size-sm` | `0.875rem` |
| Title / legend font size | `--st-font-size-xs` | `0.75rem` |
| Title / legend weight | `--st-font-weight-semibold` | `600` |
| Option name weight | — | inherited (0.875rem body) |
| Border | `--st-color-border-default` | `rgba(13,18,38,0.08)` |
| Border radius | `--st-radius-sm` | `8px` |
| Background | `--st-color-bg-surface` | `#FFFFFF` |
| Outer gap | — | `1.5rem` |
| Facet gap | — | `1.25rem` |
| Option gap | — | `0.375rem` |

### clearAllButton states

| State | Color | Border |
|---|---|---|
| Default | `--st-color-text-muted` | `currentColor` |
| Hover | `--st-color-text-default` | `currentColor` |
| Focus | — | 2px solid `--st-color-brand-primary`, 2px offset |

### accent-color

`accent-color: var(--st-color-brand-primary)` — native checkbox tint. `#ff247d`.

### Color swatch

The `.optionSwatch` for project/category facets uses `--chip-color` (same pattern as Chip).
`background-color: var(--chip-color, transparent)`.

---

## 3 · Card

### Anatomy

```
┌─────────────────────────────────────┐
│  EYEBROW  (mono, uppercase, pink)   │  ← .header → .eyebrow
│  Title in pink serif                │  ← .header → .title
│  Subtitle muted                     │  ← .header → .subtitle
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─   │
│  Body content text goes here        │  ← .content
│  lorem ipsum dolor sit amet         │
│                                     │
│  ╌ ╌ ╌ ╌ ╌ ╌ ╌ ╌ ╌ ╌ ╌ ╌ ╌ ╌ ╌   │  ← .footer dashed top border (pink)
│  [Chip] [Chip] [Chip]               │
└─────────────────────────────────────┘
```

| Layer | Notes |
|---|---|
| **card** | `<article>` or `<a>`. Carries bg, pink border, radius, shadow, padding. |
| **inner** | `position: relative; z-index: 1; display: flex; flex-direction: column; flex: 1`. Enables footer pinning. |
| **header** | Grid container for eyebrow + title + subtitle. `margin-bottom: 14px`. |
| **eyebrow** | Mono, 0.7rem, uppercase, `letter-spacing 0.1em`, pink accent. |
| **title** | 1.4rem, weight 700, `color: var(--st-card-border)` = pink. Optional `<a>` wrapping. |
| **subtitle** | 0.9rem, muted, single-line ellipsis. |
| **content** | Body text, 0.95rem, line-height 1.55. `padding-bottom: 1.5rem`. |
| **footer** | `margin-top: auto` (pinned). `border-top: 1px dashed rgba(255,36,125,0.35)`. |

### Variants

| Variant | Padding | Min-height | Background | Border | Title font |
|---|---|---|---|---|---|
| `default` | `28px` | `420px` | `--st-card-bg` (#fff) | `--st-card-border` (pink) | Serif (Playfair) 1.4rem |
| `compact` | `20px` | `360px` | Same | Same | Serif (Playfair) 1.4rem |
| `listing` | `28px` | `200px` | Same | Same | Sans (Fira Sans) 1.0625rem |
| `dark` | `28px` | `420px` | `#0f1117` | `rgba(255,255,255,0.08)` | Serif (Playfair) 1.4rem |

**`listing` variant details:**
- Optimised for archive-density grids (smaller min-height, tighter spacing)
- Title uses `--st-font-ui` (Fira Sans) instead of narrative serif — too heavy for busy cards
- Content clamped to 3 lines (`-webkit-line-clamp: 3`)
- Eyebrow renders as flex row (`justify-content: space-between`) for composing type label + status badge
- Footer border-top at 25% opacity (vs 35% in default)

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | required | Card title |
| `titleHref` | `string` | — | Makes title an `<a>` link |
| `eyebrow` | `ReactNode` | — | Type/category label above title. String for standard mono treatment, or compose custom content (e.g. label + status badge in a flex row). |
| `subtitle` | `string` | — | Secondary metadata below title |
| `children` | `ReactNode` | — | Body content (`.content` slot) |
| `footer` | `ReactNode` | — | Footer slot — chips, metadata |
| `variant` | `'default' \| 'compact' \| 'listing' \| 'dark'` | `'default'` | |
| `href` | `string` | — | Renders entire card as `<a>` |
| `as` | `React.ElementType` | — | Polymorphic root element override. Defaults to `'article'`, or `'a'` when `href` is provided. Use for SPA routing: `<Card as={Link} to="/path" />`. |
| `className` | `string` | — | Layout overrides from parent grid |
| `[key: string]` | `unknown` | — | Rest props forwarded to root element (e.g. `to` for router Link) |

### Sizing & Typography

| Property | Token | Resolved value |
|---|---|---|
| Border | `--st-card-border` → `--st-color-brand-primary` | `1px solid #ff247d` |
| Border radius | `--st-card-radius` → `--st-radius-md` | `12px` |
| Padding (default) | — | `28px` |
| Padding (compact) | — | `20px` |
| Min-height (default) | — | `420px` |
| Min-height (compact) | — | `360px` |
| Box-shadow (default) | `--st-card-shadow` → `--st-shadow-card-deep` | `0 10px 30px rgba(0,0,0,0.06)` |
| Eyebrow font | `--st-font-mono` | `"Menlo", "Monaco", Consolas, monospace` |
| Eyebrow size | — | `0.7rem` |
| Eyebrow weight | — | `700` |
| Eyebrow letter-spacing | — | `0.1em` |
| Title size | `--st-font-size-xl` | `1.4rem` |
| Title weight | — | `700` |
| Title colour | `--st-card-border` | `#ff247d` (pink) |
| Subtitle size | — | `0.9rem` |
| Subtitle colour | `--st-card-text-muted` | `--st-color-text-muted` |
| Content size | — | `0.95rem` |
| Content line-height | — | `1.55` |
| Footer top-border | — | `1px dashed rgba(255,36,125,0.35)` |

### Hover State

| Property | Default | Hover |
|---|---|---|
| Transform | — | `translateY(-4px)` |
| Box-shadow | `--st-card-shadow` (dark, subtle) | `--st-card-hover-shadow` → `0 12px 40px rgba(255,36,125,0.15)` |
| Transition | `transform 0.2s ease, box-shadow 0.2s ease` | |

**Dark variant hover:** adds `0 0 0 1px rgba(255,36,125,0.28)` glow ring on top of hover shadow.

### Figma Guidance

- Card border: use a stroke, not a fill. Colour = `--st-color-brand-primary` (#ff247d).
- Title text: use Playfair Display (narrative serif) for default/compact/dark. Use Fira Sans (UI font) for listing.
- Eyebrow text: use the mono typeface. In listing variant, eyebrow is a flex row — left slot for type label, right slot for optional status badge.
- Footer border: dashed stroke, `rgba(255,36,125,0.35)` for default, `rgba(255,36,125,0.25)` for listing. 1px weight.
- The dark variant: override bg with `#0f1117`, border opacity `rgba(white, 8%)`, text colours lightened.
- Hover glow: `0 12px 40px rgba(255,36,125,0.15)` as an outer shadow in Figma.
- Listing variant: create as a separate Figma variant with reduced min-height (200px), sans title, 3-line content area.

---

## 4 · Token Reference

All component tokens resolve via `packages/design-system/src/styles/tokens.css`.

### Chip tokens

| Token | Value |
|---|---|
| `--st-font-mono` | `"Menlo", "Monaco", Consolas, monospace` |
| `--st-font-size-xs` | `0.75rem` |
| `--st-radius-xs` | `4px` |
| `--st-color-accent` | `var(--st-color-pink-500)` = `#ff247d` |
| `--st-color-white` | `#FFFFFF` |

### FilterBar tokens

| Token | Value |
|---|---|
| `--st-color-border-default` | `rgba(13,18,38,0.08)` |
| `--st-color-bg-surface` | `#FFFFFF` |
| `--st-color-text-muted` | `var(--st-color-grey-400)` = `#94A3B8` |
| `--st-color-text-default` | `var(--st-color-charcoal-900)` = `#1e1e1e` |
| `--st-color-brand-primary` | `#ff247d` |
| `--st-radius-sm` | `8px` |
| `--st-font-size-xs` | `0.75rem` |
| `--st-font-size-sm` | `0.875rem` |
| `--st-font-weight-semibold` | `600` |
| `--st-font-weight-medium` | `500` |

### Card tokens

| Token | Value |
|---|---|
| `--st-card-border` | `var(--st-color-brand-primary)` = `#ff247d` |
| `--st-card-bg` | `var(--st-color-bg-surface)` = `#FFFFFF` |
| `--st-card-bg-alt` | `var(--st-color-bg-surface-alt)` = `#f8f8fa` |
| `--st-card-text` | `var(--st-color-text-default)` = `#1e1e1e` |
| `--st-card-text-muted` | `var(--st-color-text-muted)` = `#94A3B8` |
| `--st-card-radius` | `var(--st-radius-md)` = `12px` |
| `--st-card-shadow` | `var(--st-shadow-card-deep)` = `0 10px 30px rgba(0,0,0,0.06)` |
| `--st-card-hover-shadow` | `var(--st-shadow-card-hover)` = `0 12px 40px rgba(255,36,125,0.15)` |
| `--st-card-hover-translate-y` | `-4px` |
| `--st-font-size-xl` | `1.4rem` |
| `--st-font-mono` | `"Menlo", "Monaco", Consolas, monospace` |
| `--st-color-accent` | `#ff247d` |

---

## 5 · Do / Don't

| | Rule |
|---|---|
| ✅ **Do** | Pass `colorHex` to Chip for project/category taxonomy chips to get the brand color accent. |
| ✅ **Do** | Use `isActive` on button-mode Chips for filter toggles. |
| ✅ **Do** | Always put taxonomy chips in the Card `footer` slot so they pin to the bottom. |
| ✅ **Do** | Use `eyebrow` for content type (Article, Case Study, Node) — mono, uppercase, pink. |
| ✅ **Do** | Use `as={Link}` + `to={path}` for SPA routing in apps/web — `href` is for static links only. |
| ✅ **Do** | Use `variant="listing"` for archive/taxonomy grids — never inline card components in page files. |
| ✅ **Do** | Compose custom eyebrows via ReactNode (e.g. `<><span>Type</span><StatusBadge /></>`) — don't nest structure in a string. |
| ❌ **Don't** | Override chip shape with `border-radius: 9999px` (pill) — the spec uses 4px squircle. |
| ❌ **Don't** | Use a grey/subtle border on Card — the pink border is the brand signature. |
| ❌ **Don't** | Put the title in UI font — it must use the narrative/serif typeface. |
| ❌ **Don't** | Use `--color-*` tokens in FilterBar CSS — always use the `--st-*` namespace. |
| ❌ **Don't** | Import react-router-dom in packages/design-system — routing is app-layer. |

---

## 6 · Production Migration Status

| Component | Design system | apps/web equivalent | Status |
|---|---|---|---|
| Chip | `@sugartown/design-system → Chip` | `TaxonomyChips.jsx` | TODO — TaxonomyChips needs routing wrapper preserved |
| FilterBar | `@sugartown/design-system → FilterBar` | `FilterBar.jsx` | TODO — drop-in when apps/web CSS token migration confirmed |
| Card | `@sugartown/design-system → Card` | `web DS Card.jsx` → `ContentCard.jsx` | ✅ Canonical — 3-layer architecture (DS Card → Web Card adapter → ContentCard). All archive/taxonomy pages use ContentCard. |
| Card (editorial) | — | `EditorialCard.jsx` | Permanent parallel — EditorialCard has Sanity image + different layout; future `media` variant candidate |
| Table | `@sugartown/design-system → Table, TableWrap` | `web DS table/Table.jsx` | ✅ Web adapter synced (v7c) |
| Blockquote | `@sugartown/design-system → Blockquote` | `web DS blockquote/Blockquote.jsx` | ✅ Web adapter synced (v7c) |
| Callout | `@sugartown/design-system → Callout` | `web DS callout/Callout.jsx` | ✅ Web adapter synced (v7c) |
| CodeBlock | `@sugartown/design-system → CodeBlock, InlineCode` | `web DS codeblock/CodeBlock.jsx` | ✅ Web adapter synced (v7c) |
| Media | `@sugartown/design-system → Media` | `web DS media/Media.jsx` | ✅ Web adapter synced (v7c) — duotone/overlay support added |

---

## 7 · Web Adapter Sync Workflow

> When a DS component is created or modified, a matching web adapter **must** be
> created/updated in the same commit. The web app does not import from
> `@sugartown/design-system` — it has a thin JSX adapter layer at
> `apps/web/src/design-system/components/`.

### Checklist for each new DS component

1. **JSX adapter** — `apps/web/src/design-system/components/{name}/{Name}.jsx`
   - Mirror the DS `.tsx` file: same props, same structure, strip TypeScript types
   - Header comment: `Mirrors: packages/design-system/src/components/{Name}/{Name}.tsx`
2. **CSS module** — copy `.module.css` from DS component directory verbatim
3. **Index export** — add to `apps/web/src/design-system/index.js`
4. **Runtime deps** — if the DS component uses a library (e.g. `lucide-react`, `prismjs`), add it to `apps/web/package.json`

### Drift rule

The CSS module in `apps/web/src/design-system/components/{name}/` must match the
DS version in `packages/design-system/src/components/{Name}/`. Same drift rule as
`tokens.css` — update both in the same commit.

### Future

When `apps/web` imports directly from `@sugartown/design-system` as a build-time
dependency, this adapter layer can be replaced with re-exports.
