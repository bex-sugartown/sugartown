---
**Epic:** SUG-172 — Netlify → Vercel migration — scope, recommendation analysis, and migration plan for sugartown.io
**Linear Issue:** [SUG-172](https://linear.app/sugartown/issue/SUG-172/netlify-vercel-migration-scope-recommendation-analysis-and-migration)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-172 — Netlify → Vercel migration — scope, recommendation analysis, and migration plan for sugartown.io

Scope and plan a potential migration of sugartown.io from Netlify to Vercel, delivering a structured recommendation with pros/cons, cost comparison, and tradeoffs — so the hosting decision is made with evidence, not assumption.

## Background

The original hosting decision (2026-03-15, `docs/reports/hosting-evaluation.md`) selected Netlify because it was already configured, the 296 exact-match `_redirects` rules and 3 query-parameter redirects were Netlify-native, and the free tier was sufficient for a portfolio site. Vercel was evaluated at the time but passed over — primarily because the query-parameter redirect syntax (`/?p=`, `/?cat=`, `/?tag=`) has no equivalent in Vercel's config without rewriting as serverless functions.

Since then, SUG-127 (Contentful + Vercel POC, shipped 2026-05-25) proved that Vercel works cleanly for a Next.js project deployed from this monorepo. That POC is live at `poc.sugartown.io`. The question this epic answers is whether the same conclusion holds for the main sugartown.io site — a Vite SPA with Netlify Forms, a Sanity webhook, `_redirects`-driven legacy redirects, and a separate Storybook deploy at `pinkmoon.sugartown.io`. The POC answered the infrastructure question for Next.js; it did not answer it for the existing Vite app.

Affected surfaces: `apps/web` (main Vite SPA), `apps/storybook` (pinkmoon.sugartown.io), Netlify Forms on `/contact`, the Sanity → Netlify build hook, and the 296-rule `_redirects` file.

## Objective

After this epic, a written recommendation exists that a technical decision-maker (or a future session of Claude Code) can act on directly: either a green-light for migration with a phase-by-phase plan, or a documented hold with specific technical blockers named. The recommendation covers the full migration surface — not just the web app, but the contact form, the redirect strategy, the Storybook deploy, the Sanity webhook, and the DNS cut-over sequence. No code is written in this epic unless a proof-of-concept is needed to resolve a technical unknown. Layers touched: **research + documentation only** (unless a local config POC is scoped in the recommendation itself).

## Scope

- [ ] **Redirect compatibility audit** — determine whether Vercel can serve the `_redirects` file format natively or requires a `vercel.json` rewrite. Specifically: can the 3 query-parameter rules (`/?p=`, `/?cat=`, `/?tag=`) be expressed in `vercel.json` `redirects[]` without a serverless function? If not, what is the minimal edge-function equivalent? — layer: research / tooling
- [ ] **Netlify Forms replacement analysis** — Vercel has no native form handler equivalent to Netlify Forms. Options: (a) migrate `/contact` to a Vercel serverless function that POSTs to Resend/Postmark/Formspree; (b) use a third-party form service (Basin, Formspark); (c) keep Netlify for forms only (split hosting). Assess effort and operational complexity of each. — layer: research
- [ ] **Sanity webhook → Vercel deploy hook** — Netlify build hooks accept a POST to a URL; Vercel has equivalent deploy hooks. Confirm the Sanity webhook can point at a Vercel deploy hook URL and that the same filter logic (content publish events only) applies. — layer: research
- [ ] **Storybook (pinkmoon.sugartown.io) migration** — Storybook is a separate Netlify site with its own `apps/storybook/netlify.toml`. Assess whether it should migrate to Vercel in the same epic or stay on Netlify. Netlify just had its base-directory bug fixed (2026-06-15) — if Storybook is stable there, migrating it adds scope for minimal gain. — layer: research
- [ ] **Cost comparison** — Netlify free tier vs Vercel Hobby/Pro: build minutes, bandwidth, serverless function invocations (if contact form moves to a function), team seat costs. Current Netlify usage pattern: ~1–3 builds/day (Sanity webhook + commits). — layer: research
- [ ] **Monorepo configuration** — `vercel.json` at repo root with `builds[]` or `projects[]` config. Confirm pnpm workspace install works with Vercel's build environment (Node 22, pnpm 9.1.0). The Contentful POC already proved this path — document whether the same `vercel.json` pattern applies to the Vite app. — layer: research / tooling
- [ ] **DNS cut-over sequence** — If migration is recommended, document the exact sequence: Vercel domain config → Pair DNS CNAME update → TLS provisioning → Netlify site decommission. Note that `poc.sugartown.io` is already on Vercel via Pair CNAME — the DNS pattern is proven. — layer: documentation
- [ ] **Written recommendation** — Produce `docs/reports/vercel-migration-recommendation.md` with: executive summary (migrate / hold / partial), full pros/cons table, cost comparison table, open technical questions (if any), and a phased migration plan (if recommending migration). — layer: documentation

## Phases

Single recommendation-first shape — no code until the recommendation document is written and reviewed.

1. **Research** — complete all audit bullets above; resolve any technical unknowns with a local config experiment if needed (no production changes).
2. **Recommendation doc** — write `docs/reports/vercel-migration-recommendation.md`; present to Bex for a go/no-go decision.
3. **Migration (conditional)** — only if the recommendation is approved. Phased: (a) web app + DNS, (b) contact form replacement, (c) Storybook migration (optional). Each migration phase is its own commit checkpoint.

If the recommendation is "hold", this epic closes after Phase 2 with the written rationale on record.

## Acceptance criteria

- [ ] Redirect compatibility is confirmed or refuted with a specific technical explanation — not "Vercel probably supports it"
- [ ] The query-parameter redirect question (`/?p=`, `/?cat=`, `/?tag=`) is answered definitively: native support, edge function required, or impossible without a full rewrite
- [ ] Netlify Forms replacement options are assessed with effort estimates (hours, not vague)
- [ ] `docs/reports/vercel-migration-recommendation.md` exists and is readable without repo context (self-contained)
- [ ] If migration is recommended: a phased plan exists with a named rollback point at each phase
- [ ] If hold is recommended: the specific blockers are named and linked to Vercel documentation or a reproducible test

## Human QA Walkthrough — example local pages

Not applicable — no shared CSS, token, or multi-page component changes in this epic. Research and documentation only; any config experiments are local and do not modify production routes or renders.

## Technical notes

- **Content Write Gate:** does not fire — no Sanity content writes.
- **Schema changes:** none.
- **Upstream dependencies:** none hard. SUG-127 shipped and its learnings (`docs/shipped/SUG-127-contentful-vercel-poc-platform-vendor-evaluation.md`) are the primary input for the monorepo config and DNS sections.
- **Prior art to read at activation:**
  - `docs/reports/hosting-evaluation.md` — original Netlify decision with the full Vercel assessment from March 2026. Read this first — it already contains a Vercel section with a detailed candidate assessment. The key open question it left was query-parameter redirects and Netlify Forms; those are the two blockers to resolve.
  - `docs/shipped/SUG-127-contentful-vercel-poc-platform-vendor-evaluation.md` — Vercel monorepo setup, pnpm config, and DNS pattern proven in the POC.
  - `apps/web/public/_redirects` — the actual redirect file; count the query-param rules before claiming they're a blocker.
  - `apps/storybook/netlify.toml` — Storybook deploy config, just fixed 2026-06-15; assess whether it should migrate.
  - `apps/web/src/pages/ContactPage.jsx` (or equivalent) — understand the current Netlify Forms integration before scoping a replacement.
- **Vercel redirect docs to check:** `vercel.json` `redirects[]` supports `has` (header/cookie/query matching). The `has: [{ type: "query", key: "p" }]` syntax may cover the `/?p=` case — verify before concluding a serverless function is required.
- **Model & Mode [REQUIRED]:** `/model opus` — this is a pure architecture and platform strategy epic. No code to execute; the work is analysis, tradeoff reasoning, and documentation. Opus produces the recommendation; no Sonnet execution phase.

## Model & Mode [REQUIRED]

`/model opus` — pure research and architecture analysis. The deliverable is a recommendation document, not code. Opus reasons through the tradeoff space; no execution phase follows until the recommendation is approved.

## Non-Goals

- **No production changes in this epic** — this is a scoping and recommendation epic. No DNS changes, no `vercel.json` commits to main, no Netlify site decommission until the recommendation is reviewed and approved.
- **No Storybook migration decision pre-empted** — the recommendation will include a Storybook section, but the decision of whether to migrate `pinkmoon.sugartown.io` is explicitly deferred until the main site recommendation is made.
- **No contact form rewrite** — the replacement is scoped and costed in the recommendation; the actual rewrite is a separate epic if migration is approved.
- **No monorepo restructuring** — this epic does not change workspace layout, pnpm config, or the DS package boundary.

## Related

- **Linear:** [SUG-172](https://linear.app/sugartown/issue/SUG-172/netlify-vercel-migration-scope-recommendation-analysis-and-migration)
- **Prior hosting evaluation:** `docs/reports/hosting-evaluation.md` (March 2026 Netlify decision + Vercel candidate section)
- **Contentful + Vercel POC:** `docs/shipped/SUG-127-contentful-vercel-poc-platform-vendor-evaluation.md`
- **Storybook Netlify fix:** `apps/storybook/netlify.toml` (base-directory bug fixed 2026-06-15)
- **Epic template:** `docs/epic-template.md` — complete Doc Type Coverage, Query Layer Checklist, and Files to Modify at activation time
