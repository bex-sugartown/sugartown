---
**Epic:** ST-153: WCAG 2.2 AA conformance claim and W3C logo
**Issue:** [#153](https://github.com/bex-sugartown/sugartown/issues/153)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out: one long-lived branch, one CHANGELOG line at the end
**Visual:** yes
**Vspec:** `docs/drafts/ST-153-wcag-22-aa-conformance-claim-and-w3c-logo.vspec.html`
---

# ST-153: WCAG 2.2 AA conformance claim and W3C logo

Make a WCAG 2.2 Level AA conformance claim legitimate, publish it with the five parts W3C requires, add the W3C AA logo, and add the WCAG glossary terms.

## Background

Sugartown states no public accessibility standard and shows no W3C logo. The attached draft epic (terminology sweep plus Accessibility Statement, `~/Downloads/SUG-NNN-wcag-22-terms-and-accessibility-statement.md`, not yet filed) deliberately excludes the logo until evidence exists. This epic is that follow-on. The logo is a self-declared claim: W3C does not check it, and the publisher is solely responsible if it is wrong. W3C says tools alone cannot establish conformance and a human evaluation is required. Using the logo counts as a conformance claim, so the claim components must sit beside it (WCAG 2.2 §5.3). Glossary check 2026-10-11: no WCAG, accessibility, conformance or contrast term exists in Sanity (`glossaryTerm`, raw perspective, 0 matches). Related: #150, #151, #152 (Pink Moon accessibility passes), #51, #50.

## Objective

After this epic, a dated evaluation record shows every WCAG 2.2 Level A and AA success criterion met (or an exception stated) on a named page set, the Accessibility Statement carries the five required claim components, the footer shows the W3C WCAG 2.2 Level AA logo linked to W3C's Level AA explanation page with W3C's alt text, and the glossary has WCAG terms. Layers touched: content (Statement page edit, glossary drafts), frontend (logo placement), docs (evaluation record, re-evaluation rule). Not touched: Sanity schema, GROQ projections, design-system tokens.

## Scope

- [ ] **1. Conformance evaluation record** (tooling and docs): manual WCAG 2.2 A and AA evaluation of the page set named in the claim, covering every automatically presented variation (themes, breakpoints), recorded in `docs/briefs/design-system/` with date, method, tools, browsers and assistive technologies used. Criteria that fail become issues; the claim waits for them.
- [ ] **2. Conformance claim on the Accessibility Statement** (content): edit the Statement draft to carry the date, "WCAG 2.2" with its URI, level AA, the pages covered (and whether subdomains and Storybook are in or out), and the technologies relied upon.
- [ ] **3. W3C AA logo** (frontend): place the logo with W3C's alt text, linked to `https://www.w3.org/WAI/WCAG2AA-Conformance`, in the footer, with a link to the Statement beside it. Variant (gold or blue) chosen in the vspec.
- [ ] **4. Glossary terms** (content): `/glossy` Gate 1 proposals for WCAG, Conformance Level, Success Criterion, Conformance Claim, Accessibility Statement and Accessibility-Supported. Gate 2 stays Bex's call.
- [ ] **5. Re-evaluation rule** (docs): a written trigger for when the claim is re-checked or the logo is removed (any change to the covered page set, a token change, a new section type), because W3C says to re-review or remove the logo when unsure.

## Phases

| Phase | Ships | Scope items |
|---|---|---|
| 0 | vspec: logo variant, footer placement, claim block layout | 3 (gate) |
| 1 | Evaluation record. Hard stop: Bex confirms every criterion is met, or the claim stays "partially conforms" and the logo is not added | 1 |
| 2 | Claim components on the Statement, glossary proposals | 2, 4 |
| 3 | Logo in the footer, route checks | 3 |
| 4 | Re-evaluation rule, close-out | 5 |

Phase 3 does not start unless Phase 1 ends with all Level A and AA criteria met. Otherwise Phase 3 is cancelled and the epic closes with the partial claim only.

## Acceptance Criteria

- [ ] The evaluation record exists, is dated, names the pages and variations covered, and lists a pass, fail or not-applicable result for every Level A and AA criterion in WCAG 2.2.
- [ ] No criterion marked fail remains when the logo is added, or the logo is absent and the Statement says "partially conforms".
- [ ] The Statement shows all five required claim components, and the page list matches the evaluation record.
- [ ] The logo's alt text and link target match W3C's published embed code for WCAG 2.2 Level AA, checked against `https://www.w3.org/WAI/standards-guidelines/wcag/conformance-logos/` on the day of build.
- [ ] No grep hit for overlay or badge scripts in `apps/web` (`accessibe|userway`), and no wording such as "certified", "verified" or "ADA compliant" in the repo or Sanity.
- [ ] Six glossary term proposals are presented under Gate 1 with the Content Write Gate before-and-after table; none is published without a standalone publish instruction.
- [ ] The Statement is published by Bex, never by the session (Human-Publishes Rule), and the route smoke test passes after publish.
- [ ] The logo renders in dark, light and pink-moon themes with a visible focus indicator, and a keyboard user can reach it.

## Human QA Walkthrough: example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

The footer renders on every page, so the walkthrough covers all page-types.

## Technical notes

- **Content Write Gate** fires: the Statement edit and every glossary term are copy not dictated word for word. **Human-Publishes Rule** fires for both.
- **Schema changes:** none expected. If `glossaryTerm` or `page` cannot express a needed field, stop and report; do not edit `apps/studio/schemas/`.
- **Upstream dependencies:** the Accessibility Statement must exist as a draft first, which needs the unfiled terminology and Statement epic. #150, #151 and #152 must ship first, since the evaluation is meaningless against known failures. The dependency is recorded in the issue body.
- **Logo asset licence:** activation audit: read the W3C logo page's terms on hosting local copies (it allows local copies with the same alt text and link) and record the source URL and fetch date in the evaluation record. Use the W3C embed code verbatim.
- **Footer location:** activation audit: find the footer component in `apps/web/src/components/` and confirm whether the design-system package or the web adapter owns it before editing.
- **Evaluation method:** activation audit: read W3C's WCAG-EM (Website Accessibility Conformance Evaluation Methodology) and decide the page sample with Bex before Phase 1. Automated results from axe-core (Storybook, CI) count as supporting evidence only.
- **Legal:** this epic does not give legal advice. The Statement's wording is reviewed by Bex, and she decides whether outside review is wanted before publish.
- **Model and mode:** see below.

## Model & Mode [REQUIRED]

`/model sonnet`. Content, copy and a single footer placement; no architecture decision. The evaluation judgement is Bex's, not the model's.

## Non-Goals

- No claim of AAA, and no claim wider than the evaluated page set.
- No third-party overlay, widget, "verified" badge or certification wording.
- No fixes to failures the evaluation finds; each becomes its own issue and the claim waits.
- No change to the Statement's evaluation methods beyond what Bex confirms were performed.
- No schema, GROQ or token changes.
- No rewriting of historical accessibility claims in shipped docs or case studies.

## Related

- **GitHub:** [#153](https://github.com/bex-sugartown/sugartown/issues/153)
- **Epic template:** `docs/epic-template.md`: complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- Blocked by: [#150](https://github.com/bex-sugartown/sugartown/issues/150), [#151](https://github.com/bex-sugartown/sugartown/issues/151), [#152](https://github.com/bex-sugartown/sugartown/issues/152), and the unfiled terminology and Statement epic
- W3C: https://www.w3.org/WAI/standards-guidelines/wcag/conformance-logos/ and https://www.w3.org/TR/WCAG22/#conformance-claims
