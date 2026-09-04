# Design Handoff Template

**Origin:** SUG-163. Every decision routes back to a source of truth the validators enforce,
because design reading inferred state is what produced SUG-162's seven errors.

**How to use:** copy this file, fill in the bracketed sections, delete instructions.
The epic author reviews it at Phase 0 gate before any JSX is written.

---

## Header

| Field | Value |
|---|---|
| Page / surface | `[e.g. /glossary/:slug — GlossaryTermPage]` |
| Doc type | `[e.g. glossaryTerm]` |
| Canonical route pattern | `[from routes.js getCanonicalPath — e.g. /glossary/:slug]` |
| Handoff file(s) | `[docs/drafts/SUG-NNN-*.html, README, Gap Analysis]` |
| Epic | `[SUG-NNN]` |

---

## Framework and stack statement

> Fill this in exactly — do not assume from the handoff.

| Layer | Value (copy verbatim) |
|---|---|
| Framework | React 19 |
| Bundler | Vite 7 |
| Router | react-router-dom 7 (`<Link>`, `<NavLink>`, `useParams`) — never raw `<a>` for internal routes |
| Routing model | SPA / BrowserRouter — no SSG, no server components, no file-based routing |
| Internal link construction | `getCanonicalPath({ docType, slug })` from `apps/web/src/lib/routes.js` — never literal path strings |
| CSS system | CSS Modules + `--st-*` design tokens — no inline styles, no Tailwind, no styled-components |

---

## Schema field table

> Source of truth: the generated content-model one-pager at `/platform/design-system/content-models`
> (Phase 1 of SUG-163). Until it is live, read `apps/studio/schemas/documents/<type>.ts` directly.
> Never infer fields from sample content.

| Field name | Type | Required | Notes / enum values |
|---|---|---|---|
| `[field]` | `[string \| text \| array \| reference \| slug \| image \| boolean]` | `[yes / no / initialValue]` | `[enum values if options.list exists; display-field rule if reference]` |

**Reference display-field rule:** all five taxonomy types (`tag`, `category`, `person`, `project`, `tool`) use
`name` as the display field, never `title`. GROQ fragments alias as `"title": name`.

---

## Gap analysis — element-by-element

> Map every visual element in the handoff against the detail-page recipe
> (`docs/conventions/detail-page-recipe.md`). Column 3 must name the exact
> component or shared class. "New component" requires a written case that no
> existing component covers 80%+ of the use case.

| Visual element | Existing component / `pages.module.css` class | Proposed change | New CSS class needed? |
|---|---|---|---|
| Page shell | `pageStyles.entityDetailPage` | `[use / extend / replace]` | No |
| Back navigation | `<Breadcrumb>` | | No |
| H1 | `pageStyles.narrativeHeading` | | No |
| `[element from handoff]` | `[match from recipe or "none — see justification"]` | | `[Yes (proposal table required) / No]` |

**Column 4 rule:** any "Yes" row requires a naming proposal table approved before
the first `Edit` to a CSS module file (`.claude/rules/css-layout.md` §CSS class pre-implementation
reuse audit). New class names must be semantic and pass `pnpm validate:css-names`.

---

## Storybook story citations

> Reference existing stories by their exact sidebar path. Do not paste CSS or describe visual
> output in prose — cite the story that already shows it.

| Component / behaviour | Storybook path | Notes |
|---|---|---|
| `[e.g. DescriptionList ledger, 2-col]` | `Components/DescriptionList/Ledger` | |
| `[e.g. Chip status dot, Evergreen]` | `Components/Chip/StatusEvergreen` | |

---

## Token citations

> Hex values are not accepted in this table. Every colour, spacing, or typography
> decision must resolve to a `--st-*` token name. Verify the token exists:
> `grep "token-name" apps/web/src/design-system/styles/tokens.css`
>
> **For typography tokens: verify the computed value, not just the name.**
> After confirming the token exists, grep for its resolved value and cross-check
> against the DS typography convention story (`/story/foundations-typography-conventions--default`).
> Record both in column 3. A token at the wrong tier (e.g. `--st-font-heading-2` = 36px when
> the H1 spec is 48px) is a scope gap — fix it with a new semantic token before the handoff is accepted.

| Design decision | Token name | Resolves to (px / rem) — verified against DS convention |
|---|---|---|
| `[e.g. left-border accent colour]` | `--st-color-brand-primary` | `var(--st-color-pink)` |
| `[e.g. body spacing between sections]` | `--st-space-section-break-detail` | `2rem` |
| `[e.g. page H1 font size]` | `--st-font-page-h1` | `3rem (48px) — matches DS H1 spec` |

---

## Anti-checklist

> These are the seven classes of error from the SUG-162 handoff. Each item must be
> explicitly checked — "N/A" is a valid answer, but silence is not.

- [ ] **Framework assumed correctly?** The stack is React 19 + Vite 7 + react-router-dom 7.
  No Next.js, no SSG, no file-based routing, no `getServerSideProps`, no `<Image>` from next.
- [ ] **All URL construction uses `getCanonicalPath()`?** No literal path strings in
  components or config. `docType` values are not URL segments — `caseStudy` → `/case-studies/`,
  `person` → `/people/` — pluralisation is irregular, always use `TAXONOMY_NAMESPACES`.
- [ ] **Schema fields verified from source, not sample content?** Open
  `apps/studio/schemas/documents/<type>.ts` and confirm every proposed field exists.
  Fields inferred from a sample document (e.g. one Merriam-Webster entry) are not schema facts.
- [ ] **No new schema fields proposed without explicit gap?** If the handoff needs a field
  that doesn't exist, that is a schema epic, not a frontend epic. Name the missing field and
  flag it as out of scope before implementation starts.
- [ ] **Enum values match `options.list` exactly?** Read the schema's `validation` block.
  Status values, category slugs, and type enums are exact strings — do not add or remove values
  (e.g. `deprecated` is not a valid `glossaryTerm.status` value).
- [ ] **No content-type-prefixed CSS class names?** `.termDetailDl`, `.nodeHeader`,
  `.articleMeta` are blocked by `pnpm validate:css-names`. Use semantic names; run the
  proposal-table gate before any new class is written.
- [ ] **Portable Text is not a string?** Any body/definition field that is PT in the schema
  renders via `<PortableText>`. Do not propose a new structured array (senses, subsenses,
  bullets) to replace what PT's ordered list blocks already handle — shape content to the
  schema, not the reverse.
