---
name: sugartown-project-export
description: >
  Package one Sugartown project's documents into a share folder with a README, by choice.
  Use when Bex says "export this project", "package the docs", "share the PRD and FSD",
  "make a folder I can send", or "bundle the artifacts for X". Copies the PRD, AI PRD, FSD,
  epics, approved vspecs, diagram sources, prototype findings and issue text that she picks,
  into SUGARTOWN_DEV/exports/{slug}-{date}/. Never runs unprompted. Status: placeholder,
  untested. Always produces a folder, never inline prose.
---

# Sugartown Project Export

**Status: placeholder.** Written before the first real export. Record in the README's last
line anything this skill got wrong, and fix the skill after the run.

Produces a folder a person outside the repo can read: copies of the project's documents in
reading order, plus a `README.md`. It reads the repo and writes only to the export folder.

Locations of each artifact: `docs/conventions/project-artifacts.md`.

## Hard stops

| Never | Why |
|---|---|
| Include `.env` files, or anything under `cms-eval/bound/` or `resume-factory/private/` | Secrets and confidential or personal content |
| Move, edit or delete an original | The export is a copy |
| Push, publish or upload the folder | Sharing is Bex's act |
| Write outside `SUGARTOWN_DEV/exports/` | One known destination |
| Overwrite an existing export folder | Add a suffix or ask |

## Intake

Ask only what is missing, one question at a time, three at most.

- Project slug, or one or more issue numbers
- Who the readers are: internal, or someone outside (a boss, a hiring manager, a client)

## Steps

1. **Find the files.** Use the `find` commands in `docs/conventions/project-artifacts.md`
   §How to find every file for one project (not `ls` with wildcards: in zsh one unmatched
   wildcard stops the whole command). A project may span several issue numbers: search each.
   Prototype folders are named for what they test, so list every `*prototype*` folder in
   `docs/drafts/` and ask which belong to the project.
2. **Show what was found** as a table: path, kind, whether it is tracked in git or local-only.
3. **Ask what to include** with `AskUserQuestion`, `multiSelect: true`, one option per group
   found (human PRD, AI PRD, FSD, epics, approved vspecs, diagram sources, prototype findings,
   issue text). For outside readers, recommend leaving out prototype code and raw issue
   comments, which can hold private notes, and say so in the option text.
4. **Create the folder** `SUGARTOWN_DEV/exports/{slug}-{YYYY-MM-DD}/`. If it exists, add `-2`
   and say so.
5. **Copy with `cp`**, one numbered subfolder per group in reading order, for example
   `01-human-prd/`, `02-ai-prd/`, `03-fsd/`, `04-epics/`. Keep original file names. For issue
   text, write `gh issue view {n} --json title,state,body` (and comments only if the reader
   choice allows) to `issues/ST-{n}.md`.
6. **Scan the copy for secrets.** Run
   `grep -rniE "(api[_-]?key|secret|token|password)[\"' ]*[:=][\"' ]*[A-Za-z0-9_\-]{12,}" <folder>`
   and show any hit to Bex before finishing. Remove the file from the copy if she says so.
7. **Write `README.md`** at the folder root (see below).
8. **Zip only on request:** `ditto -c -k --keepParent <folder> <folder>.zip`.
9. **Report:** the folder path, file count, total size, and the README's first paragraph.

## README contents

Write for a reader who has never seen the repo.

1. Title, ISO date, and one paragraph saying what the project is and what the folder holds.
2. Who it is for.
3. Reading order, as a table: file, what it is, status (draft, approved, shipped).
4. How the documents relate: human PRD says what and why, AI PRD says what must be true and how
   it is checked, FSD says how the system behaves, epics say what was built and in what order.
   Name only the ones included.
5. What is not included, and why.
6. Provenance: repo, short commit id (`git rev-parse --short HEAD`), and the statement that the
   files are a snapshot taken on that date.
7. One closing line: anything this skill got wrong on this run.

Follow `docs/conventions/instruction-writing-style.md` for the wording: short sentences, no em
dashes, ISO dates.

## Checklist before reporting done

- [ ] Every copied file exists in the folder and is listed in the README
- [ ] No `.env`, `bound/` or `private/` path in the folder: `find <folder> \( -name ".env*" -o -path "*bound*" -o -path "*private*" \)` prints nothing
- [ ] The secret scan ran and its hits were shown
- [ ] Originals are unchanged: `git status --short` shows nothing new in the repo
- [ ] The README names what was left out
