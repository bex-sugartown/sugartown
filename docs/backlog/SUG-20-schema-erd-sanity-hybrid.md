---
**Epic:** SUG-20 — Schema ERD DS alignment + Sanity Hybrid (Option C)
**Linear Issue:** [SUG-20](https://linear.app/sugartown/issue/SUG-20/schema-erd-sanity-hybrid-option-c)
**Status:** Backlog
**Priority:** 🟣 Soon (activate between SUG-111 Phase 2 and Phase 3)
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-20 — Schema ERD DS alignment + Sanity Hybrid (Option C)

Align the Schema ERD page to use existing DS components and tokens, then make it embeddable via the Sanity section builder — so it can live at `/platform/diagrams` (SUG-111 Phase 3) without a hardcoded route.

## Background

The Schema ERD (`/platform/schema`) is a fully functional interactive page but was built before the DS component system matured. It uses a bespoke CSS module (`SchemaERD.module.css`) that bypasses `Card`, `Chip`, `SectionLabel`, `StatTile`, `Button`, and `SegmentedControl` — and hardcodes `border-radius: 6px / 4px / 3px` throughout, which contradicts the Pink Moon zero-radius aesthetic (`--st-radius-card: 0`, `--st-radius-button: 0`).

The page is currently a hardcoded route (`/platform/schema`). When SUG-111 Phase 3 ships, it moves to `/platform/diagrams`. At that point it should use DS components so it aligns visually with the rest of the platform section and picks up dark mode, token overrides, and future theme changes automatically.

**Phase 0 mock completed 2026-05-11:** `docs/drafts/SUG-20-schema-erd-ds-mock.html`

## Objective

After this epic, `SchemaERD.jsx` renders using DS primitives (`Card`, `Chip`, `SectionLabel`, `StatTile`, `Button`, `SegmentedControl`) with no hardcoded `border-radius`, `color`, or `background` values. Optionally, a `schemaErdSection` Sanity schema type allows the ERD to be placed on any page via the section builder — so the hardcoded `/platform/schema` route can be retired in favour of the platform page embedding it directly.

Layers touched: `apps/web/src/components/SchemaERD/SchemaERD.jsx`, `SchemaERD.module.css`. Optional: `apps/studio/schemas/sections/schemaErdSection.ts`, `PageSections.jsx`.

## Scope

**Phase 1 — DS component alignment (blocks SUG-111 Phase 3 diagrams route)**

- [ ] Replace bespoke header eyebrow/title pattern with standard `detailEyebrow` class from `pages.module.css` — layer: frontend
- [ ] Replace 4-stat bespoke bar with `StatTile` grid (`29 types`, `16 documents`, `13 objects`, `49 relationships`) — layer: frontend
- [ ] Replace bespoke filter tabs with `SegmentedControl` (exclusive one-active toggle matches semantics exactly) — layer: frontend
- [ ] Replace bespoke `.groupLabel` with `SectionLabel` component — layer: frontend
- [ ] Replace bespoke entity card shell with DS `Card` — internal field/rel list stays custom; only the outer shell and hover/selected state move to `Card` — layer: frontend
- [ ] Replace `.entityKind` / `.entityKindDoc` with `Chip size="xs"` (neutral for object, brand for document) — layer: frontend
- [ ] Replace bespoke sidebar panel shell with DS `Card` — layer: frontend
- [ ] Replace bespoke "Clear Selection" button with `Button variant="ghost" size="sm"` — layer: frontend
- [ ] Eliminate all hardcoded `border-radius` values in `SchemaERD.module.css`; replace with `var(--st-radius-card)`, `var(--st-radius-button)`, `var(--st-radius-tag)` as appropriate — layer: frontend
- [ ] Run `pnpm validate:tokens --strict-colors` and confirm zero violations — layer: tooling

**Phase 2 — Sanity Hybrid / section builder (optional, activate with SUG-111 Phase 3)**

- [ ] `schemaErdSection` schema type: fields `title (string)`, `description (text)`, `dataSource (enum: static)` — layer: schema
- [ ] Register in `schemas/index.ts` and add to `sections[]` on `page` doc type — layer: schema
- [ ] GROQ projection in `pageBySlugQuery` for the new section type — layer: query
- [ ] `PageSections.jsx` case: renders `<SchemaERD>` with static manifest data — layer: frontend
- [ ] Schema deploy — layer: infrastructure
- [ ] Add `schemaErdSection` to the Platform page in Sanity Studio; retire the hardcoded `/platform/schema` route in `App.jsx` once migration confirmed — layer: content

## Phases

**Phase 1 — DS alignment:** Pure component/CSS refactor. `SchemaERD.jsx` and `.module.css` only. No schema changes. Should ship before SUG-111 Phase 3 so the component is clean when it moves to `/platform/diagrams`.

**Phase 2 — Sanity Hybrid:** Schema type + section builder integration. Activate alongside or just before SUG-111 Phase 3. Enables the hardcoded route to be retired.

## Acceptance criteria

- [ ] Phase 0 mock approved (completed 2026-05-11 — see `docs/drafts/SUG-20-schema-erd-ds-mock.html`)
- [ ] `pnpm validate:tokens --strict-colors` passes with zero violations after Phase 1
- [ ] No hardcoded `border-radius`, `color`, or `background` hex/rgba values remain in `SchemaERD.module.css`
- [ ] Entity cards, sidebar, filter tabs, and stats bar are visually consistent with the rest of the site (zero-radius, token-driven)
- [ ] Phase 2 (if activated): `schemaErdSection` renders on the Platform page; `/platform/schema` redirects to the new location
- [ ] Chromatic VRT for the updated component

## Technical notes

- **Activation audit:** Before touching `SchemaERD.jsx`, read `SchemaERD.module.css` fully and confirm the full list of bespoke values to replace. The Phase 0 mock at `docs/drafts/SUG-20-schema-erd-ds-mock.html` annotates every substitution point.
- **SegmentedControl API:** check `packages/design-system/src/components/SegmentedControl/` for the prop API before wiring the filter strip.
- **Card shell for entity cards:** the entity card has a selected state (`box-shadow: 0 0 0 1px brand-primary`) and a dimmed state (`opacity: 0.3`). Check whether DS `Card` supports these — if not, extend via `className` prop override or a thin wrapper.
- **StatTile grid:** use the bg-through-gap pattern (`background: var(--st-color-rule-accent)` parent + `background: var(--st-card-bg)` on each tile child) to produce hairline dividers between stat tiles. Document the pattern with the `/* covers parent gap bg */` annotation per CLAUDE.md.
- **Sticky sidebar offset:** `top: 7.5rem` is hardcoded. Once SUG-111 PlatformLayout ships, verify this value accounts for the combined site header + platform sidebar nav height — it may need to change to `top: var(--st-space-platform-nav-offset)` or similar.
- **Phase 2 schema:** `schemaErdSection` is a simple wrapper — it has no content fields beyond title/description. The ERD data comes from `schemaManifest.js` (static). `dataSource: static` is the only supported value at this phase; `groq` is reserved for future dynamic codegen.
- **Model recommendation:** Phase 1 (component refactor) → `sonnet`. Phase 2 (schema + section builder) → `sonnet`.

## Non-Goals

- No dynamic GROQ-fetched schema data in this epic. ERD data stays in `schemaManifest.js`.
- No changes to `SchemaERD` component props API — it remains `{ entities, relationships }`.
- No Storybook story for `SchemaERD` in this epic (it's an app-level page component, not a DS primitive).
- No new `--st-*` tokens introduced unless a gap is discovered that has no existing token equivalent — if so, add the token and document it.

## Related

- **Linear:** [SUG-20](https://linear.app/sugartown/issue/SUG-20/schema-erd-sanity-hybrid-option-c)
- **Phase 0 mock:** `docs/drafts/SUG-20-schema-erd-ds-mock.html` — annotated DS substitution points + gap panel
- **SUG-111 Phase 3:** `/platform/diagrams` route — this epic must ship Phase 1 before that route goes live
- **SchemaERD source:** `apps/web/src/components/SchemaERD/SchemaERD.jsx` + `SchemaERD.module.css`
- **SchemaErdPage:** `apps/web/src/pages/SchemaErdPage.jsx`
- **Schema manifest:** `apps/web/src/data/schemaManifest.js`
- **Epic template:** `docs/epic-template.md`
