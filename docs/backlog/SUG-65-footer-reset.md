# SUG-65 — Footer Reset: Colophon + IA Reorg + Version Strip

**Linear Issue:** SUG-65
**Created:** 2026-04-15
**Priority:** P3 Medium
**Carved from:** SUG-57 Academic Layer §7 (Colophon Footer)

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — extends existing `Footer.jsx` component, `siteSettings` schema, and Sanity `navigation` doc type. No new interactive patterns beyond one small external-link cluster (toolchain mentions). Nav item resolution already handled by `resolveNavLink()`.
- [ ] **Use case coverage** — single consumer: site-wide `<Footer>` on every route. No other surfaces render this content.
- [ ] **Layout contract** — three horizontal zones stacked vertically:
  1. Brand strip (logo, tagline, social) — full width, top
  2. Columns zone (3-col nav links) — full width, middle
  3. Colophon strip (copyright + version + toolchain + license) — full width, bottom
  Max-width: same as current `.container` (inherits from global container). Below 768px, columns collapse to single column, colophon wraps.
- [ ] **All prop value enumerations** — no new enum fields. Colophon data comes from `package.json` build-time injection + 3 new Sanity string fields.
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

- [ ] Add `colophon` field group to `siteSettings` schema:
  - `toolchainText` (string) — e.g., "Built with Claude Code, Sanity, React, Storybook, Netlify"
  - `licenseLabel` (string) — e.g., "Content CC BY-NC 4.0 · Code MIT"
  - `licenseUrl` (url, optional) — link to license page
- [ ] Deploy schema (`npx sanity schema deploy`)
- [ ] Backfill the siteSettings document with default values

### Phase 2 — Build-time version injection

- [ ] Vite define plugin: inject `__APP_VERSION__` from `package.json` at build time
- [ ] Inject `__BUILD_DATE__` as ISO string at build time
- [ ] Constants exposed via a small `lib/buildInfo.js` utility

### Phase 3 — Footer component rewrite

- [ ] Rewrite `Footer.jsx` with new 3-zone layout (brand / columns / colophon)
- [ ] Update `Footer.module.css` to support the new layout + Pink Moon treatment
- [ ] Update `Footer.stories.tsx` with the new structure + Snapshot composite story
- [ ] Update `queries.js` `siteSettingsQuery` to project the new colophon fields

### Phase 4 — Content authoring

- [ ] Bex approves final toolchain text, license label, social link set
- [ ] Patch the production siteSettings document with colophon values

---

## Query Layer Checklist

- [ ] `siteSettingsQuery` — add `colophon { toolchainText, licenseLabel, licenseUrl }` projection
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

Colophon uses only existing tokens — no new theme work.

---

## Non-Goals

- No marginalia, index view, running headers, bibliography, figure captions (SUG-57)
- No new nav items or IA restructure (nav IA is the source of truth)
- No footer redesign on mobile beyond the existing single-column stack
- No real-time build status widget (too much surface for too little signal)

---

## Technical Constraints

**Studio schema**
- `colophon` lives inside the existing `footer` field group in siteSettings.
- All three new fields are plain `string` + `url`. No new object types. No migration required (backfilling the existing singleton document is trivial).

**Build-time version injection**
- Vite's `define` option replaces `__APP_VERSION__` and `__BUILD_DATE__` at build time. Values read from `package.json` and `new Date().toISOString()` in `vite.config.js`.
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
- `apps/web/vite.config.js` — add define for `__APP_VERSION__` + `__BUILD_DATE__`
- `apps/web/src/lib/buildInfo.js` — CREATE, exports version + build date constants
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

- [ ] Footer renders version string in the colophon strip (e.g., `v0.21.2`)
- [ ] Footer renders build date in the colophon strip (ISO or human-friendly)
- [ ] Footer renders toolchain text authored in Sanity
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
- [ ] **Toolchain text length** — "Built with Claude Code, Sanity, React, Storybook, Netlify" is ~50 chars. Check mobile wrap behaviour. Allow intentional line breaks via string authoring (no markdown).
- [ ] **Footer columns still rely on Sanity nav refs** — EPIC-0170 left the 4-column system in place. Reorg proposal reduces to 3 fixed columns (see Open Decisions below). This may break the navigation document's `footer` variant — audit before schema change.

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
│  [Logo]                                                   │
│  Tagline                                                  │
│  [ln] [gh] [ig] [rss]                                    │
├──────────────────────────────────────────────────────────┤
│  WORK              LIBRARY            ABOUT              │
│  Case Studies      Knowledge Graph    About              │
│  Services          Articles           CV / Resume        │
│                                       Contact            │
├──────────────────────────────────────────────────────────┤
│  VERSION    v0.21.2    TOOLCHAIN    Claude · Sanity...   │
│  LICENSE    CC BY-NC   BUILT        2026-04-15           │
│  © 2026 Sugartown Digital. All rights reserved.          │
└──────────────────────────────────────────────────────────┘
```

### Column proposal

Three columns mapped to the nav IA:

| Column | Purpose | Items |
|--------|---------|-------|
| **WORK** | Portfolio surface | Case Studies, Services |
| **LIBRARY** | Knowledge surface | Knowledge Graph, Articles |
| **ABOUT** | Identity surface | About (Overview), CV/Resume, Contact |

Social moves into the brand zone (top) so the columns zone is pure navigation. This gives each column a single editorial purpose instead of the current "whatever fit in 4 cells" arrangement.

### Colophon strip

Three label-value pairs + copyright line:

- **VERSION** — injected from package.json (e.g., `v0.21.2`)
- **TOOLCHAIN** — authored string (e.g., "Claude Code · Sanity · React · Storybook · Netlify")
- **LICENSE** — authored string + optional link (e.g., "Content CC BY-NC 4.0 · Code MIT")
- **BUILT** — injected build date (e.g., `2026-04-15`)
- Copyright line below, smaller

All labels in Courier Prime uppercase mono (matches the SUG-52 label token system).

---

## Open Decisions

- [ ] **Column count — 3 or 4?** Proposal is 3 (Work / Library / About). Alternative: 4 (Work / Library / Platform / About) if Platform ships per SUG-64.
- [ ] **Social position — brand zone or separate row?** Proposal: top brand zone. Alternative: keep its own column.
- [ ] **License text** — what IS the license? Suggestions:
  - Content: CC BY-NC 4.0 (non-commercial sharing with attribution)
  - Code: MIT (permissive)
  - Or: All Rights Reserved (no license — current state)
- [ ] **Build date format** — `2026-04-15` (ISO) or `April 15, 2026` or `Apr 15 2026`? Proposal: ISO UTC for compactness.
- [ ] **Version prefix** — `v0.21.2` or `0.21.2`? Proposal: `v` prefix.
- [ ] **Toolchain text** — authoring decision. Starter: "Built with Claude Code · Sanity · React · Storybook · Netlify". Too long? Too namecheck-y?

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-65-footer-reset.md` to `docs/shipped/SUG-65-footer-reset.md`
2. Confirm clean tree
3. Run `/mini-release`
4. Transition SUG-65 to Done in Linear
