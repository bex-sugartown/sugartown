---
**Epic:** SUG-199 — Glossary: AI governance frameworks
**Linear Issue:** [SUG-199](https://linear.app/sugartown/issue/SUG-199)
**Status:** Shipped ✓ 2026-06-26
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-199 — Glossary: AI governance frameworks

Research and publish 4 `glossaryTerm` documents for the AI-governance framework vocabulary referenced by the `/services` card-4 copy: NIST AI RMF, ISO/IEC 42001, Model Card, Policy-as-Code.

> **Shipped 2026-06-26.** All 4 terms published live via `/glossy` (Gate 1 proposal approved, Gate 2 published): [/glossary/nist-ai-rmf](https://sugartown.io/glossary/nist-ai-rmf), [/glossary/iso-iec-42001](https://sugartown.io/glossary/iso-iec-42001), [/glossary/model-card](https://sugartown.io/glossary/model-card), [/glossary/policy-as-code](https://sugartown.io/glossary/policy-as-code). Sibling cross-links wired (NIST RMF ↔ ISO 42001, Model Card ↔ Policy-as-Code). Pure-content epic — terms live in Sanity production; no code merged. The doc-move commit batches to origin at `/eod`.

## Background

The `/services` card-4 rewrite (AI governance) references two named frameworks (NIST AI RMF, ISO/IEC 42001) and the documentation-half vocabulary (Model Cards, Policy-as-Code). The `glossaryTermRef` inline annotation was enabled for `cardBuilderItem` body PT on 2026-06-26 (commits `fd109a99` studio + `9c870505` web), so card 4 can link these terms inline once they exist. None of the four exist in `/glossary` today — de-dupe pre-flight on 2026-06-26 returned 65 existing terms with no match. Terms are drawn from the Kubicka "6 layers for AI Governance" diagram and support SUG-198 governance surfacing.

## Objective

After this epic, four published `glossaryTerm` documents exist at `/glossary` (NIST AI RMF, ISO/IEC 42001, Model Card, Policy-as-Code), each with a clean `X is Y` definition, an opinionated extended definition, verified canonical sources, and `categories[]` wired to the existing **AI** + **Governance** category docs. This epic touches **Sanity content only** (glossaryTerm docs created via the `/glossy` two-gate flow). It does not touch schema, GROQ, or React — the rendering pipeline (annotation + serializer) already shipped.

## Scope

- [ ] NIST AI RMF — `glossaryTerm` doc (research + `/glossy` Gate 1 → Gate 2 publish) — layer: content
- [ ] ISO/IEC 42001 — `glossaryTerm` doc — layer: content
- [ ] Model Card — `glossaryTerm` doc — layer: content
- [ ] Policy-as-Code — `glossaryTerm` doc — layer: content

This epic is **chunk 1** of the Kubicka `/glossy` batch (priorities lead). SUG-200 is chunk 2.

## Acceptance criteria

- [ ] 4 `glossaryTerm` docs published and live at `/glossary/{slug}` (web client uses `perspective: 'published'`, so live on publish)
- [ ] Each term carries ≥1 verified canonical source, canonical-first (NIST AI RMF publication; ISO/IEC 42001 standard page; Mitchell et al. "Model Cards for Model Reporting" paper; an authoritative policy-as-code reference)
- [ ] Each `definition` leads with an extractable `X is Y` sentence; no em dashes, emoji, or banned vocab (glossary is not a node)
- [ ] `categories[]` wired to the real **AI** (`category-ai`) + **Governance** (`wp.category.417`) `_id`s — no new taxonomy created
- [ ] **Content Write Gate:** `/glossy` Gate 1 proposal table approved before any Sanity write
- [ ] No duplicate created — re-run the de-dupe pre-flight at activation

## Technical notes

- **Content Write Gate fires.** Affected surfaces: 4 new `glossaryTerm` documents. Use `/glossy` (structured JSON create/publish, never an AI-rewrite tool).
- **No schema changes.** The `glossaryTermRef` annotation on `cardBuilderItem` body and its `GlossaryTermAnnotation` serializer already landed (2026-06-26). This epic is content-only.
- **Upstream dependencies:** none blocking. The cardBuilder enablement that lets card 4 *link* these terms is already merged.
- **Activation audit:** re-run the `/glossy` de-dupe pre-flight (`*[_type == "glossaryTerm"]{ _id, term, slug }`) before researching — the 2026-06-26 pre-flight may be stale. Relation pre-flight: AI + Governance categories already confirmed to exist; relate to existing terms (Artificial Intelligence, LLM, Agentic Caucus, Human-in-the-loop, Structured content) where genuine.
- **Model & Mode:** `/model sonnet` — pure content epic, no code changes.

## Model & Mode [REQUIRED]

`/model sonnet` — this is a pure content/copy epic executed via `/glossy`. No schema, query, or component code changes.

## Non-Goals

- **The 9 broader Kubicka-layer terms** (Shadow AI, Red-Teaming, Drift Detection, Model Registry, EU AI Act, Data Lineage, Fairness Testing, Audit Trail, Incident Reporting) — these are SUG-200.
- **The 6 practice-descriptive layer phrases** (Risk Tiering, AI Inventory, Data Bias Screening, Output Validation, Accountability Mapping, Escalation Path) — excluded from the glossary; fold into framework entries' extended definitions if useful.
- **The card-4 services copy itself** — separate services-page content work, awaiting sign-off. This epic only creates the terms it will link to.
- **No schema, GROQ, or React changes** — the rendering pipeline already ships.

## Related

- **Linear:** [SUG-199](https://linear.app/sugartown/issue/SUG-199)
- **Sibling epic:** [SUG-200](https://linear.app/sugartown/issue/SUG-200) — chunk 2 (9 vocabulary terms)
- **Supports:** [SUG-198](https://linear.app/sugartown/issue/SUG-198) — 6-layers governance surfacing
- **Epic template:** `docs/epic-template.md`
