# CSS Class Naming Conventions

> Applies to all CSS module files in `apps/web/src/pages/` and `apps/web/src/components/`.
> These rules are enforced by `pnpm validate:css-names`.

---

## The core rule: name the pattern, not the call site

A CSS class name is a contract. The first time a pattern appears, it's tempting to name the class after the page or content type it's used in — `.taxRow`, `.alphaBtn`, `.toolUrl`. This is always wrong. That name will:

1. Be copy-pasted verbatim into the next page that needs the same pattern
2. Diverge silently when one copy gets updated and the other doesn't
3. Block reuse because the name implies a context that doesn't apply elsewhere

**Name the structural pattern.** If you can't describe the class without mentioning what page it's on or what content type it holds, the name is wrong.

| Wrong (call-site scoped) | Correct (pattern scoped) |
|---|---|
| `.taxRow` | `.flatListRow` |
| `.alphaBtn` | `.letterFilterBtn` |
| `.toolUrl` | `.entityUrl` or `.externalLink` |
| `.profileHeadline` | `.narrativeHeading` (already in `pages.module.css`) |
| `.taxonomyPage` | `.collectionDetailPage` |
| `.folioHead` | `.entityFolio` (already in `pages.module.css`) |

---

## Naming patterns by surface type

### Page shell classes

Page-level layout wrappers should describe the structural template, not the content domain.

- `.collectionDetailPage` — Tier 1 collection index detail page (tags, categories, glossary)
- `.collectionDetailHeader` — header block within a collection detail page
- `.entityDetailPage` — Tier 2 entity profile page shell (projects, tools, people)

### List and grid patterns

- `.flatColGrid` — N-column flat alphabetical grid (no grouping headers visible by default)
- `.flatColGridSingle` — single-column variant of the flat column grid (filter active)
- `.flatColList` — the `<ul>` column inside a flat column grid
- `.flatListRow` — dense mono-label row in a flat list (name + optional sublabel + count)
- `.flatListRowLabel` — primary label within a flat list row (mono font)
- `.flatListRowSub` — secondary sublabel within a flat list row (UI font, muted)
- `.flatListRowCount` — right-aligned count badge within a flat list row

### Letter filter strip

The letter filter strip (`LetterFilterStrip` component) is the app-layer implementation of the `IndexGroup` + `IndexCell` DS primitive (pending SUG-125). Class names follow the pattern once the DS primitive ships.

- `.letterFilterStrip` — the container strip
- `.letterFilterBtn` — base button cell (shared between active and inactive)
- `.letterFilterBtnActive` — cell with content (interactive, unpressed)
- `.letterFilterBtnSelected` — cell with content (interactive, currently selected filter)
- `.letterFilterBtnInactive` — cell without content (non-interactive `<span>`, `aria-hidden`)

### Folio and entity identity

- `.entityFolio` — shared in `pages.module.css` — the folio row (thumbnail + identity column)
- `.entityThumbnail` — shared in `pages.module.css` — the logo/avatar image
- `.folioIdentity` — shared in `pages.module.css` — the identity text column (`min-width: 0`)
- `.collectionAccentBar` — the colored accent bar on collection detail pages
- `.collectionTypeLabel` — the mono eyebrow label ("CATEGORY", "TAG")

---

## The proposal table gate

Before writing any new CSS class in a page module, you must produce this table and wait for explicit approval:

| Proposed class name | Closest existing pattern | Reuse decision |
|---|---|---|
| `.myNewClass` | `pages.module.css .entityFolio` (80% match) | Extend existing |
| `.listRow` | None found — new semantic pattern | New class approved |

**Do not make any `Edit` call to a CSS module file until the table is shown and approved.** This is enforced in CLAUDE.md.

---

## Blocked prefixes (enforced by `pnpm validate:css-names`)

The validator flags class names in `apps/web/src/pages/` that match these content-type prefixes:

| Prefix | Why blocked | Use instead |
|---|---|---|
| `tax*` | Taxonomy context — first use was tags/categories | `flatList*`, `flatCol*`, `collection*` |
| `alpha*` | AlphaStrip context — first use was letter filter | `letterFilter*`, `indexCell*` (post-SUG-125) |
| `toolLogo*` | ToolDetailPage context | `entityThumbnail`, `entityLogo` |
| `toolUrl*` | ToolDetailPage context | `entityUrl`, `externalLink` |
| `profileHeadline*` | PersonProfilePage context | `narrativeHeading` (in `pages.module.css`) |

To permanently allow a bespoke class that matches a blocked prefix (with documented rationale), add it to `KNOWN_EXCEPTIONS` in `apps/web/scripts/validate-css-names.js`.

---

## Where shared classes live

`apps/web/src/pages/pages.module.css` is the shared registry for page-level layout classes. Before adding a new class to any page module, check here first.

Current shared classes relevant to taxonomy/entity pages:
`entityDetailPage`, `entityFolio`, `entityThumbnail`, `entityThumbnailFallback`, `folioIdentity`, `narrativeHeading`, `entityDescription`, `detailEyebrow`, `backLink`, `archiveEmpty`, `archiveGrid`, `loadingPage`

---

## DS primitives vs page-level patterns

| Layer | Home | When to use |
|---|---|---|
| DS primitive | `packages/design-system/src/components/` | Pattern used across app and DS package; has Storybook story; versioned |
| Web adapter | `apps/web/src/design-system/components/` | App-specific variant of a DS primitive |
| Shared page class | `apps/web/src/pages/pages.module.css` | Layout pattern used by 2+ page templates |
| Page-local class | `apps/web/src/pages/XxxPage.module.css` | Visual detail truly unique to one page |

A page-local class that appears in 2+ files is a promotion candidate for `pages.module.css`. A page-local class that is structurally identical to a DS primitive is a replacement candidate.
