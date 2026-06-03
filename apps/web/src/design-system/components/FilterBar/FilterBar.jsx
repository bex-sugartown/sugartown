/**
 * FilterBar — web adapter.
 *
 * Mirrors: packages/design-system/src/components/FilterBar/FilterBar.tsx
 *
 * No web-specific differences from the DS primitive (no router links, no
 * browser APIs). This adapter exists to place FilterBar in the web DS barrel
 * alongside other adapters and to own the CSS at the web layer.
 *
 * CSS: ./FilterBar.module.css — kept in sync with the DS package version.
 * If a CSS fix is needed, apply it to BOTH files:
 *   packages/design-system/src/components/FilterBar/FilterBar.module.css
 *   apps/web/src/design-system/components/FilterBar/FilterBar.module.css
 */
import styles from './FilterBar.module.css'

// ─── FacetGroup — one <fieldset> per taxonomy facet ──────────────────────────

function FacetGroup({ facet, activeFilters, onFilterChange }) {
  const activeValues = activeFilters[facet.id] ?? []

  return (
    <fieldset className={styles.facetGroup}>
      <legend className={styles.facetLabel}>{facet.label}</legend>
      <ul className={styles.optionList} role="list">
        {facet.options.map((option) => {
          // Reference facets use slug as the URL param value.
          // Enum facets have no slug — fall back to id (the raw string value).
          const paramValue = option.slug ?? option.id
          const checked = activeValues.includes(paramValue)
          const id = `filter-${facet.id}-${paramValue}`

          return (
            <li key={option.id} className={styles.optionItem}>
              <input
                type="checkbox"
                id={id}
                name={facet.id}
                value={paramValue}
                checked={checked}
                onChange={(e) =>
                  onFilterChange(facet.id, paramValue, e.target.checked)
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
                <span className={styles.optionName}>{option.label}</span>
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
  // eslint-disable-next-line no-unused-vars
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

  return (
    <aside className={styles.filterBar} aria-label="Filter content">
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
