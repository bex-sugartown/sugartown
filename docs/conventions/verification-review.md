# Verification Review — catching gaps at plan time

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-07-28
**Related:** [[control-register]] (`docs/ai/agentic-caucus/control-register.md`), [[governance-coverage]] (`docs/ai/agentic-caucus/governance-coverage.md`), [[risk-tiers]] (`docs/ai/agentic-caucus/risk-tiers.md`), [[feedback-loop]] (`docs/conventions/feedback-loop.md`), `docs/epic-template.md` §Enforcement liveness

---

## Purpose

The 2026-07-28 post-mortem found six gaps and one org gap underneath them: *every unfilled
role was the same role — the one that reads the result rather than performs the work.*
Automation and AI covered execution. Nothing covered verification of the verifiers.

This document defines the review that fills that role, and the register it writes to.

It is deliberately **upstream** of the machinery that already exists. Sugartown already
answers two of the three questions a control must survive:

| Question | Answered by | Since |
|---|---|---|
| Is the gate *wired*? | `pnpm validate:validators` | SUG-239 |
| Does the gate *fire*? | `pnpm validate:enforcement-liveness` (deliberate-violation probes) | SUG-255 |
| Is the gate's result *read*? | `ci-failure-alert.yml` (CI on `main` only) | SUG-255 |
| **Does the control set have *gaps*?** | **this review + `pnpm validate:controls`** | **SUG-256** |

The fourth row is the one nothing covered. `validate:enforcement-liveness` proves the eight
gates it probes are live. It cannot know about a ninth gate nobody wrote a probe for, a
control that is not an npm script at all (a deploy path, a published claim), or a result with
no reader. That blind spot is the same shape as the failure it was built to fix, one level up.

---

## The principle

> A control you cannot name, probe, and assign a reader to is not a control. It is a belief.

Three failure classes follow from that, and the review is built to separate them:

- **Spec gaps** — verification was never designed in. Catchable at plan time. This review's
  primary target.
- **Coverage gaps** — verification exists but the control set has holes. Catchable by the
  register's completeness check.
- **Decay gaps** — verification was designed, worked, then quietly stopped. *Not* catchable by
  review. Only an expiry date and a reader catch these.

A review that produces opinions catches only the first class. A review that produces a
**register row with an expiry date** catches all three, because the row keeps working after
the reviewer stops paying attention. That is the whole design: the reviewer's output is an
artifact, never a verdict.

---

## When this fires

**Blocking** for:

- Any PRD (`sugartown-prd-writer` §11) whose scope includes a gate, validator, test, review
  step, deploy path, or published claim about the platform itself.
- Any epic whose Scope adds, changes, or retires a control.
- Any change to `.husky/pre-commit`, `.github/workflows/**`, or a `validate:*` script.
- Any surface publishing a governance statistic (see CLAUDE.md §Technical diagram red-pen gate).

**Not fired** by: feature work, content, CSS, or copy that relies only on controls already
carrying a register row. Reusing a covered control is not a new control.

---

## The five questions

Each question maps to one of the unfilled roles from the post-mortem. The role is the
packaging; the question is the payload. Ask them of **every control the plan relies on**, not
of the plan as a whole.

### 1. Liveness — *QA / Test Lead*

> What artifact proves this ran? Name it.

A run ID, a timestamp, a file path, a commit SHA. **"CI is green" is not an artifact** — that
is the exact phrasing that let CI sit red on `main` for 212 consecutive runs while six
releases shipped through it. If the honest answer is "you'd have to go and look", the control
has no liveness proof and the row is incomplete.

### 2. Canary — *QA / Test Lead*

> What deliberately broken input must make this fail?

If you cannot name one, it is not a check. This is the highest-yield question in the set and
the only one already mechanised: name the probe in `scripts/validate-enforcement-liveness.js`
`PROBES`, or state why no probe is practical. **A new gate ships with its probe, in the same
epic.** Adding a gate without a probe is how the probe set silently falls behind the gate set.

Do not build a second probe harness. That file says so itself, and it is right: a pile of
single-purpose checkers is the failure shape this whole exercise documents.

### 3. Bypass — *DevOps / Platform Engineer*

> What path reaches production without crossing this?

Enumerate them. Not "none, probably" — walk the paths: direct push, a second deploy target, a
preview environment, a manual trigger, `--no-verify`, a build that runs from a different
config root. G4 was a deploy path nobody had enumerated, and it took both sites down. This
question is answerable on day one and almost never asked.

### 4. Claim — *Governance / Content Owner*

> Does this publish a statement about ourselves? If so: what measured it, and when?

A published count, tally, or coverage claim carries a **measurement date** and the **command
or file that reproduces it**. A tally that was true when written and never re-measured becomes
a false public claim silently, with no event marking the transition. `/platform/governance`
published "30 checkpoints · 0 gaps" with neither date nor source while the pipeline behind it
had been red for three months. On a platform whose positioning *is* the portfolio, that is
reputational exposure, not a technical one.

### 5. Reader — *Release Manager / Eng Manager*

> Who reads the result, on what cadence, and by what date does this reading go stale?

The one that was missing everywhere. A control with no reader is theatre no matter how well it
is wired. The reader may be a human on a cadence (`/eod`, monthly evidence digest) or a
machine (`ci-failure-alert.yml`) — but it must be *named*, and it must have a **next-read
date**. The date is the only mechanism in this framework that defends against decay, because
it is the only field that becomes false on its own.

---

## The output: a Control Register row

The review does not produce a verdict. It produces rows in
`docs/ai/agentic-caucus/control-register.md`, one per control:

| Field | Meaning | Checked by `validate:controls` |
|---|---|---|
| `ID` | `CTL-NNN`, monotonic, never reused | format, uniqueness |
| `Control` | what it is, named as it is invoked | non-empty |
| `Class` | `enforced-by-code` / `measured` / `convention` / `roadmap` | in the allowed set |
| `Probe` | gate name in `PROBES`, or `none — <reason>` | cross-referenced against the real `PROBES` array |
| `Reader` | who or what reads the result | non-empty |
| `Next read` | `YYYY-MM-DD`, or `continuous` if a machine reads every run | parses; not in the past |
| `Bypass` | known paths that skip it, or `none known` | non-empty |

Class vocabulary is deliberately the same four values the red-pen diagram gate already uses
(CLAUDE.md §Technical diagram red-pen gate). One vocabulary, two surfaces.

**An empty cell is a finding, not a formatting problem.** `none — <reason>` is a legitimate
value everywhere a reason is given; a blank is not.

---

## Enforcement

`pnpm validate:controls` (`scripts/validate-control-register.js`) runs in CI and asserts:

1. Every row is complete and well-formed; `Class` is in the allowed set; IDs are unique.
2. Every `enforced-by-code` row's `Probe` names a gate that genuinely exists in the `PROBES`
   array of `scripts/validate-enforcement-liveness.js` — read from the file, not from a copy.
3. Every `validate:*` script defined in any workspace `package.json` has a register row.
   This is the completeness check: a new gate cannot be added without being registered.
4. No row's `Next read` date is in the past.

Rule 4 is the forcing function. It will go red on a date nobody chose deliberately, which is
the point: it converts silent decay into a build failure with a name on it. Because CI failure
on `main` now opens a rolling `ci-red` issue (`ci-failure-alert.yml`), that failure reaches a
human. **The chain only holds while that workflow holds** — which is itself CTL-013, with a
probe and a reader, because a framework that exempts its own backstop has learned nothing.

The gate is itself probed in `validate-enforcement-liveness.js` (`gate: 'validate:controls'`).
It is a check about checks; exempting it would be absurd.

---

## Running the review

Use the `verification-reviewer` subagent (`.claude/agents/verification-reviewer.md`). It runs
**in a fresh context with no visibility into the session that wrote the plan** — the same
isolation the `design-reviewer` agent uses, and the mechanism that makes the review worth
anything. It knows the project's rules; it does not know its excuses.

Inline persona-switching in the session that authored the plan is not this review. The model
is anchored to its own reasoning and will ratify it. If the review is not a separate
invocation, it has not happened.

The agent is read-only. It proposes rows and findings; the main session decides and writes.

**Findings are graded:**

- **Blocker** — a control with no probe *and* no reader; a published claim with no measurement
  date; a bypass path that reaches production unchecked.
- **Gap** — an incomplete row, or a control whose class overstates it (`enforced-by-code` for
  something only a convention holds up).
- **Note** — coverage that is real but thinner than it looks. Record, don't block.

---

## What this framework does not do

Stated plainly, so nobody reads more into it than is there:

- **It does not catch decay by itself.** It writes down expiry dates; `validate:controls`
  catches them. The review is upstream of the defence, not the defence.
- **It does not replace the probe harness.** Question 2 outputs a probe *into*
  `validate-enforcement-liveness.js`. It never builds a parallel one.
- **It does not cover controls it was never told about.** Completeness is enforced only for
  `validate:*` scripts, which the checker can enumerate. Non-script controls — deploy paths,
  published claims, human cadences — enter the register only because a human or this review
  put them there. That residual gap is real, and it is the one to watch.

The honest scope: of the six gaps in the post-mortem, a plan-time review of this shape would
have caught **G4, G8/G9, and G11** outright, and **G1/G5 and G2/G3** only via the expiry-date
mechanism rather than the review itself. **G10** (unpushed releases) it would not have caught
at all — that is a workflow gap, owned by `/eod`.

Three of six caught at plan time, two deferred to a dated backstop, one out of scope. That is
worth building. It is not a guarantee, and a framework that claimed to be one would be the
first thing this review should flag.
