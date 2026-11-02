---
name: sugartown-project-export
description: >
  Package one Sugartown project's documents into a share folder with a README, by choice.
  Use when Bex says "export this project", "package the docs", "share the PRD and FSD",
  "make a folder I can send", or "bundle the artifacts for X". Copies the PRD, AI PRD, FSD,
  epics, approved vspecs, diagram sources, prototype findings and issue text that she picks,
  into SUGARTOWN_DEV/exports/{slug}-{date}/. Also updates an existing export when she says
  "update the export", "refresh the export" or "add the new changes to the package": it finds
  what changed since the export, applies what she picks, and adds a dated entry to the README.
  Both modes include the release notes that shipped the project, and offer linked issues.
  Never runs unprompted. Status: placeholder, untested. Always produces a folder, never inline
  prose.
---

# Sugartown Project Export

**Status: placeholder.** Written before the first real export. Record in the README's last
line anything this skill got wrong, and fix the skill after the run.

Produces a folder a person outside the repo can read: copies of the project's documents in
reading order, plus a `README.md`. It reads the repo and writes only to the export folder.

Locations of each artifact: `docs/conventions/project-artifacts.md`.

## Modes

| Mode | When | Steps |
|---|---|---|
| Create | No export folder exists for the project | §Create steps |
| Update | An export folder exists and Bex asks to refresh it | §Update steps |

If an export folder exists and Bex asks for an export without saying update, ask which she means.

## Hard stops

| Never | Why |
|---|---|
| Include `.env` files, or anything under `cms-eval/bound/` or `resume-factory/private/` | Secrets and confidential or personal content |
| Move, edit or delete an original | The export is a copy |
| Push, publish or upload the folder | Sharing is Bex's act |
| Write outside `SUGARTOWN_DEV/exports/` | One known destination |
| Overwrite an existing export folder when creating | Add a suffix or ask |
| In update mode, change a file the manifest does not list, or a change Bex did not pick | Update touches only what she selects |

## Intake

Ask only what is missing, one question at a time, three at most.

- Project slug, or one or more issue numbers
- Who the readers are: internal, or someone outside (a boss, a hiring manager, a client)

## Create steps

1. **Find the files.** Use the `find` commands in `docs/conventions/project-artifacts.md`
   §How to find every file for one project (not `ls` with wildcards: in zsh one unmatched
   wildcard stops the whole command). A project may span several issue numbers: search each.
   Prototype folders are named for what they test, so list every `*prototype*` folder in
   `docs/drafts/` and ask which belong to the project.
   **Release notes.** For each issue number searched, find the releases that cite it (as `#n`,
   `ST-n` or `SUG-n`):
   `grep -lE "(#n|ST-n)([^0-9]|$)" docs/release-notes/RELEASE_NOTES_v*.md`, then read the
   matching `CHANGELOG.md` version blocks. Group by version. If an ID appears only under
   `[Unreleased]`, the project has not shipped: copy those CHANGELOG lines to
   `release-notes/CHANGELOG-unreleased.md` under a header saying "Not yet released as of
   {ISO date}". If a GitHub Release exists (`gh release view vX.Y.Z --json tagName,name,body,publishedAt,url`),
   add its body as `release-notes/github-release-vX.Y.Z.md`.
   **Linked issues.** Scan the included documents and issue text for `#n` and `ST-n`. Match
   `#` plus 1 to 4 digits that is not preceded by a letter, digit or `&` and not followed by a
   letter or digit (`grep -oE "(^|[^A-Za-z0-9&])#[0-9]{1,4}([^A-Za-z0-9]|$)"`), so hex colours
   such as `#888888` and `#22263c` are ignored. Test fixtures such as `#1` will still match,
   which is why Bex picks. Drop numbers already searched. Show the rest as a table: number,
   title (`gh issue view`), state, where it is cited.
2. **Show what was found** as a table: path, kind, whether it is tracked in git or local-only.
3. **Ask what to include** with `AskUserQuestion`, `multiSelect: true`, one option per group
   found (human PRD, AI PRD, FSD, epics, approved vspecs, diagram sources, prototype findings,
   issue text, release notes, each linked issue). Linked issues are listed one by one so Bex
   picks which bugs and follow-ups join the `issues/` folder. For outside readers, recommend leaving out prototype code and raw issue
   comments, which can hold private notes, and say so in the option text.
4. **Create the folder** `SUGARTOWN_DEV/exports/{slug}-{YYYY-MM-DD}/`. If it exists, add `-2`
   and say so.
5. **Copy with `cp`**, one numbered subfolder per group in reading order, for example
   `01-human-prd/`, `02-ai-prd/`, `03-fsd/`, `04-epics/`. Keep original file names. Release notes go in `release-notes/`, one file per
   version, named as in the repo. For issue
   text, write `gh issue view {n} --json title,state,body` (and comments only if the reader
   choice allows) to `issues/ST-{n}.md`, and record `comments: true` or `false` for that file
   in the manifest.
6. **Scan the copy for secrets.** Run
   `grep -rniE "(api[_-]?key|secret|token|password)[\"' ]*[:=][\"' ]*[A-Za-z0-9_\-]{12,}" <folder>`
   and show any hit to Bex before finishing. Remove the file from the copy if she says so.
7. **Write `README.md`** at the folder root (see below).
8. **Write `export-manifest.json`** at the folder root (see §Manifest).
9. **Zip only on request:** `ditto -c -k --keepParent --norsrc --noextattr --noqtn <folder> <folder>.zip`.
   The three flags keep macOS metadata out of the zip. Without them every file gains a hidden
   `._` twin. Check with `unzip -Z1 <zip> | grep -v '/$' | wc -l`: it must equal the folder's
   file count. Do not overwrite an existing zip; add `-2`.
10. **Report:** the folder path, file count, total size, and the README's first paragraph.

## Manifest

`export-manifest.json` is the update mode's memory. It is generated, never edited by hand. It
holds:

| Field | Content |
|---|---|
| `slug`, `created`, `lastUpdated` | project short name and ISO dates |
| `commit` | short commit id at the last create or update |
| `readers` | `outside` or `internal` |
| `issues` | the issue numbers searched, plus any linked issue Bex added |
| `releases` | versions whose notes are included, or `unreleased` |
| `excluded` | groups Bex declined, so update does not offer them again |
| `files` | one entry per copied file: `copy` (path in the folder), `source` (repo path, `gh:issue/{n}`, or `changelog:unreleased` for the unreleased excerpt), `sha256` of the copy as exported, and for an issue copy `comments` (`true` if the copy includes the issue's comments, `false` if body only) |
| `history` | one entry per update: date, commit, files changed |

For an issue, the fingerprint is the sha256 of the generated Markdown (title, state, body and
comments), so a new comment or a closed state counts as a change. The README says the file is
for the update command and readers can ignore it.

## README contents

Write for a reader who has never seen the repo.

1. Title, ISO date, and one paragraph saying what the project is and what the folder holds.
2. Who it is for.
3. Reading order, as a table: file, what it is, status (draft, approved, shipped).
4. How the documents relate: human PRD says what and why, AI PRD says what must be true and how
   it is checked, FSD says how the system behaves, epics say what was built and in what order.
   Name only the ones included.
5. Glossary (see §Glossary).
6. What is not included, and why.
7. Provenance: repo, short commit id (`git rev-parse --short HEAD`), the statement that the
   files are a snapshot taken on that date, and that repo paths inside the documents (for
   example `docs/briefs/`) refer to the repository, not to files in this folder.
8. One closing line: anything this skill got wrong on this run.

A `Last updated:` line sits under the date once an export has been updated, and an `## Update log`
section (see §Update steps) sits before the closing skill-notes line.

Follow `docs/conventions/instruction-writing-style.md` for the wording: short sentences, no em
dashes, ISO dates.

## Glossary

The README carries a mini glossary so a reader outside engineering can follow the documents
without a human PRD or a search engine.

- **Which terms:** every tool, acronym, internal method name and file-type name in the included
  documents that a non-engineer may not know (for example Axe, Playwright, smoke test, WCAG).
  Find them by reading the included files, not by guessing. Leave out words the documents
  already explain.
- **Where a term has two meanings in these documents, list both.** (Example: a "node" is a
  Sugartown content type and also an element flagged by an accessibility scan.)
- **Source of wording:** check whether the term is in the Sugartown glossary at
  `https://sugartown.io/glossary/{slug}` (read-only). If it is, use that definition, shortened,
  and mark the row `(site)`. If not, write one plain sentence a non-engineer can follow. Do not
  invent a definition you cannot state accurately; mark it `(check)` and ask Bex.
- **Format:** a table of term and meaning, alphabetical, one or two sentences each, no em dashes.
  Start the section with a line saying what the table is.
- **Approval:** show the glossary to Bex with the README draft (`AskUserQuestion`: "Write it" or
  "Needs edits") before saving. It is reader-facing content with factual claims about tools.

## Update steps

1. **Locate the export:** `find SUGARTOWN_DEV/exports -maxdepth 1 -name "{slug}-*"` (folders
   only). If several match, ask which. Read `export-manifest.json`.
2. **No manifest?** Backfill one: for each file in the folder except `README.md`, work out its
   source from the naming in `docs/conventions/project-artifacts.md` and record it with the
   sha256 of the copy as it stands. For an issue copy, set `comments` to `true` if the file has a
   `## Comment` heading, else `false`. A file whose source cannot be found is listed to Bex and
   left out of the manifest. Say that the manifest was backfilled. A backfill adds a file to the
   export, so it always adds the manifest row to the README's reading order table and one
   `## Update log` entry, even when no content changed.
3. **Re-find the sources:** run the same `find` commands as create step 1 and regenerate the
   issue Markdown into a temp folder, each with its recorded `comments` setting (a different
   setting would make an unchanged issue look Changed). Re-run the release-note search too: an ID that was under
   `[Unreleased]` and now sits in a version block means the project has shipped, so
   `release-notes/CHANGELOG-unreleased.md` is Removed and the release note is New. Re-scan for
   linked issues not yet in the manifest. Compute sha256 for each.
4. **Classify each file** and show one table:

   | Class | Meaning |
   |---|---|
   | Changed | source sha256 differs from the manifest |
   | New | found now, not in the manifest, and its group is not in `excluded` |
   | Removed | listed in the manifest, source no longer exists |
   | Unchanged | same sha256 |

5. **Nothing changed?** Say so and stop. Do not touch the README, manifest or zip, unless step 2
   backfilled the manifest (then only the README note in step 2 and the manifest itself).
6. **Ask what to apply** with `AskUserQuestion`, `multiSelect: true`, one option per Changed,
   New or Removed group. Removed files are deleted from the export only if selected.
7. **Apply:** replace changed files in place with `cp`. Put new files in their group's
   numbered subfolder, or in the next free number for a new group (do not renumber). The
   previous version is not kept: the README log records the change.
8. **Scan what was added or changed** for secrets and forbidden paths, as in create steps 6
   and the checklist. Show any hit.
9. **Update the README:** add a `Shipped:` line under the date (`Shipped: v0.39.0 (2026-11-14)`,
   or `Shipped: not yet (CHANGELOG lines only)`). Set `Last updated: {ISO date}`, add or amend
   rows in the reading order table, and append to `## Update log` (create it if missing) one
   entry: date, short commit id, and a table of file, change (changed, new, removed) and one
   line of what changed. When the project has shipped since the last update, the entry says
   "Shipped in vX.Y.Z" and lists the release note file and any new linked issues.
   Read the changed file to write that line; do not guess. If a Changed or New file uses a term
   the glossary lacks, propose the additions in the same approval step and log them.
10. **Update the manifest:** new sha256 values, `lastUpdated`, `commit`, and a `history` entry.
11. **Zip:** if a zip for this export exists, build
    `{folder}-updated-{ISO date}.zip` with the flags in create step 9 and the same count check.
    Add `-2` for a second update on the same day. Leave every earlier zip untouched. If no zip
    exists, make none.
12. **Report:** the change table, the log entry, and the new zip path if any.

## Checklist before reporting done

- [ ] Every copied file exists in the folder and is listed in the README
- [ ] No `.env`, `bound/` or `private/` path in the folder: `find <folder> \( -name ".env*" -o -path "*bound*" -o -path "*private*" \)` prints nothing
- [ ] The secret scan ran and its hits were shown
- [ ] Originals are unchanged: `git status --short` shows nothing new in the repo
- [ ] The README names what was left out
- [ ] Create mode: `export-manifest.json` lists every copied file
- [ ] Update mode: the README log entry matches the files actually changed, the manifest was
      updated, and no earlier zip was modified
