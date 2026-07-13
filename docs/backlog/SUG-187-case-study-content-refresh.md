---
**Epic:** SUG-187 — Case study content refresh — Monolith to Microservice & Prestige Beauty Pilot
**Linear Issue:** [SUG-187](https://linear.app/sugartown/issue/SUG-187)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (b) Single close-out — one long-lived branch, both case studies ship together in one mini-release
---

# SUG-187 — Case study content refresh — Monolith to Microservice & Prestige Beauty Pilot

Deepen and re-voice two live case studies using source notes from Google Drive Archive and the brand voice guide.

## Background

Two published case studies at `/case-studies/beauty-retail-from-monolith-to-microservice` and `/case-studies/prestige-beauty-pilot-headless-cms-enterprise-design-system` have bones in place but need a proper editorial pass. The Monolith to Microservice piece received detailed peer review (June 2026) flagging enterprise-deck phrasing and two dropped threads — the commercetools/MACH scope decision and the design system POD resolution. The Prestige Beauty Pilot has not yet been built out from its source notes. Both cases sit on the site as conversion surfaces and need to match the voice and proof-point standard the rest of the site now meets. Source material for both lives in `/Volumes/Angelique/Google Drive Archive 26`.

## Objective

After this epic, both case studies are editorially complete: strong proof points foregrounded, Sugartown brand voice applied (no enterprise-deck phrasing, no AI-tell vocabulary, no em dashes), narrative threads closed. The Monolith to Microservice case study specifically addresses the cowork review notes. The Prestige Beauty Pilot is built out from source notes to the same standard. No schema, frontend, or GROQ changes are expected — this is a content-only epic.

## Scope

- [ ] Read and summarise source notes from `/Volumes/Angelique/Google Drive Archive 26` for both case studies — content (what's there) and gaps (what's missing vs live doc)
- [ ] **Monolith to Microservice:** incorporate cowork review recommendations — layer: content (Sanity Studio)
  - Close the commercetools/MACH thread: decide and write whether it belongs here or as a separate case study, then execute
  - Close the design system POD thread: one sentence in Key Outcomes connecting the business plan action item to what shipped (Calepinage/naming)
  - Strip enterprise-deck phrasing: "omnichannel enablement", "unified model powering" + any others surfaced by voice audit
  - Keep and amplify the strongest proof points: migration utility (hundreds of hours → under two), 496 atomic entries, closing governance line
- [ ] **Prestige Beauty Pilot:** build out from source notes — layer: content (Sanity Studio)
  - Extract proof points, outcomes, and narrative arc from Drive archive
  - Write to full case-study standard: background, approach, outcomes, reflection
  - Apply brand voice guide throughout
- [ ] Apply anti-slop checklist (`docs/brand/brand-voice-guide.md`) to all drafted copy before publishing — layer: editorial QA
- [ ] **Content Write Gate** fires for all Sanity patches — proposal table required before any patch executes

## Phases

Single-phase. Ordering: Drive archive read → Monolith draft → Prestige Beauty draft → voice QA → Content Write Gate proposal → patch + publish.

## Acceptance criteria

- [ ] Source notes from `/Volumes/Angelique/Google Drive Archive 26` read and summarised before any drafting begins (no hallucination — all claims sourced)
- [ ] Monolith to Microservice: commercetools/MACH thread resolved in the narrative (either present or explicitly scoped out with a note)
- [ ] Monolith to Microservice: design system POD action item connected to shipped outcome in Key Outcomes section
- [ ] Monolith to Microservice: zero instances of flagged enterprise phrasing remain after voice pass
- [ ] Prestige Beauty Pilot: case study built out from source notes to full narrative standard
- [ ] Both case studies pass anti-slop checklist: no em dashes, no banned vocab, no filler transitions
- [ ] **Content Write Gate:** before/after proposal table shown and approved before any Sanity patch executes
- [ ] Both case studies published in Sanity and live at their existing URLs (no slug changes)

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes. Content-only epic. Spot-check both URLs directly after publish:

- `http://localhost:5173/case-studies/beauty-retail-from-monolith-to-microservice`
- `http://localhost:5173/case-studies/prestige-beauty-pilot-headless-cms-enterprise-design-system`

## Technical notes

- **Content Write Gate:** fires for all content patches to both case study documents. Produce a before/after table per section before patching. This applies even for voice-only changes (current value vs. proposed value).
- **No hallucination:** all claims, numbers, and outcomes must come from the source notes or the existing live documents. Do not invent proof points.
- **Source notes location:** `/Volumes/Angelique/Google Drive Archive 26` — this is a local external volume. Confirm it is mounted before beginning. If not mounted, surface to user before proceeding.
- **Cowork review notes (Monolith to Microservice):**
  - Migration utility story is the strongest proof point — quantified impact, award validation, before/after timing
  - 496 atomic entries detail is high-value — keep and foreground
  - Reflection paragraph is strong — keep as-is
  - Commercetools/MACH: either a separate case study or a gap here — decide with user before writing
  - Design system POD: bridge the action item to the Calepinage/naming outcome (one sentence in Key Outcomes)
  - Closing line "content governance isn't glamorous, but without it, personalization topples" is the best line — keep verbatim
- **Sanity client perspective:** `perspective: 'published'` — patch the published doc or create a draft and publish via MCP `publish_documents`
- **Paired schema note:** `caseStudy` has no paired object/document schema — no schema changes needed
- **Activation audit:** before editing, fetch both current Sanity documents to confirm field structure:
  ```groq
  *[_type == "caseStudy" && slug.current in ["beauty-retail-from-monolith-to-microservice", "prestige-beauty-pilot-headless-cms-enterprise-design-system"]]{
    _id, title, slug, summary, body, outcome, reflection
  }
  ```
  (Adjust field names to match deployed schema — run `get_schema` first.)

## Model & Mode [REQUIRED]

`/model opus` — Opus plans (source note synthesis, narrative decisions, cowork notes integration), Sonnet executes after plan-mode exit. The commercetools scope decision and design system thread closure require editorial judgment before any writing begins.

## Non-Goals

- No schema changes — `caseStudy` schema is unchanged
- No frontend or GROQ changes — existing page templates and queries are sufficient
- No new case studies beyond the two named above
- No changes to other case studies
- The commercetools/MACH work itself (if scoped as a separate case study, it becomes a separate epic)

## Related

- **Linear:** [SUG-187](https://linear.app/sugartown/issue/SUG-187)
- **Live URLs:** `/case-studies/beauty-retail-from-monolith-to-microservice` · `/case-studies/prestige-beauty-pilot-headless-cms-enterprise-design-system`
- **Voice guide:** `docs/brand/brand-voice-guide.md`
- **Upstream:** SUG-90 (consulting pivot editorial pass that set the current case study baseline), SUG-95 (Sanity AI Assist POC on case study fields)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
