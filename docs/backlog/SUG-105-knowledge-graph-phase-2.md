# SUG-105 — Knowledge Graph Phase 2 (graph/archive enhancements)

**Linear Issue:** [SUG-105](https://linear.app/sugartown/issue/SUG-105/knowledge-graph-phase-2-grapharchive-enhancements)
**Status:** Backlog
**Priority:** Medium
**Depends on:** SUG-81 (MVP shipped)
**Design reference:** `docs/drafts/design_handoff_site_graph/SUG-105-phase-2-handoff-notes.md`

---

## Background

SUG-81 shipped the site-wide knowledge graph MVP. Phase 2 covers masthead/kicker enhancements, filter strip color system, archive page unification, new graph features (fullscreen, tag nodes), and cleanup/a11y deferred from MVP.

---

## Scope

### 1. Masthead — eyebrow + kicker

Current masthead is the generic `archiveHeading` + `archiveDescription` pattern. Phase 2 makes it graph-aware:

- **Eyebrow** — L1 parent label ("Library"), links to `/library` or parent nav section. Mono, muted, uppercase.
- **H1** — archive page title (unchanged, "Knowledge Graph")
- **Body** — portableText description (already wired via `archivePageBySlugQuery`)
- **Kicker strip** — live stats from `statsJson.siteGraph`, right-aligned or below heading:
  - Default: `35 nodes visible · 94 edges`
  - When filtered: `18 articles visible` + `filtered: articles`
  - Updates reactively when type filter changes (derive from `graphData.nodes` / `graphData.edges`)

Phase 0 mock required for masthead kicker layout.

### 2. FilterStrip — color system for light/dark mode

Current FilterStrip uses `--chip-color` custom property from `--st-kg-node-*` tokens but lime (`--st-kg-node-node`) has contrast issues on chip text in light mode. Full color system needed:

**Legend + node color assignments (canonical):**
| Type | Token | Light mode chip treatment |
|------|-------|--------------------------|
| Project hub | `--st-color-pink` (brand pink) | — (not a chip type) |
| Category hub | softgray (`--st-color-neutral-400`) | — (not a chip type) |
| Article | `--st-color-seafoam` | seafoam-700 fg on seafoam-100 bg |
| Case Study | `--st-color-maroon` | maroon fg on maroon-tint bg |
| Node | `--st-color-lime-400` | **needs solution** — lime is illegible on white; use lime-700 fg on lime-50 bg, or dark-on-lime with border |

Each chip needs a 3-value set: `--st-kg-chip-{type}-bg`, `--st-kg-chip-{type}-fg`, `--st-kg-chip-{type}-border` — one set for light mode, one for dark. These go in `tokens.json` (dark defaults) + `theme.pink-moon.css` light overrides.

**FilterStrip kicker** (below or beside the strip):
- `45 items visible` (default all)
- `18 articles visible` (when filtered)
- Mono, 11px, muted — updates reactively

### 3. Archive page "View in graph" — icon treatment

Current "View in graph →" is a text CTA bar below the archive listing. Phase 2 replaces with an icon-forward treatment unified across `/articles`, `/case-studies`, `/nodes`. Design options to mock:

- Icon chip (graph/network icon + label) in the archive toolbar row (beside view toggle)
- Or: standalone icon button near the result count

Routes to `/knowledge-graph?type=article` (or caseStudy, node). Phase 0 mock required.

### 4. Graph pane — tag nodes on filtered graphs

When a type filter is active, optionally surface tag hub nodes connected to visible items. Allows the filtered graph to show topic clusters within a content type.

- Tag nodes render like category hubs but smaller (distinct visual weight)
- Only active when a type filter is selected (not in "All" view, which is already dense)
- New node type `"tag"` in `siteGraph` — requires `graph.js` update + `stats.json` regen
- Phase 0 required: how do tag hubs look vs category/project hubs? Are they a third hub tier?

### 5. Fullscreen / "enbiggen" mode

Icon button near the zoom +/- controls. Triggers fullscreen takeover or modal containing:
- Full graph canvas (maximised)
- FilterStrip (top)
- Card rail (right, 220px)
- Legend (bottom-left)
- Zoom controls + X/close button

Implementation options:
- (a) CSS `position: fixed` overlay (simplest, works without portal)
- (b) React portal into `document.body`
- (c) Browser Fullscreen API (`element.requestFullscreen()`)

Phase 0 mock required. Icon: `Maximize2` from lucide-react.

### 6. Rail — 'Selected' header

Add a "SELECTED" label at the top of the rail panel (mono eyebrow, always visible when a node is selected). Matches the mock State B label.

### 7. Stats pipeline cleanup

- Remove deprecated `stats.graph` (nodes-only) collector from `graph.js` and `collect-stats.js`
- Remove `stats.graph` key from `stats.json`
- Verify nothing in the codebase references `statsJson.graph` after removal

### 8. Hub node a11y

- `aria-live="polite"` region wrapping the card rail
- Keyboard focus management: node click via keyboard moves focus to rail card
- VoiceOver test pass

### 9. Chromatic VRT

- Storybook static-fixture stories for `KnowledgeGraph`, `FilterStrip` (all chip color states), `SiteGraphPage` header+filterstrip
- Storybook layout story for SiteGraphPage with PageSidebar pattern
- Chromatic baseline captured

---

## Phase 0 gate items (blocking)

Before any implementation work on items 1, 3, 4, or 5 — mock required in `docs/drafts/design_handoff_site_graph/`:

- [ ] Masthead kicker strip (node/edge count + filter state label)
- [ ] FilterStrip chip color sets — light + dark, all 4 types including lime solution
- [ ] Archive toolbar icon treatment for "View in graph"
- [ ] Tag nodes on filtered graph (visual tier)
- [ ] Fullscreen mode layout

---

## Definition of Done

- [ ] Masthead kicker shows live node/edge/filter counts
- [ ] FilterStrip chip 3-value color sets in tokens for all types; lime contrast resolved
- [ ] Archive icon treatment for "View in graph" on all three archive pages
- [ ] Tag nodes visible on filtered graphs (opt-in, filtered view only)
- [ ] Fullscreen mode implemented
- [ ] "SELECTED" rail header
- [ ] `stats.graph` deprecated collector removed
- [ ] `aria-live` on card rail + keyboard focus management
- [ ] Chromatic VRT baseline
- [ ] `pnpm validate:tokens` passes
- [ ] Linear SUG-105 → Done
- [ ] Epic doc moved to `docs/shipped/`
