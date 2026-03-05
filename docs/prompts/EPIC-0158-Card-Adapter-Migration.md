# Sugartown — Claude Code Epic Prompt

**Epic ID:** EPIC-0158
## EPIC NAME: Web Card Adapter Migration

**Priority:** P2 — Converges DS Card and web Card into a single implementation.
**Depends on:** EPIC-0157 (Chip Primitive) — must land first.
**Origin:** EPIC-0156 audit items S1, S5, S7, S8 + web adapter migration scope.

---

## Context

### What already exists

**DS Card (packages/design-system/src/components/Card/):**
- Named-prop API: `status`, `evolution`, `tags[]`, `tools[]`, `metadata[]`, `excerpt`, `date`, `thumbnailUrl`, `accentColor`, `href`, `category`, `categoryPosition`, `density`, `project`, `nextStep`, `aiTool`, `kpiLink`
- Three variants: `default` | `listing` | `metadata`
- Orthogonal density modifier: `density='compact'`
- Full-card link via `::after` hit-target on title link (root stays `<article>`)
- accentColor → left border strip + header wash + eyebrow tint + chip cascade (S6)
- Status/evolution badge palette using Sugartown brand colors
- Thumbnail: hero zone (default) or left rail (listing)
- "AI: [tool]" labelled footer element (S4)
- `categoryPosition: 'before' | 'after'` semantic naming (S2)

**Web Card adapter (apps/web/src/design-system/components/card/):**
- Old slot-based API: `eyebrow` (ReactNode), `title`, `titleHref`, `subtitle`, `children`, `footer` (ReactNode), `variant`, `href`, `as` (polymorphic root)
- `variant='compact'` consumes variant slot (can't be both listing and compact)
- `variant='dark'` hardcodes dark theme overrides (redundant with token system)
- Root wraps in `<a>` or `as={Link}` when linked (invalid nested anchors)
- No structured footer, no badge support, no chip support, no category, no accentColor, no thumbnail zone, no density modifier

**ContentCard (apps/web/src/components/ContentCard.jsx):**
- Maps Sanity docs to old web Card API
- Composes status badge in eyebrow slot with own `STATUS_DISPLAY` map + `data-status` CSS colors (generic Tailwind palette: #059669, #d97706, #2563eb, #7c3aed, #0891B2)
- Image in `children` slot (inside content flow, not at top)
- Footer composed as ReactNode: TaxonomyChips + meta line string
- Always uses `as={Link}` (polymorphic root wrapping)
- `imageOverride` prop for archive-level image fallback

**Other callers of web Card:**
- `EditorialCard.jsx` — used on homepage/editorial surfaces
- `MetadataCard.jsx` — detail page sidebar metadata surface
- `CaseStudyPage.jsx`, `NodePage.jsx`, `ArticlePage.jsx` — detail pages that render MetadataCard
- `TaxonomyDetailPage.jsx`, `ArchivePage.jsx` — archive grids that render ContentCard
- `PersonProfilePage.jsx`, `ProjectDetailPage.jsx` — entity pages

### What shipped in preceding epics

- **EPIC-0156** — DS Card foundation: named-prop API, three variants, density, accentColor, badges, category, thumbnail zones, ::after link pattern. Q1/Q2/Q3 CSS fixes on web Card. S2/S4/S6 DS-only improvements.
- **EPIC-0157** — Unified Chip primitive in DS. TaxonomyChips renders DS Chip. (Must land before this epic.)
- **S9** — `status` field removed from `article.ts` and `caseStudy.ts` schemas (editorial lifecycle redundant with Sanity document state). Node `evolution` and Project `status` fields kept.

### Files in scope for this epic

**Web Card adapter (replace old API with DS Card passthrough):**
- `apps/web/src/design-system/components/card/Card.jsx` — REWRITE
- `apps/web/src/design-system/components/card/Card.module.css` — REWRITE (sync with DS)

**ContentCard (switch from slot-based to named-prop API):**
- `apps/web/src/components/ContentCard.jsx` — REWRITE
- `apps/web/src/components/ContentCard.module.css` — REWRITE (retire status badge CSS)

**Page callers (update Card/ContentCard usage):**
- `apps/web/src/pages/ArticlePage.jsx` — UPDATE
- `apps/web/src/pages/CaseStudyPage.jsx` — UPDATE
- `apps/web/src/pages/NodePage.jsx` — UPDATE
- `apps/web/src/pages/ArchivePage.jsx` — UPDATE (verify ContentCard props)
- `apps/web/src/pages/TaxonomyDetailPage.jsx` — UPDATE (verify ContentCard props)
- `apps/web/src/pages/PersonProfilePage.jsx` — UPDATE
- `apps/web/src/pages/ProjectDetailPage.jsx` — UPDATE

**MetadataCard (switch to DS Card metadata variant):**
- `apps/web/src/components/MetadataCard.jsx` — UPDATE
- `apps/web/src/components/EditorialCard.jsx` — UPDATE

**GROQ (add projections for new props):**
- `apps/web/src/lib/queries.js` — UPDATE (thumbnailUrl resolution, project colorHex for accentColor)

---

## Objective

After this epic: (1) the web Card adapter is a thin passthrough to the DS Card named-prop API — the old slot-based API (`children`, `footer` as ReactNode, `titleHref`, `as` polymorphic root) is retired; (2) ContentCard maps Sanity docs to DS Card named props (`status`/`evolution`, `thumbnailUrl`, `tags[]`, `tools[]`, `date`, `excerpt`, `accentColor`, `href`) instead of composing slots; (3) all page callers use the updated ContentCard/MetadataCard API; (4) status badges use the DS Card brand color palette instead of ContentCard's own Tailwind-ish colors; (5) full-card links use `::after` hit-target instead of polymorphic `<a>` wrapping; (6) density is orthogonal to variant; (7) thumbnails render at top of card (hero zone) instead of in content flow.

**Data layer:** No schema changes (S9 already shipped).
**Query layer:** Minor GROQ projection updates for `thumbnailUrl` resolution and `projects[0].colorHex` for `accentColor`.
**Render layer:** Web Card adapter rewrite, ContentCard rewrite, MetadataCard update, EditorialCard update, all page caller updates.

---

## Doc Type Coverage Audit

| Doc Type      | In scope? | Reason if excluded |
|---------------|-----------|-------------------|
| `page`        | ☐ No | Pages do not render in archive cards. RootPage uses sections, not Card. |
| `article`     | ☒ Yes | Archive cards, detail page MetadataCard, ArticlePage |
| `caseStudy`   | ☒ Yes | Archive cards, detail page MetadataCard, CaseStudyPage |
| `node`        | ☒ Yes | Archive cards, detail page MetadataCard, NodePage |
| `archivePage` | ☐ No | Archive pages consume cards but are not rendered as cards |

---

## Scope

### Web Card adapter rewrite
- [ ] Rewrite `Card.jsx` as thin passthrough to DS Card named-prop API
- [ ] Sync `Card.module.css` with DS Card.module.css
- [ ] Remove old slot-based props: `children`, `footer` (ReactNode), `titleHref`, `as`
- [ ] Remove `variant='compact'` and `variant='dark'` — use `density='compact'` and token system
- [ ] Full-card link via `href` prop (::after pattern) — remove polymorphic `as` root

### ContentCard migration (S1, S5, S7)
- [ ] Replace slot-based Card usage with named-prop Card usage
- [ ] S1: Drop `STATUS_DISPLAY` map and `data-status` CSS. Pass `status` or `evolution` string prop to Card (DS owns badge colors)
- [ ] S1: Map node items → `evolution` prop; project items → `status` prop; article/caseStudy → no badge (status field removed in S9)
- [ ] S5: Map `heroImage.asset.url` → `thumbnailUrl` prop. Preserve `imageOverride` → `thumbnailUrl` fallback
- [ ] S7: Drop `as={Link}`. Use `href={path}` for full-card ::after hit-target
- [ ] Pass `tags[]`, `tools[]` as named prop arrays (Chip rendering delegated to Card via EPIC-0157)
- [ ] Pass `date`, `excerpt`, `aiTool`, `category` as named props
- [ ] Pass `accentColor` from `projects[0].colorHex` when available
- [ ] Retire `ContentCard.module.css` status badge styles

### MetadataCard migration
- [ ] Switch MetadataCard to use `variant='metadata'` on new Card API
- [ ] Pass metadata fields as `metadata[]` array of `{ label, value }` rows
- [ ] Pass `status`/`evolution` as named badge prop
- [ ] Pass `tags[]`, `tools[]` as named prop arrays

### EditorialCard migration
- [ ] Update EditorialCard to use new Card API

### Density model (S8)
- [ ] All callers that used `variant='compact'` switch to `density='compact'` + appropriate `variant`
- [ ] Verify `variant='listing' density='compact'` combination works for dense archive grids

### GROQ updates
- [ ] Add `"heroImageUrl": sections[0].media[0].asset->url` (or equivalent) projection to archive queries for thumbnailUrl
- [ ] Add `"accentColor": projects[0]->colorHex` projection to archive queries
- [ ] Verify `evolution` / `status` fields are already projected in archive queries for node / project

### Page caller updates
- [ ] ArticlePage.jsx — update MetadataCard usage
- [ ] CaseStudyPage.jsx — update MetadataCard usage
- [ ] NodePage.jsx — update MetadataCard usage
- [ ] ArchivePage.jsx — verify ContentCard props (should work with updated ContentCard)
- [ ] TaxonomyDetailPage.jsx — verify ContentCard props
- [ ] PersonProfilePage.jsx — verify Card usage
- [ ] ProjectDetailPage.jsx — verify Card usage

---

## Query Layer Checklist

- [ ] `allArticlesQuery` — add `thumbnailUrl` projection, `accentColor` projection
- [ ] `allCaseStudiesQuery` — add `thumbnailUrl` projection, `accentColor` projection
- [ ] `allNodesQuery` — add `thumbnailUrl` projection, `accentColor` projection; verify `status` (evolution) is projected
- [ ] `articleBySlugQuery` — verify all MetadataCard fields projected (existing — likely no change)
- [ ] `caseStudyBySlugQuery` — verify all MetadataCard fields projected
- [ ] `nodeBySlugQuery` — verify all MetadataCard fields projected
- [ ] Archive queries for taxonomy detail pages — verify same projections

---

## Schema Enum Audit

Status field was removed from article and caseStudy in S9. Remaining enum fields rendered:

| Field name | Schema file | `value` → Display title |
|-----------|-------------|-----------------------------------------------------|
| `status` (node, titled "Evolution") | `node.ts` | `exploring` → Exploring, `validated` → Validated, `operationalized` → Operationalized, `deprecated` → Deprecated, `evergreen` → Evergreen |
| `status` (project) | `project.ts` | `dreaming` → Dreaming, `designing` → Designing, `developing` → Developing, `testing` → Testing, `deploying` → Deploying, `iterating` → Iterating |

**Note:** DS Card renders badge values as raw lowercase strings (the badge itself). No display-label map needed — the badge text IS the value. Badge colors are handled by CSS classes in DS Card.module.css.

---

## Metadata Field Inventory

| Field | Sanity field name | Doc types that have it | Current render location | Post-epic render location |
|-------|------------------|----------------------|------------------------|--------------------------|
| Status/Evolution | `status` | node, project | ContentCard eyebrow slot (own CSS colors) | Card `evolution` / `status` prop (DS badge colors) |
| AI Tool | `aiTool` | node | ContentCard meta line string | Card `aiTool` prop ("AI: [tool]" label) |
| Date | `publishedAt` | article, caseStudy, node | ContentCard meta line string | Card `date` prop (formatted in footer) |
| Excerpt | `excerpt` | article, caseStudy, node | ContentCard `children` slot | Card `excerpt` prop |
| Thumbnail | `heroImage` | article, caseStudy, node | ContentCard `children` slot (img in flow) | Card `thumbnailUrl` prop (hero zone at top) |
| Categories | `categories[]` | article, caseStudy, node | TaxonomyChips in footer slot | Card `tags[]` prop via Chip (EPIC-0157) or TaxonomyChips in footer |
| Tags | `tags[]` | article, caseStudy, node | TaxonomyChips in footer slot | Same |
| Projects | `projects[]` | article, caseStudy, node | TaxonomyChips in footer slot | Same + `accentColor` from `projects[0].colorHex` |
| Client | `client` | caseStudy | ContentCard meta line | MetadataCard `metadata[]` row |
| Role | `role` | caseStudy | ContentCard meta line | MetadataCard `metadata[]` row |

---

## Themed Colour Variant Audit

No new tokens introduced. All surfaces inherit from existing DS Card tokens (established in EPIC-0156).

Status badge colors (DS Card.module.css) already defined for both themes — they use `color-mix()` with existing brand token colors. No per-theme overrides needed.

| Surface / component | Dark | Light | Token(s) |
|---------------------|------|-------|----------|
| Card bg | `var(--st-card-bg)` | `var(--st-card-bg)` | Already set in tokens.css |
| Card border | `var(--st-card-border)` | `var(--st-card-border)` | Already set |
| Title text | `var(--st-color-text-primary)` | `var(--st-color-text-primary)` | Already set |
| Badge colors | `color-mix()` with brand tokens | Same formulas | Handled in DS Card.module.css |
| Chip colors | Inherits from EPIC-0157 Chip | Same | `--chip-color` var |

---

## Non-Goals

- **No new DS Card props** — this epic maps existing web patterns to existing DS Card props. If a web pattern has no DS Card prop equivalent, it is dropped (not added).
- **No schema changes** — S9 (status removal from article/caseStudy) already shipped. Node evolution and project status are unchanged.
- **No new section types or page layouts** — this is a render-layer convergence, not a feature epic.
- **No DS Card.tsx or DS Card.module.css changes** — the DS Card is the target, not the subject of change. If a gap is discovered during migration, it gets backlogged, not fixed inline.
- **No Chip component changes** — EPIC-0157 handles the Chip primitive. This epic consumes it.
- **No hotspot/crop for thumbnails** — thumbnailUrl is a resolved URL string. Sanity image pipeline (hotspot, crop, focal point) is a follow-on enhancement.

---

## Technical Constraints

**Monorepo / tooling**
- Web Card adapter at `apps/web/src/design-system/components/card/`
- ContentCard at `apps/web/src/components/ContentCard.jsx`
- MetadataCard at `apps/web/src/components/MetadataCard.jsx`
- The DS Card at `packages/design-system/src/components/Card/` is NOT modified by this epic

**Schema (Studio)**
- No schema changes.

**Query (GROQ)**
- Archive queries need `thumbnailUrl` and `accentColor` projections
- Detail page slug queries likely already project all needed fields — verify before adding
- `heroImage.asset->url` resolves the Sanity image asset to a plain URL string for `thumbnailUrl`
- `projects[0]->colorHex` resolves the first project's color hex for `accentColor`

**Render (Frontend)**
- **Web Card.jsx** becomes a thin passthrough: accepts DS Card named props, renders DS Card (or mirrors its markup). No more slot-based API.
- **ContentCard.jsx** maps Sanity doc shape → DS Card props. No more ReactNode composition for eyebrow/footer.
- **Full-card link** uses `href` prop → `::after` on title link. ContentCard stops using `as={Link}`. The `href` value is a string path from `getCanonicalPath()` — DS Card renders a plain `<a>` with this href. For SPA navigation, the web adapter may need to render a react-router `<Link>` for the title link instead of `<a>`. Evaluate during implementation.
- **TaxonomyChips in footer** — Decision point: chips could move from a footer slot to the Card's named `tags[]`/`tools[]` props. However, TaxonomyChips handles routing (react-router Links) and deduplication. The simplest migration path may be to keep TaxonomyChips in a footer zone while it renders DS Chips internally (via EPIC-0157). Evaluate during implementation.
- **Taxonomy display rule (non-negotiable)**: `projects[]`, `categories[]`, and `tags[]` must render as separately identifiable groups — never merged into a single flat list.

**Design System → Web Adapter Sync**
- `Card.module.css` (web) must sync with `Card.module.css` (DS) after rewrite
- Both files must be updated in the same commit (token drift rule)

---

## Migration Script Constraints

N/A — no data migration.

---

## Files to Modify

**Web Card adapter**
- `apps/web/src/design-system/components/card/Card.jsx` — REWRITE
- `apps/web/src/design-system/components/card/Card.module.css` — REWRITE (sync with DS)

**Content adapters**
- `apps/web/src/components/ContentCard.jsx` — REWRITE
- `apps/web/src/components/ContentCard.module.css` — REWRITE
- `apps/web/src/components/MetadataCard.jsx` — UPDATE
- `apps/web/src/components/EditorialCard.jsx` — UPDATE

**GROQ**
- `apps/web/src/lib/queries.js` — UPDATE (thumbnailUrl + accentColor projections)

**Page callers**
- `apps/web/src/pages/ArticlePage.jsx` — UPDATE
- `apps/web/src/pages/CaseStudyPage.jsx` — UPDATE
- `apps/web/src/pages/NodePage.jsx` — UPDATE
- `apps/web/src/pages/ArchivePage.jsx` — UPDATE
- `apps/web/src/pages/TaxonomyDetailPage.jsx` — UPDATE
- `apps/web/src/pages/PersonProfilePage.jsx` — UPDATE
- `apps/web/src/pages/ProjectDetailPage.jsx` — UPDATE

---

## Deliverables

1. **Web Card adapter** — `Card.jsx` accepts DS Card named-prop API; old slot-based props removed
2. **Web Card CSS** — `Card.module.css` synced with DS Card.module.css
3. **ContentCard** — maps Sanity docs to named props; no ReactNode composition; status/evolution as badge props; thumbnailUrl at top; ::after link pattern
4. **MetadataCard** — uses `variant='metadata'` with `metadata[]` array
5. **EditorialCard** — updated to new API
6. **GROQ projections** — archive queries include `thumbnailUrl` and `accentColor`
7. **All page callers** — updated and rendering correctly
8. **Visual parity** — archive grids and detail pages render identically to pre-epic (except intentional improvements: correct badge colors, thumbnail at top, proper link pattern)

---

## Acceptance Criteria

- [ ] Web Card.jsx no longer accepts `children`, `footer` (ReactNode), `titleHref`, or `as` props
- [ ] Web Card.module.css does not contain `.dark` variant, `variant='compact'` modifier, or hardcoded color values
- [ ] ContentCard renders status/evolution badges with DS Card brand colors (seafoam, lime, pink, violet, amber) — not old Tailwind palette (#059669, #d97706, etc.)
- [ ] ContentCard no longer uses `as={Link}` — full-card clickability works via ::after hit-target
- [ ] Chips inside cards link correctly to taxonomy detail pages (no broken routing)
- [ ] Thumbnail images render at the top of cards (hero zone), not in content flow
- [ ] Archive grids (`/articles`, `/case-studies`, `/knowledge-graph`) render without errors
- [ ] Detail pages (`/articles/:slug`, `/case-studies/:slug`, `/nodes/:slug`) render MetadataCard without errors
- [ ] Taxonomy detail pages (`/tags/:slug`, `/categories/:slug`, `/projects/:slug`, `/people/:slug`) render ContentCard without errors
- [ ] No nested `<a>` tags in card markup (validate via browser dev tools)
- [ ] `density='compact'` works with `variant='listing'` — produces visibly tighter cards
- [ ] accentColor on archive cards tints the left border + header + eyebrow + chips when project has `colorHex`
- [ ] Article and case study cards do NOT show a status badge (status field removed in S9)
- [ ] Node cards show evolution badge; project cards show status badge
- [ ] **Taxonomy display**: projects, categories, and tags render as separately identifiable groups in card footer — not merged
- [ ] Route smoke-test: navigate to at least one archive page and one detail page for each content type (article, caseStudy, node) — renders correctly with real Sanity data

---

## Risks / Edge Cases

**Render risks**
- [ ] **SPA navigation**: DS Card renders `<a href>` for the title link. In the web app, this causes a full page reload instead of SPA navigation. The web adapter may need to render `<Link to>` instead. Evaluate: does the web Card adapter intercept `href` and render a react-router `<Link>`? Or does ContentCard pass a different prop? Design decision needed during implementation.
- [ ] **TaxonomyChips integration**: TaxonomyChips handles routing + deduplication + ordering. Moving chips from a footer slot to Card's `tags[]`/`tools[]` named props may lose the routing capability (DS Card renders plain `<a>`, not `<Link>`). Safest path: keep TaxonomyChips as the chip renderer, place it in a footer zone of the new Card API.
- [ ] **MetadataCard complexity**: MetadataCard renders different fields per doc type. Verify all doc-type-specific fields are covered in the `metadata[]` array mapping.
- [ ] **EditorialCard divergence**: EditorialCard may have a different shape than ContentCard. Audit before assuming same migration path.
- [ ] **Missing thumbnailUrl**: Not all content has a heroImage. Card must render cleanly with `thumbnailUrl` absent (no broken layout, no empty hero zone). DS Card already handles this — verify.
- [ ] **accentColor with no project**: Content items with no `projects[]` have no `accentColor`. Card renders default appearance. Verify no `undefined` or `null` leaks into `style="--accent: undefined"`.

**Query risks**
- [ ] **heroImage resolution**: Different content types may store hero images differently. Articles use `sections[0].media[0]`, case studies may use `heroSection`, nodes may vary. Audit GROQ projections for each type before writing a unified `thumbnailUrl` projection.
- [ ] **accentColor from projects[0]**: If a content item has multiple projects, only the first project's color is used. This is acceptable but should be documented.

**Sync risks**
- [ ] Web Card.module.css must match DS Card.module.css after rewrite. Use the token drift rule: update both in the same commit.
- [ ] If DS Card.module.css has changed since EPIC-0156 (e.g., EPIC-0157 removes chip styles), the web copy must reflect those changes too.
