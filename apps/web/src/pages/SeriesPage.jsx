/**
 * SeriesPage — landing page for a Sanity `series` document.
 * Route: /series/:slug
 *
 * Lists all articles in the series in part order.
 */
import { Link, useParams } from 'react-router-dom'
import { seriesBySlugQuery } from '../lib/queries'
import { useEffect } from 'react'
import { useSanityDoc } from '../lib/useSanityDoc'
import { setPreviewDoc } from '../lib/previewDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { getCanonicalPath } from '../lib/routes'
import SeoHead from '../components/SeoHead'
import NotFoundPage from './NotFoundPage'
import { Breadcrumb, PageHeader } from '../design-system'
import pageStyles from './pages.module.css'

const TYPE_LABELS = { article: 'Article', node: 'Node', caseStudy: 'Case Study', page: 'Page' }

function buildSeriesSeo(series, siteSettings) {
  if (!series) return null
  const siteSuffix = siteSettings?.siteTitle ? ` — ${siteSettings.siteTitle}` : ''
  const title = `${series.title}${siteSuffix}`
  const description = series.description ?? null
  return {
    title,
    description,
    canonicalUrl: null,
    robots: { index: true, follow: true },
    openGraph: { title, description, type: 'website', image: null },
  }
}

export default function SeriesPage() {
  const { slug } = useParams()
  const { data: series, loading, notFound } = useSanityDoc(seriesBySlugQuery, { slug })

  // Register doc for the preview banner Studio deep-link (dev-only; no-op in prod).
  useEffect(() => {
    if (series?._id) setPreviewDoc({ id: series._id, type: 'series' })
    return () => setPreviewDoc(null)
  }, [series?._id])
  const siteSettings = useSiteSettings()

  const seo = buildSeriesSeo(series ?? null, siteSettings)

  if (loading) return <div className={pageStyles.loadingPage}>Loading…</div>
  if (notFound || !series) return <NotFoundPage />

  const parts = series.parts ?? []

  return (
    <main className={pageStyles.entityDetailPage}>
      <SeoHead seo={seo} />

      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: 'Library', href: '/library' }, { label: 'Series' }]} />}
        eyebrow="Series"
        title={series.title}
        description={series.description ?? undefined}
      />

      {parts.length > 0 ? (
        <ol className={pageStyles.seriesPartList}>
          {parts.map((part, i) => (
            <li key={part._id} className={pageStyles.seriesPartItem}>
              <span className={pageStyles.seriesPartNumber}>
                Part {part.partNumber ?? i + 1}
              </span>
              <div className={pageStyles.seriesPartContent}>
                <span className={pageStyles.seriesPartType}>
                  {TYPE_LABELS[part._type] ?? part._type}
                </span>
                <Link
                  to={getCanonicalPath({ docType: part._type, slug: part.slug })}
                  className={pageStyles.seriesPartLink}
                >
                  {part.title}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className={pageStyles.archiveEmpty}>No parts in this series yet.</p>
      )}
    </main>
  )
}
