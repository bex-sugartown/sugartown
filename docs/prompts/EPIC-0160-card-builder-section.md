# EPIC-0160 — Card Builder Section

## Context

The homepage (and eventually other pages) needs editor-assembled card grids. The screenshot shows 4 cards with greyscale/overlay images, eyebrows, titles, subtitles, body copy, citation footnotes, and tag chips. The existing `EditorialCard` component is orphaned (never imported by any page) and uses its own CSS rather than the DS Card primitive — it cannot be reused. The existing `editorialCard` Sanity object is too minimal (title, description, image, link only).

This epic creates a new **Card Builder section** for the page section editor, backed by a new `cardBuilderItem` Sanity object and rendered via the DS Card → Web Card adapter pipeline. The old `EditorialCard.jsx`, `CardGrid.jsx`, and `editorialCard` schema object are deprecated but not deleted.

**Dependency:** Citation footer rendering depends on EPIC-0159 (`CitationMarker`, `CitationNote`, `CitationZone`). This epic can build the schema and card rendering, with citation fields wired to a placeholder until EPIC-0159 lands.

---

## Step 1 — New Sanity object: `cardBuilderItem`

**File:** `apps/studio/schemas/objects/cardBuilderItem.ts` (new)

Fields:
- `title` — string (required, max 100). The card's main heading.
- `titleLink` — object: `{ type: 'internal' | 'external', internalRef: reference(page, article, caseStudy, node), externalUrl: url }`. Conditional fields based on type. This is the card's primary link — drives the `href` prop on DS Card (full-card click via `::after` hit-target on the title). Other links in the card (citation, tag chips) sit above the hit-target at `z-index: 1`.
- `image` — image with hotspot + alt text
- `imageEffect` — string, options: `'original'`, `'greyscale'`, `'greyscale-overlay'`. Default: `'greyscale-overlay'`
- `eyebrow` — string (max 50)
- `subtitle` — string (max 150)
- `body` — array of block (portable text, same config as textSection excerpts — no images, just styled text)
- `citation` — object: `{ text: string, url: url, label: string }` — citation text + optional link displayed in card footer
- `tags` — array of references to `tag` type

Preview: title + eyebrow subtitle + image media.

---

## Step 2 — New Sanity section: `cardBuilderSection`

**File:** `apps/studio/schemas/sections/cardBuilderSection.ts` (new)

Fields:
- `heading` — string (optional section heading)
- `layout` — string: `'grid'` | `'list'`. Default: `'grid'`
- `cards` — array of `cardBuilderItem` (min 1, no max — 1 to many)

Preview: heading title + "{n} cards" subtitle.

---

## Step 3 — Register schemas

**File:** `apps/studio/schemas/index.ts`

- Import `cardBuilderItem` in Objects section
- Import `cardBuilderSection` in Sections section
- Add both to `schemaTypes` array in correct dependency order (object before section)

---

## Step 4 — Add section to page type

**File:** `apps/studio/schemas/documents/page.ts`

- Add `defineArrayMember({type: 'cardBuilderSection'})` to the `sections` array field

---

## Step 5 — GROQ query projection

**File:** `apps/web/src/lib/queries.js`

Add a new conditional projection inside `sections[]{}` for each query that fetches page sections (`pageBySlugQuery` and any article/caseStudy queries that include sections):

```groq
_type == "cardBuilderSection" => {
  heading,
  layout,
  cards[]{
    title,
    titleLink {
      type,
      "internalUrl": internalRef->slug.current,
      "internalType": internalRef->_type,
      externalUrl
    },
    image { asset->, alt, crop, hotspot },
    imageEffect,
    eyebrow,
    subtitle,
    body,
    citation,
    tags[]->{ _id, title, slug }
  }
}
```

---

## Step 6 — Web component: `CardBuilderSection`

**File:** `apps/web/src/components/CardBuilderSection.jsx` (new)
**File:** `apps/web/src/components/CardBuilderSection.module.css` (new)

Renders a section of editor-assembled cards using the DS Card (via web adapter).

**Data mapping per card → Web Card props:**

| cardBuilderItem field | Card prop | Logic |
|---|---|---|
| `title` | `title` | Direct |
| `eyebrow` | `eyebrow` | Direct |
| `subtitle` | — | Rendered via `children` escape hatch (below title, above body) |
| `body` (portable text) | `excerpt` | Render as plain text via `toPlainText()` for the `excerpt` prop, OR render full portable text via `children` escape hatch |
| `image` | `thumbnailUrl` | Resolve via `urlFor(image.asset).width(600).quality(85).url()` |
| `imageEffect` | CSS class | `'greyscale'` → `filter: grayscale(1)`, `'greyscale-overlay'` → `filter: grayscale(1)` + `::after` with `background: color-mix(in srgb, var(--st-color-accent) 15%, transparent)`, `'original'` → no filter |
| `titleLink` | `href` | Internal: `getCanonicalPath({ docType: internalType, slug: internalUrl })`. External: `externalUrl` direct. Drives full-card click via DS Card `href` → `::after` hit-target. |
| `citation` | footer content | Render in card footer zone — placeholder `<small>` until EPIC-0159 `CitationNote` is available |
| `tags[]` | `tags` | Map to `{ label: tag.title, href: getCanonicalPath({ docType: 'tag', slug: tag.slug.current }) }` |

**Layout:** CSS module with two modes:
- `.grid` — `display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--st-spacing-inline-lg);`
- `.list` — `display: flex; flex-direction: column; gap: var(--st-spacing-stack-md);`

**Image effect CSS classes:**
```css
.imageGreyscale { filter: grayscale(1); }
.imageGreyscaleOverlay {
  filter: grayscale(1);
  position: relative;
}
.imageGreyscaleOverlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--st-color-accent) 15%, transparent);
  pointer-events: none;
}
```

**Theme inheritance:** No explicit theme prop — inherits from page `[data-theme]` as per DS Card contract.

---

## Step 7 — Wire into PageSections renderer

**File:** `apps/web/src/components/PageSections.jsx`

Add case to switch:
```jsx
case 'cardBuilderSection':
  return <CardBuilderSection key={key} section={section} />
```

Import `CardBuilderSection` at top of file.

---

## Step 8 — Deprecate old components

**Files to mark deprecated (not delete):**
- `apps/web/src/components/EditorialCard.jsx` — add `@deprecated` JSDoc
- `apps/web/src/components/EditorialCard.module.css` — add comment
- `apps/web/src/components/CardGrid.jsx` — add `@deprecated` JSDoc
- `apps/web/src/components/CardGrid.module.css` — add comment
- `apps/studio/schemas/objects/editorialCard.ts` — add `deprecated: true` comment + hide from Studio new-doc UI if possible

---

## Files Modified (summary)

| File | Action |
|---|---|
| `apps/studio/schemas/objects/cardBuilderItem.ts` | **New** |
| `apps/studio/schemas/sections/cardBuilderSection.ts` | **New** |
| `apps/studio/schemas/index.ts` | Register 2 new types |
| `apps/studio/schemas/documents/page.ts` | Add `cardBuilderSection` to sections array |
| `apps/web/src/lib/queries.js` | Add GROQ projection for cardBuilderSection |
| `apps/web/src/components/CardBuilderSection.jsx` | **New** |
| `apps/web/src/components/CardBuilderSection.module.css` | **New** |
| `apps/web/src/components/PageSections.jsx` | Add case + import |
| `apps/web/src/components/EditorialCard.jsx` | Deprecation notice |
| `apps/web/src/components/CardGrid.jsx` | Deprecation notice |
| `apps/studio/schemas/objects/editorialCard.ts` | Deprecation notice |

---

## Verification

1. **Studio:** Open any page document → Content tab → Add section → "Card Builder Section" should appear in the section picker. Add one with 2+ cards, set different image effects, add tags, fill citation.
2. **Web app:** Navigate to that page → cards render in grid by default, switch to list in Studio and verify layout change.
3. **Image effects:** Verify greyscale, greyscale + pink overlay, and original all render correctly.
4. **Links:** Internal links resolve via `getCanonicalPath()`. External links navigate correctly.
5. **Tags:** Chip links navigate to `/tags/:slug`.
6. **Citation:** Renders as placeholder `<small>` in footer — to be upgraded when EPIC-0159 lands.
7. **Theme:** Cards inherit light/dark theme from page `[data-theme]`.
8. **Responsive:** Grid collapses from multi-column to single column on mobile.

---

## Commit scope

Per CLAUDE.md: schema changes get their own commit first.

1. `feat(studio): add cardBuilderItem object + cardBuilderSection section type` — schema files + index.ts + page.ts section array
2. `feat(epic-0160): Card Builder section — web rendering + GROQ + deprecate EditorialCard` — web components, queries, PageSections wiring, deprecation notices
