/**
 * CaseStudyPage — renders a single Sanity `caseStudy` document.
 * Route: /case-studies/:slug
 */
import { useParams, Link } from 'react-router-dom'
import { caseStudyBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { CitationNote, CitationZone } from '../design-system'
import SeoHead from '../components/SeoHead'
import MetadataCard from '../components/MetadataCard'
import ContentNav from '../components/ContentNav'
import PageSections from '../components/PageSections'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

export default function CaseStudyPage() {
  const { slug } = useParams()
  const { data: caseStudy, loading, notFound } = useSanityDoc(caseStudyBySlugQuery, { slug })
  const siteSettings = useSiteSettings()

  const seo = resolveSeo(caseStudy ?? null, siteSettings)

  if (loading) return <div className={styles.loadingPage}>Loading…</div>
  if (notFound || !caseStudy) return <NotFoundPage />

  // Extract leading hero section so it renders flush against the header
  const sections = caseStudy.sections ?? []
  const isHero = (s) => s._type === 'heroSection' || s._type === 'hero'
  const leadHero = sections[0] && isHero(sections[0]) ? sections[0] : null
  const restSections = leadHero ? sections.slice(1) : sections

  return (
    <main>
      <SeoHead seo={seo} />
      {leadHero && <PageSections sections={[leadHero]} />}
      <div className={styles.detailPage}>
        <Link to="/case-studies" className={styles.backLink}>
          ← All Case Studies
        </Link>

        <p className={styles.detailEyebrow}>Case Study</p>
        <h1 className={styles.detailHeading}>{caseStudy.title}</h1>

        <MetadataCard
          authors={caseStudy.authors}
          contentType="Case Study"
          publishedAt={caseStudy.publishedAt}
          status={caseStudy.status}
          client={caseStudy.client}
          role={caseStudy.role}
          tools={caseStudy.tools}
          categories={caseStudy.categories}
          tags={caseStudy.tags}
          projects={caseStudy.projects}
        />

        {restSections.length > 0 && (
          <PageSections sections={restSections} context="detail" />
        )}

        {caseStudy.citations?.length > 0 && (
          <CitationZone>
            {caseStudy.citations.map((cite, i) => (
              <CitationNote
                key={cite._key ?? i}
                index={i + 1}
                text={cite.text}
                url={cite.url}
                label={cite.label}
              />
            ))}
          </CitationZone>
        )}

        <ContentNav prev={caseStudy.prev} next={caseStudy.next} docType="caseStudy" />
      </div>
    </main>
  )
}
