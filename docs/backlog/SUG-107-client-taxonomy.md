# SUG-107 — Client taxonomy: audit & promote string field to reference doc

**Linear Issue:** [SUG-107](https://linear.app/sugartown/issue/SUG-107/client-taxonomy-audit-promote-string-field-to-reference-doc)
**Status:** Backlog
**Strategy:** TBD at epic open

---

## Background

Case studies record client/employer context as plain string fields (`client`, `employer`) on the `caseStudy` schema. There is no `client` reference document type, so client names can't be linked in the knowledge graph, filtered on, or navigated to.

The existing `project` taxonomy represents Sugartown's internal passion projects (Pink Moon DS, Sugartown CMS, mini-repo) — not client engagements. These are distinct concepts and must not be mixed.

**What already exists on `caseStudy.ts` (needs audit):**
- `client` — plain string, "client or company name"
- `employer` — plain string (employment vs contract context unclear)
- `industry` — array (tag-style)
- `companySize` — string enum

---

## Open Questions (resolve before Phase 0)

1. Does `employer` stay as a string (employment history) or also become a reference doc?
2. Should `industry` remain an inline array or become its own taxonomy type?
3. Does the graph show `client` hub nodes in "all" view or only in filtered/caseStudy view?
4. Is there a meaningful distinction between "client" (commissioned work) and "employer" (salaried role), or should both collapse into a single `client` doc with an `engagementType` field?

---

## Scope

### Phase 0 — Audit + schema design
- Inventory all caseStudy docs in Sanity: list unique `client` string values
- Decide `employer` fate (see open questions)
- Design `client` document schema
- Phase 0 mock: client hub node in graph, client detail page layout

### Phase 1 — Schema + data migration
- Add `client` document schema (`name`, `slug`, `url`, `industry`, `description`, logo asset)
- Create `client` docs in Sanity for each unique client string value
- Migrate `client` string field → `client` reference on caseStudy
- Deploy schema + patch existing caseStudy documents

### Phase 2 — Routing + pages
- Register `/clients` and `/clients/:slug` in `routes.js`
- `ClientDetailPage.jsx` — shows client metadata + connected case studies
- `ClientsArchivePage.jsx` (or reuse TaxonomyArchivePage if it fits)
- GROQ query updates: `caseStudyBySlugQuery`, `allCaseStudiesQuery`

### Phase 3 — Graph integration
- Add `client` nodes + membership edges to `scripts/graph.js` pipeline
- Add client node color tokens (`--st-kg-node-client`, chip tokens)
- Add client hub to KnowledgeGraph legend + FilterStrip
- Decide graph visibility (always vs filtered)

---

## Proposed `client` Schema Fields

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name — taxonomy primary field |
| `slug` | slug | URL key |
| `url` | url | Client website |
| `industry` | string | Broad sector label (or reference if industry becomes its own type) |
| `engagementType` | string enum | `contract`, `freelance`, `employment`, `pro-bono` |
| `description` | text | One-paragraph summary for detail page |
| `logo` | image | Optional; used in case study hero |
| `confidential` | boolean | Suppress name/logo in public views |

---

## Model & Mode [REQUIRED]

`/model opus` — schema field promotion + GROQ query changes + new route and detail page. Opus plans the migration sequence and route architecture; Sonnet executes migrations, schema deploy, and component implementation.

## Acceptance Criteria

- [ ] Every existing caseStudy `client` string has a corresponding reference doc
- [ ] `/clients/:slug` renders a client detail page with connected case studies
- [ ] Client nodes appear in the knowledge graph connected to their case studies
- [ ] Graph legend and FilterStrip updated
- [ ] `validate:tokens`, `validate:urls`, `validate:content` all pass
- [ ] Visual QA approved before close-out
