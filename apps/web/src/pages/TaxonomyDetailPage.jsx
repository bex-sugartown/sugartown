/**
 * TaxonomyDetailPage — unified detail page for all four taxonomy types.
 *
 * Routes served (via TaxonomyPlaceholderPage re-export):
 *   /tags/:slug          → type: tag,      query by slug.current
 *   /categories/:slug    → type: category, query by slug.current
 *   /projects/:slug      → type: project,  query by projectId (e.g. PROJ-001)
 *   /people/:slug        → type: person,   query by slug.current
 *
 * Architecture:
 *   1. Derives taxonomy type from URL path segment (pathname.split('/')[1])
 *   2. Fetches the taxonomy document by slug (or projectId for projects)
 *   3. Fetches all associated content via contentByTaxonomyQuery (_id match)
 *   4. Paginates client-side via paginateItems() — page state in URL (?page=N)
 *   5. Renders: TaxonomyHeader + content listing + Pagination
 *
 * Empty state: taxonomy exists but has no associated content → header + message (not 404)
 * Invalid slug: taxonomy doc not found → NotFoundPage (404)
 */
import { useParams, useLocation, Link } from 'react-router-dom'
import { useSanityDoc, useSanityList } from '../lib/useSanityDoc'
import { useFilterState } from '../lib/useFilterState'
import { paginateItems } from '../lib/applyFilters'
import { getCanonicalPath } from '../lib/routes'
import {
  tagBySlugQuery,
  categoryBySlugQuery,
  personBySlugQuery,
  projectByProjectIdQuery,
  contentByTaxonomyQuery,
} from '../lib/queries'
import TaxonomyChips from '../components/TaxonomyChips'
import Pagination from '../components/Pagination'
import NotFoundPage from './NotFoundPage'
import styles from './TaxonomyDetailPage.module.css'
import pageStyles from './pages.module.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12

// Maps URL path segment → taxonomy config
const TAXONOMY_CONFIG = {
  tags: {
    type: 'tag',
    label: 'Tag',
    pluralLabel: 'Tags',
    query: tagBySlugQuery,
    buildParams: (slug) => ({ slug }),
  },
  categories: {
    type: 'category',
    label: 'Category',
    pluralLabel: 'Categories',
    query: categoryBySlugQuery,
    buildParams: (slug) => ({ slug }),
  },
  people: {
    type: 'person',
    label: 'Person',
    pluralLabel: 'People',
    query: personBySlugQuery,
    buildParams: (slug) => ({ slug }),
  },
  projects: {
    type: 'project',
    label: 'Project',
    pluralLabel: 'Projects',
    query: projectByProjectIdQuery,
    // Projects are keyed by projectId in the URL (no slug field on project schema)
    buildParams: (slug) => ({ projectId: slug }),
  },
}

// Maps Sanity _type → docType key for getCanonicalPath()
const DOC_TYPE_MAP = {
  article: 'article',
  caseStudy: 'caseStudy',
  node: 'node',
}

// ─── TaxonomyHeader ───────────────────────────────────────────────────────────

function TaxonomyHeader({ taxDoc, config }) {
  const name = taxDoc.name ?? taxDoc.title ?? taxDoc.projectId ?? 'Untitled'
  const description = taxDoc.description ?? null
  const colorHex = taxDoc.colorHex ?? null
  const backPath = `/${config.type === 'person' ? 'people' : config.type + 's'}`

  return (
    <div className={styles.taxonomyHeader}>
      {colorHex && (
        <div
          className={styles.taxonomyColorBar}
          style={{ backgroundColor: colorHex }}
          aria-hidden="true"
        />
      )}
      <Link to={backPath} className={styles.backLink}>
        ← All {config.pluralLabel}
      </Link>
      <p className={styles.taxonomyTypeLabel}>{config.label}</p>
      <h1 className={styles.taxonomyTitle}>{name}</h1>
      {description && (
        <p className={styles.taxonomyDescription}>{description}</p>
      )}
    </div>
  )
}

// ─── ItemCard ─────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function ItemCard({ item }) {
  const docType = DOC_TYPE_MAP[item._type] ?? item._type
  const path = getCanonicalPath({ docType, slug: item.slug })

  return (
    <Link to={path} className={pageStyles.archiveCard}>
      <p className={pageStyles.archiveCardTitle}>{item.title}</p>
      {item.excerpt && (
        <p className={pageStyles.archiveCardExcerpt}>{item.excerpt}</p>
      )}
      <p className={pageStyles.archiveCardMeta}>
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

// ─── TaxonomyDetailPage ───────────────────────────────────────────────────────

export default function TaxonomyDetailPage() {
  const { slug } = useParams()
  const location = useLocation()

  // Derive taxonomy type from first path segment (e.g. "tags", "categories")
  const pathSegment = location.pathname.split('/')[1] ?? ''
  const config = TAXONOMY_CONFIG[pathSegment]

  // Resolve query + params up front — fall back to null query if config is unknown
  // so hooks are always called unconditionally (React rules-of-hooks requirement).
  const query = config?.query ?? null
  const params = config ? config.buildParams(slug) : {}

  // Fetch taxonomy document — query is null when config is unknown (returns { notFound: true })
  const { data: taxDoc, loading: taxLoading, notFound } = useSanityDoc(query, params)

  // Fetch all associated content once we have the taxonomy _id
  const taxonomyId = taxDoc?._id ?? null
  const { data: allItems, loading: itemsLoading } = useSanityList(
    taxonomyId ? contentByTaxonomyQuery : null,
    taxonomyId ? { taxonomyId } : {}
  )

  // URL-driven pagination state (reuses ?page=N param via useFilterState)
  const { currentPage, setPage } = useFilterState()

  // Unknown taxonomy path segment → 404 (after hooks)
  if (!config) return <NotFoundPage />

  if (taxLoading || itemsLoading) {
    return <div className={pageStyles.loadingPage}>Loading…</div>
  }

  if (notFound || !taxDoc) return <NotFoundPage />

  const items = allItems ?? []
  const { pageItems, totalPages } = paginateItems(items, currentPage, PAGE_SIZE)

  return (
    <main className={styles.taxonomyPage}>
      <TaxonomyHeader taxDoc={taxDoc} config={config} />

      <section className={styles.taxonomyContent}>
        {items.length === 0 ? (
          <p className={pageStyles.archiveEmpty}>
            No content associated with this {config.label.toLowerCase()} yet.
          </p>
        ) : (
          <>
            <p className={styles.taxonomyResultCount}>
              {items.length} item{items.length === 1 ? '' : 's'}
            </p>
            <div className={pageStyles.archiveGrid}>
              {pageItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </section>
    </main>
  )
}
