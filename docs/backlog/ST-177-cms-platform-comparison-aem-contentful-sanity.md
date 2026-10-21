---
**Epic:** ST-177 — CMS platform comparison: AEM, Contentful, Sanity
**Issue:** [#177](https://github.com/bex-sugartown/sugartown/issues/177)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one CHANGELOG line at the end
**Visual:** yes
**Vspec:** `docs/drafts/ST-177-cms-platform-comparison-aem-contentful-sanity.vspec.html`
---

# ST-177 — CMS platform comparison: AEM, Contentful, Sanity

A five-column comparison of AEM Cloud Service (traditional, headless, Edge Delivery Services), Contentful and Sanity, built in FigJam with Pink Moon light fonts and colours, plus a recommendations write-up that makes the case that content-data experience transfers across CMS platforms.

## Background

Hiring that screens on a named platform treats experience with one CMS as separate from another. A first-draft SVG (`docs/drafts/cms-platform-comparison.svg`, local only, 2026-10-21) shows the opposite: nine of thirteen comparison rows are the same job under a different name, and four genuinely differ (where the model is defined, who can change the model, how far the editor UI bends, who runs delivery). The draft is generic grey and green, not Pink Moon, and its platform claims are unchecked.

A Dice sample on 2026-10-21 (search "Adobe Experience Manager", sorted by date posted, 11 AEM-related roles read in full) found 6 page-based roles, 1 naming headless, 1 naming Edge Delivery Services and 3 with no architecture signal. No published split of AEM customers by classic, Cloud page-based and Cloud headless was found in three searches. The sample supports a direction only, so the epic quotes no percentage.

CMS comes first. The same layout (tree, "same job, different name" table, "where they differ" table) is the template for later PIM and DAM comparisons.

## Research log: AEM architecture signal in job postings

**Status: unconfirmed.** Page-based work is the most common signal in the 11 AEM-related Dice postings read in full. The sample is far too small for percentages. It is one day of US postings, and Dice leans toward staffing firms. Postings show what employers hire for, not what clients run, so this supports a direction only and must not be quoted as a figure.

**Method:** Dice search "Adobe Experience Manager", sorted by date posted, first 30 results on 2026-10-21. 11 were AEM-related; the rest were unrelated roles. Each of the 11 was read in full and tagged by what the description asks for.

| Role (employer omitted, repo is public) | Tag | What the description says |
|---|---|---|
| Senior AEM product analyst | Page-based | AEM Cloud Service, Sites, components, editable templates; Content Fragments listed too |
| AEM lead developer | Page-based | Cloud Service, Sling, OSGi, HTL, clientlibs; Content Fragments listed too |
| AEM architect | Page-based | Cloud Service, Sling, HTL, content models, reusable components, CDN management |
| AEM developer (healthcare, internal website team) | Page-based | Components, templates, Sling Models, HTL; Content Fragments and GraphQL listed as familiarity |
| AEM lead/architect (remote) | Page-based | Sites, templates, components; "headless CMS or AEM CIF" as a plus |
| Project manager (AEM components) | Page-based, classic | AEM 6.4+; Cloud only "an advantage" |
| Principal software engineer (hospitality) | Headless named | "headless/headful implementations", React, Next.js, GraphQL |
| Adobe program and delivery lead | Edge Delivery Services | Production EDS experience; document-based authoring preferred |
| Senior digital experience leader | Unstated | "AEM or a comparable enterprise CMS" |
| AEM developer (analytics focus) | Unstated | AEM plus Web SDK instrumentation |
| Principal IT delivery manager | Unstated | AEM is one of about ten platforms listed |

**Tally:** 6 page-based (1 of them classic AEM 6.x), 1 headless, 1 Edge Delivery Services, 3 unstated. Four of the six page-based roles also list a headless-adjacent skill (Content Fragments, GraphQL or "headless CMS"), so headless appears as an add-on, not a replacement.

**Not found:** no published split of AEM customers by classic, Cloud page-based and Cloud headless. Three web searches (2026-10-21) returned vendor and consultancy pages with no adoption data. A same-day Dice query comparison was discarded: counts stayed near 60 to 80 for every specific term, which looks like a relevance cutoff in the search tool, not term counts.

**Still to confirm before the brief quotes any of this:**

- Repeat the read on another day and a second board (Indeed) to see whether the tally holds.
- Ask Adobe, a partner or an analyst for an adoption split, or find one in Adobe earnings material or Gartner and Forrester reports.
- Verify the Edge Delivery Services claims against Adobe documentation (see the red-pen scope item).
- Say "in the postings I reviewed" in any reader-facing text, never a percentage.

## Objective

After this epic there is a Pink Moon light FigJam diagram comparing the five CMS implementations, a committed SVG export, a red-pen claim table that classifies every claim, and a recommendations document that says how to use the comparison in a hiring conversation. A short template note records the layout so PIM and DAM comparisons reuse it. Layers touched: design (FigJam), docs (diagram source, claim table, brief). Not touched: Sanity schema, GROQ, React, Studio content, and the live site.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] FigJam diagram, five columns (AEM traditional, AEM headless, AEM Edge Delivery Services, Contentful, Sanity), tree plus both tables, in Pink Moon light colours and fonts (EB Garamond headings, Courier Prime metadata) — layer: design. Phase 1.
- [ ] Exported SVG committed to `docs/diagrams/cms-platform-comparison.svg` before any publish, as the diagram's source of record — layer: docs. Phase 1.
- [ ] Red-pen claim table at `docs/diagrams/redpen-cms-platform-comparison.md`: one row per box, arrow and label, each with evidence and a class (enforced-by-code, measured, convention, roadmap); EDS rows verified against Adobe docs first — layer: docs. Phase 1.
- [ ] Recommendations brief at `docs/briefs/cms-platform-comparison-recommendations.md`: how to make the transferable-skills case, with the Dice sample recorded as an estimate with its method and limits — layer: docs. Phase 2.
- [ ] Template note at `docs/briefs/platform-comparison-template.md` recording the layout and the row set, so PIM and DAM versions start from it — layer: docs. Phase 2.

## Phases

- **Phase 1: diagram.** Ships the FigJam diagram, the committed SVG and the red-pen table. Phase 0 vspec sign-off comes first.
- **Phase 2: write-up and template.** Ships the recommendations brief and the template note.

## Acceptance Criteria

- [ ] A FigJam file exists with five platform columns, the "same job" table and the "differ" table, and its link is recorded in the vspec file.
- [ ] Every colour and font in the FigJam file maps to a Pink Moon light token or the documented font stack; the vspec lists the mapping.
- [ ] `docs/diagrams/cms-platform-comparison.svg` is committed and matches the FigJam file's content row for row.
- [ ] `docs/diagrams/redpen-cms-platform-comparison.md` has one row per claim, no blank Evidence cell, and no `roadmap` claim drawn as current state.
- [ ] Every Edge Delivery Services claim cites an Adobe documentation page fetched during the epic.
- [ ] The recommendations brief states the Dice sample with its date, query, count and limits, and contains no adoption percentage.
- [ ] The template note lists the layout and the nine "same job" rows plus four "differ" rows so a PIM version can reuse them.
- [ ] No em dashes in the brief's reader-facing sentences; `grep` for the banned-word list in `instruction-writing-style.md` returns nothing for the new docs.

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Content Write Gate:** does not fire. No Sanity writes.
- **Schema changes:** none.
- **Upstream dependencies:** none blocking. Related, not blocking: SUG-168 (headless and composable CMS tradeoffs article) and SUG-233 (seven steps to a composable platform) cover the same ground in prose; read both at activation so claims do not contradict them. SUG-194 updated an earlier FigJam diagram and shows the working pattern.
- **Technical diagram red-pen gate (CLAUDE.md):** applies in full. Source committed first, claim table before any upload or publish.
- **Phase 0 visual spec gate:** applies. The vspec at `docs/drafts/ST-177-...vspec.html` holds the layout, token mapping and FigJam link. No FigJam build starts before sign-off.
- **Activation audit, tooling:** test whether the Figma MCP (`generate_diagram`, `use_figma`) can set the Pink Moon fonts and colours inside a FigJam file. If it cannot, record the fallback (styled Figma design file or manual styling) in the vspec before building.
- **Activation audit, tokens:** read `tokens/source/tokens.json` for the Pink Moon light values and `docs/briefs/design-system/PROJ-003-design-system-prd.md` for the visual direction.
- **Activation audit, starting point:** the local SVG draft is gitignored and its generator lived in a session scratchpad that will not survive. Treat the SVG as the content reference and rebuild from it.
- **Activation audit, claims:** re-verify the Contentful and Sanity rows against vendor docs, not the 2026-10-21 draft.
- **Two analogy rows:** "Governed UI baseline" (AEM Core Components against your own component library) and "Page structure control" (editable templates and policies against content type validations and Studio structure) are a mapping, not vendor-stated equivalents. The diagram labels them "analogy". Verify the Core Components and editable templates wording against Adobe docs before the red-pen table accepts them. The Edge Delivery Services and headless cells for these two rows are untested guesses.
- **Model authoring: UI or code.** Contentful content types, AEM Content Fragment Models and editable template policies are defined in a UI. Sanity's schema is code in the repo. A UI lowers the barrier for non-coders to work with the data shapes, and AI lowers it further. That is an access question. Governance is a separate question: a UI-edited model can change without review or repo history, while a code model gets pull requests. When AI changes a code-defined model, review becomes the control. The "differ" table carries this as its own row, "Who can change the model and who reviews it", framed as who may change the model and who reviews it, not as a vendor ranking.
- **Activation audit, vendor claims:** before any cell says one vendor has no UI modelling, check each vendor's current documentation. Sanity's schema-in-code position is long-standing, but whether it now offers UI-based modelling is unchecked. Do not write "unlike Sanity" until verified, and name no vendor in a claim that has not been checked.
- **Personal and employer claims stay out of this repo.** It is public. Interview talking points and any claim about past roles live in the job-search project, under that project's resume rules.
- **Model & Mode:** see below.

## Model & Mode [REQUIRED]

`/model sonnet`. The work is diagram building, a claim table and two short documents. There is no architecture decision or multi-component ambiguity that needs plan mode.

## Non-Goals

- PIM and DAM comparisons. Only the template note ships; those get their own epics.
- Publishing the diagram or brief to the site, Sanity or an article. Publishing needs a separate decision and the red-pen gate.
- A percentage split of AEM customers. No source exists; the brief records an estimate with its limits instead.
- Naming employers or quoting job postings verbatim. This repo is public.
- Any change to the existing SVG draft's generator or to the live site.

## Related

- **GitHub:** [#177](https://github.com/bex-sugartown/sugartown/issues/177)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **Prose siblings:** `docs/backlog/SUG-168-article-headless-composable-cms-tradeoffs.md`, `docs/backlog/SUG-233-article-seven-steps-composable-platform.md`
- **Earlier FigJam work:** `docs/backlog/SUG-194-update-ds-architecture-figjam-diagram.md`
