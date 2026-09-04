# Sugartown — Component Naming & Composition Charter

This project maintains the **Component Naming Audit** (`Component Naming Audit.html`) and treats it,
together with the Sugartown **component registry** (`pinkmoon.sugartown.io` / `uploads/component-registry.md`
in the design-system project), as the **reference of record** for what components exist and what they are called.

When adding, naming, or reviewing ANY component — in this project or when advising on the wider system —
apply these rules. They exist because the system has repeatedly accreted use-case-named, invented-from-scratch
"components" (e.g. `ContactForm`) that should never have been created.

## The three laws

1. **Name by what it *is*, not what it's *for*.**
   A form is a `Form`. A contact form is that `Form` configured with content — never a `ContactForm`.
   Use-case names (`ContactForm`, `ThemeToggle`, `NewsletterSignup`, `HeroBanner`…) are rejected on sight.
   The domain noun ("contact", "newsletter", "theme") belongs in data/config, not the component name.

2. **Primitives-first; compose patterns from them.**
   A pattern is *only* a composition of codified primitives. If a needed primitive is not in the registry,
   it is built and given a Storybook story **first**, then composed. Nothing is invented from scratch, and
   no pattern ships with un-codified parts.

3. **Reuse before you name.**
   Search the audit first. If the concept already exists under another name (a false friend or a synonym),
   use the agreed canonical name. A new name requires evidence the concept is genuinely new.

## The three tiers

| Tier | What it is | Named by | Lives in | Examples |
|------|-----------|----------|----------|----------|
| **Primitive** | Atomic, reusable, owns no use-case | its role | `packages/ds/` | Button, Input, Chip, Card, Table, Tile |
| **Pattern** | A composition of primitives | its structure | `web/components/` | Form, CardGrid, MetadataCard, DataTable |
| **Instance** | A configuration of a pattern | (not a component) | Studio / content | "contact form", "newsletter signup", "stat tiles" |

If something you're about to name is an **Instance**, it is content/config — do not create a component for it.

## The check (before adding a component)

1. Is it named for a use-case (a domain noun)? → it's an **Instance**, not a component. Stop.
2. Does it already exist in the registry or audit under another name? → use that name.
3. Is it a primitive, or a composition of primitives?
4. If a composition — are all child primitives codified (registry ✓)? If not, codify them first.
5. Pick the canonical, role-based name; confirm it isn't a false friend.
6. Add the Storybook story + registry row **before** it ships.

## Known offenders (tracked in the audit)

- **`ContactForm`** → should be a generic `Form` primitive/pattern; "contact" is configuration.
- **`ThemeToggle`** → no generic `Switch`/`Toggle` primitive exists; factor one out.
- Audit statuses: `In system` (codified), `Diverges` (in system under a wrong/alternate name),
  `To codify` (shipped in Studio/Web but no DS/Storybook story), `Not yet` (no codified component).

## Working on the audit itself

- Data lives in `components-data.js` (`window.COMPONENTS`). Each row: cross-system names + `aria` + `house`
  (Pink Moon name) + `div` (aligned/synonym/false/contested) + `st` (present/diverges/codify/missing).
- A claim that something is **in system** must be backed by a registry entry / Storybook story —
  *not* by tokens, a preview card, or site usage alone. (That loose inference is what mis-filed "Slider".)
- Notes prefixed `ANNOTATION:` are intentional callouts and must survive the CSV export.
- Visual style is the Pink Moon design system (`assets/colors_and_type.css`): zero-radius, mono labels,
  hot pink reserved for signals. Don't invent colors or fonts outside it.

> Renamed from `CLAUDE.md` on 2026-09-04 (ST-112): as `CLAUDE.md` it loaded as Sugartown session context whenever a session read this folder. Nothing else changed.
