---
**Epic:** SUG-283 — `apps/contentful-poc` build fails in CI on a React types conflict
**Linear Issue:** [SUG-283](https://linear.app/sugartown/issue/SUG-283/appscontentful-poc-build-fails-in-ci-on-a-react-types-conflict-green)
**GitHub Issue:** [#94](https://github.com/bex-sugartown/sugartown/issues/94)
**Status:** Done — scoped fix applied 2026-08-21
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
- [x] Resolve the duplicate `@types/react` reachable from `apps/contentful-poc`. **The workspace
      is deliberately split across two React majors** (measured 2026-08-11), so a blanket
      override is not available:

      | React 19 | React 18 |
      |---|---|
      | `apps/web` (`^19.2.0`), `apps/studio` (`^19.1`), `apps/contentful-poc` (`19.2.4`), `packages/design-system` (types `^19.0.0`) | `apps/storybook` (`^18.2.0`), `packages/storybook-docs` (`^18.2.0`) |

      Root `pnpm.overrides` is currently empty. Pinning `@types/react` globally to 19 would put
      React-19 types against a React-18 runtime in Storybook. Prefer a scoped fix — a selector
      override (`"pkg>@types/react"`), or `paths`/`typeRoots` in `apps/contentful-poc/tsconfig.json`,
      which cannot affect any other package. Record which and why.

      **Done 2026-08-21:** used the selector override, `"@sugartown/contentful-poc>@types/react"`
      in root `pnpm.overrides` — see Close-out section below.
- [x] **Acceptance is structural, not statistical.** A green run proves nothing here — it was
      green 4 hours before it was red, and green again on re-run. The criterion is that only
      **one** `@types/react` is reachable from `apps/contentful-poc`, verified by inspecting the
      resolved tree (`pnpm why @types/react`), not by counting green runs

      **Done 2026-08-21:** `pnpm why @types/react` from `apps/contentful-poc` shows exactly one
      reachable copy (`19.2.10`) — see Close-out section below.

## Close-out 2026-08-21

**Applied fix:** root `package.json` `pnpm.overrides`, scoped to `@sugartown/contentful-poc`
only:

```json
"pnpm": {
  "overrides": {
    "@sugartown/contentful-poc>@types/react": "19.2.10",
    "@sugartown/contentful-poc>@types/react-dom": "19.2.3"
  }
}
```

`pnpm install --no-frozen-lockfile` recorded the override in `pnpm-lock.yaml`. The diff changed
only `contentful-poc`'s own `@types/react`/`@types/react-dom` specifiers from range (`^19`) to
exact pin — the resolved versions were unchanged (`downloaded 0, added 0`), and no other
workspace package's lockfile entry moved.

**What was investigated and ruled out**, so the next session does not re-derive it:

| Hypothesis | Finding |
|---|---|
| A second physical `@types/react` reachable via `pnpm why` today | No — `pnpm why @types/react` from `apps/contentful-poc` showed only `19.2.10`, both before and after the fix |
| Workspace-wide duplicate `@types/react` versions | Confirmed two exist in the pnpm store (`18.3.27` — Storybook only; `19.2.10` — everything else), but Storybook (`apps/storybook`) and `contentful-poc` are separate pnpm-isolated dependency graphs with no declared path between them |
| `@sugartown/design-system` (a `contentful-poc` dependency, symlinked via `workspace:*`) pulling in the 18.x copy | No — its own devDependency is `@types/react: ^19.0.0`, which only resolves to `19.2.10` in this lockfile |
| Turbo build-order race (`contentful-poc` type-checking against a stale/mid-write `design-system` `dist/`) | Ruled out — `turbo.json`'s `build` task has `dependsOn: ["^build"]`, so `design-system` always finishes its own build before `contentful-poc`'s starts |
| CI running a different `pnpm` version than local | No — `.github/workflows/ci.yml` pins `pnpm/action-setup@v3` to `9.1.0`, matching `package.json`'s `packageManager` and the local install |
| `tsconfig.json`'s `include` glob reaching outside `apps/contentful-poc` (e.g. into `apps/storybook`) | No — glob patterns in `tsconfig.json` `include` resolve relative to the tsconfig's own directory; `**/*.tsx` there cannot match files under `apps/storybook` |

**No mechanism was found that reproduces the original CI error locally** — consistent with the
2026-08-11 finding that it does not reproduce locally and is non-deterministic across identical
commits. This fix is applied on the epic's own recommended remedy (a scoped `pnpm.overrides`
pin removes pnpm's freedom to resolve `contentful-poc`'s `@types/react`/`@types/react-dom` via a
semver range at all, which is the standard fix for this class of non-deterministic transitive
resolution, even without a confirmed root-cause repro) plus the investigation above ruling out
the mechanisms that could be checked statically.

**Verification performed:**
- `pnpm why @types/react` from `apps/contentful-poc` — exactly one reachable copy (`19.2.10`), the epic's structural AC
- `pnpm exec tsc --noEmit` inside `apps/contentful-poc` — clean, no errors
- `pnpm build` (real `next build`, dummy Contentful credentials) — TypeScript phase compiled and finished cleanly (`Finished TypeScript in 1190ms`); the build later failed at static-page prerendering because the dummy credentials 404'd against the live Contentful API — expected and unrelated to this epic's scope
- `pnpm test:smoke` (root) — 5/5 passed

**What this does not prove:** a green local run does not retire the flake statistically, per the
epic's own "acceptance is structural, not statistical" framing. What it proves is the AC that
was written to be checkable: only one `@types/react` is reachable from `apps/contentful-poc`.
Whether the fix also holds under CI's specific runner conditions is confirmed by watching the
next several CI runs — if the same error recurs post-fix, the mechanism is not what this
close-out assumed and needs re-investigation from the "ruled out" table above.

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
