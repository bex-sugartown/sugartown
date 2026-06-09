/**
 * ArchiveGridDocs — Overview-only Guidelines helper for archive card grid layout.
 *
 * Section status:
 *   Overview  — COMPLETE (inventory verified from source, SUG-159 Phase 1)
 *   Usage Guidelines — PENDING: API not frozen (ContentCard cardOptions API in flux)
 *   Accessibility — PENDING: API not frozen
 *   Design Tokens — PENDING: API not frozen
 *
 * Gate status: Gate 1 (API stability) — NOT PASSED. ArchivePage cardOptions
 * fields (showExcerpt, showHeroImage, imageOverride, categoryPosition) are not
 * yet frozen. Do not expand beyond Overview until cardOptions API is stable.
 */

// Section dependencies:
// Overview describes ArchivePage vs legacy page distinction — do not omit.
// Overview lists the three layout variants (grid / list / graph) — Usage Guidelines
//   §toggle behaviour must reference these exact names when written.

import React from 'react';
import {
  DocSection,
  OverviewItem, NotItem,
  docStyles as s,
} from './docs';

export function ArchiveGridGuidelinesPage() {
  return (
    <div style={s.page}>

      <h1 style={{ fontFamily: 'var(--st-font-family-narrative)', fontSize: '2.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        Archive Grid Layout
      </h1>
      <p style={s.prose}>Card grid layout rules for archive listing pages — ArchivePage template.</p>

      <DocSection n="01" title="Overview" priority="must">
        <p style={s.prose}>
          Archive listing pages use a two-tier layout: a <strong>bordered section container</strong> (<code style={s.code}>.archiveSection</code>) wrapping a <strong>toolbar</strong> and a <strong>content area</strong>. The content area is a flex-wrap layout with an optional <code style={s.code}>FilterBar</code> sidebar (220px) and a growing content column.
        </p>

        <h3 style={s.h3}>Primary template</h3>
        <p style={s.prose}>
          All archive routes (<code style={s.code}>/articles</code>, <code style={s.code}>/case-studies</code>, <code style={s.code}>/knowledge-graph</code>, <code style={s.code}>/library</code>) use <strong>ArchivePage.jsx</strong> — a single template driven by a Sanity <code style={s.code}>archivePage</code> document. The three legacy page files (<code style={s.code}>ArticlesArchivePage</code>, <code style={s.code}>CaseStudiesArchivePage</code>, <code style={s.code}>KnowledgeGraphArchivePage</code>) are retained as 404 fallbacks only and must not be used as a pattern reference.
        </p>

        <h3 style={s.h3}>Card component</h3>
        <p style={s.prose}>
          Archive items are rendered by <code style={s.code}>ContentCard</code> — not by raw <code style={s.code}>Card</code>. ContentCard wraps Card with taxonomy chip rendering, draft badge support, and layout variant switching. Never reach past ContentCard to render archive items directly with Card.
        </p>

        <h3 style={s.h3}>Three layout variants</h3>
        <ul style={s.list}>
          <OverviewItem><strong>Grid</strong> (default) — <code style={s.code}>repeat(auto-fill, minmax(340px, 1fr))</code>. 2-up at typical desktop widths. Persisted in <code style={s.code}>sessionStorage</code> per archive slug.</OverviewItem>
          <OverviewItem><strong>List</strong> — <code style={s.code}>grid-template-columns: 1fr</code> via <code style={s.code}>[data-layout="list"]</code>. ContentCard renders with <code style={s.code}>variant="listing"</code>.</OverviewItem>
          <OverviewItem><strong>Graph</strong> — <code style={s.code">?view=graph</code> URL param. Replaces grid with KnowledgeGraph canvas + 230px card rail. Available on node archives and Library.</OverviewItem>
        </ul>

        <h3 style={s.h3}>Archive page width</h3>
        <p style={s.prose}>
          The page wrapper (<code style={s.code}>.archivePage</code>) uses <code style={s.code}>max-width: 1164px</code> — wider than detail pages (<code style={s.code}>var(--st-width-detail)</code> = 760px) to accommodate the 220px FilterBar sidebar alongside a 2-column card grid. Do not apply <code style={s.code}>container-type: inline-size</code> near the top of the archive DOM — this interferes with flex-grow negotiation and collapses the content column.
        </p>

        <h3 style={s.h3}>What this pattern is for</h3>
        <ul style={s.list}>
          <OverviewItem>Multi-item listing pages where all items share a type (articles, nodes, case studies) or a curated set of types (Library)</OverviewItem>
          <OverviewItem>Pages driven by a Sanity <code style={s.code}>archivePage</code> document with configurable card options</OverviewItem>
          <OverviewItem>Pages that need URL-driven filtering and pagination</OverviewItem>
        </ul>

        <h3 style={s.h3}>What this pattern is not for</h3>
        <ul style={s.list}>
          <NotItem>Taxonomy listing pages (people, tags, categories) — use TaxonomyArchivePage pattern</NotItem>
          <NotItem>Glossary — uses definition-list (<code style={s.code}>dl/dt/dd</code>) semantics, not card grid</NotItem>
          <NotItem>Detail pages — use <code style={s.code}>.detailPage</code> / <code style={s.code}>.entityDetailPage</code> wrappers</NotItem>
        </ul>

        {/* PENDING sections — do not fill until Gate 1 passes */}
        {/* Usage Guidelines — PENDING: API not frozen */}
        {/* Accessibility — PENDING: API not frozen */}
        {/* Design Tokens — PENDING: API not frozen */}
      </DocSection>

    </div>
  );
}
