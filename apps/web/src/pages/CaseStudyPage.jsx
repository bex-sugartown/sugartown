/**
 * CaseStudyPage — renders a single Sanity `caseStudy` document.
 * Route: /case-studies/:slug
 */
import { useParams, Link } from 'react-router-dom'
import { caseStudyBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { getAuthorByline } from '../lib/person'
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

  return (
    <main className={styles.detailPage}>
      <SeoHead seo={seo} />
      <Link to="/case-studies" className={styles.backLink}>
        ← All Case Studies
      </Link>

      <p className={styles.detailEyebrow}>Case Study</p>
      <h1 className={styles.detailHeading}>{caseStudy.title}</h1>

      {getAuthorByline(caseStudy.authors) && (
        <div className={styles.detailMeta}>
          <span>By {getAuthorByline(caseStudy.authors)}</span>
        </div>
      )}

      <MetadataCard
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

      {caseStudy.sections?.length > 0 && (
        <PageSections sections={caseStudy.sections} />
      )}

      <ContentNav prev={caseStudy.prev} next={caseStudy.next} docType="caseStudy" />
    </main>
  )
}
