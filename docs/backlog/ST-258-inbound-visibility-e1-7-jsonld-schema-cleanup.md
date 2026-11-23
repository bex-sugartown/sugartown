---
**Epic:** ST-258 — Inbound Visibility E1.7: JSON-LD schema cleanup
**Issue:** [#258](https://github.com/bex-sugartown/sugartown/issues/258)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** no
---

# ST-258 — Inbound Visibility E1.7: JSON-LD schema cleanup

Fix the Person and Article structured data so it names the person correctly and carries images.

## Background

The Inbound Visibility audit (finding S6, L8) found JSON-LD problems: a `mailto:` in `sameAs`, no `alternateName`, a narrow `knowsAbout`, Articles without images, and the `/services` page typed wrongly. The 2026-11-17 GEO baseline showed assistants describing Bex as "Senior" and finding her by name on only some prompts. The name form is approved: Becky Head, with alternates Bex and Becky Alice Head. `apps/web/src/lib/jsonLd.js` builds the Person at line 86 (`sameAs` from `doc.socialLinks`) and line 99 (`knowsAbout` from `doc.expertise`); the prerender embeds the JSON-LD (#82, #212). Plan: `resume-factory/Claude outputs/Inbound-Visibility/Inbound-Visibility_EXECUTION-PLAN.md` (step E1.7).

## Objective

After this epic the JSON-LD on `/about` and one article validates with no errors and shows: `sameAs` URLs only (no `mailto:`), `alternateName` of `["Bex", "Becky Alice Head"]`, a broader `knowsAbout`, an `image` on every Article, and the correct type on `/services`. Layers touched: `jsonLd.js`, `jsonLdQueries.js` (GROQ projection for the Article image, reusing `shareImage.js`), content only if `socialLinks` or `expertise` need editing in Sanity (Content Write Gate). Not touched: schema fields, unless an audit shows `alternateName` has no home.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] Filter `mailto:` and non-http values out of `sameAs`, or move the email to a `contactPoint` — layer: frontend (`jsonLd.js`)
- [ ] Add `alternateName` to the Person from the approved name forms — layer: frontend / content
- [ ] Widen `knowsAbout` to the topics that match the work (CMS, DAM, design systems, content operations, composable platforms) — layer: content (Content Write Gate) or frontend
- [ ] Add `image` to Article JSON-LD using the same resolver as og:image (`resolveShareImage`) — layer: query / frontend
- [ ] Fix the `/services` page type — layer: frontend / content
- [ ] Validate with a schema validator on `/about` and one article — layer: tooling

## Phases

Single phase.

## Acceptance Criteria

- [ ] The JSON-LD on `/about` contains no `mailto:` in `sameAs`, and contains `alternateName` with Bex and Becky Alice Head
- [ ] Article JSON-LD for each article has `image` with a fully qualified URL
- [ ] The Schema.org validator (validator.schema.org) reports no errors on `/about` and one article
- [ ] `/services` JSON-LD type matches the page (read in Phase activation)
- [ ] Content Write Gate proposal approved before any Sanity patch; drafts only
- [ ] `pnpm test:smoke` passes; deploy preview checked first

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes.

## Technical notes

- **Activation audits:** read `apps/web/src/lib/jsonLd.js` and `jsonLdQueries.js` in full; query the `person` doc for `socialLinks[]` and `expertise[]` and list the values (check for the mailto entry and the current `knowsAbout` list); read the `/services` page doc `_type` and how the prerender types it. Check `apps/studio/schemas` for an `alternateName` or alias field on `person`; if none exists and the value is better stored in Sanity, propose a schema field table here and deploy the schema (`npx sanity schema deploy` from `apps/studio/`). Hard-coding it in `jsonLd.js` is the fallback; pick one and say why.
- **Years wording** (decided 2026-11-16): 9+ years in product, 28 years in digital since 1998. Use it in any description text; the 34-year career count stays in the article only.
- **Image:** the Article image reuses `resolveShareImage` and `shareImageTags` from `apps/web/src/lib/shareImage.js`, including the stamped-copy path for AI-flagged images (ST-181), so the JSON-LD and og:image cannot disagree.
- **Upstream:** #256 (prerender of index routes, so `/about` and `/services` emit JSON-LD). **Downstream:** none.
- **Push is a production deploy.** Deploy preview first; one deploy per batch.

## Model & Mode [REQUIRED]

`/model sonnet` — contained changes to one lib file, a query projection and a few content edits.

## Non-Goals

- FAQPage markup and robots.txt / llms.txt changes (audit marked "no work").
- The og:image work (#239, shipped).
- Any LinkedIn change.

## Related

- **GitHub:** [#258](https://github.com/bex-sugartown/sugartown/issues/258). Blocked on #256.
- **Shipped context:** #82, #212 (prerender JSON-LD), #239
- **Epic template:** `docs/epic-template.md`
