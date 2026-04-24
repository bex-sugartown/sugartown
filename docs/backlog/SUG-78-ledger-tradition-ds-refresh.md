# SUG-78 — Ledger Tradition DS Refresh (AB-001)

**Linear Issue:** [SUG-78](https://linear.app/sugartown/issue/SUG-78/ledger-tradition-ds-refresh-phase-0-mock-structuraltoken-decision-ab)
**Brief source:** `docs/drafts/AB-001_ledger_tradition_v2.html`
**Status:** Backlog
**Merge strategy:** merge-as-you-go — Phase 1 (token-only) and Phase 2 (structural) ship independently

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

## Phase 0 Hard-Stop

**No code in `apps/web/src/`, `packages/design-system/src/`, or `apps/web/src/design-system/` may be written until:**

1. The HTML mock exists at `docs/drafts/SUG-78-ledger-tradition-mock.html`
2. The structural/token decision table is complete (see Phase 0 Deliverable below)
3. Bex has reviewed the mock and explicitly approved Phase 0

Phase 0 produces the scope for Phase 1 and Phase 2. Do not begin either phase without that sign-off.

---

## Context

Aesthetic brief AB-001 (*The Ledger Tradition*) defines the visual philosophy for Sugartown's design system: information-governance aesthetics drawn from medieval account rolls, library card catalogs, double-entry ledgers, and statistical atlases. Structure made visible. Metadata as typography. Density as trust.

**What's already implemented:** The full Ledger Tradition font stack shipped as part of a prior pass — IBM Plex Mono (labels/metadata), DM Sans (UI/navigation), Cormorant Garamond (editorial/display). See MEMORY.md §Google Fonts Loading Rules.

**What this epic covers:** Everything the brief calls for beyond the font stack. The brief's through-lines require a systematic audit of the current component set before implementation decisions can be made — some changes will be token-only, others will require structural changes to component layout. The Phase 0 mock exists to answer that question.

**Key primitives proposed in AB-001 (not yet in tokens.css):**
- `--st-color-ink` (`#0a0f1a`) — near-black with blue undertone; proposed for body text, rules, primary UI. Relationship to existing `--st-color-charcoal` (`#1e1e1e`) and `--st-color-midnight` (`#0d1226`) needs resolution.
- `--st-color-rule-accent` — structural ruling; a cool mid-grey one step darker than the canvas, for visible dividers, folio markers, ruled grid lines. (**Note:** formerly `--st-color-gold` — that name implied warmth and was wrong for the neutral grey direction.)
- `--st-color-canvas` — cool neutral grey page field so white card/table surfaces read as elevated. Not warm; not atmospheric. The grey establishes the grid; white is the card. (**Note:** the brief's earlier `--st-color-paper` (warm off-white) was retired in v2 — the direction is neutral/cool, not paper-toned.)

---

## Objective

After this epic, the Pink Moon DS visually executes the Ledger Tradition brief — beyond fonts. Cards have visible structure, not just shadow. Metadata surfaces use the label face consistently. The archive density posture is honest. Hot pink is reserved for rubrication, not decoration. Any new palette primitives called for by the brief are added to `tokens.css` with light/dark overrides.

The split between Phase 1 (tokens/CSS) and Phase 2 (structural) is determined by Phase 0. Each phase ships and merges independently.

---

## Phase 0 Deliverable

**File:** `docs/drafts/SUG-78-ledger-tradition-mock.html`

**Render these components** in the Ledger Tradition aesthetic, using the existing token names where possible and proposing new ones where needed:

| # | Component | Current surface to reference |
|---|-----------|------------------------------|
| 1 | Content Card — article/node density | `apps/web/src/design-system/components/card/` |
| 2 | Archive grid — filter bar + card grid | `apps/web/src/pages/ArticlesArchivePage.jsx` |
| 3 | MetadataCard — field:value ruled rows | `apps/web/src/components/MetadataCard.jsx` |
| 4 | Chip / Tag | `apps/web/src/design-system/components/chip/` |
| 5 | Callout | `apps/web/src/components/Callout.jsx` (or equivalent) |
| 6 | RecentContentSection ticker | `apps/web/src/components/RecentContentSection.jsx` |
| 7 | Typography specimen | heading h1–h4, body, label, mono label, lede/italic |

**For each component, the mock must render TWO states side by side (or annotated):**
- Current state (accurate to the live component)
- Ledger Tradition treatment

**Phase 0 decision table — complete this before sign-off:**

| Component | Through-line(s) addressed | Change type | Structural? | Token/CSS only? | Proposed tokens / changes |
|-----------|--------------------------|-------------|-------------|-----------------|--------------------------|
| Content Card | Visible rules, density | ? | ? | ? | ? |
| Archive grid | Density, metadata-as-type | ? | ? | ? | ? |
| MetadataCard | Visible rules, metadata-as-type | ? | ? | ? | ? |
| Chip / Tag | Color as annotation | ? | ? | ? | ? |
| Callout | Visible rules, rubrication | ? | ? | ? | ? |
| Ticker | Visible rules, density | ? | ? | ? | ? |
| Typography | Three-face separation | ? | ? | ? | ? |

**"Structural" definition for this table:** anything that requires changing JSX element hierarchy, adding/removing DOM nodes, changing flex/grid layout contracts, or modifying component API props. Token/CSS-only means the visual change is achievable entirely through CSS custom property values.

---

## Through-Lines to Implement (from AB-001 §02)

These are the six principles from the brief. Each component in the mock should be evaluated against each applicable through-line.

**01 — The rule is visible**
Hairline rules under metadata blocks. Cards with visible borders. The grid should feel drafted, not invisible.
- Current state: cards use `--st-card-shadow` (elevation) and `--st-card-border` (often very subtle). The brief asks for explicit structure.
- Question: does making borders more visible require new token values, or new token names?

**02 — Metadata is typography**
IBM Plex Mono, uppercased, letter-spaced, small. Already in use for some label surfaces — needs audit for consistency.
- Current label tokens: `--st-label-font`, `--st-label-size`, `--st-label-weight`, `--st-label-tracking`. Are these applied to MetadataCard field names? Filter labels? Footer metadata?
- The brief says: "extend it systematically across cards, facets, filters, footers"

**03 — Templates carry across thousands of records**
Cards must be consistent in field order: metadata/eyebrow at top, title/body in middle, cross-refs at foot. Evaluate whether current Card component enforces this or allows arbitrary ordering.

**04 — Cross-reference is first-class**
Related nodes, inbound links, citation lists: treated as primary surfaces, not dumped `<ul>`. Primarily relevant to node/article detail pages — likely out of scope for this epic's Phase 2, but note if the card footer cross-ref slot is structurally absent.

**05 — Density is trust**
Archive pages: resist inflating whitespace. Evaluate current card grid gap, padding, and min-height against the mock. Note whether density changes are token-only or require layout contract changes.

**06 — The system outlives the author**
Durability concern, not a visual change. No implementation here — but new tokens added by this epic must follow the existing naming convention and both token files must stay in sync.

---

## Palette Decisions Needed in Phase 0

The brief proposes three primitives that don't yet exist. Phase 0 must resolve each before Phase 1 begins.

### `--st-color-ink`
Brief value: `#0a0f1a`. Role: body text, rules, primary UI on light surfaces.

Resolution options:
- **A)** Add as new primitive; it's meaningfully different from charcoal (`#1e1e1e`) — slightly cooler, slightly darker.
- **B)** Alias to existing `--st-color-midnight` (`#0d1226`) — very close; saves adding a token.
- **C)** Adjust `--st-color-charcoal` to `#0a0f1a` — breaking change if charcoal is used in dark mode contexts.

Decision needed at Phase 0 before adding to tokens.css.

### `--st-color-rule-accent`
Brief intent: a visible structural ruling colour — one step darker than the `--st-color-canvas` page field, used for dividers, folio markers, and ruled grid lines. Cool-neutral, no warmth.

Formerly called `--st-color-gold` in the brief's v1 palette; that name was a mistake — it implied warmth that the neutral grey direction explicitly rejects. Renamed in AB-001 v2.

Candidates: a cool mid-grey around `#a8a8b2` or `#9898a6` — visible against `#eeeef2` canvas but lighter than the main `--st-color-border-default`. Worth checking whether an existing softgrey primitive (`--st-color-softgrey-300` or `--st-color-softgrey-400`) already serves this role before adding a new token. Requires decision from Bex.

### `--st-color-canvas`
Brief intent (v2): cool neutral grey page field, so white-background cards and tables read as elevated. The grey is structural — it establishes the grid; white is the card. Not atmospheric, not warm.

This replaces the earlier `--st-color-paper` (warm off-white) proposal, which was retired when the brief moved to a neutral grey direction.

Candidates: `#F8F8FA` — this is `--st-color-softgrey-50`, already defined in `tokens.css`. The canvas token would alias the existing primitive rather than introducing a new hex value. The existing `--st-color-softgrey-50` (`#f8f8fa`) is too close to white to achieve the elevation contrast. Requires decision from Bex on exact value before adding as a primitive.

---

## Scope

### Phase 0 (Mock + Decision) — gated, no code
- [ ] Read AB-001 brief in full; cross-reference current token files and component CSS
- [ ] Build `docs/drafts/SUG-78-ledger-tradition-mock.html` with 7 component pairs (current vs Ledger Tradition)
- [ ] Complete Phase 0 decision table (structural vs token/CSS for each component)
- [ ] Resolve the three palette primitive questions (ink, gold, paper) — or flag as Bex decisions
- [ ] **Human gate:** Bex reviews mock and approves before Phase 1 begins

### Phase 1 (Token/CSS-only changes) — post Phase 0 sign-off
Scope to be finalized at Phase 0, but expected to include:
- [ ] Add resolved palette primitives to both `tokens.css` files (in sync, per token drift rule)
- [ ] Add light/dark theme overrides for any new primitives
- [ ] Tighten `--st-card-border` token values for `light-pink-moon` — more visible hairline
- [ ] Audit and add label token usage to MetadataCard, filter bar, archive facets, footer metadata rows
- [ ] Run `pnpm validate:tokens --strict-colors` — zero violations before commit
- [ ] Storybook: verify all affected components render correctly in `light-pink-moon` and `dark-pink-moon`

### Phase 2 (Structural changes) — post Phase 0 sign-off, separate epic or sub-issue
Scope TBD from Phase 0 decision table. May include:
- [ ] Card layout restructure (if Phase 0 determines field order needs enforcement)
- [ ] MetadataCard ruled-row pattern (if current layout isn't achieving the ledger row look with tokens alone)
- [ ] Archive density posture (if gap/padding changes require layout contract revision)
- [ ] Any new component slots identified in Phase 0

---

## Non-Goals

- **Fonts** — already shipped (IBM Plex Mono, DM Sans, Cormorant Garamond). Not in scope.
- **Dark mode** — dark-pink-moon gets any new token overrides as part of Phase 1, but the primary aesthetic target is `light-pink-moon`. No dark-specific redesign.
- **Costume / skeuomorphism** — per AB-001 §03 "Keep / Drop" ledger: no parchment textures, sepia grading, or typewriter effects.
- **Knowledge Graph visualization** — SUG-73 owns the graph render; this epic stops at the token and component layer.
- **Content copy** — the brief informs visual structure, not editorial copy.
- **Studio schema changes** — none required.

---

## Technical Constraints

**Token drift rule (non-negotiable)**
Both token files must be updated in the same commit:
- `apps/web/src/design-system/styles/tokens.css` (web canonical)
- `packages/design-system/src/styles/tokens.css` (DS package, used by Storybook)

Storybook loads the DS package version. A token added only to the web file will silently fall through to the dark default in Storybook — this is exactly the bug fixed in the session just before this epic was written (SUG-77 hover token drift).

**Token-first rule (non-negotiable)**
No raw hex, rgba, or hsla in any component CSS. Every new color introduced by this epic must be a named primitive in `tokens.css` before any component CSS references it.

**Two theme files to update**
`apps/web/src/design-system/styles/theme.pink-moon.css` and `packages/design-system/src/styles/theme.pink-moon.css` are maintained separately (the web version has additional Tier 3 component overrides). Both must be kept in sync for Tier 2 semantic token overrides.

**Validate before every component CSS commit**
```bash
pnpm validate:tokens          # zero undefined var(--st-*) references
pnpm validate:tokens --strict-colors   # zero hardcoded color values
```

**Storybook coverage**
Every component modified in Phase 1 or Phase 2 must have its Storybook story verified after changes. The `withTheme` decorator sets `data-theme="light-pink-moon"` by default — this is the primary verification surface.

---

## Acceptance Criteria

### Phase 0
- [ ] Mock file exists at `docs/drafts/SUG-78-ledger-tradition-mock.html`
- [ ] All 7 component pairs are present and accurately represent the current component state for the "before" column
- [ ] Phase 0 decision table is complete — every "?" resolved
- [ ] Palette primitive questions resolved or explicitly flagged as human decisions
- [ ] **Human gate:** Bex has reviewed and approved the mock

### Phase 1 (token/CSS)
- [ ] `pnpm validate:tokens` — zero errors
- [ ] `pnpm validate:tokens --strict-colors` — zero errors
- [ ] Both token files updated in the same commit (no drift)
- [ ] Storybook: all modified components render correctly with `light-pink-moon` theme active
- [ ] `data-theme="dark-pink-moon"` rendering does not regress for any modified component
- [ ] Visual QA: at least one real detail page and one archive page inspected in the browser with the changes live

### Phase 2 (structural, if triggered)
- [ ] Each structural change has its own commit with a documented root-cause in the commit message (not "updated layout")
- [ ] No double-padding regressions on detail pages (Section Layout Contract per CLAUDE.md)
- [ ] Storybook stories updated for any component whose JSX structure changed
- [ ] Mock-to-implementation comparison table produced at close-out

---

## Risks / Edge Cases

- **`--st-color-ink` resolution** — if this conflicts with charcoal in dark mode context, adding it as a new primitive is safer than adjusting charcoal. Do not rename existing primitives; add alongside and migrate references.
- **Card border visibility in dark mode** — making borders more visible in `light-pink-moon` may look too heavy in `dark-pink-moon` (borders on dark backgrounds read very differently). Set separate overrides per theme block.
- **MetadataCard label face audit** — the MetadataCard renders both via the DS Card component (for archive surfaces) and directly in detail pages. Check both consumers before changing label token application.
- **Density posture changes** — reducing card padding or grid gap affects Chromatic VRT baselines. Accept and re-baseline in Chromatic after Phase 1 ships.
- **Phase 2 scope creep** — the structural phase is deliberately deferred and TBD. Do not start scoping Phase 2 during Phase 0; scope it as a separate activity after Phase 0 sign-off.

---

## Post-Epic Close-Out

This runs twice — once for Phase 1, once for Phase 2 (if Phase 2 is executed).

1. Move epic doc to `docs/shipped/SUG-78-ledger-tradition-ds-refresh.md` only when both phases are complete
2. Confirm clean tree — `git status` must show nothing staged or unstaged
3. Run `/mini-release SUG-78 Ledger Tradition DS refresh`
4. Update Linear — transition SUG-78 to **Done**
5. Start next epic — only after mini-release commit is confirmed
