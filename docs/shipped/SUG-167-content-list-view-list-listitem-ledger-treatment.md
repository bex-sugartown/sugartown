---
**Epic:** SUG-167 — Content list view — List / ListItem ledger treatment
**Linear Issue:** [SUG-167](https://linear.app/sugartown/issue/SUG-167/content-list-view-list-listitem-ledger-treatment)
**Status:** ✅ Shipped (2026-06-14)
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

> **Shipped 2026-06-14.** All 4 phases delivered. DS `List`/`ListItem` (register variant, content-agnostic; status dot supplied by the app adapter via `leading`) + web-adapter mirror + Storybook. `ContentList` app adapter (status→dot map, date format, `getCanonicalPath` href). Live everywhere a collection renders as a list: **archives** (list mode), **entity pages** (Person/Project/Tool), **taxonomy detail** (`/tags/:slug`, `/categories/:slug`). Card grid reserved for grid mode + cardbuilder + the KG single-node rail. GROQ projections extended (+categories on person/project, +status on tool) — no schema change.
> **Deviations from spec:** dark-mode hover bg uses `--st-color-lime-100` (pale wash), not the handoff's solid `lime-400` (design call). Hover row re-paints the two vertical column rules (they live on the container background, behind rows). Taxonomy detail pages added to scope. No new tokens needed (lime-100 reused).
> **Chromatic:** List has Storybook stories (both themes) but a Chromatic VRT run was not executed this session — `<!-- Chromatic: pending -->`.
> **Visual QA:** approved by Bex (reviewed light render + hover; requested dark→lime-100 and the hover vertical-rule fix, both applied).
---

# SUG-167 — Content list view — List / ListItem ledger treatment

New ledger-styled **list presentation** of a content collection (`List` / `ListItem`, `register` variant) that replaces the old card-as-list-row treatment everywhere a collection renders as a list.

## Background

Today, collections rendered as a list reuse the **card** primitive as a list row (`ContentCard`, plus the handoff's legacy `LvContentRow` / `.lv-list` prototype). There is **no dedicated list component and no grid/list view switch** in the live app — archives render through a shared `ArchivePage.jsx` using `ContentCard`; entity/detail pages (Person, Project, Tool/Platform) surface related content the same way. The design handoff at `docs/drafts/design_handoff_content_list/` introduces a slim ledger "register" row as the canonical list treatment, sibling to the card (which becomes grid-only + cardbuilder-only). Affected surfaces: every archive page, the Knowledge Graph, and the Person / Project / Tool detail pages.

## Objective

After this epic, a dedicated **`List` / `ListItem` DS component** (register variant) exists and is the single list-mode treatment across the app. Archive pages expose a grid/list/kg view switch (grid→Card, list→List, kg→KnowledgeGraph); entity/detail pages and the KG render `List` directly for related content with no switcher. Layers touched: **DS component (new)** + **CSS module (new, token-driven)** + **design tokens (audit/extend)** + **React render (archive view switch + entity-page integrations)** + **Storybook (new stories)**. Explicitly **out of scope**: Sanity **schema** changes and GROQ projection changes beyond confirming the fields the row needs already project (title, date, category, status, href). The card primitive itself is unchanged (kept for grid + cardbuilder).

## Handoff corrections (SUG-163 design-handoff gate)

Evaluated against `docs/conventions/design-handoff-template.md`. Anti-checklist findings — resolve before/within Phase 0:

1. **Invented token / collision — `--st-color-lime-100`.** The handoff claims the palette "had no lime-100 step" and proposes adding `--st-color-lime-100: #F2FFCB`. **It already exists** as `#f2ffbf` (`tokens.css` line 29). Do **not** add a colliding name. Decision needed at activation: reuse existing `--st-color-lime-100` (#f2ffbf, visually ≈ requested #F2FFCB) for the light hover surface, or — if the exact #F2FFCB is required — change the existing primitive's value via `tokens/source/tokens.json` (affects every other lime-100 consumer; audit first). Default: **reuse existing lime-100**.
2. **Invented enum value — `active`.** The handoff `StatusKey` lists `validated | active | evergreen | exploring | deprecated | operationalized`. The `node` schema status enum (`apps/studio/schemas/documents/node.ts:265`) is **5 values**: `exploring, validated, operationalized, deprecated, evergreen`. There is **no `active`**. Drop `active` (and its `--st-color-seafoam-700` dot mapping) from the component's status map, or confirm it maps to an existing status. The status-dot map must be driven by the real enum.
3. **Assumed component tree that doesn't exist.** The handoff diagram (`ContentCollection ├─ grid→CardGrid→Card ├─ list→List→ListItem └─ kg→KnowledgeGraph`) describes components that are **not in the codebase**: there is no `ContentCollection`, no `CardGrid`, no `List`. Only `ContentCard` (`apps/web/src/components/`) and a DS `Card` (`packages/design-system/src/components/Card/`) exist; archives use `ArchivePage.jsx`. The view-switch wrapper is **net-new** — scope it explicitly rather than assuming it's there to extend.
4. **Content-type / page-scoped CSS class names.** The handoff markup uses BEM-ish generic names (`.list`, `.list-item`, `.list-head`, `.list-block`, `.list-dot`) and references legacy page-scoped `.lv-*` classes. Production must use **CSS-module semantic names** (no `.lv-*`, no content-type prefixes) per CLAUDE.md §CSS class pre-implementation reuse audit. The proposal table gate fires before the first CSS-module edit.
5. **`href` construction.** The component takes a pre-built `href` prop (fine). The **data adapter** that builds `ContentNode[]` must derive href via `getCanonicalPath({ docType, slug })` (URL Authority Rule) — never literal path strings.
6. **`container-type: inline-size` guardrail.** The responsive behaviour uses a container query on `.list-block`. Per CLAUDE.md §`container-type` guardrail, verify the host is not a flex child relying on flex-grow and add `width: 100%` explicitly if it is.

## Scope

- [ ] **Token audit + extension** — confirm every token the spec references resolves; add any missing **semantic aliases/primitives** before component CSS — layer: tokens (`tokens/source/tokens.json` → `pnpm tokens:build`)
- [ ] **`List` / `ListItem` DS component** (`register` variant, variant-as-prop) — layer: DS component (`packages/design-system/src/components/List/`) + web adapter if the pattern requires one
- [ ] **List CSS module** — register variant, shared rules, dotted separators (`repeating-linear-gradient`, not `border: dotted`), hover (light lime + pink title; dark solid lime), container-query responsive — layer: CSS module (semantic names, proposal table gate)
- [ ] **Status-dot map** — driven by the real `node` status enum (5 values; no `active`) — layer: component logic
- [ ] **Archive view switch** — grid/list/kg toggle on archive pages routing list→`List` (grid→existing Card path, kg→KnowledgeGraph) — layer: frontend (`ArchivePage.jsx` + collection wrapper)
- [ ] **Entity-page integrations** — Person / Project / Tool/Platform detail pages render `List` for related content (no switcher); KG related content uses `List` — layer: frontend
- [ ] **Storybook stories** — default + register variant + Article rows + Node rows (status dot) + empty + long-title + light & `dark-pink-moon` — layer: Storybook
- [ ] **Retire card-as-list-row** — remove `LvContentRow` / `.lv-list` from list usage once migrated; keep Card for grid + cardbuilder — layer: cleanup

## Phases

Single long-lived branch (`bex/sug-167-…`), one mini-release at close.

1. **Tokens** — audit + add any missing semantic aliases / `lime-100` decision. Lands first so component CSS references only confirmed tokens.
2. **Component + Storybook** — `List`/`ListItem` + CSS module + status-dot map, fully covered in Storybook (both themes). The component is provable in isolation here.
3. **Archive view switch** — introduce the grid/list/kg switch + collection wrapper; list mode renders `List`.
4. **Entity + KG integrations** — wire Person/Project/Tool + KG related-content to `List`; retire card-as-list-row from those call sites.

End state of the branch: list treatment live everywhere, card reserved for grid + cardbuilder, old list-row removed.

## Acceptance criteria

- [ ] `List` renders the `register` variant pixel-matching the handoff visual spec (gutter tag 138px, title flex serif 20/600, date 96px right; header rule 2px, bottom/vertical/dotted rules 1px in `--st-color-border-medium`); verified in browser against `docs/drafts/design_handoff_content_list/listviews.html`
- [ ] Dotted row separators use `repeating-linear-gradient` (2px dot / 6px period), suppressed on last row — **not** `border: 1px dotted`
- [ ] Hover: light row tints `--st-color-lime-100`, title recolors `--st-color-pink-500` + underline, tag/date stay muted; dark (`dark-pink-moon`) row tints solid `--st-color-lime-400`, tag/date go ink, title pink
- [ ] Status dot map uses only the real node enum (exploring/validated/operationalized/deprecated/evergreen); no `active`
- [ ] Container-query responsive: ≤560px drops vertical rules and wraps to `[TYPE … DATE]` / title; verified by resizing the list inside a narrow entity column (not just the viewport)
- [ ] Archive pages expose grid/list/kg switch; list mode renders `List`; grid mode unchanged
- [ ] Person / Project / Tool/Platform detail pages and KG render `List` for related content with no switcher
- [ ] All `href`s built via `getCanonicalPath` — no literal path strings
- [ ] Every new `--st-*` token referenced resolves (`pnpm validate:tokens` zero errors); no raw color values in the CSS module (`--strict-colors` zero); any new token added via `tokens.json` + `pnpm tokens:build` with both `tokens.css` mirrors regenerated
- [ ] Storybook: stories cover default, register, Article rows, Node rows (dot), empty, long-title — rendering correctly on `default` and `dark-pink-moon`
- [ ] `LvContentRow` / `.lv-list` removed from all list call sites; Card retained for grid + cardbuilder
- [ ] No Sanity schema change; GROQ projections confirmed to already supply title/date/category/status/href (projection added only if a field is missing)

## Human QA Walkthrough — example local pages

This epic touches a new CSS module, design tokens, and a component rendered on multiple page-types (archives, Person, Project, Tool/Platform, KG) — so the walkthrough is **required**.

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic can reach (all archive page-types, Person/Project/Tool/Platform detail, Knowledge Graph, plus one unchanged detail page as a regression guard), and build the Human QA Walkthrough table (one example local URL per page-type) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it. Include the test-preview surface and one grid-mode archive as regression guards for the unchanged card path.

## Technical notes

- **Reuse audit (do this first, document in writing per Atomic Reuse Gate):** existing surfaces to check before building — `ContentCard` (`apps/web/src/components/`), DS `Card` + `DescriptionList` (`packages/design-system/src/components/`), `SectionLabel`, `Grid`, `Chip`, the chip/status patterns from the glossary work, and `pages.module.css` shared entity classes (`entityFolio`, etc.). The `List` head must **replace** the old `.lv-section__head` for content streams (the old head carried its own hairline that would double the 2px ledger rule). Document which existing components are reused and which capabilities are genuinely new (the ledger row, the dotted-rule treatment, the view switch).
- **Token activation audit (blocking, before component CSS):** grep `apps/web/src/design-system/styles/tokens.css` for each referenced token and record its resolved value. Confirmed present: `--st-color-pink-500` (#ff247d), `--st-color-maroon-600` (#b91c68), `--st-color-lime-100` (#f2ffbf — see Handoff correction 1), `--st-color-lime-400`, `--st-color-lime-700`. **Verify/likely-missing (add as semantic aliases/primitives first if absent):** `--st-color-border-medium`, `--st-color-text-primary`, `--st-color-text-muted`, `--st-color-pink` (vs `-pink-500`), `--st-color-ink`, `--st-color-amber`, `--st-color-seafoam-700`, `--st-color-softgrey-400`, `--st-font-narrative`, `--st-font-mono`. Map every spec value to an `--st-*` token; if one doesn't exist, add the primitive/alias in a separate token commit before the CSS (Token-First Rule).
- **Theme cascade audit:** before using any background token in the dark hover state, trace the `theme.pink-moon.css` dark block for glassmorphism overrides (CLAUDE.md §Theme cascade audit). The dark hover uses solid `--st-color-lime-400` (a translucent tint was tried and rejected).
- **CSS proposal-table gate:** before the first edit to a CSS-module file, produce the class-name proposal table (semantic names; no `.lv-*`, no content-type prefixes) and wait for approval.
- **Variant-first rule:** `register` is a variant prop on `List`/`ListItem`, not a new component per variant. Future variants extend the prop.
- **Mirrored-file discipline:** if the component ships as a DS primitive with a web adapter, register the CSS-module mirror pair and keep them in sync (CLAUDE.md §Mirrored File Registry).
- **No Content Write Gate / no schema deploy:** this is a frontend+tokens epic, not content or schema. GROQ is read-only here — confirm projections supply the row fields; add a projection only if a field is missing (activation audit `queries.js`).
- **Reference prototype:** `docs/drafts/design_handoff_content_list/` — `list.jsx` (contract), `assets/list.css` (visual spec). Port the contract + exact spec; do not ship the Babel prototype.

## Model & Mode [REQUIRED]

`/model opusplan` — multi-layer epic (new DS component, token graph, CSS module, multi-page React integration, view-switch architecture). Opus plans the Pre-Execution Gate (reuse audit, token audit, view-switch design, Files to Modify); Sonnet executes phase-by-phase after plan-mode exit. Not pure content (rules out sonnet); not pure architecture (rules out opus).

## Non-Goals

- **No Sanity schema changes** — the row reads existing fields (title, date, category, status, href); no new fields, no deploy.
- **No GROQ rewrite** — confirm existing projections supply the row fields; add a projection only if one is genuinely missing.
- **Card primitive unchanged** — Card stays for grid mode + cardbuilder; only its use *as a list row* is retired.
- **No new list variants beyond `register`** — variant prop is built to extend, but only `register` ships now.
- **KnowledgeGraph (kg) view itself unchanged** — this epic wires the switch to it, it does not redesign the graph view.

## Related

- **Linear:** [SUG-167](https://linear.app/sugartown/issue/SUG-167/content-list-view-list-listitem-ledger-treatment)
- **Design handoff:** `docs/drafts/design_handoff_content_list/` (local-only draft — README, `list.jsx`, `assets/list.css`, integrated demo `listviews.html`)
- **Handoff convention:** `docs/conventions/design-handoff-template.md` (SUG-163 gate)
- **Detail-page recipe:** `docs/conventions/detail-page-recipe.md`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Component-Reuse Manifest, and Files to Modify at activation time
