/**
 * RootPage — renders a Sanity `page` document fetched by slug.
 * Route: /:slug  (root pages like /about, /contact, etc.)
 */
import { useLayoutEffect } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
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
import Form from '../components/Form'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

const contactFormFields = [
  { name: 'name',    label: 'Name',    type: 'text',     required: true,  autoComplete: 'name' },
  { name: 'email',   label: 'Email',   type: 'email',    required: true,  autoComplete: 'email',
    validate: (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Please enter a valid email address' : undefined },
  { name: 'message', label: 'Message', type: 'textarea', required: true },
]

export default function RootPage({ slugOverride, hideSidebar = false } = {}) {
  const { slug: slugParam } = useParams()
  const slug = slugOverride ?? slugParam
  const { data: page, loading, notFound } = useSanityDoc(pageBySlugQuery, { slug })
  const siteSettings = useSiteSettings()
  const hasDraft = useDocHasDraft(page?._id)

  // When inside PlatformLayout (hideSidebar=true), hoist the hero above the
  // two-column shell via the setHeroSlot context passed through <Outlet>.
  const { setHeroSlot } = useOutletContext() ?? {}

  // Detail layout — with optional page sidebar
  const { leadHero, restSections, heroImageUrl } = extractLeadHero(page?.sections)
  const showMargin = !hideSidebar && hasSidebarContent({ ...page, sections: restSections })

  useLayoutEffect(() => {
    if (!hideSidebar || !setHeroSlot) return
    setHeroSlot(leadHero ? <PageSections sections={[leadHero]} /> : null)
    return () => setHeroSlot(null)
  }, [hideSidebar, leadHero, setHeroSlot])

  const seo = resolveSeo(page ?? null, siteSettings)

  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !page) return <NotFoundPage />

  // Full-width pages (no detail layout)
  if (page.template === 'full-width') {
    return (
      <main>
        <SeoHead seo={seo} jsonLd={generateJsonLd(page, siteSettings)} />
        {page.sections?.length > 0 && <PageSections sections={page.sections} />}
        {slug === 'contact' && <Form fields={contactFormFields} action="contact" submitLabel="Send Message" />}
      </main>
    )
  }

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
      {leadHero && !hideSidebar && <PageSections sections={[leadHero]} />}
      <div className={styles.detailPage} data-has-margin={showMargin || undefined} data-no-sidebar={hideSidebar || undefined}>

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

        {!hideSidebar && (
          <PageSidebar
            sections={restSections}
            content={page.content}
            series={page.series}
            partNumber={page.partNumber}
            tools={page.tools}
            authors={page.authors}
            aiDisclosure={page.aiDisclosure}
          />
        )}

      </div>
      {slug === 'contact' && <Form fields={contactFormFields} action="contact" submitLabel="Send Message" />}
    </main>
  )
}
