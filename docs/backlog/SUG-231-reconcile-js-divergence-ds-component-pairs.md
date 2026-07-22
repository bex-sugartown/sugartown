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
- [x] Reconcile Callout **including its CSS** (absorbed from SUG-218, closed as duplicate 2026-07-21) — done 2026-07-22 (`29fae02d`). Web canonical: package took web's component and CSS byte-for-byte. `icon` prop and `default` variant removed; `banner` gained. `Callout.module.css` deleted from `KNOWN_DRIFT`, **which is now empty** — all 38 component CSS mirrors are enforced with no grandfathered entries, closing the SUG-214 burndown that SUG-217/218/219 opened — layer: design-system + frontend
- [ ] Define `.wide` in Table's CSS, or remove the dead reference: `Table.jsx`/`Table.tsx` in **both** trees apply `styles.wide` for `variant="wide"`, but neither stylesheet defines it. Same dead-prop family as FilterBar's `onClearAll` and CodeBlock's `showLineNumbers` — layer: design-system
- [x] Reconcile Accordion: add the empty-items guard to the package copy — done 2026-07-22. Placed below the hooks, as in web; an early return above `useState`/`useId` would break the Rules of Hooks. `items` also became optional in `AccordionProps` — the guard already made absent items a supported runtime state, so the required type was misstating the contract — layer: design-system
- [x] Reconcile Container: add `style` passthrough to the package copy — done 2026-07-22 — layer: design-system
- [x] Reconcile Stack: fix the package's responsive condition to `(direction.md || direction.lg)` — done 2026-07-22. Confirmed against `Stack.module.css`: `.responsive` is the *only* carrier of the `min-width: 1024px` rule reading `--stack-direction-lg`, so a `{ base, lg }` shape set the var with no rule to apply it — layer: design-system
- [x] ~~**Add `href` to the package `Button`**~~ — **moved to SUG-224 (2026-07-22).** This line contradicted Non-Goals, which lists Button's `href` among the intentional adapter differences that "stay until SUG-224 decides their fate". Non-Goals was right: the package Button lacking navigation is a *feature gap blocking consolidation*, not mirror drift, and it is the one item here that only matters once the package Button is the sole Button. Settling `target="_blank"`/`rel` now would also re-litigate a decision SUG-230 made deliberately a week ago, for a component with one package consumer (`apps/contentful-poc/src/components/SiteHeader.tsx`). Recorded as a SUG-224 prerequisite instead — layer: design-system
- [x] **Reconcile `Breadcrumb`** — done 2026-07-22, narrower than originally scoped. The audit found a **live a11y defect** rather than cosmetic drift: web drove both `.current` styling and `aria-current` off the same `isLast` flag, so on `/tools/vercel` the trailing crumb rendered `<a href="/tools" aria-current="page">` — announcing the wrong element as the current page on every detail page using the one-or-two-crumb pattern. Fixed by splitting the two concerns (`isHighlighted = isLast` for the pink styling, `isCurrent = isLast && !item.href` for `aria-current`), which repairs the semantics with zero visual change. The package rule is recorded in-file as canonical. **The remaining DOM differences are deliberately not reconciled:** web imports `react-router-dom` while the package uses the SUG-230 seam — these *cannot* converge while both copies exist, since web is the app and the package must not import a router. `.crumb` is `display: contents`, so the wrapper-vs-Fragment difference renders identically and converging it is churn on a file SUG-224 deletes. Both `Breadcrumb.module.css` copies were already byte-identical and remain so — layer: design-system + frontend
- [x] **Fix `List`'s `href || '#'` fallback** — done 2026-07-22. **Present in both copies, not just the package one this line named.** Rows without an href now render a plain `<div className={styles.row}>`; this could not be delegated to `<Link>`, which renders children unwrapped when given no href and would have dropped `.row` and collapsed the layout. Required one CSS change in both (byte-identical) copies: `.row` owned layout *and* interactive affordance, so a non-link row kept its pointer cursor and hover tint. Split out a `.rowLink` modifier applied only when an href is present, and moved `cursor: pointer` plus all six hover selectors onto it — layer: design-system
- [ ] Storybook coverage for each reconciled behaviour, including the previously-broken paths (a story that would have caught the FilterBar and CodeBlock bugs) — layer: Storybook
- [x] Decide and record whether behavioural parity can be validated automatically, or is inherently a review-time concern — **answered 2026-07-22: declined, it is a review-time concern.** Full reasoning in §Behavioural parity below — layer: tooling/docs

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

**Phase 3 — Callout (component + CSS together).** ✅ Shipped 2026-07-22 (`29fae02d`). The only substantive design decision, and the sole owner of Callout after SUG-218 was closed as a duplicate. Web canonical — see the recorded decision below. `KNOWN_DRIFT` is now empty.

Verified in the browser, package copy against web copy, on both themes: identical on every variant — info `#ff247d`, tip `#a78bfa`, warn `#fb923c`, danger `#b91c68`, each `<aside role="note">`; banner `<div role="status">`; zero `<svg>` in any variant. Web's Callout was not touched, so production is unaffected and the change is Storybook-only as predicted. Because the package Callout has no story, verification used a temporary scratch story that was deleted before the commit.

SUG-218 was scoped as a CSS-only reconciliation of `Callout.module.css`. Executing it on 2026-07-21 proved that impossible: the web and package Callouts are **different components**, not drifted copies. Their class sets are nearly disjoint — web's JSX uses `callout/labelCol/number/label/body/bannerLabel/bannerBody`, the package's TSX uses `callout/header/icon/title/body`; only `.callout` and `.body` are shared. Making the CSS byte-identical would leave whichever side lost its classes rendering unstyled. Web carries the SUG-99 "row format" redesign (two-column label + body grid, §NN folio number, `banner` variant); the package is the pre-SUG-99 design sourced from `artifacts/style 260118.css` (padded box, lucide icon, title). **The package never received the redesign.**

So the CSS drift is a symptom, and the real work is porting one canonical Callout across both trees: component, CSS, and stories. Web is the presumed canonical side (it is newer, deliberate, and what production renders), but confirm that at activation rather than assuming it.

Blast radius is small: `apps/contentful-poc` does not use Callout at all (0 files), so changing the package Callout affects Storybook only. `Callout.module.css` remains on `KNOWN_DRIFT` with an explanatory comment until this phase lands.

### Canonical decision — recorded 2026-07-22, before implementation (satisfies the AC)

**Web is canonical. The package Callout adopts web's SUG-99 row format wholesale.**

Confirmed at activation rather than assumed, and the confirmation turned up *why* the package drifted: **`Components/Callout` is owned by the web copy's story file, and the package Callout has no story at all.** The published Storybook at `pinkmoon.sugartown.io/?path=/docs/components-callout--docs` has therefore only ever rendered the web component. The lucide-icon package variant has never been visible to anyone reviewing the DS — so "align with Storybook" and "align with web" are the same instruction.

| | Package today | After Phase 3 |
|---|---|---|
| Variants | `default` `info` `tip` `warn` `danger` | `info` (default) `tip` `warn` `danger` `banner` |
| `icon` prop | per-variant lucide defaults + override | **removed** |
| DOM | `header` / `icon` / `title` / `body` | `labelCol` / `number` / `label` / `body`; banner uses `bannerLabel` / `bannerBody` |
| Props gained | — | `number`, `content` |

`default` is dropped because SUG-192 already removed it from web as CSS-identical to `info`. The lucide icons go because they are decorative per-variant ornaments; this is **not** a general anti-lucide rule — Accordion's `ChevronDown` is a functional control, exists identically in both copies, and stays.

**This is a breaking change to the package's public API** — `Callout` and `CalloutProps` are barrel-exported from `packages/design-system/src/index.ts`. Blast radius re-verified directly rather than taken from the paragraph above: `apps/contentful-poc` references Callout in **0 files**. No known consumer, but the break is real and named rather than discovered later.

### Root cause worth carrying to SUG-224

Five package components have no Storybook story: **Accordion, Breadcrumb, ButtonGroup, Callout, IconButton.** Three of those — Accordion, Breadcrumb, Callout — are diverged pairs in this epic. What is not rendered in Storybook is not reviewed, and what is not reviewed drifts. That is a sharper argument for removing the second copy than "two copies is untidy," and it is the same gap recorded against Phase 2's package Accordion fix.

## Behavioural parity — can it be validated automatically? (answered 2026-07-22)

**No. Declining to build a cross-copy parity validator. Behavioural parity is a review-time concern, and the proportionate fix is SUG-224 removing the second copy.**

### Why byte-comparison cannot extend to JS

`validate-style-mirror.js` works because the two `<Name>.module.css` files are *meant* to be byte-identical. The JS copies are not, and never can be: web is `.jsx` with a default export importing `react-router-dom`; the package is `.tsx` with a named export consuming the SUG-230 link seam. Those differences are the architecture, not drift. Byte-identity is not a goal that can be adapted here.

### Why the rest of the toolchain cannot see it either

Parity is a *relation between two files*. Every other tool in this stack evaluates **one artifact against its own history or its own rules**:

- **Lint** checks a file against rules, not against its twin.
- **TypeScript** checks the package copy; the web copy is untyped JS, so there is nothing to compare against.
- **Chromatic** diffs a story against *its own previous baseline*. Two copies can each be perfectly stable and mutually different forever and Chromatic stays green — which is exactly what happened. It catches regression over time, not divergence across copies.

The CSS mirror validator is the only relational check in the repo, and it is relational only because byte-identity gave it something to compare.

### Would a render-diff harness work?

In principle: render both copies with the same props, normalise the CSS-module class hashes, diff the DOM. In practice, two problems.

**It would have to be built from nothing.** The repo has **no test infrastructure at all** — no vitest, no jest, no `@testing-library`, no test script, zero `*.test.*` or `*.spec.*` files (verified 2026-07-22). That is SUG-161's scope, and it is Low priority.

**More important: it pins known divergences, it does not find unknown ones.** A render-diff only catches what its fixtures exercise. Checked against this epic's actual bugs:

| Divergence | Caught by render-diff only if the fixture… |
|---|---|
| Accordion missing guard | passes `items={undefined}` |
| Stack `md`-only condition | renders at a ≥1024px viewport |
| Breadcrumb `aria-current` | gives the trailing crumb an `href` |
| CodeBlock missing plugin | asserts on injected row markup |
| FilterBar unused `onClearAll` | asserts the button exists *and* fires |

Every one needs the fixture author to already suspect the bug. None of these were found by tooling — they were found by a human reading both files side by side in SUG-224's Phase 1 spike. A parity harness would have encoded that human's findings after the fact, not produced them.

### What is worth building instead

Two cheap **single-copy** static checks. Both would have caught real bugs here, and both keep their value after SUG-224 deletes the second copy — unlike a parity harness, which becomes dead code the moment consolidation lands:

1. **`styles.X` referenced but undefined in the paired `.module.css`.** Catches Table's `styles.wide` — still open in this epic's Scope, and the exact same dead-reference family as `onClearAll` and `showLineNumbers`.
2. **Destructured prop never referenced in the component body.** Catches FilterBar's `onClearAll`, where an `// eslint-disable-next-line no-unused-vars` was sitting on top of the bug as a signed confession.

Neither is a parity check. Both are "this file contradicts itself" checks, which is a tractable problem where parity is not.

### The Storybook gap is not a substitute

Five package components have no story: **Accordion, Breadcrumb, ButtonGroup, Callout, IconButton** — and Accordion, Breadcrumb and Callout are three of this epic's diverged pairs. Adding stories is worth doing, but be clear about what it buys: **visibility to a human reviewer, not automated parity.** As noted above, Chromatic cannot compare the two copies. Callout is the proof — its package copy had no story, so it had no baseline, so nothing was ever green or red about it; it simply was not looked at for months.

For Accordion, Breadcrumb and Callout the story is currently blocked anyway: `Components/<Name>` is owned by the web mirror's story file, so a package story collides on title. That resolves when SUG-224 decides which copy survives.

### Conclusion

The root cause is not a missing validator. It is that **two hand-maintained copies of the same component exist**, and only one axis of them (CSS) has a property strong enough to check mechanically. Building a parity harness would be investing in the duplication rather than removing it. Ship the two self-contradiction checks, add the missing stories where the title collision allows, and let SUG-224 delete the second copy — after which this question stops existing.

## Acceptance criteria

- [ ] FilterBar's clear-all button appears and works on a live archive page with active filters; the `eslint-disable` on `onClearAll` is gone
- [ ] CodeBlock with `showLineNumbers` renders visible line numbers in the web app, verified in the browser
- [x] Accordion renders `null` rather than throwing for `items={undefined}` in **both** copies — web verified in the browser (empty frame, no console error); package verified by typecheck + code identity, not VRT (see Phase 2 known gap)
- [x] Container applies a passed `style` prop in both copies — package verified in the browser: `outline: dashed 2px`, `background: rgb(242,255,191)`, `padding-block: 24px` all applied from `style`
- [x] Stack goes horizontal at `lg` for `direction={{ base: 'vertical', lg: 'horizontal' }}` in both copies — package verified in the browser: `flex-direction: row` at 1280px, `column` at 900px, so the `lg` breakpoint fires and nothing fires below it
- [x] Callout's canonical variant set is decided and recorded in this doc before implementation; both copies then expose the same variants — decision recorded in `357713f7`, implemented in `29fae02d`, in that order
- [ ] Storybook has a story per fixed behaviour, on `default` and `dark-pink-moon`
- [ ] Chromatic diffs reviewed — FilterBar and Callout will legitimately diff (new UI); Accordion/Container/Stack/CodeBlock should not diff on their default paths
- [x] The behavioural-parity validation question is answered in writing (implemented, or explicitly declined with reasoning) — **explicitly declined**, with reasoning and two cheaper alternatives proposed, in §Behavioural parity

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
