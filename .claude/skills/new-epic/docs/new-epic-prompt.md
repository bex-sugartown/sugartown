# PROMPT — Sugartown New Epic Assistant
**Version:** v1 (2026-04-27)

Run this to create a new backlog epic: GitHub issue (+ Linear mirror during the trial) + backlog stub + commit.

---

## What this skill produces

- A new **GitHub issue** in `bex-sugartown/sugartown`, added to project 1 with `Priority` set —
  its number is the epic's `ST-{n}` ID
- A new **Linear issue** in the Sugartown team, mirroring it, until 2026-09-09 (CLAUDE.md
  §Dual-write to GitHub during the migration trial)
- A new **backlog stub file** at `docs/backlog/ST-{n}-{kebab-name}.md` with standard header block and empty section stubs
- A single commit: `docs(st-{n}): add {title} backlog epic`

This is a stub, not a full spec. The full spec is filled in when the epic is activated.

---

## Invariants

- The GitHub issue must be created FIRST — the number it assigns is the epic's `ST-{n}` ID, and that is the canonical identifier for the file and commit. Never invent or derive the number.
- Nothing is written to disk until the issue exists and its number has been read back.
- The backlog file is committed in a single commit.
- Do not pre-fill spec sections with guesses. Stub sections use "TODO" as a placeholder.
- Linear status is a byproduct of this workflow, not separately maintained: `Backlog` at
  creation → `Todo` when the human prioritizes it for pickup → `In Progress` at activation
  (`docs/epic-template.md` Pre-Execution Completeness Gate) → `Done` at close-out (CLAUDE.md
  close-out sequence step 8).
- A stated cross-epic dependency ("blocked on X") must be mirrored as a real Linear
  `blockedBy`/`blocks` relation in the same step it's written, not left as prose alone (SUG-246).
  GitHub has no relation field, so state the dependency in the issue body there.

---

## STEP 0 — GATHER

If the human invokes `/new-epic` with inline arguments (e.g. `/new-epic Token sync audit | Design System | 🟢`), parse them directly and skip prompting for provided fields. Still gather any missing required fields below.

**Structured multi-field intake — free text for the open fields, `AskUserQuestion` for the enumerated ones:**

Ask for these as free text (open-ended, no fixed option set):
1. **Epic name** — short title (e.g. "Token file sync audit", "Site-wide search")
2. **One-line description** — what problem this solves or what it delivers (1–2 sentences max)
3. **Tags** — comma-separated (e.g. "Design System, Infrastructure"). Common tags: `Design System`, `Infrastructure`, `UX`, `Schema`, `Content`, `SEO`, `Performance`, `Tooling`

Then ask the two enumerated fields together in one `AskUserQuestion` call (two questions, one call):

```
Question 1: "Priority?"
Options:
  - "🔴 Now — blocks current work"
  - "🟢 Next — high value, ready to pick up"
  - "🟣 Soon — post-sprint"
  - "⚪ Later — pre-launch, no urgency"
  (⬛ Deferred — post-launch: offer as a follow-up if selected isn't quite right —
  AskUserQuestion caps at 4 options per question)

Question 2: "Merge strategy?"
Options:
  - "(a) Merge-as-you-go — one commit per phase, one mini-release at end of each"
  - "(b) Single close-out — one long-lived branch, one mini-release at the end"
```

---

## STEP 1 — CREATE THE ISSUE

**1a. GitHub first — this assigns the ID.**

```bash
gh issue create --title "{epic name}" --body "{one-line description}"
```

No ID in the title. Read back the issue number; it is the epic's `ST-{n}` ID. Then add it to
the board and set its priority:

```bash
gh project item-add 1 --owner bex-sugartown --url {issue url}
```

Set `Priority` on the new item (`Urgent` / `High` / `Medium` / `Low`) to match Step 0. The
`Issue added to project` workflow sets `Status: Backlog` automatically.

**1b. Then Linear, mirroring it** — until 2026-09-09 only (CLAUDE.md §Dual-write to GitHub
during the migration trial). Use the Linear MCP tool `save_issue`:

- **team**: Sugartown (use `list_teams` if the team ID is unknown)
- **title**: the epic name from Step 0
- **description**: the one-line description from Step 0 (Markdown OK)
- **priority**: map from Sugartown priority to Linear integer:
  - 🔴 Now → `1` (Urgent)
  - 🟢 Next → `2` (High)
  - 🟣 Soon → `3` (Medium)
  - ⚪ Later → `4` (Low)
  - ⬛ Deferred → `4` (Low)
- **status**: Backlog

Report to the human both IDs: "GitHub #{n} created (ID: ST-{n}); Linear mirror SUG-{N}."

The **GitHub number** is the canonical ID for the file and commit. The Linear identifier is
recorded in the doc header for the duration of the trial and is not used for naming.

---

## STEP 2 — DERIVE FILE NAME

Convert the epic name to kebab-case:

- Lowercase all characters
- Replace spaces and underscores with hyphens
- Strip special characters except hyphens
- Remove leading/trailing hyphens

Example: "Token file sync audit" → `token-file-sync-audit`

Full filename: `docs/backlog/ST-{n}-{kebab-name}.md`, where `{n}` is the GitHub issue number from Step 1a.

---

## STEP 3 — CREATE BACKLOG STUB

Create the file at `docs/backlog/ST-{n}-{kebab-name}.md`. This is not a parking stub — it is the execution brief. Fill every section from the invocation context. Do not write `TODO` anywhere. If a section requires a codebase read that cannot happen now (e.g. auditing GROQ projections), write a **specific activation audit instruction** instead: "Activation audit: read `queries.js` `caseStudyBySlugQuery` before adding projection."

The merge strategy label convention (from CLAUDE.md):
- `(a)` → `(a) Merge-as-you-go — one commit per phase, one mini-release at end`
- `(b)` → `(b) Single close-out — one long-lived branch, one mini-release at the end`

```markdown
---
**Epic:** ST-{n} — {Epic name}
**GitHub Issue:** [#{n}](https://github.com/bex-sugartown/sugartown/issues/{n})
**Linear Issue:** [SUG-{N}](https://linear.app/sugartown/issue/SUG-{N}) _(trial mirror; drop after 2026-09-09)_
**Status:** Backlog
**Priority:** {emoji} {label}
**Merge strategy:** ({a or b}) {strategy label}
---

# ST-{n} — {Epic name}

{One-line description}

## Background

{2–3 sentences derived from the invocation args, covering:}
{- Current state: what gap or problem exists on the live site today}
{- Why now: the trigger (business shift, technical debt, upstream epic, user need)}
{- Reference surfaces: which pages, doc types, or schemas are affected}

## Objective

{One paragraph: what exists after this epic that didn't before. Name every layer this epic touches: Sanity schema / GROQ query / React render / content (Studio copy edit). Explicitly exclude layers not in scope.}

## Scope

{Specific, layer-named deliverable bullets derived from the description and tags. Each bullet must:}
{- Be independently completable}
{- Name the layer it touches: schema / query / frontend / content / tooling / Storybook}
{- Be specific enough to write an AC for it}

- [ ] {specific deliverable — layer: X}
- [ ] {specific deliverable — layer: Y}

## Phases

{Single-phase: remove this section entirely.}
{Multi-phase: outline here. Derive from scope — if all bullets touch the same layer, it's single-phase. Name what ships at the end of each phase.}

## Acceptance criteria

{Falsifiable, testable ACs derived from scope bullets. "It works" is not valid.}
{If this epic touches Sanity content: reference the Content Write Gate — "proposal approved before patch".}
{If this epic touches schema: "schema deployed and MCP writes succeed".}

- [ ] {specific, testable outcome}
- [ ] {specific, testable outcome}

## Human QA Walkthrough — example local pages

{REQUIRED if any Scope bullet touches CSS, a layout token, or a component rendered on
more than one page. If no Scope bullet touches CSS/layout/shared components, replace this
section with "Not applicable — no shared CSS, token, or multi-page component changes."}

{Do NOT fill the table now — the live route → component mapping must be read from
`apps/web/src/App.jsx` at activation. Instead, write the activation instruction verbatim:}

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

{Cover every applicable item:}
{- **Content Write Gate**: if this is an editorial/content epic, state it fires and name the affected surfaces}
{- **Schema changes**: if schema tag or description mentions new fields, name the fields and whether a deploy is required}
{- **Upstream dependencies**: any epics this depends on (e.g. schema change must land before content edit)}
{- **Activation audits**: specific GROQ queries or file reads needed before execution begins — write them out, not "check the schema"}
{- **Model & Mode [REQUIRED]:** state which model and mode to use at session start. Options:}
{  - `/model sonnet` — default for most epics: DS components, section wiring, schema-driven CRUD, migrations, content/copy. Sonnet 5 executes directly, no plan-mode handoff.}
{  - `/model opus` — architecture epics (SSR strategy, monorepo boundary, schema ERD) or high-ambiguity multi-component work. Use plan mode (Shift+Tab) for the Pre-Execution Gate, then exit to execute.}
{  Do not leave this as a guess — pick one based on the scope bullets above. (The `opusplan` preset was retired — the plan/execute split is now "/model opus + plan mode," set up manually, not a single command.)}

{If this epic adds or changes schema fields, include the following table. One row per proposed field. Skip if no schema changes.}

### Schema field proposal

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| {`fieldName` (type)} | {plain-English concept description} | {realistic example value or enum list} | {business / editorial / retrieval reason} |

## Model & Mode [REQUIRED]

{Pick exactly one and state why:}
{- `/model sonnet` — default for most epics: DS components, section wiring, schema-driven CRUD, migrations, content/copy. Sonnet 5 executes directly.}
{- `/model opus` — architecture epics (SSR, monorepo boundary, schema ERD) or high-ambiguity multi-component work; use plan mode (Shift+Tab) for the Pre-Execution Gate, then exit to execute.}
{Note: the `opusplan` preset was retired — the plan/execute split is now "/model opus + plan mode," not a single command.}

## Non-Goals

{Explicit exclusions, each deliberately chosen. If excluding a doc type or layer, state why.}
{Do not leave this section blank — "none" is a valid answer but must be written explicitly.}

## Related

- **GitHub:** [#{n}](https://github.com/bex-sugartown/sugartown/issues/{n})
- **Linear:** [SUG-{N}](https://linear.app/sugartown/issue/SUG-{N}) _(trial mirror)_
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
```

---

## STEP 4 — SYNC THE TRACKERS

**Sync status:** leave the issue as `Backlog` in both. The human sets `Todo` when they
prioritize it for pickup.

**Sync dependency relations:** if the invocation context or epic doc states an explicit
"blocked on SUG-X" / "blocked by SUG-X" dependency, call `save_issue` on this epic's issue
with `blockedBy: ["SUG-X"]` (or `blocks` on the blocking issue) in this same step — a
dependency stated only as prose in the backlog doc is invisible to anyone using Linear as
the priority queue (SUG-246).

---

## STEP 5 — COMMIT

```bash
git add docs/backlog/ST-{n}-{kebab-name}.md
git commit -m "docs(st-{n}): add {epic name} backlog epic"
```

---

## COMPLETION

Print:

```
━━━ NEW EPIC CREATED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  GitHub: #{n} → {url} (status: Backlog, on project 1)
  ✅  Linear: SUG-{N} → {url} (status: Backlog) — trial mirror
  ✅  Backlog stub: docs/backlog/ST-{n}-{kebab-name}.md
  ✅  Committed: docs(st-{n}): add {epic name} backlog epic

Epic doc is a filled execution brief — Background, Objective, Scope, AC, and Technical Notes are populated.
At activation: complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify
using docs/epic-template.md as the reference.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Enforcement rules

- Never guess the `ST-{n}` number — always use the one GitHub returns after issue creation.
- Never write to disk before Step 1 completes (no ID, no file).
- Never leave Background, Objective, Scope, or Acceptance Criteria as `TODO` — fill from invocation context.
- For sections requiring a codebase audit (Doc Type Coverage, Query Layer, Files to Modify), write a specific activation audit instruction, not `TODO`.
- Never create a duplicate: before Step 1, grep `docs/backlog/` for an existing file with a similar name. If one exists, show it and ask via `AskUserQuestion`:
  ```
  Question: "A similar epic already exists: [filename] — proceed anyway?"
  Options:
    - "Yes — this is a genuinely different epic"
    - "Stop — let me look at the existing one first"
  ```
- If any Scope bullet touches CSS, a layout token, or a multi-page component, the stub MUST include the **Human QA Walkthrough** section (with the App.jsx activation instruction) — not as a `TODO`, but as the written activation audit. A CSS/layout epic stub without this section is incomplete.
- Leave the issue in `Backlog`. The human sets `Todo` when they prioritize it for pickup.
- Any "blocked on/by SUG-X" dependency stated in Background/Technical notes must get a
  matching Linear `blockedBy`/`blocks` relation before Step 5 (Commit).

---

## Stub activation gate (CRITICAL)

When a human invokes "execute", "run", "implement", or "start" on an epic whose backlog file still contains TODO stubs in Background, Scope, or Phases — **Phase 0 is automatically triggered.**

Phase 0 means: complete the spec collaboratively using `docs/epic-template.md` as the guide. Implementation does not begin until every TODO stub is replaced with real content and the human has explicitly approved the spec.

**Detection rule:** Before proceeding with any implementation work on an existing epic, read the backlog file and check for the literal string `TODO` in Background, Scope, or Phases sections. If found:

1. Stop. Do not write any code, schema, CSS, or content.
2. Tell the human: "This epic is still a stub. Background/Scope/Phases have TODO placeholders. Phase 0 is required before implementation — let's complete the spec first."
3. Open `docs/epic-template.md` and walk through each section collaboratively with the human.
4. Once every section is filled, ask via `AskUserQuestion`:
   ```
   Question: "Spec looks complete — start implementation?"
   Options:
     - "Yes — the spec is complete, begin implementation"
     - "Not yet — more sections need work"
   ```
   Only proceed with implementation after "Yes — the spec is complete, begin implementation" is selected.

**Why this rule exists:** SUG-90 was executed from a stub. The TODO placeholders were never filled in. The AI interpreted "execute this epic" as permission to invent the scope and write content directly to Sanity — without a proposal, without approval, without the human seeing what was being written before it happened. The CLAUDE.md Content Write Gate and this gate together close the gap. The stub says "fill me in before activating." Now the system enforces it.
