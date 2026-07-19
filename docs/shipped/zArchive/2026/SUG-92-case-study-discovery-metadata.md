---
**Epic:** SUG-92 — Case study discovery metadata
**Linear Issue:** [SUG-92](https://linear.app/sugartown/issue/SUG-92)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-92 — Case study discovery metadata

Add additive metadata fields to the `caseStudy` schema to enable sector-based filtering and consulting-context signals: `industry[]`, `companySize`, `region`. No content rewrites — schema, GROQ, and MetadataCard render only.

## Background

The current `caseStudy` schema has strong project-level metadata (client, role, contractType, dateRange, tools) but no sector or scale signals. Prospective consulting clients — especially those evaluating whether Bex has worked in their industry or at their company size — cannot filter or scan for relevant work. This is a pure metadata gap: the data exists in the case study copy but is not structured. Adding three fields closes this gap without touching body copy. This epic is upstream of the AEO/GEO content layer (SUG-93), which will reference industry context in retrieval summaries.

## Objective

After this epic, `caseStudy` documents can be tagged with industry sector, company size, and engagement region. These fields appear in Studio's Metadata group, render in MetadataCard on the detail page, and are queryable via GROQ for future filtering. No content rewrites required — field population is the only editorial work. Layers touched: schema, GROQ, frontend render (MetadataCard), content (field population only, via Content Write Gate).

## Schema field proposal

| Field | What it is | Example value | Why it matters |
|-------|-----------|---------------|----------------|
| `industry[]` (array of string, controlled list) | Industry sector(s) the client operates in | `["Healthcare"]`, `["Fintech", "B2B SaaS"]` | Lets prospects filter case studies by their own sector without reading every excerpt |
| `companySize` (string enum) | Size of the client organisation at the time of the engagement | `startup` / `SMB` / `enterprise` / `agency` / `internal` | Signals who Bex has worked with at what scale — critical for enterprise consulting conversations |
| `region` (string) | Geography of the engagement | `"UK"`, `"US East Coast"`, `"Remote"`, `"EU"` | Useful for proposals where local presence or timezone overlap matters |

**`industry[]` controlled list (initial set — extend at activation if needed):**
`Healthcare`, `Fintech`, `B2B SaaS`, `E-commerce / Retail`, `Media & Publishing`, `Education`, `Government / Public Sector`, `Non-profit`, `Professional Services`, `Agency / Consultancy`, `Internal / Product`

**`contractType` duplication check:** `engagementModel` was considered and rejected — it duplicates the existing `contractType` field (Single Field Authority). If the `embedded` engagement type is needed, add it as a new option to the existing `contractType` `options.list` rather than introducing a new field.

## Scope

- [ ] Add `industry[]` (array of strings, controlled list via `options.list`) to `caseStudy` schema, group: `metadata` — layer: schema
- [ ] Add `companySize` (string, radio enum) to `caseStudy` schema, group: `metadata` — layer: schema
- [ ] Add `region` (string) to `caseStudy` schema, group: `metadata` — layer: schema
- [ ] Deploy schema: `npx sanity schema deploy` from `apps/studio/` — layer: schema
- [ ] Update `caseStudyBySlugQuery` projection to include `industry`, `companySize`, `region` — layer: GROQ
- [ ] Update MetadataCard to render the three new fields (inline with existing scalar row) — layer: frontend render
- [ ] Population pass: fill `industry[]`, `companySize`, `region` for all published case studies — layer: content (Content Write Gate fires for every patch)

## Phases

Single phase — schema, GROQ, render, and field population are low-risk and can ship together. Schema deploy must precede the population pass.

## Acceptance criteria

- [ ] Three new fields appear in Studio under the Metadata group for `caseStudy` documents
- [ ] `npx sanity schema deploy` runs without errors
- [ ] GROQ probe: `*[_type == "caseStudy"]{ industry, companySize, region }` returns populated values for all documents after population pass
- [ ] `caseStudyBySlugQuery` projection includes all three fields
- [ ] MetadataCard renders `industry`, `companySize`, and `region` on a live case study detail page
- [ ] Content Write Gate satisfied for every population patch: before/after proposal table produced and approved before each patch executes
- [ ] No `engagementModel` field created — `contractType` is the canonical engagement-type field

## Technical notes

- **Activation audit** — run before writing schema:
  ```groq
  *[_type == "caseStudy"]{ _id, title, client, employer, contractType, "slug": slug.current }
  ```
  Scan existing metadata to inform `industry[]` and `companySize` values for the population pass.
- **`industry[]` implementation**: use `array` of `string` with `options.list` (not a reference type — industry taxonomy does not need its own document collection at this stage). If it grows beyond 15 values or needs taxonomy pages, migrate to references in a future epic.
- **Content Write Gate** fires for all field population patches — before/after table required. Non-negotiable.
- **Tool rule**: `patch_document_from_json` for all content writes.
- **Schema deploy required before population pass**: MCP writes fail against undeployed schema.
- **Upstream of SUG-93**: the `industry[]` values populated here will be referenced in AEO/GEO summaries in SUG-93. Ship SUG-92 before activating SUG-93.
- **Doc Type Coverage**: `caseStudy` only. `article` and `node` may benefit from similar fields in a future pass — out of scope here.
- **Model recommendation**: `/model sonnet` — additive schema with no architectural decisions needed.

## Non-Goals

- `engagementModel` field — rejected; duplicates `contractType`
- `article` or `node` schema changes
- Industry taxonomy document type (reference collection) — use controlled string list for now
- Filtering UI on the case study archive — field infrastructure only; archive filter UI is a separate epic
- AEO/GEO retrieval fields — deferred to [SUG-93](https://linear.app/sugartown/issue/SUG-93)
- Body copy rewrites of any kind

## Related

- **Linear:** [SUG-92](https://linear.app/sugartown/issue/SUG-92)
- **SUG-91:** [Case study outcomes narrative](https://linear.app/sugartown/issue/SUG-91) — enhance outcomes[], add challengeSummary; recommended to ship first
- **SUG-93:** [Case study AEO/GEO content layer](https://linear.app/sugartown/issue/SUG-93) — upstream dependency on industry[] values from this epic
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage Audit, Query Layer Checklist, and Files to Modify at activation
