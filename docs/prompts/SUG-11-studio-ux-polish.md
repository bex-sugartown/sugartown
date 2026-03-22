# EPIC — Studio UX Polish (Section Previews + Archive Rich Text)

**Epic ID:** (unassigned — backlog)
**Surface:** `apps/studio`
**Priority:** 🟣 Soon
**Created:** 2026-03-15
**Depends on:** Nothing — pure Studio changes, no web impact

---

## Objective

Two quality-of-life improvements for Studio editors:

1. **Section type labels in page builder UI** — When editors view the `sections[]` array in the page builder, each item should display its section TYPE (e.g. "Text Section", "Hero Section") alongside the content preview. Currently items show content-derived titles (heading text, card count) but give no indication of which section type the block is, making it hard to scan a long sections list.

2. **Archive description → portable text** — Upgrade the `archivePage.description` field from plain `text` to `summaryPortableText` so editors can add bold, italic, underline, and inline links (including citation references). The current plain text field cannot express inline formatting or hyperlinks, which limits archive page intro copy.

**Data layer:** Schema changes to section preview configs + archivePage description field type.
**Query layer:** GROQ projection for `description` must change from string to portable text block array.
**Render layer:** Archive description renderer must switch from `<p>{description}</p>` to `<PortableText>` component.

---

## Context

### Section previews (current state)

All 7 section types in `apps/studio/schemas/sections/` define `preview.select` and `preview.prepare`, but none consistently show the section type:

| Section | Title preview | Subtitle preview | Type visible? |
|---------|--------------|------------------|---------------|
| `textSection` | Heading text or "Text Section" | First 100 chars of content | Only as fallback |
| `heroSection` | Heading text or "Hero Section" | Subheading or "No subheading" | Only as fallback |
| `ctaSection` | CTA heading | Description or button count | No |
| `cardBuilderSection` | Heading or "Card Builder Section" | Card count | Only as fallback |
| `calloutSection` | Title or "Callout" | Variant + body preview | No |
| `imageGallery` | "Image Gallery (n images)" | Layout type | Yes (in title) |
| `htmlSection` | Label or "HTML Section" | First 80 chars stripped | Only as fallback |

**Problem:** When a heading IS populated, the type indicator disappears — all sections look the same in the list (just showing their heading text). The screenshot confirms this: "The Seafoam That Should Have Been Lime" gives no clue whether it's a text section, card builder, or callout.

### Archive description (current state)

**File:** `apps/studio/schemas/documents/archivePage.ts` (lines 165–175)

```typescript
defineField({
  name: 'description',
  title: 'Archive Description',
  type: 'text',
  description: 'Intro text shown at top of archive page',
  group: 'content',
  rows: 3,
  validation: (Rule) => Rule.max(500).warning('Keep descriptions concise')
})
```

Type is `text` (plain string). No formatting, no links, no citations.

### Available portable text configs

Defined in `apps/studio/schemas/objects/portableTextConfig.ts`:

| Config | Styles | Marks | Lists | Images |
|--------|--------|-------|-------|--------|
| `summaryPortableText` | Normal only | bold, italic, underline, links | None | No |
| `standardPortableText` | Normal, H2-H4, blockquote | bold, italic, underline, code, links, citations | bullet, numbered | Yes |
| `minimalPortableText` | Normal only | None | None | No |

`summaryPortableText` is the right fit for archive descriptions — supports inline formatting and links without block-level elements that don't belong in a short intro paragraph.

---

## Scope

### Phase 1: Section type labels in preview

- [ ] Update `preview.prepare` in all 7 section schemas to prepend or append the section type as a consistent subtitle prefix
- [ ] Pattern: `subtitle: "Text Section · First 100 chars of content..."` or `subtitle: "Text Section"` when no content preview is available
- [ ] Each section's `prepare` function gains a type label:

| Section schema file | Type label |
|---------------------|-----------|
| `textSection.ts` | `Text` |
| `heroSection.ts` | `Hero` |
| `ctaSection.ts` | `CTA` |
| `cardBuilderSection.ts` | `Card Builder` |
| `calloutSection.ts` | `Callout` |
| `imageGallery.ts` | `Image Gallery` |
| `htmlSection.ts` | `HTML` |

- [ ] Format: title stays as-is (heading text or section-specific fallback). Subtitle becomes: `"[Type Label] · [existing subtitle content]"` or just `"[Type Label]"` if no subtitle content

### Phase 2: Archive description → summaryPortableText

- [ ] Change `archivePage.ts` field type from `text` to `summaryPortableText`
- [ ] Remove `rows: 3` (not applicable to portable text)
- [ ] Remove `Rule.max(500)` validation (character count doesn't apply to block arrays; replace with `Rule.max(3).warning('Keep to 2–3 paragraphs')` on the array length if desired)
- [ ] Update GROQ projections in `queries.js` — every query that fetches `description` from `archivePage` must project the full block array, not a string
- [ ] Update the archive page renderer to use `<PortableText>` instead of rendering `description` as a plain string
- [ ] Verify `summaryPortableText` includes `citationRef` annotation — if not, add it so editors can place inline citations in archive descriptions
- [ ] Data compatibility: existing plain-text `description` values in Sanity will NOT auto-migrate. They'll appear as raw strings, not block arrays. Options:
  - (a) Write a migration script to convert existing `text` values to `summaryPortableText` blocks
  - (b) Accept that editors manually re-enter the ~5 archive page descriptions (low volume, quick)

---

## Doc Type Coverage

| Doc Type | In scope? | Reason |
|----------|-----------|--------|
| `page` | Yes | Has `sections[]` — preview labels apply |
| `article` | Yes | Has `sections[]` — preview labels apply |
| `caseStudy` | Yes | Has `sections[]` — preview labels apply |
| `node` | Yes | Has `sections[]` — preview labels apply |
| `archivePage` | Yes | Description field upgrade + sections if applicable |

---

## Non-Goals

- Does **not** add new section types — only improves previews of existing ones
- Does **not** add section type icons (Sanity's array item icons are a separate concern)
- Does **not** change the web-side section rendering — only Studio editing UX
- Does **not** upgrade `archivePage.description` to `standardPortableText` — headings, images, code blocks, and tables don't belong in a short archive intro
- Does **not** add portable text to other short text fields (e.g. `excerpt`, `seo.metaDescription`) — those are intentionally plain text

---

## Technical Constraints

- **Section preview format:** Sanity's `preview.prepare` returns `{ title, subtitle, media }`. We use `subtitle` for the type label prefix. The `title` stays content-derived (heading text) for scannability.
- **summaryPortableText registration:** The type must already be registered in `schemas/index.ts`. Verify before use.
- **GROQ string → block array:** A plain `text` field returns a string in GROQ. A `summaryPortableText` field returns a block array. Any code that does `{description}` as a string interpolation will break — must switch to `<PortableText value={description} />`.
- **Shared PortableText renderer:** Use the existing `portableTextComponents.jsx` shared serializer (or a minimal variant if summaryPortableText doesn't need code/image serializers).

---

## Files to Modify

**Studio (Phase 1 — section previews):**
- `apps/studio/schemas/sections/textSection.ts` — update `prepare`
- `apps/studio/schemas/sections/heroSection.ts` — update `prepare`
- `apps/studio/schemas/sections/ctaSection.ts` — update `prepare`
- `apps/studio/schemas/sections/cardBuilderSection.ts` — update `prepare`
- `apps/studio/schemas/sections/calloutSection.ts` — update `prepare`
- `apps/studio/schemas/sections/imageGallery.ts` — update `prepare`
- `apps/studio/schemas/sections/htmlSection.ts` — update `prepare`

**Studio (Phase 2 — archive description):**
- `apps/studio/schemas/documents/archivePage.ts` — change `description` field type

**Frontend (Phase 2 — archive description rendering):**
- `apps/web/src/lib/queries.js` — update archive GROQ projections for block array
- Archive page components that render `description` (check all archive pages)

**Scripts (Phase 2, optional):**
- `scripts/migrate/convert-archive-descriptions.js` — CREATE if auto-migration chosen

---

## Acceptance Criteria

- [ ] All 7 section types show their type label in the Studio list preview subtitle, both when the heading is populated AND when it's empty
- [ ] Type label format is consistent across all section types: `"[Type] · [content preview]"` or `"[Type]"` if no content
- [ ] Archive description field in Studio accepts bold, italic, underline, and inline links
- [ ] Archive description renders correctly on the web with inline formatting preserved
- [ ] Existing archive pages render without errors (graceful handling of string → block migration)
- [ ] `tsc --noEmit` in `apps/studio` reports zero new errors

---

## Risks / Edge Cases

- **Subtitle truncation:** Sanity truncates long subtitles. Ensure the type label prefix doesn't push the content preview off-screen for sections with short labels.
- **Data migration:** Existing `description` values are plain strings. After schema change, Sanity won't crash but will show empty editors until content is re-entered or migrated. Low risk given only ~5 archive pages exist.
- **summaryPortableText + citations:** If `citationRef` annotation is not part of `summaryPortableText`, adding it requires updating the portable text config — verify before assuming it's available.

---

*Created 2026-03-15. Two independent Studio UX improvements bundled for convenience — can be split into separate commits (Phase 1: `feat(studio): section type labels`, Phase 2: `feat(studio): archive description portable text`).*
