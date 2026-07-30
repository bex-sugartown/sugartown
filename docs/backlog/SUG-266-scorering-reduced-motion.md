---
**Epic:** SUG-266 — ScoreRing reduced-motion changes do not take effect
**Linear Issue:** [SUG-266](https://linear.app/sugartown/issue/SUG-266/scorering-reduced-motion-changes-mid-session-do-not-take-effect)
**Status:** Backlog
**Priority:** ⚪ Later — real but narrow; needs a mid-session preference change to surface
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
---

# SUG-266 — ScoreRing reduced-motion

## Background

Found while reporting validator state for v0.32.0, 2026-07-30. The only one of the repo's four
lint warnings with behaviour behind it.

`packages/design-system/src/components/ScoreRing/ScoreRing.tsx:64` reads `reducedMotion` inside
an effect whose dep array at `:81` is `[animated, clampedScore]`. `animated` is also initialised
from it once (`useState(reducedMotion)`) and never re-synced.

If `reducedMotion` flips after mount: **true → false** leaves the IntersectionObserver unset, so
the ring never animates though motion is now allowed; **false → true** leaves a running observer,
so it animates against the stated preference. Either way the component stays in the wrong mode
until remount.

## Scope

- [ ] **Confirm how `reducedMotion` is sourced first.** If it is read once at mount and never
      updates, the warning is real but the symptom is unreachable — record that and suppress with
      an explaining comment rather than leaving it to be re-triaged
- [ ] If live, add `reducedMotion` to the dep array and re-sync `animated`, without resetting a
      completed count-up on an unrelated re-render
- [ ] Verify in Storybook by toggling the OS preference with a story open, on `default` and
      `dark-pink-moon`

## Non-Goals

- The other three lint warnings: two `no-explicit-any` (`storybook-docs/src/docs.tsx:439`,
  `design-system Card.tsx:285`) and one unused `eslint-disable`
  (`contentful-poc layout.tsx:42`, auto-fixable). None has a behavioural symptom.

## Acceptance Criteria

- [ ] `pnpm lint` reports zero warnings for `ScoreRing`
- [ ] The mid-session toggle was tested in a browser, not reasoned about

## Risks

- **Adding the dep re-runs the effect on every `reducedMotion` render.** If the value is derived
  rather than memoised, that could restart the animation. Check the source before changing the
  array.
