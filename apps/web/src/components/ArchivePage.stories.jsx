import React from 'react'
/**
 * Pages/ArchivePage — unified archive template (ArchivePage.jsx).
 *
 * Documents the five archive states used by /articles, /case-studies,
 * /knowledge-graph, and the combined Library archive. Each story renders
 * the real component tree against static mock fixtures — no Sanity data,
 * no router context needed for layout.
 *
 * Production routes:
 *   /articles          → contentType: article
 *   /case-studies      → contentType: caseStudy
 *   /knowledge-graph   → contentType: node
 *   /library           → contentType: multi (article + node + caseStudy)
 */
import { MemoryRouter } from 'react-router-dom'
import { Container, Grid, FilterBar, Breadcrumb } from '../design-system'
import ContentCard from './ContentCard'
import Pagination from './Pagination'
import { mockArticles, mockNodes, mockCaseStudies, allMockItems } from './__fixtures__/mockContentCards'
import { mockFilterModel, mockActiveFilters } from './__fixtures__/mockFilterModel'
import pageStyles from '../pages/pages.module.css'

function withRouter(StoryFn) { return React.createElement(MemoryRouter, null, React.createElement(StoryFn)) }

export default {
  title: 'Pages/ArchivePage',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withRouter],
}

// ─── Shared archive shell wrapper ─────────────────────────────────────────────

function ArchiveShell({ title, count, breadcrumbs, children, hasFilterBar = false }) {
  return (
    <main>
      <Container size="archive">
        <Breadcrumb items={breadcrumbs} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0 }}>{title}</h1>
          <span style={{ fontSize: '0.875rem', color: 'var(--st-color-text-secondary)' }}>{count}</span>
        </div>
        {hasFilterBar && (
          <FilterBar
            filterModel={mockFilterModel}
            activeFilters={mockActiveFilters}
            onFilterChange={() => {}}
            onClearAll={() => {}}
          />
        )}
        {children}
      </Container>
    </main>
  )
}

// ─── Articles Archive ─────────────────────────────────────────────────────────

export const ArticlesArchive = {
  name: 'Articles Archive (/articles)',
  render: () => (
    <ArchiveShell
      title="Articles"
      count={mockArticles.length}
      breadcrumbs={[{ label: 'Library', href: '/library' }, { label: 'Articles' }]}
      hasFilterBar
    >
      <Grid columns={3} tabletColumns={2} spacing="md">
        {mockArticles.map((item) => (
          <ContentCard key={item._id} item={item} docType="article" />
        ))}
      </Grid>
      <Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />
    </ArchiveShell>
  ),
}

// ─── Knowledge Graph Archive ──────────────────────────────────────────────────

export const KnowledgeGraphArchive = {
  name: 'Knowledge Graph Archive (/knowledge-graph)',
  render: () => (
    <ArchiveShell
      title="Knowledge Graph"
      count={mockNodes.length}
      breadcrumbs={[{ label: 'Library', href: '/library' }, { label: 'Knowledge Graph' }]}
      hasFilterBar
    >
      <Grid columns={3} tabletColumns={2} spacing="md">
        {mockNodes.map((item) => (
          <ContentCard key={item._id} item={item} docType="node" />
        ))}
      </Grid>
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    </ArchiveShell>
  ),
}

// ─── Case Studies Archive ─────────────────────────────────────────────────────

export const CaseStudiesArchive = {
  name: 'Case Studies Archive (/case-studies)',
  render: () => (
    <ArchiveShell
      title="Case Studies"
      count={mockCaseStudies.length}
      breadcrumbs={[{ label: 'Work', href: '/case-studies' }, { label: 'Case Studies' }]}
    >
      <Grid columns={3} tabletColumns={2} spacing="md">
        {mockCaseStudies.map((item) => (
          <ContentCard key={item._id} item={item} docType="caseStudy" />
        ))}
      </Grid>
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    </ArchiveShell>
  ),
}

// ─── Taxonomy Archive (Library combined) ─────────────────────────────────────

export const TaxonomyArchive = {
  name: 'Library Combined Archive (multi-type)',
  render: () => (
    <ArchiveShell
      title="Library"
      count={allMockItems.length}
      breadcrumbs={[{ label: 'Library' }]}
      hasFilterBar
    >
      <Grid columns={3} tabletColumns={2} spacing="md">
        {allMockItems.map((item) => (
          <ContentCard key={item._id} item={item} docType={item._type} />
        ))}
      </Grid>
      <Pagination currentPage={1} totalPages={2} onPageChange={() => {}} />
    </ArchiveShell>
  ),
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export const EmptyState = {
  name: 'Empty State (no results)',
  render: () => (
    <ArchiveShell
      title="Articles"
      count={0}
      breadcrumbs={[{ label: 'Library', href: '/library' }, { label: 'Articles' }]}
      hasFilterBar
    >
      <p className={pageStyles.archiveEmpty}>No results found. Try adjusting your filters.</p>
    </ArchiveShell>
  ),
}
