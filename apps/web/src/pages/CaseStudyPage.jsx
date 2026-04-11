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
import { extractLeadHero } from '../lib/heroUtils'
import { CitationNote, CitationZone } from '../design-system'
import SeoHead from '../components/SeoHead'
import MetadataCard from '../components/MetadataCard'
import ContentNav from '../components/ContentNav'
import PageSections from '../components/PageSections'
import DraftBadge from '../components/DraftBadge'
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

  return (
    <main>
      <SeoHead seo={seo} heroImageUrl={heroImageUrl} />
      {leadHero && <PageSections sections={[leadHero]} docMeta={{ date: caseStudy.publishedAt, status: caseStudy.status }} />}
      <div className={styles.detailPage}>

        <MetadataCard
          authors={caseStudy.authors}
          contentType="Case Study"
          contentTypeHref={getArchivePath('caseStudy')}
          publishedAt={caseStudy.publishedAt}
          status={caseStudy.status}
          client={caseStudy.client}
          role={caseStudy.role}
          tools={caseStudy.tools}
          categories={caseStudy.categories}
          tags={caseStudy.tags}
          projects={caseStudy.projects}
          draftBadge={<DraftBadge docId={caseStudy._id} hasDraft={hasDraft} />}
        />

        {restSections.length > 0 && (
          <PageSections sections={restSections} context="detail" />
        )}

        {caseStudy.citations?.length > 0 && (
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
        )}

        <ContentNav prev={caseStudy.prev} next={caseStudy.next} docType="caseStudy" />
      </div>
    </main>
  )
}
