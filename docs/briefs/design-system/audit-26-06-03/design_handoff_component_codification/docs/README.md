# Component governance — documentation set

This folder is the governance package for Sugartown components. It exists to stop the recurring failure
mode where new "components" get invented from scratch and named for their use-case
(`ContactForm`, `ThemeToggle`, …) instead of being composed from codified primitives and named for what
they are.

## Reference of record

| Artifact | What it is | Where |
|----------|-----------|-------|
| **Component Naming Audit** | 103 components × 7 systems, with divergence flags and our own In-system / Diverges / To-codify / Not-yet status. The live picture. | `../Component Naming Audit.html` |
| **Component registry** | The authoritative coverage list — DS primitives, web adapters, Storybook stories, Studio schema. | `pinkmoon.sugartown.io` · `uploads/component-registry.md` (design-system project) |
| **Naming & Composition Charter** | The three laws + tiers + checklist. Built into the audit; mirrored here. | the audit (top section) |

A claim that something is **in system** must be backed by a registry entry / Storybook story — **not** by
tokens, a preview card, or site usage alone.

## What's in this folder

| File | Use it for | Target location in the repo |
|------|-----------|------------------------------|
| `component-pr-template.md` | Review gates for any component PR — turns the charter into checkboxes. | `.github/PULL_REQUEST_TEMPLATE/component.md` |
| `storybook-charter.mdx` | The first page in Storybook — the charter everyone sees before building. | a Docs story titled `Start here/Naming & Composition Charter` |
| `card-tile-decomposition.md` | Worked law-02 epic: fold Tile into Card, extract Metric/Meter/Skeleton, un-smoosh ContentCard/MetadataCard/ListView. | implementation backlog |
| `form-decomposition.md` | Worked law-01+02 epic: retire `ContactForm` → `Form` + codified field primitives. | implementation backlog |
| `layout-primitives.md` | Worked epic: codify layout primitives, re-bucket the "Layout" group into Regions/Patterns, retire `TwoColumnLayout`. | implementation backlog |
| (root) `CHARTER.md` | Governs AI sessions in this project automatically. | repo root / project root |

## The three laws (short form)

1. **Name by what it *is*, not what it's *for*.** A contact form is a `Form` + content, never a `ContactForm`.
2. **Primitives-first.** Patterns are compositions of codified primitives; missing primitives get built and
   given a story **first**.
3. **Reuse before you name.** Check the audit; a new name needs evidence the concept is genuinely new.

## The check (before adding a component)

1. Use-case name (a domain noun)? → it's an **Instance**, not a component. Stop.
2. Already in the registry/audit under another name? → use that name.
3. Primitive, or a composition of primitives?
4. Composition → all child primitives codified (registry ✓)? If not, codify them first.
5. Canonical, role-based name; not a false friend.
6. Storybook story + registry row **before** it ships.

## How the pieces fit

```
                 ┌─────────────────────────┐
                 │  Component registry      │  ← single source of truth for coverage
                 │  (Storybook + DS + web)  │
                 └────────────┬────────────┘
                              │ reconciled against
                              ▼
   ┌──────────────────────────────────────────────┐
   │  Component Naming Audit (this project)        │  ← live status + divergence + charter
   └───────┬───────────────────────────┬──────────┘
           │ enforced by               │ enforced by
           ▼                           ▼
   CHARTER.md (AI sessions)     component-pr-template.md  +  storybook-charter.mdx
                               (humans, at PR & build time)
```

When in doubt, the answer is one line: **charter, law 01 — name by what it is — and the audit shows the
primitive already exists.**
