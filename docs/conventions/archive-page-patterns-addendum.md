# Archive Page Patterns — Reuse Addendum

**Parent doc:** `docs/conventions/archive-page-patterns.md`
**Created:** 2026-06-09 — post-SUG-159 audit
**Purpose:** Identifies reuse gaps and consolidation recommendations found during the Phase 1 inventory.

Each item below names the specific divergence, the recommended fix, and whether it is a new epic or an in-situ correction.

---

## 1. ArchivePage masthead — should use PageHeader

**Gap:** `ArchivePage.jsx` assembles its masthead from raw HTML + `pages.module.css` classes (`.archiveHeading`, `.archiveHeadingItalic`, `.archiveDescription`). Every other archive and taxonomy page uses the `PageHeader` DS component.

**Current ArchivePage:**
```jsx
<header className={styles.masthead}>
  <Breadcrumb items={[{ label: 'Library', href: '/library' }]} />
  <h1 className={`${styles.archiveHeading} ${styles.archiveHeadingItalic}`}>{heading}</h1>
  <p className={styles.archiveDescription}>{subheading}</p>
</header>
```

**Should be:**
```jsx
<PageHeader
  breadcrumb={archiveSlug !== 'library' ? <Breadcrumb items={[{ label: 'Library', href: '/library' }]} /> : undefined}
  title={heading}
  description={subheading}
  italic
/>
```

**Consequence of fixing:** `.archiveHeading`, `.archiveHeadingItalic`, `.archiveDescription`, and `.masthead` in `pages.module.css` become dead classes (no callers). They can be removed in the same commit. DraftBadge placement needs verifying — it currently sits inline in the `<h1>`; PageHeader has a `badge` prop or the heading slot accepts children.

**Effort:** Small — one file change + CSS cleanup. No schema or data changes.

---

## 2. GlossaryArchivePage A-Z nav — should use AlphaFilter

**Gap:** The glossary has a hand-rolled A-Z nav (`<nav className={styles.azNav}>` with `<a href="#letter-x">` anchors for in-page scroll). The taxonomy pages use the `AlphaFilter` component built from DS `IndexGroup` + `IndexCell` primitives.

**Structural difference to resolve:** The glossary's current implementation is a *jump nav* (scroll to anchor); AlphaFilter is a *filter* (hides other groups). The tags page uses AlphaFilter in filter mode. Glossary should also use filter mode — it simplifies the component and matches the established pattern. The `<div id="letter-x">` anchors and `.azNav` CSS can be removed.

**Current:**
```jsx
<nav className={styles.azNav} aria-label="Jump to letter">
  {ALPHABET.map((letter) => (
    <a href={`#letter-${letter.toLowerCase()}`} className={...}>{letter}</a>
  ))}
</nav>
```

**Should be:**
```jsx
<AlphaFilter
  activeLetters={lettersWithTerms}
  filterLetter={filterLetter}
  onSelect={(l) => setFilterLetter(l === filterLetter ? null : l)}
/>
```

With `filterLetter` state wired into the `byLetter` grouping (same pattern as `FlatGrid` in `TaxonomyArchivePage`).

**Consequence:** Remove `.azNav`, `.azNavActive`, `.azNavEmpty` from `GlossaryPage.module.css`. Move `.indexGroup` container wrapper (already exists in `TaxonomyArchivePage.module.css`) — or import `AlphaFilter` and let it use its own wrapper. Remove `id="letter-x"` from `.letterGroup` divs (no longer needed for anchor links).

**Effort:** Small — swap nav implementation, wire filter state, remove 3 CSS classes.

---

## 3. GlossaryArchivePage category filter — should use DS Chip

**Gap:** The category filter row uses manual `<button>` elements with custom `.filterChip` / `.filterChipActive` CSS. The page already `import { Chip }` from `../design-system` but Chip is never used in the archive view (only in the term detail page).

**Current:**
```jsx
<button className={`${styles.filterChip}${!activeCategory ? ` ${styles.filterChipActive}` : ''}`}>
  All
</button>
```

**Should be:**
```jsx
<Chip
  variant="tag"
  featured={!activeCategory}
  onClick={() => setActiveCategory(null)}
  as="button"
>
  All
</Chip>
```

This removes `.filterChip` and `.filterChipActive` from `GlossaryPage.module.css` (14 lines of CSS that duplicate the Chip token system) and ensures the filter chips inherit all DS Chip states, dark-mode tokens, and focus behaviour automatically.

**Effort:** Small — swap button elements, remove two CSS classes.

---

## 4. Letter section header — parallel implementations should converge

**Gap:** Two visual patterns serve the same purpose (letter heading + horizontal rule) with no shared implementation:

| Surface | Markup | CSS |
|---------|--------|-----|
| Glossary | `<div className={styles.letterAnchor}>{letter}</div>` | `.letterAnchor` — narrative font, brand-primary, `border-bottom: 2px` |
| Taxonomy (tags) | `<div className={styles.indexHeader}><span className={styles.indexHeaderGlyph}>{letter}</span><div className={styles.indexHeaderRule} /></div>` | `.indexHeaderGlyph` + `.indexHeaderRule` |

Both render: large letter in brand-primary, narrative font, with a horizontal rule extending to the right.

**Recommendation:** Extract to a shared `<LetterSectionHeader letter={letter} />` component in `apps/web/src/components/`. Both pages adopt it. The component is simple enough (one letter + one rule) that a DS component is not warranted — an app-level component in `components/` is correct scope.

**Effort:** Small — new 20-line component, swap in two files.

---

## 5. termList / termDt / termDd — semantic difference is correct, keep as-is

**Not a gap.** The glossary uses `<dl>/<dt>/<dd>` definition list semantics, which is semantically correct for a glossary. The taxonomy pages use `<ul>/<li>` row lists. These differ in HTML semantics and visual structure (term + indented definition vs label + right-aligned count). Consolidating these would sacrifice semantic correctness for cosmetic similarity. The `.termList`, `.termDt`, `.termDd` classes in `GlossaryPage.module.css` are correct as-is.

---

## 6. archivePageWide — consolidate the "wide page" modifier

**Minor.** `TaxonomyArchivePage.module.css` has `.archivePageWide` which sets `max-width: var(--st-width-detail-wide)`. `GlossaryArchivePage` does not currently use a wide wrapper (it uses `width: 100%` with no max-width on `.archivePage`). If glossary grows to a 3-column index layout (like tags), it should adopt the same `.archivePageWide` modifier from `TaxonomyArchivePage.module.css` — not add a new CSS class in `GlossaryPage.module.css`.

This is a future-proofing note, not an immediate fix.

---

## Priority order

| # | Change | Files affected | Effort |
|---|--------|---------------|--------|
| 1 | ArchivePage → use PageHeader | `ArchivePage.jsx`, `pages.module.css` | Small |
| 2 | GlossaryArchivePage → AlphaFilter | `GlossaryArchivePage.jsx`, `GlossaryPage.module.css` | Small |
| 3 | GlossaryArchivePage → DS Chip for filter | `GlossaryArchivePage.jsx`, `GlossaryPage.module.css` | Small |
| 4 | LetterSectionHeader component | new `components/LetterSectionHeader.jsx`, `GlossaryArchivePage.jsx`, `TaxonomyArchivePage.jsx` | Small |
| 5 | archivePageWide on Glossary | `GlossaryArchivePage.jsx` | Trivial (deferred) |

Items 1–4 are all CSS/component-reuse corrections with no data, schema, or route changes. They can be batched into a single cleanup commit or done as part of the SUG-35 Phase 2 close-out.
