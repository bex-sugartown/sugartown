# Archive — governance/verification-review layer (SUG-284)

**Decommissioned:** 2026-08-13, by [SUG-284](https://linear.app/sugartown/issue/SUG-284/unwind-the-governanceverification-review-layer-waves-2-3-since-2026-07)
**Epic doc:** `docs/backlog/SUG-284-unwind-governance-layer.md`
**Full plan + evidence:** `docs/drafts/governance-layer-unwind-plan.md` (local-only — if it's gone, this README and the epic doc are the surviving record)

## What this was

Between 2026-06-25 and 2026-08-13, a self-referential governance/audit apparatus grew on top of
the repo's normal engineering conventions: a gate taxonomy, a rule register, a doc-budget word
cap, a "verification review required before building any gate" rule, a generated governance data
layer (`governance/` → `governance.json`, which had zero consumers anywhere in the app), and a
Tier 1/2/3 gate-posture register. `docs/ai/agentic-caucus/` alone reached 18,743 words — more
than CLAUDE.md itself.

## Why it was removed

Bex's call, 2026-08-13: the apparatus had outgrown its value — measuring and auditing the gates
had become a larger and more demanding practice than the gates themselves. See the full plan doc
for the timeline evidence and every locked scope decision.

## What survived, deliberately

- `docs/ai/agentic-caucus/incident-log.md`, `methodology.md`, `failure-modes.md`, `risk-tiers.md`,
  `agent-cards.md`, `data-handling.md` — kept in place as inert reference, nothing gates on them
- The Tier 1/2/3 taxonomy in `docs/conventions/human-gate-conventions.md` — real gates (Content
  Write Gate, Human-Publishes Rule) depend on it for their approval mechanism
- The Instruction & Rule File Write Gate in CLAUDE.md — kept deliberately, unrelated to the
  audit/measurement bloat being removed
- Content Write Gate, Human-Publishes Rule (SUG-90 lineage), Phase 0/VQA/Chromatic gates (Pink
  Moon lineage), token/CSS/URL rules, `packages/mcp-server/src/tools/governance.ts` (real MCP
  tools despite the name) — all confirmed separate lineage, never in scope

## What's here

Mirrors original repo paths. `git log --follow` on any file here shows its full history,
including everything that happened before it was moved.

- `docs/ai/agentic-caucus/` — `control-register.md`, `rule-register.md`, `governance-coverage.md`
- `docs/conventions/verification-review.md`
- `docs/backlog/` — the 8 superseded epic docs (SUG-243, 255, 256, 262, 268, 276, 281, 282) plus
  the AOP-2/3/4/5 proposal docs (never implemented, never tracked in Linear)
- `scripts/` — `governance-build.js`, `validate-governance.js`, `validate-governance-diff.js`,
  `validate-governance-tally.js`, `validate-control-register.js`, `validate-doc-budget.js`,
  `validate-enforcement-liveness.js`, `validate-epic-docs.js`, `mttn.js`, `validate-validators.js`
- `governance/` — schema + source (8 files)
- `claude-agents/verification-reviewer.md`
- `apps-web/GovernanceDraftPage.jsx`
- `generated/governance.json`
- `CLAUDE-md-removed-sections.md` — verbatim text of every CLAUDE.md section removed

**Not archived as files** (config lines, not standalone files — see the commit diffs that
removed them for exact before/after):
- 6 CI steps removed from `.github/workflows/ci.yml`
- WARN-GATE logic removed from `.github/workflows/ci-failure-alert.yml`
- 3 steps removed from `.husky/pre-commit`
- 8 script entries removed from `package.json`
- The `/platform/governance-draft` route, `robots.txt` line, and `netlify.toml` header block

## How to resurrect something from here

1. `git mv zArchive/2026-08-sug284-governance-layer/<path> <original-path>`
2. Check the commit(s) tagged in SUG-284 for the exact CI/pre-commit/package.json lines that
   need restoring alongside it — the file alone won't be wired back in.
3. Re-read the file's own `git log` — it may reference other removed pieces that also need
   restoring for it to function.
