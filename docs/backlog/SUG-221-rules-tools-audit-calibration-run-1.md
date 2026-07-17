---
**Epic:** SUG-221 — Rules & Tools Audit — process establishment + calibration run 1
**Linear Issue:** [SUG-221](https://linear.app/sugartown/issue/SUG-221/rules-and-tools-audit-process-establishment-calibration-run-1)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-221 — Rules & Tools Audit — process establishment + calibration run 1

Stand up the scheduled governance audit defined in `docs/briefs/rules-tools-audit-prd.md` and execute its first calibration run: inventory every rule-defining surface, mechanically verify staleness, review gate efficacy, sweep for skill-vs-rule contradictions, run the housekeeping pass, and report keep/simplify/merge/retire/archive dispositions with burden-vs-benefit KPIs and a token budget baseline.

## Background

Sugartown's AI operating rules accumulate by incident and nothing prunes them. The 2026-07-16 session demonstrated all three live failure classes in one evening: CLAUDE.md cited MCP tool names that no longer exist, a shippable skill (`/glossy`) directly contradicted the Human-Publishes Rule by auto-publishing after Gate 1 approval, and that rule itself was referenced by name in 7 files while being defined in none. The corrective work from that session (three new/clarified gates in CLAUDE.md) is exactly the accumulation pattern this audit exists to counterbalance: rules only ever get added, never reviewed for retirement, merger, or simplification. Full rationale, audit anatomy, KPI set, housekeeping scheme, and open decisions live in the PRD; this epic implements it.

Reference surfaces: `CLAUDE.md` (all hard-stop gates), `.claude/skills/**` plus their delegated `docs/*-prompt.md` files, `docs/ai/agentic-caucus/*`, `docs/conventions/*`, the validator suite, `docs/drafts/` (local), `docs/shipped/`, `docs/backlog/`, and `docs/backlog/sugartown-backlog-priorities.md`.

## Objective

After this epic: a written audit runbook exists at `docs/workflows/rules-tools-audit-runbook.md`, calibration run 1 has been executed end to end against the full corpus, its disposition report and KPI baseline are archived at `docs/reviews/rules-audit/2026-07.md`, every rule change it produced went through the Instruction & Rule File Write Gate with logged approval, the housekeeping scheme's archive folders exist and have received their first sweep, and open decisions D-3 (token budget) has a baseline number while D-2 (steady-state cadence) and D-1 (Linear tracking shape) have the calibration data they need. Layers touched: documentation, repo housekeeping (file moves), and process. Explicitly not touched: application code, Sanity content, Sanity schema.

## Scope

- [ ] **Write the audit runbook** — layer: documentation. One doc capturing the 8-step cycle anatomy from the PRD (inventory → staleness sweep → gate efficacy → contradiction sweep → housekeeping → disposition report → human review → KPI capture) as an executable checklist, including the subagent brief template with the no-rule-file-writes contract.
- [ ] **Run 1: inventory + mechanical staleness sweep** — layer: audit. Enumerate every rule-defining surface; verify every named MCP tool against the live tool list, every file path against the filesystem, every count against a fresh measurement. Full corpus (this is the baseline run).
- [ ] **Run 1: gate efficacy + contradiction sweep** — layer: audit. Fresh-context subagent(s), forbidden from writing rule files, returning proposed changes as report text. Every CLAUDE.md hard-stop gate gets an efficacy note with evidence; every skill's write/publish/commit behavior is diffed against the three write gates.
- [ ] **Run 1: housekeeping pass** — layer: repo housekeeping. Create `docs/drafts/zArchive/`, `docs/shipped/zArchive/`, `docs/backlog/zArchive/`; execute the first sweep per the PRD scheme (D-6 threshold decided by Bex before this bullet runs); cap the priority-stack header at 5 entries with older history moved to a Changelog section; prune merged branches. Move-only commits, link fixes separate, path check as exit condition.
- [ ] **Run 1: disposition report + KPI baseline** — layer: documentation. Archive to `docs/reviews/rules-audit/2026-07.md` with the findings table, Decision column, and all six KPIs populated (or marked unmeasurable with a reason). Record total token spend as the D-3 baseline.
- [ ] **Apply approved dispositions** — layer: documentation. Rule-file changes route through the Instruction & Rule File Write Gate individually; mechanical fixes and housekeeping moves batch into one reviewed diff each.

## Phases

**Phase 1 — Runbook + mechanical passes.** Write the runbook, execute inventory and staleness sweep, present findings. Ships independently: even if run 1 stalls, the runbook and the staleness findings have standalone value.

**Phase 2 — Judgment passes.** Gate efficacy and contradiction sweeps via subagents. Ends with the disposition report presented for Bex's row-level review (red-pen Gate 1/Gate 2 pattern).

**Phase 3 — Housekeeping + close-out.** D-6 decision, archive sweep, priority-stack header cap, branch pruning, KPI capture, report archived. Epic closes with D-2/D-1 flagged for resolution after run 2.

## Acceptance criteria

- [ ] Runbook exists and calibration run 2 could be executed from it by a fresh session without this epic's context
- [ ] 100% of CLAUDE.md hard-stop gates and 100% of skills have a disposition row with evidence in `docs/reviews/rules-audit/2026-07.md`
- [ ] Every stale reference found is either fixed (verified by re-check) or carried as an explicit pending row — none silently dropped
- [ ] Zero broken inbound links after the housekeeping sweep (path check passes); no file was deleted rather than archived
- [ ] Every rule-file change went through the Instruction & Rule File Write Gate with a logged approval
- [ ] All six KPIs populated or explicitly marked unmeasurable with a reason; token spend recorded as the D-3 baseline
- [ ] Retire + merge + simplify count is greater than zero, or the report carries an explicit justification for why everything stayed

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. This epic touches documentation, repo structure, and process only; verification is via the path-resolution check and the archived report, not rendered pages.

## Technical notes

- **Content Write Gate**: does not fire — no Sanity writes anywhere in scope.
- **Instruction & Rule File Write Gate**: fires constantly and by design — every disposition that edits CLAUDE.md, a skill, or a governance doc shows Bex the exact diff and waits for approval. Subagent briefs must include the return-proposals-as-text contract verbatim.
- **SUG-197 boundary**: SUG-197 (blocked by SUG-196) owns the one-time docs IA restructure — the `docs/epics/` rename and the orphaned root-level prompt files' disposition. This epic's housekeeping pass operates within whatever structure is current at run time and must not rename folders SUG-197 owns. If SUG-197 has not run, the orphaned prompt files get an inventory row noting "disposition owned by SUG-197," not a move. If both epics end up active simultaneously, sequence SUG-197's moves first.
- **SUG-210 boundary**: SUG-210 (content pipeline rules consolidation) owns deduplicating the write-skill prompt docs. The contradiction sweep will read those files and may generate findings for SUG-210's backlog, but consolidation work stays there.
- **Credits pre-check**: before Phase 2's subagent-heavy passes, Bex checks remaining plan credits in the Claude app (Settings → Usage) and sizes the run; the agent cannot query this. Skipping the check does not block — a conservative default applies.
- **Activation audits** (do these before writing anything):
  1. Re-read `docs/briefs/rules-tools-audit-prd.md` in full — it is the spec; this stub is the pointer.
  2. Confirm D-6 (shipped-doc archive threshold) with Bex before the housekeeping bullet; it is the one open decision that blocks a Phase 3 step.
  3. Check SUG-196/SUG-197 status in Linear — if the IA restructure landed since this stub was written, the housekeeping pass targets the new paths.
  4. Pull the live MCP tool list at run time (the session's own tool surface) as the staleness sweep's source of truth — never a remembered list.
- **Model & Mode [REQUIRED]:** `/model sonnet` — documentation, mechanical verification, and file-move work; the judgment passes get their depth from fresh-context subagents and the human review loop, not from a bigger main-loop model. No plan-mode handoff.

## Model & Mode [REQUIRED]

`/model sonnet` — see Technical notes above.

## Non-Goals

- No new per-session logging duties (KPIs derive from existing artifacts only — hard rule from the PRD).
- No auto-applied retirements; the audit proposes, Bex disposes.
- No application-code or validator-code changes this epic (a `validate:rules` script is D-5, deferred until two cycles show which checks are stable).
- No scheduled/cron trigger yet — that is post-calibration (D-4).
- No folder renames owned by SUG-197, and no prompt-doc consolidation owned by SUG-210.
- No MEMORY.md content-quality audit beyond entries that encode rules.

## Related

- **Linear:** [SUG-221](https://linear.app/sugartown/issue/SUG-221/rules-and-tools-audit-process-establishment-calibration-run-1)
- **PRD (the spec):** `docs/briefs/rules-tools-audit-prd.md`
- **Origin session record:** `docs/reviews/red-pen/2026-07-16-sugartown-platform-is-the-portfolio.md` and `-rereview.md` — the incident trail (stale tool names, /glossy contradiction, undefined publish rule, subagent scope creep) that motivated the PRD
- **Composes with:** SUG-197 (docs IA restructure — owns folder renames), SUG-210 (content pipeline rules consolidation — owns prompt-doc dedupe)
- **Epic template:** `docs/epic-template.md`
