---
**Epic:** SUG-201 — Services cards: AI governance copy refresh + glossary linking
**Linear Issue:** [SUG-201](https://linear.app/sugartown/issue/SUG-201)
**Status:** Shipped ✓ 2026-06-26
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-201 — Services cards: AI governance copy refresh + glossary linking

Finalize the `/services` "What I Do" card copy (cards 1, 2, 4, 5) and wire inline glossary links from card 4 to the four AI-governance terms shipped in SUG-199.

> **Shipped 2026-06-26.** Cards 1, 2, 4, 5 patched and published to Sanity (`page` doc `40df3ddc`, live at [sugartown.io/services](https://sugartown.io/services)). Card 4 retitled "AI Content Governance" with the two-half body and four inline `glossaryTermRef` links (model-card, policy-as-code, nist-ai-rmf, iso-iec-42001), all verified to dereference. Hero subheading dropped; cards 3/6/CTA untouched. Pure-content epic — copy lives in Sanity production; no code merged. Doc-move commit batches to origin at `/eod`.

## Background

The `/services` page (Sanity `page` doc, slug `services`, rendered via `RootPage` → `cardBuilderSection`) carries six "What I Do" cards. Card 4 ("AI Workflow Strategy") currently describes Bex's own agentic-caucus toolchain (Claude/Gemini/ChatGPT), which reads as a personal rig rather than a client service. A copy refresh was designed collaboratively this session: a two-half card-4 rewrite (architecture/workflow + documentation/guardrails), plus credential/proof additions to cards 1, 2, and 5. The inline `glossaryTermRef` annotation was enabled for `cardBuilderItem` body PT earlier this session (commits `fd109a99` studio + `9c870505` web, schema deployed), and the four framework terms card 4 references now exist (SUG-199). This epic was created retroactively to track that work and finalize the copy.

## Objective

After this epic, the `/services` "What I Do" cards 1, 2, 4, and 5 carry the refreshed copy, card 4 reads as a client-facing AI-governance service in two halves (architect it to be governable, then document the guardrails), and card 4 inline-links the four SUG-199 glossary terms via `glossaryTermRef`. **Sanity content only** — the schema + serializer rendering pipeline already shipped. Cards 3 and 6 and the hero are untouched.

## Scope

- [ ] Card 4 — rewrite body to the two-half pitch (architecture half + documentation/guardrails half), pivoted to client-facing; optional retitle "AI Workflow Strategy" → "AI Content Governance" — layer: content
- [ ] Card 4 — wire inline `glossaryTermRef` links to NIST AI RMF, ISO/IEC 42001, Model Card, Policy-as-Code — layer: content
- [ ] Card 1 — add the 15+ yrs managing/mentoring + cross-functional credential line — layer: content
- [ ] Card 2 — add "content operations and the content supply chain" — layer: content
- [ ] Card 5 — add the launch-readiness gates proof (eng/brand/QA gate releases), generalized — layer: content

## Acceptance criteria

- [ ] `/services` cards 1, 2, 4, 5 updated; cards 3, 6 and hero unchanged (verify by diff against the current published doc)
- [ ] Card 4 body inline-links all four SUG-199 terms via `glossaryTermRef`, each resolving to `/glossary/{slug}` with the dotted-underline + hover popover
- [ ] **Content Write Gate:** before/after proposal table approved before any `patch_documents` write (the session already has a draft proposal for cards 1/2/4/5; reconfirm the final card-4 two-half copy)
- [ ] Anti-slop clean: no em dashes, no banned vocab; "route around" appears once (card 4, not card 5)
- [ ] Copy written verbatim via `patch_documents` (no AI-rewrite pipeline); blocks carry `markDefs: []` / `marks: []`
- [ ] Visual verification: card 4 renders the glossary annotations on `/services` (the rendering pipeline shipped in `fd109a99`/`9c870505`)

## Technical notes

- **Content Write Gate fires.** Affected surface: `page` doc `slug == "services"`, `cardBuilderSection` "What I Do" card bodies (keys: card 1 `10c9ebf641d9`, card 2 `98638b990a41`, card 4 `ee5bbc07cb92`, card 5 `ab09a0300581` — re-fetch at activation, Sanity may reassign `_key`s).
- **No schema changes.** `glossaryTermRef` annotation + `GlossaryTermAnnotation` serializer + GROQ `PT_CONTENT_PROJECTION` on card bodies already shipped this session (`fd109a99`, `9c870505`). This epic is content-only.
- **Glossary `_id`s for inline links:** NIST AI RMF `0c6fccae-b6ee-40b8-8821-f85c31ac6153`, ISO/IEC 42001 `d0fc8013-ee84-4de5-bdd5-ad0e07e13acd`, Model Card `62c63594-9d16-476d-b019-3a4337d832f0`, Policy-as-Code `69dfe5a0-c65e-4aa2-a46e-18d9cfade3db`. Inline `glossaryTermRef` markDef shape: `{ "_type": "glossaryTermRef", "_key": "...", "term": { "_type": "reference", "_ref": "<id>" } }` referenced by a span's `marks`.
- **Activation audit:** re-fetch the services `page` doc and confirm the four card `_key`s before patching. Decide the card-4 retitle (yes/no) with the user before writing.
- **Upstream:** SUG-199 (glossary terms) — done. cardBuilder enablement — done.
- **Model & Mode:** `/model sonnet` — pure content epic.

## Model & Mode [REQUIRED]

`/model sonnet` — pure content/copy epic executed via `patch_documents`. The code (schema + serializer) already shipped; no further code changes.

## Non-Goals

- **Hero subheading change** — considered and explicitly dropped (too long/specific for that slot); the governance positioning lives in card 4 instead.
- **Cards 3 (Design System Governance) and 6 (RFP / Vendor Selection)** — already carry their share of the resume summary; unchanged.
- **The "How I engage" cards and CTA section** — out of scope.
- **Naming clients** — Estée Lauder / Sephora / Tatcha stay generalized (per session decision); proof is described, not attributed.
- **No schema, GROQ, or React changes** — the rendering pipeline already ships.

## Related

- **Linear:** [SUG-201](https://linear.app/sugartown/issue/SUG-201)
- **Provides the linked terms:** [SUG-199](https://linear.app/sugartown/issue/SUG-199) — AI governance glossary frameworks (shipped)
- **Prior services work:** [SUG-90](https://linear.app/sugartown/issue/SUG-90) — consulting pivot, services page editorial (shipped)
- **Epic template:** `docs/epic-template.md`
