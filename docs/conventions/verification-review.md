# Verification Review

**Version:** v1.1
**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-07-29
**Related:** [[control-register]] (`docs/ai/agentic-caucus/control-register.md`), [[governance-coverage]], [[risk-tiers]], `docs/epic-template.md` §Enforcement liveness

---

## Purpose

Ask five questions about every control a plan relies on, before the plan is built. Write
the answers into the control register.

This sits upstream of checks that already exist:

| Question | Answered by | Since |
|---|---|---|
| Is the gate wired? | `pnpm validate:validators` | SUG-239 |
| Does the gate fire? | `pnpm validate:enforcement-liveness` | SUG-255 |
| Is CI's result read? | `ci-failure-alert.yml` (CI on `main` only) | SUG-255 |
| **Does the control set have gaps?** | **this review + `pnpm validate:controls`** | **SUG-256** |

The fourth row is what nothing covered. `validate:enforcement-liveness` proves the gates it
probes are live. It cannot see a gate nobody wrote a probe for, a control that is not an npm
script (a deploy path, a published claim), or a result with no reader.

## When it fires

Blocking for:

- Any PRD whose scope includes a gate, validator, test, review step, deploy path, or a
  published claim about the platform
- Any epic that adds, changes, or retires a control
- Any change to `.husky/pre-commit`, `.github/workflows/**`, or a `validate:*` script
- Any surface publishing a governance statistic

Not fired by feature work, content, CSS, or copy that relies only on controls that already
have a register row.

## The five questions

Ask these of each control, not of the plan as a whole. Each maps to a role from the
2026-07-28 post-mortem.

**1. Liveness (QA / Test Lead).** What artifact proves this ran? A run ID, timestamp, file
path, or commit SHA. "CI is green" is not an artifact.

**2. Canary (QA / Test Lead).** What deliberately broken input must make this fail? Name the
gate in the `PROBES` array of `scripts/validate-enforcement-liveness.js`, or say why no probe
is practical. A new gate ships with its probe, in the same epic. Do not build a second probe
harness; add to that one.

**3. Bypass (DevOps).** What path reaches production without crossing this? List them: direct
push, a second deploy target, a preview environment, a manual trigger, `--no-verify`, a build
running from a different config root.

**4. Claim (Governance / Content Owner).** Does this publish a statement about the platform?
If so it needs a measurement date and the command or file that reproduces the number.

**5. Reader (Release Manager / Eng Manager).** Who reads the result, how often, and by what
date does that reading go stale? A named human cadence or a named machine. The date is the
only field that becomes false on its own, so it is what catches decay.

## Output: a control register row

The review produces rows in `docs/ai/agentic-caucus/control-register.md`, not a verdict.

| Field | Meaning | Checked by `validate:controls` |
|---|---|---|
| `ID` | `CTL-NNN`, never reused | format, uniqueness |
| `Control` | what it is, named as it is invoked | non-empty |
| `Class` | `enforced-by-code` / `measured` / `convention` / `roadmap` | in the allowed set |
| `Probe` | gate name in `PROBES`, or `none — <reason>` | cross-referenced against the real array |
| `Reader` | who or what reads the result | non-empty |
| `Next read` | `YYYY-MM-DD`, or `continuous` | parses; not in the past |
| `Bypass` | paths that skip it, or `none known` | non-empty |

`Class` uses the same four values as the red-pen diagram gate. An empty cell is a finding.
`none — <reason>` is fine; blank is not.

## Enforcement

`pnpm validate:controls` runs in CI and checks:

1. Rows are complete and well-formed, `Class` is valid, IDs are unique
2. Every `enforced-by-code` row's probe exists in the real `PROBES` array, read from the file
3. Every `validate:*` script in the workspace has a row
4. No `Next read` date has passed

Check 4 fails on a date nobody chose deliberately. That is intended: it turns quiet staleness
into a build failure. CI failure on `main` opens a rolling `ci-red` issue, so it reaches a
human. That chain depends on `ci-failure-alert.yml`, which is CTL-013 with its own reader.

The gate has a probe in `validate-enforcement-liveness.js` (`gate: 'validate:controls'`).

## Running the review

Use the `verification-reviewer` subagent. It runs in a fresh context with no visibility into
the session that wrote the plan, the same isolation `design-reviewer` uses. That isolation is
what makes the review useful. A persona pass inside the authoring session will ratify its own
reasoning.

The agent is read-only. It proposes rows and findings; the main session writes.

Findings are graded:

- **Blocker** — a control with no probe and no reader; a published claim with no measurement
  date; a bypass path that reaches production unchecked
- **Gap** — an incomplete row, or a class that overstates the control
- **Note** — real coverage that is thinner than it looks

## What this does not do

- **It does not catch decay by itself.** It writes expiry dates; `validate:controls` catches
  them.
- **It does not replace the probe harness.** Question 2 adds a probe to the existing one.
- **It only covers controls it is told about.** Completeness is enforced for `validate:*`
  scripts, which the checker can enumerate. Deploy paths, published claims, and human
  cadences enter the register only because someone put them there.

Of the six gaps in the 2026-07-28 post-mortem, this review would have caught G4, G8/G9 and
G11 at plan time. G1/G5 and G2/G3 only via the expiry date, not the review. G10 not at all;
that one belongs to `/eod`.
