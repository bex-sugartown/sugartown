/**
 * ProjectDetailPage — renders a dedicated detail page for a Sanity `project` document.
 * Route: /projects/:slug
 *
 * EPIC-0145: replaces TaxonomyPlaceholderPage for /projects/:slug.
 * Shows a color-accented header, status badge, project metadata, and a unified
 * content timeline (articles + nodes + caseStudies) using ContentCard.
 */
import { useParams, Link } from 'react-router-dom'
import { projectDetailQuery } from '../lib/queries'
import { useSanityDoc } from '../lib/useSanityDoc'
import { useSiteSettings } from '../lib/SiteSettingsContext'
import SeoHead from '../components/SeoHead'
import ContentCard from '../components/ContentCard'
import TaxonomyChips from '../components/TaxonomyChips'
import NotFoundPage from './NotFoundPage'
import styles from './ProjectDetailPage.module.css'
import pageStyles from './pages.module.css'

// ─── Project status display labels ───────────────────────────────────────────
// Derived from the status options.list in
// apps/studio/schemas/documents/project.ts.
// Values: planning, active, archived
const PROJECT_STATUS_LABELS = {
  planning: 'Planning',
  active:   'Active',
  archived: 'Archived',
}

// ─── Merge and sort content timeline ─────────────────────────────────────────

function buildTimeline(articles, nodes, caseStudies) {
  const items = [
    ...(articles   ?? []),
    ...(nodes      ?? []),
    ...(caseStudies ?? []),
  ]
  // Sort by publishedAt descending; items without a date sort to the end
  items.sort((a, b) => {
    if (!a.publishedAt && !b.publishedAt) return 0
    if (!a.publishedAt) return 1
    if (!b.publishedAt) return -1
    return new Date(b.publishedAt) - new Date(a.publishedAt)
  })
  return items
}

// ─── Simple SEO builder ───────────────────────────────────────────────────────

function buildProjectSeo(project, siteSettings) {
  if (!project) return null
  const title = `${project.name}${siteSettings?.siteTitle ? ` — ${siteSettings.siteTitle}` : ''}`
  const description = project.description ?? null
  return {
    title,
    description,
    canonicalUrl: null,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'website',
      image: null,
    },
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

  const statusLabel = project.status ? (PROJECT_STATUS_LABELS[project.status] ?? project.status) : null
  const timeline    = buildTimeline(project.articles, project.nodes, project.caseStudies)
  const hasTags     = project.tags?.length > 0

  // Color accent bar — use colorHex if set and valid, otherwise fall back to CSS var.
  // colorHex is stored as #rrggbb (validated in schema). We never hardcode a fallback
  // hex here — we use the CSS variable fallback mechanism via inline style.
  const accentStyle = project.colorHex
    ? { '--project-accent': project.colorHex }
    : { '--project-accent': 'var(--st-color-brand-primary)' }

  return (
    <main className={styles.projectPage}>
      <SeoHead seo={seo} />

      <Link to="/projects" className={pageStyles.backLink}>
        ← All Projects
      </Link>

      {/* ── Color accent bar ─────────────────────────────────────────── */}
      <div className={styles.accentBar} style={accentStyle} aria-hidden="true" />

      {/* ── Project header ───────────────────────────────────────────── */}
      <header className={styles.projectHeader}>
        <div className={styles.projectHeadingRow}>
          <h1 className={styles.projectName}>{project.name}</h1>
          {statusLabel && (
            <span
              className={styles.statusBadge}
              data-status={project.status}
              aria-label={`Status: ${statusLabel}`}
            >
              {statusLabel}
            </span>
          )}
        </div>

        <dl className={styles.projectMeta}>
          {project.projectId && (
            <>
              <dt className={styles.metaLabel}>Project ID</dt>
              <dd className={styles.metaValue}>{project.projectId}</dd>
            </>
          )}
        </dl>

        {project.description && (
          <p className={styles.projectDescription}>{project.description}</p>
        )}

        {hasTags && (
          <div className={styles.projectTags}>
            <p className={styles.tagsLabel}>Tags</p>
            <TaxonomyChips tags={project.tags} size="sm" />
          </div>
        )}
      </header>

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
