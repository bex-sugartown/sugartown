---
**Epic:** SUG-217 — Reconcile 9 smaller drifted component CSS mirrors
**Linear Issue:** [SUG-217](https://linear.app/sugartown/issue/SUG-217)
**Status:** ✅ Shipped 2026-07-21
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-217 — Reconcile 9 smaller drifted component CSS mirrors

Reconcile the 9 smaller web↔package component `.module.css` drifts surfaced by SUG-214's new component-mirror validator pass, and remove each from the validator's `KNOWN_DRIFT` allowlist as it lands.

## Background

- **Current state:** SUG-214 extended `validate-style-mirror.js` to diff DS component CSS mirrors and found 11 pre-existing drifts, grandfathered on a `KNOWN_DRIFT` allowlist. This epic burns down the 9 smaller ones (Callout → SUG-218, Card → SUG-219 are separate). Because the web app renders the web copy and Storybook renders the package copy, each drift means the two surfaces render differently today.
- **Why now:** the validator now blocks *new* drift but grandfathers these; clearing them removes the allowlist debt and makes the check fully enforcing for these 9.
- **Reference surfaces:** the 9 component pairs under `apps/web/src/design-system/components/**` ↔ `packages/design-system/src/components/**`, and `apps/web/scripts/validate-style-mirror.js` (`KNOWN_DRIFT`).

## Objective

After this epic, all 9 pairs below are byte-identical across web and the DS package, each removed from `KNOWN_DRIFT`, and the validator enforces them permanently. Canonical direction is decided per pair (the DS package is nominally canonical per the Mirrored File Registry, but several web copies carry load-bearing extras — see Scope). Layers touched: component CSS only. No tokens, schema, or JS.

## Scope

One commit per component is fine; all land on one branch (strategy b). Each: diff, decide direction, make both byte-identical, delete from `KNOWN_DRIFT`.

- [ ] **Media** — web has an extra `/* styles */` comment. Trivial; keep or drop, sync both.
- [ ] **Breadcrumb** — web has a load-bearing `.crumb { display: contents }` rule the package lacks. Web canonical (package is missing a functional rule).
- [ ] **IconButton** — **value divergence:** web `background: var(--st-icon-button-bg)` vs package `transparent` / `--st-color-bg-surface-strong`. Decide the canonical background (web is token-driven → likely canonical, but verify against the rendered button). Visual.
- [ ] **Accordion** — package has banned raw token fallbacks (`var(--st-font-size-lg, 1.125rem)`); web is clean. Web canonical per the token-first fallback rule.
- [ ] **Chip** — **value divergence:** `.grey` uses softgrey-700 (web) vs softgrey-500 (package); web also has extra section comments. The shared comment says softgrey-700 is "nearly invisible on dark bg" — decide which grey is intended (package's 500 may be the fix). Visual.
- [ ] **Citation** — web has extra `.note a` footnote-link styling (colour, underline, hover) the package lacks. Web canonical.
- [ ] **ScoreRing** — package has banned raw fallbacks; web is clean + has a comment. Web canonical.
- [ ] **Table** — divergent both ways: web has comments + `!important` on `.row:hover` + mobile `padding-inline: 8px`; package has a `.wrapWide` 100vw breakout + different mobile margins (`14px 16px` vs `10px 0`). Per-hunk merge — neither side is a clean superset. Visual.
- [ ] **FilterBar** — almost entirely cosmetic (divider-comment dash counts) + one richer checkmark comment in the package. Pick one comment style; confirm no actual value differs (`top: 47%` note).

## Close-out (2026-07-21)

All 9 pairs byte-identical; `KNOWN_DRIFT` dropped from 11 entries to 2 at this commit (Callout, Card), then to 1 once SUG-219 landed in the same batch. Visual QA approved.

**Canonical direction, decided from evidence rather than the registry's nominal "package wins" default:**

| Component | Canonical | Basis |
|---|---|---|
| IconButton | web | Commit `755daa1f` *"IconButton bg — dedicated token to avoid glassmorphism"* landed web-only; the package copy was the pre-fix state still using `--st-color-bg-surface-strong`, which carries a dark-pink-moon `rgba()` glassmorphism override |
| Chip | web (`softgrey-700`) | Commit `87f4840f` wrote the two files with different values *in the same commit*, so neither side was a fix. Web matches the shared explanatory comment and is what production renders |
| Breadcrumb, Citation | web | Load-bearing rules absent from the package (`.crumb { display: contents }`, `.note a` footnote link styling) |
| Accordion, ScoreRing | web | Package carried banned raw token fallbacks |
| Media, FilterBar | package | Empty `/* styles */` comment dropped; package's checkmark comment explains the `top: 47%` optical correction that web's had lost |
| Table | per-hunk | web for the `!important` hover, comments, and mobile values; **package for the `.wrapWide` block**, which web's `Table.jsx` references but web's CSS never defined |

**Corrections to this doc's own Scope, found during the activation audit:**
- The Accordion row claimed "web is clean" of raw fallbacks. False — web had 4, package had 7. The *drifted* lines were package-only, but 4 further fallbacks are shared by both copies and remain. Only ScoreRing's web copy was genuinely fallback-free.
- That shared-fallback class of violation passes CI silently (`validate:tokens --strict-colors` checks colours only). 23 occurrences in web, 32 in the package → logged as **SUG-232**.

**Out-of-scope findings logged, not fixed:**
- `.wide` (distinct from `.wrapWide`) is referenced by `Table.jsx`/`Table.tsx` in **both** trees and defined in **neither** → added to SUG-231's scope.

**Visual result:** the web app is unchanged — every visual decision resolved to web, and `.wrapWide` has zero callers. The package moved to match production, so Chromatic diffs on IconButton/Chip/Citation/Table stories are expected.

## Acceptance criteria

- [ ] All 9 pairs are byte-identical across web ↔ package (`validate:style-mirror` shows ✅, not ⚠️, for each).
- [ ] Each of the 9 is deleted from `KNOWN_DRIFT` in `validate-style-mirror.js`; the validator's grandfathered count drops to 2 (Callout, Card only).
- [ ] The 3 visual pairs (IconButton, Chip, Table) are Visual-QA-approved in both `light-pink-moon` and `dark-pink-moon`.
- [ ] `pnpm validate:style-mirror`, `validate:tokens`, `--strict-colors`, lint all pass.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`; the affected components render across many pages (Chip on every taxonomy/detail page, Table on data pages, IconButton in nav/chrome, Breadcrumb on detail pages, Citation in article/node bodies). Build the Human QA Walkthrough table per `docs/epic-template.md`, verify IconButton/Chip/Table in both themes, and confirm the Storybook stories for each render identically to the web app after reconciliation.

## Technical notes

- **Content Write Gate:** not triggered — CSS only.
- **Canonical direction:** the Mirrored File Registry says DS package is canonical for component CSS, but SUG-212 showed web copies can carry load-bearing extras (mermaid variant). Do NOT blanket-copy one direction — decide per pair, preferring whichever side has the correct/complete rules and no banned fallbacks.
- **Activation audits:** `diff` each pair fresh before editing; re-run `validate:style-mirror` after each to confirm the ⚠️ becomes ✅.
- **Model & Mode [REQUIRED]:** `/model sonnet` — bounded per-component CSS reconciliation, mostly mechanical with a few small value decisions.

## Model & Mode [REQUIRED]

`/model sonnet` — small, well-characterized CSS reconciliations.

## Non-Goals

- **Callout (SUG-218) and Card (SUG-219)** — the two large divergences are separate epics.
- **No restyle** — reconcile to a single canonical version of the *existing* styling; do not redesign any component.
- **No validator changes beyond deleting reconciled entries from `KNOWN_DRIFT`.**

## Related

- **Linear:** [SUG-217](https://linear.app/sugartown/issue/SUG-217)
- **Surfaced by:** SUG-214 (`docs/shipped/SUG-214-*.md`) — the component-mirror validator that found these
- **Siblings:** SUG-218 (Callout), SUG-219 (Card)
