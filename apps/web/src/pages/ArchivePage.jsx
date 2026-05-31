/**
 * ArchivePage — unified archive template driven by Sanity `archivePage` documents.
 *
 * Replaces the three hardcoded archive components (KnowledgeGraphArchivePage,
 * ArticlesArchivePage, CaseStudiesArchivePage). Each archive route now resolves
 * to a published archivePage doc in Sanity; if no doc is found (or it has been
 * unpublished) the route renders 404.
 *
 * Routes that use this component:
 *   /articles          → archivePage slug: articles        contentTypes: [article]
 *   /case-studies      → archivePage slug: case-studies    contentTypes: [caseStudy]
 *   /knowledge-graph   → archivePage slug: knowledge-graph contentTypes: [node]
 *
 * L1/L2 model:
 *   L1 = this archive page (driven by archivePage doc)
 *   L2 = individual content item (ArticlePage, CaseStudyPage, NodePage)
 *
 * Publish/unpublish suppression:
 *   Unpublishing an archivePage doc causes this component to render 404.
 *   No extra "hideFromNav" toggles needed — publish state IS the switch.
 *
 * Architecture notes:
 *   - archivePage.contentTypes is an array to support multi-type archives in future.
 *     For now we use contentTypes[0] as the primary type for listing queries.
 *   - The listing query map (ARCHIVE_QUERIES) is the single place to add new types.
 *   - Filter UI and pagination are driven by URL query params via useFilterState.
 *   - All items are fetched once; filtering and pagination are client-side.
 *
 * Stage 7: ARCHIVE_QUERIES upgraded with taxonomy projections (categories, tags,
 *   projects). ContentCard renders TaxonomyChips for uniform classification display.
 *
 * Stage 8: URL-driven filter system added.
 *   - useFilterState() manages filter + page state in URL query params
 *   - applyFilters() applies AND/OR logic client-side across fetched items
 *   - buildFilterModel() derives available facets from live content
 *   - FilterBar renders taxonomy filter controls
 *   - Pagination renders page navigation
 *   - GROQ slice cap removed — all published items fetched for filtering accuracy
 */
import { useState, useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSanityDoc, useSanityList, useDraftIds } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { generateJsonLd } from '../lib/jsonLd'
import SeoHead from '../components/SeoHead'
import ContentCard from '../components/ContentCard'
import FilterBar from '../components/FilterBar'
import Pagination from '../components/Pagination'
import { archivePageBySlugQuery, facetsRawQuery } from '../lib/queries'
import { buildFilterModel } from '../lib/filterModel'
import { useFilterState } from '../lib/useFilterState'
import { applyFilters, paginateItems } from '../lib/applyFilters'
import DraftBadge from '../components/DraftBadge'
import { PortableText } from '@portabletext/react'
import portableTextComponents from '../lib/portableTextComponents'
import NotFoundPage from './NotFoundPage'
import KnowledgeGraph from '../components/KnowledgeGraph/KnowledgeGraph'
import statsJson from '../generated/stats.json'
import styles from './pages.module.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12

// ─── Archive listing queries (one per content type) ───────────────────────────
//
// No GROQ slice cap — all published items are fetched so client-side filtering
// works across the full content set. Pagination controls the display slice.
//
// Stage 7: taxonomy fields (categories, tags, projects) added to all queries.
// Stage 8 fix: authors added to TAXONOMY_PROJECTION so applyFilters can match
// against item.authors[] — previously omitted, causing author filter to never match.
// Stage 3's minimal projections have been upgraded — TaxonomyChips now renders
// classification chips on each archive card.

const TAXONOMY_PROJECTION = `
  "authors": authors[]->{_id, name, "slug": slug.current},
  "categories": categories[]->{_id, name, "slug": slug.current, colorHex},
  "tags": tags[]->{_id, name, "slug": slug.current},
  "projects": projects[]->{_id, name, "slug": slug.current, colorHex},
  "tools": tools[]->{_id, name, "slug": slug.current}
`

// Enum fields needed by applyFilters for client/status facets.
// Must be projected on every ARCHIVE_QUERY so applyFilters can match against them.
// (facetsRawQuery projects these for counts; ARCHIVE_QUERIES must project them for filtering.)
// Note: tools moved to TAXONOMY_PROJECTION — now a reference array, not a string enum.
const ENUM_PROJECTION = `
  client,
  status
`

const ARCHIVE_QUERIES = {
  article: `
    *[_type == "article" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      excerpt,
      publishedAt,
      ${TAXONOMY_PROJECTION},
      ${ENUM_PROJECTION}
    }
  `,
  node: `
    *[_type == "node" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      excerpt,
      aiTool,
      conversationType,
      publishedAt,
      ${TAXONOMY_PROJECTION},
      ${ENUM_PROJECTION}
    }
  `,
  caseStudy: `
    *[_type == "caseStudy" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      _type,
      title,
      "slug": slug.current,
      excerpt,
      role,
      ${TAXONOMY_PROJECTION},
      ${ENUM_PROJECTION}
    }
  `,
}

// Map archivePage contentType value → routes.js docType for getCanonicalPath
const CONTENT_TYPE_TO_DOC_TYPE = {
  article: 'article',
  node: 'node',
  caseStudy: 'caseStudy',
}

// ─── ArchiveListing — fetches, filters, paginates, and renders items ──────────

function ArchiveListing({ contentType, archiveDoc, archiveSlug }) {
  const contentTypes = archiveDoc?.contentTypes ?? []
  const isMultiType = contentTypes.length > 1

  const query = ARCHIVE_QUERIES[contentType]
  const docType = CONTENT_TYPE_TO_DOC_TYPE[contentType]

  // Single-type fetch (existing archives — articles, nodes, case-studies)
  const { data: singleItems, loading: singleLoading } = useSanityList(!isMultiType ? (query || null) : null)

  // Multi-type fetches (Library) — always called; null when not applicable.
  // Three unconditional hooks so React's hook call order never changes.
  const { data: articleItems, loading: articleLoading } = useSanityList(
    isMultiType && contentTypes.includes('article') ? ARCHIVE_QUERIES.article : null
  )
  const { data: nodeItems, loading: nodeLoading } = useSanityList(
    isMultiType && contentTypes.includes('node') ? ARCHIVE_QUERIES.node : null
  )
  const { data: caseStudyItems, loading: caseStudyLoading } = useSanityList(
    isMultiType && contentTypes.includes('caseStudy') ? ARCHIVE_QUERIES.caseStudy : null
  )

  // Merged + sorted items for multi-type; passthrough for single-type
  const allItems = useMemo(() => {
    if (!isMultiType) return singleItems ?? []
    return [
      ...(articleItems ?? []),
      ...(nodeItems ?? []),
      ...(caseStudyItems ?? []),
    ].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
  }, [isMultiType, singleItems, articleItems, nodeItems, caseStudyItems])

  const itemsLoading = isMultiType
    ? (articleLoading || nodeLoading || caseStudyLoading)
    : singleLoading

  // Draft detection — uses primary contentType (contentTypes[0]) for single; article for multi
  const draftIds = useDraftIds(contentType)

  // Fetch raw items for FilterModel (includes authors + relatedProjects for legacy merge)
  const { data: rawItems, loading: rawLoading } = useSanityList(
    contentTypes.length > 0 ? facetsRawQuery : null,
    contentTypes.length > 0 ? { contentTypes } : {}
  )

  // URL-driven filter + pagination state
  const {
    activeFilters,
    currentPage,
    hasActiveFilters,
    setFilter,
    clearAll,
    setPage,
  } = useFilterState()

  // Layout toggle: default from Sanity displayStyle, user can override.
  // Persists user choice in sessionStorage keyed to the archive slug.
  const defaultLayout = archiveDoc?.displayStyle === 'list' ? 'list' : 'grid'
  const [layout, setLayout] = useState(() => {
    try {
      return sessionStorage.getItem(`archive-layout-${archiveSlug}`) || defaultLayout
    } catch {
      return defaultLayout
    }
  })

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout)
    try {
      sessionStorage.setItem(`archive-layout-${archiveSlug}`, newLayout)
    } catch {
      // sessionStorage not available
    }
  }

  // Graph ↔ grid view toggle — persisted in ?view=graph URL param
  const [searchParams, setSearchParams] = useSearchParams()
  const view = searchParams.get('view') === 'graph' ? 'graph' : 'grid'
  // Multi-type archives allow graph view regardless of type; single-type only for nodes
  const isGraphView = view === 'graph' && (isMultiType || contentType === 'node')
  const setView = useCallback((v) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (v === 'graph') next.set('view', 'graph')
      else next.delete('view')
      return next
    }, { replace: true })
  }, [setSearchParams])

  // Node-only graph for single-type /nodes archive
  const nodeGraph = useMemo(() => {
    if (!statsJson?.siteGraph?.nodes) return null
    const nodes = statsJson.siteGraph.nodes.filter(
      n => n.type !== 'item' || n.docType === 'node'
    )
    const nodeIds = new Set(nodes.map(n => n.id))
    const edges = (statsJson.siteGraph.edges ?? []).filter(
      e => nodeIds.has(e.source) && nodeIds.has(e.target)
    )
    return { ...statsJson.siteGraph, nodes, edges }
  }, [])

  // Full siteGraph for multi-type archives (Library)
  const fullGraph = useMemo(() => statsJson?.siteGraph ?? null, [])

  // Selected graph node (full node object) for card rail
  const [selectedGraphNode, setSelectedGraphNode] = useState(null)
  const handleNodeClick = useCallback((node) => {
    setSelectedGraphNode(node ?? null)
  }, [])

  if (!isMultiType && (!query || !docType)) {
    if (import.meta.env.DEV) {
      console.warn(`[ArchivePage] Unknown contentType: "${contentType}" — no listing query defined`)
    }
    return <p className={styles.archiveEmpty}>Archive type not yet supported.</p>
  }

  if (itemsLoading || rawLoading) return <p className={styles.archiveEmpty}>Loading…</p>

  // Build FilterModel from archiveDoc config + raw content items
  const filterModel = buildFilterModel(archiveDoc, rawItems ?? [])

  // Apply active filters (client-side AND/OR logic)
  const filteredItems = applyFilters(allItems ?? [], activeFilters)

  // Paginate the filtered result
  const { pageItems, totalPages, totalItems } = paginateItems(
    filteredItems,
    currentPage,
    PAGE_SIZE
  )

  const hasFilterUI = filterModel.facets.some((f) => f.options.length > 0)
  const selectedItem = selectedGraphNode?.type === 'item'
    ? (allItems ?? []).find(i => i.slug === selectedGraphNode.id.replace(/^item:/, '')) ?? null
    : null

  const contentTypeLabel = isMultiType ? 'ITEMS' : contentType === 'article' ? 'ARTICLES' : contentType === 'caseStudy' ? 'CASE STUDIES' : 'NODES'
  const graphCtaHref = isMultiType ? '/knowledge-graph' : `/knowledge-graph?type=${contentType}`

  return (
    <div className={styles.archiveSection}>
      <div className={styles.archiveToolbar}>
        <div className={styles.layoutToggleGroup}>
          <button
            type="button"
            className={`${styles.layoutToggleBtn} ${!isGraphView && layout === 'grid' ? styles.layoutToggleBtnActive : ''}`}
            onClick={() => { if (isGraphView) { setView('grid'); setSelectedGraphNode(null) }; handleLayoutChange('grid') }}
            aria-label="Grid view"
            aria-pressed={!isGraphView && layout === 'grid'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" />
              <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.layoutToggleBtn} ${!isGraphView && layout === 'list' ? styles.layoutToggleBtnActive : ''}`}
            onClick={() => { if (isGraphView) { setView('grid'); setSelectedGraphNode(null) }; handleLayoutChange('list') }}
            aria-label="List view"
            aria-pressed={!isGraphView && layout === 'list'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="1" y="2" width="14" height="2.5" rx="1" fill="currentColor" />
              <rect x="1" y="6.75" width="14" height="2.5" rx="1" fill="currentColor" />
              <rect x="1" y="11.5" width="14" height="2.5" rx="1" fill="currentColor" />
            </svg>
          </button>
          <Link to={graphCtaHref} className={styles.layoutToggleBtn} aria-label="View in knowledge graph">
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
          </Link>
        </div>
        <span className={styles.archiveToolbarKicker}>{totalItems} {contentTypeLabel}</span>
      </div>

      <div className={styles.archiveSectionContent}>
      {isGraphView ? (
        <div className={styles.graphViewLayout}>
          <div className={styles.graphPane}>
            {(isMultiType ? fullGraph : nodeGraph) && (
              <KnowledgeGraph
                graphData={isMultiType ? fullGraph : nodeGraph}
                onNodeClick={handleNodeClick}
              />
            )}
          </div>
          <div className={styles.graphCardRail}>
            {!selectedGraphNode && (
              <div className={styles.graphCardRailHint}>
                Select a node to preview
              </div>
            )}
            {selectedGraphNode?.type === 'item' && selectedItem && (
              <ContentCard
                item={selectedItem}
                docType={docType}
                density="compact"
                showHeroImage={false}
                showExcerpt={false}
              />
            )}
            {(selectedGraphNode?.type === 'project' || selectedGraphNode?.type === 'category') && (
              <div className={styles.graphHubCard}>
                <span className={styles.graphHubCardType}>{selectedGraphNode.type}</span>
                <p className={styles.graphHubCardTitle}>{selectedGraphNode.label}</p>
                <Link to={selectedGraphNode.href} className={styles.graphHubCardCta}>
                  View {selectedGraphNode.label} →
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.archiveLayout}>
          {/* FilterBar — only render if facets have options */}
          {hasFilterUI && (
            <FilterBar
              filterModel={filterModel}
              activeFilters={activeFilters}
              onFilterChange={setFilter}
              onClearAll={clearAll}
            />
          )}

          <div className={styles.archiveContent}>
            {/* Empty state */}
            {pageItems.length === 0 ? (
              <div className={styles.archiveEmpty}>
                {hasActiveFilters ? (
                  <>
                    <p>No results for the selected filters.</p>
                    <button
                      type="button"
                      onClick={clearAll}
                      className={styles.clearFiltersLink}
                    >
                      Clear filters
                    </button>
                  </>
                ) : (
                  <p>Nothing published yet. Check back soon.</p>
                )}
              </div>
            ) : (
              <div className={styles.archiveGrid} data-layout={layout}>
                {pageItems.map((item) => (
                  <ContentCard
                    key={item._id}
                    item={item}
                    docType={isMultiType ? CONTENT_TYPE_TO_DOC_TYPE[item._type] : docType}
                    variant={layout === 'list' ? 'listing' : 'default'}
                    showExcerpt={archiveDoc?.cardOptions?.showExcerpt ?? true}
                    showHeroImage={archiveDoc?.cardOptions?.showHeroImage ?? true}
                    imageOverride={archiveDoc?.cardOptions?.imageOverride ?? null}
                    categoryPosition={archiveDoc?.cardOptions?.categoryPosition}
                    draftIds={draftIds}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      )}
      </div>{/* /archiveSectionContent */}
    </div>
  )
}

// ─── ArchivePage — main component ─────────────────────────────────────────────

export default function ArchivePage({ archiveSlug }) {
  const { data: archiveDoc, loading, notFound } = useSanityDoc(
    archivePageBySlugQuery,
    { slug: archiveSlug }
  )
  const siteSettings = useSiteSettings()

  const seo = resolveSeo(archiveDoc ?? null, siteSettings)

  // archivePage not found or unpublished → 404
  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !archiveDoc) return <NotFoundPage />

  const primaryType = archiveDoc.contentTypes?.[0]

  // Hero heading: prefer hero.heading override, fall back to doc title
  const heading = archiveDoc.hero?.heading || archiveDoc.title
  const subheading = archiveDoc.hero?.subheading || archiveDoc.description

  return (
    <main className={styles.archivePage}>
      <SeoHead seo={seo} jsonLd={generateJsonLd(null, siteSettings)} />

      <header className={styles.masthead}>
        {archiveDoc.eyebrow && (
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowCurrent}>{archiveDoc.eyebrow}</span>
          </p>
        )}
        <h1 className={`${styles.archiveHeading} ${styles.archiveHeadingItalic}`}>{heading}<DraftBadge docId={archiveDoc._id} /></h1>
        {subheading && (
          Array.isArray(subheading)
            ? <div className={styles.archiveDescription}><PortableText value={subheading} components={portableTextComponents} /></div>
            : <p className={styles.archiveDescription}>{subheading}</p>
        )}
      </header>

      {primaryType ? (
        <ArchiveListing contentType={primaryType} archiveDoc={archiveDoc} archiveSlug={archiveSlug} />
      ) : (
        <p className={styles.archiveEmpty}>
          No content type configured for this archive.
        </p>
      )}

    </main>
  )
}
