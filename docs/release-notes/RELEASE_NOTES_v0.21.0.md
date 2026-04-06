# Release Notes — v0.21.0

**Date:** 2026-04-06
**Branch:** `main`
**Scope:** apps/web, apps/studio, packages/design-system, apps/storybook, docs

---

## What this release is

A Storybook and component infrastructure release. Storybook is upgraded from v7 to v10, every web and design system component now has a story with interactive controls, and the Accordion component is added across all three layers (DS primitive, web adapter, Studio schema). Placeholder images throughout Storybook are replaced with real Sanity CDN assets.

---

## What changed

### Storybook v10 upgrade and full story coverage (SUG-46)

Storybook is upgraded from v7 to v10.3.4 with React 19 and Vite 7 compatibility. The sidebar is reorganized into four groups — Foundations, Primitives, Patterns, Layout — replacing the previous Components/Web Components split. A custom Sugartown manager theme provides branded chrome, and five documentation stories (Welcome, Theme Guide, Token Reference, Component Contracts, Contributing) are added as in-Storybook reference pages.

Eighteen new story files cover every web-layer component that previously had no Storybook presence: ContentCard, DraftBadge, MetadataCard, Pagination, TaxonomyChips, ThemeToggle, Footer, Header, Hero, MobileNav, Preheader, CardBuilderSection, CardGrid, ContactForm, ContentBlock, EditorialCard, ImageLightbox, PreviewBanner, and PageSections. Shared fixture data for siteSettings and PortableText blocks supports these stories.

Netlify deployment is configured for `pinkmoon.sugartown.io`.

### Storybook argTypes audit (SUG-45)

Every story file across both the DS package (7 files) and web app (10 files) now has explicit `argTypes` so interactive controls render correctly in Storybook 10. Booleans get toggles, enums get dropdowns, colours get pickers, and internal/passthrough props are hidden. Card argTypes expanded from 10 to 22 props with the `metadata` variant added. Chip argTypes now include the `grey` preset.

### Accordion component (SUG-44)

A new Accordion primitive is added to the design system package with CSS grid-row animation, single/multi-expand modes, keyboard navigation, and full ARIA support. The web adapter wires it into the PageSections renderer, and a Studio schema (`accordionSection`) makes it available in the section builder for articles, case studies, nodes, and pages.

### Real images replace all placeholders

All placehold.co and picsum.photos URLs across Card, Media, Table, ContentCard, and the Sanity mock `urlFor()` are replaced with a real Sanity CDN image. The siteSettings fixture logo is updated to the actual Sugartown wordmark.

### Storybook bug fix

CardBuilderSection stories were crashing with a `useContext` null error because the MemoryRouter decorator was missing. Fixed.

### Process and documentation

Post-mortem guardrails are added to CLAUDE.md: feature branch push rule, Linear Done gate, merge conflict cleanup, and runtime environment detection. A local-only directory convention formalizes that `docs/drafts/` and `docs/brand/` are gitignored and never committed. Both directories are untracked from git. A monorepo architecture diagram, tooling upgrade template, and desktop app feedback doc are added. Three epics (SUG-38, SUG-41, SUG-46) are shipped to `docs/prompts/`.

---

## Not in this release

- Pink Moon runtime toggle (SUG-21) — design exploration in progress, specs TBD via updated PRD
- Pink Moon component overrides beyond Button — Card, Chip, Accordion, etc. deferred to SUG-21
- Storybook/Studio props alignment audit (SUG-47) — backlogged, depends on schema review
- Classic dark/light mode deprecation — deferred to Pink Moon convergence phase

---

## Validator state at release

Not run for this release (no web app routing, filter, or content changes).
