---
**Epic:** SUG-163 — Design ↔ code documentation pipeline — single source of truth for handoffs
**Linear Issue:** [SUG-163](https://linear.app/sugartown/issue/SUG-163/design-code-documentation-pipeline-single-source-of-truth-for-handoffs)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — each phase merges to main with its own mini-release
---

# SUG-163 — Design ↔ code documentation pipeline — single source of truth for handoffs

Make the documentation that governs code ingestible by design, so handoffs stop reinventing schemas, class names, and frameworks.

## Background

The SUG-162 Term Detail design handoff proved the gap precisely: it ingested the **component layer** correctly (its DescriptionList spec matched our adapter's `.item/.term/.detail` internals, gap tokens and all) but invented the **governance layer** — it assumed Next.js, proposed four schema fields that don't exist (`epistemicStatus`, `citation`, `extendedDefinitions`, nested `subsenses`), hardcoded URL paths the URL Authority Rule forbids, named classes (`.termDetailDl`) the validator rejects on sight, and reverse-engineered a `sense/subsense` schema from one Merriam-Webster sample. Every one of those errors exists because the source of truth (tokens.json, schema files, routes.js, the detail-page recipe) is readable by code tooling but has no design-facing surface. The fix is publication, not policing: design consumes the same files the validators enforce.

## Objective

After this epic, every layer a handoff can get wrong has a design-ingestible source of truth: design tokens flow from `tokens/source/tokens.json` into Figma Variables (Phase 1); content-model one-pagers (fields, types, enums, canonical routes) are generated from schema source and published on the platform DS pages (Phase 2); and handoffs arrive on a template that starts from the detail-page recipe and cites Storybook story IDs instead of reconstructed CSS (Phase 3). Layers touched: **tooling** (Style Dictionary target, codegen), **frontend** (platform DS page render), **docs/process** (handoff template + convention). No Sanity schema changes; no content writes.

## Component-Reuse Manifest

| Visual element | Existing component / shared class | Decision |
|---|---|---|
| Content-model one-pager page (Phase 2) | Platform DS page shell + `Table`/`DataTable` + `SectionLabel` + `CodeBlock` (same stack as `/platform/design-system/registry`) | use — registry page (`registryParser.js` pattern) is the reference implementation; no new components anticipated |
| Handoff template (Phase 3) | `docs/conventions/detail-page-recipe.md` table format + epic-template Component-Reuse Manifest format | extend — the template is a document, not a UI |

Phase 1 has no visual surface (build tooling only). If Phase 2 implementation discovers a needed visual element not covered above, the component-choice gate fires per CLAUDE.md.

## Scope

- [ ] **Phase 1 — tokens → Figma Variables:** add a Figma-Variables-compatible output target to `sd.config.mjs` (Style Dictionary v5) generating from `tokens/source/tokens.json`; document the import path (Tokens Studio plugin or native Variables import) in `docs/conventions/`; wire into `pnpm tokens:build`. — layer: tooling
- [ ] **Phase 1 — round-trip rule:** document the one-way flow (JSON → Figma, never Figma → JSON without a PR) in the same convention doc. — layer: docs
- [ ] **Phase 2 — content-model codegen:** script generating per-doc-type one-pagers from `apps/studio/schemas/` + `routes.js`: field names, types, required flags, full enum `options.list` values, canonical URL pattern, taxonomy display-field rule (`name` not `title`). Follow the `schemaManifest.js` build-time codegen pattern (SUG-114). — layer: tooling
- [ ] **Phase 2 — platform render:** publish the one-pagers at `/platform/design-system/content-models` (or equivalent) using the registry-page stack. — layer: frontend
- [ ] **Phase 3 — handoff template:** `docs/conventions/design-handoff-template.md` — structure: gap analysis against the detail-page recipe table (element → existing component → proposed change), Storybook story-ID citations (not pasted CSS), token names (not hex), schema fields copied from the Phase 2 one-pagers (not inferred from samples), explicit framework/router statement. Include an anti-checklist drawn from the seven SUG-162 corrections. — layer: docs/process
- [ ] **Phase 3 — recipe pointer:** CLAUDE.md gains a one-line rule: incoming design handoffs are evaluated against the template's anti-checklist before epic scoping. — layer: docs/process

## Phases

- **Phase 1 — Token bridge** (ships alone; proves the pipeline; mini-release)
- **Phase 2 — Content-model one-pagers** (codegen + platform page; mini-release)
- **Phase 3 — Handoff template + process rule** (docs-only; mini-release)

Phases are independent — any can ship without the others; order reflects value density (tokens are the highest-frequency drift surface).

## Acceptance criteria

- [ ] Phase 1: `pnpm tokens:build` emits a Figma-importable variables file; importing it into a test Figma file yields the 650 tokens with correct values; the generated file carries the "Do not edit directly" header and is covered by the pre-commit guard
- [ ] Phase 1: convention doc states the one-way flow and the import procedure; a designer can follow it without a developer present
- [ ] Phase 2: generated one-pager for `glossaryTerm` lists exactly the fields in the deployed schema — including `status` enum values `evergreen | validated | exploring` — and the canonical route `/glossary/:slug`; a handoff written from it could not reproduce any of SUG-162's four invented fields
- [ ] Phase 2: page renders at the platform route with real generated data; count assertion or staleness check per the SUG-114 pattern; route smoke-tested
- [ ] Phase 3: template exists; the SUG-162 handoff retro-fitted into it surfaces all seven corrections as template-mandated fields (the template is validated against the failure that motivated it)
- [ ] All phases: `pnpm validate:tokens --strict-colors` and `pnpm validate:css-names` exit 0; no new CSS classes without the proposal-table gate

## Technical notes

- **Content Write Gate:** does not fire — no Sanity content writes.
- **Schema changes:** none. The codegen reads schema source; it never modifies it.
- **Activation audits:**
  - Read `sd.config.mjs` for existing output targets before adding the Figma target; check Style Dictionary v5 community transforms for Figma Variables / W3C DTCG format support.
  - Read `apps/web/scripts/` `schemaManifest` codegen (SUG-112/114) — Phase 2 extends this pattern; confirm what it already extracts vs. what needs adding (enum lists, route mapping).
  - Read `registryParser.js` + the registry page component before building the one-pager renderer.
  - Confirm with Bex which Figma ingestion route is preferred (Tokens Studio plugin vs. native Variables REST import) before Phase 1 implementation — affects output format.
- **Upstream dependencies:** none hard. SUG-162 benefits if Phase 3 lands first but does not block on it.
- **Model & Mode:** `/model opusplan` — Phase 1–2 involve build-pipeline design; Opus plans the codegen shape, Sonnet executes.

## Model & Mode [REQUIRED]

`/model opusplan` — build-tooling architecture (Style Dictionary target, codegen extension) warrants planned Pre-Execution Gate; phases execute mechanically after.

## Non-Goals

- **Figma → code sync (two-way)** — explicitly one-way. Design proposes changes via PR to `tokens.json`, not by editing Figma Variables.
- **Figma Code Connect component mapping** — valuable but separate; scope here is tokens + schema/routes + process, not per-component Figma bindings. Candidate follow-on epic.
- **Storybook changes** — Storybook already serves as the component contract; this epic cites it, doesn't change it.
- **Retroactive correction of the SUG-162 handoff bundle** — the epic doc's corrections section already governs that work.

## Related

- **Linear:** [SUG-163](https://linear.app/sugartown/issue/SUG-163)
- **Trigger epic:** `docs/backlog/SUG-162-glossary-term-detail-design-handoff.md` (§Handoff corrections = the failure catalogue this epic prevents)
- **Patterns to extend:** token pipeline (SUG-86), schema manifest codegen (SUG-112/114), registry page (SUG-103)
- **Recipe:** `docs/conventions/detail-page-recipe.md`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, and Files to Modify at activation time
