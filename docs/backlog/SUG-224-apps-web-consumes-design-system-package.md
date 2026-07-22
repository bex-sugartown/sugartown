---
**Epic:** SUG-224 — apps/web consumes @sugartown/design-system
**Linear Issue:** [SUG-224](https://linear.app/sugartown/issue/SUG-224)
**Status:** Backlog — 🟢 **Prerequisites cleared 2026-07-22.** Re-phased; Phase 0 (spec amendment) is the entry point
**Priority:** 🟢 Next
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

> **⚠️ Read §Phase 1 Findings and §Re-phased 2026-07-22 before touching anything.**
>
> Phase 1 ran 2026-07-21 and parked the epic. **All four blockers are now resolved or scheduled:**
> Blocker 1 (no link seam) — solved upstream by SUG-230, which shipped v0.29.4; `apps/web` just
> needs to mount a `LinkProvider`. Blocker 2 (unachievable structural-closure AC) — AC amended
> 2026-07-22, replaced by a 44-row disposition table. Blocker 3 (CSS epics) — SUG-217/219 shipped,
> SUG-218 absorbed into SUG-231, and `KNOWN_DRIFT` is **empty**. Blocker 4 (package `Button` has no
> `href`) — inherited from SUG-231 and scheduled as Phase 1b.
>
> **Entry point is Phase 0**, which is spec work only: complete the disposition table and confirm
> no remaining AC is unachievable. The epic parked the first time because execution started against
> a spec that could not pass — do not skip it.

# SUG-224 — apps/web consumes @sugartown/design-system

Make apps/web consume `@sugartown/design-system` as a real workspace dependency, replacing the hand-synced mirror components at `apps/web/src/design-system/` with direct re-exports from the package.

## Background

apps/web does not depend on `@sugartown/design-system` at all: it renders a separately maintained JSX mirror of every DS component (`apps/web/src/design-system/components/`), with a header TODO in `Card.jsx` acknowledging the gap. The mirror is a manual drift rule — only the style files are validator-checked (`validate-style-mirror.js`), and the component copies have already required a registry entry in CLAUDE.md §Mirrored File Registry to manage. The trigger: the SUG-127 POC proved the package runs unchanged on a second stack (Contentful/Next.js/Vercel), and the platform-is-the-portfolio case study's agnostic-stack diagram now honestly draws production consumption as a dashed roadmap arrow (`docs/diagrams/redpen-platform-is-the-portfolio.md`). This epic turns that arrow solid. Affected surfaces: every page in apps/web that renders a DS component, plus Storybook (pinkmoon) and the Vite build.

## Objective

After this epic, `apps/web/package.json` declares `@sugartown/design-system: workspace:*` and every file under `apps/web/src/design-system/components/` is either a thin re-export from the package or deleted, with imports updated to hit the package directly. The JSX↔TSX build boundary is handled in Vite config (package consumed as source or as built output — decided in Phase 1). No Sanity schema, GROQ, or content changes — render layer and build tooling only. CLAUDE.md's Mirrored File Registry row for DS component mirrors is retired in the same close-out, and `docs/diagrams/diagram-portfolio-agnostic-stack.svg` is updated (dashed arrow → solid) with its red-pen table row reclassified from roadmap to enforced-by-code.

## Scope

> **Every Scope item below names its phase** (added 2026-07-22 — SUG-231 shipped with a Scope item, Table's `.wide`, that belonged to no phase at all and would have gone unnoticed).

- [ ] **Phase 0 —** Fill in the per-component **disposition table** below: all 44 web component directories classified re-export / promote / stays-web-only, with a reason on every stays-web-only row — layer: docs
- [ ] **Phase 0 —** Amend §Acceptance criteria and §Non-Goals per Blockers 2 and 4 (done 2026-07-22; verify no other AC is unachievable before execution resumes) — layer: docs
- [ ] **Phase 1b —** Add `href` to the package `Button` via the SUG-230 seam; decide `target="_blank"`/`rel` — layer: design-system
- [ ] **Phase 2 —** Mount `LinkProvider` in `apps/web` supplying `react-router`'s `Link`; verify SPA nav unchanged on a real page — layer: frontend
- [ ] **Phase 3 —** Add package Storybook stories for Accordion, Breadcrumb, ButtonGroup, Callout, IconButton; resolve the `Components/<Name>` title collision — layer: Storybook
- [ ] **Phase 1 —** Add `@sugartown/design-system` as a workspace dependency of apps/web — layer: tooling
- [ ] Resolve the JSX↔TSX consumption strategy (source vs built package, CSS module handling, `exports` map coverage) and record it as a decision note in this doc — layer: tooling
- [ ] Replace each mirror component in `apps/web/src/design-system/components/` with a re-export from the package (or delete + update import sites) — layer: frontend
- [ ] Dedupe mirrored component CSS modules (package copy becomes the only copy) — layer: frontend
- [ ] Storybook (pinkmoon) resolves the package build without breaking HMR or Chromatic baselines — layer: Storybook
- [ ] Retire the DS-component-mirror row from CLAUDE.md §Mirrored File Registry and the web-adapter-sync steps in `docs/epic-template.md` §Design System → Web Adapter Sync — layer: tooling/docs
- [ ] Update `docs/diagrams/diagram-portfolio-agnostic-stack.svg` (dashed → solid) + red-pen table, and propose the matching case study caption/legend change through the Content Write Gate — layer: content
- [ ] Full visual QA across all page types on both themes — layer: frontend

## Phases

**Phase 1 — Consumption spike (decision ships, no page changes).** ✅ **COMPLETE 2026-07-21** — decision recorded in §Phase 1 Findings. Ran as a read-only audit; no dependency was wired and no branch state was produced, because the spike surfaced three blockers that must be resolved first. ~~Prove one component (Card)~~ — when execution resumes, spike a pure mirror, not Card (see Corrections).

---

### Re-phased 2026-07-22 (SUG-231 post-mortem)

The original Phases 2–3 assumed the only work left was mechanical replacement. It isn't, and the epic parked once already because the AC could not pass. Phases below are ordered by what unblocks what, not by tidiness.

**Inventory verified 2026-07-22 by direct count, not read from this doc:** 44 web component dirs, 38 package dirs — **38 paired, 6 web-only, 0 package-only.** 23 web files declare themselves mirrors. 6 web *implementations* import `react-router`: `Card`, `Chip`, `Tile`, `Button`, `Breadcrumb`, `IndexCell`.

**The unlock that changes this epic's shape:** SUG-230's link seam already covers **Card, Chip, Breadcrumb, IndexCell and List** in the package, and `apps/web` does **not** yet mount a `LinkProvider` — only `apps/contentful-poc` does. Mounting one at the web root converts five of the six router-importing adapters into plain re-exports. Blocker 1 ("the package hard-codes `<a href>`, and fixing it needs a DS API change our Non-Goals forbid") is therefore already solved upstream; what remains is wiring, not design.

**Phase 0 — Fix the spec before touching code.** Amend §Scope, §Acceptance criteria and §Non-Goals per Blockers 2 and 4. Specifically: replace the `grep`-returns-zero structural-closure AC with an explicit per-component **disposition table** (re-export / stays web-only / promoted to package), and drop the "no API changes" Non-Goal, which makes Blocker 4 unresolvable inside the epic that owns it. No code. Output: an epic whose ACs can actually pass.

**Phase 1b — Package `Button` gains `href` (Blocker 4).** Consume the SUG-230 seam; settle whether `target="_blank"`/`rel` comes to the package. Sole remaining hard prerequisite. Inherited from SUG-231, which correctly refused to decide it in isolation.

**Phase 2 — Mount `LinkProvider` in `apps/web`.** One provider at the app root supplying `react-router`'s `Link`. Verify SPA navigation is unchanged on a real page before converting anything. Highest-leverage step in the epic: it retires the adapter justification for five components at once.

**Phase 3 — Storybook coverage for the surviving copy.** Add package stories for **Accordion, Breadcrumb, ButtonGroup, Callout, IconButton**, resolving the `Components/<Name>` title collision by deciding which copy survives. Must precede Phase 4 so Chromatic has baselines for the components being migrated. Without this, migration is unverifiable — the absence of these five stories is what let all the SUG-217/218/219/231 drift go unseen in the first place.

**Phase 4 — Convert the pure mirrors in batches.** Re-export from the package, delete the web implementation, dedupe the CSS module. Chromatic between batches. Mechanical once Phases 1b–3 land.

**Phase 5 — Dispose of the remainder explicitly.** The 6 web-only components (`Grid`, `PageHeader`, `SectionLabel`, `Sidebar`, `SidebarNav`, `Tile`) plus any adapter that keeps a genuine app-layer difference: each gets a row in the disposition table saying promoted-to-package or stays-web-only-because-X. This is what closes the AC honestly instead of fudging a `grep`.

**Phase 6 — Docs + diagram close-out.** Retire the DS-component-mirror row from CLAUDE.md §Mirrored File Registry and the web-adapter-sync steps in `docs/epic-template.md`; update `validate-style-mirror.js` scope; diagram dashed→solid + caption via the Content Write Gate.

## Phase 1 Findings (2026-07-21) — decision shipped, execution parked

Phase 1 ran as a read-only consumption spike (Opus, no code written). Every activation audit in §Technical notes was executed. Findings below supersede the assumptions in §Background and §Non-Goals where they conflict.

### Decision: consumption strategy (the Phase 1 deliverable)

**Consume the built package via its `exports` map.** `apps/web/package.json` declares `@sugartown/design-system: workspace:*`; imports resolve `@sugartown/design-system` → `dist/index.mjs`; styles come from a single `@sugartown/design-system/styles.css` import in `main.jsx`, placed **before** app CSS. Turbo gains a build-ordering dependency (package builds before web).

Rejected alternative: aliasing `@sugartown/design-system` to `packages/design-system/src` in Vite config. It is lower-risk (Vite-native CSS module handling preserved, HMR across the boundary retained) but it is source-sharing, not package consumption — it would not honestly support the agnostic-stack diagram's solid-arrow claim, which is this epic's whole purpose.

**Known risk carried by this decision:** DS component CSS moves from per-module injection (Vite decides order from the import graph) to one pre-built 79KB stylesheet. Cascade order relative to app-level CSS (`pages.module.css` et al.) shifts. Chromatic is the net; "it builds" proves nothing here.

Package build verified working at decision time: `dist/index.css` 78.7kb, `dist/index.mjs` 73.0kb, `dist/index.js` 80.3kb.

### The mirrors are not mirrors — full classification of all 38 pairs

| Class | Count | Components |
|---|---|---|
| **Pure mirror** | 26 | AppShell, Avatar, Blockquote, Box, ButtonGroup, Citation, Columns, DescriptionList, ErrorMessage, Field, HelperText, IconButton, IndexGroup, Input, Label, List, Meter, Metric, Page, ScoreRing, SegmentedControl, Skeleton, Surface, Swatch, Table, Textarea |
| **Adapter** (genuine functional differences) | 6 | Breadcrumb, Button, Card, Chip, IndexCell, Media |
| **Diverged** (drifted, neither canonical) | 6 | Accordion, Callout, CodeBlock, Container, FilterBar, Stack |

Plus 6 web-only components with no package counterpart (Grid, PageHeader, SectionLabel, Sidebar, SidebarNav, Tile) and zero package-only components.

### Blocker 1 — there is no link seam, and adding one violates this epic's Non-Goals

The package hard-codes `<a href>` in Card, Chip, Button, Breadcrumb, and IndexCell. apps/web needs react-router `<Link>` for SPA navigation. **A straight re-export turns every card/chip/button click into a full page reload** — a functional regression, not a refactor.

Closing this requires adding link injection (`linkComponent` / polymorphic `as` prop / a Link context) to those package components. That is a DS API change, which §Non-Goals explicitly forbids ("No visual or API changes to any DS component"). **The epic as written cannot reach its stated end-state without contradicting itself.** Resolving this is a prerequisite scope amendment, not an implementation detail.

### Blocker 2 — the structural-closure AC is unachievable as written

"No file under `apps/web/src/design-system/components/` contains a component implementation" cannot hold for: the 6 adapters (link seam), the 6 web-only components (no package equivalent exists), or the 3 substantively diverged components (Callout, CodeBlock, FilterBar). That AC must be rewritten to name the achievable set before execution resumes.

### Blocker 3 — SUG-217 / SUG-218 / SUG-219 are real prerequisites

§Technical notes claims "Upstream dependencies: none blocking." **This is wrong.** 11 component CSS pairs are drifted and grandfathered on `KNOWN_DRIFT` in `validate-style-mirror.js`. Four of them — **Citation, ScoreRing, Table, IconButton — are pure mirrors in JS but drifted in CSS**: re-exporting them makes apps/web silently adopt the package's different stylesheet, i.e. an unreviewed visual change.

Only the **22 pure mirrors with byte-identical CSS** are safe to convert today. **Decision 2026-07-21: park the epic until SUG-217/218/219 ship**, then execute against clean CSS rather than reconciling drift inside this epic.

### Corrections to stated assumptions

- §Background/§Technical notes cite SUG-127's `"use client"` wrappers as starting state. **Zero `"use client"` directives exist in the package** — verified by grep across `packages/design-system/src/`. The `exports` map fix is real; the `"use client"` one is not (or was since removed).
- §Phases picks Card as the Phase 1 proof component. **Card is the single worst candidate** — the most complex adapter (382 lines vs the package's 340, react-router Links, `getLinkProps`, `children`/`footerChildren`/`thumbnailStyle` escape hatches). When execution resumes, spike a clean pure mirror (e.g. Box or Surface) instead.
- The package barrel (`packages/design-system/src/index.ts`) does not export `Breadcrumb`, `ButtonGroup`, or `IconButton`. Barrel additions are needed before those can be imported (trivial, not an API change).
- Web `Card.jsx`'s header comment claims `tags[]` is extended with `colorHex`; the implementation never reads it. Stale comment, worth correcting whenever Card is next touched.

### Blocker 4 — the package `Button` cannot navigate (inherited from SUG-231, 2026-07-22)

The web `Button` accepts `href` and branches external-anchor / RouterLink / `<button>`. **The package `Button` has no `href` in its props at all** — it renders only `<button>`. apps/web cannot consume a Button that cannot navigate, so this is a hard prerequisite for converting that pair.

Handed over from SUG-231 Phase 1b, where it sat in Scope while that epic's own Non-Goals listed Button's `href` among the intentional adapter differences that "stay until SUG-224 decides their fate". Non-Goals won: this is a feature gap blocking consolidation, not mirror drift, and it belongs to whichever epic owns the merged component — this one.

**Open decision when this is picked up:** whether `target="_blank"` / `rel="noopener noreferrer"` on external hrefs comes to the package. Web's Button sets them unconditionally and also honours an `openInNewTab` prop. SUG-230's `<Link>` resolver **deliberately does not** add target/rel ([`packages/design-system/src/link/Link.tsx`](../../packages/design-system/src/link/Link.tsx) — "That is an editorial choice these components do not currently make"). Porting web's Button faithfully means either dropping that behaviour or overriding SUG-230's decision. Decide it here, where the merged Button is the only Button, rather than in isolation. Current package consumer to check against: `apps/contentful-poc/src/components/SiteHeader.tsx`.

### Resume checklist

1. Confirm SUG-217, SUG-218, SUG-219 are all shipped and `KNOWN_DRIFT` is empty.
2. Amend §Scope, §Acceptance criteria, and §Non-Goals to resolve Blockers 1 and 2 — decide explicitly whether the link seam is in scope (and if so, drop the "no API changes" Non-Goal and add a DS visual QA gate for the 5 affected components).
3. Re-run the pair classification — it will have changed once the CSS epics land.
4. Spike a pure mirror, not Card.
5. Add `href` to the package `Button` via the SUG-230 seam, and settle the target/rel question (Blocker 4).
6. Fold in SUG-231's declined Breadcrumb work: web's `react-router-dom` import vs the package's seam, and the `.crumb` wrapper vs `React.Fragment`. Both were left unreconciled on the explicit grounds that this epic deletes the web copy — if that changes, they come back into play.

## Disposition table (Phase 0 deliverable)

Generated 2026-07-22 from the live directory listing — **44 rows, one per web component directory.**
Every row must reach a non-TBD verdict before Phase 4 begins; the amended structural-closure AC is
satisfied by this table being complete, not by a grep returning zero.

| Component | Pairing | Verdict | Note |
|---|---|---|---|
| `Breadcrumb` | paired | TBD | router import retired by Phase 2 LinkProvider |
| `FilterBar` | paired | TBD | candidate re-export |
| `PageHeader` | web-only | stays web-only | no package counterpart — promote or justify |
| `accordion` | paired | TBD | candidate re-export |
| `app-shell` | paired | TBD | candidate re-export |
| `avatar` | paired | TBD | candidate re-export |
| `blockquote` | paired | TBD | candidate re-export |
| `box` | paired | TBD | candidate re-export |
| `button` | paired | TBD | blocked on Phase 1b — package Button has no `href` |
| `button-group` | paired | TBD | candidate re-export |
| `callout` | paired | TBD | candidate re-export |
| `card` | paired | TBD | router import retired by Phase 2 LinkProvider |
| `chip` | paired | TBD | router import retired by Phase 2 LinkProvider |
| `citation` | paired | TBD | candidate re-export |
| `codeblock` | paired | TBD | candidate re-export |
| `columns` | paired | TBD | candidate re-export |
| `container` | paired | TBD | candidate re-export |
| `description-list` | paired | TBD | candidate re-export |
| `error-message` | paired | TBD | candidate re-export |
| `field` | paired | TBD | candidate re-export |
| `grid` | web-only | stays web-only | no package counterpart — promote or justify |
| `helper-text` | paired | TBD | candidate re-export |
| `icon-button` | paired | TBD | candidate re-export |
| `index-cell` | paired | TBD | router import retired by Phase 2 LinkProvider |
| `index-group` | paired | TBD | candidate re-export |
| `input` | paired | TBD | candidate re-export |
| `label` | paired | TBD | candidate re-export |
| `list` | paired | TBD | router import retired by Phase 2 LinkProvider |
| `media` | paired | TBD | candidate re-export |
| `meter` | paired | TBD | candidate re-export |
| `metric` | paired | TBD | candidate re-export |
| `page` | paired | TBD | candidate re-export |
| `score-ring` | paired | TBD | candidate re-export |
| `section-label` | web-only | stays web-only | no package counterpart — promote or justify |
| `segmented-control` | paired | TBD | candidate re-export |
| `sidebar` | web-only | stays web-only | no package counterpart — promote or justify |
| `sidebar-nav` | web-only | stays web-only | no package counterpart — promote or justify |
| `skeleton` | paired | TBD | candidate re-export |
| `stack` | paired | TBD | candidate re-export |
| `surface` | paired | TBD | candidate re-export |
| `swatch` | paired | TBD | candidate re-export |
| `table` | paired | TBD | candidate re-export |
| `textarea` | paired | TBD | candidate re-export |
| `tile` | web-only | stays web-only | no package counterpart — promote or justify |

## Acceptance criteria

- [ ] `apps/web/package.json` contains `@sugartown/design-system` and `pnpm build` succeeds from a clean install
- [ ] **Structural closure, stated as a disposition rather than a grep** (amended 2026-07-22 — Blocker 2): every one of the 44 web component directories has a row in the disposition table with one of three verdicts — **re-exported** from the package, **promoted** to the package, or **stays web-only** with a stated reason. No directory is unaccounted for. The original AC — `grep -rn "Mirrors: packages/design-system" apps/web/src/` returns zero — is **retired**: 6 components are legitimately web-only with no package counterpart, so it could never pass, and an AC that cannot pass is what parked this epic the first time. The grep survives only as a narrower check: no file under `apps/web/src/design-system/components/` that the table marks **re-exported** still contains an implementation.
- [ ] Every route in the Human QA Walkthrough table renders identically to pre-epic (spot-checked on `default` and `dark-pink-moon`); Chromatic diff review shows no unapproved visual change
- [ ] Storybook builds and all existing stories render without console errors
- [ ] `pnpm validate:tokens`, `validate:tokens --strict-colors`, and `validate:style-mirror` all pass (style-mirror scope updated if the epic changes which files are mirrored)
- [ ] CLAUDE.md Mirrored File Registry and epic-template Web Adapter Sync sections reflect the new single-source reality
- [ ] Diagram + case study caption updates proposed via Content Write Gate and approved before any Sanity patch

## Human QA Walkthrough — example local pages

> Activation audit: read `apps/web/src/App.jsx`, list every page-type whose CSS this epic
> can reach (this epic can reach ALL of them — every DS component consumer changes import
> path), and build the Human QA Walkthrough table (one example local URL per page-type,
> incl. unchanged pages as regression guards) per `docs/epic-template.md` §Human QA
> Walkthrough. Capture one real published slug per detail page-type and datestamp it.

## Technical notes

- **Content Write Gate:** fires once, in Phase 3 — the case study diagram caption/legend update on the Sanity draft. All other work is code/docs.
- **Schema changes:** none. No Sanity or GROQ surface is touched.
- ~~**Upstream dependencies:** none blocking. SUG-127 (shipped) is the evidence base; its two packaging fixes (`exports` map, `"use client"` wrappers) are the starting state of the package.~~ **CORRECTED 2026-07-21 (Phase 1):** SUG-217/218/219 ARE blocking — see §Phase 1 Findings Blocker 3. And the `"use client"` claim is false; zero such directives exist in the package. Only the `exports` map fix is real.
- **Activation audits:**
  - `ls apps/web/src/design-system/components/` and diff the component list against `packages/design-system/src/components/` — enumerate every mirror pair and any web-only component that has no package equivalent (those stay, explicitly listed).
  - Read `packages/design-system/package.json` `exports` map and confirm it covers subpath imports apps/web needs (styles, individual components) or plan additions.
  - Check whether `"use client"` directives in the package are inert under Vite/React SPA (they should be — verify, don't assume).
  - Read `apps/storybook` config to see which tree its stories import components from today.
- **Consumption-strategy decision (Phase 1 output, record here):** ✅ **DECIDED 2026-07-21 — built package output via the `exports` map.** Full rationale, rejected alternative, and the cascade-order risk it carries: §Phase 1 Findings → Decision.
- **Risk:** CSS module class-name hashes and specificity order may shift when styles move from app-local modules to package modules. Chromatic is the net; do not trust "it builds".

## Model & Mode [REQUIRED]

`/model opus` + plan mode for Phase 1 (monorepo boundary + build-tooling ambiguity is exactly the architecture case), then `/model sonnet` for Phases 2–3 execution.

## Non-Goals

- ~~No visual or API changes to any DS component~~ — **amended 2026-07-22 (Blocker 4).** No **visual** changes: this epic moves where components live, not what they render, and any wanted *visual* change is still its own epic. But the blanket "no API changes" is retired, because it made Blocker 4 unresolvable inside the epic that owns it — the package `Button` has no `href` at all, and `apps/web` cannot consume a Button that cannot navigate. **Permitted API changes are narrowly scoped to closing consumption gaps**: adding a prop the web adapter already has and the package lacks. Adding a *new* capability neither copy has remains out of scope. Each permitted change is listed in the disposition table with the web-side prop it is matching. This is the same self-contradiction shape SUG-231 hit (its Scope said add `href`, its Non-Goals said don't) — resolved here rather than passed on again.
- No new components, tokens, or theme work.
- No change to the token pipeline (`tokens.json` → generated `tokens.css` ×2 stays as is; whether the web copy of generated tokens can also be retired is a follow-up question, out of scope here).
- apps/contentful-poc is untouched (already consumes the package).
- No Sanity schema or content changes beyond the single Content Write Gate caption/legend update in Phase 3.

## Related

- **Linear:** [SUG-224](https://linear.app/sugartown/issue/SUG-224)
- **Evidence base:** `docs/shipped/zArchive/2026/SUG-127-contentful-vercel-poc-platform-vendor-evaluation.md`
- **Diagram + red-pen table:** `docs/diagrams/redpen-platform-is-the-portfolio.md`
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
