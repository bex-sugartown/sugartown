# Release Notes — v0.25.0

**Date:** 2026-05-25
**Scope:** apps/contentful-poc (new), packages/design-system

---

## What this release is

A three-phase proof-of-concept establishing Contentful + Vercel as a viable second platform path alongside the existing Sanity + Netlify stack. The PoC proves that the Sugartown design system is CMS-agnostic at the token and component level — and that the content model strategy is portable too. Structural differences between Contentful and Sanity (linked entry depth, field naming, taxonomy approach) are documented across 15 ADRs, but the underlying architecture follows the same atomic section builder pattern used in the main app. The hybrid vendor model is confirmed: Netlify for Vite/Sanity, Vercel for Next.js/Contentful.

---

## What changed

### Contentful + Next.js app on Vercel (SUG-127)

A new `apps/contentful-poc` Next.js application was built and deployed to Vercel. It renders Contentful content through the same DS tokens as the main Vite app — Table, Code, and blockquote nodes all resolve through `--st-*` variables rather than Contentful-native styles.

The content model follows an atomic section builder pattern: pages are composed from typed section entries (hero, RTE, callout), and articles link to sections rather than carrying a monolithic `body` rich text field. The `body` field has been retired in the Contentful content model.

### DS agnosticism audit

15 Architecture Decision Records document every coupling point found during the build: where Contentful's data shapes diverged from Sanity's, where the DS held, and where integration work was required. The conclusion: the DS is CMS-agnostic at the token and component level. The hybrid vendor model is confirmed — Netlify for the Vite/Sanity web app, Vercel for any Next.js/Contentful surfaces.

### Articles archive with CMS-controlled ordering

The `/articles` route uses a new `articleListSection` Contentful content type. Editors drag article references into their preferred order; the page renders that sequence directly. When no `articleListSection` is present, the route falls back to `getAllArticles()` sorted by date.

### Custom domains (SUG-128)

`poc.sugartown.io` (production channel) and `poc-preview.sugartown.io` (preview/main channel) are live on Vercel. DNS CNAME records are set via Pair.

### Design system: type declaration fix

`packages/design-system` now emits `.d.ts` type declaration files on build. The `@types/react` peer dependency is aligned to v19.

---

## Not in this release

- Contentful PoC is a standalone evaluation app — it does not replace or integrate with the production Sanity + Netlify web app
- `articleListSection` content type must be created in the Contentful dashboard manually; no migration script provided
- Chromatic VRT was not run against contentful-poc (no Storybook stories in that app)

---

## Validator state at release

```
pnpm validate:tokens        ✅ 0 errors — 612 tokens, all references resolve
pnpm validate:tokens:strict ✅ 0 hardcoded color violations
pnpm lint                   ✅ 0 ESLint errors
```
