/**
 * CaseStudyPage — renders a single Sanity `caseStudy` document.
 * Route: /case-studies/:slug
 */
import { useParams } from 'react-router-dom'
import { caseStudyBySlugQuery } from '../lib/queries'
import { useSanityDoc, useDocHasDraft } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { getArchivePath } from '../lib/routes'
import { generateJsonLd } from '../lib/jsonLd'
import { extractLeadHero } from '../lib/heroUtils'
import { CitationNote, CitationZone, Callout } from '../design-system'
import SeoHead from '../components/SeoHead'
import MetadataCard from '../components/MetadataCard'
import ContentNav from '../components/ContentNav'
import PageSections from '../components/PageSections'
import DraftBadge from '../components/DraftBadge'
import PageSidebar, { hasSidebarContent } from '../components/PageSidebar'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

export default function CaseStudyPage() {
  const { slug } = useParams()
  const { data: caseStudy, loading, notFound } = useSanityDoc(caseStudyBySlugQuery, { slug })
  const siteSettings = useSiteSettings()
  const hasDraft = useDocHasDraft(caseStudy?._id)

  const seo = resolveSeo(caseStudy ?? null, siteSettings)

  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !caseStudy) return <NotFoundPage />

  // Extract leading hero — hero heading is the page title
  const { leadHero, restSections, heroImageUrl } = extractLeadHero(caseStudy.sections)
  const showMargin = hasSidebarContent({ ...caseStudy, sections: restSections })

  // Extract calloutSection (challenge block) — appended at end of sections[] via CMS
  const challengeSection = restSections.find(s => s._type === 'calloutSection') ?? null
  const nonCalloutSections = restSections.filter(s => s._type !== 'calloutSection')

  // Pull any statTileSections that open the body (after hero) — render full-span above sidebar
  let leadStatCount = 0
  for (const s of nonCalloutSections) {
    if (s._type === 'statTileSection') leadStatCount++
    else break
  }
  const leadStatTiles = nonCalloutSections.slice(0, leadStatCount)
  const bodySections  = nonCalloutSections.slice(leadStatCount)

  // Row 1 = MetadataCard (full-span). Each full-span block before PageSections adds a row.
  const sidebarRow = 2
    + (challengeSection || caseStudy.challengeSummary ? 1 : 0)
    + leadStatCount

  return (
    <main>
      <SeoHead seo={seo} heroImageUrl={heroImageUrl} jsonLd={generateJsonLd(caseStudy, siteSettings)} />
      {leadHero && <PageSections sections={[leadHero]} docMeta={{ date: caseStudy.publishedAt, status: caseStudy.status }} />}
      <div className={styles.detailPage} data-has-margin={showMargin || undefined} style={{ '--sidebar-row': sidebarRow }}>

        <MetadataCard
          authors={caseStudy.authors}
          contentType="Case Study"
          contentTypeHref={getArchivePath('caseStudy')}
          publishedAt={caseStudy.publishedAt}
          status={caseStudy.status}
          readingTime={caseStudy.readingTime}
          client={caseStudy.client}
          employer={caseStudy.employer}
          contractType={caseStudy.contractType}
          industry={caseStudy.industry}
          companySize={caseStudy.companySize}
          region={caseStudy.region}
          role={caseStudy.role}
          dateRange={caseStudy.dateRange}
          tools={caseStudy.tools}
          categories={caseStudy.categories}
          tags={caseStudy.tags}
          projects={caseStudy.projects}
          draftBadge={<DraftBadge docId={caseStudy._id} hasDraft={hasDraft} />}
        />

        {challengeSection ? (
          <div className={styles.challengeSummary}>
            <PageSections sections={[challengeSection]} context="detail" />
          </div>
        ) : caseStudy.challengeSummary ? (
          <div className={styles.challengeSummary}>
            <Callout title="Challenge">
              <p>{caseStudy.challengeSummary}</p>
            </Callout>
          </div>
        ) : null}

        {leadStatTiles.length > 0 && (
          <div className={styles.outcomesFullSpan}>
            <PageSections sections={leadStatTiles} context="detail" />
          </div>
        )}

        {bodySections.length > 0 && (
          <PageSections sections={bodySections} context="detail" />
        )}

        {caseStudy.citations?.length > 0 && (
          <div className={styles.detailPageFullSpan}>
            <CitationZone>
              {caseStudy.citations.map((cite, i) => (
                <CitationNote key={cite._key ?? i} index={i + 1}>
                  {cite.text}
                  {cite.url && (
                    <>
                      {' '}
                      <a href={cite.url} target="_blank" rel="noopener noreferrer">
                        {cite.label || cite.url}
                      </a>
                    </>
                  )}
                </CitationNote>
              ))}
            </CitationZone>
          </div>
        )}

        <PageSidebar
          sections={restSections}
          content={caseStudy.content}
          related={caseStudy.related}
          series={caseStudy.series}
          partNumber={caseStudy.partNumber}
          tools={caseStudy.tools}
          authors={caseStudy.authors}
          aiDisclosure={caseStudy.aiDisclosure}
        />

        <div className={styles.detailPageFullSpan}>
          <ContentNav prev={caseStudy.prev} next={caseStudy.next} docType="caseStudy" />
        </div>
      </div>
    </main>
  )
}
