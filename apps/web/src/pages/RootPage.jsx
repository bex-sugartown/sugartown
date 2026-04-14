/**
 * RootPage — renders a Sanity `page` document fetched by slug.
 * Route: /:slug  (root pages like /about, /contact, etc.)
 */
import { useParams } from 'react-router-dom'
import { pageBySlugQuery } from '../lib/queries'
import { useSanityDoc, useDocHasDraft } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { extractLeadHero } from '../lib/heroUtils'
import SeoHead from '../components/SeoHead'
import MetadataCard from '../components/MetadataCard'
import PageSections from '../components/PageSections'
import DraftBadge from '../components/DraftBadge'
import MarginColumn, { hasMarginContent } from '../components/MarginColumn'
import ContactForm from '../components/ContactForm'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

export default function RootPage() {
  const { slug } = useParams()
  const { data: page, loading, notFound } = useSanityDoc(pageBySlugQuery, { slug })
  const siteSettings = useSiteSettings()
  const hasDraft = useDocHasDraft(page?._id)

  const seo = resolveSeo(page ?? null, siteSettings)

  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !page) return <NotFoundPage />

  // Full-width pages (no detail layout)
  if (page.template === 'full-width') {
    return (
      <main>
        <SeoHead seo={seo} />
        {page.sections?.length > 0 && <PageSections sections={page.sections} />}
        {slug === 'contact' && <ContactForm />}
      </main>
    )
  }

  // Detail layout — with optional margin column
  const { leadHero, restSections, heroImageUrl } = extractLeadHero(page.sections)
  const showMargin = hasMarginContent({ ...page, sections: restSections })

  // MetadataCard only renders when there's metadata to show
  const hasMetadata = page.authors?.length > 0 || page.publishedAt || page.aiDisclosure

  return (
    <main>
      <SeoHead seo={seo} heroImageUrl={heroImageUrl} />
      {leadHero && <PageSections sections={[leadHero]} />}
      <div className={styles.detailPage} data-has-margin={showMargin || undefined}>

        {hasMetadata && (
          <MetadataCard
            authors={page.authors}
            contentType="Page"
            publishedAt={page.publishedAt}
            draftBadge={<DraftBadge docId={page._id} hasDraft={hasDraft} />}
          />
        )}

        {restSections.length > 0 && (
          <PageSections sections={restSections} context="detail" />
        )}

        <MarginColumn
          sections={restSections}
          content={page.content}
          aiDisclosure={page.aiDisclosure}
          authors={page.authors}
        />

      </div>
      {slug === 'contact' && <ContactForm />}
    </main>
  )
}
