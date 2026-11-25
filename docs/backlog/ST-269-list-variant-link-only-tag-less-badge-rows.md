---
**Epic:** ST-269 — List variant: link-only, tag-less and badge rows
**Issue:** [#269](https://github.com/bex-sugartown/sugartown/issues/269)
**Status:** Backlog
**Priority:** 🟣 Soon
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one CHANGELOG line at end
**Visual:** yes
**Vspec:** `docs/drafts/ST-269-list-variant.vspec.html`
---

# ST-269 — List variant: link-only, tag-less and badge rows

Let the DS `List` render rows that have no gutter tag, rows that are a plain link, and rows that carry a badge or secondary label, so the Sitemap, Series and glossary Sources lists can migrate off raw `<ul>` markup.

## Background

SUG-177 (#56) audited every raw list surface and kept all of them raw: the `List` register row is a 138px gutter tag, a title and a 96px date, and each candidate would lose content (the Sitemap `noindex` badge, the Series part type label) or has no tag (glossary Sources). SUG-177 Phase 2 already aligned the line tiers of these surfaces with `List`, so the remaining gap is the row shape. The decision table is in `docs/shipped/SUG-177-list-component-audit-site-list-patterns.md` §Final Phase 1 decisions.

## Objective

After this epic, `List`/`ListItem` accepts a tag-less row, a link-only row and a badge or secondary-label slot, and the Sitemap link list, the Series part list and the glossary Sources list render through it. Layers: DS component (`packages/design-system/src/components/List/`), Storybook, page JSX and CSS for the three surfaces. No schema, GROQ or content change.

## Metadata plan

Not applicable, no content piece.

## Scope

- [ ] Vspec for the three row shapes, in both themes, using the Phase 2 line tiers — layer: docs (Phase 0 gate)
- [ ] Extend `ListRow`/`ListItem` with a tag-less layout, a link-only mode and a badge slot — layer: DS component
- [ ] Migrate the Sitemap `linkList` (keeps the `noindex` badge and the date) — layer: frontend
- [ ] Migrate the Series `seriesPartList` (keeps the "Part N" label and the type label) — layer: frontend
- [ ] Migrate the glossary `sourcesList` (keeps external links opening in a new tab) — layer: frontend
- [ ] Storybook stories for the three row shapes, one multi-case story per variant — layer: Storybook

## Phases

| Phase | Scope | Gate |
|---|---|---|
| 1 | Vspec, then the `List` extension and its stories | Phase 0 vspec sign-off before any code |
| 2 | The three page migrations | none |

## Acceptance Criteria

- [ ] `List` renders a row with no `tag` without an empty 138px gutter, verified in Storybook
- [ ] Sitemap, Series and glossary Sources render through `List`, and the bespoke classes `linkList`, `linkItem`, `seriesPartList`, `seriesPartItem`, `sourcesList` are removed after a repo-wide grep shows no other consumer
- [ ] No content is lost: the `noindex` badge, the "Part N" and type labels, and the external-link `target` are still present
- [ ] `pnpm validate:tokens`, `validate:style-mirror` and `pnpm test:smoke` pass; Chromatic approved

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic can reach, and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **No Content Write Gate**, no Sanity writes.
- **No schema changes.**
- **Upstream dependency:** SUG-177 (#56) Phase 2 line tiers, shipped; `List` uses `--st-color-rule-section` and `--st-color-rule-accent`.
- **Activation audits:** read `packages/design-system/src/components/List/List.tsx` and `List.module.css` for the current row shape, `apps/web/src/components/ContentList.jsx` for the adapter, and `apps/web/src/pages/SitemapPage.jsx`, `SeriesPage.jsx`, `GlossaryTermPage.jsx` for the three consumers. Confirm the archive list view still renders unchanged.
- **Variant-first rule:** extend `List` by props; do not add a second list component (`.claude/rules/react.md`).
- **Model & Mode [REQUIRED]:** `/model sonnet`, a DS prop extension plus three page migrations.

## Model & Mode [REQUIRED]

`/model sonnet`: DS component extension, page wiring and stories; no architecture decision.

## Non-Goals

- No change to the archive list view (`ContentList`) rows or its look.
- No new list component; `List` is extended by props.
- No change to line tiers; those are settled by SUG-177 Phase 2.
- No migration of `rolesList`, `socialLinks`, `enumList` or the glossary metadata ledger; SUG-177 kept them raw for stated reasons.

## Related

- **GitHub:** [#269](https://github.com/bex-sugartown/sugartown/issues/269)
- **Relates to:** [#56](https://github.com/bex-sugartown/sugartown/issues/56) (SUG-177), whose Phase 1 audit produced this
- **Epic template:** `docs/epic-template.md`
