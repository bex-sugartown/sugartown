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
| **Ship** | daily | code live, `Done` → `Shipped`, CI verified | 1 deploy |
| **Release** | when a version is worth cutting | version bump, CHANGELOG cut, release notes | nothing new |

Whether Ship and Release are one command or two is **the decision below**.

Touches process and instruction files only. No schema, no GROQ, no `apps/web` render code, no
content.

---

## The decision — pick one before anything else

`/mini-release` is retired in all three options and is not in question: its only unique product
is a PATCH version bump, it never writes the CHANGELOG, and 187 of them produced 33 releases
anyone saw. Evidence in §A1.

What is in question is what replaces `/eod` + `/release`.

### Pros and cons

| | **Opt 1 — one `/ship`, every 1–3 days** | **Opt 2 — `/eod` daily + `/release` periodic** | **Opt 3 — one `/ship`, daily, `--release` flag** |
|---|---|---|---|
| Commands | **1** | 2 | **1** |
| Prompt-parity defect class | **gone** | **gone** | **gone** |
| Deploys per month | ~10–30 | ~30 | ~30 |
| CI feedback latency | **up to 3 days** ⚠️ | ≤ 1 day | ≤ 1 day |
| Disk exposure if the habit slips | up to 3 days ⚠️ | ≤ 1 day | ≤ 1 day |
| Disk safety is | a remembered mirror push | **automatic — the daily command** | **automatic** |
| Needs the bump-derivation rule (G13) | **yes, blocking** ⚠️ | no | no — the flag says it explicitly |
| Chromatic review batch | up to 3 days of diffs ⚠️ | 1 day | 1 day |
| `Done` column empties | every 1–3 days | **every morning** | **every morning** |
| Version numbers minted | 1 per ship | 1 per release | 1 per release |
| New unscoped work created | the sizing epic | none | none |

### The case against Option 1

You asked for it if there is one. There is. G12 removed the *disk* objection only; four things
survive:

1. **It has a blocking dependency on work you scoped as "future".** Collapse the commands and the
   bump level loses the thing it keys on: which command ran. Nothing derives it from content
   today (G13). So Option 1 cannot ship until the size/surface rule exists — the epic you said
   should be scoped separately. Options 2 and 3 both ship without it.
2. **CI feedback latency triples.** CI is the only thing verifying the build. At a 3-day cadence a
   break introduced Monday surfaces Wednesday with two days of work stacked on it, and debugging
   cost scales with what landed after. This has history: CI was red on `main` for 212 consecutive
   runs, partly because nobody looked often enough.
3. **Disk safety becomes a habit instead of a command.** Under Options 2 and 3 the daily command
   *is* the push, so forgetting costs one day. Under Option 1 safety depends on remembering
   `git push origin main:wip/<date>` on non-ship days. SUG-231 is the evidence that this habit
   fails: 48 commits, one disk, two days.
4. **It weakens the signal the Done/Shipped split was built to give.** An empty `Done` column each
   morning is the proof the ship ran. If `Done` legitimately holds items for three days, the
   signal stops being readable and the honesty the split bought is partly given back.

None is fatal. All four are avoidable.

### Recommendation — Option 3

**Option 1's collapse without Option 1's costs.** One command, one prompt, one instruction
surface, so the parity defect class disappears exactly as you want. But it runs daily, so CI
latency, disk exposure and Chromatic batch size stay where they are today, and `Done` still
empties every morning.

```
/ship              push · deploy · Chromatic · CI · Done → Shipped
/ship --release    all of the above, then version bump · CHANGELOG cut · notes
```

The version bump becomes an explicit human act rather than a derived one, so **G13 stops being
blocking**. The sizing epic then becomes what you wanted it to be: a later improvement that
automates a judgement, not a prerequisite gating this epic.

If you want Option 1 anyway, the honest path is a 1-day default with 2–3 days as the exception —
which is Option 3 under a different name.

---

## Scope

Fourteen items. Above the sizing gate, so the scope-to-phase mapping is §Phases.

- [ ] **S1 — Split step 1b.** `pnpm test:smoke` locally gates the epic; the CI conclusion moves to
      the ship command, which already watches the run to a conclusion — layer: process
- [ ] **S2 — Redefine Done.** Rewrite §Issue Done = code on main so `Done` means "work complete,
      committed locally", with the `origin/main` guarantee re-homed to `Shipped` — layer: process
- [ ] **S3 — Consolidate Chromatic to one place.** Currently three: close-out step 4 (Tier 1),
      `/mini-release` §0A, `/eod` Phase 3 step 2 — layer: process
- [x] ~~**S4 — "Done but unpushed" signal.**~~ Closed by the Done/Shipped split — §A3
- [x] ~~**S5 — Reopen path.**~~ Closed by the Done/Shipped split — §A3
- [ ] **S6 — Reconcile the two disagreeing push rules** (§Mid-epic commit checkpoints threshold vs
      close-out's CI need), stating which governs, in both places — layer: process
- [ ] **S7 — Record the `[skip ci]` trap** where a session writing a commit message meets it, and
      adopt `skip-ci` as the safe spelling — layer: process
- [ ] **S8 — Disposition all of SUG-265.** Part B absorbed. Part A dissolves once `/mini-release`
      retires, but only after its two unique steps land in the successor (G11). Close
      [#90](https://github.com/bex-sugartown/sugartown/issues/90) after S9, not before — layer: process
- [x] ~~**S9a — Resolve G12.**~~ Done 2026-08-16 — §A2. Two follow-ups folded into S9: correct
      `SUG-265:64`, and decide `skip_prs`
- [ ] **S9b — Measure credits per build** and record it in-repo (G14) — layer: tooling
- [ ] **S9 — Decide the release model** (Opt 1 / 2 / 3), then retire `docs/mini-release-prompt.md`
      and migrate its two unique steps (G11). If Option 1, the G13 bump rule is a blocking
      prerequisite — layer: process
- [ ] **S10 — Add the `Shipped` status** to the board via the UI, snapshot taken first (G1) — layer: tooling
- [ ] **S11 — Write the Done → Shipped step**, including the close-then-set ordering G2 requires — layer: process/tooling
- [ ] **S12 — Split the stats collector's `shipped` bucket** so the published roadmap stops
      reporting Done as shipped, or record why not (G4) — layer: tooling

---

## Phases

**Phase 0 — Facts. Partly done.** S9a complete. S9b remains: measure credits per build so the
cadence choice is arithmetic rather than instinct.

**Phase 1 — Decide.** S1, S2, S3, S6, S8, S9. Ships: a decisions table in this doc, approved,
each decision naming the file it lands in.

**Phase 2 — Board mechanics.** S10, S11. The blockers; nothing downstream works until the board
can express `Shipped` and something moves items into it. Ships: a working transition, demonstrated
on one item.

**Phase 3 — Apply the rules.** Every Phase 1 decision as one batch under the Instruction & Rule
File Write Gate, with an ST-99 v1 walkthrough on the diff. Also S7. Ships: the edits, committed.

**Phase 4 — Prove it and true up the numbers.** One real day end to end under the new boundary.
Also S12. Ships: a recorded run, and an honest roadmap figure.

---

## Acceptance criteria

- [ ] An epic that finishes mid-morning reaches `Done`, its CHANGELOG line written and its doc
      moved, with zero network calls and zero credits spent
- [ ] Exactly one command in the day pushes, deploys, or runs Chromatic
- [ ] Step 1b's CI half is verifiably still enforced, just later: name the step that fails the day
      if the run concludes `failure`
- [ ] Every rule that currently says "origin/main" or "merged" as a `Done` precondition is
      rewritten or has a written reason it stays
- [ ] The board distinguishes `Done` from `Shipped`, and one item is observed making the
      transition on a real run
- [ ] A red CI run is shown leaving `Done` items in `Done`, with nothing reopened by hand
- [ ] `/platform/governance` no longer reports `Done` work as shipped, or it is recorded why not
- [ ] `docs/mini-release-prompt.md` is retired and both of its unique steps live in the successor
- [ ] SUG-265 has a recorded disposition and [#90](https://github.com/bex-sugartown/sugartown/issues/90) reflects it
- [ ] ST-99 v1 walkthrough run on the Phase 3 diff, findings in the commit

---

## Non-Goals

- **Changing what triggers a Netlify deploy.** A push to `main` deploys; the epic works within
  that, it does not remove it.
- **Branch protection on `main`.** Deliberately absent (SUG-255). Unchanged.
- **The size-derived bump rule.** Its own epic — §A6. Only a prerequisite if Option 1 wins.
- **Reducing deploys below one per ship.** One is the target, not zero.
- **Rewriting the 7-gate release flow.** It works.

---

## Kill criterion

**If, after 30 days, no epic has reached `Done` before its push — or items routinely land in
`Shipped` having never paused in `Done` — revert to the current sequence and delete the split.**
Either pattern means the day-as-sprint is not how the work arrives, and the extra state costs more
than the friction it removed. Check date: 30 days after Phase 3 merges.

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
2. **The PR route for CI is not free.** SUG-265 proposed `wip/<epic>` → PR → CI to get a run ID
   without touching `main`. CI would run, but `skip_prs` is unset so the PR also builds a preview.
   `skip_prs: true` would make it free — a decision, not a fact.
3. **No branch has ever been pushed here.** `git ls-remote --heads origin` returns only
   `refs/heads/main`, which is why the question went unanswered: no history to read it from, and
   nobody read the config.

**Still unmeasured:** credits per build (G14). The budget is 1,000/month, and every cadence
argument in this epic reasons about a cost of unknown magnitude.
`https://app.netlify.com/teams/bex-sugartown/usage`

## A3 — The day as the sprint, and why Done ≠ Shipped

A sprint accumulates work items, signs each off, ships the batch at the end. A solo practitioner
does not want to wait two weeks to launch, so the sprint compresses to a day.

| | Means | Set when | Set by | Terminal? |
|---|---|---|---|---|
| **Done** | Work complete, reviewed, signed off. Not live. | Epic finishes | The session | No |
| **Shipped** | On `origin/main`, deployed, CI green. Users have it. | The ship command | The ship command | Yes |

**This closed two scope items rather than solving them.** S4 (a "Done but unpushed" signal) is
unnecessary because the `Done` column *is* the signal, and an empty one each morning is proof the
ship ran. S5 (a reopen path) is unnecessary because a red CI simply means nothing moves
`Done` → `Shipped` that night. No un-Done, no ceremony.

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
     ───────────▶  │ In Prog. │────────────── (unfinished) ───────┼──▶ tomorrow
                   └──────────┘                                   │
                                                                  │
     per epic, at DONE:                                           │
       · CHANGELOG line        → [Unreleased] buffer              │
       · docs/backlog → shipped/                                  │
       · commit                                                   │
       (no version bump — /mini-release retired)                  │
                                                                  ▼
   ══════════════════════════════════════════════════ /ship ══════════
   DAILY  ·  the only step that spends
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
                            tomorrow (no un-Done)      │
                                                       │
   ═════════════════════════════════ /ship --release ══╪═══════════════
   WHEN A VERSION IS WORTH CUTTING  ·  no push, no spend
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

**Drawn as Option 3.** Under **Option 1** the two lower blocks merge and fire every 1–3 days.
Under **Option 2** they are separate commands, `/eod` and `/release`.

**Nothing waits for a release to go live.** Code ships daily; only the version number and the
written notes accumulate. Launching and versioning were welded together, and separating them is
what removes the wait without batching the deploy.

## A5 — Gaps

| # | Gap | Detail | Severity |
|---|---|---|---|
| G1 | **No `Shipped` column** | Adding one edits a single-select. Adding `On Hold` via the UI on 2026-08-16 wiped nothing (66 items intact, option IDs stable), but that is one observation and the API path is documented to wipe every value. Snapshot first: `gh project item-list 1 --owner bex-sugartown --limit 200 --format json > snapshot.json` | **Blocker** |
| G2 | **Closing an issue sets `Done`, not `Shipped`** | The `Item closed` workflow sets `Status: Done`. The ship command must close *then* set `Shipped`, in that order, or automation overwrites it. GitHub's built-ins cannot express "on push, Done → Shipped" | **Blocker** |
| G3 | **Nothing moves Done → Shipped** | No automation exists. A scripted step: enumerate `Status: Done`, and after CI concludes `success`, close each and set `Shipped` | **Blocker** |
| G4 | **`/platform/governance` already calls Done "shipped"** | `apps/web/scripts/stats/linear.js:5,128` buckets `completed` into a bucket named `shipped`, feeding the published roadmap. The site already reports Done as shipped, and Done can precede code being live. First chance to make the figure true. Ties to ST-96 | **High** |
| G14 | **Credits per build unmeasured** | 1,000/month allowance. Every cadence argument here reasons about an unquantified cost — 30 deploys/month might be 3% of budget or 90%. Measure once and the question becomes arithmetic | **High** |
| G13 | **Bump level has nothing to key on if the commands collapse** | §Version Conventions ties the level to which command ran. Option 1 removes that. At 1–3 days, minting MINOR each time reaches 1.0 in ~2 months. Needs a content-derived rule — §A6. **Blocking for Option 1 only** | High (Opt 1) |
| G5 | **`docs/shipped/` no longer means shipped** | Close-out step 6 moves the doc at `Done`, but the directory is named for a state not yet reached. Move it at `Shipped`, or write down that the name predates the status | Medium |
| G11 | **The successor inherits `/mini-release`'s unique steps** | The `> Updated` header cap at 8 entries, and the Chromatic pre-check. Both must land before retirement, not be dropped with it | Medium |
| G8 | **Nothing triggers a release** | `/mini-release` fired automatically at close-out. A release needs a trigger: shipped-epic count, elapsed days, or a human call. Option 3's `--release` flag makes it a human call by design | Medium |
| G9 | **Footer version goes stale between releases** | `__APP_VERSION__` shows the last *released* version rather than moving every epic. More honest than today, where it shows a patch nobody released, but visible | Low |
| G10 | **`stats.releases` counts CHANGELOG headings** | Fewer, larger releases means a slower-growing count. History unaffected; the trend line changes. State it before someone reads it as a slowdown | Low |
| G6 | **The 58 migrated issues used Done = shipped** | Their history means the old thing. Do not retrofit; the new meaning applies forward only | Low |
| G7 | **A skipped ship breaks the day-as-sprint** | `Shipped` must mean "everything `Done` at push time", not "today's work", or a missed day silently drops from the batch | Low |
| G12 | ~~Branch-push cost unknown~~ | **Resolved 2026-08-16** — §A2 | ✅ |

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
