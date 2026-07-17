---
**Epic:** SUG-223 — Article: The Spec You Write After the Build — systematizing an exploratory way of working
**Linear Issue:** [SUG-223](https://linear.app/sugartown/issue/SUG-223/article-the-spec-you-write-after-the-build-systematizing-an)
**Status:** Backlog
**Priority:** 🟣 Soon
**Blocked by:** SUG-222 Phase 0 (ontology map + gap register must exist — they are the article's receipts)
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-223 — Article: The Spec You Write After the Build

A Bex-voice article whose thesis is the working method itself, with SUG-222's reverse-engineered ontology map as the vehicle, plus the map's Mermaid diagram graduating to a `/platform` page.

## Background

**The premise, in Bex's words (2026-07-17):** "we're flying kinda footloose and fancy here at the exploratory phase of new WOW. But when you find something that is working, you need to write it down, bring that systems thinking to bear, so you can do it again, iterate, improve." The article is about that discipline — exploration is deliberately loose, but the moment something works it gets systematized, and the systematizing is what makes iteration possible. The ontology map is the worked example: a spec written *after* the build, reverse-engineered from what the exploratory phase actually produced, which then becomes the instrument for finding the next improvement.

**The cold open is already on the record:** minutes after publishing the Clicky Burden glossary term (itself about governance overhead), clicking its own category chip led to a dead end — `/categories/bextionary` claimed "no content" while 9 terms referenced it, because the taxonomy queries never learned glossary terms exist. One dead-end chip → an ontology map with coverage tiers → a standing gap register. The receipts are real, dated, and already documented in SUG-222's epic doc and this session's red-pen archives.

**Why blocked:** SUG-222 Phase 0 authors the map and gap register publication-shaped on purpose (Mermaid source droppable into a `mermaidSection` unmodified, gap-register prose citable). Drafting the article before those exist would mean inventing the receipts it quotes.

## Objective

After this epic: an article exists as a Sanity draft (never auto-published — the Human-Publishes Rule applies; Bex publishes from Studio), written in the first-person PM register per the brand voice guide, embedding the ontology map's Mermaid diagram via a `mermaidSection` in its sections array; and the same diagram is placed on an appropriate `/platform` page as a content addition. Layers touched: content (Sanity draft creation via the `/write-blog` pipeline, platform page section addition via the Content Write Gate). Explicitly untouched: schema, frontend code, CSS — `mermaidSection` is an existing, approved section type on both articles and pages, so no Phase 0 mock gate fires.

## Scope

- [ ] **Thesis + outline proposal** — layer: content planning. Run the `/write-blog` pipeline's Gate 1: title options, thesis, beat outline (cold open → the footloose-exploration framing → the map as method → the gap register as payoff → the "write it down so you can iterate" close). Wait for Bex's approval before drafting.
- [ ] **Article draft** — layer: content. Full draft per the article register (Bex narrates and directs, AI gets credit/blame for building; plain language; no em dashes; anti-slop checklist). Created as `drafts.*` via `create_documents`, verbatim JSON, stops at draft.
- [ ] **Diagram embed** — layer: content. The SUG-222 Mermaid source dropped into a `mermaidSection` in the article's sections array, with caption. Verify it renders on the article preview.
- [ ] **Taxonomy + glossary wiring** — layer: content. Taxonomy pre-flight, then: tags/categories from existing vocabulary only; inline `glossaryTermRef` marks for terms the piece uses (Clicky Burden, Ontology, Breaking the Blob, Agentic Caucus are obvious candidates — first occurrence only, per the established tagging convention); relatedContent both directions where the schema supports it.
- [ ] **`/platform` diagram placement** — layer: content. Add the map's `mermaidSection` (plus a short intro block) to the appropriate existing `/platform` page — activation audit decides which page. Content Write Gate proposal before the patch; no new page, no new section types.
- [ ] **Red-pen pass** — layer: editorial. `/red-pen` on the draft before it is presented for publish, per the standard final-pass convention. Fresh-context subagent if the same session drafted it.

## Phases

**Phase 1 — Article.** Thesis/outline gate → draft → diagram embed → taxonomy wiring → red-pen. Ends with the draft ready in Studio and Bex told where to find the Publish button.

**Phase 2 — Platform diagram.** Placement audit → Content Write Gate proposal → patch → preview verification. Small by design; independent of the article's publish timing.

## Acceptance criteria

- [ ] Article exists as a Sanity draft with the full arc from the approved outline; zero em dashes outside heading separators; passes the anti-slop checklist
- [ ] The `mermaidSection` renders the ontology diagram on the article preview (verified in browser, not assumed from a clean patch)
- [ ] All glossary/taxonomy references resolve (no dead chips — the article about the dead-end chip cannot ship one)
- [ ] The `/platform` page carries the diagram via an approved Content Write Gate proposal, verified on preview
- [ ] Red-pen Gate 1 report archived under `docs/reviews/red-pen/`; approved findings applied
- [ ] Nothing published by the agent — the draft's existence and location reported to Bex, publish is hers

## Human QA Walkthrough — example local pages

Not applicable — no CSS, token, or component changes. Verification is content-preview checks on the article draft and the one platform page touched (both via localhost preview mode), covered in the acceptance criteria.

## Technical notes

- **Human-Publishes Rule:** fires at both deliverables. The article stays a draft; the platform page patch also stays a draft. Two separate publishes, both Bex's.
- **Content Write Gate:** the article body goes through the write-blog pipeline's own proposal gates; the platform page addition needs its own before/after proposal (existing page, new section content).
- **Dependency check at activation:** confirm SUG-222 Phase 0 shipped and the map file exists at `docs/briefs/sugartown-ontology-map.md` with its Mermaid source block. If SUG-222 stalled, this epic stays blocked — do not draft against an imagined map.
- **Activation audits:**
  1. Read the live map + gap register in full before outlining — the article quotes them; quotes must be verbatim from the shipped version, not this epic's predictions of it.
  2. Read `docs/write-blog-prompt.md` (the pipeline may have changed by activation; SUG-210 may have consolidated it).
  3. Platform placement: read the `/platform` section's page documents in Sanity plus `App.jsx` platform routes to pick the diagram's home; candidates include the CMS/architecture-adjacent pages, but decide from the live IA, not memory.
  4. Re-run the glossary-term pre-flight for inline refs (the vocabulary grows; Clicky Burden and Breaking the Blob were both minted the same week this stub was written).
- **Cold-open fact base:** the session record is in `docs/reviews/red-pen/2026-07-16-sugartown-platform-is-the-portfolio.md` (+ `-rereview`), SUG-222's epic doc, and the Clicky Burden term itself — cite from these, do not reconstruct from memory.
- **Model & Mode [REQUIRED]:** `/model sonnet` — content drafting through an established pipeline with human gates; no architectural ambiguity.

## Model & Mode [REQUIRED]

`/model sonnet` — see Technical notes above.

## Non-Goals

- No auto-publish of anything, anywhere (Human-Publishes Rule).
- No new section types, components, or CSS — `mermaidSection` exists on both surfaces; if a rendering gap is discovered it becomes its own issue, not scope creep here.
- No new glossary terms or taxonomy documents (pre-flight picks from existing vocabulary; gaps get flagged, not filled).
- No `/platform` IA restructure — the diagram lands on an existing page.
- Not a node — this is a Bex-voice article; the AI-narrator register and its exemptions do not apply.

## Related

- **Linear:** [SUG-223](https://linear.app/sugartown/issue/SUG-223/article-the-spec-you-write-after-the-build-systematizing-an)
- **Blocking dependency:** [SUG-222](https://linear.app/sugartown/issue/SUG-222/glossary-category-display-surface-categories-across-glossary-and) — `docs/backlog/SUG-222-glossary-category-display.md` (Phase 0: ontology map + gap register)
- **Precedent:** SUG-166 → SUG-168/169 (epic work spawning article epics); SUG-160, SUG-213 (article-epic shape)
- **Pipeline:** `.claude/skills/write-blog/` → `docs/write-blog-prompt.md`; `/red-pen` for the final pass
- **Epic template:** `docs/epic-template.md`
