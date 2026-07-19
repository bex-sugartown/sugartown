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
 *   4. Category only (SUG-222): also fetches glossaryTerm docs referencing this
 *      category via glossaryTermsByCategoryQuery — kept separate from
 *      contentByTaxonomyQuery/ContentList because glossaryTerm's shape
 *      (term/no publish date/evergreen-validated-exploring) doesn't fit
 *      ContentList's row adapter.
 *   5. Paginates client-side via paginateItems() — page state in URL (?page=N)
 *   6. Renders: TaxonomyHeader + (category only) Glossary Terms section, first
 *      + content listing + Pagination
 *
 * Empty state: two-tier (SUG-222). Each section (Glossary Terms, Content)
 * hides independently when its own count is 0. The combined "no content"
 * message renders only when both are 0 — for non-category types, terms is
 * always [], so this reduces to the original items.length === 0 check.
 * Invalid slug: taxonomy doc not found → NotFoundPage (404)
 */
import { useParams, useLocation, Link } from 'react-router-dom'
import { useSanityDoc, useSanityList } from '../lib/useSanityDoc'
import { useFilterState } from '../lib/useFilterState'
import { paginateItems } from '../lib/applyFilters'
import {
  tagBySlugQuery,
  categoryBySlugQuery,
  personBySlugQuery,
  projectBySlugQuery,
  toolBySlugQuery,
  contentByTaxonomyQuery,
  glossaryTermsByCategoryQuery,
} from '../lib/queries'
import { resolveSeo } from '../lib/seo'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { getCanonicalPath } from '../lib/routes'
import SeoHead from '../components/SeoHead'
import ContentList from '../components/ContentList'
import Pagination from '../components/Pagination'
import NotFoundPage from './NotFoundPage'
import { Breadcrumb, PageHeader, Chip, SectionLabel } from '../design-system'
import pageStyles from './pages.module.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12
const MIN_INDEXABLE_ITEMS = 3

// Maps URL path segment → taxonomy config
const TAXONOMY_CONFIG = {
  tags: {
    type: 'tag',
    label: 'Tag',
    pluralLabel: 'Tags',
    archivePath: '/tags',
    query: tagBySlugQuery,
    buildParams: (slug) => ({ slug }),
  },
  categories: {
    type: 'category',
    label: 'Category',
    pluralLabel: 'Categories',
    archivePath: '/categories',
    query: categoryBySlugQuery,
    buildParams: (slug) => ({ slug }),
    // Category is the only taxonomy type glossaryTerm actually references
    // (glossaryTerm.categories[]) — SUG-222. Presence of this key is what
    // gates the "Glossary Terms" section and the "Content" sub-heading below;
    // other taxonomy types are unaffected.
    glossaryTermsQuery: glossaryTermsByCategoryQuery,
  },
  people: {
    type: 'person',
    label: 'Person',
    pluralLabel: 'People',
    archivePath: '/people',
    query: personBySlugQuery,
    buildParams: (slug) => ({ slug }),
  },
  projects: {
    type: 'project',
    label: 'Project',
    pluralLabel: 'Projects',
    archivePath: '/projects',
    query: projectBySlugQuery,
    buildParams: (slug) => ({ slug }),
  },
  tools: {
    type: 'tool',
    label: 'Tool',
    pluralLabel: 'Tools & Platforms',
    archivePath: '/tools',
    query: toolBySlugQuery,
    buildParams: (slug) => ({ slug }),
  },
}

// ─── TaxonomyHeader ───────────────────────────────────────────────────────────

function TaxonomyHeader({ taxDoc, config, itemCount }) {
  const name = taxDoc.name ?? taxDoc.title ?? taxDoc.projectId ?? 'Untitled'
  const description = taxDoc.description ?? null
  const backPath = config.archivePath

  const breadcrumb = config.type === 'person' ? (
    <Breadcrumb items={[{ label: config.pluralLabel, href: backPath }]} />
  ) : (
    <Breadcrumb items={[{ label: 'Library', href: '/library' }, { label: config.pluralLabel, href: backPath }]} />
  )

  return (
    <PageHeader
      breadcrumb={breadcrumb}
      title={name}
      count={itemCount > 0 ? itemCount : undefined}
      description={description ?? undefined}
    />
  )
}

// ─── TaxonomyDetailPage ───────────────────────────────────────────────────────

export default function TaxonomyDetailPage() {
  const { slug } = useParams()
  const location = useLocation()
  const siteSettings = useSiteSettings()

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

  // Glossary terms referencing this taxonomy doc — category only (SUG-222).
  // config?.glossaryTermsQuery is undefined for tags/projects/people/tools,
  // so this resolves to a null query and terms stays [] for those types,
  // leaving their behavior unchanged.
  const { data: allTerms, loading: termsLoading } = useSanityList(
    taxonomyId && config?.glossaryTermsQuery ? config.glossaryTermsQuery : null,
    taxonomyId && config?.glossaryTermsQuery ? { taxonomyId } : {}
  )

  // URL-driven pagination state (reuses ?page=N param via useFilterState)
  const { currentPage, setPage } = useFilterState()

  // Unknown taxonomy path segment → 404 (after hooks)
  if (!config) return <NotFoundPage />

  if (taxLoading || itemsLoading || termsLoading) {
    return <div className={pageStyles.loadingPage}>Loading…</div>
  }

  if (notFound || !taxDoc) return <NotFoundPage />

  const items = allItems ?? []
  const terms = allTerms ?? []
  const { pageItems, totalPages } = paginateItems(items, currentPage, PAGE_SIZE)

  // autoGenerate defaults to true — taxonomy docs rarely carry hand-authored seo fields.
  // Map name → title so resolveSeo can derive the meta title and canonical URL.
  const baseSeo = resolveSeo(
    { ...taxDoc, title: taxDoc.name, _type: config.type },
    siteSettings
  )
  // Combined count — a category with 0 content items but 9 glossary terms is
  // real content, not thin content (SUG-222; previously only items.length
  // was checked, which would have wrongly noindexed a page like Bextionary).
  const seo = items.length + terms.length < MIN_INDEXABLE_ITEMS
    ? { ...baseSeo, robots: { index: false, follow: true } }
    : baseSeo

  const bothEmpty = items.length === 0 && terms.length === 0

  return (
    <main className={pageStyles.entityDetailPage}>
      <SeoHead seo={seo} />
      <TaxonomyHeader taxDoc={taxDoc} config={config} itemCount={items.length + terms.length} />

      {bothEmpty ? (
        <p className={pageStyles.archiveEmpty}>
          No content associated with this {config.label.toLowerCase()} yet.
        </p>
      ) : (
        <>
          {/* Glossary Terms renders first, above Content — fixed order (SUG-222 Phase 0),
              independent of which section has data. Hidden entirely when 0 terms. */}
          {terms.length > 0 && (
            <section className={pageStyles.glossaryTermsSection}>
              <SectionLabel name="Glossary Terms" />
              <div className={pageStyles.tagList}>
                {terms.map((term) => (
                  <Chip
                    key={term._id}
                    variant="tag"
                    href={getCanonicalPath({ docType: 'glossaryTerm', slug: term.slug })}
                  >
                    {term.abbreviation ?? term.term}
                  </Chip>
                ))}
              </div>
            </section>
          )}

          {/* Content hidden entirely when 0 items — no heading, no "none yet" text. */}
          {items.length > 0 && (
            <section>
              {config.glossaryTermsQuery && <SectionLabel name="Content" />}
              <p className={pageStyles.archiveResultCount}>
                {items.length} item{items.length === 1 ? '' : 's'}
              </p>
              <ContentList items={pageItems} />
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </section>
          )}
        </>
      )}
    </main>
  )
}
