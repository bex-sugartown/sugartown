---
**Epic:** SUG-224 — apps/web consumes @sugartown/design-system
**Linear Issue:** [SUG-224](https://linear.app/sugartown/issue/SUG-224)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-224 — apps/web consumes @sugartown/design-system

Make apps/web consume `@sugartown/design-system` as a real workspace dependency, replacing the hand-synced mirror components at `apps/web/src/design-system/` with direct re-exports from the package.

## Background

apps/web does not depend on `@sugartown/design-system` at all: it renders a separately maintained JSX mirror of every DS component (`apps/web/src/design-system/components/`), with a header TODO in `Card.jsx` acknowledging the gap. The mirror is a manual drift rule — only the style files are validator-checked (`validate-style-mirror.js`), and the component copies have already required a registry entry in CLAUDE.md §Mirrored File Registry to manage. The trigger: the SUG-127 POC proved the package runs unchanged on a second stack (Contentful/Next.js/Vercel), and the platform-is-the-portfolio case study's agnostic-stack diagram now honestly draws production consumption as a dashed roadmap arrow (`docs/diagrams/redpen-platform-is-the-portfolio.md`). This epic turns that arrow solid. Affected surfaces: every page in apps/web that renders a DS component, plus Storybook (pinkmoon) and the Vite build.

## Objective

After this epic, `apps/web/package.json` declares `@sugartown/design-system: workspace:*` and every file under `apps/web/src/design-system/components/` is either a thin re-export from the package or deleted, with imports updated to hit the package directly. The JSX↔TSX build boundary is handled in Vite config (package consumed as source or as built output — decided in Phase 1). No Sanity schema, GROQ, or content changes — render layer and build tooling only. CLAUDE.md's Mirrored File Registry row for DS component mirrors is retired in the same close-out, and `docs/diagrams/diagram-portfolio-agnostic-stack.svg` is updated (dashed arrow → solid) with its red-pen table row reclassified from roadmap to enforced-by-code.

## Scope

- [ ] Add `@sugartown/design-system` as a workspace dependency of apps/web — layer: tooling
- [ ] Resolve the JSX↔TSX consumption strategy (source vs built package, CSS module handling, `exports` map coverage) and record it as a decision note in this doc — layer: tooling
- [ ] Replace each mirror component in `apps/web/src/design-system/components/` with a re-export from the package (or delete + update import sites) — layer: frontend
- [ ] Dedupe mirrored component CSS modules (package copy becomes the only copy) — layer: frontend
- [ ] Storybook (pinkmoon) resolves the package build without breaking HMR or Chromatic baselines — layer: Storybook
- [ ] Retire the DS-component-mirror row from CLAUDE.md §Mirrored File Registry and the web-adapter-sync steps in `docs/epic-template.md` §Design System → Web Adapter Sync — layer: tooling/docs
- [ ] Update `docs/diagrams/diagram-portfolio-agnostic-stack.svg` (dashed → solid) + red-pen table, and propose the matching case study caption/legend change through the Content Write Gate — layer: content
- [ ] Full visual QA across all page types on both themes — layer: frontend

## Phases

**Phase 1 — Consumption spike (decision ships, no page changes).** Wire the dependency, prove one component (Card) consumed from the package renders identically in apps/web dev + build + Storybook. Output: the recorded consumption-strategy decision and a working single-component branch state.

**Phase 2 — Component migration.** Replace the remaining mirrors with re-exports, dedupe CSS modules, fix import sites. Output: zero mirror component implementations left; `grep` structural-closure check passes.

**Phase 3 — Verification + docs close-out.** Full visual QA walkthrough, Chromatic run, registry/CLAUDE.md/epic-template updates, diagram + caption update via Content Write Gate. Output: epic ships, mini-release from main.

## Acceptance criteria

- [ ] `apps/web/package.json` contains `@sugartown/design-system` and `pnpm build` succeeds from a clean install
- [ ] Structural closure: `grep -rn "Mirrors: packages/design-system" apps/web/src/` returns zero results; no file under `apps/web/src/design-system/components/` contains a component implementation (re-exports only, or directory removed)
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
- **Upstream dependencies:** none blocking. SUG-127 (shipped) is the evidence base; its two packaging fixes (`exports` map, `"use client"` wrappers) are the starting state of the package.
- **Activation audits:**
  - `ls apps/web/src/design-system/components/` and diff the component list against `packages/design-system/src/components/` — enumerate every mirror pair and any web-only component that has no package equivalent (those stay, explicitly listed).
  - Read `packages/design-system/package.json` `exports` map and confirm it covers subpath imports apps/web needs (styles, individual components) or plan additions.
  - Check whether `"use client"` directives in the package are inert under Vite/React SPA (they should be — verify, don't assume).
  - Read `apps/storybook` config to see which tree its stories import components from today.
- **Consumption-strategy decision (Phase 1 output, record here):** source-consumption via Vite alias vs built package output; how CSS modules are shipped (class-name hashing must not change rendered output vs current mirrors, or Chromatic diffs everything).
- **Risk:** CSS module class-name hashes and specificity order may shift when styles move from app-local modules to package modules. Chromatic is the net; do not trust "it builds".

## Model & Mode [REQUIRED]

`/model opus` + plan mode for Phase 1 (monorepo boundary + build-tooling ambiguity is exactly the architecture case), then `/model sonnet` for Phases 2–3 execution.

## Non-Goals

- No visual or API changes to any DS component — this epic moves where components live, not what they render. Any wanted component change is its own epic.
- No new components, tokens, or theme work.
- No change to the token pipeline (`tokens.json` → generated `tokens.css` ×2 stays as is; whether the web copy of generated tokens can also be retired is a follow-up question, out of scope here).
- apps/contentful-poc is untouched (already consumes the package).
- No Sanity schema or content changes beyond the single Content Write Gate caption/legend update in Phase 3.

## Related

- **Linear:** [SUG-224](https://linear.app/sugartown/issue/SUG-224)
- **Evidence base:** `docs/shipped/zArchive/2026/SUG-127-contentful-vercel-poc-platform-vendor-evaluation.md`
- **Diagram + red-pen table:** `docs/diagrams/redpen-platform-is-the-portfolio.md`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
