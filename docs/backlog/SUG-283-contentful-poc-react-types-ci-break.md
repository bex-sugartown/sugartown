---
**Epic:** SUG-283 — `apps/contentful-poc` build fails in CI on a React types conflict
**Linear Issue:** [SUG-283](https://linear.app/sugartown/issue/SUG-283/appscontentful-poc-build-fails-in-ci-on-a-react-types-conflict-green)
**Status:** Todo — **`main` is red**
**Priority:** 🟠 High
**Merge strategy:** (a) Merge-as-you-go. Single-phase.
---

# SUG-283 — contentful-poc React types conflict breaks CI

Filed 2026-08-11 by SUG-281's close-out, which step 1b blocks on: "the CI run for the merged
commit concludes `success`".

## Background

CI run `31511487229` on `b3cda562`, step *Build*:

```
Failed to type check.
Type error: Type 'import(".../@types+react@19.2.10/.../react/index").ReactNode'
  is not assignable to type 'React.ReactNode'.
  Property 'children' is missing in type 'ReactElement<...>' but required in type 'ReactPortal'.
@sugartown/contentful-poc#build ... exited (1)
```

Two `@types/react` copies resolving differently inside `apps/contentful-poc`.

## What is established, by measurement

Recorded so the next session does not re-derive it, and does not act on the unconfirmed part:

| Claim | Evidence |
|---|---|
| Not caused by the commits under test | `git diff --name-only 75cce585..b3cda562` touches no `apps/contentful-poc` file, no `package.json`, not `pnpm-lock.yaml` |
| Not dependency drift | `pnpm-lock.yaml` pins both `@types/react@18.3.27` and `@types/react@19.2.10`; all three CI install steps use `--frozen-lockfile` |
| Not a stale turbo cache | Last green run `31491365962` (12:29) shows `cache miss, executing` throughout and `Tasks: 5 successful, 5 total` — the build ran and passed. Red run: `Tasks: 4 successful, 5 total` |
| Does not reproduce locally | `pnpm --filter contentful-poc build` exits 0 on this machine, same commit |

The same code built green at 12:29 and red at 16:17 on the same lockfile. **Unconfirmed
suspect:** the runner environment. Every run carries `Node.js 20 is deprecated ... forced to
run on Node.js 24`, which points at a runner image rollout between the two. Do not treat that
as the cause without checking it.

## Scope

- [ ] Confirm the trigger — compare runner image and Node version between `31491365962`
      (green) and `31511487229` (red) **before changing any code**
- [ ] Resolve the duplicate `@types/react`. `apps/contentful-poc` declares `"@types/react": "^19"`
      while the rest of the workspace is on 18.3.27. Options: a pnpm `overrides` pin, aligning
      the POC's range, or `resolutions`. Pick one and record why
- [ ] Green CI run on `main`, recorded by ID

## Non-Goals

- Removing `apps/contentful-poc` from the build. A package excluded from CI to make CI green is
  the failure this repo's incident log is mostly about.

## Notes

- `ci-failure-alert.yml` (CTL-013) fired correctly and opened GitHub issue #35 at 16:20 — five
  minutes after the failure. The alarm is working; this is the defect it found. Worth recording
  because CTL-013 had no probe and its `Found by` history had never included a real red.
- This red resets CTL-040's consecutive-green streak, which stood at 4 of 5.

## Related

- **Linear:** [SUG-283](https://linear.app/sugartown/issue/SUG-283)
- Blocks SUG-281's close-out step 1b
- GitHub issue #35 (rolling `ci-red` alert)
