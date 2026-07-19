---
**Epic:** SUG-90 — Consulting pivot — site editorial and positioning updates
**Linear Issue:** [SUG-90](https://linear.app/sugartown/issue/SUG-90)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-90 — Consulting pivot — site editorial and positioning updates

Reframe sugartown.io to surface consulting/contract availability without closing off FTE: Services page outcome framing, "available for projects" signal on hero/About, case study narrative shifted to client outcomes, Contact tone update, /platform linked from key surfaces.

## Background

Sugartown is repositioning from portfolio-first to consulting-first. The primary conversion goal is attracting freelance/contract clients, with FTE remaining an open option. The current site reads as a personal portfolio: Services lists capabilities rather than engagement value, case studies frame process ("I built X") rather than outcomes, Contact is generic, and the /platform page is not surfaced from primary entry points. The consulting shift was decided as the strategic direction for the site and is the parent driver for several content epics including this one and SUG-91 (case study outcomes).

## Objective

After this epic, the primary consulting conversion surfaces (Services, hero, About, Contact, /platform linking) are rewritten in Sanity to signal availability for client work and speak in terms of outcomes delivered. This is an editorial layer change only — no schema changes, no new page routes, no design system changes. All Sanity patches go through the Content Write Gate (before/after proposal required before execution). Case study schema work (if a new field is warranted) is out of scope and tracked in SUG-91.

## Scope

- [ ] **Services page rewrite** — outcome framing ("what I bring to teams") over capability list; hero heading and body copy — layer: content (Sanity patch)
- [ ] **"Available for projects" signal** — one line on hero or About page, inclusive of both contract and FTE — layer: content (Sanity patch)
- [ ] **Case study narrative framing** — shift body copy from "I built X" to "team shipped X, which enabled Y"; body copy edits only (no schema change) — layer: content (Sanity patch; SUG-91 owns schema work)
- [ ] **Contact page tone** — rewrite CTA and intro to invite project conversations ("let's talk about your project") — layer: content (Sanity patch)
- [ ] **/platform surfaced from key entry points** — add links to /platform from at least two surfaces: About page body, footer, or homepage teaser — layer: content (Sanity patch)

## Acceptance criteria

- [ ] Services page reads as engagement-scoped, not resume-scoped — verified by reading the published doc via GROQ
- [ ] A clear availability signal exists and is visible without navigating away from the homepage or About page
- [ ] At least one case study has an outcome-led narrative in the body copy (full pass is the goal; one is the minimum)
- [ ] Contact page CTA invites project conversations — verified by reading published doc
- [ ] /platform is linked from at least two surfaces beyond the top nav
- [ ] Content Write Gate satisfied for every patch: before/after proposal table produced and approved before each patch executes

## Technical notes

- **Content Write Gate** fires for every Sanity patch in this epic — before/after proposal table required before executing any patch. This is non-negotiable per CLAUDE.md and ai-ethics-and-operations.md Principle 6.
- **No schema changes** — schema field additions (e.g. `outcomesSummary` on caseStudy) belong to SUG-91, not this epic
- **Tool rule**: use `patch_document_from_json` not `patch_document_from_markdown` — verbatim copy, no AI rewriting layer
- **Activation audit**: run `*[_type in ["page", "caseStudy"]]{ _id, _type, slug, title }` to enumerate all documents before planning patches. Confirm current field structure for each surface before writing proposals.
- **Anti-slop**: all copy must pass CLAUDE.md §Anti-Slop Content Rules — no em dashes, no AI vocabulary, no hedge stacking
- **Model recommendation**: `/model sonnet` — pure content, no architecture

## Non-Goals

- No schema changes (that's SUG-91)
- No new page routes
- No design system or component changes
- No homepage structural redesign — framing/copy only
- FTE signalling is not removed — the availability signal must remain inclusive of both contract and FTE

## Related

- **Linear:** [SUG-90](https://linear.app/sugartown/issue/SUG-90)
- **SUG-91:** [Case study outcomes narrative](https://linear.app/sugartown/issue/SUG-91) — schema work that may be required for a deeper case study outcomes treatment
- **Epic template:** `docs/epic-template.md`
- **ai-ethics-and-operations.md** Principles 6 + 7 — the governance context for the Content Write Gate
