/**
 * RootPage — renders a Sanity `page` document fetched by slug.
 * Route: /:slug  (root pages like /about, /contact, etc.)
 */
import { useParams } from 'react-router-dom'
import { pageBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import SeoHead from '../components/SeoHead'
import PageSections from '../components/PageSections'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

export default function RootPage() {
  const { slug } = useParams()
  const { data: page, loading, notFound } = useSanityDoc(pageBySlugQuery, { slug })
  const siteSettings = useSiteSettings()

  const seo = resolveSeo({
    docSeo: page?.seo ?? null,
    docTitle: page?.title ?? null,
    docType: 'page',
    docSlug: slug,
    siteDefaults: siteSettings,
  })

  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !page) return <NotFoundPage />

  return (
    <main>
      <SeoHead seo={seo} />

      {page.sections && page.sections.length > 0 ? (
        <PageSections sections={page.sections} />
      ) : (
        <div className={styles.detailPage}>
          <h1 className={styles.detailHeading}>{page.title}</h1>
        </div>
      )}
    </main>
  )
}
