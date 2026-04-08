# SUG-55 — Structured Content: readingTime, outcomes[], article series

**Linear Issue:** SUG-55
**Status:** Backlog
**Priority:** Low
**Source:** `docs/briefs/structured-content-audit.md`
**Depends on:** SUG-54 (immediate schema work)

---

## Pre-Execution Completeness Gate

- [ ] **Interaction surface audit** — article, node, caseStudy schemas. New `series` doc type.
- [ ] **Use case coverage** — readingTime for cards, outcomes for case study filtering, series for multi-part articles
- [ ] **Studio schema changes scoped** — YES. Multiple schemas + new doc type.
- [ ] **Web adapter sync scoped** — MetadataCard may render readingTime + outcomes
- [ ] **Atomic Reuse Gate** — `series` is a new doc type (justified — no existing equivalent)

---

## Scope

### 1. Add `readingTime` to article + node schemas

```
Field: readingTime
Type: number (minutes)
Group: metadata
Description: "Estimated reading time in minutes. Manual or computed from word count."
```

### 2. Add `outcomes[]` to case study schema

```
Field: outcomes
Type: array of object
  - metric: string (e.g. "Page load time")
  - value: string (e.g. "2.4s → 0.8s")
  - description: text (optional context)
Group: metadata
```

### 3. Add `series` doc type + wire into article

```
series doc type:
  title → string (required)
  slug → slug
  description → text

article schema additions:
  series → reference to series
  partNumber → number
```

---

## Files to Modify

- `apps/studio/schemas/documents/article.ts` — readingTime, series, partNumber
- `apps/studio/schemas/documents/node.ts` — readingTime
- `apps/studio/schemas/documents/caseStudy.ts` — outcomes[]
- `apps/studio/schemas/documents/series.ts` — CREATE
- `apps/studio/schemas/index.ts` — register series

---

## Acceptance Criteria

- [ ] `readingTime` visible in Studio on articles and nodes
- [ ] `outcomes[]` visible in Studio on case studies with metric/value/description
- [ ] `series` doc type registered and creatable in Studio
- [ ] Articles can reference a series with part number

---

*Created 2026-04-08.*
