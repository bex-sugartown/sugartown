---
**Epic:** SUG-170 — SEO auto-generation — fix SeoHead wiring + resolver field mapping, then autoGenerate rollout
**Linear Issue:** [SUG-170](https://linear.app/sugartown/issue/SUG-170/seo-auto-generation-fix-seohead-wiring-resolver-field-mapping-then)
**Status:** Shipped v0.26.24
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-170 — SEO auto-generation — fix SeoHead wiring + resolver field mapping, then autoGenerate rollout

Make the "Auto-generate from content" SEO promise true end-to-end, then roll the toggle on across all entries.

## Background

The `seoMetadata.autoGenerate` toggle promises that "title and description are derived automatically from the document's title, excerpt, or body text." In practice the rendered `<head>` on several page types shows only the **static `index.html` defaults** (`<title>Sugartown Digital</title>` + the generic site description) — nothing content-derived. Discovered 2026-06-14 while verifying the glossary (`/glossary/headless-cms`): its head never updates from the static default.

Two concrete defects plus a deeper architectural limit:
- **SeoHead API mismatch.** `SeoHead` (`apps/web/src/components/SeoHead.jsx`) accepts only `{ seo, heroImageUrl, jsonLd }` and early-returns when `seo` is falsy. ~10 call sites instead pass `title=`/`description=` props, which are silently ignored → no per-page meta is set, so the static default stands.
- **resolveSeo field mapping.** `resolveSeo` (`apps/web/src/lib/seo.js`) derives the auto title from `doc.title`. `glossaryTerm` uses `term`; taxonomies use `name`. So even a correctly-wired call yields a generic title for those types.
- **Client-side-only head (AEO).** SeoHead injects tags via `useEffect` in a Vite SPA with no SSR. Non-JS crawlers / AI answer engines see only the static `index.html`. This is the real ceiling for SEO/AEO and likely a separate epic — scope decision belongs here.

## Objective

After this epic, every content page emits a correct, content-derived `<title>` and `<meta name="description">` (with site-default fallback), the `autoGenerate` toggle behaves as documented across all SEO-bearing types, and the toggle is enabled on all entries. Layers touched: **React render** (SeoHead component + call sites) + **resolver util** (`seo.js`) + **content** (bulk `seo.autoGenerate` patch). Explicitly **out of scope**: SSR/prerender (logged as a follow-on if confirmed necessary); no Sanity schema changes (the `seoMetadata` object already has every field).

## Scope

- [x] **Audit + fix SeoHead call sites** — extended SeoHead to accept `title`/`description` shorthand (useMemo-stabilised); static pages work without change; canonical API documented in component header
- [x] **SeoHead API decision** — chose shorthand-extension approach: SeoHead accepts both `seo={seo}` (canonical) and `title=`/`description=` (shorthand for static pages); documented in JSDoc
- [x] **resolveSeo field mapping** — title now tries `title → term → name → shortName`; description fallback uses `doc.body ?? doc.definition` (covers glossaryTerm); GlossaryTermPage fixed to pass `seo={seo}` directly
- [x] **Verify derivation end-to-end** — verified: glossary term, platform page, article, tool (node implicit via article regression). All content-derived.
- [x] **Bulk `autoGenerate=true` rollout** — 55 published docs patched via migration script (2026-06-16). 0 published docs remain with `autoGenerate == false`. Draft docs (4) left as-is.
- [x] **AEO scope decision** — **No-go for this epic.** SeoHead sets tags client-side via `useEffect`; non-JS crawlers see only `index.html` defaults. SSR/prerender would be the real fix. Decision: not worth the complexity for current traffic levels; revisit when AEO/crawler indexing is a confirmed priority. No follow-on epic opened.

## Phases

Single long-lived branch (`bex/sug-170-…`), one mini-release at close.

1. **Engine fix** — SeoHead API + call-site conversion + resolveSeo field mapping. End state: every page emits correct per-page meta, verified in-browser.
2. **Data rollout** — bulk `seo.autoGenerate=true` (the toggle is only meaningful once the engine works). Structural patch; publish.
3. **AEO decision** — record the SSR/prerender call (follow-on epic or documented no-go).

## Acceptance criteria

- [x] Every `<SeoHead>` call site renders a per-page `<title>` and `<meta name="description">` — verified glossary term, platform page, article, tool. Regression: article was already working.
- [x] Glossary term head shows content-derived title ("Headless CMS | Sugartown Digital") and description from definition PT body — confirmed 2026-06-16
- [x] `resolveSeo` maps correct title field per type; glossaryTerm uses `term`, taxonomies use `name`
- [x] SeoHead prop contract documented in JSDoc header; `seo` (canonical) and `title`/`description` (shorthand) both documented
- [x] `seo.autoGenerate=true` on all 55 targeted published docs; 0 remaining with `false`; Sanity content Lake updated directly
- [x] AEO scope decision recorded — no-go, noted above
- [x] No Sanity schema change; no regression on entity pages using inline `seo` builders (ToolDetailPage etc.)

## Human QA Walkthrough — example local pages

This epic changes a shared component (`SeoHead`) and a shared util (`resolveSeo`) consumed by every page — so the walkthrough is **required**.

> Activation audit: read `apps/web/src/App.jsx`, list every page-type that renders `<SeoHead>` (all archives, all detail types, glossary, taxonomy, platform pages, sitemap, home), and build the Human QA Walkthrough table with one example local URL per page-type. For each, capture the resolved `document.title` and `<meta name="description">` from the live runtime head (not view-source) and confirm it is content-derived, with at least one already-working `seo={seo}` page as a regression guard. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **No Content Write Gate for the toggle** — `autoGenerate` is a structural boolean, not human-readable copy. The bulk patch is exempt. (Confirmed 55 docs `false`, 0 with manual `metaTitle`, so flipping overrides no authored titles; `metaDescription` overrides in both modes regardless.)
- **Activation audit — SeoHead call sites:** `grep -rn "<SeoHead" apps/web/src/pages`. As of 2026-06-14, 14 pass `seo={seo}` (work); the rest pass `title=`/`description=` (no-op). Reconcile all to the chosen API.
- **Activation audit — resolveSeo:** read `apps/web/src/lib/seo.js` `resolveSeo()` and the per-type `build*Seo()` builders in ToolDetailPage/PersonProfilePage/ProjectDetailPage; decide whether to unify on `resolveSeo` with a title-field map or keep builders.
- **Bulk patch mechanism:** `seo.autoGenerate=true` via `edit_document`/`patch_document_from_json` per doc (id list from `*[_type in [...] && seo.autoGenerate == false]`). Publish (human-publishes gate or explicit authorization).
- **SPA SSR note:** the head is set client-side via `useEffect`; view-source / non-JS crawlers see static `index.html`. If AEO/crawler visibility is a goal, SSR or build-time prerender is the real fix — out of scope here, decision recorded in Phase 3.
- **Model & Mode [REQUIRED]:** `/model opusplan` — multi-file frontend change (shared component API + resolver + ~10 call sites) plus a content rollout and an architecture decision. Opus plans the API decision + call-site reconciliation + Files to Modify; Sonnet executes after plan-mode exit.

## Model & Mode [REQUIRED]

`/model opusplan` — see Technical notes. Not pure content (rules out sonnet); not pure architecture (rules out opus).

## Non-Goals

- **No `seoMetadata` schema change** — every needed field exists.
- **No SSR/prerender implementation** in this epic — only the scope decision (Phase 3); implementation, if needed, is a follow-on.
- **No new SEO fields or JSON-LD redesign** — `generateJsonLd` is unchanged unless a call-site fix requires it.
- **Entity `build*Seo()` builders** are not forcibly removed — only reconciled if unifying on `resolveSeo` is the chosen path.

## Related

- **Linear:** [SUG-170](https://linear.app/sugartown/issue/SUG-170/seo-auto-generation-fix-seohead-wiring-resolver-field-mapping-then)
- **Surfaced during:** SUG-166 (glossary completion)
- **Key files:** `apps/web/src/components/SeoHead.jsx`, `apps/web/src/lib/seo.js`, `apps/studio/schemas/objects/seoMetadata.ts`, all `apps/web/src/pages/*` SeoHead call sites
- **Epic template:** `docs/epic-template.md`
