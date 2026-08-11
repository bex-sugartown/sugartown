---
**Epic:** SUG-283 — `apps/contentful-poc` build fails in CI on a React types conflict
**Linear Issue:** [SUG-283](https://linear.app/sugartown/issue/SUG-283/appscontentful-poc-build-fails-in-ci-on-a-react-types-conflict-green)
**Status:** Todo — **confirmed flaky, not a regression.** `main` is green again on `b3cda562` after a no-change re-run
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

The runner hypothesis was **checked and is wrong**: both runs used `ubuntu-24.04` image
`20260720.247.2`. Remote caching is disabled, so every CI run cache-misses and builds this
package from scratch — both runs did.

**Confirmed flaky by re-running the identical commit.** `gh run rerun 31511487229 --failed`,
no code change, concluded **success** with `Build: success`. Same commit, same lockfile, same
image, opposite outcomes. This is non-determinism in type resolution across two reachable
`@types/react` copies, not a break introduced by any commit.

## Scope

- [x] **Done 2026-08-11.** Trigger confirmed as non-determinism, not a regression: runner images
      identical, and a no-change re-run of the red commit went green
- [ ] Resolve the duplicate `@types/react` reachable from `apps/contentful-poc`. **The workspace
      is deliberately split across two React majors** (measured 2026-08-11), so a blanket
      override is not available:

      | React 19 | React 18 |
      |---|---|
      | `apps/web` (`^19.2.0`), `apps/studio` (`^19.1`), `apps/contentful-poc` (`19.2.4`), `packages/design-system` (types `^19.0.0`) | `apps/storybook` (`^18.2.0`), `packages/storybook-docs` (`^18.2.0`) |

      Root `pnpm.overrides` is currently empty. Pinning `@types/react` globally to 19 would put
      React-19 types against a React-18 runtime in Storybook. Prefer a scoped fix — a selector
      override (`"pkg>@types/react"`), or `paths`/`typeRoots` in `apps/contentful-poc/tsconfig.json`,
      which cannot affect any other package. Record which and why.
- [ ] **Acceptance is structural, not statistical.** A green run proves nothing here — it was
      green 4 hours before it was red, and green again on re-run. The criterion is that only
      **one** `@types/react` is reachable from `apps/contentful-poc`, verified by inspecting the
      resolved tree (`pnpm why @types/react`), not by counting green runs

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
