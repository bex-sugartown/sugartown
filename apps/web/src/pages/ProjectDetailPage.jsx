/**
 * ProjectDetailPage — renders a dedicated detail page for a Sanity `project` document.
 * Route: /projects/:slug
 *
 * EPIC-0145: replaces TaxonomyPlaceholderPage for /projects/:slug.
 * Shows a colour-accented header, a metacard with status / ID / description /
 * categories / tags / priority / KPIs, then a unified content timeline
 * (articles + nodes + caseStudies) using ContentCard.
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

// ─── Display maps ─────────────────────────────────────────────────────────────

const PROJECT_STATUS_LABELS = {
  planning: 'Planning',
  active:   'Active',
  archived: 'Archived',
}

const PRIORITY_LABELS = {
  1: '🔴 Critical',
  2: '🟠 High',
  3: '🟡 Medium',
  4: '🟢 Low',
  5: '⚪ Backlog',
}

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
  const siteSuffix = siteSettings?.siteTitle ? ` — ${siteSettings.siteTitle}` : ''
  const title       = (project.seo?.metaTitle || project.name) + siteSuffix
  const description = project.seo?.metaDescription ?? project.description ?? null
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

  const statusLabel   = project.status   ? (PROJECT_STATUS_LABELS[project.status]   ?? project.status)   : null
  const priorityLabel = project.priority ? (PRIORITY_LABELS[project.priority]        ?? String(project.priority)) : null
  const timeline      = buildTimeline(project.articles, project.nodes, project.caseStudies)
  const hasCategories = project.categories?.length > 0
  const hasTags       = project.tags?.length > 0
  const hasKpis       = project.kpis?.length > 0
  const hasChips      = hasCategories || hasTags

  // --project-accent drives both the accentBar and the metacard border.
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

      {/* ── Metacard ──────────────────────────────────────────────────── */}
      <div className={styles.metacard} style={accentStyle}>

        {/* Status */}
        {statusLabel && (
          <div className={styles.metacardRow}>
            <span className={styles.metaKey}>Status</span>
            <span
              className={styles.statusBadge}
              data-status={project.status}
              aria-label={`Status: ${statusLabel}`}
            >
              {statusLabel}
            </span>
          </div>
        )}

        {/* Project ID */}
        {project.projectId && (
          <div className={styles.metacardRow}>
            <span className={styles.metaKey}>Project ID</span>
            <span className={styles.metaVal}>{project.projectId}</span>
          </div>
        )}

        {/* Description */}
        {project.description && (
          <p className={styles.projectDescription}>{project.description}</p>
        )}

        {/* Categories + Tags */}
        {hasChips && (
          <div className={styles.metacardChips}>
            <TaxonomyChips
              categories={project.categories}
              tags={project.tags}
              size="sm"
            />
          </div>
        )}

        {/* Priority */}
        {priorityLabel && (
          <div className={styles.metacardRow}>
            <span className={styles.metaKey}>Priority</span>
            <span className={styles.metaVal} data-priority={project.priority}>
              {priorityLabel}
            </span>
          </div>
        )}

        {/* KPIs */}
        {hasKpis && (
          <div className={styles.metacardKpis}>
            <span className={styles.metaKey}>KPIs</span>
            <ul className={styles.kpiList}>
              {project.kpis.map((kpi, i) => (
                <li key={i} className={styles.kpiItem}>
                  <span className={styles.kpiMetric}>{kpi.metric}</span>
                  <span className={styles.kpiProgress}>
                    <span className={styles.kpiCurrent}>{kpi.current || '—'}</span>
                    {kpi.target && (
                      <span className={styles.kpiTarget}> / {kpi.target}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

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
