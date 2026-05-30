/**
 * SeriesPage — landing page for a Sanity `series` document.
 * Route: /series/:slug
 *
 * Lists all articles in the series in part order.
 */
import { Link, useParams } from 'react-router-dom'
import { seriesBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { getCanonicalPath } from '../lib/routes'
import SeoHead from '../components/SeoHead'
import NotFoundPage from './NotFoundPage'
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
  const siteSettings = useSiteSettings()

  const seo = buildSeriesSeo(series ?? null, siteSettings)

  if (loading) return <div className={pageStyles.loadingPage}>Loading…</div>
  if (notFound || !series) return <NotFoundPage />

  const parts = series.parts ?? []

  return (
    <main className={pageStyles.entityDetailPage}>
      <SeoHead seo={seo} />

      <Link to="/articles" className={pageStyles.backLink}>
        ← All Articles
      </Link>

      <div className={pageStyles.folioIdentity}>
        <p className={pageStyles.detailEyebrow}>Series</p>
        <h1 className={pageStyles.narrativeHeading}>{series.title}</h1>
        {series.description && (
          <p className={pageStyles.entityDescription}>{series.description}</p>
        )}
      </div>

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
