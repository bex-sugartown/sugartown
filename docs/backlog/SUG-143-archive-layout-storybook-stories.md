---
**Epic:** SUG-143 — Archive Layout Documentation — Storybook LAYOUTS stories & glossary scoping
**Linear Issue:** [SUG-143](https://linear.app/sugartown/issue/SUG-143/archive-layout-documentation-storybook-layouts-stories-and-glossary)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-143 — Archive Layout Documentation — Storybook LAYOUTS stories & glossary scoping

Audit all archive page layout variants, produce a visual HTML mock inventory for design review, then create one Storybook LAYOUTS story per approved variant. End goal: use the stories as a spec surface to scope the layout contract for the glossary/terms page.

## Background

The site has two distinct archive rendering systems — `ArchivePage.jsx` (articles, nodes, case studies, library) and `TaxonomyArchivePage.jsx` (tags, categories, people, projects, tools) — with materially different layout structures, content widths, sidebar configurations, and toolbar states. There are at least 6–8 distinct layout configurations in production today (grid, list, graph view, flat-grid/tags, rows without filterbar, rows with filterbar) but no Storybook stories document the full-page layout contracts. The `LAYOUTS` category in Storybook exists (established in SUG-98) but has no archive stories. Before starting glossary/terms, the layout options need to be enumerated, visually inventoried, and locked so the right layout is chosen, not guessed.

## Objective

After this epic: every distinct archive layout variant has a named Storybook LAYOUTS story capturing the full page structure sans globals (masthead, footer). The stories document content width, sidebar presence, toolbar state, and list row variant for each archive type. A design review HTML mock precedes Storybook implementation and establishes the approved layout taxonomy. Glossary/terms layout scoping uses these stories as its spec surface rather than reading source code.

## Scope

- [ ] **Phase 0 — Codebase audit table:** Read all archive templates and CSS, produce a written table of every distinct layout variant with: page(s), content width token, sidebar (yes/no/220px), toolbar (yes/no), grid/list/flat-grid/graph toggle, list row variant — layer: documentation
- [ ] **Phase 0 — HTML mock:** `docs/drafts/SUG-143-archive-layout-inventory.html` — visual side-by-side of all layout variants, full-page structure sans globals, labelled with layout name and content width — layer: design/mock
- [ ] **Phase 0 — Design review gate:** Mock reviewed and approved by Bex; layout names locked before any Storybook code is written
- [ ] **Phase 1 — Storybook LAYOUTS stories:** One story per approved layout variant in `apps/storybook/.storybook/stories/` under the `LAYOUTS` category — layer: Storybook
- [ ] **Phase 1 — Story coverage:** Each story captures masthead-free full-page structure: breadcrumb, archive heading, description, toolbar (grid/list/graph toggles + count kicker), FilterBar sidebar (where applicable), content grid/list/rows at representative widths — layer: Storybook
- [ ] **Phase 2 — Glossary/terms layout scoping note:** A short written decision (in the Glossary epic doc or a new `docs/backlog/` note) citing which layout variant glossary maps to, and why — layer: documentation

## Phases

### Phase 0 — Audit + HTML mock (ships independently)
Codebase read of `ArchivePage.jsx`, `TaxonomyArchivePage.jsx`, `pages.module.css`, `TaxonomyArchivePage.module.css`. Produce the layout inventory table and HTML mock at `docs/drafts/`. Design review gate. Commit: `docs(sug-143): Phase 0 archive layout audit + HTML mock`.

### Phase 1 — Storybook LAYOUTS stories
One story file per layout variant (or a single `ArchiveLayouts.stories.tsx` with named exports per variant). All stories under `LAYOUTS` category, no globals (no Masthead/Footer wrapper). Commit: `feat(storybook): SUG-143 archive LAYOUTS stories`. Mini-release.

### Phase 2 — Glossary/terms scoping
Short written decision referencing the Phase 1 stories. Feeds directly into the glossary epic at activation. Commit: `docs(sug-143): glossary layout scoping note`. Mini-release.

## Acceptance criteria

- [ ] HTML mock at `docs/drafts/SUG-143-archive-layout-inventory.html` exists and is reviewed/approved before any Storybook code is written
- [ ] Layout inventory table accounts for every archive route: `/articles`, `/knowledge-graph`, `/case-studies`, `/library`, `/tags`, `/categories`, `/people`, `/projects`, `/tools`
- [ ] Each Storybook story renders without globals (no Masthead, no Footer) and shows the full structure: breadcrumb + heading + toolbar + content area ± FilterBar sidebar
- [ ] Stories are filed under `LAYOUTS` in Storybook sidebar, consistent with SUG-98 category conventions
- [ ] Content width is visible and labelled in each story (e.g. `--st-width-detail` 760px vs `--st-width-detail-wide` 1080px)
- [ ] Glossary/terms scoping note produced in Phase 2 with explicit layout variant choice and rationale

## Technical notes

- **Key files to read at activation:**
  - `apps/web/src/pages/ArchivePage.jsx` — articles / nodes / case-studies / library archive
  - `apps/web/src/pages/TaxonomyArchivePage.jsx` — tags / categories / people / projects / tools
  - `apps/web/src/pages/pages.module.css` — `.archiveSection`, `.archiveLayout`, `.archiveGrid`, `.archiveContent`, `.archiveGrid[data-layout="list"]`, `.graphViewLayout`
  - `apps/web/src/pages/TaxonomyArchivePage.module.css` — `.archivePage`, `.archivePageWide` (flat-grid/tags layout)
  - `apps/storybook/.storybook/stories/` — existing LAYOUTS stories for category reference

- **Known layout variants (preliminary — confirm in audit):**

  | Layout name | Route(s) | Content width | FilterBar | Toolbar | Grid/list toggle |
  |-------------|----------|---------------|-----------|---------|-----------------|
  | Content grid | /articles, /case-studies | `--st-width-detail-wide` (1080px) | Yes (220px) | Yes | Grid + List |
  | Content list | /articles, /case-studies (user toggle) | `--st-width-detail-wide` | Yes (220px) | Yes | Grid + List |
  | Node grid | /knowledge-graph | `--st-width-detail-wide` | Yes (220px) | Yes | Grid + List + Graph |
  | Graph view | /knowledge-graph, /library | `--st-width-detail-wide` | No | Yes | Graph canvas + 230px card rail |
  | Library multi-type | /library | `--st-width-detail-wide` | Yes (220px) | Yes | Grid + List + Graph |
  | Taxonomy rows | /people, /projects, /tools, /categories | `--st-width-detail` (760px) | No | No | Flat row list |
  | Taxonomy flat-grid | /tags | `--st-width-detail-wide` (1080px) | No | No | 3-col letter-bucket alpha grid |

- **Storybook LAYOUTS category:** Established in SUG-98. Existing stories in `apps/storybook/.storybook/stories/`. New archive stories should follow the same file/export naming conventions used there.

- **No Storybook server interaction:** Stories are static compositions — use mock data, not live Sanity queries. Follow the pattern of existing renderer stories (see `apps/web/src/` stories).

- **Model & Mode:** `/model opusplan` — Opus plans the audit table and story structure in plan mode; Sonnet implements after exit.

## Model & Mode [REQUIRED]

`/model opusplan` — Phase 0 audit requires reading ~4 files and producing a structured layout table; plan mode enforces the audit-before-code sequence. Sonnet implements Storybook stories after plan-mode exit.

## Non-Goals

- No changes to archive page templates or CSS (read-only audit)
- No changes to FilterBar, ContentCard, or any DS component
- No new routes or Sanity schema changes
- No mobile/responsive story variants in this epic (document desktop layouts only; responsive is a follow-up)
- No glossary/terms implementation — scoping note only, not a built page

## Related

- **Linear:** [SUG-143](https://linear.app/sugartown/issue/SUG-143/archive-layout-documentation-storybook-layouts-stories-and-glossary)
- **SUG-98** — Component gap analysis (established LAYOUTS category in Storybook)
- **SUG-104** — Listview updates (shipped the row/flat-grid taxonomy variants)
- **SUG-35** — Glossary (downstream consumer of Phase 2 scoping note)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
