# Chip

Canonical taxonomy / filter chip primitive for the Sugartown Design System.

## Anatomy

```
[ label ]              ← static <span>
[ label → ]            ← linked <a>
[ (label) ]            ← button <button>, toggleable
```

## Props

| Prop         | Type                                              | Default | Description |
| ------------ | ------------------------------------------------- | ------- | ----------- |
| `label`      | `string`                                          | —       | Required. Visible chip text. |
| `href`       | `string`                                          | —       | Renders as `<a>`. Full URL; routing is caller's responsibility. |
| `onClick`    | `() => void`                                      | —       | Renders as `<button>`. For filter toggles or click-to-select. |
| `isActive`   | `boolean`                                         | `false` | Active/selected state — solid fill, white text. |
| `color`      | `'pink' \| 'seafoam' \| 'lime' \| 'violet' \| 'amber'` | —  | Named color preset from the Sugartown palette. |
| `colorHex`   | `string`                                          | —       | Hex override — takes precedence over `color` preset. |
| `size`       | `'sm' \| 'md'`                                    | `'md'`  | Size variant. |
| `className`  | `string`                                          | —       | Extra class names for layout overrides. |
| `aria-label` | `string`                                          | —       | Accessible label when visible text is insufficient. |

## Render modes

The chip auto-selects its root element:

1. **`href` provided** → `<a>` (navigation chip)
2. **`onClick` provided** (no href) → `<button>` (filter/toggle chip, with `aria-pressed`)
3. **Neither** → `<span>` (display-only taxonomy label)

Interactive chips (modes 1 + 2) get hover lift + shadow. Static chips do not.

## Color system

All chips derive their visual accent from a single CSS custom property:

```
--_chip-color: var(--chip-color, var(--st-color-accent))
```

Three layers of color resolution (highest to lowest priority):

1. **`colorHex` prop** — inline `style="--chip-color: #hex"` (wins via specificity)
2. **`color` preset** — CSS class sets `--chip-color` to a palette token
3. **Default** — falls back to `var(--st-color-accent)` (brand pink `#FF247D`)

Background, border, and text all derive from `--chip-color` via `color-mix()`:

| Property     | Formula |
| ------------ | ------- |
| `background` | `color-mix(in srgb, accent 8%, transparent)` |
| `border`     | `color-mix(in srgb, accent 35%, transparent)` |
| `color`      | `accent` (direct) |

### Named presets

| Preset    | Token / Value              | Hex       | Usage |
| --------- | -------------------------- | --------- | ----- |
| `pink`    | `var(--st-color-pink)`     | `#FF247D` | Tags, default brand accent |
| `seafoam` | `var(--st-color-seafoam)`  | `#2BD4AA` | Tools & platforms |
| `lime`    | `var(--st-color-lime)`     | `#D1FF1D` | Evergreen / validated |
| `violet`  | hardcoded                  | `#A78BFA` | Projects / strategic |
| `amber`   | hardcoded                  | `#FBBA24` | Status / in-progress |

### Usage in Card

When rendered inside DS Card:
- **Tags** (`tags[]`) → default pink (no `color` prop needed)
- **Tools** (`tools[]`) → `color="seafoam"`
- Cards with `accentColor` tint chips via the Card's `--accent` cascade

### Usage in TaxonomyChips (web)

The web adapter TaxonomyChips.jsx passes:
- `colorHex` from `project.colorHex` / `category.colorHex` when available
- Default pink when no `colorHex` is present

## Sizes

| Size | Font size | Padding | Min height |
| ---- | --------- | ------- | ---------- |
| `md` | `0.75rem` | `0.45em 0.75em` | `28px` |
| `sm` | `0.7rem`  | `0.3em 0.6em`   | `24px` |

## Tokens consumed

| Token                | Usage |
| -------------------- | ----- |
| `--st-color-accent`  | Default chip color fallback |
| `--st-color-pink`    | Pink preset |
| `--st-color-seafoam` | Seafoam preset |
| `--st-color-lime`    | Lime preset |
| `--st-color-white`   | Active state text |
| `--st-font-mono`     | Chip font family |
| `--st-font-size-xs`  | Base font size (0.75rem) |
| `--st-radius-xs`     | Border radius (4px squircle) |

## Examples

```tsx
// Static display chip (no interaction)
<Chip label="Design Systems" />

// Linked chip with named preset
<Chip label="TypeScript" href="/tools/typescript" color="seafoam" />

// Custom color from Sanity data
<Chip label="Sugartown" href="/projects/sugartown" colorHex="#7C3AED" />

// Filter toggle (button mode)
<Chip label="Active Filter" onClick={toggle} isActive={selected} />

// Small size
<Chip label="sm chip" href="#" size="sm" />
```
