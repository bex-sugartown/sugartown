# SUG-56 — Structured Content: Computed Enrichments, Industry, Audience

**Linear Issue:** SUG-56
**Status:** Backlog
**Priority:** Low
**Source:** `docs/briefs/structured-content-audit.md`
**Depends on:** SUG-54, SUG-55

---

## Model & Mode [REQUIRED]

> Use Claude Code's `opusplan` alias for this epic. Opus handles planning
> (Pre-Execution Gate → Files to Modify), Sonnet handles execution
> (code changes, migration runs, acceptance tests). The handoff is automatic
> when you exit plan mode.
>
> **Session setup:**
> 1. `/model opusplan` — set once at session start
> 2. `Shift+Tab` until status bar reads "plan mode"
> 3. Paste this epic as the first prompt
> 4. Review Opus's plan against the gates below; push back until aligned
> 5. Exit plan mode (`Shift+Tab`) — Sonnet takes over for execution
>
> **Override rule:** if Sonnet stalls during execution on something that's
> architectural rather than mechanical (e.g. an unexpected cross-workspace
> type error, a token cascade that isn't resolving), type `/model opus`
> for that single question, then `/model opusplan` to return. Note the
> override in the epic's post-mortem so we learn where Sonnet's ceiling is.
>
> **When to deviate from opusplan:**
> - Pure copy/content epics (no code): use `/model sonnet` — no planning depth needed
> - Pure architecture epics (Schema ERD, SSR strategy, monorepo boundary changes): use `/model opus` — execution benefits from sustained depth too

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — node, caseStudy schemas. Computed enrichments may touch build pipeline.
- [ ] **Design decisions needed** — computed enrichments (publish-time vs build-time), industry (taxonomy vs enum), audience scope
- [ ] **Studio schema changes scoped** — YES. audience enum + industry field/doc type.
- [ ] **Atomic Reuse Gate** — industry may be a new taxonomy doc type (justified if > 5 industries)

---

## Context

Future-scope enrichments from the structured content audit. These push toward the north star where structured fields can fully represent content without the body blob. Requires design decisions before implementation.

## Scope

### 1. Computed enrichments from PortableText body

Derived metadata extracted from body content:
- **Word count** → enables computed readingTime
- **Heading extraction** → auto-generated table of contents
- **Link extraction** → auto-generated bibliography
- **Entity extraction** → suggested tags for editors

Implementation options: Sanity document action (publish-time), build-time script, GROQ computed. Design spike needed.

### 2. `industry` for case studies

Client industry/sector. Makes case studies filterable by industry.

Options:
- New `industry` doc type (most flexible)
- String enum (simpler, limited)

### 3. `audience` enum for nodes

```
Field: audience
Type: string enum
Options: beginner | practitioner | expert
Group: metadata
```

**Open question:** Should this be on articles and case studies too?

---

## Design Decisions Needed (before implementation)

1. Computed enrichments: publish-time action vs build-time script vs deferred
2. Industry: taxonomy doc type vs string enum
3. Audience: nodes only, or all content types?

---

## Files to Modify

TBD after design decisions.

---

## Acceptance Criteria

- [ ] Design decisions documented
- [ ] At least one computed enrichment working (word count)
- [ ] Industry field available on case studies
- [ ] Audience field available on nodes

---

## AEO Cross-Reference (SUG-58)

When this epic ships, update `generateArticleJsonLd()` in `lib/jsonLd.js` (from SUG-58) to include:
- `wordCount` → `wordCount` property on Article schema
- Entity extraction → `mentions[]` array of `Thing` references
- Link extraction → could feed `citation[]` array

The computed enrichments from this epic are the data layer that powers richer structured data markup. SUG-56 produces the raw values; SUG-58's utility consumes them.

---

*Created 2026-04-08.*
