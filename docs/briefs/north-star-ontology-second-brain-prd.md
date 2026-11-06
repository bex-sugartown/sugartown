# North Star: Ontology, Second Brain and Content-Delivery LLM: Product Requirements Document

**PRD Version:** v0.1
**Status:** Draft
**Author:** Bex Head
**Domain:** Mixed (CMS/Headless, Platform, AI Workflow)
**Last updated:** 2026-11-06
**Related epics:** TBD. Adjacent: SUG-222 (ontology map), SUG-225 (MCP server), SUG-236 (pages as graph nodes), SUG-36 (site search), SUG-73 (graph viz)
**Source prompt:** Tony Seale, "ontology and the AI second brain", LinkedIn, 2026-11-06. Not yet read: his linked pieces, the Vault-LD spec, Karpathy's LLM wiki gist, NVIDIA Auto Ontology. See Open Decisions.

---

## 1. Problem Statement

Sugartown has three bodies of knowledge that do not share a definition of meaning. The published content lives in Sanity with a content ontology that was reverse-engineered after the fact (`docs/briefs/sugartown-ontology-map.md`, SUG-222). The working knowledge lives in plain-text files read by AI sessions (`CLAUDE.md`, `conventions/`, memory, `docs/`). The reader-facing surface has no way to ask a question of the content: SUG-36 (site search) is still in Backlog with no engine chosen. An LLM that reads any of these bodies has nothing authoritative to check a term against, so a guess about what a word means can be saved, linked and read back as fact. The ontology map also describes intent and coverage but is not versioned, so a changed definition gives no list of pages to recheck.

---

## 2. Goals & Non-Goals

| Goal | Description |
|------|-------------|
| Ask the site a question | A visitor can ask a natural-language question and get an answer assembled only from published Sugartown content, with each claim linked to the node it came from. **Lead theme.** |
| One governed ontology | The content ontology exists as a versioned spec that names every node type, edge and term definition once, and that tooling can read. |
| Drift is catchable | When a definition or edge changes, a command lists the documents and answers that depended on the old version. |
| Second brain with a referee | AI-maintained notes (conventions, memory, docs) are checked against the same ontology, so a session cannot silently redefine a term. |
| Defined roadmap | Every existing epic that serves a goal above is placed in Now, Next or Later, and every missing epic is named (section 7b). |
| Human stays the publisher | No LLM output becomes live content without the existing Content Write Gate and Human-Publishes sign-offs. |

| Non-Goal | Why excluded |
|----------|-------------|
| LLM writes or publishes to Sanity | Violates the Human-Publishes Rule and `docs/briefs/ai-ethics-and-operations.md` principles 6 and 7. The delivery layer is read-only, matching the MCP server's non-goal in `sugartown-mcp-prd.md`. |
| Answering from outside published content | Mixing in model memory is how ungrounded claims reach readers. |
| Querying drafts | The web client reads the `published` perspective only (`apps/web/src/lib/sanity.js`, content perspective delegated to `contentState.js`). |
| Multi-user shared second brain | One author decides what words mean today. Team scale is a later question, once the ontology is versioned. |
| Adopting Vault-LD wholesale | Not yet read. Adoption is an open decision, not an assumption. |
| Choosing a vendor or model | Belongs to the FSD, after a prototype settles the retrieval claim. |

---

## 3. Lead Theme: Content-Delivery LLM

Three layers, in build order. The ontology is the referee for the other two.

| Layer | What it is | Existing foothold |
|-------|-----------|-------------------|
| 1. Ontology spec | Versioned, machine-readable statement of node types, edges and term meanings | `sugartown-ontology-map.md` (audit, not yet a spec); Bextionary glossary terms in Sanity (`glossaryTerm.ts`) |
| 2. Delivery LLM | Read-only retrieval and answer layer over published Sanity content, citing nodes | `packages/mcp-server` (repo tools only); SUG-36 index options; SUG-236 (pages as graph nodes) |
| 3. Second brain | LLM-maintained notes checked against layer 1 | `CLAUDE.md`, `conventions/`, memory files, `docs/` |

The Karpathy pattern in the source post uses plain text and no vector database. Whether Sugartown's corpus (about 220 published documents per SUG-36) needs retrieval infrastructure at all is the first thing a prototype should settle.

### Prototype path: a private evaluation project

A separate private project compares CMS platforms against client requirements. Its profiles are the only authored data, its comparison matrix is generated from them, and its checks reject unsourced or retired claims. That makes it a small, structured, tiered corpus with an existing grader, so it is the cheaper place to settle Open Decision 2 before any public surface exists.

| Sugartown concept | Evaluation-project counterpart |
|-------------------|--------------------------------|
| Ontology map | Capability taxonomy and requirements framework |
| Bextionary glossary | One shared vocabulary for capability names |
| "Not covered" answer | Empty cell, which that project treats as research backlog |
| Draft canary (US-002) | Confidential-tier canary: restricted material must never be retrieved by a lower tier |

Rules the prototype must keep: read-only; answers only from profiles, each with its source; unknown stays unknown; the model never scores or recommends, because a free-form comparison is the preference-smuggling that project's generated-matrix rule exists to prevent; one index per confidentiality tier, never a shared one. This PRD names no client and no confidential detail. Private specifics live in that project's own repo.

---

## 4. User Stories

| ID | Title | User Story | Acceptance Criteria | Priority |
|----|-------|-----------|---------------------|----------|
| US-001 | Grounded answer | As a visitor, I want to ask a question and get an answer from Sugartown content so that I find what I need without browsing archives | Every sentence of an answer carries a link to a published document; asking about something not on the site returns "not covered" and no invented answer | P0 |
| US-002 | Published only | As Bex, I want the answerer to see published content only so that drafts never leak | A document that exists only as a draft is never cited, tested with a known draft | P0 |
| US-003 | Term fidelity | As a visitor, I want a term answered with its Bextionary definition so that the same word means the same thing everywhere | A question using a glossary term returns the Sanity definition text unaltered | P1 |
| US-004 | Versioned definitions | As Bex, I want each ontology definition versioned so that I know what to recheck when one changes | Changing a term or edge produces a list of dependent documents from one command | P1 |
| US-005 | Drift check on notes | As Bex, I want AI-edited conventions and memory checked against the ontology so that a session cannot quietly redefine a term | A check fails when a note uses a defined term in a way that contradicts its definition | P2 |
| US-006 | Graph participation | As Bex, I want pages included as graph nodes so that the answerer can cite them | Delivered by SUG-236; this PRD depends on it, not duplicates it | P1 |

---

## 5. Technical Architecture

No code here. Contracts and boundaries only.

**Content model.** No new document type is assumed. Candidate additions, each an open decision in section 8: a version field on `glossaryTerm`, and a machine-readable ontology file outside Sanity (for example under `docs/briefs/data/`) generated from schemas, not hand-maintained. The repo rule applies: a register is generated or it does not exist (`CLAUDE.md` §Building a mechanism, rule 3).

**Query contract.** The answerer reads through the existing published-perspective client. It may use GROQ dereferencing along the edges already marked displayed in the ontology map. Edges marked schema-only or orphaned there are not citable until fixed.

**Render contract.** A new answer surface is a new visual format, so it needs a Phase 0 vspec before any JSX (`CLAUDE.md` §Phase 0 visual spec gate). No UI is specified here.

**Integration points.** Sanity published dataset; `packages/mcp-server` as the likely home of an ontology tool (read-only); a model provider and a retrieval method, both undecided.

**Data authority.** Sanity owns content and definitions. The ontology spec is derived from Sanity schemas. The LLM owns nothing.

**Failure behaviour.** If retrieval or the model is unavailable, the surface falls back to the existing archive and taxonomy navigation. It never shows a partial answer without citations.

---

## 6. Content Model

Not applicable as a field table yet. The first decision is whether definitions get versioned in Sanity or in the generated spec. See Open Decisions 3.

---

## 7. Design Constraints

- `st-*` namespace, CSS Modules, no hardcoded values, tokens from `tokens/source/tokens.json`.
- Pink Moon identity: sharp neutral surfaces, hot colour signal, EB Garamond headings, Courier Prime metadata.
- AI output is labelled per `ai-ethics-and-operations.md` principle 13. The answer surface says it is machine-generated, and names the sources it used.
- Accessibility: answer text, citations and any loading state must meet WCAG 2.2 AA; the AI surface must not break keyboard or screen reader use.
- Carbon cost (principle 12) is a stated constraint: prefer the cheapest method that meets US-001.

---

## 7b. Roadmap to Execution

**Goal:** a defined path from quick wins, through gap fillers, to the north star. Checked 2026-11-06 by listing `docs/shipped/`, `docs/backlog/` and `gh issue list --state all`. Existence and titles are verified. The fit to each goal is a judgement from titles and the ontology map, not a re-read of every epic doc, so confirm scope before sequencing any of them.

### Foundation: already shipped

| Epic | What it gives this PRD | Goal served |
|------|------------------------|-------------|
| SUG-222 | Ontology map and glossary category display | One governed ontology |
| SUG-225 | MCP server v1, read-only repo tools | Referee tooling; model for a content tool |
| SUG-210 | Content pipeline rules, added `page.related` | Ontology; feeds SUG-236 |
| SUG-189, SUG-190 | Content taxonomy audit, vocabulary audit | One governed ontology |
| SUG-186, SUG-193, SUG-211, SUG-216, #136 | Glossary and term-display work in related sections, MetadataCard, citations | Term fidelity (US-003) |
| #21 (SUG-73 lineage) | Knowledge-graph node renderer | Graph participation |
| SUG-93 and `apps/web/public/llms.txt` | AEO/GEO content layer, first machine-readable entry point | Ask the site a question |
| #95, #96, #97, SUG-256 | Liveness probes, claim honesty for published statistics | Drift is catchable |
| SUG-227, ST-99, ST-101, SUG-196 | AI/Claude workflow, rule-change QA, renamed-heading check, AI tooling docs | Second brain with a referee |
| ST-178, ST-179, ST-181, ST-183 | AI image provenance and labelling | Human stays the publisher (labelling) |

### Now: quick wins

Small, open, and each removes something that would break an answer or a citation.

| Item | Why it is a quick win | Goal served |
|------|----------------------|-------------|
| #174 Tag schema points to a missing `controlled-vocabulary.md` | A definition source that does not exist; the ontology cannot cite it | One governed ontology |
| #143 Link plus glossary term renders nested `<a>` | Term links are the citation surface; this breaks hydration | Term fidelity |
| #185 Glossary links told apart by colour alone | Accessibility gate for any surface that cites terms | Accessibility criterion |
| #93 (SUG-269) Make Sanity-backed validators probeable | A referee that cannot be probed cannot be trusted | Drift is catchable |
| #84 (SUG-253) llms.txt, accessibility tree, agentic browsing fixes | Cheapest existing step toward machine-readable delivery | Ask the site a question |
| #83 (SUG-252) JSON-LD for Project and Tool pages | Structured data on two types that lack it | Ask the site a question |
| Ontology map gap register items | The map names its own gaps; close the schema-only and orphaned edges first | Ontology; citable edges |

### Next: gap fillers

Medium effort. Each makes the graph complete and consistent enough to cite.

| Item | What it fills | Goal served |
|------|---------------|-------------|
| #78 (SUG-236) Pages as knowledge-graph nodes | Pages cannot be cited until they are nodes | Graph participation (US-006) |
| #77 (SUG-235) Normalize related-content fields; decide `glossaryTerm` sources shape | One edge name per meaning | One governed ontology |
| #47 (SUG-107) Client taxonomy: string to reference | A free-text field standing in for a node | One governed ontology |
| #42 (SUG-056) Computed enrichments, industry taxonomy, audience enum | Missing classification dimensions | One governed ontology |
| #73 (SUG-228) Taxonomy and glossary browsing UX audit, naming collisions | Two names for one thing, found in the audit | Term fidelity |
| #69 (SUG-208) MetadataCard max density and page-type metadata audit | Which metadata is display and which is data only | Graph participation |
| #64 (SUG-200) AI governance vocabulary terms | Vocabulary the answers will be asked about | Term fidelity |
| #138 Schema deployed from a branch turns main CI red | Ontology changes need a safe deploy path | Drift is catchable |
| #105 `component-registry.json` generated but never regenerated | A register that is not regenerated is stale by the repo's own rule | Second brain with a referee |
| #104 Vspecs do not survive their epic | Specs that cannot be diffed cannot be checked | Second brain with a referee |
| #81 (SUG-250) Agentic caucus tool-selection audit and handoff workflow | Context transfer between AI sessions | Second brain with a referee |

### Later: north star

Filed 2026-11-06 as issues #194 to #200, all Backlog and Low priority. #39 is an existing epic and a decision, not a new issue. Each waits on the prototype result or the ontology spec.

| Proposed epic | Depends on | Goal served |
|---------------|-----------|-------------|
| #194 Prototype: retrieval and grounded answers on the private evaluation project | Decision 2 | Settles the retrieval question cheaply |
| #197 Ontology spec: generated, versioned, CI-diffed (tool) | #174, gap register, #77 | One governed ontology |
| #198 Definition versioning and a dependents command (tool) | Ontology spec | Drift is catchable (US-004) |
| #199 Ontology tool in the MCP server, read-only (tool) | SUG-225, ontology spec | Referee for sessions |
| #200 Second-brain check: AI-edited notes against the ontology (tool) | Ontology spec | US-005 |
| #195 Answer surface vspec (Phase 0 gate) | Prototype result, #39 decision | Ask the site a question |
| #196 Delivery LLM, read-only, cited, published only | All of the above | Ask the site a question |
| #39 (SUG-36) Site-wide search: fold in or keep separate | Decision 5 | Ask the site a question |

### Labels

Every issue in this roadmap carries `north-star` plus one pillar label: `pillar: ontology`, `pillar: delivery` or `pillar: second-brain`. List them with `gh issue list --label north-star --state all`. Applied 2026-11-06 to 31 issues, open and closed; the label query, not this table, is the current list.

The board's `Priority` field carries the horizon, so there are no separate Now, Next or Later labels. Quick wins are High (and so at Todo), gap fillers are Medium, north-star items are Low. Set 2026-11-06. This bends the usual Now=Urgent mapping in `.claude/skills/new-epic/docs/new-epic-prompt.md`, on purpose: Urgent means it blocks current work, which no quick win does.

### Sequencing rule

Quick wins and gap fillers run in any order and need no prototype. North-star items wait on the prototype and on the ontology spec. No answer surface ships before US-002 (published only) and US-001 (grounding) have passing tests.

---

## 8. Open Decisions

| # | Decision | Options | Owner | Target |
|---|----------|---------|-------|--------|
| 1 | Read the source material before the FSD | Tony's linked posts, Vault-LD spec, Karpathy gist, NVIDIA Auto Ontology | Bex + session | Before AI PRD |
| 2 | Is retrieval infrastructure needed at all | Plain-text/context approach, client-side index (SUG-36 option B), Sanity embeddings, hosted search | Bex | Prototype result, run first on the private evaluation project (section 3) |
| 3 | Where definitions are versioned | Field on `glossaryTerm`, generated spec file, both | Bex | FSD |
| 4 | Visitor-facing or editor-facing first | Public answer surface, or an editor/MCP tool first | Bex | Before epic split |
| 5 | Relationship to SUG-36 | Fold into site search, or keep as a separate surface | Bex | Before epic split |
| 6 | Vault-LD adoption | Adopt, borrow ideas, ignore | Bex | After decision 1 |
| 7 | Ontology change that shifts meaning unnoticed | Source-post comment raises that an AI can nudge a person's reading, who then edits the ontology. Needs a human-review rule for ontology edits | Bex | FSD |

---

## 9. Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Ontology map edges marked schema-only or orphaned make answers incomplete | High | Close SUG-222 gap register items before citing those edges |
| Pages not yet graph nodes (SUG-236) | Med | Sequence SUG-236 first, or exclude pages from phase 1 |
| Answer sounds confident but is ungrounded | High | Citations required per sentence; "not covered" is the default; red-pen style review of a sample set |
| Draft or unpublished content surfaces | High | Published perspective only, with a draft canary test (US-002) |
| Doc-count and cost grow with a hosted vendor | Med | Prototype the cheapest method first; no vendor before decision 2 |
| This PRD rests on one LinkedIn post read once | Med | Decision 1 runs before any AI PRD or FSD |
| Shared retrieval leaks restricted material across confidentiality tiers | High | One index per tier; a restricted-tier canary in the test set; this public PRD carries no private project detail |
| Brand voice drifts in generated answers | Med | Answers quote or link source text; they do not restyle it |

---

## 10. Success Criteria

Each is checked by a command or a test set, with the date measured.

| Area | Metric |
|------|--------|
| Grounding | In a fixed 30-question test set, 100% of answer sentences link to a published document; measured by a script, date recorded |
| Safety | 0 citations of draft-only documents across the test set, including 3 seeded draft canaries |
| Coverage | Questions outside the corpus return "not covered" in 100% of 10 seeded out-of-scope questions |
| Ontology | One command regenerates the ontology spec from schemas with no hand edits; CI fails when the committed copy differs |
| Drift | Editing one glossary definition produces a dependent-document list from one command |
| Accessibility | Axe and keyboard walk-through pass on the answer surface |

---

## 11. Out of Scope (Deferred)

| Item | Owner |
|------|-------|
| Write-back or AI-drafted content in Sanity | Existing skills (`/write-node`, `/glossy`) under the Content Write Gate |
| Team-shared second brain | Future brief, after ontology versioning exists |
| Graph visualisation changes | SUG-73 lineage |
| Commerce or Shopify content | Separate projects |

---

## 12. Authoring Checklist

- [x] Claims reference real files, and ones I opened: ontology map, MCP PRD, SUG-36, SUG-236, `sanity.js`
- [ ] Not verified: that `contentState.js` forces `published` in production; open it before the AI PRD
- [ ] Not verified: how many glossary terms exist; run a count before sizing
- [x] No `featuredImage`, no em dashes
- [ ] Source material (decision 1) still unread
