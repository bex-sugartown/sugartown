---
**Epic:** SUG-166 — Glossary completion — gap-fill + EDS vocabulary import
**Linear Issue:** [SUG-166](https://linear.app/sugartown/issue/SUG-166/glossary-completion-gap-fill-eds-vocabulary-import)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — each phase merges to main with its own mini-release
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

**Tier 1 — token & theme vocabulary (highest value):**
| Term | EDS one-line definition | Sugartown anchor |
|---|---|---|
| Primitive Tokens | The most basic atomic values — raw colours, sizes, spacing. | base `tokens.css` layer |
| Semantic Tokens | Tokens carrying meaning/usage — where/how a value applies. | semantic aliases + theme overrides |
| Component Tokens | Tokens scoped to one component (e.g. button radius); the theming layer. | `--st-card-*`, `--st-index-cell-*` |
| Theme | A collection of design tokens defining a brand's visual style. | Pink Moon light/dark |

**Tier 2 — DS taxonomy:**
| Term | EDS one-line definition | Sugartown anchor |
|---|---|---|
| Foundations | Underlying principles/styles — colour, type, spacing, a11y, layout. | Storybook "Foundations" |
| Component | Reusable, self-contained UI building block. | DS primitives |
| (Content) Block | Distinct self-contained UI section, combinable into layouts. | `sections[]` / PageSections |
| Pattern | How components are composed within a UI in a given context. | Storybook "Patterns" |
| Layout | Visual arrangement/structure of elements on a page. | — |

**Tier 3 — artifacts & principles:**
| Term | EDS one-line definition | Sugartown anchor |
|---|---|---|
| Component Guidelines | Spec: anatomy, states, behaviours of a component. | Storybook 14-section Guidelines |
| Component Library | Repository of predetermined reusable UI elements. | the DS package |
| Pattern Library | Collections of UI-element groupings/layouts. | — |
| Reusability | Using a component many times without significant modification. | the counterfactual node thesis |
| Flexibility | Adapting to content/screens/use-cases; framework-agnostic. | platform-agnostic doctrine |

**Tier 4 — components & process (import only what Sugartown ships):**
| Term | Note |
|---|---|
| Chip, Badge, Tag | Already Sugartown DS components; Tag is also an IA concept. Confirm each earns a glossary entry. |
| Tooltip, Popover, Scrim, Toast, Dialog | Add ONLY the ones Sugartown actually ships — activation audit against `packages/design-system/src/components/` before creating. |
| Wireframe, Mockup, Prototype | Design-process fidelity stages — relevant to Phase 0 mocks. |
| ~~Tout~~ | EDS marks "to deprecate" — skip. |

Full EDS definitions (verbatim, for shaping the Sugartown versions) live in the source HTML — read it at activation: `~/Desktop/GLOSSARY TO BE/EDS-Glossary_537396784.html`.

## Scope

- [ ] **Phase 1 — Gap-fill existing 17 terms** (Content Write Gate per term batch) — layer: content
- [ ] **Phase 2 — Import Tier 1 token/theme terms** (4) — layer: content (taxonomy creation)
- [ ] **Phase 3 — Import Tier 2 + Tier 3 terms** (~10) — layer: content
- [ ] **Phase 4 — Import Tier 4 terms** (audit which components/process terms Sugartown ships first) — layer: content
- [ ] **Phase 5 — The Bextionary** — coined / in-house / amusing Sugartown-native terms, filed under a `Bextionary` category, with a parenthetical nod on the glossary masthead — layer: content

## Phases (merge-as-you-go)

Each phase is an independent content batch: propose → Content Write Gate approval → write to Sanity drafts → Bex publishes → mini-release. Phase N's Linear sub-task (if used) is Done only after its own merge.

**Phase 1** — Gap-fill. Extended definitions are the heavy interpretive part: cross-check against Bex's index where available; draft first-pass only with approval.
**Phase 2** — Tier 1 token tiers + Theme (the highest-value import; directly closes the SUG-165 gap).
**Phase 3** — Tier 2 + 3 taxonomy/artifacts/principles.
**Phase 4** — Tier 4, after a `packages/design-system/src/components/` audit confirms which UI-component terms map to shipped components.
**Phase 5 — The Bextionary** — origin: a team glossary Bex maintained at a prior job for the obscure and made-up terms her reports found amusing. Sugartown already speaks this dialect; this phase files it. Two registers are kept deliberately separate: the **industry vocabulary** (Phases 1–4) must be *correct* and citable; the **Bextionary** must be *true to Bex* — node-voice definitions, em dashes and deadpan emoji permitted, `status: exploring`. Mechanism: a `Bextionary` `category` (no schema change — `glossaryTerm.categories` already exists), so the `/glossary` archive can filter to just the bextionary while formal terms stay formal. Masthead gets the wink: *"Sugartown Glossary (and the Bextionary)"* on the archive description/eyebrow. Candidate starter set (already living in the nodes): Agentic Caucus · VoPM (Voice of the PM) · Pink Moon · Forensic Storyteller · the Comedic Contract · vibing / vibe-coding · "term term term" · Left to My Own Devices. Each coinage's wording still passes the Content Write Gate.

## Acceptance criteria

- [ ] All 17 existing terms have `extendedDefinition` populated (or an explicit "short-only" decision recorded per term)
- [ ] Abbreviations set: Design system → DS, Knowledge graph → KG
- [ ] GROQ pronunciation set to `/ɡroʊk/`; no IPA added to plain-English terms
- [ ] Sources added for every term with a canonical authority (list above); fuzzy terms explicitly left blank
- [ ] Tier 1–3 terms created (deduped — Atomic Design / Design Tokens NOT recreated); each with short definition + source
- [ ] Tier 4 terms created only for components Sugartown ships (audit recorded)
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
- **Render layer unchanged:** `GlossaryTermPage.jsx` already renders abbreviation (chip), pronunciation, extendedDefinition, and sources. No frontend or CSS changes for Phases 1–4 — pure content.
- **Bextionary category + filter:** `glossaryTerm.categories` already exists, and the glossary archive already supports category context. Activation audit: confirm the `/glossary` archive can filter by category (read `GlossaryArchivePage.jsx`) — if it only filters by letter (AlphaFilter), Phase 5 may need a small category-filter addition (the one possible code touch in this epic; if so, it gets a Human QA Walkthrough row).
- **Masthead parenthetical:** confirm where the glossary archive description/eyebrow copy lives — the `archivePage` Sanity doc (content edit, Content Write Gate) vs. a hardcoded string in `GlossaryArchivePage.jsx` (one-line copy change). Resolve at activation; prefer the content source if one exists.
- **EDS source is local-only:** the Confluence HTML stays on Bex's Desktop. Reference it in this doc; do not copy it into the repo.
- **Human QA Walkthrough:** N/A — no CSS, layout, or multi-page component changes (content into existing render).

## Model & Mode [REQUIRED]

`/model sonnet` — pure content/copy epic, no code changes. Opus planning depth is not required; the audit and relevance table are already complete. Sonnet executes phase-by-phase behind the Content Write Gate.

## Non-Goals

- No schema changes to `glossaryTerm` (all needed fields exist).
- No frontend/CSS changes (render already supports every field).
- No new DS components (Tier 4 imports define existing components as *terms*, they do not create components).
- Not recreating Atomic Design or Design Tokens (already exist).
- Not importing EDS "Tout" (deprecated) or EDS process/relationship prose that has no Sugartown anchor.

## Related

- **Linear:** [SUG-166](https://linear.app/sugartown/issue/SUG-166/glossary-completion-gap-fill-eds-vocabulary-import)
- **Source glossary:** `~/Desktop/GLOSSARY TO BE/EDS-Glossary_537396784.html` (Bex's EDS Confluence export, Apr 2025 — local only)
- **Drift node that motivated the token-tier import:** `/knowledge-graph/unsupervised-design-system-theme-drift` (SUG-165 followup)
- **Schema:** `apps/studio/schemas/documents/glossaryTerm.ts`
- **Render:** `apps/web/src/pages/GlossaryTermPage.jsx`
- **Epic template:** `docs/epic-template.md`
