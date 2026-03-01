/**
 * ProjectDetailPage — renders a dedicated detail page for a Sanity `project` document.
 * Route: /projects/:slug
 *
 * EPIC-0145: replaces TaxonomyPlaceholderPage for /projects/:slug.
 * Shows a colour-accented header, description, and a MetaCard (MetadataCard)
 * with status / ID / priority / categories / tags / KPIs, then a unified
 * content timeline (articles + nodes + caseStudies) using ContentCard.
 */
import { useParams, Link } from 'react-router-dom'
import { projectDetailQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import SeoHead from '../components/SeoHead'
import ContentCard from '../components/ContentCard'
import MetadataCard from '../components/MetadataCard'
import NotFoundPage from './NotFoundPage'
import styles from './ProjectDetailPage.module.css'
import pageStyles from './pages.module.css'

// ─── Merge and sort content timeline ─────────────────────────────────────────

function buildTimeline(articles, nodes, caseStudies) {
  const items = [
    ...(articles    ?? []),
    ...(nodes       ?? []),
    ...(caseStudies ?? []),
  ]
  items.sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0
    if (!a.publishedAt) return 1
    if (!b.publishedAt) return -1
    return new Date(b.publishedAt) - new Date(a.publishedAt)
  })
  return items
}

// ─── SEO builder ─────────────────────────────────────────────────────────────

function buildProjectSeo(project, siteSettings) {
  if (!project) return null
  const siteSuffix  = siteSettings?.siteTitle ? ` — ${siteSettings.siteTitle}` : ''
  const title       = (project.seo?.metaTitle || project.name) + siteSuffix
  const description = project.seo?.metaDescription ?? project.description ?? null
  return {
    title,
    description,
    canonicalUrl: null,
    robots: { index: true, follow: true },
    openGraph: { title, description, type: 'website', image: null },
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectDetailPage() {
  const { slug } = useParams()
  const { data: project, loading, notFound } = useSanityDoc(projectDetailQuery, { slug })
  const siteSettings = useSiteSettings()

  const seo = buildProjectSeo(project ?? null, siteSettings)

  if (loading) return <div className={pageStyles.loadingPage}>Loading…</div>
  if (notFound || !project) return <NotFoundPage />

  const timeline = buildTimeline(project.articles, project.nodes, project.caseStudies)

  // --project-accent drives the accentBar colour from colorHex when set.
  const accentStyle = {
    '--project-accent': project.colorHex || 'var(--st-color-brand-primary)',
  }

  return (
    <main className={styles.projectPage}>
      <SeoHead seo={seo} />

      <Link to="/projects" className={pageStyles.backLink}>
        ← All Projects
      </Link>

      {/* ── Colour accent bar ─────────────────────────────────────────── */}
      <div className={styles.accentBar} style={accentStyle} aria-hidden="true" />

      {/* ── Project name ──────────────────────────────────────────────── */}
      <h1 className={styles.projectName}>{project.name}</h1>

      {/* ── Description — editorial copy, sits above the MetaCard ────── */}
      {project.description && (
        <p className={styles.projectDescription}>{project.description}</p>
      )}

      {/* ── MetaCard — structured metadata (status, ID, priority, taxonomy, KPIs) */}
      <MetadataCard
        projectId={project.projectId}
        status={project.status}
        priority={project.priority}
        kpis={project.kpis}
        categories={project.categories}
        tags={project.tags}
      />

      {/* ── Content timeline ─────────────────────────────────────────── */}
      {timeline.length > 0 && (
        <section className={styles.timelineSection}>
          <h2 className={styles.timelineHeading}>
            Content ({timeline.length})
          </h2>
          <ul className={styles.timelineList}>
            {timeline.map((item) => (
              <li key={item._id}>
                <ContentCard
                  item={item}
                  docType={item._type}
                  showExcerpt={false}
                  showHeroImage={false}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {timeline.length === 0 && (
        <p className={styles.timelineEmpty}>No content linked to this project yet.</p>
      )}
    </main>
  )
}
