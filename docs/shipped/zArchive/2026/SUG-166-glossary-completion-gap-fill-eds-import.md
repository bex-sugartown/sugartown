---
**Epic:** SUG-166 — Glossary completion — gap-fill + EDS vocabulary import
**Linear Issue:** [SUG-166](https://linear.app/sugartown/issue/SUG-166/glossary-completion-gap-fill-eds-vocabulary-import)
**Status:** ✅ Shipped (2026-06-14)
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — each phase merges to main with its own mini-release
---

> **Shipped 2026-06-14.** Glossary went 17 → 41 terms. Phases 0/1/2/3/5 complete; Phase 4 (per-component defs) dropped by scope decision (member-example lists in the Tier 2 ladder cover them). Plus three term-detail follow-ups: ContentNav alphabetical prev/next footer, Status row removed (all evergreen), categories excluded from Related Terms. New `Bextionary` category + 8 coined node-voice terms behind the archive filter; masthead parenthetical added. Blog theses spun out: SUG-168, SUG-169.
> **Chromatic:** N/A — no DS component or Storybook-story changes (ContentNav/Chip/DescriptionList reused as-is; all changes are page-level + content).
> **Schema deploy:** N/A — no schema changes (all fields pre-existed).
---

# SUG-166 — Glossary completion — gap-fill + EDS vocabulary import

Complete the Sugartown glossary in two workstreams: fill the missing fields on the existing 17 terms, and import the relevant vocabulary from Bex's Enterprise Design System (EDS) Confluence glossary.

## Background

The `/glossary` archive has 17 published terms. Every term has a short `definition`, but the deeper fields are largely empty: only **Node** is fully filled, and **Counterfactual** is close. Separately, an older EDS glossary (Bex's Confluence export, `~/Desktop/GLOSSARY TO BE/EDS-Glossary_537396784.html`, authored Apr 2025) contains a normalized, cross-functionally-reviewed vocabulary that overlaps Sugartown heavily — especially the **token-tier** and **theme** vocabulary that the SUG-165 theme-drift node exposed as a conceptual gap (no glossary entry distinguishes primitive vs semantic vs component tokens, or defines "theme").

## Gap audit — existing 17 terms (captured 2026-06-13)

| Term | Abbr. | Pronunciation | Short def | Long def | Source |
|---|---|---|---|---|---|
| Atomic design | — | — | ✓ | ✗ | ✗ |
| Composable architecture | — | — | ✓ | ✗ | ✗ |
| Content model | — | — | ✓ | ✗ | ✗ |
| Content operations | ContentOps | — | ✓ | ✗ | ✗ |
| Content-as-code | — | — | ✓ | ✗ | ✗ |
| Counterfactual | — | ✓ | ✓ | ✗ | ✓ |
| Design system | ✗ (→ DS) | — | ✓ | ✗ | ✗ |
| Design tokens | — | — | ✓ | ✗ | ✗ |
| GROQ | (is acronym) | ✗ (→ /ɡroʊk/) | ✓ | ✗ | ✗ |
| Headless CMS | CMS | — | ✓ | ✗ | ✗ |
| Information architecture | IA | — | ✓ | ✗ | ✗ |
| Knowledge graph | ✗ (→ KG) | — | ✓ | ✗ | ✗ |
| Monorepo | — | ✗ | ✓ | ✗ | ✗ |
| Node | — | ✓ | ✓ | ✓ | ✓ |
| Portable Text | PT | — | ✓ | ✗ | ✗ |
| Semantic versioning | SemVer | — | ✓ | ✗ | ✗ |
| Structured content | — | — | ✓ | ✗ | ✗ |

Confident factual fills (low-risk, verify at execution):
- **Abbreviations:** Design system → `DS`; Knowledge graph → `KG`. (GROQ's expansion *Graph-Relational Object Queries* belongs in the definition, not the abbreviation field — the term is already the acronym.)
- **Pronunciation (only non-obvious):** GROQ → `/ɡroʊk/` (said "grok"); Monorepo → `/ˈmɒn.oʊˌrɛp.oʊ/` (optional). Do NOT add IPA to plain-English terms ("Design system", "Content model") — it's noise.
- **Sources (canonical authority where one exists):** Atomic design → atomicdesign.bradfrost.com · Design tokens → W3C Design Tokens Community Group · Design system → NN/g "Design Systems 101" · Semantic versioning → semver.org · Portable Text → portabletext.org · GROQ → sanity.io/docs/groq · Composable architecture → MACH Alliance · Information architecture → IA Institute · Monorepo → monorepo.tools. Leave fuzzy terms (Content model, Content-as-code, Content operations, Structured content, Knowledge graph, Headless CMS) source-less unless Bex's index supplies one.

## EDS import — relevance table (terms to add)

Tiers 1–4 approved for import. Dedupe against existing (Atomic Design, Design Tokens already exist — do NOT recreate).

**Two axes — keep them distinct:**
- **Tier** = *import priority only* (Tier 1 = highest value, ships first). Not user-facing.
- **Category** = topical grouping, user-facing. Renders on the term page **before Related Terms** and filters the `/glossary` archive. Uses **existing editorial categories** — no new structural categories created.

### The DS ladder = TERMS, not categories (corrected 2026-06-14)

**Foundations, Components, Composite Components, Patterns, Blocks** are imported as **glossary terms** — they *replace* importing each individual component (Input, Popover, Link, Drawer, Chip, Badge, Tag, Tooltip…) as its own entry. Each ladder term's **`extendedDefinition` enumerates its member components / examples**, pulled from the actual Sugartown DS at execution (`packages/design-system/src/components/`, Storybook Foundations/Patterns, `sections[]` block types). No per-component glossary entries — the examples list inside the long-definition does that work.

Indicative member lists (verify against the live DS at execution):
- **Foundations** → colour, type, spacing, a11y, layout; the token tiers (Primitive/Semantic/Component) and Theme are *related terms* in Foundations' orbit.
- **Components** → Button, Input, Chip, Badge, Tag, Link, Tooltip, Popover, Drawer, …
- **Composite Components** → Card, MetadataCard, FilterBar, ContentCard, …
- **Patterns** → the Storybook "Patterns" set (composed, in-context).
- **Blocks** → the `PageSections` section types (textSection, callout, CTA, …).

### Canonical cross-reference surfaces (don't duplicate detail — link to it)

Where component/schema detail already lives on the site, the term **links out** rather than re-describing. These are **code-driven pages** (React routes, not Sanity docs) → they cannot be `relatedContent` references; link them as **inline PT links in `extendedDefinition`** (e.g. a closing "Where this lives in Sugartown:" line). `sources` stays reserved for external canonical authority (W3C, atomicdesign.bradfrost.com, etc.).

| Surface | Path | Cross-ref from |
|---|---|---|
| Design System overview | `/platform/design-system` | Foundations, Component, Design System |
| Component Registry | `/platform/design-system/registry` | Component, Composite Component (the full inventory) |
| Section Showcase | `/platform/design-system/sections` | Block (live section types) |
| CMS overview | `/platform/cms` | Content model, Structured content, Headless CMS |
| Content Models | `/platform/cms/content-models` | Content model, Structured content |
| Schema ERD | `https://sugartown.io/platform/cms#schema-erd` (anchor on the CMS page) | Content model, Knowledge graph, Node |
| Storybook (Pink Moon) | `https://pinkmoon.sugartown.io/` | Component, Pattern, Composite Component, Foundations |

So a ladder term like **Component** ends its long-def with: *"See the full component inventory in the [Design System Registry](/platform/design-system/registry)"* rather than listing every prop. The member-example list names the components; the registry link is the authoritative detail.

### Category axis

`glossaryTerm.categories` references the **shared site `category` taxonomy** (13 existing). DS/EDS terms map to the existing **Design Systems** category; architecture/CMS terms (the existing 17 + Headless CMS, Monorepo, GROQ, IA…) map to **Content Architecture** / **Engineering & DX**. **No new categories** are created. The Category row still renders before Related Terms (Phase 0) — useful regardless of which categories are used. `relatedTerms` does the fine-grained "see also" cross-linking between ladder terms and the token/theme terms.

**Tier 1 — token & theme vocabulary (highest value):** → category **Design Systems**; these are the *related terms* in the Foundations *term's* orbit
| Term | EDS one-line definition | Sugartown anchor |
|---|---|---|
| Primitive Tokens | The most basic atomic values — raw colours, sizes, spacing. | base `tokens.css` layer |
| Semantic Tokens | Tokens carrying meaning/usage — where/how a value applies. | semantic aliases + theme overrides |
| Component Tokens | Tokens scoped to one component (e.g. button radius); the theming layer. | `--st-card-*`, `--st-index-cell-*` |
| Theme | A collection of design tokens defining a brand's visual style. | Pink Moon light/dark |

**Tier 2 — DS taxonomy (the ladder terms):** → category **Design Systems**; each term's `extendedDefinition` **lists its member components/examples**
| Term | EDS one-line definition | Long-def must list |
|---|---|---|
| Foundations | Underlying principles/styles — colour, type, spacing, a11y, layout. | colour, type, spacing, a11y, layout (+ token tiers as related) |
| Component | Reusable, self-contained UI building block. | Button, Input, Chip, Badge, Tag, Link, Tooltip, Popover, Drawer, … |
| Composite Component | A component assembled from multiple components. | Card, MetadataCard, FilterBar, ContentCard, … |
| (Content) Block | Distinct self-contained UI section, combinable into layouts. | `PageSections` section types (textSection, callout, CTA, …) |
| Pattern | How components are composed within a UI in a given context. | the Storybook "Patterns" set |
| Layout | Visual arrangement/structure of elements on a page. | grid/stack/columns layout primitives |

**Tier 3 — artifacts & principles:** → category **Design Systems**
| Term | EDS one-line definition | Sugartown anchor |
|---|---|---|
| Component Guidelines | Spec: anatomy, states, behaviours of a component. | Storybook 14-section Guidelines |
| Component Library | Repository of predetermined reusable UI elements. | the DS package |
| Pattern Library | Collections of UI-element groupings/layouts. | — |
| Reusability | Using a component many times without significant modification. | the counterfactual node thesis |
| Flexibility | Adapting to content/screens/use-cases; framework-agnostic. | platform-agnostic doctrine |

**Tier 4 — DROPPED (2026-06-14):** individual component definitions (Chip, Badge, Tag, Tooltip, Popover, Scrim, Toast, Dialog, Input, Link, Drawer) are **not** imported as glossary terms — too extensive. They appear instead as the **member-example lists inside the Tier 2 ladder terms** (Components / Composite Components). Wireframe / Mockup / Prototype remain candidates **only if** they earn a clear Sugartown anchor — otherwise skip. `Tout` skipped (EDS deprecated).

Full EDS definitions (verbatim, for shaping the Sugartown versions) live in the source HTML — read it at activation: `~/Desktop/GLOSSARY TO BE/EDS-Glossary_537396784.html`.

## Scope

- [ ] **Phase 0 — Category render** — add the **Category row before Related Terms** in `GlossaryTermPage.jsx` (+ GROQ projection if missing); no new categories created — layer: one frontend touch
- [ ] **Phase 1 — Gap-fill existing 17 terms** (Content Write Gate per term batch); assign each to an existing editorial category — layer: content
- [ ] **Phase 2 — Import Tier 1 token/theme terms** (4), category Design Systems — layer: content
- [ ] **Phase 3 — Import Tier 2 + Tier 3 terms** (~10), category Design Systems; Tier 2 ladder terms list member components in their long-def — layer: content
- [ ] **Phase 4 — DROPPED** — individual component definitions not imported; member-example lists inside the Tier 2 ladder terms cover them
- [ ] **Phase 5 — The Bextionary** — coined / in-house / amusing Sugartown-native terms, filed under a `Bextionary` category, with a parenthetical nod on the glossary masthead — layer: content

## Phases (merge-as-you-go)

Each phase is an independent content batch: propose → Content Write Gate approval → write to Sanity drafts → Bex publishes → mini-release. Phase N's Linear sub-task (if used) is Done only after its own merge.

**Phase 0** — Category render. Add the Category row to `GlossaryTermPage.jsx` `metadataItems`, positioned **before** Related Terms (+ GROQ projection if `categories[]->` is missing). No new categories created — existing editorial categories only. This is the one code touch in the epic → gets a Human QA Walkthrough row. The row must render before terms are filed (otherwise assignments are invisible).
**Phase 1** — Gap-fill. Extended definitions are the heavy interpretive part: cross-check against Bex's index where available; draft first-pass only with approval. Assign each existing term to an existing editorial category.
**Phase 2** — Tier 1 token tiers + Theme (the highest-value import; directly closes the SUG-165 gap), category Design Systems.
**Phase 3** — Tier 2 ladder terms + Tier 3 artifacts/principles, category Design Systems. Each Tier 2 ladder term's `extendedDefinition` enumerates its member components/examples (audit the live DS at execution) **and** links out to its canonical surface (registry / showcase / platform page) — see the cross-reference table.
**Phase 4** — DROPPED. Individual component definitions not imported (too extensive); the member-example lists inside the Tier 2 ladder terms cover them. No work unless Wireframe/Mockup/Prototype are later approved with a clear anchor.
**Phase 5 — The Bextionary** — origin: a team glossary Bex maintained at a prior job for the obscure and made-up terms her reports found amusing. Sugartown already speaks this dialect; this phase files it. Two registers are kept deliberately separate: the **industry vocabulary** (Phases 1–4) must be *correct* and citable; the **Bextionary** must be *true to Bex* — node-voice definitions, em dashes and deadpan emoji permitted, `status: exploring`. Mechanism: a `Bextionary` `category` (no schema change — `glossaryTerm.categories` already exists), so the `/glossary` archive can filter to just the bextionary while formal terms stay formal. Masthead gets the wink: *"Sugartown Glossary (and the Bextionary)"* on the archive description/eyebrow. Candidate starter set (already living in the nodes): Agentic Caucus · VoPM (Voice of the PM) · Pink Moon · Forensic Storyteller · the Comedic Contract · vibing / vibe-coding · "term term term" · Left to My Own Devices. Each coinage's wording still passes the Content Write Gate.

## Acceptance criteria

- [ ] All 17 existing terms have `extendedDefinition` populated (or an explicit "short-only" decision recorded per term)
- [ ] Abbreviations set: Design system → DS, Knowledge graph → KG
- [ ] GROQ pronunciation set to `/ɡroʊk/`; no IPA added to plain-English terms
- [ ] Sources added for every term with a canonical authority (list above); fuzzy terms explicitly left blank
- [ ] No new categories for DS/EDS vocabulary — existing editorial categories only (Design Systems / Content Architecture / Engineering & DX). `Bextionary` (Phase 5) is the one exception.
- [ ] Category row renders on the term page **before** Related Terms (`GlossaryTermPage.jsx`); verified in browser
- [ ] Tier 2 ladder terms (Foundations, Component, Composite Component, Block, Pattern, Layout) created, each with member-component examples in its `extendedDefinition` **and** an inline cross-ref link to its canonical surface (registry / showcase / platform page) per the cross-reference table
- [ ] Tier 1 + 3 terms created (deduped — Atomic Design / Design Tokens NOT recreated); each with short definition + source + category Design Systems
- [ ] Existing 17 terms each assigned to an existing editorial category
- [ ] Individual component definitions (Chip/Badge/Tag/Input/Tooltip/etc.) NOT created as separate terms — they live in the ladder terms' example lists
- [ ] Every new term passes taxonomy pre-flight (no near-duplicate of an existing `glossaryTerm`)
- [ ] All copy passed the Content Write Gate (proposal approved) before any Sanity write; all content written via `_from_json` tools (no AI-rewriting pipeline)
- [ ] **Bextionary facet** exists: a `Bextionary` category created (taxonomy pre-flight first), coined terms tagged with it, and the `/glossary` archive can filter to it
- [ ] **Masthead parenthetical** added: the glossary archive description/eyebrow nods to the Bextionary (e.g. *"Sugartown Glossary (and the Bextionary)"*)
- [ ] Bextionary entries use node-voice (em dashes / deadpan emoji permitted), `status: exploring`; formal Phase 1–4 terms remain straight
- [ ] Bex published all drafts (human-publishes gate) — Linear Done only after content is live

## Technical notes

- **Schema fields** (`apps/studio/schemas/documents/glossaryTerm.ts`): `term`, `slug`, `abbreviation` (string ≤20), `pronunciation` (string, IPA), `status` (evergreen/validated/exploring), `definition` (summaryPortableText — short), `extendedDefinition` (standardPortableText — long), `categories`, `relatedTerms`, `relatedContent`, `sources` (array of `{text, url}`), `seo`.
- **Taxonomy pre-flight (blocking):** before creating ANY new `glossaryTerm`, run `*[_type=="glossaryTerm"]{_id, term, slug}` and diff against the requested label. 80%+ semantic match → use existing, do not fork. (See CLAUDE.md §Taxonomy pre-flight.)
- **Content Write Gate (blocking):** all definitions are AI-interpreted copy → produce a before/after proposal table per batch and wait for explicit approval before `patch_document_from_json` / `create_documents_from_json`. Use `_from_json` tools only (no `_from_markdown` AI-rewriting).
- **PortableText shape:** every block needs `markDefs: []`, every span needs `marks: []` (CLAUDE.md §Portable Text blocks written via MCP).
- **Sources field shape:** `sources: [{ _key, _type: 'source', text: '...', url: '...' }]`.
- **Render layer — one change (Phase 0):** `GlossaryTermPage.jsx` already renders abbreviation (chip), pronunciation, extendedDefinition, related terms, and sources. The `categories` field is **not** currently in `metadataItems` — Phase 0 adds a Category row (Chip-row, reusing the existing `relatedTerms` chip pattern, linking via `getCanonicalPath({docType:'category', slug})`) positioned **before** the Related Terms entry. Confirm the GROQ query in `queries.js` projects `categories[]->{name, slug}` — add the projection if missing. No new CSS class (reuse `styles.chipRow`).
- **Bextionary category + filter:** `glossaryTerm.categories` already exists, and the glossary archive already supports category context. Activation audit: confirm the `/glossary` archive can filter by category (read `GlossaryArchivePage.jsx`) — if it only filters by letter (AlphaFilter), Phase 5 may need a small category-filter addition (the one possible code touch in this epic; if so, it gets a Human QA Walkthrough row).
- **Masthead parenthetical:** confirm where the glossary archive description/eyebrow copy lives — the `archivePage` Sanity doc (content edit, Content Write Gate) vs. a hardcoded string in `GlossaryArchivePage.jsx` (one-line copy change). Resolve at activation; prefer the content source if one exists.
- **EDS source is local-only:** the Confluence HTML stays on Bex's Desktop. Reference it in this doc; do not copy it into the repo.
- **Human QA Walkthrough (Phase 0 only):** the Category-row render is a frontend change → walk one glossary term page on the dev server, confirm the Category row appears before Related Terms, chips link to `/categories/:slug`, and the row hides cleanly when a term has no categories. Pure-content phases (1–3, 5) remain N/A.

## Model & Mode [REQUIRED]

`/model sonnet` — near-pure content/copy epic with **one small frontend touch** (Phase 0 Category row + possible GROQ projection). Opus planning depth is not required; the audit, relevance table, and category scheme are complete. Sonnet executes Phase 0's code change, then phases 1–5 behind the Content Write Gate.

## Non-Goals

- No schema changes to `glossaryTerm` (all needed fields exist — `categories` already references `category`).
- No new CSS classes (the Category row reuses `styles.chipRow`); the only frontend change is one `metadataItems` entry + a possible GROQ projection add.
- No new DS components.
- No new categories for the DS/EDS vocabulary — existing editorial categories only. (The `Bextionary` category in Phase 5 is the one intentional exception.)
- **No per-component glossary terms** (Chip/Badge/Tag/Input/Tooltip/Popover/Drawer/etc. — dropped; they appear as member-example lists inside the Tier 2 ladder terms).
- Not recreating Atomic Design or Design Tokens (already exist).
- Not importing EDS "Tout" (deprecated) or EDS process/relationship prose that has no Sugartown anchor.

## Related

- **Linear:** [SUG-166](https://linear.app/sugartown/issue/SUG-166/glossary-completion-gap-fill-eds-vocabulary-import)
- **Source glossary:** `~/Desktop/GLOSSARY TO BE/EDS-Glossary_537396784.html` (Bex's EDS Confluence export, Apr 2025 — local only)
- **Drift node that motivated the token-tier import:** `/knowledge-graph/unsupervised-design-system-theme-drift` (SUG-165 followup)
- **Schema:** `apps/studio/schemas/documents/glossaryTerm.ts`
- **Render:** `apps/web/src/pages/GlossaryTermPage.jsx`
- **Epic template:** `docs/epic-template.md`
