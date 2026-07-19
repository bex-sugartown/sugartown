**Linear Issue:** [SUG-73](https://linear.app/sugartown/issue/SUG-73/dynamic-knowledge-graph-force-directed-viz-on-knowledge-graph-sanity)
**Status:** Phase 0 CSV audit ✅ shipped · Phase 0.5 Visual Mock ✅ signed off (2026-04-25) · Phase 1 ✅ shipped (2026-04-25) · Phase 2 ✅ shipped (2026-04-25) · Phase 3 unblocked
**Route:** `/knowledge-graph` (existing archive, add graph view)
**Merge strategy:** merge-as-you-go (one phase per commit batch)
**Created:** 2026-04-19

---

## Phase 0.5 Hard-Stop

**No code in `apps/web/src/`, `packages/design-system/src/`, or `scripts/stats/` may be written until:**

1. The HTML mock exists at `docs/drafts/SUG-73-knowledge-graph-mock.html`
2. The edge-semantic option (A / B / C) has been explicitly chosen by Bex
3. The Phase 0.5 decision table is complete (see Phase 0.5 deliverable below)
4. Bex has reviewed the mock and approved Phase 0.5

Phase 0.5 produces the visual contract and the locked decisions for Phases 1–4. Do not begin Phase 1 without that sign-off.

---

## Model & Mode [REQUIRED]

> Use Claude Code's `opusplan` alias for this epic. Opus handles planning
> (Pre-Execution Gate → Files to Modify), Sonnet handles execution
> (code changes, migration runs, acceptance tests). The handoff is automatic
> when you exit plan mode.
>
> **Session setup:**
> 1. `/model opusplan` — set once at session start
> 2. `Shift+Tab` until status bar reads "plan mode"
> 3. Paste this epic as the first prompt
> 4. Review Opus's plan against the gates below; push back until aligned
> 5. Exit plan mode (`Shift+Tab`) — Sonnet takes over for execution
>
> **Override rule:** if Sonnet stalls during execution on something that's
> architectural rather than mechanical (e.g. an unexpected cross-workspace
> type error, a token cascade that isn't resolving), type `/model opus`
> for that single question, then `/model opusplan` to return. Note the
> override in the epic's post-mortem so we learn where Sonnet's ceiling is.
>
> **When to deviate from opusplan:**
> - Pure copy/content epics (no code): use `/model sonnet` — no planning depth needed
> - Pure architecture epics (Schema ERD, SSR strategy, monorepo boundary changes): use `/model opus` — execution benefits from sustained depth too

---

## Context — historic baseline

The WP-era POC (see `repos/sugartown-cms/docs/knowledge-graph-project/`) shipped a Python + NetworkX force-directed graph rendered to SVG and injected into a WordPress node post. It proved the concept and produced the visual baseline Bex has shared:

![historic graph baseline — cyan PROJ nodes, yellow category nodes, pink node-type vertices](../briefs/reference/kg-historic-baseline.png)
*(Screenshot saved separately for reference if needed.)*

The current stack (Sanity + React + Vite) has none of that code. `/knowledge-graph` currently renders `KnowledgeGraphArchivePage.jsx` — a flat card grid. This epic revives the topology-first philosophy in the modern stack.

---

## Objective

Add a **graph view** to `/knowledge-graph`, toggleable with the existing grid. The graph is a force-directed network of `node` + `project` + `category` vertices, rendered via `react-force-graph-2d`, styled with Pink Moon tokens, fed by a build-time JSON artifact sourced from Sanity. Clicks on vertices navigate or filter. The aesthetic matches the historic POC (large project hubs, smaller category hubs, small node dots).

---

## Non-Goals

- Not a Gantt/roadmap (separate data source; different epic)
- Not the old "Skills Cloud" or "Experience Timeline" (those were Resume Factory artifacts, out of product scope)
- Not a runtime GROQ fetch from the client (build-time only; stale-on-publish acceptable)
- Not a full WebGL renderer (2d canvas is sufficient for expected node counts)
- Not a new Sanity schema (works with existing `node`, `project`, `category`, `tag` doc types)
- Not tag nodes in the graph — too many (~300 unique across current corpus); surfaced via hover tooltip + sidebar panel, linked to `/tags/:slug`

---

## Decisions (Locked)

| Decision | Resolution |
|----------|-----------|
| Placement | Grid↔graph toggle on `/knowledge-graph` (single route, two view modes) |
| Node types | `node` · `project` · `category` |
| Tags | Not graph nodes. Surface via hover tooltip + sidebar panel, link to `/tags/:slug` |
| Graph library | `react-force-graph-2d` (canvas) |
| Data pipeline | Build-time — rides SUG-67 as a new `graph` namespace |
| Priority relative to SUG-67 | Wait for SUG-67 Phase 1a. Phase 0 of this epic (CSV audit) can start now. |
| Merge strategy | Merge-as-you-go |
| Edge semantics | **Option B — membership + shared-tag proximity (dashed lateral edges, 2+ shared tags threshold)** |

---

## Edge Semantic Options — mock descriptions

Phase 0 deliverable: a static HTML mock page with all three rendered against real (or near-real) data. User picks before Phase 2 builds the production component.

### Option A — Membership only (recommended; matches historic baseline)

Each node has exactly 2 edges: one to its project, one to its category.

```
PROJ-001 ──┬── node-1
           ├── node-2
           ├── node-3 ─── Engineering & DX
           ├── node-4 ────────┤
           └── node-5 ─── Governance
```

- Visual: bipartite clusters. Projects anchor one side, categories anchor the other, nodes bridge them.
- Pros: clean, readable, matches the historic POC Bex has approved. Edge count = 2 × node count (~74 edges for 37 nodes).
- Cons: no lateral connections between nodes.

### Option B — Membership + shared-tag proximity

Option A, plus a thin dashed edge between any two nodes that share 2+ tags.

```
node-1 ┄┄┄ node-4  (share: "python", "visualization")
node-1 ┄┄┄ node-2  (share: "design system", "documentation")
```

- Visual: dense web of node-to-node edges, overlaid on bipartite backbone.
- Pros: shows lateral thinking, rewards readers who explore.
- Cons: noisy. Could hide the structural pattern underneath. Edge count scales quadratically.

### Option C — Tag-hub floating (lowest weight)

Tags render as tiny floating unlabeled nodes (no text, no click target) that nodes are force-pulled toward. Visual attractor, not a navigable vertex.

```
       [•]                 [•]
        |                   |
     node-1 ── node-4    node-2
        \                  /
         [•] ─────────── [•]
```

- Visual: clusters form around thematic centroids without explicit edges.
- Pros: visually expressive; structure emerges.
- Cons: not informative — viewers can't tell *which* tag pulled two nodes together.

**Recommendation: Option A** for MVP. Option B as a later toggle ("Show lateral connections"). Option C skipped.

---

## Phases

### Phase 0 — Data audit ✅ shipped

**Deliverable:** `apps/web/scripts/audit/export-taxonomy-csv.js`

Shipped. CSVs at `output/audit/` (gitignored). Taxonomy cleaned as part of SUG-74.

Edge-semantic option is **not** picked here — that decision moves to Phase 0.5 where the mock makes the options visual.

### Phase 0.5 — Visual Mock & POC (gated — no code until approved)

**Deliverable:** `docs/drafts/SUG-73-knowledge-graph-mock.html`

A static HTML file (no React, no build step) that renders the graph visual using SVG or Canvas 2D directly. The goal is to prove the visual language and lock decisions before a single component is written.

**The mock must show:**

| # | Surface | What to demonstrate |
|---|---------|---------------------|
| 1 | Edge option A | Bipartite layout: project hubs (large), category hubs (medium), node dots (small), 2 edges per node |
| 2 | Edge option B | Same backbone + dashed lateral edges between nodes sharing 2+ tags |
| 3 | Node colour mapping | Project = `--st-color-accent-secondary` candidate; Category = one of lime/seafoam; Node = hot pink; background = dark surface |
| 4 | Label legibility | IBM Plex Mono labels on hover-state nodes (render a few "active" nodes to test size at density) |
| 5 | Sidebar panel | Static mockup of the sidebar that appears on node click: title, project, category, tag chips, CTA |
| 6 | Toggle control | The grid↔graph segmented control — visual treatment, hover state, active state |
| 7 | Mobile fallback | The cluster list that replaces the canvas below 768px |

Use real node/project/category names from `output/audit/nodes.csv`. The graph does not need to be force-simulated — position nodes manually or with a rough radial layout. The aesthetic is what needs approval, not the physics.

**Phase 0.5 decision table — complete before sign-off:**

| Decision | Options | Chosen |
|----------|---------|--------|
| Edge semantics | A / B / C | **B — membership + shared-tag lateral edges (dashed, 2+ shared tags)** |
| Project node colour | Token candidate(s) | **`--st-graph-node-project` → `--st-color-seafoam` (#2BD4AA)** |
| Category node colour | Token candidate(s) | **`--st-graph-node-category` → `--st-color-lime` (#D1FF1D)** |
| Node dot colour | `--st-color-brand-primary` (#ff247d) confirmed? | **`--st-graph-node-item` → `--st-color-brand-primary` (#FF247D) ✅** |
| Canvas background | `--st-color-surface-inset` / dark theme surface / other | **`--st-graph-bg` → `--st-color-bg-canvas` — theme-responsive (light: #F2F2F3, dark: midnight)** |
| Light/dark mode | Single theme or theme-responsive | **Fully theme-responsive — `getComputedStyle` reads resolved token values at render; MutationObserver on `data-theme` triggers re-render** |
| Label font face | IBM Plex Mono confirmed for canvas labels? | **IBM Plex Mono confirmed ✅** |
| New tokens needed | List any net-new tokens required (blocks Phase 1 if yes) | **Yes — 6 graph Tier 3 tokens: `--st-graph-node-{project,category,item}`, `--st-graph-edge-{membership,lateral}`, `--st-graph-bg`. Ship in Phase 1 token commit before component.** |
| Sidebar breakpoint | Where sidebar collapses to bottom sheet or disappears | **<768px: graph replaced by cluster list (no sidebar); 768–1024px: sidebar below graph; ≥1024px: sidebar right rail** |

**Acceptance:** Bex reviews mock in browser, all decision table cells filled, edge option chosen, Phase 0.5 sign-off given explicitly before Phase 1 begins.

### Phase 1 — Data pipeline (blocked on Phase 0.5 sign-off + SUG-67 Phase 1a)

**Deliverable:** `scripts/stats/graph.js` collector — GROQ → `graph` namespace in `stats.json`.

```json
"graph": {
  "generatedAt": "2026-04-19T...",
  "nodes": [
    { "id": "proj-001", "type": "project", "label": "Sugartown CMS", "href": "/projects/sugartown-cms", "size": "large" },
    { "id": "cat-engineering", "type": "category", "label": "Engineering & DX", "href": "/categories/engineering-dx", "size": "medium" },
    { "id": "node-abc", "type": "node", "label": "The Great Versioning Reconciliation", "href": "/nodes/the-great-versioning-reconciliation", "size": "small", "tags": ["semver", "calver", "governance"] }
  ],
  "edges": [
    { "source": "node-abc", "target": "proj-001", "kind": "membership" },
    { "source": "node-abc", "target": "cat-engineering", "kind": "membership" }
  ]
}
```

If Option B is chosen, edge kind includes `"sharedTag"` with a `weight` field (number of shared tags).

**Acceptance:** `pnpm dev` regenerates `graph` namespace on Sanity content change (via SUG-67's webhook or dev-time refetch, whichever SUG-67 settles).

### Phase 2 — Render component

**Deliverable:** `apps/web/src/components/KnowledgeGraph/` — canvas renderer + sidebar panel.

- `KnowledgeGraph.jsx` — wraps `react-force-graph-2d`, reads `stats.graph`, custom `nodeCanvasObject` paints circles + labels per type (project: large cyan-equivalent; category: medium yellow-equivalent; node: small pink `--st-color-brand-primary`).
- Colour palette — Pink Moon tokens only. Proposed mapping:
  - `project` → `--st-color-accent-secondary` (or nearest cyan-equivalent)
  - `category` → `--st-color-accent-tertiary` (or nearest gold-equivalent)
  - `node` → `--st-color-brand-primary` (hot pink)
  - background → `--st-color-surface-inset` or theme-appropriate deep surface
  - edge → `--st-color-border-subtle`
  - Exact token names locked in Phase 0 mock pass (may need new tokens; flag SUG-68 dependency if yes).
- Typography — Courier Prime labels on hover/active state only (keeps the canvas clean until interaction).
- `KnowledgeGraphSidebar.jsx` — when a node is selected, sidebar shows title, project, category, tag list (each tag → `/tags/:slug`), action item, published date, CTA to detail page.

### Phase 3 — Interactivity + toggle

**Deliverable:** grid↔graph toggle UI on `KnowledgeGraphArchivePage.jsx`.

- Top of page: segmented control `[Grid] [Graph]`. State persisted in URL (`?view=graph`).
- Click node → sidebar populates (does NOT navigate immediately — gives hover/click a two-step affordance).
- Click project/category node → filter the archive (keep existing filter logic), switch back to grid view automatically.
- Shift-click or double-click node → navigate to `/nodes/:slug`.
- Hover → show minimal label (title only).
- Sidebar's tag chips navigate to `/tags/:slug`.

### Phase 4 — Polish

**Deliverable:** mobile fallback + a11y + SSR safety.

- Viewport `<768px`: render a simplified cluster list ("Sugartown CMS (14 nodes)" expandable to the nodes under it) instead of a squished graph. No force simulation on mobile.
- A11y: text-equivalent list always present in a visually-hidden `<nav>` for screen readers. All tooltip content is in the DOM, not just canvas-painted.
- SSR safety: `react-force-graph-2d` touches `window` on import — must be lazy-loaded via `React.lazy()` or dynamic import inside a `useEffect`. Build must not crash on SSG prerender.
- Dark/light parity: verify canvas colours render correctly in both themes (Pink Moon is primarily light-mode first; dark-mode graph may need a token swap).

---

## Reuse Audit (per CLAUDE.md Atomic Reuse Gate)

1. **Does this pattern already exist?** No graph viz in the current repo. `KnowledgeGraphArchivePage.jsx` exists and hosts the new view mode — extend, don't fork.
2. **Will this be consumed by more than one caller?** The graph component is a single-page component, but the pipeline collector feeds any future viz (e.g. `/platform` trust strip can reuse `stats.graph.nodes.length`). Passes.
3. **Is the API composable?** Graph JSON is a pure data artifact; component takes `graphData` as a prop (defaults to imported `stats.graph`); sidebar is a composable sibling. Passes.

---

## Technical Constraints

- **Build-time data.** No runtime Sanity calls from the client. Graph ships frozen.
- **SSR safety.** `react-force-graph-2d` requires `window` — lazy import only.
- **Canvas, not SVG.** Expected node count (~50–150) is within canvas comfort. SVG migration is a future option if design demands per-element CSS.
- **Token-only colour.** No hardcoded hex values. If Pink Moon lacks a suitable token, block the epic on a token addition (potential SUG-68 dependency).
- **Mobile is a fallback, not a graph.** Do not attempt to render the force simulation under 768px — the physics breaks down and the labels become illegible.

---

## Dependencies

- **SUG-74** — Taxonomy Cleanup. Must complete before Phase 1 runs GROQ against the graph data; otherwise duplicates, orphans, and misfiled items render into the visualization.
- **SUG-67 Phase 1a** — the stats pipeline must exist before Phase 1 of this epic lands. Until then, Phase 0 (CSV audit) runs standalone with its own ad-hoc `@sanity/client` invocation.
- **SUG-68** — if colour palette analysis in Phase 0 finds that Pink Moon tokens lack a distinct cyan-equivalent + gold-equivalent for project/category hubs, token additions must ship first. Flag at end of Phase 0.

---

## Acceptance Criteria

1. `pnpm run export:taxonomy-csv` produces 4 CSVs under `output/audit/` with the columns listed above.
2. Bex reviews CSVs, fixes data, picks edge-semantic option.
3. SUG-67 Phase 1a ships.
4. `stats.graph` namespace populates at build time.
5. `/knowledge-graph?view=graph` renders a force-directed network of projects, categories, nodes with the chosen edge semantics.
6. Clicking a node opens the sidebar; clicking a project/category filters the grid; sidebar tag chips link to tag archives.
7. Mobile viewport renders the fallback list, not the graph.
8. Lighthouse a11y score on `/knowledge-graph?view=graph` ≥ 95.
9. No runtime errors on SSG prerender.
10. At least one commit referencing SUG-73 on `origin/main` before Linear → Done.

---

## Rollback Plan

Each phase is an independent commit batch:

1. Phase 0 CSV export script — lives at `apps/web/scripts/audit/`; deleting is safe.
2. Phase 1 graph collector — part of SUG-67 pipeline; can be disabled by removing the collector registration.
3. Phase 2 component — `KnowledgeGraph/` directory; remove imports from archive page.
4. Phase 3 toggle — revert the archive page change; grid becomes the only view again.

`graph.json` is build-time generated; no schema migration, no data to roll back.

---

## Definition of Done

- [x] Phase 0 CSV export tool shipped (`output/audit/`)
- [x] Phase 0.5 mock at `docs/drafts/SUG-73-knowledge-graph-mock.html`; decision table complete; Bex sign-off given 2026-04-25; edge semantics locked (Option B)
- [x] Phase 1 graph collector in SUG-67 pipeline; `stats.graph` populates (2026-04-25)
- [x] Phase 2 `KnowledgeGraph` component rendering tokens-only palette (2026-04-25)
- [ ] Phase 3 grid↔graph toggle live at `/knowledge-graph?view=graph`
- [ ] Phase 4 mobile fallback + a11y + SSR-safe load verified
- [ ] Storybook stories for graph + sidebar + toggle
- [ ] Visual QA pass against the historic POC baseline screenshot
- [ ] Epic doc moved `docs/backlog/` → `docs/shipped/`
- [ ] Linear SUG-73 → Done
- [ ] Deferred stubs logged:
  - Option B toggle ("show lateral connections") if Option A shipped as MVP
  - SVG migration if canvas limits design freedom later
  - Runtime re-render on Sanity webhook (currently build-time only)

---

## References

- [SUG-67 backlog doc](SUG-67-dynamic-trust-reporting-pipeline.md) — the data pipeline this epic rides
- [Historic WP-era PRD](../../../repos/sugartown-cms/docs/knowledge-graph-project/sugartown_visualization_PRD_v2.md) — superseded but visually baseline-setting
- [Historic improvement plan](../../../repos/sugartown-cms/docs/knowledge-graph-project/knowledge_graph_improvement_plan.md) — architectural decisions informing this rewrite
- `react-force-graph` — https://github.com/vasturiano/react-force-graph
- Chrome UX Report origin data (SUG-67 `crux` namespace) — unrelated but runs on the same pipeline cadence
