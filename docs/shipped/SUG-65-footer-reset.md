# SUG-65 — Footer Reset: Colophon + IA Reorg + Version Strip

**Linear Issue:** SUG-65
**Created:** 2026-04-15
**Priority:** P3 Medium
**Carved from:** SUG-57 Academic Layer §7 (Colophon Footer)

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — extends existing `Footer.jsx` component, `siteSettings` schema, and Sanity `navigation` doc type. No new interactive patterns beyond one small external-link cluster (toolchain mentions). Nav item resolution already handled by `resolveNavLink()`.
- [ ] **Use case coverage** — single consumer: site-wide `<Footer>` on every route. No other surfaces render this content.
- [ ] **Layout contract** — two rows stacked vertically:
  1. **Top row** — Brand zone (logo, tagline, social) as left column + Columns zone (3-col nav links) as right columns, side by side. Desktop: `grid-template-columns: auto 1fr`. Below 768px: brand stacks above columns (single column, brand first).
  2. **Utility row** — single inline row of 4 legal/utility links (full width).
  3. **Colophon strip** — version + toolchain chips + license + build date, then copyright line (full width, bottom).
  Max-width: same as current `.container` (inherits from global container).
- [ ] **All prop value enumerations** — no new enum fields. Colophon data: version from CHANGELOG.md (build-time injection), build date from `Date` (build-time injection), toolchain chips from `tool` reference array (Sanity), license from plain string field (Sanity).
- [ ] **Correct audit file paths** — verified: `apps/web/src/components/Footer.jsx` (88 lines), `Footer.module.css`, `apps/studio/schemas/documents/siteSettings.ts` (footer group at lines 95-141).
- [ ] **Dark / theme modifier treatment** — inherits `--st-color-bg-canvas` / `--st-color-text-*` tokens. Courier Prime for colophon labels matches MetadataCard + MarginColumn typography pattern (SUG-52).
- [ ] **Studio schema changes scoped** — yes, in-scope. New `colophon` fields added to siteSettings. Commit prefix `feat(studio): SUG-65 — colophon fields`.
- [ ] **Web adapter sync scoped** — N/A. `Footer` is app-level, no DS primitive.
- [ ] **Composition overlap audit** — `copyrightText` overlaps with new `licenseLabel`. Decision: keep `copyrightText` as the "© 2026 Site." string, add `licenseLabel` as separate compact string ("CC BY-NC 4.0" or similar). Don't merge — they serve different purposes.
- [ ] **Atomic Reuse Gate** — new `Colophon.jsx` sub-component inside `Footer.jsx`? Only if >1 consumer. Current proposal: inline the colophon markup in `Footer.jsx` to avoid premature abstraction. Extract later if SUG-57 reuses the treatment.

---

## Context

Current footer (post EPIC-0170) renders three zones:

1. **Brand** (left) — logo + tagline
2. **Columns** (middle) — up to 4 nav reference columns
3. **Social** (right) — social icon strip

Bottom bar: copyright line only.

What's missing:

- **No version string** visible anywhere. Site ships tagged versions (`0.21.2` at time of writing) but the visitor has no way to know "what am I looking at".
- **No toolchain disclosure** — part of the Sugartown portfolio thesis is "this site is the product, built with these tools." Not surfaced.
- **No license** — no indication of content licensing terms.
- **No build/deploy timestamp** — useful for editorial trust ("when was this last updated").
- **Current footer columns are under-configured** — production query shows 2 of the max 4 columns populated, both with null headers in the projection. Likely misconfigured references.
- **Brand column visual weight** — logo + tagline is centered (per EPIC-0170), which reads as decorative rather than informational. A colophon-adjacent brand zone should communicate identity + provenance.

---

## Objective

Reset the footer to serve two concurrent purposes:

1. **Navigation** — clean 3-column link structure aligned with the IA brief (Work, Library, About/Contact)
2. **Colophon** — publication metadata strip (version, toolchain, license, copyright) in a distinct treatment below the columns, using Courier Prime mono labels to match MetadataCard + MarginColumn patterns (SUG-52 Pink Moon identity)

Ship independently of SUG-57 so the version string lands without waiting for marginalia/index view.

---

## Doc Type Coverage Audit

N/A — this is a site-wide component served on every route. No doc-type-specific concerns.

---

## Scope

### Phase 0 — Mockup review

- [ ] Review HTML mock at `docs/drafts/SUG-65-footer-reset-mock.html`
- [ ] Approve layout, column structure, colophon content, typography
- [ ] Answer open decisions below

### Phase 1 — Schema

- [ ] Add colophon fields to `siteSettings` schema (footer group):
  - `footerToolchain` (array of `reference` → `tool`) — curated set of tool documents to display as chips. Configurable in Studio under Footer. Max 12 for layout.
  - `licenseLabel` (string) — e.g., "Content CC BY-NC 4.0 · Code MIT"
  - `licenseUrl` (url, optional) — link to license page
- [ ] `toolchainText` (plain string) is **removed** from scope — replaced by `footerToolchain` references. Do not add `toolchainText`.
- [ ] Deploy schema (`npx sanity schema deploy`)
- [ ] Backfill the siteSettings document with toolchain references + license string in Studio

### Phase 2 — Build-time version injection

- [ ] Vite define plugin: inject `__APP_VERSION__` sourced from **`CHANGELOG.md`** (parse the latest `## [x.y.z]` heading) at build time, not `package.json`. Keeps the displayed version in sync with the changelog rather than a potentially-stale package version.
- [ ] Inject `__BUILD_DATE__` as UTC ISO date string (`YYYY-MM-DD`) at build time via `new Date().toISOString().slice(0,10)`.
- [ ] Constants exposed via a small `lib/buildInfo.js` utility (`APP_VERSION`, `BUILD_DATE`)
- [ ] Version parse must be robust: fallback to `package.json` `version` field if CHANGELOG.md has no parseable version heading.

### Phase 3 — Footer component rewrite

- [ ] Rewrite `Footer.jsx` with new layout (brand+columns row / utility row / colophon strip)
- [ ] **Logo sizing rule** — header renders `siteLogo` at `width(360)` → `width={180}px`.
  - If `footerLogo` exists: render `footerLogo` at **75% of header logo width** → `width(270)` / `width={135}px`.
  - If no `footerLogo`: fall back to `siteLogo` at **75% of header logo width** → same dimensions as above.
  - Both paths resolve to: `urlFor(asset).width(270).url()` + `width={135}` HTML attribute.
- [ ] Update `Footer.module.css` to support new layout + Pink Moon treatment
- [ ] Update `Footer.stories.tsx` with new structure + Snapshot composite story
- [ ] Update `queries.js` `siteSettingsQuery` to project the new colophon fields + toolchain references

### Phase 4 — Content authoring

- [ ] Bex approves final toolchain text, license label, social link set
- [ ] Patch the production siteSettings document with colophon values

---

## Query Layer Checklist

- [ ] `siteSettingsQuery` — add:
  - `footerToolchain[]->{ _id, _type, title, "slug": slug.current }` (dereferences tool references → slug for archive link)
  - `licenseLabel`, `licenseUrl`
- [ ] No other queries affected

---

## Schema Enum Audit

N/A. No new enum fields.

---

## Metadata Field Inventory

N/A — this is layout/content authoring, not metadata surfaces.

---

## Themed Colour Variant Audit

| Surface | Dark Pink Moon | Light Pink Moon | Token(s) |
|---------|----------------|-----------------|----------|
| Footer bg | `var(--st-color-bg-canvas)` | `var(--st-color-bg-canvas)` | Existing |
| Colophon label text | `var(--st-label-color)` (charcoal-400 #888) | `var(--st-label-color)` (charcoal-400 #888) | Existing (SUG-52 post-mortem) |
| Colophon value text | `var(--st-color-text-muted)` | `var(--st-color-text-secondary)` | Existing |
| Divider (brand/columns/colophon) | `var(--st-color-border-subtle)` | `var(--st-color-border-subtle)` | Existing |
| Toolchain chips (bg) | `var(--st-color-lime)` (lime) | `var(--st-color-brand-primary)` (pink/hot) | Existing chip tokens |
| Toolchain chips (text) | dark text on lime | dark text on pink | Inherits from Chip component |

Colophon uses only existing tokens — no new theme work needed.

---

## Non-Goals

- No marginalia, index view, running headers, bibliography, figure captions (SUG-57)
- No new nav items or IA restructure (nav IA is the source of truth)
- No footer redesign on mobile beyond the existing single-column stack
- No real-time build status widget (too much surface for too little signal)

---

## Technical Constraints

**Studio schema**
- New fields live inside the existing `footer` field group in siteSettings.
- `footerToolchain` is an array of references to `tool` documents (already a registered schema type). No new object types needed.
- `licenseLabel` (string) + `licenseUrl` (url) are plain fields. No migration required.
- No migration required; backfilling the singleton document in Studio after Phase 1 deploys.

**Build-time version injection**
- Vite's `define` option replaces `__APP_VERSION__` and `__BUILD_DATE__` at build time.
- `__APP_VERSION__` parsed from the latest `## [x.y.z]` heading in `CHANGELOG.md` at config load. Falls back to `package.json` `version` if no parseable heading found.
- `__BUILD_DATE__` = `new Date().toISOString().slice(0,10)` (UTC, `YYYY-MM-DD`).
- `import.meta.env` alternative is acceptable but less ergonomic.

**Render**
- Footer is server-rendered on Netlify as static HTML inside the SPA shell. Version/build-date must be inlined by the Vite build — no runtime fetch.
- Colophon must not block LCP (already below fold on every page).

**Typography**
- Colophon uses `var(--st-label-font)` (Courier Prime) at `var(--st-label-size)` (0.65rem) for labels, same token system as MetadataCard + MarginColumn. Values use `var(--st-font-ui)` at `var(--st-font-size-xs)`.

---

## Migration Script Constraints

N/A. Only the siteSettings singleton document needs patching, which Bex can do in Studio after Phase 1 ships.

---

## Files to Modify

**Studio**
- `apps/studio/schemas/documents/siteSettings.ts` — add colophon fields

**Frontend**
- `apps/web/vite.config.js` — add define for `__APP_VERSION__` (parsed from `CHANGELOG.md`) + `__BUILD_DATE__`
- `apps/web/src/lib/buildInfo.js` — CREATE, exports `APP_VERSION` + `BUILD_DATE` constants
- `CHANGELOG.md` (repo root) — **read-only at build time**, not modified by this epic
- `apps/web/src/lib/queries.js` — extend `siteSettingsQuery` projection
- `apps/web/src/components/Footer.jsx` — rewrite layout
- `apps/web/src/components/Footer.module.css` — rewrite styles
- `apps/web/src/components/Footer.stories.tsx` — update stories + add Snapshot composite
- `apps/web/env.d.ts` or similar — TypeScript declarations for the define globals (if TS config needs them)

**Mockup (local-only)**
- `docs/drafts/SUG-65-footer-reset-mock.html` — CREATE

---

## Deliverables

1. **Mockup** — HTML mock in `docs/drafts/` showing brand + columns + colophon layout
2. **Schema** — colophon fields added and deployed
3. **Build-time version injection** — `__APP_VERSION__` + `__BUILD_DATE__` available in all builds
4. **Footer component** — new 3-zone layout with colophon strip
5. **Stories** — Snapshot composite + at least one per major state (full data, minimal data, dark theme)
6. **Content** — siteSettings populated with toolchain + license strings

---

## Acceptance Criteria

- [ ] Footer renders version string in the colophon strip, sourced from CHANGELOG.md (e.g., `v0.21.2`)
- [ ] Footer renders build date in the colophon strip (ISO or human-friendly)
- [ ] Footer renders toolchain as chips sourced from `tool` documents, linking to `/tools/:slug`
- [ ] Toolchain chips render pink in light mode, lime in dark mode (existing chip token system)
- [ ] Footer renders license label authored in Sanity, linked if `licenseUrl` set
- [ ] Courier Prime mono labels used for all colophon labels (matches MetadataCard pattern)
- [ ] Colophon strip is visually distinct from the columns zone (divider or spacing)
- [ ] Columns zone shows 3 sensibly-grouped link columns (not 2 empty + 2 populated as today)
- [ ] Mobile layout stacks cleanly — no horizontal overflow at 375px
- [ ] Footer snapshot story exists in Storybook with Chromatic baseline
- [ ] `pnpm validate:tokens` reports zero new errors
- [ ] No CLS regression on any page (footer is below fold, but still)

---

## Visual QA Gate

Mockup exists (`docs/drafts/SUG-65-footer-reset-mock.html`) — comparison table required before close-out.

### Agent will prepare:

1. Storybook story for new Footer variants
2. Mock-to-implementation comparison table (every visual element flagged Match / Drift / Missing)
3. Token compliance audit (grep for hardcoded values in Footer.module.css)
4. Cross-surface spot check — confirm footer renders on `/`, `/articles/*`, `/case-studies/*`, `/about`

### Human gate

Human reviews Storybook rendering + production preview on approved branch. Approves with "Visual QA approved" before close-out.

---

## Risks / Edge Cases

- [ ] **Version string during dev** — `pnpm dev` should show the current `package.json` version, not `0.0.0`. Vite's define handles this if we read `package.json` at config load time.
- [ ] **Build-time date timezone** — use ISO UTC to avoid "last built 4 hours ago" confusion from Netlify's build server timezone. Display as YYYY-MM-DD (no time).
- [ ] **License link** — if `licenseUrl` is external (e.g., Creative Commons), open in new tab. Use existing link component.
- [ ] **Toolchain chip count / wrap** — chips must wrap gracefully on mobile. The colophon row must not overflow at 375px with up to 8 chips.
- [ ] **Footer nav ref model change** — EPIC-0170 left the 4-column `footerColumns` (array of navigation references) in place. Reset proposal drops columns entirely in favour of a single `footerUtilityLinks` array of 4 links (AI Ethics, Privacy & Terms, Sitemap, Contact). Schema change: deprecate `footerColumns` (hide, don't remove), add `footerUtilityLinks` as array of `linkItem` or nav reference. Existing populated nav references can migrate manually in Studio.

---

## Recommended Layout & Reorg

### Current state (production)

```
┌──────────────────────────────────────────────────────────┐
│  [Logo]         [Col 1 null]  [Col 2 null]   [Social]    │
│  Tagline                                                  │
├──────────────────────────────────────────────────────────┤
│  © 2026 Sugartown Digital. All rights reserved.          │
└──────────────────────────────────────────────────────────┘
```

### Proposed state

```
┌──────────────────────────────────────────────────────────┐
│  [Logo]         │  [Col A]     [Col B]     [Col C]       │
│  Tagline        │  Link        Link        Link          │
│  [ln][gh][rss]  │  Link        Link        Link          │
├──────────────────────────────────────────────────────────┤
│  AI Ethics · Privacy & Terms of Use · Sitemap · Contact  │
├──────────────────────────────────────────────────────────┤
│  VERSION  v0.21.2   TOOLCHAIN  [chip] [chip] [chip]...  │
│  LICENSE  CC BY-NC             BUILT  2026-04-15         │
│  © 2026 Sugartown Digital. All rights reserved.          │
└──────────────────────────────────────────────────────────┘

Mobile (< 768px): brand zone stacks above columns (single column),
utility row wraps, colophon wraps.
```

### Link proposal — utility row, not navigation columns

**The footer is NOT a duplicate of the main nav.** The header handles content discovery (Work, Library, About, Services). The footer handles legal, compliance, and utility links that don't belong in primary nav but must be reachable from every page.

Four links in a single inline utility row (not column headers, not editorial groupings):

| Link | Target | Purpose |
|------|--------|---------|
| **AI Ethics** | `/ai-ethics` | Compliance + editorial stance (SUG-61 shipped) |
| **Privacy & Terms of Use** | `/privacy-and-terms` | Legal boilerplate |
| **Sitemap** | `/sitemap` | Site structure reference (SUG-15 shipped) |
| **Contact** | `/contact` | Conversion surface (also in CTA treatments) |

Social icons stay in the brand zone. No column headers needed — the 4 links are self-labelling and visually flat.

This removes the "which column does X go in" debate and keeps the footer scan-able in a single horizontal row.

### Colophon strip

Three label-value areas + copyright line:

- **VERSION** — injected from CHANGELOG.md latest heading (e.g., `v0.21.2`). Falls back to package.json.
- **TOOLCHAIN** — array of `tool` document chips. Light mode: pink chips. Dark mode: lime chips. Each chip links to `/tools/:slug`. Curated via siteSettings → Footer → Toolchain.
- **LICENSE** — authored string + optional link (e.g., "Content CC BY-NC 4.0 · Code MIT")
- **BUILT** — injected UTC build date (e.g., `2026-04-15`)
- Copyright line below, smaller

All labels in Courier Prime uppercase mono (matches the SUG-52 label token system).

---

## Open Decisions

- [ ] **Utility row layout** — inline single row (proposed) vs 2 short columns (Legal / Site). Proposal: inline flat row, scan in one glance.
- [ ] **Social position — brand zone or separate row?** Proposal: top brand zone. Alternative: keep its own column.
- [ ] **License text** — what IS the license? Suggestions:
  - Content: CC BY-NC 4.0 (non-commercial sharing with attribution)
  - Code: MIT (permissive)
  - Or: All Rights Reserved (no license — current state)
- [ ] **Build date format** — `2026-04-15` (ISO) or `April 15, 2026` or `Apr 15 2026`? Proposal: ISO UTC for compactness.
- [ ] **Version prefix** — `v0.21.2` or `0.21.2`? Proposal: `v` prefix.
- [ ] **Toolchain chips** — which `tool` docs to include? Candidates: Claude Code, Sanity, React, Storybook, Netlify. Bex configures in Studio under siteSettings → Footer → Toolchain after Phase 1 deploys.

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-65-footer-reset.md` to `docs/shipped/SUG-65-footer-reset.md`
2. Confirm clean tree
3. Run `/mini-release`
4. Transition SUG-65 to Done in Linear
