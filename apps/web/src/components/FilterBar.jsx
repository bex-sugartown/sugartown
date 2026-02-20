/**
 * FilterBar — dumb, fully controlled filter UI component.
 *
 * Renders facet groups from a FilterModel. No data fetching inside.
 * All state lives in the parent (via useFilterState → URL).
 *
 * Props:
 *   filterModel    {object}   — from buildFilterModel(): { facets: [...] }
 *   activeFilters  {object}   — { [facetId]: string[] } from useFilterState
 *   onFilterChange {function} — (facetId, slug, checked) → void
 *   onClearAll     {function} — () → void
 *
 * Accessibility:
 *   - Each facet group is a <fieldset> with a <legend>
 *   - Each option is a native <input type="checkbox"> + <label>
 *   - "Clear all" is a semantic <button>
 *   - Visible focus states via CSS :focus-visible
 *
 * Chip color accents for project/category facets reuse the --chip-color
 * CSS custom property pattern from TaxonomyChips.
 */
import styles from './FilterBar.module.css'

// ─── FacetGroup — one <fieldset> per taxonomy facet ──────────────────────────

function FacetGroup({ facet, activeFilters, onFilterChange }) {
  const activeSlugs = activeFilters[facet.id] ?? []

  return (
    <fieldset className={styles.facetGroup}>
      <legend className={styles.facetLabel}>{facet.label}</legend>
      <ul className={styles.optionList} role="list">
        {facet.options.map((option) => {
          const checked = activeSlugs.includes(option.slug)
          const id = `filter-${facet.id}-${option.slug}`

          return (
            <li key={option.id} className={styles.optionItem}>
              <input
                type="checkbox"
                id={id}
                name={facet.id}
                value={option.slug}
                checked={checked}
                onChange={(e) =>
                  onFilterChange(facet.id, option.slug, e.target.checked)
                }
                className={styles.optionCheckbox}
              />
              <label
                htmlFor={id}
                className={styles.optionLabel}
                style={
                  option.colorHex
                    ? { '--chip-color': option.colorHex }
                    : undefined
                }
              >
                <span
                  className={[
                    styles.optionSwatch,
                    option.colorHex ? styles.optionSwatchColored : null,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
                <span className={styles.optionName}>{option.title}</span>
                <span className={styles.optionCount} aria-label={`${option.count} items`}>
                  ({option.count})
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}

// ─── FilterBar — main component ───────────────────────────────────────────────

export default function FilterBar({
  filterModel,
  activeFilters,
  onFilterChange,
  onClearAll,
}) {
  if (!filterModel || !filterModel.facets || filterModel.facets.length === 0) {
    return null
  }

  // Only render facets that have at least one option
  const visibleFacets = filterModel.facets.filter(
    (f) => f.options && f.options.length > 0
  )

  if (visibleFacets.length === 0) return null

  const hasActiveFilters = Object.values(activeFilters).some(
    (slugs) => slugs && slugs.length > 0
  )

  return (
    <aside className={styles.filterBar} aria-label="Filter content">
      <div className={styles.filterHeader}>
        <span className={styles.filterTitle}>Filter</span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className={styles.clearAllButton}
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      <div className={styles.facetList}>
        {visibleFacets.map((facet) => (
          <FacetGroup
            key={facet.id}
            facet={facet}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
          />
        ))}
      </div>
    </aside>
  )
}
