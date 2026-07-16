---
**Epic:** SUG-219 — Reconcile Card component CSS mirror
**Linear Issue:** [SUG-219](https://linear.app/sugartown/issue/SUG-219)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-219 — Reconcile Card component CSS mirror

Reconcile the web↔package `Card.module.css` mirror — the second-largest SUG-214 component drift, on a high-blast-radius DS primitive.

## Background

- **Current state:** ~42 web-only lines and ~13 package-only lines drift across a large (~650-line) file. Card carries a status-chip colour system and many variants, so the drift clusters need individual review rather than a blanket copy. The web app renders the web copy; Storybook renders the package copy.
- **Why now:** SUG-214's validator grandfathers this on `KNOWN_DRIFT`; it stays flagged until reconciled. Split from the SUG-217 small-bundle because Card's size + blast radius warrant a focused pass.
- **Reference surfaces:** `apps/web/src/design-system/components/card/Card.module.css` ↔ `packages/design-system/src/components/Card/Card.module.css`; the Card Storybook story; Card usage on Article/Node/CaseStudy/Project archive + detail pages.

## Objective

After this epic, one canonical `Card.module.css` exists byte-identical in both trees, token-driven, rendering identically in the web app and Storybook in both themes, with the status-chip colour states intact. Layers touched: component CSS only.

## Scope

- [ ] Diff the two copies; map each of the ~9 drift clusters to a decision (which side is canonical for that hunk).
- [ ] Pay special attention to the status-chip colour system (`--st-status-*`) and any variant/tone rules — these are the highest-risk clusters.
- [ ] Produce one canonical version (per-cluster merge; preserve load-bearing one-sided rules), write byte-identical to both trees.
- [ ] Confirm no raw colours / no banned token fallbacks.
- [ ] Delete `Card.module.css` from `KNOWN_DRIFT` in `validate-style-mirror.js`.

## Acceptance criteria

- [ ] `Card.module.css` byte-identical across web ↔ package (`validate:style-mirror` ✅).
- [ ] Removed from `KNOWN_DRIFT`; validator enforces it.
- [ ] Visual-QA-approved in both themes against real Card usage (Article/Node/CaseStudy/Project cards, incl. status chips) + the Storybook story.
- [ ] `validate:tokens`, `--strict-colors`, `validate:style-mirror`, lint pass.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`; Card renders on every content archive + as ContentCard on detail pages. Verify at least one Article, Node, CaseStudy, and Project card (with a status chip visible) in both themes, plus the Card Storybook story, before/after.

## Technical notes

- **Content Write Gate:** not triggered — CSS only.
- **Canonical direction:** DS package nominally canonical, but verify per cluster; the status-chip colour tokens must resolve identically in both copies. Check the Pink Moon dark-block glassmorphism list before anchoring any background token (`--st-card-bg` has a dark glassmorphism override).
- **Activation audits:** full `diff`; grep recent Card commits; enumerate the `--st-status-*` / `--st-card-*` tokens used by each copy and confirm parity.
- **Model & Mode [REQUIRED]:** `/model opus` — large, high-blast-radius primitive with a colour-state system; plan the cluster-by-cluster merge, then execute.

## Model & Mode [REQUIRED]

`/model opus` — high-blast-radius primitive, status-colour system, two-surface regression risk.

## Non-Goals

- **No restyle / redesign** — reconcile to a single canonical version of the existing styling.
- **The 9 smaller drifts (SUG-217) and Callout (SUG-218)** are separate epics.

## Related

- **Linear:** [SUG-219](https://linear.app/sugartown/issue/SUG-219)
- **Surfaced by:** SUG-214 · **Pattern precedent:** SUG-212 (CodeBlock reconciliation)
- **Siblings:** SUG-217 (9 small), SUG-218 (Callout)
