/**
 * HomePage — renders the site homepage.
 *
 * Fetches the Sanity `page` with slug "home" if it exists, otherwise
 * falls back to a generic empty state. The `NodesExample` component
 * is preserved from the original App.jsx for parity.
 *
 * Route: /
 */
import { pageBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { generateJsonLd } from '../lib/jsonLd'
import SeoHead from '../components/SeoHead'
import PageSections from '../components/PageSections'
import styles from './pages.module.css'

export default function HomePage() {
  const { data: page, loading } = useSanityDoc(pageBySlugQuery, { slug: 'home' })
  const siteSettings = useSiteSettings()

  const seo = resolveSeo(page ?? null, siteSettings)

  if (loading) return <div className={styles.loadingPage}>Loading…</div>

  return (
    <main>
      <SeoHead seo={seo} jsonLd={generateJsonLd(null, siteSettings)} />

      {page?.sections && page.sections.length > 0 ? (
        <PageSections sections={page.sections.filter(s => s._type !== 'heroSection' && s._type !== 'hero')} />
      ) : (
        <div className={styles.detailPage}>
          <h1 className={styles.detailHeading}>Welcome to Sugartown</h1>
          <p className={styles.detailExcerpt}>
            Add homepage content in Sanity Studio to see it here.
          </p>
        </div>
      )}
    </main>
  )
}
