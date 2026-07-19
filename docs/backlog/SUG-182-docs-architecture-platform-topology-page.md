---
**Epic:** SUG-182 — docs/architecture — platform topology page documenting permanent parallel surfaces
**Linear Issue:** [SUG-182](https://linear.app/sugartown/issue/SUG-182/docsarchitecture-platform-topology-page-documenting-permanent-parallel)
**Status:** Backlog
**Priority:** ⚪ Later
**Merge strategy:** (b) Single close-out — one long-lived branch, one mini-release at the end
---

# SUG-182 — docs/architecture — platform topology page documenting permanent parallel surfaces

Create `docs/architecture/platform-topology.md` as the single-document reference for the monorepo's permanent parallel surface architecture: `sugartown.io` (Sanity/Vite/Netlify) and `shop.sugartown.io` (Contentful+Shopify/Next.js/Vercel) sharing `packages/design-system`.

## Background

The monorepo now operates two permanent parallel surfaces and a shared design system package. The decisions that govern this topology are scattered: shipped epics (SUG-127, SUG-128), PRD (`platform-evolution-prd.md`), monorepo brief (`PROJ-005-monorepo-prd.md`), and `CLAUDE.md`. There is no single document a new contributor or a future Claude Code session can read to understand the full picture without archaeology.

This is also the prerequisite for a planned content cluster: the `docs/architecture` page is referenced by the node `poc-platform-agnostic-by-design` (in Sanity) and by SUG-130 (the "Platform selection risk" article). Both content pieces need the architecture page to exist before they can reference it.

## Objective

After this epic, `docs/architecture/platform-topology.md` exists and is self-contained. A new contributor can read it without opening any other file and understand: what surfaces exist, who owns what data, where coupling is allowed, how the DS propagates, and why the hybrid hosting is intentional and not a migration in progress.

This document is a reference, not a replacement for the PRD. It synthesises the decisions from the PRD and shipped epics into a stable, readable reference.

## Scope

- [ ] Create `docs/architecture/platform-topology.md` covering: surface map (4 subdomains, stack, host per surface), data authority table (content type → owning CMS), adapter seam contract (where CMS coupling lives, what `packages/design-system` may not import), hosting topology rationale, DS consumption pattern (`workspace:*`, `"use client"` boundary, theme file convention), explicit statement that `sugartown.io` is not being replaced — layer: documentation
- [ ] Create `docs/architecture/` directory if it does not exist — layer: repo structure
- [ ] Verify the document passes anti-slop checks: no em dashes, no AI vocabulary, no adjective triads — layer: copy QA

## Acceptance criteria

- [ ] `docs/architecture/platform-topology.md` exists and is self-contained (readable without opening other docs)
- [ ] Surface map covers all four subdomains with stack + hosting per surface
- [ ] Data authority table names every content type and its owning CMS — hard rule that `apps/shop` does not query Sanity is explicit
- [ ] Adapter seam contract is named: CMS coupling in `apps/<name>/src/lib/`, `packages/design-system` has zero CMS imports
- [ ] Anti-slop check passes: no em dashes, no AI vocabulary, no adjective triads

## Human QA Walkthrough — example local pages

Not applicable — this epic produces a documentation file only. No shared CSS, token, or component changes.

## Technical notes

**Content cluster sequencing (from PRD Addendum):** Architecture page should exist before the node `poc-platform-agnostic-by-design` is published in Sanity, and before SUG-130 (the "Platform selection risk" article) is written. This doc is the technical foundation both pieces reference. No hard dependency enforces this ordering — it is a content sequencing recommendation.

**Anti-slop rules (CLAUDE.md):** No em dashes (`—`). No filler transitions ("That said", "With that in mind"). No AI vocabulary ("leverage", "utilize", "facilitate"). No empty adjective triads. Write in declarative sentences about the actual system.

**Source materials:** Synthesise from `docs/briefs/platform-evolution-prd.md`, `docs/briefs/PROJ-005-monorepo-prd.md`, `docs/briefs/SUG-127-architecture-decisions.md`, and `docs/shipped/zArchive/2026/SUG-127-contentful-vercel-poc-platform-vendor-evaluation.md`. Do not invent decisions — cite which doc each claim comes from.

**Model & Mode [REQUIRED]:** `/model sonnet` — documentation synthesis with no code changes.

## Non-Goals

- No code changes — documentation only
- Not a replacement for `docs/briefs/platform-evolution-prd.md` — this is a stable reference, the PRD is the decision record
- No `docs/architecture` web route in `apps/web` or `apps/shop` — the location question is an open decision in the PRD; this epic creates the markdown file in the monorepo `docs/` tree only

## Related

- **Linear:** [SUG-182](https://linear.app/sugartown/issue/SUG-182/docsarchitecture-platform-topology-page-documenting-permanent-parallel)
- **PRD:** `docs/briefs/platform-evolution-prd.md`
- **Monorepo PRD:** `docs/briefs/PROJ-005-monorepo-prd.md`
- **SUG-127 shipped:** `docs/shipped/zArchive/2026/SUG-127-contentful-vercel-poc-platform-vendor-evaluation.md`
- **Epic template:** `docs/epic-template.md`
