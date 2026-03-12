# Briefs

Canonical constraint documents that lock strategic decisions before implementation begins. Equivalent to PRDs in a traditional product management workflow.

## What belongs here

A brief is a **prescriptive** document that constrains future work. It answers "what are we building and what are the rules?" — not "how did we build it?" (that's `docs/architecture/`) or "build it now" (that's `docs/prompts/`).

| Brief | Scope |
|-------|-------|
| [ia-brief.md](ia-brief.md) | Information architecture — routing, navigation, content types, archive setup, phase gates |
| [studio-setup.md](studio-setup.md) | Sanity Studio configuration — project, dataset, plugins, desk structure |
| [wp-freeze-cutover.md](wp-freeze-cutover.md) | WordPress migration strategy — content freeze, DNS cutover, rollback plan |
| [url-audit-spider-spec.md](url-audit-spider-spec.md) | URL spider tool specification — crawl strategy, classification rules, output format |

## How briefs fit the development workflow

This project uses a structured AI-assisted development process where traditional product management artifacts have direct equivalents:

- **Briefs** (`docs/briefs/`) — constraint documents equivalent to PRDs. They lock strategic decisions (information architecture, migration strategy, studio configuration) before implementation begins.
- **Epic prompts** (`docs/prompts/`) — scoped implementation specs equivalent to engineering epics. Each contains context, acceptance criteria, phased scope, and technical constraints. They serve as both the engineering specification and the execution instruction for AI-assisted development.
- **Backlog** (`docs/backlog/`) — unscheduled epic prompts awaiting prioritization, equivalent to a product backlog.
- **Releases** (`docs/release-notes/`) — versioned changelogs following semver, produced by a structured release process with pre-flight validation.

Briefs are authored collaboratively (human + AI), reviewed and locked by the project owner, and referenced by epic prompts as upstream constraints. A brief is never modified without explicit owner approval — epics that discover a brief needs amendment must flag it as a deliverable with a review gate.

## Adding a new brief

1. Create the file in `docs/briefs/` with a descriptive filename
2. Add it to the table above
3. If other files will reference it, use the path `docs/briefs/<filename>` consistently
4. Commit with prefix: `docs(briefs):`
