**Linear Issue:** [SUG-154](https://linear.app/sugartown/issue/SUG-154/platform-kpi-benchmark-report-solo-pm-vs-team-velocity)

## EPIC SUG-154: Platform KPI Benchmark Report — Solo PM vs Team Velocity

---

## Model & Mode

Use the Opus plan-first workflow (`/model opus` + plan mode) for the planning phase. This is primarily a content/data epic with one
HTML document output and a possible Sanity page publish — no complex code architecture.
Sonnet executes.

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — no new interactive components. The deliverable is an
  updated `sugartown-kpi-dashboard.html` (static report) plus a Sanity `page` doc for
  `/platform/kpi-report` or similar. Existing `StatCard` (SUG-150) and `Form` patterns
  cover any DS surfaces needed if live data wiring is in scope. No new components.
- [ ] **Use case coverage** — the report must be readable standalone (HTML file for sharing)
  AND embeddable as a Sanity page in the `platform/` section. Both formats confirmed as
  in scope.
- [ ] **Layout contract** — the static HTML report uses the Pink Moon dark aesthetic from
  the original dashboard. The Sanity page render, if in scope, uses the existing
  `PageSections` renderer and `StatCard` from SUG-150. No new layout surface needed.
- [ ] **SUG-19 dependency reviewed** — SUG-19 (KPI Dashboard Card Family) is the long-term
  primitive for live dashboard data wiring. This epic does NOT wait on SUG-19. It produces
  the benchmark content; SUG-19 wires live data to it later. The dependency is noted
  in the epic doc so it doesn't get forgotten.
- [ ] **Industry benchmark sources confirmed** — see Industry Benchmarks section below.
  All figures must cite a named source. No invented numbers.
- [ ] **Content Write Gate** — all copy in the report is explicit, sourced, and reviewed
  by the human before any Sanity publish. The gate fires before any `patch_document_from_json`
  or `create_documents_from_json` call.

---

## Context

The original KPI dashboard (`docs/reports/sugartown-kpi-dashboard.html`) was written in
early March 2026 at **v0.14.0** — 43 days into the project. It benchmarked the "then" state
of the Sugartown platform build against industry norms for a headless CMS migration.

Since then the project has grown substantially:

- Version is now **0.26.5** (74+ tracked mini-releases past the baseline report)
- Design system has grown from **8 components** to **~40+ components** across 4 phases
  (SUG-147 through SUG-150), with a token pipeline, Storybook VRT, and component registry
- Architecture has matured: MACH stack, react-router-dom v7, Sanity Studio v5,
  Style Dictionary v5 token pipeline
- The `platform/` section exists as a live route with PlatformLayout + PlatformSidebar
- The original report cited "Redirects" as the last P0 blocker — that is now resolved

The report needs to be updated to reflect the current v0.26.x state, with fresh KPIs,
updated benchmarks, and an explicit "Solo PM + AI tooling vs 3–5 FTE team" case.

**SUG-19 dependency note:** SUG-19 (KPI Dashboard Card Family) will eventually wire live
Sanity-sourced KPI data into the `platform/` section as a data-backed page. This epic
produces the benchmark content layer. The two are sequenced: SUG-154 (content) →
SUG-19 (live data primitives) → future epic that connects both.

---

## Objective

A refreshed, publication-ready platform KPI benchmark report exists as:

1. **`docs/reports/sugartown-kpi-dashboard-v2.html`** — updated static HTML using the
   Pink Moon dark dashboard aesthetic. This is the shareable artifact and the source of
   truth for the content.
2. **A brief for the platform page** — structured content spec ready for Sanity publish
   under `/platform/kpi-report` (or an existing platform subpage), pending the human's
   decision on where it lives in the IA.

The report makes a specific, quantified, reality-grounded case:

> **A single PM with AI tooling delivered in 43–90 days what would take a 3–5 person
> team 6–18 months, at a fraction of the cost — with enterprise-grade validation
> infrastructure, a codified design system, and zero technical debt.**

All claims are backed by named industry sources and verifiable project data from
`CHANGELOG.md`, the component registry, and `stats.json`.

**No schema changes. No new GROQ queries. No renderer changes.** This is a content
and documentation epic — it produces an HTML file and a content brief. The Sanity
publish is gated on human approval.

---

## Doc Type Coverage Audit

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☑ Yes | The benchmark report may publish as a `page` doc under `/platform/kpi-report` |
| `article`   | ☐ No | Not a content article — it's a structured data report |
| `caseStudy` | ☐ No | Could be argued, but the KPI report belongs in the platform section, not portfolio |
| `node`      | ☐ No | Not a knowledge node |
| `archivePage` | ☐ No | Not an archive |

---

## Schema Field Proposal

No new fields. The report publishes as a `page` doc using existing `sections[]` with
`textSection`, `statTileSection`, and `heroSection` types already in schema. The rich
KPI table is an `htmlSection` (raw HTML) or a `statTileSection` grid — both already
supported.

If the table format requires a new `tableSection` structure, that is SUG-19 scope.
For this epic: use `htmlSection` for the benchmark table, `statTileSection` for
headline metrics.

---

## What the Report Must Establish

### The Core Claim (reality-grounded, not marketing)

| Dimension | Solo PM + AI | 3–5 Person Team | Source |
|-----------|-------------|-----------------|--------|
| Time to shippable MVP | 43 days | 90–180 days | Gartner DXP 2023–24 |
| Time to design system v1 | ~30 days | 3–6 months | Nielsen Norman Group DS Survey 2023 |
| Time to full headless migration | ~90 days (full cycle) | 6–18 months | Forrester Headless CMS TEI 2023 |
| Headcount cost equivalent | 1 FTE | 3–5 FTE × 6–18mo | Bureau of Labor Statistics, US tech compensation data |
| Release cadence | 2.3 releases/week | 0.5–1/week (team coordination overhead) | State of DevOps 2023, Google DORA metrics |
| Validator coverage | 4 automated validators | Typically none at this stage | Forrester, anecdotal |
| Design system component count | ~40 components (v0.26.5) | 20–30 for a comparable V1 | Storybook DS Survey 2023 |

### KPIs to Update From v0.14.0 Baseline

| KPI | v0.14.0 Value | v0.26.5 Value | Direction |
|-----|--------------|--------------|-----------|
| Monorepo version | 0.14.0 | 0.26.5 | ↑ |
| DS component count | 8 | ~40+ (4 phases shipped) | ↑↑ |
| Storybook stories | 8 | ~60+ (across Components/Patterns/Regions) | ↑↑ |
| Token count | ~100 | 649 defined tokens, zero violations | ↑↑ |
| Redirect status | 50% (last P0) | Resolved | ✓ |
| Release cadence | ~2.3/wk | ~3.1/wk (74+ releases ÷ ~24 weeks) | ↑ |
| Validator count | 4 | 6 (+ validate:content, validate:taxonomy) | ↑ |
| Tech debt violations | 0 | 0 (maintained) | → |
| Content migration | ~95% | 100% (post-cutover) | ✓ |
| WCAG progress | Partial | Tracked (status TBD) | → |

_Note: Component count and story count must be verified from the component registry and
Storybook before writing the report. Do not estimate — count the actual rows._

### New KPIs to Add (not in original report)

| KPI | What it measures | Why it matters |
|-----|-----------------|----------------|
| **Token pipeline coverage** | 649 tokens, Style Dictionary v5, pre-commit validation | Shows enterprise-grade DS infrastructure |
| **Chromatic VRT** | Visual regression testing in CI | Team-grade quality gate achieved solo |
| **Epic velocity** | ~74 mini-releases in ~24 weeks | Demonstrates sustained delivery cadence |
| **Platform architecture maturity** | MACH stack + Sanity v5 + React 19 + Vite 7 | Currency against industry benchmarks |
| **AI tooling multiplier** | Estimate: hours saved per epic with Claude Code | The differentiator claim requires this number |

### The AI Tooling Multiplier (must be quantified, not vague)

The report needs a specific, defensible estimate of the AI tooling contribution.
Suggested methodology:

> "A task that would take a senior engineer 4–8 hours (schema design + implementation +
> stories + registry update) was completed in 45–90 minutes with Claude Code. Across
> ~74 epics, the time multiplier is approximately 4–6× per task — equivalent to
> adding 3–5 person-hours of senior engineering capacity per working day."

Source this against:
- GitHub Copilot productivity study (McKinsey, 2023): 35–45% faster code completion
- Cursor/Claude Code anecdotal benchmarks: 3–10× for scoped implementation tasks
- Our own CHANGELOG: task complexity vs release frequency ratio

The claim must acknowledge the limits: AI amplifies a competent PM, does not replace
domain expertise, and requires careful process engineering (which Sugartown's
CLAUDE.md and morning skill embody).

---

## Scope

- [ ] **Phase 0 — Data verification** (no writing until done)
  - Count actual DS components and Storybook stories from the registry
  - Verify current token count from `tokens.css`
  - Verify epic count from `CHANGELOG.md` and `git log`
  - Verify validator count from `package.json` scripts
  - Confirm redirect status (resolved or still in flight)
- [ ] **Phase 1 — Industry benchmark refresh**
  - Compile updated benchmarks from named sources (2023–2025 data)
  - Calculate AI tooling multiplier estimate with methodology
  - Produce the "Solo PM vs Team" comparison table with source citations
- [ ] **Phase 2 — Write the HTML report**
  - Update `docs/reports/sugartown-kpi-dashboard-v2.html`
  - Keep Pink Moon dark aesthetic, same structure as original
  - Update all KPI values, add new KPIs, add AI multiplier section
  - Update version badge to v0.26.5, date to June 2026
  - Add "then vs now" comparison strip (v0.14.0 → v0.26.5)
- [ ] **Phase 3 — Platform page brief (optional, human-gated)**
  - Propose page structure for `/platform/kpi-report` or equivalent
  - Human decides whether to publish to Sanity in this epic or defer to SUG-19

---

## Query Layer Checklist

Not applicable — no new GROQ queries. The Sanity publish (Phase 3) uses existing queries.
If the platform page requires a new slug, it uses `pageBySlugQuery` which already handles
all `page` doc types.

---

## Schema Enum Audit

Not applicable — no new enum fields.

---

## Files to Modify

**Reports (create)**
- `docs/reports/sugartown-kpi-dashboard-v2.html` — CREATE (updated static dashboard)

**Docs (no change unless platform page is approved)**
- Linear — set SUG-154 to `In Progress` at activation

**Sanity (gated on human approval)**
- New `page` doc: `{ _type: 'page', slug: { current: 'kpi-report' }, ... }` under the
  `/platform/` IA — structure TBD by human. Only if Phase 3 proceeds.

---

## Non-Goals

- **No new DS components** — this epic produces content, not primitives. KPI card DS
  primitives are SUG-19 scope.
- **No new schema fields** — existing `page`, `htmlSection`, `statTileSection` cover
  the content surface.
- **No live data wiring** — the report is static HTML + optional Sanity page. Live
  Sanity-sourced KPI data (auto-updating stats) is SUG-19 scope.
- **No GROQ changes** — not applicable.
- **No Studio schema changes** — this epic does not own schema changes.

---

## Technical Constraints

**Monorepo / tooling**
- Report is a static HTML file at `docs/reports/` — no build step, no imports
- Uses inline CSS only (same pattern as the original dashboard)
- Google Fonts loaded via `<link>` in the HTML head (Cormorant Garamond, DM Sans,
  IBM Plex Mono — matching the Ledger Tradition font stack from SUG-63 Phase 1)

**Schema (Studio)**
- Not applicable for Phase 1–2. Phase 3 (Sanity page) uses existing `page` schema.
- No new section types needed.

**Query (GROQ)**
- Not applicable.

**Render (Frontend)**
- Not applicable for the static HTML report.
- If the Sanity page publishes, it renders via `RootPage.jsx` → `PageSections.jsx`
  using existing renderers. No new renderer needed.

**Content Write Gate (hard stop)**
- All content in the report is reviewed and approved by the human before any Sanity
  publish. The gate fires because content is derived from benchmark interpretation
  rather than literal user dictation.

---

## Industry Benchmark Sources

All benchmarks must cite one of these named sources (or equivalent current-year reports):

| Claim type | Source |
|-----------|--------|
| Headless CMS migration timelines | Forrester Total Economic Impact of Headless CMS 2023 |
| Design system build timelines | Nielsen Norman Group "Design System ROI" 2023; Storybook DS Survey 2023 |
| Team headcount for DXP projects | Gartner DXP Market Guide 2023–24 |
| AI productivity multiplier | McKinsey "Economic Potential of Generative AI" 2023; GitHub Copilot research 2023 |
| Release cadence benchmarks | Google DORA State of DevOps 2023 |
| Solo operator productivity | MACH Alliance Member Survey 2024; Netlify State of Web Dev 2024 |

For the AI multiplier: cite methodology explicitly ("estimated from task timing vs
industry task estimates — not from a published study") if no direct study covers
Claude Code specifically.

---

## Deliverables

1. **Verified data table** — component count, story count, token count, epic count,
   validator count all confirmed from source files (not estimated)
2. **Updated HTML dashboard** — `docs/reports/sugartown-kpi-dashboard-v2.html` with
   all KPIs reflecting v0.26.5 state, industry benchmarks cited, AI multiplier section
3. **"Then vs Now" strip** — v0.14.0 → v0.26.5 comparison showing trajectory
4. **Platform page brief** — structured content proposal for Phase 3 (human gates)

---

## Acceptance Criteria

- [ ] Every KPI value in the report is traceable to a source file (CHANGELOG, registry,
  tokens.css, package.json) or a named industry report
- [ ] No invented numbers — any estimate is explicitly labelled as an estimate with
  methodology stated
- [ ] The AI multiplier claim is sourced and reality-bounded (not "infinite leverage" marketing)
- [ ] The HTML report renders correctly in a browser without a build step
- [ ] Pink Moon dark aesthetic is maintained from the original dashboard
- [ ] Font stack matches Ledger Tradition (Cormorant Garamond, DM Sans, IBM Plex Mono)
- [ ] Industry benchmarks are 2023–2025 data (not older)
- [ ] Content Write Gate fires before any Sanity publish — human approves all copy

---

## Visual QA Gate

The HTML report is the primary deliverable. Before close-out:

1. Open `sugartown-kpi-dashboard-v2.html` in a browser and screenshot the headline
   stats strip, KPI table, and AI multiplier section
2. Compare visually to the original dashboard — consistent aesthetic, no layout breaks
3. Verify all bar animations work, stat values are legible at desktop and mobile widths

Human gate: "Visual QA approved" before the Sanity Phase 3 publish and mini-release.

---

## Risks / Edge Cases

- **Stale benchmark data** — industry reports referenced in the original (Gartner 2023–24,
  Forrester 2023) may have newer editions. Use the most current available; note the
  publication year in every citation.
- **AI multiplier is unverifiable** — the estimate is defensible but not peer-reviewed.
  Frame it as "internal estimate based on task timing comparison" — do not overstate.
- **Component count inflation** — v0.26.5 has ~40 components but some are adapters, not
  independent primitives. Report the number accurately: e.g. "31 DS primitives +
  web adapters + pattern components." Don't conflate them.
- **The report may be read by clients** — language must be polished, sourced, and free
  of internal jargon. Refer to CLAUDE.md anti-slop rules.

---

## Post-Epic Close-Out

1. Visual QA gate (human reviews HTML report in browser)
2. If Phase 3 proceeds: Content Write Gate (human approves Sanity publish)
3. Move `docs/backlog/SUG-154-platform-kpi-benchmark-report.md` → `docs/shipped/`
4. `/mini-release SUG-154`
5. Transition SUG-154 to Done in Linear
