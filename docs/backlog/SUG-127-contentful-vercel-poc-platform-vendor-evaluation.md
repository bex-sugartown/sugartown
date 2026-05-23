---
**Epic:** SUG-127 — Contentful + Vercel POC — CMS Agnosticism Proof + Platform Vendor Evaluation
**Linear Issue:** [SUG-127](https://linear.app/sugartown/issue/SUG-127/contentful-vercel-poc-platform-vendor-evaluation)
**Status:** Backlog
**Priority:** 🔴 Now
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each
---

# SUG-127 — Contentful + Vercel POC — CMS Agnosticism Proof + Platform Vendor Evaluation

A hands-on proof-of-concept that adds a Contentful-backed Next.js app to this monorepo, deployed on Vercel — proving (or disproving) that `packages/design-system` and the Sugartown token pipeline are genuinely CMS-agnostic. Documents every coupling point: where agnosticism held, where an adapter was needed, and where a real compromise was required. Output: a live Vercel URL and a formal vendor evaluation (Vercel vs Netlify) for Sugartown Digital.

## Background

Sugartown Digital runs on Netlify + Sanity + React/Vite. A job interview homework brief requires building on Contentful + Vercel — a competing stack used at enterprise scale. Rather than treating this as a throwaway external project, this epic uses it to answer a real architectural question: is `packages/design-system` actually CMS-agnostic, or does Sanity coupling live closer to the surface than the package.json description implies?

The answer lives in three layers: (1) the DS primitives themselves (already have zero Sanity imports — the baseline), (2) the rich text rendering layer (the most interesting test — PortableText vs Contentful Rich Text), and (3) the image handling and routing layers (smaller but concrete). Every coupling point found is documented as a finding, not a failure. The vendor eval adds Vercel vs Netlify DX, pricing, and monorepo support — derived from direct experience building this, not from reading docs.

Bex executes everything hands-on. Claude explains each step before it's taken: what the command does, why it's the right choice, what alternatives exist, what to watch for. No autonomous scaffolding.

## Objective

After this epic, the monorepo contains `apps/contentful-poc` — a Next.js App Router app that shares `packages/design-system` and the token pipeline with `apps/web`, but fetches from Contentful instead of Sanity and deploys to Vercel instead of Netlify. A documented coupling-point audit proves what is and isn't CMS-agnostic. A written vendor evaluation in `docs/briefs/vendor-eval-vercel-vs-netlify.md` records the Vercel vs Netlify comparison with a concrete Sugartown-specific recommendation.

## Architecture

```
sugartown/                          ← this repo
├── packages/
│   └── design-system/              ← shared, CMS-agnostic ✅ (proven by this epic)
├── tokens/
│   └── source/tokens.json          ← shared token pipeline ✅ (proven by this epic)
├── apps/
│   ├── web/                        ← existing: Sanity adapter layer (Netlify)
│   │   └── src/lib/
│   │       ├── sanity.js           ← coupling point: Sanity client
│   │       ├── queries.js          ← coupling point: GROQ
│   │       └── portableTextComponents.jsx  ← coupling point: PT renderer
│   ├── studio/                     ← existing: untouched
│   ├── storybook/                  ← existing: untouched (DS stories ARE the agnosticism baseline)
│   └── contentful-poc/             ← NEW: Contentful adapter layer (Vercel)
│       └── src/lib/
│           ├── contentful.js       ← mirrors sanity.js (Contentful CDA client)
│           ├── queries.js          ← mirrors queries.js (CDA REST or GraphQL)
│           └── contentfulRichText.jsx  ← mirrors portableTextComponents.jsx
└── docs/
    └── briefs/
        └── vendor-eval-vercel-vs-netlify.md  ← Phase 3 output
```

**Why monorepo-internal (not a standalone repo):** The strongest agnosticism proof is same repo, same token pipeline, same DS package, different data adapter. If the DS works in `apps/contentful-poc` without modification, agnosticism is proven at the package boundary. A standalone repo would require either npm publish or a local path reference — both add noise to the proof. Vercel's monorepo subdirectory deploy is also a feature under evaluation: it's a first-class Vercel capability worth testing directly.

## Coupling point map (the agnosticism audit)

This table is the primary output of Phase 2. Pre-populated with hypotheses; findings filled in during execution.

| Layer | Sanity (`apps/web`) | Contentful (`apps/contentful-poc`) | Agnostic? |
|-------|--------------------|------------------------------------|-----------|
| DS primitives | `@sugartown/design-system` | same | Hypothesis: ✅ Fully |
| Token system (`--st-*`) | shared via workspace | same | Hypothesis: ✅ Fully |
| Client setup | `createClient()` from `@sanity/client` | `createClient()` from `contentful` | ⚡ Adapter needed |
| Query language | GROQ (`*[_type == "article"]`) | CDA REST / GraphQL (`getEntries({content_type})`) | ⚡ Adapter needed |
| Rich text renderer | `@portabletext/react` + custom components | `@contentful/rich-text-react-renderer` + custom components | ⚡ Adapter needed — most interesting test |
| Image URLs | `urlFor()` from `@sanity/image-url` | Plain HTTPS CDN URL (simpler) | ⚡ Minor — Contentful is easier |
| Slug routing | `slug.current` (nested object) | `fields.slug` (flat string) | ⚡ Minor shape diff |
| Draft/preview | `perspective: 'previewDrafts'` | Preview API + separate access token | ⚡ Similar pattern, different config |
| Content webhooks | Sanity webhook → Netlify build hook | Contentful webhook → Vercel deploy hook | ⚡ Similar pattern |
| Singleton enforcement | `__experimental_actions: ['update']` — platform prevents new docs | Convention only — create one entry, never create another | ⚡ Sanity stronger here |
| Section array model | Inline typed objects (`_type` discriminator, live inside the document) | References array (linked entries, `sys.contentType.sys.id` discriminator, resolved via `include` depth) | ⚡ Different model — inline vs linked |
| Section fetch cost | One GROQ query, sections inline | `getEntries({ include: 2 })` — one request but blunt depth; over-fetches linked data | ⚡ Sanity more precise |
| Studio / editing UI | Sanity Studio (custom, in this repo) | Contentful web UI (hosted, external) | ❌ Not portable by design |

**The rich text question** is the most important test. Sanity's PortableText is a block-array format (`_type: "block"`, `marks`, `markDefs`). Contentful's Rich Text is a tree format (`nodeType: "document"`, nodes, inlines). The rendering library APIs differ. But the DS components that consume the *output* of rendering (e.g. a `<p>` in a Card body) are agnostic — the question is whether the adapter that maps CMS format → rendered HTML can be written consistently for both. The `portableTextComponents.jsx` and `contentfulRichText.jsx` files are the comparison surface.

## Content model — atomic architecture map

The Contentful space must implement the same four-bucket atomic model that governs the Sugartown content architecture — one real example of each bucket. This is the philosophical proof: if the same model can be expressed in Contentful as in Sanity, the CMS is genuinely interchangeable at the schema layer (even if the tooling to build it differs). The mapping is documented in the Platform section of the live site; the POC must be consistent with it.

| Bucket | Sugartown / Sanity | Contentful POC | Key difference |
|--------|-------------------|----------------|----------------|
| **Singleton** | `siteSettings` — `__experimental_actions: ['update']` prevents new docs; one entry, always | `siteSettings` content type — singleton enforced by convention (create once, don't repeat); no platform-level lock | Sanity has first-class singleton enforcement; Contentful relies on discipline |
| **Document** | `article` — `title`, `slug.current`, `body` (PortableText), `publishDate`, `tags[]->`, `summary` | `article` content type — `title` (Short text), `slug` (Short text, unique), `body` (Rich Text), `publishDate` (Date), `tags` (References, many), `summary` (Short text) | Slug shape: Sanity nests in `{ slug: { current: '...' } }`; Contentful is flat `fields.slug` |
| **Taxonomy** | `tag` — `name`, `slug`, referenced by `article.tags[]->` | `tag` content type — `name` (Short text), `slug` (Short text); referenced from `article.tags` as a References array | Near-identical model; reference resolution syntax differs (Sanity: `->`, Contentful: linked entry in `include` depth) |
| **Sections** | `page.sections[]` — inline array of typed objects (`heroSection`, `textSection`, etc.) with `_type` as discriminator; objects live inside the document | `page.sections` — References array linking to separate `heroSection` and `richTextSection` entries; content type of the linked entry is the discriminator | **Most significant structural difference** — Sanity sections are inline (embedded, non-reusable); Contentful sections are linked entries (reusable across pages, independently versioned, but N+1 fetch without `include` depth) |

### Contentful content types to create

**`siteSettings`** (singleton)
- `siteTitle` Short text
- `metaDescription` Short text
- `navItems` References, many → `navItem` content type (or inline JSON — decide at activation)

**`article`** (document)
- `title` Short text, required
- `slug` Short text, unique, required
- `body` Rich Text
- `publishDate` Date
- `summary` Short text
- `tags` References, many → `tag`

**`tag`** (taxonomy)
- `name` Short text, required
- `slug` Short text, unique, required

**`page`** (document with section builder)
- `title` Short text, required
- `slug` Short text, unique, required
- `sections` References, many → `heroSection` | `richTextSection`

**`heroSection`** (section)
- `headline` Short text
- `subheadline` Short text
- `ctaLabel` Short text
- `ctaUrl` Short text

**`richTextSection`** (section)
- `body` Rich Text

Seed content: 1 `siteSettings` entry, 3 `article` entries with 2 `tag` references each, 1 `page` with a `heroSection` + `richTextSection` chain. This is the minimum to exercise all four buckets and generate real findings across the full coupling point map.

### Why this matters for the agnosticism proof

The sections bucket is where the model philosophies diverge most visibly. Sanity's inline array of typed objects means sections are owned by the document — fast to fetch (one query), but sections can't be shared across pages. Contentful's linked entries mean sections live in the content graph — flexible and reusable, but the CDA fetch requires `include: 2` (depth) to resolve linked entries, and the renderer must handle the `sys.contentType.sys.id` discriminator instead of `_type`. Both approaches are valid; neither is wrong. Documenting what changes in the adapter when you switch from one to the other is the finding.

## Scope

> **Scope discipline note:** Planning naturally drifted toward a full six-type atomic model before any code existed. That model is documented in the content model map above and is the right *eventual* shape — but it is Phase 2, not Phase 1. Phase 1 proves the pipeline with a single content type. See ADR Decision 9 in `docs/briefs/SUG-127-architecture-decisions.md`.

- [ ] **Phase 1 — Monorepo setup:** Add `apps/contentful-poc` to this monorepo. Configure pnpm workspace and Turbo. Scaffold Next.js App Router (TypeScript). Wire `@sugartown/design-system` as a workspace dependency. Layer: tooling/infrastructure.
- [ ] **Phase 1 — Contentful space (single type):** Create Contentful space. Define one content type: `article` (`title`, `slug`, `body` Rich Text, `publishDate`, `summary`). Populate 3 seed articles. Layer: Contentful CMS.
- [ ] **Phase 1 — Render + deploy:** Article list (`/`) and article detail (`/articles/[slug]`) rendering through DS components. Connect to Vercel (monorepo subdirectory config). Confirm live URL and preview deploy. Write `contentfulRichText.jsx` rich text adapter. Layer: frontend + deployment.
- [ ] **Phase 2 — Atomize:** Extend the Contentful space with the remaining five content types per the atomic architecture map (`tag`, `siteSettings`, `page`, `heroSection`, `richTextSection`). Add routes and renders for taxonomy (`/tags/[slug]`), page-with-sections (`/pages/[slug]`), site settings wired into layout. Update queries. Layer: Contentful CMS + frontend.
- [ ] **Phase 3 — Coupling point audit + vendor evaluation:** Fill in the coupling point map. Write findings prose. Write `docs/briefs/vendor-eval-vercel-vs-netlify.md`. Layer: documentation.

## Phases

**Phase 1 — Pipeline proof (single content type)**
Monorepo configured, Next.js scaffolded, DS wired, Contentful space with `article` type only, article list + detail rendering through DS, Vercel deploy live, rich text adapter written. One content type, full pipeline end to end. Bex runs every command; Claude explains each step.

Merge checkpoint: `feat(contentful-poc): scaffold + article pipeline + Vercel deploy`. Mini-release.

**Phase 2 — Atomic model (remaining buckets)**
Extend Contentful space to full four-bucket model: `tag` (taxonomy), `siteSettings` (singleton), `page` + `heroSection` + `richTextSection` (sections). Add routes and renders. Update queries to handle references and `include` depth. Singleton, taxonomy, and section patterns all exercised.

Merge checkpoint: `feat(contentful-poc): atomic model — singleton, taxonomy, section builder`. Mini-release.

**Phase 3 — Agnosticism audit + vendor evaluation**
Coupling point map fully populated with real findings. Vendor eval written. Both committed to `docs/briefs/`. Deliverable for interview homework and Sugartown architectural record.

Merge checkpoint: `docs(sug-127): agnosticism audit + Vercel vs Netlify vendor eval`. Mini-release.

## Acceptance criteria

- [ ] `apps/contentful-poc` exists in the monorepo and builds cleanly via `pnpm --filter contentful-poc build`
- [ ] The app imports from `@sugartown/design-system` without modification to that package
- [ ] The token pipeline (`pnpm tokens:build`) generates CSS consumed by the app without changes
**Phase 1 done when:**
- [ ] `apps/contentful-poc` builds cleanly via `pnpm --filter contentful-poc build`
- [ ] DS package imports and token CSS work without modifying `packages/design-system`
- [ ] Live Vercel URL exists with articles rendered through DS components
- [ ] Vercel preview deploy URL confirmed working on a branch push
- [ ] `contentfulRichText.jsx` maps: paragraphs, headings (h2/h3), bold/italic, hyperlinks, unordered lists

**Phase 2 done when:**
- [ ] All four buckets live in Contentful: `siteSettings`, `article`, `tag`, `page` + section types
- [ ] All four buckets render in the app — article, tag page, page-with-sections, site title from settings
- [ ] Section renderer uses `sys.contentType.sys.id` as discriminator — diff from Sanity's `_type` documented

**Phase 3 done when:**
- [ ] Coupling point map fully populated — every row has a finding, not a hypothesis
- [ ] `docs/briefs/vendor-eval-vercel-vs-netlify.md` exists with all sections populated
- [ ] Vendor eval includes concrete cost comparison and an explicit Netlify / Vercel / hybrid recommendation
- [ ] `docs/briefs/vendor-eval-vercel-vs-netlify.md` exists with all evaluation sections populated
- [ ] Vendor eval includes concrete cost comparison (free tier limits, Sugartown's actual build volume)
- [ ] Vendor eval ends with an explicit recommendation and rationale

## Technical notes

**Model & Mode:** `/model opusplan` — Phase 1 architecture (monorepo config, Next.js App Router, Contentful CDA fetch pattern) benefits from Opus planning. Phases 2–3 are execution + documentation; Sonnet handles those.

**Bex-led execution model.** Claude's role is to explain each step before Bex runs it — what the command does, why this choice over alternatives, what to watch for. Claude does not run terminal commands, scaffold files autonomously, or make API calls to Contentful or Vercel. Every action is Bex's to take.

**Monorepo config changes required:**
- `pnpm-workspace.yaml` — add `apps/contentful-poc`
- `turbo.json` — confirm `build`/`dev` tasks extend correctly to the new app
- `apps/contentful-poc/package.json` — name `@sugartown/contentful-poc`, deps include `@sugartown/design-system: workspace:*`

**Next.js + DS CSS:** The DS exports CSS via `@sugartown/design-system/styles/*`. Next.js App Router requires CSS imports in a layout file (`app/layout.tsx`). Import `tokens.css` and `theme.pink-moon.css` from the DS package's `src/styles/` path — the same files `apps/web` uses. This is the token pipeline portability proof.

**Contentful API keys are secrets.** Never commit `.env.local`. Vercel env vars are set in the dashboard — Claude will explain the UI steps. The `.gitignore` in `apps/contentful-poc` must include `.env.local` explicitly.

**Vercel monorepo subdirectory deploy:** Vercel detects monorepos automatically via `turbo.json` presence. In the Vercel dashboard: Root Directory = `apps/contentful-poc`, Framework Preset = Next.js. This is a key DX point to evaluate — Netlify requires `netlify.toml` with explicit `base` config for the same behaviour.

**Contentful modular content — `include` depth and the N+1 problem.** When fetching a `page` entry that has a `sections` references array, the CDA by default returns only the reference IDs — not the linked entries themselves. To resolve linked entries in one request, pass `include: 2` to `getEntries()`. Depth 1 resolves first-level links (sections); depth 2 resolves links within those links (e.g. a section referencing a tag). The equivalent in Sanity is GROQ's `->` dereference — which is explicit per-field, not a blanket depth param. Document this difference in the vendor eval: GROQ's explicit dereference is more precise (you fetch exactly what you project); Contentful's `include` depth is coarser (you get all linked entries up to N levels, whether you use them or not).

**Section type discriminator difference.** Sanity's section renderer switches on `section._type`. Contentful's equivalent is `entry.sys.contentType.sys.id`. The switch logic is structurally identical; the path to the discriminator differs. The `contentfulRichText.jsx` equivalent for sections will be a `renderSection(entry)` function that reads `entry.sys.contentType.sys.id` and dispatches to the correct DS component. Write this function alongside `contentfulRichText.jsx` in Phase 2 and note the path difference explicitly in the coupling point map.

**Reference the Platform content model documentation.** The live site's Platform section (`/platform`) documents the Sugartown atomic model (singleton / document / taxonomy / section). The Contentful content types defined in Phase 1 must be consistent with that documentation — same bucket names, same conceptual grouping. If the Platform doc uses different terminology, note the discrepancy as a finding.

**Existing Storybook is the agnosticism baseline.** The DS component stories in `apps/storybook` already show components rendering with plain prop data — no Sanity types. Those stories are the proof that the DS primitives accept any data source. No new Storybook work is needed for this epic; the existing stories can be referenced in the agnosticism audit doc.

**Vercel vs Netlify evaluation axes:**
- DX: CLI install (`vercel` vs `netlify`), `vercel dev` vs `netlify dev`, dashboard layout, log streaming
- Monorepo support: subdirectory deploy config (Vercel auto-detect vs Netlify `netlify.toml` `base`)
- Preview URLs: branch/PR previews, URL structure, password protection, deploy comments on PRs
- Build pipeline: build command config, env var management, build caching (Vercel Remote Cache vs Netlify build cache)
- Pricing: Hobby vs Pro, bandwidth limits, serverless function invocations, team seats, build minutes
- Edge/CDN: edge middleware, ISR revalidation, `next/image` optimization, regional edge functions
- CMS integration: Contentful webhook → Vercel deploy hook vs Sanity webhook → Netlify build hook
- Fit for Sugartown: pnpm workspaces + Turborepo support, current build volume, cost at scale

**ADR update rule (hard stop):** Every time an architectural decision is made during execution — including decisions currently listed as "open" in the table at the bottom of `docs/briefs/SUG-127-architecture-decisions.md` — that document must be updated before the session ends. Move the decision from the open table into a numbered Decision section (following the existing format: Chose / Why / Benefit now / Cost later / When you'd choose differently). Do not carry open decisions across session boundaries. A decision made but not documented is equivalent to undocumented code: it will be relitigated next time.

**Activation audit:** Read `pnpm-workspace.yaml` and `turbo.json` at session start to confirm the current monorepo structure before adding the new app.

## Model & Mode [REQUIRED]

`/model opusplan` — Phase 1 involves architectural decisions (monorepo config, Next.js App Router, Contentful CDA fetch pattern, token CSS import in Next.js). Phases 2–3 are execution + documentation.

## Non-Goals

- No migration of the live Sugartown site to Vercel
- No Sanity changes — the POC uses Contentful exclusively; `apps/web` is untouched
- No Netlify configuration changes — the existing Netlify deploy is untouched
- No new DS components — the point is to use the existing ones as-is
- No new Storybook stories — existing DS stories serve as the agnosticism baseline
- No Chromatic run for the POC app — it's Next.js, not Storybook

## Related

- **Linear:** [SUG-127](https://linear.app/sugartown/issue/SUG-127/contentful-vercel-poc-platform-vendor-evaluation)
- **Architecture decisions:** `docs/briefs/SUG-127-architecture-decisions.md` — tradeoffs for every planning decision (benefit now vs complexity later)
- **Epic template:** `docs/epic-template.md`
- **DS package:** `packages/design-system/` — the agnosticism proof surface
- **Comparison baseline:** `apps/web/src/lib/portableTextComponents.jsx` — PT renderer to mirror in Contentful adapter
- **Comparison baseline:** `apps/web/src/lib/sanity.js` — Sanity client to mirror in `contentful.js`
- **Reference:** Contentful Content Delivery API docs (CDA REST + GraphQL)
- **Reference:** Vercel monorepo docs (subdirectory deploy, Root Directory config)
