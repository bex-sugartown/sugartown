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
import { CitationNote, CitationZone, SectionLabel } from '../design-system'
import SeoHead from '../components/SeoHead'
import MetadataCard from '../components/MetadataCard'
import ContentNav from '../components/ContentNav'
import PageSections from '../components/PageSections'
import DraftBadge from '../components/DraftBadge'
import PageSidebar, { hasSidebarContent } from '../components/PageSidebar'
import StatTile from '../design-system/components/stat-tile/StatTile'
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

  // Row 1 = MetadataCard (full-span). Each full-span block before PageSections adds a row.
  const sidebarRow = 2
    + (caseStudy.challengeSummary ? 1 : 0)
    + (caseStudy.outcomes?.length > 0 ? 1 : 0)

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

        {caseStudy.challengeSummary && (
          <div className={styles.challengeSummary}>
            <p className={styles.challengeSummaryLabel}>Challenge</p>
            <p className={styles.challengeSummaryText}>{caseStudy.challengeSummary}</p>
          </div>
        )}

        {caseStudy.outcomes?.length > 0 && (
          <div className={styles.outcomeStrip}>
            <SectionLabel>Outcomes</SectionLabel>
            <div className={styles.outcomeGrid}>
              {caseStudy.outcomes.map((outcome, i) => (
                <StatTile
                  key={outcome._key ?? i}
                  label={outcome.metric}
                  value={outcome.valueAfter}
                  sub={outcome.valueBefore || undefined}
                  chip={outcome.evidenceType || undefined}
                />
              ))}
            </div>
          </div>
        )}

        {restSections.length > 0 && (
          <PageSections sections={restSections} context="detail" />
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
