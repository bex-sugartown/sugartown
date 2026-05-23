---
**Epic:** SUG-127 — Contentful + Vercel POC — Platform Vendor Evaluation
**Linear Issue:** [SUG-127](https://linear.app/sugartown/issue/SUG-127/contentful-vercel-poc-platform-vendor-evaluation)
**Status:** Backlog
**Priority:** 🔴 Now
**Merge strategy:** (a) Merge-as-you-go — one commit per phase, one mini-release at end of each
---

# SUG-127 — Contentful + Vercel POC — Platform Vendor Evaluation

A hands-on proof-of-concept deploying a small Contentful-backed site on Vercel, using a Sugartown-relevant use case — with Bex driving the process directly (not Claude) so the experience builds genuine platform intuition. Output: a formal Vercel vs Netlify vendor evaluation document.

## Background

Sugartown Digital currently runs on Netlify + Sanity. A job interview homework brief requires building something on Contentful + Vercel — a stack that competes with the current setup and is widely used at enterprise scale. This epic serves two purposes: completing the homework deliverable with real hands-on experience, and producing a vendor evaluation that could inform a future migration decision for Sugartown. Claude acts as a guide and annotator throughout (explaining what to do and why), but Bex executes the commands, writes the code, and makes the configuration decisions directly.

## Objective

After this epic, two things exist: (1) a live Vercel deployment backed by Contentful containing a small but realistic Sugartown-relevant site (articles or case study teasers), and (2) a written vendor evaluation document comparing Vercel vs Netlify across DX, pricing, performance, build pipeline, and fit for Sugartown's content architecture. The POC touches Contentful (content model + API), Next.js or plain React (frontend), and Vercel (deployment, preview URLs, edge config). It does not touch the Sugartown main repo, Sanity, or the existing Netlify setup — it is a standalone external project.

## Scope

- [ ] **Phase 1 — Contentful setup:** Create a Contentful space with a simple content model mirroring a Sugartown doc type (e.g. `article` with title, slug, body, publishDate). Populate 3–5 sample entries. Layer: Contentful (external CMS).
- [ ] **Phase 1 — Next.js scaffold:** Scaffold a minimal Next.js app (App Router) that fetches from Contentful's Content Delivery API and renders an article list + article detail page. Layer: frontend (external repo).
- [ ] **Phase 1 — Vercel deploy:** Connect the Next.js repo to Vercel. Configure environment variables for Contentful API keys. Confirm preview URL and production URL work. Layer: deployment/infrastructure.
- [ ] **Phase 2 — Vendor evaluation doc:** Write `docs/briefs/vendor-eval-vercel-vs-netlify.md` covering: DX (CLI, dashboard, preview URLs), pricing model, build performance, edge/CDN capabilities, ISR vs SSG vs SSR tradeoffs, CMS integration patterns, and fit-for-Sugartown verdict. Layer: documentation.

## Phases

**Phase 1 — POC build (external repo + Vercel deploy)**
Contentful space + content model, Next.js scaffold, Vercel deploy. Ships as a live URL. Bex does the hands-on work; Claude provides step-by-step guidance with context.

**Phase 2 — Vendor evaluation**
Written evaluation doc based on direct experience from Phase 1. Committed to `docs/briefs/` in this repo.

## Acceptance criteria

- [ ] A live Vercel URL exists with at least one published article rendered from Contentful data
- [ ] Preview deployments work (Vercel's PR preview URL pattern is confirmed functioning)
- [ ] Contentful content model has at least `title`, `slug`, `body` (Rich Text), and `publishDate` fields — structurally comparable to the Sugartown `article` schema
- [ ] `docs/briefs/vendor-eval-vercel-vs-netlify.md` exists with all evaluation sections populated (no TODO stubs)
- [ ] Vendor eval includes a concrete cost comparison (free tier limits, team plan pricing, estimated monthly at Sugartown's current build volume)
- [ ] Vendor eval ends with an explicit "stay on Netlify / switch to Vercel / hybrid" recommendation with rationale

## Technical notes

**Model & Mode:** `/model opusplan` — Phase 1 requires architecture guidance (Next.js App Router + Contentful fetch pattern + Vercel config); Phase 2 is pure writing.

**This is a standalone external project.** Do not create files in `apps/web/` or `apps/studio/`. The Next.js repo lives outside this monorepo. The only file committed here is the Phase 2 vendor eval doc.

**Bex-led execution model.** Claude's role in Phase 1 is to explain each step before Bex runs it — what the command does, why it's the right choice at this point, what the alternatives are, and what to watch for. Claude does not run terminal commands, scaffold files autonomously, or make API calls to Contentful or Vercel. Every action is Bex's to take; Claude provides context.

**Contentful API keys are secrets.** Do not commit `.env.local` or any file containing `CONTENTFUL_ACCESS_TOKEN` or `CONTENTFUL_SPACE_ID`. Vercel environment variables are configured through the Vercel dashboard — Claude will explain the UI steps, not inject them.

**Suggested use case rationale.** A simple article list + detail (title, slug, body, publishDate) maps directly to Sugartown's `article` doc type, making the Contentful-vs-Sanity comparison concrete and honest. It is also a standard Contentful tutorial surface — community examples, Contentful's own Next.js starter, and Vercel's templates all cover this pattern, so Bex has reference material beyond Claude's guidance.

**Vercel vs Netlify evaluation axes:**
- DX: CLI install, `vercel dev` vs `netlify dev`, dashboard layout, log streaming
- Preview URLs: automatic deploy previews per branch/PR, URL structure, password protection
- Build pipeline: build command config, environment variable management, build caching
- Pricing: Hobby (free) vs Pro, bandwidth limits, serverless function invocation limits, team seats
- Edge/CDN: edge middleware, ISR revalidation, image optimization (`next/image` integration)
- CMS integration: Contentful webhooks → Vercel deploy hooks vs Netlify build hooks
- Fit for Sugartown: current build volume, Sanity webhook pattern, monorepo support (pnpm workspaces + Turborepo)

**Activation audit:** Before Phase 2 writing, re-read `docs/briefs/design-system-prd.md` and the IA brief (`docs/briefs/ia-brief.md`) to ensure the vendor eval references Sugartown's actual architecture correctly — not a generic description.

## Model & Mode [REQUIRED]

`/model opusplan` — Phase 1 involves architectural decisions (Next.js App Router fetch patterns, Vercel project config, Contentful API shape). Opus plans the approach with full context; Sonnet executes the writing and formatting. Phase 2 is documentation — Sonnet can handle the prose pass.

## Non-Goals

- No migration of the live Sugartown site to Vercel — this is research only
- No Sanity changes — the POC uses Contentful exclusively
- No Netlify configuration changes — the existing Netlify deploy is untouched
- No new DS components or schema changes in this repo
- No Chromatic or Storybook work — the POC is a standalone Next.js app, not a Storybook project

## Related

- **Linear:** [SUG-127](https://linear.app/sugartown/issue/SUG-127/contentful-vercel-poc-platform-vendor-evaluation)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, Schema Enum Audit, and Files to Modify at activation time
- **Reference:** Contentful Next.js starter — search "contentful next.js app router" in Contentful docs
- **Reference:** Vercel's Contentful template — available via `vercel.com/templates`
