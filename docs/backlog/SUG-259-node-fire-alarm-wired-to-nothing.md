---
**Epic:** SUG-259 — Node: The Fire Alarm Was Wired to Nothing (working title)
**Linear Issue:** [SUG-259](https://linear.app/sugartown/issue/SUG-259/node-the-fire-alarm-was-wired-to-nothing-working-title)
**Status:** Backlog
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

**Status: outline v2.** No Sanity draft, no Studio entry yet. Full outline lives at
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

**Also surfaced, needs its own decision:** `CLAUDE.md:723` cites a node — *"The
Validator Said Zero Errors. It Was Watching the Wrong Door."* — that does not exist in
published content or drafts (14 nodes, none of them it). A live false reference in a
file every session loads. Write it, or remove the citation — not this epic's scope to
resolve, but flagged here so it isn't lost.

## Objective

A published Knowledge Graph node at `/nodes/{slug}` covering the CI-red incident and
the "0 gaps" claim, agent-narrated per the node voice convention, taxonomy-wired, that
passes the compliance gate and is reviewed before publish.

## Scope

- [x] Outline of facts
- [x] Theme + spine selected
- [ ] Open questions resolved (name SUG-245 directly? status field? phantom-node
      decision — see Background above) — layer: editorial
- [ ] Discovery run — taxonomy pre-flight + related-content check — layer: content
- [ ] Draft created in Sanity (draft ID recorded here once it exists) — layer: content
- [ ] Compliance gate passed — layer: process
- [ ] Human review — layer: process
- [ ] Publish decision — layer: process (Human-Publishes Rule applies)

## Non-Goals

- Resolving the `CLAUDE.md:723` phantom-node citation — flagged, not owned here
- A second node — one node was the explicit decision above

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
