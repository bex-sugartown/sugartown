# SUG-97 — Studio Schema Field Group Audit + Reorg

**Linear Issue:** SUG-97
**Priority:** Normal
**Status:** Backlog

---

## Background

SUG-93 added `challengeSummary`, `outcomes[]`, `aeoSummary`, `geoSummary`, and `keyQuestions[]` to the `caseStudy` schema. These fields were placed in the nearest plausible existing groups (`metadata`, `seo`) rather than groups that reflect their editorial purpose. The result is confusing Studio tabs: challenge summary and outcomes live under Metadata (alongside client, industry, contract type) rather than Content, and the AI retrieval fields share a tab with OpenGraph settings.

A full audit of all 8 document schemas reveals two systemic issues:
1. **Misplaced new fields** on `caseStudy` that landed in wrong groups
2. **Missing groups** on `tool` (all fields ungrouped, renders as a flat unsorted list)

Future epics (SUG-94, SUG-96) will add AEO/GEO retrieval fields to `article` and `node`. This epic pre-establishes the `retrieval` group pattern on `caseStudy` so those epics can follow a consistent convention.

---

## Scope

### Phase 1 — caseStudy group fixes (primary)

Move misplaced fields to correct groups:

| Field | Current group | Correct group |
|-------|--------------|---------------|
| `challengeSummary` | `metadata` | `content` |
| `outcomes[]` | `metadata` | `content` |
| `aeoSummary` | `seo` | `retrieval` (new) |
| `geoSummary` | `seo` | `retrieval` (new) |
| `keyQuestions[]` | `seo` | `retrieval` (new) |

Add new group to `caseStudy` groups array:
```ts
{ name: 'retrieval', title: 'Retrieval', default: false }
```

Group order after change: `content` → `metadata` → `retrieval` → `seo` → `migration` → `legacy`

### Phase 2 — tool schema: add groups

`tool` has 6 fields and no groups. All fields render flat. Add two groups:

| Group | Fields |
|-------|--------|
| `basics` | `name`, `slug`, `toolType`, `description`, `url` |
| `media` | `logo` |

This matches the `project` schema pattern (basics/profile/seo).

### Phase 3 — retrieval group stub on article + node (prep)

Add the `retrieval` group definition to `article` and `node` schemas now — with no fields assigned yet — so SUG-94/SUG-96 can drop fields into an existing group without a second schema restructure commit.

No fields move in Phase 3. This is a groups array addition only.

### Out of scope

- `page`, `archivePage`, `project`, `person` — audited, no issues found
- Adding AEO/GEO fields to `article`/`node` — that is SUG-94 scope
- Adding "Was:" label support to outcomes tiles — that is SUG-96 scope

---

## Audit Findings (full, per doc type)

### caseStudy ✗

Groups defined: `content`, `metadata`, `seo`, `migration`, `legacy`

Issues:
- `challengeSummary` (group: `metadata`) — this is primary editorial content rendered prominently on the case study page, not project metadata. Move to `content`.
- `outcomes[]` (group: `metadata`) — same reasoning. The outcomes strip is a first-class content block, not a CV field. Move to `content`.
- `aeoSummary`, `geoSummary`, `keyQuestions[]` (group: `seo`) — these serve AI/LLM retrieval, not traditional SEO (title/description/og). Mixing them into the SEO tab creates cognitive overhead for editors. New `retrieval` group.

### article ✓ (with future note)

Groups defined: `content`, `metadata`, `seo`, `migration`, `legacy`

No current issues. Add `retrieval` group stub now for SUG-94.

### node ✓ (with future note)

Groups defined: `content`, `metadata`, `seo`, `migration`, `legacy`

No current issues. Many deprecated fields correctly placed in `legacy`. Add `retrieval` group stub now for SUG-94.

### page ✓

Groups defined: `content`, `metadata`, `seo`, `migration`

No issues. `template` is hidden in `content` (fine — structural, not editorial). No `legacy` group needed; no hidden deprecated fields.

### archivePage ✓

Groups defined: `content`, `filtering`, `seo`, `deferred`

Well structured. `filterConfig` correctly in `deferred`. No changes needed.

### project ✓

Groups defined: `basics`, `profile`, `seo`

Well structured. `priority` and `kpis` are hidden but correctly grouped in `basics`. No changes needed.

### person ✓

Groups defined: `basics`, `profile`, `links`, `seo`, `legacy`

Exemplary structure. No changes needed.

### tool ✗

Groups defined: *(none)*

All 6 fields (`name`, `slug`, `toolType`, `description`, `url`, `logo`) are ungrouped. Studio renders them as a flat unsorted list. Add `basics` + `media` groups.

---

## Phases

### Phase 1 — caseStudy reorg
- [ ] Add `retrieval` group to `groups` array in `caseStudy.ts`
- [ ] Move `challengeSummary` group assignment: `metadata` → `content`
- [ ] Move `outcomes` group assignment: `metadata` → `content`
- [ ] Move `aeoSummary` group assignment: `seo` → `retrieval`
- [ ] Move `geoSummary` group assignment: `seo` → `retrieval`
- [ ] Move `keyQuestions` group assignment: `seo` → `retrieval`
- [ ] Deploy schema: `npx sanity schema deploy` from `apps/studio/`
- [ ] Verify Studio tabs in browser: Content / Metadata / Retrieval / SEO / Migration / Legacy

### Phase 2 — tool groups
- [ ] Add `basics` and `media` groups to `tool.ts`
- [ ] Assign all 6 fields to groups
- [ ] Deploy schema
- [ ] Verify Studio: tool doc renders grouped

### Phase 3 — retrieval group stubs
- [ ] Add `retrieval` group definition to `article.ts` groups array (no fields yet)
- [ ] Add `retrieval` group definition to `node.ts` groups array (no fields yet)
- [ ] Deploy schema

---

## Acceptance Criteria

- In Studio, opening a case study shows: Content tab contains `challengeSummary` and `outcomes[]`; Retrieval tab contains `aeoSummary`, `geoSummary`, `keyQuestions[]`; SEO tab contains only title/description/og fields
- Opening a tool doc shows grouped fields, not a flat list
- `article` and `node` schemas have a `retrieval` group in their groups array (visible in deployed schema)
- `pnpm validate:tokens` passes (schema-only changes, no CSS touched — should trivially pass)
- No content data is affected — this is schema metadata only, zero content migration needed
