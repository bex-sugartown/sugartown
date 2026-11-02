# Project Artifacts

**Version:** v1.0
**Status:** Active
**Owner:** Bex Head
**Last updated:** 2026-11-02
**Related:** `docs/conventions/machine-readable-docs.md`, `.claude/skills/sugartown-project-export/SKILL.md`

---

## What this covers

Each Sugartown project produces a set of documents, and each kind has one default location. This file lists the locations and says how to package one project's documents into a folder for sharing.

This file does not cover `resume-factory` or `cms-eval`. Each has its own rules file.

## Where each artifact lives

This table lists each kind of artifact, where it is saved by default, and whether git tracks it. `{slug}` is the project's short name and `{n}` is its GitHub issue number.

| Artifact | Default location | In git | Written by |
|---|---|---|---|
| Human PRD | `docs/briefs/{slug}-prd.md` | yes | `sugartown-prd-writer` |
| AI PRD | `docs/briefs/{slug}-ai-prd.md` | yes | `sugartown-prd-ai-writer` |
| Prototype brief, findings and code | `docs/drafts/{name}-prototype/`, where `{name}` is what it tests | no | `sugartown-prototype-writer` |
| FSD | `docs/briefs/{slug}-fsd.md` | yes | `sugartown-fsd-writer` |
| Epic, in progress | `docs/backlog/ST-{n}-{slug}.md` | yes | `sugartown-epic-writer` |
| Epic, finished | `docs/shipped/ST-{n}-{slug}.md` | yes | moved at close-out |
| Visual spec, in progress | `docs/drafts/ST-{n}-{slug}.vspec.html` | no | Phase 0 of an epic |
| Visual spec, approved | `docs/shipped/ST-{n}-{slug}.vspec.html` | yes | copied at close-out |
| Diagram source | `docs/diagrams/` | yes | committed before any upload |
| Issue text and close-out evidence | GitHub issue `#{n}` on `bex-sugartown/sugartown` | no | the tracker |
| One-line change summary | `CHANGELOG.md`, `[Unreleased]` | yes | epic close-out |

## What local-only means

Files in `docs/drafts/` are not in git. A fresh clone, or the other machine, does not have them. Prototype findings are therefore summarised into the AI PRD, which is tracked, so the conclusion survives even if the folder does not.

## How to find every file for one project

Search by slug and by issue number. The commands below list the tracked and local files for a project.

```bash
find docs/briefs docs/backlog docs/shipped docs/diagrams -maxdepth 1 \( -name "{slug}*" -o -name "ST-{n}-*" \)
find docs/drafts -maxdepth 1 \( -name "*{slug}*" -o -name "ST-{n}-*" -o -name "*prototype*" \)
gh issue view {n} --json title,state,body
```

Use `find`, not shell wildcards with `ls`. In zsh, one wildcard with no match stops the whole command. The prototype search is wider because a prototype folder is named for what it tests, which can differ from the project slug. Confirm each prototype folder belongs to the project before including it.

A project can have more than one issue number (for example one per epic). Run the search for each.

## Related issues

An issue belongs to a project if it is set **Relates to** one of the project's issues in GitHub. A passing mention in a document or comment does not count. Read the list with this command, replacing `N` with the issue number:

```bash
gh api graphql -f query='{ repository(owner:"bex-sugartown", name:"sugartown") { issue(number: N) { relatesTo(first: 50) { nodes { number title state } } } } }'
```

The rule: when work finds a bug, depends on one, or spawns a follow-up, set that issue **Relates to** the project's issue at that moment (issue sidebar, Relationships). The relationship shows on both issues. Use **Blocked by** only for a dependency that blocks the work.

## Exporting a project for sharing

Packaging a project into a share folder is by choice and never automatic. Run `/sugartown-project-export` and name the project. The skill finds the files above, asks which to include, copies them (never moves them) into `SUGARTOWN_DEV/exports/{slug}-{date}/`, and writes a `README.md` at the top of that folder. A `.zip` is made only on request.

The export is a snapshot. It does not update when the originals change. To refresh one, run `/sugartown-project-export update` and name the project. The skill compares each copied file with its source using the fingerprints in the export's `export-manifest.json`, shows what changed, applies the changes you pick, and adds a dated entry to the README's update log.

The skill never includes `.env` files, anything under `cms-eval/bound/`, or anything under `resume-factory/private/`. Each export asks who the readers are, because `docs/drafts/` files and issue comments can hold private notes.
