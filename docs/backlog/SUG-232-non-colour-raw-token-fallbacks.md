---
**Epic:** SUG-232 — Non-colour raw token fallbacks pass CI silently
**Linear Issue:** [SUG-232](https://linear.app/sugartown/issue/SUG-232)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-232 — Non-colour raw token fallbacks pass CI silently

Extend `validate-tokens.js` to catch raw fallback values of any type, not just colours, then burn down the 55 existing violations.

## Background

CLAUDE.md §DS Component Authoring states the rule plainly: "`var(--st-token, #hex)` is banned. The only permitted fallback form is `var(--st-token, var(--st-primitive))`." The validator that appears to enforce it, `validate:tokens --strict-colors`, only checks for hardcoded **colour** values (hex, rgba, hsla). So non-colour raw fallbacks — `var(--st-space-4, 1rem)`, `var(--st-font-size-lg, 1.125rem)`, `var(--st-line-height-tight, 1.25)` — violate the written rule and pass CI without comment.

Measured 2026-07-21: **23 occurrences across 7 web component files** (Accordion, Card, CodeBlock, Media, SegmentedControl, Table, Tile) and **32 across 11 package files**.

Surfaced during SUG-217's activation audit, which found that epic's own Scope had mis-stated the situation: it claimed Accordion's web copy was "clean" of fallbacks when web had 4 and the package had 7. Only the *drifted* fallbacks were package-only; the shared ones were invisible to both the mirror validator (identical on both sides, so no diff) and the token validator (not colours, so not checked).

This is the same shape of gap as SUG-214's CSS-only mirror validator, which hid the FilterBar and CodeBlock behavioural bugs now tracked in SUG-231: **a validator whose scope is narrower than the rule it appears to enforce.** The pattern is worth naming, because in both cases the green check actively discouraged anyone from looking.

## Objective

After this epic, any `var(--st-*, <raw-value>)` where the fallback is not itself a `var(--st-*)` reference is caught by `validate:tokens`, and the existing 55 occurrences are gone from both trees. Layers touched: the validator script and component CSS in both trees. No tokens, schema, JS, or visual change — every fallback removed should resolve to the same computed value, since the tokens it falls back from are all defined.

## Scope

- [ ] Extend `apps/web/scripts/validate-tokens.js` to flag non-colour raw fallbacks, reusing the existing `--strict-colors` reporting shape — layer: tooling
- [ ] Decide whether the new check runs blocking or warning-only during burndown, and record the decision here — layer: tooling
- [ ] Burn down the 23 web occurrences — layer: frontend
- [ ] Burn down the 32 package occurrences — layer: design-system
- [ ] Confirm `validate:style-mirror` still passes after both burndowns (several affected files are mirrored pairs, so they must be fixed in lockstep) — layer: tooling

## Phases

**Phase 1 — Validator.** Extend the check and prove it flags all 55 known occurrences. Ship the validator in warning mode if that keeps the pre-commit hook green while the burndown runs.

**Phase 2 — Burndown.** Remove the fallbacks, mirrored pairs in lockstep. Flip the check to blocking once the count reaches zero.

## Acceptance criteria

- [ ] `validate:tokens` flags `var(--st-space-4, 1rem)`-style fallbacks, verified against a deliberately-added test case that is removed before commit
- [ ] Zero non-colour raw fallbacks remain in `apps/web/src/design-system/components/` and `packages/design-system/src/components/`
- [ ] The check is blocking (not warning) at close-out
- [ ] `validate:style-mirror` passes — no mirrored pair left half-fixed
- [ ] No computed-value change: spot-check at least 3 affected components in the browser before and after, since a removed fallback that was actually load-bearing would silently change layout

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx` and list the routes rendering the 7 affected web
> components (Accordion → case study FAQ; Card → every archive; CodeBlock → article/node bodies;
> Media → hero/inline images; SegmentedControl → archive view toggles; Table → data pages;
> Tile → stat grids). Build the walkthrough table per `docs/epic-template.md`. This epic expects
> **zero** visual change, so every row is a regression guard.

## Technical notes

- **The fallbacks should all be inert.** Each falls back from a token that is defined in `tokens.css`, so the fallback never fires. Removing them should be a no-op. If removing one *does* change rendering, that means the token was missing in some theme context — investigate rather than restoring the fallback.
- **Mirrored pairs must be fixed in lockstep** or `validate:style-mirror` will fail mid-burndown. Affected mirrored files: Accordion, Card, CodeBlock, Media, SegmentedControl, Table. (Tile is web-only.)
- **Do not widen scope to `var(--st-token, var(--st-primitive))` forms** — those are explicitly permitted by the rule.
- **Activation audits:** re-measure the counts before starting; SUG-231 and SUG-230 both touch component files and may change them.

## Model & Mode [REQUIRED]

`/model sonnet` — a mechanical validator extension plus a bounded, well-enumerated burndown with no design decisions.

## Non-Goals

- **Colour fallbacks** — already caught by `--strict-colors`.
- **Any visual or API change.** This epic removes inert syntax; if it changes rendering, something was wrong and needs investigating, not accommodating.
- **Auditing other validators for the same scope-narrower-than-the-rule pattern.** Worth doing, but it is its own piece of work.

## Related

- **Linear:** [SUG-232](https://linear.app/sugartown/issue/SUG-232)
- **Surfaced by:** SUG-217 activation audit — `docs/shipped/SUG-217-reconcile-9-smaller-component-css-mirrors.md`
- **Same gap pattern:** SUG-214 (CSS-only mirror validator) → SUG-231 (the bugs it hid)
- **Epic template:** `docs/epic-template.md`
