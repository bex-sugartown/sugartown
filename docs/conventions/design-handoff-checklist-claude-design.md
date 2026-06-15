# Design Handoff Checklist — for Claude Design

**Who this is for:** The Claude instance operating the Sugartown Design System project (claude.ai/design).
**Why it exists:** Handoffs that are visually correct but code-incorrect cause correction cycles in Claude Code. Every item below was broken at least once in a real handoff. Run this checklist before packaging any design output for implementation.

---

## The core rule

Claude Design produces visuals. Claude Code builds from source files. If the handoff invents anything that isn't in the source files — a token name, a schema field, a URL path, a component — Claude Code has to correct it before writing a line of code. That correction is waste. This checklist eliminates it.

When in doubt about whether something exists: **declare the uncertainty explicitly in the handoff.** "I don't know if `--st-color-seafoam-700` exists — verify before using" is a valid handoff note. Confident invention is not.

---

## Checklist — run before every handoff

### 1. Stack declaration (copy verbatim — never infer)

Every handoff must include this block unchanged. Do not adapt it. Do not assume a different framework.

```
Framework:        React 19
Bundler:          Vite 7
Router:           react-router-dom 7 — <Link> / <NavLink> / useParams
Routing model:    SPA / BrowserRouter — no SSG, no server components, no file-based routing
Internal links:   getCanonicalPath({ docType, slug }) from apps/web/src/lib/routes.js
CSS system:       CSS Modules + --st-* design tokens — no inline styles, no Tailwind
```

**Never:** reference Next.js, `<Image>` from next, `getServerSideProps`, file-based routing, Tailwind classes, or `<a href="/literal-path">` for internal links.

---

### 2. Tokens — names, not values

- [ ] Every colour, spacing, and typography decision is expressed as a `--st-*` token name, not a hex value or px number.
- [ ] Token names cited in the handoff are from `SYNC.md` or `_ds_manifest.json` — not invented from a pattern you recognise.
- [ ] If a token you want doesn't exist in the manifest, say so explicitly: "No token found for X — a new primitive may be needed." Do not coin a plausible-sounding name.
- [ ] For typography tokens: record both the token name and its resolved size (e.g. `--st-font-heading-2 = 2.25rem / 36px`). A token at the wrong tier is a real bug.
- [ ] **Never** use `style={{ '--st-token': '#hex' }}` inline — that bypasses the token graph entirely.

**What to provide:** a table of every design decision mapped to its token.

| Design decision | Token name | Resolves to |
|---|---|---|
| left-border accent | `--st-color-brand-primary` | `var(--st-color-pink)` |
| row hover background | `--st-color-lime-100` | `#f2ffbf` |

---

### 3. Schema fields — read, don't infer

- [ ] Every field named in the handoff exists in the deployed schema. If you can't confirm it, say "unverified — check `apps/studio/schemas/documents/<type>.ts`."
- [ ] Do not infer fields from a sample document (e.g. one article you read, one Merriam-Webster entry). Sample content is not schema.
- [ ] Enum values are exact strings — check `options.list` in the schema. Do not add values that look right (e.g. `active`, `deprecated`) without confirming they're in the enum.
- [ ] Reference field display: all five taxonomy types (`tag`, `category`, `person`, `project`, `tool`) use `name` as the display field — never `title`.
- [ ] If the design requires a field that probably doesn't exist, flag it: "This design needs a `subtitle` field — this may require a schema epic before implementation."

---

### 4. URLs and routing

- [ ] No literal path strings anywhere in the handoff (`'/articles'`, `'/case-studies/my-project'`). Route construction is always via `getCanonicalPath()`.
- [ ] URL namespace pluralisation is irregular — never guess by appending `'s'`:
  - `category` → `/categories/`
  - `person` → `/people/`
  - `caseStudy` → `/case-studies/`
  - `tag` → `/tags/`, `tool` → `/tools/`, `project` → `/projects/`
- [ ] Do not reference a route that isn't registered — check `SYNC.md` for known routes before naming one.

---

### 5. Components — cite, don't reinvent

- [ ] Before proposing a new component or container, check whether an existing one covers the use case. Known DS primitives (from `SYNC.md` / `_ds_manifest.json`): `Card`, `Chip`, `Button`, `DescriptionList`, `Table`, `Grid`, `SectionLabel`, `Callout`, `List` / `ListItem`, `MetadataCard`, `ContentCard`, `TaxonomyChips`.
- [ ] If an existing component covers 80%+ of the use case, propose extending it via a new prop — not forking it into a new component.
- [ ] Reference existing components by citing their **Storybook path**, not by pasting CSS or describing their appearance in prose.
  - Good: `Components/List/Register`
  - Bad: "a slim ledger row with a dotted separator and a pink hover title"
- [ ] Do not invent a component tree that doesn't exist. If you assume a wrapper component (`ContentCollection`, `CardGrid`) — verify it exists before including it in the handoff diagram.
- [ ] **Variant-first rule:** a visual variation of an existing DS primitive is always a new prop value, never a new component. "Same component, different header colour" = `tone="subdued"`, not `<SpecialTable>`.

---

### 6. CSS class names

- [ ] Do not propose class names prefixed by content type: `.termDetailDl`, `.nodeHeader`, `.articleMeta`, `.lv-*` are all blocked by the CSS validator.
- [ ] Do not propose location-scoped names: `.folioHead`, `.profileHeadline`, `.toolUrl`.
- [ ] Propose semantic, reusable names: `.entityFolio`, `.narrativeHeading`, `.detailEyebrow`.
- [ ] Mark any proposed class name as "proposal — subject to naming gate before implementation." Claude Code runs a formal proposal-table gate before writing any new CSS class.
- [ ] BEM is not used. CSS Modules only.

---

### 7. Portable Text is not a string

- [ ] Any body, definition, or long-form field that exists as Portable Text in the schema renders via `<PortableText>` — not as a plain string, not as a custom structured array.
- [ ] Do not propose replacing PT content with a new nested structure (senses, subsenses, bullet arrays) to achieve a visual effect. If PT's ordered list blocks already cover the pattern, use them.
- [ ] If you genuinely need structured content PT can't express, flag it as a schema epic.

---

### 8. Dark mode

- [ ] Every colour decision includes both light and dark values, mapped to tokens.
- [ ] Do not assume `--st-color-bg-surface` is solid in dark mode — some tokens have glassmorphism overrides in the Pink Moon dark theme. Flag any background token used for a label cell or header strip as "verify dark cascade."
- [ ] Known glassmorphism tokens (semi-transparent in dark-pink-moon): `--st-color-bg-surface`, `--st-color-bg-surface-strong`, `--st-card-bg`. Use a primitive token (e.g. `--st-color-midnight-800`) for solid surfaces.

---

### 9. What a complete handoff package contains

A handoff ready for Claude Code to implement without a correction cycle includes:

1. **Visual output** — HTML mock or screenshot showing the design
2. **Stack declaration** — verbatim block from §1 above
3. **Token table** — every design decision mapped to a `--st-*` token (§2)
4. **Schema field table** — every data field named, sourced from the schema (§3)
5. **Component gap analysis** — each visual element mapped to an existing component or class, with a written case if a new one is truly needed (§5)
6. **Proposed CSS class names** — marked as proposals, not decisions (§6)
7. **Anti-checklist sign-off** — explicit "N/A" or confirmation for each item in §1–8

If any section is missing, note it: "Schema fields unverified — Claude Code should read `apps/studio/schemas/documents/<type>.ts` before implementing." An honest gap is better than a confident invention.

---

## The seven failure modes (from real handoffs)

These are the error classes that have caused correction cycles. Each one adds a commit to the implementation before any feature code is written.

1. **Wrong framework** — assuming Next.js, SSG, or file-based routing. The stack is React SPA + Vite. There are no server components.
2. **Literal URL paths** — hardcoding `/articles` or `/case-studies/slug` instead of `getCanonicalPath()`.
3. **Invented schema fields** — naming fields that don't exist in the schema (`epistemicStatus`, `citation`, `extendedDefinitions`, `subtitle`). Always read the schema source.
4. **Wrong enum values** — adding status values that look plausible but aren't in `options.list` (e.g. `active` in a 5-value enum that has no `active`).
5. **Colliding token names** — proposing `--st-color-lime-100: #F2FFCB` when `--st-color-lime-100: #f2ffbf` already exists. Always check the manifest before naming a token.
6. **Content-type CSS class names** — `.termDetailDl`, `.lv-*`, `.nodeHeader`. These are blocked by the validator on commit.
7. **PT replacement** — proposing a custom array structure (senses, bullets, subsenses) for a field that is already Portable Text in the schema. Shape content to the schema.

---

## Reference files in this project

- `SYNC.md` — current token list, component inventory, known routes
- `_ds_manifest.json` — machine-readable DS manifest (tokens, components, schema doc types)
- `README.md` — project orientation

When in doubt, cite the file and let Claude Code verify. That is faster than correcting confident mistakes.
