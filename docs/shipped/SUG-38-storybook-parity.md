# SUG-38 — Storybook Parity & Deploy to pinkmoon.sugartown.io

**Linear Issue:** [SUG-38](https://linear.app/sugartown/issue/SUG-38/storybook-parity-and-deploy-to-pinkmoonsugartownio)
**Status:** In Progress
**Branch:** `bex/sug-38-storybook-parity-deploy-to-pinkmoonsugartownio`

---

## Goal

Bring Storybook into parity with the web and studio apps — upgrade its dependency stack, fill story coverage gaps, and deploy as a live design system reference at **pinkmoon.sugartown.io**.

---

## Current State (pre-epic)

| Concern | Web / Studio | Storybook |
|---------|-------------|-----------|
| React | 19.2 | 18.2 |
| Vite | 7.2 | 5.0 |
| TypeScript | 5.9 | 5.3 |
| Storybook | — | 7.6.10 |
| Deployment | Netlify (sugartown.io) | None — local only |

**Story coverage:** 11/11 DS components (100%), 1/26 web components (3.8%), 2 foundations files.

---

## Scope

### Phase 1 — Dependency upgrade (blocking)

Migration path: Storybook 7 → 8 → 9 (step-by-step, using CLI automigrations).

- [ ] Storybook 7 → 8 (`npx storybook@8 upgrade`)
- [ ] Storybook 8 → 9 (`npx storybook@9 upgrade`)
- [ ] React 18 → 19.2, Vite 5 → 7, TypeScript → workspace version
- [ ] Fix config: `main.ts`, `preview.ts` (addon consolidation, import paths, argTypesRegex removal)
- [ ] Verify all existing stories render
- [ ] **Commit checkpoint**

Key SB9 changes: essentials/interactions addons merged into core, `@storybook/testing-library` → `storybook/test`, type imports from `storybook` not `@storybook/react`.

### Phase 2 — Web component story coverage

**Tier 1 (layout/nav):** Header, Footer, MobileNav, Preheader, Hero/HomepageHero, ThemeToggle
**Tier 2 (content):** ContentCard, EditorialCard, CardGrid, CardBuilderSection, ContentBlock, PageSections, Pagination, TaxonomyChips, DraftBadge
**Tier 3 (specialist):** Callout, ContentNav, FilterBar, ContactForm, ImageLightbox, NodesExample, PreviewBanner, SeoHead, portableTextComponents

Target: ≥ 80% coverage (Tier 1 + Tier 2 complete).

### Phase 3 — Storybook UI branding

- Custom manager theme (Sugartown logo, brand colours)
- Sidebar organisation: Foundations → Design System → Web Components → Documentation
- Welcome/intro page (MDX)

### Phase 4 — Netlify deployment

- New Netlify site, build from `apps/storybook`
- Custom domain: `pinkmoon.sugartown.io`
- Deploy strategy TBD (auto on push vs manual)

---

## Definition of Done

1. All existing stories render on Storybook 9 with React 19
2. Web component coverage ≥ 80%
3. Storybook deploys to pinkmoon.sugartown.io
4. Custom branding applied
5. All 4 themes switchable in deployed instance
