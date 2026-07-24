---
**Epic:** SUG-238 — Epic → User Story decomposition (AC/DoD per story, Linear sub-issues)
**Linear Issue:** [SUG-238](https://linear.app/sugartown/issue/SUG-238/epic-user-story-decomposition-acdod-per-story-linear-sub-issues)
**Status:** Backlog
**Priority:** 🟡 Medium — not blocking, but the PM-vibe gap is live feedback, not speculative
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-238 — Epic → User Story decomposition

Decompose Epics (SUG-N) into individually-tracked user stories — each carrying its own
Acceptance Criteria and Definition of Done — using Linear's native sub-issue mechanism.
Resolves the Storybook-"story" naming collision by using the full term **"user story"**
rather than inventing a workaround word.

## Template adaptation — declared once

This is a process/tooling/documentation epic. No Sanity schema, no GROQ, no page render
work, no visual surface. The following template sections are **N/A**, for the reasons
stated — this declaration replaces repeating them individually.

| Template section | Status | Reason |
|---|---|---|
| Component-Reuse Manifest | N/A | No page, section, or visual surface is added |
| Doc Type Coverage Audit | N/A | No field, section type, schema object, or renderer touched |
| Schema Field Proposal | N/A | No Sanity schema field added |
| Query Layer Checklist | N/A | No GROQ query read or modified |
| Schema Enum Audit | N/A | No enum field rendered or displayed |
| Metadata Field Inventory | N/A | MetadataCard and metadata surfaces untouched |
| Themed Colour Variant Audit | N/A | No CSS token, component style, or themed surface touched |
| Migration Script Constraints | N/A | No backfill, no data transform, no Sanity document written |
| Human QA Walkthrough | N/A | No CSS, layout, or component rendering changes |
| Visual QA Gate | N/A | No visual output — see Phase 0 test in CLAUDE.md: this changes no rendered surface |

If execution turns out to need any of the above, that's a scope gap — stop and update
this doc before proceeding, per the standard rule.

**Phase 0 (mockup gate) does not fire.** The test is "would this change render something
a human has not signed off on?" This restructures Markdown templates and a Linear
tracking pattern. Nothing here is a rendered surface.

---

## Pre-Execution Completeness Gate [REQUIRED]

- [x] **Correct audit file paths** — `docs/epic-template.md` (confirmed, 612 lines, root
  `docs/`), `CLAUDE.md` (confirmed, repo root), `docs/conventions/` (confirmed, 22 files
  present, e.g. `token-naming.md` as a precedent for a standalone naming-convention doc)
- [x] **Studio schema changes scoped** — none, explicitly out of scope
- [x] **Web adapter sync scoped** — N/A, no DS component touched
- [x] **Scope ↔ Non-Goals consistency** — checked; no Non-Goal below contradicts a Scope
  item (see both sections)
- [ ] **Instruction & Rule File Write Gate pre-flight (this epic's own hard stop)** —
  two of the three files this epic modifies (`docs/epic-template.md`, `CLAUDE.md`) are
  rule-defining files under CLAUDE.md's own Instruction & Rule File Write Gate. **The
  executing session must show the exact diff for each and get explicit approval before
  writing to either file — even though this epic doc itself authorizes the change in
  principle.** Epic approval is not diff approval; they are separate gates, same as the
  Content Write Gate vs. the Human-Publishes Rule are separate for content.

---

## Context [REQUIRED]

`docs/epic-template.md` currently has no concept of a Story beneath the Epic level. An
epic's `Scope` section is a flat checklist of tasks; `Acceptance Criteria` and
`Deliverables` are each a single flat list for the whole epic — there is no unit smaller
than the epic that carries its own AC or DoD.

`CLAUDE.md` and `docs/epic-template.md` already use the word "story" extensively — 7 hits
in `CLAUDE.md`, 5 in `docs/epic-template.md` as of this writing, all referring to
Storybook component stories (e.g. "Every new or modified component... must have a
Storybook story before close-out," "dark mode is a shipping AC"). Introducing an agile
"Story" concept without resolving this would collide with load-bearing, already-enforced
vocabulary.

Linear (the MCP tool surfaced via `mcp__plugin_linear_linear__save_issue`) already
supports native parent/child sub-issues via `parentId` — confirmed in the tool's own
schema. No new ID scheme or numbering convention is needed; Linear generates normal SUG-N
IDs for sub-issues the same as any other issue.

Origin: `docs/drafts/workflow-audit-v0.3-grounded.md` Part 6 (feedback from Bex during
the SUG-224-era workflow audit), explicitly flagged there as "not decided, not on the
diagram" pending this epic.

## Objective [REQUIRED]

After this epic: `docs/conventions/user-story-conventions.md` exists as the canonical
definition of a user story in this repo — the term, the sizing gate (when to decompose
an epic vs. keep it flat), the Linear sub-issue shape (title pattern, AC/DoD fields), and
one worked example against a real shipped epic. `docs/epic-template.md` gains a **User
Story Decomposition** section that points to the conventions doc rather than duplicating
it, gated behind the sizing threshold so small epics are unaffected. `CLAUDE.md`'s Epic
Authoring section references the same conventions doc by path. No epic doc's structure
changes for epics that don't cross the sizing threshold — this is additive, not a
rewrite of the existing Scope/Deliverables/AC flow.

---

## Scope [REQUIRED]

- [ ] Write `docs/conventions/user-story-conventions.md` — layer: docs (new file) — Phase 1
  - Define "user story" as the canonical term; explicitly state bare "story"/"stories"
    remains reserved for Storybook everywhere in this repo
  - Define the sizing gate: candidate threshold is "multi-phase epics, or >5 Scope items"
    — same shape as the a11y burn-down's own "stop and split above ~25 violations" sizing
    gate (SUG-161), applied to authoring instead of execution
  - Define the Linear sub-issue shape: parent = the epic issue (`parentId`), title
    pattern `User Story: <title>`, description carries its own Acceptance Criteria +
    Definition of Done (DoD may inherit the epic's DoD by reference unless a user story
    needs its own)
  - State explicitly that `docs/backlog/SUG-N-*.md` remains the source of truth per the
    existing convention ("Linear — tracking, prioritization, status... not the full
    spec") — sub-issues are a tracking layer, not a second spec
  - Include one worked example: take **SUG-229** (11 distinct Scope bullets, each
    independently scoped to one skill's gate conversion) and show what its user-story
    breakdown would have looked like, to prove the sizing gate produces sensible output
    against a real epic rather than a hypothetical one
- [ ] Update `docs/epic-template.md` — layer: rule-defining doc (gated, see Pre-Execution
  Gate above) — Phase 2
  - Add a **User Story Decomposition** section between `Scope` and `Query Layer
    Checklist`, referencing `docs/conventions/user-story-conventions.md` rather than
    restating its content
  - State the sizing gate inline as a one-line pointer, not a duplicate definition
  - Leave the existing `Scope`/`Deliverables`/`Acceptance Criteria` flow untouched for
    epics below the sizing threshold
- [ ] Update `CLAUDE.md`'s Epic authoring — Linear-first workflow section — layer:
  rule-defining doc (gated) — Phase 3
  - Add one line referencing `docs/conventions/user-story-conventions.md`, consistent
    with the existing "consolidate to one canonical location, reference from the rest"
    pattern already used for the reuse rule

---

## Non-Goals [REQUIRED]

- **Retrofitting existing shipped or backlog epics into the new structure.** Apply on the
  next epic that crosses the sizing threshold. Do not renumber or restructure an
  in-flight or already-shipped epic doc.
- **Building automation to auto-create sub-issues.** This is a documented convention and
  a manual authoring practice, not a script. If it proves high-friction in practice, that
  is a future epic's problem, informed by real usage.
- **Changing Storybook's own "story" vocabulary.** Nothing in `apps/storybook/` or any
  `.stories.tsx` file is touched. The resolution is entirely on the agile-terminology
  side ("user story"), not the Storybook side.
- **A second full spec per user story.** The epic doc in `docs/backlog/` stays authoritative.
  Sub-issues carry AC/DoD for tracking visibility, not a competing source of truth.
- **Mandating decomposition for every epic.** The sizing gate is the point — most
  Sugartown epics are single-session and gain nothing from per-Scope-item ticket
  overhead.

---

## Technical Constraints [REQUIRED]

**Tooling**
- Linear sub-issues use the `parentId` field on `mcp__plugin_linear_linear__save_issue`
  (or the equivalent `plugin:linear` tool) — confirmed present in the tool schema, no new
  integration work needed.
- No monorepo code, build, or CI surface is touched. This is documentation and Linear
  usage convention only.

**Rule-file edit discipline (binding on execution, not just this doc)**
- `docs/epic-template.md` and `CLAUDE.md` are both under CLAUDE.md's own Instruction &
  Rule File Write Gate. Phases 2 and 3 of this epic must each show the exact diff and
  receive explicit approval before the `Edit` call — this epic doc's approval covers
  the *decision*, not the *diff*.
- `docs/conventions/user-story-conventions.md` (Phase 1) is a new file under
  `docs/conventions/`, which is also covered by the same gate per CLAUDE.md's explicit
  scope list. Same rule applies: diff (in this case, the full new-file content) shown
  before the `Write` call.

---

## Files to Modify [REQUIRED]

**Docs (new)**
- `docs/conventions/user-story-conventions.md` — CREATE — Phase 1

**Docs (rule-defining, gated)**
- `docs/epic-template.md` — new "User Story Decomposition" section — Phase 2
- `CLAUDE.md` — one-line reference in Epic authoring — Phase 3

**Explicitly not modified**
- Any file under `docs/backlog/` or `docs/shipped/` — no retrofit, per Non-Goals
- Anything under `apps/storybook/` or any `.stories.tsx` file

---

## Deliverables [REQUIRED]

1. **Conventions doc** — `docs/conventions/user-story-conventions.md` exists, contains
   the term definition, sizing gate, Linear sub-issue shape, and the SUG-229 worked
   example
2. **Template section** — `docs/epic-template.md` has a new User Story Decomposition
   section, positioned between Scope and Query Layer Checklist, referencing (not
   duplicating) the conventions doc
3. **CLAUDE.md pointer** — one new line in the Epic authoring section, linking the
   conventions doc

---

## Acceptance Criteria [REQUIRED]

- [ ] `docs/conventions/user-story-conventions.md` exists and defines: the term "user
  story" (with an explicit statement that bare "story"/"stories" stays reserved for
  Storybook), the sizing gate threshold, the Linear sub-issue shape (title pattern,
  AC/DoD fields, `parentId` usage), and the source-of-truth statement (epic doc, not
  sub-issues, remains canonical)
- [ ] The SUG-229 worked example is present in the conventions doc: its 11 Scope bullets
  mapped to a proposed user-story breakdown, demonstrating the sizing gate against a real
  epic
- [ ] `docs/epic-template.md`'s new section references
  `docs/conventions/user-story-conventions.md` by path rather than restating its content
  — `grep -c "user-story-conventions.md" docs/epic-template.md` returns ≥1
- [ ] `CLAUDE.md`'s Epic authoring section references the same file —
  `grep -c "user-story-conventions.md" CLAUDE.md` returns ≥1
- [ ] **Collision self-check (mechanical, not a judgment call):** `grep -inE "\bstor(y|ies)\b"` 
  against the new conventions doc and both diffs — every match is either "user story" /
  "User Story" (agile) or explicitly paired with "Storybook"/"component" (e.g.
  "Storybook story," "component story"). Zero bare, ambiguous uses of "story"/"stories"
  in the new or modified prose.
- [ ] Both `docs/epic-template.md` and `CLAUDE.md` diffs were shown and approved before
  writing, per the Instruction & Rule File Write Gate — confirmed by the approval
  message existing in the session transcript, not assumed
- [ ] Existing epics below the sizing threshold are unaffected — spot-check one recent
  small epic doc (e.g. a single-phase epic) against the updated template and confirm
  nothing in its existing structure is now required to change

---

## Risks / Edge Cases [REQUIRED]

- **Diff-approval skipped under time pressure.** Two of three files are rule-defining.
  If the executing session edits either without showing the diff first, that's a direct
  violation of an existing hard stop, not a judgment call — see the AC above requiring
  the approval message to actually exist in the transcript.
- **Sizing threshold arrives too low or too high in practice.** The ">5 Scope items or
  multi-phase" candidate threshold is a starting guess, not a measured value — no data
  exists yet on how often it fires or whether it's the right cut line. Treat the first
  1–2 real epics that cross it as a check on the threshold, and revise the conventions
  doc if it's clearly miscalibrated, rather than treating the number as fixed.
- **The conventions doc becomes a second thing to keep in sync.** Same failure shape as
  the reuse rule being written three times (flagged in the earlier workflow audit,
  Notes S1). Mitigated by design here — `epic-template.md` and `CLAUDE.md` reference the
  conventions doc rather than restating it, so there's exactly one place the definition
  lives.
- **Sub-issues drift from the epic doc.** If a user-story sub-issue's AC is edited in
  Linear without updating `docs/backlog/SUG-N-*.md`, the epic doc's own Scope/AC could
  silently disagree with what's tracked in Linear. Not solved by this epic — worth a
  note in the conventions doc that the epic doc is authoritative on conflict, per
  Non-Goals, but no enforcement mechanism is proposed here.

---

## Post-Epic Close-Out [REQUIRED]

1. **Visual QA gate** — N/A, no visual output (see Template adaptation table above)
2. **Chromatic** — N/A, no component or Storybook story changes
3. **Data pipeline gap check** — N/A, no build-time pipeline touched
4. **Move the epic doc**: `docs/backlog/SUG-238-epic-user-story-decomposition.md` →
   `docs/shipped/SUG-238-epic-user-story-decomposition.md`
5. **Confirm clean tree**
6. **Run mini-release** — `/mini-release SUG-238 Epic user story decomposition`
7. **Update Linear** — transition SUG-238 to **Done**
8. **Start next epic** — only after mini-release commit is confirmed
