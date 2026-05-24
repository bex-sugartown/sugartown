# SUG-127 — Architecture Decision Record

**Epic:** Contentful + Vercel POC — CMS Agnosticism Proof + Platform Vendor Evaluation
**Last updated:** 2026-05-24
**Purpose:** Document each architectural decision made during planning, with honest tradeoffs — what it buys now, what it costs later, and when you'd flip the decision.

This is a living document. Decisions made during execution (not just planning) should be added here as they happen.

---

## Decision 1 — Monorepo-internal app vs standalone repo

**Chose:** Add `apps/contentful-poc` inside this monorepo, deployed from a subdirectory.

**Why:** The agnosticism proof is strongest when both apps share the same `packages/design-system` and token pipeline with zero ceremony. A standalone repo would require publishing the DS package to npm (or a local tarball install) before the real question — does the DS work without Sanity? — could even be tested. The workspace link gets to the question immediately.

**Benefit now:**
- No publish ceremony. DS changes are immediately available.
- Token pipeline (`pnpm tokens:build`) covers both apps in one command.
- Storybook baseline remains intact as the reference for agnosticism claims.
- Vercel's monorepo subdirectory deploy is itself a feature under evaluation — testing it this way is more honest than a synthetic setup.

**Cost/complexity later:**
- The POC never proves the DS works as a real external package. Workspace resolution masks potential issues: incorrect `exports` field paths, missing peer deps declared but not installed, CSS `@import` paths that assume monorepo structure.
- If the goal shifts to "publish this DS for a client to install", the monorepo approach won't have caught the gaps. A `npm pack` + install-from-tarball validation step would.
- The POC is permanently coupled to this repo's lifecycle. Archiving or deleting it requires cleanup of workspace and Turbo config.

**When you'd choose differently:** If the goal were "prove this DS is consumable by a team with no access to this repo", you'd publish to npm (or GitHub Packages) and install externally. The workspace approach is right for learning; wrong for distribution validation.

**Partial mitigation:** Run `npm pack` on `packages/design-system` during Phase 3 and install the tarball into a throwaway local directory. Five minutes of work that answers the external-install question without changing the architecture.

---

## Decision 2 — Next.js (App Router) vs staying with Vite/React

**Chose:** Next.js App Router for `apps/contentful-poc`.

**Why:** Vercel's platform features — ISR, `next/image`, edge middleware, server components, automatic code splitting — are built around Next.js. Evaluating Vercel without Next.js is like evaluating Sanity without Studio: you'd be missing the thing that makes the platform interesting. The vendor eval needs to be honest about what Vercel is actually for.

**Benefit now:**
- Access to the full Vercel feature set: ISR revalidation on Contentful publish, `next/image` CDN optimisation, edge middleware for redirects.
- Community examples, Contentful's own Next.js starter, and Vercel templates all target this combo — plenty of reference material.
- Server components mean Contentful API calls happen at build/request time, not in the browser. No CORS concerns, no exposed API keys in client bundle.

**Cost/complexity later:**
- Two frontend frameworks now live in this monorepo (Vite/React and Next.js/React). Turbo handles this cleanly, but the mental context-switch is real: different HMR behaviour, different build outputs, different error boundaries.
- The DS package's React components have no `"use client"` directive. In Next.js App Router, all components are server components by default. Any DS component that uses hooks, event handlers, or browser APIs will break silently until you add `"use client"` at the import boundary. This is a real finding for the agnosticism audit.
- If `apps/web` ever migrates to Next.js (unlikely, but possible), the POC's patterns become precedent. Good patterns in the POC become easy to reuse; bad ones become easy to copy.

**When you'd choose differently:** If the evaluation goal were "can Vercel deploy our existing Vite app", you'd keep Vite. That's a valid question but a different one — and the answer is yes, Vercel supports Vite natively. The more interesting question is whether Vercel's Next.js-native features justify the framework switch, which requires Next.js to test honestly.

**The apples-to-oranges risk:** Documenting this explicitly in the vendor eval matters. Netlify + Vite is the current stack. The POC compares Vercel + Next.js. Some DX wins in the eval will be Next.js wins, not Vercel wins. The eval needs to distinguish them.

---

## Decision 3 — `workspace:*` dependency vs npm publish for DS consumption

**Chose:** `"@sugartown/design-system": "workspace:*"` in `apps/contentful-poc/package.json`.

**Why:** Fastest path to testing the real question. Avoids version management, registry setup, and publish ceremony during a POC.

**Benefit now:**
- DS component changes (bug fixes, new props) are immediately available in the POC without a publish step.
- No version pinning means no "why is the POC on 1.0.0 but web is using 1.1.2" drift during active development.
- No registry account, no publish token, no CI publishing step to configure.

**Cost/complexity later:**
- Workspace resolution is pnpm's job, not Node's. Outside this monorepo, `@sugartown/design-system` doesn't exist unless published. The package exports (`dist/index.mjs`, `src/styles/*`) have never been tested via a real install path.
- The `exports` field in `package.json` maps `./styles/*` to `./src/styles/*`. This works via workspace because pnpm resolves to the source directory directly. Via npm install, it resolves to `dist/` — but styles aren't built into `dist/`. This is a likely breakage point that workspace masking hides.
- If a client ever asks "can we use your DS in our project", the honest answer requires having done a real external install to know.

**Mitigation (Phase 3 task):** Run `cd packages/design-system && npm pack`, then `cd /tmp && mkdir ds-test && cd ds-test && npm install /path/to/sugartown-design-system-1.0.0.tgz && node -e "require('@sugartown/design-system')"`. Surface any install-path failures as findings in the agnosticism audit.

---

## Decision 4 — Contentful CDA REST vs GraphQL

**Chose:** Contentful CDA REST API via the official `contentful` npm client for Phase 1.

**Why:** Lower setup cost, official SDK handles auth and error responses, extensive community examples, TypeScript types available via `contentful-typescript-codegen`. The `contentful` client mirrors the `@sanity/client` pattern (createClient → getEntries) closely enough for a fair comparison.

**Benefit now:**
- One dependency, official SDK, 10-minute time-to-first-response.
- REST responses are predictable and debuggable (just JSON in a browser or curl).
- No Apollo or fetch boilerplate required.

**Cost/complexity later:**
- CDA REST returns all fields for every entry — no field-level projection. Sanity + GROQ gives precise field selection at query time, which matters for performance and payload size. The vendor eval must document this difference explicitly: GROQ is a query language; CDA REST is a filtered collection endpoint.
- Over-fetching is real. An `article` entry with a large Rich Text body field will return all of it even if you only need `title` and `slug` for a list page. Contentful's GraphQL endpoint solves this (field-level selection), but adds complexity.
- The REST SDK is synchronous-ish in its API design. If the POC later needs streaming or React Suspense integration, the SDK isn't built for it.

**When you'd choose GraphQL:** If the POC's goal were a production-representative fetch pattern. GraphQL = more GROQ-like = more honest Sanity comparison. For a learning-first POC, REST is the right call. Note this tradeoff in the eval.

---

## Decision 5 — Mirror pattern for rich text adapters

**Chose:** Write `contentfulRichText.jsx` as an explicit mirror of `apps/web/src/lib/portableTextComponents.jsx` — same visual output, different input format, no shared abstraction between them.

**Why:** The point of this POC is to expose the difference, not abstract it away. A unified "render any rich text from any CMS" function would hide exactly the finding we're trying to surface: how different PortableText and Contentful Rich Text are at the format level, and how similar the rendering output can be made to look.

**Benefit now:**
- The two files can be diffed directly. Line-by-line, the diff shows: this is where the formats agree (both have headings, paragraphs, lists), this is where they diverge (PortableText marks as arrays on spans; Contentful marks as inline nodes in a tree).
- No abstraction to design, no shared type to define. Each adapter is self-contained.
- The agnosticism audit gets a concrete, reviewable artefact.

**Cost/complexity later:**
- Two files to maintain for the same visual output. If `CodeBlock` from the DS changes its API (e.g. a new required prop), both adapters need updating independently. This is the adapter tax: it's real, it's ongoing, and it's worth naming explicitly in the eval as a reason to prefer a single CMS if you can.
- If Sugartown ever adds a new custom mark type to Sanity (e.g. `citationRef`), the Contentful adapter won't have it. The adapters will diverge over time unless actively maintained.
- No type safety bridging the two. `portableTextComponents.jsx` handles `PortableTextComponents` types; `contentfulRichText.jsx` handles `@contentful/rich-text-react-renderer` types. A shared interface would require a custom abstraction layer.

**When you'd choose a unified abstraction:** In a production multi-CMS setup where both adapters need long-term maintenance. A `RichTextRenderer` component that accepts `{ format: 'portable-text' | 'contentful', content: any }` would centralize the maintenance cost. Not worth building for a POC.

---

## Decision 6 — Bex-led execution with Claude as guide

**Chose:** Bex runs every command. Claude explains each step before it's taken — what the command does, why this option over alternatives, what to watch for.

**Why:** The deliverable isn't just a live URL — it's genuine platform intuition. A job interview asks about your experience with Vercel, not Claude's. Being able to speak to the CLI flow, dashboard navigation, deploy hook setup, and env var management from first-hand memory is the point. Claude scaffolding it autonomously would produce a working URL and a gap in understanding.

**Benefit now:**
- Every decision made during setup is a conscious choice, not a default accepted blindly.
- Friction at setup surfaces assumptions worth examining. When a config step doesn't work as expected, that's a finding.
- The vendor eval will be grounded in specific, remembered experience — not reconstructed from logs.

**Cost/complexity later:**
- Slower. Some phases (Turbo config, Contentful type generation, Vercel CLI init) would be 5 minutes with autonomous scaffolding; they'll take 20–30 minutes with the explain-then-execute model.
- Risk of getting stuck. If a step genuinely doesn't work, the debugging loop involves Bex reading error messages and Claude interpreting them — which is the right process but slower than Claude just trying things.

**When you'd choose differently:** Any production epic where speed-to-working is the primary goal. This is a learning epic with a secondary deliverable (the eval). The tradeoff is explicit and worth writing in the vendor eval intro: "this evaluation was produced from direct experience, not from reading documentation."

---

## Decision 7 — Shared token pipeline

**Chose:** `apps/contentful-poc` consumes the same `tokens/source/tokens.json` and runs `pnpm tokens:build` from the monorepo root, getting the same `tokens.css` and `theme.pink-moon.css` as `apps/web`.

**Why:** Token sharing is the cheapest possible proof of visual consistency across data sources. If the POC looks like Sugartown without any extra CSS work, the token pipeline's portability case is made.

**Benefit now:**
- Pink Moon theme works in the Contentful app immediately — same colours, same type scale, same spacing.
- No token decisions to make during Phase 1. Full attention on data fetching and component wiring.
- Any token change in `tokens/source/tokens.json` is automatically reflected in both apps on next build.

**Cost/complexity later:**
- The POC inherits all 612 tokens, the vast majority of which it will never use. For a real client DS distribution, shipping 612 tokens when the client needs 40 is friction. The POC doesn't surface this problem — it masks it.
- Token naming is Sugartown-specific (`--st-*`). A client adopting this DS would need to either accept the `--st-` prefix or run a find-and-replace on the generated CSS. The POC doesn't test this path.
- If Sugartown adds a breaking token rename (e.g. a deprecated alias is removed), both apps break on the next `pnpm tokens:build`. The POC has no isolation from `apps/web` token churn.

**The finding this surfaces:** Token portability within a monorepo is nearly free. Token portability to an external consumer is a different (harder) problem. The vendor eval should distinguish these.

---

## Decision 8 — No Chromatic for the POC app

**Chose:** Skip Chromatic VRT for `apps/contentful-poc`. No Storybook stories added for the POC.

**Why:** The POC is a Next.js app, not a Storybook app. The existing DS stories in `apps/storybook` cover the DS primitives — the agnosticism baseline is already there. Adding Storybook to the Next.js app would be a distraction from the primary learning goal.

**Benefit now:**
- No story maintenance overhead during a time-boxed POC.
- Less config: no `apps/contentful-poc/.storybook/`, no Chromatic project ID to register.
- Faster Phase 1 iteration — visual issues are caught by looking at the live URL, not waiting for a Storybook build.

**Cost/complexity later:**
- No visual regression baseline for the POC. If a DS change breaks the Contentful app's rendering, there's no automated catch — only a manual URL check.
- If the POC ever graduates to a real project, the missing story coverage becomes a gap that needs backfilling.
- The vendor eval can't speak to Chromatic + Vercel vs Chromatic + Netlify integration differences, because Chromatic wasn't run.

**Acceptable because:** The POC is explicitly research, not production. The learning goal is met by the live URL and the agnosticism audit. If the eval recommends Vercel for a future project, that future project would set up Chromatic then.

---

## Decision 9 — Single content type first vs full atomic model from the start

**Chose:** Phase 1 uses a single content type (`article` only). The full four-bucket atomic model (singleton / document / taxonomy / sections) is Phase 2.

**Why:** Classic POC scope creep. Planning went from "a simple article list" to six content types — `siteSettings`, `article`, `tag`, `page`, `heroSection`, `richTextSection` — before a single line of code was written. The atomic model is the right *eventual* shape for the agnosticism proof, but building all six types before the pipeline is even standing means any problem during setup is entangled with content model complexity. Isolate variables: get one content type rendering through the DS and deployed to Vercel first. Then atomize.

**Benefit now:**
- Phase 1 is completable in one focused session. The Vercel deploy, DS wiring, Next.js App Router fetch pattern, and rich text adapter are all validated against a single simple type before adding relational complexity.
- Debugging is cleaner. If something breaks in Phase 1, it's a pipeline problem (monorepo config, CSS import, env vars) — not a content model problem.
- The scope creep is named and contained rather than silently absorbed. Naming it means it can be referenced in the vendor eval as a finding about how easy it is to over-engineer a CMS content model during planning.

**Cost/complexity later:**
- Phase 2 requires returning to Contentful and adding five more content types, plus updating the Next.js app with new queries, routes, and renders. This is incremental rework, not throw-away work — but it's a second pass.
- The Phase 1 `article` fetch query will need extending or replacing once `tag` references are added in Phase 2. Expect a query revision commit.
- If Phase 2 is never started (time pressure, interview done, job offer accepted), the POC only proves the article bucket — not the full atomic model. Document this gap explicitly if Phase 2 is deferred.

**When you'd choose the full model from the start:** If the goal were a production content migration with a deadline, building the complete model upfront avoids the second pass. For a learning POC where the process is the point, single-type-first is correct.

**The meta-finding:** The fact that planning naturally drifted toward a full production content model before any code existed is itself a finding worth noting in the vendor eval intro. It speaks to how compelling the "right way to model this" question is — and how POC discipline requires actively resisting it.

---

## Decision 10 — `"use client"` boundary at the page level, not in the DS package

**Chose:** Mark `"use client"` in the POC's own page and wrapper files. `packages/design-system` stays untouched. (Confirmed 2026-05-24 via Phase 1 smoke test; promoted from the tentative row in the open table.)

**Why:** The DS barrel (`dist/index.mjs`) bundles every component into one module with no `"use client"` directive. Interactive components (`Accordion`, `ScoreRing`) import `useState`/`useEffect`, so Next.js App Router refuses to import *anything* from the barrel into a Server Component, even a pure presentational component like `Button`. There are two ways to resolve it: add directives inside the DS package, or mark the consumer boundary. The epic non-goals forbid DS component changes ("use the existing ones as-is"), so the boundary lives in the POC.

**Benefit now:**
- DS package stays untouched, honouring the "no DS modification" acceptance criterion for the component layer.
- Confirmed working by the smoke test: a `"use client"` page importing `Button`, `Card`, `Chip` builds and prerenders cleanly.
- Keeps the agnosticism question clean: the DS components themselves are agnostic; only the *server/client boundary* is a Next.js-specific concern owned by the consuming app.

**Cost/complexity later:**
- Every POC route that touches DS components becomes a client component, forfeiting React Server Component benefits (zero-JS render, server-only data access in the same file) for that subtree. For a content site this is a real performance cost, not a formality.
- The boundary discipline is manual: nothing stops a future page from importing a DS component into a server file and hitting the same opaque error again.
- The finding points at a latent DS-package gap: a published component library aimed at App Router consumers *should* ship `"use client"` directives (or a split client entry). The POC documents the gap rather than fixing it.

**When you'd choose differently:** If the DS package were genuinely intended for external App Router consumers, fixing it at source (directives on interactive components, or a `./client` subpath export) is correct. See Decision 11's "first consumer" finding: this is the same root cause (the built artifact has never been consumed by a real app).

---

## Decision 11 — DS built artifact was not consumable out of the box (exports map gap + first real consumer)

**Chose:** Add a `"./styles.css": "./dist/index.css"` entry to the DS package `exports` map so the POC can import the bundled component CSS. Record it as a coupling-point finding, not a silent fix.

**Why:** `apps/web` does not consume the built DS package; it keeps its own `src/design-system` copy (the source carries TODOs reading "When @sugartown/design-system becomes a build-time dependency of apps/web…"). That makes `apps/contentful-poc` the **first app ever to consume the DS's built `dist` artifact**. The published `exports` map exposed only `.` (JS) and `./styles/*` (source tokens/theme), not the bundled component CSS at `./dist/index.css`. Importing it failed with `ERR_PACKAGE_PATH_NOT_EXPORTED`, so DS components rendered structurally correct but unstyled. This is the precise risk Decision 1 flagged under "Cost/complexity later" ("incorrect `exports` field paths… CSS paths that assume monorepo structure"). The agnosticism proof held at the component API layer but not at the package packaging layer until this one-line change.

**Benefit now:**
- Components render with their real styles in the POC; the styling pipeline is exercised end to end.
- The finding is concrete and quotable for the agnosticism audit: "the DS package as published was not consumable by a non-Sanity app without a packaging change."
- Establishes the built-artifact consumption path that `apps/web` will eventually need (per its own TODOs).

**Cost/complexity later:**
- `dist/index.css` ships **plain, unscoped** class names (`.button`, `.card`), not hashed CSS-module names. Global class collision with a consuming app's own CSS is a live risk; the POC must watch for it and the audit should flag it as a packaging weakness.
- The `exports` addition is a real edit to `packages/design-system`, in tension with the "no DS modification" AC. It is justified as a packaging fix (not a component change), but it means the strict reading of that AC did not survive contact with a real consumer.
- A fuller fix (CSS-module scoping in the tsup build, or a per-component CSS export) is deferred. The POC documents the gap rather than re-architecting DS packaging.

**When you'd choose differently:** If the DS were being prepared for external distribution, you would scope the component classes, ship a documented CSS entry point, and validate via `npm pack` (the mitigation named in Decision 1) before any consumer relied on it.

---

## Decision 12 — DS build migrated from tsup to a direct esbuild script to fix CSS Modules

**Chose:** Replace tsup with a small `build.mjs` esbuild script using `esbuild-css-modules-plugin` (Lightning CSS) as the sole CSS handler. (Confirmed working 2026-05-24: the POC renders styled DS components.)

**Why:** The published `dist` build never wired CSS Modules to the JS. Every `*.module.css` import compiled to an empty `{}`, so `styles.button` was `undefined` and components rendered with `className="undefined undefined"` (unstyled). `apps/web` and Storybook consume DS *source* through Vite (native CSS Modules), so the defect stayed invisible until `apps/contentful-poc` became the first app to consume the built `dist`. tsup's built-in CSS handling intercepts `*.module.css` before any esbuild loader override or plugin `onLoad` can run, and its plugin order is not reorderable, so the fix required dropping tsup's CSS pipeline entirely. Driving esbuild directly makes the CSS-Modules plugin the only CSS handler: scoped class names in `dist/index.css` plus a matching name map as the module default export. Verified by exact-match: `dist/index.mjs` and `dist/index.css` share the same scoped selector (`Button-module__button_-_VRTG__100`).

**Benefit now:**
- The DS `dist` is genuinely consumable by an external (non-Vite) app for the first time.
- Scoped class names replace the previous plain global names (`.button`), which also resolves the global-collision risk flagged in Decision 11.
- The esbuild build is fast and self-contained; `packages: 'external'` replicates tsup's dependency externalisation.

**Cost/complexity later:**
- The DS build is now a hand-rolled script rather than a standard tool. Maintainers must understand the esbuild API and the CSS-Modules plugin instead of tsup conventions.
- Type declarations (`dist/index.d.ts`) are no longer regenerated by the build (esbuild does not emit `.d.ts`), and DTS is separately blocked by the lucide-react / React 19 `@types` skew. The last-good `d.ts` is retained. A `tsc`-based dts step (or resolving the skew) is owed.
- New dependency surface added to the DS package (`esbuild`, `esbuild-css-modules-plugin`). `tsup` is now unused and removable.
- This modifies `packages/design-system` beyond the epic's "no DS modification" acceptance criterion. Justified: it is a build/packaging fix, not a component change, and it is the precondition for the agnosticism proof being demonstrable at all.

**When you'd choose differently:** If preserving a standard bundler were required, Vite library mode (native CSS Modules, already used by `apps/web`) is the alternative: heavier config, standard tool. For a time-boxed POC the minimal esbuild script is the lowest-risk unblock.

**The headline finding for the agnosticism audit:** The DS components are agnostic; the *packaging* was broken. The published build artifact silently dropped CSS Modules and had never been exercised by a real consumer. Document this in the Phase 3 coupling-point map as the primary structural result, distinct from any Sanity-coupling finding.

---

## Decisions still open

These will be made during Phase 1 execution. Record the decision and its rationale here when it's made.

| Decision point | Options | Status |
|----------------|---------|--------|
| Next.js `app/` fetch strategy — static (`generateStaticParams` + `fetch`) vs dynamic server component vs ISR revalidate | Static for list; ISR for detail (revalidate on Contentful publish webhook) | Open |
| Contentful REST vs GraphQL — confirm REST for Phase 1 | REST | Tentative |
| Turbo `pipeline` tasks for `contentful-poc` | Add `dev` and `build` to existing pipeline | Open |
| Vercel deploy: import from GitHub vs CLI (`vercel --cwd apps/contentful-poc`) | Dashboard import (evaluating the UI experience) | Open |
