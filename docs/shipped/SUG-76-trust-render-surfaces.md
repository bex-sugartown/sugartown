# SUG-76 — Trust Data Render Surfaces

**Linear Issue:** [SUG-76](https://linear.app/sugartown/issue/SUG-76/trust-data-render-surfaces-footer-version-platform-hero-interrupter)
**Upstream dependency:** SUG-67 (Done) — pipeline data at `apps/web/src/generated/stats.json`
**Priority:** High
**Merge strategy:** merge-as-you-go (one surface per phase, each ships independently)
**Phase 0 gate:** HTML mock required before any JSX.

---

## Context

SUG-67 built the build-time stats aggregator. The data exists. This epic wires it into the UI across four surfaces. The pipeline runs at `pnpm build` and outputs `apps/web/src/generated/stats.json` — imported statically by the web app, zero runtime cost.

Current available data (2026-04-23 sample):

```json
release.current.version       "0.22.2"
release.current.date          "2026-04-22"
release.current.descriptor    "Pink Moon design system implementation..."
release.latestN               [5 recent releases]
ds.tokens.total               593
ds.componentFiles             21
storybook.stories             5
repo.commits                  688
repo.epicsShipped             64
security.vulnerabilities.total  0
sanity.counts.article         8
sanity.counts.node            45
sanity.counts.caseStudy       7
```

Perf (Lighthouse) and CrUX are stale — no CI run yet, no API key. Trust strip tiles for those fields show `—` until live. Security is live: 0 vulnerabilities.

---

## Surfaces

### Surface 1 — Footer version badge

One line in the footer: the current semver sourced from `stats.release.current.version`. Courier/IBM Plex Mono, label weight, muted tone. Format: `v0.22.2`.

**Implementation:** Import `stats.json`, render `stats.release.current.version` in the footer's existing metadata row. No new component needed — extend the existing Footer.

---

### Surface 2 — Platform hero stat rail

**The interrupter.** A narrow monospace readout row sitting directly below the release note descriptor inside the existing `/platform` hero card. Sources from `stats.json` — not Sanity, not hardcoded.

**Design direction:**

```
COMMITS 688  ·  TOKENS 593  ·  EPICS 64  ·  VULNS 0  ·  v0.22.2
```

- Font: IBM Plex Mono, `var(--st-label-size)`, `var(--st-label-weight)`
- Color: `var(--st-color-brand-primary)` (hot pink) for the numbers, `var(--st-color-fg-muted)` for labels and dots
- Separator: ` · ` (middle dot, not em dash)
- Layout: single flex row, `gap: var(--st-space-3)`, `flex-wrap: wrap` for narrow viewports
- No border, no card — raw type sitting on the hero surface

This lives inside the existing hero glassmorphism card, below the descriptor line. The version is already there as a heading — the stat rail is the proof below it.

**Fields to show (in order):**
1. `COMMITS {repo.commits}`
2. `TOKENS {ds.tokens.total}`
3. `EPICS {repo.epicsShipped}`
4. `VULNS {security.vulnerabilities.total}` — show in `--st-color-status-success-fg` if zero
5. `v{release.current.version}`

Stale/unavailable fields (perf, crux) are omitted from the rail until live — no placeholders.

---

### Surface 3 — Platform trust strip

A full-width section on `/platform`, between the hero and the Architecture section. A row of trust signal tiles — concrete proof points, not marketing copy.

**Tile layout:** 5 tiles, equal width, responsive (2-col on mobile). Each tile:
- Label: uppercase, `var(--st-label-size)`, `var(--st-color-fg-muted)`
- Value: large, IBM Plex Mono, `var(--st-font-heading-3)` size, `var(--st-color-fg-primary)`
- Accent: hot pink underline or left border on the value

**Tile content:**

| Label | Value source | Notes |
|-------|-------------|-------|
| Epics shipped | `repo.epicsShipped` | Static, always live |
| DS tokens | `ds.tokens.total` | Static, always live |
| Components | `ds.componentFiles` | Static, always live |
| Vulnerabilities | `security.vulnerabilities.total` | 0 shown as `0 ✓` in success color |
| Lighthouse perf | `perf.performance` | Shows `—` until Lighthouse CI wired |

When `perf.stale === true`, the Lighthouse tile renders `—` with a tooltip/label `"CI run pending"`.

**No new section type needed** — this can be implemented as a `statsStripSection` or wired directly into the `/platform` page template. Decision at Phase 0 mock review.

---

### Surface 4 — Homepage updates ticker

A "what's been shipping" section on the homepage. Sources from two places:
- `stats.release.latestN` (pipeline) — recent releases
- Runtime Sanity query — latest article and latest node (already available via existing `useSanityList` hooks)

**Layout direction:** A 3-column row (or stacked on mobile):

| Column | Content | Source |
|--------|---------|--------|
| Latest release | Version + descriptor + date | `stats.release.latestN[0]` |
| Latest article | Title + category + date | Sanity query (existing) |
| Latest node | Title + category + date | Sanity query (existing) |

**Design direction:** Each column is a compact card — eyebrow label (RELEASE / ARTICLE / NODE) in hot pink Courier/Mono, title in Garamond, date in muted label. No thumbnails. This is a text-only recency signal, not a featured card. Uses existing `Card` component in `density="compact"` or a new minimal variant — confirm at Phase 0.

Section heading: "Recently shipped" or "What's new" — confirm with Bex at mock review.

---

## Phase plan

| Phase | Surface | Ships as |
|-------|---------|---------|
| 0 | HTML mock — all 4 surfaces | No merge until Bex signs off |
| 1a | Footer version badge | `feat(web): surface version in footer (SUG-76)` |
| 1b | Platform hero stat rail | `feat(web): platform hero stat rail (SUG-76)` |
| 1c | Platform trust strip | `feat(web): platform trust strip section (SUG-76)` |
| 1d | Homepage updates ticker | `feat(web): homepage updates ticker (SUG-76)` |

---

## Phase 0 checklist

- [ ] Mock created at `docs/drafts/SUG-76-trust-surfaces.html`
- [ ] Footer version badge — placement, size, color confirmed
- [ ] Platform hero stat rail — field selection, color, layout confirmed
- [ ] Platform trust strip — tile count, stale-field handling confirmed
- [ ] Homepage ticker — column layout, card density, section heading confirmed
- [ ] Bex signs off — Phase 0 complete

---

## Trust element canonical links

Every trust element that displays a versioned or countable fact must link to its **canonical, non-updating home** — the permanent record, not the live feed. The link target is fixed at build time alongside the value.

| Element | Link target |
|---------|------------|
| Version number (all surfaces) | `https://github.com/bex-sugartown/sugartown/blob/main/CHANGELOG.md` |
| Epics shipped count | `https://github.com/bex-sugartown/sugartown/blob/main/CHANGELOG.md` |
| DS tokens / component count | Storybook deployment URL (TBD) |
| Vulnerabilities | `https://github.com/bex-sugartown/sugartown/security` |
| Lighthouse perf score | Lighthouse CI report URL (TBD — when CI is wired) |
| Commits count | `https://github.com/bex-sugartown/sugartown/commits/main` |

**Rule:** the link is always the document or page that *doesn't change* as the number changes — the audit trail, not the dashboard. `v0.22.2` links to `CHANGELOG.md` (anchored to the heading if possible) because that's where the claim is documented. It does not link to the homepage or `/platform`.

**Implementation note:** canonical link constants belong in `apps/web/src/lib/routes.js` under a `TRUST_LINKS` export (or equivalent), not inline in components.

---

## Implementation notes

**Data import pattern:**

```js
import stats from '../generated/stats.json'
// stats.release.current.version, stats.repo.commits, etc.
```

Vite handles JSON imports natively — no loader needed. The file is regenerated at build time, so production always gets fresh data.

**Stale field guard:**

```js
const lighthouseScore = stats.perf?.stale ? null : stats.perf?.performance
// render '—' when null
```

**No new GROQ queries needed for Surfaces 1–3.** Surface 4 (homepage ticker) reuses the existing article/node list queries with `limit: 1` and `order: _createdAt desc`.
