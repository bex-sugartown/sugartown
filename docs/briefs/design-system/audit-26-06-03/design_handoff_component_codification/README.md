# Handoff: Component codification & naming remediation

## Overview

This package turns the **Sugartown Component Naming Audit** into executable work for Claude Code. The audit
benchmarked 103 of the most-used UI components against seven design systems, then scored each against our own
stack (DS package + web adapters + Storybook + Studio schema). It surfaced two problems to fix:

1. **Use-case-named / invented-from-scratch components** (`ContactForm`, `ThemeToggle`, `TwoColumnLayout`, `Tile`) that
   should be primitives + configuration.
2. **Primitives shipping *inside* composites, never extracted** (Metric/Meter/Skeleton inside `Tile`; Field/Label/
   Textarea/etc. inside `ContactForm`; Toolbar inside `FilterBar`; layout mechanics inside Header/Footer/…).

Your job: **parse this into epics, prioritize by dependency, and execute** in the real monorepo
(`github.com/bex-sugartown/sugartown`), following the charter. Start with `PROMPTS.md`.

## About these files

These are **not UI mocks to recreate.** They are governance + audit artifacts describing a refactor of an existing
codebase. The work happens in the live monorepo (React 19 + Vite · Sanity Studio v5 · Storybook v10 · Turborepo),
using its established patterns — DS primitives in `packages/ds/`, web adapters in `apps/web/src/design-system/`,
patterns in `apps/web/src/components/`, Studio schema in the Sanity package.

The interactive audit (`Component Naming Audit.html`, in the parent project) is the human-browsable view; the
machine-readable source of truth for *this* handoff is **`component-audit.json`** (and `.csv`).

## Source of record

- **`component-audit.json`** — every component with: cross-system names, ARIA APG name, Pink Moon house name,
  divergence class, Pink Moon status, and a note (the `POSITION:` / `FUTURE STATE:` / `DECISION:` annotations carry
  the implementation intent).
- The Sugartown **component registry** (`uploads/component-registry.md` in the design-system project /
  `pinkmoon.sugartown.io`) — authoritative coverage list.
- **Rule:** an "In system" claim must be backed by a registry entry / Storybook story — **not** tokens, a preview
  card, or site usage. (That loose inference is what historically mis-filed "Slider".)

## Status vocabulary (the `pinkMoonStatusKey` field)

| Status | Meaning | Action |
|--------|---------|--------|
| `present` (In system) | Codified, has a Storybook story | none — compose it |
| `diverges` (Diverges) | In the DS under a wrong/use-case name | **rename / refactor** (e.g. ContactForm→Form, Tile→Card) |
| `codify` (To codify) | Ships in product but no DS/Storybook story | **extract + codify** the primitive |
| `missing` (Not yet) | No codified component (tokens/previews may exist) | build only if needed; otherwise it's a future-naming reference |

Counts at handoff: **13 In system · 7 Diverges · 24 To codify · 59 Not yet.** The **Diverges + To codify** rows
(31 total) are the actionable backlog.

## Operating rules — the Naming & Composition Charter

Enforce these on every component you touch. Full text in `CHARTER.md` and `docs/README.md`.

1. **Name by what it *is*, not what it's *for*.** A contact form is a `Form` + content, never a `ContactForm`.
   Use-case names (a domain noun in the name) are rejected.
2. **Primitives-first.** A pattern is only a composition of codified primitives. If a primitive is missing, build it
   and give it a Storybook story **first**, then compose. Nothing invented from scratch.
3. **Reuse before you name.** Check the audit; a new name needs evidence the concept is genuinely new; avoid false
   friends (same word, different component — `Stepper`, `Drawer`, `Tag`, `Badge`, `Tile`, `Grid`, `Label`).

Per-component gate (turn into PR checks — see `docs/component-pr-template.md`):
use-case name? → it's config, stop · already exists under another name? → use it · primitive or composition? ·
all child primitives codified? · canonical role-based name · Storybook story + registry row before ship.

## The epics (already mapped)

Three are fully documented in `docs/`; the rest fall out of the audit by cluster.

| Epic | Doc | What |
|------|-----|------|
| **1 · Card / Tile** | `docs/card-tile-decomposition.md` | Fold `Tile` into `Card`; extract `Metric`, `Meter`, `Skeleton`; un-smoosh ContentCard / MetadataCard / ListView; recompose stat section as `CardGrid`. |
| **2 · Form** | `docs/form-decomposition.md` | Retire `ContactForm` → `Form` pattern + codified field primitives (`Field`, `Label`, `Textarea`, `HelperText`, `ErrorMessage`); confirm/codify `Input`. |
| **3 · Layout** | `docs/layout-primitives.md` | Codify layout primitives (`Box`, `Page`, `Container`, `Stack`, `Flex`, `Surface`, `Columns`, `AppShell`); re-bucket the "Layout" Storybook group into `Regions` + `Patterns`; retire `TwoColumnLayout`. |
| **4 · Page-builder sections** | (from audit) | Codify `Carousel` + `Page control`, and `Gallery` (imageGallery) — tracked separately in SUG-98. |
| **5 · Stragglers** | (from audit) | `Toolbar` (extract from FilterBar), `Anchor nav` (from PageSidebar), `Avatar`, `Divider` (from PT), `Truncate`, chip `Overflow`. |

## How to prioritize

Dependency order is non-negotiable — **primitives before the patterns that compose them.** Suggested critical path:

1. **`Box`** (layout) — the token-aware style base several others build on. Unblocks Epic 3.
2. **Leaf content primitives** — `Metric`, `Meter`, `Skeleton`, `Avatar`, `DescriptionList`. Unblocks Epic 1.
3. **`Card` re-codification** → then `StatCard`, recompose ContentCard/MetadataCard. (Epic 1)
4. **Field primitives** (`Field`, `Label`, `Textarea`, `HelperText`, `ErrorMessage`) → then `Form` → migrate
   `ContactForm`. (Epic 2)
5. **Remaining layout primitives + region re-bucket** (Epic 3); **stragglers** (Epic 5); **sections** (Epic 4).

Weight by: (a) how many other rows it unblocks, (b) how many live call-sites it de-drifts, (c) whether it retires a
charter offender. Each epic doc ends with a phased PR plan and a Definition of Done — follow them.

## Files in this package

```
component-audit.json        machine-readable source of truth (parse this)
component-audit.csv         same data, flat
CHARTER.md                   the charter as operating rules (load into the repo)
PROMPTS.md                  copy-paste prompts: parse → prioritize → execute
docs/
  README.md                 governance index + how the pieces enforce each other
  component-pr-template.md   PR review gates (→ .github/PULL_REQUEST_TEMPLATE/)
  storybook-charter.mdx      Storybook intro page (→ a Docs story)
  card-tile-decomposition.md epic 1 plan
  form-decomposition.md      epic 2 plan
  layout-primitives.md       epic 3 plan
```

Begin with **`PROMPTS.md`**.
