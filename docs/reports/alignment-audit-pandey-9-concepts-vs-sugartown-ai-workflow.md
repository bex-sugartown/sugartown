# Alignment Audit: "9 AI Concepts That Put You Ahead of 99% in 2026" vs. Sugartown AI Workflow

**Date:** 2026-09-20
**Standard source:** Brij Kishore Pandey (@brijpandeyji), LinkedIn infographic, 2026 edition
**Repo state audited:** `main` @ `0c50c4ed` (2026-09-19, v0.36.0)
**Scope reviewed:** `CLAUDE.md`, `.claude/` (agents, rules, skills, settings), `docs/ai/`, `packages/mcp-server/`, CI workflows, `docs/reports/evidence-digest.md`, `docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md`, prior audit `alignment-audit-maven-ai-pm-vs-sugartown-ai-workflow.md`
**Companion:** Maven audit (2026-07-01) reached the same framing conclusion for a different standard.

## Framing

The infographic describes a stack for shipping LLM features to end users. Sugartown ships no inference at request time; AI is the build tool, not the product. Two of nine concepts (AI Gateway, user-facing Guardrails) are therefore N/A by design, consistent with the position already recorded in the retired `governance-coverage.md`. The remaining seven map onto the Claude Code harness and are scored below.

## Scale

0 absent · 1 ad hoc · 2 documented, human-run · 3 enforced or automated · 4 measured, with a kill or review criterion

## Matrix

| # | Concept (infographic) | Sugartown equivalent | Evidence | Now | Planned / in flight | Future state to investigate |
|---|---|---|---|---|---|---|
| 01 | Agentic loops (plan, act, observe, reflect) | Epic lifecycle: ORIENT-0, Pre-Execution Gate, phases, close-out, `/post-mortem`, `feedback-loop.md`, monthly evidence digest | `docs/epic-template.md`, `.claude/commands/post-mortem.md`, `docs/reports/evidence-digest.md`, build-back plan with kill criteria in 2026-08-15 post-mortem | 4 | Liveness probes on a 60-day trial (chosen 2026-08-21) | None. The reflect step already produces rules; the risk is rule accretion, addressed under 05 |
| 02 | MCP (one interface, many tools) | Consumer: Sanity, Figma, Netlify, Chromatic. Producer: `@sugartown/mcp-server`, 8 read-only tools | `packages/mcp-server/README.md`, `CLAUDE.md` §MCP Tool Aliases | 4 | `sugartown_get_gate_status` deferred to v2 | Measure whether `sugartown_get_rule` lets prose leave `CLAUDE.md`. If rule lookups do not shrink the file, v2 is not earning its slot |
| 03 | Subagents, isolated context, merged output | `design-reviewer` (Haiku, read-only, fresh context, evidence only); Explore / Plan / Workflow in use | `.claude/agents/design-reviewer.md`, `docs/conventions/vqa-workflow.md` | 3 | None found | One reviewer exists for visual work. Content writes (Content Write Gate) and governance-doc edits are still self-policed by the executing session. Add a second reviewer only if the incident log shows a content or docs incident class |
| 04 | AI Gateway (auth, routing, rate limit, cache, logs) | None. No runtime inference | `autoMode.environment` in `.claude/settings.json` lists no model endpoints | N/A | None | Becomes real the day any AI feature ships to visitors. Not before |
| 05 | Inference economics (tokens, caching, model choice) | Policy exists: Sonnet default, Opus escalation rule, Haiku reviewer, deploy-credit batching via `/eod`. Nothing is measured | `docs/epic-template.md` §Model & Mode; `CLAUDE.md` = 598 lines / 7,614 words loaded every session | 2 | None found | One number, one place: tokens or cost per epic added to the evidence digest. `CLAUDE.md` word count published alongside it. No cap, no register (the doc-budget cap was tried and killed) |
| 06 | Evals (test cases, judge, rubric, metrics) | Deterministic: 9 validators, lint, typecheck, Playwright smoke, Chromatic, LHCI in CI. Rubric judge: `design-reviewer`. Meta-eval: `validate:liveness-probes` proves each gate fails on bad input | `.github/workflows/ci.yml`, `scripts/validate-liveness-probes.js` | 4 | Liveness-probe trial ends ~2026-10-20: "did it catch anything a human would not have?" | Answer that question in writing on the date. Two noes end the rebuild per the post-mortem |
| 07 | Guardrails (input / output filters) | Agent-action guardrails: risk tiers A to D, Content Write Gate, human-publishes rule, `soft_deny` on push-to-main and `publish_documents`, `perspective: 'published'`, pre-commit validators | `docs/ai/agentic-caucus/risk-tiers.md`, `.claude/settings.json`, `apps/web/src/lib/contentState.js` | 3 | None found | `main` has no branch protection or ruleset (recorded in your own settings recon). Every guardrail on push is agent-side prose. A GitHub ruleset requiring CI green on `main`, bypassable by you, is the one platform-side backstop missing |
| 08 | Observability (traces, logs, metrics, feedback) | Evidence digest, KPI dashboard, stats pipeline, `ci-failure-alert.yml`, incident log, post-mortems | `docs/reports/`, `docs/ai/agentic-caucus/incident-log.md` | 3 | MTTN and the rule register explicitly not rebuilt | Nothing new. The incident log is the trace. Add the 05 cost line and stop |
| 09 | Agent harness (planner, memory, tools, state, guardrails, evals) | All six present: epic template + Plan agent; `CLAUDE.md` + `.claude/rules/` + MEMORY.md + `/morning`; MCP server + validators + skills; git + evidence digest + GitHub issues; tiers + gates + `soft_deny`; validators + probes + reviewer | This audit | 4 | Ongoing | Hygiene residue from the SUG-284 unwind (below) |

**Score: 27 / 32 across the seven applicable concepts.** [Likely] on the number; the cells carry the information.

## Residue found (unwind leftovers)

1. `.claude/settings.json` permission allowlist grants seven `pnpm validate:*` commands that no longer exist in any `package.json`: `doc-budget`, `enforcement-liveness`, `controls`, `epic-docs`, `validators`, `governance`, `governance-diff`.
2. `docs/ai/agentic-caucus/governance-coverage.md` does not exist but is linked from `failure-modes.md`, `risk-tiers.md`, `incident-log.md` (4 refs) and `agent-cards.md` (3 refs).
3. The synced project copy of `CLAUDE.md` (June) predates the `.claude/rules/` split and Linear retirement; the live file is the only authoritative one.

## Recommendations, ordered

1. Branch ruleset on `main`: require `ci.yml` status checks, allow bypass for the repo owner. Platform-side, zero prose, zero decay. (07)
2. Clean the residue in one commit: remove the seven ghost permissions, and either restore `governance-coverage.md` as a one-paragraph stub or remove the eight links. (09)
3. Add one cost line to `scripts/monthly-evidence-digest.js`: tokens or dollars per epic for the month, plus `CLAUDE.md` word count. Source it from Claude Code usage export or `/cost` at epic close-out. No threshold, no register. (05)
4. Calendar the liveness-probe verdict for the week of 2026-10-20 and write the yes/no. (06)

## What not to build

AI Gateway, eval harness for a product feature, a second governance register, a doc-budget cap, MTTN. The August post-mortem already paid for these lessons.

## Addendum, 2026-09-21: backlog check and issues filed

**Backlog check.** All open issues were read by title (`gh issue list --state open --limit 200`), and #63, #81, #88, #96 and #97 by body as the nearest candidates. None covers any of the four recommendations, so nothing existing was updated. All four were filed new, `Priority: Medium`, `Status: Backlog`.

| Rec | Issue | Kind |
|---|---|---|
| 1. Ruleset on `main` | [#131](https://github.com/bex-sugartown/sugartown/issues/131) | tool, blocking |
| 2. Unwind residue | [#133](https://github.com/bex-sugartown/sugartown/issues/133) | chore |
| 3. Cost line in the evidence digest | [#132](https://github.com/bex-sugartown/sugartown/issues/132) | tool, advisory |
| 4. Liveness-probe verdict, 2026-10-20 | [#134](https://github.com/bex-sugartown/sugartown/issues/134) | chore, dated |

### Corrections and new information

1. **Residue item 2 undercounted.** `grep -rc governance-coverage docs/ai/agentic-caucus/` finds five files, not four: `failure-modes.md` 1, `risk-tiers.md` 2, `agent-cards.md` 3, `incident-log.md` 4, `data-handling.md` 4 (matching lines). The audit missed `data-handling.md`. #133 carries the corrected list and recommends removing the links over restoring a stub, since a stub would be a doc with no reader.
2. **Recommendation 1 is weaker than it reads.** Every push to `main` is a direct push, so a required `ci.yml` check rejects any new commit and `/ship` would use the owner bypass every time. Sessions push with Bex's credentials, so that bypass covers the agent too. The stats bot pushes a skip-ci commit to `main` (`.github/workflows/stats.yml:103`) that never gets a CI run, so it would be blocked unless also bypassed. #131 recommends the smaller rule that holds with no bypass list: block force-push and deletion of `main`. The choice is made at #131's start review.
3. **Recommendation 3 has a likely data source.** The digest runs locally by hand (`pnpm collect:evidence-digest`), so it can read the session transcripts under `~/.claude/projects/` instead of relying on `/cost` typed at each close-out. Unverified that those files hold per-message token counts in a stable shape; #132 checks that first and reports "unavailable" if not. Scoped per month, not per epic.
4. **Recommendation 4 was recorded but nothing prompted it.** `docs/shipped/ST-95-liveness-probes-only.md` holds the date and the question, and #95 is closed, so nothing fires on 2026-10-20. #134 is the prompt. A "no" also decides #96 and #97, both blocked on #95's verdict.
5. **Re-measured unchanged:** no ruleset and no branch protection on `main` (`gh api repos/bex-sugartown/sugartown/rulesets` returns `[]`); `CLAUDE.md` is 598 lines, 7,614 words (`wc -lw`); all seven ghost permissions are in `.claude/settings.json` and in no `package.json`.

### Not filed, with reasons

- **Concept 02, measure whether `sugartown_get_rule` shrinks `CLAUDE.md`.** No issue. #132 publishes the `CLAUDE.md` word count monthly, which is the measurement. Revisit if the count has not fallen after three digests.
- **Concept 03, a second reviewer subagent.** No issue. The audit makes it conditional on a content or docs incident pattern in the incident log, and none is on record.
- **Concept 04, AI Gateway.** N/A until an AI feature ships to visitors.

### Next steps

1. #133 first: one commit, no decision needed beyond the diff approval.
2. #131: pick option A, B or C at the start review, then apply. Applying a ruleset is a repository settings change, so Bex approves it.
3. #132 before the next monthly digest, so the first cost line lands with it.
4. #134 not before 2026-10-20.
