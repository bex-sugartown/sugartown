# Taxonomy Listview Spec

**Epic:** SUG-123  
**Status:** Living document — updated as convergence pass ships  
**Scope:** Five taxonomy archive pages + five taxonomy detail pages (ten surfaces total)

This document is the registry-format spec for taxonomy page-level layout patterns. It covers page-level concerns (layout, CSS classes, token usage, DS component gaps). It does not replace `component-registry.md`, which covers DS primitives independently.

---

## Archive layer

Single component (`TaxonomyArchivePage.jsx`) serves all five archive URLs via `ARCHIVE_CONFIG`. Two layout patterns: `rows` (single-column, four types) and `buckets` (multi-column letter-grid, tags only).

**Agreed layout spec (Phase 0 approved):**
- Container: `--st-width-detail` (760px) for single-col; `--st-width-detail-wide` (1080px) for multi-col
- Row name: `--st-font-family-ui` at `--st-font-size-md`
- Count badge: monospaced chip (`--st-font-family-mono`, `--st-font-size-2xs`) — not DS `Chip` (too heavy for list context)
- Separator: `border-bottom` on each row, `border-top` on list container
- Lead element slot: absent (tools), 10px dot (categories/projects), 36px avatar (people)
- Multi-col: 3-col for tags (short labels), 2-col for future glossary (longer labels + sublabels)
- Layout switch: driven by `ARCHIVE_CONFIG` type setting, not runtime term count

| Page | URL | Component | Layout | CSS module(s) | Key classes | DS components used | DS components applicable | Hardcoded values | Notes |
|------|-----|-----------|--------|---------------|-------------|-------------------|--------------------------|-----------------|-------|
| Categories | `/categories` | `TaxonomyArchivePage` | `rows` — dot + name + count | `TaxonomyArchivePage.module.css` | `itemList`, `item`, `itemLink`, `itemColorDot`, `itemText`, `itemLabel`, `itemCount` | None | `Chip` (count — evaluate at Phase 2) | None | `lede` subtitle via `ARCHIVE_CONFIG`; dot `backgroundColor` is inline style from `colorHex` |
| Projects | `/projects` | `TaxonomyArchivePage` | `rows` — dot + name + count | `TaxonomyArchivePage.module.css` | Same as categories | None | `Chip` (count) | None | Same row pattern as categories; no lede |
| Tools | `/tools` | `TaxonomyArchivePage` | `rows` — name + count (no lead element) | `TaxonomyArchivePage.module.css` | `itemList`, `item`, `itemLink`, `itemText`, `itemLabel`, `itemCount` | None | `Chip` (count) | None | Simplest row variant |
| People | `/people` | `TaxonomyArchivePage` | `rows` — avatar + name + sublabel (no count) | `TaxonomyArchivePage.module.css` | `itemList`, `item`, `itemLink`, `itemAvatar`, `itemAvatarFallback`, `itemText`, `itemLabel`, `itemSublabel` | None | None | `border-radius: 50%` ×2 (avatar img + fallback div) → **converged: `--st-radius-full`** | `urlFor()` at 40×40; fallback shows initial |
| Tags | `/tags` | `TaxonomyArchivePage` | `buckets` — 3-col letter grid + alpha strip | `TaxonomyArchivePage.module.css` | `alphaStrip`, `alphaBtn`, `alphaBtnActive`, `alphaBtnDisabled`, `taxGrid`, `taxBucket`, `taxLetter`, `taxLetterGlyph`, `taxLetterRule`, `taxBucketList`, `taxRow`, `taxRowInner`, `taxRowName`, `taxRowSub`, `taxRowCount` | None | `Grid` (evaluated — does not fit; see notes), `SectionLabel` (evaluated — does not fit; see notes), `Chip` (count) | None | `taxLetterRule` is `flex: 1` hairline divider; hover shifts `padding-left` |

### Phase 2 DS component evaluation — archive

**`Grid` for `taxGrid` bucket layout:** The current `taxGrid` uses `display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` — a responsive intrinsic grid. The DS `Grid` component accepts a fixed `columns` prop (e.g. `columns={3}`). These are different contracts. Using DS `Grid` here would lose the responsive auto-fill behaviour. Decision: leave `taxGrid` as CSS; document this as intentional.

**`SectionLabel` for letter-bucket headers:** The `taxLetter` pattern renders a letter glyph + a `flex: 1` hairline rule (`taxLetterRule`) — a custom compound element. `SectionLabel` renders a title + optional kicker with no hairline. These do not share anatomy. Decision: leave `taxLetter` pattern as-is; document this as intentional.

**`Chip` for count badges:** Deferred to Phase 2 implementation decision. The DS `Chip` has visual weight suitable for tag chips but may be too heavy for inline list counts. Evaluate in context before replacing.

---

## Detail layer — two-tier architecture

**Approved architecture (Phase 0):**

- **Tier 1 — Collection index** (tags, categories, future glossary): `TaxonomyDetailPage.jsx`. Minimal template — back link + title + optional description/color accent + ContentCard grid. Container: `--st-width-detail`. No folio.
- **Tier 2 — Entity profile** (projects, tools, people): converging toward a shared `EntityDetailPage` shell. Slots: folio zone + identity zone + metadata zone + optional rich content zone + content sections. Container: `--st-width-detail-wide`.

| Page | URL | Component | Layout | CSS module(s) | Key classes | DS components used | Hardcoded values / inline bypasses | SEO | Notes |
|------|-----|-----------|--------|---------------|-------------|-------------------|------------------------------------|-----|-------|
| Categories detail | `/categories/:slug` | `TaxonomyDetailPage` | Back link + color bar + type label + h1 + description + ContentCard grid | `TaxonomyDetailPage.module.css`, `pages.module.css` | `taxonomyColorBar`, `taxonomyTypeLabel`, `taxonomyTitle`, `taxonomyDescription`, `contentSection`, `archiveGrid` | `ContentCard`, `Pagination` | `border-radius: 2px` on `.taxonomyColorBar` → **converged: `--st-radius-xs`**; no `font-family` on `.taxonomyTypeLabel` / `.taxonomyTitle` → **converged: mono / ui tokens** | **None (gap)** → **converged: `<SeoHead>` added** | Shared with tags |
| Tags detail | `/tags/:slug` | `TaxonomyDetailPage` | Same as categories, no color bar | `TaxonomyDetailPage.module.css`, `pages.module.css` | Same | `ContentCard`, `Pagination` | Same convergence | Same | No `colorHex` in tag schema |
| Projects detail | `/projects/:slug` | `ProjectDetailPage` | Accent bar + h1 + description + MetadataCard + 2-col content sections | `ProjectDetailPage.module.css`, `pages.module.css` | `projectPage`, `accentBar`, `projectName`, `projectDescription`, `contentSection` | `Grid`, `SectionLabel`, `ContentCard`, `MetadataCard`, `DraftBadge` | `font-size: clamp(1.75rem, 4vw, 2.5rem)` on `.projectName` (no token equivalent — left as-is); `margin-top: 2rem` on `.contentSection` (no matching spacing token — left as-is) | `<SeoHead>` + JSON-LD | `--project-accent` CSS custom prop set inline — acceptable (dynamic per-doc value) |
| Tools detail | `/tools/:slug` | `ToolDetailPage` | Folio (logo + identity) + URL + 2-col content sections | `pages.module.css` only | `entityFolio`, `entityThumbnail`, `entityThumbnailFallback`, `narrativeHeading`, `entityDescription`, `detailEyebrow`, `backLink`, `archiveEmpty` | `Grid`, `SectionLabel` | 3 inline styles → **converged: moved to CSS classes** | `<SeoHead>` + JSON-LD | Only detail page with no own CSS module |
| People detail | `/people/:slug` | `PersonProfilePage` | Folio (avatar + identity) + social links + bio + roles + expertise chips + 2-col content sections | `PersonProfilePage.module.css`, `pages.module.css` | `profilePage`, `profileFolio`, `folioIdentity`, `profileShortName`, `profileMeta`, `socialLinks`, `socialLink`, `profileBio`, `rolesSection`, `rolesHead`, `rolesList`, `expertiseSection`, `expertiseHead`, `expertiseChips`, `expertiseChip`, `contentSection` | `Grid`, `SectionLabel`, `ContentCard`, `PortableText` | `border-radius: 50%` on `.rolesList li::before` (4px bullet dot — left as-is, cosmetic); hardcoded `/categories/` path prefix → **converged: `getCanonicalPath()`** | `<SeoHead>` + JSON-LD | Hand-rolled LinkedIn SVG (Simple Icons v13 dropped SiLinkedin) |

### Phase 2b DS component evaluation — detail

**`Chip` for `expertiseChip` (PersonProfilePage):** The `.expertiseChip` class renders a mono-font label with pink-50 bg, maroon text, pink hover — visually close to DS `Chip`. Deferred: adopting `Chip` requires confirming it accepts a `tone` or `variant` covering this state. If adoption requires a new DS prop, that is a separate DS change. Left as bespoke class for now; tracked as a future DS extension candidate.

**`Grid` for `archiveGrid` (TaxonomyDetailPage):** The current `archiveGrid` in `pages.module.css` is a flex-wrap grid. DS `Grid` with `columns={2}` would be equivalent. Deferred to `EntityDetailPage` shell work — when TaxonomyDetailPage is refactored as Tier 1, this swap can happen in the same commit.

---

## Gaps remaining after convergence pass

| Gap | Location | Status |
|-----|----------|--------|
| `expertiseChip` → DS `Chip` | `PersonProfilePage.module.css` | Deferred — needs DS Chip `tone` prop extension |
| `margin-top: 2rem` on `.contentSection` | `ProjectDetailPage.module.css`, `PersonProfilePage.module.css` | Left as-is — no matching `--st-*` spacing token at 32px (closest is `--st-space-section-break-detail: 40px`) |
| `font-size: clamp(...)` on `.projectName` | `ProjectDetailPage.module.css` | Left as-is — no token equivalent for a fluid clamp; not caught by validators |
| `EntityDetailPage` shell | `ProjectDetailPage`, `ToolDetailPage`, `PersonProfilePage` | Tier 2 unification deferred to a future epic once `EntityDetailPage` API is designed |
| SEO on `TaxonomyDetailPage` for people/projects routes | `TaxonomyDetailPage.jsx` | Those routes now redirect to dedicated pages; Tier 1 SEO covers tags + categories |

---

## Related files

- `apps/web/src/pages/TaxonomyArchivePage.jsx` + `.module.css`
- `apps/web/src/pages/TaxonomyDetailPage.jsx` + `.module.css`
- `apps/web/src/pages/ProjectDetailPage.jsx` + `.module.css`
- `apps/web/src/pages/ToolDetailPage.jsx`
- `apps/web/src/pages/PersonProfilePage.jsx` + `.module.css`
- `apps/web/src/pages/pages.module.css`
- `docs/conventions/component-registry.md` — DS primitive registry (separate concern)
- `docs/backlog/SUG-123-taxonomy-listview-audit.md` — full epic with Storybook phase
