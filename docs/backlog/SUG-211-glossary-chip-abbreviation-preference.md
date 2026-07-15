---
**Epic:** SUG-211 — Glossary Chip Abbreviation Preference
**Linear Issue:** [SUG-211](https://linear.app/sugartown/issue/SUG-211)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-211 — Glossary Chip Abbreviation Preference

When a `glossaryTerm` has an `abbreviation` (e.g. "ASCII"), every chip/tag rendering of that term should prefer the abbreviation over the full `term` string (e.g. "American Standard Code for Information Interchange"). Full-label contexts (H1s, SEO, archive lists) are correct as-is and explicitly excluded.

## Background

Surfaced 2026-07-15 while publishing the ASCII glossary term (`term`: "American Standard Code for Information Interchange", `abbreviation`: "ASCII") via `/glossy` — a term whose full form is unusually long makes the gap immediately visible in a way most existing terms don't. A full audit (Explore agent, every finding grep-verified directly against source before inclusion here) found the surface is inconsistent: some chip contexts already prefer abbreviation, others fetch it and ignore it, one doesn't fetch it at all.

The root cause: `GLOSSARY_TERM_FRAGMENT` (`apps/web/src/lib/queries.js:96-102`) — whose own doc comment reads *"Compact projection for glossary term references in popovers and **MetadataCard chips**"* — already selects both `term` and `abbreviation`. It was built abbreviation-aware. But `MetadataCard.jsx:314` (the component the fragment names in its own comment) never reads `t.abbreviation`, only `t.term`. This wasn't a deliberate deferral: `docs/shipped/SUG-193-metadatacard-glossary-terms-row.md` (the epic that built this exact chip row) contains zero mentions of `abbreviation`. The field simply wasn't considered when the chip was built.

`GlossaryTermPage.jsx`'s own "Related Terms" row has the same symptom via a different cause: its backing query (`glossaryTermBySlugQuery`, `queries.js:1669-1673`) never selects `abbreviation` on `relatedTerms` at all — the field isn't merely unused here, it isn't fetched.

## Objective

After this epic: every chip/tag rendering of a glossary term shows `abbreviation` when present, full `term` otherwise. Full-label contexts (page H1s, SEO/JSON-LD, the `/glossary` archive list, the inline body-annotation popover, Studio reference-picker previews) are unchanged — they already handle this correctly or should never show abbreviation-only, and are named explicitly in Non-Goals so this epic doesn't over-apply the fix.

Layers touched: GROQ query (one projection), React components (two chip-rendering call sites), Storybook (mock data needs an abbreviation-bearing term to make the fix visible in the existing coverage requirement).

## Scope

- [ ] **Query fix** — layer: query. `apps/web/src/lib/queries.js:1669-1673`, `glossaryTermBySlugQuery`'s `relatedTerms` projection. Currently: `_id, "label": term, "slug": slug.current`. Add `abbreviation` to the projection.
- [ ] **GlossaryTermPage "Related Terms" chip fix** — layer: frontend. `apps/web/src/pages/GlossaryTermPage.jsx:116-129`. Currently `label={rel.label}`. Change to prefer abbreviation once the query fix above lands (e.g. `rel.abbreviation ?? rel.label`) — note `label` is itself an alias for `term`, so naming stays consistent with existing convention or gets cleaned up in the same pass, reviewer's call.
- [ ] **MetadataCard "Terms" chip fix** — layer: frontend. `apps/web/src/components/MetadataCard.jsx:314`. Currently `label={t.term}`. `t.abbreviation` is already present on the object via `GLOSSARY_TERM_FRAGMENT` — no query change needed here, only the render line. Change to `label={t.abbreviation ?? t.term}`. This is the highest-blast-radius fix: `MetadataCard` renders on `ArticlePage.jsx`, `NodePage.jsx`, and `CaseStudyPage.jsx` — three detail-page types get the fix simultaneously from one line change.
- [ ] **Storybook mock data** — layer: Storybook. `apps/web/src/components/MetadataCard.stories.tsx` currently has no `abbreviation` field on its mock terms data, so the fix is invisible in the existing story coverage. Add at least one mock term with an `abbreviation` set, so the "Terms" chip variant demonstrates the fix per the repo's Storybook coverage convention (default + meaningful variant + edge case).
- [ ] **Regression confirmation (no code change, verification only)** — layer: QA. Confirm the following stay untouched and full-form, per the audit: `GlossaryTermPage.jsx` H1 (already shows term + separate abbreviation badge — reference pattern, do not touch), `GlossaryTermAnnotation.jsx` inline popover (already shows both together), `GlossaryArchivePage.jsx` `dl`/`dt`/`dd` list (already shows abbreviation as a secondary inline element), `ContentNav.jsx` prev/next tiles (styled paragraph, not a chip, no fix needed), all SEO/JSON-LD title generation in `GlossaryTermPage.jsx`, `GlossaryArchivePage.jsx`, and `lib/seo.js` `resolveSeo()` (should stay full-form — these are titles, not chips), and every Studio `preview.select` for a `glossaryTerm` reference field (not space-constrained the way a web chip is; abbreviation already shows as the D1 subtitle).

## Acceptance criteria

- [ ] `glossaryTermBySlugQuery`'s `relatedTerms` projection selects `abbreviation`
- [ ] `GlossaryTermPage.jsx`'s Related Terms chip row shows abbreviation when present, full term otherwise
- [ ] `MetadataCard.jsx`'s Terms chip row shows abbreviation when present, full term otherwise, verified on all three consuming page types (Article, Node, CaseStudy)
- [ ] `MetadataCard.stories.tsx` has a mock term with an abbreviation, and the story visibly demonstrates the shortened chip
- [ ] None of the six explicitly-excluded surfaces (H1, popover, archive list, ContentNav, SEO/JSON-LD, Studio previews) changed behavior — spot-checked, not assumed
- [ ] `pnpm validate:tokens` / lint pass (no new CSS, but standard pre-commit gate applies)

## Human QA Walkthrough — example local pages

Required — `MetadataCard` is a shared component rendered on more than one page type (Article, Node, CaseStudy detail pages), per the repo's Human QA Walkthrough trigger rule.

Known at audit time (2026-07-15), confirm against the live `apps/web/src/App.jsx` route map at execution time since routes may have drifted:

| Page type | Component | Local example |
|---|---|---|
| Glossary term detail | `GlossaryTermPage.jsx` | `/glossary/ascii` (live, has `abbreviation: "ASCII"` — use directly, no test data needed) |
| Article detail | `ArticlePage.jsx` (via `MetadataCard`) | Needs an article with `relatedTerms` or an inline `glossaryTermRef` pointing at a term that has an `abbreviation` — the ASCII term itself is not yet tagged to any published content (confirmed via a live query returning zero references at epic-creation time), so either tag a real published article/node/case-study to ASCII as part of QA, or rely on the Storybook story added in Scope as the primary visual verification and treat a live example as a nice-to-have, not a blocker |
| Node detail | `NodePage.jsx` (via `MetadataCard`) | Same caveat as above |
| Case study detail | `CaseStudyPage.jsx` (via `MetadataCard`) | Same caveat as above |
| Regression guard | `GlossaryArchivePage.jsx` | `/glossary` — confirm the `dl`/`dt`/`dd` list still shows both term and abbreviation as before (unchanged) |

> Activation audit: re-confirm `App.jsx`'s route map for `ArticlePage`/`NodePage`/`CaseStudyPage`/`GlossaryTermPage`/`GlossaryArchivePage` before walkthrough, per `docs/epic-template.md` §Human QA Walkthrough — the table above is a head start from this session's audit, not a substitute for the live check.

## Technical notes

- **Content Write Gate**: not triggered — no content/copy is being written, this is a display-logic fix. The Storybook mock-data addition is fixture data, not published content.
- **Schema changes**: none. `abbreviation` already exists on `glossaryTerm` and is already selected by `GLOSSARY_TERM_FRAGMENT`; only the `glossaryTermBySlugQuery` projection and two render lines change.
- **Upstream dependencies**: none. Fully independent of SUG-209 and SUG-210.
- **Activation audits**: none beyond the Human QA Walkthrough route re-check above — the fix-site audit for this epic is already complete (see Background), all three sites grep- and read-verified this session.
- **Model & Mode [REQUIRED]:** `/model sonnet` — three small, precisely located edits (one query projection, two JSX render lines) plus a Storybook mock-data addition. No architecture ambiguity.

## Model & Mode [REQUIRED]

`/model sonnet` — same reasoning as above.

## Non-Goals

- **Does not change the H1 pattern** on `GlossaryTermPage.jsx` (full term + separate abbreviation badge) — that's the correct reference pattern, not a bug.
- **Does not change the inline body-annotation popover** (`GlossaryTermAnnotation.jsx`) — already shows both term and abbreviation together; a design question about which one leads visually in the popover is a separate, smaller follow-up if ever wanted, not this epic's scope.
- **Does not change the `/glossary` archive list** — already shows abbreviation as a secondary inline element next to the full term, which is correct for a full-label list context.
- **Does not change any SEO/JSON-LD/meta-title generation** — `resolveSeo()`, the `DefinedTerm` JSON-LD on the term page, and the `DefinedTermSet` JSON-LD on the archive page should all keep using full `term`. Changing these would be a regression, not a fix.
- **Does not change Studio reference-picker previews** — an editor picking a term from a dropdown already sees the abbreviation as a subtitle under the full-name title; Studio list rows aren't space-constrained the way a web chip is, so there's no bug to fix there. (A cosmetic "lead with abbreviation in Studio too" polish is a nice-to-have that could be proposed separately, but isn't part of this epic's acceptance criteria.)
- **Does not add a glossary-term filter/search surface** — the audit confirmed none currently exists; building one is out of scope for a display-preference fix.

## Related

- **Linear:** [SUG-211](https://linear.app/sugartown/issue/SUG-211)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **SUG-193** (`docs/shipped/SUG-193-metadatacard-glossary-terms-row.md`) — shipped epic that built the MetadataCard Terms chip row this epic fixes; contains no mention of `abbreviation`, confirming the gap was an oversight, not a deferral
- **SUG-162** (shipped, `docs/backlog/sugartown-backlog-priorities.md` reference) — built the GlossaryTermPage chip/ledger pattern this epic's Related Terms fix touches
- **Motivating content:** the ASCII glossary term (`/glossary/ascii`), published 2026-07-15, whose unusually long full form made this gap visible
