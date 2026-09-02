# PROMPT — Sugartown New Tool Assistant
**Version:** v1 (2026-09-02)

Run this to create a new **tool** — a validator, gate, hook, script, generator, command or
skill. Produces a GitHub issue and nothing else. The issue body is the spec.

Use `/new-epic` instead when the work changes what a user sees: a page, a section, a schema
field, content, a component. Use this when the work changes what the *repo* does to itself.

---

## What this skill produces

- One **GitHub issue** in `bex-sugartown/sugartown`, on project 1 with `Priority` set. Its
  number is the tool's `ST-{n}` ID.
- **No backlog doc.** The remit lives in the issue body and nowhere else. A tool spec split
  across an issue and a file is two copies of one thing, and the copy that gets missed is the
  one someone reads.
- **No commit**, because nothing is written to disk.

---

## Why this is not `/new-epic`

`/new-epic` asks about component reuse, doc-type coverage, schema fields, GROQ projections,
enum audits, themed colour variants and a visual QA gate. A validator has none of those, so a
tool authored through `/new-epic` carries ten sections marked N/A and none of the questions that
actually decide whether the tool works.

This skill asks the eight that do. Seven come from things this repo already got wrong.

---

## Invariants

- The issue is created FIRST. Its number is the `ST-{n}` ID. Never invent or derive it.
- **Every section below is answered in the issue body before the issue is created.** No `TODO`.
  A tool issue with an unanswered section is not ready and does not get filed.
- Nothing is written to `docs/backlog/`.
- Status is a byproduct: `Backlog` at creation → `Todo` when the human prioritizes →
  `In Progress` at execution → `Done` when committed (CLAUDE.md §Issue status = workflow stage,
  the non-epic table).
- A stated dependency ("blocked on #N") goes in the issue body. GitHub has no relation field.

---

## STEP 0 — GATHER

Free text:

1. **Tool name** — what it is called (e.g. "validate:banned-words", "/sweep", "post-commit mirror")
2. **One line** — what it enforces, generates, or reports

Then one `AskUserQuestion` call with two questions:

```
Question 1: "Priority?"
  🔴 Now — blocks current work
  🟢 Next — high value, ready to pick up
  🟣 Soon — post-sprint
  ⚪ Later — no urgency

Question 2: "Does this tool block, or advise?"
  "Blocking — fails a commit, a build, or a gate"
  "Advisory — reports and continues"
  "Session-invoked — a human or agent runs it deliberately"
```

The blocking answer is not cosmetic. It decides where the tool is wired and what its failure
mode costs, and it is the second-most-common thing to get wrong after forgetting to wire it up
at all.

---

## STEP 1 — ANSWER THE EIGHT

Draft these before creating the issue. Show them to the human. Every one is answered; "none" and
"not applicable" are valid answers but must be written, not omitted.

### 1. Who reads the output?

Name the file, page, command or person that consumes what this produces. **If you cannot name
one, do not build it.**

> `governance.json` was generated on every build and read by nothing, for seven weeks.
> CLAUDE.md §Building a mechanism, rule 1.

### 2. Where does it run?

Pre-commit, CI, a `package.json` script, a session skill, or by hand. Name the file that
invokes it.

> ESLint boundary rules sat inert for 176 days while reporting as configured (INC-011). A tool
> wired to nothing is worse than no tool, because it reports success.

### 3. Blocking or advisory?

From Step 0. If blocking, state what a failure looks like to whoever hits it and how they clear
it. If advisory, state who reads the report and when.

### 4. How would you know it had stopped working?

The probe. Describe the deliberate violation that must make it fail. If nothing can be planted
that it would catch, it cannot be tested and the tool is a claim, not a check.

> ST-95 exists because gates reported green while inert. `pnpm validate:liveness-probes` runs
> six gates against a known-bad input each and fails if any stays green.

### 5. Kill criterion

The condition under which this tool is retired, set now, before it exists. A date, a count, or
a state.

> ST-95 set one at birth: "if the probes find nothing new in 60 days, retire them."
> A guard is never widened to fit a breach (rule 2) — it is cut, or retired with a reason.

### 6. Does it generate a register?

If the tool produces any mapping — IDs to owners, files to states, rules to enforcement — it is
generated on demand by a command, never hand-maintained.

> Five hand-maintained registers produced wrong counts in every direction, repeatedly.
> CLAUDE.md §Building a mechanism, rule 3.

### 7. Which repos?

`sugartown` only, or cross-repo. If cross-repo, state how the other repositories reach it —
`resume-factory/os` and `cms-eval/toolkit` have their own pre-commit gates and no
`.claude/skills/` directory, so a skill does not reach them.

### 8. Dependent documentation

**Conditional, not required.** The test: **does this change a workflow someone follows, or a
claim a doc makes?**

- Yes → name the file and the section. It is in scope.
- No → write "none". An explicit no is a decision; an omission is a gap.

Do not update a doc because a tool exists. Update it because a tool changed what the doc says.

---

## STEP 2 — CREATE THE ISSUE

```bash
gh issue create --title "{tool name} — {what it enforces}" --body "{the eight, filled}"
```

Read back the number. Then add to the board and set `Priority`:

```bash
gh project item-add 1 --owner bex-sugartown --url {issue url}
```

`item-add` returns before the item is queryable. Retry the lookup rather than assuming one call
is enough:

```bash
for i in 1 2 3 4 5 6 7 8; do
  ITEM=$(gh project item-list 1 --owner bex-sugartown --limit 200 --format json \
    | jq -r ".items[] | select(.content.number=={n}) | .id")
  [ -n "$ITEM" ] && break
done
```

| Step 0 | `Priority` | `--single-select-option-id` |
|---|---|---|
| 🔴 Now | `Urgent` | `7b41a996` |
| 🟢 Next | `High` | `87e13e6c` |
| 🟣 Soon | `Medium` | `e7d4aafe` |
| ⚪ Later | `Low` | `2d6a366f` |

```bash
gh project item-edit --project-id PVT_kwHODqg2Fc4BP7M2 --id "$ITEM" \
  --field-id PVTSSF_lAHODqg2Fc4BP7M2zhdTuD8 --single-select-option-id {from the table}
```

> Option IDs are stable only while the `Priority` option list is untouched. Editing a
> single-select recreates every option with a new ID and wipes the value on every item on the
> board. If `item-edit` rejects an ID, re-read with
> `gh project field-list 1 --owner bex-sugartown --format json` and update this table rather
> than working around it.

`Urgent` or `High` → set `Status` to `Todo` (option id `9daaa907` on field
`PVTSSF_lAHODqg2Fc4BP7M2zg-MUFI`). `Medium` or `Low` → leave at `Backlog`. A priority meaning
"ready to pick up" alongside a status meaning "not queued" is a contradiction, not a default.

The `Issue added to project` workflow stamps `Backlog` on arrival, so `Todo` is set after
boarding, not instead of it.

---

## STEP 3 — REPORT

```
━━━ NEW TOOL FILED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✅  GitHub: #{n} → {url} (ID: ST-{n}, Backlog, priority {P})
  ✅  Remit: in the issue body. No backlog doc by design.
  ✅  Docs: {named file, or "none — nothing a doc claims changes"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Activation gate (CRITICAL)

**This replaces the backlog-stub gate that `/new-epic` relies on.** CLAUDE.md's Incomplete epic
doc hard stop reads `docs/backlog/ST-{n}-*.md`. A tool has no such file, so that gate does not
fire and this one takes its place.

Before executing a tool issue — "execute {n}", "build it", "start" — read the issue body and
check that all eight sections are answered. If any is missing, or contains `TODO`:

1. Stop. Write no script, no hook, no config.
2. Say which sections are unanswered.
3. Fill them collaboratively, then ask via `AskUserQuestion`:
   ```
   "Spec complete — build it?"
     - "Yes — build it"
     - "Not yet — more sections need work"
   ```

**Section 1 is the hard one.** If the reader cannot be named, the answer is not to build it and
find a reader later. It is to close the issue.

---

## Enforcement rules

- Never guess `ST-{n}`. Use the number GitHub returns.
- Never write to `docs/backlog/`. If the work needs a backlog doc, it is an epic — stop and use
  `/new-epic`.
- Never file with a section unanswered.
- Before Step 2, check for an existing tool that covers this. Extend it rather than forking it —
  a second validator doing 80% of the same job is the fork this repo's Atomic Reuse Gate exists
  to prevent. If one exists, show it and ask whether to extend or proceed.
- A tool that only reports, with no reader named in section 1, is not filed.
