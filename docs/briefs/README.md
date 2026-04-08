# Briefs

Canonical constraint documents that lock strategic decisions before implementation begins. Equivalent to PRDs in a traditional product management workflow.

## What belongs here

A brief is a **prescriptive** document that constrains future work. It answers "what are we building and what are the rules?" — not "how did we build it?" (that's `docs/architecture/`) or "build it now" (that's `docs/shipped/`).

### Strategy & Governance

| Brief | Scope | Status |
|-------|-------|--------|
| [ia-brief.md](ia-brief.md) | Information architecture — routing, navigation, content types, archive setup, phase gates | Locked (2026-02-26) |
| [ai-ethics-and-operations.md](ai-ethics-and-operations.md) | AI ethics policy — 12 operating principles, accountability, transparency, bias, attribution | Active (review June 2026) |
| [monorepo-prd.md](monorepo-prd.md) | Monorepo consolidation — MACH alignment, CMS portability, pnpm/Turbo architecture | Complete (implemented) |
| [resume-factory-prd.md](resume-factory-prd.md) | Resume Factory v3 — Sanity + React migration from Python/CSV, slot/variant data model, PDF/MD/HTML export | Not started |

### Design System

| Brief | Scope | Status |
|-------|-------|--------|
| [design-system/design-system-prd.md](design-system/design-system-prd.md) | DS philosophy — three-layer token architecture, component contracts, portability, accessibility | Active (component contracts evolving) |
| [design-system/design-system-ruleset.md](design-system/design-system-ruleset.md) | DS governance — dependency direction, separation of concerns, progressive enhancement, pre-ship checklist | Active |

### Sanity & CMS

| Brief | Scope | Status |
|-------|-------|--------|
| [sanity/studio-setup.md](sanity/studio-setup.md) | Studio configuration — project, dataset, scheduling policy, schema registration | Active |
| [sanity/content-model-strategy.md](sanity/content-model-strategy.md) | V1 content model — three-layer content architecture, reference-over-string principles, migration readiness | Active (specifics evolving) |

### Migration & Tooling

| Brief | Scope | Status |
|-------|-------|--------|
| [wp-freeze-cutover.md](wp-freeze-cutover.md) | WordPress migration — content freeze, DNS cutover, rollback plan | Complete (executed) |
| [url-audit-spider-spec.md](url-audit-spider-spec.md) | URL spider tool — crawl strategy, classification rules, output format | Complete (implemented) |

## How briefs fit the development workflow

This project uses a structured AI-assisted development process where traditional product management artifacts have direct equivalents:

- **Briefs** (`docs/briefs/`) — constraint documents equivalent to PRDs. They lock strategic decisions (information architecture, migration strategy, studio configuration) before implementation begins.
- **Epic prompts** (`docs/shipped/`) — scoped implementation specs equivalent to engineering epics. Each contains context, acceptance criteria, phased scope, and technical constraints. They serve as both the engineering specification and the execution instruction for AI-assisted development.
- **Backlog** (`docs/backlog/`) — unscheduled epic prompts awaiting prioritization, equivalent to a product backlog.
- **Releases** (`docs/release-notes/`) — versioned changelogs following semver, produced by a structured release process with pre-flight validation.

Briefs are authored collaboratively (human + AI), reviewed and locked by the project owner, and referenced by epic prompts as upstream constraints. A brief is never modified without explicit owner approval — epics that discover a brief needs amendment must flag it as a deliverable with a review gate.

## Adding a new brief

1. Create the file in `docs/briefs/` with a descriptive filename
2. Add it to the table above
3. If other files will reference it, use the path `docs/briefs/<filename>` consistently
4. Commit with prefix: `docs(briefs):`
