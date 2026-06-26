---
**Epic:** SUG-200 — Glossary: AI governance vocabulary
**Linear Issue:** [SUG-200](https://linear.app/sugartown/issue/SUG-200)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-200 — Glossary: AI governance vocabulary

Research and publish 9 `glossaryTerm` documents for the broader AI-governance vocabulary from the Kubicka "6 layers for AI Governance" diagram.

## Background

Follows SUG-199 (the 4 framework terms referenced by card 4). This epic covers the next tier of distinctive, well-anchored vocabulary from the same diagram: terms a practitioner-reader would expect a governance-literate glossary to define. None exist in `/glossary` today (de-dupe pre-flight 2026-06-26, 65 existing terms). Human-in-the-Loop was in the original list but already exists at `/glossary/human-in-the-loop`, so it is excluded. Supports SUG-198 governance surfacing.

## Objective

After this epic, nine published `glossaryTerm` documents exist at `/glossary` (Shadow AI, Red-Teaming, Drift Detection, Model Registry, EU AI Act, Data Lineage, Fairness Testing, Audit Trail, Incident Reporting), each with a clean `X is Y` definition, an opinionated extended definition, verified canonical sources, and `categories[]` wired to the existing **AI** + **Governance** docs. **Sanity content only** — no schema, GROQ, or React changes.

## Scope

- [ ] Shadow AI — `glossaryTerm` doc — layer: content
- [ ] Red-Teaming — `glossaryTerm` doc — layer: content
- [ ] Drift Detection — `glossaryTerm` doc — layer: content
- [ ] Model Registry — `glossaryTerm` doc — layer: content
- [ ] EU AI Act — `glossaryTerm` doc — layer: content
- [ ] Data Lineage — `glossaryTerm` doc — layer: content
- [ ] Fairness Testing — `glossaryTerm` doc — layer: content
- [ ] Audit Trail — `glossaryTerm` doc — layer: content
- [ ] Incident Reporting — `glossaryTerm` doc — layer: content

This epic is **chunk 2** of the Kubicka `/glossy` batch (SUG-199 is chunk 1).

## Acceptance criteria

- [ ] 9 `glossaryTerm` docs published and live at `/glossary/{slug}`
- [ ] Each term carries ≥1 verified canonical source, canonical-first (e.g. EU AI Act → the official EUR-Lex regulation text; Data Lineage / Model Registry / Drift Detection → authoritative MLOps or standards references)
- [ ] Each `definition` leads with an extractable `X is Y` sentence; no em dashes, emoji, or banned vocab
- [ ] `categories[]` wired to the real **AI** (`category-ai`) + **Governance** (`wp.category.417`) `_id`s — no new taxonomy
- [ ] **Content Write Gate:** `/glossy` Gate 1 proposal table approved before any Sanity write
- [ ] No duplicate created — re-run the de-dupe pre-flight at activation (Human-in-the-Loop already excluded)

## Technical notes

- **Content Write Gate fires.** Affected surfaces: 9 new `glossaryTerm` documents. Use `/glossy` (structured JSON create/publish, never an AI-rewrite tool).
- **No schema changes.** Content-only epic; rendering pipeline already ships.
- **Upstream dependencies:** none blocking. Sequenced after SUG-199 by priority, not by hard dependency.
- **Activation audit:** re-run the `/glossy` de-dupe pre-flight before researching. Confirm Human-in-the-Loop is still the only collision. Relate new terms to existing glossary terms (Artificial Intelligence, LLM, Machine Learning, Human-in-the-loop) where genuine.
- **Model & Mode:** `/model sonnet` — pure content epic.

## Model & Mode [REQUIRED]

`/model sonnet` — pure content/copy epic executed via `/glossy`. No code changes.

## Non-Goals

- **The 4 framework terms** (NIST AI RMF, ISO/IEC 42001, Model Card, Policy-as-Code) — these are SUG-199.
- **The 6 practice-descriptive layer phrases** (Risk Tiering, AI Inventory, Data Bias Screening, Output Validation, Accountability Mapping, Escalation Path) — excluded from the glossary as too descriptive to anchor to a canonical source; fold into framework entries' extended definitions if useful.
- **Human-in-the-Loop** — already exists at `/glossary/human-in-the-loop`; enrich separately if desired, not in scope here.
- **No schema, GROQ, or React changes.**

## Related

- **Linear:** [SUG-200](https://linear.app/sugartown/issue/SUG-200)
- **Sibling epic:** [SUG-199](https://linear.app/sugartown/issue/SUG-199) — chunk 1 (4 framework terms)
- **Supports:** [SUG-198](https://linear.app/sugartown/issue/SUG-198) — 6-layers governance surfacing
- **Epic template:** `docs/epic-template.md`
