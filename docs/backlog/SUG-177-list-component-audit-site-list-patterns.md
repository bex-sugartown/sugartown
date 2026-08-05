---
**Epic:** SUG-177 — List component audit — surface all site list patterns for DS List integration
**Linear Issue:** [SUG-177](https://linear.app/sugartown/issue/SUG-177/list-component-audit-surface-all-site-list-patterns-for-ds-list)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
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

## Phases

Single phase — audit → migrate confirmed surfaces → Storybook stories → close-out.

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

## Related

- **Linear:** [SUG-177](https://linear.app/sugartown/issue/SUG-177/list-component-audit-surface-all-site-list-patterns-for-ds-list)
- **Absorbed:** SUG-269 (AI Attribution item + DescriptionList→List migration) — created and cancelled 2026-08-05; its scope is carried in this doc, not tracked separately
- **Upstream:** SUG-167 (List/ListItem DS primitive, shipped v0.26.9) — prerequisite
- **Adjacent:** SUG-228 item 6 flags the same page's "Used In" list as off-pattern — resolve consistently with this epic's migration, not separately
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
