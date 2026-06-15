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

After this epic, every layer a handoff can get wrong has a design-ingestible source of truth: content-model one-pagers (fields, types, enums, canonical routes) are generated from schema source and published on the platform DS pages (Phase 1); and handoffs arrive on a template that starts from the detail-page recipe and cites Storybook story IDs instead of reconstructed CSS (Phase 2). The Figma Variables token bridge is **benched** (Phase 3, deferred): Figma is not currently in the workflow (decision 2026-06-11); design references token names via Storybook + the published token docs, which the template mandates. Layers touched: **tooling** (codegen), **frontend** (platform DS page render), **docs/process** (handoff template + convention). No Sanity schema changes; no content writes.

## Component-Reuse Manifest

| Visual element | Existing component / shared class | Decision |
|---|---|---|
| Content-model one-pager page (Phase 2) | Platform DS page shell + `Table`/`DataTable` + `SectionLabel` + `CodeBlock` (same stack as `/platform/design-system/registry`) | use — registry page (`registryParser.js` pattern) is the reference implementation; no new components anticipated |
| Handoff template (Phase 3) | `docs/conventions/detail-page-recipe.md` table format + epic-template Component-Reuse Manifest format | extend — the template is a document, not a UI |

If Phase 1 implementation discovers a needed visual element not covered above, the component-choice gate fires per CLAUDE.md.

## Scope

- [ ] **Phase 1 — content-model codegen:** script generating per-doc-type one-pagers from `apps/studio/schemas/` + `routes.js`: field names, types, required flags, full enum `options.list` values, canonical URL pattern, taxonomy display-field rule (`name` not `title`). Follow the `schemaManifest.js` build-time codegen pattern (SUG-114). — layer: tooling
- [ ] **Phase 1 — platform render:** publish the one-pagers at `/platform/design-system/content-models` (or equivalent) using the registry-page stack. — layer: frontend
- [ ] **Phase 2 — handoff template:** `docs/conventions/design-handoff-template.md` — structure: gap analysis against the detail-page recipe table (element → existing component → proposed change), Storybook story-ID citations (not pasted CSS), token names (not hex), schema fields copied from the Phase 1 one-pagers (not inferred from samples), explicit framework/router statement. Include an anti-checklist drawn from the seven SUG-162 corrections. — layer: docs/process
- [ ] **Phase 2 — recipe pointer:** CLAUDE.md gains a one-line rule: incoming design handoffs are evaluated against the template's anti-checklist before epic scoping. — layer: docs/process

## Phases

- **Phase 1 — Content-model one-pagers** (codegen + platform page; mini-release)
- **Phase 2 — Handoff template + process rule** (docs-only; mini-release)
- **Phase 3 — Token bridge (BENCHED)** — Figma Variables output from `tokens/source/tokens.json`. Deferred 2026-06-11: Figma is not currently in the workflow. Reactivate only when a Figma (or equivalent token-consuming design tool) adoption decision is made; the open Tokens-Studio-vs-native-import question goes with it.

Phases 1–2 are independent — either can ship without the other. Recommended order after SUG-162: Phase 2 (template, docs-only, fastest value) then Phase 1.

## Acceptance criteria

- [ ] Phase 1: generated one-pager for `glossaryTerm` lists exactly the fields in the deployed schema — including `status` enum values `evergreen | validated | exploring` — and the canonical route `/glossary/:slug`; a handoff written from it could not reproduce any of SUG-162's four invented fields
- [ ] Phase 1: page renders at the platform route with real generated data; count assertion or staleness check per the SUG-114 pattern; route smoke-tested
- [ ] Phase 2: template exists; the SUG-162 handoff retro-fitted into it surfaces all seven corrections as template-mandated fields (the template is validated against the failure that motivated it)
- [ ] All phases: `pnpm validate:tokens --strict-colors` and `pnpm validate:css-names` exit 0; no new CSS classes without the proposal-table gate

## Technical notes

- **Content Write Gate:** does not fire — no Sanity content writes.
- **Schema changes:** none. The codegen reads schema source; it never modifies it.
- **Activation audits:**
  - Read `apps/web/scripts/` `schemaManifest` codegen (SUG-112/114) — Phase 1 extends this pattern; confirm what it already extracts vs. what needs adding (enum lists, route mapping).
  - Read `registryParser.js` + the registry page component before building the one-pager renderer.
- **Upstream dependencies:** none hard. SUG-162 benefits if Phase 2 lands first but does not block on it.
- **Benched Phase 3 (token bridge) notes, preserved for reactivation:** add a Figma-Variables-compatible output target to `sd.config.mjs` (Style Dictionary v5); document one-way flow (JSON → Figma, never reverse without a PR); generated file carries the "Do not edit directly" header + pre-commit guard; AC was import-into-test-file yields all 650 tokens.
- **Model & Mode:** `/model opusplan` — Phase 1 involves build-pipeline design; Opus plans the codegen shape, Sonnet executes.

## Model & Mode [REQUIRED]

`/model opusplan` — build-tooling architecture (codegen extension) warrants planned Pre-Execution Gate; phases execute mechanically after.

## Non-Goals

- **Any Figma integration (token bridge, Code Connect, two-way sync)** — benched with Phase 3 until a design-tool adoption decision exists. When reactivated: strictly one-way (JSON → tool), changes return as PRs.
- **Storybook changes** — Storybook already serves as the component contract; this epic cites it, doesn't change it.
- **Retroactive correction of the SUG-162 handoff bundle** — the epic doc's corrections section already governs that work.

## Related

- **Linear:** [SUG-163](https://linear.app/sugartown/issue/SUG-163)
- **Trigger epic:** `docs/backlog/SUG-162-glossary-term-detail-design-handoff.md` (§Handoff corrections = the failure catalogue this epic prevents)
- **Patterns to extend:** token pipeline (SUG-86), schema manifest codegen (SUG-112/114), registry page (SUG-103)
- **Recipe:** `docs/conventions/detail-page-recipe.md`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, and Files to Modify at activation time
