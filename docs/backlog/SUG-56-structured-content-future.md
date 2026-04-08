# SUG-56 — Structured Content: Computed Enrichments, Industry, Audience

**Linear Issue:** SUG-56
**Status:** Backlog
**Priority:** Low
**Source:** `docs/briefs/structured-content-audit.md`
**Depends on:** SUG-54, SUG-55

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

*Created 2026-04-08.*
