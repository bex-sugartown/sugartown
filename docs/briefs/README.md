# Briefs

Canonical constraint documents that lock strategic decisions before implementation begins. Equivalent to PRDs in a traditional product management workflow.

## What belongs here

A brief is a **prescriptive** document that constrains future work. It answers "what are we building and what are the rules?" — not "how did we build it?" (that's `docs/architecture/`) or "build it now" (that's `docs/shipped/`).

Not every brief needs a matching entry in the site's `project` taxonomy (`/projects`), and not every project needs a brief. See **Project ID litmus test** below before creating either one.

## Naming convention

Files that map to a live `project` doc are prefixed with that project's ID: `PROJ-{NNN}-{descriptive-name}.md`. This keeps one project's multiple PRDs (e.g. PROJ-001 has a canonical PRD plus two superseded/companion docs) visually grouped by filename without needing per-project subfolders. Briefs with no project mapping (audits, ADRs, content briefs, umbrella strategy docs) keep a plain descriptive filename — no prefix. When a brief later gains a Project ID (see litmus test below), rename the file to add the prefix in the same commit that adds the ID to its header, and grep the repo (including `apps/studio`) for references to the old filename before renaming.

### Strategy & Governance

| Brief | Scope | Project ID | Status |
|-------|-------|------------|--------|
| [ia-brief.md](ia-brief.md) | Information architecture — routing, navigation, content types, archive setup, phase gates | N/A — site-wide constraint, not a single project | Locked (2026-02-26) |
| [ai-ethics-and-operations.md](ai-ethics-and-operations.md) | AI ethics policy — 12 operating principles, accountability, transparency, bias, attribution | N/A — policy, not a project | Active (review June 2026) |
| [PROJ-005-monorepo-prd.md](PROJ-005-monorepo-prd.md) | Monorepo consolidation — MACH alignment, CMS portability, pnpm/Turbo architecture | **PROJ-005** (Mini-repo) | Complete (implemented) |
| [platform-evolution-prd.md](platform-evolution-prd.md) | Platform-wide evolution strategy — spans multiple projects (references PROJ-005 directly) | N/A — umbrella strategy doc, not a single project | Active |
| [PROJ-002-resume-factory-prd.md](PROJ-002-resume-factory-prd.md) | Resume Factory v3 — Sanity + React migration from Python/CSV, slot/variant data model, PDF/MD/HTML export | **PROJ-002** (The Resume Factory) | Not started |
| [sugartown-mcp-prd.md](sugartown-mcp-prd.md) | Sugartown MCP Server | Gap — no matching `project` doc exists yet | Draft |
| [lightroom-sanity-publish-prd.md](lightroom-sanity-publish-prd.md) | Lightroom Publish Adapter (Sugartown Asset Pipeline) | Gap — no matching `project` doc exists yet | Draft |
| [design-alignment-checker-prd.md](design-alignment-checker-prd.md) | Design Alignment Checker POC — upload-based Match/Drift/Missing comparison tool | Intentionally none yet — app name is an open decision in the PRD itself; create the project doc once named | Draft |
| [SUG-127-architecture-decisions.md](SUG-127-architecture-decisions.md) | Architecture Decision Record | N/A — ADR, not a project | Reference |
| [structured-content-audit.md](structured-content-audit.md) | Structured content audit | N/A — audit, not a project | Reference |
| [taxonomy-vocabulary-audit-2026.md](taxonomy-vocabulary-audit-2026.md) | Taxonomy vocabulary audit | N/A — audit, not a project | Reference |
| [vendor-eval-vercel-vs-netlify.md](vendor-eval-vercel-vs-netlify.md) | Vendor evaluation — Vercel vs Netlify | N/A — evaluation, not a project | Reference |

### Design System

| Brief | Scope | Project ID | Status |
|-------|-------|------------|--------|
| [design-system/PROJ-003-design-system-prd.md](design-system/PROJ-003-design-system-prd.md) | DS philosophy — three-layer token architecture, component contracts, portability, accessibility | **PROJ-003** (Pink Moon Design System) | Active (component contracts evolving) |
| [design-system/PROJ-003-design-system-ruleset.md](design-system/PROJ-003-design-system-ruleset.md) | DS governance — dependency direction, separation of concerns, progressive enhancement, pre-ship checklist | Companion to PROJ-003, not a separate project | Active |
| [design-system/PROJ-003-pink-moon-manifesto.md](design-system/PROJ-003-pink-moon-manifesto.md) | Visual identity manifesto | Companion to PROJ-003, not a separate project | Reference |

### Sanity & CMS

| Brief | Scope | Project ID | Status |
|-------|-------|------------|--------|
| [sanity/PROJ-001-sugartown-cms-canonical-prd.md](sanity/PROJ-001-sugartown-cms-canonical-prd.md) | Canonical CMS PRD — supersedes the two rows below | **PROJ-001** (Sugartown CMS) | In Review |
| [sanity/PROJ-001-studio-setup.md](sanity/PROJ-001-studio-setup.md) | Studio configuration — project, dataset, scheduling policy, schema registration | Companion to PROJ-001, not a separate project | Active |
| [sanity/PROJ-001-content-model-strategy-superseded.md](sanity/PROJ-001-content-model-strategy-superseded.md) | V1 content model — three-layer content architecture, reference-over-string principles, migration readiness | **PROJ-001** (Sugartown CMS) | Superseded by the canonical PRD above — kept as historical context |

### Content Briefs

| Brief | Scope | Project ID | Status |
|-------|-------|------------|--------|
| [content/consultant-positioning-brief.md](content/consultant-positioning-brief.md) | Consultant positioning copy direction | N/A — content brief, not a project | Reference |
| [content/homepage-content-brief.md](content/homepage-content-brief.md) | Homepage copy direction | N/A — content brief, not a project | Reference |
| [content/platform-content-brief.md](content/platform-content-brief.md) | Platform page copy direction | N/A — content brief, not a project | Reference |
| [content/services-content-brief.md](content/services-content-brief.md) | Services page copy direction | N/A — content brief, not a project | Reference |

### Migration & Tooling

| Brief | Scope | Project ID | Status |
|-------|-------|------------|--------|
| [wp-freeze-cutover.md](wp-freeze-cutover.md) | WordPress migration — content freeze, DNS cutover, rollback plan | N/A — completed migration plan, not a project | Complete (executed) |
| [url-audit-spider-spec.md](url-audit-spider-spec.md) | URL spider tool — crawl strategy, classification rules, output format | N/A — completed tactical tool, not a project | Complete (implemented) |

### Live projects with no brief (reverse gap)

The `project` taxonomy currently has 7 documents (`/projects`). Two have no corresponding file here — worth a look, not necessarily an action:

- **PROJ-004** (Knowledge Graph Viz) — no brief in this folder
- **PROJ-006** (Sugartown Shopify) — no brief in this folder
- **PROJ-007** (POC: Contentful + Shopify) — intentionally lightweight/temporary per project-split planning notes; not a real gap

## Project ID litmus test

Not every brief needs a `project` entity, and not every project needs a brief. Before creating either:

**Would this project require a PRD?**
Yes, if it's substantial enough to warrant its own status (Dreaming → Iterating), KPIs, and priority in the `project` schema — the things a live project doc actually tracks. A project with active epics and no PRD is a real gap worth closing.

**Would this PRD require a project?**
Only if it names something with its own users, scope, and success criteria distinct from everything else already tracked. It does **not** need a project if it is:
- an audit, evaluation, or ADR (records a decision or finding, isn't itself a thing being built)
- a content brief (locks copy direction for an existing page, not a new initiative)
- a companion/governance doc for a project that already has its own entity (reference that project's ID instead of minting a new one)
- describing something not yet locked enough to name (state that explicitly as an Open Decision in the PRD, the way `design-alignment-checker-prd.md` does, rather than creating a placeholder project early)

When a brief does map to a live project, put a **Project ID** line in the doc's own header (see `PROJ-005-monorepo-prd.md`, `PROJ-002-resume-factory-prd.md`, or `sanity/PROJ-001-sugartown-cms-canonical-prd.md` for the pattern) — not just in this index. The index can drift; the doc's own header shouldn't.

**Aside — no Project ID means the project is still Dreaming.** If a brief has no Project ID yet (per the table above, or the litmus test says it doesn't need a project entity at all), the corresponding project — if and when one is minted — starts at `status: 💭 Dreaming` in the `project` schema (`apps/studio/schemas/documents/project.ts`), not further along the enum (🎨 Designing → 🔄 Iterating). A PRD's scope must be locked and executed first; only then does it earn a Project ID and a live `project` doc. Don't create the `project` document while the PRD is still speculative or its Open Decisions are unresolved — that's how a project doc ends up tracking a thing that doesn't exist yet. `design-alignment-checker-prd.md` is the current example: no Project ID until the app name (an open decision in the PRD itself) is locked.

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
3. Run the Project ID litmus test above — if it maps to a live project, add a **Project ID** line to the doc's own header, not just this index
4. If other files will reference it, use the path `docs/briefs/<filename>` consistently
5. Commit with prefix: `docs(briefs):`
