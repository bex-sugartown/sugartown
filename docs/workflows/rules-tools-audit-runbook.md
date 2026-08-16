# Rules & Tools Audit — Runbook

**Owning PRD:** [`docs/briefs/rules-tools-audit-prd.md`](../briefs/rules-tools-audit-prd.md) — read it in full before running a cycle; this runbook is the executable checklist, not the rationale.
**Owning epic (calibration run 1):** SUG-221
**First run:** 2026-07 (calibration run 1)

This is the checklist a fresh session (no memory of prior audit cycles) follows to execute one audit cycle end to end. If a step's rationale isn't obvious from this doc, the PRD section is linked — read it before improvising.

---

## Pre-flight (every cycle)

1. **Pull the live MCP tool list at run time** — the session's own tool surface, never a remembered list. This is the staleness sweep's source of truth for step 2.
2. **Check for in-flight boundary epics** that own a slice of the corpus (e.g. a docs-IA restructure, a prompt-doc consolidation). If one is active, this cycle's housekeeping/contradiction findings note "disposition owned by \<epic\>" instead of acting — see the epic doc's Technical Notes for the current boundary list.
3. **Credits pre-check (calibration phase only):** Bex checks remaining plan credits in the Claude app (Settings → Usage) before Phase 2's subagent-heavy passes and sizes the run. Not queryable by the agent. Skipping this does not block the run — a conservative default applies (fewer/smaller subagent fan-outs).
4. **Declare a token budget** for the run before starting (PRD US-008). Runs 2+ must complete within the D-3 baseline; run 1 sets that baseline, so no cap beyond "reasonable" applies to it.

## Cycle anatomy (PRD §5 — 8 steps in order)

### 1. Inventory

Enumerate every rule-defining surface:

- Every `CLAUDE.md` section, by heading
- `.claude/skills/**` (`SKILL.md` files) plus any delegated prompt doc they point to under `docs/`
- `docs/ai/agentic-caucus/*`
- `docs/conventions/*`
- The validator suite — as documented in CLAUDE.md/skills vs. as actually wired (`package.json` scripts, pre-commit hooks)
- `MEMORY.md` entries that encode a rule (not general project/reference memories — only ones that tell a future session what to do or avoid)

Output: a flat list with one row per surface, ready to carry a disposition column through the rest of the cycle.

### 2. Staleness sweep (mechanical)

For every item in the inventory, and every citation inside it:

- Every named MCP tool → does it exist in the live tool list from pre-flight step 1?
- Every cited file path → does it resolve on the filesystem right now?
- Every cited count (validator count, skill count, file count, line count) → does a fresh measurement match?

This is the existing "verify before citing" rule (CLAUDE.md, memory system section) applied reflexively to the rulebook itself. No judgment calls here — a citation either resolves or it doesn't.

### 3. Gate efficacy review (judgment — subagent)

Per CLAUDE.md hard-stop gate: when did it last fire, what did it catch, is it redundant with another gate, is the originating risk still possible. Evidence-based (incident log, red-pen archives, git history), not a rubric score. Runs as a fresh-context subagent — see the Subagent Brief Template below.

### 4. Contradiction sweep (judgment — subagent)

Every skill's write/publish/commit behavior diffed against the three write gates (Content Write Gate, Human-Publishes Rule, Instruction & Rule File Write Gate). Also sweeps for pairwise rule conflicts and the "referenced by name but defined nowhere" class (the failure that motivated this epic — the Human-Publishes Rule was named in 7 files before this cycle, defined in none). Fresh-context subagent, same brief template.

### 5. Housekeeping pass

Runs after the staleness sweep (moves should be informed by which files are still referenced) and re-verifies paths after moving. Scheme (PRD §5 housekeeping table):

| Surface | Practice | Git impact |
|---|---|---|
| `docs/drafts/` (gitignored, local-only) | Executed/dead drafts → `docs/drafts/zArchive/`. Never delete. | None — stays gitignored. |
| `docs/shipped/` | Files older than the D-6 threshold → `docs/shipped/zArchive/YYYY/`. Current-period epics stay flat. | Move-only commit; link fixes in a follow-up commit; re-run path check. |
| `docs/backlog/` | Superseded/abandoned stubs → `docs/backlog/zArchive/` with a one-line header naming what superseded them; strike through the priority-stack row. | Same move-only discipline. |
| ~~`sugartown-backlog-priorities.md` header~~ (file retired 2026-08-05) | Cap the `> Updated...` blockquote at the last 5 entries; older entries move to a `## Changelog` section at the bottom. | Content edit, one-time then maintained per cycle. |
| Git branches | Merged branches pruned locally + remote. Unmerged branches older than 30 days get a disposition: merge / hold with reason / delete. | Branch deletion only after the merged-into-main check (CLAUDE.md §Issue Done = code on main). |

**Hard rules:** `git mv` only, zero content edits in a move commit; link fixes are a separate commit; housekeeping commits never mix with rule-file edits or audit-finding fixes; moves are batched once per cycle, not ad hoc; after the sweep, re-run the path-resolution check — zero broken links is the exit condition.

### 6. Disposition report

One archived Markdown file at `docs/reviews/rules-audit/YYYY-MM.md`, mirroring the red-pen archive pattern (see `docs/reviews/red-pen/*.md` for the shape): a Findings table (one row per inventory item — surface, current state, evidence, proposed disposition), a Decision column filled in after human review, an application log, and a feedback log. Every item gets one of: **keep / simplify / merge / retire / archive**.

### 7. Human review

Any disposition that edits a rule file (CLAUDE.md, a skill, a governance doc under `docs/ai/agentic-caucus/` or `docs/conventions/`) routes through the **Instruction & Rule File Write Gate**: exact diff shown, explicit approval required, before any edit lands. Mechanical staleness fixes batch into one reviewed diff; housekeeping moves batch into one reviewed diff. Unresolved dispositions carry forward as "pending" in the next cycle's report rather than blocking this one.

### 8. KPI capture

Populate the metrics table below from artifacts that already exist — no new logging. Append this cycle's numbers to the corpus-size trend line at the bottom of the disposition report.

| KPI | Measures | Source |
|---|---|---|
| Approvals requested | Human sign-off burden this cycle | Red-pen archives, epic docs, session summaries |
| Gate catches | Incidents caught at a gate vs. incidents that got through | Incident log, red-pen Gate 2 logs |
| Disposition mix | keep / simplify / merge / retire counts | Audit report |
| Corpus size trend | Total lines of CLAUDE.md + governance docs + skill definitions over time | Git history, line counts |
| Staleness findings | Count of stale references found this cycle | Audit report |
| Token spend / cost per finding | Total tokens ÷ actionable findings | Session usage reporting |

If a KPI can't be derived from an existing artifact this cycle, mark it **unmeasurable** with a one-line reason — don't invent a new logging duty to fill the cell.

---

## Subagent brief template (steps 3 and 4)

Every judgment-pass subagent brief must include this contract verbatim:

> You are running a read-only audit pass. You may read any file in the repo. **You may not write, edit, or patch any file** — not CLAUDE.md, not a skill file, not a governance doc, not even a "small" fix. If you find something that should change, describe the change as text in your final report: file, current state, proposed state, why. The orchestrating session (not you) decides whether to act on it, and any rule-file change still requires Bex's explicit sign-off under the Instruction & Rule File Write Gate. Do not create, rename, or move any file. Return your findings as structured text only.

Brief must also state: which slice of the corpus this subagent covers (full corpus on calibration run 1; a rotating segment at steady state per D-2), and the specific evidence sources available to it (incident log location, red-pen archive path, git log commands it may run).

---

## Cadence (PRD §Cadence contract)

- **Calibration phase (now):** first 2–3 runs, manually triggered at end of month, timed to consume remaining monthly plan credits. Run 1 is full-corpus (this is the baseline); later calibration runs may narrow.
- **Steady state:** cadence (D-2) and trigger mechanism (D-4) are open decisions, resolved after calibration using real cost + finding-rate data. Until resolved, runs stay manually triggered.

## Open decisions this runbook does not resolve

D-1 (Linear tracking shape), D-2 (steady-state cadence), D-4 (trigger mechanism), and D-5 (scripting the staleness sweep) all wait on calibration data from run 1 (and, for D-2, run 2). D-3 (token budget) gets its baseline number from run 1's KPI capture. D-6 (shipped-doc archive threshold) is confirmed with Bex before each cycle's housekeeping pass, until a standing default is set. See the PRD's Open Decisions table for full option lists and owners.
