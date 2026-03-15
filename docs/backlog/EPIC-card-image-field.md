# EPIC — Dedicated `cardImage` Schema Field (BL-02)

**Epic ID:** (unassigned — backlog)
**Surface:** `apps/studio` + `apps/web`
**Priority:** 🟣 Soon
**Created:** 2026-03-15
**Origin:** BL-02 from EPIC-0156

---

## Objective

Add a dedicated `cardImage` field to content document schemas so editors can set a specific thumbnail image for card grids, independent of the hero image or section media. Today, card thumbnails are derived from the hero section's first media asset (`hero.media[0]`), which means the card and the hero always show the same image. This is limiting: a wide cinematic hero image may crop poorly at card thumbnail dimensions, or an editor may want a different visual identity in archive listings vs the detail page.

After this epic: (1) editors can set an optional `cardImage` on content documents; (2) the GROQ thumbnail resolution chain becomes `cardImage → hero.media[0] → null` (cardImage takes precedence); (3) ContentCard renders the cardImage when present, falling back to the existing hero-derived thumbnail; (4) no existing behaviour changes for documents without a cardImage.

**Data layer:** New `cardImage` field (type: `image` or `richImage`) on article, caseStudy, and node schemas.
**Query layer:** GROQ projection update — add `cardImage` to archive queries and update `thumbnailUrl` resolution to prefer `cardImage` over hero media.
**Render layer:** ContentCard thumbnail resolution updated to include `cardImage` in the fallback chain. No visual changes — same `<img>` in the card hero zone.

---

## Context

### Current thumbnail resolution

ContentCard.jsx resolves thumbnails via:
```js
const thumbnailUrl = showHeroImage
  ? (imageOverride?.asset?.url ?? item.heroImageUrl ?? item.heroImage?.asset?.url ?? null)
  : null
```

The GROQ queries have TODO comments acknowledging this is incomplete:
```groq
// TODO: card thumbnail — revisit in card revamp epic
```

These TODOs appear in `allArticlesQuery` and `allCaseStudiesQuery`.

### Hero image source

Hero images come from `heroSection.media[]` in the section builder. The first media item is typically used as the page hero and doubles as the card thumbnail. There is no separate card-specific image field.

### `featuredImage` deprecation (BL-07)

`featuredImage` was deprecated in BL-07 (v0.15.0) — the field is hidden in Studio and is not the canonical image source. `cardImage` is a new, intentional field that serves a distinct purpose (card-specific thumbnail) rather than a general "featured" image.

### `richImage` schema object

The codebase has a `richImage` object type that wraps Sanity's `image` type with `alt` and `caption` fields. `cardImage` should use the same type for consistency, or use a plain `image` type with an `alt` text field if `caption` is unnecessary for card context.

---

## Scope (draft — refine at activation)

### Schema changes
- [ ] Add `cardImage` field to:
  - `article.ts`
  - `caseStudy.ts`
  - `node.ts`
- [ ] Field type: `image` with `hotspot: true` (or `richImage` — decide at activation)
  - If `image`: add a nested `alt` string field for accessibility
  - If `richImage`: `alt` and `caption` are built in; `caption` may be unnecessary for cards
- [ ] Place field in a sensible tab group (e.g. "Basics" or a new "Media" group)
- [ ] Field description: "Optional thumbnail for card grids. If empty, the hero image is used."
- [ ] No validation — field is optional

### Doc type coverage

| Doc Type | In scope? | Reason |
|----------|-----------|--------|
| `article` | Yes | Appears in archive cards |
| `caseStudy` | Yes | Appears in archive cards |
| `node` | Yes | Appears in archive cards |
| `page` | No | Pages don't appear in archive card grids |
| `archivePage` | No | Archive pages are containers, not card items |

### GROQ projection updates
- [ ] Archive queries: add `cardImage` projection
  - `allArticlesQuery` — add `"cardImageUrl": cardImage.asset->url, "cardImageAlt": cardImage.alt`
  - `allCaseStudiesQuery` — same
  - `allNodesQuery` — same
  - Taxonomy-scoped archive queries — same
- [ ] Update `thumbnailUrl` resolution comment to document the new fallback chain:
  ```
  cardImageUrl → heroImageUrl → hero.media[0].asset->url → null
  ```
- [ ] Detail slug queries: not needed (detail pages show the hero, not the card image)

### ContentCard update
- [ ] Update thumbnail resolution to prefer `cardImage`:
  ```js
  const thumbnailUrl = showHeroImage
    ? (imageOverride?.asset?.url ?? item.cardImageUrl ?? item.heroImageUrl ?? item.heroImage?.asset?.url ?? null)
    : null
  const thumbnailAlt = item.cardImageAlt ?? item.heroImageAlt ?? ''
  ```
- [ ] Remove the TODO comments in queries.js

---

## Non-Goals

- Does **not** add `cardImage` to taxonomy doc types (tag, category, project, person, tool) — these have their own image/avatar patterns
- Does **not** add image cropping/focal-point UI beyond Sanity's built-in hotspot tool
- Does **not** change the Card component itself — it already accepts `thumbnailUrl` as a prop
- Does **not** migrate existing hero images into `cardImage` — the field starts empty on all documents; editors populate it when they want a card-specific image
- Does **not** deprecate or modify `heroSection` media — hero images continue to be the primary image source; `cardImage` is an optional override

---

## Technical Constraints

- **GROQ image projection depth** — if `cardImage` uses `richImage` type, the asset reference requires `cardImage.asset.asset->url` (nested dereference per CLAUDE.md GROQ convention). If using plain `image`, it's `cardImage.asset->url`. Decide field type before writing projections.
- **Hotspot support** — `cardImage` should enable `hotspot: true` so editors can set a focal point for card-dimension cropping. However, the current `thumbnailUrl` pipeline passes a raw URL string — hotspot-aware rendering (via `@sanity/image-url`) is a follow-on enhancement, not in scope here.
- **Studio schema commit rule** — per CLAUDE.md, schema changes get their own commit scoped `feat(studio):`.

---

## Risks / Edge Cases

- **No visual difference initially** — until editors populate `cardImage` on documents, the behaviour is identical to today. The epic's value is enabling the capability, not immediately changing any visuals.
- **Image weight** — editors could upload very large images for card thumbnails. Consider adding a `validation` hint recommending dimensions (e.g. 800×600 or smaller) — but don't enforce, as Sanity's CDN can resize on the fly.
- **Alt text duplication** — if `cardImage` has its own `alt` field, editors must maintain alt text separately from the hero image's alt. This is intentional (the images may be different) but could cause editorial friction.

---

## Trigger for Activation

Activate this epic when:
- Editors request the ability to set different images for cards vs hero
- Card thumbnails are visually poor because hero images don't crop well at card dimensions
- A broader "card visual polish" sprint is planned

---

*Created 2026-03-15. Origin: BL-02 from EPIC-0156. See also BL-07 (`featuredImage` deprecation, v0.15.0).*
