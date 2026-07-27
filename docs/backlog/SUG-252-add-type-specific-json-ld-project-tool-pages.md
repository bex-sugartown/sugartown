---
**Epic:** SUG-252 — Add type-specific JSON-LD for Project and Tool detail pages
**Linear Issue:** [SUG-252](https://linear.app/sugartown/issue/SUG-252/add-type-specific-json-ld-for-project-and-tool-detail-pages)
**Status:** Backlog
**Priority:** 🟣 Soon — post-sprint
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
**Blocked by:** [SUG-251](https://linear.app/sugartown/issue/SUG-251/seo-meta-and-structured-data-prerendering-fix-csr-mainentity-race)
---

# SUG-252 — Add type-specific JSON-LD for Project and Tool detail pages

Add real, type-specific JSON-LD for `/projects/:slug` and `/tools/:slug` — both routes
currently call `generateJsonLd(null, siteSettings)` and emit zero doc-specific structured
data, unlike every other content-detail route.

## Background

Found during SUG-251's diagnostic pass on the `/about` `mainEntity` issue: `jsonLd.js`'s
`generateJsonLd()` switch handles `article`, `node`, `caseStudy`, `person`, and `page`, but
has no case for `project` or `tool`. `ProjectDetailPage.jsx:61` and
`ToolDetailPage.jsx:104` both call `generateJsonLd(null, siteSettings)` literally — this
isn't a data or timing bug like SUG-251's, it's a builder that was simply never written for
these two document types. Every `/projects/:slug` and `/tools/:slug` page therefore emits
only the site-wide `Organization`/`WebSite` graph nodes, with no entity-specific schema at
all, regardless of whether the page's data has loaded.

## Objective

After this epic: `jsonLd.js` has `buildProject()` and `buildTool()` functions (following the
existing `buildArticle`/`buildPerson`/`buildCreativeWork` pattern), wired into
`generateJsonLd()`'s switch, and `ProjectDetailPage.jsx`/`ToolDetailPage.jsx` pass their
real fetched document instead of `null`. This epic touches only `apps/web/src/lib/jsonLd.js`
and the two page components' `SeoHead` call sites. It does not touch the Sanity schema, the
GROQ query fragments (assuming they already expose enough fields — confirm at activation),
or the client-side-rendering timing issue SUG-251 addresses.

## Scope

- [ ] Decide the correct schema.org `@type` for each: `project` docs likely map to
      `CreativeWork` (matching `caseStudy`'s existing `buildCreativeWork()`) or a more
      specific type if warranted; `tool` docs likely map to `SoftwareApplication` or
      `Product` depending on how Google's guidance treats third-party tool/platform
      references — research both before writing the builder, not just default to
      `CreativeWork` for convenience — layer: research/decision
- [ ] Add `buildProject(doc, base)` to `jsonLd.js`, sourcing `name`, `description`, `slug`
      → canonical `url`, and any other fields the chosen type expects — layer: frontend/lib
- [ ] Add `buildTool(doc, base)` to `jsonLd.js` similarly — layer: frontend/lib
- [ ] Add `case 'project':` and `case 'tool':` to `generateJsonLd()`'s switch statement —
      layer: frontend/lib
- [ ] Update `ProjectDetailPage.jsx:61` to call `generateJsonLd(project, siteSettings)`
      instead of `generateJsonLd(null, siteSettings)` — layer: frontend
- [ ] Update `ToolDetailPage.jsx:104` to call `generateJsonLd(tool, siteSettings)` instead
      of `generateJsonLd(null, siteSettings)` — layer: frontend

## Acceptance criteria

- [ ] `jsonLd.js` exports working `buildProject()`/`buildTool()` builders producing valid
      schema.org JSON-LD for their chosen `@type`
- [ ] `ProjectDetailPage.jsx` and `ToolDetailPage.jsx` pass their real document, not `null`
- [ ] Google's Rich Results Test (or Schema Markup Validator) shows no errors on at least
      one live `/projects/:slug` and one live `/tools/:slug` page after deploy
- [ ] The site-wide `Organization`/`WebSite` graph nodes are unaffected — no regression to
      existing JSON-LD on any other route

## Human QA Walkthrough — example local pages

Not applicable — no CSS, layout token, or visible component change. Verification is via
DevTools/view-source inspection of the rendered `<script type="application/ld+json">` on
one project page and one tool page, plus the Rich Results Test check above.

## Technical notes

- **Content Write Gate:** Not triggered — no Sanity content writes.
- **Instruction & Rule File Write Gate:** Not triggered — no governance/rule file edits.
- **Schema changes:** None. `project` and `tool` Sanity documents already carry the fields
  (`name`, `description`, `slug`, etc.) these builders need.
- **Upstream dependencies — blocked by SUG-251.** This is a sequencing dependency, not a
  hard technical one: the builder/wiring work here doesn't itself require SUG-251 to be
  attempted first. But SUG-251 fixes *how reliably* any JSON-LD on this site reaches
  Google's crawler at all (the client-side-rendering race). Shipping new JSON-LD on these
  two routes before SUG-251 lands would just expose brand-new content to the same known-flaky
  delivery pattern SUG-251 exists to fix. Sequencing after SUG-251 means this content
  benefits from the reliable delivery mechanism from day one. Recorded as a real Linear
  `blockedBy` relation (set at creation), not left as prose only, per CLAUDE.md's
  dependency-sync rule (SUG-246).
- **Activation audits:**
  - Re-read `jsonLd.js`'s current switch statement — SUG-251 may have changed how/where
    JSON-LD is generated (e.g. moved to build time) by the time this epic activates; the
    builders may need to be added at a different layer than the current client-side
    `generateJsonLd()`.
  - Re-confirm `projectDetailQuery` and `toolBySlugQuery` in `queries.js` project enough
    fields (name, description, slug, image, url, any type-specific fields) for the chosen
    schema.org type before writing the builders.

## Model & Mode [REQUIRED]

`/model sonnet` — default. This is a small, well-scoped addition following an established
in-file pattern (`buildArticle`/`buildPerson`/`buildCreativeWork`), with no architectural
ambiguity. Sonnet executes directly, no plan-mode handoff needed.

## Non-Goals

- Does not fix the client-side-rendering race itself — that is SUG-251's scope. This epic
  only adds the missing JSON-LD content, sequenced after SUG-251 so it isn't immediately
  exposed to the same fragility.
- No change to archive or home page JSON-LD — those intentionally pass `null` and are out
  of scope here.
- No new Sanity schema fields — existing `project`/`tool` fields are sufficient.

## Related

- **Linear:** [SUG-252](https://linear.app/sugartown/issue/SUG-252/add-type-specific-json-ld-for-project-and-tool-detail-pages)
- **Blocked by:** [SUG-251](https://linear.app/sugartown/issue/SUG-251/seo-meta-and-structured-data-prerendering-fix-csr-mainentity-race) — SEO meta & structured-data prerendering
- **Epic template:** `docs/epic-template.md`
- **Pattern to follow:** `apps/web/src/lib/jsonLd.js`'s existing `buildArticle()`,
  `buildPerson()`, and `buildCreativeWork()` functions
