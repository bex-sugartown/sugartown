---
**Epic:** SUG-248 — Formalize stat-card / card-builder content schema pattern
**Linear Issue:** [SUG-248](https://linear.app/sugartown/issue/SUG-248/formalize-stat-card-card-builder-content-schema-pattern)
**Status:** Backlog
**Priority:** 🟢 Next — high value, ready to pick up
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-248 — Formalize stat-card / card-builder content schema pattern

A structured-content-only audit (no CSS/design in scope) found three parallel tile
patterns rendered through the same `StatCard`+`Grid` primitives, with drift and
duplication across all three. This epic formalizes the pattern so the content model
matches editorial intent.

## Background

**Current state — three parallel patterns, not two.** `cardSection`/`outcomeItem`
(Studio-backed stat cluster: metric + before/after value + evidence type) and
`cardBuilderSection`/`cardBuilderItem` (Studio-backed generic composable card grid:
title/image/body/tags/tools) were always meant to be distinct — no current doc lists
them as the same pattern (`docs/conventions/component-registry.md` keeps them as
separate rows throughout). But a third, undocumented pattern exists alongside them: a
hardcoded "Artifacts" tile array (`eyebrow`/`title`/`body`/`href`) duplicated verbatim,
as a local JS const, in four platform pages (`GovernancePage.jsx`, `CmsPage.jsx`,
`DesignSystemPage.jsx`, `MonorepoPage.jsx`) — zero Sanity backing, not editable in
Studio, rendered through `StatCard` exactly like `cardSection` content is.

**Why now:** live content already shows the seam. The `ds-section-showcase` page's one
`cardSection` document still has its section `title` field literally reading
`"statTileSection — metric grid"` — the schema's pre-rename name (SUG-151 renamed
`statTileSection` → `cardSection` in code, but this one document's title field was
never re-typed). That's the most likely source of "these look like the same pattern"
on a casual read of the live page — a `cardSection` block visibly labeled with the old
type name, sitting next to a `cardBuilderSection` block. Separately, `outcomeItem.ts`'s
header comment still references a `caseStudy.outcomes[]` field and a `proofPointSection`
type that no longer exist anywhere in the schemas directory (confirmed via grep,
zero hits) — both stale leftovers from before the same rename. And a fourth pattern is
queued to join this family: `SUG-19` (backlog, not yet built) proposes a
`kpiDashboardSection` explicitly modeled "same pattern as `cardBuilderSection`" with
trend/sparkline stat cards — a live risk of forking a third near-identical stat schema
if this isn't reconciled first.

**Reference surfaces:**
- Schema: `apps/studio/schemas/sections/cardSection.ts`, `apps/studio/schemas/objects/outcomeItem.ts`, `apps/studio/schemas/sections/cardBuilderSection.ts`, `apps/studio/schemas/objects/cardBuilderItem.ts`
- Web: `apps/web/src/components/PageSections.jsx` (`StatCardSectionRenderer`), `apps/web/src/pages/platform/{GovernancePage,CmsPage,DesignSystemPage,MonorepoPage}.jsx`
- Content: 10 live `cardSection` documents (page/article/caseStudy), 4 live `cardBuilderSection` documents (all `page` type)
- Docs: `docs/conventions/component-registry.md`, `docs/backlog/SUG-19-kpi-dashboard-cards.md`

### Audit — schemas across all three layers (completed 2026-07-26)

| Pattern | Studio schema (file) | Studio item fields | Component props | Web hardcoded equivalent |
|---|---|---|---|---|
| **cardSection** (stat cluster) | `sections/cardSection.ts` — `number`, `name`, `title`, `kicker`, `items[1-4]` | `outcomeItem.ts`: `metric`\* (max 100), `valueAfter`\* (max 60), `valueBefore` (max 100), `impactStatement` (text, max 400), `evidenceType` (enum: `measured`/`estimated`/`qualitative`) | `StatCard.jsx`: `label, value, sub, body, foot, href, chip, unit, titleSize` — mapped in `PageSections.jsx` (`metric→label, valueAfter→value, valueBefore→sub, impactStatement→body, evidenceType→foot`) | `GovernancePage.jsx` `COVERAGE_TALLY` (`label, value, body` only — no schema backing at all) |
| **cardBuilderSection** (generic cards) | `sections/cardBuilderSection.ts` — `heading`, `layout` (grid/list/tile), `cards[1+]` | `cardBuilderItem.ts`: `title`\*, `titleLink`, `image`+alt, `overlay`, `eyebrow`, `subtitle`, `body` (Portable Text), `citations[]`, `tools[]` (refs), `tags[]` (refs) | `CardBuilderSection.jsx` (separate renderer) | — none |
| **"Artifacts" tile** (no schema) | *(none — not in Studio)* | *(none)* | `StatCard`: `label={a.eyebrow}, value={a.title}, body={a.body}, href={a.href}, titleSize="xl"` | Duplicated verbatim in `GovernancePage.jsx`, `CmsPage.jsx`, `DesignSystemPage.jsx`, `MonorepoPage.jsx` — each its own local `ARTIFACTS` const, same `eyebrow/title/body/href` shape every time |

\* required field. Both `cardSection` and `cardBuilderSection` are registered as valid
`sections[]` union members on `page`, `article`, `caseStudy`, and `node` alike
(`apps/studio/schemas/index.ts`).

### Audit — live content mapped to schema (queried 2026-07-26, `production` dataset, published perspective)

**`cardSection` — 10 live documents:**

| Document | Type | Section title/name | Items | Population notes |
|---|---|---|---|---|
| Section Module Showcase (`ds-section-showcase`) | page | "§ 11 STAT TILE" / **"statTileSection — metric grid"** ⚠️ stale pre-rename title | 4 | metric+valueAfter+impactStatement+evidenceType; no valueBefore |
| Platform Is the Portfolio | caseStudy | "Outcomes" / "The Receipts" | 4 | full — all fields incl. valueBefore |
| Job Search Funnel Data Postmortem | article | "By the Numbers" (only doc using `kicker`) | 4 | metric+valueAfter only |
| Beauty Retail: Monolith→Microservice | caseStudy | "Outcomes" | 4 | full |
| FX Networks Webby nomination | caseStudy | "Outcomes" | 3 | mostly full |
| Backroads.com | caseStudy | "Outcomes" | 3 | partial |
| Bare Minerals | caseStudy | "Outcomes" | 4 | partial |
| Beringer.com | caseStudy | "Outcomes" | 3 | no valueBefore |
| Launching Lunar Landing | caseStudy | "Outcomes" | 4 | partial |
| Prestige Beauty Pilot | caseStudy | "Outcomes" | 3 | no valueBefore |

**`cardBuilderSection` — 4 live documents, all `page` type (never used on article/caseStudy/node):**

| Document | Layout(s) | Cards | Notes |
|---|---|---|---|
| Platform (`/platform`) | grid | 4 | tags+tools populated |
| Home | list | 4 | has images |
| Section Module Showcase | grid + list | 3 + 2 | demos both layouts |
| Services / CV-Resume | list + tile | 6 + 3 | heaviest real usage |

## Objective

After this epic: the stale `"statTileSection — metric grid"` content title is corrected;
`outcomeItem.ts`'s header comment accurately describes current usage (no references to
nonexistent fields/types); a written, recorded decision exists on whether the 4
hardcoded `ARTIFACTS` arrays should migrate to real `cardBuilderSection` content
(migration itself may be scoped as a follow-on if the decision is yes and the size
warrants its own epic); and SUG-19's `kpiDashboardSection` proposal is reconciled
against `cardSection` with a recorded decision, updating SUG-19's own backlog doc to
match. This epic touches **Sanity content** (one title field), **a Studio schema
comment** (no field/behavior change), and **documentation** (SUG-19's backlog doc,
possibly `component-registry.md`). It does **not** touch CSS, component visual design,
or the `StatCard`/`Grid`/`CardBuilderSection` components' rendering logic.

## Scope

- [ ] **Fix stale content** — patch `ds-section-showcase`'s `cardSection` `title` field
      from `"statTileSection — metric grid"` to a name that reflects the current schema
      (e.g. `"cardSection — metric grid"` or similar; exact wording proposed at
      execution time) — layer: **content** (Content Write Gate fires, see Technical
      Notes)
- [ ] **Clean up stale schema comment** — rewrite `outcomeItem.ts`'s header comment to
      remove references to the nonexistent `caseStudy.outcomes[]` field and the
      nonexistent `proofPointSection` type; describe actual current usage (`cardSection`
      only, across page/article/caseStudy/node `sections[]`) — layer: **schema**
      (comment-only, no field/behavior change, still gets its own Studio-scoped commit
      per CLAUDE.md)
- [ ] **Decide: migrate the 4 hardcoded `ARTIFACTS` arrays to `cardBuilderSection`
      content?** — write the decision and reasoning into this doc. If yes: scope the
      migration (likely its own phase or follow-on epic given it touches 4 page files
      and changes their data source from a JS const to a Sanity query) — layer:
      **schema decision / possible frontend follow-on**
- [ ] **Reconcile SUG-19's `kpiDashboardSection` proposal** — read
      `docs/backlog/SUG-19-kpi-dashboard-cards.md` in full at execution time, decide
      whether its stat-card-with-trend concept should extend `cardSection`/`outcomeItem`
      (e.g. add optional `trend`/`sparkline` fields) rather than fork a new schema type,
      and update SUG-19's backlog doc to reflect the decision — layer: **schema
      decision / documentation**

## Acceptance Criteria

- [ ] `ds-section-showcase`'s `cardSection` document no longer has a `title` field
      reading `"statTileSection — metric grid"` — verified by a fresh GROQ query after
      the patch lands
- [ ] `outcomeItem.ts`'s header comment contains no reference to `caseStudy.outcomes[]`
      or `proofPointSection` — verified by grep returning zero hits
- [ ] This doc records an explicit migrate/don't-migrate decision for the 4 hardcoded
      `ARTIFACTS` arrays, with reasoning — "TODO" or silence is not a valid closing state
- [ ] This doc records an explicit decision on SUG-19's `kpiDashboardSection` (extend
      `cardSection` vs. new schema), and `docs/backlog/SUG-19-kpi-dashboard-cards.md` is
      updated to match — verified by reading the file after the edit
- [ ] If the ARTIFACTS-migration decision is "yes, migrate": Content Write Gate fires
      before any Sanity write (proposal + approval), and schema is deployed via
      `npx sanity schema deploy` if any schema addition is needed — proposal approved
      before patch

## Human QA Walkthrough — example local pages

Not applicable at stub stage unless the ARTIFACTS-migration decision (Scope bullet 3)
is "yes" — that path would change the data source (not the CSS) of 4 pages currently
rendered via `StatCard`/`Grid`, which are shared components rendered on more than one
page.

> Activation audit: if and only if the migration decision is "yes," read
> `apps/web/src/App.jsx`, confirm the routes for `/platform/governance`, `/platform/cms`,
> `/platform/design-system`, `/platform/monorepo` are still current, and build a Human
> QA Walkthrough table (one local URL per affected page, plus one unchanged sibling
> platform page as a regression guard) per `docs/epic-template.md` §Human QA
> Walkthrough before any frontend change lands.

## Technical Notes

- **Content Write Gate**: fires for the `ds-section-showcase` title-field patch (Scope
  bullet 1) — the change is directional ("fix the stale name") not word-for-word
  user-dictated, so propose the exact before/after value and wait for explicit approval
  before any `patch_documents` call. Also fires if the ARTIFACTS-migration path (Scope
  bullet 3) proceeds and requires new Sanity content.
- **Schema changes**: none required for Scope bullets 1–2. Scope bullet 3 (SUG-19
  reconciliation) may propose new optional fields on `outcomeItem` (e.g. `trend`,
  `sparklineData`) if the decision is "extend `cardSection`" — if so, name the fields
  explicitly at execution time and run `npx sanity schema deploy` after landing, per the
  Schema Field Proposal table below (left empty here since no field is committed to yet
  — this is a decision epic, not a field-adding one, until Scope bullet 4 resolves).
- **Upstream/downstream dependencies**: `SUG-19` (kpi-dashboard-cards, backlog, not yet
  built) — this epic's Scope bullet 4 directly informs SUG-19's eventual schema design.
  Set a Linear `blocks` relation from SUG-248 → SUG-19 once the reconciliation decision
  is made (SUG-19 should not proceed to schema design until this epic's decision lands).
- **Activation audits** (specific, not "check the schema"):
  - Re-run the `cardSection`/`cardBuilderSection` content queries from this doc's audit
    tables before Scope bullet 1's patch — content may have changed since 2026-07-26;
    confirm `ds-section-showcase` still has the stale title before patching it.
  - Read `docs/backlog/SUG-19-kpi-dashboard-cards.md` in full (not just the excerpt
    quoted in this doc's Background) before Scope bullet 4 — confirm the exact proposed
    field shape and check for any Non-Goals conflicts before editing it.
  - Grep `docs/conventions/component-registry.md` for `cardSection`/`cardBuilderSection`
    rows before closing this epic — update the registry if Scope bullet 3's decision
    changes how either pattern is described.
- **Model & Mode**: `/model sonnet` — this is schema-comment cleanup, a content patch,
  and two documented decisions; no architecture-scale ambiguity requiring plan mode.

## Non-Goals

- **No CSS, layout, or visual redesign of any kind.** This epic is structured-content
  shapes only, per its own originating request. `StatCard`, `Grid`, and
  `CardBuilderSection`'s rendering/styling are out of scope even if Scope bullet 3
  (migration) proceeds — the components already exist and render both patterns
  correctly today.
- **Not building SUG-19's `kpiDashboardSection` itself.** Only deciding its
  relationship to `cardSection` is in scope; building it (if the decision is "new
  schema") is SUG-19's own future work.
- **Not a site-wide schema-conflation audit.** Scoped to the stat-card/card-builder
  family specifically, not every schema pair in the monorepo.
- **The ARTIFACTS-migration itself is not guaranteed scope** — only the decision is.
  If "yes, migrate" and the resulting frontend work is large (4 pages, GROQ query
  changes, content authoring for 4 new `cardBuilderSection` documents), it may warrant
  its own follow-on epic rather than absorbing it here — record that call explicitly
  rather than silently ballooning this epic's scope.

## Related

- **Linear:** [SUG-248](https://linear.app/sugartown/issue/SUG-248/formalize-stat-card-card-builder-content-schema-pattern)
- **Related backlog:** `docs/backlog/SUG-19-kpi-dashboard-cards.md` (kpiDashboardSection proposal, to be reconciled)
- **Prior rename epic:** `docs/shipped/zArchive/2026/SUG-151-ds-phase-5-schema-closeout.md` (statTileSection → cardSection)
- **Unrelated origin epic:** `docs/shipped/zArchive/2026/EPIC-0160-card-builder-section.md` (cardBuilderSection's original build)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
