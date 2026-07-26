---
**Epic:** SUG-244 — GovernancePage: workflow lifecycle diagram + governance doc index
**Linear Issue:** [SUG-244](https://linear.app/sugartown/issue/SUG-244/governancepage-add-workflow-lifecycle-diagram-governance-doc-index)
**Status:** Backlog — **proposal, awaiting explicit go-ahead before Phase 1 begins**
**Priority:** ⬛ Deferred — nice-to-have, not blocking anything
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-244 — GovernancePage workflow lifecycle diagram

**This epic is a proposal, captured formally per Bex's request, not yet approved for
execution.** Do not begin Phase 1 without an explicit go-ahead beyond this doc's own
creation.

**Rescoped 2026-07-24, same session.** Originally scoped as "add a new §07 Workflow
section." Bex asked whether §05 AI Governance Coverage could be replaced entirely by the
workflow diagrams, and whether the six-layer model and the workflow could be combined
into one artifact that explains both. They can: each workflow phase maps to a primary
governance layer from `docs/ai/agentic-caucus/governance-coverage.md` (grounded in that
doc's own evidence rows, not an arbitrary grid — see the mapping table below). This epic
now **redesigns §05** around a layer-tagged version of the short diagram, rather than
adding an unrelated §07. The six-layer `COVERAGE_LAYERS` table is replaced by the
diagram's own L-badges + legend; the plain-language tally strip (SUG-245's fix) stays as
a compact companion for the "at a glance" reading mode a diagram doesn't serve well.

**Hard dependency on SUG-245 — updated 2026-07-26, handoff verified, not assumed.**
SUG-245 Phase 1 landed. The premise above ("corrected numbers: 3 open gaps, not 0") did
**not** hold — SUG-239 shipped in between and closed the exact three counterexamples
SUG-245 had flagged (`validate:css-names`/`validate:taxonomy` now wired,
design-reviewer named in CLAUDE.md), so `governance-coverage.md` and
`COVERAGE_TALLY`/`COVERAGE_LAYERS` were re-verified accurate and left unchanged: Layer 6
stays **Strong**, tally stays **Gap: 0**. The layer-tag design should use these
re-confirmed current numbers (Strong: 18, Gap: 0), not the "3 open gaps" figure this doc
originally assumed. This epic is no longer blocked — SUG-245 has landed — but its Layer
6 badge (e.g. "Strong · Compliance") should read `Strong`, not a downgraded posture.

## Template adaptation — declared once

| Template section | Status | Reason |
|---|---|---|
| Doc Type Coverage Audit | N/A | No Sanity content doc type touched — `GovernancePage.jsx` is page code, not CMS content |
| Schema Field Proposal | N/A | No schema field added |
| Query Layer Checklist | N/A | No GROQ touched |
| Schema Enum Audit | N/A | No enum field rendered |
| Metadata Field Inventory | N/A | No metadata surface touched |
| Migration Script Constraints | N/A | No data transform |

Other template sections apply in full below — this **does** touch a live, rendered,
public page, unlike the other five epics in this batch.

## Phase 0 test — why this doesn't need a mock

CLAUDE.md's Phase 0 gate fires on "would this change render something a human has not
signed off on?" — with an explicit exception: "If the work adopts an already-shipped,
already-reviewed design... the gate does not fire; record the decision in the epic doc
instead." That's the case here, and CLAUDE.md gives the exact precedent this matches:
SUG-231 Phase 3 ported the canonical `Callout` to a second copy without a new mock,
because nothing rendered that hadn't already been reviewed.

This epic proposes a new **§07** section using the **exact same pattern** already shipped
and live in §03 (Release Process): `SectionLabel` + `MermaidDiagram`, plus a `Table`/
`TableWrap` pair already used three times on this same page (Release table, Roadmap,
Coverage). No new component, no new visual format — a new instance of an
already-reviewed one. **Decision recorded here per the exception clause; no vspec
required.** If the actual diagram content or table design changes materially from what's
specified below before execution, re-evaluate this decision at that time.

## Pre-Execution Completeness Gate [REQUIRED]

- [x] **Correct audit file paths** — `apps/web/src/pages/platform/GovernancePage.jsx`
  (320 lines, confirmed), `apps/web/src/components/PageSections.jsx` (MermaidDiagram
  implementation, confirmed) — both read in full during scoping
- [x] **Interaction surface audit** — no new interactive element; Table/MermaidDiagram
  are existing, reused components
- [x] **Dark / theme modifier treatment** — confirmed via reading
  `MermaidDiagram`'s implementation: it already reads `document.documentElement`'s
  `data-theme` attribute and switches to a WCAG AA-compliant token-driven palette (≥4.5:1
  text, ≥3:1 node-on-canvas) per theme. No new work needed — verify, don't rebuild.
- [ ] **Explicit go-ahead** — this checkbox stays unticked until Bex confirms beyond
  this doc's creation that Phase 1 should begin

## Context [REQUIRED]

`/governance` is a real, live, public page (`apps/web/src/pages/platform/GovernancePage.jsx`,
route registered in `App.jsx`). It already has six sections: Recent Releases, Roadmap
(live from Linear via `stats.json`), Release Process (a Mermaid flowchart — the exact
pattern this epic proposes reusing), Site Performance, AI Governance Coverage (a
six-layer table sourced from `docs/ai/agentic-caucus/governance-coverage.md`), and
Artifacts (linked briefs/prompts/conventions).

**Investigated during scoping, both findings favorable:**

1. **Light/dark theming.** `MermaidDiagram` (in `PageSections.jsx`) already branches on
   `data-theme` and computes a per-theme palette from CSS custom properties, with an
   explicit WCAG AA contrast comment in the source. Already solved, verified by reading
   the component, not assumed.

2. **Doc-linking.** Bex asked whether each diagram step could link to its governing doc
   and output. `MermaidDiagram` sets `mermaid.initialize({ securityLevel: 'strict', ... })`
   — this **disables** Mermaid's native `click nodeId "url"` link syntax by design.
   That's very likely deliberate: the same component renders Sanity-authored
   `mermaidSection` content (confirmed by a comment about stripping CMS-authored inline
   styles), so flipping to `securityLevel: 'loose'` would open click-injected links for
   *every* Mermaid diagram sitewide, including ones an editor writes in Studio — not a
   security posture to loosen for one diagram's convenience.

   **Recommendation, not yet approved:** skip in-diagram click targets. Pair the diagram
   with a companion `TableWrap`/`Table` immediately below it — same component already
   used three times on this page — mapping each phase to its governing doc(s) and output
   artifact(s), with real `<a>` links. Zero security tradeoff, more accessible than tiny
   SVG click targets (real anchor tags beat click-handlers on an SVG node for keyboard
   and touch nav), and it's the page's own existing idiom rather than a new one.

## Objective [REQUIRED]

After this epic (if approved): `/governance` has a new §07 section, "Workflow," showing
the 8-phase epic lifecycle as a Mermaid diagram (current-state, not the annotated
gap-analysis version — that stays internal, see `docs/diagrams/` per the sibling
diagram-formalization work), immediately followed by a table mapping each phase to its
real governing document and real output artifact, each linked.

## Governance-layer mapping [new, grounds the rescope]

One primary layer per phase, each traced to the specific evidence row in
`governance-coverage.md` that names it — not an arbitrary grid:

| Phase | Layer | Evidence row in `governance-coverage.md` |
|---|---|---|
| Intake | L1 · AI Inventory | "System classification... Ownership assignment" |
| Planning | L5 · Human Oversight | "Decision review — Epic gates" |
| Design | L5 · Human Oversight | "Decision review — Phase 0 mock gate" |
| Implementation | L6 · Compliance & Audit | "Policy enforcement — pre-commit hooks" |
| Verification | L6 · Compliance & Audit | "Policy enforcement — validators" (and exactly where this session's own gap markers live) |
| Close-out | L2 · Data Foundation | "Lineage mapping — Epic doc, commit, ship doc" |
| Release | L6 · Compliance & Audit | "Audit trails — CHANGELOG" |
| Feedback | L6 · Compliance & Audit | "Incident reporting — session post-mortems" |

L3 (Data Security, rated Inherited — platform-owned, not a workflow step) and L4 (Model
Assurance, rated Partial and diffuse across phases) don't concentrate in a single phase
and aren't badged — noted in the diagram's own footer rather than forced onto a node.

Already built and verified in-browser this session: `docs/diagrams/diagram-workflow-current-state.svg`
carries these L-badges. Executing this epic's live-page phase means porting the same
badges into the Mermaid version (Mermaid doesn't support arbitrary badge overlays the
way raw SVG does — the live version may need to express the layer via a subgraph label
or a bracketed suffix in the node text, e.g. `"Verification [L6]"`, rather than a visual
tab. Decide the exact mechanism at execution time against what Mermaid's `flowchart`
syntax actually supports well; don't force a pixel-identical port of the SVG's badge
styling into a different rendering technology).

## Scope [REQUIRED]

**Phase 1 — Diagram content (current-state, 8 nodes, matches Release Process's level of
abstraction, ported from the verified L-badge design above)**

```
flowchart LR
    A["Intake"] --> B["Planning"]
    B --> C["Design"]
    C --> D["Implementation"]
    D --> E["Verification"]
    E --> F["Close-out"]
    F --> G["Release"]
    G --> H["Feedback"]
    H -.-> B
```

- [ ] Add `WORKFLOW_DIAGRAM` const to `GovernancePage.jsx`, matching the shape of the
  existing `RELEASE_DIAGRAM` const
- [ ] New `<section id="workflow">` with `SectionLabel` (`number="§07"`,
  `name="WORKFLOW"`, `title="How an epic moves from intent to shipped"`) +
  `<MermaidDiagram>`, positioned after §03 Release Process (adjacent, related content)
  or as the new final section before Artifacts — decide at execution time based on
  visual flow, not fixed here

**Phase 2 — Governance doc index table**

Real paths, verified against the live repo at scoping time — re-verify at execution
time, since some rows depend on epics in this same batch landing first:

| Phase | Governing doc(s) | Output artifact(s) |
|---|---|---|
| Intake | `docs/briefs/ia-brief.md`, PRD-writer skill | Linear issue (SUG-N assigned) |
| Planning | `docs/epic-template.md`, CLAUDE.md §Epic authoring | `docs/backlog/SUG-N-*.md` |
| Design | CLAUDE.md §Phase 0, `docs/conventions/design-handoff-template.md` | `docs/drafts/SUG-N-*.vspec.html` → `docs/shipped/` copy *(vspec naming pending SUG-242)* |
| Implementation | CLAUDE.md conventions | Commits, Storybook stories |
| Verification | `docs/conventions/vqa-workflow.md`, CLAUDE.md §Visual Verification Rules | VQA table, Chromatic build |
| Close-out | CLAUDE.md §Session Discipline | `docs/shipped/SUG-N-*.md`, mini-release commit |
| Release | `docs/workflows/release-assistant-prompt.md` | `CHANGELOG.md`, `RELEASE_NOTES.md` |
| Feedback | `docs/conventions/feedback-loop.md` *(pending SUG-241)*, `docs/post-mortem-prompt.md` | `docs/backlog/sugartown-backlog-priorities.md` dated block, `docs/reviews/post-mortem/*.md` |

- [ ] **Soft dependency, not blocking: check SUG-248's status before building this as a
  hardcoded array.** `WORKFLOW_DOCS` follows the same `eyebrow`/`title`/`body`/`href`
  shape as the existing `ARTIFACTS` const — the exact pattern SUG-248 (Formalize
  stat-card/card-builder content schema pattern) is auditing as duplicated across 4
  files with zero Sanity backing. If SUG-248 has landed and decided "migrate hardcoded
  arrays to `cardBuilderSection`," author `WORKFLOW_DOCS` as real Sanity content from
  the start instead of adding a 5th hardcoded copy of the same shape. If SUG-248 hasn't
  landed yet, proceed with the hardcoded array as originally scoped below — this is not
  a hard block on this epic.
- [ ] Add `WORKFLOW_DOCS` const array, following the existing `ARTIFACTS` const's shape
  (`eyebrow`/`title`/`body`/`href`) but with an added `output` field
- [ ] Render as a `TableWrap`/`Table` immediately below the diagram — columns: Phase,
  Governing doc (linked), Output (linked where a stable URL exists, plain text where it
  doesn't — e.g. "commits" has no single link target)
- [ ] Rows marked "pending SUG-242" / "pending SUG-241" above should either wait for
  those epics to land, or ship with a visible "proposed" marker consistent with the
  red-pen gate's "roadmap items must be labeled, not drawn as current" rule — this is a
  live page, the same discipline applies as to a static diagram

**Phase 3 — Replace §05's six-layer table, integrate with SUG-245's tally strip**
- [ ] Confirm SUG-245 Phase 1 has landed (corrected tally, corrected
  `governance-coverage.md`) before starting this phase — hard dependency, see above
- [ ] Remove `COVERAGE_LAYERS` const and its `Table`/`TableWrap` rendering from
  `GovernancePage.jsx` — the layer-tagged diagram (Phase 1 of this epic) now carries
  that information
- [ ] Keep `COVERAGE_TALLY`'s stat grid (SUG-245's redesigned plain-language version) as
  a compact companion strip directly below the diagram — diagrams serve the "explore and
  understand" reading mode, a stat tally serves the "skim for the headline number" mode;
  keep both rather than picking one
- [ ] Confirm the merged section still passes the smart-outsider test end to end: diagram
  → L-badge legend → tally strip → (optional) doc-index table, each layer of detail
  legible without requiring the one below it
- [ ] Update `docs/ai/agentic-caucus/governance-coverage.md` if its own structure implies
  a six-layer *table* is the canonical presentation — the underlying six-layer audit
  content in that doc is unaffected by this epic, only the live page's *rendering* of it
  changes. Don't let this phase quietly rewrite the source-of-truth doc's own structure
  without a reason beyond "the live page changed."

## Non-Goals [REQUIRED]

- **Native Mermaid click-links.** Explicitly rejected above — `securityLevel: 'strict'`
  stays as-is.
- **The detailed, gap-annotated future-state diagram going live here.** That diagram
  (color-coded orphaned validators, roadmap markers, etc.) is an internal audit artifact.
  This page gets a clean current-state summary, not the working diagram. See the sibling
  diagram-formalization task for where the detailed version lives.
- **Retrofitting this table's links before their target epics ship.** Rows depending on
  SUG-241/SUG-242 either wait or ship clearly marked as proposed — never silently drawn
  as if already true.

## Technical Constraints [REQUIRED]

- Reuses `MermaidDiagram` and `Table`/`TableWrap`/`SectionLabel` exactly as imported
  today at the top of `GovernancePage.jsx` — no new imports beyond what's already there.
- `securityLevel: 'strict'` in `MermaidDiagram.jsx` is explicitly out of scope to change.

## Files to Modify [REQUIRED]

- `apps/web/src/pages/platform/GovernancePage.jsx` — new `WORKFLOW_DIAGRAM` const, new
  `WORKFLOW_DOCS` const, new `<section id="workflow">`

## Deliverables [REQUIRED]

1. New §07 Workflow section live on `/governance`, correct in both light and dark theme
2. Companion doc-index table, every link resolving to a real, currently-existing target
   or explicitly marked pending

## Acceptance Criteria [REQUIRED]

- [ ] Diagram renders correctly on both `light` and `dark-pink-moon` themes — confirmed
  in-browser, not assumed from the component's existing token-driven design
- [ ] Every table link resolves — no 404s, no links to files that don't exist yet
  without a visible "pending" marker
- [ ] Section reuses `MermaidDiagram`/`Table`/`TableWrap`/`SectionLabel` with zero new
  components
- [ ] `securityLevel` in `MermaidDiagram.jsx` is unchanged — `git diff` confirms no
  modification to that file
- [ ] Cross-surface spot check: page renders without console errors, matches the visual
  weight/spacing of the existing §03 and §05 sections (no double-padding, consistent
  `SectionLabel` usage)

## Risks / Edge Cases [REQUIRED]

- **Table rows referencing not-yet-shipped epics (SUG-241, SUG-242) go live looking
  final.** Mitigated by the explicit "pending" marker requirement in Scope and the AC
  above — this is the live-page equivalent of the red-pen gate's roadmap-labeling rule,
  applied here by analogy since this page isn't itself a diagram source file.
- **This epic executes before its own go-ahead.** The unchecked Pre-Execution Gate item
  exists specifically to prevent that — do not proceed past Phase 0 without it ticked
  and a note of when/how approval was given.

## Post-Epic Close-Out [REQUIRED]

1. **Visual QA gate (hard stop)** — this epic DOES touch visual output. Produce the
   comparison evidence per CLAUDE.md's Visual Verification Rules: screenshot both
   themes, confirm spacing/typography match neighbouring sections. Wait for "Visual QA
   approved."
2. Chromatic — N/A, `GovernancePage` is not currently in Storybook's story set (page-level
   composite, not a DS component) — confirm this is still true at execution time
3. Data pipeline gap check — N/A
4. Move `docs/backlog/SUG-244-governance-workflow-diagram.md` →
   `docs/shipped/SUG-244-governance-workflow-diagram.md`
5. Confirm clean tree
6. `/mini-release SUG-244 GovernancePage workflow lifecycle diagram`
7. Transition SUG-244 to **Done** in Linear
8. Start next epic only after mini-release commit is confirmed
