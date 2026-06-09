/**
 * FilterBarDocs — Overview-only Guidelines helper for FilterBar + filterModel usage.
 *
 * Section status:
 *   Overview  — COMPLETE (inventory verified from source, SUG-159 Phase 1)
 *   Usage Guidelines — PENDING: API not frozen (filterModel facet schema evolving)
 *   Accessibility — PENDING: API not frozen
 *   Design Tokens — PENDING: API not frozen
 *
 * Gate status: Gate 1 (API stability) — NOT PASSED. The filterModel facet
 * schema (facet types, option shape, AND/OR logic) is not frozen. The
 * useFilterState / applyFilters API is stable but the filterModel builder
 * input contract is subject to change as new facet types are added.
 * Do not expand beyond Overview until the facet schema is frozen.
 */

// Section dependencies:
// Overview describes the 4-layer architecture — Usage Guidelines must reference
//   each layer by the exact names used here when written.
// Overview explains client-side filtering model — Accessibility §keyboard
//   section must note that filter state lives in URL params (shareable/bookmarkable).

import React from 'react';
import {
  DocSection,
  OverviewItem, NotItem,
  docStyles as s,
} from './docs';

export function FilterBarGuidelinesPage() {
  return (
    <div style={s.page}>

      <h1 style={{ fontFamily: 'var(--st-font-family-narrative)', fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        FilterBar &amp; Filter Model
      </h1>
      <p style={s.prose}>Filter UI wiring for archive listing pages — how FilterBar, filterModel, useFilterState, and applyFilters fit together.</p>

      <DocSection n="01" title="Overview" priority="must">
        <p style={s.prose}>
          The archive filter system has four layers. Each is a separate concern — do not conflate them:
        </p>

        <h3 style={s.h3}>1. URL state — <code style={s.code}>useFilterState()</code></h3>
        <p style={s.prose}>
          Manages active filters and current page as URL query params (<code style={s.code}>?category=X&amp;tag=Y&amp;page=2</code>). Filter state is serialised into the URL so it is bookmarkable and shareable. Source: <code style={s.code}>apps/web/src/lib/useFilterState.js</code>.
        </p>

        <h3 style={s.h3}>2. Filter model — <code style={s.code}>buildFilterModel(archiveDoc, rawItems)</code></h3>
        <p style={s.prose}>
          Derives available facets (taxonomy groups + their options) from the live content set. Takes the Sanity <code style={s.code}>archivePage</code> document (which controls which facets are enabled) and the raw items array (which provides the available options). Returns a <code style={s.code}>filterModel</code> object consumed by <code style={s.code}>FilterBar</code>. Source: <code style={s.code}>apps/web/src/lib/filterModel.js</code>.
        </p>

        <h3 style={s.h3}>3. Filter application — <code style={s.code}>applyFilters(allItems, activeFilters)</code></h3>
        <p style={s.prose}>
          Client-side AND/OR logic applied to the full (unpaginated) content set. All items are fetched once from Sanity; filtering and pagination happen in the browser. This means filter counts are always accurate — they reflect the full published set, not a page slice. Source: <code style={s.code}>apps/web/src/lib/applyFilters.js</code>.
        </p>

        <h3 style={s.h3}>4. UI — <code style={s.code}>FilterBar</code></h3>
        <p style={s.prose}>
          DS component that renders facet groups as checkbox or button lists. Receives <code style={s.code}>filterModel</code>, <code style={s.code}>activeFilters</code>, <code style={s.code}>onFilterChange</code>, and <code style={s.code}>onClearAll</code>. Only rendered when <code style={s.code}>filterModel.facets.some(f =&gt; f.options.length &gt; 0)</code> — FilterBar does not render on empty archives. Source: <code style={s.code}>apps/web/src/design-system/components/FilterBar/</code>.
        </p>
        <p style={s.prose}>
          FilterBar sits in a flex sidebar at <strong>220px</strong> (<code style={s.code}>.archiveLayout &gt; aside { flex: 0 0 220px }</code>). The content column grows to fill remaining space (<code style={s.code}>flex: 1 1 400px</code>). The layout wraps intrinsically when the container is narrower than 652px (220 + 32 gap + 400) — no media query needed.
        </p>

        <h3 style={s.h3}>Taxonomy data in archive queries</h3>
        <p style={s.prose}>
          Every archive query must include <code style={s.code}>TAXONOMY_PROJECTION</code> for filtering to work. The projection dereferences authors, categories, tags, projects, and tools as arrays of <code style={s.code}>{'{ _id, name, slug, colorHex }'}</code> objects. Without these fields on each item, <code style={s.code}>applyFilters</code> cannot match taxonomy facets.
        </p>
        <ul style={s.list}>
          <OverviewItem>Always project taxonomy as dereferenced arrays — <strong>not</strong> as raw reference arrays</OverviewItem>
          <OverviewItem>Include <code style={s.code}>ENUM_PROJECTION</code> (<code style={s.code}>client</code>, <code style={s.code}>status</code>) for archives that expose those facets</OverviewItem>
          <OverviewItem><code style={s.code}>facetsRawQuery</code> fetches raw items for filterModel construction separately from the main listing query — both fetches are required</OverviewItem>
        </ul>

        <h3 style={s.h3}>When FilterBar does not render</h3>
        <ul style={s.list}>
          <OverviewItem>No facets configured on the <code style={s.code}>archivePage</code> Sanity doc</OverviewItem>
          <OverviewItem>Archive has content but no items belong to any taxonomy (all facet option arrays are empty)</OverviewItem>
          <OverviewItem>Taxonomy archives (TaxonomyArchivePage) — they use <code style={s.code}>AlphaFilter</code> (letter filter) instead</OverviewItem>
          <OverviewItem>Glossary archive — uses local category chip filter, not FilterBar</OverviewItem>
        </ul>

        {/* PENDING sections — do not fill until Gate 1 passes */}
        {/* Usage Guidelines — PENDING: filterModel facet schema not frozen */}
        {/* Accessibility — PENDING: API not frozen */}
        {/* Design Tokens — PENDING: API not frozen */}
      </DocSection>

    </div>
  );
}
