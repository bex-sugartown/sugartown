# SUG-50 — Card Image from Hero Section

**Linear Issue:** SUG-50

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — ContentCard is the primary consumer. CardBuilderSection excluded (supplies own images). SanityImage/urlFor used for hero asset resolution.
- [ ] **Use case coverage** — all 4 content doc types (node, article, caseStudy, page) need hero-derived thumbnails
- [ ] **Layout contract** — card thumbnail dimensions unchanged (480×270 default, 96×120 listing)
- [ ] **All prop value enumerations** — N/A (no enum fields)
- [ ] **Correct audit file paths** — verified
- [ ] **Dark / theme modifier treatment** — N/A (image source change, not visual change)
- [ ] **Studio schema changes scoped** — NO new schema changes. `cardImage` already hidden (SUG-48). This epic changes GROQ projections only.
- [ ] **Web adapter sync scoped** — N/A (no DS component changes)
- [ ] **Composition overlap audit** — ContentCard's thumbnail fallback chain (`cardImageUrl → imageOverride → heroImageUrl → null`) needs updating to remove `cardImageUrl` and derive from hero section.
- [ ] **Atomic Reuse Gate** — no new components. Extends existing GROQ projection logic.

---

## Context

SUG-48 hid the `cardImage` field on all content doc types (node, article, caseStudy, page). Card thumbnails need a new source. The hero section image (first `heroSection` in the `sections[]` array) is the natural replacement — it already exists on most content, is editable via the section builder, and supports hotspot cropping.

CardBuilderSection cards are excluded — they supply their own images via `card.image`.

## Objective

Auto-derive card thumbnails from the first hero section image in the `sections[]` array. Update GROQ archive queries to project `heroImageUrl` from `sections[0]` hero asset. Update ContentCard's fallback chain to use the new source. No schema changes — this is a query + rendering change only.

---

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `node` | ☑ Yes | Has sections[] with heroSection |
| `article` | ☑ Yes | Has sections[] with heroSection |
| `caseStudy` | ☑ Yes | Has sections[] with heroSection |
| `page` | ☑ Yes | Has sections[] with heroSection |
| `archivePage` | ☐ No | Archive pages don't appear as cards |

---

## Scope

- [ ] GROQ archive query updates — project `heroImageUrl` from first heroSection in sections[]
- [ ] ContentCard fallback chain update — remove `cardImageUrl`, use `heroImageUrl` as primary
- [ ] Verify null handling — cards without hero sections render without thumbnail (existing behaviour)

---

## Query Layer Checklist

- [ ] `allNodesQuery` — replace `cardImageUrl` projection with hero section image derivation
- [ ] `allArticlesQuery` — same
- [ ] `allCaseStudiesQuery` — same
- [ ] `pageBySlugQuery` — N/A (pages don't appear in archive card grids)
- [ ] Slug queries — N/A (detail pages, not card rendering)

GROQ projection pattern:
```groq
"heroImageUrl": sections[_type == "heroSection"][0].backgroundImage.asset->url,
"heroImageAlt": sections[_type == "heroSection"][0].backgroundImage.alt,
```

---

## Non-Goals

- No schema changes (cardImage already hidden by SUG-48)
- No changes to CardBuilderSection (supplies own images)
- No changes to detail page hero rendering
- No migration script needed (hero images already exist in sections[])

---

## Technical Constraints

**GROQ:** The projection uses array filtering (`sections[_type == "heroSection"][0]`) to find the first hero section. If no hero section exists, the projection returns null — ContentCard's existing null guard handles this.

**Hotspot:** Hero section images support hotspot via `backgroundImage.hotspot`. The card thumbnail may need to pass hotspot data for `object-position` CSS. Verify whether ContentCard currently handles hotspot — if not, note as a follow-up.

---

## Files to Modify

- `apps/web/src/lib/queries.js` — update archive query projections
- `apps/web/src/components/ContentCard.jsx` — update fallback chain

---

## Acceptance Criteria

- [ ] Archive pages show hero-derived thumbnails on cards (where hero section exists)
- [ ] Cards without hero sections render without thumbnail (no broken image)
- [ ] CardBuilderSection cards unchanged (still use their own images)
- [ ] No visual regression on existing cards that had `cardImage` populated (hero image replaces it)

---

*Created 2026-04-08. Depends on SUG-48 (cardImage hidden).*
