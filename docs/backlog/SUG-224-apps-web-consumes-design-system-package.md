---
**Epic:** SUG-224 — apps/web consumes @sugartown/design-system
**Linear Issue:** [SUG-224](https://linear.app/sugartown/issue/SUG-224)
**Status:** In Progress — 🟢 **Phase 0, 1, 1b, 2, 3 complete; Phase 4 batch 1+2 complete, 2026-07-24.** Disposition table filled (44/44), decisions A/B/C recorded, Non-Goals amended. `apps/web` now depends on `@sugartown/design-system`; package `Button` accepts `href` (`0bb66ecc`); `LinkProvider` mounted at the app root (`d9a4a481`); package Storybook coverage + title-collision resolution for Accordion/Breadcrumb/ButtonGroup/Callout/IconButton (`85234285`); **26/44 mirror components converted to re-exports** (`545df6ff`). **Batch 2 (2026-07-24): Breadcrumb/Chip/IndexCell (P2, router-import-only) + Button (P1b, already had parity) converted cleanly. Card (P2) required a decision D first — see below — before converting: 31/44 now converted.** **Next: Phase 4 batch 3 — the 7 diverged components (P4, need JS reconciliation).**
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

> **⚠️ Read §Phase 1 Findings and §Re-phased 2026-07-22 before touching anything.**
>
> Phase 1 ran 2026-07-21 and parked the epic. **All four blockers are now resolved or scheduled:**
> Blocker 1 (no link seam) — solved upstream by SUG-230, which shipped v0.29.4; `apps/web` just
> needs to mount a `LinkProvider`. Blocker 2 (unachievable structural-closure AC) — AC amended
> 2026-07-22, replaced by a 44-row disposition table. Blocker 3 (CSS epics) — SUG-217/219 shipped,
> SUG-218 absorbed into SUG-231, and `KNOWN_DRIFT` is **empty**. Blocker 4 (package `Button` has no
> `href`) — inherited from SUG-231 and scheduled as Phase 1b.
>
> **Entry point is Phase 0**, which is spec work only: complete the disposition table and confirm
> no remaining AC is unachievable. The epic parked the first time because execution started against
> a spec that could not pass — do not skip it.

# SUG-224 — apps/web consumes @sugartown/design-system

Make apps/web consume `@sugartown/design-system` as a real workspace dependency, replacing the hand-synced mirror components at `apps/web/src/design-system/` with direct re-exports from the package.

## Background

apps/web does not depend on `@sugartown/design-system` at all: it renders a separately maintained JSX mirror of every DS component (`apps/web/src/design-system/components/`), with a header TODO in `Card.jsx` acknowledging the gap. The mirror is a manual drift rule — only the style files are validator-checked (`validate-style-mirror.js`), and the component copies have already required a registry entry in CLAUDE.md §Mirrored File Registry to manage. The trigger: the SUG-127 POC proved the package runs unchanged on a second stack (Contentful/Next.js/Vercel), and the platform-is-the-portfolio case study's agnostic-stack diagram now honestly draws production consumption as a dashed roadmap arrow (`docs/diagrams/redpen-platform-is-the-portfolio.md`). This epic turns that arrow solid. Affected surfaces: every page in apps/web that renders a DS component, plus Storybook (pinkmoon) and the Vite build.

## Objective

After this epic, `apps/web/package.json` declares `@sugartown/design-system: workspace:*` and every file under `apps/web/src/design-system/components/` is either a thin re-export from the package or deleted, with imports updated to hit the package directly. The JSX↔TSX build boundary is handled in Vite config (package consumed as source or as built output — decided in Phase 1). No Sanity schema, GROQ, or content changes — render layer and build tooling only. CLAUDE.md's Mirrored File Registry row for DS component mirrors is retired in the same close-out, and `docs/diagrams/diagram-portfolio-agnostic-stack.svg` is updated (dashed arrow → solid) with its red-pen table row reclassified from roadmap to enforced-by-code.

## Scope

> **Every Scope item below names its phase** (added 2026-07-22 — SUG-231 shipped with a Scope item, Table's `.wide`, that belonged to no phase at all and would have gone unnoticed).

- [x] **Phase 0 —** Fill in the per-component **disposition table** below: all 44 web component directories classified re-export / promote / stays-web-only, with a reason on every stays-web-only row — layer: docs ✅ 2026-07-23 (26 re-export · 4 P2 · 1 P1b · 7 P4 · 4 promote · 2 web-only)
- [x] **Phase 0 —** Amend §Acceptance criteria and §Non-Goals per Blockers 2 and 4 (done 2026-07-22); decisions A/B/C recorded 2026-07-23; verified no remaining AC is unachievable — layer: docs
- [x] **Phase 1b —** Add `href` to the package `Button` via the SUG-230 seam; decide `target="_blank"`/`rel` — layer: design-system ✅ 2026-07-23 (commit `0bb66ecc`) — target/rel brought to package per decision C
- [x] **Phase 2 —** Mount `LinkProvider` in `apps/web` supplying `react-router`'s `Link`; verify SPA nav unchanged on a real page — layer: frontend ✅ 2026-07-23 (commit `d9a4a481`)
- [x] **Phase 3 —** Add package Storybook stories for Accordion, Breadcrumb, ButtonGroup, Callout, IconButton; resolve the `Components/<Name>` title collision — layer: Storybook ✅ 2026-07-23 (commit `85234285`)
- [x] **Phase 1 —** Add `@sugartown/design-system` as a workspace dependency of apps/web — layer: tooling ✅ 2026-07-23 (commit `d9a4a481`) — the un-executed mechanical remainder of the Phase 1 decision spike (spike ran 2026-07-21 read-only, decided the strategy, "wired no dependency"); executed now as a hard prerequisite to Phase 2
- [x] Resolve the JSX↔TSX consumption strategy (source vs built package, CSS module handling, `exports` map coverage) and record it as a decision note in this doc — layer: tooling — **retroactively tagged Phase 1 2026-07-23** (was missing a phase tag — see §Phase 0 note below); decision recorded 2026-07-21 in §Phase 1 Findings
- [ ] Replace each mirror component in `apps/web/src/design-system/components/` with a re-export from the package (or delete + update import sites) — layer: frontend — 🔶 **31/44 converted 2026-07-24** (Phase 4 batch 1+2): AppShell, Avatar, Blockquote, Box, ButtonGroup, Citation, Columns, DescriptionList, ErrorMessage, Field, HelperText, IconButton, IndexGroup, Input, Label, List, Meter, Metric, Page, ScoreRing, SegmentedControl, Skeleton, Surface, Swatch, Table, Textarea (`545df6ff`, batch 1) + Breadcrumb, Chip, IndexCell, Button, Card (batch 2, 2026-07-24 — Card required decision D, package API gained `children`/`footerChildren`/`thumbnailClassName`/`thumbnailStyle`/external-href target-rel). Remaining: 7 diverged (P4, need JS reconciliation), 4 promotions (Phase 5), 2 stay web-only.
- [ ] Dedupe mirrored component CSS modules (package copy becomes the only copy) — layer: frontend — 🔶 31/38 done (converted directories were deleted wholesale, so their CSS modules are already deduped — package copy is now the only copy for those)
- [ ] Storybook (pinkmoon) resolves the package build without breaking HMR or Chromatic baselines — layer: Storybook
- [ ] Retire the DS-component-mirror row from CLAUDE.md §Mirrored File Registry and the web-adapter-sync steps in `docs/epic-template.md` §Design System → Web Adapter Sync — layer: tooling/docs
- [ ] Update `docs/diagrams/diagram-portfolio-agnostic-stack.svg` (dashed → solid) + red-pen table, and propose the matching case study caption/legend change through the Content Write Gate — layer: content
- [ ] Full visual QA across all page types on both themes — layer: frontend

## Phases

**Phase 1 — Consumption spike (decision ships, no page changes).** ✅ **COMPLETE 2026-07-21** — decision recorded in §Phase 1 Findings. Ran as a read-only audit; no dependency was wired and no branch state was produced, because the spike surfaced three blockers that must be resolved first. ~~Prove one component (Card)~~ — when execution resumes, spike a pure mirror, not Card (see Corrections).

---

### Re-phased 2026-07-22 (SUG-231 post-mortem)

The original Phases 2–3 assumed the only work left was mechanical replacement. It isn't, and the epic parked once already because the AC could not pass. Phases below are ordered by what unblocks what, not by tidiness.

**Inventory verified 2026-07-22 by direct count, not read from this doc:** 44 web component dirs, 38 package dirs — **38 paired, 6 web-only, 0 package-only.** 23 web files declare themselves mirrors. 6 web *implementations* import `react-router`: `Card`, `Chip`, `Tile`, `Button`, `Breadcrumb`, `IndexCell`.

**The unlock that changes this epic's shape:** SUG-230's link seam already covers **Card, Chip, Breadcrumb, IndexCell and List** in the package, and `apps/web` does **not** yet mount a `LinkProvider` — only `apps/contentful-poc` does. Mounting one at the web root converts five of the six router-importing adapters into plain re-exports. Blocker 1 ("the package hard-codes `<a href>`, and fixing it needs a DS API change our Non-Goals forbid") is therefore already solved upstream; what remains is wiring, not design.

**Note (found + fixed 2026-07-23, during Phase 2 execution):** two Scope rows were unphased —
"Add `@sugartown/design-system` as a workspace dependency of apps/web" carried a stray "Phase 1"
tag that didn't correspond to any walkthrough step below (the walkthrough's "Phase 1" is the
*completed spike*, not this mechanical follow-through), and "Resolve the JSX↔TSX consumption
strategy..." carried no phase tag at all. Both are the Phase 1 spike's undone mechanical remainder
(the spike explicitly "wired no dependency"). Retagged both as Phase 1 and executed as a hard
prerequisite to Phase 2 (LinkProvider needs the package importable). Same failure shape as the
Incomplete Epic Doc Hard Stop's rule 6 (`Scope ∖ Phases` must be empty) — caught mid-epic rather
than at activation, so noting it here instead of treating it as a fresh block.

**Phase 0 — Fix the spec before touching code.** Amend §Scope, §Acceptance criteria and §Non-Goals per Blockers 2 and 4. Specifically: replace the `grep`-returns-zero structural-closure AC with an explicit per-component **disposition table** (re-export / stays web-only / promoted to package), and drop the "no API changes" Non-Goal, which makes Blocker 4 unresolvable inside the epic that owns it. No code. Output: an epic whose ACs can actually pass.

**Phase 1b — Package `Button` gains `href` (Blocker 4).** ✅ **COMPLETE 2026-07-23** (commit `0bb66ecc`). Consumed the SUG-230 seam for internal hrefs; `target="_blank"`/`rel="noopener noreferrer"` brought to the package for external hrefs (decision C) — overrides the seam's default for Button only. Verified in Storybook light + dark-pink-moon. Sole remaining hard prerequisite, now cleared. Inherited from SUG-231, which correctly refused to decide it in isolation.

**Phase 2 — Mount `LinkProvider` in `apps/web`.** ✅ **COMPLETE 2026-07-23** (commit `d9a4a481`). One provider (`apps/web/src/components/DesignSystemProvider.jsx`) mounted at the app root, inside `BrowserRouter`, wrapping `App`, supplying a `RouterLinkAdapter` per the documented pattern in `packages/design-system/CONSUMING.md` §React Router. No component consumes the seam yet (that's Phase 4) — this is pure prep, zero visible effect on any page today.

Verified via a temporary smoke test (not committed — added and removed within this session): rendered the package's `Link` directly on the `/dev/tables` sandbox page, clicked it, confirmed a JS marker set before the click survived the navigation (proof of client-side `pushState`, since a full reload would wipe the JS context). Also confirmed an unrelated, pre-existing app nav link still navigates via SPA routing — no regression from the new provider wrapper. Highest-leverage step in the epic: it retires the adapter justification for five components at once (Phase 4).

**Operational note:** wiring the workspace dependency mid-session (while the Vite dev server was already running) produced a `504 Outdated Optimize Dep` on `react/jsx-runtime` and a blank page — the package's built `dist/index.mjs` pulls the prod jsx-runtime, which wasn't in Vite's already-optimized deps cache. Fixed by a full dev-server restart (not just a browser reload). Future phases that add new package-level imports to `apps/web` should expect the same and restart the dev server proactively rather than debugging a blank page.

**Phase 3 — Storybook coverage for the surviving copy.** ✅ **COMPLETE 2026-07-23** (commit `85234285`). Package stories added for **Accordion, Breadcrumb, ButtonGroup, Callout, IconButton**. Resolved the `Components/<Name>` title collision by deciding the package survives (per decision A / disposition table) — retired the 5 colliding web-side story files (git recorded as renames). Breadcrumb and ButtonGroup lost their `MemoryRouter` decorators in the port: the package renders through the DS Link seam, which falls back to a plain `<a>` when no `LinkProvider` is mounted (Storybook doesn't mount one). Added a new Breadcrumb story exercising the package's fixed `isCurrent` logic (a linked final crumb no longer wrongly gets `aria-current`) — the one behavioral improvement over the web copy the code comments already called out. IconButton got net-new package coverage (neither tree had one) ported from `apps/web/src/components/IconButton.stories.tsx`, dropping only the composite `ThemeToggle (live)` story (that usage coverage already lives in `ThemeToggle`'s own story, untouched). Verified via a fresh Storybook tab and a direct `/index.json` fetch: exactly one `Components/<Name>` entry per component, zero duplicates. All 5 spot-checked in light + dark-pink-moon, no console errors. Must precede Phase 4 so Chromatic has baselines for the components being migrated. Without this, migration is unverifiable — the absence of these five stories is what let all the SUG-217/218/219/231 drift go unseen in the first place.

**Operational note:** deleting story files mid-session while Storybook's dev server was running left a stale in-memory duplicate-ID error that neither a page reload nor a full dev-server restart cleared on the already-open tab — required also opening a fresh browser tab to see the corrected index. The server-side `/index.json` was actually correct immediately after the restart; only the existing tab's client-side state was stale. Future phases that delete/rename story files should verify via a fresh tab (or a direct `/index.json` fetch) rather than trusting a reload of an already-open Storybook tab.

**Phase 4 — Convert the pure mirrors in batches.** Re-export from the package, delete the web implementation, dedupe the CSS module. Chromatic between batches. Mechanical once Phases 1b–3 land.

**Batch 1 — ✅ COMPLETE 2026-07-23** (commit `545df6ff`). All 26 "re-export now" pure mirrors converted: barrel (`apps/web/src/design-system/index.js`) re-pointed for the 23 barrel-listed ones; 12 consumer files updated where a component was imported directly from a subpath rather than the barrel (a mixed convention that pre-existed this epic — `Form.jsx`, `ThemeToggle.jsx`, `KnowledgeGraph.jsx`, `AlphaFilter.jsx`, `SchemaERD.jsx`, `CwvSnapshot.jsx`, `GovernancePage.jsx`, `TablesDevPage.jsx`, `TrustReportSection.jsx`, `DesignSystemRegistryPage.jsx`, `ContentModelsPage.jsx`, `DesignSystemPage.jsx`); all 26 web component directories deleted. Verified: zero remaining references to any deleted local path (grepped before deleting); `validate:style-mirror` now reports exactly 26 DS-package-only (matches); all validators + lint clean; live-verified in a fresh browser tab on homepage, `/platform/governance`, `/dev/tables`, and the header theme toggle (IconButton — clicked, confirmed working, dark theme applied).

**Caught before it happened:** an early grep-based batch script accidentally included `stack` in the "safe to convert" list. Cross-checked against the Phase 0 classification before touching any file — `Stack` is in the *diverged* bucket (re-export P4, needs JS reconciliation), not pure mirror. Excluded from batch 1.

**Operational pattern confirmed again:** deleting files mid-session while the Vite dev server is running produces stale HMR "failed to reload" errors that persist even after a full dev-server restart — but only in browser tabs that were already open. A fresh tab shows the correct, clean state immediately. Same root cause as the Storybook stale-index issue in Phase 3. Future batches: after any file-deletion batch, verify in a **new** tab, not a reload of an existing one.

**Regression caught post-batch, fixed same day (commit `980e7af4`):** batch 1 converted the JS/JSX imports for all 26 components but never wired `@sugartown/design-system/styles.css` into `apps/web/src/main.jsx` — despite this exact gap being flagged and explicitly deferred to "Phase 4 (first batch conversion)" in the Phase 2 operational note above. The converted components' JSX resolves to the package's build, which references classnames hashed by esbuild, not Vite — with no stylesheet on the page defining those classnames, every converted component lost all CSS (zero borders, zero zebra striping, buttons rendering as unstyled native `<button>`s) while structure and content stayed intact, since JS doesn't need CSS to run. This is why it passed lint/typecheck/every validator and even my own post-batch live-page spot-checks — I confirmed pages rendered with no console errors but never inspected *computed* CSS values on the converted components. Caught only when Bex reported `/dev/tables` visually losing styling. Fixed by adding the import; verified via `getComputedStyle` on Table (`tbody td` zebra bg + border) and IconButton (border + border-radius) showing real token-backed values, not defaults.

**Process note for future batches:** a page rendering with no console errors is not sufficient evidence a CSS-affecting change is correct — check computed styles on the actual affected elements, not just presence/absence of errors.

**Second regression, same batch, caught by the `/eod` Chromatic pre-flight (commit `37e67a66`):** Storybook's build failed entirely — `PageHeader.stories.jsx` and `apps/web/src/components/IconButton.audit.stories.tsx` (a second, differently-titled IconButton story deliberately left alone in Phase 3) still imported `Avatar`, `DescriptionList`, and `IconButton` by their now-deleted relative paths. Neither surfaced in any dev-server page check, because neither is reachable from `apps/web`'s own routes — they're Storybook-only files. Grepping the 26 deleted component paths across `apps/web/src` (batch 1's own verification) missed `apps/web/src/components/*.stories.tsx` because that grep was scoped to component-consumer files, not story files. Fixed; local `storybook:build` and a full Chromatic run (build 80, 356 snapshots) both pass clean. **Lesson for remaining batches:** grep for a deleted component's import path across the *entire* `apps/web/src` tree including `*.stories.*`, and run `storybook:build` (not just the dev-server pages) before considering a deletion batch verified.

**Third instance of the same root cause, caught by Bex reviewing Chromatic build 80 (commit `b4785fc3`):** Storybook is a separate build with its own entry (`apps/storybook/.storybook/preview.ts`), which never imported the package's built CSS either — same gap as `apps/web/src/main.jsx` (`980e7af4`), just in a second location. Every `Patterns/*` and page-level story that composes a component through `apps/web`'s design-system barrel (which now re-exports many components from the built package) rendered with zero CSS for those components: PageHeader's Avatar, DescriptionList, the Form pattern (Field/Input/Textarea), Citation text, IconButtonAudit. Package-*source* stories (`packages/design-system/src/components/**/*.stories.tsx`) were never affected — Vite processes their own `.module.css` imports directly — which is why Phase 3's spot-checks (all package-source stories) looked clean and this didn't surface until Chromatic actually rendered the web-side composite stories. Fixed by the same `@sugartown/design-system/styles.css` import, added to `preview.ts`. Chromatic build 81 (post-fix) dropped from 45 visual changes to 20.

**Standing lesson across all three instances:** "consumed via the built package" has exactly two entry points that each need the CSS bundle wired in independently — `apps/web/src/main.jsx` and `apps/storybook/.storybook/preview.ts`. Any future third consumer of `@sugartown/design-system` (e.g. if `apps/contentful-poc` patterns ever route through this same barrel) needs the same check.

**Batch 2 — ✅ COMPLETE 2026-07-24.** Breadcrumb, Chip, IndexCell (P2) and Button (P1b) converted after confirming each was genuinely router-import-only (CSS byte-identical, JS parity verified line-by-line). Card required an extra step first:

**Decision D (2026-07-24) — Card's disposition-table entry ("re-export (P2) — router import only") was incomplete.** Diffing web Card.jsx against the package (430 vs 382 lines, not the 340 recorded at Phase 1) surfaced three real prop divergences beyond routing, all load-bearing in `CardBuilderSection.jsx` (a live consumer, not dead code):
- `children` — custom Portable Text body content
- `footerChildren` — custom footer content (citations)
- `thumbnailClassName` / `thumbnailStyle` — overlay/effect treatment + hotspot-driven `object-position` on the thumbnail wrapper

A straight re-export would have silently dropped all three — React ignores unknown props with no warning, so the PT body, citations, and thumbnail overlays would vanish with zero console error, passing every check except looking at the actual page. Same failure shape as the batch-1 CSS-import regressions.

Presented to Bex as a choice: defer Card to batch 3 (reclassify P4) vs. port the props into the package now (same pattern as Button's decision C). **Decision: port now.** All four props added to `packages/design-system/src/components/Card/Card.tsx` (`CardProps` interface + render logic), faithfully mirroring the web adapter's exact structure (including the footer's conditional-wrapper shape, so a footer with only `footerChildren` and no standard fields doesn't render empty `footerLeft`/`footerRight` divs). Storybook coverage added: `WithBodyAndFooterChildren`, `WithThumbnailOverride`.

**A second, related gap found in the same pass:** web Card's title link uses `getLinkProps()` to add `target="_blank" rel="noopener noreferrer"` for external hrefs; the package Card's title link went through the DS Link seam, which deliberately omits target/rel for external links (SUG-230 editorial choice). `CardBuilderSection`'s `resolveLinkHref()` can genuinely produce an external URL from a Sanity `titleLink` of `type="external"`, so this was a real regression risk, not theoretical. Fixed the same way as decision C: Card's title link now branches on `isExternalHref()` and renders a plain `<a target="_blank" rel="noopener noreferrer">` for external hrefs, bypassing the seam for that one case. Storybook coverage added: `WithExternalHref`. (The seam's self-link normalization — `toInternalPath()` treating an absolute same-origin URL as internal — was *not* ported; that's a pre-existing, already-accepted gap across every seamed component, not specific to Card, and out of scope here.)

Verified live on `/ds-section-showcase` (a real published page with `cardBuilderSection` blocks): package-styled cards render with real PT body content, citation footers (`Card-module__footer` containing a `Citation-module__zone`), and thumbnail overlay classes (`_cardDuotoneExtreme_`, `_cardColorOverlay_`) all present with correct computed styles — not just structurally present with no console error.

**Remaining for Phase 4:** the 7 diverged components (re-export P4 — Accordion, Callout, CodeBlock, Container, FilterBar, Media, Stack — need JS reconciliation per decision A before conversion, plus Chromatic verification).

**Phase 5 — Dispose of the remainder explicitly.** ✅ **Verdicts decided in Phase 0 (2026-07-23):** of the 6 web-only components, **`Grid`, `PageHeader`, `SectionLabel`, `Sidebar` are promoted to the package** (DS primitives, zero app coupling — see amended §Non-Goals), and **`SidebarNav` (couples to `useScrollspy`) and `Tile` (couples to `linkUtils` + react-router) stay web-only.** Phase 5 executes the four promotions (TSX port + package story + dark-mode story + Chromatic baseline + barrel export each). This is what closes the AC honestly instead of fudging a `grep`.

**Phase 6 — Docs + diagram close-out.** Retire the DS-component-mirror row from CLAUDE.md §Mirrored File Registry and the web-adapter-sync steps in `docs/epic-template.md`; update `validate-style-mirror.js` scope; diagram dashed→solid + caption via the Content Write Gate.

## Phase 1 Findings (2026-07-21) — decision shipped, execution parked

Phase 1 ran as a read-only consumption spike (Opus, no code written). Every activation audit in §Technical notes was executed. Findings below supersede the assumptions in §Background and §Non-Goals where they conflict.

### Decision: consumption strategy (the Phase 1 deliverable)

**Consume the built package via its `exports` map.** `apps/web/package.json` declares `@sugartown/design-system: workspace:*`; imports resolve `@sugartown/design-system` → `dist/index.mjs`; styles come from a single `@sugartown/design-system/styles.css` import in `main.jsx`, placed **before** app CSS. Turbo gains a build-ordering dependency (package builds before web).

Rejected alternative: aliasing `@sugartown/design-system` to `packages/design-system/src` in Vite config. It is lower-risk (Vite-native CSS module handling preserved, HMR across the boundary retained) but it is source-sharing, not package consumption — it would not honestly support the agnostic-stack diagram's solid-arrow claim, which is this epic's whole purpose.

**Known risk carried by this decision:** DS component CSS moves from per-module injection (Vite decides order from the import graph) to one pre-built 79KB stylesheet. Cascade order relative to app-level CSS (`pages.module.css` et al.) shifts. Chromatic is the net; "it builds" proves nothing here.

Package build verified working at decision time: `dist/index.css` 78.7kb, `dist/index.mjs` 73.0kb, `dist/index.js` 80.3kb.

### The mirrors are not mirrors — full classification of all 38 pairs

| Class | Count | Components |
|---|---|---|
| **Pure mirror** | 26 | AppShell, Avatar, Blockquote, Box, ButtonGroup, Citation, Columns, DescriptionList, ErrorMessage, Field, HelperText, IconButton, IndexGroup, Input, Label, List, Meter, Metric, Page, ScoreRing, SegmentedControl, Skeleton, Surface, Swatch, Table, Textarea |
| **Adapter** (genuine functional differences) | 6 | Breadcrumb, Button, Card, Chip, IndexCell, Media |
| **Diverged** (drifted, neither canonical) | 6 | Accordion, Callout, CodeBlock, Container, FilterBar, Stack |

Plus 6 web-only components with no package counterpart (Grid, PageHeader, SectionLabel, Sidebar, SidebarNav, Tile) and zero package-only components.

### Blocker 1 — there is no link seam, and adding one violates this epic's Non-Goals

The package hard-codes `<a href>` in Card, Chip, Button, Breadcrumb, and IndexCell. apps/web needs react-router `<Link>` for SPA navigation. **A straight re-export turns every card/chip/button click into a full page reload** — a functional regression, not a refactor.

Closing this requires adding link injection (`linkComponent` / polymorphic `as` prop / a Link context) to those package components. That is a DS API change, which §Non-Goals explicitly forbids ("No visual or API changes to any DS component"). **The epic as written cannot reach its stated end-state without contradicting itself.** Resolving this is a prerequisite scope amendment, not an implementation detail.

### Blocker 2 — the structural-closure AC is unachievable as written

"No file under `apps/web/src/design-system/components/` contains a component implementation" cannot hold for: the 6 adapters (link seam), the 6 web-only components (no package equivalent exists), or the 3 substantively diverged components (Callout, CodeBlock, FilterBar). That AC must be rewritten to name the achievable set before execution resumes.

### Blocker 3 — SUG-217 / SUG-218 / SUG-219 are real prerequisites

§Technical notes claims "Upstream dependencies: none blocking." **This is wrong.** 11 component CSS pairs are drifted and grandfathered on `KNOWN_DRIFT` in `validate-style-mirror.js`. Four of them — **Citation, ScoreRing, Table, IconButton — are pure mirrors in JS but drifted in CSS**: re-exporting them makes apps/web silently adopt the package's different stylesheet, i.e. an unreviewed visual change.

Only the **22 pure mirrors with byte-identical CSS** are safe to convert today. **Decision 2026-07-21: park the epic until SUG-217/218/219 ship**, then execute against clean CSS rather than reconciling drift inside this epic.

### Corrections to stated assumptions

- §Background/§Technical notes cite SUG-127's `"use client"` wrappers as starting state. **Zero `"use client"` directives exist in the package** — verified by grep across `packages/design-system/src/`. The `exports` map fix is real; the `"use client"` one is not (or was since removed).
- §Phases picks Card as the Phase 1 proof component. **Card is the single worst candidate** — the most complex adapter (382 lines vs the package's 340, react-router Links, `getLinkProps`, `children`/`footerChildren`/`thumbnailStyle` escape hatches). When execution resumes, spike a clean pure mirror (e.g. Box or Surface) instead.
- ~~The package barrel (`packages/design-system/src/index.ts`) does not export `Breadcrumb`, `ButtonGroup`, or `IconButton`.~~ **RESOLVED — verified 2026-07-23:** the barrel now exports all three (`Breadcrumb` line 69, `ButtonGroup` line 63, `IconButton` line 65). No barrel additions needed for these; the gap was closed since this correction was written (likely SUG-231).
- Web `Card.jsx`'s header comment claims `tags[]` is extended with `colorHex`; the implementation never reads it. Stale comment, worth correcting whenever Card is next touched.

### Blocker 4 — the package `Button` cannot navigate (inherited from SUG-231, 2026-07-22)

The web `Button` accepts `href` and branches external-anchor / RouterLink / `<button>`. **The package `Button` has no `href` in its props at all** — it renders only `<button>`. apps/web cannot consume a Button that cannot navigate, so this is a hard prerequisite for converting that pair.

Handed over from SUG-231 Phase 1b, where it sat in Scope while that epic's own Non-Goals listed Button's `href` among the intentional adapter differences that "stay until SUG-224 decides their fate". Non-Goals won: this is a feature gap blocking consolidation, not mirror drift, and it belongs to whichever epic owns the merged component — this one.

**Open decision — ✅ RESOLVED 2026-07-23 (decision C): `target`/`rel` come to the package.** The package `Button` gains `href` and an external-anchor branch that sets `target="_blank"` / `rel="noopener noreferrer"` on external hrefs, plus an `openInNewTab` prop — porting web's Button faithfully. This deliberately overrides SUG-230's `<Link>`-resolver editorial choice **for `Button` specifically** (the merged Button is the only Button; a Button that silently drops external-tab behaviour on consumption would be a functional regression). SUG-230's resolver is unchanged for other components. Internal hrefs still route through the `LinkProvider` seam. Current package consumer to check against: `apps/contentful-poc/src/components/SiteHeader.tsx`.

### Resume checklist

1. Confirm SUG-217, SUG-218, SUG-219 are all shipped and `KNOWN_DRIFT` is empty.
2. Amend §Scope, §Acceptance criteria, and §Non-Goals to resolve Blockers 1 and 2 — decide explicitly whether the link seam is in scope (and if so, drop the "no API changes" Non-Goal and add a DS visual QA gate for the 5 affected components).
3. Re-run the pair classification — it will have changed once the CSS epics land.
4. Spike a pure mirror, not Card.
5. Add `href` to the package `Button` via the SUG-230 seam, and settle the target/rel question (Blocker 4).
6. Fold in SUG-231's declined Breadcrumb work: web's `react-router-dom` import vs the package's seam, and the `.crumb` wrapper vs `React.Fragment`. Both were left unreconciled on the explicit grounds that this epic deletes the web copy — if that changes, they come back into play.

## Disposition table (Phase 0 deliverable)

Generated 2026-07-22 from the live directory listing — **44 rows, one per web component directory.**
Every row must reach a non-TBD verdict before Phase 4 begins; the amended structural-closure AC is
satisfied by this table being complete, not by a grep returning zero.

**Completed 2026-07-23.** All 44 rows carry a non-TBD verdict. Five verdict classes:
**re-export** (safe now — pure mirror, CSS byte-identical, barrel-exported); **re-export (P1b)**
(after package Button gains `href`); **re-export (P2)** (after `LinkProvider` mounts, retiring the
router import); **re-export (P4)** (diverged/adapter, package copy is canonical per decision
2026-07-23 — reconcile JS + Chromatic-verify during conversion); **promote** (web-only DS primitive
moved into the package); **web-only** (genuine app-layer coupling — stays).

| Component | Pairing | Verdict | Note |
|---|---|---|---|
| `Breadcrumb` | paired | ✅ converted (batch 2, 2026-07-24) | router import retired by Phase 2 LinkProvider |
| `FilterBar` | paired | re-export (P4) | diverged JS, CSS byte-identical, no app coupling — package canonical |
| `PageHeader` | web-only | promote | DS layout primitive, no app coupling — promoted (decision 2026-07-23) |
| `accordion` | paired | re-export (P4) | diverged JS, CSS byte-identical, no app coupling — package canonical |
| `app-shell` | paired | ✅ converted (545df6ff) | pure mirror |
| `avatar` | paired | ✅ converted (545df6ff) | pure mirror |
| `blockquote` | paired | ✅ converted (545df6ff) | pure mirror |
| `box` | paired | ✅ converted (545df6ff) | pure mirror |
| `button` | paired | ✅ converted (batch 2, 2026-07-24) | package Button gains `href` + external-anchor `target`/`rel` + `openInNewTab` (decision C, 2026-07-23) |
| `button-group` | paired | ✅ converted (545df6ff) | pure mirror — barrel export confirmed present 2026-07-23 |
| `callout` | paired | re-export (P4) | diverged JS, CSS byte-identical, no app coupling — package canonical |
| `card` | paired | ✅ converted (batch 2, 2026-07-24) | router import retired by Phase 2 LinkProvider; **plus decision D** — package gains `children`/`footerChildren`/`thumbnailClassName`/`thumbnailStyle` + external-href target/rel on title link (see Phase 4 batch 2 note) |
| `chip` | paired | ✅ converted (batch 2, 2026-07-24) | router import retired by Phase 2 LinkProvider |
| `citation` | paired | ✅ converted (545df6ff) | pure mirror — CSS now byte-identical (was Blocker 3, cleared by SUG-217) |
| `codeblock` | paired | re-export (P4) | diverged JS, CSS byte-identical, no app coupling — package canonical |
| `columns` | paired | ✅ converted (545df6ff) | pure mirror |
| `container` | paired | re-export (P4) | diverged JS, CSS byte-identical, no app coupling — package canonical |
| `description-list` | paired | ✅ converted (545df6ff) | pure mirror |
| `error-message` | paired | ✅ converted (545df6ff) | pure mirror |
| `field` | paired | ✅ converted (545df6ff) | pure mirror |
| `grid` | web-only | promote | DS primitive (CLAUDE.md reuse-audit + Storybook Foundations/Layout/Grid), no app coupling — promoted |
| `helper-text` | paired | ✅ converted (545df6ff) | pure mirror |
| `icon-button` | paired | ✅ converted (545df6ff) | pure mirror — CSS now identical (was Blocker 3); barrel export confirmed present 2026-07-23 |
| `index-cell` | paired | ✅ converted (batch 2, 2026-07-24) | router import retired by Phase 2 LinkProvider |
| `index-group` | paired | ✅ converted (545df6ff) | pure mirror |
| `input` | paired | ✅ converted (545df6ff) | pure mirror |
| `label` | paired | ✅ converted (545df6ff) | pure mirror |
| `list` | paired | ✅ converted (545df6ff) | pure mirror — web copy has no router import (package copy carries the seam) |
| `media` | paired | re-export (P4) | adapter, no app coupling, CSS byte-identical — package canonical |
| `meter` | paired | ✅ converted (545df6ff) | pure mirror |
| `metric` | paired | ✅ converted (545df6ff) | pure mirror |
| `page` | paired | ✅ converted (545df6ff) | pure mirror |
| `score-ring` | paired | ✅ converted (545df6ff) | pure mirror — CSS now byte-identical (was Blocker 3, cleared by SUG-217) |
| `section-label` | web-only | promote | DS primitive (CLAUDE.md reuse-audit), no app coupling — promoted (decision 2026-07-23) |
| `segmented-control` | paired | ✅ converted (545df6ff) | pure mirror |
| `sidebar` | web-only | promote | DS layout shell, separable from SidebarNav, no app coupling — promoted (decision 2026-07-23) |
| `sidebar-nav` | web-only | web-only | genuine app coupling: `../../../lib/useScrollspy` — stays web-only |
| `skeleton` | paired | ✅ converted (545df6ff) | pure mirror |
| `stack` | paired | re-export (P4) | diverged JS, CSS byte-identical, no app coupling — package canonical |
| `surface` | paired | ✅ converted (545df6ff) | pure mirror |
| `swatch` | paired | ✅ converted (545df6ff) | pure mirror |
| `table` | paired | ✅ converted (545df6ff) | pure mirror — CSS now byte-identical (was Blocker 3, cleared by SUG-217) |
| `textarea` | paired | ✅ converted (545df6ff) | pure mirror |
| `tile` | web-only | web-only | genuine app coupling: `../../../lib/linkUtils` + react-router — stays web-only |

**Tally:** 26 re-export now (✅ converted 2026-07-23, commit `545df6ff`) · 4 re-export (P2) + 1 re-export (P1b), all 5 ✅ **converted 2026-07-24, batch 2** · 7 re-export (P4) remaining (batch 3) · 4 promote · 2 web-only = 44. **31/44 converted.**

## Acceptance criteria

- [ ] `apps/web/package.json` contains `@sugartown/design-system` and `pnpm build` succeeds from a clean install
- [ ] **Structural closure, stated as a disposition rather than a grep** (amended 2026-07-22 — Blocker 2): every one of the 44 web component directories has a row in the disposition table with one of three verdicts — **re-exported** from the package, **promoted** to the package, or **stays web-only** with a stated reason. No directory is unaccounted for. The original AC — `grep -rn "Mirrors: packages/design-system" apps/web/src/` returns zero — is **retired**: 6 components are legitimately web-only with no package counterpart, so it could never pass, and an AC that cannot pass is what parked this epic the first time. The grep survives only as a narrower check: no file under `apps/web/src/design-system/components/` that the table marks **re-exported** still contains an implementation.
- [ ] Every route in the Human QA Walkthrough table renders identically to pre-epic (spot-checked on `default` and `dark-pink-moon`); Chromatic diff review shows no unapproved visual change
- [ ] Storybook builds and all existing stories render without console errors
- [ ] `pnpm validate:tokens`, `validate:tokens --strict-colors`, and `validate:style-mirror` all pass (style-mirror scope updated if the epic changes which files are mirrored)
- [ ] CLAUDE.md Mirrored File Registry and epic-template Web Adapter Sync sections reflect the new single-source reality
- [ ] Diagram + case study caption updates proposed via Content Write Gate and approved before any Sanity patch

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach (this epic can reach ALL of them — every DS component consumer changes import
> path), and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Content Write Gate:** fires once, in Phase 3 — the case study diagram caption/legend update on the Sanity draft. All other work is code/docs.
- **Schema changes:** none. No Sanity or GROQ surface is touched.
- ~~**Upstream dependencies:** none blocking. SUG-127 (shipped) is the evidence base; its two packaging fixes (`exports` map, `"use client"` wrappers) are the starting state of the package.~~ **CORRECTED 2026-07-21 (Phase 1):** SUG-217/218/219 ARE blocking — see §Phase 1 Findings Blocker 3. And the `"use client"` claim is false; zero such directives exist in the package. Only the `exports` map fix is real.
- **Activation audits:**
  - `ls apps/web/src/design-system/components/` and diff the component list against `packages/design-system/src/components/` — enumerate every mirror pair and any web-only component that has no package equivalent (those stay, explicitly listed).
  - Read `packages/design-system/package.json` `exports` map and confirm it covers subpath imports apps/web needs (styles, individual components) or plan additions.
  - Check whether `"use client"` directives in the package are inert under Vite/React SPA (they should be — verify, don't assume).
  - Read `apps/storybook` config to see which tree its stories import components from today.
- **Consumption-strategy decision (Phase 1 output, record here):** ✅ **DECIDED 2026-07-21 — built package output via the `exports` map.** Full rationale, rejected alternative, and the cascade-order risk it carries: §Phase 1 Findings → Decision.
- **Risk:** CSS module class-name hashes and specificity order may shift when styles move from app-local modules to package modules. Chromatic is the net; do not trust "it builds".

## Model & Mode [REQUIRED]

`/model opus` + plan mode for Phase 1 (monorepo boundary + build-tooling ambiguity is exactly the architecture case), then `/model sonnet` for Phases 2–3 execution.

## Non-Goals

- ~~No visual or API changes to any DS component~~ — **amended 2026-07-22 (Blocker 4).** No **visual** changes: this epic moves where components live, not what they render, and any wanted *visual* change is still its own epic. But the blanket "no API changes" is retired, because it made Blocker 4 unresolvable inside the epic that owns it — the package `Button` has no `href` at all, and `apps/web` cannot consume a Button that cannot navigate. **Permitted API changes are narrowly scoped to closing consumption gaps**: adding a prop the web adapter already has and the package lacks. Adding a *new* capability neither copy has remains out of scope. Each permitted change is listed in the disposition table with the web-side prop it is matching. This is the same self-contradiction shape SUG-231 hit (its Scope said add `href`, its Non-Goals said don't) — resolved here rather than passed on again.
- ~~No new components, tokens, or theme work.~~ — **amended 2026-07-23 (Phase 0, decision B).** No *net-new* components, tokens, or theme work. But **promoting an existing web-only DS primitive into the package is permitted and in scope** — `grid`, `page-header`, `section-label`, and `sidebar` are DS primitives misfiled in the app tree (Grid and SectionLabel are already treated as DS components in CLAUDE.md's reuse-audit guidance), with zero app-layer coupling. Leaving them web-only would keep the exact mirror-maintenance burden this epic exists to kill. Each promoted component ships with a package story + dark-mode story + Chromatic baseline + barrel export. This is a move, not an invention; adding a capability neither copy has remains out of scope.
- No change to the token pipeline (`tokens.json` → generated `tokens.css` ×2 stays as is; whether the web copy of generated tokens can also be retired is a follow-up question, out of scope here).
- apps/contentful-poc is untouched (already consumes the package).
- No Sanity schema or content changes beyond the single Content Write Gate caption/legend update in Phase 3.

## Related

- **Linear:** [SUG-224](https://linear.app/sugartown/issue/SUG-224)
- **Evidence base:** `docs/shipped/zArchive/2026/SUG-127-contentful-vercel-poc-platform-vendor-evaluation.md`
- **Diagram + red-pen table:** `docs/diagrams/redpen-platform-is-the-portfolio.md`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
