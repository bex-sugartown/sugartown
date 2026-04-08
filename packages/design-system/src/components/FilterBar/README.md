# FilterBar

Taxonomy filter sidebar for archive pages. Renders faceted checkboxes from a `FilterModel`.

Extracted from `COMPONENT_CONTRACTS.md` (SUG-21).

## Anatomy

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

## Props

| Prop | Type | Notes |
|---|---|---|
| `filterModel` | `FilterModel \| null \| undefined` | Returns null when empty/null |
| `activeFilters` | `Record<string, string[]>` | `{ facetId: [value, ...] }` |
| `onFilterChange` | `(facetId, value, checked) => void` | Controlled — no internal state |
| `onClearAll` | `() => void` | Called when "Clear all" is clicked |

## Token Consumption

| Property | Token |
|---|---|
| Font size (default) | `--st-font-size-sm` |
| Title / legend font size | `--st-font-size-xs` |
| Title / legend weight | `--st-font-weight-semibold` |
| Border | `--st-color-border-default` |
| Border radius | `--st-radius-sm` |
| Background | `--st-color-bg-surface` |
| Checkbox accent | `--st-color-brand-primary` |

## Pink Moon Direction

Solid surface. Zero radius. Active filter = solid chip. Inactive = outlined. Courier Prime for facet legends.
