---
**Epic:** SUG-218 — Reconcile Callout component CSS mirror (major divergence)
**Linear Issue:** [SUG-218](https://linear.app/sugartown/issue/SUG-218)
**Status:** ❌ Cancelled 2026-07-21 — duplicate of [SUG-231](https://linear.app/sugartown/issue/SUG-231) Phase 3
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

> **⛔ This epic is closed. Do not execute it. The work lives in SUG-231 Phase 3.**
>
> Attempted 2026-07-21 alongside SUG-217 and SUG-219. **It cannot be done as scoped.** Its
> Objective ("one canonical `Callout.module.css` … Layers touched: component CSS only") is
> impossible, because the web and package Callouts are not drifted copies of one component —
> they are two different components:
>
> | | Classes its JSX/TSX uses |
> |---|---|
> | web `Callout.jsx` | `callout` `labelCol` `number` `label` `body` `bannerLabel` `bannerBody` |
> | package `Callout.tsx` | `callout` `header` `icon` `title` `body` |
>
> Only `.callout` and `.body` overlap. Making the CSS byte-identical would leave whichever side
> lost its classes rendering unstyled. The divergence is deliberate, not accidental: web carries
> the SUG-99 "row format" redesign (two-column label + body grid, §NN folio number, `banner`
> variant); the package is the pre-SUG-99 design from `artifacts/style 260118.css` (padded box,
> lucide icon, title). **The package never received the redesign.**
>
> The CSS drift is therefore a *symptom* of a component-level divergence that SUG-231 Phase 3
> already owned. Rather than have two epics race on one file, Phase 3 absorbed this epic's CSS
> scope and its `KNOWN_DRIFT` removal. `Callout.module.css` stays on `KNOWN_DRIFT` with an
> inline comment until Phase 3 lands. Blast radius when it does: Storybook only —
> `apps/contentful-poc` does not use Callout at all.
>
> Everything below is the original spec, retained as the record of what was assumed.

# SUG-218 — Reconcile Callout component CSS mirror (major divergence)

Reconcile the web↔package `Callout.module.css` mirror, the largest of the SUG-214 component drifts — the two copies have diverged so far they are effectively different files.

## Background

- **Current state:** ~84 web-only lines and ~87 package-only lines out of a ~120-line file — a near-total independent rewrite on each side. The web app renders the web copy; Storybook renders the package copy, so real callouts and the Callout story currently show materially different styling.
- **Why now:** SUG-214's validator grandfathers this on `KNOWN_DRIFT`; it stays flagged until reconciled. It is split out from the SUG-217 small-bundle because it needs a genuine per-rule design decision, not a diff-and-copy — comparable in shape to the SUG-212 CodeBlock reconciliation.
- **Reference surfaces:** `apps/web/src/design-system/components/callout/Callout.module.css` ↔ `packages/design-system/src/components/Callout/Callout.module.css`; the Callout Storybook story; real callout usage in article/node bodies and `PageSections`.

## Objective

After this epic, one canonical `Callout.module.css` exists byte-identical in both trees, driven only by `--st-*` tokens, rendering identically in the web app and Storybook in both themes. Layers touched: component CSS only.

## Scope

- [ ] Diff the two copies in full and map every hunk to a decision: which side represents the intended Callout styling (structure, variant handling — info/accent/subdued tones, label/body layout, tokens).
- [ ] Produce one canonical version (hunk-by-hunk merge, not a blanket copy); preserve any load-bearing rule that exists on only one side.
- [ ] Write it byte-identical to both trees.
- [ ] Confirm no raw color values / no banned token fallbacks in the result.
- [ ] Delete `Callout.module.css` from `KNOWN_DRIFT` in `validate-style-mirror.js`.

## Acceptance criteria

- [ ] `Callout.module.css` is byte-identical across web ↔ package (`validate:style-mirror` shows ✅).
- [ ] Removed from `KNOWN_DRIFT`; validator enforces it.
- [ ] Visual-QA-approved in both `light-pink-moon` and `dark-pink-moon` against real callout usage + the Storybook story — every tone/variant checked.
- [ ] `validate:tokens`, `--strict-colors`, `validate:style-mirror`, lint pass.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`; Callout renders inside PortableText body content (articles, nodes, case studies) via `PageSections`. Verify against the test-preview post (covers every section type) and the Callout Storybook story, both themes, every tone variant, before/after.

## Technical notes

- **Content Write Gate:** not triggered — CSS only.
- **Canonical direction:** decide per hunk. The DS package is nominally canonical, but confirm which side matches the *current intended* Callout design (check the Callout Guidelines/story and recent Callout epics — e.g. the SUG-192 default/info variant merge) before choosing.
- **Activation audits:** full `diff` of both copies; grep recent Callout-related commits to understand which side is newer; check the Pink Moon dark-block glassmorphism list before anchoring any background token.
- **Model & Mode [REQUIRED]:** `/model opus` — a large hunk-by-hunk reconciliation with real design judgment and regression risk across two live surfaces; plan the merge, then execute.

## Model & Mode [REQUIRED]

`/model opus` — major divergence, per-hunk design decisions, two-surface regression risk.

## Non-Goals

- **No restyle / redesign** — reconcile to a single canonical version of the intended existing styling.
- **The 9 smaller drifts (SUG-217) and Card (SUG-219)** are separate epics.

## Related

- **Linear:** [SUG-218](https://linear.app/sugartown/issue/SUG-218)
- **Surfaced by:** SUG-214 · **Pattern precedent:** SUG-212 (CodeBlock reconciliation)
- **Siblings:** SUG-217 (9 small), SUG-219 (Card)
