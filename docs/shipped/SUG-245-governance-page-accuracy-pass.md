---
**Epic:** SUG-245 — GovernancePage accuracy pass (AI governance tiles, release diagram, stale source doc)
**Linear Issue:** [SUG-245](https://linear.app/sugartown/issue/SUG-245/governancepage-accuracy-pass-ai-governance-tiles-release-diagram-stale)
**Status:** Backlog
**Priority:** 🔴 Now — a live public page currently asserts something false ("0 gaps"), and it blocks SUG-244
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-245 — GovernancePage accuracy pass

Found during a live review of `/governance`, prompted by Bex flagging the §05 tiles as
unreadable to a casual observer. The readability problem led to a bigger one while
checking it: the section's "0 gaps" claim is currently false.

**Blocks SUG-244, same session.** Bex asked whether §05 could be replaced/merged with
the new workflow diagram (layer-tagged, one badge per phase — see SUG-244's
"Governance-layer mapping" section). That redesign uses this epic's corrected numbers as
its factual basis, so **SUG-244's live-page phase cannot start until this epic's Phase 1
lands.** Phase 2 below (tile redesign) is revised accordingly: it now produces the
compact tally strip SUG-244 keeps as a companion to the diagram, not a standalone
redesign of a section that's about to be restructured around it.

## Template adaptation — declared once

| Template section | Status | Reason |
|---|---|---|
| Doc Type Coverage Audit | N/A | No Sanity content doc type touched — this is page code + a Markdown convention doc |
| Schema Field Proposal | N/A | No schema field added |
| Query Layer Checklist | N/A | No GROQ touched |
| Schema Enum Audit | N/A | No enum field rendered |
| Metadata Field Inventory | N/A | No metadata surface touched |
| Migration Script Constraints | N/A | No data transform |

## Phase 0 test

No new visual format — every change in this epic edits copy, data, or diagram content
within sections that already exist and are already live (`StatCard`, `MermaidDiagram`,
`Table`). Nothing new is invented. Gate does not fire; decision recorded here.

## Pre-Execution Completeness Gate [REQUIRED]

- [x] **Correct audit file paths** — `apps/web/src/pages/platform/GovernancePage.jsx`,
  `docs/ai/agentic-caucus/governance-coverage.md`, `docs/workflows/release-assistant-prompt.md`
  all read in full during scoping
- [x] **Scope ↔ Non-Goals consistency** — checked

## Context [REQUIRED]

**Finding 1 — §05 tiles assume the reader knows the framework.** Current copy: "Strong ·
owned in code" / "of 30 components"; "Partial · informal" / "by choice"; "Inherited ·
platform" / "Sanity · GitHub · Netlify"; "N/A · by design" / "nothing trained." None of
these are self-explanatory to a reader who hasn't read
`docs/ai/agentic-caucus/governance-coverage.md`. "By choice" in particular reads as a
non-sequitur out of context — by choice of what?

**Finding 2 — the "0 gaps" claim is stale and now false.** `governance-coverage.md` is
dated **30 June 2026** (`**Last updated:** June 2026`, changelog's last entry
`### v1.1 — 30 June 2026`) — a month behind the epic that found this. Its Layer 6 row
states: "Policy enforcement | Strong | `CLAUDE.md` is enforced policy: pre-commit hooks,
validators, gates." SUG-239 (this session) found three counterexamples: `validate:css-names`
and `validate:taxonomy` run on no hook and no job despite being built to enforce a
blocking rule, and the design-reviewer subagent exists but is never invoked because
CLAUDE.md's close-out never names it. The tally's "Gap to fill: 0" is the same claim,
restated as a number, and it's also wrong as of this finding.

**Finding 3 — the Release Process diagram undercounts gates.** Live `RELEASE_DIAGRAM`
const in `GovernancePage.jsx`:

```
A["Git Log + Diff"] --Collect--> B["Normalize Changes"] --Gate1--> C["CHANGELOG Entry"]
  --Gate2--> D["Release Notes"] --Gate3--> E["Version Bump"] --Gate4--> F["Backlog Reconcile"]
  --Gate5--> G["Ship"]
```

Five gates shown. `docs/workflows/release-assistant-prompt.md` has seven
(`grep -c "^### ✅ GATE"` = 7, re-verified this session). The diagram draws "Source of
truth" (the real Gate 1) as an ungated "Collect" transition, invents "Version Bump" as
its own gated node with no matching name in the real seven, and collapses the two real
backlog gates (write, then commit — Gates 6 and 7) into one "Backlog Reconcile" node.

## Objective [REQUIRED]

After this epic: §05's tiles lead with plain-language labels a casual reader can parse
without prior context, backed by an intro sentence explaining what's being measured; the
"0 gaps" claim is corrected to reflect SUG-239's real findings, with a link; the Release
Process diagram matches the real seven-gate process node-for-node; and
`governance-coverage.md` itself is updated so the JSX and its source document agree
again.

## Scope [REQUIRED]

**Phase 1 — Fix the false claim first**
- [ ] Update `governance-coverage.md`'s Layer 6 "Policy enforcement" row: `Strong` →
  `Partial` (or add an explicit caveat sentence) reflecting the orphaned-validator and
  unwired-reviewer findings, with a note that SUG-239 is the tracked fix
- [ ] Update the tally: `Gap to fill: 0` → `3`, `Strong: 18` → `17` (Layer 6 moves out of
  pure Strong), recompute the "Strong (owned in code)" count in `COVERAGE_TALLY`
  accordingly — do the arithmetic against the actual table, don't just decrement by one
  without checking which other counts shift
- [ ] Add a changelog entry to `governance-coverage.md` (`### v1.2 — 2026-07-24`) naming
  SUG-239 and SUG-245 as the source
- [ ] `GovernancePage.jsx`: `COVERAGE_TALLY` and `COVERAGE_LAYERS` consts updated to
  match, kicker text `"30 components · 0 gaps"` → `"30 checks · 3 open (tracked)"`,
  linked to the SUG-239 Linear issue

**Phase 2 — Redesign the tally strip for plain-language comprehension (feeds SUG-244)**
- [ ] Add one intro sentence above the `COVERAGE_TALLY` stat grid (plain `<p>`, not a
  tile): explain the 30-checkpoint / six-area framework in one sentence before the
  numbers
- [ ] Rewrite tile `label`/`sub` pairs — lead with plain language, category becomes
  secondary:
  - "18 checks · Enforced automatically" / "Code and pre-commit hooks catch these, not
    just written policy"
  - "5 checks · Written down, followed by habit" / "Real, but no automated check yet"
  - "2 checks · Handled by our vendors" / "Sanity, GitHub, and Netlify own these"
  - "5 checks · Doesn't apply here" / "No AI model is trained on this platform"
  - Use `StatCard`'s existing `body` prop (clamped explanatory text) if `sub` alone
    reads too terse once drafted — no new component needed, `StatCard` already supports
    `label`/`value`/`sub`/`body`/`chip`/`foot`
- [ ] Do **not** also polish `COVERAGE_LAYERS`' own Strong/Partial/Inherited/N/A jargon
  in this phase — SUG-244 Phase 3 removes that table entirely once this phase lands,
  replacing it with the layer-tagged diagram. Polishing a table about to be deleted is
  wasted work; leave it as-is and let SUG-244 remove it.

**Phase 3 — Rebuild the Release Process diagram**
- [ ] Replace `RELEASE_DIAGRAM`'s Mermaid code with the verified seven-gate structure:
  ```
  flowchart LR
      A["Collect\nSignals"] -->|"Gate 1"| B["Source of\nTruth"]
      B -->|"Gate 2"| C["Normalize"]
      C -->|"Gate 3"| D["CHANGELOG\nEntry"]
      D -->|"Gate 4"| E["Release\nNotes"]
      E -->|"Gate 5"| F["Commit +\nVersion"]
      F -->|"Gate 6"| G["Backlog\nWrite"]
      G -->|"Gate 7"| H["Backlog\nCommit"]
  ```
  Re-verify this exact mapping against `release-assistant-prompt.md`'s Step/Gate table
  at execution time — this epic doc's version was checked against the file as of
  2026-07-24, confirm it hasn't shifted before landing
- [ ] Confirm the wider diagram still renders cleanly at `width: 'wide'` with 8 nodes
  instead of 7 — check for label wrapping/overflow, adjust node text if needed

## Non-Goals [REQUIRED]

- **A full redesign of the AI Governance Coverage section's visual layout.** This epic
  fixes copy and data accuracy, not layout, grid structure, or the `StatCard`/`Table`
  components themselves.
- **Auditing every other page on the site for the same pattern.** Scoped to
  `/governance` because that's where this was found. If the pattern (docs claiming
  coverage code doesn't back) recurs elsewhere, that's a separate finding, not a silent
  scope expansion here.
- **§06 Artifacts list expansion.** Noted during scoping as possibly stale (only 4
  links, `docs/conventions/` now has 22 files) but not a factual-accuracy problem the
  way the other three findings are — a candidate for a future, lower-priority epic, not
  this one.

## Technical Constraints [REQUIRED]

- `StatCard` (`apps/web/src/components/StatCard.jsx`) already supports `label`, `value`,
  `sub`, `body` (clamped by default via `bodyClamp`), `chip`, `foot`, `href` — confirmed
  by reading the component directly. No new component or prop needed for the tile
  redesign.
- `MermaidDiagram` reads `data-theme` and computes its own palette — the Phase 3 diagram
  rebuild needs no new theming work, same as SUG-244's finding.

## Files to Modify [REQUIRED]

- `docs/ai/agentic-caucus/governance-coverage.md` — Layer 6 row, tally, changelog — Phase 1
- `apps/web/src/pages/platform/GovernancePage.jsx` — `COVERAGE_TALLY`,
  `COVERAGE_LAYERS`, kicker text, tile `label`/`sub`/`body`, `RELEASE_DIAGRAM` — Phases 1–3

## Deliverables [REQUIRED]

1. `governance-coverage.md` and the live page agree on the gap count
2. §05 tiles readable without prior framework knowledge, verified by the "smart outsider
   test" (would a recruiter understand this without clicking through?)
3. Release Process diagram matches the real seven-gate process

## Acceptance Criteria [REQUIRED]

- [ ] `governance-coverage.md`'s tally and `COVERAGE_TALLY`'s numbers match, and neither
  claims `0` gaps while SUG-239 is open
- [ ] Every tile's `label` is parseable without reading any other part of the page —
  spot check: read only the tile, does "18 checks · Enforced automatically" make sense
  standalone? Does "by choice" (old copy) — for comparison, confirm it's gone
- [ ] The intro sentence above the tile grid exists and states the framework (30
  checkpoints, six areas) before any number appears
- [ ] Release Process diagram shows 7 labeled gates, node-for-node matching
  `release-assistant-prompt.md`'s Step/Gate table, re-verified at execution time (not
  copied from this doc without a fresh check)
- [ ] Diagram renders without label overflow at `width: 'wide'` in both themes

## Risks / Edge Cases [REQUIRED]

- **The gate-count fix silently drifts again.** Nothing currently keeps
  `RELEASE_DIAGRAM` in sync with `release-assistant-prompt.md` if a future epic changes
  the gate count (e.g. if SUG-227-style consolidation ever revisits gate count — though
  the corrected v0.3 audit explicitly recommended against collapsing them). Not solved
  by this epic; worth a one-line comment in the JSX pointing back to the source-of-truth
  file, so a future editor knows to check before changing either side alone.
- **Tally arithmetic errors.** Moving one Layer 6 sub-component from Strong to Partial
  shifts multiple counts (Strong total, Partial total, and the gap count). Recompute
  against the actual six-layer table, don't hand-adjust the summary numbers in isolation.

## Post-Epic Close-Out [REQUIRED]

1. **Visual QA gate — "Visual QA approved" received 2026-07-26.** Verified §03's
   9-node diagram and §05's 4 tiles in-browser, both `light-pink-moon` and
   `dark-pink-moon`, no overflow/wrapping, no regression to the Six-Layer Coverage
   table. Screenshots captured during the session (not re-attached to this doc).
2. **Chromatic** — N/A, confirmed at execution time: no story file under
   `apps/storybook` or `apps/web/src` references `GovernancePage`.
3. **Data pipeline gap check** — N/A, no build-time pipeline touched.
3b. **Friction line.** Phase 3's first commit (`04c30eeb`) shipped tile labels that
    packed a full sentence into `StatCard`'s short eyebrow-caption slot (wrapped to two
    tracked-uppercase lines) and wrote Metric/Value/Impact-Statement copy without first
    checking `outcomeItem`'s actual field intent against the Studio schema — both caught
    only after Visual QA hold and a follow-up content-schema review, costing three
    correction commits (`decb1fc7`, `30f8a501`, `123fc275`). Root cause: drafted StatCard
    copy from the visual pattern alone, not from the schema fields backing it.
4. Moving `docs/backlog/SUG-245-governance-page-accuracy-pass.md` →
   `docs/shipped/SUG-245-governance-page-accuracy-pass.md` in the same commit as this
   edit.
5. Clean tree confirmed before the ship commit.
6. `/mini-release SUG-245 GovernancePage accuracy pass` — next step.
7. Transition SUG-245 to **Done** in Linear — next step.
8. Next epic starts only after the mini-release commit is confirmed.
