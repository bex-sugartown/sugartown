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
 *   projects). ItemCard now renders TaxonomyChips for uniform classification display.
 *
 * Stage 8: URL-driven filter system added.
 *   - useFilterState() manages filter + page state in URL query params
 *   - applyFilters() applies AND/OR logic client-side across fetched items
 *   - buildFilterModel() derives available facets from live content
 *   - FilterBar renders taxonomy filter controls
 *   - Pagination renders page navigation
 *   - GROQ slice cap removed — all published items fetched for filtering accuracy
 */
import { Link } from 'react-router-dom'
import { useSanityDoc, useSanityList } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import SeoHead from '../components/SeoHead'
import TaxonomyChips from '../components/TaxonomyChips'
import FilterBar from '../components/FilterBar'
import Pagination from '../components/Pagination'
import { getCanonicalPath } from '../lib/routes'
import { archivePageBySlugQuery, facetsRawQuery } from '../lib/queries'
import { buildFilterModel } from '../lib/filterModel'
import { useFilterState } from '../lib/useFilterState'
import { applyFilters, paginateItems } from '../lib/applyFilters'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12

// ─── Archive listing queries (one per content type) ───────────────────────────
//
// No GROQ slice cap — all published items are fetched so client-side filtering
// works across the full content set. Pagination controls the display slice.
//
// Stage 7: taxonomy fields (categories, tags, projects) added to all queries.
// Stage 3's minimal projections have been upgraded — TaxonomyChips now renders
// classification chips on each archive card.

const TAXONOMY_PROJECTION = `
  "categories": categories[]->{_id, name, "slug": slug.current, colorHex},
  "tags": tags[]->{_id, name, "slug": slug.current},
  "projects": projects[]->{_id, name, "slug": slug.current, colorHex}
`

const ARCHIVE_QUERIES = {
  article: `
    *[_type == "article" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      publishedAt,
      ${TAXONOMY_PROJECTION}
    }
  `,
  node: `
    *[_type == "node" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      aiTool,
      conversationType,
      publishedAt,
      ${TAXONOMY_PROJECTION}
    }
  `,
  caseStudy: `
    *[_type == "caseStudy" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      client,
      role,
      ${TAXONOMY_PROJECTION}
    }
  `,
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Map archivePage contentType value → routes.js docType for getCanonicalPath
const CONTENT_TYPE_TO_DOC_TYPE = {
  article: 'article',
  node: 'node',
  caseStudy: 'caseStudy',
}

// ─── ItemCard — renders one listing row for any content type ──────────────────

function ItemCard({ item, docType }) {
  const path = getCanonicalPath({ docType, slug: item.slug })
  return (
    <Link to={path} className={styles.archiveCard}>
      <p className={styles.archiveCardTitle}>{item.title}</p>
      {item.excerpt && (
        <p className={styles.archiveCardExcerpt}>{item.excerpt}</p>
      )}
      <p className={styles.archiveCardMeta}>
        {docType === 'node' && item.aiTool && `${item.aiTool} · `}
        {docType === 'caseStudy' && item.client && `${item.client} · `}
        {docType === 'caseStudy' && item.role && `${item.role} · `}
        {item.publishedAt && formatDate(item.publishedAt)}
      </p>
      <TaxonomyChips
        categories={item.categories}
        tags={item.tags}
        projects={item.projects}
      />
    </Link>
  )
}

// ─── ArchiveListing — fetches, filters, paginates, and renders items ──────────

function ArchiveListing({ contentType, archiveDoc }) {
  const query = ARCHIVE_QUERIES[contentType]
  const docType = CONTENT_TYPE_TO_DOC_TYPE[contentType]

  // Fetch all items for this content type (no slice — client-side filtering needs full set)
  const { data: allItems, loading: itemsLoading } = useSanityList(query || null)

  // Fetch raw items for FilterModel (includes authors + relatedProjects for legacy merge)
  const contentTypes = archiveDoc?.contentTypes ?? []
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

  if (!query || !docType) {
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

  return (
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
        {/* Result count — shown when filters are active */}
        {hasActiveFilters && (
          <p className={styles.archiveResultCount}>
            {totalItems === 0
              ? 'No results'
              : `${totalItems} result${totalItems === 1 ? '' : 's'}`}
          </p>
        )}

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
          <div className={styles.archiveGrid}>
            {pageItems.map((item) => (
              <ItemCard key={item._id} item={item} docType={docType} />
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
  )
}

// ─── ArchivePage — main component ─────────────────────────────────────────────

export default function ArchivePage({ archiveSlug }) {
  const { data: archiveDoc, loading, notFound } = useSanityDoc(
    archivePageBySlugQuery,
    { slug: archiveSlug }
  )
  const siteSettings = useSiteSettings()

  const seo = resolveSeo({
    docSeo: archiveDoc?.seo ?? null,
    docTitle: archiveDoc?.title ?? null,
    docType: 'archivePage',
    docSlug: archiveSlug,
    siteDefaults: siteSettings,
  })

  // archivePage not found or unpublished → 404
  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !archiveDoc) return <NotFoundPage />

  const primaryType = archiveDoc.contentTypes?.[0]

  // Hero heading: prefer hero.heading override, fall back to doc title
  const heading = archiveDoc.hero?.heading || archiveDoc.title
  const subheading = archiveDoc.hero?.subheading || archiveDoc.description

  return (
    <main className={styles.archivePage}>
      <SeoHead seo={seo} />

      <h1 className={styles.archiveHeading}>{heading}</h1>
      {subheading && (
        <p className={styles.archiveDescription}>{subheading}</p>
      )}

      {primaryType ? (
        <ArchiveListing contentType={primaryType} archiveDoc={archiveDoc} />
      ) : (
        <p className={styles.archiveEmpty}>
          No content type configured for this archive.
        </p>
      )}
    </main>
  )
}
