---
**Epic:** ST-95 — Liveness probes only, no register
**GitHub Issue:** [#95](https://github.com/bex-sugartown/sugartown/issues/95)
**Status:** Done 2026-08-25 — harness built, wired into CI, verified green locally (9 gates proven live, 0 inert). The one open Scope item, the kill-criterion date, is recordable only after the first CI run on `origin/main`; see Still open below.
**Priority:** 🔴 High
**Merge strategy:** (a) Merge-as-you-go
---

# ST-95 — Liveness probes only, no register

## Background

Build-back item 1 of 3 from the governance post-mortem
(`docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §7).

SUG-284 removed the governance layer on 2026-08-15, including `validate:enforcement-liveness`.
That validator was the one piece of the layer with measured value: 6 of the 14 incidents in
the log are inert-mechanism bugs, where a gate was declared and not firing. The
`packages/eslint-config` boundary rules sat inert for 176 days while reporting as configured;
`validate:schema-parity` was an always-passing stub.

This epic rebuilds the probes and nothing else. The register machinery that grew around them
(`control-register.md`, `nextRead` dates, the coverage tally) is explicitly not rebuilt, per
§7's "Explicitly not rebuilt" list.

## Objective

One probe per gate, each proving the gate fails on deliberately broken input rather than
confirming the gate exists. No register, no dated rows, no published tally.

## Scope

- [x] Decide the probe inventory: which gates get a probe, and why each earns one — layer: process

      **Decided 2026-08-21.** Six gates, all local/file-based (no production-data risk), each
      verified against current repo state rather than assumed from the post-mortem's incident
      list:

      | Gate | Why it earns a probe | Fixture |
      |---|---|---|
      | `validate:tokens` (apps/web) | Live, file-based, never verified to actually bite | undefined `var(--st-*)` reference |
      | `validate:tokens --strict-colors` | Same | hardcoded hex in a component CSS file |
      | `validate:style-mirror` | Guards the exact drift class INC-004's orphaned root `validate-tokens.js` used to cover | diverge one byte between the mirrored theme files |
      | `validate:dead-refs` | Live, file-based, never verified to bite | component referencing a nonexistent `styles.xxx` |
      | `validate:css-names` | Live, file-based, never verified to bite | content-type-scoped class name under `pages/` |
      | ESLint boundary rules (`boundariesFor`/`boundary-rules.js`) | **This is INC-011 itself.** Confirmed fixed 2026-08-21 (SUG-254 — deleted the dead alias rather than keeping it, so a stale reference fails loudly instead of silently enforcing nothing) and now consumed by 5 packages' eslint configs. The highest-value probe in the set: it's the one gate on this list with direct incident history of going inert for 176 days while reporting green | deliberate cross-boundary import |

      **Considered and excluded, with reasons:**
      - **Chromatic VRT** — wired but `--exit-zero-on-changes`, deliberately never blocks today.
        Not probe-shaped until [SUG-263](https://github.com/bex-sugartown/sugartown/issues/88)
        (already backlogged) resolves what "live" even means for it.
      - **Storybook frozen build-time globals (INC-005)** — confirmed still frozen
        (`__BUILD_DATE__`, `__APP_VERSION__` in `viteFinal`), but this is a written review
        convention with no exit code, not a scripted validator. Probing it means building a new
        mechanism, which is scope creep for a probes-only epic.
      - **Root `validate-tokens.js` (INC-004)** — confirmed deleted, not orphaned. Nothing left
        to probe; `validate:style-mirror` above already covers the same drift risk.

- [x] Reconcile with SUG-269 ([#93](https://github.com/bex-sugartown/sugartown/issues/93)) — it overlaps directly; decide merge or keep separate — layer: process

      **Decided 2026-08-21: keep separate, not merged.** SUG-269's technical diagnosis is still
      correct (`validate:urls`, `validate:filters`, `validate:taxonomy` fetch live Sanity data
      and can't be probed with a broken-fixture approach without risking production writes), but
      its *mechanics* are dead — it references `control-register.md`,
      `governance/source/probes.json`, "Verification review," `validate:enforcement-liveness`,
      and CTL-008/009/010, all removed by SUG-284. Its own AC calls a script that no longer
      exists.

      Also found while checking: SUG-269's scope is stale in one more way — it names 3
      validators, but `validate:content` and `validate:schema-parity` are the same
      remote-data-fetching shape and should be added when it's rewritten.

      SUG-269 stays its own epic, picked up after this one proves the harness pattern works —
      it reuses this epic's harness pattern rather than inventing its own, and needs a full
      rewrite to drop the dead-governance-layer references before any of its Scope is
      actionable. Not touched further in this epic.

- [x] Implement the probe harness — layer: tooling

      **Built 2026-08-21** — `scripts/validate-liveness-probes.js` (`pnpm
      validate:liveness-probes`). Reuses the pattern from
      `zArchive/2026-08-sug284-governance-layer/scripts/validate-enforcement-liveness.js` (one
      harness, many probes; each probe writes a deliberate violation via an additive temp file
      or an in-memory-snapshot-restored mutation of a tracked file; cleanup runs in `finally`
      and on signals) — that mechanism was sound, only the register/tally built around it
      wasn't. Not a revival of the old file: new, minimal, scoped to the six approved gates
      (nine probes — the ESLint boundary gate expands to one probe per enforced scope: 4).

      **Verified, not just written:**
      - Clean run: `pnpm validate:liveness-probes` → 9/9 live, 0 inert, exit 0
      - Self-test: stubbed `apps/web/scripts/validate-css-names.js` to always exit 0, re-ran —
        harness correctly reported it `STAYED GREEN`/inert, exit 1. Restored, re-ran clean —
        back to 9/9 live. Confirms the harness distinguishes live from inert rather than
        passing regardless of what it's pointed at.
      - Working tree confirmed clean after both runs — the cleanup stack leaves no residue.

      **Finding surfaced while building, not yet acted on:** `validate:tokens`,
      `validate:tokens:strict`, `validate:style-mirror`, `validate:dead-refs`, and
      `validate:css-names` are enforced **only** by `.husky/pre-commit` — none has ever had its
      own CI step. `pnpm lint` (covering the boundary rules) is the one gate of the six that CI
      already ran independently. This means the new CI step below proves these five gates fire
      when invoked the way the hook invokes them, but does not by itself prove CI would catch a
      violation that reached it by any path that skips the hook (`--no-verify`, a non-hook
      client, a bot). Real gap, same shape as this whole epic — not fixed here, since deciding
      whether these five belong in CI as their own steps is a separate, more consequential call
      (adds ~5 steps, CI runtime cost, might surface currently-merged violations) that wasn't
      part of the approved 2026-08-21 scope. Worth a follow-up issue if it's not already covered
      by SUG-257/SUG-258's studio/web lint-coverage work.

- [x] Wire into CI — layer: tooling

      **Done 2026-08-21.** `.github/workflows/ci.yml` — new "Liveness probes" step
      (`pnpm validate:liveness-probes`), placed after "Validate schema parity" and before
      "Build", so an inert gate fails the run before the more expensive Build/Playwright steps.
      YAML syntax verified with `js-yaml` (not just eyeballed) before committing.

- [x] Record the kill-criterion check date — layer: process — **2026-10-20**, see Close-out

      **Cannot be set yet — depends on a real CI run, not local completion.** Per this doc's
      own instruction above: "Check date is 60 days from the first CI run that includes them."
      `main` is currently ahead of `origin/main` and not pushed (deliberate — batching toward
      the next `/ship`, per project convention). The 60-day clock starts on the first `Liveness
      probes` CI run on `origin/main`, not on this commit. Whoever runs `/ship` next: record
      that run's date here, and note it in the epic's close-out.

## Non-Goals

- A control register, in any form. §7 names it as not rebuilt.
- `nextRead` dates, coverage tallies, or any published count. Claim honesty is ST-96's
  subject, and it does not open until this epic has run a full cycle.
- Making the Sanity-backed validators probeable. Classified structurally unprobeable by AOP-0
  and owned by SUG-269 unless the reconciliation above folds it in.

## Kill criterion

**If the probes find nothing new in 60 days, retire them.** Set at birth per post-mortem 6.7.
Check date is 60 days from the first CI run that includes them; record the actual date here
when the harness merges.

## Sequencing

**ST-98 runs first** ([#98](https://github.com/bex-sugartown/sugartown/issues/98)): post-mortem 6.7 (kill criterion at birth) and 6.1 (no generator before its reader) both govern how this epic is built, so they land as rules before the probes are written. Decided 2026-08-16.

Then this epic ships alone. Runs for one full epic cycle before ST-96 opens. Then answer in writing: did
it catch anything a human would not have? Only a yes unlocks item 2. Two consecutive noes end
the rebuild.

This discipline exists because the original layer's failure was that all seven of its features
arrived in five weeks with no interval in which to judge any of them.

## Dangling references to clear

Three live documents carry acceptance criteria against the deleted
`validate-enforcement-liveness.js`. Whoever picks this epic up decides whether the rebuilt
harness satisfies them or whether they are rewritten:

| Where | Line | The dangling requirement |
|---|---|---|
| `docs/backlog/SUG-269-sanity-validator-probeability.md` | 75 | AC requires `pnpm validate:enforcement-liveness` to report 3 more gates live |
| `docs/backlog/SUG-264-validate-banned-words.md` | 63, 79 | AC requires a probe in the deleted script |
| `docs/briefs/governance-data-layer-prd.md` | 183, 231 | live PRD for the cancelled SUG-268 |

## Related

- **GitHub:** [#95](https://github.com/bex-sugartown/sugartown/issues/95)
- **Post-mortem:** `docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md` §7
- **Next in sequence:** ST-96 ([#96](https://github.com/bex-sugartown/sugartown/issues/96))
- **Overlaps:** SUG-269 ([#93](https://github.com/bex-sugartown/sugartown/issues/93))


---

## Close-out 2026-08-25

Harness re-run locally at close-out: **9 gates proven live, 0 inert**, working tree left clean
by the run itself (`pnpm validate:liveness-probes`). Wired into `ci.yml:101`.

Close-out steps: 1 commit (`9106cf06`) · 1b local smoke green, 5/5 · 2 schema N/A, no
`apps/studio/schemas/` change · 3 Visual QA N/A, no rendered surface · 4 Chromatic N/A, no CSS,
component JSX or story touched · 5 data pipeline N/A · 6 this move · 6b vspec N/A · 7 CHANGELOG
`[Unreleased]` line added · 8 issue closed · 9 tree clean.

### Kill-criterion check date: 2026-10-20

**Recorded 2026-08-25, and the clock had already started.** This doc previously assumed the
harness was unpushed and the date therefore unsettable. That was true when written and stopped
being true the same day: the v0.35.0 ship on 2026-08-21 pushed it as part of the same batch.

Evidence, each from a command rather than from this doc's prior text:

| Claim | Command | Result |
|---|---|---|
| Harness commit reached `origin/main` | `git merge-base --is-ancestor 9106cf06 d31b1367` | true |
| CI ran the probes on `origin/main` | `gh run view 32482993519 --json jobs` | step `Liveness probes`: **success** |
| Date of that run | `gh run view 32482993519 --json createdAt` | `2026-08-21T12:40:18Z` |
| Check date | 2026-08-21 + 60 days | **2026-10-20** |

**On 2026-10-20, answer in writing: did the probes catch anything a human would not have?** A
yes unlocks ST-96 (#96). A no, twice consecutively, ends the rebuild and retires the harness.
All five Scope items are now complete.
