---
**Epic:** SUG-230 — DS link seam — injectable link component for framework-agnostic navigation
**Linear Issue:** [SUG-230](https://linear.app/sugartown/issue/SUG-230)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-230 — DS link seam — injectable link component

Add a link-injection seam to the 5 `@sugartown/design-system` components that hard-code `<a href>`, so each consuming app can supply its own router's link component.

## Background

`packages/design-system/package.json` describes the package as a "CMS-agnostic component library." Navigation is the one thing it is not agnostic about: `Card`, `Chip`, `Button`, `Breadcrumb`, and `IndexCell` all render bare `<a href>` elements with no injection point. Both current consumers are penalised by this:

- **apps/web** (React Router SPA) cannot consume those components at all. Re-exporting them would turn every card, chip, and button click into a full page reload. This is the blocker that parked SUG-224 at Phase 1 (2026-07-21) — and closing it inside SUG-224 was impossible, because SUG-224's own Non-Goals forbid DS API changes.
- **apps/contentful-poc** (Next.js) has the same degraded navigation in production today. It wants `next/link`; it gets `<a>`. Nobody has filed this, because the POC's pages are shallow enough that the reload isn't obvious.

The seam is therefore worth building on its own merits, independent of SUG-224: it is the difference between a package that claims framework-agnosticism and one that has it. Reference surfaces: the 5 named package components, `packages/design-system/src/index.ts`, both consuming apps' root render trees, and Storybook.

## Objective

After this epic, every linked element in the DS package resolves its link element through a single injectable seam with a documented default of `<a href>` (so existing consumers are unaffected until they opt in). apps/web can supply `react-router-dom`'s `Link` and apps/contentful-poc can supply `next/link` at their respective app roots, and the package itself imports no router. This epic changes the package's public API and render output for 5 components — it touches Storybook, Chromatic, and the DS component registry accordingly. It does not touch Sanity schema, GROQ, or content, and it does not migrate apps/web off its mirror components (that stays SUG-224's job).

## Scope

- [ ] Decide the injection mechanism (prop vs context vs polymorphic `as`) and record the decision with rationale in this doc — layer: design-system
- [ ] Implement the seam in `Card`, `Chip`, `Button`, `Breadcrumb`, `IndexCell`, defaulting to `<a href>` when nothing is injected — layer: design-system
- [ ] Add `Breadcrumb`, `ButtonGroup`, `IconButton` to `packages/design-system/src/index.ts` (currently absent from the barrel, so they are unimportable regardless of this epic) — layer: design-system
- [ ] Storybook stories covering both the default `<a>` path and an injected-link path, on `default` and `dark-pink-moon` — layer: Storybook
- [ ] Wire apps/contentful-poc to inject `next/link` and verify SPA-style navigation works — layer: frontend
- [ ] Document the seam in the package's CONSUMING.md (or equivalent) with a copy-paste example per framework — layer: docs

## Phases

**Phase 0 — Mechanism decision.** Compare prop / context / polymorphic `as` against the real constraint: `Card` renders `Chip` internally, so any prop-based approach must drill through composition. Produce a short written comparison with a recommendation. No mock required — this epic changes behaviour, not visual design, and the components' rendered appearance is unchanged by construction.

**Phase 1 — Seam implementation + Storybook.** Implement in all 5 components with the `<a href>` default preserved. Stories for both paths, both themes. Chromatic must show **zero** visual diffs — if it doesn't, the default path has regressed.

**Phase 2 — Consumer wiring + docs.** Inject `next/link` in apps/contentful-poc, verify navigation, write the consuming docs. apps/web wiring is explicitly deferred to SUG-224.

## Acceptance criteria

- [ ] The injection mechanism decision is recorded in this doc with its rationale before any implementation commit
- [ ] All 5 components accept an injected link component and fall back to `<a href>` when none is supplied
- [ ] `packages/design-system/src/` contains no import of `react-router-dom`, `next/link`, or any other router — verified by grep
- [ ] Chromatic shows zero visual diffs on the default (non-injected) path for all 5 components
- [ ] Storybook covers default + injected paths for each of the 5, rendering correctly on `default` and `dark-pink-moon`
- [ ] `Breadcrumb`, `ButtonGroup`, and `IconButton` are exported from the package barrel
- [ ] apps/contentful-poc navigates client-side (no full page reload) on a Card title link, verified in the browser
- [ ] Consuming documentation includes a working example for both React Router and Next.js

## Human QA Walkthrough — example local pages

> Activation audit: this epic's visible surface is apps/contentful-poc (Phase 2) and Storybook,
> not apps/web — apps/web still renders its own mirror components until SUG-224 runs. Build the
> walkthrough table from the contentful-poc routes that render Card/Chip/Button, plus the
> Storybook stories for all 5 components on both themes. Read `apps/contentful-poc`'s route
> definitions at activation; do not assume the route list from memory.

## Technical notes

- **This is a DS API change.** Full DS component ceremony applies: token-first rule, Storybook coverage on both themes as a shipping AC, Chromatic, and the component registry updated.
- **The default path is the safety net.** Every component keeps `<a href>` when nothing is injected, so the change is additive and no existing consumer breaks. A Chromatic diff on the default path means the seam leaked into the default render — treat it as a defect, not a baseline to accept.
- **Not blocked by SUG-217/218/219.** Those are CSS-only; this is API/render. Running them in parallel is the point — it shortens SUG-224's critical path rather than extending the queue.
- **Composition constraint drives the mechanism choice:** `Card` renders `Chip` internally for tags/tools, and `Card` also renders category/project/kpi/footer links. A prop-based seam means either drilling `linkComponent` from Card into Chip, or every consumer passing it at every call site. React context set once at the app root avoids both. Weigh this against context's downsides (implicit dependency, harder to test in isolation, needs a provider in Storybook) before deciding.
- **Activation audits:**
  - Re-read all 5 components — SUG-224's Phase 1 classification is dated 2026-07-21 and the CSS epics may have touched them since.
  - Check whether `apps/contentful-poc` already wraps its tree in any provider that a LinkProvider could join, rather than adding a second one.
  - Confirm the esbuild build (`packages/design-system/build.mjs`) handles whatever mechanism is chosen — context adds a module-level singleton, which interacts with the `packages: 'external'` setting.

## Model & Mode [REQUIRED]

`/model opus` + plan mode for Phase 0 (the mechanism decision is a genuine API-design trade-off with composition and testing implications), then `/model sonnet` for Phases 1–2 execution.

## Non-Goals

- **Migrating apps/web onto the package.** That is SUG-224. This epic only removes the blocker.
- **Any visual change to the 5 components.** Rendered output must be pixel-identical on the default path; that is an AC, not an aspiration.
- **Reconciling the JS divergence in those components** (e.g. Chip's missing `hasColorDot`, Breadcrumb's DOM differences) — that is SUG-231. Where the two epics touch the same file, SUG-231's reconciliation and this epic's seam are separate commits.
- **Adding link injection to web-only components** (Tile, SidebarNav) — they live in apps/web and already use `react-router-dom` directly.

## Related

- **Linear:** [SUG-230](https://linear.app/sugartown/issue/SUG-230)
- **Blocks:** [SUG-224](https://linear.app/sugartown/issue/SUG-224) — apps/web consumes @sugartown/design-system
- **Sibling:** [SUG-231](https://linear.app/sugartown/issue/SUG-231) — JS divergence reconciliation (same 5 files in part, different axis)
- **Origin:** `docs/backlog/SUG-224-apps-web-consumes-design-system-package.md` §Phase 1 Findings, Blocker 1
- **Epic template:** `docs/epic-template.md`
