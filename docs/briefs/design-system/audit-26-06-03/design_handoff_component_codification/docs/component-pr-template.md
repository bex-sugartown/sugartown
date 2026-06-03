<!--
  Component PR template — drop-in for the Sugartown monorepo.
  Target path in repo:  .github/PULL_REQUEST_TEMPLATE/component.md
  (or paste the checklist into the default PR template)

  Source of truth: the Component Naming Audit + the component registry.
  Governing rules: docs/README.md · CLAUDE.md · the audit's "Naming & Composition Charter".
-->

## What & why

<!-- One sentence: what does this component do, and what need does it serve? -->

## Tier

> Name by what it **is**, not what it's **for**. A "contact form" is a `Form` configured with content — not a `ContactForm`.

- [ ] **Primitive** — atomic, role-named, owns no use-case (`packages/ds/`)
- [ ] **Pattern** — a composition of codified primitives, named by structure (`web/components/`)
- [ ] **Instance** — a configuration of an existing pattern → **this is content/config, not a component. Close this PR.**

## The check

**Naming**
- [ ] Named for what it **is**, not a use-case. No domain noun in the name (no `Contact*`, `Newsletter*`, `Theme*`, `Hero*`).
- [ ] Searched the **audit** and **registry** — this concept does **not** already exist under another name.
- [ ] The chosen name is **not a false friend** (same word, different component elsewhere — e.g. Stepper, Drawer, Tag, Badge, Tile, Label).
- [ ] Name matches the agreed canonical (role-based) term.

**Composition (patterns only)**
- [ ] Every child primitive is **already codified** (registry ✓ + Storybook story). List them:
  - `…`
- [ ] No part of this pattern was invented from scratch in this PR.
- [ ] If a primitive was missing, it ships in its **own** prior/companion PR — linked here: `#…`

**Codification**
- [ ] Storybook story added (`Primitives/…` or `Patterns/…`).
- [ ] Registry row added/updated in `uploads/component-registry.md` (and the gap-analysis doc if relevant).
- [ ] Studio schema object mapped (if rendered from content).

**Style**
- [ ] Tokens only — no raw hex / ad-hoc spacing. `pnpm validate:tokens --strict-colors` passes.
- [ ] Zero-radius, mono labels, hot pink reserved for signals.

## Audit impact

<!-- If this changes a row in the Component Naming Audit, say which and how
     (e.g. "Form: Diverges → In system; retires the ContactForm offender"). -->

- Row(s) affected: `…`
- New status: `In system` / `Diverges` / `To codify` / `Not yet`

---

> **Reviewer note:** a claim that something is *in system* must be backed by a registry entry / Storybook story — **not** by tokens, a preview card, or site usage alone. That loose inference is what historically mis-filed components like "Slider".
