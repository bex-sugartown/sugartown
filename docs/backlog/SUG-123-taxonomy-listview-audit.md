---
**Epic:** SUG-123 — Taxonomy listview audit — shared layout language, tokens, and Storybook coverage
**Linear Issue:** [SUG-123](https://linear.app/sugartown/issue/SUG-123/taxonomy-listview-audit-shared-layout-language-tokens-and-storybook)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — mock + audit doc + convergence pass + Storybook stories ship together
**Phase 0 gate:** ✋ Convergence pass (Phase 2 / 2b) is blocked until Phase 0 mock is reviewed and "Visual QA approved"
---

# SUG-123 — Taxonomy listview audit — shared layout language, tokens, and Storybook coverage

Audit, unify, and document the five taxonomy archive listview pages (/categories, /tools, /tags, /projects, /people) **and their corresponding detail pages**. The audit surfaces the current inconsistencies (mismatched column widths, font sizes, alignment, token usage); the Phase 0 mock establishes the converged target; the convergence pass implements it. Produces a spec table (registry-format) and Storybook coverage for all ten surfaces.

## Background

All five taxonomy archive pages are served by a single `TaxonomyArchivePage.jsx` with two layout patterns: a flat `rows` list (people, categories, projects, tools) and a flat 3-col alphabetical grid with letter filter (tags). Despite sharing a component, the five row variants have drifted — mismatched column widths, inconsistent font sizes, and no shared token vocabulary for spacing. The CSS module uses `--st-*` tokens throughout but consumes no DS components (`Chip`, `Grid`, `SectionLabel` are all absent from the archive layer).

The detail layer is more fragmented: tags and categories share `TaxonomyDetailPage.jsx` (simple — title + ContentCard grid); projects have `ProjectDetailPage.jsx`; tools have `ToolDetailPage.jsx` (no own CSS module); people have `PersonProfilePage.jsx` (most complex — folio, bio, roles, expertise chips). Four separate files, no shared layout shell, no shared token vocabulary for the folio pattern or content section grid.

All ten surfaces have zero Storybook stories. There is no shared language for the row pattern, the folio header, or the content section grid, which makes Chromatic VRT and cross-epic references (e.g. SUG-35 Glossary) impossible to ground.

### Architectural diagnosis — two semantic tiers

The detail layer has two fundamentally different page types that have been treated as variations of the same thing:

**Tier 1 — Collection index pages** (tags, categories, glossary): these pages exist to say "here are all things associated with me." The detail page IS the content grid. The header is minimal: name + optional description + optional color accent. There is no profile to render — the type's identity is its collection.

**Tier 2 — Entity profile pages** (projects, tools, people): these types have their own identity independent of what's tagged with them. They have a folio (visual element + identity block), optional structured metadata (MetadataCard for projects, URL for tools, social links for people), optional rich content zones (bio for people, roles/expertise for people), and a content section grid. The differences between projects, tools, and people are *slot content* — not layout structure.

Forcing these two tiers into one graceful-degradation component produces an unmanageable boolean-flag explosion in both directions. The correct path is to converge each tier independently:

- **`TaxonomyDetailPage` (enhanced)** — Tier 1. Tags, categories, and eventual glossary terms share this template. Add `<SeoHead>` (currently missing). Keep the pattern minimal by design.
- **`EntityDetailPage` (new unified shell)** — Tier 2. Projects, tools, and people share a layout shell with slot-based composition. The folio zone, metadata zone, and content section zone are named slots. Each page type passes its specific content (accent bar vs logo vs avatar; MetadataCard vs URL vs social links; expertise chips vs bio). The shell owns the back link, max-width, spacing rhythm, and `<SeoHead>` contract. The three existing page components become thin wrappers that compose the shell.

Phase 0 proves this theory: showing all three entity types side-by-side using the same shell anatomy makes the slot boundaries visible and lets us confirm (or disprove) before any JSX is written.

## Objective

After this epic: the five taxonomy archive pages share a single column width, font size scale, and spacing rhythm; the five detail pages share a common folio header pattern and content section grid where their content types allow; all ten surfaces are fully tokenized (no hardcoded values, no inline style bypasses); and each distinct layout surface has at least one Storybook story with default + variant + edge-case states. No Sanity schema or GROQ query changes. No `component-registry.md` updates (the registry covers DS primitives; this epic covers page-level layout patterns — a different audit surface).

## Scope

### Phase 0 — Unified layout mock (blocking gate)

**No convergence pass code may be written until Phase 0 is signed off.**

Produce `docs/drafts/SUG-123-taxonomy-layout-mock.html` — self-contained HTML/CSS mock (inline tokens, light + dark toggle). Five tabs:

- [ ] **Tab 1 — Archive: single-column list** — unified row anatomy for sparse types (tools, people, categories, projects). All four row sub-types in one column: plain (tools), color dot + count (categories/projects), avatar + sublabel (people). Decisions to lock: max-width (`--st-width-detail` or narrower?), name font size + family, count badge (raw number vs `Chip`), sublabel font size + color, row height + separator, spacing between rows. This becomes the shared token set for `TaxonomyArchivePage` rows.
- [ ] **Tab 2 — Archive: multi-column grid** — 2–3 col layout for dense types (tags, future glossary). Uses the same row atom from Tab 1 but reflowed into a flat alphabetical grid. Tags: 3-col flat grid split by count, with alpha letter-filter strip (no bucket headers — flat list within columns). Decisions to lock: column count (2 or 3?), min card width, gap. Annotate which types use this layout and why (density threshold).
- [ ] **Tab 3 — Tier 1 detail: collection index** — `TaxonomyDetailPage` pattern for tags + categories + glossary. Back link → title (narrative or UI font?) → optional description → optional color accent → ContentCard grid. Show category variant (with color bar) and tag variant (without) side-by-side. Confirm max-width, heading scale, gap to content grid.
- [ ] **Tab 4 — Tier 2 detail: entity profile shell** — the core of the two-tier theory. Show projects, tools, and people rendered using a single layout shell with named slot zones: (a) **folio zone** — accent bar (projects) / logo block (tools) / avatar block (people); (b) **identity zone** — eyebrow + h1 + description, shared across all three; (c) **metadata zone** — MetadataCard (projects) / URL chip (tools) / social links (people); (d) **rich content zone** — absent (projects/tools) / bio + roles + expertise chips (people); (e) **content sections** — 2-col `Grid` + `SectionLabel`, identical across all three. The mock proves the shell is real by showing all three types at once. If any slot boundary breaks down, annotate it — that is data for the implementation decision.
- [ ] **Tab 5 — Dark mode** — repeat Tab 4 in `dark-pink-moon` theme to confirm the token choices hold. Flag any surface where the current token resolves to the glassmorphism wash instead of a solid dark surface.
- [ ] Mock reviewed and **"Visual QA approved"** received before Phase 2 begins — layer: design sign-off

### Phase 1 — Audit and spec doc (archive layer)

- [ ] Read `TaxonomyArchivePage.jsx`, `TaxonomyArchivePage.module.css`, and `pages.module.css`; produce the archive spec table — layer: tooling/documentation
- [ ] Visit each archive URL (`/categories`, `/tools`, `/tags`, `/projects`, `/people`) and screenshot each in light + dark — layer: visual QA
- [ ] For each archive page, document: layout pattern, CSS classes, tokens, DS components used (currently none), hardcoded values, gaps — layer: documentation
- [ ] Identify CSS classes in `TaxonomyArchivePage.module.css` that are candidates for promotion to `pages.module.css` — layer: documentation
- [ ] Identify which archive patterns could be served by `Chip` (counts), `Grid` (bucket layout), `SectionLabel` (letter headers) — layer: documentation

### Phase 1b — Audit and spec doc (detail layer)

- [ ] Read `TaxonomyDetailPage.jsx` / `.module.css` (tags, categories), `ProjectDetailPage.jsx` / `.module.css`, `ToolDetailPage.jsx` (no own module — uses `pages.module.css`), `PersonProfilePage.jsx` / `.module.css`; produce the detail spec table — layer: tooling/documentation
- [ ] Visit each detail URL (e.g. `/tools/aem-assets`, `/categories/content-architecture`, `/people/beehead`, `/projects/sugartown-design-system`, `/tags/design-systems`) and screenshot in light + dark — layer: visual QA
- [ ] For each detail page, document: layout pattern, CSS module(s), key classes, DS components used, hardcoded values, inline style bypasses, SEO coverage gaps — layer: documentation
- [ ] Identify which bespoke CSS patterns (e.g. `expertiseChip` in PersonProfilePage, `taxonomyColorBar`) could be replaced by DS primitives — layer: documentation

### Phase 2 — Convergence pass (archive)

- [ ] Replace hardcoded `border-radius: 50%` on avatar elements in `TaxonomyArchivePage.module.css` with `--st-radius-avatar` token (add token if it doesn't exist: `tokens.json` → `pnpm tokens:build`) — layer: design system / CSS
- [ ] Evaluate and apply `Grid` DS component to the `taxGrid` flat-column layout if it fits the 3-col split contract — layer: frontend
- [ ] (Letter-bucket headers removed — tags now uses flat alphabetical grid with letter filter; no `SectionLabel` evaluation needed) — layer: documentation
- [ ] Evaluate `Chip` for `itemCount` and `taxRowCount` badges — layer: frontend
- [ ] Any convergence changes must pass `pnpm validate:tokens` with zero errors — layer: tooling

### Phase 2b — Convergence pass (detail)

- [ ] **`TaxonomyDetailPage`:** Replace hardcoded `border-radius: 2px` on `.taxonomyColorBar` with a token (`--st-radius-xs` if it exists). Add explicit `font-family` token to `.taxonomyTypeLabel` and `.taxonomyTitle` (currently inheriting body default, not intentional). Add `<SeoHead autoGenerate={true} name={item.name} description={item.description} />` — default to auto-generation since tags and categories rarely carry hand-authored SEO fields; only override when explicit `seo` fields are present on the document. — layer: CSS / frontend
- [ ] **`ToolDetailPage`:** Move three inline styles to CSS classes in `pages.module.css` or a dedicated `ToolDetailPage.module.css`: URL link typography, logo image object-fit/padding/bg, content section `marginTop` — layer: frontend / CSS
- [ ] **`PersonProfilePage`:** Evaluate replacing `.expertiseChip` with the DS `Chip` component (same visual shape — mono font, pink-50 bg, maroon color, pink hover). If adopted, remove the bespoke class. — layer: frontend
- [ ] **`ProjectDetailPage`:** Replace hardcoded `font-size: clamp(...)` on `.projectName` with a token scale equivalent if one exists; replace `font-size: 1rem` / `line-height: 1.65` on `.projectDescription` with tokens. Also replace `margin-top: 2rem` on `.contentSection` with a spacing token. — layer: CSS
- [ ] Confirm `--st-radius-xs` exists before using it — grep `tokens.css` before writing (see technical notes) — layer: tooling
- [ ] Any convergence changes must pass `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` with zero errors — layer: tooling

### Phase 3 — Storybook stories

- [ ] `TaxonomyListRow.stories.tsx` — default (name + count), with-dot (categories/projects), with-avatar (people), with-sublabel (tags), no-count — layer: Storybook
- [ ] `TaxonomyFlatGrid.stories.tsx` — tags flat 3-col grid, alpha strip active/selected/disabled states, filtered (single-col) state, many-items edge case — layer: Storybook
- [ ] `TaxonomyDetailHeader.stories.tsx` — categories/tags variant (color bar + type label + h1 + description + ContentCard grid), projects variant (accent bar + MetadataCard), tools variant (folio + logo + sections), people variant (folio + bio + expertise chips + content sections) — layer: Storybook
- [ ] All stories must render correctly on `default` and `dark-pink-moon` themes — layer: Storybook
- [ ] Chromatic VRT baseline captured for all stories — layer: Storybook

## Acceptance criteria

- [ ] Spec table exists at `docs/conventions/taxonomy-listview-spec.md` with one row per page (10 rows: 5 archive + 5 detail) and columns: Page · URL · Component · Layout pattern · CSS module(s) · Key classes · Tokens · DS components used · DS components applicable (gap) · Hardcoded values · Inline style bypasses · SEO coverage · Notes
- [ ] Zero `border-radius: 50%` hardcoded values remain in `TaxonomyArchivePage.module.css` — replaced with token
- [ ] Zero `border-radius: 2px` hardcoded values remain in `TaxonomyDetailPage.module.css` — replaced with token
- [ ] Zero inline style bypasses remain in `ToolDetailPage.jsx` — moved to CSS classes
- [ ] `TaxonomyDetailPage` `.taxonomyTypeLabel` and `.taxonomyTitle` carry explicit `font-family` token declarations
- [ ] `pnpm validate:tokens` and `pnpm validate:tokens --strict-colors` pass with zero errors after convergence pass
- [ ] All ten pages render correctly in browser after convergence pass
- [ ] `TaxonomyListRow` Storybook story covers all five row variants
- [ ] `TaxonomyFlatGrid` Storybook story covers tags flat grid + alpha strip states
- [ ] `TaxonomyDetailHeader` Storybook story covers all four detail variants
- [ ] All stories pass Chromatic on `default` and `dark-pink-moon` themes

## Technical notes

- **Two-tier detail architecture (proposed — confirmed by Phase 0 mock):**
  - *Tier 1 (`TaxonomyDetailPage`)* — collection index pages (tags, categories, glossary). Minimal template: back link + title + optional description/color accent + ContentCard grid. Keep simple by design. Add `<SeoHead>`. No folio.
  - *Tier 2 (`EntityDetailPage` — new shared shell)* — entity profile pages (projects, tools, people). Slot-based composition: folio zone + identity zone + metadata zone + rich content zone + content sections. Each existing page component (`ProjectDetailPage`, `ToolDetailPage`, `PersonProfilePage`) becomes a thin wrapper that passes slot content into the shell. The shell owns back link, max-width, spacing rhythm, `<SeoHead>` contract, and the content section grid.
  - The slot API for `EntityDetailPage` must be defined in the Phase 0 mock before any JSX is written. If Phase 0 reveals that projects don't fit the shell (e.g. the accent bar + MetadataCard pattern is too divergent from the folio pattern), the fallback is: tools + people share the shell, projects keep their own component.
- **No schema changes.** This epic is purely frontend + tooling.
- **No `component-registry.md` updates.** The registry covers DS primitives. This audit covers page-level layout patterns — a separate concern. A future epic can link them once the language is established.
- **DS component evaluation is audit-first, not prescriptive.** The convergence pass only applies DS components where they fit the existing contract. If `Grid` doesn't serve the `taxGrid` bucket layout without regressions, document why and leave it as-is.
- **Token pipeline:** Any new token (`--st-radius-avatar`) must go through `tokens/source/tokens.json` → `pnpm tokens:build` → both `tokens.css` files regenerated and committed together. Do not edit `tokens.css` directly.
- **Activation audit:** Before Phase 2 begins, grep `apps/web/src/design-system/styles/tokens.css` for `radius` to confirm whether `--st-radius-avatar` and `--st-radius-xs` exist before adding or referencing them.
- **Storybook architecture note:** All taxonomy page components are wired to router + Sanity data. Stories must extract the presentational sub-components (`TaxonomyItem`, `FlatGrid`, `AlphaStrip`, folio blocks) or mock the data layer — do not try to story the full page components.
- **`PersonProfilePage` avatar border-radius:** The archive avatar `border-radius: 50%` is in `TaxonomyArchivePage.module.css`. The profile page avatar uses `pageStyles.entityThumbnail` from `pages.module.css` — check that class for any hardcoded `border-radius` before the convergence pass.
- **`ToolDetailPage` has no own CSS module:** All its layout comes from `pages.module.css` shared classes. The three inline style bypasses are the only non-tokenized surface — moving them to CSS is the full scope for this page's convergence.
- **`PersonProfilePage` `.expertiseChip` vs DS `Chip`:** The bespoke chip is visually identical to what `Chip` could provide (mono font, pink-50 bg, maroon text, pink hover). Evaluate whether `Chip` accepts a `tone` or `variant` prop that covers this state before building a custom extension. If adoption requires a new `Chip` prop, that is a DS change — scope it as a separate commit.
- **`color-mix()` in `PersonProfilePage.module.css`:** `.expertiseChip` uses `color-mix(in srgb, var(--st-color-pink) 25%, transparent)` for border color. This is a computed value, not a raw hex — it passes `--strict-colors`. It is a valid technique but is not auditable by the token validator. If `Chip` adoption is chosen, this dissolves naturally.
- **`TaxonomyDetailPage` missing SEO:** `TaxonomyDetailPage.jsx` has no `<SeoHead>` or JSON-LD output. All three dedicated detail pages (Project, Tool, Person) have it. Add `<SeoHead>` in Phase 2b with `autoGenerate={true}` as the default — tags and categories rarely have hand-authored SEO fields in Sanity, so auto-generation from `name` + `description` is the correct fallback. Only suppress auto-generation if the document carries explicit `seo.metaTitle` / `seo.metaDescription` fields.
- **SUG-35 dependency:** The glossary archive is a dense taxonomy list — it belongs to the 2–3 col layout variant established in Phase 0. The column spec, row anatomy, and token vocabulary locked here are the reference when SUG-35 resumes. Do not design the glossary listview independently.

## Audit spec table — Archive layer (seed — complete at activation)

| Page | URL | Component | Layout pattern | CSS module(s) | Key classes | DS components used | DS components applicable | Hardcoded values | Notes |
|------|-----|-----------|----------------|---------------|-------------|-------------------|--------------------------|-----------------|-------|
| Categories | `/categories` | `TaxonomyArchivePage` | `rows` — flat list, color dot + name + count | `TaxonomyArchivePage.module.css` | `itemList`, `item`, `itemLink`, `itemColorDot`, `itemText`, `itemLabel`, `itemCount` | None | `Chip` (count), `SectionLabel` (header) | None | Has `lede` subtitle; dot is inline style backgroundColor |
| Projects | `/projects` | `TaxonomyArchivePage` | `rows` — flat list, color dot + name + count | `TaxonomyArchivePage.module.css` | Same as categories | None | `Chip` (count) | None | Same row pattern as categories; no lede |
| Tools | `/tools` | `TaxonomyArchivePage` | `rows` — flat list, name + count (no dot, no avatar) | `TaxonomyArchivePage.module.css` | `itemList`, `item`, `itemLink`, `itemText`, `itemLabel`, `itemCount` | None | `Chip` (count) | None | Simplest row — no visual lead element |
| People | `/people` | `TaxonomyArchivePage` | `rows` — flat list, avatar (image or initial fallback) + name + primaryTitle sublabel | `TaxonomyArchivePage.module.css` | `itemList`, `item`, `itemLink`, `itemAvatar`, `itemAvatarFallback`, `itemText`, `itemLabel`, `itemSublabel` | None | None obvious | `border-radius: 50%` ×2 (avatar + fallback) | No count; image via `urlFor()` at 40×40 |
| Tags | `/tags` | `TaxonomyArchivePage` | `flat-grid` — 3-col alphabetical flat list split by count, with alpha letter-filter strip (no bucket headers) | `TaxonomyArchivePage.module.css` | `alphaStrip`, `alphaBtn`, `alphaBtnActive`, `alphaBtnSelected`, `alphaBtnDisabled`, `taxGrid`, `taxGridSingle`, `taxBucketList`, `taxRow`, `taxRowInner`, `taxRowName`, `taxRowSub`, `taxRowCount` | None | `Grid` (evaluated — does not fit; see Phase 2 DS eval), `Chip` (count) | None | Alpha strip filters visible tags (React state, not anchor nav); filtered state uses `taxGridSingle` (1-col); `min-width: 0` on `taxBucketList` is critical for equal 1fr columns with `white-space: nowrap` labels |

## Audit spec table — Detail layer (seed — complete at activation)

| Page | URL | Component | Layout pattern | CSS module(s) | Key classes | DS components used | DS components applicable | Hardcoded values / inline bypasses | SEO | Notes |
|------|-----|-----------|----------------|---------------|-------------|-------------------|--------------------------|-------------------------------------|-----|-------|
| Categories detail | `/categories/:slug` | `TaxonomyDetailPage` | Back link + color bar + type label + h1 + description + ContentCard grid | `TaxonomyDetailPage.module.css`, `pages.module.css` | `taxonomyColorBar`, `taxonomyTypeLabel`, `taxonomyTitle`, `taxonomyDescription`, `contentSection`, `archiveGrid` | `ContentCard`, `Pagination` | `Grid` (content grid — currently uses `archiveGrid` flex wrap) | `border-radius: 2px` on `.taxonomyColorBar`; no `font-family` on `.taxonomyTypeLabel` / `.taxonomyTitle` | None — no `<SeoHead>` | Shared with tags; `archiveGrid` is in `pages.module.css` |
| Tags detail | `/tags/:slug` | `TaxonomyDetailPage` | Same as categories — no color bar for tags | `TaxonomyDetailPage.module.css`, `pages.module.css` | Same as categories | `ContentCard`, `Pagination` | Same | Same | None | No `colorHex` in tag schema so bar is absent |
| Projects detail | `/projects/:slug` | `ProjectDetailPage` | Back link + accent bar + h1 + description + MetadataCard + content sections (2-col grid) | `ProjectDetailPage.module.css`, `pages.module.css` | `projectPage`, `accentBar`, `projectName`, `projectDescription`, `contentSection` | `Grid`, `SectionLabel`, `ContentCard`, `MetadataCard`, `DraftBadge` | None obvious | `font-size: clamp(1.75rem, 4vw, 2.5rem)` on `.projectName`; `font-size: 1rem` / `line-height: 1.65` on `.projectDescription`; `margin-top: 2rem` on `.contentSection` | `<SeoHead>` + JSON-LD | `--project-accent` CSS custom prop set inline (dynamic per-doc, acceptable) |
| Tools detail | `/tools/:slug` | `ToolDetailPage` | Folio (logo + identity: eyebrow + h1 + description + URL) + typed content sections (2-col grid) | `pages.module.css` only | `entityFolio`, `entityThumbnail`, `entityThumbnailFallback`, `narrativeHeading`, `entityDescription`, `detailEyebrow`, `backLink`, `archiveEmpty` | `Grid`, `SectionLabel` | None obvious | 3 inline styles in JSX: URL link (fontFamily/fontSize/color), logo img (objectFit/padding/bg), content section (marginTop) | `<SeoHead>` + JSON-LD | Only detail page with no own CSS module |
| People detail | `/people/:slug` | `PersonProfilePage` | Folio (avatar + identity: name + headline + meta + social links) + bio + roles + expertise chips + content sections (2-col grid) | `PersonProfilePage.module.css`, `pages.module.css` | `profilePage`, `profileFolio`, `folioIdentity`, `profileShortName`, `profileMeta`, `socialLinks`, `socialLink`, `profileBio`, `rolesSection`, `rolesHead`, `rolesList`, `expertiseSection`, `expertiseHead`, `expertiseChips`, `expertiseChip`, `contentSection` | `Grid`, `SectionLabel`, `ContentCard`, `PortableText` | `Chip` (expertiseChip — same shape) | `border-radius: 50%` on `.rolesList li::before` (4px bullet dot); `color-mix()` on `.expertiseChip` border | `<SeoHead>` + JSON-LD | Most complex detail page; own CSS module; hand-rolled LinkedIn SVG (Simple Icons v13 dropped SiLinkedin) |

## Gaps and missing items (called out)

Issues found during the audit pass that are not blocking the convergence pass but should be tracked:

1. **`TaxonomyDetailPage` has no SEO** — no `<SeoHead>` or JSON-LD on `/categories/:slug` or `/tags/:slug`. All three dedicated detail pages have it. Add in Phase 2b with `autoGenerate={true}` as the default; fall back to explicit `seo` fields if present.
2. **`TaxonomyDetailPage` typography tokens missing** — `.taxonomyTypeLabel` and `.taxonomyTitle` have no explicit `font-family` declaration. They inherit body font rather than intentionally selecting `--st-font-family-ui` or `--st-font-family-narrative`. This is a silent convention gap, not a visual regression.
3. **Hand-rolled LinkedIn SVG in `PersonProfilePage`** — Simple Icons v13 dropped `SiLinkedin`. The current fix is a custom SVG path in the component. A future Simple Icons update may restore the export; track as a maintenance note.
4. **`PersonProfilePage` expertiseChip links use hardcoded `/categories/` path prefix** — violates the URL authority rule. Should use `getCanonicalPath({ docType: 'category', slug: item.slug })`. Flag for convergence pass.
5. **Detail page `contentSection { margin-top: 2rem }` is duplicated** — identical rule appears in both `ProjectDetailPage.module.css` and `PersonProfilePage.module.css`. Candidate for promotion to a shared token or `pages.module.css` class if convergence pass confirms the pattern is universal.
6. **Dark mode untested on all ten surfaces** — neither archive nor detail pages have Storybook stories, so dark mode has never been formally verified. Phase 3 Chromatic capture is the first structured dark mode check.

## Non-Goals

- No changes to `component-registry.md` — registry covers DS primitives, not page-level patterns
- No Sanity schema or GROQ changes
- No new page types or routes
- No archive pages outside the five taxonomy types (`/articles`, `/case-studies`, `/knowledge-graph` are content archives with different patterns — out of scope)
- No animation or interaction design changes beyond what the convergence pass corrects
- No SEO addition to `TaxonomyDetailPage` unless explicitly approved in Phase 2b (gap is flagged, not pre-committed)

## Related

- **Linear:** [SUG-123](https://linear.app/sugartown/issue/SUG-123/taxonomy-listview-audit-shared-layout-language-tokens-and-storybook)
- **Blocked by SUG-35 hold:** SUG-35 Glossary archive specifies a taxonomy listview; this spec doc should inform that design once SUG-35 resumes
- `apps/web/src/pages/TaxonomyArchivePage.jsx` + `.module.css`
- `apps/web/src/pages/TaxonomyDetailPage.jsx` + `.module.css`
- `apps/web/src/pages/ProjectDetailPage.jsx` + `.module.css`
- `apps/web/src/pages/ToolDetailPage.jsx` (no own module — uses `pages.module.css`)
- `apps/web/src/pages/PersonProfilePage.jsx` + `.module.css`
- `apps/web/src/pages/pages.module.css`
- `docs/conventions/component-registry.md` — registry format to mirror for the spec table
- **Epic template:** `docs/epic-template.md`
