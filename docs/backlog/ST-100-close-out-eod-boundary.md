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

Twelve items, above the sizing gate, so the scope-to-phase mapping is in §Phases. S4 and S5 are struck — the Done/Shipped model closed them. S9 is widened by §Should mini-release, release and /eod collapse into one? and now covers retiring `/mini-release` entirely.

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
- [ ] **S8 — Disposition all of SUG-265.** Part B is absorbed outright. Part A dissolves if S9
      retires `/mini-release`, since parity between two prompts stops being a thing that can
      drift — but only once its two unique steps have landed in `/release` (G11). Close
      [#90](https://github.com/bex-sugartown/sugartown/issues/90) into this epic once S9 lands,
      not before — layer: process

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
       (no version bump — /mini-release retired, S9)              │
                                                                  ▼
   ══════════════════════════════════════════════════════ /eod ═══════
   AT EOD  ·  the only step that spends
   ─────────────────────────────────────────────────────────────────────
                                                                  │
        ┌─────────────────────────────────────────────────────────┘
        │
        ▼
    ┌──────────┐  ┌──────┐  ┌─────────┐  ┌────┐  ┌───────────┐
    │Chromatic │─▶│ push │─▶│ Netlify │─▶│ CI │─▶│  SHIPPED  │
    │ (Tier 1) │  │  ×1  │  │ deploy  │  │run │  │ epics 1,2 │
    └──────────┘  └──────┘  └─────────┘  └────┘  └───────────┘
                                            │          │
                                   CI red   │          │  code is LIVE.
                                            ▼          │  no version yet.
                            epics stay DONE, ship      │
                            tomorrow (no un-Done)      │
                                                       │
   ═══════════════════════════════════════ /release ═══╪══════════════════
   EVERY 3–16 DAYS  ·  1–N epics  ·  no push, no spend │
   ─────────────────────────────────────────────────────────────────────
                                                       ▼
                          ┌─────────────┐   ┌────────────────────────┐
                          │ MINOR bump  │──▶│ [Unreleased] → [0.34.0]│
                          │  0.33 → .34 │   │ every epic's line, cut │
                          └─────────────┘   │ into one release entry │
                                            └────────────────────────┘
                                                       │
                                                       ▼
                                            release notes · header cap
```

**Nothing waits for a release to go live.** Code ships daily at `/eod`; only the version number
and the written notes accumulate. That is the whole trick — launching and versioning were welded
together, and separating them is what removes the wait without batching the deploy.

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

~~**Recommendation: C.**~~ **Superseded the same day** by §Should mini-release, release and /eod
collapse into one? — all three options above assume the version bump happens *somewhere in the
day*, and the measurement showed it should not happen daily at all. 187 patch bumps produced 33
releases. The right cut is **C's CHANGELOG half with the bump moved out to `/release`**: a line
per epic into `[Unreleased]` at Done, one MINOR bump every 3 to 16 days when a release is cut.

The table stays because the reasoning against A and B still holds and the next reader will ask.
Deciding this is scope item **S9**, now widened.

### Should mini-release, release and /eod collapse into one?

Raised 2026-08-16. Answered: **no, but `/mini-release` should be retired.** The batching model
the question asks for already exists one layer up.

**Measured first, 2026-08-16:**

| | Count | Command |
|---|---|---|
| `chore(release): mini-release` commits | **187** | `git log --grep="chore(release): mini-release" \| wc -l` |
| other `chore(release)` commits | **1** | same, inverted |
| MINOR versions in `CHANGELOG.md` | **33** | `grep -cE "^## \[0\.[0-9]+\.0\]" CHANGELOG.md` |

`v0.30.0` aggregated **ten** mini-releases across five days. `v0.29.0` aggregated six. A MINOR
release *is already* "1 to 10 epics, possibly spanning days" — that is what `/release` does. So
the structure being asked for is built and has run 33 times. What is redundant is the per-epic
**version bump**: 187 of them produced 33 releases anyone saw, and only the last before each
MINOR is ever served in the footer via `__APP_VERSION__`.

**The distinction that makes this tractable: launching is not versioning.** Those two are welded
today because a push deploys, so shipping code and minting a version happen in one motion. Pull
them apart and nothing waits for a sprint — code ships daily at `/eod`; only the version number
and the written release notes accumulate. The friction in "I don't want to wait a sprint to
launch" is real, and it is entirely in the *push*, not in the version.

That gives three rhythms, each doing one job:

| Rhythm | Runs | Produces | Costs |
|---|---|---|---|
| **Epic** | hours | Done, a CHANGELOG line in `[Unreleased]`, doc moved | nothing |
| **Ship** (`/eod`) | daily | code live, Done → Shipped, CI verified | 1 deploy |
| **Release** (`/release`) | 3–16 days, 1–N epics | version bump, CHANGELOG cut, release notes | nothing new |

### Process comparison

| | **Today** | **Option 1 — one command** | **Option 2 — retire mini-release (recommended)** |
|---|---|---|---|
| Per epic | `/mini-release`: patch bump + CHANGELOG stub + Done | nothing | CHANGELOG line → `[Unreleased]`, Done |
| Daily | `/eod`: push, deploy, Chromatic, CI | — | `/eod`: push, deploy, Chromatic, CI, Done → Shipped |
| Periodic | `/release`: MINOR bump, notes, header cap | `/release`: everything, 1–N epics, multi-day | `/release`: MINOR bump, notes, header cap |
| Commands | 3 | 1 | 2 |
| Version bumps per release | ~6 patch + 1 minor | 1 | 1 |
| Unpushed exposure | ≤ 1 day | **up to a full release cycle** | ≤ 1 day |
| SUG-265 Part A (prompt parity) | live defect | dissolved | **dissolved** |

**Option 1 is the literal proposal and it fails on one thing.** Collapsing `/eod` into `/release`
means code stays on one disk for the whole release cycle — 3 to 16 days at the measured cadence.
That is SUG-231 exactly: 48 commits, one disk, two days, and that was considered bad enough to
write a rule about. It also breaks the day-as-sprint model above, whose signal is an empty Done
column each morning. Option 1 can only work if push is separated back out, at which point it is
Option 2 with extra steps.

**Option 2 keeps the daily push and retires the ceremony that was actually redundant.** It gives
the same end state the question wants — one release covering 1–N epics over multiple days — and
it kills SUG-265 Part A outright, because with `/mini-release` gone there are no two prompts to
hold in parity.

### Gaps in Option 2

| # | Gap | Detail |
|---|---|---|
| G8 | **Nothing triggers a release.** `/mini-release` fired automatically at close-out. `/release` needs a trigger: a shipped-epic count, elapsed days, or a human call. Undefined today because close-out always bumped. |
| G9 | **The footer version goes stale between releases.** `__APP_VERSION__` would show the last *released* version for up to 16 days rather than moving every epic. That is more honest than today, where it shows a patch nobody released, but it is a visible change. |
| G10 | **`stats.releases` counts CHANGELOG version headings.** Fewer, larger releases means the count grows more slowly. History is unaffected; the trend line changes. Worth stating before someone reads it as a slowdown. |
| G11 | **`/release` inherits `/mini-release`'s unique steps.** SUG-265 Part A names two: the `> Updated` header cap at 8 entries, and the Chromatic pre-check. Both must land in `/release` as part of the retirement, not be dropped with it. |

**S9 is rewritten to cover this**, since the mini-release cut cannot be decided without it.

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

- [ ] **S9 — Decide the release model.** Options 1 / 2 above; if Option 2, retire
      `docs/mini-release-prompt.md`, migrate its two unique steps into
      `docs/workflows/release-assistant-prompt.md` (G11), and define the release trigger (G8) —
      layer: process. **Closes SUG-265 Part A**, which exists only because two prompts must
      match.
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
- ~~**SUG-265 Part A** (`/release` vs `/mini-release` prompt parity).~~ **Pulled in 2026-08-16.**
  If S9 retires `/mini-release`, Part A dissolves rather than being fixed — there is no second
  prompt to hold in parity. Its two unique steps (the `> Updated` header cap, the Chromatic
  pre-check) migrate into `/release` as part of the retirement, which is G11. This means ST-100
  absorbs **all** of SUG-265, not just Part B, and [#90](https://github.com/bex-sugartown/sugartown/issues/90)
  closes rather than being re-scoped. S8 records the disposition.
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
