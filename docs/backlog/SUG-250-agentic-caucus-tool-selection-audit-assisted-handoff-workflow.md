---
**Epic:** SUG-250 — Agentic Caucus tool-selection audit & assisted handoff workflow
**Linear Issue:** [SUG-250](https://linear.app/sugartown/issue/SUG-250/agentic-caucus-tool-selection-audit-and-assisted-handoff-workflow)
**Status:** Backlog
**Priority:** ⚪ Later — pre-launch, no urgency
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-250 — Agentic Caucus tool-selection audit & assisted handoff workflow

Audit the published Knowledge Graph node archive to find out which AI agent actually did
which kind of work and how it held up, use that plus outside model-selection research to
replace "Claude for everything" with an evidence-backed recommendation chart, and scope
(design only) a Claude→ChatGPT incident-handoff packet so a second agent can author a node.

## Background

`docs/ai/agentic-caucus/methodology.md` and `agent-cards.md` already document a three-agent
framework — Claude (Architect), ChatGPT (Integrator), Gemini (Strategist) — with roles,
documented failure modes, and a tool-selection heuristic table. Practice has drifted from
that document. A direct query of the live `node` document set (52 published nodes,
`poalmzla`/`production`, run 2026-07-27) shows a clean split at the Feb 2026 Sanity+React
rebuild: every one of the 16 nodes published since then names only Claude/Claude Code as
the tool (`aiTool: "claude"` or the newer `aiDisclosure: "Narrated by Claude..."` field),
with exactly one exception — "The Great Disconnection" (`84d31e26`, 2026-04-05), which
retrospectively narrates a legacy three-agent incident rather than reflecting a live
multi-agent session. Before the rebuild, the WordPress-era archive (36 nodes, Nov
2025–Jan 2026) shows real distribution: Gemini on vision/strategy pieces (market scans,
resume-workflow architecture, "what should this be" framing), ChatGPT on fresh-perspective
and integration pieces (knowledge-graph visualization, the two-repo theme/content split,
the "which chatbot for web design" comparison), Claude on execution/architecture, and
several explicitly "mixed" caucus sessions. The documented methodology still describes
three agents in active rotation; the last five months of shipped work is single-agent.
Bex wants to reintroduce deliberate best-of-breed selection — grounded in Sugartown's own
track record, not just general industry advice like the reference "Which AI Model to Use"
chart — and wants a lightweight way for a second agent (ChatGPT) to pick up a specific
incident and write its own node about it without losing the node format, voice, or
governance requirements documented in `docs/write-node-prompt.md` and
`docs/brand/node-style-guide.md`.

## Objective

After this epic: (1) every published node is classified by which agent did the work, what
category of work it was, and whether the outcome held up (validated/operationalized/
evergreen) or didn't (deprecated-as-failure vs. deprecated-as-superseded — these are not
the same thing and the audit must distinguish them by reading each node's body, not just
its status field); (2) `docs/ai/agentic-caucus/methodology.md`'s Tool Selection Heuristic
and `agent-cards.md`'s "When to use" rows are updated to reflect real, evidence-cited
guidance instead of the current Claude-default in practice; (3) a new handoff-packet
template document exists, defining exactly what a Claude Code session hands to a ChatGPT
session to draft a node about a specific incident — the node style guide excerpts, the
write-node mechanics, and the incident's real facts (commit hashes, timeline, error text,
resolution). This epic touches: Markdown governance docs in `docs/ai/agentic-caucus/`
(gated by the Instruction & Rule File Write Gate), a new standalone template doc, and
read-only Sanity queries against the `node` document set. It explicitly does not touch:
the `node` schema, any Sanity content write, or any code/API integration between Claude
Code and ChatGPT — Phase 2 is a design artifact, not a working handoff mechanism.

## Scope

- [ ] Query and classify all 52 published `node` documents by (a) task category — vision/
      strategy, architecture/execution, fresh-perspective/integration, incident/
      post-mortem, governance/process — and (b) outcome — worked (validated/
      operationalized/evergreen) vs. deprecated-as-failure vs. deprecated-as-superseded,
      determined by reading each node's body/excerpt, not just its `status` field —
      layer: content/data audit
- [ ] Produce a recommendation chart (table, one row per task category → recommended
      agent) citing at least one real Sugartown node as evidence per row, cross-checked
      against `docs/ai/agentic-caucus/failure-modes.md`'s existing documented failure
      modes and against general industry model-selection guidance (the reference chart
      supplied in this epic's invocation) — layer: documentation
- [ ] Update `docs/ai/agentic-caucus/methodology.md` §Tool Selection Heuristic and
      `agent-cards.md`'s per-agent "When to use" / "When not to use" rows with the new
      evidence-backed guidance — layer: governance doc (Instruction & Rule File Write
      Gate fires — exact diff shown, explicit approval required before commit)
- [ ] Add a dated changelog entry to both `methodology.md` and `agent-cards.md` citing
      SUG-250 and the node-audit method as the evidence source — layer: governance doc
- [ ] Design (not build) a Claude→ChatGPT incident-handoff packet template: a new
      standalone doc defining every section the packet contains — excerpted node-format
      rules, excerpted write-node mechanics, and the required incident-specific fields
      (commit hashes, branch name, error text/console output, timeline, root cause,
      resolution, and a matching `FM-ID` from `failure-modes.md` if one applies) —
      layer: documentation / new prompt doc
- [ ] Document the physical hand-off mechanism as manual copy/paste — ChatGPT is "not
      wired into the monorepo" per the existing `agent-cards.md` entry, so no MCP or API
      bridge is in scope — and confirm the packet leaves the draft's `aiDisclosure`
      value unambiguous (e.g. "Drafted with ChatGPT from a Claude Code incident handoff,
      directed by Bex Head") — layer: documentation/governance
- [ ] Record that the handoff packet does not bypass existing write/publish gates — a
      ChatGPT-drafted node still goes through the Content Write Gate and the
      human-publishes rule before it reaches Sanity — layer: governance/process note

## Phases

**Phase 1 — Node-history audit & recommendation chart.** Read and classify all 52 nodes
(task category + outcome), produce the recommendation chart, update `methodology.md` and
`agent-cards.md` (Instruction & Rule File Write Gate diff + approval), changelog both
files.

**Phase 2 — Assisted handoff workflow scope.** Design the incident-handoff packet
template as a new doc, document the manual hand-off mechanism and the disclosure/gate
implications. No code, schema, or integration work.

Both phases accumulate on one branch per the single-close-out merge strategy; nothing
merges to `main` until both are complete and Bex has approved the governance-doc diffs.

## Acceptance criteria

- [ ] All 52 published node documents appear in the classification table — no sampling —
      each row naming the node, its recorded agent (`aiTool`/`aiDisclosure`/`tools[]`),
      task category, and outcome
- [ ] The recommendation chart names specific task categories mapped to specific agents,
      each row citing at least one real node slug as evidence, not analogy alone
- [ ] `methodology.md`'s Tool Selection Heuristic table and `agent-cards.md`'s "When to
      use"/"When not to use" fields reflect the new guidance, with the exact diff shown
      to Bex and explicit approval received before commit (Instruction & Rule File Write
      Gate)
- [ ] A new handoff-packet template doc exists, listing every required incident-fact
      field and every excerpted/linked style-guide section, with no code or MCP wiring
      implied anywhere in the doc
- [ ] Both `methodology.md` and `agent-cards.md` changelogs record SUG-250 as the update
      source, dated

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, layout token, or multi-page component changes. This epic
is Markdown-only (governance docs + one new template doc) plus read-only Sanity queries.

## Technical notes

- **Content Write Gate:** Not triggered — this epic makes no Sanity content writes. It
  only reads existing `node` documents (read-only `query_documents` calls) and edits
  local Markdown files.
- **Instruction & Rule File Write Gate:** Fires. `docs/ai/agentic-caucus/methodology.md`
  and `docs/ai/agentic-caucus/agent-cards.md` are named explicitly in CLAUDE.md's gate
  scope. Every edit to either file in Phase 1 must be shown as an exact diff with
  explicit approval before commit — no exception for "obviously correct" additions.
- **Schema changes:** None. The `node` schema's existing `aiTool` (deprecated but still
  read for legacy nodes), `aiDisclosure`, and `tools[]` fields are sufficient for both
  the audit and the handoff packet's disclosure needs.
- **Upstream dependencies:** None blocking. SUG-198/SUG-199 (six-layer AI governance gap
  analysis, shipped) and SUG-244/SUG-245 (GovernancePage diagram + accuracy pass, shipped)
  are the documents' direct ancestors but are not in-flight, so nothing gates activation.
- **Activation audits:**
  - Re-run `*[_type == "node"]{_id, title, status, aiTool, aiDisclosure, "toolNames":
    tools[]->name, "categoryNames": categories[]->name, excerpt}` against
    `poalmzla`/`production` before classifying — the 52-node snapshot captured during
    epic authoring (2026-07-27) is not guaranteed current at activation; re-verify the
    count and re-pull any node published since.
  - Read the full body (`sections[]`, or legacy `content[]` for pre-rebuild nodes) of
    every node classified as "incident/post-mortem" to confirm the failure maps to an
    existing `FM-ID` in `failure-modes.md`, or flag it explicitly as a new, unrecorded
    pattern rather than silently omitting it.
  - Read `docs/briefs/ai-ethics-and-operations.md` Principles 6, 7, 11, and 13 before
    drafting the handoff-packet doc — the packet is disclosure-relevant, since a
    ChatGPT-authored node needs an accurate, non-default `aiDisclosure` string.

## Model & Mode [REQUIRED]

`/model opus` + plan mode. This is high-ambiguity synthesis work: subjectively classifying
52 nodes' real-world outcomes (distinguishing "superseded by later work" from "the
approach itself failed" requires reading and judging each body, not pattern-matching a
status enum), and designing a new cross-agent workflow from scratch. Both governance-file
edits are gated by an explicit human-approval step regardless of model, but Opus handles
the interpretive judgment across 52 read passes more reliably than Sonnet's default
execution mode, and plan mode gives Bex the Pre-Execution Gate checkpoint before any doc
edit begins.

## Non-Goals

- No actual integration or wiring between Claude Code and ChatGPT (no API call, no MCP
  bridge, no automated hand-off). Phase 2 produces a design/template artifact only, per
  the epic's own framing ("scope out").
- No decision, as a side effect of this epic, to actually start delegating specific future
  work to ChatGPT or Gemini. The recommendation chart is a proposal Bex can act on later;
  approving the chart's existence is not the same as approving a specific delegation.
- No changes to the `node` Sanity schema. The existing `aiTool`, `aiDisclosure`, and
  `tools[]` fields already cover both the audit's read needs and the handoff packet's
  disclosure needs.
- No retroactive re-classification or editing of the 52 existing published nodes. The
  audit reads and tabulates; it does not correct old `aiTool` values, backfill
  `aiDisclosure` on legacy nodes, or edit node content.
- No changes to `docs/ai/agentic-caucus/risk-tiers.md`, `governance-coverage.md`,
  `incident-log.md`, or `data-handling.md`. Only `methodology.md` and `agent-cards.md` are
  in scope for the Phase 1 update; a new standalone doc carries the Phase 2 packet design.

## Related

- **Linear:** [SUG-250](https://linear.app/sugartown/issue/SUG-250/agentic-caucus-tool-selection-audit-and-assisted-handoff-workflow)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer
  Checklist, Schema Enum Audit, and Files to Modify at activation time
- **Governance docs updated:** `docs/ai/agentic-caucus/methodology.md`,
  `docs/ai/agentic-caucus/agent-cards.md`
- **Governance docs read but not edited:** `docs/ai/agentic-caucus/failure-modes.md`,
  `docs/ai/agentic-caucus/risk-tiers.md`, `docs/ai/agentic-caucus/governance-coverage.md`
- **Node authoring references:** `docs/write-node-prompt.md`, `docs/brand/node-style-guide.md`
- **Prior related epics (shipped):** SUG-198, SUG-199, SUG-244, SUG-245
