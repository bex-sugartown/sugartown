/**
 * Pages/ArchivePage — unified archive template (ArchivePage.jsx).
 *
 * Documents the archive states used by /articles, /case-studies, /nodes,
 * and the combined Library archive. Each story renders the real production
 * class structure — archiveSection bordered container, archiveToolbar with
 * layout toggles, archiveLayout flex row (FilterBar aside + archiveContent),
 * archiveGrid (auto-fill CSS grid), and Pagination.
 *
 * Production routes:
 *   /articles          → contentType: article
 *   /case-studies      → contentType: caseStudy
 *   /nodes             → contentType: node  (was /knowledge-graph)
 *   /library           → contentType: multi (article + node + caseStudy)
 */
import { MemoryRouter } from 'react-router-dom'
import { Container, FilterBar, Breadcrumb } from '../design-system'
import ContentCard from './ContentCard'
import Pagination from './Pagination'
import { mockArticles, mockNodes, mockCaseStudies, allMockItems } from './__fixtures__/mockContentCards'
import { mockFilterModel, mockActiveFilters } from './__fixtures__/mockFilterModel'
import React from 'react'
import pageStyles from '../pages/pages.module.css'

function withRouter(StoryFn) { return React.createElement(MemoryRouter, null, React.createElement(StoryFn)) }

export default {
  title: 'Pages/ArchivePage',
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'wide' },
  },
  decorators: [withRouter],
}

// ─── SVG icons (inline — no icon library dependency in stories) ───────────────

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
    <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
  </svg>
)

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1" y="2" width="14" height="2.5" rx="1" fill="currentColor" />
    <rect x="1" y="6.75" width="14" height="2.5" rx="1" fill="currentColor" />
    <rect x="1" y="11.5" width="14" height="2.5" rx="1" fill="currentColor" />
  </svg>
)

const GraphIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <line x1="8" y1="8" x2="2.5" y2="3.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7"/>
    <line x1="8" y1="8" x2="13.5" y2="3.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7"/>
    <line x1="8" y1="8" x2="2.5" y2="12.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7"/>
    <line x1="8" y1="8" x2="13.5" y2="12.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7"/>
    <line x1="2.5" y1="3.5" x2="13.5" y2="12.5" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.35"/>
    <circle cx="8" cy="8" r="2.5" fill="currentColor"/>
    <circle cx="2.5" cy="3.5" r="1.5" fill="currentColor"/>
    <circle cx="13.5" cy="3.5" r="1.5" fill="currentColor"/>
    <circle cx="2.5" cy="12.5" r="1.5" fill="currentColor"/>
    <circle cx="13.5" cy="12.5" r="1.5" fill="currentColor"/>
  </svg>
)

// ─── Shared archive shell — mirrors ArchivePage.jsx render structure ───────────
//
// Layout: archiveSection (border) → archiveToolbar → archiveSectionContent
//   → archiveLayout (flex row) → FilterBar aside + archiveContent (flex-grow)
//   → archiveGrid (auto-fill CSS grid, data-layout attr) + Pagination
//
// This is the production component tree — stories must reflect it, not <Grid>.

function ArchiveShell({
  kicker,
  breadcrumbs,
  items,
  docType,
  layout = 'grid',
  hasFilterBar = false,
  totalPages = 1,
  empty = false,
}) {
  return (
    <main>
      <Container size="archive">
        <Breadcrumb items={breadcrumbs} />
        <div className={pageStyles.archiveSection}>
          <div className={pageStyles.archiveToolbar}>
            <div className={pageStyles.layoutToggleGroup}>
              <button
                type="button"
                className={`${pageStyles.layoutToggleBtn} ${layout === 'grid' ? pageStyles.layoutToggleBtnActive : ''}`}
                aria-label="Grid view"
                aria-pressed={layout === 'grid'}
              >
                <GridIcon />
              </button>
              <button
                type="button"
                className={`${pageStyles.layoutToggleBtn} ${layout === 'list' ? pageStyles.layoutToggleBtnActive : ''}`}
                aria-label="List view"
                aria-pressed={layout === 'list'}
              >
                <ListIcon />
              </button>
              <button
                type="button"
                className={pageStyles.layoutToggleBtn}
                aria-label="View in knowledge graph"
              >
                <GraphIcon />
              </button>
            </div>
            <span className={pageStyles.archiveToolbarKicker}>{kicker}</span>
          </div>

          <div className={pageStyles.archiveSectionContent}>
            <div className={pageStyles.archiveLayout}>
              {hasFilterBar && (
                <FilterBar
                  filterModel={mockFilterModel}
                  activeFilters={mockActiveFilters}
                  onFilterChange={() => {}}
                  onClearAll={() => {}}
                />
              )}
              <div className={pageStyles.archiveContent}>
                {empty ? (
                  <p className={pageStyles.archiveEmpty}>No results found. Try adjusting your filters.</p>
                ) : (
                  <div className={pageStyles.archiveGrid} data-layout={layout}>
                    {items.map((item) => (
                      <ContentCard
                        key={item._id}
                        item={item}
                        docType={docType ?? item._type}
                        variant={layout === 'list' ? 'listing' : 'default'}
                      />
                    ))}
                  </div>
                )}
                {!empty && totalPages > 1 && (
                  <Pagination currentPage={1} totalPages={totalPages} onPageChange={() => {}} />
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}

// ─── Articles Archive — grid view ─────────────────────────────────────────────

export const ArticlesArchive = {
  name: 'Articles Archive (/articles) — grid',
  render: () => (
    <ArchiveShell
      kicker={`${mockArticles.length} ARTICLES`}
      breadcrumbs={[{ label: 'Library', href: '/library' }, { label: 'Articles' }]}
      items={mockArticles}
      docType="article"
      layout="grid"
      hasFilterBar
      totalPages={3}
    />
  ),
}

// ─── Articles Archive — list view (FilterBar + list layout) ──────────────────

export const ArticlesArchiveList = {
  name: 'Articles Archive (/articles) — list',
  render: () => (
    <ArchiveShell
      kicker={`${mockArticles.length} ARTICLES`}
      breadcrumbs={[{ label: 'Library', href: '/library' }, { label: 'Articles' }]}
      items={mockArticles}
      docType="article"
      layout="list"
      hasFilterBar
      totalPages={3}
    />
  ),
}

// ─── Nodes Archive (/nodes, was /knowledge-graph) ─────────────────────────────

export const NodesArchive = {
  name: 'Nodes Archive (/nodes)',
  render: () => (
    <ArchiveShell
      kicker={`${mockNodes.length} NODES`}
      breadcrumbs={[{ label: 'Library', href: '/library' }, { label: 'Nodes' }]}
      items={mockNodes}
      docType="node"
      layout="grid"
      hasFilterBar
      totalPages={1}
    />
  ),
}

// ─── Case Studies Archive ─────────────────────────────────────────────────────

export const CaseStudiesArchive = {
  name: 'Case Studies Archive (/case-studies)',
  render: () => (
    <ArchiveShell
      kicker={`${mockCaseStudies.length} CASE STUDIES`}
      breadcrumbs={[{ label: 'Work', href: '/case-studies' }, { label: 'Case Studies' }]}
      items={mockCaseStudies}
      docType="caseStudy"
      layout="grid"
      hasFilterBar
      totalPages={1}
    />
  ),
}

// ─── Library Combined Archive (multi-type) ────────────────────────────────────

export const LibraryArchive = {
  name: 'Library Archive (multi-type)',
  render: () => (
    <ArchiveShell
      kicker={`${allMockItems.length} ITEMS`}
      breadcrumbs={[{ label: 'Library' }]}
      items={allMockItems}
      layout="grid"
      hasFilterBar
      totalPages={2}
    />
  ),
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export const EmptyState = {
  name: 'Empty State (no results)',
  render: () => (
    <ArchiveShell
      kicker="0 ARTICLES"
      breadcrumbs={[{ label: 'Library', href: '/library' }, { label: 'Articles' }]}
      items={[]}
      docType="article"
      hasFilterBar
      empty
    />
  ),
}
