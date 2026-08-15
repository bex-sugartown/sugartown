---
**Epic:** SUG-237 — Node: The Witness Who Was Never in the Room — context transfer across the agentic caucus
**Linear Issue:** [SUG-237](https://linear.app/sugartown/issue/sug-237)
**Status:** Backlog
**Priority:** 🔵 Low
**Labels:** Clicky burden, Content
**Merge strategy:** (a) Merge-as-you-go
---

# SUG-237 — Node: The Witness Who Was Never in the Room — context transfer across the agentic caucus

> **Backlog doc created 2026-08-15**, backfilled during migration Phase 2. This issue was open
> in Linear with no `docs/backlog/` doc — one of nine found by the first parity audit since
> `validate:epic-docs` was archived by SUG-284. The Background below is the Linear description
> verbatim; it was already substantive, so it is preserved rather than paraphrased.

## Background

Knowledge graph node drafted in Sanity, awaiting human review + publish.

**Draft:** `drafts.983c29c6-b196-48d5-919e-1c87c2c3051c`
**Slug:** `/knowledge-graph/witness-never-in-the-room-context-transfer`
**Status:** `exploring` · **aiDisclosure:** "Narrated by Claude, directed by Bex Head."

## Thesis

**CONTEXT IS EVERYTHING.** An agent's ceiling is its context, not its reasoning.

## The occasion

A workflow gap analysis + future-state diagram + six-epic sprint brief was produced on [claude.ai](<http://claude.ai>) from pasted repo documentation, with no filesystem access. Claude Code verified it against the actual repo. Three of six premises were false:

| Premise | Reality |
| -- | -- |
| No a11y addon installed | `@storybook/addon-a11y@^10.3.4` installed and registered in `.storybook/main.ts`; CI gate already scoped as [SUG-161](https://linear.app/sugartown/issue/SUG-161/storybook-testing-infrastructure-interaction-tests-a11y-ci-gate-vitest) Phase 2 |
| `stats.json` may be seeded → feedback loop epic blocked | `stats.yml` runs daily, collects LHCI/CrUX/GitHub/Sanity/Linear, fails its own job on stale collectors. The most valuable epic was cancelled by a guess |
| No second reader on the diff | `.claude/agents/design-reviewer.md` exists — fresh context, read-only, six dimensions. Never invoked: CLAUDE.md doesn't mention it once in 797 lines |

The finding neither prior pass could reach: **three shipped validators run nowhere.** `validate:css-names` (built by [SUG-124](https://linear.app/sugartown/issue/SUG-124/semantic-naming-audit-css-classes-alpha-row-list-pattern-reuse) to enforce a rule CLAUDE.md calls *blocking*, drove 25 violations to zero), `validate:taxonomy`, and `validate:tokens:sync` appear in no hook and no job. Unreachable by reasoning, because the documentation is the thing that's wrong — only `.husky/pre-commit` and `.github/workflows/ci.yml` disagree, and neither is prose.

## VoPM position

Even inside one project, Claude / Cowork / Claude Code are almost entirely separate context universes. This is a major gap across the agentic caucus, not a Sugartown problem. **If you've entered it or executed it in one tool, it should transfer to the ecosystem.**

The node proposes a three-tier model of what should be ambient vs hand-carried:

| Tier | What it is | Transfers today? |
| -- | -- | -- |
| Ambient | Machine-readable system truth: what's installed, what CI runs, what hooks fire, what's in git | No — you paste it or it's invisible |
| Earned | This session's own reasoning: decisions, dead ends, verifications | No — dies with the transcript |
| Authored | CLAUDE.md, conventions, memory files | Yes — because a human maintains and carries it |

The inversion: the only tier that moves reliably is the one costing a person continuous effort. The mechanically-derivable tier, where being wrong looks identical to being right, doesn't move at all.

## Source material

* `docs/drafts/workflow-audit-v0.3-grounded.md` — full corrected audit, 4 prioritized gaps, 6 simplifications, vspec recommendation
* `docs/drafts/sugartown-workflow-future-state-v3.html` — corrected future-state diagram

## Next

- [ ] Human review of the node draft (register, theme discipline, accuracy)
- [ ] Publish decision — agent stops at draft per the Human-Publishes Rule
- [ ] Consider a companion article in Bex's PM voice: the tool-fragmentation argument for a non-technical reader

Related published content: *The Agentic Caucus* (article), *We Fixed the Same White Screen Three Times* (node — same failure across sessions rather than across tools).

## Scope

Scope is carried in the Background above, which came over from Linear complete. Before
executing, confirm it still holds — several of these were written between 2026-07-23 and
2026-08-09 and the platform has moved since (SUG-284 removed the governance layer; v0.33.0
shipped 2026-08-15).

## Related

- **Linear:** [SUG-237](https://linear.app/sugartown/issue/sug-237)
- Backfilled by the Phase 2 parity audit — `docs/briefs/linear-to-github-migration-plan.md` §5.1
