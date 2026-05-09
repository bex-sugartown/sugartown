---
name: sugartown-epic-writer
description: >
  Write a Claude Code epic execution prompt for Sugartown monorepo implementation work.
  This is the AI-facing artifact — a structured prompt that Claude Code can execute without
  a meeting. Downstream of a PRD; upstream of a commit. Use this skill whenever Bex says
  "write an epic", "write a Claude Code prompt", "I need to brief Claude Code on X",
  "create an epic for", or is ready to move from requirements into implementation.
  Also triggers when a PRD exists and the next step is making it executable. Always produces
  a file. The output format is the Sugartown epic template — not a PRD, not a brief, not
  inline instructions. If a PRD doesn't exist yet, offer to write one first using the
  sugartown-prd-writer skill, or proceed with explicit "assumptions standing in for PRD"
  section.
---

# Sugartown Epic Writer

Produces a Claude Code epic execution prompt. This is an **AI execution artifact**, not a
human requirements document. It is written to be parsed and executed by Claude Code.

The distinction matters:
- A PRD answers "what and why" for humans making decisions.
- An epic answers "how and in what order" for an AI agent executing code.

If you're holding a PRD and need to turn it into an epic, that is the correct direction
of travel. If no PRD exists, state that clearly in the epic and list the assumptions
you're making in lieu of one.

---

## Source of Truth

The epic template lives at `/mnt/project/epic-template.md`.

**Before writing any epic: read `epic-template.md` in full.** The template is the contract.
This skill explains when and how to fill it in; the template defines the sections.

Do not reconstruct the template from memory. Read it. The gate checklists, table structures,
and technical constraints sections have been updated over time and must be taken from the
current file.

---

## Intake: What to Resolve Before Writing

An incomplete epic brief is a process failure, not a starting condition. The epic template's
Pre-Execution Completeness Gate lists the minimum required; this section explains how to
gather what's missing.

**Resolve before writing (or explicitly flag as open):**

1. **Epic ID** — check `CHANGELOG.md` or backlog for next available EPIC-XXXX
2. **Domain** — CMS schema work, frontend render work, design system work, or a combination
3. **Doc type coverage** — which of the five primary doc types are in scope (page, article,
   caseStudy, node, archivePage)
4. **Files to modify** — actual file paths, verified to exist. No hypothetical paths.
5. **Schema field types** — explicit (`string`, `text`, `boolean`, `reference`, `image`, etc.)
   No "TBD" on field types.
6. **Enum values** — if any `select` or `radio` field is in scope, the full `options.list`
   must be read from the schema file, not reconstructed from memory
7. **GROQ queries affected** — which slug queries and archive queries need updating
8. **Dark/theme treatment** — explicit per-component statement (token inheritance,
   `[data-theme]`, or "not applicable — [reason]")

If any of these cannot be answered without reading the actual codebase, say so. The epic
should block on missing information, not paper over it.

---

## Output Format

Produce a single Markdown file. Filename: `EPIC-[XXXX]-[slug].md`.
Place in `/mnt/user-data/outputs/` and call `present_files`.

The file must be paste-ready into a Claude Code session. No explanatory prose around the
template — just the completed template.

---

## How to Fill the Template

### Pre-Execution Completeness Gate

Fill every checkbox as either `[x]` (confirmed) or flag it as an open item with an owner.
Do not leave items blank. An unfilled gate is a red flag to Claude Code — it will either
stall or make unsafe assumptions.

The six gate items correspond to six categories of silent failure:
- Missing layout contract → CSS drift on first render
- Enum values from memory → badge failures that don't error, they just silently display nothing
- Wrong file paths → file creation in wrong location; history bisect becomes impossible
- Dark mode not addressed → post-delivery "make it work in dark mode" request
- Schema changes not scoped → implicit changes that can't be reverted cleanly
- Web adapter not scoped → component works in DS, breaks in web app

### Context

State exactly what exists right now that this epic will touch. Claude Code has no memory
between sessions. If it's not in the epic, it doesn't exist.

Include:
- The relevant files that exist today (verified paths, not assumed)
- Which doc types, routes, or queries are currently in scope
- Which epics recently touched the same surface area (to avoid conflicts)

### Objective

One paragraph. Present tense for what exists after this epic, past tense for what existed
before. Name all three layers explicitly or explicitly exclude them:
- Data layer (Sanity schema)
- Query layer (GROQ)
- Render layer (React)

If a layer is out of scope, say why: "GROQ queries are not affected because this epic adds
no new fields to queried documents" is valid. "GROQ not in scope" with no reason is not.

### Scope

Every task must map to a deliverable and an acceptance criterion. One-to-one is the target.
If a task has no AC, it will be deprioritised or skipped under pressure.

Order tasks in execution sequence:
1. Studio schema changes (schema first — everything else blocks on it)
2. Schema registration
3. Document wiring (sections[] additions)
4. GROQ projection updates
5. Frontend renderer
6. CSS / styles
7. Web adapter sync (if applicable)
8. Migration script (if applicable)

### Technical Constraints

This section is pre-filled in the template with Sugartown-specific rules. Do not remove or
override them. Add project-specific constraints below the pre-filled rules.

Critical constraints to always include (they're in the template but worth knowing):
- `nanoid` is NOT at monorepo root — use the dynamic import + fallback pattern
- Migration scripts: dry-run default, `--execute` flag, 5s abort window, idempotency required
- `featuredImage` is deprecated — if any scope item references it, flag and remove it
- Web adapter: `apps/web` does NOT import from `packages/design-system` directly

### Acceptance Criteria

Every AC must be falsifiable. Test it mentally: can you verify it passed or failed without
reading the code?

Required ACs for any epic that touches schema + render:
- `tsc --noEmit` in `apps/studio` reports zero NEW errors
- Studio hot-reloads without errors; new section type appears in section builder
- Frontend: navigating to a doc with the new section type renders the section (not blank, not error)
- Route smoke-test: both archive AND detail routes resolve for at least one real published document

Add domain-specific ACs from the reference files below.

### Post-Epic Close-Out

The template has a mandatory close-out sequence. Do not modify it. It must appear verbatim:

1. `git status` must show nothing staged or unstaged
2. Run `/mini-release EPIC-XXXX [Epic name]` or `/release` for MINOR version bumps
3. Start next epic only after mini-release commit is confirmed

---

## Domain Reference Files

Read before writing the relevant sections of an epic:

- `references/schema-patterns.md` — schema authoring conventions, field type rules, registration
- `references/groq-patterns.md` — projection patterns, slug queries, archive query rules
- `references/migration-patterns.md` — dry-run pattern, idempotency, nanoid fallback, abort window

---

## Epic Sizing

Epics should be executable in a single Claude Code session without hitting context limits.
If the scope exceeds roughly 8–10 files to modify, consider splitting into sequential epics.

**Phase pattern for large work:**
- Phase 1: Schema + query layer (Studio + GROQ)
- Phase 2: Render layer (Frontend components + CSS)
- Phase 3: Migration + cleanup

Each phase produces a mini-release commit before the next phase begins.

**Warning signals that an epic is too large:**
- More than 3 new schema types in a single epic
- More than 5 doc types in the doc type coverage audit all marked "in scope"
- Migration script + new component + new route all in the same epic
- "And also while we're in there..." scope additions after the gate is complete

---

## Common Epic Failure Modes

- Gate left incomplete → Claude Code makes unsafe assumptions to proceed
- File paths not verified → wrong-location file creation; history is polluted
- Enum values reconstructed from memory → silent badge failures
- All four slug queries not updated when a new section type is added → data present in
  Studio, absent in frontend for certain page types
- Migration script without dry-run verification → data changes without confirmation
- Adapter not scoped when DS component is modified → component works in Storybook,
  breaks in web app
- `featuredImage` anywhere in scope → deprecated field surfaces again; requires follow-on cleanup
