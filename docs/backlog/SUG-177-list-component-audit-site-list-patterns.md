---
**Epic:** SUG-177 — List component audit — surface all site list patterns for DS List integration
**Linear Issue:** [SUG-177](https://linear.app/sugartown/issue/SUG-177/list-component-audit-surface-all-site-list-patterns-for-ds-list)
**GitHub Issue:** [#56](https://github.com/bex-sugartown/sugartown/issues/56)
**Aligned:** 2026-11-25
**Status:** In Progress
**Priority:** 🟢 Next (board: High)
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
**Visual:** yes (Phase 2 ledger-line changes render differently; Phase 1 is a no-new-format migration)
**Vspec:** `docs/drafts/SUG-177-ledger-lines.vspec.html` (Phase 2 only; not yet created)
---

# SUG-177 — List component audit — surface all site list patterns for DS List integration

Audit the live site for raw `<ul>`/`<ol>` list surfaces that are candidates for migration to the DS List/ListItem primitive, then produce Storybook stories covering the expanded use cases.

## Background

The DS `List`/`ListItem` primitive (shipped SUG-167) is wired for content-list archive mode via `ContentList` adapter. However, several page templates still use raw `<ul>`/`<ol>` with bespoke CSS classes: `refList`/`refRow` (GlossaryTermPage — Used In / Related Content back-refs), `sourcesList` (GlossaryTermPage — citation list), `seriesPartList` (SeriesPage — numbered episode list), `rolesList` (PersonProfilePage — work history), `socialLinks` (PersonProfilePage — icon link list), `linkList` (SitemapPage — grouped URL lists), and `enumList` (ContentModelsPage — schema enum display). These were written before the DS List primitive existed and now represent gaps between the canonical component and its actual reach on the site.

The trigger is a post-SUG-167 cleanup pass: now that the primitive exists, close the gap and use it as documentation fodder for Storybook use-case stories.

**Scope added 2026-08-05:** GlossaryTermPage additionally gets an **AI Attribution** metadata item — the glossary disclosure mechanism that `docs/glossy-prompt.md` and `docs/write-pipeline-prompt.md` §5 currently state doesn't exist — and its metadata ledger (currently `DescriptionList columns={2} ledger`, `GlossaryTermPage.jsx:246`) joins the DescriptionList→List migration scope, since this epic already touches every other list on that page.

This briefly existed as sub-issue SUG-269, cancelled the same day and absorbed here. `validate:epic-docs` (SUG-262) requires every non-Done issue to carry its own backlog doc and priority-stack row, and grants sub-issues no exemption — it never reads `parentId`. A parallel stub would have duplicated the scope below in two places, which is the drift that gate exists to prevent.

## Objective

After this epic, every site list surface that maps cleanly to the DS List/ListItem API is either migrated to the primitive or has a documented rationale for why it stays raw. The DS List Storybook story covers all confirmed use-case variants (ledger, inline chip, numbered, link, source citation). The glossary term page also carries an AI Attribution metadata item, closing the one register with no disclosure mechanism. Layers touched: frontend (page JSX + CSS), Storybook stories, docs (glossy/pipeline prompt updates); schema + GROQ only via the AI Attribution carve-out in Technical notes.

## Scope

- [x] **Audit all raw `<ul>`/`<ol>` list surfaces** — read each file, map class name → visual pattern → List API fit (migrate / extend / keep raw), document in this epic doc — layer: frontend (read-only)
- [x] **Migrate `refList`/`refRow` (GlossaryTermPage)** — Used In + Related Content back-ref rows (Chip + Link) to DS List/ListItem — layer: frontend
- [x] **Migrate `sourcesList` (GlossaryTermPage)** — citation source list (text + optional `<a>`) to DS List/ListItem — layer: frontend
- [x] **Assess `seriesPartList` (SeriesPage)** — numbered `<ol>` episode list; migrate if `<List ordered>` prop exists or extend the primitive first — layer: frontend
- [x] **Assess `rolesList` (PersonProfilePage)** — work history items; migrate if inline variant covers it — layer: frontend
- [x] **Assess `socialLinks` (PersonProfilePage)** — icon + text link list; likely stays raw (specialised layout) — document rationale — layer: frontend (decision)
- [x] **Assess `linkList` (SitemapPage)** — grouped URL lists; migrate if link-list variant is added to DS List — layer: frontend
- [x] **Assess `enumList` (ContentModelsPage)** — monospace schema enum display; likely stays raw (code context) — document rationale — layer: frontend (decision)
- [x] **Storybook stories — expanded use cases** — add stories covering: ledger row (Chip + Link), source citation, numbered episode, link list; update existing List story if new props are added — layer: Storybook
- [x] **AI Attribution item (GlossaryTermPage)** — add an "AI Attribution" entry to the term page metadata; mechanism (static default derived from the /glossy workflow vs. a `glossaryTerm` field + GROQ projection) decided at activation against the site convention in `PageSidebar.jsx` (commit 9daa3a12) and `write-pipeline-prompt.md` §5 — layer: frontend (+ schema/query only if the field mechanism is chosen)
- [x] **Migrate the metadata ledger (GlossaryTermPage)** — `DescriptionList items columns={2} ledger` → DS List, per the audit's API-fit table; the Storybook `Components/List` story is the canonical usage reference; extend the primitive first if the label/value ledger fit requires it — layer: frontend + Storybook
- [ ] **Document the glossary disclosure mechanism** — update `docs/glossy-prompt.md` and `docs/write-pipeline-prompt.md` §5 (glossary bullet) once the AI Attribution item ships; both are rule-defining files, so the Instruction & Rule File Write Gate fires at execution — layer: docs

**Phase 2 — ledger-line audit (added 2026-11-25):**

- [ ] **Inventory every ledger line on the site, footer first** — for each surface record: file, selector, border width, token, resolved colour in light and dark, and the component that draws it. Starting points: `apps/web/src/components/Footer.module.css` (lines 4, 17, 104, 196 use `--st-color-border-default`), `packages/design-system/src/components/DescriptionList/DescriptionList.module.css` (`--st-dl-ledger-border`), `packages/design-system/src/components/List/List.module.css` ("ledger nod" hairlines), `Card.module.css`, `FilterBar.module.css`, `apps/web/src/components/MetadataCard.module.css`, `TrustReportSection.jsx`, `ContentList.jsx`. Surfaces not yet read are found by grep at activation — layer: frontend (read-only)
- [x] **Explain the DescriptionList default vs ledger difference** — side by side in Storybook (`Components/DescriptionList`), naming every property that differs (colour token, weight, divider placement) — layer: Storybook (read-only)
- [ ] **Audit `Pages/TaxonomyArchivePage` Row Layout (`/tags`)** and the other archive row surfaces against the same inventory — layer: frontend (read-only)
- [x] **Group similar line-drawing components and define the hierarchy** — a table of line tiers (for example page rule, section rule, row rule, cell rule) mapping each tier to one token, with every inventoried surface assigned a tier. Tier count and names are decided from the inventory, not before — layer: docs + tokens (proposal only)
- [x] **Vspec for the new hierarchy** — footer before/after in light and dark, plus one row each of DescriptionList default, DescriptionList ledger, List, and the `/tags` row layout, per `docs/conventions/vspec-template.html` — layer: docs (Phase 0 gate)
- [x] **Raise footer separation** — after vspec sign-off, change the footer lines to the tier token the hierarchy assigns, and align the other surfaces' tokens to their tiers where the vspec shows drift. Token changes go through `tokens/source/tokens.json` then `pnpm tokens:build` — layer: tokens + frontend + Storybook

**Scope added 2026-11-25 (Phase 2, ledger-line audit):** the site's ledger lines look different from one surface to the next, and the site-wide footer's grey lines are too pale to separate its sections. Storybook shows `Components/DescriptionList` default vs ledger differing, and the same drift shows on `Pages/TaxonomyArchivePage` (Row Layout, `/tags`). This phase inventories every ledger line on the site (footer first), records which component and token draws each, groups similar components, and defines a hierarchy of line weights. The footer fix is the first change out of that hierarchy.

## Phases

| Phase | Scope | Gate |
|---|---|---|
| 1 | List audit → migrate confirmed surfaces → Storybook stories (the first 12 Scope items) | none |
| 2 | Ledger-line audit → hierarchy → footer fix (the six items under "Phase 2" in Scope) | Phase 0 vspec sign-off before any CSS or token change |

Phase 2 starts after Phase 1 merges. Phase 1 keeps its single-phase shape internally: audit → migrate → stories → close-out.

## Acceptance criteria

- [ ] Every raw `<ul>`/`<ol>` surface in `apps/web/src/pages/` is documented in the audit table (migrate / extend / keep raw + rationale)
- [ ] All "migrate" decisions are implemented and the bespoke CSS classes removed
- [ ] "Extend" decisions either land a new prop on DS List or are deferred to a follow-on with a Linear issue linked
- [ ] "Keep raw" decisions have a written rationale in this doc (e.g. "specialised icon layout, no DS fit")
- [ ] DS List Storybook story covers all confirmed use-case variants; Chromatic Build passes
- [ ] No regression on pages that already use ContentList (archive list-view)
- [ ] `pnpm validate:tokens` and `pnpm validate:style-mirror` pass; zero hardcoded color violations
- [ ] AI Attribution renders on `/glossary/:slug` term pages via the mechanism decided at activation; if the field mechanism is chosen, the schema is deployed and MCP writes succeed
- [ ] `docs/glossy-prompt.md` and `docs/write-pipeline-prompt.md` §5 no longer claim glossary terms lack a disclosure mechanism (gated edit, approved diff)
- [ ] GlossaryTermPage metadata ledger renders via DS List, or carries a written keep/extend rationale in the audit table
- [ ] Phase 2: the inventory table lists every ledger line in `Footer.module.css` and every `--st-dl-ledger-border` and `--st-color-border-*` consumer found by `grep -rn "ledger\|st-color-border" apps/web/src packages/design-system/src`, each with token, resolved colour (light and dark) and owning component
- [x] Phase 2: the hierarchy table assigns every inventoried surface to exactly one tier, and each tier maps to one token
- [x] Phase 2: vspec signed off by Bex before any CSS or token change (approved as drawn 2026-11-25)
- [ ] Phase 2: footer separators reach the contrast the vspec states for the footer tier, measured against the footer background (`--st-color-bg-canvas`, #F2F2F3 light) in light and dark. Today's `--st-color-border-default` (#E4E4E5) is about 1.1:1 on #F2F2F3. The footer rules are decorative, so WCAG 1.4.11's 3:1 does not bind; the vspec picks the target. `pnpm validate:contrast` passes with no new allowlist entries
- [ ] Phase 2: `pnpm validate:tokens`, `pnpm validate:style-mirror` and `pnpm tokens:build` produce no diff or errors; Chromatic build approved or deferral annotated; "Visual QA approved" received

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic can reach, and build the Human QA Walkthrough table (one example local URL per page-type, incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **List primitive API (read 2026-11-25):** `packages/design-system/src/components/List/List.tsx`. Props: `variant` (`'register'` only), `items` (`ListRow`: `key`, `tag`, `tagTitle`, `leading`, `title`, `date`, `href`), `title`, `count`. No `ordered`, no tag-less row, no link-only row. Any "extend" decision requires the primitive to accept the new prop first. The web adapter is `apps/web/src/components/ContentList.jsx`; the old `apps/web/src/design-system/components/list/` path no longer exists.
- **CSS removal rule:** when a bespoke class is removed from a page, grep for it across the entire repo to confirm it has no other consumers before deleting from the CSS module.
- **No Content Write Gate** — no Sanity content changes in scope. (If the AI Attribution field mechanism is chosen and existing glossary terms need backfilled values, the gate fires for that patch — proposal table first.)
- **No schema changes, with one carve-out** — the AI Attribution item may add a `glossaryTerm` disclosure field + GROQ projection if activation decides against a static default; that path requires `npx sanity schema deploy`. Everything else in this epic remains schema-free.
- **Phase 0 check (AI Attribution):** a row inside the existing metadata ledger adopts an already-reviewed format — the gate does not fire for a plain ledger row. If activation proposes a novel visual treatment (badge, callout, icon), it does.
- **Model & Mode [REQUIRED]:** `/model opus` — multi-file frontend audit + selective migration + Storybook story additions; Opus plans the audit table + Files to Modify; Sonnet executes after plan-mode exit.

## Model & Mode [REQUIRED]

`/model opus` — audit spans multiple page files + CSS modules + DS component + Storybook; Opus builds the migration table and files-to-modify list at plan time, Sonnet executes.

## Non-Goals

- No new DS List props beyond what is needed to cover confirmed migration targets — if a surface needs a net-new primitive feature, scope that separately.
- No changes to ContentList adapter or archive-mode list rendering.
- No Sanity schema or GROQ query changes, **except** the AI Attribution carve-out above (a `glossaryTerm` disclosure field + projection, only if activation chooses the field mechanism over a static default).
- No migration of FilterBar internal `<ul>` list — FilterBar has its own controlled rendering.
- Phase 2 changes line colour, weight and token assignment only. It does not change list markup, DS List props or layout; those stay in Phase 1.
- Phase 2 does not redesign the footer's layout or content, only its separators.
- Phase 2 adds no tier or token that the inventory does not need. Raising a token value to fit one surface is not a fix; the hierarchy decides.

## Start audit

2026-11-25, `check-epic-doc.js --drift`: 52 rule files changed since 2026-06-16. Read: `.claude/rules/css-layout.md`, `tokens.md`, `storybook.md` (all touch Scope); skipped: the other 49 (Sanity, GROQ, write-pipeline, release and conventions files with no list or border content).

| Finding | What the epic said | Fix |
|---|---|---|
| Dead path `apps/web/src/design-system/components/list/List.jsx` | Technical notes pointed there | Repointed to `packages/design-system/src/components/List/List.tsx` |
| Priority drift | Header said Soon; board says High | Header now Next (High) |
| Linear-era header | No GitHub link | Added `**GitHub Issue:** #56` |
| Footer rule contrast | AC said 3:1 | Measured: `border-default` is about 1.1:1 on the footer canvas; decorative rules are outside WCAG 1.4.11, so the vspec sets the target |
| `--st-color-footer-divider` (pink, 25%) is defined and unused by `Footer.module.css` | not mentioned | Phase 2 inventory item: adopt or retire |
| `--st-dl-ledger-border` has no dark override | not mentioned | Phase 2 inventory item: it is #A3A3A3 in dark, brighter than any other dark rule |

## Phase 1 audit table

Read 2026-11-25. Fit is judged against the current `List` API (register rows: gutter tag, title, date, href).

| Surface | File | Markup | Fit | Decision |
|---|---|---|---|---|
| `refList`/`refRow` | `GlossaryTermPage.jsx` `RefRows` | Chip (type label) + Link | Tag + title + href maps to a register row, but the 138px tag column and dotted rules do not fit a narrow ledger cell | Extend or keep: decide after the Phase 2 hierarchy fixes which rule the cell uses |
| `sourcesList` | `GlossaryTermPage.jsx` | text, optional external `<a>` | No tag, external link | Keep raw until `List` accepts a tag-less row |
| `seriesPartList` | `SeriesPage.jsx` | numbered `<ol>`: "Part N", type label, link | Tag = "Part N", title, href; type label has no slot | Extend (`tag` stays, add a secondary line) or keep |
| `rolesList` | `PersonProfilePage.jsx` | plain strings | No link, no tag | Keep raw: a plain bulleted list |
| `socialLinks` | `PersonProfilePage.jsx`, `Footer.jsx` | icon + text links | Icon layout | Keep raw: specialised layout |
| `linkList` | `SitemapPage.jsx` | link + noindex badge + date | Title, date, href fit; badge has no slot | Extend (badge via `leading`/new slot) or keep |
| `enumList` | `ContentModelsPage.jsx` | `<code>` value + title | Code context | Keep raw |
| Glossary metadata ledger | `GlossaryTermPage.jsx:227` | `DescriptionList columns={2} ledger` | Label/value pairs, two columns; `List` is single-column rows | Keep as `DescriptionList`; it is the DS label/value primitive, and Phase 2 aligns its lines |

### Final Phase 1 decisions (2026-11-25, after the Phase 2 tiers shipped)

No surface migrates. The `List` register is a fixed shape: a 138px gutter tag, a title, a 96px date column, a 2px header rule and two vertical fences. Each candidate either loses content or does not fit that shape, and the Non-Goals bar new `List` props for a single consumer.

| Surface | Decision | Rationale |
|---|---|---|
| `refList`/`refRow` | Keep raw | Sits in a narrow ledger cell; the 138px tag column and fences do not fit. Its Chip carries the type label |
| `sourcesList` | Keep raw | No tag; external links open in a new tab |
| `seriesPartList` | Keep raw | The per-part type label (Article, Node) has no slot in a register row, and merging it into the tag truncates |
| `rolesList` | Keep raw | Plain strings, no link, no date |
| `socialLinks` | Keep raw | Icon layout |
| `linkList` (Sitemap) | Keep raw | The `noindex` badge has no slot |
| `enumList` | Keep raw | Code context |
| Glossary metadata ledger | Keep as `DescriptionList` | Two-column label/value; `List` is single-column. Its lines now use the Phase 2 tiers |

Phase 2 already aligned the line tiers of Sitemap and Series rows with `List`, so the three no longer draw three different line styles. A `List` variant with a link-only row, a tag-less row and a badge slot would unlock the Sitemap, Series and sources migrations; that is a separate epic.

Every "extend" and "keep" needed the Phase 2 line hierarchy first: the register's dotted `--st-color-border-medium` rule, `SitemapPage`'s solid `--st-color-border-default` rule and `seriesPartItem`'s `--st-color-border-subtle` rule are three different line styles for the same job. Migrating before the hierarchy is set would pick one by accident.

## Phase 2 inventory (first pass)

Command: `grep -rnE "border(-top|-bottom|-block|-inline)?(-color)?\s*:.*var\(--st-(color-border|dl-ledger|color-rule)[a-z-]*\)" apps/web/src packages/design-system/src --include='*.css'`, excluding `generated/` and the mirrored `apps/web/src/design-system/`. 115 declarations. Token resolution from `packages/design-system/src/styles/theme.pink-moon.css` and `tokens.css`.

| Token | Light | Dark | Declarations |
|---|---|---|---|
| `--st-color-border-subtle` | #F2F2F3 | white 6% | 35 |
| `--st-color-rule-accent` | #C6C6C8 | white 15% | 31 |
| `--st-color-border-default` | #E4E4E5 | white 12% | 26 |
| `--st-color-border-medium` | #C6C6C8 | white 20% | 13 |
| `--st-color-border-wrap` | #A3A3A3 | white 12% | 4 |
| `--st-dl-ledger-border` | #A3A3A3 | #A3A3A3 (no dark override) | 3 |
| `--st-color-border-strong` | #525252 | white 35% | 3 |

Surfaces in the lines the user named:

| Surface | File | Token | Note |
|---|---|---|---|
| Site footer, 4 rules | `apps/web/src/components/Footer.module.css` lines 4, 17, 104, 196 | `border-default` | #E4E4E5 on #F2F2F3 canvas: the pale lines |
| `DescriptionList` default | `DescriptionList.module.css` `.oneCol .item` | `border-default` | paler than ledger |
| `DescriptionList` ledger | same file, `.ledger` rules | `dl-ledger-border` | #A3A3A3, darker; this is the default vs ledger difference |
| `List` register | `List.module.css` | `border-medium` | bracket hairlines plus dotted row rule |
| Sitemap rows | `SitemapPage.module.css` | `border-default` | solid, 4 declarations |
| Series parts | `pages.module.css` `.seriesPartItem` | `border-subtle` | |
| Taxonomy archive rows | `TaxonomyArchivePage.module.css` | `border-subtle` | 3 declarations |
| Metadata card | `MetadataCard.module.css` | `rule-accent` | 3 declarations |

Still to do in Phase 2: read each file's selector and width, assign tiers, and resolve the remaining 100 declarations by file (per-file counts are in the grep output above).

## Phase 2 hierarchy (implemented 2026-11-25, commits 5bbcdfd9 and 5f70df25)

| Tier | Token | Light | Dark | Applied to |
|---|---|---|---|---|
| 1 Section rule | `--st-color-rule-section` (new; `--st-dl-ledger-border` now aliases it) | #A3A3A3 | white 20% | footer top edge and nav divider; `DescriptionList` ledger top edge; `List` register brackets and 2px header rule; taxonomy `.itemList` top |
| 2 Row rule | `--st-color-rule-accent` | #C6C6C8 | white 15% | footer legal-links and copyright rules; `DescriptionList` default and ledger rows and column rule; `List` dotted rows and vertical fences; Sitemap rows; Series parts; taxonomy rows |
| 3 Hairline | `--st-color-border-subtle` | #F2F2F3 | white 6% | unchanged; inside white surfaces only |

**Corrections to the vspec found while implementing:**

- `--st-color-footer-divider` is **not** retired. `Card.module.css:496` reads it (the Card footer's dashed rule), so it is a card token, not a site-footer token. Decision 3 in the vspec is withdrawn.
- `--st-color-border-wrap` is left alone. Its dark value is deliberately `border-default` (theme comment, tile dividers), and changing it moves every table and tile wrap in dark, which the vspec did not draw.
- `DescriptionList` ledger had no top edge before. It gets a Tier 1 top edge, drawn in the vspec, and its first row gained top padding to match.

**Remaining declarations, assigned 2026-11-25.** Command for the list: the grep in the inventory section, plus `border-left`/`border-right` (the first pass missed those: 16 more declarations). Tiers apply to dividers. Control and component outlines (Input, Textarea, Checkbox, Radio, Switch, Button, Avatar, chips, badges, popovers, Card outer border, hover colours) are not ledger lines and keep `border-default`, `border-medium` or `border-strong`.

| Rule | Was | Now |
|---|---|---|
| `.pageEyebrow` bottom (`pages.module.css`) | `border-subtle`, invisible on canvas in light | Tier 2 |
| `.detailExcerpt` bottom | `border-default` | Tier 1 |
| Sitemap `.header` bottom | `border-default` | Tier 1 |
| Sitemap `.groupHeading` bottom | `border-default` | Tier 2 |
| Glossary index `.termDd` bottom | `border-default` | Tier 2 |
| `ContentNav` `.nav` top | `border-subtle`, invisible | Tier 2 |
| `TrustReportSection` `.reportFooter` top | `border-subtle`, invisible | Tier 2 |
| DS `Sidebar` side rules (4 declarations) | `border-subtle`, invisible | Tier 2 |
| Person profile folio bottom | `border-subtle`, invisible | Tier 1 |
| Person profile roles, roles rows, expertise | `border-subtle`, invisible | Tier 2 |
| `FilterBar`, `Accordion`, `Card` zones, `Callout`, `Table` caption, `MetadataCard`, `SiteGraphPage`, `TablesDevPage` | `rule-accent` | Tier 2, unchanged |
| Rules inside white surfaces (`ContentsStrip`, `Drawer`, `StatCard` foot, `PageSidebar` related, `SchemaERD` sidebar, `filterDrawerFooter`, `Table` stacked cells) | `border-subtle` | Tier 3, unchanged |

**How the invisible rules were found:** a Playwright pass over 28 pages in light mode listing every element whose border colour is #F2F2F3 on a #F2F2F3 background. It found `pageEyebrow`, `ContentNav`, `reportFooter`, the DS Sidebar side rule and four Person profile rules. After the change the same check finds none on `/people/bex`, an article, `/about` and `/sitemap`. Not covered: pages whose slug the sitemap did not surface, and dark mode, where the Tier 3 wash on a translucent surface is faint by design.

**Verified 2026-11-25:** `validate:tokens`, `validate:tokens --strict-colors`, `validate:style-mirror`, `validate:contrast` and `validate:css-names` pass. Computed colours match the vspec in both themes (footer, glossary ledger, articles list view). Chromatic and Visual QA are still open.

## Related

- **Linear:** [SUG-177](https://linear.app/sugartown/issue/SUG-177/list-component-audit-surface-all-site-list-patterns-for-ds-list)
- **Absorbed:** SUG-269 (AI Attribution item + DescriptionList→List migration) — created and cancelled 2026-08-05; its scope is carried in this doc, not tracked separately
- **Upstream:** SUG-167 (List/ListItem DS primitive, shipped v0.26.9) — prerequisite
- **Phase 2 trigger:** Storybook `Components/DescriptionList` (default vs ledger) and `Pages/TaxonomyArchivePage` Row Layout, observed 2026-11-25
- **Adjacent:** SUG-228 item 6 flags the same page's "Used In" list as off-pattern — resolve consistently with this epic's migration, not separately
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
