# Layout primitives & the "Layout" group — reclassification (epic 3)

> Status: proposed · Owner: DS · Source of record: the Component Naming Audit + `uploads/component-registry.md`
> Governing rules: the Naming & Composition Charter (`docs/README.md`, `CHARTER.md`).

Two problems, one root cause. The arrangement mechanics (`Grid`, `Stack`, `Flex`, `Surface`, `Page`, …) are
hand-rolled across content layouts and drift silently. Meanwhile the Storybook **"Layout"** group contains no
layout primitives at all — it's a mix of content-bound regions, an orchestrator, and one config-baked-into-a-name.
We codify the primitives and re-bucket the group by what each thing actually **is**.

---

## 1. What's mislabelled today

Current `Layout/*` stories:

| Entry | What it actually is | Not a… |
|------|---------------------|--------|
| `Header` | Region — `banner` landmark, content-bound | layout primitive |
| `Footer` | Region — `contentinfo` landmark | layout primitive |
| `Hero` | Region — page intro composite | layout primitive |
| `Preheader` | Region — category/tag/status metadata strip | layout primitive |
| `MobileNav` | Region — `navigation` landmark | layout primitive |
| `PageSections` | Orchestrator — maps `sections[]` (`_type`) → components | a component you place |
| `TwoColumnLayout` | **Config baked into a name** — "two column" is `Columns count={2}` | a distinct primitive |

The real layout primitives (the boxes and the arrangement) are buried *inside* these — see the audit's
To-codify rows: **Box · Page · Container · Shell · Panel · Surface · Flex** (plus existing **Grid**, **Stack**).

---

## 2. Target taxonomy

```
Primitives / Layout              MECHANICS · no content, no use-case
  ├─ Box          token-aware style base   ← the primitive the others build on
  ├─ Page         gutters + region slots; COMPOSES Container (no maxWidth of its own)
  ├─ Container     max-width constraint, size prop = named width tokens   ← standalone (SUG-146)
  ├─ Grid         2-D layout            (exists)
  ├─ Columns      N-column split        ← replaces "TwoColumnLayout" (count = config)
  ├─ Stack        1-axis spacing, token gap, RESPONSIVE direction prop  ← absorbs Flex
  └─ Surface      elevation container   (To codify)

Regions                          CONTENT-BOUND landmark composites (compose the primitives above)
  ├─ Header (banner) · Footer (contentinfo) · Hero · Preheader · MobileNav (navigation)

Patterns                         ASSEMBLY · orchestrators & multi-region layouts
  ├─ PageSections     orchestrator (sections[] → components)
  └─ DetailLayout     reading rail + sidebar — composes Columns/Grid  (was "TwoColumnLayout")
```

**The rule made concrete:** `Primitives/Layout` owns *how things are arranged*. `Regions` own *a place on the
page with content*. `Patterns` own *how regions are assembled*. "Two column" is not a component — it's a number
passed to `Columns`.

---

## 3. Naming decisions of record

| Old | Verdict | New |
|-----|---------|-----|
| `Layout/*` group | Mis-bucketed (regions ≠ layout primitives) | split into `Primitives/Layout`, `Regions`, `Patterns` |
| `TwoColumnLayout` | Count baked into the name | `Columns count={2}` (primitive + config); or `DetailLayout` pattern if it has reading-rail semantics |
| `Panel` | Vague/overloaded | name by role — `Surface` / `Card` / labelled `Region`, never bare "Panel" |
| `Surface` | Token applied ad hoc | codify as an elevation **primitive** (Material/Atlassian precedent) |
| `Flex` | Hand-rolled wrappers | **RESOLVED (SUG-Flex): fold into `Stack`** — no standalone Flex (see §3a) |
| `Shell` | UI shell / Frame / Page layout | one canonical `AppShell` primitive |

---

## 3a. Decisions of record

### Flex folds into Stack (SUG-Flex)

**Question:** standalone `Flex` primitive, or fold into `Stack` as a direction prop?

**Resolved: fold into `Stack`. Do not ship a standalone `Flex`.**

- `Stack` owns one-axis layout with **token gap only**, plus optional `align` / `justify` / `wrap` and a
  **responsive `direction` prop** — e.g. `direction={{ base: 'vertical', md: 'horizontal' }}`.
- This is exactly what the logged consumer needs: the **responsive ButtonGroup** reflows horizontal→vertical
  at a breakpoint, which wants a responsive `direction` value — not two swapped components, not a separate Flex.
- Name it **`Stack`** (what it is), never `Flex` (the implementation detail — it happens to use flexbox).
- **Why not a generic Flex:** re-exposing the full flex API (grow/shrink/justify/align/wrap as free props)
  re-legitimizes the per-call-site gap drift this whole epic exists to kill. Polaris's no-Flex model is the
  precedent. Genuine full-flex control is rare → drop to `Box` + explicit style (a rare, *explicit* escape
  hatch is self-documenting; a generic Flex primitive is *silent* drift).
- **Migration:** hand-rolled flex wrappers across content layouts → `Stack`. The audit's `Flex` row is now a
  synonym pointer to `Stack` (status: not a separate component), not a To-codify item.

### Container is standalone; Page composes it (SUG-146)

**Question:** standalone `Container` primitive, or a `maxWidth` prop on `Page`?

**Resolved: `Container` is its own primitive. Page composes it; Page carries no `maxWidth` prop.**

- Width-constraint recurs at **multiple nesting levels** — the page's main region *and* individual page-builder
  sections (a full-bleed hero vs a constrained text block in the same page). A prop on `Page` can only constrain
  once, at the root; the behaviour must be a composable primitive any region/section can wrap with.
- **Page and Container are different jobs** (law 01/02): `Page` = top-level scaffold (header/main/footer region
  slots + page gutters); `Container` = constrain + centre to a max-width. `Page` **composes** `Container` for its
  content region rather than re-implementing it. Chain: `Box → Container → Page composes Container`.
- **`size` prop encodes the named width tokens** — `reading` (760) / `detail` (1080) / `archive` (960) — as config.
  One place defines the widths; consumers pick a token instead of hardcoding `max-width`. Full-bleed = no
  `Container` (or `size="bleed"`), a per-section decision.
- **HARD CONSTRAINT:** max-width centring lives in `Container` **only**. `Page` must **not** also carry a
  `maxWidth` prop — two places to constrain width *is* the drift.
- **Phase 0:** grep hardcoded `760` / `960` / `1080` (and stray `max-width` + `margin-inline: auto`) across the
  content layouts; each cluster becomes a `Container` `size` token, and the count sizes the de-drift work.

---

## 4. Implementation — end to end

**Primitives first (law 02). Regions/patterns may not be refactored onto primitives that aren't codified yet.**

### Phase 0 — drift audit (do this before codifying)
- [ ] Grep content layouts for hand-rolled flex/grid/max-width/elevation. Catalogue the variants per concept.
- [ ] Record the drift (e.g. "5 different column gaps", "3 surface shadows") — this sizes the token-only fixes
      vs. real primitive needs, and prevents codifying a primitive that just re-bakes drift.

### Phase 1 — codify the layout primitives
- [ ] `Page` (gutters + region slots, composes Container), `Surface`, `Stack` (with responsive `direction` —
      absorbs Flex per §3a), `Columns`, `Container` (standalone, `size`=named width tokens per §3a), `Box`,
      `AppShell`. Each: story under `Primitives/Layout` + registry row. Tokens only; `validate:tokens` green.
- [ ] `Box` is the token-aware style base; `Page`/`Container`/`Surface` build on it. Codify `Box` first.
- [ ] `Columns` carries `count` / `split` props — `TwoColumnLayout` becomes `Columns count={2}`.

### Phase 2 — re-bucket Storybook (no behaviour change, just titles)
- [ ] Move `Header/Footer/Hero/Preheader/MobileNav` stories under `Regions`.
- [ ] Move `PageSections` under `Patterns` (or `Renderers`).
- [ ] Retitle the old `Layout` group away — nothing called "Layout" should be content-bound.

### Phase 3 — recompose regions onto the primitives
- [ ] Refactor each Region to compose `Page`/`Grid`/`Stack`/`Surface` instead of bespoke layout CSS.
- [ ] Replace `TwoColumnLayout` usages with `Columns` (or a `DetailLayout` pattern composing it).
- [ ] Delete duplicated layout CSS as each region is migrated.

### Phase 4 — close out
- [ ] Registry rows for every new layout primitive; Regions/Patterns reclassified.
- [ ] Audit flips: Page/Shell/Surface (+ Stack) → **In system**; `Flex` resolved to Stack (no separate component); `Panel` resolved to its real role.
- [ ] `TwoColumnLayout` retired.

---

## 5. Definition of done

1. `Primitives/Layout` contains only mechanics — no content, no use-case names, no column counts.
2. The old `Layout` group no longer exists; its entries live under `Regions` or `Patterns`.
3. No Region or Pattern hand-rolls flex/grid/max-width/elevation — they compose layout primitives.
4. `TwoColumnLayout` is gone; "two column" is `Columns count={2}`.
5. The drift catalogue from Phase 0 is resolved (one token/primitive per concept, no silent variants).

> One line for the review thread: *Header isn't layout — it's a region that composes layout. "Two column" is a
> number, not a component. Charter, laws 01 + 02.*
