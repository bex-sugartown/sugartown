# EPIC TEMPLATE
# Sugartown — Claude Code Epic Prompt

> Copy this file, fill in each section, and paste the completed prompt to Claude Code.
> Sections marked **[REQUIRED]** must be complete before execution.
> Sections marked **[GUIDED]** contain inline checklists — work through them during authoring.
> Delete all instructional comments (lines starting with `>`) before pasting.

---

## Epic Lifecycle

Epics follow a three-stage lifecycle, tracked by **issue ID** (not sequential EPIC numbers):
`SUG-{N}` on epics created in Linear, `ST-{n}` on epics created from 2026-08-16, where `{n}` is
the GitHub issue number. Issue status is a byproduct of running this lifecycle, not a separately
maintained field — see CLAUDE.md §Issue status = workflow stage (SUG-246).

**1. Backlog** (`docs/backlog/ST-{n}-{name}.md`)
- When authoring a new epic, **create the GitHub issue first**. Until 2026-09-09 tracker writes
  go to GitHub only — CLAUDE.md §Tracker writes go to GitHub only
- Use the GitHub issue number in the filename: `ST-95-liveness-probes-only.md`. Existing
  `SUG-{N}` files keep their Linear IDs and are never renumbered; the two ranges overlap, so the
  prefix is what carries the era (CLAUDE.md §Epic authoring)
- Update the **GitHub Issue** field in the file header with the issue link
- Status in Linear: **Backlog** (just filed) → **Todo** (promoted to the top of `## 01 · Next`
  by the human when they prioritize it for pickup)

**2. Active** (implementation underway)
- Status: **In Progress** — set as soon as the Pre-Execution Completeness Gate below
  is clean and code changes are about to begin, before the first `Edit`/`Write` call
- Status: **On Hold** if the epic is paused, for a blocker or by choice (CLAUDE.md §Issue
  status = workflow stage)
- Any cross-epic dependency stated in this doc ("blocked on X") must also exist on the issue,
  not prose alone. GitHub has no relation field, so state it in the issue body

**3. Shipped** (when the epic is complete)
- Move the file from `docs/backlog/` to `docs/shipped/`
- Keep the same filename (e.g. `SUG-30-image-treatments-gallery.md`)
- Remove the file from `docs/backlog/` (it now lives in `docs/shipped/`)
- Transition the issue to **Done** — in GitHub; Linear is frozen for the trial

> **`docs/backlog/`** — full epic specs. The working document Claude Code reads during execution.
> **`docs/shipped/`** — completed epics. Historical reference. (Renamed from `docs/prompts/`.)
> **Linear** — tracking, prioritization, status. Short description + links. Not the full spec.

---

**Linear Issue:** SUG-XX _(create the Linear issue first, then link it here)_
## EPIC NAME: [REQUIRED]

---

## Model & Mode [REQUIRED]

> **Updated for Sonnet 5** (confirmed via anthropic.com/news/claude-sonnet-5, 2026-07-01):
> Sonnet 5 benchmarks close to Opus 4.8 on coding/agentic work at roughly a third
> of the price ($2–3/$10–15 per MTok vs Opus 4.8's $5/$25) and holds a much larger
> component-graph in view before dropping detail — the failure mode that used to
> force `opusplan` on multi-component epics. That changes the default.
>
> **Default: plain `/model sonnet`.** Use it for the epic types that make up
> most of this repo's work — building/iterating DS components, wiring section
> renderers, story consolidation, schema-driven CRUD, migration scripts,
> content/copy epics. No plan-mode handoff needed; Sonnet executes directly.
>
> **Use the Opus plan-first workflow only for epics with genuine
> architectural ambiguity** — Schema ERD changes, SSR/rendering strategy,
> monorepo boundary changes, a new cross-cutting abstraction with no existing
> pattern to extend. These are the epics where the *plan itself* is the hard
> part, not the execution. (The `opusplan` preset was retired; the plan/execute
> split is now set up manually — Opus in plan mode, then Sonnet for execution.)
>
> **Session setup (Opus plan-first epics only):**
> 1. `/model opus` — set once at session start
> 2. `Shift+Tab` until status bar reads "plan mode"
> 3. Paste this epic as the first prompt
> 4. Review Opus's plan against the gates below; push back until aligned
> 5. Exit plan mode (`Shift+Tab`), then `/model sonnet` takes over for execution
>
> **Override rule:** if Sonnet stalls — on either a plain-`/model sonnet` epic
> or during Opus plan-first execution — on something architectural rather than
> mechanical (e.g. an unexpected cross-workspace type error, a token cascade
> that isn't resolving), type `/model opus` for that single question, then
> return to the epic's normal mode. Note the override in the epic's
> post-mortem so we keep learning where Sonnet 5's ceiling actually is —
> don't assume the old Sonnet 4.6 ceiling still applies.
>
> **Reserve `/model opus` outright (no plan-mode handoff) for:** epics where
> execution itself benefits from sustained depth throughout, not just at the
> planning stage — e.g. a large, ambiguous refactor with no clear stopping
> point. Also use Opus 4.8 for anything security-hardening or reduced-guardrail
> — Anthropic's own guidance flags Sonnet 5 as measurably weaker there.

---

## Pre-Execution Completeness Gate [REQUIRED — complete before writing Scope or Phases]

> **Model phase:** On an Opus plan-first epic, this gate runs under Opus in plan mode — do not exit plan mode until it and the audits below are clean. On a plain-`/model sonnet` epic (the default — see Model & Mode above), this gate still applies in full; Sonnet completes it before writing Scope or Phases, there's just no separate plan-mode handoff.

> Tick every item before execution begins. If an item cannot be answered, resolve it
> first — do not proceed.

- [ ] **Interaction surface audit** — before creating any new interactive element (button, link, card, form control, chip), search for existing components, utilities, CSS surfaces, and schemas that serve the same interaction across all four layers: `src/components/`, `src/design-system/`, `src/lib/`, `apps/studio/schemas/`. List what exists and state whether you are extending it, replacing it (with justification), or confirming no equivalent exists. If an existing component covers 80%+ of the use case, extend it via props — do not fork.
- [ ] **Use case coverage** — if this epic creates a new component or web adapter, list the known consumers and interaction patterns it must support (e.g. "internal SPA links, external links, mailto/tel, button-only with no href"). Confirm the API covers all of them, or explicitly note which are deferred and why. A 1:1 port from another layer that only covers the source layer's use case is not sufficient — the target layer's use cases must be enumerated.
- [ ] **Layout contract** — positive statement of the component/section layout contract is written (not just a non-goals list). For grid/card layouts, include a **dimensional contract**: target card width, max-width for list view, sidebar width, gap, and the resulting page max-width (formula: `card_w × cols + gap × (cols-1) + sidebar + sidebar_gap + padding = max-width`)
- [ ] **All prop value enumerations** — every `select` / enum prop has its full `options.list` copied from the schema (see Schema Enum Audit below); none reconstructed from memory
- [ ] **Correct audit file paths** — every file listed in the audit phase has been verified to exist at the stated path (`ls` or Read the file before referencing it in the brief)
- [ ] **Dark / theme modifier treatment** — explicit statement of how dark mode, light mode, or themed variants are handled by this component (token inheritance, `[data-theme]`, `accentColor`, or "not applicable — why")
- [ ] **Studio schema changes scoped** — if this epic requires schema changes, they are either (a) explicitly in scope with their own commit prefix `feat(studio):`, or (b) explicitly out of scope with a reference to the epic that owns them. No implicit schema changes.
- [ ] **Web adapter sync scoped** — if a DS component is created or modified, the web adapter update is either (a) in scope (listed in Files to Modify), or (b) explicitly deferred to a named follow-on epic
- [ ] **Composition overlap audit** — if this epic adds a sub-object (e.g. `linkItem`, `richImage`) to an existing schema, list all fields on the parent schema that serve the same purpose as any field on the sub-object. If overlap exists, state which field is canonical and hide/deprecate the other. Two fields that could plausibly hold the same value is a bug (see CLAUDE.md §Single Field Authority).
- [ ] **Atomic Reuse Gate** — for every new component, schema object, CSS surface, or utility in this epic: (1) confirm no existing equivalent across all 5 layers, (2) confirm it will be consumed by >1 caller or justify single-use, (3) confirm the API is composable (children over fixed slots, tokens over hardcoded values). See CLAUDE.md §Atomic Reuse Gate.
- [ ] **Token value cross-check (DS component epics — blocking)** — if this epic uses any `--st-*` token for a typography or spacing decision on a DS component: (1) grep for the token's resolved value in `tokens.css`, (2) open the DS typography/spacing convention Storybook story (`/story/foundations-typography-conventions--default`) and confirm the resolved value matches the spec. Record both values in the epic doc. A token that resolves at the wrong tier (e.g. `--st-font-heading-2` = 36px when the spec calls for 48px) must be addressed with a new semantic token before implementation begins. See CLAUDE.md §DS Component Authoring Token-First Rule.
- [ ] **Enforcement liveness — declared is not effective** (blocking for any epic that audits, adds, or relies on a rule, gate, or validator) — for every rule this epic claims is in force, prove it *fires*; do not confirm it *exists*. Config presence, a wired hook, and a passing check are three different things from an enforced rule. Proof is a deliberate violation that fails then reverts — or where impractical, the resolved config read back from the tool itself (`eslint --print-config`). "The rule is declared in X" is not evidence. Five instances across 2026-05→07 are recorded as INC-009 to INC-011 in `docs/ai/agentic-caucus/incident-log.md`.
- [ ] **App.jsx routing pre-flight (epics that touch "all pages" or any page set)** — if this epic's scope covers a set of pages (archive pages, detail pages, "all X pages"), read `apps/web/src/App.jsx` before finalising the page inventory. Diff the routes against the epic's page list and correct any mismatch. Missing or wrong entries in the page list invalidate the Scope and Acceptance Criteria sections. Record the verified route-to-component mapping in Technical Notes before proceeding.
- [ ] **Component-Reuse Manifest** — if this epic adds any page, section, or visual surface: the manifest table below is filled in **before any JSX or CSS is written**. An epic doc without the manifest is incomplete (same severity as a missing Phase 0 vspec).
- [ ] **Scope ↔ Non-Goals consistency** — read the Non-Goals section against every Scope bullet and Acceptance Criterion, and state explicitly that the check was run. A Non-Goal that forbids something a Scope bullet requires is a contradiction to resolve at authoring time, not mid-execution. (SUG-224 shipped with "no DS API changes" in Non-Goals and an end-state that required one; nobody noticed until the spike.)
- [ ] **Spike component selection (epics with a proof-of-concept phase)** — a spike proves the approach on the *simplest representative* case, never the most complex or most salient. Name the chosen case and say why it is representative. (SUG-224 nominated `Card`, its most complex adapter, because Card carried the TODO comment that motivated the epic.)
- [ ] **Component registry update** — if this epic creates, retires, or structurally changes a component: `docs/conventions/component-registry.md` is updated in the same commit. New component = new row with all health columns filled (Storybook, dark mode, DS primitive or web-only, ⚠️ gaps). Retired component = row removed or marked deprecated. This is not a post-epic cleanup step — the registry is updated at creation time, before the component ships.
- [ ] **Technical diagram red-pen gate** — if this epic produces or publishes any technical/architecture diagram: the diagram source (SVG or Mermaid) is committed to `docs/diagrams/` and the red-pen claim table (element → evidence → enforced-by-code / measured / convention / roadmap) is completed before upload. Captions and alt text count as claims. Roadmap items are drawn dashed/labelled, never as current state. See CLAUDE.md §Technical diagram red-pen gate.

> **Once this gate is clean:** transition the Linear issue's `state` to `In Progress` via
> `save_issue` before making the first `Edit`/`Write` call. This is the concrete
> "implementation begins" moment referenced in §Epic Lifecycle above.

---

## Component-Reuse Manifest [REQUIRED if epic adds any page, section, or visual surface]

> One row per visual element the epic will render. Fill in BEFORE writing any JSX
> or CSS. Detail/entity pages: start from `docs/conventions/detail-page-recipe.md` —
> most rows are already answered there.
>
> "New" in the Decision column is the exception and must carry a one-sentence
> justification. A page built without this manifest is the SUG-35 failure mode:
> ~9 one-off `term*` patterns shipped despite every one having an existing
> component, caught only by human audit at close-out.

| Visual element | Existing component / shared class | Decision (use / extend via prop / new + why) |
|---|---|---|
| _e.g. page shell_ | `pageStyles.entityDetailPage` | use |
| _e.g. related items grid_ | `Grid` + `ContentCard` | use |
| _e.g. pronunciation line_ | none — inspected pages.module.css, DS, MetadataCard | new `.termPronunciation` — IPA metadata line, no structural equivalent |

---

## Context [REQUIRED]

> State the current repo state relevant to this epic. Include:
> - Which files already exist that this epic will touch
> - Which doc types / routes / queries are in scope
> - Any recent epics that changed the same surface area

---

## Objective [REQUIRED]

> One paragraph. What exists after this epic that didn't before?
> Be specific about the data layer (Sanity schema), the query layer (GROQ),
> and the render layer (React) — all three must be explicitly addressed or
> explicitly excluded.

---

## Doc Type Coverage Audit [REQUIRED — complete before writing Scope]

> For EVERY epic that adds a new field, section type, schema object, or
> renderer: explicitly evaluate all five primary content doc types.
> "Not currently present" is NOT a valid skip reason.
> "Not architecturally appropriate because X" is.

| Doc Type    | In scope? | Reason if excluded |
|-------------|-----------|-------------------|
| `page`      | ☐ Yes / ☐ No | |
| `article`   | ☐ Yes / ☐ No | |
| `caseStudy` | ☐ Yes / ☐ No | |
| `node`      | ☐ Yes / ☐ No | |
| `archivePage` | ☐ Yes / ☐ No | |

---

## Schema Field Proposal [REQUIRED if any new field is added to any schema]

> Complete this table before writing any schema code or Scope bullets. It is the
> primary planning artefact for non-engineer review — fill it from the invocation
> brief, not from schema code. If a field is proposed but rejected during planning,
> leave it in the table with a "Not proceeding — reason" note in Why it matters.
>
> **One row per proposed field.** Include fields being added, enhanced (structure change),
> or unhidden. Do not include existing fields that are unchanged.
>
> **Duplication check (blocking):** before adding any field, confirm no existing field on
> the same document serves the same purpose. If overlap exists, name it and state which
> field is canonical (see CLAUDE.md §Single Field Authority).

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `fieldName` | One sentence — the concept this field captures, not its Sanity type | `"Analyst prep time"` or `consulting / embedded / delivery` | Why a prospective client, editor, or AI retrieval system benefits from this being structured |

> **Columns:**
> - **Field** — exact Sanity field name (`camelCase`), plus the schema type in parens: `(string)`, `(text)`, `(array of object)`, `(reference)`, `(boolean)`, `(date)`, etc.
> - **What it is** — plain English description for a non-engineer. Not the Sanity type — the concept.
> - **Example value** — a realistic value, not a placeholder. Enum fields: list all options. Array fields: show one item.
> - **Why it matters** — the business, editorial, or retrieval reason this field earns its place.

---

## Scope [REQUIRED]

> Bullet list of included tasks. Every task must map to at least one
> Deliverable and at least one Acceptance Criterion below.
>
> **If this epic includes a Phase 0 (vspec / design review):**
> - The vspec file MUST be created at `docs/drafts/SUG-{N}-{name}.vspec.html` before any
>   implementation phases begin. A layout diagram in the epic doc is NOT a substitute.
> - No code in `apps/web/src/` or `apps/studio/schemas/` may be written until the vspec
>   file exists on disk and Phase 0 checkboxes are marked complete by the human.
> - If the backlog spec changes mid-epic (before Phase 0 sign-off), update the vspec
>   in the same response as the spec change. Backlog doc and vspec must stay in sync.
> - Phase 0 sign-off is a **human gate**. Agent presents the vspec, then asks via
>   `AskUserQuestion`:
>   ```
>   Question: "Vspec approved — start implementation?"
>   Options:
>     - "Approved — start implementation"
>     - "Needs changes"
>   ```
>   The agent marks Phase 0 complete only after "Approved — start implementation" is
>   selected.

- [ ] Studio schema changes
- [ ] Schema registration (`index.ts`)
- [ ] Document wiring (sections[] additions per doc type audit above)
- [ ] GROQ query projections (see Query Layer Checklist below)
- [ ] Frontend renderer
- [ ] CSS / styles
- [ ] Web adapter sync (if DS component created or modified — see Technical Constraints)
- [ ] Migration script (if backfilling existing data)
- [ ] Dry-run verification of migration script

---

## User Story Decomposition [REQUIRED if epic crosses the sizing gate]

> Decompose when the epic has more than 5 Scope items. Numbered phases do not trigger this.
> Below that, skip this section — most Sugartown epics are single-session and gain nothing
> from one work unit per Scope item. **Decomposition lives in this doc, not in Linear: one
> epic is one Linear issue, never sub-issues.** Full definition and a worked example:
> `docs/conventions/user-story-conventions.md`.

- [ ] Sizing gate checked — epic crosses it / stays flat (state which)
- [ ] If crossing: scope-to-phase mapping table present, every Scope item naming the phase
  that ships it, so `Scope ∖ Phases` is empty
- [ ] No Linear sub-issues filed for this epic

---

## Query Layer Checklist [REQUIRED if any field or section type is added]

> GROQ projections are opt-in and are NOT automatically updated when
> schemas change. Every slug query that projects the modified field
> must be explicitly listed and updated.
>
> For section builder changes: list every query that projects `sections[]`.
> Add `_type == "newType" => { field1, field2 }` to each.

- [ ] `pageBySlugQuery` — add projection for new type/field
- [ ] `articleBySlugQuery` — add projection for new type/field
- [ ] `caseStudyBySlugQuery` — add projection for new type/field
- [ ] `nodeBySlugQuery` — add projection for new type/field
- [ ] Archive queries (`allArticlesQuery`, `allCaseStudiesQuery`, etc.) — add if card display needs field

> If a query is genuinely not affected, write the reason: e.g.
> "nodeBySlugQuery — excluded: node does not render sections[]"
> Do NOT leave entries blank.

---

## Schema Enum Audit [REQUIRED if any enum field is rendered or displayed]

> Before writing any display-label map or rendering any `select` / `radio`
> enum field from Sanity, open the schema file and read the field's
> `options.list` array. The stored `value` is **not** the same as the UI
> `title` — never assume they match, and never build a label map from memory.
>
> **Cross-doc-type coverage**: if the same logical field (e.g. `status`)
> appears on multiple doc types, check **all** of them — option lists differ
> between types. A map that covers `article` status values is not complete
> for `node` status values.
>
> Complete this table before writing any render code:

| Field name | Schema file | `value` → Display title (copy from `options.list`) |
|-----------|-------------|-----------------------------------------------------|
| `status` | `article.ts` / `node.ts` / `caseStudy.ts` | e.g. `active → Active`, `implemented → 🚀 Implemented` |
| `aiTool` | `node.ts` | e.g. `claude → 🤖 Claude`, `mixed → 🔀 Agentic Caucus` |
| `conversationType` | `node.ts` | e.g. `architecture → 🏗️ Architecture Planning` |

> Leave rows blank for fields not in scope. Add rows for any other enum field touched.

> **Badge-rendering components (status, evolution, lifecycle):**
> If this epic renders status/badge values from Sanity fields on a card or listing surface,
> complete the following per-doc-type vocabulary table **before writing any STATUS_BADGE_CLASS
> or display-label map**. Copy `value` strings verbatim from the schema `options.list` — do
> not reconstruct from memory. A single missing value causes a silent badge failure (no class,
> no visible badge) that is hard to detect in testing.
>
> | Doc type    | Field name | Schema file        | All valid `value` strings (copy from `options.list`) |
> |-------------|------------|--------------------|------------------------------------------------------|
> | `node`      | `status`   | `node.ts`          | _e.g. exploring, validated, operationalized, deprecated, evergreen_ |
> | `project`   | `status`   | `project.ts`       | _e.g. dreaming, designing, developing, testing, deploying, iterating_ |
> | `article`   | `status`   | `article.ts`       | _e.g. draft, active, archived_ |
> | `caseStudy` | `status`   | `caseStudy.ts`     | _e.g. draft, active, archived_ |
>
> Leave rows blank for doc types not in scope. The `value` column must be **exhaustive** —
> "etc." is not valid. If legacy values exist (kept for backward compat), list them too.

---

## Metadata Field Inventory [REQUIRED if MetadataCard or any metadata surface is in scope]

> For any epic that adds, moves, or changes fields rendered in MetadataCard
> or a similar structured metadata surface: complete this table before
> writing code. It prevents fields being missed, rendered outside the
> component, or merged incorrectly.
>
> **Taxonomy display rule (non-negotiable):**
> `projects[]`, `categories[]`, and `tags[]` always render as **three
> separately labelled rows** — never merged into a single "Classification",
> "Taxonomy", or combined row. This applies to MetadataCard and any future
> metadata surface. Enforce it in the AC and in code review.

| Field | Sanity field name | Doc types that have it | Current render location | Post-epic render location |
|-------|------------------|----------------------|------------------------|--------------------------|
| Author | `authors[]` / `author` (legacy) | article, caseStudy, node | | |
| Status | `status` | article, caseStudy, node | | |
| AI Tool (deprecated) | `aiTool` | node | | |
| Conversation type | `conversationType` | node | | |
| Client | `client` | caseStudy | | |
| Role | `role` | caseStudy | | |
| Tools | `tools[]` | article, caseStudy, node | | |
| Projects | `projects[]` | article, caseStudy, node | | |
| Categories | `categories[]` | article, caseStudy, node | | |
| Tags | `tags[]` | article, caseStudy, node | | |

> Add or remove rows to match what's actually in scope. "Not in scope" is a
> valid entry for Post-epic render location — but it must be deliberate.

---

## Themed Colour Variant Audit [REQUIRED if any component or surface is themed]

> Any epic that touches CSS tokens, component styles, or creates/modifies
> a themed surface must complete this table. "Will inherit from tokens" is
> not a sufficient answer — specify the actual value or token for each theme.
>
> Omitting this table is what causes post-delivery change requests like
> "change inline code from maroon to lime in dark mode."
>
> Themes in scope: **dark** (default) | **light** | **pink-moon**
> Token files: `apps/web/src/design-system/styles/tokens.css` (web canonical)
>             `packages/design-system/src/styles/tokens.css` (DS package, must stay in sync)

| Surface / component | Dark | Light | Pink Moon | Token(s) to set |
|---------------------|------|-------|-----------|-----------------|
| e.g. Inline code bg | `rgba(209,255,29,0.10)` | `--st-color-softgrey-100` | TBD | `--st-code-inline-bg` |
| e.g. Inline code text | `var(--st-color-lime)` | `var(--st-color-maroon)` | TBD | `--st-code-inline-color` |

> If a surface is genuinely not themed (e.g. it always inherits from a parent
> that is already covered), state that explicitly: "inherits from `--st-color-bg-canvas`
> — no per-theme override needed."

---

## Non-Goals [REQUIRED]

> Explicit exclusions. Every exclusion must be deliberate, not a default.
> If you're excluding a doc type, write why (architectural reason, not
> "not currently present").
>
> **Studio schema changes**: if this epic does NOT own schema changes, say so explicitly here
> and name the epic that does. Studio changes bundled silently into component epics make
> history harder to bisect and revert.

---

## Technical Constraints [REQUIRED]

> Cover all four layers. Do not leave any layer blank.

**Monorepo / tooling**
- pnpm workspaces; scripts at repo root; `apps/studio`, `apps/web`
- Migration scripts run as `node scripts/migrate/X.js` from repo root
- `nanoid` is installed in `apps/studio/node_modules`, NOT at root — use dynamic import with fallback:
  ```js
  const { nanoid } = await import('nanoid').catch(() => ({
    nanoid: () => Math.random().toString(36).slice(2, 11)
  }))
  ```
- All other migration script patterns: follow `scripts/migrate/lib.js` (dry-run default, `--execute` flag, 5s abort window, idempotency)

**Schema (Studio)**
- Section types are `object` schemas registered in `apps/studio/schemas/sections/`
- Must be imported and added to `schemaTypes` in `apps/studio/schemas/index.ts`
- Must be added as `defineArrayMember({type: '...'})` in EVERY doc type's `sections[]` field that is in scope per the doc type audit above
- **Explicit field types (non-negotiable)**: every new schema field added by this epic must have its Sanity `type` explicitly declared in this epic doc before code is written (e.g. `string`, `text`, `number`, `boolean`, `slug`, `reference`, `array of reference`, `object`, `image`). Do not leave field types implicit or rely on Sanity default inference — type must be specified in both the epic definition and the `defineField` call.

**Query (GROQ)**
- All queries in `apps/web/src/lib/queries.js`
- Slug queries use conditional projections: `_type == "X" => { fields }`
- Adding a new section type requires adding its projection to EVERY slug query that projects `sections[]` — the complete list as of this writing: `pageBySlugQuery`, `articleBySlugQuery`, `caseStudyBySlugQuery`, `nodeBySlugQuery`
- Archive queries (allArticlesQuery, etc.) project card-level fields only — add fields here only if the card display needs them

**Render (Frontend)**
- `PageSections.jsx` uses a switch statement; new section types require a new case AND a new sub-component
- CSS in `PageSections.module.css`; global class names require `:global(.classname)` wrapper in the module file
- All page templates that render `sections[]`: `ArticlePage.jsx`, `CaseStudyPage.jsx`, `NodePage.jsx`, `RootPage.jsx` — verify each is in scope per doc type audit
- **Taxonomy display (non-negotiable)**: `projects[]`, `categories[]`, and `tags[]` must each render as their own separately labelled row. Never merge into a combined row or group. Violating this is a bug, not a style choice.
- **Enum display-label maps**: every enum field rendered must have a label map built from the schema's `options.list` (see Schema Enum Audit above). Raw stored values (`"architecture"`, `"claude"`) must never appear in the UI.

**DS Component Color Authoring (token-first — blocking)**
- No raw hex, rgba, or hsla value may appear in a component CSS file. Every color resolves through `var(--st-*)`. If the token doesn't exist, add it to `tokens.css` **in a prior commit** before writing component CSS.
- Fallback form: `var(--st-token, var(--st-primitive))` only. `var(--st-token, #hex)` is banned.
- Theme files (`theme.light.css`, `theme.pink-moon.css`) are override-only — they may not introduce a color value that has no primitive anchor in `tokens.css`.
- **If this epic introduces chip, badge, or status color states**: define all `--st-status-<state>-{bg,fg,border}` tokens (dark defaults + light overrides) in `tokens.css` before writing any component CSS. List every state here:
  - States: ______
  - Token prefix: `--st-status-` (or justify a different prefix)
  - Light override location: `[data-theme="light"]` block in `tokens.css`
- Run `pnpm validate:tokens --strict-colors` from `apps/web/` before every component CSS commit. Zero violations is the gate.

**Design System — direct package consumption (SUG-224, 2026-07-24)**
- `apps/web` imports directly from `@sugartown/design-system` — there is no JSX adapter layer to sync.
- When a DS component is created or modified in `packages/design-system/src/components/`, export it from the package's top-level `src/index.ts` barrel. No matching web-tree file is needed.
- The only exception: `SidebarNav` and `Tile` are genuinely web-only (real app coupling — `useScrollspy`, `linkUtils` + react-router) and have no package counterpart — they are not adapters, they are the only implementation.

---

## Migration Script Constraints [REQUIRED if script is included in Scope]

> Complete this section if any backfill or data-transform script is part
> of the epic. Leave blank and mark N/A if no script.

**Target doc count**
Before writing the script, run a GROQ count query and record the expected number of documents to be modified:
```
count(*[_type == "X" && <target condition>])
```
Expected count: `___`

> This number is the acceptance criterion for the dry-run. If dry-run
> reports 0 (or an unexpected number), treat it as a bug, not a success.

**Skip condition review**
For each condition that causes a document to be skipped, state:
- What the condition is
- Why skipping is correct (not just "it seemed safe")
- Whether `setIfMissing` or another Sanity patch operation already handles the "absent field" case — if yes, a guard for that case is likely wrong

**Idempotency**
State how re-running the script produces no change:

---

## Files to Modify [REQUIRED]

> List every file expected to change. If a file is not listed here and
> needs to change during execution, that is a scope gap — stop and
> update the epic before proceeding.

**Studio**
- `apps/studio/schemas/sections/[newType].ts` — CREATE
- `apps/studio/schemas/index.ts` — add import + register
- `apps/studio/schemas/documents/[docType].ts` — one entry per in-scope doc type from audit

**Frontend**
- `apps/web/src/lib/queries.js` — one entry per in-scope query from Query Layer Checklist
- `apps/web/src/components/PageSections.jsx` — new case + sub-component
- `apps/web/src/components/PageSections.module.css` — new styles
- `apps/web/src/pages/[Page].jsx` — one entry per in-scope page from doc type audit

**Package barrel export** (if DS component created or modified)
- `packages/design-system/src/index.ts` — add export (component + types)
- `apps/web/package.json` — add runtime deps if needed (e.g. `lucide-react`, `prismjs`)

**Scripts**
- `scripts/migrate/[name].js` — CREATE (if migration in scope)
- `package.json` — add `migrate:[name]` script entry

> **Model handoff point:** once Files to Modify is locked, exit plan mode. Sonnet executes from here down.

---

## Deliverables [REQUIRED]

> Concrete, verifiable artifacts. Each must be independently checkable.
> Map each deliverable back to a task in Scope.

1. **Schema** — `[newType].ts` exists in `schemas/sections/`, is registered in `index.ts`
2. **Document wiring** — `sections[]` in each in-scope doc type includes `defineArrayMember({type: '[newType]'})`
3. **GROQ projections** — every slug query in the Query Layer Checklist includes `_type == "[newType]" => { ... }`
4. **Renderer** — `PageSections.jsx` has a `case '[newType]'` and renders the component without errors
5. **Styles** — at minimum a wrapper rule exists in `PageSections.module.css`
6. **Migration** (if in scope) — script runs dry-run with count matching the pre-flight expectation; runs `--execute` with 0 errors

---

## Acceptance Criteria [REQUIRED]

> Testable outcomes. Each must be falsifiable — "it works" is not an
> acceptable criterion.

- [ ] `tsc --noEmit` in `apps/studio` reports zero NEW errors (pre-existing errors are exempt — document them)
- [ ] Studio hot-reloads without errors; new section type appears in the section builder for every in-scope doc type
- [ ] Dry-run of migration script reports expected count (from pre-flight) — NOT zero unless pre-flight confirmed zero targets
- [ ] After `--execute`, re-running dry-run reports 0 documents to patch (idempotency)
- [ ] Frontend: navigating to a detail page for a doc that has the new section type renders the section (not blank, not error)
- [ ] GROQ query projection test: `nodeBySlugQuery` (and all other in-scope slug queries) return the new section's fields when queried against a document that has that section
- [ ] **Enum coverage**: for every enum field rendered, every `options.list` entry in the schema is represented in the display-label map — verified by reading the schema, not from memory. Verified across all doc types in scope (a map that covers `article` `status` values is not necessarily complete for `node` `status` values)
- [ ] **Taxonomy rows**: if taxonomy fields are rendered, each type (`projects[]`, `categories[]`, `tags[]`) appears as its own separately labelled row in the UI — confirmed by visual inspection on a document that has all three populated
- [ ] **Route smoke-test**: navigate to the archive route (e.g. `/projects`) AND the detail route (e.g. `/projects/sugartown-cms`) for at least one real published document — both routes must render without 404, without runtime errors, and with correct Sanity data (not an empty/placeholder state). If this epic adds a new doc type, test both archive and detail.
- [ ] **Structural closure** (migration epics — required): if this epic migrates all callsites of a pattern, CSS class, or component away from the old surface, run a grep confirming zero remaining references before close-out. Document the exact command and paste the result: `grep -rn "<old pattern>" apps/web/src/` must return zero results. A migration epic is not done until this is clean.
- [ ] **Visual QA** (required for any epic that changes visible output): render the new component/section on a real page with realistic adjacent content. Screenshot or preview-inspect to verify spacing, typography, and colour consistency with neighbouring elements. Check at desktop and mobile breakpoints. Specifically verify: no double-padding when sections render inside a detail page container, heading colours match the brand-primary token, and font sizes match the design system type scale.
- [ ] **Vspec fidelity** (required if Phase 0 produced a vspec): agent produces the vspec-to-build comparison table in the Visual QA Gate below. Human reviews and approves before close-out. This line item cannot be ticked by the agent alone.
- [ ] **Prototype trigger evaluated.** If any trigger fired, the interaction is built in the vspec (see CLAUDE.md §Vspec fidelity — the prototype trigger).
- [ ] **Friction line present.** The shipped doc states, in one sentence, what cost a correction commit this time — `none` is a valid answer. See Post-Epic Close-Out step 3b.
- [ ] **Findings ledger present.** Every finding raised during the epic has a row naming where it went. A finding whose only record is this conversation has not been filed. `none` is a valid answer where nothing surfaced.

  | Finding | Destination | Artifact |
  |---|---|---|
  | e.g. `/release` skips the header cap | new epic | SUG-265 + stub |
  | e.g. ScoreRing dep array | new epic | SUG-266 + stub |
  | e.g. epic-template full restyle | decided against | recorded in this doc |

  Close-out step 5b verifies handoffs to *named* epics. This covers findings with no epic yet, which is how they end up in chat and nowhere else (CTL-024).

---

## Human QA Walkthrough — Example Local Pages [REQUIRED if epic touches CSS, layout, or component rendering]

> Origin: SUG-165. Any epic that changes a shared CSS surface, a token used in layout,
> or a component rendered on more than one page must enumerate **one example local URL
> per affected page-type** so a human can step through every implementation and confirm
> the change landed everywhere it should — and nowhere it shouldn't.
>
> **Build this table at activation, not at close-out.** It is the route inventory that the
> App.jsx routing read (Pre-Execution Gate) feeds into. Fill it from the *live* routes in
> `apps/web/src/App.jsx`, not from memory — the page-type → component mapping is the exact
> thing that drifts (e.g. `/articles` is served by generic `ArchivePage.jsx`, not a per-type
> `ArticlesArchivePage`).
>
> **Slug rules:** detail-page rows need a real published slug. Capture one per type at
> activation (archive page → first card href, or a GROQ `*[_type=="X"][0].slug.current`
> query) and datestamp the capture. Add a fallback note: "if a slug 404s, the doc was
> unpublished — pick another from the matching archive."

| Page-type (live renderer) | Route pattern | Example local URL | Expected result (size / weight / italic / colour — whatever this epic changes) |
|---|---|---|---|
| _e.g. `ArchivePage` (articles)_ | `/articles` | `http://localhost:5173/articles` | _e.g. H1 48px italic_ |
| _e.g. `ToolDetailPage`_ | `/tools/:slug` | `http://localhost:5173/tools/aem` | _e.g. H1 48px roman_ |

> **Coverage rule:** every page-type the epic's CSS/token change can reach must appear as a
> row — including pages that should be **unchanged** (regression guard). If a route renders a
> component this epic touches but is intentionally excluded, add it with "Expected: no change"
> so the human verifies it didn't regress. Group rows by treatment (changed vs unchanged, or
> by expected value) so the walkthrough reads top-to-bottom.
>
> Verify each row on both `light` and `dark` themes where the page supports theme switching.

---

## Visual QA Gate [REQUIRED if epic touches CSS, layout, or component rendering]

> This gate runs AFTER all acceptance criteria pass and BEFORE post-epic close-out.
> It is a **human gate** — the agent prepares the evidence, the human makes the call.
> Build success is not visual correctness. Do not skip this section.

### Evidence the agent must prepare:

1. **Storybook story exists** for every new or modified component
   - Story covers: default state, all variants, edge cases (long text, missing fields, empty arrays)
   - Story renders without console errors
   - **Dark mode verified**: component renders correctly on `dark-pink-moon` theme in Storybook. If not verified, a Linear gap issue must be open before this epic closes. "Untested" is not a valid close-out state.

2. **Component registry updated** (if applicable): `docs/conventions/component-registry.md` reflects the final state — new rows added, gaps flagged, retired rows removed.

2. **Vspec-to-build comparison table** (required if Phase 0 produced a vspec)
   - List every visual element in the vspec and confirm or flag each one:

   | Vspec Element | Status | Notes |
   |---|---|---|
   | _e.g. Metadata field order_ | _Match / Drift / Missing_ | _detail_ |
   | _e.g. Chip gap spacing_ | _Match / Drift / Missing_ | _Vspec: 8px, Impl: 12px_ |

   - If no vspec exists: agent produces a self-audit against the component contract or DS ruleset

3. **Token compliance audit**
   - `grep` the modified CSS for any hardcoded values (hex colors, px font sizes, font stacks)
   - Report count: "0 hardcoded values found" or list each violation

4. **Cross-surface spot check**
   - List every page/route that renders this component
   - Confirm the component renders without errors on at least 2 different routes with real Sanity data
   - Flag any route where the component appears visually different from Storybook

### Human gate:
> Agent presents the evidence table above, then asks via `AskUserQuestion`:
> ```
> Question: "Review the evidence above — Visual QA approved?"
> Options:
>   - "Visual QA approved — proceed to close-out"
>   - "Needs corrections" (human states what's wrong; agent revises and re-asks)
> ```
> Agent does NOT proceed to close-out until "Visual QA approved — proceed to close-out" is selected.

---

## Risks / Edge Cases [REQUIRED]

> Think through failure modes before execution, not after.

**Schema risks**
- [ ] Does this new type introduce a field name that collides with any existing field on the parent document?
- [ ] Does this type reference other types (references, cross-doc) that may not be registered?

**Query risks**
- [ ] If this type is added to sections[], have ALL four slug queries been updated? (Use the Query Layer Checklist — do not rely on memory)
- [ ] Do archive queries need updating for card display, or are they intentionally excluded?

**Migration risks**
- [ ] What is the expected target count? (Run GROQ count before writing the script)
- [ ] Does the skip logic correctly handle documents where the target array does not yet exist? (`setIfMissing` handles absent arrays — a guard for "array not present" is likely wrong)
- [ ] Is the script idempotent? What happens if it runs twice?
- [ ] Are all dependencies available at the monorepo root? (`nanoid` is NOT — use the fallback pattern)

**Render risks**
- [ ] What renders if `section.html` (or the primary field) is null/undefined? (Explicit null guard in the component)
- [ ] Does `dangerouslySetInnerHTML` or similar require a security note in the deliverables?
- [ ] Is the new component wrapped in the correct CSS containment?
- [ ] **Enum display**: has the Schema Enum Audit been completed for every enum field in scope? Raw stored values must never reach the UI.
- [ ] **Enum cross-doc-type coverage**: if a field (e.g. `status`) exists on multiple doc types, has the label map been verified against the schema for each type separately?
- [ ] **Taxonomy layout**: if taxonomy fields are rendered, is each type (`projects[]`, `categories[]`, `tags[]`) rendered as its own row — not merged?

---

## Post-Epic Close-Out [REQUIRED]

> Run these steps in order after all Acceptance Criteria are met and the working tree is committed.

1. **Visual QA gate (hard stop)** — if this epic has a Phase 0 vspec or any visual output, produce the vspec-to-build comparison table before proceeding. Every visual element (typography, spacing, colours, layout states) must be flagged as Match / Drift / Missing. Present the table and wait for **"Visual QA approved"** in the chat. The shipped/ move and mini-release are blocked until this text is received.
2. **Chromatic** — run Chromatic VRT. If deferred, annotate the shipped doc: `<!-- Chromatic: pending — deferred YYYY-MM-DD -->`. Deferral does not unblock close-out, but "Defer Chromatic" is not equivalent to "no Chromatic needed".
3. **Data pipeline gap check** — if this epic extended a build-time pipeline (stats, CrUX, LHCI, imports, etc.) and real data has not yet flowed through CI, document in the shipped doc:
   - What env var or scheduled cron produces real data
   - What the current `stats.json` (or equivalent) contains: real data or seeded scaffold
   - Expected shape once the pipeline runs
3b. **Friction line** — one sentence in the shipped doc: "What cost a correction commit this time." `none` is a valid, honest answer.
4. **Move the epic doc to production**:
   - Move: `docs/backlog/SUG-{N}-{name}.md` → `docs/shipped/SUG-{N}-{name}.md`
   - Remove from `docs/backlog/`
   - Commit: `docs: ship SUG-{N} {Epic name}`
5. **Confirm clean tree** — `git status` must show nothing staged or unstaged
6. **Run mini-release** — `/mini-release SUG-{N} [Epic name]`
   - Produces a patch version bump and lightweight CHANGELOG stub
   - Two gates: review stub → "Write it", then commit plan → "Commit it"
7. **Update the tracker** — transition the epic's issue to **Done**. One epic is one issue, so there are no sub-issues to close. Until 2026-09-09 that is the GitHub issue, and Linear is not touched (CLAUDE.md §Tracker writes go to GitHub only).
8. **Start next epic** — only after mini-release commit is confirmed

> If this epic warrants a MINOR version bump (new feature surface, new schema fields,
> new page component) rather than a patch, run `/release` instead of `/mini-release`.
