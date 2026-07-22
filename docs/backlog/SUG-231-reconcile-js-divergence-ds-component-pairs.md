---
**Epic:** SUG-231 — Reconcile JS divergence in DS component pairs (incl. 2 live bugs)
**Linear Issue:** [SUG-231](https://linear.app/sugartown/issue/SUG-231)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-231 — Reconcile JS divergence in DS component pairs

Reconcile the **behavioural** divergence between the web and package copies of 6 DS component pairs. Two of the six are live bugs in production today.

## Background

SUG-214 built a validator that diffs component `.module.css` mirrors, and SUG-217/218/219 are burning down the 11 CSS drifts it grandfathered. All of that covers **CSS only**. Nothing checks whether the two copies of a component *behave* the same, and SUG-224's Phase 1 spike (2026-07-21) found that six pairs don't — including two where the web copy is silently broken:

- **FilterBar** renders no `filterHeader`, no "Filter" title, and no clear-all button. The package has all three. `onClearAll` is passed into the web copy and never used, with an `// eslint-disable-next-line no-unused-vars` sitting on top of it — the lint suppression is the tell that someone noticed and moved on.
- **CodeBlock**'s `showLineNumbers` prop applies `styles.lineNumbers` but the web copy never imports `prismjs/plugins/line-numbers`, so the plugin that injects the row markup never runs. The prop is inert.

These are user-facing defects, not hygiene. They were invisible because the only mirror validator in the repo looks at stylesheets.

## Objective

After this epic, the 6 diverged pairs behave identically, the two live bugs are fixed on the surface users actually hit, and the pair classification moves from 26 pure / 6 adapter / 6 diverged to **29 / 6 / 3**. Where the two copies disagree, this epic picks a canonical side per component and states why. It touches the render layer of both trees plus Storybook; no Sanity schema, GROQ, or content changes. It does not touch CSS (SUG-217/218/219) and does not touch link behaviour (SUG-230).

## Scope

- [ ] Fix FilterBar: restore the filter header, title, and clear-all button in the web copy; wire `onClearAll` and remove the lint suppression — layer: frontend
- [ ] Fix CodeBlock: import the Prism line-numbers plugin in the web copy so `showLineNumbers` renders row markup — layer: frontend
- [ ] Reconcile Callout **including its CSS** (absorbed from SUG-218, closed as duplicate 2026-07-21): decide the canonical variant set (`banner` vs `default`, and whether the package's `icon` prop comes to web), align the component *and* `Callout.module.css` in both copies, and delete `Callout.module.css` from `KNOWN_DRIFT` in `validate-style-mirror.js` — layer: design-system + frontend
- [ ] Define `.wide` in Table's CSS, or remove the dead reference: `Table.jsx`/`Table.tsx` in **both** trees apply `styles.wide` for `variant="wide"`, but neither stylesheet defines it. Same dead-prop family as FilterBar's `onClearAll` and CodeBlock's `showLineNumbers` — layer: design-system
- [x] Reconcile Accordion: add the empty-items guard to the package copy — done 2026-07-22. Placed below the hooks, as in web; an early return above `useState`/`useId` would break the Rules of Hooks. `items` also became optional in `AccordionProps` — the guard already made absent items a supported runtime state, so the required type was misstating the contract — layer: design-system
- [x] Reconcile Container: add `style` passthrough to the package copy — done 2026-07-22 — layer: design-system
- [x] Reconcile Stack: fix the package's responsive condition to `(direction.md || direction.lg)` — done 2026-07-22. Confirmed against `Stack.module.css`: `.responsive` is the *only* carrier of the `min-width: 1024px` rule reading `--stack-direction-lg`, so a `{ base, lg }` shape set the var with no rule to apply it — layer: design-system
- [x] ~~**Add `href` to the package `Button`**~~ — **moved to SUG-224 (2026-07-22).** This line contradicted Non-Goals, which lists Button's `href` among the intentional adapter differences that "stay until SUG-224 decides their fate". Non-Goals was right: the package Button lacking navigation is a *feature gap blocking consolidation*, not mirror drift, and it is the one item here that only matters once the package Button is the sole Button. Settling `target="_blank"`/`rel` now would also re-litigate a decision SUG-230 made deliberately a week ago, for a component with one package consumer (`apps/contentful-poc/src/components/SiteHeader.tsx`). Recorded as a SUG-224 prerequisite instead — layer: design-system
- [x] **Reconcile `Breadcrumb`** — done 2026-07-22, narrower than originally scoped. The audit found a **live a11y defect** rather than cosmetic drift: web drove both `.current` styling and `aria-current` off the same `isLast` flag, so on `/tools/vercel` the trailing crumb rendered `<a href="/tools" aria-current="page">` — announcing the wrong element as the current page on every detail page using the one-or-two-crumb pattern. Fixed by splitting the two concerns (`isHighlighted = isLast` for the pink styling, `isCurrent = isLast && !item.href` for `aria-current`), which repairs the semantics with zero visual change. The package rule is recorded in-file as canonical. **The remaining DOM differences are deliberately not reconciled:** web imports `react-router-dom` while the package uses the SUG-230 seam — these *cannot* converge while both copies exist, since web is the app and the package must not import a router. `.crumb` is `display: contents`, so the wrapper-vs-Fragment difference renders identically and converging it is churn on a file SUG-224 deletes. Both `Breadcrumb.module.css` copies were already byte-identical and remain so — layer: design-system + frontend
- [x] **Fix `List`'s `href || '#'` fallback** — done 2026-07-22. **Present in both copies, not just the package one this line named.** Rows without an href now render a plain `<div className={styles.row}>`; this could not be delegated to `<Link>`, which renders children unwrapped when given no href and would have dropped `.row` and collapsed the layout. Required one CSS change in both (byte-identical) copies: `.row` owned layout *and* interactive affordance, so a non-link row kept its pointer cursor and hover tint. Split out a `.rowLink` modifier applied only when an href is present, and moved `cursor: pointer` plus all six hover selectors onto it — layer: design-system
- [ ] Storybook coverage for each reconciled behaviour, including the previously-broken paths (a story that would have caught the FilterBar and CodeBlock bugs) — layer: Storybook
- [ ] Decide and record whether behavioural parity can be validated automatically, or is inherently a review-time concern — layer: tooling/docs

## Phases

**Phase 1 — The two live bugs.** FilterBar and CodeBlock, each with a Storybook story that fails before the fix and passes after. Ships first because these are the only rows with users on the other end.

**Phase 1b — SUG-230 handoff items.** ✅ Shipped 2026-07-22, re-scoped at activation from three items to two.

Added 2026-07-21 when SUG-230 shipped: its close-out deferred all three here, but they were not in this epic's Scope at the time, so they would have fallen through the gap between the two epics. Appending them to Scope without re-reading Non-Goals is what produced the `Button` contradiction — the same failure mode as SUG-224's "no blocking dependencies" error, one section of a doc updated without checking the section that disagrees with it.

**Re-scope decision (2026-07-22).** The three items were sorted by a single test: *does this work survive SUG-224?* SUG-224 deletes one of the two copies, so anything that exists only to make two hand-maintained copies agree is thrown away when one copy dies.

| Item | Survives SUG-224 | Disposition |
|---|---|---|
| `List` hrefless rows | Yes — a focusable dead link is a bug in whichever copy survives | **Fixed, both copies** |
| Breadcrumb `aria-current` | Yes — the semantic lives in the package and outlives consolidation | **Fixed** (found to be a live a11y bug, not cosmetic drift) |
| Breadcrumb DOM convergence | No — maintenance on a file SUG-224 deletes, zero visual payoff | **Declined**, documented in-file |
| Package `Button` `href` | Yes — but it is a consolidation prerequisite, not mirror drift | **Moved to SUG-224** |

Commits: `70e8ea56` (List), `7efe8143` (Breadcrumb).

**Phase 2 — The three trivial reconciliations.** ✅ Shipped 2026-07-22 (`61b3c85b`). Accordion guard, Container `style`, Stack responsive condition. Web is canonical in all three; the package copy moved. Converts them to pure mirrors — pair classification moves from 26/6/6 to **29/6/3**, leaving Callout, and the two Phase 1 bugs' components, as the remaining diverged set.

**Known gap carried out of Phase 2:** the package `Accordion` still has no Storybook story of its own. `Components/Accordion` is owned by the web mirror's story file, the same title collision this epic records for `Breadcrumb`, so a package story cannot be added without deciding which survives. The guard is covered by typecheck and code identity with web, not by VRT. Pre-existing — the package Accordion has never had a story — but it means one of Phase 2's three fixes is not visually regression-tested. Resolves with SUG-224, or needs its own follow-up if SUG-224 slips.

**Phase 3 — Callout (component + CSS together).** The only substantive design decision, and now the sole owner of Callout after SUG-218 was closed as a duplicate.

SUG-218 was scoped as a CSS-only reconciliation of `Callout.module.css`. Executing it on 2026-07-21 proved that impossible: the web and package Callouts are **different components**, not drifted copies. Their class sets are nearly disjoint — web's JSX uses `callout/labelCol/number/label/body/bannerLabel/bannerBody`, the package's TSX uses `callout/header/icon/title/body`; only `.callout` and `.body` are shared. Making the CSS byte-identical would leave whichever side lost its classes rendering unstyled. Web carries the SUG-99 "row format" redesign (two-column label + body grid, §NN folio number, `banner` variant); the package is the pre-SUG-99 design sourced from `artifacts/style 260118.css` (padded box, lucide icon, title). **The package never received the redesign.**

So the CSS drift is a symptom, and the real work is porting one canonical Callout across both trees: component, CSS, and stories. Web is the presumed canonical side (it is newer, deliberate, and what production renders), but confirm that at activation rather than assuming it.

Blast radius is small: `apps/contentful-poc` does not use Callout at all (0 files), so changing the package Callout affects Storybook only. `Callout.module.css` remains on `KNOWN_DRIFT` with an explanatory comment until this phase lands.

## Acceptance criteria

- [ ] FilterBar's clear-all button appears and works on a live archive page with active filters; the `eslint-disable` on `onClearAll` is gone
- [ ] CodeBlock with `showLineNumbers` renders visible line numbers in the web app, verified in the browser
- [x] Accordion renders `null` rather than throwing for `items={undefined}` in **both** copies — web verified in the browser (empty frame, no console error); package verified by typecheck + code identity, not VRT (see Phase 2 known gap)
- [x] Container applies a passed `style` prop in both copies — package verified in the browser: `outline: dashed 2px`, `background: rgb(242,255,191)`, `padding-block: 24px` all applied from `style`
- [x] Stack goes horizontal at `lg` for `direction={{ base: 'vertical', lg: 'horizontal' }}` in both copies — package verified in the browser: `flex-direction: row` at 1280px, `column` at 900px, so the `lg` breakpoint fires and nothing fires below it
- [ ] Callout's canonical variant set is decided and recorded in this doc before implementation; both copies then expose the same variants
- [ ] Storybook has a story per fixed behaviour, on `default` and `dark-pink-moon`
- [ ] Chromatic diffs reviewed — FilterBar and Callout will legitimately diff (new UI); Accordion/Container/Stack/CodeBlock should not diff on their default paths
- [ ] The behavioural-parity validation question is answered in writing (implemented, or explicitly declined with reasoning)

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx` and list every route rendering FilterBar (archive
> pages), CodeBlock (article/node detail with code), Callout (detail pages with callout sections),
> Accordion (case study FAQ), Container, and Stack. Build the table with one example local URL per
> page-type plus unchanged pages as regression guards, per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it. FilterBar and
> Callout carry deliberate visual change — flag those rows as expected-diff, not regression.

## Technical notes

- **SUG-217 and SUG-219 shipped 2026-07-21**, so the CSS axis is clear for every component in this epic *except* Callout. `KNOWN_DRIFT` is down to that one entry. SUG-230 still adds a link seam to Chip and Breadcrumb — keep that concern in its own commit, and re-read the files at activation rather than trusting the 2026-07-21 classification.
- **SUG-218 absorbed into Phase 3** (closed as duplicate 2026-07-21). The sequencing risk this section previously flagged turned out to be worse than sequencing: the two epics were the same work, because Callout's CSS cannot be reconciled without first reconciling the component. Phase 3 now owns both.
- **The "which side is canonical" question is per-component, not global.** Web is canonical for Accordion, Container, and Stack (it has the fix). The package is canonical for FilterBar (it has the feature web lost) and CodeBlock (it has the working plugin import). Callout is genuinely contested. Do not apply a blanket "package wins" or "web wins" rule.
- **Root-cause note worth capturing:** every one of these divergences happened because the mirror is maintained by hand and only its CSS is validated. If the behavioural-parity question in Scope is answered "can't automate this," that answer belongs in the shipped doc as the standing rationale — and it strengthens the case for SUG-224 removing the second copy entirely.
- **Activation audits:**
  - Re-read all 6 pairs; confirm the divergences still exist and no new ones appeared.
  - For FilterBar, check whether any web caller currently passes `onClearAll` expecting it to work (grep call sites) — that tells you whether this is a regression or a never-implemented feature.
  - For CodeBlock, confirm the package's line-numbers CSS is present in the web copy's stylesheet before adding the plugin import, or the numbers will render unstyled.

## Model & Mode [REQUIRED]

`/model sonnet` — the work is well-defined per component with a known canonical side for 5 of 6. Callout's variant-set decision (Phase 3) is the only judgement call, and it is a small, bounded one that does not need plan mode.

## Non-Goals

- **CSS reconciliation** — SUG-217/218/219 own that. This epic changes JS/JSX only, except where a fixed behaviour requires a class that does not yet exist in one copy.
- **Link behaviour** — SUG-230 owns the link seam. Chip and Breadcrumb appear in both epics; keep the commits separate.
- **The 6 adapters' intentional differences** (Card's `children` escape hatch, Media's `hotspot`, Button's `href`). Those are deliberate app-layer extensions, not drift, and they stay until SUG-224 decides their fate. *(This line and the former Scope entry for Button's `href` contradicted each other from 2026-07-21 to 2026-07-22. Resolved in favour of this one — see Phase 1b.)*
- **Deleting either copy.** Consolidation is SUG-224. This epic makes the two copies agree; it does not remove one.

## Related

- **Linear:** [SUG-231](https://linear.app/sugartown/issue/SUG-231)
- **Sibling (CSS axis):** [SUG-217](https://linear.app/sugartown/issue/SUG-217) / [SUG-218](https://linear.app/sugartown/issue/SUG-218) / [SUG-219](https://linear.app/sugartown/issue/SUG-219)
- **Sibling (link axis):** [SUG-230](https://linear.app/sugartown/issue/SUG-230)
- **Downstream:** [SUG-224](https://linear.app/sugartown/issue/SUG-224) — consolidation gets simpler the fewer diverged pairs remain
- **Origin:** `docs/backlog/SUG-224-apps-web-consumes-design-system-package.md` §Phase 1 Findings
- **Epic template:** `docs/epic-template.md`
