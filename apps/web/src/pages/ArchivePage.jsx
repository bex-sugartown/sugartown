/**
 * ArchivePage — unified archive template driven by Sanity `archivePage` documents.
 *
 * Replaces the three hardcoded archive components (KnowledgeGraphArchivePage,
 * ArticlesArchivePage, CaseStudiesArchivePage). Each archive route now resolves
 * to a published archivePage doc in Sanity; if no doc is found (or it has been
 * unpublished) the route renders 404.
 *
 * Routes that use this component:
 *   /articles          → archivePage slug: articles        contentTypes: [post]
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
 *   - Filter UI, featured items, and rich hero are deferred to Stage 4/5.
 */
import { Link } from 'react-router-dom'
import { useSanityDoc, useSanityList } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import SeoHead from '../components/SeoHead'
import { getCanonicalPath } from '../lib/routes'
import { archivePageBySlugQuery } from '../lib/queries'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

// ─── Archive listing queries (one per content type) ───────────────────────────
//
// These are intentionally minimal for Stage 3. Richer projections (categories,
// tags, featuredImage) are added in Stage 4 when the filter bar arrives.

const ARCHIVE_QUERIES = {
  node: `
    *[_type == "node" && defined(slug.current)] | order(publishedAt desc)[0...50] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      aiTool,
      conversationType,
      publishedAt
    }
  `,
  post: `
    *[_type == "post" && defined(slug.current)] | order(publishedAt desc)[0...50] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      publishedAt
    }
  `,
  caseStudy: `
    *[_type == "caseStudy" && defined(slug.current)] | order(publishedAt desc)[0...50] {
      _id,
      title,
      "slug": slug.current,
      excerpt,
      client,
      role
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
  node: 'node',
  post: 'post',
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
    </Link>
  )
}

// ─── ArchiveListing — fetches + renders items for the bound content type ──────

function ArchiveListing({ contentType }) {
  const query = ARCHIVE_QUERIES[contentType]
  const { data: items, loading } = useSanityList(query || null)
  const docType = CONTENT_TYPE_TO_DOC_TYPE[contentType]

  if (!query || !docType) {
    if (import.meta.env.DEV) {
      console.warn(`[ArchivePage] Unknown contentType: "${contentType}" — no listing query defined`)
    }
    return <p className={styles.archiveEmpty}>Archive type not yet supported.</p>
  }

  if (loading) return <p className={styles.archiveEmpty}>Loading…</p>

  if (!items || items.length === 0) {
    return (
      <p className={styles.archiveEmpty}>
        Nothing published yet. Check back soon.
      </p>
    )
  }

  return (
    <div className={styles.archiveGrid}>
      {items.map((item) => (
        <ItemCard key={item._id} item={item} docType={docType} />
      ))}
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
        <ArchiveListing contentType={primaryType} />
      ) : (
        <p className={styles.archiveEmpty}>
          No content type configured for this archive.
        </p>
      )}
    </main>
  )
}
