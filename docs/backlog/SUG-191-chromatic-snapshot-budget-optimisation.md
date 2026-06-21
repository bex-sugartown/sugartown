---
**Epic:** SUG-191 — Chromatic snapshot budget optimisation
**Linear Issue:** [SUG-191](https://linear.app/sugartown/issue/SUG-191/chromatic-snapshot-budget-optimisation-turbosnap-skip-gate-story)
**Status:** Backlog
**Priority:** 🔴 Now
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-191 — Chromatic snapshot budget optimisation

Reduce Chromatic snapshot consumption to stay within free plan limits month-to-month, via TurboSnap, smart skip gates, story count discipline, and `disableSnapshot` on docs/utility stories.

## Background

The Sugartown component library has grown to the point where a single Chromatic run consumes enough snapshots to exhaust the free plan in approximately one week (90% consumed within ~7 days as of 2026-06-21). Every story in Storybook is snapshotted on every run — including docs stories, token tables, and usage-doc helpers that have no visual output worth diffing. There is no skip gate for commits that cannot produce visual regressions (schema, content, tooling). TurboSnap (`--only-changed`) is not yet enabled, meaning all ~N stories run even when a single component changes. These three factors compound: an epic touching 2 components triggers the same snapshot count as a full design system rewrite.

## Objective

After this epic, Chromatic snapshot consumption is reduced by at least 60% per billing cycle without degrading VRT coverage on real visual surfaces. TurboSnap traces component dependency graphs so only affected stories re-snapshot. A skip gate prevents Chromatic from running entirely on commits that touch only non-visual files. Docs/utility stories are excluded from snapshotting. Story count conventions cap new component stories at three per component (default, dark-pink-moon, edge case).

## Scope

- [ ] **Phase 1 — TurboSnap**: Add `--only-changed` flag to the Chromatic CLI command in `apps/storybook/package.json`. Verify TurboSnap is supported by current Chromatic package version. Run a baseline count (total stories) before and after to confirm reduction. — layer: tooling
- [ ] **Phase 2 — Skip gate**: Add a CI skip condition so Chromatic does not run when the diff contains only non-visual files (schema, content, docs, tooling, migrations). Implement via commit message flag `[skip chromatic]` and/or a `git diff --name-only` filter in the Chromatic npm script or CI workflow. Document the flag in `docs/conventions/chromatic-conventions.md` (new file). — layer: tooling / CI
- [ ] **Phase 3 — `disableSnapshot` audit**: Audit all existing Storybook stories for docs/utility stories that have no visual output (token tables, usage docs, DS helper stories, Welcome/Introduction pages). Add `parameters: { chromatic: { disableSnapshot: true } }` to each. — layer: Storybook
- [ ] **Phase 4 — Story count convention**: Codify the three-story-per-component rule (default, dark-pink-moon, one meaningful edge case) in `docs/conventions/chromatic-conventions.md`. Audit existing component stories that exceed this — identify candidates for removal or merge. — layer: Storybook / conventions

## Phases

**Phase 1 — TurboSnap** (highest ROI, ship immediately)
Enable `--only-changed`. Single-line change to `apps/storybook/package.json`. Commit + mini-release.

**Phase 2 — Skip gate**
Add `[skip chromatic]` flag handling + `git diff` filter. Write `chromatic-conventions.md`. Commit + mini-release.

**Phase 3 — `disableSnapshot` audit**
Audit all stories, add parameter to non-visual ones. This is a one-time cleanup — ongoing enforcement is the story count convention from Phase 4.

**Phase 4 — Story count convention + audit**
Write the three-story rule. Audit existing stories against it. Remove or merge excess stories. Final mini-release closes the epic.

## Acceptance criteria

- [ ] TurboSnap enabled: `--only-changed` present in Chromatic CLI command; a run touching one component does not snapshot unrelated stories (verified via Chromatic build output showing "X of Y stories captured")
- [ ] Skip gate works: a commit with only `.md`, schema `.ts`, or `queries.js` changes does not trigger a Chromatic run (or exits immediately with 0 snapshots)
- [ ] `disableSnapshot: true` applied to all docs/utility stories that have no renderable visual output
- [ ] `docs/conventions/chromatic-conventions.md` exists and documents: TurboSnap behaviour, skip gate flag, three-story rule, and `disableSnapshot` pattern
- [ ] Monthly snapshot consumption visibly reduced (confirmed by Chromatic dashboard after next billing cycle resets)

## Human QA Walkthrough

Not applicable — no shared CSS, token, or multi-page component changes. Chromatic itself is the verification mechanism.

## Technical notes

- **Current Chromatic command** (in `apps/storybook/package.json`):
  ```
  chromatic --build-script-name=storybook:build --exit-zero-on-changes
  ```
  Phase 1 change: add `--only-changed` to this command.

- **TurboSnap compatibility**: requires `chromatic >= 6.11`. Verify `apps/storybook/package.json` `chromatic` version before adding the flag. Current version in package.json: `^16.2.0` — TurboSnap is supported.

- **Skip gate approach**: two options:
  - (a) Commit message flag `[skip chromatic]` — simplest; requires discipline at commit time
  - (b) `git diff --name-only HEAD~1` filter in the npm script — automatic; runs on every push but exits early if no visual files changed
  Phase 2 should implement (b) as the automatic gate and document (a) as the manual override.

- **`disableSnapshot` pattern**:
  ```ts
  export default {
    parameters: {
      chromatic: { disableSnapshot: true },
    },
  }
  ```
  Apply at the story file level (default export) for entirely non-visual files. Apply at the story level for individual non-visual stories in otherwise-visual files.

- **Activation audit**: before Phase 3, run `grep -r "disableSnapshot" apps/storybook/` to see what's already opted out, then cross-reference against `apps/storybook/src/stories/` to identify candidates. DS helper stories (`*Docs.tsx` wrappers), Welcome, Introduction, and token-table stories are the primary targets.

- **Model & Mode**: `/model sonnet` — all changes are mechanical (flag additions, parameter additions, convention doc authoring). No architecture decisions.

## Model & Mode [REQUIRED]

`/model sonnet` — mechanical tooling changes and convention authoring; no architecture or design decisions required.

## Non-Goals

- Upgrading to a paid Chromatic plan (this epic extends the free tier; upgrade is a separate business decision)
- Changing which branches trigger Chromatic (always main/EOD push — already established convention)
- Removing VRT coverage from any story that has genuine visual output
- Retrofitting story count limits retroactively if stories exist for good reason (audit in Phase 4 will make per-case decisions, not blanket deletions)

## Related

- **Linear:** [SUG-191](https://linear.app/sugartown/issue/SUG-191/chromatic-snapshot-budget-optimisation-turbosnap-skip-gate-story)
- **Chromatic script:** `apps/storybook/package.json` → `scripts.chromatic`
- **Existing Storybook epics:** SUG-161 (`docs/backlog/SUG-161-storybook-testing-infrastructure.md`), SUG-176 (`docs/backlog/SUG-176-storybook-story-coverage-app-level-composites.md`)
- **Epic template:** `docs/epic-template.md`
