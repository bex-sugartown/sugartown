# SUG-97 — Studio Schema Field Group Audit + Reorg

**Linear Issue:** SUG-97
**Status:** Done
**Shipped:** 2026-05-17 v0.23.34
**Commit:** `feat(studio): SUG-97 schema field group audit + reorg`

---

## What shipped

Three-phase schema group reorganisation across `caseStudy`, `tool`, `article`, and `node`. Schema deployed to production.

### Phase 1 — caseStudy group fixes

Added `retrieval` group. Field movements:

| Field | From | To | Note |
|-------|------|----|------|
| `aeoSummary` | `seo` | `retrieval` | AI retrieval, not SEO |
| `geoSummary` | `seo` | `retrieval` | AI retrieval, not SEO |
| `keyQuestions[]` | `seo` | `retrieval` | AI retrieval, not SEO |
| `challengeSummary` | `metadata` | `migration` | Field is deprecated/hidden — `migration` is more accurate than `content` |
| `outcomes[]` | `metadata` | `migration` | Already was in `migration` — no change needed |

**Deviation from spec:** Epic said move `challengeSummary` → `content`. Actual schema inspection showed the field is marked `deprecated` and `hidden: true`. Moved to `migration` instead — more semantically accurate for a deprecated field. `content` is reserved for live editorial fields.

Group order: Content → Metadata → Retrieval → SEO → Migration → Legacy

### Phase 2 — tool schema: add groups

Added `basics` (default) and `media` groups. All 7 fields assigned:

| Group | Fields |
|-------|--------|
| `basics` | `name`, `slug`, `kind`, `toolType`, `description`, `url` |
| `media` | `logo` |

### Phase 3 — retrieval group stubs on article + node

Added `{name: 'retrieval', title: 'Retrieval'}` group definition to both schemas. No fields assigned — placeholder for SUG-94/SUG-96.

---

## Acceptance Criteria

- [x] caseStudy: Retrieval tab contains `aeoSummary`, `geoSummary`, `keyQuestions[]`
- [x] caseStudy: SEO tab contains only title/description/og fields
- [x] caseStudy: `challengeSummary` moved out of Metadata tab (into Migration)
- [x] tool: Basics / Media tabs visible, fields grouped
- [x] `article` and `node` have `retrieval` group in deployed schema
- [x] Schema deployed: `npx sanity schema deploy` — 1/1 schemas deployed
- [x] No content data affected — schema metadata only

---

## Related

- **Upstream:** SUG-93 (added the misplaced fields)
- **Downstream:** SUG-94 (AEO/GEO fields for article/node — uses retrieval group stubs)
- **Downstream:** SUG-96 (outcomes tile "Was:" label)
