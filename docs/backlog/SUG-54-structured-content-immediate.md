# SUG-54 — Structured Content: Immediate Schema Improvements

**Linear Issue:** SUG-54
**Status:** Backlog
**Priority:** Medium
**Source:** `docs/briefs/structured-content-audit.md`

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — node schema only. relatedNodes[] adds a new reference array. keyTakeaway adds a string field.
- [ ] **Use case coverage** — relatedNodes enables explicit knowledge graph edges. keyTakeaway enriches headless summaries.
- [ ] **Studio schema changes scoped** — YES. Commit prefix: `feat(studio):`
- [ ] **Web adapter sync scoped** — relatedNodes rendering deferred (schema-only for now)
- [ ] **Atomic Reuse Gate** — no new components

---

## Context

The structured content audit brief identified immediate schema improvements that strengthen the content model without migration scripts.

## Scope

### 1. Inventory remaining htmlSection usage

GROQ count query to identify remaining pure-blob `htmlSection` blocks across all documents.

```groq
*[defined(sections)] {
  "htmlCount": count(sections[_type == "htmlSection"])
}[htmlCount > 0] { _id, _type, title, htmlCount }
```

If < 10, convert manually. If > 10, scope migration script.

### 2. Add `relatedNodes[]` to node schema

Explicit cross-reference between nodes. Makes the knowledge graph queryable without body text parsing.

```
Field: relatedNodes
Type: array of reference to node
Group: metadata
Validation: unique
```

### 3. Add `keyTakeaway` to node schema

Single-sentence structured takeaway for headless summaries.

```
Field: keyTakeaway
Type: string
Max: 200 chars
Group: metadata
Description: "One-sentence takeaway — the lesson in structured form."
```

---

## Files to Modify

- `apps/studio/schemas/documents/node.ts` — add relatedNodes[], keyTakeaway

---

## Acceptance Criteria

- [ ] htmlSection count documented
- [ ] `relatedNodes[]` visible in Studio
- [ ] `keyTakeaway` visible in Studio
- [ ] Headless summary test: node structured fields alone communicate what the content is about

---

*Created 2026-04-08.*
