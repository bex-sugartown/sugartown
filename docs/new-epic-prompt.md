# PROMPT — Sugartown New Epic Assistant
**Version:** v1 (2026-04-27)

Run this to create a new backlog epic: Linear issue + backlog stub + priority stack entry + commit.

---

## What this skill produces

- A new **Linear issue** in the Sugartown team with the correct title, description, and priority
- A new **backlog stub file** at `docs/backlog/SUG-{N}-{kebab-name}.md` with standard header block and empty section stubs
- An entry in `docs/backlog/sugartown-backlog-priorities.md` in the correct priority section
- A single commit: `docs(sug-{N}): add {title} backlog epic`

This is a stub, not a full spec. The full spec is filled in when the epic is activated.

---

## Invariants

- The Linear issue must be created FIRST — the SUG-{N} ID it assigns is the canonical identifier for the file and commit.
- Nothing is written to disk until the Linear issue exists and has a confirmed ID.
- The backlog file and priority stack entry are committed together in a single commit.
- Do not pre-fill spec sections with guesses. Stub sections use "TODO" as a placeholder.

---

## STEP 0 — GATHER

Ask the human for:

1. **Epic name** — short title (e.g. "Token file sync audit", "Site-wide search")
2. **One-line description** — what problem this solves or what it delivers (1–2 sentences max)
3. **Tags** — comma-separated (e.g. "Design System, Infrastructure"). Common tags: `Design System`, `Infrastructure`, `UX`, `Schema`, `Content`, `SEO`, `Performance`, `Tooling`
4. **Priority** — choose one:
   - 🔴 Now (blocks current work)
   - 🟢 Next (high value, ready to pick up)
   - 🟣 Soon (post-sprint)
   - ⚪ Later (pre-launch, no urgency)
   - ⬛ Deferred (post-launch)
5. **Merge strategy** — `(a)` merge-as-you-go (one commit per phase, one mini-release at end of each) or `(b)` single close-out (one long-lived branch, one mini-release at the end)

If the human invokes `/new-epic` with inline arguments (e.g. `/new-epic Token sync audit | Design System | 🟢`), parse them directly and skip prompting for provided fields. Still ask for any missing required fields.

---

## STEP 1 — CREATE LINEAR ISSUE

Use the Linear MCP tool `save_issue` to create the issue:

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

After creating the issue, read back the **issue identifier** (e.g. `SUG-87`). This is the canonical ID for the file and commit. Do not proceed without it.

Report to the human: "Linear issue created: [SUG-{N}](url)"

---

## STEP 2 — DERIVE FILE NAME

Convert the epic name to kebab-case:

- Lowercase all characters
- Replace spaces and underscores with hyphens
- Strip special characters except hyphens
- Remove leading/trailing hyphens

Example: "Token file sync audit" → `token-file-sync-audit`

Full filename: `docs/backlog/SUG-{N}-{kebab-name}.md`

---

## STEP 3 — CREATE BACKLOG STUB

Create the file at `docs/backlog/SUG-{N}-{kebab-name}.md`:

```markdown
---
**Epic:** SUG-{N} — {Epic name}
**Linear Issue:** [SUG-{N}](https://linear.app/sugartown/issue/SUG-{N})
**Status:** Backlog
**Priority:** {emoji} {label}
**Merge strategy:** ({a or b}) {strategy label}
---

# SUG-{N} — {Epic name}

{One-line description}

## Background

TODO — why this exists, what problem it solves, what the current state is.

## Scope

TODO — bullet list of what's in scope. Each item should map to an acceptance criterion.

- [ ] ...

## Phases

TODO — if this epic has phases, outline them here. If it's a single-phase epic, remove this section.

## Acceptance criteria

- [ ] ...

## Technical notes

TODO — constraints, dependencies, known gotchas.

## Related

- **Linear:** [SUG-{N}](https://linear.app/sugartown/issue/SUG-{N})
```

Fill in the header block from Step 0 data. Leave all TODO sections as-is — the human fills the spec when activating the epic. The merge strategy label follows the convention from CLAUDE.md:

- `(a)` → `(a) Merge-as-you-go — one commit per phase, one mini-release at end`
- `(b)` → `(b) Single close-out — one long-lived branch, one mini-release at the end`

---

## STEP 4 — ADD TO PRIORITY STACK

Open `docs/backlog/sugartown-backlog-priorities.md`.

Determine which section to insert into based on the priority:

| Priority | Section |
|----------|---------|
| 🔴 Now | `## 01 · Next — high value, ready to pick up` (top of list) |
| 🟢 Next | `## 01 · Next — high value, ready to pick up` |
| 🟣 Soon | `## 02 · Soon` (match the nearest matching section heading) |
| ⚪ Later | `## 03 · Soon — post-sprint, pre-launch` or deferred, whichever fits |
| ⬛ Deferred | `## 03 · Deferred — post-launch` |

Add a new table row in the correct section:

```markdown
| {next number} | **[SUG-{N}](https://linear.app/sugartown/issue/SUG-{N}) · {Epic name}** — {one-line description}. Epic: `docs/backlog/SUG-{N}-{kebab-name}.md`. | `{Tag1}` `{Tag2}` | {priority emoji} {label} |
```

Also update the header block at the top of the file:

- Update the `> Updated` line with today's date and the new SUG-{N} addition
- Update `⚑ Current focus` only if priority is 🔴 Now — otherwise leave unchanged

---

## STEP 5 — COMMIT

Stage and commit both files together:

```bash
git add docs/backlog/SUG-{N}-{kebab-name}.md docs/backlog/sugartown-backlog-priorities.md
git commit -m "docs(sug-{N}): add {epic name} backlog epic"
```

---

## COMPLETION

Print:

```
━━━ NEW EPIC CREATED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  Linear: SUG-{N} → {url}
  ✅  Backlog stub: docs/backlog/SUG-{N}-{kebab-name}.md
  ✅  Priority stack: added to {section name}
  ✅  Committed: docs(sug-{N}): add {epic name} backlog epic

Next: fill in the spec when ready to activate this epic.
Use docs/epic-template.md as a guide for the full spec.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Enforcement rules

- Never guess the SUG-{N} number — always use the one returned by Linear after issue creation.
- Never write to disk before Step 1 completes (no ID, no file).
- Never pre-fill spec sections with invented content — stubs only.
- Never create a duplicate: before Step 1, grep `docs/backlog/` for an existing file with a similar name. If one exists, tell the human and ask for confirmation before proceeding.
