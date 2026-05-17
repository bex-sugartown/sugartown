---
**Epic:** SUG-123 — Taxonomy listview audit — shared layout language, tokens, and Storybook coverage
**Linear Issue:** [SUG-123](https://linear.app/sugartown/issue/SUG-123/taxonomy-listview-audit-shared-layout-language-tokens-and-storybook)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — audit doc + convergence pass + Storybook stories ship together
---

# SUG-123 — Taxonomy listview audit — shared layout language, tokens, and Storybook coverage

Audit and document the five taxonomy archive listview pages (/categories, /tools, /tags, /projects, /people). Establish shared naming conventions, token usage, and DS component gaps. Produce a spec table (registry-format) annotating each page's layout pattern, CSS classes, tokens consumed, and DS components used or missing. Unblocks a convergence pass and Storybook coverage for these surfaces.

## Background

All five taxonomy archive pages are served by a single `TaxonomyArchivePage.jsx` with two layout patterns: a flat `rows` list (people, categories, projects, tools) and a `buckets` letter-grid (tags). The CSS module (`TaxonomyArchivePage.module.css`) uses `--st-*` tokens throughout and has no hardcoded color values, but it has no DS component consumption — no `Chip`, `Grid`, `Card`, or `SectionLabel` primitives are used anywhere in the archive layer. Three `border-radius: 50%` values are hardcoded (avatar circles) with no token equivalent.

The surfaces have zero Storybook stories. There is no shared language for describing the row pattern, the bucket pattern, the alpha strip, or the avatar treatment — which makes it impossible to write stories, conduct Chromatic VRT, or reference these patterns in future epics (e.g. SUG-35 Glossary, which specifies a taxonomy listview of its own). This epic names the patterns, audits the tokens and classes, identifies DS component gaps, and adds Storybook coverage.

## Objective

After this epic: every taxonomy listview pattern is documented in a spec table with a registry-like format (page, layout pattern, CSS classes, tokens, DS components consumed, gaps); a convergence pass eliminates any duplicate or divergent CSS that can be unified; and each distinct layout surface has at least one Storybook story with default + variant + edge-case states. No Sanity schema or GROQ query changes. No `TaxonomyDetailPage` changes. No `component-registry.md` updates (the registry covers DS primitives; this epic covers page-level layout patterns — a different audit surface).

## Scope

### Phase 1 — Audit and spec doc

- [ ] Read `TaxonomyArchivePage.jsx`, `TaxonomyArchivePage.module.css`, and `pages.module.css`; produce the spec table below — layer: tooling/documentation
- [ ] Visit each live URL (`/categories`, `/tools`, `/tags`, `/projects`, `/people`) and screenshot each in light + dark — layer: visual QA
- [ ] For each page, document: layout pattern, CSS classes used from each module, tokens consumed, DS components used (currently none), hardcoded values, gaps vs shared conventions — layer: documentation
- [ ] Identify which CSS classes in `TaxonomyArchivePage.module.css` are candidates for promotion to `pages.module.css` (shared) vs staying page-scoped — layer: documentation
- [ ] Identify which patterns could be served by existing DS components (`Chip` for count badges, `Grid` for bucket layout, `SectionLabel` for letter headers) — layer: documentation

### Phase 2 — Convergence pass

- [ ] Replace hardcoded `border-radius: 50%` on avatar elements with `--st-radius-avatar` token (add token if it doesn't exist, following token pipeline: `tokens.json` → `pnpm tokens:build`) — layer: design system / CSS
- [ ] Evaluate and apply `Grid` DS component to the `taxGrid` bucket layout if it fits the 3-col `repeat(auto-fill)` contract — layer: frontend
- [ ] Evaluate `SectionLabel` for letter-bucket headers (`taxLetter` + `taxLetterGlyph` + `taxLetterRule`) — layer: frontend
- [ ] Evaluate `Chip` for `itemCount` and `taxRowCount` badges — layer: frontend
- [ ] Any convergence changes must pass `pnpm validate:tokens` with zero errors — layer: tooling

### Phase 3 — Storybook stories

- [ ] `TaxonomyListRow.stories.tsx` — default (name + count), with-dot (categories/projects), with-avatar (people), with-sublabel (tags), no-count — layer: Storybook
- [ ] `TaxonomyBucketGrid.stories.tsx` — tags bucket layout, alpha strip active/disabled states, single-bucket edge case, many-buckets edge case — layer: Storybook
- [ ] Both stories must render correctly on `default` and `dark-pink-moon` themes — layer: Storybook
- [ ] Chromatic VRT baseline captured — layer: Storybook

## Acceptance criteria

- [ ] Spec table exists at `docs/conventions/taxonomy-listview-spec.md` with one row per page and columns: Page · URL · Layout pattern · CSS module(s) · Key classes · Tokens · DS components used · DS components applicable (gap) · Hardcoded values · Notes
- [ ] Zero `border-radius: 50%` hardcoded values remain in `TaxonomyArchivePage.module.css` — replaced with token
- [ ] `pnpm validate:tokens` passes with zero errors after convergence pass
- [ ] Each of the five pages renders correctly in browser after convergence pass
- [ ] `TaxonomyListRow` Storybook story covers all five row variants
- [ ] `TaxonomyBucketGrid` Storybook story covers tags layout + alpha strip states
- [ ] Both stories pass Chromatic on `default` and `dark-pink-moon` themes

## Technical notes

- **No schema changes.** This epic is purely frontend + tooling.
- **No `component-registry.md` updates.** The registry covers DS primitives. This audit covers page-level layout patterns — a separate concern. A future epic can link them once the language is established.
- **DS component evaluation is audit-first, not prescriptive.** The convergence pass only applies DS components where they fit the existing contract. If `Grid` doesn't serve the `taxGrid` bucket layout without regressions, document why and leave it as-is.
- **Token pipeline:** Any new token (`--st-radius-avatar`) must go through `tokens/source/tokens.json` → `pnpm tokens:build` → both `tokens.css` files regenerated and committed together. Do not edit `tokens.css` directly.
- **Activation audit:** Before Phase 2 begins, read `apps/web/src/design-system/styles/tokens.css` and grep for `radius` to confirm whether a `--st-radius-avatar` or equivalent token already exists before adding one.
- **Storybook architecture note:** `TaxonomyArchivePage` is a page-level component wired to router + Sanity data. Stories must extract the presentational sub-components (`TaxonomyItem`, `BucketGrid`, `AlphaStrip`) or mock the data layer — do not try to story the full page component.
- **SUG-35 dependency:** The SUG-35 Glossary archive specifies a taxonomy listview for its category-filtered view. The spec doc and token vocabulary from this epic should be the reference when that surface is designed and implemented.

## Audit spec table (seed — complete at activation)

| Page | URL | Layout pattern | CSS module(s) | Key classes | DS components used | DS components applicable | Hardcoded values | Notes |
|------|-----|----------------|---------------|-------------|-------------------|--------------------------|-----------------|-------|
| Categories | `/categories` | `rows` — flat list, color dot + name + count | `TaxonomyArchivePage.module.css` | `itemList`, `item`, `itemLink`, `itemColorDot`, `itemText`, `itemLabel`, `itemCount` | None | `Chip` (count), `SectionLabel` (header) | None | Has `lede` subtitle; dot is inline style backgroundColor |
| Projects | `/projects` | `rows` — flat list, color dot + name + count | `TaxonomyArchivePage.module.css` | Same as categories | None | `Chip` (count) | None | Same row pattern as categories; no lede |
| Tools | `/tools` | `rows` — flat list, name + count (no dot, no avatar) | `TaxonomyArchivePage.module.css` | `itemList`, `item`, `itemLink`, `itemText`, `itemLabel`, `itemCount` | None | `Chip` (count) | None | Simplest row — no visual lead element |
| People | `/people` | `rows` — flat list, avatar (image or initial fallback) + name + primaryTitle sublabel | `TaxonomyArchivePage.module.css` | `itemList`, `item`, `itemLink`, `itemAvatar`, `itemAvatarFallback`, `itemText`, `itemLabel`, `itemSublabel` | None | None obvious | `border-radius: 50%` ×2 (avatar + fallback) | No count; image via `urlFor()` at 40×40 |
| Tags | `/tags` | `buckets` — 3-col letter grid + alpha strip | `TaxonomyArchivePage.module.css` | `alphaStrip`, `alphaBtn`, `alphaBtnActive`, `alphaBtnDisabled`, `taxGrid`, `taxBucket`, `taxLetter`, `taxLetterGlyph`, `taxLetterRule`, `taxBucketList`, `taxRow`, `taxRowInner`, `taxRowName`, `taxRowSub`, `taxRowCount` | None | `Grid` (bucket grid), `SectionLabel` (letter header), `Chip` (count) | None | Most complex pattern; `taxLetterRule` is a flex-1 hairline; hover shifts `padding-left` |

## Non-Goals

- No changes to `TaxonomyDetailPage.jsx` or detail page CSS — detail pages are a separate audit surface
- No changes to `component-registry.md` — registry covers DS primitives, not page-level patterns
- No Sanity schema or GROQ changes
- No new page types or routes
- No archive pages outside the five taxonomy types (`/articles`, `/case-studies`, `/knowledge-graph` are content archives with different patterns — out of scope)
- No animation or interaction design changes beyond what the convergence pass corrects

## Related

- **Linear:** [SUG-123](https://linear.app/sugartown/issue/SUG-123/taxonomy-listview-audit-shared-layout-language-tokens-and-storybook)
- **Blocked by SUG-35 hold:** SUG-35 Glossary archive specifies a taxonomy listview; this spec doc should inform that design once SUG-35 resumes
- `apps/web/src/pages/TaxonomyArchivePage.jsx`
- `apps/web/src/pages/TaxonomyArchivePage.module.css`
- `apps/web/src/pages/pages.module.css`
- `docs/conventions/component-registry.md` — registry format to mirror for the spec table
- **Epic template:** `docs/epic-template.md`
