/**
 * SectionShowcasePage — /platform/design-system/sections (SUG-121)
 *
 * Fetches the Sanity `page` doc with slug `ds-section-showcase` and renders
 * it via PageSections. The slug is a fixed lookup key — not the URL.
 *
 * Pattern: same as GovernancePage / DesignSystemRegistryPage.
 */
import { useSanityDoc } from '../../lib/useSanityDoc'
import { pageBySlugQuery } from '../../lib/queries'
import { useSiteSettings } from '../../lib/SiteSettingsContext'
import { resolveSeo } from '../../lib/seo'
import SeoHead from '../../components/SeoHead'
import PageSections from '../../components/PageSections'
import usePlatformHero from '../../components/PlatformLayout/PlatformHero'
import NotFoundPage from '../NotFoundPage'
import pageStyles from '../pages.module.css'

const SHOWCASE_SLUG = 'ds-section-showcase'

export default function SectionShowcasePage() {
  const { data: doc, loading, notFound } = useSanityDoc(pageBySlugQuery, { slug: SHOWCASE_SLUG })
  const siteSettings = useSiteSettings()

  usePlatformHero({
    title: doc?.title ?? 'Section Module Showcase',
    subtitle: doc?.description ?? null,
  })

  if (loading) return <div className={pageStyles.loadingPage}>Loading…</div>
  if (notFound || !doc) return <NotFoundPage />

  const seo = resolveSeo(doc, siteSettings)

  return (
    <>
      <SeoHead seo={seo} />
      {doc.sections?.length > 0 && (
        <PageSections sections={doc.sections} />
      )}
    </>
  )
}
