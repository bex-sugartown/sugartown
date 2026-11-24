# Release Notes — v0.41.0

**Date:** 2026-11-24
**Scope:** Sugartown monorepo (apps/web, apps/studio, packages/design-system, apps/storybook, CI and validators)

---

## What this release is

The design system now has one interaction-state contract: hover, pressed, selected, open and focus look the same on tags, buttons, links, rows, accordions and form fields, including in forced-colours mode. Alongside it, 56 issues landed across search visibility, contrast, accessibility testing and CI hardening. It aggregates everything since v0.40.0.

---

## What changed

### Interaction states (#251, #252, #262, #264, #266)

Tags, badges, buttons, icon buttons and segmented controls share one set of states: a pressed look, a soft hover glow, a solid selected fill that holds on hover, and the design-system focus ring. Links, rows, accordions and form fields gain a pressed state, hover is added where it was missing, and the open accordion item gets a pink rule. Three hover colours that failed contrast now underline in pink. In forced-colours mode, hover and pressed show as system-colour outlines, and the linked Tile gets pressed and focus states. The knowledge-graph filter strip and the grid, list and graph view toggle use the design-system components instead of their own copies. The Contents button no longer hides behind the header below desktop width.

### Search visibility and structured data (#82, #83, #212, #239, #249, #255, #256, #257, #258)

Google now gets JSON-LD in the HTML it fetches. /about carries ProfilePage, and article, node, case study, release, page, person, glossary and series routes are prerendered (197 snapshots, was 98). Project and tool pages carry their own JSON-LD. Every prerendered page carries og:image. The homepage and the six archive pages carry title, description and canonical in the HTML, and unknown URLs return a real 404 instead of 200. Tag pages under three posts are noindex and out of the sitemap, `/home` redirects to the homepage, and 186 dead WordPress redirects now point at real pages. The About and article structured data no longer exposes the email address.

### Contrast and accessibility (#164, #165, #170, #171, #172, #184, #185, #187, #247, #84)

Brand text, muted labels, next and previous titles, the homepage tile labels, the 404 link and the knowledge-graph Case chip now meet 4.5:1. /about passes its accessibility checks and joins the axe smoke routes. Carousel dots are 24px tap targets. Glossary links expose their underline to assistive checks. The footnote zone no longer uses the deprecated `doc-endnote` roles, and llms.txt follows the llmstxt.org format. Five status colour pairs that failed contrast were removed with their unused tokens (654 tokens to 641).

### Performance (#213, #235, #236)

The homepage shows content and hero image without waiting for the Sanity query (local mobile LCP 4.75-5.17s to 2.75-2.78s). The header and pre-header paint with the page and the footer waits below the fold, so pages no longer jump while loading (homepage CLS 0.21 to 0.001). The homepage also loads lighter on phones.

### Storybook testing (#50, #248)

Every story is checked for accessibility in both Pink Moon themes on each CI run, and a new violation fails the build. 49 known contrast failures are listed in #246 instead of hidden. 17 interaction tests on 10 components run in both themes, and each CI run adds a per-component coverage table. A fresh-checkout failure in the new job is fixed.

### Validators and CI (#93, #143, #215, #216, #221, #224, #227, #263)

`validate:states` runs on every commit, and `validate:vspec-contrast` measures a vspec's colour pairs in both themes. CI now installs Playwright before the liveness probes, which fixes the red run on the first push of this release. Liveness probes grew from 17 to 39 gates, covering the five Sanity-backed validators, and the archive filter gate checks the filter code the site runs. `validate:content` flags nested anchors and typed [N] citations; `validate:tokens` fails a hand-typed heading, label or focus-ring copy.

### Components, Studio and content (#210, #211, #221, #225, #227, #228, #259, #162)

The contents-strip and archive filter chips, people avatar, Core Web Vitals grid and release badges render shared components. On phones h3 is 22.4px, was 18px. A citation typed as [N] in a table cell renders as a linked pill. Studio archive page settings moved out of the "coming soon" tab into Content, Filtering and Display, the CLI default dataset is `production`, and the tool description field says it is public copy. An AI image on two articles and the showcase page is redacted and stamped. "I Automated the Pipeline" is published.

### Security and process (#240, #68, #134, #222, #250, #261, ST-202)

The Netlify build hook URL is out of the public repo, and the leaked hook is deleted and replaced. Audits and verdicts are recorded: style-cluster drift, chip and toggle states, sidebar states, and the ST-95 and ST-100 kill criteria. Vspecs start from one template, and the design-reviewer finds ST- vspecs.

---

## Not in this release

- Hover rules still stick on touch devices; the fix is #267.
- 49 Storybook stories still fail colour contrast and are listed, not fixed (#246).
- The brand-pink h2 is 3.47:1 in light, above WCAG large-text 3:1 but below the 4.5:1 vspec rule (#231).
- Raw 150ms transitions and two spacing scales remain from the style-drift audit (#229, #230).
- `validate:filters` still fetches with copied queries (#245).
- Archive page deferred Display and Advanced tab configs (#37).
- AI illustration doc and red-pen follow-ups (#116, #226) and the design-reviewer gap on vspec elements it never rendered (#156) are open.
- Sanity drafts awaiting a human publish: three tool descriptions (#211), the homepage title and four archive page descriptions (#256).

---

## Validator state at release

Run 2026-11-24 on the release commit's parent tree:

- `pnpm validate:tokens`: all `var(--st-*)` references resolve to defined tokens; no raw fallbacks.
- `pnpm validate:contrast`: every derived colour pair meets WCAG 2.2 AA (two archived-status pairs in dark themes could not be resolved and were not checked).
- `pnpm validate:states`: 6 gaps, all allowlisted.
- `pnpm validate:style-mirror`: all enforced mirrors byte-identical.
- CI on `3e8c91a3`: success, including 46 liveness gates proven live.

---

## Issues in this release

| ID | Title | State |
|---|---|---|
| #50 | SUG-161: Storybook testing infrastructure: interaction tests, a11y CI gate, Vitest | Closed |
| #68 | SUG-206: Property-cluster (hypertoken) drift audit | Closed |
| #82 | SUG-251: SEO meta & structured-data prerendering (fix CSR mainEntity race) | Closed |
| #83 | SUG-252: Add type-specific JSON-LD for Project and Tool detail pages | Closed |
| #84 | SUG-253: CWV audit & Agentic Browsing fixes (llms.txt, accessibility tree, mobile performance) | Closed |
| #93 | SUG-269: Make the Sanity-backed validators probeable | Closed |
| #95 (ST-95) | Liveness probes only, no register | Closed |
| #100 (ST-100) | Move epic close-out to epic finish, keep push and spend at EOD | Closed |
| #134 | Liveness-probe verdict, due 2026-10-20: did the probes catch anything a human would not have? | Closed |
| #143 | Span with both a link and a glossary term renders nested <a> (hydration error) | Closed |
| #162 | Article: I Automated the Pipeline (Career Engineering part 2) | Closed |
| #164 | Citation component uses deprecated ARIA roles doc-endnote and doc-endnotes | Closed |
| #165 | Lighthouse accessibility audits fail on /about (contrast, heading order, redundant alt, link in text block, ARIA role) | Closed |
| #169 | Status tokens --st-status-*-fg fail text contrast (draft, designing, testing, exploring, validated, active, archived, implemented, deprecated) | Closed |
| #170 | Knowledge-graph Case chip is off-white text on a pink fill (3.24:1) in dark Pink Moon | Closed |
| #171 | Remaining token text pairs under 4.5:1: text-brand on the dark surface, and text-muted and text-eyebrow in the legacy light theme | Closed |
| #172 | Hot pink text still on small labels and a link: home tile labels (3.46:1) and the 404 'Back to home' link (3.23:1) | Closed |
| #174 | Tag schema points to docs/taxonomy/controlled-vocabulary.md, which does not exist | Closed |
| #184 | ContentNav next and previous titles fail text contrast on case study, node and glossary pages (3.23:1) | Closed |
| #185 | Glossary term links in body text are told apart by colour alone (axe link-in-text-block) | Closed |
| #187 | Muted grey text (#888888) fails contrast in the dark theme: article filter counts and node sidebar series label | Closed |
| #202 (ST-202) | Vspec template and rules: light and dark, Pink Moon prototype, decisions log | Closed |
| #209 | design-reviewer only finds vspecs named docs/drafts/SUG-{N}-*, so ST-{N} vspecs are skipped | Closed |
| #210 | Archive page settings: audit, fix Display style tab, default /releases to list | Closed |
| #211 | Tool descriptions are editor notes and now ship into JSON-LD | Closed |
| #212 | Prerender JSON-LD for project and tool detail routes | Closed |
| #213 | Homepage mobile Core Web Vitals remediation | Closed |
| #215 | post-commit wip mirror: fetch refuses a non-fast-forward ref, so a second writer fails every mirror | Closed |
| #216 | validate:filters judges a copy of src/lib/filterModel.js, so the gate can pass while the app's filter code is broken | Closed |
| #221 | Citations: link [N] in table cells, and add authoring guidance and a check | Closed |
| #222 | ST-100 kill-criterion check is overdue: record a verdict on the Done/Shipped split | Closed |
| #224 | export:draft: start, export and check a content working draft | Closed |
| #225 | Content: AI image with brand names in its pixels is live on two articles, unlabelled | Closed |
| #227 | Heading, label and focus-ring bundles: one definition each (SUG-206 follow-up) | Closed |
| #228 | Surfaces re-typed outside their DS component: reuse Chip, IndexCell, Avatar, Input, Grid (SUG-206 follow-up) | Closed |
| #235 | Homepage mobile LCP: remove the JS, query, image chain before the hero | Closed |
| #236 | Homepage mobile layout shift (CLS 0.24) | Closed |
| #239 | og:image missing from prerendered pages, so LinkedIn previews show no image | Closed |
| #240 | Netlify build hook URL is committed in the public repo | Closed |
| #246 | Storybook stories fail color-contrast in 49 story files (the #50 gate's todo list) | Open |
| #247 | Carousel slide dots are below the 24px minimum target size (WCAG 2.5.8) | Closed |
| #248 | CI is red on main | Closed |
| #249 | Audit Sanity redirects: every To Path must resolve to a real page | Closed |
| #250 | Audit chip and toggle interaction states across the DS and web app | Closed |
| #251 | DS interaction state contract for chips, toggles and buttons | Closed |
| #252 | Extend the interaction state contract to links, rows, disclosures and form fields | Closed |
| #255 | Inbound Visibility E1.1: one canonical host, with /home and the other host redirecting to it | Closed |
| #256 | Inbound Visibility E1.2 + E1.4: real 404 for unknown URLs and prerendered home and index routes | Closed |
| #257 | Inbound Visibility E1.3 + E1.5: soft 404 rule for tags, nodes and roadmap URLs, then a clean sitemap | Closed |
| #258 | Inbound Visibility E1.7: JSON-LD schema cleanup (sameAs, alternateName, knowsAbout, Article images) | Closed |
| #259 | apps/studio/sanity.cli.ts points at a dataset that does not exist (test) | Closed |
| #261 | Render and verify Sidebar toggle, SidebarNav and PageSidebar link states | Closed |
| #262 | DS pressed state disappears in forced-colors mode, and hover sticks on touch | Closed |
| #263 | Check composed hover and pressed contrast for every vspec in CI | Closed |
| #264 | Disabled, error and loading states for DS interactive components, and Tile states | Closed |
| #266 | Contents strip hides behind the header until the page is scrolled | Closed |

---

## Related issues

| ID | Title | State | Relation |
|---|---|---|---|
| #37 | SUG-018: Archive page deferred fields: wire Display + Advanced tab configs | Open | related to #210 |
| #116 | Node: AI Illustration Review: red-pen pass and image metadata before publish | Open | related to #225 |
| #156 | Design-reviewer passes vspec elements it never rendered | Open | related to #209 |
| #166 | Axe and link-check coverage for case study, node and glossary pages (light theme) | Closed | related to #164, #171, #172, #184, #185, #187 |
| #226 | Docs: Principle 13 still says no image is flagged or stamped | Open | related to #225 |
| #229 | Raw 150ms transitions duplicate --st-transition-fast (SUG-206 follow-up) | Open | related to #68 |
| #230 | Two spacing scales and 332 raw spacing values (SUG-206 follow-up) | Open | related to #68 |
| #231 | Brand-pink h2 is 3.47:1 in light: below the 4.5:1 vspec rule, above WCAG large-text 3:1 | Open | related to #227 |
| #232 | Delete unused .heading and .priorityBadge in PlatformHubPage.module.css (ST-227 follow-up) | Open | related to #227 |
| #233 | tokens.md type-bundle rule: add the DS import path, say heading-4 is exempt (ST-227 follow-up) | Open | related to #227 |
| #234 | Merge StatCard and the deprecated web Tile into one stat tile | Open | related to #228 |
| #245 | validate:filters: fetch with the app's own archive and facet queries, not copies | Open | related to #216 |
| #260 | Citation back-link resting colour is 4.45:1 in dark | Closed | related to #252 |
| #265 | Remove the dead Sidebar toggle and SidebarNav collapsible summary | Closed | related to #252, #261 |
| #267 | Hover rules stick on touch: put hover effects behind (hover: hover) | Open | related to #252, #262 |
