import React from 'react';
import styles from './FilterBar.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterOption {
  /** Unique identifier — used as checkbox value when no slug */
  id: string;
  /** Human-readable display label */
  label: string;
  /**
   * URL-friendly slug. Used as the value in URL params for reference facets.
   * Falls back to `id` when absent (enum / scalar facets).
   */
  slug?: string;
  /** Number of matching items with this option applied */
  count: number;
  /** Optional hex colour for the swatch indicator (project / category) */
  colorHex?: string;
}

export interface FilterFacet {
  /** Unique facet identifier — used as the URL param key */
  id: string;
  /** Human-readable facet label shown as the fieldset legend */
  label: string;
  /** Available options for this facet */
  options: FilterOption[];
}

export interface FilterModel {
  /** Ordered list of facets to render */
  facets: FilterFacet[];
}

export interface FilterBarProps {
  /**
   * The filter model built by `buildFilterModel()` in apps/web.
   * Determines which facets and options are displayed.
   */
  filterModel: FilterModel | null | undefined;
  /**
   * Map of facetId → array of active option values (slug or id).
   * All state lives in the parent (typically synced to URL params).
   */
  activeFilters: Record<string, string[]>;
  /**
   * Called when a checkbox is toggled.
   * @param facetId   — which facet the option belongs to
   * @param value     — the option's slug or id
   * @param checked   — new checked state
   */
  onFilterChange: (facetId: string, value: string, checked: boolean) => void;
  /** Called when the "Clear all" button is clicked */
  onClearAll: () => void;
}

// ─── FacetGroup — one <fieldset> per facet ────────────────────────────────────

interface FacetGroupProps {
  facet: FilterFacet;
  activeFilters: Record<string, string[]>;
  onFilterChange: FilterBarProps['onFilterChange'];
}

const FacetGroup: React.FC<FacetGroupProps> = ({ facet, activeFilters, onFilterChange }) => {
  const activeValues = activeFilters[facet.id] ?? [];

  return (
    <fieldset className={styles.facetGroup}>
      <legend className={styles.facetLabel}>{facet.label}</legend>
      <ul className={styles.optionList} role="list">
        {facet.options.map((option) => {
          // Reference facets use slug as the URL param value;
          // enum facets fall back to id.
          const paramValue = option.slug ?? option.id;
          const checked = activeValues.includes(paramValue);
          const inputId = `filter-${facet.id}-${paramValue}`;

          return (
            <li key={option.id} className={styles.optionItem}>
              <input
                type="checkbox"
                id={inputId}
                name={facet.id}
                value={paramValue}
                checked={checked}
                onChange={(e) => onFilterChange(facet.id, paramValue, e.target.checked)}
                className={styles.optionCheckbox}
              />
              <label
                htmlFor={inputId}
                className={styles.optionLabel}
                style={option.colorHex ? ({ '--chip-color': option.colorHex } as React.CSSProperties) : undefined}
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
          );
        })}
      </ul>
    </fieldset>
  );
};

// ─── FilterBar ────────────────────────────────────────────────────────────────

export const FilterBar: React.FC<FilterBarProps> = ({
  filterModel,
  activeFilters,
  onFilterChange,
  onClearAll,
}) => {
  if (!filterModel?.facets?.length) return null;

  // Only render facets that have at least one option
  const visibleFacets = filterModel.facets.filter(
    (f) => f.options && f.options.length > 0
  );

  if (visibleFacets.length === 0) return null;

  const hasActiveFilters = Object.values(activeFilters).some(
    (values) => values && values.length > 0
  );

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
  );
};
