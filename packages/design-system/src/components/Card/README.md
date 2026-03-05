# Card

**Package:** `@sugartown/design-system`
**Epic:** EPIC-0156 · v3.2
**Status:** Foundation complete — web adapter migration pending

---

## Purpose

`Card` is the Sugartown DS content surface primitive. It implements the
Library Catalog aesthetic — metadata discipline, monospaced labels, systematic
layout — not paper, not tape, not skeuomorphic cosplay.

Three layout variants. One density modifier. One colorway mechanism.
All appearance via design tokens. No hardcoded colour values.

---

## Anatomy

```
+--------------------------------------------------+
|  __thumbnailHero  (default + thumbnailUrl only)  |
|  full-width 16:9 above header                    |
+--------------------------------------------------+
|  __header  (flex-shrink:0 — LOCKED)              |
|  |-- __eyebrow     "Node · PROJ-001"             |
|  |-- __category    "Category: [linked text]"     |
|  |-- __statusBadge (absolute, floats right)      |
|  +-- __title  [linked if href; ::after hit-tgt]  |
|       +-- __subtitle  (default only)             |
+--------------------------------------------------+
|  __body  (flex:1 1 auto — LOCKED)                |
|  |-- __excerpt                                   |
|  |-- __projectAttribution                        |
|  |-- __metadataGrid (metadata variant)           |
|  |-- __toolsRow  (outlined seafoam chips)        |
|  +-- __tagsRow   (filled pink chips)             |
+--------------------------------------------------+
|  __footer  (flex-shrink:0 — LOCKED)              |
|  |-- __footerLeft                                |
|  |    |-- __nextStep   "Next Step: [text]"       |
|  |    |-- __aiTool     "AI: [tool name]"           |
|  |    +-- __kpiLink    "KPIs: [View →]"          |
|  +-- __footerRight                               |
|       +-- __date                                 |
+--------------------------------------------------+
```

### Layout contract

- `__header` and `__footer` have `flex-shrink: 0` — never compress, never float
- `__body` has `flex: 1 1 auto` — expands to fill available space between them
- No `min-height` on root or grid wrapper — cards work at any height driven by content
- Full-card click uses `::after` hit-target on title link, not a wrapping `<a>`

---

## Variants

| Variant     | Use case                              |
| ----------- | ------------------------------------- |
| `default`   | Archive grids, article cards          |
| `listing`   | Single-column archive lists, sidebars |
| `metadata`  | Detail page sidebar surfaces          |

## Modifiers

| Prop                   | Value             | Effect                                |
| ---------------------- | ----------------- | ------------------------------------- |
| `density`              | `'compact'`       | Tighter padding + smaller type scale  |
| `accentColor`          | hex string        | Left border, eyebrow tint, header wash via `color-mix()` |

---

## Props

```tsx
interface CardProps {
  // Layout
  variant?:          'default' | 'listing' | 'metadata'
  density?:          'default' | 'compact'

  // Header
  title:             string                             // required
  eyebrow?:          string                             // "Node · PROJ-001"
  category?:         { label: string; href: string }
  categoryPosition?: 'before' | 'after'                 // default: 'before'
  subtitle?:         string                             // default variant only
  status?:           'draft' | 'active' | 'archived' | 'evergreen'
                     | 'implemented' | 'validated' | 'deprecated'

  // Body
  excerpt?:          string
  project?:          { label: string; href?: string }   // listing variant
  metadata?:         Array<{ label: string; value: string }>  // metadata variant

  // Chips
  tags?:             Array<{ label: string; href?: string }>   // filled pink
  tools?:            Array<{ label: string; href?: string }>   // outlined seafoam

  // Footer
  date?:             string              // ISO
  nextStep?:         string
  aiTool?:           string
  kpiLink?:          { label: string; href: string }

  // Media
  thumbnailUrl?:     string              // never featuredImage — see Image Strategy
  thumbnailAlt?:     string

  // Colorway
  accentColor?:      string              // hex from project.colorHex

  // Linking
  href?:             string              // full-card via ::after — not wrapping <a>
  className?:        string
}
```

---

## Metadata sub-types

The `metadata` variant has 4 documented sub-types. These are **story conventions
only — not code branches**. Fields specific to a single sub-type (conversationType,
projectId, priority, client, role) are passed via the `metadata[]` array as
`{ label, value }` rows. Do not add named props for single sub-type fields.

| Sub-type        | Story name         |
| --------------- | ------------------ |
| Node (full)     | `MetadataNode`     |
| Article minimal | `MetadataArticle`  |
| Case Study      | `MetadataCaseStudy`|
| Project         | `MetadataProject`  |

---

## Image Strategy

**`thumbnailUrl` source:** `hero.media[0]` or `sections[]` via GROQ projection in
`apps/web`. The component receives a resolved URL string or nothing.

**`featuredImage` is deprecated.** It exists on `article` and `caseStudy` schemas
for legacy data continuity only. Do not reference it in any new GROQ query,
component, adapter, story, or documentation. Studio hide tracked in BL-07.

---

## Full-card-clickable pattern

When `href` is provided, the title link gets an `::after` pseudo-element that
expands to fill the entire card (`position:absolute; inset:0`). The root card is
`position:relative`. Other interactive children (chips, category links, footer
links) must be `position:relative; z-index:1` to sit above the hit target.

Never wrap the card in an `<a>` tag containing child links — invalid HTML and
inaccessible.

---

## accentColor colorway

```tsx
<Card accentColor="#2BD4AA" ... />
```

Applies `style="--accent: #2BD4AA"` to the root. CSS selects on `[style*="--accent"]`
to produce:

- `border-left: 3px solid color-mix(in srgb, var(--accent) 80%, transparent)`
- `background: color-mix(in srgb, var(--accent) 6%, transparent)` on header
- `color: var(--accent)` on eyebrow
- Tag chips inherit the accent color (bg/border/text via `color-mix()`)

Absent prop = no style attribute = no rules fire = default appearance.

The chip cascade means project-tinted cards get project-colored tag chips by
default. Individual chip `colorHex` overrides (via inline `--chip-color`) still
win when the unified Chip primitive is integrated.

---

## Tokens

All values via design tokens. New tokens added by EPIC-0156:

| Token                       | Dark default                | Light override              |
| --------------------------- | --------------------------- | --------------------------- |
| `--st-color-text-eyebrow`   | `var(--st-color-pink)`      | `var(--st-color-pink)`      |
| `--st-color-category-link`  | `var(--softgrey-400)`       | `#666680`                   |
| `--st-color-footer-divider` | `rgba(255,111,184,.22)`     | `rgba(255,36,125,.25)`      |
| `--st-color-chip-bg`        | `rgba(255,255,255,.06)`     | `rgba(255,36,125,.08)`      |
| `--st-card-thumb-rail-width`| `96px`                      | `96px`                      |
| `--st-card-shadow`          | `0 14px 40px rgba(0,0,0,.18)` | `0 4px 20px rgba(0,0,0,.06)` |
| `--st-card-hover-shadow`    | `0 18px 55px rgba(0,0,0,.22)` | `0 8px 32px rgba(255,36,125,.12)` |
| `--st-card-border`          | `rgba(255,36,125,0.2)` (same in both themes)        ||

---

## st-layout-grid

Grid wrapper utility class. Added to `globals.css` in EPIC-0156:

```css
.st-layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--st-space-6, 24px);
}
```

---

## Accessibility

- `<article>` root — semantic landmark
- `aria-label={title}` on full-card link (title link `::after`)
- `aria-label="Tags"` and `aria-label="Tools"` on chip list elements
- Status badge has `aria-label="Status: [value]"`
- `<time dateTime={iso}>` for dates
- Focus ring on full-card link via `--st-color-brand-primary` outline

---

## Non-goals

- No CMS types, GROQ, or Sanity shapes inside the component
- No KPI data, bars, or numbers in any card body (KPIs via `kpiLink` only)
- No theme prop — light/dark via `[data-theme]` token inheritance (EPIC-0152)
- No `dark` variant — retired; dark theme handled by token system
- No `min-height` — ever

---

## Backlog

| ID    | Description                                           |
| ----- | ----------------------------------------------------- |
| BL-01 | Brand color picker dropdown in Sanity Studio          |
| BL-02 | Dedicated `cardImage` schema field                    |
| BL-06 | Lock categoryPosition after Storybook review          |
| BL-07 | Studio hide for deprecated `featuredImage` field      |

---

## Web adapter migration

The web adapter at `apps/web/src/design-system/components/card/Card.jsx` is a
legacy copy with the old slot-based API (`children`, `footer`, `titleHref`).
All app-level callers (ContentCard, EditorialCard, MetadataCard) currently use
the old API. Migration to the new named-prop API is a follow-up task (not yet
scoped as an epic). The web adapter should not be updated until callers are ready.
