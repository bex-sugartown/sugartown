---
**Epic:** SUG-266 — ScoreRing reduced-motion changes do not take effect
**Linear Issue:** [SUG-266](https://linear.app/sugartown/issue/SUG-266/scorering-reduced-motion-changes-mid-session-do-not-take-effect)
**Status:** Done
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

- [x] **Confirm how `reducedMotion` is sourced first.** If it is read once at mount and never
      updates, the warning is real but the symptom is unreachable — record that and suppress with
      an explaining comment rather than leaving it to be re-triaged
- [x] If live, add `reducedMotion` to the dep array and re-sync `animated`, without resetting a
      completed count-up on an unrelated re-render
- [x] Verify in Storybook by toggling the OS preference with a story open, on `default` and
      `dark-pink-moon`

## Non-Goals

- The other three lint warnings: two `no-explicit-any` (`storybook-docs/src/docs.tsx:439`,
  `design-system Card.tsx:285`) and one unused `eslint-disable`
  (`contentful-poc layout.tsx:42`, auto-fixable). None has a behavioural symptom.

## Acceptance Criteria

- [x] `pnpm lint` reports zero warnings for `ScoreRing`
- [x] The mid-session toggle was tested in a browser, not reasoned about

## Risks

- **Adding the dep re-runs the effect on every `reducedMotion` render.** If the value is derived
  rather than memoised, that could restart the animation. Check the source before changing the
  array.

## Close-out review

### Acceptance criteria

Executed in a cloud session started from `wip/2026-09-26-main` (commit `d0ad560`), the first run launched with `/cloud-launch` and handed back with `/handback` (#144). Evidence comment on #91, 2026-09-26. The `cloud-handback-reviewer` agent returned 10 of 10 Pass, 0 Warn, 0 Block. Fast-forwarded into `main` and re-checked:

- `reducedMotion` was read in the render body with no `change` subscription, so the symptom was live, not unreachable. Fixed: a `useSyncExternalStore` hook over the media query, `reducedMotion` in the reveal effect's deps, and a `countedTo` ref so a flip never replays a finished count-up. A second defect fixed in the same change: under reduced motion the number still counted up from 0 at mount.
- `pnpm --filter @sugartown/design-system lint`: no ScoreRing warning (the one remaining warning is `Card.tsx:285`, a Non-Goal). Root `pnpm lint` and `pnpm typecheck`: exit 0. `pnpm test:smoke`: 5 passed.
- Mid-session toggle tested in a browser, Storybook `Components/ScoreRing/Default`, on `default` and `dark-pink-moon` (body `rgb(13, 18, 38)`). The OS preference cannot be set from a session, so `window.matchMedia` was replaced in the story iframe with a controllable media query and the story re-mounted; the component, React and the browser were real. Results, identical on both themes: off to on before reveal, 0 then 96 at once; on to off after reveal, 96 held for 600 ms with no replay; off to on during the count-up, 67 then 96 at once. Baseline with motion on still counts up (45, 77, 96).

### What didn't work

- The launch prompt was written in the same turn as an `AskUserQuestion`, and Bex never saw it. `/cloud-launch` also set In Progress and posted the launch comment before Bex had pasted anything, which made it unclear whose step was next.

### Follow-ups

| Follow-up | Kind | Where it went |
|---|---|---|
| `/cloud-launch`: print the prompt in a turn of its own, make pasting it Bex's explicit step, and set In Progress only after she confirms the session started | workflow-docs | #144 (still open, same scope) |
| Cloud procedure note: say in §Verify that the package-level lint is the primary evidence when turbo replays a cached run | workflow-docs | #144 (added to its scope by Bex at hand-back, 2026-09-26) |

### Friction line

The launch prompt reached Bex only on the second try, because it sat beside a question box.

## Post-ship checks

- [ ] CI on the pushed commit concludes `success`, and Chromatic shows no change for `Components/ScoreRing` (the ring's appearance did not change)

