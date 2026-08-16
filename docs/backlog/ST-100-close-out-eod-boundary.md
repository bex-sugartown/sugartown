---
**Epic:** ST-100 — Move epic close-out to epic finish, keep push and spend at EOD
**Issue:** [#100](https://github.com/bex-sugartown/sugartown/issues/100)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# ST-100 — Move epic close-out to epic finish, keep push and spend at EOD

Re-cut the close-out / EOD boundary along what costs money rather than what happens last, so an
epic that finishes at 11am is finished at 11am.

## Background

**Close-out cannot complete without a push today.** Two steps require the network:

- **Step 1b** requires `pnpm test:smoke` locally **and** "the CI run for the merged commit
  concludes `success`". CI triggers on `push: branches: [main]` and `pull_request:`, so there is
  no CI run without one or the other.
- **§Issue Done = code on main** requires the work to be on `origin/main` before the issue moves
  to Done.

Pushing `main` triggers a Netlify production deploy regardless of CI, so the cheapest honest
close-out is one that waits for `/eod`. That is what happened on 2026-08-16: #98 finished, was
correct, was committed, and stayed `In Progress` because closing it would have broken the rule.

**This is not a new discovery.** SUG-265 Part B
(`docs/backlog/SUG-265-release-prompt-step-parity.md`, [#90](https://github.com/bex-sugartown/sugartown/issues/90),
filed 2026-07-30) documents the same collision with harder evidence: **two production deploys in
one day**, the first (`main@02599e2`, 05:27) pushed *solely* to obtain CI run `30542636194` and
touching nothing under `apps/web/src` — Netlify redeployed byte-identical output — and a second
at `/eod` carrying the real change.

SUG-265 also records two findings this epic inherits rather than rediscovers:

- **Two rules disagree and nothing names which wins.** §Mid-epic commit checkpoints sets the
  push threshold at "~15 unpushed commits, or at any session end"; there were 12, mid-session,
  so it said wait. Step 1b said it needed CI to close.
- **A commit can suppress its own CI run.** GitHub scans the whole commit message for the skip
  marker, not just the subject. A SUG-256 commit whose *body quoted* `[skip ci]` produced no CI
  run at all. Writing it `skip-ci` avoids this, and nobody currently knows that.

## Objective

The close-out sequence splits at the cost boundary. Mini-release, the issue transition to Done,
and the `docs/backlog/` → `docs/shipped/` move all complete when the epic's work is finished and
committed locally. Push, Netlify deploy, Chromatic and CI verification all belong to `/eod`, and
running `/eod` remains the only action in the day that spends credits.

Touches process and instruction files only: `CLAUDE.md`, `docs/epic-template.md`,
`docs/workflows/eod-prompt.md`, `docs/mini-release-prompt.md`,
`docs/workflows/release-assistant-prompt.md`, and the `/eod` skill. No schema, no GROQ, no
`apps/web` render code, no content.

## Scope

Twelve items, above the sizing gate, so the scope-to-phase mapping is in §Phases. S4 and S5 are struck — the Done/Shipped model closed them.

- [ ] **S1 — Split step 1b.** `pnpm test:smoke` locally gates the epic; the CI conclusion moves
      to `/eod`, which already watches the run to a conclusion (Phase 3 step 5) — layer: process
- [ ] **S2 — Redefine Done.** Rewrite §Issue Done = code on main so Done means "committed to
      local `main`, work complete", with the origin/main guarantee re-homed to `/eod` — layer: process
- [ ] **S3 — Consolidate Chromatic to one place.** It currently sits in three: close-out step 4
      (Tier 1), `/mini-release` §0A (with an existing "Defer to /eod" option), and `/eod` Phase 3
      step 2. Decide which owns the Tier 1 human gate — layer: process
- [x] ~~**S4 — Add a "Done but unpushed" signal.**~~ **Closed by the Done/Shipped split** — the
      Done column *is* the signal. See §The day as the sprint.
- [x] ~~**S5 — Define the reopen path.**~~ **Closed by the Done/Shipped split** — a red CI means
      nothing moves Done → Shipped. No un-Done needed. See §The day as the sprint.
- [ ] **S6 — Reconcile the two disagreeing push rules** (§Mid-epic commit checkpoints threshold
      vs. close-out's CI need), stating which governs, in both places. Inherited from SUG-265 — layer: process
- [ ] **S7 — Record the `[skip ci]` trap** where a session writing a commit message will meet it,
      and adopt `skip-ci` as the safe spelling. Inherited from SUG-265 — layer: process
- [ ] **S8 — Disposition SUG-265 Part B.** This epic absorbs it; Part A (prompt parity) is
      unrelated and stays. Re-scope [#90](https://github.com/bex-sugartown/sugartown/issues/90)
      to Part A only, or close it into this — layer: process

## Phases

**Phase 1 — Decide.** S1, S2, S3, S6, S8, S9. Six interacting decisions; none of the edits are
hard once made. Ships: a decisions table in this doc, approved, each decision naming its file.

**Phase 2 — Board mechanics.** S10 (add `Shipped`, snapshot first) and S11 (the Done → Shipped
step in `/eod`, with G2's ordering). These are the blockers; nothing downstream works until the
board can express the state and something moves items into it. Ships: a working transition,
demonstrated on one item.

**Phase 3 — Apply the rules.** Every Phase 1 decision as one batch under the Instruction & Rule
File Write Gate, with an ST-99 v1 walkthrough on the diff. Also S7. Ships: the edits, committed.

**Phase 4 — Prove it and true up the numbers.** Run one real day end to end under the new
boundary. Also S12, whose right shape is only visible once Done and Shipped have diverged in
practice. Ships: a recorded run, and an honest roadmap figure.

## Acceptance criteria

- [ ] An epic that finishes mid-morning reaches Done, mini-released, and moved to
      `docs/shipped/`, with zero network calls and zero credits spent
- [ ] `/eod` remains the only step in the day that pushes, deploys, or runs Chromatic
- [ ] Step 1b's CI half is verifiably still enforced, just later: name the step in
      `docs/workflows/eod-prompt.md` that fails the day if the run concludes `failure`
- [ ] Every rule that currently says "origin/main" or "merged" as a Done precondition is either
      rewritten or has a written reason it stays
- [ ] The board distinguishes Done from Shipped, and one item is observed making the transition
      at a real `/eod`
- [ ] A red EOD CI run is shown leaving Done items in Done, with nothing reopened by hand
- [ ] `/platform/governance` no longer reports Done work as shipped, or it is recorded why not
- [ ] SUG-265 Part B has a recorded disposition, and [#90](https://github.com/bex-sugartown/sugartown/issues/90)
      reflects it
- [ ] ST-99 v1 walkthrough run on the Phase 3 diff, findings in the commit

## The day as the sprint — Done vs Shipped

Added 2026-08-16 at Bex's direction, and it changes the shape of the epic.

A sprint accumulates work items, reviews and signs off each one, then ships the batch at the
end. A solo practitioner does not want to wait two weeks to launch, so **the sprint is
compressed to a day**: that is what "mini" release means. Each epic is individually finished and
signed off during the day; one push at `/eod` ships everything signed off since the last one.

That gives the two words separate jobs, which resolves the epic's open question 2:

| | Means | Set when | Set by | Terminal? |
|---|---|---|---|---|
| **Done** | Work complete, reviewed, signed off. Not live. | Epic finishes | The session, at close-out | No |
| **Shipped** | On `origin/main`, deployed, CI green. Users have it. | `/eod` push concludes | `/eod` | Yes |

**This dissolves two of the failure modes the epic was created to solve.** I3 ("Done but
unpushed" goes invisible) stops being a gap, because a filling Done column *is* the signal —
work sitting there is precisely work not yet shipped, and an empty Done column each morning is
the proof `/eod` ran. I4 (a red CI leaves Done epics carrying broken code) stops needing a reopen
path, because a red run simply means nothing moves Done → Shipped that night. No ceremony, no
un-Done.

### Workflow

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
     ───────────▶  │ In Prog. │────────────── (unfinished) ───────┼──▶ tomorrow
                   └──────────┘                                   │
                                                                  │
     per epic, at DONE:                                           │
       · CHANGELOG line        → [Unreleased] buffer              │
       · docs/backlog → shipped/                                  │
       · commit                                                   │
       (version bump is NOT here — see S9, option C)              │
                                                                  ▼
   ══════════════════════════════════════════════════════ /eod ═══════
   AT EOD  ·  the only step that spends
   ─────────────────────────────────────────────────────────────────────
                                                                  │
        ┌─────────────────────────────────────────────────────────┘
        │
        ▼
   ┌─────────┐  ┌────────┐  ┌──────┐  ┌────────┐  ┌────┐  ┌───────────┐
   │ version │─▶│Chromatic│─▶│ push │─▶│Netlify │─▶│ CI │─▶│  SHIPPED  │
   │  bump   │  │(Tier 1) │  │  ×1  │  │ deploy │  │run │  │ epics 1,2 │
   │ ×1, day │  └────────┘  └──────┘  └────────┘  └────┘  └───────────┘
   └─────────┘                                       │
   [Unreleased] → [0.33.N]                           │ CI red
   one version, every epic's line                    ▼
                                          epics stay DONE, ship tomorrow
                                          (no reopen, no un-Done)
```

Read the diagram as option **C**. Under **A** the version bump moves up into the per-epic block
and the day mints one version per epic; under **B** the per-epic CHANGELOG line disappears and
only the aggregated entry survives. S9 picks.

### What this does to the mini-release

The version bump and the CHANGELOG line are already treated as separable — close-out step 7 says
so: *"The CHANGELOG line and the version bump are separate obligations."* The `[Unreleased]`
buffer already exists in `CHANGELOG.md` and is currently empty. So the mechanism is half-built.

Three ways to cut it, and the epic has to pick one:

| | Version bump | CHANGELOG | Consequence |
|---|---|---|---|
| **A. Per epic** | at Done, one per epic | one entry per epic | Three epics in a day mint v0.33.1/.2/.3 locally and one push. Only the last is ever served, so the middle versions never publicly exist. Keeps per-epic granularity in git. |
| **B. Per ship** | at Shipped, one per day | one aggregated entry | Semantically true — a version is a released artifact. But it is a *daily* release, not a mini one, and each epic loses its own version marker. |
| **C. Split** | at Shipped, one per day | line per epic at Done, into `[Unreleased]` | Uses the buffer as designed. Every epic gets its own CHANGELOG line as it finishes; one version number marks what actually shipped. |

**Recommendation: C.** It is the only option where the version number means what SemVer says it
means and no epic loses its own entry, and it is the one the existing `[Unreleased]` buffer was
built for. A is the status quo extended and mints phantom versions; B loses per-epic attribution.

Deciding this is scope item **S9**.

### Gaps and blockers this model introduces

| # | Gap | Detail | Severity |
|---|---|---|---|
| G1 | **No `Shipped` column exists** | Board status is Backlog / Todo / In Progress / On Hold / Done / Canceled. Adding one edits a single-select. Adding `On Hold` via the UI on 2026-08-16 wiped nothing (66 items intact, all option IDs stable), but that is **one observation**, and the API path is documented to wipe every value. Add via UI, snapshot first: `gh project item-list 1 --owner bex-sugartown --limit 200 --format json > snapshot.json` | **Blocker** |
| G2 | **Closing the issue sets `Done`, not `Shipped`** | The `Item closed` project workflow sets `Status: Done`. If `Shipped` is terminal, `/eod` must close the issue *and then* set `Shipped`, in that order, or the automation overwrites it. Order-dependent and easy to get backwards. GitHub's built-in workflows cannot express "on push, Done → Shipped". | **Blocker** |
| G3 | **Nothing moves Done → Shipped** | No automation exists. It is a scripted step in `/eod`: enumerate items with `Status: Done`, and after the CI run concludes `success`, close each and set `Shipped`. Has to be written. | **Blocker** |
| G4 | **`/platform/governance` already calls Done "shipped"** | `apps/web/scripts/stats/linear.js` buckets Linear's `completed` type into a bucket literally named `shipped`, and that feeds the published roadmap. So the site *already* reports Done as shipped, and today Done can precede the code being live. This model is the first chance to make that figure true — and the collector needs a matching split, or it will keep publishing Done as Shipped. Ties directly to ST-96. | **High** |
| G5 | **`docs/shipped/` no longer means shipped** | Close-out step 6 moves the doc at Done, but the directory is named for a state the epic has not reached. Either move it at Shipped instead, or accept the mismatch and write down that the directory name predates the status. | Medium |
| G6 | **The 58 migrated issues used Done = shipped** | Their history means the old thing. Do not retrofit; state that the new meaning applies forward only. | Low |
| G7 | **A skipped `/eod` breaks the day-as-sprint** | Items Done on Monday with no Monday push ship on Tuesday. `Shipped` must be defined as "everything Done at push time", not "today's work", or the batch silently loses Monday. | Low |

### Scope added by this section

- [ ] **S9 — Decide the mini-release cut** (A / B / C above) and rewrite `docs/mini-release-prompt.md` to match — layer: process
- [ ] **S10 — Add the `Shipped` status** to the board, via the UI, with a snapshot taken first (G1) — layer: tooling
- [ ] **S11 — Write the Done → Shipped step in `/eod`**, including the close-then-set ordering G2 requires — layer: process/tooling
- [ ] **S12 — Split the stats collector's `shipped` bucket** so the published roadmap distinguishes Done from Shipped, or record why it should not (G4) — layer: tooling

**S4 and S5 are now closed by this model rather than solved by it.** I3's signal is the Done
column; I4's reopen path is "it stays Done". Both scope items are struck rather than deleted, so
the reasoning survives.

## Impact analysis — what else this touches

Answering the invocation's "what else does this impact, what are blockers". Each row was checked
against the file named, not inferred.

| # | Impact | Where | Severity |
|---|---|---|---|
| I1 | Step 1b's CI requirement is the hard blocker | `CLAUDE.md:43` | **Blocker** — resolved by S1 |
| I2 | Done requires `origin/main` | `CLAUDE.md` §Issue Done = code on main | **Blocker** — resolved by S2 |
| I3 | "Done but unpushed" is invisible on the board | new failure mode created by S2 | ~~High~~ **Closed** — the Done column is the signal |
| I4 | Done becomes reversible: a red CI at EOD leaves a Done epic with broken code | new failure mode | ~~High~~ **Closed** — a red run leaves items in Done |
| I5 | Chromatic lives in three places, one of them a Tier 1 gate | close-out step 4, `/mini-release` §0A, `/eod` Phase 3.2 | Medium — S3 |
| I6 | `/switch`: finish an epic, switch machines without `/eod`, and the other machine has nothing while the board reads Done | `.claude/skills/switch` | Medium |
| I7 | `stats.linearRoadmap` buckets Linear `completed` into a bucket named `shipped`, so the published roadmap **already** reports Done as shipped | `apps/web/scripts/stats/linear.js:5,128` | **High** — G4 / S12, ties to ST-96 |
| I8 | `docs/shipped/` holds docs for epics that are Done but not Shipped, so the directory name and the status disagree | close-out step 6 | Medium — G5 |
| I9 | Morning briefing's "previous session didn't run `/eod`" flag still works, but its meaning shifts from "unfinished" to "unpublished" | `docs/workflows/morning-housekeeping-prompt.md` | Low |
| I10 | Mini-release version bumps accumulate locally when several epics finish in one day | `docs/mini-release-prompt.md` | Low — git history is linear, already covered |
| I11 | A commit body quoting the skip marker suppresses its own CI run | verified 2026-08-02, SUG-265 | Low — S7 |
| I12 | Netlify branch-deploy and deploy-preview settings are unknown; `netlify.toml` is fully commented out and config lives in the UI | SUG-265, unresolved | Unknown — inherited |

**The genuine trade, and how the sprint model settles it:** today's rule is strict because it
prevents calling something Done that is stranded where nobody can see it (SUG-231: 48 commits on
one disk for two days). Relaxing the precondition alone would move that risk rather than remove
it — from "cannot mark Done" to "marked Done, still on one disk". The Done/Shipped split is what
makes the relaxation honest: unpushed work has its own visible state rather than hiding inside a
terminal one. **So Phase 2 is not optional sequencing — without `Shipped` on the board, this
epic reintroduces SUG-231's failure with the warning light removed.**

## Open questions for activation

1. **Does a PR run satisfy step 1b?** SUG-265 raises this and does not settle it: a PR run tests
   the merge candidate, not the merge commit. If S1 keeps any CI requirement at close-out, this
   decides whether a `wip/<epic>` → PR path is viable. If S1 moves CI wholly to `/eod`, the
   question disappears — note which outcome applies.
2. ~~**Does Done mean "work complete" or "shipped"?**~~ **Answered 2026-08-16: both, as two
   states.** See §The day as the sprint.
3. ~~**Is a sixth status the cleaner answer?**~~ **Answered: yes** — `Shipped`. S10 adds it.
4. **Does the version number mark work or a release?** S9. The three options are tabled in
   §The day as the sprint; C is recommended.

## Kill criterion

Required by the rule this epic's sibling ST-98 just added (post-mortem 6.7).

**If, after 30 days, no epic has reached Done before its `/eod` push — or items routinely sit in
`Shipped` having never paused in `Done` — revert to the current sequence and delete the split.**
Either pattern means the day-as-sprint is not how the work actually arrives, and the extra state
is costing more than the friction it removed. Check date: 30 days after Phase 3 merges.

## Human QA Walkthrough

Not applicable — no shared CSS, token, or multi-page component changes. This epic edits
instruction files only.

## Technical notes

- **Content Write Gate:** does not fire. No Sanity writes.
- **Instruction & Rule File Write Gate:** fires on every Phase 3 edit. `CLAUDE.md`,
  `docs/epic-template.md`, `docs/conventions/`, and `.claude/skills/**` are all in scope, so
  diffs are produced from scratchpad copies and approved before any write.
- **ST-99 v1 walkthrough** runs on the Phase 3 diff before commit. Prior runs show the dominant
  defect class here is a renamed heading orphaning inbound cross-references — this epic renames
  or rewrites at least one section heading (§Issue Done = code on main), so grep for inbound
  pointers before committing.
- **Activation audit:** read `docs/workflows/eod-prompt.md` Phase 3 in full before editing it.
  Steps 2 and 5 already do Chromatic and CI verification; S1 and S3 extend existing steps rather
  than adding new ones, and the epic should not duplicate what is there.
- **Activation audit:** read `.github/workflows/ci.yml` triggers and confirm they are still
  `push: branches: [main]` plus `pull_request: branches: [main]` before relying on open question 1.
- **Upstream dependencies:** none blocking. ST-98 has shipped the rules this epic is measured
  against. SUG-265 Part B overlaps and is handled by S8 rather than by waiting.

## Model & Mode [REQUIRED]

**`/model opus` with plan mode for Phase 1**, then `/model sonnet` for Phases 2 and 3. Phase 1 is
six interacting rule decisions where the wrong call creates a failure mode rather than a bug —
I3, I4 and I6 are all consequences of getting S2 wrong. That is the ambiguity the plan-first
workflow exists for. Phases 2 and 3 are text edits against an approved decisions table, which is
ordinary Sonnet work.

## Non-Goals

- **Changing what triggers a Netlify deploy.** A push to `main` deploys; that is the constraint
  this epic works within, not one it removes.
- **Branch protection on `main`.** Deliberately absent (SUG-255) so merge-as-you-go is not
  blocked. Unchanged here.
- **SUG-265 Part A** (`/release` vs `/mini-release` prompt parity). Unrelated to the cost
  boundary and stays on [#90](https://github.com/bex-sugartown/sugartown/issues/90).
- **Rewriting the 7-gate release flow.** It works.
- **Reducing the number of deploys per day below one.** One deploy at `/eod` is the target, not
  zero.

## Related

- **GitHub:** [#100](https://github.com/bex-sugartown/sugartown/issues/100)
- **Absorbs:** SUG-265 Part B — [#90](https://github.com/bex-sugartown/sugartown/issues/90),
  `docs/backlog/SUG-265-release-prompt-step-parity.md`
- **QA:** ST-99 — [#99](https://github.com/bex-sugartown/sugartown/issues/99)
- **Sibling:** ST-98 — [#98](https://github.com/bex-sugartown/sugartown/issues/98), whose
  close-out was the trigger
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist,
  Schema Enum Audit, and Files to Modify at activation time
