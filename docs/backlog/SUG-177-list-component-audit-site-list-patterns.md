---
**Epic:** SUG-177 — List component audit — surface all site list patterns for DS List integration
**Linear Issue:** [SUG-177](https://linear.app/sugartown/issue/SUG-177/list-component-audit-surface-all-site-list-patterns-for-ds-list)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
**Visual:** yes (Phase 2 ledger-line changes render differently; Phase 1 is a no-new-format migration)
**Vspec:** `docs/drafts/SUG-177-ledger-lines.vspec.html` (Phase 2 only; not yet created)
---

# SUG-177 — List component audit — surface all site list patterns for DS List integration

Audit the live site for raw `<ul>`/`<ol>` list surfaces that are candidates for migration to the DS List/ListItem primitive, then produce Storybook stories covering the expanded use cases.

## Background

The DS `List`/`ListItem` primitive (shipped SUG-167) is wired for content-list archive mode via `ContentList` adapter. However, several page templates still use raw `<ul>`/`<ol>` with bespoke CSS classes: `refList`/`refRow` (GlossaryTermPage — Used In / Related Content back-refs), `sourcesList` (GlossaryTermPage — citation list), `seriesPartList` (SeriesPage — numbered episode list), `rolesList` (PersonProfilePage — work history), `socialLinks` (PersonProfilePage — icon link list), `linkList` (SitemapPage — grouped URL lists), and `enumList` (ContentModelsPage — schema enum display). These were written before the DS List primitive existed and now represent gaps between the canonical component and its actual reach on the site.

The trigger is a post-SUG-167 cleanup pass: now that the primitive exists, close the gap and use it as documentation fodder for Storybook use-case stories.

**Scope added 2026-08-05:** GlossaryTermPage additionally gets an **AI Attribution** metadata item — the glossary disclosure mechanism that `docs/glossy-prompt.md` and `docs/write-pipeline-prompt.md` §5 currently state doesn't exist — and its metadata ledger (currently `DescriptionList columns={2} ledger`, `GlossaryTermPage.jsx:246`) joins the DescriptionList→List migration scope, since this epic already touches every other list on that page.

This briefly existed as sub-issue SUG-269, cancelled the same day and absorbed here. `validate:epic-docs` (SUG-262) requires every non-Done issue to carry its own backlog doc and priority-stack row, and grants sub-issues no exemption — it never reads `parentId`. A parallel stub would have duplicated the scope below in two places, which is the drift that gate exists to prevent.

## Objective

After this epic, every site list surface that maps cleanly to the DS List/ListItem API is either migrated to the primitive or has a documented rationale for why it stays raw. The DS List Storybook story covers all confirmed use-case variants (ledger, inline chip, numbered, link, source citation). The glossary term page also carries an AI Attribution metadata item, closing the one register with no disclosure mechanism. Layers touched: frontend (page JSX + CSS), Storybook stories, docs (glossy/pipeline prompt updates); schema + GROQ only via the AI Attribution carve-out in Technical notes.

## Scope

- [ ] **Audit all raw `<ul>`/`<ol>` list surfaces** — read each file, map class name → visual pattern → List API fit (migrate / extend / keep raw), document in this epic doc — layer: frontend (read-only)
- [ ] **Migrate `refList`/`refRow` (GlossaryTermPage)** — Used In + Related Content back-ref rows (Chip + Link) to DS List/ListItem — layer: frontend
- [ ] **Migrate `sourcesList` (GlossaryTermPage)** — citation source list (text + optional `<a>`) to DS List/ListItem — layer: frontend
- [ ] **Assess `seriesPartList` (SeriesPage)** — numbered `<ol>` episode list; migrate if `<List ordered>` prop exists or extend the primitive first — layer: frontend
- [ ] **Assess `rolesList` (PersonProfilePage)** — work history items; migrate if inline variant covers it — layer: frontend
- [ ] **Assess `socialLinks` (PersonProfilePage)** — icon + text link list; likely stays raw (specialised layout) — document rationale — layer: frontend (decision)
- [ ] **Assess `linkList` (SitemapPage)** — grouped URL lists; migrate if link-list variant is added to DS List — layer: frontend
- [ ] **Assess `enumList` (ContentModelsPage)** — monospace schema enum display; likely stays raw (code context) — document rationale — layer: frontend (decision)
- [ ] **Storybook stories — expanded use cases** — add stories covering: ledger row (Chip + Link), source citation, numbered episode, link list; update existing List story if new props are added — layer: Storybook
- [ ] **AI Attribution item (GlossaryTermPage)** — add an "AI Attribution" entry to the term page metadata; mechanism (static default derived from the /glossy workflow vs. a `glossaryTerm` field + GROQ projection) decided at activation against the site convention in `PageSidebar.jsx` (commit 9daa3a12) and `write-pipeline-prompt.md` §5 — layer: frontend (+ schema/query only if the field mechanism is chosen)
- [ ] **Migrate the metadata ledger (GlossaryTermPage)** — `DescriptionList items columns={2} ledger` → DS List, per the audit's API-fit table; the Storybook `Components/List` story is the canonical usage reference; extend the primitive first if the label/value ledger fit requires it — layer: frontend + Storybook
- [ ] **Document the glossary disclosure mechanism** — update `docs/glossy-prompt.md` and `docs/write-pipeline-prompt.md` §5 (glossary bullet) once the AI Attribution item ships; both are rule-defining files, so the Instruction & Rule File Write Gate fires at execution — layer: docs

**Phase 2 — ledger-line audit (added 2026-11-25):**

- [ ] **Inventory every ledger line on the site, footer first** — for each surface record: file, selector, border width, token, resolved colour in light and dark, and the component that draws it. Starting points: `apps/web/src/components/Footer.module.css` (lines 4, 17, 104, 196 use `--st-color-border-default`), `packages/design-system/src/components/DescriptionList/DescriptionList.module.css` (`--st-dl-ledger-border`), `packages/design-system/src/components/List/List.module.css` ("ledger nod" hairlines), `Card.module.css`, `FilterBar.module.css`, `apps/web/src/components/MetadataCard.module.css`, `TrustReportSection.jsx`, `ContentList.jsx`. Surfaces not yet read are found by grep at activation — layer: frontend (read-only)
- [ ] **Explain the DescriptionList default vs ledger difference** — side by side in Storybook (`Components/DescriptionList`), naming every property that differs (colour token, weight, divider placement) — layer: Storybook (read-only)
- [ ] **Audit `Pages/TaxonomyArchivePage` Row Layout (`/tags`)** and the other archive row surfaces against the same inventory — layer: frontend (read-only)
- [ ] **Group similar line-drawing components and define the hierarchy** — a table of line tiers (for example page rule, section rule, row rule, cell rule) mapping each tier to one token, with every inventoried surface assigned a tier. Tier count and names are decided from the inventory, not before — layer: docs + tokens (proposal only)
- [ ] **Vspec for the new hierarchy** — footer before/after in light and dark, plus one row each of DescriptionList default, DescriptionList ledger, List, and the `/tags` row layout, per `docs/conventions/vspec-template.html` — layer: docs (Phase 0 gate)
- [ ] **Raise footer separation** — after vspec sign-off, change the footer lines to the tier token the hierarchy assigns, and align the other surfaces' tokens to their tiers where the vspec shows drift. Token changes go through `tokens/source/tokens.json` then `pnpm tokens:build` — layer: tokens + frontend + Storybook

**Scope added 2026-11-25 (Phase 2, ledger-line audit):** the site's ledger lines look different from one surface to the next, and the site-wide footer's grey lines are too pale to separate its sections. Storybook shows `Components/DescriptionList` default vs ledger differing, and the same drift shows on `Pages/TaxonomyArchivePage` (Row Layout, `/tags`). This phase inventories every ledger line on the site (footer first), records which component and token draws each, groups similar components, and defines a hierarchy of line weights. The footer fix is the first change out of that hierarchy.

## Phases

| Phase | Scope | Gate |
|---|---|---|
| 1 | List audit → migrate confirmed surfaces → Storybook stories (the first 12 Scope items) | none |
| 2 | Ledger-line audit → hierarchy → footer fix (the six items under "Phase 2" in Scope) | Phase 0 vspec sign-off before any CSS or token change |

Phase 2 starts after Phase 1 merges. Phase 1 keeps its single-phase shape internally: audit → migrate → stories → close-out.

## Acceptance criteria

- [ ] Every raw `<ul>`/`<ol>` surface in `apps/web/src/pages/` is documented in the audit table (migrate / extend / keep raw + rationale)
- [ ] All "migrate" decisions are implemented and the bespoke CSS classes removed
- [ ] "Extend" decisions either land a new prop on DS List or are deferred to a follow-on with a Linear issue linked
- [ ] "Keep raw" decisions have a written rationale in this doc (e.g. "specialised icon layout, no DS fit")
- [ ] DS List Storybook story covers all confirmed use-case variants; Chromatic Build passes
- [ ] No regression on pages that already use ContentList (archive list-view)
- [ ] `pnpm validate:tokens` and `pnpm validate:style-mirror` pass; zero hardcoded color violations
- [ ] AI Attribution renders on `/glossary/:slug` term pages via the mechanism decided at activation; if the field mechanism is chosen, the schema is deployed and MCP writes succeed
- [ ] `docs/glossy-prompt.md` and `docs/write-pipeline-prompt.md` §5 no longer claim glossary terms lack a disclosure mechanism (gated edit, approved diff)
- [ ] GlossaryTermPage metadata ledger renders via DS List, or carries a written keep/extend rationale in the audit table
- [ ] Phase 2: the inventory table lists every ledger line in `Footer.module.css` and every `--st-dl-ledger-border` and `--st-color-border-*` consumer found by `grep -rn "ledger\|st-color-border" apps/web/src packages/design-system/src`, each with token, resolved colour (light and dark) and owning component
- [ ] Phase 2: the hierarchy table assigns every inventoried surface to exactly one tier, and each tier maps to one token
- [ ] Phase 2: vspec signed off by Bex before any CSS or token change
- [ ] Phase 2: footer separators measure at least 3:1 against the footer background in light and dark (`pnpm validate:contrast` passes, no new allowlist entries)
- [ ] Phase 2: `pnpm validate:tokens`, `pnpm validate:style-mirror` and `pnpm tokens:build` produce no diff or errors; Chromatic build approved or deferral annotated; "Visual QA approved" received

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic can reach, and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Activation audit — List primitive API:** read `apps/web/src/design-system/components/list/List.jsx` to confirm current props (`ordered`, `variant`, `spacing`, etc.) before assessing fit for each surface. Any "extend" decision requires the primitive to accept the new prop first.
- **CSS removal rule:** when a bespoke class is removed from a page, grep for it across the entire repo to confirm it has no other consumers before deleting from the CSS module.
- **No Content Write Gate** — no Sanity content changes in scope. (If the AI Attribution field mechanism is chosen and existing glossary terms need backfilled values, the gate fires for that patch — proposal table first.)
- **No schema changes, with one carve-out** — the AI Attribution item may add a `glossaryTerm` disclosure field + GROQ projection if activation decides against a static default; that path requires `npx sanity schema deploy`. Everything else in this epic remains schema-free.
- **Phase 0 check (AI Attribution):** a row inside the existing metadata ledger adopts an already-reviewed format — the gate does not fire for a plain ledger row. If activation proposes a novel visual treatment (badge, callout, icon), it does.
- **Model & Mode [REQUIRED]:** `/model opus` — multi-file frontend audit + selective migration + Storybook story additions; Opus plans the audit table + Files to Modify; Sonnet executes after plan-mode exit.

## Model & Mode [REQUIRED]

`/model opus` — audit spans multiple page files + CSS modules + DS component + Storybook; Opus builds the migration table and files-to-modify list at plan time, Sonnet executes.

## Non-Goals

- No new DS List props beyond what is needed to cover confirmed migration targets — if a surface needs a net-new primitive feature, scope that separately.
- No changes to ContentList adapter or archive-mode list rendering.
- No Sanity schema or GROQ query changes, **except** the AI Attribution carve-out above (a `glossaryTerm` disclosure field + projection, only if activation chooses the field mechanism over a static default).
- No migration of FilterBar internal `<ul>` list — FilterBar has its own controlled rendering.
- Phase 2 changes line colour, weight and token assignment only. It does not change list markup, DS List props or layout; those stay in Phase 1.
- Phase 2 does not redesign the footer's layout or content, only its separators.
- Phase 2 adds no tier or token that the inventory does not need. Raising a token value to fit one surface is not a fix; the hierarchy decides.

## Related

- **Linear:** [SUG-177](https://linear.app/sugartown/issue/SUG-177/list-component-audit-surface-all-site-list-patterns-for-ds-list)
- **Absorbed:** SUG-269 (AI Attribution item + DescriptionList→List migration) — created and cancelled 2026-08-05; its scope is carried in this doc, not tracked separately
- **Upstream:** SUG-167 (List/ListItem DS primitive, shipped v0.26.9) — prerequisite
- **Phase 2 trigger:** Storybook `Components/DescriptionList` (default vs ledger) and `Pages/TaxonomyArchivePage` Row Layout, observed 2026-11-25
- **Adjacent:** SUG-228 item 6 flags the same page's "Used In" list as off-pattern — resolve consistently with this epic's migration, not separately
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
