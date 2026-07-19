# Red-pen — Sugartown Ontology Map (Core Content ↔ Taxonomy) SVG

**Diagram source:** `docs/diagrams/sugartown-ontology-map-core-content-taxonomy.svg`
**Epic:** SUG-222 · **Date:** 2026-07-19
**Status:** source committed, not yet uploaded/published anywhere. This table gates that step per CLAUDE.md's technical diagram red-pen rule — re-check before any Sanity upload or article/node embed.

One row per box, arrow, badge, and label that asserts something about the system. Classes: **enforced-by-code** (a validator/build step/platform guarantee makes it true) · **measured** (empirical result with a committed record) · **convention** (documented rule, true by discipline) · **roadmap** (not true yet).

| Diagram element | Evidence (file / mechanism) | Class |
|---|---|---|
| article/node/caseStudy → categories, tags, tools, projects (solid, displayed) | `apps/web/src/lib/queries.js` `allArticlesQuery`/`articleBySlugQuery` (+ node/caseStudy equivalents) dereference all four; `TaxonomyChips` component renders them — verified directly | measured |
| article/node/caseStudy → glossaryTerm via relatedTerms (solid) | `articleBySlugQuery` etc. dereference `relatedTerms[]->`; `GlossaryTermPage`/`MetadataCard` render merged with inline PT terms — verified directly | measured |
| article/node/caseStudy → person via authors (solid) | queried + rendered in MetadataCard byline — verified directly | measured |
| page → tools, authors (solid, displayed) | `pageBySlugQuery` (`apps/web/src/lib/queries.js:691` block) projects `authors[]->` and `tools[]->` — read the full query block directly | measured |
| page → category, tag (dashed, "gap #3") | Same `pageBySlugQuery` block does **not** project `categories`/`tags` — confirmed by reading the full query body, not just grepping nearby lines | measured |
| page → glossaryTerm (dashed, "gap #2") | `page.related[]`/`page.relatedTerms[]` schema fields exist (`apps/studio/schemas/documents/page.ts`) but are absent from `pageBySlugQuery`; the schema file's own comment names this a known SUG-210 gap | measured |
| series "query-time fallback" | `seriesBySlugQuery` (`apps/web/src/lib/queries.js:887`) runs `*[_type in ["article","node","caseStudy","page"] && series._ref == ^._id]` as a reverse lookup — verified directly | measured |
| person → category via "expertise" (solid, outer loop) | `person.expertise` field confirmed in `apps/studio/schemas/documents/person.ts:137` (type: category reference array); rendered as chips per the ontology map's edge inventory | measured |
| glossaryTerm → tag, tool via relatedTags/relatedTools (solid) | `glossaryTermBySlugQuery` dereferences both; rendered as chip rows on `GlossaryTermPage.jsx` — verified directly | measured |
| glossaryTerm self-loop (relatedTerms ↺) | `glossaryTerm.relatedTerms` is a self-referencing array field (`apps/studio/schemas/documents/glossaryTerm.ts`) — the edge exists; the diagram does **not** assert the reciprocal-write mechanism is confirmed (schema comment claims bidirectional sync, but the write-back mechanism lives outside the files reviewed) | measured (edge only, not the bidirectionality claim) |
| glossaryTerm → category, highlighted pink, "Gap #1 — this epic's fix" | Chip: `GlossaryTermPage.jsx` renders `Chip href={getCanonicalPath({docType:'category', slug})}` — confirmed. Destination gap: `contentByTaxonomyQuery` and all four taxonomy count queries (`allCategoriesQuery`, `allTagsQuery`, `allToolsQuery`, `allProjectsQuery`) use `_type in ["article","node","caseStudy"]`, excluding `glossaryTerm` — confirmed by reading `queries.js` directly. `TaxonomyDetailPage.jsx` renders "No content associated with this category yet" when the resulting list is empty — confirmed by reading the component | measured |
| Callout: "Bextionary reports 'no content' with 9 terms attached" | Term count (9) sourced from the SUG-222 epic doc's Background section, itself dated 2026-07-17 against live Sanity data — not independently re-queried in this session. Flagged as inherited, not re-measured | measured (inherited from epic doc; re-verify against live Sanity data before publishing if the count matters to the narrative) |
| category/tag/project badges "↩ Studio assigned-content" | `defineIncomingReferenceDecoration` blocks confirmed by direct read in `category.ts`, `tag.ts` (includes `project` alongside article/node/caseStudy), `project.ts` — all three verified directly this session | measured |
| tool node "article · node · caseStudy" (no ↩ badge) | `tool.ts` was read by the research pass, not independently re-read this session for its decoration block; diagram omits a badge for tool consistent with the ontology map's edge outline, which lists tool's incoming decoration as scoped to article/node/caseStudy only (no explicit project/tag parity claim made) | measured (agent-sourced, not independently re-read; lower confidence than category/tag/project rows above) |
| Legend: line-style meanings (solid/dashed/dotted/highlighted) | Diagram's own encoding, defined in this file — not an external claim | convention |

## Notes for whoever uploads this next

- Two edges the ontology map flagged as **unconfirmed** (`richImage.link.internalRef` in body Portable Text; `cardBuilderItem.body` glossary-popover wiring in nested contexts) are deliberately **not drawn** in this diagram — don't add them without independently verifying first.
- The "9 terms attached" figure in the callout is inherited from the epic doc, not re-queried live in this session — re-confirm against Sanity before the diagram goes into a published article/node, in case the count has drifted (more Bextionary terms may have shipped since 2026-07-17).
- If SUG-222 Phase 1 changes the `contentByTaxonomyQuery`/count-query behavior, this diagram becomes stale the moment that ships — it documents the *pre-fix* state deliberately (that's the point of highlighting Gap #1). Once the fix ships, either retire this version or produce a companion "after" diagram; don't silently edit this one to claim the gap is closed retroactively.
