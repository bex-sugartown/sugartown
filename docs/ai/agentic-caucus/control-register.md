# Agentic Caucus — Control Register

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-07-28
**Related:** [[verification-review]] (`docs/conventions/verification-review.md`), [[governance-coverage]] (`docs/ai/agentic-caucus/governance-coverage.md`), [[incident-log]] (`docs/ai/agentic-caucus/incident-log.md`)

---

## Purpose

One row per control: every gate, validator, test, deploy path, and published claim the
platform relies on.

[[governance-coverage]] maps the platform against a governance model and answers which layers
are covered. This answers a narrower question: for each control, is it probed, and who reads
its result?

Enforced by `pnpm validate:controls` (`scripts/validate-control-register.js`) in CI. See
`docs/conventions/verification-review.md` for what it checks and why.

## How to read a row

- **Class** — `enforced-by-code` (a validator, hook, or build step makes it true), `measured`
  (an empirical result with a committed record), `convention` (true by discipline), `roadmap`
  (not true yet). Same four values as the red-pen diagram gate.
- **Probe** — the `gate:` string in the `PROBES` array of
  `scripts/validate-enforcement-liveness.js`. `none — <reason>` is fine; blank is not.
- **Reader** — who or what reads the result. `continuous` in *Next read* means a machine reads
  every run. A date means a human must look by then.
- **Bypass** — paths to production that skip this control. `none known` is someone's
  assertion, not a guarantee.

## How to add a row

Run the `verification-reviewer` subagent against the plan. It emits paste-ready rows. Use the
next free `CTL-NNN`; IDs are never reused. A new gate ships with its probe and its row in the
same epic, so the probe set does not fall behind the gate set.

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
| CTL-013 | `ci-failure-alert.yml` (the CI-red signal) | enforced-by-code | none — needs a genuinely red run on `main` to exercise | human, via the rolling `ci-red` issue | 2026-08-28 | `workflow_run` runs the `main` copy, so an unmerged fix does nothing; silent if `GITHUB_TOKEN` issue perms are revoked |
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

Measured 2026-07-28 by reading `PROBES` and every workspace `package.json`.

- **6 of 12 `validate:*` scripts have no probe** (CTL-008 to CTL-012, CTL-014). They are wired
  and they run. Nothing proves they would fail against a broken input.
- **`typecheck`, `build` and `test:smoke` have no probes** (CTL-016 to CTL-018).
- **4 controls are `convention` with no machine backstop** (CTL-012, CTL-020, CTL-022,
  CTL-023). Three of the four are materialised gaps in the 2026-07-28 post-mortem.
- **CTL-019's probe checks reachability, not detection.** It catches `chromatic.sh` dying on
  line 1. It would not catch Chromatic running and finding nothing.
- **CTL-013 backs up eleven other rows and has no probe.** It fails silently, so it has the
  shortest re-read interval here.

Closing these is SUG-256 follow-up work, not a precondition for the register being useful.
