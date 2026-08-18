---
**Epic:** ST-100 — Move epic close-out to epic finish, keep push and spend at EOD
**Issue:** [#100](https://github.com/bex-sugartown/sugartown/issues/100)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one release at the end
---

# ST-100 — Move epic close-out to epic finish, keep push and spend at EOD

An epic that finishes at 11am should be finished at 11am. Today it cannot be: close-out step 1b
needs a CI conclusion and §Issue Done = code on main needs `origin/main`, so the issue stays
`In Progress` until the evening push.

Split the sequence by what costs credits rather than by what happens last.

> **Everything from §Addendum onward is exploration and measurement.** The sections above it are
> what an executing session needs. Read the addendum to understand *why*; read the top to *do it*.

---

## Objective

Three rhythms, each doing one job, and only one of them spends:

| Rhythm | Runs | Produces | Costs |
|---|---|---|---|
| **Epic** | hours | `Done`, a CHANGELOG line in `[Unreleased]`, doc moved to `docs/shipped/` | nothing |
| **Ship** | when invoked — observed 1–14 days | code live, `Done` → `Shipped`, CI verified | 1 deploy |
| **Release** | the same command with `--release` | version bump, CHANGELOG cut, release notes | nothing new |

Ship and Release are one command with a flag — **the decision below**, and the cadence is not a design variable.

Touches process and instruction files only. No schema, no GROQ, no `apps/web` render code, no
content.

---

## The decision — one command, a release flag, and a cadence nobody controls

> **Correction, 2026-08-16.** An earlier pass said `/mini-release`'s "only unique product is a
> PATCH version bump". **That is wrong.** It was read from `/release`'s §Version Conventions,
> which describes the *tier*, not from the mini-release prompt's actual steps. `/mini-release`
> covers **four** close-out steps — 4, 6, 7 and 8 — and is the closest thing to a close-out
> command that exists. See §A10. The recommendation below is therefore **restore and rename**,
> not retire.

### There is no close-out command, and there was supposed to be

The close-out sequence is twelve steps. **Two have commands.** The other ten are prose in
CLAUDE.md that a session is expected to read and hand-execute — full table in §A10.

**`/mini-release` was originally meant to be the close-out** (Bex, 2026-08-16: "it was to close
out and ship the epic"). It still carries four of the twelve steps, so it did not fail so much as
erode: the rest of the sequence migrated into CLAUDE.md prose and never came back, leaving a
command that looks like a version-bumper and a checklist nobody can run reliably by hand.

That erosion is visible in the CLAUDE.md section itself, which has accumulated caveats like *"run
`git diff --cached --stat` to confirm the file actually carries the content change"* and *"verify
handoffs landed — SUG-230 deferred three items and none reached Scope."* Those are scars from a
checklist executed from memory.

**So this epic is not inventing a command. It is re-consolidating one that already existed.** The
"retire `/mini-release`" language in earlier passes is wrong; the correct verb is **restore**, and
the naming question is separate.

### The correction that reframes everything

**None of these commands are automatic.** Every one is a human-invoked ritual, and the real
observed interval is **1 day to 2 weeks** — days get skipped, attention wanders, a command that
"runs daily" runs when someone remembers it. Stated by Bex 2026-08-16.

An earlier pass of this section compared the options on cadence and gave Options 2 and 3 "≤ 1
day". **That was fiction.** It described the design's intent, not the system's behaviour, and it
made two of the four arguments against Option 1 collapse the moment the assumption was named:

| Argument against Option 1 | Status after the correction |
|---|---|
| CI feedback latency triples | **Void.** Every option's latency is 1–14 days. They are identical |
| Disk safety becomes a habit | **Void.** It was always a habit. Option 2's "daily push" is a habit that fails the same way |
| Blocking dependency on the bump rule (G13) | **Survives** — the only real differentiator |
| Weakens the empty-`Done`-column signal | **Applies to all three.** Now a shared problem, not a comparison point |

**Comparing these options on cadence is therefore meaningless.** They inherit the same human
variance. The axis that actually separates designs is: *what happens on the days you do not run
it, and what does not depend on you remembering.*

### What that implies

1. **Fewer commands is better on memory grounds, not elegance grounds.** Three commands are three
   things to forget. This strengthens the collapse instinct rather than weakening it.
2. **Anything safety-critical must not be a command at all.** Disk safety belongs in a
   `post-commit` hook that mirror-pushes to a `wip/` branch — free, since `allowed_branches` is
   `['main']` (§A2), and invisible, so it cannot be forgotten. That takes disk safety off the
   cadence question entirely.
3. **Every step must be interval-agnostic.** No "today's work" semantics anywhere. The command
   operates on *everything currently `Done`*, whether that is one epic or fourteen days of them.
   G7 is promoted from a Low gap to a core design constraint.
4. **Detection belongs at the start of a session, not the end.** `/morning` already reports
   unpushed commits and it is the more reliable touchpoint — sessions get started more reliably
   than they get closed. The nag moves there.

### Honest comparison

Cadence columns removed, because they are the same for all three and are not a design property.

| | **1 — one command** | **2 — two commands** | **3 — one command + flag** |
|---|---|---|---|
| Things to remember to run | **1** | 2 | **1** |
| Prompt-parity defect class | gone | gone | gone |
| Real interval | 1–14 days | 1–14 days | 1–14 days |
| Ships code and cuts a version | always together | separately | **separately, one command** |
| Version minted per invocation | every time ⚠️ | only on `/release` | **only with the flag** |
| Needs the G13 bump rule | **yes, blocking** ⚠️ | no | no |
| Works unchanged after a 2-week gap | yes, if interval-agnostic | yes | yes |
| Disk safety | hook, not the command | hook, not the command | hook, not the command |

### Recommendation, revised

**One command with a release flag.** Which is Option 3, but arrived at from your position rather
than against it — the collapse is right, and the flag exists only to stop every invocation
minting a version.

```
/ship            everything Done → pushed, deployed, CI verified, Shipped
/ship --release  the same, then version bump · CHANGELOG cut · release notes
```

Name to be decided — `/ship` was your placeholder and I have kept it as one. The naming question
is real: it should not be `/eod`, because the honest cadence is not daily and a name that says
"end of day" lies about when it runs.

**Why not pure Option 1 (version every time):** G13. Without a content-derived bump rule, every
invocation mints a version, and at a 1–14 day interval that is anywhere from 2 to 30 versions a
month with no way to tell which mattered. The flag is a one-word substitute for an entire epic.
If the sizing epic (§A6) ships later, the flag can become a default with an override — but it
does not have to exist first.

**Open for tomorrow:** whether the flag should be inverted (`--no-release`, versioning by
default), which is worth arguing if the honest interval turns out to be closer to 2 weeks than 2
days. That is answerable from data once S9b measures actual run frequency.

---

## Pre-Execution Completeness Gate

Run 2026-08-18. This epic touches process and instruction files only — no component, schema, page,
CSS surface, or rendered output — so most items resolve N/A by construction rather than by
exemption.

- [x] **Interaction surface audit** — N/A. No interactive element created.
- [x] **Use case coverage** — N/A. No component or web adapter.
- [x] **Layout contract** — N/A. No layout.
- [x] **All prop value enumerations** — N/A. No props.
- [x] **Correct audit file paths** — every file named in this doc verified to resolve:
      `docs/workflows/release-assistant-prompt.md`, `docs/mini-release-prompt.md`,
      `docs/workflows/eod-prompt.md`, `apps/web/scripts/stats/linear.js`, `.claude/skills/switch`.
- [x] **Dark / theme modifier treatment** — N/A. Nothing rendered.
- [x] **Studio schema changes scoped** — N/A. Explicitly a Non-Goal; no `apps/studio/schemas/` change.
- [x] **Web adapter sync scoped** — N/A. No DS component touched.
- [x] **Composition overlap audit** — N/A. No sub-object added to a schema.
- [x] **Atomic Reuse Gate** — S16 consolidates existing steps rather than adding a mechanism, and
      S13's hook has one caller by design. The one genuine reuse question, whether `/ship --release`
      duplicates `/release`, is resolved by delegation in §Non-Goals.
- [x] **Token value cross-check** — N/A. No token used.
- [x] **Enforcement liveness — declared is not effective** — applies, and is a Phase 4 obligation,
      not a Phase 1 claim. Two rules this epic relies on are proven rather than asserted: the
      `Item closed` → `Status: Done` automation was **observed firing** on #98 (2026-08-17) and
      again on #99 (2026-08-18), closing ST-99 run 1's F5. `allowed_branches: ['main']` was read
      back from the live config, not from `netlify.toml` (§A2). The acceptance criteria requiring a
      red CI to leave items in `Done`, and a mirror to appear with no command invoked, are both
      deliberate-violation proofs rather than inspections.
- [x] **App.jsx routing pre-flight** — N/A. No page set in scope.
- [x] **Component-Reuse Manifest** — N/A. No page, section or visual surface added.
- [x] **Scope ↔ Non-Goals consistency** — run 2026-08-18. One conflict found and resolved; see the
      statement at the head of §Scope.
- [x] **Spike component selection** — N/A. No proof-of-concept phase. Phase 4's end-to-end run is a
      proof of the whole boundary, not a spike on a representative case.
- [x] **Component registry update** — N/A. No component created, retired or restructured.
- [x] **Technical diagram red-pen gate** — §A4's diagram is ASCII inside this doc and is not
      published to any reader-facing surface. If it moves to one, the gate fires then.
- [x] **Kill criterion** — present, with a check date and an invocation-count floor. See §Kill criterion.
- [x] **Removal scope enumerates surfaces, not sections** — S9 retires `docs/mini-release-prompt.md`
      and S16 absorbs the close-out. Surfaces reached: `CLAUDE.md`, `docs/mini-release-prompt.md`,
      `docs/workflows/eod-prompt.md`, `docs/epic-template.md`, `.claude/skills/` (`switch`,
      `chromatic`, `eod`, `mini-release`), and `docs/workflows/morning-housekeeping-prompt.md` for
      S4 and S14's nag move. Enumerated at authoring time per post-mortem 6.5.
- [x] **One index, or one ID scheme** — N/A. No new IDs. `Shipped` joins the existing board
      single-select; `S`/`G` numbering is local to this doc and not a register.

---

## Scope

**20 rows, 17 open and 3 closed**, measured 2026-08-18 by counting `- [ ]`/`- [x]` rows
in this section. Earlier passes said "fourteen" here and "seventeen" in §Phases; both were wrong and
neither was reproducible. Above the sizing gate, so the scope-to-phase mapping is §Phases.

**Scope ↔ Non-Goals consistency check run twice on 2026-08-18**, the second time because Scope was
amended and CLAUDE.md requires a re-read in the same edit. Two conflicts found, both resolved:

1. S9 and S16 produce release outputs `/release` already writes, against the Non-Goal protecting
   that flow. Resolved by delegation rather than reimplementation.
2. **S18 edits `/release`, and the Non-Goal said it was "not touched".** Found by the re-read that
   adding S18 triggered. Resolved by narrowing the Non-Goal to protect the gate structure, outputs
   and `[Unreleased]` promotion, rather than the file.

Both are recorded in §Non-Goals.

**`Scope ∖ Phases` is empty as of 2026-08-18.** S4, S13 and S14 named no phase until then; S13
now opens the epic as Phase 0b, S14 sits in Phases 3 and 3b, S4 in Phase 4.

- [ ] **S1 — Split step 1b.** `pnpm test:smoke` locally gates the epic; the CI conclusion moves to
      the ship command, which already watches the run to a conclusion — layer: process
- [ ] **S2 — Redefine Done.** Rewrite §Issue Done = code on main so `Done` means "work complete,
      committed locally", with the `origin/main` guarantee re-homed to `Shipped` — layer: process
- [ ] **S3 — Consolidate Chromatic to one place.** Currently three: close-out step 4 (Tier 1),
      `/mini-release` §0A, `/eod` Phase 3 step 2 — layer: process
- [ ] **S4 — REOPENED 2026-08-16.** The Done/Shipped split closed this on the assumption that
      `Done` empties every morning. At a 1–14 day interval it does not, so a filling `Done` column
      stops being a signal and becomes the normal state. Needs a real one: age of the oldest
      `Done` item, surfaced by `/morning` — layer: process/tooling
- [x] ~~**S5 — Reopen path.**~~ Still closed — a red CI leaves items in `Done` regardless of
      interval. §A3
- [ ] **S6 — Reconcile the two disagreeing push rules** (§Mid-epic commit checkpoints threshold vs
      close-out's CI need), stating which governs, in both places — layer: process
- [ ] **S7 — Record the `[skip ci]` trap** where a session writing a commit message meets it, and
      adopt `skip-ci` as the safe spelling — layer: process
- [ ] **S8 — Disposition all of SUG-265.** Part B absorbed. Part A dissolves once `/mini-release`
      retires, but only after its two unique steps land in the successor (G11). Close
      [#90](https://github.com/bex-sugartown/sugartown/issues/90) after S9, not before — layer: process
- [x] ~~**S9a — Resolve G12.**~~ Done 2026-08-16 — §A2. Two follow-ups folded into S9: correct
      `SUG-265:64`, and decide `skip_prs`
- [x] ~~**S9b — Measure credits per build**~~ Done 2026-08-18. **A production deploy costs 15
      credits against a 1,000-credit monthly allowance (Personal, $9/mo)**, both from Netlify's
      credit-pricing docs and the billing UI's own breakdown. That is a ceiling of ~66 deploys per
      month, **≈2.1/day, shared across both sites on the account**. Observed this period: 30 billed
      deploys = 450 credits, which is **96% of the 468.9 credits consumed**. Deploys are the bill.
      **Not metered, per the same docs: failed deploys, deploy previews, branch deploys.**
      Billable = `context: production` **and** `state: ready`; `listSiteDeploys` gives 26 for
      `sugartown` and 7 for `stdpinkmoon` (33 vs 30 billed, the gap being period boundary and the
      UI's stated reporting lag). **Build minutes are not the unit** — `getAccountBuildStatus`
      returns `included_minutes: null` because this plan meters credits, not minutes; an earlier
      pass of this line reported 1.2 min/deploy and concluded the cost was small, which was the
      wrong unit and the wrong conclusion (G14)
- [ ] **S9 — Decide the release model** (Opt 1 / 2 / 3), then retire `docs/mini-release-prompt.md`
      and migrate its two unique steps (G11). If Option 1, the G13 bump rule is a blocking
      prerequisite — layer: process
- [ ] **S10 — Add the `Shipped` status** to the board via the UI, snapshot taken first (G1) — layer: tooling
- [ ] **S11 — Write the Done → Shipped step**, including the close-then-set ordering G2 requires — layer: process/tooling
- [ ] **S12 — Split the stats collector's `shipped` bucket** so the published roadmap stops
      reporting Done as shipped, or record why not (G4) — layer: tooling
- [ ] **S13 — Move disk safety out of the command.** A `post-commit` hook mirror-pushing to
      `wip/<date>`, free per §A2, so safety stops depending on memory (G15) — layer: tooling
- [ ] **S15 — Resolve the move-vs-delete drift.** CLAUDE.md step 6 says move `backlog/` →
      `shipped/`; `/mini-release` §3A says delete from backlog. Establish which is real against a
      shipped epic before consolidating (§A10) — layer: process
- [ ] **S16 — Consolidate the ten command-less close-out steps into the ship command.** The
      larger half of this epic. Steps 1, 1b, 2, 3, 5, 5b, 6b, 9 have no command at all; 4, 6, 7, 8
      are split across `/mini-release` and `/chromatic`. Conditional steps stay conditional and
      record N/A with a reason rather than being skipped silently (§A10) — layer: process
- [ ] **S17 — Decide what the command is called.** `/ship` is a placeholder. It must not be
      `/eod`, because the observed cadence is 1–14 days and a name saying "end of day" lies about
      when it runs. `/mini-release` is available once its scope is restored — layer: process
- [ ] **S18 — Re-anchor `/release`'s baseline before S9 retires the commit it keys on.** STEP 0's
      verification pass finds the last release by looking for "the most recent
      `chore(release): mini-release` commit following the last `docs: release vX.Y.0` commit".
      S9 stops those first commits ever being written again (189 exist; they end at retirement).
      Anchor on `docs: release vX.Y.Z` directly — `git log --grep='^docs: release v' -1` — which is
      one step instead of two and is the commit actually wanted. **Ordering: S18 lands before S9
      retires anything**, or the verification pass degrades silently in the gap. Same defect shape
      as `/mini-release` STEP 0B, which scoped a patch across 30+ released commits during ST-98's
      close-out (G17) — layer: process
- [ ] **S14 — Make every step interval-agnostic.** No "today's work" semantics; operate on
      everything currently `Done`. Move the unpushed-work nag into `/morning` (G7, G16) — layer: process

---

## Phases

**Phase 0 — Facts. Complete 2026-08-18.** S9a resolved the branch-push cost (§A2); S9b measured
the deploy cost at 15 credits against a 1,000/month allowance, ≈66 deploys/month shared across two
sites. The cadence choice is now arithmetic rather than instinct, and the arithmetic says deploys
are 96% of the bill — so batching them is the right instinct and the working policy is 1/day.

**Phase 0b — Disk safety, and it goes first.** S13. A `post-commit` hook mirror-pushing to
`wip/<date>`, free per §A2. Placed ahead of everything because it is independent of every other
item, costs nothing, and closes the SUG-231 exposure immediately rather than at the end of the
epic. Ships: a commit made and its mirror observed on the remote with no command invoked.

**Phase 1 — Decide.** S1, S2, S3, S6, S8, S9. Ships: a decisions table in this doc, approved,
each decision naming the file it lands in.

**Phase 2 — Board mechanics.** S10, S11. The blockers; nothing downstream works until the board
can express `Shipped` and something moves items into it. Ships: a working transition, demonstrated
on one item.

**Phase 3 — Apply the rules.** Every Phase 1 decision as one batch under the Instruction & Rule
File Write Gate, with an ST-99 v1 walkthrough on the diff. Also S7, S15, S17, S18, and S14's rule
half: strip "today's work" semantics from every step that carries it. **S18 lands before S9's
retirement takes effect**, not merely in the same phase. Ships: the edits, committed.

**Phase 3b — Consolidate the close-out.** S16, and S14 as a stated design constraint on the
command: it operates on everything currently `Done`, never on "today's". G7 is a Blocker on the
command's design, so it is named here rather than left to Phase 3's text edits. The ten
command-less steps move into the ship command. Separated from Phase 3 because it is the largest
single piece of work in the epic and because it is testable on its own — run it against one real
epic and see whether anything in the twelve is still being done by hand. Ships: a command that runs
the whole sequence.

**Phase 4 — Prove it and true up the numbers.** One real day end to end under the new boundary.
Also S12, and S4: `/morning` reports the age of the oldest `Done` item, paired with S14's nag move
because both change the same surface. Ships: a recorded run, an honest roadmap figure, and the
Done-age readout shown rising across a gap and resetting after a run.

**17 open items across 7 phases**, every one of them named in a phase. The epic grew
when §A10 showed the close-out has no implementation; splitting it is worth considering at
activation if Phase 3b looks too large to land in one pass.

---

## Phase 1 decisions — approved 2026-08-18

Each decision names the file it lands in. Phase 3 applies them as one batch under the
Instruction & Rule File Write Gate.

| # | Decision | Why | Lands in |
|---|---|---|---|
| **S1** | **Split step 1b.** `pnpm test:smoke` passing locally gates the epic reaching `Done`; the CI-conclusion half moves to the ship command | Not new work. `/eod` Phase 3 **step 5 already does it** — `gh run list --branch main --workflow CI`, watched to a conclusion, added 2026-07-28 after 212 consecutive red runs went unread. S1 re-homes an existing step rather than building one | `CLAUDE.md` close-out step 1b, split in two; the ship command inherits `/eod` Phase 3 step 5 verbatim |
| **S2** | **`Done` = work complete, committed locally, local smoke green.** The `origin/main` guarantee re-homes to `Shipped` | Removes the boundary that made #98 and #99 close with their close-out commits on one disk, without losing the guarantee: it moves to the state that actually means live | `CLAUDE.md` §Issue Done = code on main, **renamed** — see the rename note below |
| **S3** | **Chromatic lives in one place: the ship command** | Three copies confirmed 2026-08-18: `CLAUDE.md:46` (close-out step 4), `docs/mini-release-prompt.md:48` (§0A), `docs/workflows/eod-prompt.md:103` (Phase 3 step 2). §0A dies with S9's retirement, `/eod` step 2 becomes the command's, and CLAUDE.md step 4 becomes a pointer rather than a third instruction | `CLAUDE.md` step 4, `docs/workflows/eod-prompt.md`, `docs/mini-release-prompt.md` (deleted by S9) |
| **S6** | **Replace the two push rules rather than reconcile them.** Disk safety is the hook's job — continuous, automatic, free. Pushing to `main` is the ship command's job — deliberate, 15 credits | **Changed by Phase 0b shipping first.** `CLAUDE.md:107` offers "create a `wip/<epic>` branch and push that" as a manual escape hatch; S13's hook now does exactly that after every commit, so the ~15-commit threshold is moot for the purpose it was written for. The rules stop disagreeing because they stop covering the same thing | `CLAUDE.md` §Mid-epic commit checkpoints |
| **S8** | **Close [#90](https://github.com/bex-sugartown/sugartown/issues/90) after S9 and S18 land**, not before | Content fully absorbed: Part B into this epic's one-deploy-per-ship design; Part A into S9's retirement, S18's baseline fix and G11's step migration. ST-98's close-out found a second Part A instance on 2026-08-17, so the residue is real rather than hypothetical | `#90` closing comment; §Related |
| **S9** | **Option 3 — one command with a `--release` flag, and `--release` invokes `/release`** rather than reimplementing it. Retiring `docs/mini-release-prompt.md` is gated on G11 and S18 | The flag exists to stop every invocation minting a version, not to save credits — deploy cost is 15 credits either way and is paid by the ship, not the flag. G13's bump rule stays out of scope because Option 1 did not win | `docs/mini-release-prompt.md` (deleted), the ship command, `CLAUDE.md` step 7 |

**The S2 rename needs its grep, and it is the second rename of that heading.** ST-98 already
renamed it once, from §Linear Done = code on main, and orphaned inbound pointers doing it. The
followability walkthrough's grep rule (CLAUDE.md §Rule-file followability walkthrough) runs in the
same commit as the rename, in Phase 3.

**S17 stays open.** S9 fixes the command's shape, not its name. `/ship` is still a placeholder and
`/eod` is ruled out, because the observed cadence is 1–14 days and a name saying "end of day" lies
about when it runs.

---

## Acceptance criteria

- [ ] An epic finishing at any point reaches `Done`, its CHANGELOG line written and its doc moved,
      with zero network calls and zero credits spent
- [ ] Exactly one command pushes, deploys, or runs Chromatic, and it mints a version only with
      `--release`
- [ ] **`--release` releases everything since the last release, not just the item being shipped.**
      It promotes the entire `[Unreleased]` buffer into one versioned entry, covering every epic
      accumulated since the last `docs: release vX.Y.Z`. **Proven by cutting a release after two or
      more epics have accumulated** and confirming every one of their lines appears in the entry —
      not by reading the delegation and assuming it holds
- [ ] `/release`'s verification pass still finds the correct baseline after `/mini-release` is
      retired, demonstrated on a repo state with no new `chore(release): mini-release` commit (G17)
- [ ] **Interval-agnostic, proven:** the command is run once after a gap of a week or more and
      correctly ships every `Done` item accumulated in it, not just the most recent (G7)
- [ ] **Disk safety needs no ritual:** commits reach a remote without anyone invoking anything,
      demonstrated by making a commit and observing the mirror without running a command (G15)
- [ ] `/morning` reports the age of the oldest `Done` item, and it is shown rising across a gap
      and resetting after a run (S4, G16)
- [ ] Step 1b's CI half is verifiably still enforced, just later: name the step that fails the run
      if CI concludes `failure`
- [ ] Every rule that currently says "origin/main" or "merged" as a `Done` precondition is
      rewritten or has a written reason it stays
- [ ] The board distinguishes `Done` from `Shipped`, and one item is observed making the
      transition on a real run
- [ ] A red CI run is shown leaving `Done` items in `Done`, with nothing reopened by hand
- [ ] `/platform/governance` no longer reports `Done` work as shipped, or it is recorded why not
- [ ] **One command runs the whole close-out.** All twelve steps are invoked by it, conditional
      ones recording N/A with a reason. No step remains as prose a session must remember (§A10)
- [ ] The move-vs-delete drift in step 6 is resolved and the surviving behaviour is the one a
      shipped epic actually needs (S15)
- [ ] `docs/mini-release-prompt.md` is restored to its original scope or replaced by a named
      successor, with none of its four current steps lost in the move
- [ ] SUG-265 has a recorded disposition and [#90](https://github.com/bex-sugartown/sugartown/issues/90) reflects it
- [ ] ST-99 v1 walkthrough run on the Phase 3 diff, findings in the commit

---

## Non-Goals

- **Changing what triggers a Netlify deploy.** A push to `main` deploys; the epic works within
  that, it does not remove it.
- **Branch protection on `main`.** Deliberately absent (SUG-255). Unchanged.
- **The size-derived bump rule.** Its own epic — §A6. Only a prerequisite if Option 1 wins.
- **Reducing deploys below one per ship.** One is the target, not zero.
- **Rewriting the release flow.** `/release`'s gate structure, outputs and `[Unreleased]` promotion
  are not rewritten. **Narrowed 2026-08-18** from "not touched": S18 edits one line of its STEP 0
  baseline derivation, which is not a rewrite but is a change, and this Non-Goal said "not touched"
  until S18 was added. Measured 2026-08-18:
  `grep -cE '^### ✅ GATE [0-9]+ — STOP' docs/workflows/release-assistant-prompt.md` returns **5**,
  not the 7 an earlier pass of this section claimed. **`/ship --release` invokes `/release`; it does
  not reimplement it.** Decided 2026-08-18, because §A4's diagram draws the same outputs `/release`
  Gate 4 already writes (`RELEASE_NOTES.md`, the `docs/release-notes/` archive copy, both
  `package.json` bumps), and reimplementing them is what this Non-Goal forbids.

---

## Kill criterion

**If, after 30 days, no epic has reached `Done` before its push — or items routinely land in
`Shipped` having never paused in `Done` — revert to the current sequence and delete the split.**
Either pattern means the extra state costs more than the friction it removed. Check date: 30 days
after Phase 3 merges.

**Measured against invocations, not days.** At a 1–14 day interval, 30 days might contain two runs
or twenty, and a criterion phrased in days would be judged on a sample of two. Require **at least
five invocations** before the check is meaningful; if 30 days pass with fewer, extend to the fifth
run and record why.

---

## Model & Mode [REQUIRED]

**`/model opus` with plan mode for Phase 1**, then `/model sonnet` for Phases 2–4. Phase 1 is
interacting rule decisions where a wrong call creates a failure mode rather than a bug. The rest
is text edits against an approved table.

---

## Technical notes

- **Content Write Gate:** does not fire. No Sanity writes.
- **Instruction & Rule File Write Gate:** fires on every Phase 3 edit. Diffs from scratchpad
  copies, approved before any write.
- **ST-99 v1 walkthrough** runs on the Phase 3 diff. Its dominant finding across three runs is a
  renamed heading orphaning inbound cross-references, and this epic renames §Issue Done = code on
  main. Grep for inbound pointers before committing.
- **Activation audit:** read `docs/workflows/eod-prompt.md` Phase 3 in full before editing. Steps
  2 and 5 already do Chromatic and CI verification; S1 and S3 extend them rather than adding new
  ones.
- **Upstream dependencies:** none blocking. ST-98 shipped the rules this epic is measured against.

---

## Related

- **GitHub:** [#100](https://github.com/bex-sugartown/sugartown/issues/100)
- **Absorbs:** all of SUG-265 — [#90](https://github.com/bex-sugartown/sugartown/issues/90)
- **QA:** ST-99 — [#99](https://github.com/bex-sugartown/sugartown/issues/99)
- **Sibling:** ST-98 — [#98](https://github.com/bex-sugartown/sugartown/issues/98), whose close-out
  was the trigger
- **Epic template:** `docs/epic-template.md`

---
---

# Addendum — exploration and measurement

Everything below is the reasoning and data behind the decision above. None of it is needed to
execute; all of it is needed to re-open the decision later.

## A1 — Measured data

Release ceremony counts, 2026-08-16:

| Figure | Value | Command |
|---|---|---|
| `chore(release): mini-release` commits | **187** | `git log --grep="chore(release): mini-release" \| wc -l` |
| other `chore(release)` commits | **1** | same, inverted |
| MINOR versions in CHANGELOG | **33** | `grep -cE "^## \[0\.[0-9]+\.0\]" CHANGELOG.md` |
| MINOR cadence | 3–16 days | `grep -nE "^## \[0\.[0-9]+\.0\]" CHANGELOG.md` |
| Patches per minor | ~6 (v0.30 had 10, v0.29 had 6) | same |

**`/mini-release`'s only unique product is a PATCH number.** From
`docs/workflows/release-assistant-prompt.md` §Version Conventions: *"PATCH: per-epic mini-releases
only — one epic, version bump + backlog cleanup, no CHANGELOG entry, no release notes."* It never
writes the CHANGELOG. `[Unreleased]` is maintained separately and `/release` promotes it, so the
two-tier accumulation model already exists — the patch bump is the only thing bolted on top, and
it is the part nobody reads.

**The two-deploy incident, 2026-07-30** (SUG-265 Part B): `main@02599e2` at 05:27 was pushed
*solely* to obtain CI run `30542636194`. It touched nothing under `apps/web/src`, verified by
`git diff --name-only 795e6c00..02599e2c`, so Netlify redeployed byte-identical output. A second
deploy followed at `/eod` carrying the real change.

## A2 — G12 resolved: Netlify config, measured 2026-08-16

Read from the live config, not the UI and not `netlify.toml` (which has no live directives):

```bash
netlify api getSite --data '{"site_id":"d5317131-48d0-4958-b1fa-693fb40f06f4"}'
```

| Setting | Value | Means |
|---|---|---|
| `build_settings.allowed_branches` | `['main']` | **Only `main` builds.** Any other branch push produces no build, no deploy, no credits |
| `build_settings.repo_branch` | `main` | production branch |
| `build_settings.stop_builds` | `false` | builds are on |
| `build_settings.skip_prs` | `None` | **not** disabled, so PR deploy previews are on by default |
| `build_settings.untrusted_flow` | `review` | untrusted PRs need review; a one-member team's own PRs are trusted and would build |
| `plan` | `nf_team_dev` | **internal slug, not a plan name** — see the correction below |
| `deploy_retention_in_days` | `90` | |

> **Correction, 2026-08-16.** An earlier pass read `plan: nf_team_dev` as "free tier". That was
> inferred from a slug, not measured from billing, and it is wrong. The account is on **Personal,
> $9/month, 1,000 credits/month**, effective 2026-07-21. §Verify before citing, failing on a field
> that looked self-explanatory.

Consequences:

1. `CLAUDE.md:105` is correct and `SUG-265:64`'s "Unknown" is answered after 17 days. Branch
   pushes are free, so `git push origin main:wip/<date>` costs nothing and Option 1's disk-safety
   story holds.
2. **Corrected 2026-08-18 — the PR route for CI *is* free.** An earlier pass of this line said it
   was not, reasoning that `skip_prs` being unset means the PR builds a preview and therefore
   costs. It does build a preview, and **deploy previews are not metered by credits**, per
   Netlify's credit-pricing docs, which list deploy previews, branch deploys and failed deploys as
   non-metered. So SUG-265's `wip/<epic>` → PR → CI route costs **zero credits** and always did.
   `skip_prs` is a noise decision, not a cost one. **This reopens a design option this epic had
   closed off:** a CI conclusion can be obtained without spending a production deploy, which bears
   directly on S1 and on how `Done` → `Shipped` gets verified.
3. **No branch has ever been pushed here.** `git ls-remote --heads origin` returns only
   `refs/heads/main`, which is why the question went unanswered: no history to read it from, and
   nobody read the config.

**Measured 2026-08-18 (G14 closed): 15 credits per production deploy, 1,000 credits/month on
Personal.** Both from Netlify's credit-pricing docs and the billing breakdown. 30 billed deploys
this period = 450 credits = 96% of the 468.9 consumed. Ceiling ≈66 deploys/month ≈2.1/day.

**The account runs two sites and they share one allowance** — `sugartown` and `stdpinkmoon`
(`netlify api listSites`). This doc reasons elsewhere as though `sugartown` is the only consumer;
it is not. `stdpinkmoon` took 7 billable deploys this period.

**Build minutes are not the metering unit.** `getAccountBuildStatus` returns
`included_minutes: null` for exactly that reason. Anything reasoning in minutes on this plan is
measuring something the biller does not charge for.

`https://app.netlify.com/teams/bex-sugartown/usage`

## A3 — The day as the sprint, and why Done ≠ Shipped

A sprint accumulates work items, signs each off, ships the batch at the end. A solo practitioner
does not want to wait two weeks to launch, so the sprint compresses to a day.

| | Means | Set when | Set by | Terminal? |
|---|---|---|---|---|
| **Done** | Work complete, reviewed, signed off. Not live. | Epic finishes | The session | No |
| **Shipped** | On `origin/main`, deployed, CI green. Users have it. | The ship command | The ship command | Yes |

**This closed two scope items. One of them has since reopened.**

S5 (a reopen path) stays closed: a red CI means nothing moves `Done` → `Shipped`, whatever the
interval. No un-Done, no ceremony.

> **S4 reopened 2026-08-16.** The argument was that the `Done` column *is* the signal, because an
> empty one each morning proves the ship ran. **That assumed a daily cadence, and the observed
> cadence is 1–14 days.** A column that fills for two weeks is not a signal, it is the normal
> state, and "there is stuff in Done" carries no information. The replacement is not another
> column: it is the **age of the oldest `Done` item**, surfaced by `/morning`. One number,
> unambiguous, and it grows the longer you leave it. S4, G16.

**The trade this makes.** Today's rule is strict because it prevents calling something Done that
is stranded where nobody can see it (SUG-231: 48 commits, one disk, two days). Relaxing the
precondition *alone* would move that risk rather than remove it. The split is what makes the
relaxation honest: unpushed work gets its own visible state instead of hiding inside a terminal
one. Phase 2 is therefore not optional sequencing — without `Shipped` on the board, this epic
reintroduces SUG-231's failure with the warning light removed.

## A4 — Workflow

```
   DURING THE DAY  ·  no network, no spend
   ─────────────────────────────────────────────────────────────────────

     epic 1        ┌──────────┐   ┌─────────────┐   ┌──────────┐
     ───────────▶  │ In Prog. │──▶│ smoke tests │──▶│   DONE   │──┐
                   └──────────┘   │   (local)   │   └──────────┘  │
                                  └─────────────┘                 │
     epic 2        ┌──────────┐   ┌─────────────┐   ┌──────────┐  │
     ───────────▶  │ In Prog. │──▶│ smoke tests │──▶│   DONE   │──┤
                   └──────────┘   │   (local)   │   └──────────┘  │
                                  └─────────────┘                 │
     epic 3        ┌──────────┐                                   │
     ───────────▶  │ In Prog. │──────────── (unfinished) ─────────┼──▶ next run
                   └──────────┘                                   │
                                                                  │
     automatic, no ritual:  post-commit hook → wip/<date>         │
       free (allowed_branches: ['main']), so disk safety          │
       never depends on remembering to run anything (S13)         │
                                                                  │
     per epic, at DONE:                                           │
       · CHANGELOG line        → [Unreleased] buffer              │
       · docs/backlog → shipped/                                  │
       · commit                                                   │
       (no version bump — /mini-release retired)                  │
                                                                  ▼
   ══════════════════════════════════════════════════ /ship ══════════
   WHEN INVOKED (observed 1–14 days)  ·  the only step that spends
   ─────────────────────────────────────────────────────────────────────
                                                                  │
        ┌─────────────────────────────────────────────────────────┘
        ▼
    ┌──────────┐  ┌──────┐  ┌─────────┐  ┌────┐  ┌───────────┐
    │Chromatic │─▶│ push │─▶│ Netlify │─▶│ CI │─▶│  SHIPPED  │
    │ (Tier 1) │  │  ×1  │  │ deploy  │  │run │  │ epics 1,2 │
    └──────────┘  └──────┘  └─────────┘  └────┘  └───────────┘
                                            │          │
                                   CI red   │          │  code is LIVE.
                                            ▼          │  no version yet.
                            epics stay DONE, ship      │
                            next run (no un-Done)      │
                                                       │
   ═════════════════════════════════ /ship --release ══╪═══════════════
   SAME COMMAND, WITH THE FLAG  ·  no extra push, no extra spend
   ─────────────────────────────────────────────────────────────────────
                                                       ▼
                          ┌─────────────┐   ┌────────────────────────┐
                          │   version   │──▶│ [Unreleased] → [0.34.0]│
                          │     bump    │   │ every epic's line, cut │
                          └─────────────┘   │ into one release entry │
                                            └────────────────────────┘
                                                       │
                                                       ▼
                                            release notes · header cap
```

**Drawn as the recommendation:** one command, the lower block reached only with `--release`. Under
pure Option 1 the two lower blocks merge and every invocation mints a version. Under Option 2 they
are two separate commands.

**Nothing waits for a release to go live.** Code ships whenever the command runs; only the version
number and the written notes accumulate beyond that. Launching and versioning were welded together, and separating them is
what removes the wait without batching the deploy.

## A5 — Gaps

| # | Gap | Detail | Severity |
|---|---|---|---|
| G1 | **No `Shipped` column** | Adding one edits a single-select. Adding `On Hold` via the UI on 2026-08-16 wiped nothing (66 items intact, option IDs stable), but that is one observation and the API path is documented to wipe every value. Snapshot first: `gh project item-list 1 --owner bex-sugartown --limit 200 --format json > snapshot.json` | **Blocker** |
| G2 | **Closing an issue sets `Done`, not `Shipped`** | The `Item closed` workflow sets `Status: Done`. The ship command must close *then* set `Shipped`, in that order, or automation overwrites it. GitHub's built-ins cannot express "on push, Done → Shipped" | **Blocker** |
| G3 | **Nothing moves Done → Shipped** | No automation exists. A scripted step: enumerate `Status: Done`, and after CI concludes `success`, close each and set `Shipped` | **Blocker** |
| G4 | **`/platform/governance` already calls Done "shipped"** | `apps/web/scripts/stats/linear.js:5,128` buckets `completed` into a bucket named `shipped`, feeding the published roadmap. The site already reports Done as shipped, and Done can precede code being live. First chance to make the figure true. Ties to ST-96 | **High** |
| G15 | **Disk safety depends on memory, and memory is the thing that fails** | No command runs automatically. A `post-commit` hook mirror-pushing to `wip/<date>` is free (`allowed_branches: ['main']`, §A2) and invisible, which takes safety off the cadence question entirely. Without it, every option's exposure is 1–14 days. S13 | **High** |
| G16 | **The nag is at the wrong end of the session** | Unpushed-work detection currently lives at close (`/eod`). Sessions get *started* more reliably than they get *closed*, and `/morning` already reports unpushed commits — that is the touchpoint that actually fires. Move the nag, and add the age of the oldest `Done` item. S4, S14 | **High** |
| G14 | ~~Credits per build unmeasured~~ | **Resolved 2026-08-18 — 15 credits per production deploy, 1,000/month** (S9b). Deploys are **96% of all credit consumption**, ceiling ~66/month ≈ 2.1/day across both account sites, which is why the working policy is **1 deploy/day**. Batching deploys is therefore cost-justified and this epic's one-deploy-per-ship target is the right shape. Failed deploys, deploy previews and branch deploys are free | ✅ |
| G17 | **Retiring `/mini-release` breaks `/release`'s verification baseline** | STEP 0 derives the last release from the most recent `chore(release): mini-release` commit; S9 stops those being written. The verification pass is what catches entries missing from `[Unreleased]`, and this epic makes `[Unreleased]` the *only* record between releases by removing the per-epic bump — so it is the sole safety net, anchored on a commit that is about to stop existing. S18 | **High** |
| G13 | **Bump level has nothing to key on if the commands collapse** | §Version Conventions ties the level to which command ran. Option 1 removes that. At 1–3 days, minting MINOR each time reaches 1.0 in ~2 months. Needs a content-derived rule — §A6. **Blocking for Option 1 only** | High (Opt 1) |
| G5 | **`docs/shipped/` no longer means shipped** | Close-out step 6 moves the doc at `Done`, but the directory is named for a state not yet reached. Move it at `Shipped`, or write down that the name predates the status | Medium |
| G11 | **The successor inherits `/mini-release`'s unique steps** | The `> Updated` header cap at 8 entries, and the Chromatic pre-check. Both must land before retirement, not be dropped with it | Medium |
| G8 | **Nothing triggers a release** | `/mini-release` fired automatically at close-out. A release needs a trigger: shipped-epic count, elapsed days, or a human call. Option 3's `--release` flag makes it a human call by design | Medium |
| G9 | **Footer version goes stale between releases** | `__APP_VERSION__` shows the last *released* version rather than moving every epic. More honest than today, where it shows a patch nobody released, but visible | Low |
| G10 | **`stats.releases` counts CHANGELOG headings** | Fewer, larger releases means a slower-growing count. History unaffected; the trend line changes. State it before someone reads it as a slowdown | Low |
| G6 | **The 58 migrated issues used Done = shipped** | Their history means the old thing. Do not retrofit; the new meaning applies forward only | Low |
| G7 | **Interval-agnosticism is a core constraint, not an edge case** | Promoted from Low 2026-08-16. The observed interval is 1–14 days, so "a skipped ship" is the normal case. Every step must operate on *everything currently `Done`*, never "today's work", or missed days silently drop from the batch. S14 | **Blocker** |
| G12 | ~~Branch-push cost unknown~~ | **Resolved 2026-08-16** — §A2 | ✅ |

## A10 — Close-out step coverage, measured 2026-08-16

Which of the twelve close-out steps has a command, and which is prose a session hand-executes.
Read from `CLAUDE.md` §Epic close-out sequence, `docs/mini-release-prompt.md` and
`ls .claude/skills/`.

| Step | What it does | Command today | Owner after this epic |
|---|---|---|---|
| 1 | Commit epic changes | — | ship command |
| 1b | Route smoke tests, local **and** CI | — | split: local at `Done`, CI in ship (S1) |
| 2 | Deploy Sanity schema *(conditional)* | — | ship command |
| 3 | Visual QA gate *(Tier 1)* | — | stays human, prompted by the command |
| 4 | Chromatic *(Tier 1)* | **`/chromatic`**, also `/mini-release` §0A | ship command (S3) |
| 5 | Data pipeline gap check *(conditional)* | — | ship command |
| 5b | Verify handoffs landed | — | ship command |
| 6 | Move doc `backlog/` → `shipped/` | **`/mini-release`** §3A | at `Done`, not at ship (G5) |
| 6b | Preserve the vspec *(conditional)* | — | at `Done` |
| 7 | Mini-release: version bump | **`/mini-release`** | ship command, `--release` only |
| 8 | Transition the issue to Done | **`/mini-release`** §2B, §3B | split: `Done` at finish, `Shipped` at ship |
| 9 | Clean tree | — | ship command |

**Two of twelve have a dedicated command. `/mini-release` quietly covers four** (4, 6, 7, 8),
which is why the earlier "it only bumps a version" claim was wrong.

**Drift found while building this table:** close-out step 6 says *move* the doc from
`docs/backlog/` to `docs/shipped/`. `/mini-release` §3A says **"Delete shipped epic from backlog
directory"**. Move and delete are not the same operation, and if `/mini-release` deletes while
CLAUDE.md expects a move, the shipped doc only survives because someone did it by hand first.
Worth checking against a real shipped epic before the consolidation copies the wrong behaviour.
Added as S15.

## A6 — Future epic: size-derived version bump

Raised 2026-08-16. Not in this epic's scope; recorded here because G13 is the reason it is needed.

**The idea:** derive the bump level from release size. Under a threshold → `PATCH`; over →
`MINOR`; breaking → `MAJOR`.

**The refinement it needs before scoping:** raw size is the wrong signal alone. A one-line change
renaming a URL is breaking; a 2,000-line docs pass is a patch. SemVer is about contract change,
not volume. The contract signals already exist in §Version Conventions, so the workable rule is
**surface first, size as tiebreaker**:

| Signal | Level |
|---|---|
| Schema field removed or renamed, `routes.js` namespace change, DS prop removed | `MAJOR` |
| New schema field, new route, new DS component or prop, new page surface | `MINOR` |
| Everything else — fixes, docs, content, refactors with no contract change | `PATCH` |
| Size | tiebreaker and a flag: an unusually large `PATCH` is worth a human look, never an automatic promotion |

Most of it is derivable from changed paths, which makes it a candidate for a script rather than a
judgement call. That is what would make it an epic worth having. **Scope it after S9** — it is
only a prerequisite if Option 1 wins, and its shape depends on the cadence chosen.

## A7 — Superseded: the three ways to cut the mini-release

Kept because the reasoning against A and B still holds and the next reader will ask.

| | Version bump | CHANGELOG | Consequence |
|---|---|---|---|
| **A. Per epic** | at Done, one per epic | one entry per epic | Mints versions nobody is served; only the last before a release reaches the footer |
| **B. Per ship** | at Shipped, one per day | one aggregated entry | Loses per-epic attribution in the CHANGELOG |
| **C. Split** | at Shipped, one per day | line per epic at Done, into `[Unreleased]` | Uses the buffer as designed |

**Superseded the same day** by §A1: all three assume the bump happens somewhere in the day, and
187 bumps producing 33 releases showed it should not happen daily at all. The surviving half is
C's CHANGELOG behaviour with the bump moved out to the release event.

## A8 — Impact register

Checked against the file named, not inferred.

| # | Impact | Where | Status |
|---|---|---|---|
| I1 | Step 1b's CI requirement blocks close-out | `CLAUDE.md:43` | resolved by S1 |
| I2 | Done requires `origin/main` | `CLAUDE.md` §Issue Done = code on main | resolved by S2 |
| I3 | "Done but unpushed" invisible | created by S2 | **closed** — the Done column is the signal |
| I4 | Done reversible on a red CI | created by S2 | **closed** — a red run leaves items in Done |
| I5 | Chromatic lives in three places | close-out step 4, `/mini-release` §0A, `/eod` Phase 3.2 | S3 |
| I6 | `/switch`: finish an epic, change machines without shipping, other machine has nothing while the board reads Done | `.claude/skills/switch` | Medium, open |
| I7 | Published roadmap already reports Done as shipped | `apps/web/scripts/stats/linear.js:5,128` | **High** — G4 / S12 |
| I8 | `docs/shipped/` holds docs for epics not yet Shipped | close-out step 6 | Medium — G5 |
| I9 | Morning briefing's "didn't run `/eod`" flag shifts meaning from "unfinished" to "unpublished" | `docs/workflows/morning-housekeeping-prompt.md` | Low |
| I11 | A commit body quoting the skip marker suppresses its own CI run | verified 2026-08-02, SUG-265 | Low — S7 |

## A9 — Two findings inherited from SUG-265

- **Two rules disagree and nothing names which wins.** §Mid-epic commit checkpoints sets the push
  threshold at "~15 unpushed commits, or at any session end"; there were 12, mid-session, so it
  said wait. Step 1b said it needed CI to close. S6.
- **A commit can suppress its own CI run.** GitHub scans the whole commit message for the skip
  marker, not just the subject. A SUG-256 commit whose *body quoted* `[skip ci]` produced no CI
  run at all. Writing it `skip-ci` avoids this, and nobody currently knows that. S7.
