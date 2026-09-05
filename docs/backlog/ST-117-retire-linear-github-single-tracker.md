---
**Epic:** ST-117 — Retire Linear; GitHub is the single tracker
**Issue:** [#117](https://github.com/bex-sugartown/sugartown/issues/117)
**Status:** In Progress
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
---

# ST-117 — Retire Linear; GitHub is the single tracker

Retire Linear as a tracker and make GitHub Issues plus project 1 the only queue: repoint the
stats collector's roadmap block from Linear to the GitHub Projects API, sweep the ten
instruction files that still name Linear, refresh the export once and archive the workspace.

## Background

The Linear → GitHub trial (`docs/briefs/linear-to-github-migration-plan.md`) began 2026-08-15
with a decision point on 2026-09-09. By 2026-09-05 the question is answered in practice: every
tracker write for three weeks went to GitHub; the board's `Item closed` and `Issue added`
automations tracked status through six `Done` → `Shipped` transitions this week without hand
correction; 82 of the board's 83 items carry a `Priority`, so the ordering Linear was kept
read-only to hold has already moved. Bex decided on 2026-09-05 to go all in on GitHub.

What still touches Linear, measured 2026-09-05:

| Surface | What it does with Linear | Command |
|---|---|---|
| `apps/web/scripts/stats/linear.js` | reads the workspace via GraphQL into `stats.linearRoadmap` (`inProgress`, `backlog`, `completed`, `fetchedAt`) | `grep -rln linear apps/web/scripts/stats` |
| `apps/web/src/pages/platform/GovernancePage.jsx:56` | renders `stats.linearRoadmap` as the roadmap block | `grep -rn linearRoadmap apps/web/src` |
| `apps/web/src/pages/dev/TablesDevPage.jsx:6` | uses the block as a table fixture | same |
| `.github/workflows/stats.yml:70` | passes the `LINEAR_SUGARTOWN_STATS` secret | `grep -n LINEAR .github/workflows/*.yml` |
| Ten instruction files | say "Linear" somewhere: `CLAUDE.md` (§Tracker writes go to GitHub only, and §Issue status's Linear relation sentence), `.claude/rules/epics.md`, `.claude/skills/new-epic/docs/new-epic-prompt.md`, `.claude/skills/sugartown-epic-writer/SKILL.md`, `docs/epic-template.md`, `docs/workflows/morning-housekeeping-prompt.md`, `docs/workflows/release-assistant-prompt.md`, `docs/workflows/rules-tools-audit-runbook.md`, `docs/write-node-prompt.md`, `docs/write-pipeline-prompt.md` | `grep -rln Linear CLAUDE.md .claude/rules .claude/skills docs/epic-template.md docs/write-pipeline-prompt.md docs/write-node-prompt.md docs/ship-prompt.md docs/workflows` |
| Memory | `reference_linear.md` in the project memory describes the workspace and team key | `~/.claude/projects/.../memory/reference_linear.md` |

The 58 migrated issues keep their `SUG-NNN` IDs; that decision was locked on 2026-08-15 and
nothing here reopens it (`.claude/rules/epics.md` §Two ID eras).

## Objective

After this epic, GitHub is the only tracker in every sense a session or a page can observe:
the governance page's roadmap block is fed from the GitHub Projects API, no workflow needs a
Linear secret, no instruction file tells a session to read or write Linear, and the Linear
workspace exists only as a committed export and an archived account. Layers touched:
**tooling** (stats collector, workflow secret), **frontend** (one consumer's field shape if the
block's shape changes), **docs** (the sweep, a rule file, a skill prompt, memory). No schema,
no GROQ, no Sanity content.

## Scope

Seven items, which crosses the sizing gate — see the scope-to-phase mapping under Phases.

- [x] Run the migration plan's §13 review as the first step, four days early: §13.3 (did the board track reality, was the priority view used, were the four automations enabled) and §13.4's carried decisions; §13.1 capacity and §13.2 API re-check are recorded as moot because the decision is to leave. Record the answers in the brief — layer: docs. **Done 2026-09-05** — answers recorded in `docs/briefs/linear-to-github-migration-plan.md` §13.1–13.5; decision recorded as Migrate. Found beyond the plan's own audit: GitHub's default workflow set has moved since 2026-08-15 (`ProjectV2.workflows` GraphQL field, unknown to the plan) — no "Item reopened" workflow exists under that name; SUG-249 is still an unscoped stub and its disposition is explicitly left open, not resolved here (out of ST-117's remit)
- [x] Repoint the roadmap block: replace `apps/web/scripts/stats/linear.js` with a collector that reads project 1 through the GitHub Projects GraphQL API (status buckets `In Progress`, `Todo`/`Backlog`, `Done`/`Shipped`, plus `fetchedAt`), writing the same field shape so `GovernancePage.jsx` and `TablesDevPage.jsx` need no change, or a renamed `githubRoadmap` with both consumers updated in the same commit — layer: tooling + frontend. **Done 2026-09-05** — `apps/web/scripts/stats/github-projects.js` (new), wired into `collect-stats.js`; top-level key renamed to `githubRoadmap` (both consumers updated, one line each — `linearRoadmap` was a stale name the moment it stopped meaning Linear). Verified live against project 1 with `gh auth token`: 1 in progress / 63 backlog / 19 completed, matching the board. `/platform/governance` re-verified in-browser after the change: roadmap renders, no `linear.app` links or console errors, hero subtitle and section copy updated. Beyond the enumerated surface table: found and fixed four more Linear-branded strings on the same page (subtitle, a workflow-doc-index row, the "In flight" StatCard href, two roadmap Callout links) that the plan's grep never caught, plus a same-pattern misnamed `linearIssue` field in the unrelated `changelog.js` collector (already dual-era SUG-/ST- aware, just mislabeled) — renamed to `issueId`, one consumer (`TrustReportSection.jsx`) updated
- [x] Remove the `LINEAR_SUGARTOWN_STATS` secret from `stats.yml` and the collector's error text; the workflow's existing `GITHUB_TOKEN` needs `read:project` scope, verified by running the collector in CI once — layer: tooling. **Code done 2026-09-05** — `stats.yml` now passes `GH_PROJECTS_TOKEN` instead. **CI verification blocked on Bex**: the default Actions `GITHUB_TOKEN` cannot be granted Projects v2 read access via the `permissions:` block (confirmed: Projects isn't a grantable scope there) — this needs a fine-grained PAT with Projects read access added as a new repo secret named `GH_PROJECTS_TOKEN`, which only Bex can create. Instructions handed over separately (not a session action — GitHub account settings)
- [x] Sweep the ten instruction files: delete `CLAUDE.md` §Tracker writes go to GitHub only in full (its own text says to delete it at the review), reword every remaining "Linear" to "issue" or "the board" per `CLAUDE.md` §Write "issue", drop the `blockedBy` relation sentence, retitle `docs/write-pipeline-prompt.md` §0 to "Tracking issue" with `gh issue create` mechanics, and update the epics rule's ID-era note to say Linear is archived. Each rule-file edit goes through the write gate and the followability walkthrough; run `node scripts/check-renamed-headings.js` on `CLAUDE.md` — layer: docs.
  **Done 2026-09-05.** All ten swept. Gate-approved diffs (two rounds, all approved) covered
  `CLAUDE.md`, `.claude/rules/epics.md`, `.claude/skills/new-epic/docs/new-epic-prompt.md`,
  `.claude/skills/sugartown-epic-writer/SKILL.md`, `docs/epic-template.md`,
  `docs/conventions/stats-pipeline.md`, `docs/conventions/feedback-loop.md`,
  `docs/conventions/user-story-conventions.md`, `docs/conventions/usage-doc-style-guide.md`.
  Ungated (no diff-approval needed, still ran the followability walkthrough):
  `docs/workflows/morning-housekeeping-prompt.md` (replaced the whole "Linear Status" section
  with a "Board Status" one using `gh project item-list`, rather than deleting it outright — the
  underlying need didn't go away), `docs/workflows/release-assistant-prompt.md`,
  `docs/write-node-prompt.md`, `docs/ai/README.md`. `check-renamed-headings.js` run on every
  file with a removed/renamed heading; one dangling reference caught and fixed
  (`docs/write-blog-prompt.md` and `docs/write-casestudy-prompt.md` both had the identical
  "Step 0.5 — Linear tracking ticket" heading, missed by the original ten-file list since they
  weren't on it — fixed to match).

  **Found beyond the ten-file list, fixed:** `apps/web/vite.config.js` (a code comment naming
  the old field/env var), `scripts/monthly-evidence-digest.js` (a real bug — it read
  `stats.linearRoadmap` and would have silently reported "unavailable" backlog counts forever
  after the Phase 1 rename; caught by re-testing the Phase 1 change's blast radius, not by the
  grep list), `docs/conventions/stats-pipeline.md` and `docs/conventions/feedback-loop.md`
  (detailed collector docs the original grep missed because they're about the pipeline, not
  about Linear the tracker), `docs/conventions/user-story-conventions.md` and
  `docs/conventions/usage-doc-style-guide.md` (both say "one epic is one Linear issue" /
  "backlog goes in Linear").

  **Found, deliberately left alone:** `docs/workflows/rules-tools-audit-runbook.md` cites PRD
  decision **D-1: Linear tracking** (`docs/briefs/rules-tools-audit-prd.md`) verbatim — a real,
  still-open decision owned by Bex with "no Linear, repo-only" as one of three options. Now that
  Linear is retired, that option is the only one left standing, but resolving someone else's
  open decision is outside ST-117's remit — flagged for Bex, not resolved here. `.claude/settings.json`
  still grants `mcp__plugin_linear_linear__*` tool permissions; harmless (the connector isn't
  authorized) but worth a cleanup pass separately. ~70 files under `docs/backlog/` and
  `docs/shipped/` mention Linear as historical epic metadata (`**Linear Issue:** [SUG-N]`
  header boilerplate) — correctly untouched per "historical docs keep the word Linear".
- [ ] Refresh `docs/briefs/data/linear-export-2026-08-15.csv` once as `linear-export-2026-09-{dd}.csv`, commit it, and note in the migration plan that it is the archive of record — layer: docs.
  **Blocked on Bex.** No Linear API or MCP access exists in this environment to pull the export
  directly — it has to come from Linear's own UI export feature. Asked her to run it and hand
  over the file.
- [x] Archive the workspace: Bex's action in Linear's settings (a session cannot); the brief records the date. Delete the `reference_linear` memory file and update `MEMORY.md` — layer: docs.
  **Memory half done 2026-09-05**: `reference_linear.md` deleted, `MEMORY.md` updated, a new
  `project_linear_retirement.md` memory records the retirement and what's still pending.
  Two more stale Linear mentions found in memory beyond this file and fixed: `feedback_reporting_style.md`
  ("push evidence to Linear" → "to the issue") and a dangling `[[reference-linear]]` link in
  `project_ship_cadence_plan.md`, repointed. **Workspace half blocked on Bex** — archiving in
  Linear's settings is her action; not done.
- [ ] CHANGELOG line and the brief's status set to closed — layer: docs.
  **Not done yet.** CLAUDE.md's own convention adds the CHANGELOG line at `Done`, and this epic
  isn't there — two scope items are genuinely blocked on Bex, not skipped. Add the line once
  they land (or once she confirms Phases 1–2 are enough for now and the rest is deferred).

## Phases

Merge strategy is **(b) single close-out**: all three phases accumulate on one branch and
merge once, so the docs never describe a half-retired tracker on `main`.

| Phase | Scope items | What ships at the end |
|---|---|---|
| **Phase 1 — Review and repoint** | §13 review; collector repoint; secret removal | The governance page's roadmap block is fed from GitHub, verified by one CI stats run producing a non-empty block with a `fetchedAt` of that run. Linear is read by nothing in the repo. |
| **Phase 2 — Sweep** | the ten files; export refresh | No instruction file names Linear except as history; `grep -rln Linear` over the instruction set returns only shipped docs, the migration plan, and the CHANGELOG. |
| **Phase 3 — Archive** | workspace archive; memory; CHANGELOG | Workspace archived, date recorded; memory cleaned; one `[Unreleased]` line. |

`Scope ∖ Phases` is empty: every scope item above appears in exactly one phase.

## Acceptance criteria

- [ ] `docs/briefs/linear-to-github-migration-plan.md` §13 carries dated answers for 13.3 and 13.4, and a one-line "moot, leaving" note for 13.1 and 13.2
- [ ] `stats.json` on `main` after the next CI stats run carries a roadmap block sourced from GitHub: `fetchedAt` is that run's date and the counts match `gh project item-list` bucketed the same way, checked by hand once
- [ ] `/platform/governance` renders the roadmap block unchanged in shape on the local dev server, and Chromatic reports no unintended diff if the component changed
- [ ] `grep -rn LINEAR .github/workflows/` returns nothing; the Netlify build and the stats workflow both succeed without the secret
- [ ] `grep -rln Linear CLAUDE.md .claude/rules .claude/skills docs/epic-template.md docs/write-pipeline-prompt.md docs/write-node-prompt.md docs/ship-prompt.md docs/workflows` returns nothing
- [ ] `CLAUDE.md` §Tracker writes go to GitHub only is gone; `check-renamed-headings.js` run and every hit judged
- [ ] A refreshed export CSV is committed under `docs/briefs/data/` and named in the brief as the archive of record
- [ ] The brief records the workspace archive date; `reference_linear.md` is deleted and `MEMORY.md` no longer lists it

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, confirm `/platform/governance` is the only
> route rendering the roadmap block (plus the dev-only tables page), and capture one local
> URL for each as the regression guard per `docs/epic-template.md` §Human QA Walkthrough.
> No CSS or token changes are expected; if the block's field shape changes, the page is the
> only visual surface.

## Technical notes

- **Content Write Gate**: does not fire. No Sanity content is written.
- **Schema changes**: none.
- **Upstream dependencies**: none. The 2026-09-09 review date is folded into Phase 1, not
  waited for.
- **The stats collector is the only real code.** Activation audit: read
  `apps/web/scripts/stats/linear.js` and `apps/web/scripts/stats/index.js` (or whatever
  composes the collectors) for the block's exact shape and its degrade-to-stale behaviour
  (`v0.35.0` CHANGELOG: collectors mark stale rather than fail), and read
  `GovernancePage.jsx:56` for which fields are consumed. Keep the shape if at all possible;
  a renamed block is a two-consumer change plus a CHANGELOG note.
- **Token scope.** `GITHUB_TOKEN` in Actions does not carry `read:project` by default; the
  collector may need a fine-grained PAT stored as a repo secret, which is one secret replacing
  another. Verify by running the collector once in CI before removing `LINEAR_SUGARTOWN_STATS`.
- **The sweep is mostly rule files.** `CLAUDE.md`, `.claude/rules/epics.md`, the two skill
  prompts, `docs/epic-template.md` and the three workflow prompts are all in the write gate's
  scope. Draft from copies, show one combined diff, then apply. Historical docs (shipped epics,
  the migration plan's execution logs, CHANGELOG) keep the word "Linear".
- **Activation audit before the sweep:** `grep -rn "Linear" <the ten files>` and classify each
  hit as delete, reword, or keep-as-history before editing anything.

## Model & Mode [REQUIRED]

`/model sonnet`. The collector repoint is a bounded rewrite against a documented API with a
known output shape; the sweep is mechanical editing under the write gate. No architectural
ambiguity.

## Non-Goals

- **Renumbering anything.** `SUG-NNN` IDs on migrated epics and docs stay as they are.
- **Recreating Linear relations on GitHub.** The 33 `Related to` relations live as body lines
  per the migration plan §11; this epic does not migrate them into a GitHub relation even if
  the API has gained one. Separate decision.
- **Changing the board's fields, views or automations.** They worked through the trial.
- **Deleting the Linear account.** Archive, and keep the export; deletion is Bex's, later, if
  ever.

## Related

- **GitHub:** [#117](https://github.com/bex-sugartown/sugartown/issues/117)
- **Brief:** `docs/briefs/linear-to-github-migration-plan.md` §13 (the review this epic runs)
- **Epic template:** `docs/epic-template.md` — complete Files to Modify at activation time
