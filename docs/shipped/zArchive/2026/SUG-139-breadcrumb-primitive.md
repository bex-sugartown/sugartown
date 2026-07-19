---
**Epic:** SUG-139 — Breadcrumb DS primitive
**Linear Issue:** [SUG-139](https://linear.app/sugartown/issue/SUG-139/breadcrumb-ds-primitive-replace-ad-hoc-eyebrow-nav-across-library)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one mini-release at close-out
---

# SUG-139 — Breadcrumb DS primitive

Replace the ad-hoc eyebrow breadcrumb pattern scattered across Library pages with a shared `Breadcrumb` DS primitive, web adapter, and Storybook stories.

## Background

The current breadcrumb nav is not a component — it is an inline pattern copied independently into six page files. Each implementation uses a different mix of `.backLink`, `.eyebrowCurrent`, and `.eyebrow` classes. This produces three bugs:

1. **KG page wraps** (the trigger): `SiteGraphPage.jsx` wraps `<Link className={pageStyles.backLink}>` inside a `<p className={pageStyles.eyebrow}>`. `.backLink` has `display: inline-block` and `margin-bottom: 2rem` — which inside a flex `.eyebrow` container creates vertical offset, pushing `/ Knowledge Graph` to a second line.
2. **ArchivePage and TaxonomyArchivePage** use `.backLink.eyebrowCurrent` on the Library link — `.eyebrowCurrent` colours it pink, so "← Library" is pink even when it's the back-link (not the current page). Correct pattern: back-link is muted, current is pink.
3. **No single source of truth** — spacing, type scale, separator character, and colour treatment differ between implementations.

### Current state by page

| Page | Pattern | Bug |
|------|---------|-----|
| `SiteGraphPage.jsx` | `p.eyebrow > Link.backLink + span.eyebrowCurrent` | `.backLink` margin-bottom causes 2-line wrap |
| `ArchivePage.jsx` | `Link.backLink.eyebrowCurrent` | Pink on back-link (wrong colour role) |
| `TaxonomyArchivePage.jsx` | `Link.backLink.eyebrowCurrent` | Pink on back-link (wrong colour role) |
| `TaxonomyDetailPage.jsx` | `Link.backLink` + `Link.backLink.eyebrowCurrent` | Correct colour roles, no shared primitive |
| `ProjectDetailPage.jsx` | `Link.backLink` + `Link.backLink.eyebrowCurrent` | Correct colour roles, no shared primitive |
| `ToolDetailPage.jsx` | `Link.backLink` + `Link.backLink.eyebrowCurrent` | Correct colour roles, no shared primitive |
| `SeriesPage.jsx` | `Link.backLink` alone | Back-link only, fine, but should use primitive |
| `PersonProfilePage.jsx` | `Link.backLink` alone | Back-link only (non-Library context) |

## Objective

After this epic, a `Breadcrumb` DS primitive exists in `packages/design-system/src/components/Breadcrumb/` with a matching web adapter in `apps/web/src/design-system/components/Breadcrumb/`. All eight breadcrumb surfaces above are migrated to use it. The ad-hoc `.backLink` + `.eyebrowCurrent` inline pattern is gone from all Library-navigation contexts. A Storybook story covers single-level and two-level variants plus edge cases.

No schema changes. No GROQ changes. Pure frontend/DS epic.

## Pre-Execution Completeness Gate

- [x] **Interaction surface audit** — Searched all 5 layers. No existing `Breadcrumb` component in DS (`packages/design-system/src/components/`) or web adapter layer (`apps/web/src/design-system/components/`). The `.backLink`/`.eyebrow`/`.eyebrowCurrent` classes in `pages.module.css` are the current stand-in — they are not a component. Creating a new primitive is correct. No forking.
- [x] **Use case coverage** — Two patterns in scope: (a) single-level: `← Label` — no hierarchy; (b) two-level: `← Parent / Current` — back-link + separator + current label. `items[]` array API covers both: 1 item = single back-link; 2+ items = trail with last item as current. External hrefs not needed (all navigation is internal SPA).
- [x] **Layout contract** — `Breadcrumb` is a single-line flex strip: `display: flex; align-items: center; gap: var(--st-breadcrumb-gap, 6px)`. Must not wrap. Back-link items use `display: inline` (not `inline-block`). No `margin-bottom` on individual items — caller owns vertical spacing. Max-width: unrestricted (inherits from parent container).
- [x] **All prop enumerations** — No enum fields (navigation only). `items[]` is `{ label: string, href?: string }[]`. Last item without `href` renders as the current crumb (pink, non-linked).
- [x] **Correct audit file paths** — All 8 page files verified to exist at paths listed in Files to Modify below.
- [x] **Dark / theme modifier treatment** — Back-link colour: `var(--st-breadcrumb-link-color, var(--st-color-text-muted))`. Current crumb colour: `var(--st-breadcrumb-current-color, var(--st-color-brand-primary))`. Separator: `var(--st-breadcrumb-sep-color, var(--st-color-text-muted))` at 40% opacity. All three resolve through tokens — both light and dark inherit correctly from the token cascade. No explicit `[data-theme]` overrides needed.
- [x] **Studio schema changes scoped** — None. Explicitly out of scope. No schema touched.
- [x] **Web adapter sync scoped** — DS primitive + web adapter both in scope in same commit.
- [x] **Composition overlap audit** — No sub-object composition. N/A.
- [x] **Atomic Reuse Gate** — (1) No equivalent exists across all 5 layers. (2) Consumed by 8 callers. (3) API is composable via `items[]` array — not fixed slots.
- [x] **Component registry update** — `docs/conventions/component-registry.md` updated in the same commit as the component ships.

## Context

Files already touched by recent breadcrumb work:
- `apps/web/src/pages/SiteGraphPage.jsx` — SUG-134 just added the broken breadcrumb (commit `def9fbc`)
- `apps/web/src/pages/pages.module.css` — owns `.backLink`, `.eyebrow`, `.eyebrowLink`, `.eyebrowSep`, `.eyebrowCurrent`

Recent epics that touched the same surface: SUG-138 (Library unified archive — introduced the breadcrumb pattern on taxonomy pages).

## Scope

### Phase 0 — no mock required
This epic has no new visual format to design. The correct visual is already shown on `TaxonomyDetailPage` (e.g. `/tools/vercel` — `← Library / Tools & Platforms`). The primitive formalises what already exists correctly on that page. No HTML mock needed.

### Phase 1 — DS primitive + web adapter

- [ ] **Create DS primitive** — `packages/design-system/src/components/Breadcrumb/Breadcrumb.tsx` + `Breadcrumb.module.css`. Props: `items: { label: string; href?: string }[]`. Last item without `href` = current crumb. Arrow prefix (`←`) rendered before first item automatically.
- [ ] **Create web adapter** — `apps/web/src/design-system/components/Breadcrumb/Breadcrumb.jsx` + `Breadcrumb.module.css`. Thin JSX mirror of DS component. Uses React Router `<Link>` for internal hrefs (not `<a>`).
- [ ] **Add export** — `apps/web/src/design-system/index.js`
- [ ] **Add tokens** — `--st-breadcrumb-link-color`, `--st-breadcrumb-current-color`, `--st-breadcrumb-sep-color`, `--st-breadcrumb-gap`, `--st-breadcrumb-font-size`, `--st-breadcrumb-font-weight`, `--st-breadcrumb-letter-spacing` to `tokens/source/tokens.json`. Run `pnpm tokens:build`.
- [ ] **Storybook story** — `apps/storybook/src/stories/Breadcrumb.stories.tsx`. Covers: single-level (1 item, linked), two-level (2 items, last is current), three-level (edge case), long labels (overflow check).
- [ ] **Update component registry** — `docs/conventions/component-registry.md`

### Phase 2 — migrate all breadcrumb surfaces

- [ ] `apps/web/src/pages/SiteGraphPage.jsx` — replace `p.eyebrow > Link.backLink` with `<Breadcrumb items={[{label:'Library',href:'/library'},{label:'Knowledge Graph'}]} />`
- [ ] `apps/web/src/pages/ArchivePage.jsx` — replace `Link.backLink.eyebrowCurrent` with `<Breadcrumb items={[{label:'Library',href:'/library'}]} />` (single item — Library is back-link, no current crumb needed since h1 is already the page title)
- [ ] `apps/web/src/pages/TaxonomyArchivePage.jsx` — replace `Link.backLink.eyebrowCurrent` with `<Breadcrumb items={[{label:'Library',href:'/library'},{label:pluralLabel}]} />`
- [ ] `apps/web/src/pages/TaxonomyDetailPage.jsx` — replace inline pattern with `<Breadcrumb items={[{label:'Library',href:'/library'},{label:config.pluralLabel,href:backPath},{label:name}]} />` (3-level: Library → taxonomy archive → detail)
- [ ] `apps/web/src/pages/ProjectDetailPage.jsx` — replace with `<Breadcrumb items={[{label:'Library',href:'/library'},{label:'Projects',href:'/projects'},{label:name}]} />`
- [ ] `apps/web/src/pages/ToolDetailPage.jsx` — replace with `<Breadcrumb items={[{label:'Library',href:'/library'},{label:'Tools & Platforms',href:'/tools'},{label:name}]} />`
- [ ] `apps/web/src/pages/SeriesPage.jsx` — replace `Link.backLink` with `<Breadcrumb items={[{label:'Library',href:'/library'},{label:'Series'}]} />`
- [ ] `apps/web/src/pages/PersonProfilePage.jsx` — replace `Link.backLink` with `<Breadcrumb items={[{label:'People',href:'/people'},{label:name}]} />` (non-Library context — no Library root)
- [ ] **Remove dead CSS** — after migration, remove or comment `.backLink`, `.eyebrow`, `.eyebrowLink`, `.eyebrowSep`, `.eyebrowCurrent` from `pages.module.css` if no other callers remain. Grep first.

## Doc Type Coverage Audit

| Doc Type | In scope? | Reason if excluded |
|----------|-----------|-------------------|
| `page` | ☑ No | RootPage uses `eyebrow` for a different purpose (page-type strip, not breadcrumb nav) — not a Library nav surface |
| `article` | ☑ No | ArticlePage renders a detail page — breadcrumb appears above the hero via the archive page, not on detail pages |
| `caseStudy` | ☑ No | Same as article |
| `node` | ☑ No | Same as article |
| `archivePage` | ☑ Yes | ArchivePage.jsx and TaxonomyArchivePage.jsx both render archive breadcrumbs |

## Schema Field Proposal

None — no schema changes.

## Query Layer Checklist

Not applicable — no new fields, no query changes.

## Schema Enum Audit

Not applicable — no enum fields rendered.

## Themed Colour Variant Audit

| Surface | Dark | Light | Pink Moon | Token |
|---------|------|-------|-----------|-------|
| Back-link text | `var(--st-color-text-muted)` | same | same | `--st-breadcrumb-link-color` |
| Back-link hover | `var(--st-color-text-default)` | same | same | (`:hover` in CSS) |
| Separator | `var(--st-color-text-muted)` at 40% opacity | same | same | `--st-breadcrumb-sep-color` |
| Current crumb | `var(--st-color-brand-primary)` | same | same | `--st-breadcrumb-current-color` |

All four resolve correctly across themes via token inheritance. No explicit `[data-theme]` overrides needed.

## Non-Goals

- No changes to the `eyebrow` prop on `Card` or `Tile` components — that is a different concept (content labelling, not page navigation)
- No changes to `detailEyebrow` on entity folio pages (the `DEVELOPMENT · PLATFORM` strip on ToolDetailPage) — that is content metadata, not navigation
- No `aria-label="breadcrumb"` / `<nav>` semantic wrapping required for this pass (can be added in a follow-on a11y epic if needed)
- No breadcrumbs on article/node/caseStudy detail pages — those pages use the sidebar/back-link pattern, not a breadcrumb trail
- No breadcrumbs on Platform pages — platform nav has its own sidebar

## Technical Constraints

**DS Component**
- TypeScript (`.tsx`) in `packages/design-system/src/components/Breadcrumb/`
- Web adapter is `.jsx` (no TypeScript) in `apps/web/src/design-system/components/Breadcrumb/`
- Web adapter uses `<Link to={item.href}>` from `react-router-dom` for all hrefs — not `<a>`
- DS component uses `<a>` (framework-agnostic)

**CSS**
- No `margin-bottom` on breadcrumb items — caller owns vertical spacing
- `display: flex; align-items: center; flex-wrap: nowrap` — must never wrap
- All colours via `--st-breadcrumb-*` tokens — no raw hex
- Run `pnpm validate:tokens --strict-colors` before commit — zero violations required

**Token pipeline**
- Add to `tokens/source/tokens.json`, run `pnpm tokens:build` — do not edit `tokens.css` directly

**Dead CSS cleanup**
- Grep `pages.module.css` callers before removing `.backLink` etc. — `RootPage.jsx` uses `eyebrow` for the page-type strip, which must not be removed

## Files to Modify

**DS primitive (new)**
- `packages/design-system/src/components/Breadcrumb/Breadcrumb.tsx` — CREATE
- `packages/design-system/src/components/Breadcrumb/Breadcrumb.module.css` — CREATE
- `packages/design-system/src/components/Breadcrumb/index.ts` — CREATE

**Web adapter (new)**
- `apps/web/src/design-system/components/Breadcrumb/Breadcrumb.jsx` — CREATE
- `apps/web/src/design-system/components/Breadcrumb/Breadcrumb.module.css` — CREATE
- `apps/web/src/design-system/index.js` — add export

**Tokens**
- `tokens/source/tokens.json` — add `--st-breadcrumb-*` tokens
- `apps/web/src/design-system/styles/tokens.css` — regenerated by `pnpm tokens:build`
- `packages/design-system/src/styles/tokens.css` — regenerated by `pnpm tokens:build`

**Storybook**
- `apps/storybook/src/stories/Breadcrumb.stories.tsx` — CREATE

**Pages (migration)**
- `apps/web/src/pages/SiteGraphPage.jsx`
- `apps/web/src/pages/ArchivePage.jsx`
- `apps/web/src/pages/TaxonomyArchivePage.jsx`
- `apps/web/src/pages/TaxonomyDetailPage.jsx`
- `apps/web/src/pages/ProjectDetailPage.jsx`
- `apps/web/src/pages/ToolDetailPage.jsx`
- `apps/web/src/pages/SeriesPage.jsx`
- `apps/web/src/pages/PersonProfilePage.jsx`
- `apps/web/src/pages/pages.module.css` — remove dead `.backLink`/`.eyebrow` classes after confirming no remaining callers

**Registry**
- `docs/conventions/component-registry.md` — add Breadcrumb row

## Deliverables

1. `Breadcrumb.tsx` + `Breadcrumb.module.css` in DS package, exported from `packages/design-system/src/index.ts`
2. Web adapter `Breadcrumb.jsx` + CSS in `apps/web/src/design-system/components/Breadcrumb/`, exported from `apps/web/src/design-system/index.js`
3. `--st-breadcrumb-*` tokens in `tokens/source/tokens.json`, regenerated in both `tokens.css` files
4. Storybook story covering 1-level, 2-level, 3-level, and long-label variants
5. All 8 page files migrated — no inline `.backLink` + `.eyebrowCurrent` pattern remains on Library navigation surfaces
6. `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` both pass — zero violations
7. Component registry row added

## Acceptance Criteria

- [ ] `/knowledge-graph` breadcrumb renders on a single line: `← Library / Knowledge Graph` — no wrapping
- [ ] Back-link items render in `--st-color-text-muted`; current crumb renders in `--st-color-brand-primary`
- [ ] Separator (`/`) renders in muted colour, not pink
- [ ] All 8 migrated pages render correct breadcrumbs with correct colour roles
- [ ] `TaxonomyDetailPage` renders 3-level trail: `← Library / [taxonomy type] / [current name]`
- [ ] `PersonProfilePage` renders `← People / [name]` (no Library root — non-Library context)
- [ ] No `.backLink` class usage remains in any Library navigation context (grep confirms)
- [ ] Storybook story builds without console errors
- [ ] Both `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` pass — zero violations
- [ ] Component registry updated with Breadcrumb row (Storybook ✅, dark mode ✅, DS primitive)

## Visual QA Gate

### Evidence the agent must prepare:

1. Screenshot of `/knowledge-graph` showing single-line breadcrumb
2. Screenshot of `/tools/vercel` (or any tool detail) showing 3-level trail
3. Screenshot of `/articles` showing back-link only
4. Storybook at `Components/Breadcrumb` — default, 2-level, 3-level, long-label variants
5. Dark mode Storybook screenshot on `dark-pink-moon` theme
6. Token compliance: `pnpm validate:tokens --strict-colors` output — zero violations

### Human gate:
Agent presents evidence. Human reviews. Human approves with "Visual QA approved."

## Risks / Edge Cases

- **`RootPage.jsx` uses `.eyebrow`** for a completely different purpose (page-type metadata strip, not navigation). Grep before removing the class. If other callers exist, do not remove — rename scope of removal to "breadcrumb-specific classes only".
- **`PersonProfilePage` is not Library-rooted** — breadcrumb starts at `← People`, not `← Library / People`. Component must support arbitrary root items.
- **`TaxonomyDetailPage` person type** currently shows `← All People` (single item, no Library root). After migration it should show `← People / [name]` — confirm this matches the visual intent before executing.
- **Long category names** — "Product & Platform Strategy" at 3-level breadcrumb depth could crowd on mobile. CSS must use `nowrap` so it clips cleanly rather than wrapping.

## Model & Mode

`/model sonnet` — execution is mechanical (new component + 8 page migrations). No architectural ambiguity requiring planning depth.

## Post-Epic Close-Out

1. Visual QA gate — produce evidence table, wait for "Visual QA approved"
2. Chromatic VRT — run after visual QA approval
3. Move `docs/backlog/SUG-139-breadcrumb-primitive.md` → `docs/shipped/`
4. `/mini-release SUG-139 Breadcrumb DS primitive`
5. Linear SUG-139 → Done
