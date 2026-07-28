# Agentic Caucus — Control Register

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-07-28
**Related:** [[verification-review]] (`docs/conventions/verification-review.md`), [[governance-coverage]] (`docs/ai/agentic-caucus/governance-coverage.md`), [[incident-log]] (`docs/ai/agentic-caucus/incident-log.md`)

---

## Purpose

One row per control: every gate, validator, test, deploy path, and published claim the
platform relies on. It is the inventory that did not exist, and its absence is why the
2026-07-28 post-mortem found six gaps at once rather than one at a time.

[[governance-coverage]] maps the platform against a governance model and answers *what
layers are covered*. This answers the narrower, sharper question: **for each individual
control, is it probed, and who reads its result?**

Enforced by `pnpm validate:controls` (`scripts/validate-control-register.js`), which runs in
CI. The checker asserts every row is complete, every `enforced-by-code` row's probe genuinely
exists in the `PROBES` array of `scripts/validate-enforcement-liveness.js`, every `validate:*`
script in the workspace has a row, and no `Next read` date has passed.

## How to read a row

- **Class** — `enforced-by-code` (a validator, hook, or build step makes it true),
  `measured` (an empirical result with a committed record), `convention` (true by discipline),
  `roadmap` (not true yet). Same four values the red-pen diagram gate uses.
- **Probe** — the `gate:` string in the `PROBES` array that proves this control fails against
  a deliberately broken input. `none — <reason>` is legitimate; blank is not.
- **Reader** — who or what reads the result. `continuous` in *Next read* means a machine reads
  every run; a date means a human must look by then.
- **Bypass** — known paths to production that skip this control. `none known` is an assertion
  someone made, not a guarantee.

## How to add a row

Run the `verification-reviewer` subagent against the plan. It emits paste-ready rows. Allocate
the next free `CTL-NNN`; IDs are monotonic and never reused. A new gate ships with its probe
and its row **in the same epic** — that is the rule that keeps the probe set from silently
falling behind the gate set.

---

## Register

| ID | Control | Class | Probe | Reader | Next read | Bypass |
|---|---|---|---|---|---|---|
| CTL-001 | `validate:tokens` | enforced-by-code | `validate:tokens` | `.husky/pre-commit` blocks the commit | continuous | `git commit --no-verify` |
| CTL-002 | `validate:tokens:strict` | enforced-by-code | `validate:tokens:strict` | `.husky/pre-commit` blocks the commit | continuous | `git commit --no-verify` |
| CTL-003 | `validate:style-mirror` | enforced-by-code | `validate:style-mirror` | `.husky/pre-commit` blocks the commit | continuous | `git commit --no-verify` |
| CTL-004 | `validate:dead-refs` | enforced-by-code | `validate:dead-refs` | `.husky/pre-commit` blocks the commit | continuous | `git commit --no-verify` |
| CTL-005 | `validate:css-names` | enforced-by-code | `validate:css-names` | `.husky/pre-commit` blocks the commit | continuous | `git commit --no-verify`; only scans `apps/web/src/pages/` |
| CTL-006 | `validate:validators` | enforced-by-code | `validate:validators` | `.husky/pre-commit` blocks the commit | continuous | `git commit --no-verify` |
| CTL-007 | `pnpm lint` (incl. `boundaries.js`) | enforced-by-code | `pnpm lint` | `.husky/pre-commit` + `ci.yml` | continuous | `git commit --no-verify`; pre-commit ran web-only while repo-wide lint was red (SUG-255) |
| CTL-008 | `validate:urls` | enforced-by-code | none — no probe yet, SUG-256 follow-up | `ci.yml:76` → `ci-failure-alert.yml` | 2026-10-28 | not in pre-commit; a local commit is unchecked until it reaches CI |
| CTL-009 | `validate:filters` | enforced-by-code | none — no probe yet, SUG-256 follow-up | `ci.yml:79` → `ci-failure-alert.yml` | 2026-10-28 | not in pre-commit; unchecked until CI |
| CTL-010 | `validate:taxonomy` | enforced-by-code | none — no probe yet, SUG-256 follow-up | `ci.yml:82` → `ci-failure-alert.yml` | 2026-10-28 | not in pre-commit; unchecked until CI |
| CTL-011 | `validate:schema-parity` | enforced-by-code | none — no probe yet, SUG-256 follow-up | `ci.yml:85` → `ci-failure-alert.yml` | 2026-10-28 | not in pre-commit; unchecked until CI |
| CTL-012 | `validate:content` | convention | none — needs Sanity API + long runtime | human, pre-PR (`MANUAL_BY_DESIGN`) | 2026-10-28 | runs on no hook and no CI job by design; nothing detects it being skipped |
| CTL-013 | `ci-failure-alert.yml` (the CI-red signal) | enforced-by-code | none — needs a genuinely red run on `main` to exercise | human, via the rolling `ci-red` issue | 2026-08-28 | `workflow_run` executes the `main` copy, so an unmerged fix is inert; silent if `GITHUB_TOKEN` issue perms are revoked |
| CTL-014 | `validate:enforcement-liveness` | enforced-by-code | none — the probe harness cannot probe itself | `ci.yml:152` → `ci-failure-alert.yml` | 2026-10-28 | probes only the 8 gates in `PROBES`; a gate with no probe is invisible to it |
| CTL-015 | `validate:controls` (this register) | enforced-by-code | `validate:controls` | `ci.yml` → `ci-failure-alert.yml` | continuous | rows enter only when a human or the reviewer adds them; non-script controls are not auto-discovered |
| CTL-016 | `pnpm typecheck` | enforced-by-code | none — no probe yet, SUG-256 follow-up | `ci.yml:73` → `ci-failure-alert.yml` | 2026-10-28 | not in pre-commit; `turbo` is fail-fast so a later package's errors stay hidden |
| CTL-017 | `pnpm build` | enforced-by-code | none — a broken build is self-evident | `ci.yml:94` → `ci-failure-alert.yml` | continuous | Netlify builds independently of CI; a green Netlify deploy does not imply CI ran |
| CTL-018 | `pnpm test:smoke` (5 route specs) | enforced-by-code | none — no probe yet, SUG-256 follow-up | `ci.yml:119` → `ci-failure-alert.yml` | 2026-10-28 | covers 5 routes; every other route is unproven at runtime |
| CTL-019 | Chromatic VRT | enforced-by-code | `chromatic.sh reachability` | human approval of diffs | 2026-08-28 | probe proves the script is *reachable*, not that it *catches a diff*; deferral is permitted per close-out step 4, and a deferred run has no reader |
| CTL-020 | Netlify deploy path | convention | none — no probe; deploy is external to CI | human, at deploy time | 2026-08-28 | Netlify builds from `main` on push regardless of CI conclusion (G4). Preview and staging targets would each be a separate unprobed path |
| CTL-021 | `/platform/governance` published statistics | measured | none — not machine-checked | human, on re-measurement | 2026-08-28 | published "30 checkpoints · 0 gaps" with no date and no reproducing command while the pipeline was red (G11). Re-measurement is pending; the claim carries a liveness caveat until then |
| CTL-022 | `sugartown_check_boundary` (MCP tool) | convention | none — answers from documented intent, not behaviour | agent at call time; no human reads it | 2026-08-28 | reports boundary status from rules as written rather than as enforced, so it returns a pass where `boundaries.js` matched nothing (G8/G9) |
| CTL-023 | Release history pushed to remote | convention | none — a workflow habit, not a gate | human, at `/eod` | 2026-08-28 | nothing detects unpushed commits between `/eod` runs; 48 commits sat on one disk for two days (G10) |

---

## Known coverage gaps

Stated here because a register that only lists what is covered is the failure it exists to
prevent. Measured 2026-07-28 by reading `PROBES` and every workspace `package.json`:

- **6 of 12 `validate:*` scripts have no probe** (CTL-008 through CTL-012, CTL-014). They are
  wired and they run; nothing proves they would fail against a broken input. The probe set has
  been growing more slowly than the gate set.
- **`typecheck`, `build`, and `test:smoke` have no probes** (CTL-016 through CTL-018).
- **Four controls are `convention` with no machine backstop at all** (CTL-012, CTL-020,
  CTL-022, CTL-023). Three of the four appear in the 2026-07-28 post-mortem as materialised
  gaps. Convention is a legitimate class; three-quarters of it failing in one quarter is a
  signal about how much weight it can carry.
- **CTL-019's probe checks reachability, not detection.** `chromatic.sh` dying on line 1 for
  36 days is now caught; Chromatic running and catching nothing would not be.
- **CTL-013 is the backstop for eleven other rows and is itself unprobed.** Its failure mode is
  silence, which is the hardest to notice. Shortest re-read interval in the register for that
  reason.

Closing these is scoped as SUG-256 follow-up work, not as a precondition for the register
being useful. An accurate register with named holes is worth more than a tidy one.
