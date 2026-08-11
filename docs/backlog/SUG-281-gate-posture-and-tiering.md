---
**Epic:** SUG-281 — Gate posture and tiering
**Linear Issue:** [SUG-281](https://linear.app/sugartown/issue/SUG-281/gate-posture-and-tiering-aop-1) — **repurposed 2026-08-10 from a test issue, not newly filed.** The workspace is at its issue limit and deletion holds the slot for a month, so reusing a dead ID is cheaper than creating one. Tracked as `AOP-1` in the PRD; the AOP prefix survives only where the PRD's own tranche numbering is being cited.
**Source PRD:** `docs/briefs/agent-operability-prd.md` v1.0 §7 — covers **W4** and **W2**
**Status:** **Phases 1 and 2 both complete 2026-08-11.** Not yet closed out: the close-out
sequence (CHANGELOG line, mini-release, incident-log entry, Linear → Done) is outstanding.
Phase 1 detail — **Phase 1 complete 2026-08-11.** Non-gated half shipped 2026-08-10 (`499bb33f`, CI `31399091551` green); gated half (register re-arm rows, `/eod` reader, validator freeze) plus the warn-gate annotation channel the second review forced. **Phase 2 (W2 tiering) outstanding.** One Phase 1 item is deliberately open: the PR experiment settling `steps.<id>.outcome` semantics under `continue-on-error` — approved, not yet run, needs a push
**Priority:** 🔴 Now — PRD §7 names W4 first of the recommended three
**Merge strategy:** (a) Merge-as-you-go — Phase 1 (W4) merges before Phase 2 (W2) begins
**Depends on:** B4 and B5, both resolved (PRD §10, Appendix A)
**Blocks:** AOP-2 (the close-out runner needs the tier model to know what to stop for)
---

# SUG-281 — Gate posture and tiering

Both halves answer one question: **when may a gate interrupt you, and when may it block a
commit?** W4 sets posture (block vs warn), W2 sets tiering (which gates cost a click). They
touch the same surfaces and share one acceptance test, so splitting them means reclassifying
the same 16 gate sections twice.

## Context

From PRD §3, the findings this tranche closes:

- **C5** — gates are untiered: a rebase costs the same ceremony as a production migration (measured, 24 vs 19)
- **C7** — validators doubled 8→16 and CI steps grew 17→30 in two weeks; **every recent red run is a new gate, none a defect**
- **C10** — gate placement does not match the push model: `validate:doc-budget` is CI-only and cannot fail before a deploy

## Objective

CI red means something is broken, not that a document grew. Human gates fire on
irreversible, outward-facing, or content-writing actions, and nowhere else.

## Divergence from PRD §7, recorded deliberately

PRD §7 recommends shipping **W4 + W1** together, on the grounds that both are size **S** and
independent. This tranche instead pairs **W4 + W2**.

Reason: W4 and W1 are only related by *size*. W4 and W2 are related by *subject* — both
rewrite when a gate fires, both edit `human-gate-conventions.md` and the CLAUDE.md gate
sections, and both are proven by the same test. W1 moves to AOP-2, where it belongs with the
rest of the epic execution loop. Grouping by size optimises one session; grouping by subject
avoids touching 16 gate sections in two separate passes.

## Activation decisions (2026-08-09, Bex)

| # | Question | Decision |
|---|---|---|
| A1 | Where does `validate:doc-budget` run, and at what cap | **Pre-commit, cap 26,000.** Satisfies B1's *raise* branch (not *suspend*), closes C10 — it can now fail before a deploy — and ~6,000 words of headroom means it will not fire on every commit |
| A2 | Which gates convert to warn-only under B4 | **`validate:epic-docs` and `validate:doc-budget`.** Both still run; neither blocks. **`validate:enforcement-liveness` stays blocking** — it is the gate that proves other gates fire, so softening it would weaken the whole liveness chain |
| A3 | Consecutive green CI runs on `main` before new validators are allowed | **5.** Currently at 2 |
| A4 | Verification review | **Run it**, per this doc's Technical constraints |

### A5 — what reads a warning (2026-08-09, Bex). Resolves the review's central blocker

A blocking gate reads itself: it stops you. A warning is read by nothing unless something looks,
and today nothing does — `/eod` keys on the run's `conclusion` (`eod-prompt.md:137-147`) and
`ci-failure-alert.yml:31` fires only on `failure`. A run carrying warnings concludes `success`,
so both would report green.

**Decision: block locally where possible, warn in CI, and teach `/eod` to read warning
annotations on green runs as the backstop.**

| Gate | Pre-commit | CI | Reader |
|---|---|---|---|
| `validate:doc-budget` | **blocks** | warns | the committer, in their own terminal, at the moment they cause it; `/eod` as backstop |
| `validate:epic-docs` | cannot run — exits 0 as `SKIPPED` with no `LINEAR_API_KEY` | warns | **`/eod` only.** No local reader exists for it |

This supersedes A1's "pre-commit" as a *move*: **doc-budget runs in pre-commit *in addition to*
CI**, never instead of it (review B-3). Removing the CI step would delete the only reader that
survives `--no-verify`, merge commits, an uninstalled hook, and `[skip ci]`.

**Accepted cost, stated plainly:** this makes `validate:epic-docs` genuinely weaker than it is
today — it will block nowhere. That is defensible because it caused two of the three recent red
builds and has never caught a code defect, but it is a real reduction, not a free one, and the
re-arm date is what makes it temporary.

### A6 — where the re-arm date lives. Resolves review B-5

The review found the register has no posture field and no re-arm field, so a re-arm date written
as prose in `Bypass` is checked by nothing.

**Decision: the re-arm date goes in `Next read`**, which is the one column
`validate-control-register.js:275-286` already machine-validates and fails the build on when it
passes. No schema change, no new field, and the existing gate becomes the enforcement.

**A1 and A2 combine deliberately:** `doc-budget` moves to pre-commit *and* warns in CI. It
becomes visible early and stops reddening `main`, with a dated re-arm restoring blocking later.
The cap raise is not a softening — it is what makes an early check meaningful rather than
constant noise.

### A7 — the warn ceiling. Supersedes the first draft of A7 and resolves review B-5 (2026-08-11, Bex)

**The finding that forced this.** A5's backstop — "`/eod` reads warning annotations on green runs" —
was measured on 2026-08-11 and **had no artifact to read**:

| Check | Result |
|---|---|
| Does `validate:doc-budget` emit `::warning::`? | No, on any path |
| Does `validate:epic-docs`? | Only at `:92`, the SKIPPED path — never on failure |
| Is the annotation channel clean enough to read? | No — a green run carries 7 unrelated entries (Node 20 deprecation ×3, ESLint ×3, Playwright notice) |
| Does a green run record its failed warn-step? | **Unverified here** — no `success` job containing a `failure` step exists in 40 CI runs or 40 `stats.yml` runs |

So `499bb33f` converted both gates to warn and left them with **no CI-side reader at all** — B-1's
second row arriving in practice: healthy conclusion, control checking nothing.

**The first draft of A7** said: the re-arm *date* is the guaranteed trigger, the streak only an early
one. The review killed it (B-5). `validate-control-register.js:283-286`'s overdue message says
*"Read it, record what you found, and set the next date"* — so the cheapest legal response is to move
the date, and warn becomes permanent on a schedule. A7 relocated the failure rather than resolving it.

**Decision: a declared warn ceiling, machine-enforced.** Each softened gate's Control cell carries
`Re-arm: remove continue-on-error from ci.yml step "<name>" (warn since <date>, max <N>d)`, and
`validate-control-register.js` gains check 5: `Next read` may not exceed `since + N days`. Moving the
date past the ceiling is no longer a legal move. The honest claim, stated as such in the register:
this does not make deferral impossible — it makes deferral require a visible backdating edit instead
of a plausible-looking date change.

Check 5 also fails when the named ci.yml step no longer carries `continue-on-error` (the gate was
re-armed and the clause was left behind) and when the named step does not exist (a rename silently
orphaning its deadline). All three proven by running them, 2026-08-11 — see Evidence below.

## Verification review (2026-08-11) — 5 blockers, all resolved before implementation

Run as a subagent in a fresh context against the annotation-channel design, because A5/A6 predate it.

| # | Blocker | Resolution |
|---|---|---|
| B1 | CTL-024/025 `Reader` cells named `ci-failure-alert.yml`, which fires only on `conclusion == 'failure'` and so cannot read a warn-only gate. **False on `main` from `499bb33f` onward**; `validate:controls` passed it because it only checks cells are non-empty | Both cells corrected to name `/eod` step 6 (CTL-042), each stating why the old reader was unreachable |
| B2 | The `/eod` reader is a prompt — no exit code, no probe, no artifact | Its *wiring* is now enforced: CTL-041's check fails if `eod-prompt.md` stops mentioning the shared title. The residual gap — nobody detects a skipped `/eod` day — is recorded in CTL-042's Bypass rather than smoothed over |
| B3 | Reading only green runs is blind whenever CI is red | `/eod` reads **every** concluded run. (Review said 21/40 runs red; over the last 20 it is 4 — the 40-run figure is dominated by the pre-fix era. The conclusion stands, the framing was corrected) |
| B4 | `WARN-GATE` would exist in two files with nothing syncing them; a mistyped step `id` makes `if:` evaluate false silently | Both closed by CTL-041's check: the title is declared once in `validate-validators.js` and asserted in both `ci.yml` and `eod-prompt.md`; every `continue-on-error` step must carry an `id` and a follow-on step keying on that exact id |
| B5 | The re-arm date can be satisfied by moving the date | A7 above |

**Two of the review's own recommendations were improved on.** It proposed CTL-041 as `convention`
with `none — the harness cannot evaluate a GitHub Actions if: expression`. The pairing check is a Node
script reading YAML text, so it **is** probeable: it ships `enforced-by-code` with probe
`validate:validators (warn-gate pairing)` and record `PRB-025`. It also proposed `measured` for
CTL-024; `convention` is the register's own honest label and is what landed.

## Evidence gathered at activation (2026-08-09)

**C7's premise verified, not assumed.** The last three red CI runs on `main`, by failed step:

| Run | Failed step(s) |
|---|---|
| `31258189587` | *Prove every gate fires*, *Validate doc budget* |
| `31168947110` | *Validate epic docs* |
| `30930818744` | *Validate epic docs* |

**Three red builds, zero code defects.** Every one was bookkeeping. Reproduce:
`gh run list --branch main --workflow CI --limit 12 --json databaseId,conclusion`

**Two corrections to this doc's own figures, both measured today:**

| Claim | This doc said | Measured | Command |
|---|---|---|---|
| CLAUDE.md gate sections | 24 | **16** by the counter's own regex; 19 by a looser match. The 24 is the total across CLAUDE.md **plus** the `docs/conventions/` files | `grep -cE '^#{2,4} .*(hard stop\|blocking)' CLAUDE.md` |
| Headroom | — | **204 words, 2 stops** against caps of 20,150 and 26 | `pnpm validate:doc-budget` |

The 24 came from Appendix A and was written into this doc without being re-run. Phase 2 is
smaller than originally scoped.

### Defect found while measuring — `validate:doc-budget` undercounts stops

Its stop-counter (`scripts/validate-doc-budget.js:105`) matches `hard stop` and `blocking` but
**not `hard-stop`**, so it silently misses `### Phase 0 hard-stop (visual spec gate)` — one of the
most consequential gates in the file — plus five other headings (`Browser testing pre-flight`,
`Design handoff evaluation gate`, `React hooks — Outlet context pre-flight`, `Gate 3 — Framework-agnostic
constraint`, `Dark mode surface work — pre-flight`).

**The cap meant to limit "places a session must stop and decide" is measured against an
undercount.** Fixing the regex will raise the measured stop count, so the stop cap must be
re-derived in the same commit or the fix immediately turns the gate red. Added to Scope below.

## Verification review (2026-08-09) — **7 blockers, does not clear the gate**

Run as a subagent in a fresh context. Read-only. No implementation code was written.

### The central blocker: "warn-only" has no chosen implementation, and both options break something

| Where warn is implemented | What breaks |
|---|---|
| **In-script** (a `--warn` default, script exits 0) | The liveness probe's violating run now exits 0, so the gate reports `STAYED GREEN`, and `validate:enforcement-liveness` returns 1 on any inert gate (`validate-enforcement-liveness.js:1275-1287`). Decision A2 keeps liveness **blocking**, so the change is **red on landing** |
| **In-wiring** (`continue-on-error` / `\|\| true`) | The run concludes `success`, so `ci-failure-alert.yml:31` never opens a `ci-red` issue and `/eod` (`eod-prompt.md:137-147`) reports green. The only artifact is a log line nobody opens — **the 212-run shape: healthy conclusion, control checking nothing** |

**Decide the location in this doc before any code.** It is not an implementation detail.

### Other blockers

| # | Finding | Evidence |
|---|---|---|
| B-2 | **`validate:epic-docs` would block nowhere at all.** It exits 0 as `SKIPPED` without `LINEAR_API_KEY`, so it never blocks locally and its probe returns `live: null` there. CI is its only teeth. Warn it in CI and it blocks nowhere and is read nowhere | `validate-epic-docs.js:89-93`, probe `:977-991` |
| B-3 | **Scope item 1 says "move to pre-commit".** If the `ci.yml` step is removed, the only machine reader disappears: `--no-verify`, merge commits (no pre-commit hook at all), an uninstalled-hook machine, `[skip ci]`, and Netlify publishing regardless. Must read **pre-commit *in addition to* CI** | `.husky/pre-commit`, `ci.yml:87-88`, CTL-020 |
| B-4 | **The stop cap has no probe, and Phase 2 rewrites its input.** The doc-budget probe pads *words* only. `countDecisionPoints` matches the literal strings `hard stop` / `blocking` — if tier tags replace those words, the count silently collapses toward 0 while the gate reports enormous headroom | `validate-doc-budget.js:85, 104-108`; probe `:526-538` |
| B-5 | **The re-arm counter has no artifact.** The register's columns are fixed — `ID, Control, Class, Probe, Reader, Next read, Bypass` — with **no posture field and no re-arm field**. A re-arm date written as prose in `Bypass` is checked by nothing; only `Next read` is machine-validated. This doc's own Risks section says: if the counter is not built, convert nothing | `validate-control-register.js:60, 275-286` |
| B-6 | **AC #1 and the Scope-to-phase table still say 24** while §Evidence says 16. The acceptance test "every one of the 24 gate sections carries exactly one tier" can never pass against a corpus of 17, and would be quietly reinterpreted at close-out | this doc |
| B-7 | **The 3-tier model does not cover all 16 sections.** 13 map cleanly. Outside both tier lists entirely: the **"Visual QA approved" gate** (close-out step 3), **Chromatic approval** (step 4), and `### Sanity MCP content writes` (`CLAUDE.md:459`). The first two are Tier-1-shaped human sign-offs. **This is the same shape as SUG-268's cadence enum covering 11 of 32 rows** | Appendix A vs the measured heading list |

### Three claims of mine the review corrected

| Claim | I said | Measured |
|---|---|---|
| Consequence of the regex fix | "an unchanged cap turns the gate red on landing" | **False.** Stops go 24 → **25**, cap 26. Headroom 1. Re-deriving the cap is still right, but not for the reason I gave |
| Headings the fix recovers | "six" | **One.** Only `CLAUDE.md:220` contains `hard-stop`. The other five carry **no keyword at all** and stay missed before and after |
| Validators in the tier model | 16 (from Appendix A) | **18** |

### Also flagged

- **Class after conversion.** CTL-024 and CTL-025 are `enforced-by-code`. A gate that runs and cannot fail a build is not enforced by code — `measured` is the honest class while warn-only, reverting on re-arm.
- **"Reset on any red run" is undefined against bookkeeping reds** — and a scheduled one already exists: five rows go overdue **2026-08-29**, exiting 1 with no defect present. Under "any red", that resets the counter and the re-arm recedes. The "temporary becomes permanent" mechanism, arriving on a known date.
- **Tier 1 contains items with no owning file** — "Production data mutation — ad hoc" has no CLAUDE.md section, no skill line, no register row.
- **Register-row IDs must start at CTL-040.** SUG-268 has reserved CTL-036 to CTL-039 in text; CTL-026/032/033 are also reserved. Proposed rows CTL-040 to CTL-044 are held in the review output for the implementing branch.

## Evidence from implementation (2026-08-11) — measured by running it

Every claim below was produced by running the command, not by reading the config (AC #2).

**Check 5 (the warn ceiling) fails on all three broken inputs:**

| Injected violation | Result |
|---|---|
| `Next read` moved to 2026-12-01, past the 2026-10-09 ceiling | exit 1 — *"is beyond the declared warn ceiling of 2026-10-09 (warn since 2026-08-10, max 60d)"* |
| `continue-on-error` removed from ci.yml while the `Re-arm:` clause remained | exit 1 — *"RE-ARMED. … Remove the Re-arm clause and restore the row's real Class, Reader and `Next read`"* |
| `Re-arm:` naming a ci.yml step that does not exist | exit 1 — *"Renaming a step silently orphans its re-arm deadline"* |

**The new pairing probe caught a defect in its own gate, first run.** `validate:validators
(warn-gate pairing)` reported **STAYED GREEN against a known violation** — inert. Cause: the check
tested `includes('WARN-GATE')`, and the probe's drifted title `WARN-GATE-DRIFTED` *contains* that
substring, so a renamed channel passed as correctly paired. This is the same substring-collision
class `validate-control-register.js:188-200` documents for gate names, reproduced independently in
a new gate written by a session that had read that comment the same day.

Fixed by matching the full delimited token `::warning title=WARN-GATE::` rather than a bare
substring. Re-run after the fix: the drift is caught on both steps, and the gate reports 0 pairing
problems against the real file. **The harness earned its place here** — nothing else in the chain
would have noticed, and the check would have shipped reporting green over a channel it could not see.

**The warn channel proven end-to-end — PR #34, run `31490233162` (2026-08-11).** A throwaway
branch lowered `CAP_WORDS` 26,000 → 1,000 so the warn-only step failed deterministically, touching
no instruction content. Three questions, all previously unexecuted in this repo:

| Question | Answer |
|---|---|
| Does `if: steps.<id>.outcome == 'failure'` fire the annotation when the step it names was swallowed by `continue-on-error`? | **Yes.** `[warning] title="WARN-GATE" :: validate:doc-budget FAILED (warn-only until re-arm, CTL-025)` |
| Does GitHub emit its own annotation for a swallowed step? | **Yes**, at `failure` level — but with an **empty title** (`Process completed with exit code 1.`), and it does not name the step |
| Does REST `steps[].conclusion` stay `failure` inside a `success` job? | **No.** The `ci` job's failed-step list came back **empty** while doc-budget had genuinely failed |

The third answer is the one that matters. **A `/eod` reader built on step conclusions would have
returned nothing, forever, and reported it as green** — the precise failure this tranche exists to
end, reproduced in the tranche's own fix had the design gone the obvious way. It was rejected on
suspicion (no historical instance existed to check against) and is now rejected on evidence.

The second answer justifies the filter design: because GitHub's own failure annotation carries no
title, `/eod` filters on `annotation_level == "failure"` and uses `WARN-GATE` only to *name* the
gate. A dropped title degrades to "a warn gate fired, name unknown", never to silence.

The `ci` job concluded `success` with a red gate inside it, confirming `continue-on-error` behaves
as A5 assumed. The run's overall `failure` conclusion came from two other jobs, both expected
collateral of the sabotage: *Enforcement liveness* failed because a doc-budget gate that is red on a
clean tree makes its own probe PROBE INVALID (CTL-015's documented behaviour), and Chromatic exited
105.

**Harness after the fix, `pnpm validate:enforcement-liveness`:** **24 gates proven live, 0 inert,
1 skipped** (`chromatic.sh reachability` — it tests the ABSENT case and `apps/storybook/.env` is
present), exit 0. The new pairing gate is among the 24.

**Warn-gate pairing state, `pnpm validate:validators`:** 2 warn-only gate steps, 1 allowlisted
non-gate (`stats.yml` Lighthouse), 0 pairing problems. A third `continue-on-error` step was found
during implementation that the first draft of the parser silently missed — `stats.yml:53` carries a
trailing comment after `true`, which an end-anchored regex did not match. Same undercount shape as
`validate-doc-budget.js`'s `hard-stop` stop regex, fixed in the same pass rather than shipped.

## Phase 2 Step 0 — B-4 closed (2026-08-11)

`validate-doc-budget.js` carried an explicit precondition in its own header: *"do not run
Phase 2 before it is closed."* The stop cap had been unprobed since it was added 2026-08-05 —
the gate's liveness probe pads **words** only, so nothing proved the stop counter could fail a
build.

Closed by `validate:doc-budget (stop cap)` (record `PRB-026`): it injects a derived number of
gate headings into a referenced conventions file that carries 0 stops today, and asserts the
gate reports `Over the decision budget by N stop(s)` rather than merely exiting non-zero —
exit 1 alone would equally be produced by blowing the word cap, which would prove the wrong
half. Proven live 2026-08-11: *"rejected the surface on stops alone (+4 stop(s), words
untouched)"*.

**B-4's premise refined while closing it.** The blocker feared the tier rewrite would "collapse
the count toward zero while the gate reports headroom". The count is *expected* to fall — Tier
2's whole point is that those gates stop being hard stops, so they correctly stop counting as
stops. The real risk is the fall happening **silently**, with nobody re-deriving the cap. The
protocol is now recorded in the script: any change to the tier vocabulary re-derives both the
cap and the matcher in the same commit, measured by running it.

## Scope

**W4 — gate placement and posture**

- [x] **Done 499bb33f.** `validate:doc-budget` runs at pre-commit (blocking) **and** in CI (warn) — per A5 it is added, not moved, or make it advisory — decide which, and record why (C10: CI-only cannot fail before a deploy)
- [x] **Done 2026-08-11.** Wiring landed `499bb33f`; register re-arm notes landed with the annotation channel. Both gates carry a `Re-arm:` clause naming the ci.yml step, the date warn began, and a 60-day ceiling. CTL-024 dropped `enforced-by-code` → `convention` (it blocks nowhere); CTL-025 stays `enforced-by-code` (it blocks at pre-commit)
- [x] **Done 2026-08-11.** Re-arm counter wired into `/eod` Phase 3 step 6 (CTL-042), plus the warn-gate annotation read it depends on. The streak is **derived** from `gh run list`, never stored — so there is no counter to reset and no second copy to drift, and "reset on any red run" is inherent rather than a maintained operation
- [x] **Done 499bb33f.** Raise the `validate:doc-budget` cap to **26,000 and keep it enforcing**, rather than suspending it — PRD §B1's explicit caveat: suspending removes the only measurement of the instruction surface during exactly the period V1 restructures it
- [x] **Done 2026-08-11.** Validator freeze recorded as **CTL-040**, N = 5, with the exact `gh run list` command and the definition of "consecutive" (leading `success` entries; an in-flight `null` is neither green nor skippable; runs, not commits). Streak measured 2026-08-11 after this phase's own pushes: **4** of 5

**W2 — gate severity tiers**

- [x] **Done 499bb33f** (24→25 stops, cap re-derived to 28). Fix `validate-doc-budget.js:105`'s stop regex to match `hard-stop` as well as `hard stop`, and **re-derive the stop cap in the same commit** — the fix raises the measured count, so an unchanged cap turns the gate red on landing — layer: tooling
- [x] **Done 2026-08-11.** `human-gate-conventions.md` rewritten around the 3-tier model: tiers as the governing layer, response mechanisms scoped to Tier 1 (Tier 2 needs none), a Tier 1 register, and a Known gaps section. The five mechanism names are preserved verbatim — CLAUDE.md and `/red-pen` reference them by name
- [x] **Done 2026-08-11.** Tier 1 tagged explicitly in CLAUDE.md (6 headings + close-out steps 3 and 4); **Tier 2 is the default**, stated once in the header block. Not a per-section tag — see the count finding below
- [x] **Done 2026-08-11.** Coverage is total by construction rather than by enumeration, so the `docs/conventions/` half needs no separate pass: anything not in the Tier 1 register is Tier 2 unless it names a validator
- [x] **Done 2026-08-11.** Appendix A's **Tier 1 = 8** did not survive contact: it ships as **10**. Visual QA approval and Chromatic approval were Tier-1-shaped human sign-offs absent from the list (review blocker B-7). PRD §7 and Appendix A corrected in the same commit

### The count finding that reshaped this phase

Every figure in circulation was wrong, and re-deriving them changed the approach:

| Source | Claimed CLAUDE.md gate sections |
|---|---|
| PRD §7 W2 row | 15 |
| PRD Appendix A | 24 (actually CLAUDE.md + the conventions corpus, not CLAUDE.md alone) |
| This doc, §Evidence 2026-08-09 | 16 |
| AC #1 | 16, "17 with the hard-stop fix" |
| **Measured 2026-08-11** | 62 headings; **17** keyword-carrying, **~49** that gate an action |

`validate-doc-budget.js`'s own comment names 5 keyword-less gate headings it misses. That
list is itself incomplete — B-7 separately cites `### Sanity MCP content writes` (`:459`),
which appears in neither set. **The keyword was never a reliable boundary**, so a phase
scoped as "reclassify the 16" would have tiered a set defined by an accident of wording.

Tagging all ~49 was rejected: a very large diff against the highest-traffic instruction file
(this doc's own Risks section names that risk), and every future rule would need remembering
to tag or fall outside the model. **Tier 2 as the default** gives the same coverage in ~10
edits, and makes B-7 structurally impossible — a rule added next year is Tier 2 automatically
rather than silently untiered.

### Budget effect, re-derived by running the gate

| Metric | Before | After |
|---|---|---|
| Stops counted | 25 | **13** |
| `CAP_DECISIONS` | 28 | **15** (13 + ~15%) |
| Words | 19,946 | 20,543 |
| `CAP_WORDS` | 26,000 | 26,000 (headroom 5,457) |

The matcher counts the `(Tier 1 —` tag rather than `hard stop` / `blocking`. **Nothing was
removed from the surface** — the same rules apply and the words went *up*. This is exactly
the fall B-4 warned could happen silently, happening deliberately, measured, with the cap
re-derived in the same commit. The dashed form is required because the defining doc has a
heading reading `Response mechanisms (Tier 1 only)`, which a looser match counted as a gate.

## Scope-to-phase mapping

Nine Scope items, above the 5-item sizing gate (`docs/conventions/user-story-conventions.md`).

| Phase | Scope items | Ships when |
|---|---|---|
| **Phase 1 — W4 posture** | items 1–5 | Bookkeeping gates warn, doc-budget enforces at 26,000 from its new position, re-arm counter live in `/eod` |
| **Phase 2 — W2 tiering** | items 6–8 | Every measured gate section carries a tier; `human-gate-conventions.md` rewritten |

## Non-Goals

- Adding any new validator. PRD §6 forbids it until C7 is resolved, and C7 *is* this tranche.
- Removing any gate. Tiering changes what a gate costs, not whether it exists.
- Touching the epic execution loop — that is AOP-2.

## Technical constraints

- **Verification review is blocking.** This tranche changes gate and validator behaviour, so the `verification-reviewer` subagent runs before implementation and every changed control gets a `docs/ai/agentic-caucus/control-register.md` row. Enforced by `pnpm validate:controls`.
- **Instruction & Rule File Write Gate applies throughout.** CLAUDE.md, `docs/conventions/**` and `.claude/skills/**` are all in scope here. Every edit goes via a scratchpad copy, diffed and approved before it lands.
- A gate converted to warn must still **run**. Warn means non-blocking, never skipped — a gate that stops executing is indistinguishable from a deleted one (INC-007, INC-010, INC-011).

## Files to modify

- `docs/conventions/human-gate-conventions.md` — rewritten
- `CLAUDE.md` — 16 gate sections tagged with tiers (measured 2026-08-09; re-derive at execution)
- `docs/ai/agentic-caucus/control-register.md` — re-arm notes, posture rows
- `scripts/validate-doc-budget.js` and its CI/pre-commit wiring
- `.claude/skills/eod/` — re-arm counter check
- `docs/briefs/agent-operability-prd.md` §7 — correct the 15 vs 24 gate count

## Acceptance criteria

- [x] **Every gate section carries exactly one tier — by construction, not enumeration.** The
      original wording ("16 … 17 with the hard-stop fix") was itself a copied figure and wrong:
      measured 2026-08-11, CLAUDE.md has 62 headings, 17 keyword-carrying and ~49 that gate an
      action. Tier 1 is tagged explicitly (10 gates); everything else is Tier 2 by default, so
      no section can be untiered
- [x] **`pnpm validate:enforcement-liveness`: 25 gates proven live, 0 inert, exit 0** (2026-08-11).
      Includes both doc-budget halves — the stop cap was unprobed until this phase
- [x] `validate:doc-budget` blocks at `.husky/pre-commit`, so it fails before a deploy (Phase 1)
- [x] Both warn-converted gates carry a dated re-arm and a named reader (CTL-024, CTL-025), and
      the deadline is machine-capped at `since + 60d` by `validate-control-register.js` check 5
- [x] `pnpm validate:controls` passes (2026-08-11)
- [x] PRD §7's W2 row and Appendix A corrected in the same commit as the implementation. Appendix
      A's Tier 1 = 8 became **10**; its "24 gate sections" and "16 validators" were both wrong and
      are marked superseded rather than silently overwritten

## Risks

- **Reclassifying 24 sections is a large diff against the highest-traffic instruction file.** Mitigate by phasing: posture first, tiering second, each merged before the next.
- **"Warn" becoming permanent** is the failure this tranche could introduce. The dated re-arm plus the reset-on-red counter is the countermeasure; if it is not built, do not convert anything to warn.

## Post-Epic Close-Out

- [ ] Friction line: what cost a correction commit (`none` is valid)
- [ ] Incident log: this tranche fixes already-shipped behaviour (C7's red runs), so an entry is expected — state "no incident" only if genuinely none
