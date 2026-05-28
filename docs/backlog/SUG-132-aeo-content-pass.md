---
**Epic:** SUG-132 — AEO Content Pass — page answer leads, Agentic Caucus article, Webby citation
**Linear Issue:** [SUG-132](https://linear.app/sugartown/issue/SUG-132/aeo-content-pass-page-answer-leads-agentic-caucus-article-webby)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-132 — AEO Content Pass — page answer leads, Agentic Caucus article, Webby citation

Rewrite key page openings to lead with direct answers, add a plain-English Agentic Caucus article for AI discoverability, restructure case study intros to outcome-first, and add the Webby nomination as a cited authority signal.

## Background

AI answer engines extract answers from the first 100 words of a page, not from deep body copy. Sugartown is built for depth and knowledge graph topology — excellent for human readers, but means the answers to the questions recruiters and AI systems actually ask ("Who is Becky Head?", "What does she specialise in?", "Has she shipped a CMS migration?") are buried rather than leading.

The Agentic Caucus — a documented multi-agent AI collaboration practice — is the single strongest differentiator in the portfolio. No other PM candidate has named and versioned this practice. It currently lives inside knowledge graph nodes that AI crawlers may not index deeply enough, and is not legible to anyone who doesn't already know what they're looking at.

The FX Networks Webby nomination is an underused third-party authority signal. If a public award page names Becky Head or the project, it should be cited on /about and the FX case study.

## Objective

After this epic: /about, homepage, and /services each lead with a 2–3 sentence direct answer to the question that page exists to answer. At least one publishable article exists at sugartown.io that explains the Agentic Caucus in plain English, written for human readers and indexable by AI crawlers. Case study openings lead with outcome sentences. The Webby nomination is cited as a credential. The /knowledge-graph archive has a plain-English preamble explaining what nodes are.

Layers touched: Sanity content (Studio edits to page documents, article creation), no schema changes, no frontend code changes.

## Scope

- [ ] **Page answer leads** — add or rewrite opening paragraphs on `/about`, homepage, `/services` to answer their primary query in the first 2–3 sentences. Content Write Gate fires for each page. Layer: Sanity content (page docs)
  - `/about`: "Who is Becky Head?" — name, role, what she has shipped, what she is available for
  - Homepage: "What is Sugartown?" — position + differentiator, 1–2 sentences
  - `/services`: "Can Becky Head do fractional PM work?" — yes/no + scope, price signal or CTA
- [ ] **Agentic Caucus article** — write one 600–900 word article in Bex's voice, published at `/articles/`, that explains the Agentic Caucus in plain English: what it is, why it exists, what it produces, what a session looks like. Written for a hiring manager or recruiter who has never heard the term. No knowledge graph jargon. Layer: Sanity content (new article document)
- [ ] **Case study outcome-first rewrites** — audit case study opening paragraphs; any that bury the outcome must be rewritten to lead with it. Format: "I led [X] at [Client], resulting in [outcome]." Content Write Gate fires. Layer: Sanity content (caseStudy docs)
- [ ] **Webby nomination citation** — find the public Webby award page for FX Networks. If it names Becky Head or the project, add a cited reference on `/about` and the FX Networks case study. One line + link. Layer: Sanity content
- [ ] **/knowledge-graph archive preamble** — add a plain-English intro paragraph to the /knowledge-graph archive page explaining what nodes are, who writes them, and why they exist. Addressed to a reader encountering the KG for the first time. Layer: Sanity content (archivePage doc for knowledge-graph)

## Phases

Single-phase — all content edits. No code dependencies. Can be executed in one Sanity session.

## Acceptance criteria

- [ ] `/about` page first paragraph answers "Who is Becky Head?" — name, role, and at least one shipped proof point visible above the fold
- [ ] Homepage first meaningful paragraph (not hero image) establishes what Sugartown is and who runs it
- [ ] `/services` first paragraph contains a direct answer about fractional PM availability or scope
- [ ] Agentic Caucus article is published at `/articles/[slug]`, readable without KG context, 600–900 words, passes anti-slop checks (no em dashes, no AI vocabulary)
- [ ] At least 2 case study documents have outcome-led opening paragraphs (measured: outcome sentence is in the first 50 words)
- [ ] Webby nomination is cited or the audit concludes the public page does not name Becky Head (either outcome is valid — document the finding)
- [ ] /knowledge-graph archive has a visible intro paragraph in Bex's voice (not AI-agent voice)
- [ ] All Sanity writes preceded by Content Write Gate proposal + explicit approval

## Technical notes

**Content Write Gate (hard stop):** This epic is entirely editorial. The gate fires for every patch. Before touching any Sanity document, produce a before/after table showing current value vs proposed value for each field being changed. Wait for "yes" or "confirmed" before patching.

**Sanity MCP writes:** Use `patch_document_from_json` (not `_from_markdown`) to avoid AI rewriting. All copy is Bex's voice, pre-written before the patch call.

**Agentic Caucus article:** Use the `/write-blog` skill to draft the article as a Sanity draft. Run the anti-slop check from `docs/brand/brand-voice-guide.md` before creating. The article must be in Bex's voice, not AI-agent voice. Key terms to include (for AEO signal): "Agentic Caucus", "multi-agent workflow", "AI-assisted product delivery", "Claude Code", "Sugartown".

**Terminology alignment:** The following term clusters should co-occur naturally in the rewrites (not forced):
- /about: "headless CMS", "content modelling", "design system governance", "fractional"
- /services: "fractional product leadership", "CMS migration", "MACH architecture"
- KG preamble: "knowledge graph", "AI-narrated", "product practice", "Agentic Caucus"

**Webby audit:** Search for "FX Networks Webby" or "UKTV Webby" to find the nomination/award page. If it exists and names Becky Head by name, that is a citable third-party authority signal. If it names the project but not her, note that and skip the citation.

**Model & Mode [REQUIRED]:** `/model sonnet` — pure content/editorial epic, no code changes.

## Non-Goals

- Schema changes — none needed
- Frontend code changes — all changes are Sanity content only
- External publishing (LinkedIn mirror) — that is SUG-133
- Terminology rewriting across all pages — only the pages listed in Scope; this is not a sitewide audit
- New page types or routes — the Agentic Caucus article goes in /articles/, not a new route

## Related

- **Linear:** [SUG-132](https://linear.app/sugartown/issue/SUG-132/aeo-content-pass-page-answer-leads-agentic-caucus-article-webby)
- **Related epics:** SUG-131 (technical fundamentals, run first for full AEO signal), SUG-133 (authority building)
- **Brand voice:** `docs/brand/brand-voice-guide.md` — anti-slop checklist applies to all copy in this epic
- **Epic template:** `docs/epic-template.md`
