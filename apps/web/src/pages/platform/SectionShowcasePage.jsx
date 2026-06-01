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
import { CitationNote, CitationZone } from '../../design-system'
import NotFoundPage from '../NotFoundPage'
import pageStyles from '../pages.module.css'

const SHOWCASE_SLUG = 'ds-section-showcase'

export default function SectionShowcasePage() {
  const { data: doc, loading, notFound } = useSanityDoc(pageBySlugQuery, { slug: SHOWCASE_SLUG })
  const siteSettings = useSiteSettings()

  // Extract heroSection settings to drive the platform hero slot.
  // heroSection is filtered out of rendered content to avoid a duplicate header.
  const heroSection = doc?.sections?.find(s => s._type === 'heroSection' || s._type === 'hero')
  const contentSections = doc?.sections?.filter(s => s._type !== 'heroSection' && s._type !== 'hero') ?? []

  usePlatformHero({
    title: heroSection?.heading ?? doc?.title ?? 'Section Module Showcase',
    subtitle: heroSection?.subheading ?? doc?.description ?? null,
  })

  if (loading) return <div className={pageStyles.loadingPage}>Loading…</div>
  if (notFound || !doc) return <NotFoundPage />

  const seo = resolveSeo(doc, siteSettings)

  return (
    <>
      <SeoHead seo={seo} />
      {contentSections.length > 0 && (
        <PageSections sections={contentSections} context="detail" />
      )}
      {doc.citations?.length > 0 && (
        <CitationZone>
          {doc.citations.map((cite, i) => (
            <CitationNote key={cite._key ?? i} index={i + 1}>
              {cite.text}
              {cite.url && (
                <> <a href={cite.url} target="_blank" rel="noopener noreferrer">{cite.label || cite.url}</a></>
              )}
            </CitationNote>
          ))}
        </CitationZone>
      )}
    </>
  )
}
