---
**Epic:** SUG-259 — Node: The Fire Alarm Was Wired to Nothing (working title)
**Linear Issue:** [SUG-259](https://linear.app/sugartown/issue/SUG-259/node-the-fire-alarm-was-wired-to-nothing-working-title)
**Status:** In Progress — Sanity draft created 2026-09-05, awaiting human review and the publish decision
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — draft, review, publish as one unit
---

# SUG-259 — Node: The Fire Alarm Was Wired to Nothing

A single Knowledge Graph node (`/nodes`) covering the 2026-07-25→27 post-mortem: CI had
not passed once on `main` in 100+ runs across ~3 months, and five separate governance
mechanisms were found declared-but-not-firing — including the meta-check built
specifically to prevent that.

**Content precedent for this stub:** article/node issues have inconsistent doc precedent
in this repo (SUG-213, 223, 200 have docs; SUG-233, 234, 237 do not). Resolving in favor
of "yes, give it one" here — SUG-262 Phase 1 named this issue explicitly for backfill,
and the existing precedent leans toward having one more often than not.

## Background

**Status: outline v3.** No Sanity draft, no Studio entry yet. Full outline lives at
`docs/drafts/node-outline-the-fire-alarm.md` (local-only, gitignored per repo convention
for drafts — do not expect it in a fresh clone).

Decisions already taken (see the drafts outline for full reasoning):

- One node, not two — the public "0 gaps" claim gives the CI failure its stakes
- Publish the "0 gaps" material, duration stated plainly: false for its **entire
  27-day life** (published `50598f8c` 2026-06-30, 51 days after CI went red
  2026-05-10; removed `52a86dbb` 2026-07-27), revised three times, never corrected
- Spine: "developing in a void" + "learning a new technology" — the six gatekeeper
  roles become evidence for the argument, not the argument itself
- Controlling metaphor: fire safety system, deployed at the beats only

**Also surfaced, needs its own decision:** ~~`CLAUDE.md:723` cites a node — *"The
Validator Said Zero Errors. It Was Watching the Wrong Door."* — that does not exist in
published content or drafts (14 nodes, none of them it). A live false reference in a
file every session loads.~~ **Resolved 2026-08-15:** SUG-284's CLAUDE.md edits removed
the citation. `grep -rn "wrong door" CLAUDE.md docs/conventions/ .claude/` returns 0
hits. Whether the node itself gets written is still open; the false reference is gone.

## Objective

A published Knowledge Graph node at `/nodes/{slug}` covering the CI-red incident and
the "0 gaps" claim, agent-narrated per the node voice convention, taxonomy-wired, that
passes the compliance gate and is reviewed before publish.

## Scope

- [x] Outline of facts
- [x] Theme + spine selected
- [x] Open questions resolved — SUG-245 named directly (public repo, checkable, the sharpest beat); status `exploring`; series left unset because Part 2 has no issue and no `series` document exists; no diagram in this draft (needs committed source and claim table first). Reversible at review — layer: editorial
- [x] Discovery run 2026-09-05 — categories Governance + AI; tags Post Mortem, AI Hallucinations, AI Limitations, agentic caucus, release management, Audit; tools Claude Code, GitHub, Netlify, Turborepo, Storybook (no `Chromatic` tool document exists; not created); project Sugartown CMS; related: Post-Mortems as System Upgrades, Release Governance: Storybook Smoke Check, Show Me the Computed Values — layer: content
- [x] Draft created in Sanity 2026-09-05 — `drafts.1ae1eb70-4c13-48ed-84bd-1c15e0efb8df`, slug `the-fire-alarm-was-wired-to-nothing`, 1,593 words of prose plus three tables (1,907 including cells), `aiDisclosure` "Narrated by Claude, directed by Bex Head." — layer: content
- [x] Compliance gate passed 2026-09-05 — no banned vocabulary or filler, no triple openers, zero "we", zero em dashes, narrator "I", Bex named; every figure is the 2026-07-27 measurement stated with its date; the four kicker commits and today's governance-page state re-verified before drafting — layer: process
- [ ] Human review — layer: process
- [ ] Publish decision — layer: process (Human-Publishes Rule applies)

## Non-Goals

- ~~Resolving the `CLAUDE.md:723` phantom-node citation~~ — resolved by SUG-284, see
  Background. Whether the node gets written is still not owned here.
- A second node — one node was the explicit decision above. This means this *story* is
  not split; it does not mean the project has one node. Part 2 is a separate node on a
  separate subject (see Impact review below) and does not violate this.

## Acceptance Criteria

- [ ] Node published at `/nodes/{slug}`, Human-Publishes Rule honored (explicit
      standalone publish instruction, not inferred from draft approval)
- [ ] Content Write Gate honored for all copy — proposal shown, approved, before any
      Sanity write

## Related

- **Linear:** [SUG-259](https://linear.app/sugartown/issue/SUG-259)
- **Outline:** `docs/drafts/node-outline-the-fire-alarm.md` (local-only)
- **Referenced fixes:** SUG-245 (accuracy pass), SUG-244 (workflow diagram), SUG-256
  (the eventual re-derivation, shipped 2026-08-04)
- **Impact review 2026-08-15:** [issue #87 comment](https://github.com/bex-sugartown/sugartown/issues/87#issuecomment-5302925808)
  mirrors the section below.

## Impact review — 2026-08-15

Mirrored to [issue #87](https://github.com/bex-sugartown/sugartown/issues/87#issuecomment-5302925808).
Parking list, not a scope change. Nothing below is actioned.

The governance layer this node's Fix section scheduled its repairs into was built, ran
seven weeks, and was removed by SUG-284 (shipped 2026-08-15, `99a964d2`, released in
v0.33.0). Post-mortem:
`docs/reviews/post-mortem/2026-08-15-governance-layer-buildup-and-unwind.md`.
**The diagnosis is unaffected** — outline sections 1 to 5 stand, one row changed.

### Decided 2026-08-15

- Two nodes, not three. This issue is Part 1, the diagnosis. Part 2 carries the rebuild
  **and** the unwind in one piece; they share a root cause, so splitting leaves the
  middle piece without an ending.
- The Fix row rewritten in the outline: the repairs went into a layer subsequently
  removed by hand. One clause plus a forward link, no chronology. Length band holds.
- Diagram: three-lane redraw accepted. The two-lane version is invalidated — seven of
  its nine Sugartown boxes are now false.

### Needs a decision, unowned

- Part 2 has no tracking issue. New IDs are `ST-{github issue number}` per the migration plan
  §2.1 — file the GitHub issue first, then name the doc from the number it returns.
  Needs a `docs/backlog/SUG-{N}-*.md` doc and a GitHub issue.
- Part 2's working title is retired. Five candidates recorded in the outline.
- The `series` document does not exist for either configuration. Create it, set
  `parts[]` in order, set `partNumber` on both, keeping the two consistent since
  `parts[]` wins when populated. Blocks the series widget on both parts.

### Dangling references found while checking, not owned here

Three live documents carry acceptance criteria against `validate-enforcement-liveness.js`,
which no longer exists. The post-mortem's residue sweep (section 3.7) counted five
surviving items and did not catch these.

| Where | Line | The dangling requirement |
|---|---|---|
| `docs/backlog/SUG-269-sanity-validator-probeability.md` ([#93](https://github.com/bex-sugartown/sugartown/issues/93)) | 75 | AC requires `pnpm validate:enforcement-liveness` to report 3 more gates live |
| `docs/backlog/SUG-264-validate-banned-words.md` ([#89](https://github.com/bex-sugartown/sugartown/issues/89)) | 63, 79 | AC requires a probe in the deleted script; Files names it, `package.json`, `ci.yml` |
| `docs/briefs/governance-data-layer-prd.md` | 183, 231 | live PRD for the cancelled SUG-268; acceptance set "post-cutover" |

### Also raised, lower priority

- The technical-diagram red-pen gate has no class for *was true, then removed on
  purpose*. Its four classes are `enforced-by-code`, `measured`, `convention`,
  `roadmap`. Worked around for the draft by classing peak-state rows `measured` with a
  mandatory as-of date and an evidence path into `zArchive/`.
- The diagram needs a committed source in `docs/diagrams/` and a completed claim table
  before any published version. Alt text is a claim and needs its own row.
