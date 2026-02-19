/**
 * CaseStudyPage — renders a single Sanity `caseStudy` document.
 * Route: /case-studies/:slug
 */
import { useParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { caseStudyBySlugQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import { resolveSeo } from '../lib/seo'
import { getAuthorByline } from '../lib/person'
import SeoHead from '../components/SeoHead'
import NotFoundPage from './NotFoundPage'
import styles from './pages.module.css'

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function CaseStudyPage() {
  const { slug } = useParams()
  const { data: caseStudy, loading, notFound } = useSanityDoc(caseStudyBySlugQuery, { slug })
  const siteSettings = useSiteSettings()

  const seo = resolveSeo({
    docSeo: caseStudy?.seo ?? null,
    docTitle: caseStudy?.title ?? null,
    docType: 'caseStudy',
    docSlug: slug,
    siteDefaults: siteSettings,
  })

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

      {caseStudy.excerpt && <p className={styles.detailExcerpt}>{caseStudy.excerpt}</p>}

      <div className={styles.detailMeta}>
        {caseStudy.client && <span>Client: {caseStudy.client}</span>}
        {caseStudy.role && <span>Role: {caseStudy.role}</span>}
        {caseStudy.publishedAt && <span>{formatDate(caseStudy.publishedAt)}</span>}
        {getAuthorByline(caseStudy.authors) && (
          <span>By {getAuthorByline(caseStudy.authors)}</span>
        )}
      </div>

      {caseStudy.categories?.length > 0 && (
        <ul className={styles.tagList}>
          {caseStudy.categories.map((cat) => (
            <li key={cat.slug || cat.name} className={styles.tag}>
              {cat.name}
            </li>
          ))}
        </ul>
      )}

      {caseStudy.content && (
        <div className={styles.detailContent}>
          <PortableText value={caseStudy.content} />
        </div>
      )}
    </main>
  )
}
