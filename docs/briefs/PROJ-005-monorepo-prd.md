## Meta

| Field                 | Value                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| **Project ID**        | PROJ-005                                                                                                |
| **PRD Version**       | v1.0 — Sugartown Monorepo Architecture                                                                  |
| **PRD Status**        | Draft                                                                                                   |
| **Owner**             | Becky Head (Product / Platform)                                                                         |
| **Primary Repo**      | sugartown (proposed monorepo)                                                                           |
| **Scope**             | Consolidation of Sugartown frontend, Sanity Studio, design system, and Storybook into a single monorepo |
| **Related Standards** | Sugartown Design System PRD, Sugartown Sanity MVP PRD, PRD v2 Prompt                                    |
| **Related Gems**      | gem-design-system, gem-sanity-migration                                                                 |
| **Supersedes**        | N/A (new capability)                                                                                    |
| **Last Reviewed**     | 2026-02-01                                                                                              |

---

## 1. Overview

This PRD defines the transition of Sugartown.io from a collection of loosely coupled repositories (frontend, design system, Storybook, Sanity experiments) into a **single, intentional monorepo**.

The monorepo is both a **practical platform decision** and a **portfolio artifact**. It is explicitly designed to serve as a **mini‑monorepo reference implementation of a composable MACH architecture**—demonstrating how modern, atomic systems can be structured, governed, and evolved with clear contracts and minimal coupling.

Sugartown is intentionally positioned as:

- **Composable** — independently deployable concerns (content, presentation, design system)
- **API‑first** — content and configuration accessed via explicit interfaces
- **Headless** — no frontend assumptions baked into content or design primitives
- **Cloud‑native** — aligned with modern CI/CD, workspace tooling, and modular builds

While Sugartown is currently Sanity‑based, the architecture is **platform‑agnostic by design**. A core goal of this monorepo is to ensure that migrating from one headless CMS (e.g., Sanity) to another (e.g., Contentful or equivalent) is **straightforward and contained**, requiring changes primarily within a bounded content adapter layer rather than across the application surface.

This composability and portability are **foundational goals**, not future optimizations. Detailed implementation specifics are intentionally deferred to individual PRDs for the design system, content layer, frontend, and tooling.

---

## 2. Context

### Problem Statement

The current multi‑repo setup introduces:

- Drift between frontend, design system, and Storybook
- Duplicated tooling and configuration
- Ambiguous ownership of “source of truth” for contracts
- Friction when showcasing the system as a coherent whole

Simultaneously, the migration away from WordPress to **Sanity + React** removes the primary historical reason to keep systems separated.

### Why Now

- WordPress is fully deprecated from the active stack
- Sanity schemas and Studio work since **2026‑01‑18** are stable enough to migrate forward
- Storybook and design‑system work has matured into contract‑level documentation
- Sugartown is evolving from “site” → “ecosystem showcase”

---

## 3. Goals, Non‑Goals, Success Metrics

### Goals

- Establish a **single, coherent source tree** for Sugartown.io
- Treat the design system + Storybook as first‑class contract infrastructure
- Eliminate all WordPress‑specific assumptions and tooling
- Enable clean sharing of tokens, components, schemas, and tooling
- Showcase platform‑level thinking appropriate for senior PM / systems roles

### Non‑Goals

- No attempt to preserve WordPress compatibility
- No rewrite of functional frontend logic unless required for boundary hygiene
- No premature optimization of CI/CD beyond baseline correctness

### Success Metrics

- One repo can be cloned, installed, and run end‑to‑end
- Storybook, Web app, and Sanity Studio all build from shared packages
- No WP references remain in build configs, code, or content models
- Reduced duplication of configs (TypeScript, linting, tokens)

---

## 4. Proposed Solution

Adopt a **pnpm‑based monorepo** with explicit boundaries between apps and shared packages.

### High‑Level Structure

```
sugartown/
├── apps/
│   ├── web/        # sugartown.io frontend (React / Next / Vite)
│   ├── studio/     # Sanity Studio
│   └── storybook/  # Design system contract documentation
├── packages/
│   ├── design-system/  # Tokens + components (Sanity‑agnostic)
│   ├── content/        # GROQ queries, schema helpers, validators
│   ├── eslint-config/  # Shared lint rules
│   └── tsconfig/       # Shared TS baselines
├── tooling/
│   ├── scripts/        # Release, migration, codegen helpers
│   └── ci/             # CI utilities
└── README.md
```

### Boundary Rules (Non‑Negotiable)

- `design-system` **must not import** from Sanity or app code
- `content` **must not import UI components**
- Apps may import from packages, never the reverse
- Storybook documents contracts; it does not define app behavior

---

## 5. Migration Strategy (Post‑Jan 18, 2026 Work)

### Guiding Principle

**MIGRATE, don’t re‑invent.**

Any work completed **on or after 2026‑01‑18** (Sanity schemas, frontend components, Storybook experiments) should be **moved forward intact** unless it violates the new boundaries.

### Migration Targets

- **Frontend** → moved into `apps/web`
- **Sanity Studio** → moved into `apps/studio`
- **Design System + Tokens** → normalized into `packages/design-system`
- **Storybook** → formalized under `apps/storybook`

### Explicit Non‑Migration

- WordPress themes, PHP scripts, WP taxonomies
- WP‑specific slug or routing logic
- Legacy CSS assumptions tied to WP templates

Archived WP artifacts should live outside the monorepo (or under `/archive` if retained for historical reference only).

---

## 6. Phases

### Phase 1 — Foundation

**Scope:** Monorepo skeleton + tooling alignment

**Deliverables:**

- pnpm workspace + turborepo setup
- Root TS + ESLint configs
- apps/ and packages/ directories established

**Estimated Effort:** 1–2 weeks

---

### Phase 2 — Migration

**Scope:** Move active systems into the monorepo

**Deliverables:**

- Frontend migrated to `apps/web`
- Sanity Studio migrated to `apps/studio`
- Design system extracted into `packages/design-system`
- Storybook operational against shared DS

**Estimated Effort:** 2–3 weeks

---

### Phase 3 — Hardening

**Scope:** Contract enforcement and polish

**Deliverables:**

- Storybook as authoritative DS reference
- Token usage enforcement
- Basic CI: lint, typecheck, storybook build

**Estimated Effort:** 1–2 weeks

---

## 7. Risks & Mitigations

### Risk: Monorepo Sprawl

**Mitigation:** Strict import boundaries + lint rules

### Risk: Tooling Over‑Complexity

**Mitigation:** Prefer boring defaults (pnpm, Turborepo, single TS baseline)

### Risk: Migration Fatigue

**Mitigation:** Migrate recent work first; avoid rewrites

---

## 8. Open Questions

- Single version vs per‑package versioning? (Decision: single repo version)

- Publish design system externally or keep internal‑only? (Decision: external)

- Long‑term archival strategy for WP artifacts? (Decision: Content exported to Sanity, theme to Design System, etc)

---

## 9. Appendices

### Appendix A — Why Monorepo Is Intentional Here

This is not about convenience alone. The monorepo itself is a **demonstration artifact**: a living example of how modern product platforms are designed, governed, and communicated.

Sugartown isn’t just migrating tech — it’s documenting how thoughtful systems get built.

