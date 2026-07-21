---
**Epic:** SUG-230 — DS link seam — injectable link component for framework-agnostic navigation
**Linear Issue:** [SUG-230](https://linear.app/sugartown/issue/SUG-230)
**Status:** Backlog
**Priority:** 🟢 Next
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end
---

# SUG-230 — DS link seam — injectable link component

Add a link-injection seam to the 5 `@sugartown/design-system` components that hard-code `<a href>`, so each consuming app can supply its own router's link component.

## Background

`packages/design-system/package.json` describes the package as a "CMS-agnostic component library." Navigation is the one thing it is not agnostic about: `Card`, `Chip`, `Button`, `Breadcrumb`, and `IndexCell` all render bare `<a href>` elements with no injection point. Both current consumers are penalised by this:

- **apps/web** (React Router SPA) cannot consume those components at all. Re-exporting them would turn every card, chip, and button click into a full page reload. This is the blocker that parked SUG-224 at Phase 1 (2026-07-21) — and closing it inside SUG-224 was impossible, because SUG-224's own Non-Goals forbid DS API changes.
- **apps/contentful-poc** (Next.js) has the same degraded navigation in production today. It wants `next/link`; it gets `<a>`. Nobody has filed this, because the POC's pages are shallow enough that the reload isn't obvious.

The seam is therefore worth building on its own merits, independent of SUG-224: it is the difference between a package that claims framework-agnosticism and one that has it. Reference surfaces: the 5 named package components, `packages/design-system/src/index.ts`, both consuming apps' root render trees, and Storybook.

## Objective

After this epic, every linked element in the DS package resolves its link element through a single injectable seam with a documented default of `<a href>` (so existing consumers are unaffected until they opt in). apps/web can supply `react-router-dom`'s `Link` and apps/contentful-poc can supply `next/link` at their respective app roots, and the package itself imports no router. This epic changes the package's public API and render output for 5 components — it touches Storybook, Chromatic, and the DS component registry accordingly. It does not touch Sanity schema, GROQ, or content, and it does not migrate apps/web off its mirror components (that stays SUG-224's job).

## Scope

- [x] Decide the injection mechanism (prop vs context vs polymorphic `as`) and record the decision with rationale in this doc — layer: design-system
- [ ] Implement the seam in `Card`, `Chip`, `Breadcrumb`, `IndexCell`, `List`, defaulting to `<a href>` when nothing is injected — layer: design-system
      <!-- Set corrected in Phase 0: Button has no href prop and cannot be seamed (→ SUG-231); List renders a bare <a href> and was omitted. -->
- [ ] Add a package Storybook story for `Breadcrumb` (it has none today — only the apps/web mirror does) — layer: Storybook
- [ ] Add `Breadcrumb`, `ButtonGroup`, `IconButton` to `packages/design-system/src/index.ts` (currently absent from the barrel, so they are unimportable regardless of this epic) — layer: design-system
- [ ] Storybook stories covering both the default `<a>` path and an injected-link path, on `default` and `dark-pink-moon` — layer: Storybook
- [ ] Wire apps/contentful-poc to inject `next/link` and verify SPA-style navigation works — layer: frontend
- [ ] Document the seam in the package's CONSUMING.md (or equivalent) with a copy-paste example per framework — layer: docs

## Phases

**Phase 0 — Mechanism decision.** Compare prop / context / polymorphic `as` against the real constraint: `Card` renders `Chip` internally, so any prop-based approach must drill through composition. Produce a short written comparison with a recommendation. No mock required — this epic changes behaviour, not visual design, and the components' rendered appearance is unchanged by construction.

**Phase 1 — Seam implementation + Storybook.** Implement in all 5 components with the `<a href>` default preserved. Stories for both paths, both themes. Chromatic must show **zero** visual diffs — if it doesn't, the default path has regressed.

**Phase 2 — Consumer wiring + docs.** Inject `next/link` in apps/contentful-poc, verify navigation, write the consuming docs. apps/web wiring is explicitly deferred to SUG-224.

---

## Phase 0 — Activation audit + mechanism decision (2026-07-21)

### Activation audit findings

Every claim below was verified by reading the live file, not carried over from SUG-224's dated classification.

**Finding 1 (scope correction, blocking) — `Button` has no anchor to seam; `List` does.**
An exhaustive grep for anchor renders across `packages/design-system/src/components/` returns exactly six files:

| Component | Anchor render | In epic's list of 5? |
|---|---|---|
| `Card` | 5 × `<a href>` (title, category, project, footer category, kpiLink) | yes |
| `Chip` | 1 × `<a href>` | yes |
| `Breadcrumb` | 1 × `<a href={item.href}>` | yes |
| `IndexCell` | 1 × `<a href>` (via `as="a"`) | yes |
| `List` / `ListItem` | 1 × `<a href={href \|\| '#'}>` | **no — omitted** |
| `Citation` | 1 × `<a href={`#${id}`}>` — same-page fragment, correctly not navigation | n/a |
| `Button` | **none.** Renders `<button>` only; the package `ButtonProps` has no `href` field at all | **yes — cannot be seamed** |

The package `Button` is not a component that hard-codes `<a href>`; it is a component that cannot link at all. Its apps/web counterpart (`apps/web/src/design-system/components/button/Button.jsx`) *does* take `href` and already branches external-anchor / RouterLink / button. That gap is a JS divergence between the two Button implementations, which is SUG-231's axis, not this epic's.

**Finding 2 — the reference implementation already exists in apps/web.**
`Button.jsx` + `apps/web/src/lib/linkUtils.js` already codify the external-URL rule this seam needs: `isExternalUrl()` is `/^[a-z][a-z0-9+.-]*:/i` (any protocol scheme), and external hrefs get a plain `<a target="_blank" rel="noopener noreferrer">` rather than a router link. Seven call sites use it. The DS seam should reproduce this behaviour rather than invent a second rule.

**Finding 3 — apps/contentful-poc currently produces invalid HTML as its workaround.**
`ArticleList.tsx` and `TagList.tsx` wrap `<Card>` / `<Chip>` in a `next/link`. Card's own README forbids exactly this: "Never wrap the card in an `<a>` tag containing child links — invalid HTML." Any Card with a category, project, tag, or kpiLink in that app is nesting anchors today. The seam fixes a correctness bug there, not only a navigation-quality one.

**Finding 4 — context costs the poc nothing.** All four DS consumers in apps/contentful-poc (`ArticleList`, `TagList`, `ArticleTags`, `SectionList`) already carry `"use client"`. The DS package has zero `"use client"` directives, so package components inherit client-ness from their importer. Adding `useContext` does not push a new client boundary onto that app. `layout.tsx` is an async server component with no existing provider to join, so the provider goes in a small client wrapper around `{children}`.

**Finding 5 — the esbuild build is compatible.** `build.mjs` sets `packages: 'external'`, so React is never bundled; `createContext` resolves to the host app's single React instance. Both consumers import from the one `src/index.ts` entry, so the context is a single module-level singleton per app. No build change required.

**Finding 6 — `Breadcrumb` has no package story.** Storybook's glob covers `packages/design-system/src/**/*.stories.*` (37 stories today), but Breadcrumb's only story is the apps/web mirror's. `Card`, `Chip`, `IndexCell`, and `List` all have package stories. Breadcrumb needs a new one, and it has no Chromatic baseline to diff against.

**Finding 7 — `Breadcrumb` and `ButtonGroup` are default exports**, `IconButton` is a named export. The barrel additions are not uniform: `export { default as Breadcrumb }` / `export { default as ButtonGroup }` / `export { IconButton }`.

### Mechanism comparison

The binding constraint is composition: `Card` renders `Chip` internally for both the tags and tools rows, so any mechanism that travels by prop must cross a component boundary the consumer does not control.

| | Prop (`linkComponent` per component) | Polymorphic `as` | **React context (chosen)** |
|---|---|---|---|
| Card → Chip composition | Card must forward `linkComponent` into every internal `<Chip>`; the same for any future internal composition | same forwarding problem, plus the prop is now the element type rather than a component | resolved automatically — Chip reads the same context regardless of who rendered it |
| Call-site burden | every call site of all 5 components, forever | same | one provider at the app root |
| Adding a 6th linked component | new prop, new plumbing, all call sites updated | same | free — it calls the same internal resolver |
| Testability in isolation | trivial, explicit | trivial, explicit | needs a provider; one Storybook decorator covers every story |
| Typing | 5 near-identical prop declarations | polymorphic generics are the hardest to type well of the three | one exported `LinkComponent` type |
| Failure mode when unset | prop absent → `<a>` default | `as` absent → `<a>` default | context null → `<a>` default (identical) |
| RSC impact | none | none | forces `useContext`, so components must be client — already true in both consumers (Finding 4) |

Prop and `as` both fail the Card→Chip constraint at the same place, and both make every future linked component a fresh plumbing exercise. Context's real costs are the implicit dependency and the Storybook provider, and the second is one decorator.

### Decision

**React context, consumed through a single internal `<Link>` resolver, with a plain-`<a>` bypass for external URLs.**

New module `packages/design-system/src/link/`:

- `LinkContext` — `React.createContext<LinkComponent | null>(null)`
- `LinkProvider` — `{ component, children }`, set once at the app root
- `useLinkComponent()` — the hook
- `isExternalHref()` — ports `apps/web/src/lib/linkUtils.js`'s rule verbatim (`/^[a-z][a-z0-9+.-]*:/i`), plus protocol-relative `//` and bare `#` fragments
- `Link` — the internal resolver every seamed component renders instead of `<a>`

Resolver rule, in order:
1. no `href` → render children unwrapped (caller's existing non-link branch is unchanged)
2. `href` is external / protocol-relative / a bare fragment → plain `<a href>`
3. no provider mounted → plain `<a href>` (the documented default; this is what keeps the change additive)
4. otherwise → the injected component, receiving `href` and all pass-through props

**The resolver does not add `target="_blank" rel="noopener noreferrer"` to external links,** even though apps/web's Button does. Whether an external link opens in a new tab is an editorial decision that these five components do not currently make, and adding it would change the default path's rendered DOM and its click behaviour for apps/contentful-poc today. The AC is that the default path is unchanged, so the resolver's only job is choosing the element, not restyling the interaction. apps/web Button keeps its own `openInNewTab` behaviour at its own layer.

Consumers adapt at the root, and the package imports no router:

```tsx
// apps/contentful-poc — next/link takes href, so it is a drop-in
<LinkProvider component={NextLink}>{children}</LinkProvider>

// apps/web (SUG-224) — React Router takes `to`, so a 1-line adapter
const RouterLinkAdapter = ({ href, ...rest }) => <RouterLink to={href} {...rest} />
<LinkProvider component={RouterLinkAdapter}>{children}</LinkProvider>
```

**Why no per-component prop override on top of the context.** The one case that genuinely needs to escape the router is external URLs, and rule 2 handles it inside the resolver, where it cannot be forgotten. Adding a redundant prop escape hatch would double the API surface of all 5 components for a case that no longer exists. If a real need appears later, the prop is additive on top of this design.

### Scope corrections carried into Phase 1

- `Button` is **out** of the seam scope: nothing to seam. Adding `href` to the package Button is JS divergence work and moves to SUG-231, which will consume this seam once it lands.
- `List` / `ListItem` is **in**: it renders a bare `<a href>`, it is exported from the barrel, and it has a package story. Its `href || '#'` fallback (every hrefless row becomes a `#` link) is noted for SUG-231, not fixed here.
- The seamed set is therefore **Card, Chip, Breadcrumb, IndexCell, List** — still five components.

## Acceptance criteria

- [x] The injection mechanism decision is recorded in this doc with its rationale before any implementation commit
- [ ] All 5 components (`Card`, `Chip`, `Breadcrumb`, `IndexCell`, `List`) resolve links through the injected component and fall back to `<a href>` when none is supplied
- [x] `packages/design-system/src/` contains no import of `react-router-dom`, `next/link`, or any other router — verified by grep (only a doc-comment mention in `LinkContext.tsx`)
- [x] Chromatic shows zero visual diffs on the default (non-injected) path for all 5 components — build #77, 4 changes, all first-time baselines for the new `Foundations/Link Seam` entries; reviewed and accepted by Bex 2026-07-21
- [x] Storybook covers default + injected paths for each of the 5, rendering correctly on `default` and `dark-pink-moon`
- [x] `Breadcrumb`, `ButtonGroup`, and `IconButton` are exported from the package barrel
- [x] apps/contentful-poc navigates client-side (no full page reload) on a Card title link, verified in the browser
- [x] Consuming documentation includes a working example for both React Router and Next.js

---

## Close-out summary (2026-07-21)

| Phase | Commit | Result |
|---|---|---|
| 0 — mechanism decision | `e8c6cb08` | Context + internal `<Link>` resolver chosen; two scope corrections |
| 1 — seam + Storybook + barrel | `ed5f9861` | 9 anchors across 5 components seamed; 3 components un-orphaned from the barrel |
| 2 — poc wiring + docs | `2cb09995` | next/link injected; invalid anchor nesting removed; CONSUMING.md §8 |

### What shipped

`packages/design-system/src/link/` — `LinkProvider`, `useLinkComponent`, `isExternalHref`/`isFragmentHref`, and the internal `Link` resolver. Nine bare `<a href>` renders became `<Link>`: Card ×5 (title, category, project, footer category, kpiLink), Chip ×1, Breadcrumb ×1, IndexCell ×1, List ×1. `Citation`'s `<a href="#id">` was left alone — it is a same-page fragment, not navigation.

Barrel additions: `Breadcrumb`, `ButtonGroup`, `IconButton` (the latter two needed `index.ts` files that did not exist).

### Evidence

**Default/injected parity — the core AC.** The `Foundations/Link Seam` Snapshot story renders both paths in one page. Comparing the two columns' `innerHTML` with the mock's `data-injected` attribute stripped: **identical, 4118 characters each, first difference at index −1 (none)**. This is stronger than a visual match — the DOM is the same, so a Chromatic diff between the paths is impossible by construction.

**Seam fires correctly.** In the injected column: 15 internal links routed through the injected component; `https://vercel.com` and `#footnotes` correctly bypassed to plain anchors. Confirmed on `light-pink-moon` and `dark-pink-moon`.

**Client-side navigation in apps/contentful-poc.** Against a running dev server on `/articles`: a value stamped on `window` survived clicking both a Card title link and a Chip, and `performance.getEntriesByType('navigation').length` stayed at 1. A full document load resets both. URL and rendered content both updated (`/articles/article-3` → h1 "Article 3"; `/tags/vercel` → h1 "Vercel"). Zero console errors.

**Invalid HTML fixed.** `document.querySelectorAll('a a').length` is now 0 on the poc's article detail page. It was non-zero before: the app wrapped `Card` in a `next/link`, and Card renders its own internal links.

### Chromatic

Build **#77** — passed. 360 stories across 95 components, 349 snapshots, 47s.
4 visual changes, all first-time baselines for the new `Foundations/Link Seam` entries
(`--default`, `--injected`, `--snapshot`, `--docs`). No existing component reported a
change, confirming the seam is inert on the default path. Accepted by Bex 2026-07-21.
<https://www.chromatic.com/build?appId=69de2a8dfe5a14bc405087d5&number=77>

**Two run-time notes worth carrying forward:**

1. **The wrapper's skip gate would have skipped this run entirely.** `apps/storybook/scripts/chromatic.sh` derives its changed-file set from `git diff --name-only HEAD~1`. This epic's tip commit was docs-only, so that set was a single `.md` file, which its `^docs/` and `\.md$` exclusions strip — leaving `VISUAL` empty and exiting 0 before any snapshot. The run was done by invoking `chromatic` directly. This is the already-documented HEAD~1 skip-gate trap; it fires whenever an epic's final commit is documentation, which is the normal close-out shape.
2. **TurboSnap was unavailable** ("not available until at least 10 builds are created from CI"), so `--only-changed` degraded to a full-suite run. That is more coverage than intended, not less — every seamed component was snapshotted regardless of the dependency trace.

### Deviations from the epic as written

1. **Button out, List in** — approved scope correction, rationale in Phase 0 above. Adding `href` to the package Button moves to SUG-231.
2. **No package `Components/Breadcrumb` story.** apps/web's mirror already owns that Storybook title; a second file would be the repo's first duplicate story id. Breadcrumb's default and injected paths are covered in `Foundations/Link Seam` instead. The two Breadcrumb implementations are genuinely divergent (wrapper `<span>` vs `Fragment`, `isHighlighted` vs `isCurrent`, `←&nbsp;` vs `← `, differing `aria-current` placement) — that is SUG-231's axis and a Non-Goal here.
3. **No `Guidelines` story.** Writing one would trip the DS-documentation Gate 2 (template lock) for content the epic scoped as CONSUMING.md's job. The seam's usage documentation lives there; the story carries Overview prose only.
4. **The resolver does not add `target`/`rel` to external links**, despite apps/web's Button doing so. Rationale recorded in the Phase 0 decision — it would change the default path's behaviour, which the ACs forbid.

### Follow-ups (not blocking)

- `packages/design-system/build.mjs` carries a comment saying DTS emit is blocked by a lucide-react × React 19 `@types` skew. It is not: `tsc -p tsconfig.json --emitDeclarationOnly` ran clean this session. The comment is stale.
- `List`'s `href={href || '#'}` turns every hrefless row into a `#` link. Left as-is (SUG-231's axis), now visible through the seam as a fragment bypass.
- `.claude/launch.json` gained `storybook-alt` (6007) and `contentful-poc-alt` (3001) so a second session can run these servers when the default ports are held.

## Human QA Walkthrough — example local pages

> Activation audit: this epic's visible surface is apps/contentful-poc (Phase 2) and Storybook,
> not apps/web — apps/web still renders its own mirror components until SUG-224 runs. Build the
> walkthrough table from the contentful-poc routes that render Card/Chip/Button, plus the
> Storybook stories for all 5 components on both themes. Read `apps/contentful-poc`'s route
> definitions at activation; do not assume the route list from memory.

## Technical notes

- **This is a DS API change.** Full DS component ceremony applies: token-first rule, Storybook coverage on both themes as a shipping AC, Chromatic, and the component registry updated.
- **The default path is the safety net.** Every component keeps `<a href>` when nothing is injected, so the change is additive and no existing consumer breaks. A Chromatic diff on the default path means the seam leaked into the default render — treat it as a defect, not a baseline to accept.
- **Not blocked by SUG-217/218/219.** Those are CSS-only; this is API/render. Running them in parallel is the point — it shortens SUG-224's critical path rather than extending the queue.
- **Composition constraint drives the mechanism choice:** `Card` renders `Chip` internally for tags/tools, and `Card` also renders category/project/kpi/footer links. A prop-based seam means either drilling `linkComponent` from Card into Chip, or every consumer passing it at every call site. React context set once at the app root avoids both. Weigh this against context's downsides (implicit dependency, harder to test in isolation, needs a provider in Storybook) before deciding.
- **Activation audits:**
  - Re-read all 5 components — SUG-224's Phase 1 classification is dated 2026-07-21 and the CSS epics may have touched them since.
  - Check whether `apps/contentful-poc` already wraps its tree in any provider that a LinkProvider could join, rather than adding a second one.
  - Confirm the esbuild build (`packages/design-system/build.mjs`) handles whatever mechanism is chosen — context adds a module-level singleton, which interacts with the `packages: 'external'` setting.

## Model & Mode [REQUIRED]

`/model opus` + plan mode for Phase 0 (the mechanism decision is a genuine API-design trade-off with composition and testing implications), then `/model sonnet` for Phases 1–2 execution.

## Non-Goals

- **Migrating apps/web onto the package.** That is SUG-224. This epic only removes the blocker.
- **Any visual change to the 5 components.** Rendered output must be pixel-identical on the default path; that is an AC, not an aspiration.
- **Reconciling the JS divergence in those components** (e.g. Chip's missing `hasColorDot`, Breadcrumb's DOM differences) — that is SUG-231. Where the two epics touch the same file, SUG-231's reconciliation and this epic's seam are separate commits.
- **Adding link injection to web-only components** (Tile, SidebarNav) — they live in apps/web and already use `react-router-dom` directly.

## Related

- **Linear:** [SUG-230](https://linear.app/sugartown/issue/SUG-230)
- **Blocks:** [SUG-224](https://linear.app/sugartown/issue/SUG-224) — apps/web consumes @sugartown/design-system
- **Sibling:** [SUG-231](https://linear.app/sugartown/issue/SUG-231) — JS divergence reconciliation (same 5 files in part, different axis)
- **Origin:** `docs/backlog/SUG-224-apps-web-consumes-design-system-package.md` §Phase 1 Findings, Blocker 1
- **Epic template:** `docs/epic-template.md`
