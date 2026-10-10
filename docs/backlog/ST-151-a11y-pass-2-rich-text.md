---
**Epic:** ST-151 — Pink Moon accessibility Pass 2: rich text, semantics, status chips
**Issue:** [#151](https://github.com/bex-sugartown/sugartown/issues/151)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-151-a11y-pass-2-rich-text.vspec.html`
---

# ST-151 — Pink Moon accessibility Pass 2: rich text, semantics, status chips

Make the four inline marks, the glossary and citation components, and the status chips accessible without relying on colour, using the 2026-10-10 decisions in the v2 accessibility audit.

## Background

Blocked by #150 (ST-150, Pass 1): `--st-color-text-signal` must exist before this epic starts. Pass 1 fixes contrast values. What remains is how marks are identified without colour (link, glossary term, citation, inline code), whether the glossary and citation components are operable by keyboard and screen reader (the auditor never saw their source), and two status colour maps that assign different hues to the same status (`--st-status-*` and `--st-chip-dot-*`). Documentation also contradicts the tokens. Glossary treatment reopens SUG-211 Option E (pink text on lime). Surfaces: article and node prose, glossary term pages, citation footnotes, status chips and dots, card label strips.

## Objective

After this epic, each inline mark has a cue other than colour, glossary terms and citation markers are real controls announced correctly, every status chip and dot reads from one map, label sizes meet the 11px floor, and the docs match the tokens. Layers touched: component CSS and markup (`GlossaryTermAnnotation.jsx`, citation components, portable-text serializers), tokens, docs. Not touched: Sanity schema or GROQ. If the glossary popover lacks a projected definition, stop and flag it.

## Scope

- [ ] **A3, glossary term, component CSS.** Lime on both themes. Light: lime-200 fill, neutral-700 type, neutral-700 dotted rule (8.03:1). Dark: lime at 18% over the card, lime-200 type and dotted rule (9.68:1). Add tokens `--st-glossary-decoration-color`, `--st-glossary-decoration-style`, `--st-glossary-decoration-thickness` (2px dotted).
- [ ] **A6, prose links, component CSS.** In prose scopes only (portable text, article and node bodies), links are always underlined: text colour, 1px pink underline, offset from `--st-link-underline-offset`. Nav and card links stay bare. Hover thickness 2px.
- [ ] **A8, glossary semantics, frontend.** The term trigger is a real `<button type="button">` (or `<a>` if it navigates) with `aria-expanded` and `aria-controls`. The popover is dismissible with Esc without moving focus, hoverable and persistent (WCAG 1.4.13). On the term's own entry page the term is wrapped in `<dfn>`.
- [ ] **A8, citation semantics, frontend.** Marker link: `aria-label="Citation N"`, `role="doc-noteref"`, `id="cite-ref-N"`. Note: `role="doc-endnote"` inside `role="doc-endnotes"`, with a back-link `role="doc-backlink"` and `aria-label="Back to citation N"`. Marker and index size 0.75rem minimum.
- [ ] **A9 and A4 status, tokens and component CSS.** One map for chip and dot: a grey chip and a pink dot for every status, ring dot for draft, solid dot for in progress, the uppercase word carries the state. `--st-chip-dot-*` aliases `--st-status-*`; crimson leaves draft. Dot contrast 3.47:1 light and 4.82:1 dark (non-text). This replaces the A4 status foreground fixes and the A13 violet dot fix.
- [ ] **Card titles and eyebrows, component CSS (decided 2026-10-10).** Card H3 titles at 1.75rem (28px) are pink: large text, 3.47:1 light, 4.82:1 dark. Any card title under 24px regular or 18.66px bold stays in text colour. Card eyebrows take the text colour, not pink.
- [ ] **A11, label size, tokens.** `--st-label-size` 0.65rem to 0.6875rem; `--st-metadata-density-label-size` 0.55rem to 0.6875rem. Check card footers and IndexCell at 320px width for wrapping.
- [ ] **A15, documentation, docs.** Tactical Guide: pink-500 is `#FF247D`, brand-secondary is maroon, target-size rule states WCAG 2.2 AA 24×24px with 44px as the house target for primary actions (chips exempt), and the Deep Pink Rule in token terms. `theme.pink-moon.css` comment: neutral-500 is `#6C6C6F`. `colors_and_type.css`: `--st-label-color` default neutral-500; card titles are UI sans.

## Phases

Single phase.

## Acceptance Criteria

- [ ] Prose sample containing link, glossary term, citation and inline code: each is distinguishable under CSS `filter: grayscale(1)`, both themes.
- [ ] Glossary text against its fill: 8.03:1 or more light, 9.68:1 or more dark. Dotted rule against fill 3:1 or more.
- [ ] Glossary trigger is reachable by Tab, opens on Enter and Space, closes on Esc with focus returned to the trigger, and the popover stays open when the pointer moves onto it.
- [ ] VoiceOver announces a citation marker as "Citation 1, link", and the back-link returns focus to the marker.
- [ ] No `--st-chip-dot-*` token holds a literal value; all alias `--st-status-*`.
- [ ] Labels render at 11px with no new wrapping in card footers at 320px.
- [ ] `grep -r "FF69B4" docs/` finds nothing.
- [ ] `pnpm validate:tokens --strict-colors` and `pnpm test:smoke` pass; one article with citations and glossary terms and one knowledge-graph node with a status chip render in both themes.

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach, and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Upstream dependency:** #150 must be merged. This epic does not start before it.
- **Phase 0 gate fires** (Visual: yes). The v2 audit HTML is the vspec; sign-off covers the glossary, link, citation, inline-code and status chip specimens (sections 02b and 02c).
- **Activation audits.** (1) Read `apps/web/src/components/GlossaryTermAnnotation.jsx` and `apps/web/src/pages/GlossaryTermPage.jsx`; record element types, ARIA and event handling before changing them. (2) Run `grep -rn "citation" apps/web/src/components/` and the portable-text serializers (three files define PT components; see MEMORY.md PortableText registry) and update all that render markers. (3) Read the glossary term query in `apps/web/src/lib/queries.js` and confirm the popover has its definition; if not, stop and flag. (4) Read the status values from the schema `options.list`, not from memory. (5) Read the shipped card CSS and list every card variant whose title is under 24px, so none is made pink.
- **A12 resolved:** keep the pink focus ring with its 2px offset; no inner ring. Focused buttons keep the white label on pink-600.
- **Content Write Gate:** not applicable. **Schema:** none expected; stop and flag if needed.
- **Model & Mode [REQUIRED]:** `/model sonnet`. Component markup and CSS with decisions made. Use `/model opus` with plan mode only if the activation audit finds the popover must be rebuilt.

## Model & Mode [REQUIRED]

`/model sonnet`. Decisions are recorded; the work is CSS, ARIA and markup.

## Non-Goals

- Pass 1 token contrast work: ST-150.
- Chip neutral border non-text contrast: #51. Storybook a11y gate: #50.
- Focus ring change (A12): decided against.
- New schema fields or GROQ changes.

## Related

- **GitHub:** [#151](https://github.com/bex-sugartown/sugartown/issues/151)
- **Blocked by:** [#150](https://github.com/bex-sugartown/sugartown/issues/150)
- **Also:** #51, #50; SUG-211 (glossary term treatment, shipped)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
