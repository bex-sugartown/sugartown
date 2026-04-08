# KPI Dashboard Card Family: stat-card, bar-card, insight-card

**Linear Issue:** [SUG-19](https://linear.app/sugartown/issue/SUG-19/kpi-dashboard-card-family-stat-card-bar-card-insight-card-bl-03)
**Status:** Backlog
**Priority:** Low (high design ambition, post-launch)
**Date logged:** 2026-03-17 (originally BL-03)
**Epic doc created:** 2026-03-26

---

## Why Dashboard Cards

Sugartown's card system today serves one shape: **content cards** — editorial items (articles, nodes, case studies) rendered as linked cards with metadata, chips, and excerpts. The Card primitive supports three variants (`default`, `listing`, `metadata`) and two densities (`default`, `compact`), all oriented around the same content-card anatomy: title + eyebrow + excerpt + chips + footer.

A KPI dashboard surface needs a fundamentally different card anatomy:
- **Stat cards** — a single headline number (revenue, completion %, count) with trend indicator and sparkline
- **Bar cards** — a labeled horizontal bar or progress meter with current/target values
- **Insight cards** — a short narrative observation backed by a metric, e.g. "Article output is up 40% this quarter"

These are not variants of the existing Card — they're siblings. Same containment (border, radius, accent color, shadow), different guts. The question is how to extend the Card family without breaking the existing architecture or introducing a parallel component tree.

---

## Design Exploration: Three Open Questions

### Q1. New components or new variants on existing Card?

**Current Card anatomy (all three variants):**
```
┌──────────────────────────────────┐
│ [thumbnail]                      │  ← optional, variant-dependent
├──────────────────────────────────┤
│ eyebrow · category               │  ← header
│ TITLE                            │
│ excerpt / children               │  ← body
│ [chips: tools, tags]             │  ← chip rows
├──────────────────────────────────┤
│ date · nextStep · aiTool · kpi   │  ← footer
└──────────────────────────────────┘
```

**KPI card anatomy (proposed):**
```
StatCard                   BarCard                    InsightCard
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ label            │       │ label            │       │ label            │
│ ████ 1,247       │       │ ▓▓▓▓▓▓▓░░░ 72%  │       │ narrative text   │
│ ▲ +12% vs last   │       │ target: 100%     │       │ ████ 1,247 (+12%)│
│ [sparkline]      │       │ [context note]   │       │ source · date    │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

**Recommendation: New `variant` values on the DS Card primitive.**

The existing Card already has the containment shell (border, radius, shadow, accent color, hover lift). The KPI cards need different *interiors*, not different containers. Adding `variant: 'stat' | 'bar' | 'insight'` keeps the card family unified:
- Shared CSS custom properties (`--accent`, `--card-radius`, `--card-shadow`)
- Shared accessibility patterns (landmark, heading level, link target)
- Shared Storybook organization (all variants in one story file)
- The `accentColor` cascade already works — stat cards can use project colors

The `children` escape hatch on the web Card adapter proves the architecture already supports custom interiors. KPI variants formalize what `children` does ad-hoc.

### Q2. Where does dashboard data come from?

| Source | Description | Pros | Cons |
|--------|-------------|------|------|
| **A. Sanity document** | New `kpiMetric` doc type with value, target, trend fields | Editor-managed, versioned, fits CMS workflow | Manual updates, no real-time data |
| **B. Build-time computed** | `build-kpi-index.js` queries Sanity, computes aggregates (article count, avg tags/doc, etc.) | Automatic, no editor burden, always accurate | Only reflects published content, stale until deploy |
| **C. Hybrid** | Some metrics from Sanity docs (client KPIs, revenue), some computed at build time (content stats) | Best of both — manual for business metrics, automatic for content metrics | Two data paths to maintain |
| **D. External API** | Fetch from analytics, GitHub, etc. at build time or runtime | Real data | External dependencies, auth complexity, scope creep |

**Recommendation: Option C (hybrid), but start with B only.**

For the Sugartown portfolio, the most interesting dashboard metrics are content-operational:
- Total published articles / nodes / case studies
- Average tags per document (taxonomy health)
- Content freshness (% updated in last 90 days)
- Tool coverage (% of content with ≥1 tool tagged)
- Category balance (distribution across categories)

These are all computable from existing Sanity data at build time — no new schema required for Phase 1. Phase 2 adds `kpiMetric` docs for manually-authored business metrics (project outcomes, client KPIs).

### Q3. Dashboard page or embeddable section?

| Pattern | Description |
|---------|-------------|
| **A. Dedicated `/dashboard` page** | Code-driven page (like `/sitemap`, `/platform/schema`) |
| **B. `kpiDashboardSection` in section builder** | Embeddable on any page via section builder |
| **C. Both** | Dedicated page that also works as a section type |

**Recommendation: A first, then B.**

A dedicated `/dashboard` or `/platform/metrics` page is the right first surface — it's a governance tool, like the sitemap and schema ERD. Once the card components exist, wrapping them in a `kpiDashboardSection` schema is straightforward (same pattern as `cardBuilderSection`).

---

## Proposed Architecture

### Design System Layer — New Card Variants

**Three new variant values** added to `Card.tsx` / `Card.module.css`:

#### `variant="stat"` — Headline Number Card
```
Props (in addition to shared Card props):
├── label (string) — what the metric measures ("Published Articles")
├── value (string | number) — the headline number ("1,247")
├── unit? (string) — optional unit suffix ("%", "docs", "ms")
├── trend? ({ direction: 'up' | 'down' | 'flat', value: string, label?: string })
│   └── e.g. { direction: 'up', value: '+12%', label: 'vs last quarter' }
├── sparkline? (number[]) — array of values for inline mini-chart
└── accentColor — inherited, drives left border + trend arrow color
```

**Visual anatomy:**
- Label in `--st-font-size-xs` muted text (top)
- Value in `--st-font-heading-1` or larger (hero number)
- Unit suffix in `--st-font-size-sm` adjacent to value
- Trend badge: ▲/▼/— icon + percentage + comparison label
- Optional sparkline: pure CSS or inline SVG, 48px tall, no axis labels

#### `variant="bar"` — Progress/Comparison Bar Card
```
Props (in addition to shared Card props):
├── label (string) — what the bar measures ("Taxonomy Coverage")
├── current (number) — current value (0-100 for percentage, or absolute)
├── target? (number) — optional target value (renders target marker on bar)
├── max? (number) — scale max (default: 100)
├── unit? (string) — "%", "docs", etc.
├── segments? (Array<{ value: number, color?: string, label?: string }>)
│   └── for stacked/segmented bars (category distribution)
└── note? (string) — context line below bar ("Target: 100% by Q3")
```

**Visual anatomy:**
- Label in `--st-font-size-xs` (top)
- Horizontal bar: filled portion uses `accentColor` or `--st-color-brand-primary`
- Current value as text overlay or right-aligned
- Target marker: thin vertical line on the bar track
- Note in `--st-font-size-xs` muted (bottom)
- Segmented mode: multiple colored fills with hover tooltips

#### `variant="insight"` — Narrative Metric Card
```
Props (in addition to shared Card props):
├── label (string) — insight category ("Content Freshness")
├── narrative (string) — the insight sentence ("72% of articles updated in the last 90 days")
├── value? (string | number) — supporting metric
├── trend? (same as stat card)
├── source? (string) — data attribution ("Based on 142 published documents")
└── date? (string) — when computed
```

**Visual anatomy:**
- Label in `--st-font-size-xs` muted (top)
- Narrative in `--st-font-heading-4` body text (main content)
- Value + trend inline or below narrative
- Source + date in `--st-font-size-xs` muted (footer)

### Shared Anatomy Across KPI Variants

All three KPI variants share:
- **Container:** Same Card shell (border-radius, box-shadow, background, accent left-border)
- **Density:** `compact` reduces internal spacing (same as existing variants)
- **Accent color:** `--accent` custom property drives bar fills, trend arrows, sparkline color
- **Hover:** Subtle lift (same as `default` variant) — only if `href` is set
- **Dark/light theme:** All colors via tokens, no hardcoded values
- **Responsive:** Stack gracefully in CSS grid, no horizontal scroll

### CSS Module Additions

New sections in `Card.module.css`:

```css
/* KPI shared */
.kpiLabel { /* --st-font-size-xs, muted color, uppercase tracking */ }
.kpiValue { /* --st-font-heading-1, tabular-nums for alignment */ }
.kpiTrend { /* inline-flex, small icon + text, green/red/grey */ }
.kpiUnit  { /* --st-font-size-sm, adjacent to value */ }

/* variant: stat */
.variant-stat .body { /* center-aligned number stack */ }
.sparkline { /* 48px height, inline SVG, accent color stroke */ }

/* variant: bar */
.variant-bar .body { /* bar track + fill layout */ }
.barTrack  { /* full-width, 8px height, surface-subtle bg */ }
.barFill   { /* accent color, border-radius, transition width */ }
.barTarget { /* absolute-positioned thin line marker */ }

/* variant: insight */
.variant-insight .body { /* narrative text + metric inline layout */ }
```

**Token additions (if needed):**
```css
--st-kpi-trend-up: var(--st-color-status-seafoam);
--st-kpi-trend-down: var(--st-color-status-error, #ef4444);
--st-kpi-trend-flat: var(--st-color-text-muted);
--st-kpi-bar-track: var(--st-color-surface-subtle);
--st-kpi-bar-height: 8px;
--st-kpi-sparkline-height: 48px;
```

### Build Layer — `build-kpi-index.js`

Build-time script (same pattern as `build-sitemap.js`):

```
build-kpi-index.js
├── Query Sanity for all published content
├── Compute aggregate metrics:
│   ├── totalByType: { article: N, caseStudy: N, node: N }
│   ├── taxonomyHealth: { avgTagsPerDoc, avgToolsPerDoc, docsWithCategory% }
│   ├── contentFreshness: { updatedLast30d%, updatedLast90d%, staleCount }
│   ├── categoryDistribution: [{ name, count, percentage }]
│   ├── toolPopularity: [{ name, count }] (top 10)
│   └── publishingTrend: [{ month, count }] (last 6 months, for sparklines)
├── Write dist/kpi-index.json
└── Log stats
```

### Page Layer — `/platform/metrics` or `/dashboard`

Code-driven page (no Sanity doc required):

```jsx
// MetricsPage.jsx
// Lazy-loads kpi-index.json (same pattern as search index)
// Renders a CSS grid of StatCard, BarCard, InsightCard
// Grouped into sections: Content Health, Taxonomy Coverage, Publishing Velocity
```

**Dashboard layout (3-column grid on desktop, single column on mobile):**

```
┌── Content Health ─────────────────────────────────────────┐
│ [stat: Total]  [stat: Articles]  [stat: Case Studies]     │
│ [stat: Nodes]  [insight: Freshness narrative]             │
├── Taxonomy Coverage ──────────────────────────────────────┤
│ [bar: Tag coverage]  [bar: Tool coverage]                 │
│ [bar: Category distribution — segmented]                  │
├── Publishing Velocity ────────────────────────────────────┤
│ [stat: This month + sparkline]  [insight: Trend]          │
│ [bar: Content type balance]                               │
└───────────────────────────────────────────────────────────┘
```

---

## Integration with Existing Card Architecture

The three-layer card architecture (MEMORY.md §Card Component Architecture) extends cleanly:

```
DS Card (packages/design-system/)
  ├── variant: default, listing, metadata          ← existing (content)
  ├── variant: stat, bar, insight                  ← NEW (KPI)
  ↓
Web Card (apps/web/src/design-system/)
  ├── SPA navigation (Link), children, footerChildren  ← existing
  ├── KPI variants pass through — no web-specific logic needed initially
  ↓
ContentCard / MetadataCard                          ← existing (unchanged)
KpiCard (new adapter)                               ← NEW — maps kpi-index.json → Card props
  ↓
ArchivePage / TaxonomyDetailPage                    ← existing (unchanged)
MetricsPage (new)                                   ← NEW — dashboard grid
```

**Key rule:** KPI variants are Card variants, not separate components. They share the Card CSS module, the Storybook story file, and the accent color system. A `KpiCard` adapter in `apps/web/src/components/` maps data to Card props — same pattern as ContentCard.

---

## Phased Delivery

### Phase 1 — DS Card Variants (design system only)
- Add `stat`, `bar`, `insight` variants to `Card.tsx`
- CSS module additions in `Card.module.css` (both DS and web — keep in sync)
- Storybook stories for all three variants (default + compact density, with/without accent color)
- No data integration — hardcoded story props only
- _Delivers reusable DS components independently of dashboard page_

### Phase 2 — Build-Time Metrics + Dashboard Page
- `build-kpi-index.js` in build pipeline
- `useKpiIndex()` hook (lazy-load `kpi-index.json`)
- `KpiCard.jsx` adapter component
- `MetricsPage.jsx` at `/platform/metrics`
- Route registration in App.jsx + routes.js
- SeoHead with `noIndex: true` (internal governance page)

### Phase 3 — Section Builder Integration
- `kpiDashboardSection` schema in Sanity Studio
- Section renders a curated subset of KPI cards
- Embeddable on Platform page or any page via section builder
- Optional: editor picks which metrics to display from a predefined list

### Phase 4 — Manual KPI Documents
- New `kpiMetric` document type in Sanity (for business metrics, client outcomes)
- Fields: `label`, `value`, `target`, `unit`, `trend`, `narrative`, `project` reference
- Dashboard page mixes computed + authored metrics
- CardBuilderSection gains KPI card option for manual metric authoring

---

## Dependencies

- **Card architecture (EPIC-0180):** Converged — variant system is stable
- **Accent color system:** Already works — `accentColor` prop drives `--accent` custom property
- **Build-time pattern:** `build-sitemap.js` as reference
- **Token system:** May need 5-6 new `--st-kpi-*` tokens (both token files, same commit)
- **Sparkline rendering:** Pure CSS (gradient hack) or inline SVG — no charting library. If SVG, keep under 2KB per sparkline.

---

## Design Ambition Notes

This is the highest-design-ambition card work in the system. The stat card headline number should feel like a data dashboard from a design agency portfolio — large, confident, tabular-numerals, with restrained color from the accent system. The bar card should feel like a health meter, not a generic chart. The insight card bridges data and narrative — it's the card that says "here's what the numbers mean."

Visual references to explore during implementation:
- **Linear's project insights** — clean stat cards with trend indicators
- **Vercel's analytics dashboard** — minimal sparklines, bold numbers
- **Stripe's dashboard** — segmented bars, clear hierarchy
- **Notion's database dashboards** — narrative + number pairing

The Pink Moon theme variants (dark-pink-moon, light-pink-moon) should make these cards glow — translucent glass containers with neon accent sparklines.

---

## Not in Scope

- **Real-time data** — all metrics are build-time or manually authored. No WebSocket/polling.
- **Charting library** — no D3, Chart.js, or Recharts. Sparklines and bars are CSS/SVG only.
- **External integrations** — no Google Analytics, GitHub API, or third-party data sources. Pure content metrics from Sanity.
- **Editable targets in dashboard** — targets are either hardcoded or authored in Sanity docs. No inline editing on the dashboard page.
- **Export/sharing** — no PDF export, no shareable dashboard links. It's a page.

---

## Post-Epic Close-Out

1. Move `docs/backlog/SUG-19-kpi-dashboard-cards.md` → `docs/shipped/SUG-19-kpi-dashboard-cards.md`
2. Commit: `docs: ship SUG-19 KPI Dashboard Cards`
3. Run `/mini-release SUG-19 KPI Dashboard Cards`
4. Transition SUG-19 to **Done** in Linear
