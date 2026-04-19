/**
 * RootPage — renders a Sanity `page` document fetched by slug.
 * Route: /:slug  (root pages like /about, /contact, etc.)
 */
import { useParams } from 'react-router-dom'
import { pageBySlugQuery } from '../lib/queries'
import { useSanityDoc, useDocHasDraft } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { generateJsonLd } from '../lib/jsonLd'
import { extractLeadHero } from '../lib/heroUtils'
import SeoHead from '../components/SeoHead'
import PageSections from '../components/PageSections'
import DraftBadge from '../components/DraftBadge'
import PageSidebar, { hasSidebarContent } from '../components/PageSidebar'
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
        <SeoHead seo={seo} jsonLd={generateJsonLd(page, siteSettings)} />
        {page.sections?.length > 0 && <PageSections sections={page.sections} />}
        {slug === 'contact' && <ContactForm />}
      </main>
    )
  }

  // Detail layout — with optional page sidebar
  const { leadHero, restSections, heroImageUrl } = extractLeadHero(page.sections)
  const showMargin = hasSidebarContent({ ...page, sections: restSections })

  // Thin mono-caps eyebrow strip replaces MetadataCard on page-type docs.
  // Format: "PLATFORM · UPDATED APR 2026" (page-type slug · month year).
  const pageTypeLabel = slug ? slug.replace(/-/g, ' ').toUpperCase() : null
  const updatedLabel = page.publishedAt
    ? new Date(page.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
    : null
  const hasEyebrow = pageTypeLabel || updatedLabel || hasDraft

  return (
    <main>
      <SeoHead seo={seo} heroImageUrl={heroImageUrl} jsonLd={generateJsonLd(page, siteSettings)} />
      {leadHero && <PageSections sections={[leadHero]} />}
      <div className={styles.detailPage} data-has-margin={showMargin || undefined}>

        {hasEyebrow && (
          <div className={styles.pageEyebrow}>
            <span className={styles.pageEyebrowText}>
              {pageTypeLabel}
              {pageTypeLabel && updatedLabel && <span aria-hidden> · </span>}
              {updatedLabel && <>UPDATED {updatedLabel}</>}
            </span>
            <DraftBadge docId={page._id} hasDraft={hasDraft} />
          </div>
        )}

        {restSections.length > 0 && (
          <PageSections sections={restSections} context="detail" />
        )}

        <PageSidebar
          sections={restSections}
          content={page.content}
          tools={page.tools}
          authors={page.authors}
          aiDisclosure={page.aiDisclosure}
        />

      </div>
      {slug === 'contact' && <ContactForm />}
    </main>
  )
}
