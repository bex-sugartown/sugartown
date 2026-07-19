---
**Epic:** SUG-162 — Glossary Term Detail — design handoff implementation (reuse-first)
**Linear Issue:** [SUG-162](https://linear.app/sugartown/issue/SUG-162/glossary-term-detail-design-handoff-implementation-reuse-first)
**Status:** Shipped (2026-06-12)
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-162 — Glossary Term Detail — design handoff implementation (reuse-first)

Implement the proposed Term Detail design from `docs/drafts/design_handoff_TermDetail/` with strict reuse of existing DS components, anchored on `DescriptionList columns={2}` with a 2-col bordered ledger treatment for the metadata section.

## Background

Design delivered a high-fidelity handoff bundle (`README.md` + `Gap Analysis - Term Detail.html` + `Glossary.html`) for `/glossary/:slug`. The current page (refactored in SUG-35 close-out) already uses shared components (`pageStyles.entityDetailPage`, `Breadcrumb`, `SectionLabel`, `Grid`, `ContentCard`, `Chip`); the proposed design restructures the metadata zone into a single two-column DescriptionList ledger and adds new content surfaces (lead-definition treatment, citation line, abbreviation chip in the H1). The handoff was authored against partly-stale assumptions and several of its recommendations must be corrected before any code is written — that correction list is part of this epic's spec, not a discovery exercise.

**Handoff corrections (authoritative — the handoff README is wrong on these):**
1. **Framework:** the web app is Vite + React 19 + react-router-dom 7, NOT Next.js. No SSG; route already exists at `/glossary/:slug` via `GlossaryTermPage.jsx`. Use react-router `Link` (web adapter components), never raw `<a>` for internal links.
2. **URLs:** the handoff hardcodes paths (`/glossary/${slug}`, `/${ref.contentType}/${ref.slug}`). All internal URLs must go through `getCanonicalPath({ docType, slug })` per the URL Authority Rule. `ref.contentType` is NOT a URL segment (`caseStudy` → `/case-studies/...`, `person` → `/people/...`).
3. **Schema field names:** handoff says `title` / `epistemicStatus` / `extendedDefinitions` / `citation`. Actual schema: `term` (display name), `status` (values `evergreen | validated | exploring` only — no `deprecated`), `extendedDefinition` (singular, Portable Text), and no `citation` field. The `sources[]` array (`{text, url}`) is the existing citation surface.
4. **`extendedDefinitions` nested-sense structure: REJECTED, explicitly.** The handoff reverse-engineered a schema from *sample content* — one Merriam-Webster-style entry with numbered senses — and proposed a term-specific `sense/subsense` array to match it. That is shaping the schema to one document's content, the exact inversion of "shape content to the schema." `extendedDefinition` is and remains a **full-featured Portable Text block, full stop**: nested ordered lists, links, glossary annotations, code, block quotes — everything `standardPortableText` already supports. The MW-style numbered senses render as ordinary nested `ol` list blocks inside PT with zero schema work. No `extendedDefinitions` array, no `subsenses` object, no migration — not deferred, rejected.
5. **CSS class names:** the handoff proposes `.termDetailDl` and similar `term*` names — these are blocked by `pnpm validate:css-names` (content-type prefixes in page modules). Use semantic names (`.ledgerDl`, `.leadDefinition`, `.pronunciation`, etc.) and run the proposal-table gate before the first CSS edit.
6. **Definition is Portable Text, not a string:** the lead definition renders via `<PortableText>`; the pink-left-border treatment wraps the rendered output. Check DS `Blockquote` first (handoff itself says the treatment "replicates the DS Blockquote visual") — extend/use it rather than recreating its border CSS.
7. **`status` is on the schema as required-with-initialValue but legacy docs may lack it** — render guard required.

## Objective

After this epic, `/glossary/:slug` matches the handoff's Proposed panel: Breadcrumb (no term crumb), H1 with neutral abbreviation Chip, templated pronunciation (`/ … /` added by template), lead definition with Blockquote-register pink border, extended definition (PT), and a two-column bordered `DescriptionList` ledger containing Status (status Chip with dot), Related Terms (tag Chips), Used In + Related Content (type-label Chip + linked title rows), and Sources (full-width row). Layers touched: **frontend** (GlossaryTermPage + page CSS), **DS** (DescriptionList ledger support — tone/variant prop, both mirrors), **schema** (optional Phase 2: `linkedNode` reference), **Storybook** (DescriptionList ledger story). Content layer untouched.

## Component-Reuse Manifest

One row per visual element. "New" requires the written why. This table IS the epic's reuse contract — deviations during implementation are scope changes.

| Visual element | Existing component / shared class | Decision |
|---|---|---|
| Page shell | `pageStyles.entityDetailPage` | use (already in place) |
| Breadcrumb | `Breadcrumb` (web adapter) | use (already in place; remove any term crumb) |
| H1 | `pageStyles.narrativeHeading` | use (already in place) |
| Abbreviation badge | `Chip variant="status"` size **md**, neutral default (no status prop, no dot) | use — replaces bespoke `.termAbbr`; delete `.termAbbr` from page CSS + KNOWN_EXCEPTIONS. Explicit gap between H1 text and chip (design annotation 2026-06-11: "md neutral default badge, space padding between title") |
| Status eyebrow above H1 | ~~`pageStyles.detailEyebrow`~~ | **remove** — status moves exclusively into the DescriptionList Status row (design annotation 2026-06-11). No status indicator above the H1 |
| Pronunciation | retained `.termPronunciation` → rename `.pronunciation` | extend — template adds `/ … /` wrapper per handoff; rename clears validator exception |
| Lead definition | DS `Blockquote` | use — confirmed by design annotation 2026-06-11 ("definition should be styled w/ blockquote"). Activation audit narrows to: verify Blockquote's web adapter accepts PT-rendered children; `<blockquote>` semantics accepted for the cited-definition case (definitions here are quoted from sources, e.g. Merriam-Webster) |
| Extended definition | `pageStyles.detailContent` + shared PT components (`standardPortableText`) | use (already in place). Handoff's term-specific `ol` sense/subsense schema rejected — see correction #4. Verify nested `ol` rendering in the shared PT serializers covers the MW-style sample; if list nesting has a render gap, fix the serializer (shared, all PT surfaces benefit), never the schema |
| Citation line | `sources[]` rendered inside the DescriptionList Sources row | use existing field — no new `citation` schema field |
| Metadata ledger | `DescriptionList columns={2}` (DS + web adapter, `.item/.term/.detail` structure) | extend — add ledger borders via DS prop (see Technical notes), not page-CSS overrides |
| Status row chip | `Chip variant="status" status={term.status}` | use |
| Related Terms chips | `Chip variant="tag" href={getCanonicalPath(...)}` | use (already in place) |
| Used In / Related Content rows | type-label `Chip variant="tag"` (span) + react-router `Link` title | extend — replaces the current `Grid + ContentCard` per design direction; ContentCard NOT reused here by explicit design decision (compact ledger rows, not cards) |
| Sources list | full-width DL row, plain links | use existing `.sourcesList` styles or DL row styles |
| Inline annotation (`glossary-link`) | existing `GlossaryPage.module.css` `.glossaryLink` / popover | extend — update underline tokens to seafoam pair per handoff; popover behaviour already matches (portal, WCAG 1.4.13, coarse-pointer nav) |

## Storybook Coverage

One row per story touched by this epic. Categories follow the SUG-156 convention (Components / Patterns / Pages). Every row must render on `default` + `dark-pink-moon` before close-out — "Untested" in the dark mode column is a blocking state.

| Story | Category | New / Update | What it must show |
|---|---|---|---|
| `Components/DescriptionList` | Components | **Update** | Existing states + new `ledger` variant at `columns={2}`: column hairline, first-row rule, full-width last row; edge cases (odd item count, long values, single column below breakpoint) |
| `Components/Chip` | Components | **Update** | Neutral status chip as abbreviation badge (md, no dot, no status) added to existing variant matrix — confirm no regression to existing stories |
| `Pages/GlossaryTermDetailPage` | Pages | **New** | Production-accurate layout per SUG-156 pattern: Breadcrumb, H1 + abbreviation chip, pronunciation, Blockquote lead definition, PT extended definition (incl. nested `ol` MW-style sample), full DescriptionList ledger with realistic fixtures; states: full metadata, minimal (no abbreviation/pronunciation/sources), missing status |
| `Pages/GlossaryArchivePage` | Pages | **New** | Production-accurate archive layout: PageHeader, AlphaFilter, letter groups, definition list rows, abbreviation badges — fills the Pages/ gap left by SUG-156 (glossary shipped after that audit) |
| `Components/Blockquote` | Components | **Update (conditional)** | Only if the lead-definition use reveals a needed prop/state (e.g. cite slot); otherwise no change — note the decision either way |

Fixtures follow the SUG-156 approach: realistic content (use the Node/Counterfactual term shapes), not lorem ipsum. Fullscreen Pages/ stories bypass the global layout wrapper per the established pattern.

## Scope

- [x] **DS — DescriptionList ledger variant:** add a `ledger` (or `bordered`) prop to DS `DescriptionList` implementing the 2-col hairline treatment (column divider, first-row bottom border, full-width last row) using `--st-*` border tokens. Token-first: any new token via `tokens/source/tokens.json`. Mirror to web adapter + CSS module. — layer: DS + web adapter
- [x] **Storybook — full coverage per the table above:** DescriptionList + Chip updates, new `Pages/GlossaryTermDetailPage` + `Pages/GlossaryArchivePage` stories, conditional Blockquote update. — layer: Storybook
- [x] **Frontend — GlossaryTermPage restructure:** abbreviation Chip (md, neutral, gapped) in H1, status eyebrow removed (status lives only in DL Status row), templated pronunciation, lead definition in DS `Blockquote`, metadata zone → single `DescriptionList` (replaces SectionLabel + Grid + ContentCard sections per design). — layer: frontend
- [x] **Frontend — inline annotation token update:** `.glossaryLink` underline colors → `--st-color-seafoam-700` / hover `--st-color-seafoam-500` (verify both tokens exist; add primitives first if not). — layer: frontend
- [x] **Frontend — CSS cleanup:** rename/remove superseded classes (`.termAbbr`, `.termSection`, `.chipRow` as applicable); update `validate:css-names` KNOWN_EXCEPTIONS to match; validator runs clean. — layer: frontend + tooling
- [ ] **Phase 2 (schema, optional): `linkedNode` reference** on `glossaryTerm` + "→ View node" link render; own `feat(studio):` commit + `npx sanity schema deploy`. — layer: schema + frontend

## Phases

- **Phase 1 — DS DescriptionList ledger variant + Storybook** (ships independently; mini-release)
- **Phase 2 — GlossaryTermPage restructure + annotation tokens + CSS cleanup** (ships; mini-release)
- **Phase 3 (optional, needs go/no-go) — `linkedNode` schema field + render**

Phase 0 (mockup gate) is satisfied by the design handoff itself: `Gap Analysis - Term Detail.html` Proposed panel is the approved mock. Interaction annotations for the popover are in the handoff README (§Inline Annotation).

## Acceptance criteria

- [x] `/glossary/:slug` (e.g. `/glossary/node`) renders the Proposed-panel structure with zero new content-type-prefixed CSS classes — `pnpm validate:css-names` exits 0
- [x] `pnpm validate:tokens --strict-colors` exits 0 (no raw colors; ledger borders + seafoam underlines resolve through tokens)
- [x] Metadata zone is a single `<dl>` (DescriptionList) — verified in inspector; two columns ≥768px, single column below
- [x] Ledger borders match handoff spec: column hairline, first-row bottom rule, Sources spans full width with top rule
- [x] All internal links resolve via `getCanonicalPath()` — no literal path strings in the page diff
- [x] Status chip renders dot + label for every `status` value in the schema's `options.list` (read from schema, not memory) and renders nothing gracefully when status is absent
- [x] Abbreviation chip: size md, neutral (no dot, no status tint), uppercase, static span, visible gap between H1 text and chip
- [x] No status indicator renders above the H1 — status appears only in the DescriptionList Status row
- [x] Lead definition renders inside DS `Blockquote` (verified in inspector: `<blockquote>` element, not a styled div)
- [x] Pronunciation renders `/ nōd /` from stored `nōd` (slashes from template) — existing Sanity values audited for pre-typed slashes before ship
- [x] Every story in the Storybook Coverage table renders on `default` + `dark-pink-moon`; dark mode confirmed in Storybook, not assumed; component registry updated for any new/changed rows
- [x] `Pages/GlossaryTermDetailPage` story matches the shipped page structure (same components, same order) — drift between story and production page is a Visual QA finding
- [x] Visual QA gate: side-by-side comparison table vs `Gap Analysis - Term Detail.html` Proposed panel; "Visual QA approved" received before close-out
- [x] Open Item 1 from handoff (chip border 1.3:1 non-text contrast) logged as its own Linear issue (system token review) — not fixed locally

## Technical notes

- **Model & Mode:** `/model opusplan` — DS API change (DescriptionList prop) + page restructure warrants a planned Pre-Execution Gate; execution is mechanical after.
- **Content Write Gate:** does not fire — no Sanity content writes in Phases 1–2.
- **Ledger CSS placement decision (made now, not at activation):** the handoff supplies the ledger treatment as page-level overrides targeting DL children (`nth-child` + `[style*=…]` selectors). That approach couples page CSS to DS internals and uses a brittle attribute selector. Implement instead as a DS variant prop (`ledger`) inside `DescriptionList.module.css`, per the Variant-first rule ("a visual variation of an existing DS primitive is ALWAYS a prop"). The `[style*="grid-column"]` selector from the handoff is rejected outright.
- **Activation audits:**
  - Read `packages/design-system/src/components/Blockquote/` before deciding lead-definition approach (manifest row 6).
  - Read `DescriptionList.module.css` (both mirrors) for existing `--st-space-*` gap values before adding ledger rules.
  - `grep "seafoam-700\|seafoam-500" apps/web/src/design-system/styles/tokens.css` — confirm primitives exist before referencing.
  - Read `glossaryTermBySlugQuery` in `queries.js` — confirm projections cover `abbreviation`, `pronunciation`, `status`, `sources`, `usedIn`/`relatedContent` `_type` + `slug` for `getCanonicalPath`.
  - GROQ: `*[_type == "glossaryTerm" && defined(pronunciation)]{pronunciation}` — check for pre-typed slashes before the template adds its own.
- **Schema changes:** none in Phases 1–2. Phase 3 `linkedNode` requires `feat(studio):` commit + `npx sanity schema deploy` before any MCP/content use.
- **Upstream dependencies:** none. Chip neutral-border contrast issue (handoff Open Item 1) is deliberately out of scope — token-level fix, separate issue.

### Schema field proposal (Phase 3 only — skip if Phase 3 is cut)

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `linkedNode` (reference → node) | The knowledge-graph node where this term's meaning was worked out in practice | ref to *The Seafoam That Should Have Been Lime* | Connects controlled vocabulary to the reasoning record — glossary defines the word, the node shows the decision |

## Model & Mode [REQUIRED]

`/model opusplan` — DS primitive API change + multi-surface page restructure benefits from Opus planning; Sonnet executes after plan-mode exit.

## Non-Goals

- **`extendedDefinitions` nested sense/subsense schema** — rejected outright (not deferred): the handoff derived a schema from one sample document's MW-style content. `extendedDefinition` stays a full-featured Portable Text block; nested lists are a PT authoring concern, not a schema concern.
- **Chip neutral-border contrast fix** — handoff Open Item 1; system-level token review, own issue.
- **Glossary archive page changes** — handoff covers the detail page; archive (`/glossary`) untouched.
- **Next.js anything** — the handoff's framework assumption is wrong; no SSG work exists or is needed.
- **New `citation` schema field** — `sources[]` is the canonical citation surface (Single Field Authority).

## Related

- **Linear:** [SUG-162](https://linear.app/sugartown/issue/SUG-162)
- **Design handoff:** `docs/drafts/design_handoff_TermDetail/` (local-only; Proposed panel of `Gap Analysis - Term Detail.html` is the approved mock)
- **Predecessor:** `docs/shipped/SUG-35-glossary.md` — glossary system + reuse refactor
- **Recipe:** `docs/conventions/detail-page-recipe.md` — component vocabulary this epic must honour
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time

---

## Close-out (2026-06-12)

<!-- Chromatic: pending — VRT deferred at close-out; new/updated stories (DescriptionList ledger family incl. LedgerWithChips, Chip AbbreviationBadge, Pages/GlossaryTermDetailPage, Pages/GlossaryArchivePage) verified manually on light-pink-moon + dark-pink-moon. Run Chromatic on next batch. -->

- **Visual QA approved** 2026-06-12 (Bex) after two design-feedback rounds:
  ledger border contrast (new `--st-dl-ledger-border` → neutral-400), connected
  hairlines (gap collapsed into item padding), even-count last-row fix,
  1-col ledger support, level label→value spacing.
- **Deviation (approved):** `.termAbbr` retained for archive rows + popover —
  archive changes are a non-goal; detail page uses the neutral Chip. Validator
  exception comment updated to scope it.
- **Phase 3 (`linkedNode` reference) cut at close-out** — re-scope as its own
  issue if wanted; schema untouched, no deploy needed.
- **Handoff Open Item 1** logged as SUG-164 (chip neutral border contrast,
  system token review).
- Commits: 29320c88, dbd9594e, 11307dfe, 7dcddaeb, bd213d16, 7b3589ce, ad308396.
