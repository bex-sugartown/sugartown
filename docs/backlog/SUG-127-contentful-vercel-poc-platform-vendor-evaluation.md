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
| Studio / editing UI | Sanity Studio (custom, in this repo) | Contentful web UI (hosted, external) | ❌ Not portable by design |

**The rich text question** is the most important test. Sanity's PortableText is a block-array format (`_type: "block"`, `marks`, `markDefs`). Contentful's Rich Text is a tree format (`nodeType: "document"`, nodes, inlines). The rendering library APIs differ. But the DS components that consume the *output* of rendering (e.g. a `<p>` in a Card body) are agnostic — the question is whether the adapter that maps CMS format → rendered HTML can be written consistently for both. The `portableTextComponents.jsx` and `contentfulRichText.jsx` files are the comparison surface.

## Scope

- [ ] **Phase 1 — Monorepo setup:** Add `apps/contentful-poc` to this monorepo. Configure pnpm workspace and Turbo to include the new app. Scaffold Next.js App Router (TypeScript). Wire `@sugartown/design-system` and `@sugartown/design-system/styles/*` as workspace dependencies. Layer: tooling/infrastructure.
- [ ] **Phase 1 — Contentful space:** Create Contentful space. Define `article` content type: `title` (short text), `slug` (short text, unique), `body` (Rich Text), `publishDate` (date), `summary` (short text). Populate 3–5 seed articles. Layer: Contentful CMS.
- [ ] **Phase 1 — Basic render:** Article list (`/`) and article detail (`/articles/[slug]`) pages rendering Contentful data through DS Card and layout components. No styling polish required — proof of data flow is the goal. Layer: frontend.
- [ ] **Phase 2 — Vercel deploy:** Connect `apps/contentful-poc` to Vercel via the Vercel dashboard (monorepo subdirectory config). Set Contentful env vars. Confirm production URL and preview deploy URL both work. Layer: deployment.
- [ ] **Phase 2 — Rich text adapter:** Write `contentfulRichText.jsx` — maps Contentful Rich Text nodes to the same DS-backed components that `portableTextComponents.jsx` uses for Sanity. Document which renderers matched cleanly and which required compromise. Layer: frontend/adapter.
- [ ] **Phase 3 — Coupling point audit:** Fill in the Agnostic? column in the coupling point map above based on actual experience. Write findings prose (worked, needed adapter, compromised, blocked). Layer: documentation.
- [ ] **Phase 3 — Vendor evaluation doc:** Write `docs/briefs/vendor-eval-vercel-vs-netlify.md`. Layer: documentation.

## Phases

**Phase 1 — Monorepo scaffold + Contentful space**
`apps/contentful-poc` added to monorepo. pnpm + Turbo configured. Next.js App Router scaffolded. DS package wired. Contentful space created with `article` content type and seed data. Article list and detail pages render Contentful data through DS components. Ships as a local dev server (no Vercel deploy yet). Bex runs every command; Claude explains each step.

Merge checkpoint: commit `feat(contentful-poc): scaffold Next.js app + Contentful article renderer`. Mini-release.

**Phase 2 — Vercel deploy + rich text adapter**
`apps/contentful-poc` connected to Vercel with monorepo subdirectory config. Contentful env vars set in Vercel dashboard. Live production URL + preview deploy URL confirmed. `contentfulRichText.jsx` written and tested against seed article bodies. Ships as a live Vercel URL.

Merge checkpoint: commit `feat(contentful-poc): Vercel deploy + Contentful rich text adapter`. Mini-release.

**Phase 3 — Agnosticism audit + vendor evaluation**
Coupling point map filled with real findings. Vendor eval doc written. Both documents committed to `docs/briefs/`. This is the deliverable for the interview homework and the Sugartown architectural record.

Merge checkpoint: commit `docs(sug-127): agnosticism audit + Vercel vs Netlify vendor eval`. Mini-release.

## Acceptance criteria

- [ ] `apps/contentful-poc` exists in the monorepo and builds cleanly via `pnpm --filter contentful-poc build`
- [ ] The app imports from `@sugartown/design-system` without modification to that package
- [ ] The token pipeline (`pnpm tokens:build`) generates CSS consumed by the app without changes
- [ ] A live Vercel URL exists with at least one published Contentful article rendered through DS components
- [ ] Vercel preview deploys work (branch push produces a unique preview URL)
- [ ] `contentfulRichText.jsx` maps at least: paragraphs, headings (h2/h3), bold/italic marks, hyperlinks, and unordered lists
- [ ] The coupling point map is fully populated — every row has a finding, not a hypothesis
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
- **Epic template:** `docs/epic-template.md`
- **DS package:** `packages/design-system/` — the agnosticism proof surface
- **Comparison baseline:** `apps/web/src/lib/portableTextComponents.jsx` — PT renderer to mirror in Contentful adapter
- **Comparison baseline:** `apps/web/src/lib/sanity.js` — Sanity client to mirror in `contentful.js`
- **Reference:** Contentful Content Delivery API docs (CDA REST + GraphQL)
- **Reference:** Vercel monorepo docs (subdirectory deploy, Root Directory config)
