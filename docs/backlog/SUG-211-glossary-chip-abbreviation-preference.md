---
**Epic:** SUG-211 — Glossary Chip Abbreviation Preference
**Linear Issue:** [SUG-211](https://linear.app/sugartown/issue/SUG-211)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-211 — Glossary Chip Abbreviation Preference

Two related glossary-term display fixes, bundled into one epic at Bex's request:

1. When a `glossaryTerm` has an `abbreviation` (e.g. "ASCII"), every chip/tag rendering of that term should prefer the abbreviation over the full `term` string (e.g. "American Standard Code for Information Interchange"). Full-label contexts (H1s, SEO, archive lists) are correct as-is and explicitly excluded.
2. The inline glossary-term annotation trigger in body text (the words a reader hovers to get a definition popover) is currently a plain dotted underline that's nearly invisible, especially against italic text. It needs a stronger visual affordance — closer in weight to the inline-`code` pill treatment, but visually distinct from it.

## Background

**Fix 1 (chip abbreviation preference)** surfaced 2026-07-15 while publishing the ASCII glossary term (`term`: "American Standard Code for Information Interchange", `abbreviation`: "ASCII") via `/glossy` — a term whose full form is unusually long makes the gap immediately visible in a way most existing terms don't. A full audit (Explore agent, every finding grep-verified directly against source before inclusion here) found the surface is inconsistent: some chip contexts already prefer abbreviation, others fetch it and ignore it, one doesn't fetch it at all.

The root cause: `GLOSSARY_TERM_FRAGMENT` (`apps/web/src/lib/queries.js:96-102`) — whose own doc comment reads *"Compact projection for glossary term references in popovers and **MetadataCard chips**"* — already selects both `term` and `abbreviation`. It was built abbreviation-aware. But `MetadataCard.jsx:314` (the component the fragment names in its own comment) never reads `t.abbreviation`, only `t.term`. This wasn't a deliberate deferral: `docs/shipped/SUG-193-metadatacard-glossary-terms-row.md` (the epic that built this exact chip row) contains zero mentions of `abbreviation`. The field simply wasn't considered when the chip was built.

`GlossaryTermPage.jsx`'s own "Related Terms" row has the same symptom via a different cause: its backing query (`glossaryTermBySlugQuery`, `queries.js:1669-1673`) never selects `abbreviation` on `relatedTerms` at all — the field isn't merely unused here, it isn't fetched.

A live screenshot of the draft node ["The Control Group Kept Taking the Medicine"](https://sugartown.io/nodes/the-control-group-kept-taking-the-medicine) confirmed fix 1 in the wild: the node's status-block "Terms" row (rendered by `MetadataCard.jsx`, same component, same line) showed the full "American Standard Code for Information Interchange" instead of "ASCII."

**Fix 2 (annotation trigger visibility)** was flagged from the same screenshot: the inline "ASCII" reference inside the TL;DR blockquote is barely distinguishable from surrounding italic text. The actual CSS (`GlossaryPage.module.css:159-166`, `.glossaryLink`) is:

```css
.glossaryLink {
  color: inherit;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-color: var(--st-color-seafoam-700);
  text-underline-offset: 3px;
  cursor: help;
}
```

`color: inherit` plus a thin dotted underline is the *only* signal that these words are interactive — there's no background, no weight change. Compare to inline `code` (`globals.css:63-69`, `:not(pre) > code`), which uses a background+border pill via dedicated tokens (`--st-code-inline-bg/border/color`, theme-varying — see `theme.light.css:60-62` and `theme.pink-moon.css:89-92`). This is a live, high-blast-radius issue, not a one-off: a direct query confirms **76 published articles/nodes/case studies** currently contain at least one inline `glossaryTermRef` annotation using this exact styling (e.g. `/nodes/the-em-dash-that-came-back-from-the-dead`, `/articles/the-agentic-caucus`).

## Objective

After this epic:
1. Every chip/tag rendering of a glossary term shows `abbreviation` when present, full `term` otherwise. Full-label contexts (page H1s, SEO/JSON-LD, the `/glossary` archive list, the inline body-annotation *popover* content, Studio reference-picker previews) are unchanged — they already handle this correctly or should never show abbreviation-only, and are named explicitly in Non-Goals so this epic doesn't over-apply the fix.
2. The inline annotation *trigger* (the span/`dfn` wrapping annotated words in body text) has a visibly distinct treatment — not just a thin dotted underline — so a reader can tell at a glance that a word is a glossary reference, without changing the popover's own content (which already shows term + abbreviation together and is out of scope).

Layers touched: GROQ query (one projection), React components (two chip-rendering call sites), Storybook (mock data needs an abbreviation-bearing term to make the fix visible in the existing coverage requirement), CSS + design tokens (new token(s) for the annotation trigger, following the existing token pipeline — no ad hoc values).

## Scope

- [ ] **Query fix** — layer: query. `apps/web/src/lib/queries.js:1669-1673`, `glossaryTermBySlugQuery`'s `relatedTerms` projection. Currently: `_id, "label": term, "slug": slug.current`. Add `abbreviation` to the projection.
- [ ] **GlossaryTermPage "Related Terms" chip fix** — layer: frontend. `apps/web/src/pages/GlossaryTermPage.jsx:116-129`. Currently `label={rel.label}`. Change to prefer abbreviation once the query fix above lands (e.g. `rel.abbreviation ?? rel.label`) — note `label` is itself an alias for `term`, so naming stays consistent with existing convention or gets cleaned up in the same pass, reviewer's call.
- [ ] **MetadataCard "Terms" chip fix** — layer: frontend. `apps/web/src/components/MetadataCard.jsx:314`. Currently `label={t.term}`. `t.abbreviation` is already present on the object via `GLOSSARY_TERM_FRAGMENT` — no query change needed here, only the render line. Change to `label={t.abbreviation ?? t.term}`. This is the highest-blast-radius fix: `MetadataCard` renders on `ArticlePage.jsx`, `NodePage.jsx`, and `CaseStudyPage.jsx` — three detail-page types get the fix simultaneously from one line change.
- [ ] **Storybook mock data** — layer: Storybook. `apps/web/src/components/MetadataCard.stories.tsx` currently has no `abbreviation` field on its mock terms data, so the fix is invisible in the existing story coverage. Add at least one mock term with an `abbreviation` set, so the "Terms" chip variant demonstrates the fix per the repo's Storybook coverage convention (default + meaningful variant + edge case).
- [ ] **Regression confirmation (no code change, verification only)** — layer: QA. Confirm the following stay untouched and full-form, per the audit: `GlossaryTermPage.jsx` H1 (already shows term + separate abbreviation badge — reference pattern, do not touch), `GlossaryTermAnnotation.jsx` inline popover *content* (already shows both together — this bullet is about the popover's content, not its trigger; see the next bullet for the trigger fix), `GlossaryArchivePage.jsx` `dl`/`dt`/`dd` list (already shows abbreviation as a secondary inline element), `ContentNav.jsx` prev/next tiles (styled paragraph, not a chip, no fix needed), all SEO/JSON-LD title generation in `GlossaryTermPage.jsx`, `GlossaryArchivePage.jsx`, and `lib/seo.js` `resolveSeo()` (should stay full-form — these are titles, not chips), and every Studio `preview.select` for a `glossaryTerm` reference field (not space-constrained the way a web chip is; abbreviation already shows as the D1 subtitle).
- [ ] **Inline annotation trigger visibility fix** — layer: CSS + design tokens. `GlossaryTermAnnotation.jsx`'s wrapper (`<Wrapper className={styles.glossaryLink}>`) currently gets only a thin dotted underline (`GlossaryPage.module.css:159-166`) with `color: inherit` — no background, no weight change. Give it a stronger visual treatment closer to the inline-`code` pill (`globals.css:63-69`) in *mechanism* (background + border, not just a text-decoration), but using **new, distinct tokens** — do not reuse `--st-code-inline-*`, since a glossary reference and a code reference are semantically different and sharing the token would make them visually indistinguishable, defeating the point. Follow the repo's Token-First Rule: add primitives/semantic aliases to `tokens/source/tokens.json`, run `pnpm tokens:build`, add matching overrides to both `theme.light.css` and `theme.pink-moon.css` (byte-identical per `validate:style-mirror`), verify the dark-theme computed value before shipping (per CLAUDE.md's dark-mode pre-flight — check for any glassmorphism override on whatever base token the new one anchors to). **The exact color/weight is a design decision, not to be guessed** — get a quick visual check/sign-off from Bex on the proposed treatment before finalizing token values, same as any new token addition. Also worth a quick contrast check (WCAG 1.4.11 non-text contrast) on the current dotted underline as a baseline, since the screenshot suggests it may not meet it, but this hasn't been measured — verify, don't assert.

## Acceptance criteria

- [ ] `glossaryTermBySlugQuery`'s `relatedTerms` projection selects `abbreviation`
- [ ] `GlossaryTermPage.jsx`'s Related Terms chip row shows abbreviation when present, full term otherwise
- [ ] `MetadataCard.jsx`'s Terms chip row shows abbreviation when present, full term otherwise, verified on all three consuming page types (Article, Node, CaseStudy)
- [ ] `MetadataCard.stories.tsx` has a mock term with an abbreviation, and the story visibly demonstrates the shortened chip
- [ ] None of the six explicitly-excluded surfaces (H1, popover content, archive list, ContentNav, SEO/JSON-LD, Studio previews) changed behavior — spot-checked, not assumed
- [ ] Inline glossary-term annotation triggers in body text (`.glossaryLink`) have a visibly distinct treatment from plain text and from inline `code` — verified on at least one live published page with an inline annotation (e.g. `/nodes/the-em-dash-that-came-back-from-the-dead`), in both light and `dark-pink-moon` themes
- [ ] Any new token(s) added for the annotation trigger follow the Token-First Rule: primitive-anchored, present in both `theme.light.css` and `theme.pink-moon.css`, `pnpm validate:tokens` and `validate:tokens --strict-colors` pass with zero errors, `validate:style-mirror` passes
- [ ] Bex has confirmed the proposed visual treatment (background/border/color choice) before it's considered final — this is a design call, not an engineering default
- [ ] `pnpm validate:tokens` / lint pass

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
| Inline annotation trigger (fix 2) | Any page rendering PT body via `portableTextComponents.jsx`/`richTextComponents.jsx` | Live examples exist now, no test data needed: `/nodes/the-em-dash-that-came-back-from-the-dead`, `/articles/the-agentic-caucus`, `/articles/pink-moon-and-ledger` (confirmed via a direct query: 76 published articles/nodes/case studies currently have at least one inline `glossaryTermRef` mark) |

> Activation audit: re-confirm `App.jsx`'s route map for `ArticlePage`/`NodePage`/`CaseStudyPage`/`GlossaryTermPage`/`GlossaryArchivePage` before walkthrough, per `docs/epic-template.md` §Human QA Walkthrough — the table above is a head start from this session's audit, not a substitute for the live check.

## Technical notes

- **Content Write Gate**: not triggered — no content/copy is being written, this is a display-logic fix. The Storybook mock-data addition is fixture data, not published content.
- **Schema changes**: none. `abbreviation` already exists on `glossaryTerm` and is already selected by `GLOSSARY_TERM_FRAGMENT`; only the `glossaryTermBySlugQuery` projection and two render lines change (fix 1).
- **Token changes (fix 2)**: new tokens required for the annotation-trigger treatment. Per CLAUDE.md's DS Component Authoring rules: no raw color values in component CSS, `var(--st-token, var(--st-primitive))` fallback form only, both theme files updated in the same commit, `pnpm tokens:build` run whenever `tokens/source/tokens.json` changes. Do not reuse `--st-code-inline-*` (see Scope bullet for why). Check the Pink Moon dark-block glassmorphism override list (CLAUDE.md §Theme cascade audit) before anchoring the new token to any `--st-color-bg-surface*` primitive.
- **Upstream dependencies**: none. Fully independent of SUG-209 and SUG-210.
- **Activation audits**: none beyond the Human QA Walkthrough route re-check above — the fix-site audit for both fixes in this epic is already complete (see Background), all sites grep- and read-verified this session. The one open item is fix 2's exact token values, which need Bex's visual sign-off (see Scope and Acceptance Criteria) — this is a design decision, not a codebase-read gap.
- **Model & Mode [REQUIRED]:** `/model sonnet` — fix 1 is three small, precisely located edits (one query projection, two JSX render lines) plus a Storybook mock-data addition; fix 2 is a token addition + one CSS rule change, following an established pattern (the inline-`code` token set). No architecture ambiguity in either.

## Model & Mode [REQUIRED]

`/model sonnet` — same reasoning as above.

## Non-Goals

- **Does not change the H1 pattern** on `GlossaryTermPage.jsx` (full term + separate abbreviation badge) — that's the correct reference pattern, not a bug.
- **Does not change the inline body-annotation *popover's content or ordering*** (`GlossaryTermAnnotation.jsx`'s popover, not its trigger) — it already shows both term and abbreviation together; a design question about which one leads visually inside the popover is a separate, smaller follow-up if ever wanted, not this epic's scope. (The *trigger*, i.e. the underlined/annotated word in the body text itself, is in scope — see fix 2.)
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
