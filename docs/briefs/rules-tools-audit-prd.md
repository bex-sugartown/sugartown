# Rules & Tools Audit — Product Requirements Document

**PRD Version:** v1.0
**Status:** Draft
**Author:** Bex Head (with Claude)
**Domain:** Mixed (governance process; no CMS, DS, or ecom surface)
**Last updated:** 2026-07-17
**Related epics:** TBD (epic to be created via /new-epic once this PRD is approved)

---

## 2. Problem Statement

Sugartown's AI operating rules accumulate by incident and nothing prunes them. Every gate was added in response to a failure (SUG-90 begat the Content Write Gate; a surprise publish begat the Human-Publishes Rule; subagent scope creep begat the Instruction & Rule File Write Gate) but no process ever asks whether an existing rule still earns its keep, whether two rules overlap, or whether a rule's technical references still resolve. The 2026-07-16 session found all three failure classes live in one evening: CLAUDE.md cited MCP tool names that no longer exist (`patch_document_from_json`), a shippable skill (`/glossy`) directly contradicted the publish rule, and the publish rule itself was referenced in 7 files but defined in none. Left alone, the rulebook becomes its own tax: every session pays the reading and compliance cost of every rule ever written, whether or not the risk is still real.

## 3. Goals & Non-Goals

| Goal | Description |
|------|-------------|
| Scheduled audit exists | A repeatable audit process runs on a calendar trigger, not only after incidents. |
| Pruning is a first-class outcome | Every audited item gets a disposition: keep, simplify, merge, or retire. Retire and merge are expected results, not exceptions. |
| Staleness is caught mechanically | Tool names, file paths, counts, and cross-references are verified against the live system, not re-read and trusted. |
| Contradictions are swept | Skills and prompt docs are checked against CLAUDE.md gates each cycle (the /glossy failure class). |
| Right-sized human gates | Major rule changes (retiring or merging a hard-stop gate) require explicit human approval. Mechanical staleness fixes batch into one reviewed diff. The net direction is fewer, better-placed approvals, not more. |
| Token cost is visible | Each audit run has a token budget, reports actual spend, and tracks cost per finding. |
| KPIs measure burden vs. benefit | Each cycle reports human approval burden against governance benefit, so simplification decisions are made on data instead of vibes. |
| Docs stay tidy | A housekeeping pass each cycle archives executed drafts, files old shipped docs into dated folders, and keeps the docs tree navigable, using git-friendly move discipline. |

| Non-Goal | Why excluded |
|----------|-------------|
| New per-session logging duties | KPIs must be derived from artifacts that already exist (red-pen archives, incident log, git history, epic docs). Adding paperwork to measure paperwork defeats the purpose. |
| Auto-applying retirements | The Instruction & Rule File Write Gate stays in force. The audit proposes; a human disposes. |
| Auditing application code quality | Covered by the existing validator suite, code review, and Chromatic. This audit covers rules, skills, and governance docs only. |
| Rewriting ai-ethics-and-operations.md principles | The 13 principles are stable philosophy. The audit targets the operational layer built on top of them. |
| Building a live rules-compliance monitor | This is a periodic audit, not runtime enforcement. Runtime enforcement stays where it is (pre-commit hooks, validators, the gates themselves). |

## 4. User Stories

| ID | Title | User Story | Acceptance Criteria | Priority |
|----|-------|-----------|---------------------|----------|
| US-001 | Full inventory | As the operator, I want each audit to start from an enumerated inventory of every rule-defining surface, so nothing is silently out of scope | Inventory lists every CLAUDE.md section, every skill, every governance doc under docs/ai/ and docs/conventions/, with a disposition column | P0 |
| US-002 | Staleness sweep | As the operator, I want mechanical checks that tool names, file paths, and cited values still resolve | Every named MCP tool exists in the live tool surface; every cited file path resolves; every count matches a fresh measurement | P0 |
| US-003 | Gate efficacy review | As the owner, I want each hard-stop gate assessed on whether it has fired, what it caught, and whether its risk is still live | Each gate gets a one-paragraph efficacy note with evidence (incident log, red-pen archives, git history), not a rubber stamp | P0 |
| US-004 | Contradiction sweep | As the owner, I want skills checked against CLAUDE.md each cycle | Every skill's publish/write/commit behavior is diffed against the three write gates; contradictions become findings | P0 |
| US-005 | Disposition report | As the owner, I want one archived report per cycle with keep/simplify/merge/retire per item | Report lands in docs/reviews/rules-audit/YYYY-MM.md with a Findings table and Decision column, mirroring the red-pen archive pattern | P0 |
| US-006 | Human gate on major changes | As the owner, I want retire/merge/change of any hard-stop gate to require my explicit approval with the exact diff shown | No rule-file edit lands without approval; mechanical fixes batch into a single reviewed commit | P0 |
| US-007 | KPI capture | As the owner, I want burden-vs-benefit metrics per cycle | Report includes the KPI table (section 5) with every metric populated or explicitly marked unmeasurable-this-cycle with a reason | P1 |
| US-008 | Token budget | As the owner, I want each run capped and costed | Run declares a token budget up front, reports spend at close, and cost-per-finding is in the KPI table | P1 |
| US-009 | Scheduled trigger | As the owner, I want runs to fire on a schedule once the process is proven | After calibration runs, a scheduled routine (cloud agent cron or calendar reminder) triggers the audit without manual kickoff | P2 |
| US-010 | Housekeeping pass | As the owner, I want each cycle to sweep executed drafts and aging shipped docs into archive locations, so the active workspace shows only live work | Executed drafts sit in `docs/drafts/zArchive/`; shipped docs older than the threshold (D-6) sit in dated folders; zero broken inbound links after the sweep, verified by the staleness pass | P1 |

## 5. Technical Architecture

No code in this section; contracts only.

**Audit anatomy (one cycle, in order):**

1. **Inventory** — enumerate rule-defining surfaces: CLAUDE.md sections (by heading), `.claude/skills/**` (SKILL.md plus any delegated prompt doc in docs/), `docs/ai/agentic-caucus/*`, `docs/conventions/*`, the validator suite (as documented vs. as wired), and MEMORY.md entries that encode rules.
2. **Staleness sweep (mechanical)** — verify every named tool against the live MCP tool list, every file path with a filesystem check, every count with a fresh measurement (the existing "verify before citing" rule, applied to the rulebook itself).
3. **Gate efficacy review (judgment)** — per hard-stop gate: When did it last fire? What did it catch? Is it redundant with another gate? Is the originating risk still possible?
4. **Contradiction sweep** — skills and prompt docs vs. CLAUDE.md gates; pairwise rule conflicts; the "referenced by name but never defined" class.
5. **Housekeeping pass** — archive sweep per the scheme below. Runs after the staleness sweep (so moves are informed by which files are still referenced) and re-verifies paths after moving.
6. **Disposition report** — keep / simplify / merge / retire / archive per inventory item, with evidence. Archived to `docs/reviews/rules-audit/YYYY-MM.md`.
7. **Human review** — dispositions proposing changes to rule files route through the Instruction & Rule File Write Gate (exact diff, explicit approval). Mechanical staleness fixes and housekeeping moves each batch into one reviewed diff for one approval.
8. **KPI capture** — populate the metrics table from existing artifacts; append corpus-size trend line.

**Housekeeping scheme:**

| Surface | Practice | Git impact |
|---------|----------|-----------|
| `docs/drafts/` (gitignored, local-only) | Executed or dead drafts (mock implemented, epic shipped, exploration abandoned) move to `docs/drafts/zArchive/`. The `z` prefix sorts the folder last, keeping live drafts on top. Nothing is deleted; the agent moves, never removes. | None. The folder stays inside the gitignored path. |
| `docs/shipped/` | Files older than the threshold (D-6) move to `docs/shipped/zArchive/YYYY/`. Current-period epics stay flat at the top level where close-out and cross-references expect them. Legacy `EPIC-NNNN` files are first-wave candidates. | Move-only commits; inbound links fixed in a follow-up commit; verified by re-running the path check. |
| `docs/backlog/` | Superseded or abandoned epic stubs (rejected, folded into another epic) move to `docs/backlog/zArchive/` with a one-line header note naming what superseded them. The priority stack row gets struck through per the existing convention. | Same move-only discipline. |
| ~~`sugartown-backlog-priorities.md` header~~ (file retired 2026-08-05) | The `> Updated...` header blockquote grows without bound (currently one paragraph spanning months of history). Cap it at the last 5 entries; older entries move to a `## Changelog` section at the bottom of the same file. | Content edit, one-time then maintained per cycle. |
| Git branches | Merged branches are pruned locally and on remote (`/eod` already covers most of this; the audit catches stragglers). Unmerged branches older than 30 days get a disposition: merge, hold with reason, or delete. | Branch deletion only after the merged-into-main check from CLAUDE.md. |

**Git-friendly move discipline (hard rules for the housekeeping pass):**
- Moves use `git mv`, and move-only commits contain zero content edits, so rename detection stays intact and history follows the file.
- Link fixes land in a separate commit from the moves themselves.
- Housekeeping commits never mix with rule-file edits or audit-finding fixes.
- Moves happen at audit time, batched once per cycle, not ad hoc mid-session. A shipped doc's path staying stable between cycles is a feature; churn is the enemy of stable cross-references.
- After the sweep, the path-resolution check re-runs across the corpus; zero broken links is the exit condition.

**Execution model:** the judgment passes (3, 4) run as fresh-context subagents per the red-pen precedent, with the subagent explicitly forbidden from writing to rule files (returns proposed changes as report text). The mechanical pass (2) is scriptable over time; first runs may do it manually via agent, with scripting as a candidate simplification for later cycles.

**Cadence contract:**
- **Calibration phase:** first 2 to 3 runs are manually triggered at end of month, deliberately timed to consume remaining monthly plan credits. Full-corpus coverage on run 1 (baseline); subsequent calibration runs may narrow.
- **Steady state:** after calibration, either monthly on the 20th or quarterly (open decision D-2, resolved with calibration data). Steady-state runs use rotating coverage (a segment of the corpus per cycle, full coverage at least annually) unless calibration shows full-corpus runs are cheap enough to keep.
- **Credits pre-check:** remaining monthly credit balance is not queryable by the agent from inside a session. The EOM trigger includes a manual step: Bex checks usage in the Claude app (Settings → Usage) and greenlights the run size accordingly.

**KPI set (per cycle):**

| KPI | Measures | Source |
|-----|----------|--------|
| Approvals requested | Human clicky burden: count of explicit sign-offs the agent asked for this cycle (and per-session average where derivable) | Red-pen archives, epic docs, session summaries |
| Gate catches | Governance benefit: incidents caught at a gate before going live vs. incidents that got through | Incident log, red-pen Gate 2 logs |
| Disposition mix | Pruning health: keep / simplify / merge / retire counts. Retire + merge at zero for two consecutive cycles is a rubber-stamp warning, triggering an explicit "why did nothing retire" note | Audit report |
| Corpus size trend | Rule tax: total lines of CLAUDE.md + governance docs + skill definitions over time. Should flatten or shrink | Git history, line counts |
| Staleness findings | Drift rate: count of stale references found per cycle. Should trend toward zero as fixes land | Audit report |
| Token spend / cost per finding | Audit efficiency: total tokens per run divided by actionable findings | Session usage reporting |

## 6. Content Model

Not applicable. No Sanity schema changes. The audit's artifacts are Markdown files in the repo (`docs/reviews/rules-audit/`), following the established red-pen archive pattern.

## 7. Design Constraints

Not applicable (no visual surface). The report format inherits the red-pen archive conventions: findings table with Decision column, application log, feedback log. Report prose follows the brand voice guide (it is a governance doc: direct, dry, precise).

## 8. Open Decisions

| Decision | Options | Owner | Target resolution |
|----------|---------|-------|------------------|
| ~~D-1: Linear tracking~~ (resolved 2026-09-05) | One recurring SUG issue per cycle / one parent epic with per-cycle sub-issues / **no Linear, repo-only** | Bex | Resolved, see note below |
| D-2: Steady-state cadence | Monthly on the 20th / quarterly / hybrid (monthly mechanical sweep, quarterly full audit) | Bex | After calibration run 2, using real cost + finding-rate data |
| D-3: Token budget per run | Set after run 1 establishes a baseline | Bex + Claude | After calibration run 1 |
| D-4: Trigger mechanism for steady state | Scheduled cloud routine (cron) / calendar reminder + manual kickoff | Bex | After calibration; depends on whether runs need interactive approval mid-flight (they will, for dispositions, which argues for manual kickoff or a schedule that opens a session rather than completing autonomously) |
| D-5: Scripting the staleness sweep | Keep agent-driven / promote to a `validate:rules` script in the validator suite | Claude proposes, Bex approves | After two cycles show which checks are stable enough to script |
| D-6: Shipped-doc archive threshold | Age-based (older than 2 quarters) / count-based (keep newest ~30 flat) / year-based only | Bex | Before run 1's housekeeping pass |

**D-1 resolution note (2026-09-05):** no Linear, repo-only. Linear was retired as Sugartown's issue tracker repo-wide (ST-117, `docs/backlog/ST-117-retire-linear-github-single-tracker.md`), so the other two options, which both require creating new Linear issues, are no longer possible: the workspace has also been read-only at its 250-issue lifetime cap since 2026-08-09. GitHub is the single tracker; this audit's per-cycle tracking uses GitHub issues.

## 9. Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| The audit becomes a fourth gate: another burdensome ritual | High | Retire/merge as first-class outcomes; the disposition-mix KPI flags rubber-stamping; the audit itself is in-scope for its own review (an audit that finds nothing for two cycles gets its cadence cut) |
| KPI capture turns into per-session paperwork | Med | Hard non-goal: metrics derive from existing artifacts only. Any KPI that would require new logging gets dropped or marked unmeasurable |
| Subagent scope creep during audit runs | Med | Instruction & Rule File Write Gate already covers this; audit subagent briefs explicitly forbid rule-file writes (return-as-text contract) |
| Dispositions stall waiting on human review | Low | Batch mechanical fixes into one approval; only hard-stop gate changes need individual sign-off; unresolved dispositions carry forward as "pending" rather than blocking the report |
| Credits check is manual and gets skipped | Low | The EOM run proceeds anyway with a conservative default budget; the credit check only sizes the run up, never blocks it |
| Archive moves break inbound links | Med | Move-only commits, a dedicated link-fix commit, and the path-resolution check as the exit condition; any link the sweep misses becomes a staleness finding next cycle rather than a silent 404 |
| Housekeeping deletes something that mattered | Low | The agent moves, never deletes (drafts go to zArchive, not the void); branch deletion requires the merged-into-main check; everything else is recoverable from git history |

## 10. Success Criteria

| Area | Metric |
|------|--------|
| Coverage | Run 1 produces a disposition for 100% of CLAUDE.md hard-stop gates and 100% of skills |
| Pruning | Across the first two cycles, retire + merge + simplify count is greater than zero, or the report carries an explicit justification for why everything stayed |
| Staleness | Every stale reference found in run 1 is fixed and verified by run 2; run 2's staleness count is lower than run 1's |
| Process integrity | Every rule-file change originating from an audit went through the Instruction & Rule File Write Gate with a logged approval |
| Cost | Runs 2+ complete within the budget set at D-3; cost per finding is reported every cycle |
| Trend | Corpus size trend line exists and is current as of the latest cycle |
| Housekeeping | After each cycle's sweep: zero broken inbound links (path check passes), no live draft sits in zArchive, and no file was deleted rather than archived |

## 11. Out of Scope (Deferred)

- **Automated runtime rule enforcement** (e.g. a pre-commit hook that blocks rule-file edits without an approval marker). Candidate follow-up if manual review proves leaky; owns itself as a future epic.
- **Auditing MEMORY.md content quality** beyond rule-encoding entries. Memory hygiene is its own concern.
- **Cross-project audit** (contentful-poc, Storybook). First cycles cover the main app's governance surface; expansion is a disposition question for a later cycle.
- **`validate:rules` script** — deferred behind D-5.

## 12. Authoring Checklist

- [x] Every claim references a real system (incidents cited are from the 2026-07-16 session record and the incident log)
- [x] No content model table needed; stated why
- [x] Non-goals name reasons
- [x] Open decisions have owners and targets
- [x] Success criteria are independently verifiable
- [x] `featuredImage` does not appear
- [x] Voice check: no em dashes, no adjective triads, no future-tense promises on shipped surfaces
- [ ] A senior engineer could start writing the epic from this doc without a meeting (pending Bex's review)
